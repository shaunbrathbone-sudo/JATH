import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import prisma from "@/lib/prisma";

// PATCH update service group
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { name, description, icon, sortOrder, isActive } = body;

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
        if (icon !== undefined) data.icon = icon?.trim() || null;
        if (sortOrder !== undefined) data.sortOrder = sortOrder;
        if (isActive !== undefined) data.isActive = Boolean(isActive);

        const group = await prisma.serviceGroup.update({
            where: { id },
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

// DELETE service group (only if no categories assigned)
export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const { id } = await params;

        const count = await prisma.category.count({ where: { groupId: id } });
        if (count > 0) {
            return NextResponse.json(
                {
                    error: `Cannot delete: ${count} categories still assigned. Move them first.`,
                },
                { status: 400 },
            );
        }

        await prisma.serviceGroup.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to delete service group:", error);
        return NextResponse.json(
            { error: "Failed to delete" },
            { status: 500 },
        );
    }
}
