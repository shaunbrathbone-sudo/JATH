import prisma from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductImageManager from "@/components/admin/ProductImageManager";

interface Props {
    params: Promise<{ id: string }>;
}

export default async function AdminProductImagesPage({ params }: Props) {
    const { id } = await params;

    const product = await prisma.product.findUnique({
        where: { id: parseInt(id) || 0 },
        include: {
            heroImages: {
                orderBy: { createdAt: "desc" },
            },
        },
    });

    if (!product) {
        notFound();
    }

    // Map database Product model properties to UI component structures
    const productData = {
        id: String(product.id),
        name: product.title,
        slug: product.slug,
        imageUrl: product.imageUrl,
        heroImages: product.heroImages.map((img) => ({
            id: String(img.id),
            imageUrl: img.imageUrl,
            filename: img.filename,
            isActive: img.isActive,
            createdAt: img.createdAt,
        })),
    };

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
                <h1 className="admin-page__title">
                    Manage Images for {product.title}
                </h1>
                <p className="admin-page__subtitle">
                    Upload up to 6 images to appear on the {product.title}{" "}
                    booking page. Set one as the Featured image.
                </p>
            </div>

            <ProductImageManager product={productData} />
        </div>
    );
}
