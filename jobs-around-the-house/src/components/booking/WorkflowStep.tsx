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

            {/* DIMENSIONS OR CUSTOM DIMENSIONS INPUT */}
            {(step.fieldType === "dimensions" || step.fieldKey === "custom_dimensions") && (
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginTop: "0.5rem" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                        <span style={{ fontSize: "0.75rem", color: "#6b7280", fontWeight: "500" }}>Width (meters)</span>
                        <input
                            type="number"
                            placeholder="e.g. 3.0"
                            step="0.1"
                            min="0.1"
                            className="wf-step__input"
                            style={{ width: "120px", height: "40px", padding: "0.5rem", borderRadius: "0.375rem", border: "1px solid #d1d5db" }}
                            value={String(value || "").split(" x ")[0] || ""}
                            onChange={(e) => {
                                const wVal = e.target.value;
                                const lVal = String(value || "").split(" x ")[1] || "";
                                onChange(wVal || lVal ? `${wVal || "0"} x ${lVal || "0"}` : "");
                            }}
                        />
                    </div>
                    <span style={{ fontSize: "1.25rem", color: "#9ca3af", alignSelf: "flex-end", marginBottom: "8px" }}>×</span>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                        <span style={{ fontSize: "0.75rem", color: "#6b7280", fontWeight: "500" }}>Length (meters)</span>
                        <input
                            type="number"
                            placeholder="e.g. 2.4"
                            step="0.1"
                            min="0.1"
                            className="wf-step__input"
                            style={{ width: "120px", height: "40px", padding: "0.5rem", borderRadius: "0.375rem", border: "1px solid #d1d5db" }}
                            value={String(value || "").split(" x ")[1] || ""}
                            onChange={(e) => {
                                const wVal = String(value || "").split(" x ")[0] || "";
                                const lVal = e.target.value;
                                onChange(wVal || lVal ? `${wVal || "0"} x ${lVal || "0"}` : "");
                            }}
                        />
                    </div>
                </div>
            )}

            {/* TEXT INPUT (Non-dimensions) */}
            {step.fieldType === "text" && step.fieldKey !== "custom_dimensions" && (
                <textarea
                    id={`step-${step.fieldKey}`}
                    className="wf-step__textarea"
                    value={value ?? ""}
                    onChange={(e) => onChange(e.target.value)}
                    rows={3}
                    placeholder="Describe your requirements..."
                />
            )}

            {/* PHOTO UPLOAD */}
            {step.fieldType === "photo_upload" && (
                <div className="wf-step__photo-upload">
                    {value ? (
                        <div className="wf-photo-preview" style={{ position: "relative", width: "fit-content" }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={String(value)}
                                alt="Site upload preview"
                                style={{ maxWidth: "200px", maxHeight: "150px", borderRadius: "0.375rem", border: "1px solid #d1d5db" }}
                            />
                            <button
                                type="button"
                                onClick={() => onChange("")}
                                className="wf-photo-preview__remove"
                                style={{
                                    position: "absolute",
                                    top: "-0.5rem",
                                    right: "-0.5rem",
                                    backgroundColor: "#ef4444",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "50%",
                                    width: "1.5rem",
                                    height: "1.5rem",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "0.75rem",
                                }}
                            >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <line x1="18" y1="6" x2="6" y2="18"/>
                                    <line x1="6" y1="6" x2="18" y2="18"/>
                                </svg>
                            </button>
                        </div>
                    ) : (
                        <div>
                            <label
                                className="btn btn--secondary"
                                style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", padding: "0.5rem 1rem", border: "1px solid #d1d5db", borderRadius: "0.375rem", fontSize: "0.875rem" }}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                                    <circle cx="12" cy="13" r="4"/>
                                </svg>
                                Take Photo or Upload
                                <input
                                    type="file"
                                    accept="image/*"
                                    capture="environment"
                                    style={{ display: "none" }}
                                    onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;

                                        const formData = new FormData();
                                        formData.append("file", file);

                                        try {
                                            const res = await fetch("/api/uploads", {
                                                method: "POST",
                                                body: formData,
                                            });
                                            const data = await res.json();
                                            if (data.success) {
                                                onChange(data.url);
                                            } else {
                                                alert(data.error || "Failed to upload photo");
                                            }
                                        } catch (err) {
                                            console.error("Upload error:", err);
                                            alert("Error uploading file. Please try again.");
                                        }
                                    }}
                                />
                            </label>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default WorkflowStep;
