import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const GET = async (request: Request) => {
    try {
        const { searchParams } = new URL(request.url);
        const email = searchParams.get("email");

        if (!email) {
            return NextResponse.json({ points: 0 });
        }

        const customer = await prisma.customer.findUnique({
            where: { email: email.trim().toLowerCase() },
            select: { loyaltyPoints: true },
        });

        const redemptionVar = await prisma.pricingVariable.findUnique({
            where: { key: "loyalty_redemption_rate" },
        });
        const redemptionRate = redemptionVar?.value ?? 0.01;

        return NextResponse.json({
            points: customer?.loyaltyPoints ?? 0,
            redemptionRate,
        });
    } catch (error) {
        console.error("Failed to fetch loyalty points:", error);
        return NextResponse.json({ points: 0, redemptionRate: 0.01 });
    }
};
