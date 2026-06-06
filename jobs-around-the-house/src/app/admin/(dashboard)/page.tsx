import prisma from "@/lib/prisma";
import Link from "next/link";

export default async function AdminDashboardPage() {
  // Fetch stats
  const [totalBookings, pendingBookings, totalCustomers, activeServices] =
    await Promise.all([
      prisma.booking.count(),
      prisma.booking.count({ where: { status: "pending" } }),
      prisma.customer.count(),
      prisma.product.count({ where: { isActive: true } }),
    ]);

  // Revenue calculation
  const allBookings = await prisma.booking.findMany({
    select: { total: true, createdAt: true },
  });
  const totalRevenue = allBookings.reduce((sum, b) => sum + b.total, 0);

  // Recent bookings
  const recentBookings = await prisma.booking.findMany({
    take: 10,
    orderBy: { createdAt: "desc" },
    include: {
      customer: { select: { firstName: true, lastName: true, email: true } },
      items: {
        include: {
          product: { select: { name: true } },
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
        <p className="admin-page__subtitle">Overview of your business</p>
      </div>

      {/* Stats Grid */}
      <div className="admin-stats">
        <div className="admin-stat">
          <div className="admin-stat__icon" style={{ background: "rgba(0, 188, 212, 0.1)", color: "#00bcd4" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <div className="admin-stat__content">
            <span className="admin-stat__value">{totalBookings}</span>
            <span className="admin-stat__label">Total Bookings</span>
          </div>
        </div>

        <div className="admin-stat">
          <div className="admin-stat__icon" style={{ background: "rgba(245, 158, 11, 0.1)", color: "#f59e0b" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div className="admin-stat__content">
            <span className="admin-stat__value">{pendingBookings}</span>
            <span className="admin-stat__label">Pending</span>
          </div>
        </div>

        <div className="admin-stat">
          <div className="admin-stat__icon" style={{ background: "rgba(16, 185, 129, 0.1)", color: "#10b981" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <div className="admin-stat__content">
            <span className="admin-stat__value">£{totalRevenue.toFixed(2)}</span>
            <span className="admin-stat__label">Total Revenue</span>
          </div>
        </div>

        <div className="admin-stat">
          <div className="admin-stat__icon" style={{ background: "rgba(59, 130, 246, 0.1)", color: "#3b82f6" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div className="admin-stat__content">
            <span className="admin-stat__value">{totalCustomers}</span>
            <span className="admin-stat__label">Customers</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="admin-quick-actions">
        <Link href="/admin/bookings" className="admin-quick-action">
          View All Bookings →
        </Link>
        <Link href="/admin/services" className="admin-quick-action">
          Manage Services ({activeServices}) →
        </Link>
        <Link href="/admin/pricing" className="admin-quick-action">
          Pricing Variables →
        </Link>
      </div>

      {/* Recent Bookings */}
      <div className="admin-section">
        <div className="admin-section__header">
          <h2 className="admin-section__title">Recent Bookings</h2>
          <Link href="/admin/bookings" className="admin-section__action">
            View All
          </Link>
        </div>

        {recentBookings.length === 0 ? (
          <div className="admin-empty">
            <p>No bookings yet. They will appear here as customers book services.</p>
          </div>
        ) : (
          <div className="admin-table-wrap">
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
                      <code className="admin-ref">{booking.id.slice(0, 8).toUpperCase()}</code>
                    </td>
                    <td>
                      <div className="admin-customer">
                        <span className="admin-customer__name">
                          {booking.customer.firstName} {booking.customer.lastName}
                        </span>
                        <span className="admin-customer__email">{booking.customer.email}</span>
                      </div>
                    </td>
                    <td>
                      {booking.items.map((item) => item.product.name).join(", ")}
                    </td>
                    <td className="admin-amount">£{booking.total.toFixed(2)}</td>
                    <td>
                      <span
                        className="admin-badge"
                        style={{
                          background: `${statusColors[booking.status] || "#6b7685"}15`,
                          color: statusColors[booking.status] || "#6b7685",
                        }}
                      >
                        {booking.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="admin-date">
                      {booking.createdAt.toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td>
                      <Link href={`/admin/bookings/${booking.id}`} className="admin-action-link">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
