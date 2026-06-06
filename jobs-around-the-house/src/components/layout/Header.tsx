"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
}

interface GroupItem {
  id: string;
  name: string;
  slug: string;
  categories: CategoryItem[];
}

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [groups, setGroups] = useState<GroupItem[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setGroups(data);
        }
      })
      .catch((err) => console.error("Failed to load header categories:", err));
  }, []);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/services", label: "Categories" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <>
      <header
        className={`header ${isScrolled ? "header--scrolled" : ""}`}
        role="banner"
      >
        <div className="header__inner">
          <Link href="/" className="header__logo" aria-label="Jobs Around The House - Home">
            <span className="header__logo-icon" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </span>
            Jobs Around The House
          </Link>

          <nav className="header__nav" aria-label="Main navigation">
            {navLinks.map((link) => {
              if (link.label === "Categories") {
                return (
                  <div
                    key={link.href}
                    className="header__nav-item-dropdown"
                    onMouseEnter={() => setIsDropdownOpen(true)}
                    onMouseLeave={() => setIsDropdownOpen(false)}
                  >
                    <Link
                      href="/services"
                      className="header__nav-link header__nav-link--dropdown-trigger"
                    >
                      Categories
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`dropdown-arrow ${isDropdownOpen ? "open" : ""}`}>
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </Link>
                    {isDropdownOpen && groups.length > 0 && (
                      <div className="header__dropdown-menu">
                        <div className="header__dropdown-grid">
                          {groups.map((group) => (
                            <div key={group.id} className="header__dropdown-column">
                              <Link
                                href={`/services/${group.slug}`}
                                className="header__dropdown-group-title"
                                onClick={() => setIsDropdownOpen(false)}
                              >
                                {group.name}
                              </Link>
                              <ul className="header__dropdown-list">
                                {group.categories.map((cat) => (
                                  <li key={cat.id}>
                                    <Link
                                      href={`/services/${cat.slug}`}
                                      className="header__dropdown-link"
                                      onClick={() => setIsDropdownOpen(false)}
                                    >
                                      {cat.name}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              }
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="header__nav-link"
                >
                  {link.label}
                </Link>
              );
            })}
            <Link href="/services" className="btn btn--primary btn--sm header__cta">
              Book a Job
            </Link>
          </nav>

          <button
            className="header__menu-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-nav"
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMobileMenuOpen ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </header>

      <nav
        id="mobile-nav"
        className={`mobile-nav ${isMobileMenuOpen ? "mobile-nav--open" : ""}`}
        aria-label="Mobile navigation"
      >
        {navLinks.map((link) => {
          if (link.label === "Categories") {
            return (
              <div key={link.href} className="mobile-nav__group-item">
                <Link
                  href="/services"
                  className="mobile-nav__link"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Categories
                </Link>
                <div className="mobile-nav__groups-wrapper">
                  {groups.map((group) => (
                    <div key={group.id} className="mobile-nav__group-section">
                      <Link
                        href={`/services/${group.slug}`}
                        className="mobile-nav__group-title-link"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {group.name}
                      </Link>
                      <div className="mobile-nav__sublinks">
                        {group.categories.map((cat) => (
                          <Link
                            key={cat.id}
                            href={`/services/${cat.slug}`}
                            className="mobile-nav__sublink"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            {cat.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          }
          return (
            <Link
              key={link.href}
              href={link.href}
              className="mobile-nav__link"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          );
        })}
        <Link
          href="/services"
          className="btn btn--primary btn--lg"
          onClick={() => setIsMobileMenuOpen(false)}
          style={{ marginTop: "1rem" }}
        >
          Book a Job
        </Link>
      </nav>
    </>
  );
}
