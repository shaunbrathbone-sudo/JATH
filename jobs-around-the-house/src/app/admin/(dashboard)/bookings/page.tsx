import prisma from "@/lib/prisma";
import Link from "next/link";

const statusColors: Record<string, string> = {
    pending: "#f59e0b",
    confirmed: "#3b82f6",
    in_progress: "#8b5cf6",
    completed: "#10b981",
    cancelled: "#ef4444",
};

export default async function AdminBookingsPage() {
    const bookings = await prisma.booking.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            customer: {
                select: {
                    firstName: true,
                    lastName: true,
                    email: true,
                    phone: true,
                },
            },
            items: {
                include: {
                    product: { select: { title: true } },
                },
            },
        },
    });

    return (
        <div className="admin-page">
            <div className="admin-page__header">
                <h1 className="admin-page__title">Bookings</h1>
                <p className="admin-page__subtitle">
                    {bookings.length} total bookings
                </p>
            </div>

            {bookings.length === 0 ?
                <div className="admin-empty">
                    <svg
                        width="48"
                        height="48"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{
                            color: "var(--color-gray-300)",
                            marginBottom: "var(--space-4)",
                        }}
                    >
                        <rect
                            x="3"
                            y="4"
                            width="18"
                            height="18"
                            rx="2"
                            ry="2"
                        />
                        <line
                            x1="16"
                            y1="2"
                            x2="16"
                            y2="6"
                        />
                        <line
                            x1="8"
                            y1="2"
                            x2="8"
                            y2="6"
                        />
                        <line
                            x1="3"
                            y1="10"
                            x2="21"
                            y2="10"
                        />
                    </svg>
                    <p>
                        No bookings yet. They will appear here as customers book
                        services.
                    </p>
                </div>
            :   <div className="admin-table-wrap">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Reference</th>
                                <th>Customer</th>
                                <th>Service</th>
                                <th>Total</th>
                                <th>Payment</th>
                                <th>Status</th>
                                <th>Date</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.map((booking) => (
                                <tr key={booking.id}>
                                    <td>
                                        <code className="admin-ref">
                                            INV-{booking.id.toString().padStart(6, "0")}
                                        </code>
                                    </td>
                                    <td>
                                        <div className="admin-customer">
                                            <span className="admin-customer__name">
                                                {booking.customer.firstName}{" "}
                                                {booking.customer.lastName}
                                            </span>
                                            <span className="admin-customer__email">
                                                {booking.customer.email}
                                            </span>
                                        </div>
                                    </td>
                                    <td>
                                        {booking.items
                                            .map((item) => item.product?.title || "Service Item")
                                            .join(", ")}
                                    </td>
                                    <td className="admin-amount">
                                        £{booking.total.toFixed(2)}
                                    </td>
                                    <td>
                                        <span
                                            className="admin-badge"
                                            style={{
                                                background:
                                                    (
                                                        booking.paymentStatus ===
                                                        "paid"
                                                    ) ?
                                                        "#10b98115"
                                                    :   "#f59e0b15",
                                                color:
                                                    (
                                                        booking.paymentStatus ===
                                                        "paid"
                                                    ) ?
                                                        "#10b981"
                                                    :   "#f59e0b",
                                            }}
                                        >
                                            {booking.paymentStatus}
                                        </span>
                                    </td>
                                    <td>
                                        <span
                                            className="admin-badge"
                                            style={{
                                                background: `${statusColors[booking.status] || "#6b7685"}15`,
                                                color:
                                                    statusColors[
                                                        booking.status
                                                    ] || "#6b7685",
                                            }}
                                        >
                                            {booking.status.replace("_", " ")}
                                        </span>
                                    </td>
                                    <td className="admin-date">
                                        {booking.createdAt.toLocaleDateString(
                                            "en-GB",
                                            {
                                                day: "numeric",
                                                month: "short",
                                            },
                                        )}
                                    </td>
                                    <td>
                                        <Link
                                            href={`/admin/bookings/${booking.id}`}
                                            className="admin-action-link"
                                        >
                                            View
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            }
        </div>
    );
}
