import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/auth/auth";
import AdminShell from "@/components/admin/AdminShell";
import "./admin.css";

export const metadata: Metadata = {
    title: {
        default: "Admin Dashboard",
        template: "%s | Admin — Jobs Around The House",
    },
    robots: { index: false, follow: false },
};

type AdminLayoutProps = {
    children: React.ReactNode;
};

const AdminLayout = async ({ children }: AdminLayoutProps) => {
    const session = await verifySession();

    if (!session.authenticated || !session.admin) {
        redirect("/admin/login");
    }

    return <AdminShell admin={session.admin}>{children}</AdminShell>;
};

export default AdminLayout;
