import React from "react";
import Link from "next/link";
import { FacebookIcon, InstagramIcon } from "@/components/ui/Icons";

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer
            className="footer"
            role="contentinfo"
        >
            <div className="container">
                <div className="footer__grid">
                    {/* Brand Column */}
                    <div>
                        <div className="footer__brand-name">
                            Jobs Around The House
                        </div>
                        <p className="footer__brand-desc">
                            Professional handyman and home services across
                            Leicester and surrounding areas. Quality workmanship
                            with upfront, transparent pricing.
                        </p>
                        <div className="footer__social">
                            <a
                                href="#"
                                className="footer__social-link"
                                aria-label="Follow us on Facebook"
                                rel="noopener noreferrer"
                            >
                                <FacebookIcon size={16} />
                            </a>
                            <a
                                href="#"
                                className="footer__social-link"
                                aria-label="Follow us on Instagram"
                                rel="noopener noreferrer"
                            >
                                <InstagramIcon size={16} />
                            </a>
                        </div>
                    </div>

                    {/* Services Column */}
                    <div>
                        <h3 className="footer__heading">Services</h3>
                        <ul className="footer__links">
                            <li>
                                <Link
                                    href="/services"
                                    className="footer__link"
                                >
                                    Jet Washing
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/services"
                                    className="footer__link"
                                >
                                    Shed Services
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/services"
                                    className="footer__link"
                                >
                                    Tech Installation
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/services"
                                    className="footer__link"
                                >
                                    Fencing
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/services"
                                    className="footer__link"
                                >
                                    General DIY
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/services"
                                    className="footer__link"
                                >
                                    Garden Clearance
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Company Column */}
                    <div>
                        <h3 className="footer__heading">Company</h3>
                        <ul className="footer__links">
                            <li>
                                <Link
                                    href="/about"
                                    className="footer__link"
                                >
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/contact"
                                    className="footer__link"
                                >
                                    Contact
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/services"
                                    className="footer__link"
                                >
                                    All Services
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Column */}
                    <div>
                        <h3 className="footer__heading">Get In Touch</h3>
                        <ul className="footer__links">
                            <li className="footer__link">
                                Leicester &amp; surrounding areas
                            </li>
                            <li className="footer__link">
                                Mon – Fri: 8am – 6pm
                            </li>
                            <li>
                                <a
                                    href="https://wa.me/447000000000"
                                    className="footer__link"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    WhatsApp Us
                                </a>
                            </li>
                            <li>
                                <Link
                                    href="/contact"
                                    className="footer__link"
                                >
                                    Send a Message
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="footer__bottom">
                    <p>
                        &copy; {currentYear} Jobs Around The House. All rights
                        reserved.
                    </p>
                    <p>Serving Leicester &amp; within 10 miles</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
