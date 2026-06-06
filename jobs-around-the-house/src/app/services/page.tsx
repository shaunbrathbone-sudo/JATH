import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import prisma from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Our Services",
  description:
    "Browse our full range of professional home services in Leicester. Jet washing, shed services, tech installation, fencing, DIY and more. Book online with upfront pricing.",
};

export default async function ServicesPage() {
  const groups = await prisma.serviceGroup.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    include: {
      categories: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
        include: {
          products: {
            where: { isActive: true },
            orderBy: { sortOrder: "asc" },
            select: { name: true, slug: true, basePrice: true, pricingType: true },
          },
        },
      },
    },
  });

  return (
    <>
      <Header />
      <main id="main-content">
        <section className="page-header" aria-labelledby="services-page-title">
          <div className="container">
            <h1 id="services-page-title" className="page-header__title">
              Our Services
            </h1>
            <p className="page-header__subtitle">
              Professional home services across Leicester and surrounding areas.
              Browse our categories, configure your job, and book online.
            </p>
          </div>
        </section>

        {groups.map((group) => (
          <section
            key={group.slug}
            id={group.slug}
            className="section"
            aria-labelledby={`group-${group.slug}`}
          >
            <div className="container">
              <div className="services-section__header">
                <h2 id={`group-${group.slug}`} className="section__title">
                  {group.name}
                </h2>
                {group.description && (
                  <p className="section__subtitle">{group.description}</p>
                )}
              </div>

              <div className="services-grid">
                {group.categories.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/services/${cat.slug}`}
                    className="service-card"
                    id={cat.slug}
                  >
                    <h3 className="service-card__title">{cat.name}</h3>
                    <p className="service-card__description">
                      {cat.description}
                    </p>
                    {cat.products.length > 0 && (
                      <ul className="service-card__checklist">
                        {cat.products.map((p) => (
                          <li key={p.slug} className="service-card__check-item">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-teal-500)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            {p.name}
                          </li>
                        ))}
                      </ul>
                    )}
                    <span className="service-card__link">
                      Configure &amp; Book
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        ))}

        {/* CTA */}
        <section className="section cta-section" aria-labelledby="services-cta-title">
          <div className="container">
            <div className="cta-section__inner">
              <h2 id="services-cta-title" className="cta-section__title">
                Can&apos;t Find What You Need?
              </h2>
              <p className="cta-section__subtitle">
                We handle all sorts of jobs around the house. If you don&apos;t
                see what you need listed, get in touch and we&apos;ll see how we
                can help.
              </p>
              <div className="cta-section__actions">
                <Link href="/contact" className="btn btn--primary btn--lg">
                  Get in Touch
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
}
