import prisma from "@/lib/prisma";
import Link from "next/link";
import BookingStatusUpdater from "@/components/admin/BookingStatusUpdater";

interface Props {
    params: Promise<{ id: string }>;
}

export default async function AdminBookingDetailPage({ params }: Props) {
    const { id } = await params;

    const booking = await prisma.booking.findUnique({
        where: { id: parseInt(id) },
        include: {
            customer: true,
            items: {
                include: {
                    product: { select: { title: true, slug: true } },
                },
            },
            workflowResponses: {
                include: {
                    step: true
                }
            }
        },
    });

    if (!booking) {
        return (
            <div className="admin-page">
                <div className="admin-page__header">
                    <h1 className="admin-page__title">Booking Not Found</h1>
                </div>
                <Link
                    href="/admin/bookings"
                    className="btn btn--secondary"
                >
                    ← Back to Bookings
                </Link>
            </div>
        );
    }

    return (
        <div className="admin-page">
            <div className="admin-page__header">
                <div>
                    <Link
                        href="/admin/bookings"
                        className="admin-back-link"
                    >
                        ← Back to Bookings
                    </Link>
                    <h1 className="admin-page__title">
                        Booking INV-{booking.id.toString().padStart(6, "0")}
                    </h1>
                </div>
            </div>

            <div className="admin-detail-grid">
                {/* Left Column */}
                <div className="admin-detail-main">
                    {/* Status */}
                    <div className="admin-card">
                        <h2 className="admin-card__title">Status</h2>
                        <BookingStatusUpdater
                            bookingId={String(booking.id)}
                            currentStatus={booking.status}
                            currentPaymentStatus={booking.paymentStatus}
                        />
                    </div>

                    {/* Items */}
                    <div className="admin-card">
                        <h2 className="admin-card__title">Items</h2>
                        {booking.items.map((item) => (
                            <div
                                key={item.id}
                                className="admin-booking-item"
                                style={{ paddingBottom: "1rem", borderBottom: "1px solid #f1f5f9", marginBottom: "1rem" }}
                            >
                                <div className="admin-booking-item__header">
                                    <h3>{item.product?.title || "Service Item"}</h3>
                                    <span className="admin-amount">
                                        £{(item.grossUnitPrice * item.quantity).toFixed(2)}
                                    </span>
                                </div>
                                <div style={{ fontSize: "0.85rem", color: "#64748b", marginTop: "0.25rem", display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                                    <span>SKU: {item.sku}</span>
                                    <span>•</span>
                                    <span>Qty: {item.quantity}</span>
                                    <span>•</span>
                                    <span>Gross Unit: £{item.grossUnitPrice.toFixed(2)}</span>
                                    <span>•</span>
                                    <span>VAT Rate: {item.vatRateApplied.toFixed(1)}%</span>
                                    <span>•</span>
                                    <span>VAT Amount: £{item.vatAmountTotal.toFixed(2)}</span>
                                </div>
                                {item.legalWaiverInjected && (
                                    <div style={{ marginTop: "0.75rem", fontSize: "0.8rem", color: "#b91c1c", backgroundColor: "#fef2f2", padding: "0.5rem", borderRadius: "0.25rem", borderLeft: "3px solid #ef4444" }}>
                                        <strong>Liability Waiver Applied:</strong> {item.legalWaiverInjected}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Workflow Responses & Photo Downloads */}
                    {booking.workflowResponses && booking.workflowResponses.length > 0 && (
                        <div className="admin-card">
                            <h2 className="admin-card__title">Workflow & Step Answers</h2>
                            <div className="admin-detail-list">
                                {booking.workflowResponses.map((resp) => {
                                    const answer = resp.customerTextResponse || (resp.uploadedPhotoUrl ? "Photo Uploaded" : "No response");
                                    return (
                                        <div key={resp.id} className="admin-detail-list__item" style={{ flexDirection: "column", alignItems: "flex-start", gap: "0.25rem", padding: "0.75rem 0", borderBottom: "1px solid #f1f5f9" }}>
                                            <span className="admin-detail-list__label" style={{ fontWeight: "600", fontSize: "0.85rem", color: "#475569" }}>
                                                {resp.step.stepName}
                                            </span>
                                            {resp.uploadedPhotoUrl ? (
                                                <div style={{ marginTop: "0.5rem" }}>
                                                    <a
                                                        href={resp.uploadedPhotoUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "#1e3a8a", textDecoration: "underline", fontWeight: "500", fontSize: "0.85rem" }}
                                                    >
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                                            <polyline points="7 10 12 15 17 10"/>
                                                            <line x1="12" y1="15" x2="12" y2="3"/>
                                                        </svg>
                                                        Download Uploaded Photo
                                                    </a>
                                                    <div style={{ marginTop: "0.5rem" }}>
                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                        <img
                                                            src={resp.uploadedPhotoUrl}
                                                            alt={resp.step.stepName}
                                                            style={{ maxWidth: "240px", maxHeight: "180px", borderRadius: "0.375rem", border: "1px solid #cbd5e1" }}
                                                        />
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="admin-detail-list__value" style={{ fontSize: "0.95rem", color: "#1e293b" }}>
                                                    {answer}
                                                </span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Totals */}
                    <div className="admin-card">
                        <h2 className="admin-card__title">Price Breakdown</h2>
                        <div className="admin-totals">
                            <div className="admin-totals__row">
                                <span>Subtotal</span>
                                <span>£{booking.subtotal.toFixed(2)}</span>
                            </div>
                            {booking.wasteCost > 0 && (
                                <div className="admin-totals__row">
                                    <span>Waste Disposal</span>
                                    <span>£{booking.wasteCost.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="admin-totals__row admin-totals__row--total">
                                <span>Total</span>
                                <span>£{booking.total.toFixed(2)}</span>
                            </div>
                            <div className="admin-totals__row admin-totals__row--deposit">
                                <span>Deposit Amount</span>
                                <span>£{booking.depositAmount.toFixed(2)}</span>
                            </div>
                            <div className="admin-totals__row">
                                <span>Remaining</span>
                                <span>
                                    £{booking.remainingAmount.toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    {booking.customerNotes && (
                        <div className="admin-card">
                            <h2 className="admin-card__title">
                                Customer Notes
                            </h2>
                            <p className="admin-notes">
                                {booking.customerNotes}
                            </p>
                        </div>
                    )}
                </div>

                {/* Right Column - Customer Info */}
                <div className="admin-detail-sidebar">
                    <div className="admin-card">
                        <h2 className="admin-card__title">Customer</h2>
                        <div className="admin-detail-list">
                            <div className="admin-detail-list__item">
                                <span className="admin-detail-list__label">
                                    Name
                                </span>
                                <span className="admin-detail-list__value">
                                    {booking.customer.firstName}{" "}
                                    {booking.customer.lastName}
                                </span>
                            </div>
                            <div className="admin-detail-list__item">
                                <span className="admin-detail-list__label">
                                    Email
                                </span>
                                <a
                                    href={`mailto:${booking.customer.email}`}
                                    className="admin-detail-list__value admin-detail-list__link"
                                >
                                    {booking.customer.email}
                                </a>
                            </div>
                            {booking.customer.phone && (
                                <div className="admin-detail-list__item">
                                    <span className="admin-detail-list__label">
                                        Phone
                                    </span>
                                    <a
                                        href={`tel:${booking.customer.phone}`}
                                        className="admin-detail-list__value admin-detail-list__link"
                                    >
                                        {booking.customer.phone}
                                    </a>
                                </div>
                            )}
                            {booking.customer.addressLine1 && (
                                <div className="admin-detail-list__item">
                                    <span className="admin-detail-list__label">
                                        Address
                                    </span>
                                    <span className="admin-detail-list__value">
                                        {booking.customer.addressLine1}
                                        {booking.customer.addressLine2 && (
                                            <br />
                                        )}
                                        {booking.customer.addressLine2}
                                        {booking.customer.city && (
                                            <>
                                                <br />
                                                {booking.customer.city}
                                            </>
                                        )}
                                        {booking.customer.postcode && (
                                            <>
                                                <br />
                                                {booking.customer.postcode}
                                            </>
                                        )}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="admin-card">
                        <h2 className="admin-card__title">Schedule</h2>
                        <div className="admin-detail-list">
                            <div className="admin-detail-list__item">
                                <span className="admin-detail-list__label">
                                    Preferred Date
                                </span>
                                <span className="admin-detail-list__value">
                                    {booking.preferredDate ?
                                        booking.preferredDate.toLocaleDateString(
                                            "en-GB",
                                            {
                                                weekday: "long",
                                                day: "numeric",
                                                month: "long",
                                                year: "numeric",
                                            },
                                        )
                                    :   "No preference"}
                                </span>
                            </div>
                            <div className="admin-detail-list__item">
                                <span className="admin-detail-list__label">
                                    Preferred Time
                                </span>
                                <span className="admin-detail-list__value">
                                    {booking.preferredTime || "No preference"}
                                </span>
                            </div>
                            <div className="admin-detail-list__item">
                                <span className="admin-detail-list__label">
                                    Booked
                                </span>
                                <span className="admin-detail-list__value">
                                    {booking.createdAt.toLocaleDateString(
                                        "en-GB",
                                        {
                                            day: "numeric",
                                            month: "long",
                                            year: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        },
                                    )}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
