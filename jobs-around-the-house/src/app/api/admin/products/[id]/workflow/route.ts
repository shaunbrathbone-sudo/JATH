import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import prisma from "@/lib/prisma";

// GET product workflow steps and options
export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const { id } = await params;
        const parsedProductId = parseInt(id) || 0;

        const steps = await prisma.workflowStep.findMany({
            where: { parentProductId: parsedProductId },
            orderBy: { sortOrder: "asc" },
            include: {
                options: {
                    orderBy: { sortOrder: "asc" },
                },
            },
        });

        return NextResponse.json({ success: true, steps });
    } catch (error) {
        console.error("Failed to fetch product workflow:", error);
        return NextResponse.json(
            { error: "Failed to fetch workflow steps" },
            { status: 500 },
        );
    }
}

interface OptionInput {
    id?: string;
    productId?: number | null;
    priceModifier: number;
    optionValueFlag: string;
    label: string;
    value: string;
    description?: string | null;
    sortOrder?: number;
}

interface StepInput {
    id?: string;
    stepName: string;
    sortOrder: number;
    isMandatory: boolean;
    fieldType: string;
    fieldKey: string;
    helpText?: string | null;
    unit?: string | null;
    validationRules?: string | null;
    conditionalTriggerValue?: string | null;
    options?: OptionInput[];
}

// PUT replace workflow steps and options nested inside a transaction
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const { id } = await params;
        const parsedProductId = parseInt(id) || 0;
        const body = await request.json();
        const { steps } = body as { steps: StepInput[] };

        if (!Array.isArray(steps)) {
            return NextResponse.json(
                { error: "Payload must contain a steps array" },
                { status: 400 },
            );
        }

        // Execute in transaction
        await prisma.$transaction(async (tx) => {
            // 1. Delete existing steps (will cascade delete options)
            await tx.workflowStep.deleteMany({
                where: { parentProductId: parsedProductId },
            });

            // 2. Re-create steps and their options
            for (const step of steps) {
                const createdStep = await tx.workflowStep.create({
                    data: {
                        parentProductId: parsedProductId,
                        stepName: step.stepName,
                        sortOrder: Number(step.sortOrder) || 0,
                        isMandatory: Boolean(step.isMandatory),
                        fieldType: step.fieldType,
                        fieldKey: step.fieldKey,
                        helpText: step.helpText || null,
                        unit: step.unit || null,
                        validationRules: step.validationRules || null,
                        conditionalTriggerValue: step.conditionalTriggerValue || null,
                    },
                });

                if (Array.isArray(step.options) && step.options.length > 0) {
                    await tx.stepOption.createMany({
                        data: step.options.map((opt, optIdx) => ({
                            stepId: createdStep.id,
                            productId: opt.productId ? Number(opt.productId) : null,
                            priceModifier: Number(opt.priceModifier) || 0,
                            optionValueFlag: opt.optionValueFlag || "",
                            label: opt.label,
                            value: opt.value,
                            description: opt.description || null,
                            sortOrder: Number(opt.sortOrder) || optIdx,
                        })),
                    });
                }
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to save product workflow:", error);
        return NextResponse.json(
            { error: "Failed to save workflow configurations" },
            { status: 500 },
        );
    }
}
