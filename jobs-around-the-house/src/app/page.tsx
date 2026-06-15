import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import HeroCarousel from "@/components/home/HeroCarousel";
import prisma from "@/lib/prisma";

import {
    JetWashIcon,
    LeafIcon,
    HomeIcon,
    TvIcon,
    WrenchIcon,
} from "@/components/ui/Icons";

// SVG icons for service groups
const groupIcons: Record<string, React.ReactNode> = {
    spray: (
        <JetWashIcon
            size={32}
            color="var(--color-teal-500)"
        />
    ),
    tree: (
        <LeafIcon
            size={32}
            color="var(--color-teal-500)"
        />
    ),
    home: (
        <HomeIcon
            size={32}
            color="var(--color-teal-500)"
        />
    ),
    monitor: (
        <TvIcon
            size={32}
            color="var(--color-teal-500)"
        />
    ),
};

const fallbackIcon = (
    <WrenchIcon
        size={32}
        color="var(--color-teal-500)"
    />
);

const HomePage = async () => {
    // Fetch hero images for the carousel
    const categories = await prisma.category.findMany({
        where: {
            isActive: true,
            heroImages: { some: { isActive: true } },
        },
        orderBy: { sortOrder: "asc" },
        select: {
            id: true,
            name: true,
            slug: true,
            heroImages: {
                where: { isActive: true },
                select: { id: true, imageUrl: true },
            },
        },
    });

    const slides = categories.flatMap((c) =>
        c.heroImages.map((img) => ({
            id: String(img.id),
            name: c.name,
            slug: c.slug,
            heroImageUrl: img.imageUrl,
        })),
    );

    // Fetch top-level categories (acting as service groups) with their subcategories
    const categoriesDb = await prisma.category.findMany({
        where: { parentId: null, isActive: true },
        orderBy: { sortOrder: "asc" },
        select: {
            slug: true,
            name: true,
            description: true,
            children: {
                where: { isActive: true },
                orderBy: { sortOrder: "asc" },
                select: { name: true, slug: true },
            },
        },
    });

    const serviceGroups = categoriesDb.map((g) => ({
        slug: g.slug,
        name: g.name,
        description: g.description,
        icon:
            g.slug === "garden-buildings" ? "tree"
            : g.slug === "jet-washing" ? "spray"
            : g.slug === "tech-installation" ? "monitor"
            : "home",
        categories: g.children,
    }));

    return (
        <>
            <Header />

            <main id="main-content">
                {/* ===== HERO SECTION ===== */}
                <section
                    className="hero"
                    aria-labelledby="hero-title"
                >
                    <HeroCarousel
                        slides={slides}
                        interval={5000}
                    />
                    <div className="hero__inner">
                        <div className="hero__content">
                            <div className="hero__badge">
                                <span
                                    className="hero__badge-dot"
                                    aria-hidden="true"
                                />
                                Serving Leicester &amp; surrounding areas
                            </div>

                            <h1
                                id="hero-title"
                                className="hero__title"
                            >
                                Your Home,{" "}
                                <span className="hero__title-accent">
                                    Our Expertise
                                </span>
                            </h1>

                            <p className="hero__subtitle">
                                Professional handyman and property services
                                across Leicester. From jet washing and shed
                                builds to tech installation and fencing — book
                                online with upfront, transparent pricing.
                            </p>

                            <div className="hero__actions">
                                <Link
                                    href="/services"
                                    className="btn btn--primary btn--lg"
                                >
                                    Browse Services
                                    <svg
                                        width="16"
                                        height="16"
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
                                </Link>
                                <Link
                                    href="/contact"
                                    className="btn btn--secondary btn--lg"
                                >
                                    Get in Touch
                                </Link>
                            </div>
                        </div>

                        <div
                            className="hero__visual"
                            aria-hidden="true"
                        >
                            <div className="hero__visual-card">
                                <div className="hero__stats">
                                    <div className="hero__stat">
                                        <span className="hero__stat-value">
                                            9+
                                        </span>
                                        <span className="hero__stat-label">
                                            Service Categories
                                        </span>
                                    </div>
                                    <div className="hero__stat">
                                        <span className="hero__stat-value">
                                            10mi
                                        </span>
                                        <span className="hero__stat-label">
                                            Coverage Radius
                                        </span>
                                    </div>
                                    <div className="hero__stat">
                                        <span className="hero__stat-value">
                                            Mon–Fri
                                        </span>
                                        <span className="hero__stat-label">
                                            8am – 6pm
                                        </span>
                                    </div>
                                    <div className="hero__stat">
                                        <span className="hero__stat-value">
                                            50%
                                        </span>
                                        <span className="hero__stat-label">
                                            Deposit to Book
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ===== TRUST BAR ===== */}
                <div
                    className="trust-bar"
                    role="region"
                    aria-label="Trust indicators"
                >
                    <div className="trust-item">
                        <div
                            className="trust-item__icon"
                            aria-hidden="true"
                        >
                            <svg
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                <circle
                                    cx="12"
                                    cy="10"
                                    r="3"
                                />
                            </svg>
                        </div>
                        <div>
                            <div className="trust-item__text">
                                Leicester &amp; 10 Miles
                            </div>
                            <div className="trust-item__subtext">
                                Local coverage area
                            </div>
                        </div>
                    </div>
                    <div className="trust-item">
                        <div
                            className="trust-item__icon"
                            aria-hidden="true"
                        >
                            <svg
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <rect
                                    x="1"
                                    y="4"
                                    width="22"
                                    height="16"
                                    rx="2"
                                    ry="2"
                                />
                                <line
                                    x1="1"
                                    y1="10"
                                    x2="23"
                                    y2="10"
                                />
                            </svg>
                        </div>
                        <div>
                            <div className="trust-item__text">
                                Secure Online Payments
                            </div>
                            <div className="trust-item__subtext">
                                Powered by Stripe
                            </div>
                        </div>
                    </div>
                    <div className="trust-item">
                        <div
                            className="trust-item__icon"
                            aria-hidden="true"
                        >
                            <svg
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            </svg>
                        </div>
                        <div>
                            <div className="trust-item__text">
                                Fully Insured
                            </div>
                            <div className="trust-item__subtext">
                                For your peace of mind
                            </div>
                        </div>
                    </div>
                    <div className="trust-item">
                        <div
                            className="trust-item__icon"
                            aria-hidden="true"
                        >
                            <svg
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                <polyline points="22 4 12 14.01 9 11.01" />
                            </svg>
                        </div>
                        <div>
                            <div className="trust-item__text">
                                Upfront Pricing
                            </div>
                            <div className="trust-item__subtext">
                                No hidden costs
                            </div>
                        </div>
                    </div>
                </div>

                {/* ===== SERVICES SECTION ===== */}
                <section
                    className="section"
                    aria-labelledby="services-title"
                >
                    <div className="container">
                        <div className="services-section__header">
                            <div className="section__eyebrow">
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
                                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                                </svg>
                                Our Services
                            </div>
                            <h2
                                id="services-title"
                                className="section__title"
                            >
                                Everything Your Home Needs
                            </h2>
                            <p className="section__subtitle">
                                From quick fixes to bigger projects, we offer a
                                wide range of professional home services across
                                Leicester.
                            </p>
                        </div>

                        <div className="services-grid services-grid--groups">
                            {serviceGroups.map((group) => (
                                <Link
                                    key={group.slug}
                                    href={`/services#${group.slug}`}
                                    className="service-card service-card--group"
                                    id={`service-group-${group.slug}`}
                                >
                                    <div
                                        className="service-card__icon"
                                        aria-hidden="true"
                                    >
                                        {groupIcons[group.icon || ""] ||
                                            fallbackIcon}
                                    </div>
                                    <h3 className="service-card__title">
                                        {group.name}
                                    </h3>
                                    <p className="service-card__description">
                                        {group.description}
                                    </p>
                                    {group.categories.length > 0 && (
                                        <ul className="service-card__sub-list">
                                            {group.categories.map((cat) => (
                                                <li
                                                    key={cat.slug}
                                                    className="service-card__sub-item"
                                                >
                                                    {cat.name}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                    <span className="service-card__link">
                                        View services
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
                    </div>
                </section>

                {/* ===== HOW IT WORKS ===== */}
                <section
                    className="section section--gray"
                    aria-labelledby="how-it-works-title"
                >
                    <div className="container">
                        <div className="services-section__header">
                            <div className="section__eyebrow">
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
                                    <circle
                                        cx="12"
                                        cy="12"
                                        r="10"
                                    />
                                    <polyline points="12 6 12 12 16 14" />
                                </svg>
                                How It Works
                            </div>
                            <h2
                                id="how-it-works-title"
                                className="section__title"
                            >
                                Book in 3 Simple Steps
                            </h2>
                            <p className="section__subtitle">
                                Getting your job done has never been easier.
                                Choose, configure, and book — all online.
                            </p>
                        </div>

                        <div className="steps-grid">
                            <div className="step-card">
                                <div
                                    className="step-card__number"
                                    aria-hidden="true"
                                >
                                    1
                                </div>
                                <h3 className="step-card__title">
                                    Choose Your Service
                                </h3>
                                <p className="step-card__description">
                                    Browse our categories and pick the service
                                    you need. From jet washing to shed builds,
                                    we&apos;ve got you covered.
                                </p>
                            </div>

                            <div className="step-card">
                                <div
                                    className="step-card__number"
                                    aria-hidden="true"
                                >
                                    2
                                </div>
                                <h3 className="step-card__title">
                                    Configure Your Job
                                </h3>
                                <p className="step-card__description">
                                    Tell us the details — dimensions, materials,
                                    extras. Our smart pricing calculates your
                                    cost instantly.
                                </p>
                            </div>

                            <div className="step-card">
                                <div
                                    className="step-card__number"
                                    aria-hidden="true"
                                >
                                    3
                                </div>
                                <h3 className="step-card__title">
                                    Book &amp; Pay Securely
                                </h3>
                                <p className="step-card__description">
                                    Pick your preferred date, pay a 50% deposit
                                    online, and we&apos;ll confirm your booking.
                                    Simple as that.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ===== CTA SECTION ===== */}
                <section
                    className="section cta-section"
                    aria-labelledby="cta-title"
                >
                    <div className="container">
                        <div className="cta-section__inner">
                            <h2
                                id="cta-title"
                                className="cta-section__title"
                            >
                                Ready to Get Started?
                            </h2>
                            <p className="cta-section__subtitle">
                                Browse our services, configure your job, and
                                book online in minutes. No obligation, upfront
                                pricing, and quality workmanship guaranteed.
                            </p>
                            <div className="cta-section__actions">
                                <Link
                                    href="/services"
                                    className="btn btn--primary btn--lg"
                                >
                                    Browse Services
                                </Link>
                                <Link
                                    href="/contact"
                                    className="btn btn--outline btn--lg"
                                    style={{
                                        borderColor: "rgba(255,255,255,0.3)",
                                        color: "white",
                                    }}
                                >
                                    Contact Us
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
            <WhatsAppButton />
        </>
    );
};

export default HomePage;
