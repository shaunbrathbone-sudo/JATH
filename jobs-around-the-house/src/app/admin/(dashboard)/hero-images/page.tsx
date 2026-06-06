import prisma from "@/lib/prisma";
import HeroImageManager from "@/components/admin/HeroImageManager";

export default async function AdminHeroImagesPage() {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      imageUrl: true,
      heroImages: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          imageUrl: true,
          filename: true,
          isActive: true,
          createdAt: true,
        },
      },
    },
  });

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <h1 className="admin-page__title">Hero Carousel</h1>
        <p className="admin-page__subtitle">
          Manage the background images that cycle on the homepage hero section. Upload multiple images per category and select which one is active.
        </p>
      </div>

      <HeroImageManager categories={categories} />
    </div>
  );
}
