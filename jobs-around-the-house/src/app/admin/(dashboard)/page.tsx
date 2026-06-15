import prisma from "@/lib/prisma";
import Link from "next/link";

export default async function AdminDashboardPage() {
    // Fetch stats
    const [totalBookings, pendingBookings, totalCustomers, activeServices, loyaltyLiabilitySum, redemptionVar] =
        await Promise.all([
            prisma.booking.count(),
            prisma.booking.count({ where: { status: "pending" } }),
            prisma.customer.count(),
            prisma.product.count({ where: { isActive: true } }),
            prisma.customer.aggregate({
                _sum: { loyaltyPoints: true },
            }),
            prisma.pricingVariable.findUnique({
                where: { key: "loyalty_redemption_rate" },
            }),
        ]);

    const loyaltyRedemptionRate = redemptionVar?.value ?? 0.01;
    const totalOutstandingPoints = loyaltyLiabilitySum._sum.loyaltyPoints ?? 0;
    const outstandingPointsLiabilityVal = totalOutstandingPoints * loyaltyRedemptionRate;

    // Revenue/GMV/AOV/Processing Volume calculations
    const allBookings = await prisma.booking.findMany({
        select: { total: true, depositAmount: true, createdAt: true },
    });
    const gmv = allBookings.reduce((sum, b) => sum + b.total, 0);
    const totalProcessingVolume = allBookings.reduce((sum, b) => sum + b.depositAmount, 0);
    const aov = allBookings.length ? gmv / allBookings.length : 0;

    // Recent bookings
    const recentBookings = await prisma.booking.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
            customer: {
                select: { firstName: true, lastName: true, email: true },
            },
            items: {
                include: {
                    product: { select: { title: true } },
                },
            },
        },
    });

    const statusColors: Record<string, string> = {
        pending: "#f59e0b",
        confirmed: "#3b82f6",
        in_progress: "#8b5cf6",
        completed: "#10b981",
        cancelled: "#ef4444",
    };

    return (
        <div className="admin-page">
            <div className="admin-page__header">
                <h1 className="admin-page__title">Dashboard</h1>
                <p className="admin-page__subtitle">
                    Overview of your business
                </p>
            </div>

            {/* Stats Grid */}
            <div className="admin-stats" style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "1.25rem",
                marginBottom: "2rem"
            }}>
                {/* GMV Card */}
                <div className="admin-stat">
                    <div
                        className="admin-stat__icon"
                        style={{
                            background: "rgba(16, 185, 129, 0.1)",
                            color: "#10b981",
                        }}
                    >
                        £
                    </div>
                    <div className="admin-stat__content">
                        <span className="admin-stat__value">
                            £{gmv.toFixed(2)}
                        </span>
                        <span className="admin-stat__label">
                            Gross Merchandise Value (GMV)
                        </span>
                    </div>
                </div>

                {/* Total Processing Volume Card */}
                <div className="admin-stat">
                    <div
                        className="admin-stat__icon"
                        style={{
                            background: "rgba(59, 130, 246, 0.1)",
                            color: "#3b82f6",
                        }}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="2" y="5" width="20" height="14" rx="2" ry="2"/>
                            <line x1="2" y1="10" x2="22" y2="10"/>
                        </svg>
                    </div>
                    <div className="admin-stat__content">
                        <span className="admin-stat__value">
                            £{totalProcessingVolume.toFixed(2)}
                        </span>
                        <span className="admin-stat__label">
                            Processing Volume (Deposits)
                        </span>
                    </div>
                </div>

                {/* AOV Card */}
                <div className="admin-stat">
                    <div
                        className="admin-stat__icon"
                        style={{
                            background: "rgba(139, 92, 246, 0.1)",
                            color: "#8b5cf6",
                        }}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="20" x2="18" y2="10"/>
                            <line x1="12" y1="20" x2="12" y2="4"/>
                            <line x1="6" y1="20" x2="6" y2="14"/>
                        </svg>
                    </div>
                    <div className="admin-stat__content">
                        <span className="admin-stat__value">
                            £{aov.toFixed(2)}
                        </span>
                        <span className="admin-stat__label">
                            Average Order Value (AOV)
                        </span>
                    </div>
                </div>

                {/* Loyalty Liability Card */}
                <div className="admin-stat">
                    <div
                        className="admin-stat__icon"
                        style={{
                            background: "rgba(245, 158, 11, 0.1)",
                            color: "#f59e0b",
                        }}
                    >
                        ★
                    </div>
                    <div className="admin-stat__content">
                        <span className="admin-stat__value" style={{ fontSize: "1.15rem", fontWeight: "700" }}>
                            £{outstandingPointsLiabilityVal.toFixed(2)}
                        </span>
                        <span className="admin-stat__label">
                            Loyalty Liability ({totalOutstandingPoints} pts)
                        </span>
                    </div>
                </div>

                {/* Bookings Count Card */}
                <div className="admin-stat">
                    <div
                        className="admin-stat__icon"
                        style={{
                            background: "rgba(0, 188, 212, 0.1)",
                            color: "#00bcd4",
                        }}
                    >
                        {totalBookings}
                    </div>
                    <div className="admin-stat__content">
                        <span className="admin-stat__value">
                            {totalBookings}
                        </span>
                        <span className="admin-stat__label">
                            Total Orders ({pendingBookings} pending)
                        </span>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="admin-quick-actions">
                <Link
                    href="/admin/bookings"
                    className="admin-quick-action"
                >
                    View All Bookings →
                </Link>
                <Link
                    href="/admin/services"
                    className="admin-quick-action"
                >
                    Manage Services ({activeServices}) →
                </Link>
                <Link
                    href="/admin/pricing"
                    className="admin-quick-action"
                >
                    Pricing Variables →
                </Link>
            </div>

            {/* Recent Bookings */}
            <div className="admin-section">
                <div className="admin-section__header">
                    <h2 className="admin-section__title">Recent Bookings</h2>
                    <Link
                        href="/admin/bookings"
                        className="admin-section__action"
                    >
                        View All
                    </Link>
                </div>

                {recentBookings.length === 0 ?
                    <div className="admin-empty">
                        <p>
                            No bookings yet. They will appear here as customers
                            book services.
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
                                    <th>Status</th>
                                    <th>Date</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentBookings.map((booking) => (
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
                                                .map(
                                                    (item) => item.product?.title || "Service Item",
                                                )
                                                .join(", ")}
                                        </td>
                                        <td className="admin-amount">
                                            £{booking.total.toFixed(2)}
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
                                                {booking.status.replace(
                                                    "_",
                                                    " ",
                                                )}
                                            </span>
                                        </td>
                                        <td className="admin-date">
                                            {booking.createdAt.toLocaleDateString(
                                                "en-GB",
                                                {
                                                    day: "numeric",
                                                    month: "short",
                                                    year: "numeric",
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
        </div>
    );
}
