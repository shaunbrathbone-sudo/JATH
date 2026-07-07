"use client";

import { useState, useCallback, useEffect } from "react";
import WorkflowStep from "./WorkflowStep";
import PriceSummary from "./PriceSummary";
import CustomerForm from "./CustomerForm";
import BookingConfirmation from "./BookingConfirmation";
import type { ProductData, WorkflowData } from "@/lib/types/product";
import type { BookingResult } from "@/lib/types/booking";
import type { PriceBreakdown } from "@/lib/utils/pricing";
import { ArrowRightIcon } from "@/components/ui/Icons";
import api from "@/lib/api/axios";
import axios from "axios";

type BookingWizardProps = {
    product: ProductData;
    workflow: WorkflowData;
    inStock?: boolean;
};

const WIZARD_STEPS = ["Configure", "Review", "Your Details", "Confirm"];

const BookingWizard = ({ product, workflow, inStock = true }: BookingWizardProps) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string | number>>({});
    const [quantity, setQuantity] = useState(1);
    const [price, setPrice] = useState<PriceBreakdown | null>(null);
    const [priceLoading, setPriceLoading] = useState(false);
    const [availablePoints, setAvailablePoints] = useState(0);
    const [pointsToRedeem, setPointsToRedeem] = useState(0);
    const [redemptionRate, setRedemptionRate] = useState(0.01);
    const [customerData, setCustomerData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        postcode: "",
        preferredDate: "",
        preferredTime: "",
        notes: "",
    });
    const [bookingResult, setBookingResult] = useState<BookingResult | null>(
        null,
    );
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showCustomerErrors, setShowCustomerErrors] = useState(false);

    // Filter visible steps based on showIf conditions (branching trigger values)
    const visibleSteps = workflow.steps.filter((step) => {
        if (!step.showIf) return true;
        return Object.values(answers).some((val) => String(val) === String(step.showIf));
    });

    // Fetch price whenever answers change
    const fetchPrice = useCallback(async () => {
        const answerEntries = Object.entries(answers).filter(
            ([, v]) => v !== "" && v !== undefined,
        );
        if (answerEntries.length === 0) {
            setPrice(null);
            return;
        }

        setPriceLoading(true);
        try {
            const res = await api.post("/pricing/calculate", {
                productSlug: product.slug,
                answers: answerEntries.map(([fieldKey, value]) => ({
                    fieldKey,
                    value: String(value),
                })),
                quantity,
            });
            setPrice(res.data);
        } catch {
            // Silently fail — price just won't update
        } finally {
            setPriceLoading(false);
        }
    }, [answers, product.slug, quantity]);

    useEffect(() => {
        const timer = setTimeout(fetchPrice, 300); // Debounce
        return () => clearTimeout(timer);
    }, [fetchPrice]);

    useEffect(() => {
        const fetchPoints = async () => {
            const trimmedEmail = customerData.email.trim();
            if (trimmedEmail && trimmedEmail.includes("@")) {
                try {
                    const res = await api.get(`/customers/points?email=${encodeURIComponent(trimmedEmail)}`);
                    setAvailablePoints(res.data.points || 0);
                    setRedemptionRate(res.data.redemptionRate ?? 0.01);
                } catch {
                    setAvailablePoints(0);
                    setRedemptionRate(0.01);
                }
            } else {
                setAvailablePoints(0);
                setPointsToRedeem(0);
                setRedemptionRate(0.01);
            }
        };
        fetchPoints();
    }, [customerData.email]);

    const handleAnswerChange = (fieldKey: string, value: string | number) => {
        setAnswers((prev) => ({ ...prev, [fieldKey]: value }));
    };

    const isConfigValid = () => {
        return visibleSteps.every((step) => {
            if (!step.isRequired) return true;
            const val = answers[step.fieldKey];
            return val !== undefined && val !== "" && val !== 0;
        });
    };

    const isCustomerValid = () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return (
            customerData.firstName.trim() !== "" &&
            customerData.lastName.trim() !== "" &&
            customerData.email.trim() !== "" &&
            emailRegex.test(customerData.email.trim())
        );
    };

    const handleSubmitBooking = async () => {
        if (!price) return;
        setSubmitting(true);
        setError(null);

        try {
            const res = await api.post("/bookings", {
                customer: {
                    email: customerData.email.trim(),
                    firstName: customerData.firstName.trim(),
                    lastName: customerData.lastName.trim(),
                    phone: customerData.phone.trim() || undefined,
                    addressLine1: customerData.addressLine1.trim() || undefined,
                    addressLine2: customerData.addressLine2.trim() || undefined,
                    city: customerData.city.trim() || undefined,
                    postcode: customerData.postcode.trim() || undefined,
                },
                items: [
                    {
                        productId: product.id,
                        calculatedPrice: price.subtotal,
                        wasteCost: price.wasteCost,
                        quantity: quantity,
                        itemLabel: product.name,
                        configs: Object.entries(answers).map(
                            ([fieldKey, value]) => ({
                                fieldKey,
                                fieldValue: String(value),
                            }),
                        ),
                    },
                ],
                preferredDate: customerData.preferredDate || undefined,
                preferredTime: customerData.preferredTime || undefined,
                notes: customerData.notes || undefined,
                redeemPoints: pointsToRedeem,
            });

            setBookingResult(res.data);
            setCurrentStep(3);
        } catch (err: unknown) {
            let message = "Network error. Please try again.";
            if (axios.isAxiosError(err)) {
                message = err.response?.data?.error || message;
            }
            setError(message);
        } finally {
            setSubmitting(false);
        }
    };

    const canProceed = () => {
        if (!inStock) return false;
        switch (currentStep) {
            case 0:
                return isConfigValid() && price !== null && price.total > 0;
            case 1:
                return true;
            case 2:
                // Always return true to allow clicking Confirm Booking, triggering validation warnings on submit attempt.
                return true;
            default:
                return false;
        }
    };

    const nextStep = () => {
        if (currentStep === 2) {
            if (!isCustomerValid()) {
                setShowCustomerErrors(true);
                return;
            }
            handleSubmitBooking();
        } else {
            setCurrentStep((s) => Math.min(s + 1, 3));
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    const prevStep = () => {
        setShowCustomerErrors(false);
        setCurrentStep((s) => Math.max(s - 1, 0));
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <div className="booking-wizard">
            {/* Progress Steps */}
            <div
                className="wizard-progress"
                role="navigation"
                aria-label="Booking progress"
            >
                {WIZARD_STEPS.map((label, i) => (
                    <div
                        key={label}
                        className={`wizard-progress__step ${i === currentStep ? "wizard-progress__step--active" : ""} ${i < currentStep ? "wizard-progress__step--done" : ""}`}
                    >
                        <div className="wizard-progress__dot">
                            {i < currentStep ?
                                <svg
                                    width="14"
                                    height="14"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                            :   <span>{i + 1}</span>}
                        </div>
                        <span className="wizard-progress__label">{label}</span>
                    </div>
                ))}
            </div>

            {/* Step Content */}
            <div className="wizard-content">
                {/* STEP 0: Configure */}
                {currentStep === 0 && (
                    <div className="wizard-layout">
                        <div className="wizard-layout__main">
                            <div className="wizard-card">
                                <h2 className="wizard-card__title">
                                    Configure Your Job
                                </h2>
                                {!inStock && (
                                    <div className="error-banner" role="alert" style={{
                                        backgroundColor: "#fef2f2",
                                        borderColor: "#fee2e2",
                                        color: "#991b1b",
                                        borderWidth: "1px",
                                        borderRadius: "0.375rem",
                                        padding: "1rem",
                                        marginBottom: "1.5rem",
                                        fontSize: "0.875rem",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "0.5rem"
                                    }}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
                                            <circle cx="12" cy="12" r="10"/>
                                            <line x1="15" y1="9" x2="9" y2="15"/>
                                            <line x1="9" y1="9" x2="15" y2="15"/>
                                        </svg>
                                        <span>This service is currently out of stock. We apologize for the inconvenience.</span>
                                    </div>
                                )}
                                <p className="wizard-card__subtitle">
                                    Tell us the details and we&apos;ll calculate
                                    your price instantly.
                                </p>
                                <div className="wizard-steps">
                                    {answers["shed_size"] === "custom" && (
                                        <div className="warning-banner" role="alert" style={{
                                            backgroundColor: "#fffbeb",
                                            borderColor: "#fef3c7",
                                            color: "#92400e",
                                            borderWidth: "1px",
                                            borderRadius: "0.375rem",
                                            padding: "1rem",
                                            marginBottom: "1.5rem",
                                            fontSize: "0.875rem",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "0.5rem"
                                        }}>
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
                                                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                                                <line x1="12" y1="9" x2="12" y2="13"/>
                                                <line x1="12" y1="17" x2="12.01" y2="17"/>
                                            </svg>
                                            <span>Our engineering team will review your photos and issue a finalized quote post-checkout.</span>
                                        </div>
                                    )}
                                    {visibleSteps.map((step) => (
                                        <WorkflowStep
                                            key={step.id}
                                            step={step}
                                            value={answers[step.fieldKey]}
                                            onChange={(val) =>
                                                handleAnswerChange(
                                                    step.fieldKey,
                                                    val,
                                                )
                                            }
                                        />
                                    ))}
                                </div>
                                <div className="wizard-quantity-section" style={{
                                    borderTop: "1px solid #e5e7eb",
                                    paddingTop: "1.5rem",
                                    marginTop: "1.5rem"
                                }}>
                                    <label className="wf-step__label" style={{ marginBottom: "0.5rem", display: "block" }}>
                                        Quantity
                                        <span className="wf-step__required">*</span>
                                    </label>
                                    <p className="wf-step__help" style={{ marginBottom: "1rem" }}>
                                        Select the number of items or services you wish to book.
                                    </p>
                                    
                                    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "1.5rem" }}>
                                        {/* Quantity Counter Control with WCAG AA compliance (40x40px touch targets, clear labels, keyboard support) */}
                                        <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", border: "1px solid #d1d5db", borderRadius: "0.375rem", overflow: "hidden", width: "fit-content", backgroundColor: "#fff" }}>
                                            <button
                                                type="button"
                                                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                                disabled={quantity <= 1}
                                                aria-label="Decrease quantity"
                                                style={{
                                                    width: "44px",
                                                    height: "44px",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    border: "none",
                                                    backgroundColor: "transparent",
                                                    cursor: quantity <= 1 ? "not-allowed" : "pointer",
                                                    color: quantity <= 1 ? "#9ca3af" : "#1f2937",
                                                    fontSize: "1.25rem",
                                                    fontWeight: "bold",
                                                    transition: "background-color 0.2s"
                                                }}
                                            >
                                                −
                                            </button>
                                            <span style={{
                                                width: "44px",
                                                textAlign: "center",
                                                fontWeight: "600",
                                                color: "#111827",
                                                fontSize: "1rem"
                                            }}>
                                                {quantity}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => setQuantity(q => q + 1)}
                                                aria-label="Increase quantity"
                                                style={{
                                                    width: "44px",
                                                    height: "44px",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    border: "none",
                                                    backgroundColor: "transparent",
                                                    cursor: "pointer",
                                                    color: "#1f2937",
                                                    fontSize: "1.25rem",
                                                    fontWeight: "bold",
                                                    transition: "background-color 0.2s"
                                                }}
                                            >
                                                +
                                            </button>
                                        </div>

                                        {/* Volume Discount Badges */}
                                        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                                            <div style={{
                                                padding: "0.5rem 0.75rem",
                                                borderRadius: "0.375rem",
                                                border: "1px solid",
                                                fontSize: "0.875rem",
                                                fontWeight: "500",
                                                transition: "all 0.3s ease",
                                                backgroundColor: quantity >= 3 && quantity < 5 ? "#fffbeb" : "#f3f4f6",
                                                borderColor: quantity >= 3 && quantity < 5 ? "#fcd34d" : "#e5e7eb",
                                                color: quantity >= 3 && quantity < 5 ? "#92400e" : "#6b7280",
                                                boxShadow: quantity >= 3 && quantity < 5 ? "0 0 10px rgba(251, 191, 36, 0.2)" : "none",
                                                transform: quantity >= 3 && quantity < 5 ? "scale(1.05)" : "scale(1)",
                                            }}>
                                                Buy 3+ save 5% {quantity >= 3 ? "✓" : ""}
                                            </div>
                                            <div style={{
                                                padding: "0.5rem 0.75rem",
                                                borderRadius: "0.375rem",
                                                border: "1px solid",
                                                fontSize: "0.875rem",
                                                fontWeight: "500",
                                                transition: "all 0.3s ease",
                                                backgroundColor: quantity >= 5 ? "#ecfdf5" : "#f3f4f6",
                                                borderColor: quantity >= 5 ? "#34d399" : "#e5e7eb",
                                                color: quantity >= 5 ? "#065f46" : "#6b7280",
                                                boxShadow: quantity >= 5 ? "0 0 10px rgba(52, 211, 153, 0.2)" : "none",
                                                transform: quantity >= 5 ? "scale(1.05)" : "scale(1)",
                                            }}>
                                                Buy 5+ save 10% {quantity >= 5 ? "✓" : ""}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="wizard-layout__sidebar">
                            <PriceSummary
                                price={price}
                                loading={priceLoading}
                                productName={product.name}
                                loyaltyDiscount={pointsToRedeem * redemptionRate}
                            />
                        </div>
                    </div>
                )}

                {/* STEP 1: Review */}
                {currentStep === 1 && (
                    <div className="wizard-layout">
                        <div className="wizard-layout__main">
                            <div className="wizard-card">
                                <h2 className="wizard-card__title">
                                    Review Your Job
                                </h2>
                                <p className="wizard-card__subtitle">
                                    Check everything looks right before
                                    continuing.
                                </p>
                                <div className="review-summary">
                                    <div className="review-summary__service">
                                        <h3>{product.name}</h3>
                                        <span className="review-summary__category">
                                            {product.categoryName}
                                        </span>
                                    </div>
                                    <div className="review-summary__configs">
                                        {visibleSteps.map((step) => {
                                            const val = answers[step.fieldKey];
                                            if (val === undefined || val === "")
                                                return null;
                                            // Find label for select options
                                            let displayVal = String(val);
                                            if (step.fieldType === "select") {
                                                const opt = step.options.find(
                                                    (o) => o.value === val,
                                                );
                                                if (opt) displayVal = opt.label;
                                            } else if (
                                                step.fieldType === "boolean"
                                            ) {
                                                displayVal =
                                                    (
                                                        val === "true" ||
                                                        String(val) === "true"
                                                    ) ?
                                                        "Yes"
                                                    :   "No";
                                            } else if (step.unit) {
                                                displayVal = `${val} ${step.unit}`;
                                            }
                                            return (
                                                <div
                                                    key={step.id}
                                                    className="review-summary__item"
                                                >
                                                    <span className="review-summary__label">
                                                        {step.label}
                                                    </span>
                                                    <span className="review-summary__value">
                                                        {displayVal}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <button
                                        type="button"
                                        className="review-summary__edit"
                                        onClick={() => setCurrentStep(0)}
                                    >
                                        <svg
                                            width="14"
                                            height="14"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                        </svg>
                                        Edit Configuration
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="wizard-layout__sidebar">
                            <PriceSummary
                                price={price}
                                loading={priceLoading}
                                productName={product.name}
                                loyaltyDiscount={pointsToRedeem * redemptionRate}
                            />
                        </div>
                    </div>
                )}

                {/* STEP 2: Customer Details */}
                {currentStep === 2 && (
                    <div className="wizard-layout">
                        <div className="wizard-layout__main">
                            <div className="wizard-card">
                                <h2 className="wizard-card__title">
                                    Your Details
                                </h2>
                                <p className="wizard-card__subtitle">
                                    We&apos;ll use these details to confirm your
                                    booking and get in touch.
                                </p>
                                <CustomerForm
                                    data={customerData}
                                    onChange={setCustomerData}
                                    showErrors={showCustomerErrors}
                                />

                                {availablePoints > 0 && (
                                    <div className="loyalty-box" style={{
                                        backgroundColor: "#f0fdf4",
                                        borderColor: "#bbf7d0",
                                        borderWidth: "1px",
                                        borderRadius: "0.375rem",
                                        padding: "1.25rem",
                                        marginTop: "1.5rem",
                                        fontSize: "0.875rem",
                                        color: "#166534"
                                    }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: "#15803d" }}>
                                                <circle cx="12" cy="12" r="10"/>
                                                <path d="M12 8v8"/>
                                                <path d="M8 12h8"/>
                                            </svg>
                                            <strong style={{ fontSize: "0.95rem" }}>Loyalty Reward Points Available!</strong>
                                        </div>
                                        <p style={{ margin: "0 0 1rem 0", color: "#166534" }}>
                                            You have <strong>{availablePoints}</strong> loyalty points (£{(availablePoints * redemptionRate).toFixed(2)} value).
                                            Enter the points you want to redeem for a discount:
                                        </p>
                                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                            <input
                                                type="number"
                                                min="0"
                                                max={availablePoints}
                                                value={pointsToRedeem || ""}
                                                onChange={(e) => {
                                                    const val = Math.min(availablePoints, Math.max(0, parseInt(e.target.value) || 0));
                                                    setPointsToRedeem(val);
                                                }}
                                                className="form-group__input"
                                                style={{ width: "120px", height: "38px", padding: "0.5rem", borderColor: "#86efac", borderRadius: "0.375rem" }}
                                                placeholder="Points"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setPointsToRedeem(availablePoints)}
                                                className="btn btn--secondary btn--sm"
                                                style={{ height: "38px", border: "1px solid #86efac", color: "#166534", backgroundColor: "#fff" }}
                                            >
                                                Redeem All
                                            </button>
                                            {pointsToRedeem > 0 && (
                                                <span style={{ fontWeight: "600", color: "#15803d" }}>
                                                    −£{(pointsToRedeem * redemptionRate).toFixed(2)} discount applied!
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="wizard-layout__sidebar">
                            <PriceSummary
                                price={price}
                                loading={priceLoading}
                                productName={product.name}
                                loyaltyDiscount={pointsToRedeem * redemptionRate}
                            />
                        </div>
                    </div>
                )}

                {/* STEP 3: Confirmation */}
                {currentStep === 3 && bookingResult && (
                    <BookingConfirmation booking={bookingResult.booking} />
                )}
            </div>

            {/* Error */}
            {error && (
                <div
                    className="wizard-error"
                    role="alert"
                >
                    <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                        <circle
                            cx="12"
                            cy="12"
                            r="10"
                        />
                        <line
                            x1="15"
                            y1="9"
                            x2="9"
                            y2="15"
                        />
                        <line
                            x1="9"
                            y1="9"
                            x2="15"
                            y2="15"
                        />
                    </svg>
                    {error}
                </div>
            )}

            {/* Navigation */}
            {currentStep < 3 && (
                <div className="wizard-nav">
                    {currentStep > 0 && (
                        <button
                            type="button"
                            className="btn btn--secondary btn--lg"
                            onClick={prevStep}
                        >
                            <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <line
                                    x1="19"
                                    y1="12"
                                    x2="5"
                                    y2="12"
                                />
                                <polyline points="12 19 5 12 12 5" />
                            </svg>
                            Back
                        </button>
                    )}
                    <button
                        type="button"
                        className="btn btn--primary btn--lg"
                        onClick={nextStep}
                        disabled={!canProceed() || submitting}
                    >
                        {submitting ?
                            "Submitting..."
                        : currentStep === 2 ?
                            `Confirm Booking${price ? ` — £${price.total.toFixed(2)}` : ""}`
                        :   "Continue"}
                        {!submitting && currentStep < 2 && (
                            <ArrowRightIcon size={16} />
                        )}
                    </button>
                </div>
            )}
        </div>
    );
};

export default BookingWizard;
