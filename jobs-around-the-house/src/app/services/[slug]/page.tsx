import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import prisma from "@/lib/prisma";

interface Props {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;

    // Check if it is a parent category (group)
    const group = await prisma.category.findFirst({
        where: { slug, parentId: null },
        select: { name: true },
    });

    if (group) {
        return {
            title: `${group.name} | Jobs Around The House`,
            description: `Professional ${group.name} in Leicester. Upfront pricing and instant online booking.`,
        };
    }

    // Check if it is a subcategory
    const category = await prisma.category.findUnique({
        where: { slug },
        select: { name: true },
    });

    if (category) {
        return {
            title: `${category.name} | Jobs Around The House`,
            description: `Book professional ${category.name} services in Leicester. Upfront pricing and instant online booking.`,
        };
    }

    return {
        title: "Service Not Found",
    };
}

export default async function ServiceSlugPage({ params }: Props) {
    const { slug } = await params;

    // Try to find as a Parent Category (Group) first
    const group = await prisma.category.findFirst({
        where: { slug, parentId: null },
        include: {
            children: {
                where: { isActive: true },
                include: {
                    products: {
                        where: { isActive: true },
                        select: { title: true, slug: true },
                    },
                    heroImages: {
                        where: { isActive: true },
                        take: 1,
                        select: { imageUrl: true },
                    },
                },
            },
        },
    });

    if (group) {
        const bgImage = group.children.find((c) => c.heroImages.length > 0)?.heroImages[0]?.imageUrl;

        return (
            <>
                <Header />
                <main id="main-content">
                    {/* Service Group Header */}
                    <section
                        className={`page-header ${bgImage ? "page-header--has-bg" : ""}`}
                        style={
                            bgImage ?
                                { backgroundImage: `url('${bgImage}')` }
                            :   undefined
                        }
                        aria-labelledby="group-title"
                    >
                        <div className="container">
                            <nav
                                className="breadcrumb"
                                aria-label="Breadcrumb"
                             >
                                <Link
                                    href="/"
                                    className="breadcrumb__link"
                                >
                                    Home
                                </Link>
                                <span
                                    className="breadcrumb__separator"
                                    aria-hidden="true"
                                >
                                    /
                                </span>
                                <Link
                                    href="/services"
                                    className="breadcrumb__link"
                                >
                                    Services
                                </Link>
                                <span
                                    className="breadcrumb__separator"
                                    aria-hidden="true"
                                >
                                    /
                                </span>
                                <span className="breadcrumb__current">
                                    {group.name}
                                </span>
                            </nav>
                            <h1
                                id="group-title"
                                className="page-header__title"
                            >
                                {group.name}
                            </h1>
                        </div>
                    </section>

                    {/* Categories inside this group */}
                    <section
                        className="section bg-light"
                        aria-labelledby="categories-heading"
                    >
                        <div className="container">
                            <h2
                                id="categories-heading"
                                className="sr-only"
                            >
                                Available Service Categories
                            </h2>

                            <div className="services-grid">
                                {group.children.map((cat) => (
                                    <Link
                                        key={cat.slug}
                                        href={`/services/${cat.slug}`}
                                        className="service-card"
                                        id={cat.slug}
                                    >
                                        <h3 className="service-card__title">
                                            {cat.name}
                                        </h3>
                                        {cat.products.length > 0 && (
                                            <ul className="service-card__checklist">
                                                {cat.products.map((p) => (
                                                    <li
                                                        key={p.slug}
                                                        className="service-card__check-item"
                                                    >
                                                        <svg
                                                            width="14"
                                                            height="14"
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            stroke="var(--color-teal-500)"
                                                            strokeWidth="2.5"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            aria-hidden="true"
                                                        >
                                                            <polyline points="20 6 9 17 4 12" />
                                                        </svg>
                                                        {p.title}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                        <span className="service-card__link">
                                            View Jobs
                                            <svg
                                                width="14"
                                                height="14"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2.5"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                aria-hidden="true"
                                            >
                                                <line
                                                    x1="5"
                                                    y1="12"
                                                    x2="19"
                                                    y2="12"
                                                />
                                                <polyline points="12 5 19 12 12 19" />
                                            </svg>
                                        </span>
                                    </Link>
                                ))}
                            </div>

                            <div className="category-back-btn-wrap">
                                <Link
                                    href="/services"
                                    className="btn btn--outline btn--md"
                                >
                                    <svg
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        style={{ marginRight: "8px" }}
                                    >
                                        <line
                                            x1="19"
                                            y1="12"
                                            x2="5"
                                            y2="12"
                                        />
                                        <polyline points="12 19 5 12 12 5" />
                                    </svg>
                                    Back to All Services
                                </Link>
                            </div>
                        </div>
                    </section>
                </main>
                <Footer />
                <WhatsAppButton />
            </>
        );
    }

    // Try to find as a Category
    const category = await prisma.category.findUnique({
        where: { slug },
        include: {
            parent: true,
            heroImages: {
                where: { isActive: true },
                take: 1,
                select: { imageUrl: true },
            },
            products: {
                where: { isActive: true },
                orderBy: { sortOrder: "asc" },
                include: {
                    heroImages: {
                        where: { isActive: true },
                        take: 1,
                        select: { imageUrl: true },
                    },
                },
            },
        },
    });

    if (category) {
        const bgImage = category.heroImages[0]?.imageUrl;

        return (
            <>
                <Header />
                <main id="main-content">
                    {/* Category Header */}
                    <section
                        className={`page-header ${bgImage ? "page-header--has-bg" : ""}`}
                        style={
                            bgImage ?
                                { backgroundImage: `url('${bgImage}')` }
                            :   undefined
                        }
                        aria-labelledby="category-title"
                    >
                        <div className="container">
                            <nav
                                className="breadcrumb"
                                aria-label="Breadcrumb"
                            >
                                <Link
                                    href="/"
                                    className="breadcrumb__link"
                                >
                                    Home
                                </Link>
                                <span
                                    className="breadcrumb__separator"
                                    aria-hidden="true"
                                >
                                    /
                                </span>
                                <Link
                                    href="/services"
                                    className="breadcrumb__link"
                                >
                                    Services
                                </Link>
                                {category.parent && (
                                    <>
                                        <span
                                            className="breadcrumb__separator"
                                            aria-hidden="true"
                                        >
                                            /
                                        </span>
                                        <Link
                                            href={`/services/${category.parent.slug}`}
                                            className="breadcrumb__link"
                                        >
                                            {category.parent.name}
                                        </Link>
                                    </>
                                )}
                                <span
                                    className="breadcrumb__separator"
                                    aria-hidden="true"
                                >
                                    /
                                </span>
                                <span className="breadcrumb__current">
                                    {category.name}
                                </span>
                            </nav>
                            <h1
                                id="category-title"
                                className="page-header__title"
                            >
                                {category.name}
                            </h1>
                        </div>
                    </section>

                    {/* Services / Products List */}
                    <section
                        className="section bg-light"
                        aria-labelledby="jobs-heading"
                    >
                        <div className="container">
                            <h2
                                id="jobs-heading"
                                className="sr-only"
                            >
                                Available Jobs
                            </h2>

                            <div className="category-services-grid">
                                {category.products.map((product) => {
                                    let priceText = "Instant Online Quote";
                                    if (product.basePrice) {
                                        priceText = `From £${product.basePrice.toFixed(2)}`;
                                    }

                                    const displayImage = product.heroImages?.[0]?.imageUrl;

                                    return (
                                        <div
                                            key={product.id}
                                            className="category-service-card"
                                        >
                                            {displayImage && (
                                                <div className="category-service-card__image-wrap">
                                                    <img
                                                        src={displayImage}
                                                        alt={product.title}
                                                        className="category-service-card__image"
                                                    />
                                                </div>
                                            )}
                                            <div className="category-service-card__body">
                                                <h3 className="category-service-card__title">
                                                    {product.title}
                                                </h3>
                                                {product.description && (
                                                    <p className="category-service-card__desc">
                                                        {product.description}
                                                    </p>
                                                )}

                                                <div className="category-service-card__footer">
                                                    <div className="category-service-card__price-info">
                                                        <span className="price-label">
                                                            Pricing
                                                        </span>
                                                        <span className="price-value">
                                                            {priceText}
                                                        </span>
                                                    </div>

                                                    <Link
                                                        href={`/book/${product.slug}`}
                                                        className="btn btn--primary btn--md"
                                                    >
                                                        Book Now
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {category.products.length === 0 && (
                                <div className="admin-empty">
                                    <h3>
                                        No specific services listed in this
                                        category yet.
                                    </h3>
                                    <p>
                                        Please contact us for custom requests or
                                        check back soon.
                                    </p>
                                    <Link
                                        href="/contact"
                                        className="btn btn--primary btn--md"
                                        style={{ marginTop: "1rem" }}
                                    >
                                        Get in Touch
                                    </Link>
                                </div>
                            )}

                            <div className="category-back-btn-wrap">
                                <Link
                                    href={
                                        category.parent ?
                                            `/services/${category.parent.slug}`
                                        :   "/services"
                                    }
                                    className="btn btn--outline btn--md"
                                >
                                    <svg
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        style={{ marginRight: "8px" }}
                                    >
                                        <line
                                            x1="19"
                                            y1="12"
                                            x2="5"
                                            y2="12"
                                        />
                                        <polyline points="12 19 5 12 12 5" />
                                    </svg>
                                    Back to{" "}
                                    {category.parent ?
                                        category.parent.name
                                    :   "All Services"}
                                </Link>
                            </div>
                        </div>
                    </section>
                </main>
                <Footer />
                <WhatsAppButton />
            </>
        );
    }

    notFound();
}
