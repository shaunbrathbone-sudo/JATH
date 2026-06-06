import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import prisma from "@/lib/prisma";

// GET all service groups
export async function GET() {
  try {
    const groups = await prisma.serviceGroup.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        _count: { select: { categories: true } },
        categories: {
          orderBy: { sortOrder: "asc" },
          select: { id: true, name: true, slug: true, isActive: true },
        },
      },
    });
    return NextResponse.json(groups);
  } catch (error) {
    console.error("Failed to fetch service groups:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

// POST create new service group
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, icon, sortOrder } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const existing = await prisma.serviceGroup.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: "A group with this name already exists" }, { status: 409 });
    }

    const group = await prisma.serviceGroup.create({
      data: {
        name: name.trim(),
        slug,
        description: description?.trim() || null,
        icon: icon?.trim() || null,
        sortOrder: sortOrder ?? 0,
      },
    });

    return NextResponse.json(group, { status: 201 });
  } catch (error) {
    console.error("Failed to create service group:", error);
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}
