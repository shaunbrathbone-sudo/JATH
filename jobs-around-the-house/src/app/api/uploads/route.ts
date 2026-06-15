import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json(
                { error: "No file uploaded" },
                { status: 400 },
            );
        }

        if (!file.type.startsWith("image/")) {
            return NextResponse.json(
                { error: "File must be an image" },
                { status: 400 },
            );
        }

        // Ensure target directory exists
        const uploadDir = path.join(process.cwd(), "public", "uploads", "site-photos");
        await mkdir(uploadDir, { recursive: true });

        // Save file with unique name
        const ext = file.name.split(".").pop() || "png";
        const filename = `photo-${Date.now()}-${Math.floor(Math.random() * 1000)}.${ext}`;
        const filepath = path.join(uploadDir, filename);
        const bytes = await file.arrayBuffer();
        await writeFile(filepath, Buffer.from(bytes));

        const fileUrl = `/uploads/site-photos/${filename}`;

        return NextResponse.json({ success: true, url: fileUrl });
    } catch (error) {
        console.error("Failed to upload file:", error);
        return NextResponse.json(
            { error: "Failed to upload file" },
            { status: 500 },
        );
    }
}
