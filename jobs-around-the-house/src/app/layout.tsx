import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Jobs Around The House | Professional Home Services in Leicester",
    template: "%s | Jobs Around The House",
  },
  description:
    "Professional handyman and home services across Leicester and surrounding areas. Jet washing, shed builds, tech installation, fencing and more. Book online and pay securely.",
  keywords: [
    "handyman Leicester",
    "home services Leicestershire",
    "jet washing Leicester",
    "shed removal Leicester",
    "property maintenance Leicester",
    "DIY services Leicester",
    "fencing Leicester",
    "gutter cleaning Leicester",
  ],
  openGraph: {
    title: "Jobs Around The House | Professional Home Services in Leicester",
    description:
      "Professional handyman and home services across Leicester. Book online with upfront pricing.",
    url: "https://jobsaroundthehouse.co.uk",
    siteName: "Jobs Around The House",
    locale: "en_GB",
    type: "website",
  },
  alternates: {
    canonical: "https://jobsaroundthehouse.co.uk",
    languages: {
      "en-GB": "https://jobsaroundthehouse.co.uk",
    },
  },
  other: {
    "content-language": "en-GB",
    "geo.region": "GB-LEC",
    "geo.placename": "Leicester",
    "currency": "GBP",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
  },
};

type RootLayoutProps = {
  children: React.ReactNode;
};

const RootLayout = ({ children }: RootLayoutProps) => {
  return (
    <html lang="en-GB">
      <body>
        <a href="#main-content" className="skip-to-content">
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
};

export default RootLayout;
