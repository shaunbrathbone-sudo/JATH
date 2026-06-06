"use client";

import { useState, type FormEvent } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/layout/WhatsAppButton";

export default function ContactPage() {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    phone: "",
    postcode: "",
    service: "",
    message: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate form submission (will be replaced with API route later)
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSubmitted(true);
    setIsSubmitting(false);
  };

  return (
    <>
      <Header />
      <main id="main-content">
        <section className="page-header" aria-labelledby="contact-page-title">
          <div className="container">
            <h1 id="contact-page-title" className="page-header__title">
              Get in Touch
            </h1>
            <p className="page-header__subtitle">
              Got a question or want to discuss your project? Drop us a message
              and we&apos;ll get back to you promptly.
            </p>
          </div>
        </section>

        <section className="section" aria-label="Contact form and information">
          <div className="container">
            <div className="contact-grid">
              {/* Contact Form */}
              <div>
                {isSubmitted ? (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "var(--space-12)",
                      background: "var(--color-teal-50)",
                      borderRadius: "var(--radius-xl)",
                      border: "1px solid var(--color-teal-200)",
                    }}
                    role="alert"
                  >
                    <div
                      style={{ fontSize: "3rem", marginBottom: "var(--space-4)" }}
                      aria-hidden="true"
                    >
                      ✅
                    </div>
                    <h2
                      style={{
                        fontSize: "var(--font-size-2xl)",
                        fontWeight: 700,
                        color: "var(--color-navy-800)",
                        marginBottom: "var(--space-3)",
                      }}
                    >
                      Message Sent!
                    </h2>
                    <p style={{ color: "var(--text-secondary)" }}>
                      Thanks for getting in touch. We&apos;ll get back to you as
                      soon as possible, usually within a few hours during
                      working days.
                    </p>
                  </div>
                ) : (
                  <form
                    className="contact-form"
                    onSubmit={handleSubmit}
                    noValidate
                  >
                    <h2
                      style={{
                        fontSize: "var(--font-size-2xl)",
                        fontWeight: 700,
                        color: "var(--color-navy-800)",
                        marginBottom: "var(--space-2)",
                      }}
                    >
                      Send Us a Message
                    </h2>

                    <div className="form-group">
                      <label
                        htmlFor="contact-name"
                        className="form-group__label form-group__label--required"
                      >
                        Your Name
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        className="form-group__input"
                        value={formState.name}
                        onChange={(e) =>
                          setFormState({ ...formState, name: e.target.value })
                        }
                        required
                        autoComplete="name"
                        placeholder="John Smith"
                      />
                    </div>

                    <div className="form-group">
                      <label
                        htmlFor="contact-email"
                        className="form-group__label form-group__label--required"
                      >
                        Email Address
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        className="form-group__input"
                        value={formState.email}
                        onChange={(e) =>
                          setFormState({ ...formState, email: e.target.value })
                        }
                        required
                        autoComplete="email"
                        placeholder="john@example.com"
                      />
                    </div>

                    <div className="form-group">
                      <label
                        htmlFor="contact-phone"
                        className="form-group__label"
                      >
                        Phone Number
                      </label>
                      <input
                        id="contact-phone"
                        type="tel"
                        className="form-group__input"
                        value={formState.phone}
                        onChange={(e) =>
                          setFormState({ ...formState, phone: e.target.value })
                        }
                        autoComplete="tel"
                        placeholder="07xxx xxxxxx"
                      />
                    </div>

                    <div className="form-group">
                      <label
                        htmlFor="contact-postcode"
                        className="form-group__label"
                      >
                        Postcode
                      </label>
                      <input
                        id="contact-postcode"
                        type="text"
                        className="form-group__input"
                        value={formState.postcode}
                        onChange={(e) =>
                          setFormState({
                            ...formState,
                            postcode: e.target.value,
                          })
                        }
                        autoComplete="postal-code"
                        placeholder="LE1 1AA"
                      />
                    </div>

                    <div className="form-group">
                      <label
                        htmlFor="contact-service"
                        className="form-group__label"
                      >
                        Service You&apos;re Interested In
                      </label>
                      <select
                        id="contact-service"
                        className="form-group__select"
                        value={formState.service}
                        onChange={(e) =>
                          setFormState({
                            ...formState,
                            service: e.target.value,
                          })
                        }
                      >
                        <option value="">Select a service (optional)</option>
                        <option value="jet-washing">Jet Washing</option>
                        <option value="shed-services">Shed Services</option>
                        <option value="tech-installation">
                          Tech Installation
                        </option>
                        <option value="fencing">Fencing</option>
                        <option value="flat-pack">Flat-Pack Assembly</option>
                        <option value="garden">Garden &amp; Clearance</option>
                        <option value="picture-hanging">
                          Picture &amp; Mirror Hanging
                        </option>
                        <option value="guttering">Guttering Services</option>
                        <option value="general-diy">General DIY</option>
                        <option value="other">Other / Not Sure</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label
                        htmlFor="contact-message"
                        className="form-group__label form-group__label--required"
                      >
                        Your Message
                      </label>
                      <textarea
                        id="contact-message"
                        className="form-group__textarea"
                        value={formState.message}
                        onChange={(e) =>
                          setFormState({
                            ...formState,
                            message: e.target.value,
                          })
                        }
                        required
                        rows={5}
                        placeholder="Tell us about your job or question..."
                      />
                    </div>

                    <button
                      type="submit"
                      className="btn btn--primary btn--lg"
                      disabled={isSubmitting}
                      style={{ width: "100%" }}
                    >
                      {isSubmitting ? "Sending..." : "Send Message"}
                    </button>
                  </form>
                )}
              </div>

              {/* Contact Info Sidebar */}
              <div className="contact-info">
                <h2
                  style={{
                    fontSize: "var(--font-size-2xl)",
                    fontWeight: 700,
                    color: "var(--color-navy-800)",
                    marginBottom: "var(--space-2)",
                  }}
                >
                  Other Ways to Reach Us
                </h2>

                <div className="contact-info__item">
                  <div className="contact-info__icon" aria-hidden="true">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </div>
                  <div>
                    <div className="contact-info__title">Coverage Area</div>
                    <div className="contact-info__text">
                      Leicester &amp; surrounding areas (within 10 miles)
                    </div>
                  </div>
                </div>

                <div className="contact-info__item">
                  <div className="contact-info__icon" aria-hidden="true">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  </div>
                  <div>
                    <div className="contact-info__title">Working Hours</div>
                    <div className="contact-info__text">
                      Monday – Friday: 8am – 6pm
                      <br />
                      Saturday – Sunday: Closed
                    </div>
                  </div>
                </div>

                <div className="contact-info__item">
                  <div className="contact-info__icon" aria-hidden="true">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
                    </svg>
                  </div>
                  <div>
                    <div className="contact-info__title">WhatsApp</div>
                    <div className="contact-info__text">
                      <a
                        href="https://wa.me/447000000000"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "var(--color-teal-600)" }}
                      >
                        Chat with us on WhatsApp
                      </a>
                    </div>
                  </div>
                </div>

                <div className="contact-info__item">
                  <div className="contact-info__icon" aria-hidden="true">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  </div>
                  <div>
                    <div className="contact-info__title">Email</div>
                    <div className="contact-info__text">
                      info@jobsaroundthehouse.co.uk
                    </div>
                  </div>
                </div>

                {/* Response Time Note */}
                <div
                  style={{
                    padding: "var(--space-5)",
                    background: "var(--color-teal-50)",
                    borderRadius: "var(--radius-lg)",
                    border: "1px solid var(--color-teal-200)",
                    marginTop: "var(--space-4)",
                  }}
                >
                  <p
                    style={{
                      fontSize: "var(--font-size-sm)",
                      color: "var(--color-navy-700)",
                      lineHeight: "var(--line-height-relaxed)",
                    }}
                  >
                    <strong>Quick response guaranteed.</strong> We aim to reply
                    to all enquiries within a few hours during working days
                    (Mon–Fri, 8am–6pm).
                  </p>
                </div>
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
