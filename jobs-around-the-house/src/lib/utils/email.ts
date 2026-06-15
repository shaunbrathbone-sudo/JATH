import fs from "fs";
import path from "path";
import nodemailer from "nodemailer";

interface SendBookingEmailOptions {
    customerEmail: string;
    customerName: string;
    bookingId: number;
    total: number;
    depositAmount: number;
    pdfBuffer: Buffer;
    pdfFilename: string;
}

export async function sendBookingConfirmationEmail(options: SendBookingEmailOptions) {
    const {
        customerEmail,
        customerName,
        bookingId,
        total,
        depositAmount,
        pdfBuffer,
        pdfFilename,
    } = options;

    const subject = `Booking Confirmation - INV-${bookingId.toString().padStart(6, "0")}`;
    
    // Construct HTML Email Body
    const htmlContent = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
            <div style="background-color: #1e3a8a; color: white; padding: 20px; text-align: center;">
                <h1 style="margin: 0; font-size: 24px;">Booking Confirmed!</h1>
                <p style="margin: 5px 0 0; font-size: 14px;">Invoice ID: INV-${bookingId.toString().padStart(6, "0")}</p>
            </div>
            <div style="padding: 20px;">
                <p>Dear <strong>${customerName}</strong>,</p>
                <p>Thank you for booking with <strong>Jobs Around The House</strong>. We are pleased to confirm that your booking has been received and is currently being processed.</p>
                
                <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0; border: 1px solid #e2e8f0;">
                    <h3 style="margin-top: 0; color: #1e3a8a;">Order Summary</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 5px 0; color: #64748b;">Grand Total (Gross):</td>
                            <td style="padding: 5px 0; text-align: right; font-weight: bold;">£${total.toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td style="padding: 5px 0; color: #64748b;">Paid Deposit (50%):</td>
                            <td style="padding: 5px 0; text-align: right; font-weight: bold; color: #16a34a;">£${depositAmount.toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td style="padding: 5px 0; color: #64748b;">Remaining Balance:</td>
                            <td style="padding: 5px 0; text-align: right; font-weight: bold;">£${(total - depositAmount).toFixed(2)}</td>
                        </tr>
                    </table>
                </div>

                <p>We have attached your official <strong>VAT Tax Invoice</strong> and our latest **Terms & Conditions** for your reference.</p>
                
                <p>If you selected a custom building size, please note that our engineering team will review your photos and issue a finalized quote post-checkout.</p>
                
                <p>If you have any questions or need to make adjustments to your booking, please reply to this email or contact us at <a href="mailto:bookings@jobsaroundthehouse.co.uk" style="color: #1e3a8a;">bookings@jobsaroundthehouse.co.uk</a>.</p>
                
                <br>
                <p style="margin-bottom: 0;">Best regards,</p>
                <p style="margin-top: 5px; font-weight: bold; color: #1e3a8a;">The Jobs Around The House Team</p>
            </div>
            <div style="background-color: #f1f5f9; padding: 15px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;">
                Jobs Around The House Ltd • bookings@jobsaroundthehouse.co.uk
            </div>
        </div>
    `;

    // Path to Terms & Conditions
    const tcPath = path.join(process.cwd(), "public", "Terms_and_Conditions.pdf");
    const hasTC = fs.existsSync(tcPath);

    // Check if we are in mock mode (no real credentials)
    const isMock = !process.env.SMTP_HOST || process.env.SMTP_HOST === "smtp_placeholder";
    
    // In local development, ALWAYS write to the scratch folder so the developer can inspect it
    const scratchDir = "C:\\Users\\shaun\\.gemini\\antigravity-ide\\brain\\5c0ab4d4-d38e-4a02-92f0-c5e544c48e06\\scratch";
    if (fs.existsSync(scratchDir)) {
        const filePrefix = `booking-${bookingId}`;
        const pdfDest = path.join(scratchDir, `${filePrefix}-invoice.pdf`);
        fs.writeFileSync(pdfDest, pdfBuffer);
        
        const htmlDest = path.join(scratchDir, `${filePrefix}-email.html`);
        fs.writeFileSync(htmlDest, htmlContent, "utf8");
        
        console.log(`[Email Mock] Saved mock outputs to scratch: \n  - PDF: ${pdfDest} \n  - HTML Email: ${htmlDest}`);
    }

    if (isMock) {
        console.log(`[Email Mock] Mock confirmation email to ${customerEmail} sent successfully.`);
        return { success: true, mode: "mock" };
    }

    // Real send via nodemailer SMTP
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_SECURE === "true",
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        const attachments = [
            {
                filename: pdfFilename,
                content: pdfBuffer,
            },
        ];

        if (hasTC) {
            attachments.push({
                filename: "Terms_and_Conditions.pdf",
                path: tcPath,
            } as any);
        }

        await transporter.sendMail({
            from: process.env.SMTP_FROM || `"Jobs Around The House" <bookings@jobsaroundthehouse.co.uk>`,
            to: customerEmail,
            subject,
            html: htmlContent,
            attachments,
        });

        console.log(`[SMTP] Confirmed booking email sent to ${customerEmail} successfully.`);
        return { success: true, mode: "smtp" };
    } catch (error) {
        console.error("[SMTP] Failed to send email via SMTP:", error);
        // Do not crash checkout if email fails, log the error and proceed
        return { success: false, error };
    }
}
