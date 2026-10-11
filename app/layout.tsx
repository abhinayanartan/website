import type { Metadata, Viewport } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { seo } from "@/lib/content";

const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (basePath ? `https://abhinayanartan.github.io${basePath}` : "https://abhinayanartan.com");

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
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
  return <html lang="en" className={`${playfair.variable} ${inter.variable}`}><body>{children}</body></html>;
}