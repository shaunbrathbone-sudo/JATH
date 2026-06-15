import prisma from "@/lib/prisma";
import PricingVariableEditor from "@/components/admin/PricingVariableEditor";

export default async function AdminPricingPage() {
    const variables = await prisma.pricingVariable.findMany({
        orderBy: { category: "asc" },
    });

    const serialized = variables.map((v) => ({
        id: String(v.id),
        key: v.key,
        label: v.label,
        value: v.value,
        unit: v.unit,
        category: v.category,
        description: v.description,
    }));

    return (
        <div className="admin-page">
            <div className="admin-page__header">
                <h1 className="admin-page__title">Pricing Variables</h1>
                <p className="admin-page__subtitle">
                    Global pricing variables that affect all service
                    calculations
                </p>
            </div>

            <PricingVariableEditor variables={serialized} />
        </div>
    );
}
