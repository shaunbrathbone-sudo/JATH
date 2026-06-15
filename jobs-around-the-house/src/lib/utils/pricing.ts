/**
 * Upgraded Pricing Engine for Jobs Around The House
 *
 * Calculates job costs from workflow answers, product parameters, and option price modifiers.
 * All displays are in gross prices, with Net and VAT components extracted at checkout.
 */

type WorkflowAnswer = {
    fieldKey: string;
    value: string | number;
};

type StepOptionData = {
    id: string;
    stepId: string;
    productId: number | null;
    priceModifier: number;
    optionValueFlag: string;
    label: string;
    value: string;
    description: string | null;
};

type ProductPricingData = {
    basePrice: number;
    vatRate: number;
    workflowSteps: {
        fieldKey: string;
        options: StepOptionData[];
    }[];
};

type PricingVariableData = {
    key: string;
    value: number;
};

type PriceModifier = {
    label: string;
    amount: number;
    type: "add" | "multiply";
};

type PriceBreakdown = {
    basePrice: number;
    modifiers: PriceModifier[];
    wasteCost: number;
    subtotal: number;
    depositAmount: number;
    total: number;
    netSubtotal: number;
    totalVatCharged: number;
};

const getAnswerValue = (
    answers: WorkflowAnswer[],
    fieldKey: string,
): string | number | undefined => {
    const answer = answers.find((a) => a.fieldKey === fieldKey);
    return answer?.value;
};

const parseNumeric = (val: string | number | undefined): number => {
    if (val === undefined || val === "") return 0;
    const n = typeof val === "number" ? val : parseFloat(val);
    return isNaN(n) ? 0 : n;
};

const getGlobalVar = (
    variables: PricingVariableData[],
    key: string,
    fallback: number = 0,
): number => {
    const v = variables.find((v) => v.key === key);
    return v?.value ?? fallback;
};

const calculatePrice = (
    answers: WorkflowAnswer[],
    product: ProductPricingData,
    globalVariables: PricingVariableData[],
    upsellProductPrices: Record<number, number> = {}, // Maps productId to basePrice
    quantity: number = 1,
): PriceBreakdown => {
    let currentPrice = product.basePrice;
    const modifiers: PriceModifier[] = [];

    // Loop through workflow steps and apply option modifiers
    for (const step of product.workflowSteps) {
        const answerVal = getAnswerValue(answers, step.fieldKey);
        if (answerVal === undefined || answerVal === "") continue;

        // Find the matching option
        let matchedOption = step.options.find((opt) => String(opt.value) === String(answerVal));
        let isPerUnit = false;
        let numericValue = 1;

        if (!matchedOption) {
            // Check if there is a wildcard/default option for numeric multiplication
            const wildcardOption = step.options.find((opt) => opt.value === "*");
            if (wildcardOption) {
                matchedOption = wildcardOption;
                isPerUnit = true;
                numericValue = parseNumeric(answerVal);
            }
        }

        if (matchedOption) {
            let modifierAmount = matchedOption.priceModifier;
            
            // If the option is linked to an upsell product, fetch its catalog price
            if (matchedOption.productId && upsellProductPrices[matchedOption.productId] !== undefined) {
                modifierAmount += upsellProductPrices[matchedOption.productId];
            }

            if (isPerUnit) {
                modifierAmount *= numericValue;
            }

            if (modifierAmount !== 0) {
                currentPrice += modifierAmount;
                modifiers.push({
                    label: isPerUnit ? `${matchedOption.label} (×${numericValue})` : matchedOption.label,
                    amount: modifierAmount,
                    type: "add",
                });
            }
        }
    }

    // Multiply unit price by quantity
    let basePriceTotal = currentPrice * quantity;
    if (quantity > 1) {
        modifiers.push({
            label: `Quantity multiplier (×${quantity})`,
            amount: basePriceTotal - currentPrice,
            type: "add",
        });
    }

    // Difficult access surcharge calculation
    let totalMultiplier = 1.0;
    const accessVal = getAnswerValue(answers, "access");
    if (String(accessVal).toLowerCase() === "difficult") {
        const difficultAccessMultiplier = getGlobalVar(globalVariables, "difficult_access_multiplier", 1.15);
        totalMultiplier *= difficultAccessMultiplier;
        modifiers.push({
            label: "Difficult Access Surcharge",
            amount: difficultAccessMultiplier,
            type: "multiply",
        });
    }

    let subtotal = basePriceTotal * totalMultiplier;

    // Apply Tiered Volume Discounts (e.g., Buy 3+ save 5%, Buy 5+ save 10%)
    if (quantity >= 5) {
        const discountAmount = subtotal * 0.10;
        subtotal -= discountAmount;
        modifiers.push({
            label: "Volume Discount (5+ items: 10% off)",
            amount: -discountAmount,
            type: "add",
        });
    } else if (quantity >= 3) {
        const discountAmount = subtotal * 0.05;
        subtotal -= discountAmount;
        modifiers.push({
            label: "Volume Discount (3+ items: 5% off)",
            amount: -discountAmount,
            type: "add",
        });
    }

    // Enforce minimum charge
    const minCharge = getGlobalVar(globalVariables, "minimum_charge", 35);
    if (subtotal > 0 && subtotal < minCharge) {
        subtotal = minCharge;
    }

    // Calculate waste disposal cost
    const wasteRate = getGlobalVar(globalVariables, "waste_disposal_rate", 0);
    const wasteVolume = parseNumeric(getAnswerValue(answers, "waste_volume"));
    const wasteCost = wasteVolume > 0 ? wasteVolume * wasteRate : 0;

    const total = subtotal + wasteCost;

    // Calculate deposit amount (rounded up to nearest penny)
    const depositPct = getGlobalVar(globalVariables, "deposit_percentage", 50) / 100;
    const depositAmount = Math.ceil(total * depositPct * 100) / 100;

    // Dynamic VAT Calculations (Section 5 mathematical tax formulations)
    const vatRate = product.vatRate;
    const totalVatCharged = total - (total / (1 + (vatRate / 100)));
    const netSubtotal = total / (1 + (vatRate / 100));

    return {
        basePrice: Math.round(product.basePrice * 100) / 100,
        modifiers,
        wasteCost: Math.round(wasteCost * 100) / 100,
        subtotal: Math.round(subtotal * 100) / 100,
        depositAmount: Math.round(depositAmount * 100) / 100,
        total: Math.round(total * 100) / 100,
        netSubtotal: Math.round(netSubtotal * 100) / 100,
        totalVatCharged: Math.round(totalVatCharged * 100) / 100,
    };
};

export { calculatePrice };
export type {
    WorkflowAnswer,
    StepOptionData,
    ProductPricingData,
    PricingVariableData,
    PriceModifier,
    PriceBreakdown,
};
