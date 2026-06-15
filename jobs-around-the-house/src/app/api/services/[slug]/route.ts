import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ slug: string }> },
) {
    try {
        const { slug } = await params;

        const product = await prisma.product.findUnique({
            where: { slug, isActive: true },
            include: {
                category: { select: { name: true, slug: true } },
                workflowSteps: {
                    orderBy: { sortOrder: "asc" },
                    include: {
                        options: { orderBy: { sortOrder: "asc" } },
                    },
                },
            },
        });

        if (!product) {
            return NextResponse.json(
                { error: "Service not found" },
                { status: 404 },
            );
        }

        return NextResponse.json(product);
    } catch (error) {
        console.error("Failed to fetch service:", error);
        return NextResponse.json(
            { error: "Failed to fetch service" },
            { status: 500 },
        );
    }
}
