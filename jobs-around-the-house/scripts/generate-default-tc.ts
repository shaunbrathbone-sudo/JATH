import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

function main() {
    const publicDir = path.join(process.cwd(), "public");
    if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
    }

    const doc = new PDFDocument();
    const destPath = path.join(publicDir, "Terms_and_Conditions.pdf");
    const stream = fs.createWriteStream(destPath);
    
    doc.pipe(stream);
    
    doc.fontSize(24).fillColor("#1e3a8a").font("Helvetica-Bold").text("Terms & Conditions", 50, 50);
    doc.moveDown();
    
    doc.fontSize(12).fillColor("#111827").font("Helvetica-Bold").text("1. Services and Scope of Work");
    doc.font("Helvetica").fontSize(10).text("Jobs Around The House Ltd provides professional handyman and installation services. The specific scope of work is defined in the customer booking selection.", { align: "justify" });
    doc.moveDown();
    
    doc.fontSize(12).font("Helvetica-Bold").text("2. Structural Base Requirements");
    doc.font("Helvetica").fontSize(10).text("A solid, level base is required for all shed and garden building construction. If the customer elects to supply their own base, they are fully responsible for its structural integrity. The vendor accepts zero structural liability for construction failures stemming from base variations.", { align: "justify" });
    doc.moveDown();
    
    doc.fontSize(12).font("Helvetica-Bold").text("3. Payment and Deposits");
    doc.font("Helvetica").fontSize(10).text("A deposit of 50% is required to secure all bookings. The remaining 50% is payable upon completion of the service. All pricing presented includes VAT standard.", { align: "justify" });
    doc.moveDown();
    
    doc.fontSize(12).font("Helvetica-Bold").text("4. Loyalty Points Program");
    doc.font("Helvetica").fontSize(10).text("Loyalty points accrue based on the gross total spend of completed bookings. Points may be redeemed at checkout for discounts on future bookings. Points have no cash value and cannot be transferred.", { align: "justify" });
    doc.moveDown();
    
    doc.fontSize(8).fillColor("#94a3b8").text("Jobs Around The House Ltd • bookings@jobsaroundthehouse.co.uk • Last Updated: June 2026", 50, 700, { align: "center" });
    
    doc.end();
    
    stream.on("finish", () => {
        console.log("Successfully generated default Terms_and_Conditions.pdf!");
    });
}

main();
