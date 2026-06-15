import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
    calculatePrice,
    type WorkflowAnswer,
    type PricingVariableData,
} from "@/lib/utils/pricing";

export const POST = async (request: Request) => {
    try {
        const body = await request.json();
        const { productSlug, answers, quantity } = body as {
            productSlug: string;
            answers: WorkflowAnswer[];
            quantity?: number;
        };

        if (!productSlug || !answers) {
            return NextResponse.json(
                { error: "Missing productSlug or answers" },
                { status: 400 },
            );
        }

        // Fetch the product with its workflow steps and options
        const product = await prisma.product.findUnique({
            where: { slug: productSlug },
            include: {
                workflowSteps: {
                    include: {
                        options: true,
                    },
                },
            },
        });

        if (!product || product.workflowSteps.length === 0) {
            return NextResponse.json(
                { error: "Service not found or has no active workflow steps" },
                { status: 404 },
            );
        }

        // Fetch prices of any linked upsell products
        const upsellProductIds = product.workflowSteps
            .flatMap((s) => s.options.map((o) => o.productId))
            .filter((id): id is number => id !== null);

        const upsellProductPrices: Record<number, number> = {};
        if (upsellProductIds.length > 0) {
            const upsellProducts = await prisma.product.findMany({
                where: { id: { in: upsellProductIds } },
                select: { id: true, basePrice: true },
            });
            for (const up of upsellProducts) {
                upsellProductPrices[up.id] = up.basePrice;
            }
        }

        // Fetch global pricing variables
        const globalVars = await prisma.pricingVariable.findMany();
        const variables: PricingVariableData[] = globalVars.map((v) => ({
            key: v.key,
            value: v.value,
        }));

        const breakdown = calculatePrice(
            answers,
            {
                basePrice: product.basePrice,
                vatRate: product.vatRate,
                workflowSteps: product.workflowSteps.map((s) => ({
                    fieldKey: s.fieldKey,
                    options: s.options.map((o) => ({
                        id: String(o.id),
                        stepId: String(o.stepId),
                        productId: o.productId,
                        priceModifier: o.priceModifier,
                        optionValueFlag: o.optionValueFlag,
                        label: o.label,
                        value: o.value,
                        description: o.description,
                    })),
                })),
            },
            variables,
            upsellProductPrices,
            quantity || 1,
        );

        return NextResponse.json(breakdown);
    } catch (error) {
        console.error("Pricing calculation failed:", error);
        return NextResponse.json(
            { error: "Pricing calculation failed" },
            { status: 500 },
        );
    }
};
