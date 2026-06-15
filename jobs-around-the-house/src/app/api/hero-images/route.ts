import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    const categories = await prisma.category.findMany({
        where: { isActive: true, heroImages: { some: { isActive: true } } },
        orderBy: { sortOrder: "asc" },
        include: {
            heroImages: {
                where: { isActive: true },
                take: 1,
            },
        },
    });

    const formatted = categories.map((c) => ({
        id: String(c.id),
        name: c.name,
        slug: c.slug,
        imageUrl: c.heroImages[0]?.imageUrl || null,
    }));

    return NextResponse.json(formatted);
}
