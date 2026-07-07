"use client";

import React from "react";
import Link from "next/link";
import type { BookingResult } from "@/lib/types/booking";
import { CheckCircleIcon, MailIcon, ClockIcon } from "@/components/ui/Icons";

type BookingConfirmationProps = {
    booking: BookingResult["booking"];
};

const BookingConfirmation = ({ booking }: BookingConfirmationProps) => {
    return (
        <div className="confirmation">
            <div className="confirmation__icon">
                <CheckCircleIcon size={48} />
            </div>

            <h2 className="confirmation__title">Booking Confirmed!</h2>
            <p className="confirmation__subtitle">
                Thank you, {booking.customer.name}. Your booking has been
                submitted successfully.
            </p>

            <div className="confirmation__card">
                <div className="confirmation__card-header">
                    <span className="confirmation__label">
                        Booking Reference
                    </span>
                    <span className="confirmation__ref">
                        INV-{String(booking.id).padStart(6, "0")}
                    </span>
                </div>

                <div className="confirmation__details">
                    {booking.items.map((item, i) => (
                        <div
                            key={i}
                            className="confirmation__item"
                        >
                            <span>{item.name}</span>
                            <span>£{item.price.toFixed(2)}</span>
                        </div>
                    ))}
                </div>

                <div className="confirmation__totals">
                    <div className="confirmation__total-row">
                        <span>Total</span>
                        <span className="confirmation__total">
                            £{booking.total.toFixed(2)}
                        </span>
                    </div>
                    <div className="confirmation__total-row confirmation__total-row--deposit">
                        <span>50% Deposit Due</span>
                        <span>£{booking.depositAmount.toFixed(2)}</span>
                    </div>
                    <div className="confirmation__total-row">
                        <span>Remaining on Completion</span>
                        <span>£{booking.remainingAmount.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            <div className="confirmation__info">
                <div className="confirmation__info-item">
                    <MailIcon size={18} />
                    <span>
                        A confirmation email has been sent to{" "}
                        <strong>{booking.customer.email}</strong>
                    </span>
                </div>
                <div className="confirmation__info-item">
                    <ClockIcon size={18} />
                    <span>
                        We&apos;ll be in touch within 24 hours to confirm your
                        date and arrange payment.
                    </span>
                </div>
            </div>

            <div className="confirmation__actions">
                <Link
                    href="/services"
                    className="btn btn--primary btn--lg"
                >
                    Book Another Service
                </Link>
                <Link
                    href="/"
                    className="btn btn--secondary btn--lg"
                >
                    Back to Home
                </Link>
            </div>
        </div>
    );
};

export default BookingConfirmation;
