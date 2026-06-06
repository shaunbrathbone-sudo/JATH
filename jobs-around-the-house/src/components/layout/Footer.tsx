import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer" role="contentinfo">
      <div className="container">
        <div className="footer__grid">
          {/* Brand Column */}
          <div>
            <div className="footer__brand-name">Jobs Around The House</div>
            <p className="footer__brand-desc">
              Professional handyman and home services across Leicester and
              surrounding areas. Quality workmanship with upfront, transparent
              pricing.
            </p>
            <div className="footer__social">
              <a
                href="#"
                className="footer__social-link"
                aria-label="Follow us on Facebook"
                rel="noopener noreferrer"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
              <a
                href="#"
                className="footer__social-link"
                aria-label="Follow us on Instagram"
                rel="noopener noreferrer"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
            </div>
          </div>

          {/* Services Column */}
          <div>
            <h3 className="footer__heading">Services</h3>
            <ul className="footer__links">
              <li><Link href="/services" className="footer__link">Jet Washing</Link></li>
              <li><Link href="/services" className="footer__link">Shed Services</Link></li>
              <li><Link href="/services" className="footer__link">Tech Installation</Link></li>
              <li><Link href="/services" className="footer__link">Fencing</Link></li>
              <li><Link href="/services" className="footer__link">General DIY</Link></li>
              <li><Link href="/services" className="footer__link">Garden Clearance</Link></li>
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h3 className="footer__heading">Company</h3>
            <ul className="footer__links">
              <li><Link href="/about" className="footer__link">About Us</Link></li>
              <li><Link href="/contact" className="footer__link">Contact</Link></li>
              <li><Link href="/services" className="footer__link">All Services</Link></li>
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h3 className="footer__heading">Get In Touch</h3>
            <ul className="footer__links">
              <li className="footer__link">Leicester &amp; surrounding areas</li>
              <li className="footer__link">Mon – Fri: 8am – 6pm</li>
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
                <Link href="/contact" className="footer__link">
                  Send a Message
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer__bottom">
          <p>&copy; {currentYear} Jobs Around The House. All rights reserved.</p>
          <p>Serving Leicester &amp; within 10 miles</p>
        </div>
      </div>
    </footer>
  );
}
