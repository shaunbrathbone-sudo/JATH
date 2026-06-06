"use client";

import Link from "next/link";

interface BookingData {
  id: string;
  total: number;
  depositAmount: number;
  remainingAmount: number;
  customer: { name: string; email: string };
  items: { name: string; price: number; quantity: number }[];
}

interface Props {
  booking: BookingData;
}

export default function BookingConfirmation({ booking }: Props) {
  return (
    <div className="confirmation">
      <div className="confirmation__icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      </div>

      <h2 className="confirmation__title">Booking Confirmed!</h2>
      <p className="confirmation__subtitle">
        Thank you, {booking.customer.name}. Your booking has been submitted successfully.
      </p>

      <div className="confirmation__card">
        <div className="confirmation__card-header">
          <span className="confirmation__label">Booking Reference</span>
          <span className="confirmation__ref">{booking.id.slice(0, 8).toUpperCase()}</span>
        </div>

        <div className="confirmation__details">
          {booking.items.map((item, i) => (
            <div key={i} className="confirmation__item">
              <span>{item.name}</span>
              <span>£{item.price.toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div className="confirmation__totals">
          <div className="confirmation__total-row">
            <span>Total</span>
            <span className="confirmation__total">£{booking.total.toFixed(2)}</span>
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
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
          <span>A confirmation email has been sent to <strong>{booking.customer.email}</strong></span>
        </div>
        <div className="confirmation__info-item">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span>We&apos;ll be in touch within 24 hours to confirm your date and arrange payment.</span>
        </div>
      </div>

      <div className="confirmation__actions">
        <Link href="/services" className="btn btn--primary btn--lg">
          Book Another Service
        </Link>
        <Link href="/" className="btn btn--secondary btn--lg">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
