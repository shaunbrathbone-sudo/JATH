"use client";

import React from "react";
import type { PriceBreakdown } from "@/lib/utils/pricing";
import { CreditCardIcon } from "@/components/ui/Icons";

type PriceSummaryProps = {
    price: PriceBreakdown | null;
    loading: boolean;
    productName: string;
    loyaltyDiscount?: number;
};

const PriceSummary = ({ price, loading, productName, loyaltyDiscount = 0 }: PriceSummaryProps) => {
    const adjustedTotal = price ? Math.max(0, price.total - loyaltyDiscount) : 0;
    const adjustedDeposit = price ? Math.ceil(adjustedTotal * 0.5 * 100) / 100 : 0;
    const adjustedRemaining = price ? Math.round((adjustedTotal - adjustedDeposit) * 100) / 100 : 0;

    return (
        <div
            className="price-summary"
            aria-live="polite"
            aria-label="Price summary"
        >
            <div className="price-summary__header">
                <span style={{ fontSize: "1.25rem", fontWeight: 700 }}>£</span>
                <h3>Price Summary</h3>
            </div>

            {!price && !loading && (
                <div className="price-summary__empty">
                    <p>Complete the form to see your price</p>
                </div>
            )}

            {loading && (
                <div className="price-summary__loading">
                    <div className="price-summary__spinner" />
                    <p>Calculating...</p>
                </div>
            )}

            {price && !loading && (
                <>
                    <div className="price-summary__product">
                        <span>{productName}</span>
                    </div>

                    <div className="price-summary__lines">
                        {price.modifiers
                            .filter((m) => m.type === "add")
                            .map((mod, i) => (
                                <div
                                    key={i}
                                    className="price-summary__line"
                                >
                                    <span>{mod.label}</span>
                                    <span>£{mod.amount.toFixed(2)}</span>
                                </div>
                            ))}

                        {price.modifiers.some((m) => m.type === "multiply") && (
                            <>
                                {price.modifiers
                                    .filter((m) => m.type === "multiply")
                                    .map((mod, i) => (
                                        <div
                                            key={`m-${i}`}
                                            className="price-summary__line price-summary__line--modifier"
                                        >
                                            <span>{mod.label}</span>
                                            <span>
                                                ×{mod.amount.toFixed(2)}
                                            </span>
                                        </div>
                                    ))}
                            </>
                        )}

                        {price.wasteCost > 0 && (
                            <div className="price-summary__line">
                                <span>Waste Disposal</span>
                                <span>£{price.wasteCost.toFixed(2)}</span>
                            </div>
                        )}

                        {loyaltyDiscount > 0 && (
                            <div className="price-summary__line" style={{ color: "#16a34a", fontWeight: "600" }}>
                                <span>Loyalty Points Discount</span>
                                <span>−£{loyaltyDiscount.toFixed(2)}</span>
                            </div>
                        )}
                    </div>

                    <div className="price-summary__total">
                        <div className="price-summary__total-row">
                            <span>Total</span>
                            <span className="price-summary__total-amount">
                                £{adjustedTotal.toFixed(2)}
                            </span>
                        </div>
                    </div>

                    <div className="price-summary__deposit">
                        <div className="price-summary__deposit-row">
                            <span>
                                <CreditCardIcon
                                    size={14}
                                    className="inline mr-1"
                                />
                                50% Deposit to Book
                            </span>
                            <span className="price-summary__deposit-amount">
                                £{adjustedDeposit.toFixed(2)}
                            </span>
                        </div>
                        <p className="price-summary__deposit-note">
                            Remaining £
                            {adjustedRemaining.toFixed(2)} on
                            completion
                        </p>
                    </div>
                </>
            )}
        </div>
    );
};

export default PriceSummary;
