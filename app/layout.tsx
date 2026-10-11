import type { Metadata, Viewport } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "@/globals.css";
import { seo } from "@/lib/content";

const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#1A0D33",
};

export const metadata: Metadata = {
  title: seo.title,
  description: seo.description,
  keywords: seo.keywords,
  openGraph: { title: seo.title, description: seo.description, type: "website" },
  icons: { icon: "/logo-an.png" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className={`${playfair.variable} ${inter.variable}`}><body>{children}</body></html>;
}