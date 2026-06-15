import prisma from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import WorkflowManager from "@/components/admin/WorkflowManager";

interface Props {
    params: Promise<{ id: string }>;
}

export default async function AdminWorkflowPage({ params }: Props) {
    const { id } = await params;
    const parsedId = parseInt(id) || 0;

    const product = await prisma.product.findUnique({
        where: { id: parsedId },
        include: {
            workflowSteps: {
                orderBy: { sortOrder: "asc" },
                include: {
                    options: {
                        orderBy: { sortOrder: "asc" },
                    },
                },
            },
        },
    });

    if (!product) {
        notFound();
    }

    // Fetch all products to link options to
    const allProducts = await prisma.product.findMany({
        orderBy: { title: "asc" },
        select: {
            id: true,
            title: true,
            sku: true,
            basePrice: true,
        },
    });

    return (
        <div className="admin-page">
            <div className="admin-page__header">
                <div style={{ marginBottom: "1rem" }}>
                    <Link
                        href="/admin/services"
                        className="btn btn--ghost btn--sm"
                    >
                        &larr; Back to Services
                    </Link>
                </div>
                <h1 className="admin-page__title">Edit Service Details</h1>
                <p className="admin-page__subtitle">
                    Modify the interactive steps, branching options, pricing modifiers, and custom inputs for {product.title}.
                </p>
                <div style={{ display: "flex", gap: "1.5rem", borderBottom: "1px solid var(--color-gray-200)", marginTop: "1.5rem", marginBottom: "1.5rem" }}>
                    <Link
                        href={`/admin/services/${product.id}`}
                        style={{
                            fontWeight: "500",
                            paddingBottom: "0.75rem",
                            color: "var(--color-gray-600)",
                        }}
                    >
                        Details
                    </Link>
                    <Link
                        href={`/admin/services/${product.id}/workflow`}
                        style={{
                            fontWeight: "600",
                            borderBottom: "2px solid var(--color-teal-600)",
                            paddingBottom: "0.75rem",
                            color: "var(--color-teal-700)",
                        }}
                    >
                        Workflow Steps
                    </Link>
                    <Link
                        href={`/admin/services/${product.id}/images`}
                        style={{
                            fontWeight: "500",
                            paddingBottom: "0.75rem",
                            color: "var(--color-gray-600)",
                        }}
                    >
                        Images
                    </Link>
                </div>
            </div>

            <WorkflowManager product={product} allProducts={allProducts} />
        </div>
    );
}
