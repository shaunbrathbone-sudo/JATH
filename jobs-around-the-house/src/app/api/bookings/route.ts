import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { bookingSchema } from "@/lib/schemas/booking.schema";
import { generateInvoicePdf } from "@/lib/utils/pdf-invoice";
import { sendBookingConfirmationEmail } from "@/lib/utils/email";

export const POST = async (request: Request) => {
    try {
        const body = await request.json();
        const parsed = bookingSchema.safeParse(body);
        if (!parsed.success) {
            console.error("Zod Validation Fail in /api/bookings:", JSON.stringify(parsed.error.format(), null, 2));
            return NextResponse.json(
                {
                    error:
                        parsed.error.issues[0]?.message ||
                        "Invalid booking data",
                },
                { status: 400 },
            );
        }

        const { customer, items, preferredDate, preferredTime, notes, redeemPoints } =
            parsed.data;

        // Perform transaction
        const result = await prisma.$transaction(async (tx) => {
            // 1. Customer mapping (find or create)
            let dbCustomer = await tx.customer.findUnique({
                where: { email: customer.email },
            });

            const currentPoints = dbCustomer?.loyaltyPoints ?? 0;
            const pointsToRedeem = redeemPoints || 0;

            if (pointsToRedeem > currentPoints) {
                throw new Error("Insufficient loyalty points balance");
            }

            // Fetch loyalty configuration variables dynamically
            const accrualVar = await tx.pricingVariable.findUnique({
                where: { key: "loyalty_accrual_rate" },
            });
            const redemptionVar = await tx.pricingVariable.findUnique({
                where: { key: "loyalty_redemption_rate" },
            });

            const accrualRate = accrualVar?.value ?? 1;
            const redemptionRate = redemptionVar?.value ?? 0.01;

            // Calculate loyalty discount based on database config
            const loyaltyDiscount = pointsToRedeem * redemptionRate;

            const orderItemsToCreate: {
                sku: string;
                quantity: number;
                grossUnitPrice: number;
                vatRateApplied: number;
                vatAmountTotal: number;
                legalWaiverInjected: string | null;
                productTitle: string;
            }[] = [];
            const workflowResponsesToCreate: {
                stepId: number;
                customerTextResponse: string | null;
                uploadedPhotoUrl: string | null;
            }[] = [];
            let itemsSubtotal = 0;
            let itemsWasteCost = 0;

            // 2. Validate products, stock quantities, and map items
            for (const item of items) {
                const product = await tx.product.findUnique({
                    where: { id: item.productId },
                    include: {
                        bundleComponents: {
                            include: {
                                component: true,
                            },
                        },
                    },
                });

                if (!product || !product.isActive) {
                    throw new Error(`Product not found or inactive: ${item.productId}`);
                }

                // Verify and decrement stock atomically
                if (product.productType === "virtual_bundle") {
                    for (const comp of product.bundleComponents) {
                        const requiredQty = comp.quantity * item.quantity;
                        if (comp.component.stockQuantity < requiredQty) {
                            throw new Error(
                                `Insufficient stock for component SKU ${comp.component.sku} (${comp.component.title}) required for bundle ${product.title}`
                            );
                        }
                        // Decrement stock quantity
                        await tx.product.update({
                            where: { id: comp.componentProductId },
                            data: {
                                stockQuantity: {
                                    decrement: requiredQty,
                                },
                            },
                        });
                    }
                } else {
                    if (product.stockQuantity < item.quantity) {
                        throw new Error(`Insufficient stock for product: ${product.title}`);
                    }
                    // Decrement stock quantity
                    await tx.product.update({
                        where: { id: product.id },
                        data: {
                            stockQuantity: {
                                decrement: item.quantity,
                            },
                        },
                    });
                }

                // Extract VAT rate and compute total VAT
                const itemTotalGross = item.calculatedPrice;
                const grossUnitPrice = itemTotalGross / item.quantity;
                const vatRateApplied = product.vatRate;
                const vatAmountTotal = itemTotalGross - itemTotalGross / (1 + vatRateApplied / 100);

                // Legal Waiver check (check if existing_base choice is 'no')
                const hasNoBase = item.configs.some(
                    (c) => c.fieldKey === "existing_base" && c.fieldValue === "no"
                );
                const legalWaiverText =
                    hasNoBase ?
                        "Legal Notice: Structural foundation provided entirely by the consumer. The vendor accepts zero structural liability for construction failures stemming from base variations."
                    :   null;

                orderItemsToCreate.push({
                    sku: product.sku,
                    quantity: item.quantity,
                    grossUnitPrice: Math.round(grossUnitPrice * 100) / 100,
                    vatRateApplied,
                    vatAmountTotal: Math.round(vatAmountTotal * 100) / 100,
                    legalWaiverInjected: legalWaiverText,
                    // Temporary fields for PDF compiler mapping
                    productTitle: product.title,
                });

                // Fetch workflow steps to get correct step IDs for answers mapping
                const steps = await tx.workflowStep.findMany({
                    where: { parentProductId: product.id },
                });

                for (const c of item.configs) {
                    const matchedStep = steps.find((s) => s.fieldKey === c.fieldKey);
                    if (matchedStep) {
                        workflowResponsesToCreate.push({
                            stepId: matchedStep.id,
                            customerTextResponse:
                                matchedStep.fieldType !== "photo_upload" ? c.fieldValue : null,
                            uploadedPhotoUrl:
                                matchedStep.fieldType === "photo_upload" ? c.fieldValue : null,
                        });
                    }
                }

                itemsSubtotal += itemTotalGross;
                itemsWasteCost += item.wasteCost;
            }

            // Adjust totals by loyalty discount
            const postDiscountSubtotal = Math.max(0, itemsSubtotal - loyaltyDiscount);
            const total = postDiscountSubtotal + itemsWasteCost;

            // Accrue loyalty points dynamically based on database config
            const loyaltyAccrued = Math.floor(total * accrualRate);

            // Compute new loyalty balance
            const newLoyaltyBalance = currentPoints - pointsToRedeem + loyaltyAccrued;

            // Update or create Customer details
            if (dbCustomer) {
                dbCustomer = await tx.customer.update({
                    where: { email: customer.email },
                    data: {
                        firstName: customer.firstName,
                        lastName: customer.lastName,
                        phone: customer.phone || dbCustomer.phone,
                        addressLine1: customer.addressLine1 || dbCustomer.addressLine1,
                        addressLine2: customer.addressLine2 || dbCustomer.addressLine2,
                        city: customer.city || dbCustomer.city,
                        postcode: customer.postcode || dbCustomer.postcode,
                        loyaltyPoints: newLoyaltyBalance,
                    },
                });
            } else {
                dbCustomer = await tx.customer.create({
                    data: {
                        email: customer.email,
                        firstName: customer.firstName,
                        lastName: customer.lastName,
                        phone: customer.phone,
                        addressLine1: customer.addressLine1,
                        addressLine2: customer.addressLine2,
                        city: customer.city,
                        postcode: customer.postcode,
                        loyaltyPoints: newLoyaltyBalance,
                    },
                });
            }

            // Fetch deposit percentage
            const depositVar = await tx.pricingVariable.findUnique({
                where: { key: "deposit_percentage" },
            });
            const depositPct = (depositVar?.value ?? 50) / 100;
            const depositAmount = Math.ceil(total * depositPct * 100) / 100;
            const remainingAmount = Math.round((total - depositAmount) * 100) / 100;

            // Create Booking
            const booking = await tx.booking.create({
                data: {
                    customerId: dbCustomer.id,
                    status: "pending",
                    preferredDate: preferredDate ? new Date(preferredDate) : null,
                    preferredTime: preferredTime || null,
                    subtotal: itemsSubtotal,
                    wasteCost: itemsWasteCost,
                    total,
                    depositAmount,
                    remainingAmount,
                    paymentStatus: "unpaid",
                    customerNotes: notes || null,
                    items: {
                        create: orderItemsToCreate.map(({ productTitle, ...rest }) => rest),
                    },
                    workflowResponses: {
                        create: workflowResponsesToCreate,
                    },
                },
                include: {
                    items: true,
                    customer: true,
                },
            });

            // Map product titles back to booking items for the PDF invoice compiler
            const bookingItemsWithTitles = booking.items.map((dbItem) => {
                const matchedTempItem = orderItemsToCreate.find((o) => o.sku === dbItem.sku);
                return {
                    ...dbItem,
                    product: {
                        title: matchedTempItem?.productTitle || "Home Service",
                    },
                };
            });

            return {
                booking: {
                    ...booking,
                    items: bookingItemsWithTitles,
                },
                loyaltyAccrued,
                loyaltyDiscount,
                newLoyaltyBalance,
            };
        });

        // 3. Compile PDF invoice and dispatch confirmation email (run post-commit)
        try {
            const pdfBuffer = await generateInvoicePdf(result.booking);
            const pdfFilename = `Invoice_INV_${result.booking.id.toString().padStart(6, "0")}.pdf`;

            await sendBookingConfirmationEmail({
                customerEmail: result.booking.customer.email,
                customerName: `${result.booking.customer.firstName} ${result.booking.customer.lastName}`,
                bookingId: result.booking.id,
                total: result.booking.total,
                depositAmount: result.booking.depositAmount,
                pdfBuffer,
                pdfFilename,
            });
        } catch (emailErr) {
            // Logging email failures but not failing request since order is saved successfully
            console.error("Booking confirmation email delivery failed:", emailErr);
        }

        return NextResponse.json({
            success: true,
            bookingId: result.booking.id,
            booking: {
                id: result.booking.id,
                status: result.booking.status,
                total: result.booking.total,
                depositAmount: result.booking.depositAmount,
                remainingAmount: result.booking.remainingAmount,
                preferredDate: result.booking.preferredDate,
                preferredTime: result.booking.preferredTime,
                customer: {
                    name: `${result.booking.customer.firstName} ${result.booking.customer.lastName}`,
                    email: result.booking.customer.email,
                    loyaltyPoints: result.newLoyaltyBalance,
                },
                items: result.booking.items.map((item) => ({
                    name: item.product?.title || "Service Item",
                    price: item.grossUnitPrice * item.quantity,
                    quantity: item.quantity,
                })),
                loyaltyAccrued: result.loyaltyAccrued,
                loyaltyDiscount: result.loyaltyDiscount,
            },
        });
    } catch (error: any) {
        console.error("Booking creation failed:", error);
        return NextResponse.json(
            { error: error?.message || "Failed to create booking" },
            { status: 500 },
        );
    }
};
