import prisma from "@/lib/prisma";
import ServiceGroupManager from "@/components/admin/ServiceGroupManager";

export default async function AdminServiceGroupsPage() {
  const groups = await prisma.serviceGroup.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      categories: {
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

  // Also get ungrouped categories
  const ungrouped = await prisma.category.findMany({
    where: { groupId: null },
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
  });

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <h1 className="admin-page__title">Service Groups & Categories</h1>
        <p className="admin-page__subtitle">
          Manage your top-level service groups and the categories within them. Add new groups or categories, reorganise, and control what&apos;s visible on the website.
        </p>
      </div>

      <ServiceGroupManager groups={groups} ungrouped={ungrouped} />
    </div>
  );
}
