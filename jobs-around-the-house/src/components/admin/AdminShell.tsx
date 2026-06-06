"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutGrid,
    Calendar,
    Wrench,
    DollarSign,
    Folder,
    Image as ImageIcon,
} from "lucide-react";

type AdminShellProps = {
    admin: { name: string; email: string };
    children: React.ReactNode;
};

const navItems = [
    {
        label: "Dashboard",
        href: "/admin",
        icon: <LayoutGrid size={20} />,
    },
    {
        label: "Bookings",
        href: "/admin/bookings",
        icon: <Calendar size={20} />,
    },
    {
        label: "Services",
        href: "/admin/services",
        icon: <Wrench size={20} />,
    },
    {
        label: "Pricing",
        href: "/admin/pricing",
        icon: <DollarSign size={20} />,
    },
    {
        label: "Service Groups",
        href: "/admin/service-groups",
        icon: <Folder size={20} />,
    },
    {
        label: "Hero Images",
        href: "/admin/hero-images",
        icon: <ImageIcon size={20} />,
    },
];

const AdminShell = ({ admin, children }: AdminShellProps) => {
    const pathname = usePathname();
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = async () => {
        await fetch("/api/admin/logout", { method: "POST" });
        router.push("/admin/login");
        router.refresh();
    };

    const isActive = (href: string) => {
        if (href === "/admin") return pathname === "/admin";
        return pathname.startsWith(href);
    };

    return (
        <div className="admin">
            {/* Sidebar */}
            <aside
                className={`admin-sidebar ${sidebarOpen ? "admin-sidebar--open" : ""}`}
            >
                <div className="admin-sidebar__header">
                    <Link
                        href="/admin"
                        className="admin-sidebar__brand"
                    >
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                            <polyline points="9 22 9 12 15 12 15 22" />
                        </svg>
                        <span>JATH Admin</span>
                    </Link>
                </div>

                <nav className="admin-sidebar__nav">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`admin-sidebar__link ${isActive(item.href) ? "admin-sidebar__link--active" : ""}`}
                            onClick={() => setSidebarOpen(false)}
                        >
                            {item.icon}
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className="admin-sidebar__footer">
                    <Link
                        href="/"
                        className="admin-sidebar__link"
                        target="_blank"
                    >
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                            <polyline points="15 3 21 3 21 9" />
                            <line
                                x1="10"
                                y1="14"
                                x2="21"
                                y2="3"
                            />
                        </svg>
                        <span>View Site</span>
                    </Link>
                </div>
            </aside>

            {/* Main Area */}
            <div className="admin-main">
                <header className="admin-topbar">
                    <button
                        className="admin-topbar__menu"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        aria-label="Toggle sidebar"
                    >
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                        >
                            <line
                                x1="3"
                                y1="6"
                                x2="21"
                                y2="6"
                            />
                            <line
                                x1="3"
                                y1="12"
                                x2="21"
                                y2="12"
                            />
                            <line
                                x1="3"
                                y1="18"
                                x2="21"
                                y2="18"
                            />
                        </svg>
                    </button>

                    <div className="admin-topbar__spacer" />

                    <div className="admin-topbar__user">
                        <span className="admin-topbar__name">{admin.name}</span>
                        <button
                            onClick={handleLogout}
                            className="admin-topbar__logout"
                        >
                            Sign Out
                        </button>
                    </div>
                </header>

                <main className="admin-content">{children}</main>
            </div>

            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="admin-overlay"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </div>
    );
};

export default AdminShell;
