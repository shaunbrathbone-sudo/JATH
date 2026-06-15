import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import prisma from "@/lib/prisma";

// PATCH update category
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const {
            name,
            description,
            groupId,
            sortOrder,
            isActive,
            imageUrl,
        } = body;

        const data: Record<string, unknown> = {};
        if (name !== undefined) {
            data.name = name.trim();
            data.slug = name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)/g, "");
        }
        if (description !== undefined)
            data.description = description?.trim() || null;
        if (groupId !== undefined) {
            data.parentId = groupId ? parseInt(groupId) : null;
        }
        if (sortOrder !== undefined) {
            data.sortOrder = Number(sortOrder) || 0;
        }
        if (isActive !== undefined) data.isActive = Boolean(isActive);
        if (imageUrl !== undefined) data.imageUrl = imageUrl;

        const category = await prisma.category.update({
            where: { id: parseInt(id) || 0 },
            data,
        });

        return NextResponse.json(category);
    } catch (error) {
        console.error("Failed to update category:", error);
        return NextResponse.json(
            { error: "Failed to update" },
            { status: 500 },
        );
    }
}

// DELETE category (only if no products/bookings)
export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const { id } = await params;
        const parsedId = parseInt(id) || 0;

        const productCount = await prisma.product.count({
            where: { categoryId: parsedId },
        });
        if (productCount > 0) {
            return NextResponse.json(
                {
                    error: `Cannot delete: ${productCount} products still assigned. Remove them first.`,
                },
                { status: 400 },
            );
        }

        // Delete hero images first (cascade)
        await prisma.heroImage.deleteMany({ where: { categoryId: parsedId } });
        await prisma.category.delete({ where: { id: parsedId } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to delete category:", error);
        return NextResponse.json(
            { error: "Failed to delete" },
            { status: 500 },
        );
    }
}
