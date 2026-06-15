import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import prisma from "@/lib/prisma";

// GET all service groups (Category where parentId: null)
export async function GET() {
    try {
        const groups = await prisma.category.findMany({
            where: { parentId: null },
            orderBy: { sortOrder: "asc" },
            include: {
                children: {
                    orderBy: { sortOrder: "asc" },
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        isActive: true,
                    },
                },
            },
        });

        // Format return to match expected schema structure for ServiceGroup
        const formatted = groups.map((g) => ({
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
                isActive: c.isActive,
            })),
            _count: {
                categories: g.children.length,
            },
        }));

        return NextResponse.json(formatted);
    } catch (error) {
        console.error("Failed to fetch service groups:", error);
        return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
    }
}

// POST create new service group (Category with parentId: null)
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, description, sortOrder } = body;

        if (!name?.trim()) {
            return NextResponse.json(
                { error: "Name is required" },
                { status: 400 },
            );
        }

        const slug = name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");

        const existing = await prisma.category.findUnique({
            where: { slug },
        });
        if (existing) {
            return NextResponse.json(
                { error: "A group with this name already exists" },
                { status: 409 },
            );
        }

        const group = await prisma.category.create({
            data: {
                name: name.trim(),
                slug,
                description: description?.trim() || null,
                parentId: null,
                sortOrder: sortOrder ?? 0,
            },
        });

        const formatted = {
            ...group,
            id: String(group.id),
        };

        return NextResponse.json(formatted, { status: 201 });
    } catch (error) {
        console.error("Failed to create service group:", error);
        return NextResponse.json(
            { error: "Failed to create" },
            { status: 500 },
        );
    }
}
