import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/layout/WhatsAppButton";

export const metadata: Metadata = {
    title: "About Us",
    description:
        "Learn about Jobs Around The House — professional handyman and home services based in Leicester. Reliable, affordable and committed to quality workmanship.",
};

const AboutPage = () => {
    return (
        <>
            <Header />
            <main id="main-content">
                <section
                    className="page-header"
                    aria-labelledby="about-page-title"
                >
                    <div className="container">
                        <h1
                            id="about-page-title"
                            className="page-header__title"
                        >
                            About Us
                        </h1>
                        <p className="page-header__subtitle">
                            Professional, reliable home services — right here in
                            Leicester.
                        </p>
                    </div>
                </section>

                {/* Story Section */}
                <section
                    className="section"
                    aria-labelledby="our-story-title"
                >
                    <div className="container">
                        <div className="about-content">
                            <div className="about-content__text">
                                <h2 id="our-story-title">
                                    Your Local Home Services Partner
                                </h2>
                                <p>
                                    Jobs Around The House was built on a simple
                                    idea: getting work done around your home
                                    should be easy, transparent, and
                                    stress-free. No chasing tradespeople for
                                    quotes, no hidden costs, no guesswork.
                                </p>
                                <p>
                                    We offer a wide range of handyman and
                                    property maintenance services across
                                    Leicester and the surrounding area. Whether
                                    it&apos;s jet washing your driveway, taking
                                    down an old shed, mounting your TV, or
                                    fixing that fence panel — we&apos;re here to
                                    help.
                                </p>
                                <p>
                                    What makes us different? Our smart online
                                    booking system lets you configure your job,
                                    see the price upfront, and book a time that
                                    suits you — all from the comfort of your
                                    sofa. Pay a 50% deposit to secure your
                                    booking, and the rest on completion.
                                </p>
                            </div>
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <div
                                    style={{
                                        background:
                                            "linear-gradient(135deg, var(--color-teal-50), var(--color-navy-50))",
                                        borderRadius: "var(--radius-2xl)",
                                        padding: "var(--space-12)",
                                        textAlign: "center",
                                        border: "1px solid var(--color-gray-200)",
                                    }}
                                >
                                    <div
                                        style={{
                                            fontSize: "4rem",
                                            marginBottom: "var(--space-4)",
                                        }}
                                        aria-hidden="true"
                                    >
                                        🏠
                                    </div>
                                    <div
                                        style={{
                                            fontSize: "var(--font-size-2xl)",
                                            fontWeight: 700,
                                            color: "var(--color-navy-800)",
                                            marginBottom: "var(--space-2)",
                                        }}
                                    >
                                        Jobs Around The House
                                    </div>
                                    <div
                                        style={{
                                            fontSize: "var(--font-size-sm)",
                                            color: "var(--text-secondary)",
                                        }}
                                    >
                                        Leicester &amp; Surrounding Areas
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Values */}
                <section
                    className="section section--gray"
                    aria-labelledby="values-title"
                >
                    <div className="container">
                        <div className="services-section__header">
                            <h2
                                id="values-title"
                                className="section__title"
                            >
                                Why Choose Us
                            </h2>
                            <p className="section__subtitle">
                                We&apos;re not just another handyman service.
                                Here&apos;s what sets us apart.
                            </p>
                        </div>

                        <div className="about-values">
                            <div className="about-value">
                                <div
                                    className="about-value__icon"
                                    aria-hidden="true"
                                >
                                    💷
                                </div>
                                <h3 className="about-value__title">
                                    Upfront Pricing
                                </h3>
                                <p className="about-value__text">
                                    No surprises. Our online configurator
                                    calculates your price before you book. What
                                    you see is what you pay.
                                </p>
                            </div>
                            <div className="about-value">
                                <div
                                    className="about-value__icon"
                                    aria-hidden="true"
                                >
                                    📅
                                </div>
                                <h3 className="about-value__title">
                                    Easy Online Booking
                                </h3>
                                <p className="about-value__text">
                                    Choose your service, pick your date, and pay
                                    your deposit online. No phone tag, no
                                    waiting for callbacks.
                                </p>
                            </div>
                            <div className="about-value">
                                <div
                                    className="about-value__icon"
                                    aria-hidden="true"
                                >
                                    ✅
                                </div>
                                <h3 className="about-value__title">
                                    Quality Workmanship
                                </h3>
                                <p className="about-value__text">
                                    Every job done properly, every time. We take
                                    pride in our work and always leave your home
                                    tidy.
                                </p>
                            </div>
                            <div className="about-value">
                                <div
                                    className="about-value__icon"
                                    aria-hidden="true"
                                >
                                    📍
                                </div>
                                <h3 className="about-value__title">
                                    Truly Local
                                </h3>
                                <p className="about-value__text">
                                    Based in Leicester, covering a 10-mile
                                    radius. We know the area and we&apos;re
                                    always nearby when you need us.
                                </p>
                            </div>
                            <div className="about-value">
                                <div
                                    className="about-value__icon"
                                    aria-hidden="true"
                                >
                                    🔒
                                </div>
                                <h3 className="about-value__title">
                                    Secure Payments
                                </h3>
                                <p className="about-value__text">
                                    All payments are processed securely through
                                    Stripe. Your card details never touch our
                                    servers.
                                </p>
                            </div>
                            <div className="about-value">
                                <div
                                    className="about-value__icon"
                                    aria-hidden="true"
                                >
                                    🛡️
                                </div>
                                <h3 className="about-value__title">
                                    Fully Insured
                                </h3>
                                <p className="about-value__text">
                                    Complete peace of mind. We carry full public
                                    liability insurance for every job we
                                    undertake.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Coverage */}
                <section
                    className="section coverage-section"
                    aria-labelledby="coverage-title"
                >
                    <div className="container">
                        <h2
                            id="coverage-title"
                            className="section__title"
                        >
                            Our Coverage Area
                        </h2>
                        <p
                            className="section__subtitle"
                            style={{ marginBottom: 0 }}
                        >
                            We serve Leicester city and surrounding towns within
                            a 10-mile radius, including Oadby, Wigston, Blaby,
                            Enderby, Glenfield, Birstall, Syston, and
                            surrounding villages.
                        </p>
                        <div className="coverage-badge">
                            <span
                                className="coverage-badge__icon"
                                aria-hidden="true"
                            >
                                📍
                            </span>
                            <span className="coverage-badge__text">
                                Leicester &amp; within 10 miles
                            </span>
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section
                    className="section cta-section"
                    aria-labelledby="about-cta-title"
                >
                    <div className="container">
                        <div className="cta-section__inner">
                            <h2
                                id="about-cta-title"
                                className="cta-section__title"
                            >
                                Ready to Get Your Job Done?
                            </h2>
                            <p className="cta-section__subtitle">
                                Browse our services and book online today. Or
                                get in touch if you&apos;d like to discuss your
                                project first.
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

export default AboutPage;
