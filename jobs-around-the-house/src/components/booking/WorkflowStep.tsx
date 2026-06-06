"use client";

import React from "react";
import type { WorkflowStepData } from "@/lib/types/product";
import { CheckIcon, XIcon } from "@/components/ui/Icons";

type WorkflowStepProps = {
    step: WorkflowStepData;
    value: string | number | undefined;
    onChange: (value: string | number) => void;
};

const WorkflowStep = ({ step, value, onChange }: WorkflowStepProps) => {
    const validationRules =
        step.validationRules ? JSON.parse(step.validationRules) : {};

    return (
        <div className="wf-step">
            <label
                className="wf-step__label"
                htmlFor={`step-${step.fieldKey}`}
            >
                {step.label}
                {step.isRequired && (
                    <span className="wf-step__required">*</span>
                )}
            </label>
            {step.helpText && <p className="wf-step__help">{step.helpText}</p>}

            {/* NUMBER INPUT */}
            {step.fieldType === "number" && (
                <div className="wf-step__number">
                    <input
                        type="number"
                        id={`step-${step.fieldKey}`}
                        className="wf-step__input"
                        value={value ?? ""}
                        onChange={(e) =>
                            onChange(
                                e.target.value === "" ?
                                    ""
                                :   parseFloat(e.target.value),
                            )
                        }
                        min={validationRules.min}
                        max={validationRules.max}
                        step={validationRules.step ?? 1}
                        placeholder={
                            validationRules.min && validationRules.max ?
                                `${validationRules.min} – ${validationRules.max}`
                            :   "Enter a number"
                        }
                    />
                    {step.unit && (
                        <span className="wf-step__unit">{step.unit}</span>
                    )}
                </div>
            )}

            {/* SELECT (Radio Cards) */}
            {step.fieldType === "select" && (
                <div
                    className="wf-step__options"
                    role="radiogroup"
                    aria-labelledby={`step-${step.fieldKey}`}
                >
                    {step.options.map((opt) => (
                        <button
                            key={opt.id}
                            type="button"
                            className={`wf-option-card ${String(value) === opt.value ? "wf-option-card--selected" : ""}`}
                            onClick={() => onChange(opt.value)}
                            role="radio"
                            aria-checked={String(value) === opt.value}
                        >
                            <span className="wf-option-card__radio">
                                {String(value) === opt.value && (
                                    <span className="wf-option-card__radio-dot" />
                                )}
                            </span>
                            <span className="wf-option-card__content">
                                <span className="wf-option-card__label">
                                    {opt.label}
                                </span>
                                {opt.description && (
                                    <span className="wf-option-card__desc">
                                        {opt.description}
                                    </span>
                                )}
                            </span>
                        </button>
                    ))}
                </div>
            )}

            {/* BOOLEAN (Toggle) */}
            {step.fieldType === "boolean" && (
                <div className="wf-step__toggle-group">
                    <button
                        type="button"
                        className={`wf-toggle-btn ${value === "true" || String(value) === "true" ? "wf-toggle-btn--active" : ""}`}
                        onClick={() => onChange("true")}
                    >
                        <CheckIcon size={16} />
                        Yes
                    </button>
                    <button
                        type="button"
                        className={`wf-toggle-btn ${value === "false" || String(value) === "false" ? "wf-toggle-btn--active wf-toggle-btn--no" : ""}`}
                        onClick={() => onChange("false")}
                    >
                        <XIcon size={16} />
                        No
                    </button>
                </div>
            )}

            {/* TEXT INPUT */}
            {step.fieldType === "text" && (
                <textarea
                    id={`step-${step.fieldKey}`}
                    className="wf-step__textarea"
                    value={value ?? ""}
                    onChange={(e) => onChange(e.target.value)}
                    rows={3}
                    placeholder="Describe your requirements..."
                />
            )}
        </div>
    );
};

export default WorkflowStep;
