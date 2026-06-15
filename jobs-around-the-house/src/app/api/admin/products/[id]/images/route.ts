import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

// Upload a new hero image for a product (service)
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const { id: productId } = await params;
        const parsedProductId = parseInt(productId) || 0;
        const formData = await request.formData();
        const file = formData.get("image") as File | null;

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

        const product = await prisma.product.findUnique({
            where: { id: parsedProductId },
            select: { slug: true },
        });

        if (!product) {
            return NextResponse.json(
                { error: "Product not found" },
                { status: 404 },
            );
        }

        // Check if product already has 6 hero images
        const imageCount = await prisma.heroImage.count({
            where: { productId: parsedProductId },
        });

        if (imageCount >= 6) {
            return NextResponse.json(
                {
                    error: "Maximum of 6 hero images allowed per service. Delete some first.",
                },
                { status: 400 },
            );
        }

        // Ensure hero directory exists
        const heroDir = path.join(process.cwd(), "public", "hero");
        await mkdir(heroDir, { recursive: true });

        // Save file with unique name
        const ext = file.name.split(".").pop() || "png";
        const timestamp = Date.now();
        const filename = `product-${product.slug}-${timestamp}.${ext}`;
        const filepath = path.join(heroDir, filename);
        const bytes = await file.arrayBuffer();
        await writeFile(filepath, Buffer.from(bytes));

        const imageUrl = `/hero/${filename}`;

        // Create new image and set as active
        const heroImage = await prisma.heroImage.create({
            data: {
                productId: parsedProductId,
                imageUrl,
                filename: file.name,
                isActive: true,
            },
        });

        return NextResponse.json({ success: true, heroImage });
    } catch (error) {
        console.error("Failed to upload product hero image:", error);
        return NextResponse.json(
            { error: "Failed to upload image" },
            { status: 500 },
        );
    }
}
