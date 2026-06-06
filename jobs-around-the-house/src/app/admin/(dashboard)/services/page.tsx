import prisma from "@/lib/prisma";
import Link from "next/link";

export default async function AdminServicesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      products: {
        orderBy: { sortOrder: "asc" },
        include: {
          _count: {
            select: { workflows: true },
          },
        },
      },
    },
  });

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <h1 className="admin-page__title">Services</h1>
        <p className="admin-page__subtitle">Manage your service categories and products</p>
      </div>

      <div className="admin-services-grid">
        {categories.map((cat) => (
          <div key={cat.id} className="admin-card">
            <div className="admin-card__header-row">
              <h2 className="admin-card__title">{cat.name}</h2>
              <span
                className="admin-badge"
                style={{
                  background: cat.isActive ? "#10b98115" : "#ef444415",
                  color: cat.isActive ? "#10b981" : "#ef4444",
                }}
              >
                {cat.isActive ? "Active" : "Inactive"}
              </span>
            </div>
            <p className="admin-card__desc">{cat.description}</p>

            <div className="admin-products-list">
              {cat.products.map((product) => (
                <div key={product.id} className="admin-product-item">
                  <div className="admin-product-item__info">
                    <span className="admin-product-item__name">{product.name}</span>
                    <span className="admin-product-item__meta">
                      {product.pricingType} · {product._count.workflows} workflow(s)
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <Link href={`/admin/services/${product.id}/images`} className="admin-action-link">
                      Manage Images
                    </Link>
                    <Link href={`/book/${product.slug}`} className="admin-action-link" target="_blank">
                      Preview
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
