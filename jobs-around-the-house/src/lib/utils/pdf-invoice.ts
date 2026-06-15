import PDFDocument from "pdfkit";

interface BookingItemInput {
    sku: string;
    quantity: number;
    grossUnitPrice: number;
    vatRateApplied: number;
    vatAmountTotal: number;
    legalWaiverInjected: string | null;
    product?: {
        title: string;
    };
    itemLabel?: string;
}

interface CustomerInput {
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    addressLine1: string | null;
    addressLine2: string | null;
    city: string | null;
    postcode: string | null;
}

interface BookingInput {
    id: number;
    createdAt: Date;
    customer: CustomerInput;
    items: BookingItemInput[];
    subtotal: number;
    wasteCost: number;
    total: number;
    depositAmount: number;
    remainingAmount: number;
}

export function generateInvoicePdf(booking: BookingInput): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50, size: "A4" });
            const buffers: Buffer[] = [];

            doc.on("data", (chunk) => buffers.push(chunk));
            doc.on("end", () => resolve(Buffer.concat(buffers)));
            doc.on("error", (err) => reject(err));

            // --- Header Banner ---
            doc.fillColor("#1e3a8a")
                .rect(0, 0, 595.28, 120)
                .fill();

            doc.fillColor("#ffffff")
                .fontSize(22)
                .font("Helvetica-Bold")
                .text("JOBS AROUND THE HOUSE", 50, 40)
                .fontSize(10)
                .font("Helvetica")
                .text("Professional Home Installations & Services", 50, 70);

            doc.fillColor("#ffffff")
                .fontSize(14)
                .font("Helvetica-Bold")
                .text("TAX INVOICE", 400, 40, { align: "right", width: 145 })
                .fontSize(9)
                .font("Helvetica")
                .text(`Invoice ID: INV-${booking.id.toString().padStart(6, "0")}`, 400, 65, { align: "right", width: 145 })
                .text(`Date: ${new Date(booking.createdAt).toLocaleDateString("en-GB")}`, 400, 80, { align: "right", width: 145 });

            // --- Addresses Section ---
            const startY = 140;
            doc.fillColor("#111827");

            // Seller Address (Left)
            doc.fontSize(10)
                .font("Helvetica-Bold")
                .text("Seller Details:", 50, startY)
                .font("Helvetica")
                .fontSize(9)
                .text("Jobs Around The House Ltd", 50, startY + 20)
                .text("128 High Street", 50, startY + 35)
                .text("London, EC1A 1AA", 50, startY + 50)
                .text("VAT Reg No: GB 384 9283 11", 50, startY + 65);

            // Buyer Address (Right)
            const buyerAddress = [
                booking.customer.addressLine1,
                booking.customer.addressLine2,
                booking.customer.city,
                booking.customer.postcode
            ].filter(Boolean).join(", ") || "No address supplied";

            doc.fontSize(10)
                .font("Helvetica-Bold")
                .text("Bill To:", 350, startY)
                .font("Helvetica")
                .fontSize(9)
                .text(`${booking.customer.firstName} ${booking.customer.lastName}`, 350, startY + 20)
                .text(booking.customer.email, 350, startY + 35)
                .text(booking.customer.phone || "No phone number", 350, startY + 50)
                .text(buyerAddress, 350, startY + 65, { width: 195 });

            // Horizontal Divider Line
            doc.strokeColor("#e5e7eb")
                .lineWidth(1)
                .moveTo(50, startY + 110)
                .lineTo(545, startY + 110)
                .stroke();

            // --- Items Table ---
            const tableY = startY + 130;
            
            // Header Row
            doc.fillColor("#475569")
                .fontSize(9)
                .font("Helvetica-Bold");

            doc.text("SKU / Service Description", 50, tableY, { width: 200 })
                .text("Qty", 260, tableY, { width: 40, align: "center" })
                .text("Net Unit", 310, tableY, { width: 60, align: "right" })
                .text("VAT %", 380, tableY, { width: 40, align: "right" })
                .text("VAT Total", 430, tableY, { width: 55, align: "right" })
                .text("Gross Total", 495, tableY, { width: 50, align: "right" });

            // Header line
            doc.strokeColor("#94a3b8")
                .lineWidth(1)
                .moveTo(50, tableY + 15)
                .lineTo(545, tableY + 15)
                .stroke();

            let currentY = tableY + 25;
            doc.font("Helvetica").fillColor("#1e293b");

            // Row rendering
            booking.items.forEach((item) => {
                const label = item.product?.title || item.itemLabel || "Home Service";
                const netUnit = item.grossUnitPrice / (1 + (item.vatRateApplied / 100));
                const grossTotal = item.grossUnitPrice * item.quantity;

                // Wrap text for SKU / description to avoid overflow
                doc.text(`${item.sku}\n${label}`, 50, currentY, { width: 200 })
                    .text(item.quantity.toString(), 260, currentY, { width: 40, align: "center" })
                    .text(`£${netUnit.toFixed(2)}`, 310, currentY, { width: 60, align: "right" })
                    .text(`${item.vatRateApplied.toFixed(1)}%`, 380, currentY, { width: 40, align: "right" })
                    .text(`£${item.vatAmountTotal.toFixed(2)}`, 430, currentY, { width: 55, align: "right" })
                    .text(`£${grossTotal.toFixed(2)}`, 495, currentY, { width: 50, align: "right" });

                // Increment Y by height of row
                const textHeight = doc.heightOfString(`${item.sku}\n${label}`, { width: 200 });
                currentY += Math.max(textHeight + 10, 30);

                // Small row border
                doc.strokeColor("#f1f5f9")
                    .lineWidth(0.5)
                    .moveTo(50, currentY - 5)
                    .lineTo(545, currentY - 5)
                    .stroke();
            });

            // Waste Cost row if applicable
            if (booking.wasteCost > 0) {
                // Waste has 20% VAT standard
                const wasteVatRate = 20.00;
                const wasteNet = booking.wasteCost / (1 + (wasteVatRate / 100));
                const wasteVat = booking.wasteCost - wasteNet;

                doc.text("WASTE-DISP\nWaste Disposal Surcharge", 50, currentY, { width: 200 })
                    .text("1", 260, currentY, { width: 40, align: "center" })
                    .text(`£${wasteNet.toFixed(2)}`, 310, currentY, { width: 60, align: "right" })
                    .text(`${wasteVatRate.toFixed(1)}%`, 380, currentY, { width: 40, align: "right" })
                    .text(`£${wasteVat.toFixed(2)}`, 430, currentY, { width: 55, align: "right" })
                    .text(`£${booking.wasteCost.toFixed(2)}`, 495, currentY, { width: 50, align: "right" });

                currentY += 35;
                
                doc.strokeColor("#f1f5f9")
                    .lineWidth(0.5)
                    .moveTo(50, currentY - 5)
                    .lineTo(545, currentY - 5)
                    .stroke();
            }

            // --- Totals Summary block ---
            const totalNet = booking.items.reduce((sum, item) => sum + (item.grossUnitPrice * item.quantity) / (1 + (item.vatRateApplied / 100)), 0) + 
                             (booking.wasteCost > 0 ? booking.wasteCost / 1.20 : 0);
            
            const totalVat = booking.items.reduce((sum, item) => sum + item.vatAmountTotal, 0) +
                             (booking.wasteCost > 0 ? booking.wasteCost - (booking.wasteCost / 1.20) : 0);

            const summaryX = 350;
            doc.font("Helvetica").fontSize(9).fillColor("#475569");
            
            doc.text("Net Subtotal:", summaryX, currentY, { width: 110, align: "right" })
                .font("Helvetica-Bold")
                .text(`£${totalNet.toFixed(2)}`, 470, currentY, { width: 75, align: "right" });

            currentY += 15;
            doc.font("Helvetica")
                .text("Total VAT Charged:", summaryX, currentY, { width: 110, align: "right" })
                .font("Helvetica-Bold")
                .text(`£${totalVat.toFixed(2)}`, 470, currentY, { width: 75, align: "right" });

            currentY += 15;
            doc.font("Helvetica-Bold")
                .fillColor("#1e3a8a")
                .fontSize(11)
                .text("Grand Gross Total:", summaryX, currentY, { width: 110, align: "right" })
                .text(`£${booking.total.toFixed(2)}`, 470, currentY, { width: 75, align: "right" });

            currentY += 20;
            doc.font("Helvetica")
                .fontSize(9)
                .fillColor("#475569")
                .text("Paid Deposit (50%):", summaryX, currentY, { width: 110, align: "right" })
                .text(`£${booking.depositAmount.toFixed(2)}`, 470, currentY, { width: 75, align: "right" });

            currentY += 15;
            doc.text("Remaining Balance:", summaryX, currentY, { width: 110, align: "right" })
                .text(`£${booking.remainingAmount.toFixed(2)}`, 470, currentY, { width: 75, align: "right" });

            // --- Legal Waiver Callout ---
            // Check if any item had a legal waiver snapshotted
            const waiverItem = booking.items.find((item) => item.legalWaiverInjected !== null);
            if (waiverItem && waiverItem.legalWaiverInjected) {
                currentY += 35;
                const waiverText = waiverItem.legalWaiverInjected;
                
                // Outer Box
                doc.fillColor("#fef2f2")
                    .rect(50, currentY, 495, 50)
                    .fill();
                
                // Left Border
                doc.fillColor("#ef4444")
                    .rect(50, currentY, 4, 50)
                    .fill();

                doc.fillColor("#991b1b")
                    .font("Helvetica-Bold")
                    .fontSize(8.5)
                    .text("LEGAL NOTICE & LIABILITY WAIVER snapshot", 60, currentY + 8)
                    .font("Helvetica")
                    .fontSize(8)
                    .fillColor("#7f1d1d")
                    .text(waiverText, 60, currentY + 22, { width: 475 });
            }

            // --- Footer ---
            doc.fillColor("#94a3b8")
                .fontSize(8)
                .text("Jobs Around The House Ltd • bookings@jobsaroundthehouse.co.uk • Registered in England & Wales", 50, 770, { align: "center", width: 495 });

            doc.end();
        } catch (err) {
            reject(err);
        }
    });
}
