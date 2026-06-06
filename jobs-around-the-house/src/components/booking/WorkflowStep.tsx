"use client";

import type { WorkflowStepData } from "./BookingWizard";

interface Props {
  step: WorkflowStepData;
  value: string | number | undefined;
  onChange: (value: string | number) => void;
}

export default function WorkflowStep({ step, value, onChange }: Props) {
  const validationRules = step.validationRules
    ? JSON.parse(step.validationRules)
    : {};

  return (
    <div className="wf-step">
      <label className="wf-step__label" htmlFor={`step-${step.fieldKey}`}>
        {step.label}
        {step.isRequired && <span className="wf-step__required">*</span>}
      </label>
      {step.helpText && (
        <p className="wf-step__help">{step.helpText}</p>
      )}

      {/* NUMBER INPUT */}
      {step.fieldType === "number" && (
        <div className="wf-step__number">
          <input
            type="number"
            id={`step-${step.fieldKey}`}
            className="wf-step__input"
            value={value ?? ""}
            onChange={(e) =>
              onChange(e.target.value === "" ? "" : parseFloat(e.target.value))
            }
            min={validationRules.min}
            max={validationRules.max}
            step={validationRules.step ?? 1}
            placeholder={
              validationRules.min && validationRules.max
                ? `${validationRules.min} – ${validationRules.max}`
                : "Enter a number"
            }
          />
          {step.unit && <span className="wf-step__unit">{step.unit}</span>}
        </div>
      )}

      {/* SELECT (Radio Cards) */}
      {step.fieldType === "select" && (
        <div className="wf-step__options" role="radiogroup" aria-labelledby={`step-${step.fieldKey}`}>
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
                <span className="wf-option-card__label">{opt.label}</span>
                {opt.description && (
                  <span className="wf-option-card__desc">{opt.description}</span>
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
            className={`wf-toggle-btn ${value === "true" || value === true ? "wf-toggle-btn--active" : ""}`}
            onClick={() => onChange("true")}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Yes
          </button>
          <button
            type="button"
            className={`wf-toggle-btn ${value === "false" || value === false ? "wf-toggle-btn--active wf-toggle-btn--no" : ""}`}
            onClick={() => onChange("false")}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
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
}
