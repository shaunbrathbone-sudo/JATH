"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Variable {
  id: string;
  key: string;
  label: string;
  value: number;
  unit: string | null;
  category: string | null;
  description: string | null;
}

interface Props {
  variables: Variable[];
}

export default function PricingVariableEditor({ variables }: Props) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, number>>(
    Object.fromEntries(variables.map((v) => [v.key, v.value]))
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const hasChanges = variables.some((v) => values[v.key] !== v.value);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);

    try {
      const updates = variables
        .filter((v) => values[v.key] !== v.value)
        .map((v) => ({ key: v.key, value: values[v.key] }));

      const res = await fetch("/api/admin/pricing", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates }),
      });

      if (res.ok) {
        setSaved(true);
        router.refresh();
        setTimeout(() => setSaved(false), 2000);
      }
    } catch {
      // Silently fail
    } finally {
      setSaving(false);
    }
  };

  // Group by category
  const grouped = variables.reduce(
    (acc, v) => {
      const cat = v.category || "general";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(v);
      return acc;
    },
    {} as Record<string, Variable[]>
  );

  return (
    <div className="pricing-editor">
      {Object.entries(grouped).map(([category, vars]) => (
        <div key={category} className="admin-card">
          <h2 className="admin-card__title" style={{ textTransform: "capitalize" }}>
            {category}
          </h2>
          <div className="pricing-editor__grid">
            {vars.map((v) => (
              <div key={v.key} className="pricing-editor__item">
                <div className="pricing-editor__info">
                  <label
                    className="pricing-editor__label"
                    htmlFor={`pv-${v.key}`}
                  >
                    {v.label}
                  </label>
                  {v.description && (
                    <p className="pricing-editor__desc">{v.description}</p>
                  )}
                </div>
                <div className="pricing-editor__input-group">
                  <input
                    type="number"
                    id={`pv-${v.key}`}
                    className="pricing-editor__input"
                    value={values[v.key]}
                    onChange={(e) =>
                      setValues((prev) => ({
                        ...prev,
                        [v.key]: parseFloat(e.target.value) || 0,
                      }))
                    }
                    step={v.unit === "multiplier" ? 0.01 : 1}
                  />
                  {v.unit && (
                    <span className="pricing-editor__unit">{v.unit}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {hasChanges && (
        <div className="pricing-editor__actions">
          <button
            type="button"
            className="btn btn--primary btn--lg"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
          {saved && <span className="pricing-editor__saved">✓ Changes saved</span>}
        </div>
      )}
    </div>
  );
}
