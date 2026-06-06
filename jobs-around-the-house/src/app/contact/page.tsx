"use client";

import { useState, type FormEvent } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/layout/WhatsAppButton";

import {
    MapPinIcon,
    ClockIcon,
    WhatsAppIcon,
    MailIcon,
} from "@/components/ui/Icons";

const ContactPage = () => {
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
                <section
                    className="page-header"
                    aria-labelledby="contact-page-title"
                >
                    <div className="container">
                        <h1
                            id="contact-page-title"
                            className="page-header__title"
                        >
                            Get in Touch
                        </h1>
                        <p className="page-header__subtitle">
                            Got a question or want to discuss your project? Drop
                            us a message and we&apos;ll get back to you
                            promptly.
                        </p>
                    </div>
                </section>

                <section
                    className="section"
                    aria-label="Contact form and information"
                >
                    <div className="container">
                        <div className="contact-grid">
                            {/* Contact Form */}
                            <div>
                                {isSubmitted ?
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
                                            style={{
                                                fontSize: "3rem",
                                                marginBottom: "var(--space-4)",
                                            }}
                                            aria-hidden="true"
                                        >
                                            ✅
                                        </div>
                                        <h2
                                            style={{
                                                fontSize:
                                                    "var(--font-size-2xl)",
                                                fontWeight: 700,
                                                color: "var(--color-navy-800)",
                                                marginBottom: "var(--space-3)",
                                            }}
                                        >
                                            Message Sent!
                                        </h2>
                                        <p
                                            style={{
                                                color: "var(--text-secondary)",
                                            }}
                                        >
                                            Thanks for getting in touch.
                                            We&apos;ll get back to you as soon
                                            as possible, usually within a few
                                            hours during working days.
                                        </p>
                                    </div>
                                :   <form
                                        className="contact-form"
                                        onSubmit={handleSubmit}
                                        noValidate
                                    >
                                        <h2
                                            style={{
                                                fontSize:
                                                    "var(--font-size-2xl)",
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
                                                    setFormState({
                                                        ...formState,
                                                        name: e.target.value,
                                                    })
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
                                                    setFormState({
                                                        ...formState,
                                                        email: e.target.value,
                                                    })
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
                                                    setFormState({
                                                        ...formState,
                                                        phone: e.target.value,
                                                    })
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
                                                        postcode:
                                                            e.target.value,
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
                                                Service You&apos;re Interested
                                                In
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
                                                <option value="">
                                                    Select a service (optional)
                                                </option>
                                                <option value="jet-washing">
                                                    Jet Washing
                                                </option>
                                                <option value="shed-services">
                                                    Shed Services
                                                </option>
                                                <option value="tech-installation">
                                                    Tech Installation
                                                </option>
                                                <option value="fencing">
                                                    Fencing
                                                </option>
                                                <option value="flat-pack">
                                                    Flat-Pack Assembly
                                                </option>
                                                <option value="garden">
                                                    Garden &amp; Clearance
                                                </option>
                                                <option value="picture-hanging">
                                                    Picture &amp; Mirror Hanging
                                                </option>
                                                <option value="guttering">
                                                    Guttering Services
                                                </option>
                                                <option value="general-diy">
                                                    General DIY
                                                </option>
                                                <option value="other">
                                                    Other / Not Sure
                                                </option>
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
                                            {isSubmitting ?
                                                "Sending..."
                                            :   "Send Message"}
                                        </button>
                                    </form>
                                }
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
                                    <div
                                        className="contact-info__icon"
                                        aria-hidden="true"
                                    >
                                        <MapPinIcon size={20} />
                                    </div>
                                    <div>
                                        <div className="contact-info__title">
                                            Coverage Area
                                        </div>
                                        <div className="contact-info__text">
                                            Leicester &amp; surrounding areas
                                            (within 10 miles)
                                        </div>
                                    </div>
                                </div>

                                <div className="contact-info__item">
                                    <div
                                        className="contact-info__icon"
                                        aria-hidden="true"
                                    >
                                        <ClockIcon size={20} />
                                    </div>
                                    <div>
                                        <div className="contact-info__title">
                                            Working Hours
                                        </div>
                                        <div className="contact-info__text">
                                            Monday – Friday: 8am – 6pm
                                            <br />
                                            Saturday – Sunday: Closed
                                        </div>
                                    </div>
                                </div>

                                <div className="contact-info__item">
                                    <div
                                        className="contact-info__icon"
                                        aria-hidden="true"
                                    >
                                        <WhatsAppIcon size={20} />
                                    </div>
                                    <div>
                                        <div className="contact-info__title">
                                            WhatsApp
                                        </div>
                                        <div className="contact-info__text">
                                            <a
                                                href="https://wa.me/447000000000"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{
                                                    color: "var(--color-teal-600)",
                                                }}
                                            >
                                                Chat with us on WhatsApp
                                            </a>
                                        </div>
                                    </div>
                                </div>

                                <div className="contact-info__item">
                                    <div
                                        className="contact-info__icon"
                                        aria-hidden="true"
                                    >
                                        <MailIcon size={20} />
                                    </div>
                                    <div>
                                        <div className="contact-info__title">
                                            Email
                                        </div>
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
                                            lineHeight:
                                                "var(--line-height-relaxed)",
                                        }}
                                    >
                                        <strong>
                                            Quick response guaranteed.
                                        </strong>{" "}
                                        We aim to reply to all enquiries within
                                        a few hours during working days
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
};

export default ContactPage;
