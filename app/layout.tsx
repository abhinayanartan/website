import type { Metadata, Viewport } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { seo } from "@/lib/content";
import { AuthProvider } from "@/lib/auth/AuthContext";

const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (basePath ? `https://abhinayanartan.github.io${basePath}` : "https://abhinayanartan.com");

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#1A0D33",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: seo.title,
  description: seo.description,
  keywords: seo.keywords,
  openGraph: {
    title: seo.title,
    description: seo.description,
    type: "website",
    siteName: "Abhinaya Nartan Dance Academy",
    locale: "en_IN",
    images: [
      {
        url: `${basePath}/logo-full.png`,
        width: 1200,
        height: 630,
        alt: "Abhinaya Nartan Dance Academy",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: seo.title,
    description: seo.description,
    images: [`${basePath}/logo-full.png`],
  },
  icons: {
    icon: [
      { url: `${basePath}/icon.svg`, type: "image/svg+xml" },
    ],
    apple: `${basePath}/logo-an.png`,
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "DanceSchool",
    "@id": `${siteUrl}/#academy`,
    name: "Abhinaya Nartan Dance Academy",
    alternateName: "Abhinaya Nartan",
    description: seo.description,
    url: siteUrl,
    logo: `${siteUrl}/logo-full.png`,
    image: `${siteUrl}/gallery/2026/2026%20p1.jpg`,
    telephone: "+91-93981-18249",
    email: "abhinayanartan@gmail.com",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Vijayawada",
      addressRegion: "Andhra Pradesh",
      addressCountry: "IN",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: "16.5062",
      longitude: "80.6480",
    },
    sameAs: [
      "https://www.instagram.com/abhinayanartan/",
      "https://www.facebook.com/share/1BxEr9bppM/",
      "https://www.youtube.com/@ABHINAYANARTAN/videos",
    ],
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Wednesday", "Friday"],
        opens: "18:00",
        closes: "20:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Sunday",
        opens: "09:00",
        closes: "12:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Sunday",
        opens: "18:00",
        closes: "20:00",
      },
    ],
    priceRange: "₹₹",
    currenciesAccepted: "INR",
    paymentAccepted: "Cash, UPI, Bank Transfer",
  };

  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
