import prisma from "@/lib/prisma";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import BookingWizard from "@/components/booking/BookingWizard";
import Link from "next/link";
import HeroCarousel from "@/components/home/HeroCarousel";

interface BookPageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BookPageProps) {
    const { slug } = await params;
    const product = await prisma.product.findUnique({
        where: { slug },
        select: { title: true },
    });

    return {
        title: product ? `Book ${product.title}` : "Book a Service",
        description:
            product ?
                `Configure and book ${product.title} online with upfront pricing.`
            :   "Configure and book your home service online.",
    };
}

export default async function BookPage({ params }: BookPageProps) {
    const { slug } = await params;

    const product = await prisma.product.findUnique({
        where: { slug },
        include: {
            category: { select: { name: true, slug: true } },
            heroImages: {
                where: { isActive: true },
                orderBy: { createdAt: "desc" },
            },
            workflowSteps: {
                orderBy: { sortOrder: "asc" },
                include: {
                    options: { orderBy: { sortOrder: "asc" } },
                },
            },
        },
    });

    if (!product || !product.isActive || product.workflowSteps.length === 0) {
        return (
            <>
                <Header />
                <main id="main-content">
                    <section className="page-header">
                        <div className="container">
                            <h1 className="page-header__title">
                                Service Not Found
                            </h1>
                            <p className="page-header__subtitle">
                                Sorry, we couldn&apos;t find that service.
                                Please browse our available services below.
                            </p>
                        </div>
                    </section>
                    <section
                        className="section"
                        style={{ textAlign: "center" }}
                    >
                        <div className="container">
                            <Link
                                href="/services"
                                className="btn btn--primary btn--lg"
                            >
                                Browse Services
                            </Link>
                        </div>
                    </section>
                </main>
                <Footer />
            </>
        );
    }

    // Serialize for client component
    const productData = {
        id: String(product.id),
        name: product.title,
        slug: product.slug,
        description: product.description,
        categoryName: product.category.name,
        categorySlug: product.category.slug,
    };

    let inStock = true;
    if (product.productType === "virtual_bundle") {
        const bundle = await prisma.product.findUnique({
            where: { id: product.id },
            include: {
                bundleComponents: {
                    include: {
                        component: { select: { stockQuantity: true } },
                    },
                },
            },
        });
        if (bundle) {
            inStock = bundle.bundleComponents.every(
                (comp) => comp.component.stockQuantity >= comp.quantity,
            );
        }
    } else {
        inStock = product.stockQuantity > 0;
    }

    const workflowData = {
        id: String(product.id),
        steps: product.workflowSteps.map((step) => ({
            id: String(step.id),
            label: step.stepName,
            fieldType: step.fieldType,
            fieldKey: step.fieldKey,
            helpText: step.helpText,
            unit: step.unit,
            validationRules: step.validationRules,
            sortOrder: step.sortOrder,
            isRequired: step.isMandatory,
            showIf: step.conditionalTriggerValue,
            options: step.options.map((opt) => ({
                id: String(opt.id),
                label: opt.label,
                value: opt.value,
                description: opt.description,
                priceModifier: opt.priceModifier,
                optionValueFlag: opt.optionValueFlag,
                productId: opt.productId,
            })),
        })),
    };

    const slides = product.heroImages.map((img) => ({
        id: String(img.id),
        name: product.title,
        slug: product.slug,
        heroImageUrl: img.imageUrl,
    }));

    const hasCarousel = slides.length > 0;
    // If no carousel but a single featured image is set, use it as background
    const singleBgUrl =
        !hasCarousel && product.heroImages?.[0]?.imageUrl ? product.heroImages[0].imageUrl : undefined;

    return (
        <>
            <Header />
            <main id="main-content">
                <section
                    className={`page-header page-header--compact ${singleBgUrl ? "page-header--has-bg" : ""} ${hasCarousel ? "page-header--carousel" : ""}`}
                    style={
                        singleBgUrl ?
                            { backgroundImage: `url('${singleBgUrl}')` }
                        :   undefined
                    }
                >
                    {hasCarousel && <HeroCarousel slides={slides} />}
                    <div
                        className="container"
                        style={{ position: "relative", zIndex: 10 }}
                    >
                        <div className="page-header__breadcrumb">
                            <Link href="/services">Services</Link>
                            <span aria-hidden="true"> / </span>
                            <span>{product.category.name}</span>
                        </div>
                        <h1 className="page-header__title page-header__title--sm">
                            {product.title}
                        </h1>
                        <p className="page-header__subtitle">
                            {product.description}
                        </p>
                    </div>
                </section>

                <section className="section booking-section">
                    <div className="container">
                        <BookingWizard
                            product={productData}
                            workflow={workflowData}
                            inStock={inStock}
                        />
                    </div>
                </section>
            </main>
            <Footer />
            <WhatsAppButton />
        </>
    );
}
