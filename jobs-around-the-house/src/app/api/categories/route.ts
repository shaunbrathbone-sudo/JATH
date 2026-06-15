import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const rootCategories = await prisma.category.findMany({
            where: { parentId: null, isActive: true },
            orderBy: { sortOrder: "asc" },
            include: {
                children: {
                    where: { isActive: true },
                    orderBy: { sortOrder: "asc" },
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                    },
                },
            },
        });

        // Format return to match expected schema structure with service groups & subcategories
        const formatted = rootCategories.map((g) => ({
            id: String(g.id),
            name: g.name,
            slug: g.slug,
            description: g.description,
            icon: g.slug === "garden-buildings" ? "tree" : "home",
            isActive: g.isActive,
            sortOrder: g.sortOrder,
            categories: g.children.map((c) => ({
                id: String(c.id),
                name: c.name,
                slug: c.slug,
            })),
        }));

        return NextResponse.json(formatted);
    } catch (error) {
        console.error("Failed to fetch categories:", error);
        return NextResponse.json(
            { error: "Failed to fetch categories" },
            { status: 500 },
        );
    }
}
