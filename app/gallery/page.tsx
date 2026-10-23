import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Camera,
  Film,
  Sparkles,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Gallery from "@/components/Gallery";
import Footer from "@/components/Footer";
import MobileActionBar from "@/components/MobileActionBar";
import { galleryStats } from "@/lib/galleryData";

export const metadata: Metadata = {
  title: "Visual Archive & Recital Cinema | Abhinaya Nartan Dance Academy",
  description:
    "Spectate over 100 high-resolution performance photographs and 47 curated Kuchipudi recital films spanning 2021 to 2026 at Abhinaya Nartan Dance Academy.",
};

export default function GalleryPage() {
  return (
    <main className="bg-alabaster min-h-screen">
      <Navbar />

      {/* Gallery Page Dedicated Hero Banner */}
      <section className="relative bg-gradient-to-b from-purple-950 via-purple-900 to-purple-950 text-alabaster pt-28 pb-12 sm:pb-16 md:pt-32 md:pb-20 border-b border-gold/30">
        <div className="mx-auto max-w-7xl px-4 xs:px-6 sm:px-8 md:px-12">
          {/* Breadcrumb Navigation */}
          <div className="mb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-purple-900/70 px-3.5 py-1.5 text-xs uppercase tracking-wider text-gold hover:bg-gold hover:text-purple-950 transition-all active:scale-95"
            >
              <ArrowLeft size={14} />
              <span>Back to Academy Home</span>
            </Link>
          </div>

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-purple-900/80 px-3.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-gold mb-4 backdrop-blur-sm">
              <Sparkles size={12} className="text-gold" />
              <span>Sacred Parampara Visual Archive</span>
            </div>

            <h1 className="font-serif text-3xl xs:text-4xl sm:text-5xl md:text-6xl font-medium tracking-tight leading-[1.1] text-white">
              The Kuchipudi{" "}
              <span className="bg-gold-gradient bg-clip-text text-transparent italic font-normal">
                Visual Archive
              </span>
            </h1>

            <p className="mt-4 sm:mt-5 text-sm xs:text-base sm:text-lg leading-relaxed text-purple-100/90 font-light">
              Spectate over {galleryStats.totalPhotos} master photographs and{" "}
              {galleryStats.totalVideos} recital films chronicling our sacred
              journey in classical Kuchipudi from 2021 through 2026. Filter
              through classical seasons, examine expressive abhinaya in high
              resolution, and explore our cinematic recital archive.
            </p>

            {/* Archive Summary Badges */}
            <div className="mt-6 sm:mt-8 flex flex-wrap items-center gap-3 text-xs">
              <div className="inline-flex items-center gap-2 rounded-lg border border-purple-700/80 bg-purple-900/60 px-3 py-1.5 text-alabaster backdrop-blur-sm">
                <Camera size={14} className="text-gold" />
                <span className="font-semibold text-gold">
                  {galleryStats.totalPhotos}
                </span>
                <span>Photographs</span>
              </div>
              <a
                href="#recital-films"
                className="inline-flex items-center gap-2 rounded-lg border border-purple-700/80 bg-purple-900/60 px-3 py-1.5 text-alabaster backdrop-blur-sm hover:border-gold hover:text-gold transition-colors"
              >
                <Film size={14} className="text-gold" />
                <span className="font-semibold text-gold">
                  {galleryStats.totalVideos}
                </span>
                <span>Recital Films (Curated Archive)</span>
              </a>
              <div className="inline-flex items-center gap-2 rounded-lg border border-purple-700/80 bg-purple-900/60 px-3 py-1.5 text-alabaster backdrop-blur-sm">
                <Calendar size={14} className="text-gold" />
                <span className="font-semibold text-gold">6 Seasons</span>
                <span>(2021–2026)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Full Interactive Gallery Component */}
      <Gallery showHeader={false} />

      {/* Closing Enrollment Banner */}
      <section className="bg-purple-950 border-t border-gold/30 py-12 sm:py-16 text-alabaster relative overflow-hidden">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-purple-900/80 px-3.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-gold mb-3">
            <Sparkles size={12} className="text-gold" />
            <span>Join The Legacy</span>
          </div>
          <h2 className="font-serif text-2xl xs:text-3xl sm:text-4xl text-white font-medium mb-3">
            Inspired to Master Classical Kuchipudi?
          </h2>
          <p className="max-w-xl mx-auto text-sm xs:text-base text-purple-200/90 leading-relaxed font-light mb-6">
            Begin your artistic journey with Abhinaya Nartan Dance Academy. We
            welcome students of all ages and prior experience levels to our
            weekly studio batches in Vijayawada.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              href="/#contact"
              className="btn-primary inline-flex items-center gap-2 px-7 py-3.5 text-xs sm:text-sm uppercase tracking-wider font-semibold"
            >
              <span>Enroll for Classes</span>
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/"
              className="btn-gold-outline inline-flex items-center gap-2 px-6 py-3.5 text-xs sm:text-sm uppercase tracking-wider font-semibold"
            >
              <span>Return to Main Page</span>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
      <MobileActionBar />
    </main>
  );
}

