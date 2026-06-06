import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      customer,
      items,
      preferredDate,
      preferredTime,
      notes,
    } = body as {
      customer: {
        email: string;
        firstName: string;
        lastName: string;
        phone?: string;
        addressLine1?: string;
        addressLine2?: string;
        city?: string;
        postcode?: string;
      };
      items: {
        productId: string;
        calculatedPrice: number;
        wasteCost: number;
        quantity: number;
        itemLabel?: string;
        configs: { fieldKey: string; fieldValue: string }[];
      }[];
      preferredDate?: string;
      preferredTime?: string;
      notes?: string;
    };

    // Validate required fields
    if (!customer?.email || !customer?.firstName || !customer?.lastName) {
      return NextResponse.json(
        { error: "Customer name and email are required" },
        { status: 400 }
      );
    }

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "At least one item is required" },
        { status: 400 }
      );
    }

    // Find or create customer
    let dbCustomer = await prisma.customer.findUnique({
      where: { email: customer.email },
    });

    if (dbCustomer) {
      // Update existing customer info
      dbCustomer = await prisma.customer.update({
        where: { email: customer.email },
        data: {
          firstName: customer.firstName,
          lastName: customer.lastName,
          phone: customer.phone || dbCustomer.phone,
          addressLine1: customer.addressLine1 || dbCustomer.addressLine1,
          addressLine2: customer.addressLine2 || dbCustomer.addressLine2,
          city: customer.city || dbCustomer.city,
          postcode: customer.postcode || dbCustomer.postcode,
        },
      });
    } else {
      dbCustomer = await prisma.customer.create({
        data: {
          email: customer.email,
          firstName: customer.firstName,
          lastName: customer.lastName,
          phone: customer.phone,
          addressLine1: customer.addressLine1,
          addressLine2: customer.addressLine2,
          city: customer.city,
          postcode: customer.postcode,
        },
      });
    }

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + item.calculatedPrice * item.quantity, 0);
    const wasteCost = items.reduce((sum, item) => sum + item.wasteCost, 0);
    const total = subtotal + wasteCost;

    // Fetch deposit percentage
    const depositVar = await prisma.pricingVariable.findUnique({
      where: { key: "deposit_percentage" },
    });
    const depositPct = (depositVar?.value ?? 50) / 100;
    const depositAmount = Math.ceil(total * depositPct * 100) / 100;
    const remainingAmount = Math.round((total - depositAmount) * 100) / 100;

    // Create booking with items
    const booking = await prisma.booking.create({
      data: {
        customerId: dbCustomer.id,
        status: "pending",
        preferredDate: preferredDate ? new Date(preferredDate) : null,
        preferredTime: preferredTime || null,
        subtotal,
        wasteCost,
        total,
        depositAmount,
        remainingAmount,
        paymentStatus: "unpaid",
        customerNotes: notes || null,
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            calculatedPrice: item.calculatedPrice,
            wasteCost: item.wasteCost,
            quantity: item.quantity,
            itemLabel: item.itemLabel || null,
            configs: {
              create: item.configs.map((c) => ({
                fieldKey: c.fieldKey,
                fieldValue: c.fieldValue,
              })),
            },
          })),
        },
      },
      include: {
        items: {
          include: {
            product: { select: { name: true } },
            configs: true,
          },
        },
        customer: true,
      },
    });

    return NextResponse.json({
      success: true,
      bookingId: booking.id,
      booking: {
        id: booking.id,
        status: booking.status,
        total: booking.total,
        depositAmount: booking.depositAmount,
        remainingAmount: booking.remainingAmount,
        preferredDate: booking.preferredDate,
        preferredTime: booking.preferredTime,
        customer: {
          name: `${booking.customer.firstName} ${booking.customer.lastName}`,
          email: booking.customer.email,
        },
        items: booking.items.map((item) => ({
          name: item.product.name,
          price: item.calculatedPrice,
          quantity: item.quantity,
        })),
      },
    });
  } catch (error) {
    console.error("Booking creation failed:", error);
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }
}
