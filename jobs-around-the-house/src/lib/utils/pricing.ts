/**
 * Pricing Engine for Jobs Around The House
 *
 * Calculates job costs from workflow answers, pricing rules, and global variables.
 * All monetary values are in GBP (£).
 */

type WorkflowAnswer = {
  fieldKey: string;
  value: string | number;
};

type PricingRuleData = {
  id: string;
  ruleType: string; // per_unit | tiered | flat | multiplier | conditional
  fieldKey: string;
  rate: number | null;
  minValue: number | null;
  maxValue: number | null;
  multiplier: number | null;
  condition: string | null; // JSON string e.g. {"field":"material","value":"timber"}
  description: string | null;
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
};

const getAnswerValue = (
  answers: WorkflowAnswer[],
  fieldKey: string
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
  fallback: number = 0
): number => {
  const v = variables.find((v) => v.key === key);
  return v?.value ?? fallback;
};

const calculatePrice = (
  answers: WorkflowAnswer[],
  rules: PricingRuleData[],
  globalVariables: PricingVariableData[]
): PriceBreakdown => {
  let basePrice = 0;
  const modifiers: PriceModifier[] = [];
  let totalMultiplier = 1;

  // --- 1. Process per_unit rules (e.g., £3.50/m²) ---
  const perUnitRules = rules.filter((r) => r.ruleType === "per_unit");
  for (const rule of perUnitRules) {
    const qty = parseNumeric(getAnswerValue(answers, rule.fieldKey));
    const rate = rule.rate ?? 0;
    if (qty > 0 && rate > 0) {
      const amount = qty * rate;
      basePrice += amount;
      modifiers.push({
        label: rule.description || `${rule.fieldKey}: ${qty} × £${rate.toFixed(2)}`,
        amount,
        type: "add",
      });
    }
  }

  // --- 2. Process flat rules (fixed additions) ---
  const flatRules = rules.filter((r) => r.ruleType === "flat");
  for (const rule of flatRules) {
    const rate = rule.rate ?? 0;
    if (rate > 0) {
      basePrice += rate;
      modifiers.push({
        label: rule.description || `Fixed charge`,
        amount: rate,
        type: "add",
      });
    }
  }

  // --- 3. Process conditional rules (add if condition matches) ---
  const conditionalRules = rules.filter((r) => r.ruleType === "conditional");
  for (const rule of conditionalRules) {
    if (!rule.condition) continue;
    try {
      const cond = JSON.parse(rule.condition);
      const answerVal = getAnswerValue(answers, cond.field);
      const matches =
        String(answerVal).toLowerCase() === String(cond.value).toLowerCase();

      if (matches) {
        if (rule.rate) {
          basePrice += rule.rate;
          modifiers.push({
            label: rule.description || `${cond.field}: ${cond.value}`,
            amount: rule.rate,
            type: "add",
          });
        }
        if (rule.multiplier) {
          totalMultiplier *= rule.multiplier;
          modifiers.push({
            label:
              rule.description || `${cond.value} (×${rule.multiplier.toFixed(2)})`,
            amount: rule.multiplier,
            type: "multiply",
          });
        }
      }
    } catch {
      // Invalid JSON condition — skip
    }
  }

  // --- 4. Process multiplier rules (based on field value) ---
  const multiplierRules = rules.filter((r) => r.ruleType === "multiplier");
  for (const rule of multiplierRules) {
    const answerVal = getAnswerValue(answers, rule.fieldKey);
    if (answerVal !== undefined && rule.multiplier) {
      // Multiplier rules apply when the field has any truthy value
      const shouldApply =
        answerVal === "true" ||
        answerVal === true ||
        (typeof answerVal === "number" && answerVal > 0) ||
        (typeof answerVal === "string" && answerVal.length > 0 && answerVal !== "false" && answerVal !== "0");

      if (shouldApply) {
        totalMultiplier *= rule.multiplier;
        modifiers.push({
          label:
            rule.description || `${rule.fieldKey} (×${rule.multiplier.toFixed(2)})`,
          amount: rule.multiplier,
          type: "multiply",
        });
      }
    }
  }

  // --- 5. Apply total multiplier ---
  let subtotal = basePrice * totalMultiplier;

  // --- 6. Enforce minimum charge ---
  const minCharge = getGlobalVar(globalVariables, "minimum_charge", 35);
  if (subtotal > 0 && subtotal < minCharge) {
    subtotal = minCharge;
  }

  // --- 7. Calculate waste cost ---
  const wasteRate = getGlobalVar(globalVariables, "waste_disposal_rate", 0);
  const wasteAnswer = parseNumeric(getAnswerValue(answers, "waste_volume"));
  const wasteCost = wasteAnswer > 0 ? wasteAnswer * wasteRate : 0;

  // --- 8. Calculate total and deposit ---
  const total = subtotal + wasteCost;
  const depositPct = getGlobalVar(globalVariables, "deposit_percentage", 50) / 100;
  const depositAmount = Math.ceil(total * depositPct * 100) / 100; // Round up to nearest penny

  return {
    basePrice: Math.round(basePrice * 100) / 100,
    modifiers,
    wasteCost: Math.round(wasteCost * 100) / 100,
    subtotal: Math.round(subtotal * 100) / 100,
    depositAmount: Math.round(depositAmount * 100) / 100,
    total: Math.round(total * 100) / 100,
  };
};

export { calculatePrice };
export type {
  WorkflowAnswer,
  PricingRuleData,
  PricingVariableData,
  PriceModifier,
  PriceBreakdown,
};
