import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { calculatePrice, type WorkflowAnswer, type PricingRuleData, type PricingVariableData } from "@/lib/utils/pricing";

export const POST = async (request: Request) => {
  try {
    const body = await request.json();
    const { productSlug, answers } = body as {
      productSlug: string;
      answers: WorkflowAnswer[];
    };

    if (!productSlug || !answers) {
      return NextResponse.json(
        { error: "Missing productSlug or answers" },
        { status: 400 }
      );
    }

    // Fetch the product's pricing rules
    const product = await prisma.product.findUnique({
      where: { slug: productSlug },
      include: {
        workflows: {
          where: { isActive: true },
          include: { pricingRules: true },
        },
      },
    });

    if (!product || product.workflows.length === 0) {
      return NextResponse.json(
        { error: "Service not found or has no active workflow" },
        { status: 404 }
      );
    }

    const rules: PricingRuleData[] = product.workflows[0].pricingRules;

    // Fetch global pricing variables
    const globalVars = await prisma.pricingVariable.findMany();
    const variables: PricingVariableData[] = globalVars.map((v) => ({
      key: v.key,
      value: v.value,
    }));

    const breakdown = calculatePrice(answers, rules, variables);

    return NextResponse.json(breakdown);
  } catch (error) {
    console.error("Pricing calculation failed:", error);
    return NextResponse.json(
      { error: "Pricing calculation failed" },
      { status: 500 }
    );
  }
};
