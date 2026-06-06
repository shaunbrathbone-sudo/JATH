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
};

const WIZARD_STEPS = ["Configure", "Review", "Your Details", "Confirm"];

const BookingWizard = ({ product, workflow }: BookingWizardProps) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string | number>>({});
    const [price, setPrice] = useState<PriceBreakdown | null>(null);
    const [priceLoading, setPriceLoading] = useState(false);
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

    // Filter visible steps based on showIf conditions
    const visibleSteps = workflow.steps.filter((step) => {
        if (!step.showIf) return true;
        try {
            const cond = JSON.parse(step.showIf);
            return String(answers[cond.field]) === String(cond.value);
        } catch {
            return true;
        }
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
            });
            setPrice(res.data);
        } catch {
            // Silently fail — price just won't update
        } finally {
            setPriceLoading(false);
        }
    }, [answers, product.slug]);

    useEffect(() => {
        const timer = setTimeout(fetchPrice, 300); // Debounce
        return () => clearTimeout(timer);
    }, [fetchPrice]);

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
        return (
            customerData.firstName.trim() !== "" &&
            customerData.lastName.trim() !== "" &&
            customerData.email.trim() !== "" &&
            customerData.email.includes("@")
        );
    };

    const handleSubmitBooking = async () => {
        if (!price) return;
        setSubmitting(true);
        setError(null);

        try {
            const res = await api.post("/bookings", {
                customer: {
                    email: customerData.email,
                    firstName: customerData.firstName,
                    lastName: customerData.lastName,
                    phone: customerData.phone || undefined,
                    addressLine1: customerData.addressLine1 || undefined,
                    addressLine2: customerData.addressLine2 || undefined,
                    city: customerData.city || undefined,
                    postcode: customerData.postcode || undefined,
                },
                items: [
                    {
                        productId: product.id,
                        calculatedPrice: price.subtotal,
                        wasteCost: price.wasteCost,
                        quantity: 1,
                        itemLabel: product.name,
                        configs: Object.entries(answers).map(
                            ([fieldKey, value]) => ({
                                fieldKey,
                                value: String(value),
                            }),
                        ),
                    },
                ],
                preferredDate: customerData.preferredDate || undefined,
                preferredTime: customerData.preferredTime || undefined,
                notes: customerData.notes || undefined,
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
        switch (currentStep) {
            case 0:
                return isConfigValid() && price !== null && price.total > 0;
            case 1:
                return true;
            case 2:
                return isCustomerValid();
            default:
                return false;
        }
    };

    const nextStep = () => {
        if (currentStep === 2) {
            handleSubmitBooking();
        } else {
            setCurrentStep((s) => Math.min(s + 1, 3));
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    const prevStep = () => {
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
                                <p className="wizard-card__subtitle">
                                    Tell us the details and we&apos;ll calculate
                                    your price instantly.
                                </p>
                                <div className="wizard-steps">
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
                            </div>
                        </div>
                        <div className="wizard-layout__sidebar">
                            <PriceSummary
                                price={price}
                                loading={priceLoading}
                                productName={product.name}
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
                                />
                            </div>
                        </div>
                        <div className="wizard-layout__sidebar">
                            <PriceSummary
                                price={price}
                                loading={priceLoading}
                                productName={product.name}
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
