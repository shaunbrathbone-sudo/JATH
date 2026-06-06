import prisma from "@/lib/prisma";
import Link from "next/link";
import BookingStatusUpdater from "@/components/admin/BookingStatusUpdater";

interface Props {
    params: Promise<{ id: string }>;
}

export default async function AdminBookingDetailPage({ params }: Props) {
    const { id } = await params;

    const booking = await prisma.booking.findUnique({
        where: { id },
        include: {
            customer: true,
            items: {
                include: {
                    product: { select: { name: true, slug: true } },
                    configs: true,
                },
            },
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
                        Booking {booking.id.slice(0, 8).toUpperCase()}
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
                            bookingId={booking.id}
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
                            >
                                <div className="admin-booking-item__header">
                                    <h3>{item.product.name}</h3>
                                    <span className="admin-amount">
                                        £{item.calculatedPrice.toFixed(2)}
                                    </span>
                                </div>
                                {item.configs.length > 0 && (
                                    <div className="admin-booking-item__configs">
                                        {item.configs.map((config) => (
                                            <div
                                                key={config.id}
                                                className="admin-config"
                                            >
                                                <span className="admin-config__key">
                                                    {config.fieldKey.replace(
                                                        /_/g,
                                                        " ",
                                                    )}
                                                </span>
                                                <span className="admin-config__value">
                                                    {config.fieldValue}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

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
