import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import prisma from "@/lib/prisma";

// PATCH update service group (Category where parentId: null)
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { name, description, sortOrder, isActive } = body;

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
        if (sortOrder !== undefined) data.sortOrder = Number(sortOrder) || 0;
        if (isActive !== undefined) data.isActive = Boolean(isActive);

        const group = await prisma.category.update({
            where: { id: parseInt(id) || 0 },
            data,
        });

        return NextResponse.json(group);
    } catch (error) {
        console.error("Failed to update service group:", error);
        return NextResponse.json(
            { error: "Failed to update" },
            { status: 500 },
        );
    }
}

// DELETE service group (Category with parentId: null)
export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const { id } = await params;
        const parsedId = parseInt(id) || 0;

        const count = await prisma.category.count({ where: { parentId: parsedId } });
        if (count > 0) {
            return NextResponse.json(
                {
                    error: `Cannot delete: ${count} categories still assigned. Move them first.`,
                },
                { status: 400 },
            );
        }

        await prisma.category.delete({ where: { id: parsedId } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to delete service group:", error);
        return NextResponse.json(
            { error: "Failed to delete" },
            { status: 500 },
        );
    }
}
