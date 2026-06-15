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
        const { status, paymentStatus } = body;

        const updateData: Record<string, string> = {};
        if (status) updateData.status = status;
        if (paymentStatus) updateData.paymentStatus = paymentStatus;

        const booking = await prisma.booking.update({
            where: { id: parseInt(id) || 0 },
            data: updateData,
        });

        return NextResponse.json(booking);
    } catch (error) {
        console.error("Failed to update booking:", error);
        return NextResponse.json(
            { error: "Failed to update booking" },
            { status: 500 },
        );
    }
}
