import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL("https://rent.fasteraim.com"),
  title: {
    default: "Mr. Rent – Find Verified Rentals in Nigeria",
    template: "%s | Mr. Rent",
  },
  description:
    "AI-powered property rental platform for Nigeria. Browse verified listings in Awka, Onitsha, Anambra and beyond. No agent fees — pay only to reveal landlord contacts.",
  keywords: [
    "rentals Nigeria",
    "property rental Awka",
    "rent house Onitsha",
    "Anambra rentals",
    "Nigeria property listing",
    "rent apartment Nigeria",
    "Mr Rent",
    "Faster Aim Rentals",
  ],
  authors: [{ name: "Faster Aim Technology Limited" }],
  creator: "Faster Aim Technology Limited",
  publisher: "Faster Aim Technology Limited",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "https://rent.fasteraim.com",
    siteName: "Mr. Rent",
    title: "Mr. Rent – Find Verified Rentals in Nigeria",
    description:
      "Browse verified property listings across Nigeria. Use Mr. Rent AI to find your perfect home — no agent fees.",
    locale: "en_NG",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mr. Rent – Find Verified Rentals in Nigeria",
    description:
      "AI-powered rentals platform. Browse listings in Awka, Onitsha and beyond. No agent fees.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  name: "Mr. Rent",
  description:
    "AI-powered property rental platform serving Nigeria. Browse verified landlord listings, chat with Mr. Rent AI, and reveal contacts without agent fees.",
  url: "https://rent.fasteraim.com",
  logo: "https://rent.fasteraim.com/favicon.png",
  sameAs: ["https://fasteraim.com"],
  address: {
    "@type": "PostalAddress",
    addressLocality: "Awka",
    addressRegion: "Anambra State",
    addressCountry: "NG",
  },
  parentOrganization: {
    "@type": "Organization",
    name: "Faster Aim Technology Limited",
    url: "https://fasteraim.com",
  },
  areaServed: {
    "@type": "Country",
    name: "Nigeria",
  },
  serviceType: "Property Rental Marketplace",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <meta name="theme-color" content="#0ef6cc" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Mr. Rent" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script dangerouslySetInnerHTML={{ __html: `
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
              navigator.serviceWorker.register('/sw.js');
            });
          }
        ` }} />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
      <Analytics />
      <SpeedInsights />
    </html>
  );
}