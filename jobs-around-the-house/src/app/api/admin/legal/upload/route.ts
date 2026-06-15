import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json(
                { error: "No file uploaded in the request form data." },
                { status: 400 }
            );
        }

        // Validate that the file is a PDF
        if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
            return NextResponse.json(
                { error: "Only PDF documents are allowed." },
                { status: 400 }
            );
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Save target: public/Terms_and_Conditions.pdf
        const filepath = path.join(process.cwd(), "public", "Terms_and_Conditions.pdf");
        await writeFile(filepath, buffer);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Legal document upload error:", error);
        return NextResponse.json(
            { error: "An error occurred while uploading the legal terms PDF document." },
            { status: 500 }
        );
    }
}
