"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Product {
    id: number;
    title: string;
    productType: string;
}

interface CatalogProduct {
    id: number;
    title: string;
    sku: string;
    basePrice: number;
}

interface StepOption {
    id?: number;
    productId: number | null;
    priceModifier: number;
    optionValueFlag: string;
    label: string;
    value: string;
    description: string | null;
    sortOrder: number;
}

interface WorkflowStep {
    id?: number;
    stepName: string;
    sortOrder: number;
    isMandatory: boolean;
    fieldType: string;
    fieldKey: string;
    helpText: string | null;
    unit: string | null;
    validationRules: string | null;
    conditionalTriggerValue: string | null;
    options: StepOption[];
    // UI state
    isExpanded?: boolean;
}

interface Props {
    product: Product & {
        workflowSteps: (any & {
            options: any[];
        })[];
    };
    allProducts: CatalogProduct[];
}

const FIELD_TYPES = [
    { value: "select", label: "Select Dropdown / Options" },
    { value: "boolean", label: "Yes/No Checkbox (Boolean)" },
    { value: "number", label: "Numeric Input" },
    { value: "text", label: "Text Field" },
    { value: "dimensions", label: "Dimensions (Width x Length Matrix)" },
    { value: "photo_upload", label: "Customer Photo Upload" },
];

export default function WorkflowManager({ product, allProducts }: Props) {
    const router = useRouter();

    // Map database steps to our UI state structure
    const initialSteps: WorkflowStep[] = product.workflowSteps.map((step) => ({
        id: step.id,
        stepName: step.stepName,
        sortOrder: step.sortOrder,
        isMandatory: step.isMandatory,
        fieldType: step.fieldType,
        fieldKey: step.fieldKey,
        helpText: step.helpText,
        unit: step.unit,
        validationRules: step.validationRules,
        conditionalTriggerValue: step.conditionalTriggerValue,
        options: step.options.map((opt: any) => ({
            id: opt.id,
            productId: opt.productId,
            priceModifier: opt.priceModifier,
            optionValueFlag: opt.optionValueFlag,
            label: opt.label,
            value: opt.value,
            description: opt.description,
            sortOrder: opt.sortOrder,
        })),
        isExpanded: false,
    }));

    const [steps, setSteps] = useState<WorkflowStep[]>(initialSteps);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Helpers to add, remove, and reorder steps
    const handleAddStep = () => {
        const newStep: WorkflowStep = {
            stepName: "New Step",
            sortOrder: steps.length,
            isMandatory: true,
            fieldType: "text",
            fieldKey: `new_field_${Date.now()}`,
            helpText: "",
            unit: "",
            validationRules: "",
            conditionalTriggerValue: "",
            options: [],
            isExpanded: true,
        };
        setSteps([...steps, newStep]);
    };

    const handleDeleteStep = (index: number) => {
        if (confirm("Are you sure you want to delete this step and all its options?")) {
            const updated = steps.filter((_, idx) => idx !== index);
            // Re-sequence sortOrder
            const resequenced = updated.map((step, idx) => ({
                ...step,
                sortOrder: idx,
            }));
            setSteps(resequenced);
        }
    };

    const moveStep = (index: number, direction: "up" | "down") => {
        if (direction === "up" && index === 0) return;
        if (direction === "down" && index === steps.length - 1) return;

        const targetIndex = direction === "up" ? index - 1 : index + 1;
        const updated = [...steps];
        const temp = updated[index];
        updated[index] = updated[targetIndex];
        updated[targetIndex] = temp;

        // Re-sequence sortOrder
        const resequenced = updated.map((step, idx) => ({
            ...step,
            sortOrder: idx,
        }));
        setSteps(resequenced);
    };

    const handleStepChange = (index: number, field: keyof WorkflowStep, value: any) => {
        const updated = [...steps];
        updated[index] = {
            ...updated[index],
            [field]: value,
        };

        // If fieldType changes from select, clear options or show alert
        if (field === "fieldType" && value !== "select") {
            updated[index].options = [];
        }

        setSteps(updated);
    };

    const toggleExpand = (index: number) => {
        const updated = [...steps];
        updated[index].isExpanded = !updated[index].isExpanded;
        setSteps(updated);
    };

    // Option helpers
    const handleAddOption = (stepIndex: number) => {
        const updated = [...steps];
        const currentOptions = updated[stepIndex].options;
        const newOption: StepOption = {
            productId: null,
            priceModifier: 0,
            optionValueFlag: "",
            label: "New Option",
            value: `new_option_${Date.now()}`,
            description: "",
            sortOrder: currentOptions.length,
        };
        updated[stepIndex].options = [...currentOptions, newOption];
        setSteps(updated);
    };

    const handleDeleteOption = (stepIndex: number, optionIndex: number) => {
        const updated = [...steps];
        updated[stepIndex].options = updated[stepIndex].options.filter((_, idx) => idx !== optionIndex);
        // Re-sequence option sortOrder
        updated[stepIndex].options = updated[stepIndex].options.map((opt, idx) => ({
            ...opt,
            sortOrder: idx,
        }));
        setSteps(updated);
    };

    const handleOptionChange = (stepIndex: number, optionIndex: number, field: keyof StepOption, value: any) => {
        const updated = [...steps];
        const opt = { ...updated[stepIndex].options[optionIndex] };

        if (field === "productId") {
            const prodId = value ? Number(value) : null;
            opt.productId = prodId;

            // Pre-fill fields if a product is selected and option has defaults
            if (prodId) {
                const catalogProd = allProducts.find((p) => p.id === prodId);
                if (catalogProd) {
                    if (opt.label === "New Option" || !opt.label) {
                        opt.label = catalogProd.title;
                    }
                    if (opt.value === "" || opt.value.startsWith("new_option_")) {
                        opt.value = catalogProd.sku.toLowerCase().replace(/[^a-z0-9]/g, "_");
                    }
                    opt.priceModifier = catalogProd.basePrice;
                }
            }
        } else if (field === "priceModifier") {
            opt.priceModifier = parseFloat(value) || 0;
        } else {
            opt[field] = value as never;
        }

        updated[stepIndex].options[optionIndex] = opt;
        setSteps(updated);
    };

    const moveOption = (stepIndex: number, optionIndex: number, direction: "up" | "down") => {
        const currentOptions = [...steps[stepIndex].options];
        if (direction === "up" && optionIndex === 0) return;
        if (direction === "down" && optionIndex === currentOptions.length - 1) return;

        const targetIndex = direction === "up" ? optionIndex - 1 : optionIndex + 1;
        const temp = currentOptions[optionIndex];
        currentOptions[optionIndex] = currentOptions[targetIndex];
        currentOptions[targetIndex] = temp;

        const updated = [...steps];
        updated[stepIndex].options = currentOptions.map((opt, idx) => ({
            ...opt,
            sortOrder: idx,
        }));
        setSteps(updated);
    };

    const handleSave = async () => {
        setSaving(true);
        setError(null);
        setSaved(false);

        // Client-side validations
        const keys = steps.map((s) => s.fieldKey.trim());
        const hasDuplicateKeys = keys.some((k, idx) => keys.indexOf(k) !== idx);
        if (hasDuplicateKeys) {
            setError("Validation Error: Step field keys must be globally unique across this product workflow.");
            setSaving(false);
            return;
        }

        for (let i = 0; i < steps.length; i++) {
            const step = steps[i];
            if (!step.stepName.trim()) {
                setError(`Validation Error: Step ${i + 1} must have a name.`);
                setSaving(false);
                return;
            }
            if (!step.fieldKey.trim()) {
                setError(`Validation Error: Step "${step.stepName}" must have a valid field key.`);
                setSaving(false);
                return;
            }

            if (step.fieldType === "select") {
                if (step.options.length === 0) {
                    setError(`Validation Error: Select step "${step.stepName}" must have at least one option.`);
                    setSaving(false);
                    return;
                }
                const optValues = step.options.map((o) => o.value.trim());
                const hasDuplicateOptions = optValues.some((val, idx) => optValues.indexOf(val) !== idx);
                if (hasDuplicateOptions) {
                    setError(`Validation Error: Options in step "${step.stepName}" must have unique values.`);
                    setSaving(false);
                    return;
                }
                for (const opt of step.options) {
                    if (!opt.label.trim()) {
                        setError(`Validation Error: Options in step "${step.stepName}" must have a label.`);
                        setSaving(false);
                        return;
                    }
                    if (!opt.value.trim()) {
                        setError(`Validation Error: Options in step "${step.stepName}" must have a valid value key.`);
                        setSaving(false);
                        return;
                    }
                }
            }
        }

        try {
            const res = await fetch(`/api/admin/products/${product.id}/workflow`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ steps }),
            });

            if (res.ok) {
                setSaved(true);
                router.refresh();
                setTimeout(() => setSaved(false), 3000);
            } else {
                const data = await res.json();
                setError(data.error || "Failed to save workflow changes.");
            }
        } catch {
            setError("A network error occurred. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="workflow-manager">
            {error && (
                <div className="sg-manager__alert sg-manager__alert--error" style={{ marginBottom: "1.5rem" }}>
                    {error}
                </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <h2 className="admin-card__title" style={{ margin: 0 }}>Workflow Steps ({steps.length})</h2>
                <button
                    type="button"
                    onClick={handleAddStep}
                    className="btn btn--outline btn--sm"
                >
                    + Add Step
                </button>
            </div>

            {steps.length === 0 ? (
                <div className="admin-empty" style={{ marginBottom: "1.5rem" }}>
                    No workflow steps configured for this service. Click "+ Add Step" to begin building.
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {steps.map((step, sIdx) => (
                        <div
                            key={sIdx}
                            className="admin-card"
                            style={{
                                borderLeft: "4px solid var(--color-teal-500)",
                                position: "relative",
                                padding: "1.25rem",
                                marginBottom: 0,
                            }}
                        >
                            {/* Step Card Header */}
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: step.isExpanded ? "1px solid var(--color-gray-200)" : "none", paddingBottom: step.isExpanded ? "0.75rem" : "0", marginBottom: step.isExpanded ? "1rem" : "0" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer" }} onClick={() => toggleExpand(sIdx)}>
                                    <span style={{ fontWeight: "600", fontSize: "1rem", color: "var(--color-navy-800)" }}>
                                        {step.sortOrder + 1}. {step.stepName || "Untitled Step"}
                                    </span>
                                    <span className="admin-badge" style={{ background: "var(--color-navy-50)", color: "var(--color-navy-600)" }}>
                                        {FIELD_TYPES.find((f) => f.value === step.fieldType)?.label || step.fieldType}
                                    </span>
                                    {step.isMandatory && (
                                        <span className="admin-badge" style={{ background: "rgba(245, 158, 11, 0.1)", color: "var(--color-warning)" }}>
                                            Mandatory
                                        </span>
                                    )}
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                    <button
                                        type="button"
                                        className="btn btn--ghost btn--sm"
                                        disabled={sIdx === 0}
                                        onClick={() => moveStep(sIdx, "up")}
                                        style={{ padding: "0.25rem 0.5rem" }}
                                        title="Move Up"
                                    >
                                        &uarr;
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn--ghost btn--sm"
                                        disabled={sIdx === steps.length - 1}
                                        onClick={() => moveStep(sIdx, "down")}
                                        style={{ padding: "0.25rem 0.5rem" }}
                                        title="Move Down"
                                    >
                                        &darr;
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => toggleExpand(sIdx)}
                                        className="btn btn--ghost btn--sm"
                                        style={{ color: "var(--color-teal-600)" }}
                                    >
                                        {step.isExpanded ? "Hide Settings" : "Show Settings"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleDeleteStep(sIdx)}
                                        className="btn btn--ghost btn--sm"
                                        style={{ color: "var(--color-error)" }}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>

                            {/* Step Expanded Content */}
                            {step.isExpanded && (
                                <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                                    <div className="sg-manager__form-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem" }}>
                                        <div className="sg-manager__field">
                                            <label>Step Name / Label *</label>
                                            <input
                                                type="text"
                                                value={step.stepName}
                                                onChange={(e) => handleStepChange(sIdx, "stepName", e.target.value)}
                                                placeholder="e.g. Choose Shed Dimensions"
                                                required
                                            />
                                        </div>

                                        <div className="sg-manager__field">
                                            <label>Field Unique Key *</label>
                                            <input
                                                type="text"
                                                value={step.fieldKey}
                                                onChange={(e) => handleStepChange(sIdx, "fieldKey", e.target.value)}
                                                placeholder="e.g. size_dimension"
                                                required
                                            />
                                        </div>

                                        <div className="sg-manager__field">
                                            <label>Field Component Type *</label>
                                            <select
                                                value={step.fieldType}
                                                onChange={(e) => handleStepChange(sIdx, "fieldType", e.target.value)}
                                            >
                                                {FIELD_TYPES.map((f) => (
                                                    <option key={f.value} value={f.value}>
                                                        {f.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="sg-manager__field">
                                            <label>Unit Label (Optional)</label>
                                            <input
                                                type="text"
                                                value={step.unit || ""}
                                                onChange={(e) => handleStepChange(sIdx, "unit", e.target.value)}
                                                placeholder="e.g. m², items, hours"
                                            />
                                        </div>

                                        <div className="sg-manager__field">
                                            <label>Conditional Trigger Value (Optional)</label>
                                            <input
                                                type="text"
                                                value={step.conditionalTriggerValue || ""}
                                                onChange={(e) => handleStepChange(sIdx, "conditionalTriggerValue", e.target.value)}
                                                placeholder="e.g. yes (only show if prior step matches this)"
                                            />
                                        </div>

                                        <div className="sg-manager__field">
                                            <label>Validation Rules JSON (Optional)</label>
                                            <input
                                                type="text"
                                                value={step.validationRules || ""}
                                                onChange={(e) => handleStepChange(sIdx, "validationRules", e.target.value)}
                                                placeholder='e.g. {"min": 5, "max": 100}'
                                            />
                                        </div>

                                        <div className="sg-manager__field" style={{ display: "flex", alignItems: "center", gap: "0.5rem", paddingTop: "1.5rem" }}>
                                            <input
                                                id={`mand-${sIdx}`}
                                                type="checkbox"
                                                checked={step.isMandatory}
                                                onChange={(e) => handleStepChange(sIdx, "isMandatory", e.target.checked)}
                                                style={{ width: "auto", margin: 0 }}
                                            />
                                            <label htmlFor={`mand-${sIdx}`} style={{ cursor: "pointer" }}>Is Mandatory Input Step</label>
                                        </div>
                                    </div>

                                    <div className="sg-manager__field" style={{ width: "100%" }}>
                                        <label>Help Text / Subtitle Description</label>
                                        <textarea
                                            value={step.helpText || ""}
                                            onChange={(e) => handleStepChange(sIdx, "helpText", e.target.value)}
                                            rows={2}
                                            placeholder="Provide clarifying details to guide the user when responding..."
                                        />
                                    </div>

                                    {/* Options Sub-Section for 'select' field type */}
                                    {step.fieldType === "select" && (
                                        <div style={{ marginTop: "0.5rem", border: "1px solid var(--color-gray-200)", borderRadius: "var(--radius-lg)", padding: "1rem", background: "var(--color-gray-50)" }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                                                <h3 style={{ fontSize: "var(--font-size-sm)", fontWeight: "600", color: "var(--color-navy-800)", margin: 0 }}>
                                                    Step Selection Options ({step.options.length})
                                                </h3>
                                                <button
                                                    type="button"
                                                    onClick={() => handleAddOption(sIdx)}
                                                    className="btn btn--secondary btn--sm"
                                                    style={{ padding: "0.25rem 0.5rem", border: "1px solid var(--color-gray-300)" }}
                                                >
                                                    + Add Option
                                                </button>
                                            </div>

                                            {step.options.length === 0 ? (
                                                <div style={{ textAlign: "center", padding: "1.5rem", color: "var(--color-gray-500)", fontSize: "var(--font-size-xs)" }}>
                                                    No selection options defined. Click "+ Add Option" to add selection targets.
                                                </div>
                                            ) : (
                                                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                                    {step.options.map((opt, oIdx) => (
                                                        <div
                                                            key={oIdx}
                                                            style={{
                                                                display: "flex",
                                                                gap: "0.5rem",
                                                                alignItems: "center",
                                                                background: "var(--color-white)",
                                                                padding: "0.5rem",
                                                                borderRadius: "var(--radius-md)",
                                                                border: "1px solid var(--color-gray-200)",
                                                                flexWrap: "wrap",
                                                            }}
                                                        >
                                                            <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", minWidth: "120px", flex: 1 }}>
                                                                <label style={{ fontSize: "10px", fontWeight: "bold", textTransform: "uppercase", color: "var(--color-gray-500)" }}>Option Label *</label>
                                                                <input
                                                                    type="text"
                                                                    value={opt.label}
                                                                    onChange={(e) => handleOptionChange(sIdx, oIdx, "label", e.target.value)}
                                                                    placeholder="e.g. Concrete Base preparation"
                                                                    style={{ padding: "0.25rem 0.5rem", fontSize: "var(--font-size-xs)" }}
                                                                    required
                                                                />
                                                            </div>

                                                            <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", minWidth: "100px", flex: 1 }}>
                                                                <label style={{ fontSize: "10px", fontWeight: "bold", textTransform: "uppercase", color: "var(--color-gray-500)" }}>Option Value *</label>
                                                                <input
                                                                    type="text"
                                                                    value={opt.value}
                                                                    onChange={(e) => handleOptionChange(sIdx, oIdx, "value", e.target.value)}
                                                                    placeholder="e.g. concrete_base"
                                                                    style={{ padding: "0.25rem 0.5rem", fontSize: "var(--font-size-xs)" }}
                                                                    required
                                                                />
                                                            </div>

                                                            <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", minWidth: "180px", flex: 2 }}>
                                                                <label style={{ fontSize: "10px", fontWeight: "bold", textTransform: "uppercase", color: "var(--color-gray-500)" }}>Link Catalog Product (Optional)</label>
                                                                <select
                                                                    value={opt.productId || ""}
                                                                    onChange={(e) => handleOptionChange(sIdx, oIdx, "productId", e.target.value)}
                                                                    style={{ padding: "0.25rem 0.5rem", fontSize: "var(--font-size-xs)", height: "31px" }}
                                                                >
                                                                    <option value="">— Choose Product to Upsell/Deduct Stock —</option>
                                                                    {allProducts.map((p) => (
                                                                        <option key={p.id} value={p.id}>
                                                                            {p.title} ({p.sku}) - £{p.basePrice.toFixed(2)}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            </div>

                                                            <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", minWidth: "80px", width: "100px" }}>
                                                                <label style={{ fontSize: "10px", fontWeight: "bold", textTransform: "uppercase", color: "var(--color-gray-500)" }}>Price Mod. (£) *</label>
                                                                <input
                                                                    type="number"
                                                                    step="0.01"
                                                                    value={opt.priceModifier}
                                                                    onChange={(e) => handleOptionChange(sIdx, oIdx, "priceModifier", e.target.value)}
                                                                    placeholder="0.00"
                                                                    style={{ padding: "0.25rem 0.5rem", fontSize: "var(--font-size-xs)" }}
                                                                    required
                                                                />
                                                            </div>

                                                            <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", minWidth: "120px", flex: 1 }}>
                                                                <label style={{ fontSize: "10px", fontWeight: "bold", textTransform: "uppercase", color: "var(--color-gray-500)" }}>Value Flag / Tag</label>
                                                                <input
                                                                    type="text"
                                                                    value={opt.optionValueFlag || ""}
                                                                    onChange={(e) => handleOptionChange(sIdx, oIdx, "optionValueFlag", e.target.value)}
                                                                    placeholder="e.g. no_base_supplied"
                                                                    style={{ padding: "0.25rem 0.5rem", fontSize: "var(--font-size-xs)" }}
                                                                />
                                                            </div>

                                                            <div style={{ display: "flex", gap: "0.25rem", alignSelf: "flex-end", paddingBottom: "2px" }}>
                                                                <button
                                                                    type="button"
                                                                    className="btn btn--ghost btn--sm"
                                                                    disabled={oIdx === 0}
                                                                    onClick={() => moveOption(sIdx, oIdx, "up")}
                                                                    style={{ padding: "0.2rem 0.4rem", minWidth: "auto" }}
                                                                >
                                                                    &uarr;
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    className="btn btn--ghost btn--sm"
                                                                    disabled={oIdx === step.options.length - 1}
                                                                    onClick={() => moveOption(sIdx, oIdx, "down")}
                                                                    style={{ padding: "0.2rem 0.4rem", minWidth: "auto" }}
                                                                >
                                                                    &darr;
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleDeleteOption(sIdx, oIdx)}
                                                                    className="btn btn--ghost btn--sm"
                                                                    style={{ color: "var(--color-error)", padding: "0.2rem 0.4rem", minWidth: "auto" }}
                                                                >
                                                                    &times;
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <div className="pricing-editor__actions" style={{ marginTop: "2rem" }}>
                <button
                    type="button"
                    onClick={handleSave}
                    className="btn btn--primary btn--lg"
                    disabled={saving}
                >
                    {saving ? "Saving Workflow..." : "Save Workflow Configuration"}
                </button>
                <Link
                    href="/admin/services"
                    className="btn btn--ghost btn--lg"
                    style={{ marginLeft: "1rem" }}
                >
                    Cancel
                </Link>
                {saved && (
                    <span className="pricing-editor__saved" style={{ marginLeft: "1rem" }}>
                        ✓ Workflow configuration saved successfully
                    </span>
                )}
            </div>
        </div>
    );
}
