import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";
import { Suspense } from "react";
import Script from "next/script";
import { LoadingProvider } from "./context/LoadingContext";
import RefCapture from "./components/RefCapture";

const SUPABASE_ORIGIN = "https://ojkhpishuqyeiwaopaty.supabase.co";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  preload: false, // mono font is not fetched up front; still loads when used
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export const metadata = {
  metadataBase: new URL("https://rent.fasteraim.com"),
  title: {
    default: "Mr. Rent – Find Verified Rentals in Nigeria",
    template: "%s - Mr. Rent",
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
    "verified property listings",
    "ai property rental platform",
    "mrrent",
    "house for rent nigeria",
    "apartment for rent",
    "no agent fees",
    "Landlord contacts",
    "friendly rental app",
    "rentals in nigeria",
    "buy land",
  ],
  authors: [{ name: "Faster Aim Technology Limited" }],
  creator: "Faster Aim Technology Limited",
  publisher: "Faster Aim Technology Limited",
  // NOTE: no root-level `alternates.canonical` here. Each page sets its own
  // canonical (via pageMeta in lib/seo.js), so pages are no longer all
  // pointed at the homepage.
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
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  name: "Mr. Rent",
  description:
    "AI-powered property rental platform serving Nigeria. Browse verified landlord listings, chat with Mr. Rent AI, and reveal contacts without agent fees.",
  url: "https://rent.fasteraim.com",
  logo: "https://rent.fasteraim.com/icon.png",
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
        {/* Early connection to Supabase: one for CORS (API calls), one for plain loads (images) */}
        <link rel="preconnect" href={SUPABASE_ORIGIN} crossOrigin="anonymous" />
        <link rel="preconnect" href={SUPABASE_ORIGIN} />
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
      <body className="min-h-full flex flex-col">
        {/* Cyan/Teal brand frame — top */}
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg, #0ef6cc 0%, #14B8A6 100%)', zIndex: 99999, pointerEvents: 'none' }} />
        {/* bottom */}
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg, #14B8A6 0%, #0ef6cc 100%)', zIndex: 99999, pointerEvents: 'none' }} />
        {/* left */}
        <div style={{ position: 'fixed', top: 0, bottom: 0, left: 0, width: 4, background: 'linear-gradient(180deg, #0ef6cc 0%, #14B8A6 100%)', zIndex: 99999, pointerEvents: 'none' }} />
        {/* right */}
        <div style={{ position: 'fixed', top: 0, bottom: 0, right: 0, width: 4, background: 'linear-gradient(180deg, #14B8A6 0%, #0ef6cc 100%)', zIndex: 99999, pointerEvents: 'none' }} />
        <Suspense fallback={null}><RefCapture /></Suspense>
        <LoadingProvider>{children}</LoadingProvider>

        {/* Analytics and tracking scripts now live inside <body> */}
        <Analytics />
        <SpeedInsights />
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-0NWQ6GQ2YB" strategy="lazyOnload" />
        <Script id="gtag-init" strategy="lazyOnload">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-0NWQ6GQ2YB');
        `}</Script>
      </body>
    </html>
  );
}