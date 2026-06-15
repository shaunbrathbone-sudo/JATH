import prisma from "@/lib/prisma";
import ServiceGroupManager from "@/components/admin/ServiceGroupManager";

export default async function AdminServiceGroupsPage() {
    // Fetch top-level categories (groups) with child categories (categories)
    const categoriesDb = await prisma.category.findMany({
        where: { parentId: null },
        orderBy: { sortOrder: "asc" },
        include: {
            children: {
                orderBy: { sortOrder: "asc" },
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    description: true,
                    isActive: true,
                    sortOrder: true,
                    _count: { select: { products: true } },
                },
            },
        },
    });

    const groups = categoriesDb.map((g) => ({
        id: String(g.id),
        name: g.name,
        slug: g.slug,
        description: g.description,
        icon: g.slug === "garden-buildings" ? "tree" : "home",
        isActive: g.isActive,
        sortOrder: g.sortOrder,
        categories: g.children.map((c) => ({
            id: String(c.id),
            name: c.name,
            slug: c.slug,
            description: c.description,
            isActive: c.isActive,
            sortOrder: c.sortOrder,
            _count: c._count,
        })),
    }));

    return (
        <div className="admin-page">
            <div className="admin-page__header">
                <h1 className="admin-page__title">
                    Service Groups & Categories
                </h1>
                <p className="admin-page__subtitle">
                    Manage your top-level service groups and the categories
                    within them. Add new groups or categories, reorganise, and
                    control what&apos;s visible on the website.
                </p>
            </div>

            <ServiceGroupManager
                groups={groups}
                ungrouped={[]}
            />
        </div>
    );
}
