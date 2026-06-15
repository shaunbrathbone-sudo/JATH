import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const parsedId = parseInt(id) || 0;

        const data: Record<string, unknown> = {};
        if (body.title !== undefined) {
            data.title = body.title.trim();
            // Automatically update slug if title is modified
            data.slug = body.title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)/g, "");
        }
        if (body.sku !== undefined) data.sku = body.sku.trim();
        if (body.description !== undefined) data.description = body.description;
        if (body.basePrice !== undefined) data.basePrice = Number(body.basePrice) || 0;
        if (body.vatRate !== undefined) data.vatRate = Number(body.vatRate) || 0;
        if (body.stockQuantity !== undefined) data.stockQuantity = parseInt(body.stockQuantity) || 0;
        if (body.productType !== undefined) data.productType = body.productType;
        if (body.isActive !== undefined) data.isActive = Boolean(body.isActive);
        if (body.sortOrder !== undefined) data.sortOrder = parseInt(body.sortOrder) || 0;
        if (body.imageUrl !== undefined) data.imageUrl = body.imageUrl || null;
        if (body.categoryId !== undefined) data.categoryId = parseInt(body.categoryId) || 0;

        const product = await prisma.product.update({
            where: { id: parsedId },
            data,
        });

        return NextResponse.json({ success: true, product });
    } catch (error) {
        console.error("Failed to update product:", error);
        return NextResponse.json(
            { error: "Failed to update product" },
            { status: 500 },
        );
    }
}
