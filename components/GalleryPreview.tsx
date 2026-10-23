"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Camera,
  ChevronLeft,
  ChevronRight,
  Film,
  Maximize2,
  Sparkles,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import Section from "./Section";
import { gallery } from "@/lib/content";
import { galleryStats, MediaItem } from "@/lib/galleryData";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

// Handpicked, visually diverse highlight photographs for the main page glance
const previewPhotos: MediaItem[] = [
  {
    id: "preview-2026-p1",
    year: "2026",
    type: "photo",
    filename: "2026 p1.jpg",
    src: "/gallery/2026/2026%20p1.jpg",
    title: "2026 • Recital Feature",
    alt: "Abhinaya Nartan Kuchipudi classical stage performance - Featured classical recital moment",
    frame: "big",
    number: 1,
  },
  {
    id: "preview-2026-p3",
    year: "2026",
    type: "photo",
    filename: "2026 p3.jpg",
    src: "/gallery/2026/2026%20p3.jpg",
    title: "2026 • Expressive Abhinaya",
    alt: "Abhinaya Nartan Kuchipudi classical dancer - Expressive facial gesture and storytelling",
    frame: "tall",
    number: 3,
  },
  {
    id: "preview-2026-p5",
    year: "2026",
    type: "photo",
    filename: "2026 p5.jpg",
    src: "/gallery/2026/2026%20p5.jpg",
    title: "2026 • Tarangam Stance",
    alt: "Abhinaya Nartan Kuchipudi dance performance - Tarangam brass plate invocation pose",
    frame: "wide",
    number: 5,
  },
  {
    id: "preview-2026-p8",
    year: "2026",
    type: "photo",
    filename: "2026 p8.jpg",
    src: "/gallery/2026/2026%20p8.jpg",
    title: "2026 • Rhythmic Footwork",
    alt: "Abhinaya Nartan Kuchipudi dancer in classical silk costume with ghungroo bells",
    frame: "tall",
    number: 8,
  },
  {
    id: "preview-2025-p1",
    year: "2025",
    type: "photo",
    filename: "2025 p1.jpg",
    src: "/gallery/2025/2025%20p1.jpg",
    title: "2025 • Ensemble Devotion",
    alt: "Abhinaya Nartan Kuchipudi group stage performance - Ensemble recital showcase",
    frame: "wide",
    number: 1,
  },
  {
    id: "preview-2025-p4",
    year: "2025",
    type: "photo",
    filename: "2025 p4.jpg",
    src: "/gallery/2025/2025%20p4.jpg",
    title: "2025 • Sacred Mudra",
    alt: "Abhinaya Nartan Kuchipudi dancer performing Natya gesture in classical studio rehearsal",
    frame: "standard",
    number: 4,
  },
];

const previewFrameClasses: Record<MediaItem["frame"], string> = {
  big: "col-span-2 row-span-2 min-h-[260px] sm:min-h-[320px] md:min-h-[380px]",
  wide: "col-span-2 row-span-1 min-h-[140px] sm:min-h-[170px] md:min-h-[185px]",
  tall: "col-span-1 row-span-2 min-h-[260px] sm:min-h-[320px] md:min-h-[380px]",
  standard: "col-span-1 row-span-1 min-h-[140px] sm:min-h-[170px] md:min-h-[185px]",
};

export default function GalleryPreview() {
  const [activePhoto, setActivePhoto] = useState<MediaItem | null>(null);

  const activeIndex = activePhoto
    ? previewPhotos.findIndex((it) => it.id === activePhoto.id)
    : -1;

  const moveLightbox = useCallback(
    (direction: number) => {
      if (!activePhoto || previewPhotos.length === 0) return;
      const curIdx = previewPhotos.findIndex((it) => it.id === activePhoto.id);
      if (curIdx === -1) return;
      const nextIdx =
        (curIdx + direction + previewPhotos.length) % previewPhotos.length;
      setActivePhoto(previewPhotos[nextIdx]);
    },
    [activePhoto]
  );

  // Lock body scroll when Lightbox is active
  useEffect(() => {
    if (activePhoto) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [activePhoto]);

  // Keyboard navigation for Lightbox
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!activePhoto) return;
      if (event.key === "Escape") setActivePhoto(null);
      if (event.key === "ArrowRight") moveLightbox(1);
      if (event.key === "ArrowLeft") moveLightbox(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activePhoto, moveLightbox]);

  return (
    <Section id="gallery" className="bg-alabaster">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8 sm:mb-10">
        <div className="max-w-2xl">
          <div className="section-eyebrow mb-3">
            <span className="h-1.5 w-1.5 rounded-full bg-vermilion" />
            Visual Moments • 2021 – 2026 Archive
          </div>
          <h2 className="section-title">{gallery.heading}</h2>
          <div className="gold-rule mt-4 sm:mt-5 mb-4 sm:mb-5" />
          <p className="text-sm xs:text-base leading-relaxed text-ink/80 sm:text-lg">
            A curated glance at our classical Kuchipudi recitals, Tarangam plate
            invocations, and classroom training. We maintain an extensive
            collection of over 100 high-resolution performance photographs and
            47 recital films.
          </p>
        </div>

        {/* Header Action Button - Direct Desktop Link */}
        <div className="hidden sm:block shrink-0">
          <Link
            href="/gallery"
            className="btn-primary flex items-center gap-2 text-xs uppercase tracking-wider font-semibold py-3 px-5 shadow-gold-sm"
          >
            <span>See Full Gallery</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>

      {/* Curated Glance Mosaic (Compact 6-Item Grid) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-3 md:gap-4 auto-rows-[140px] sm:auto-rows-[170px] md:auto-rows-[185px] grid-flow-dense">
        {previewPhotos.map((item) => (
          <div
            key={item.id}
            onClick={() => setActivePhoto(item)}
            className={`group relative overflow-hidden rounded-xl border border-purple-200/80 bg-purple-950 shadow-card transition-all duration-300 hover:border-gold hover:shadow-gold-sm cursor-pointer ${
              previewFrameClasses[item.frame]
            }`}
          >
            {/* Image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${basePath}${item.src}`}
              alt={item.alt || `${item.title} - Kuchipudi performance`}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />

            {/* Subtle Vignette Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-purple-950/75 via-transparent to-transparent opacity-60 group-hover:opacity-90 transition-opacity pointer-events-none" />

            {/* Hover Pill Icon */}
            <div className="absolute top-2.5 right-2.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-950/80 text-gold border border-gold/40 shadow-sm backdrop-blur-sm">
                <Maximize2 size={14} />
              </div>
            </div>

            {/* Title / Year Tag */}
            <div className="absolute bottom-0 inset-x-0 p-2.5 sm:p-3 flex items-center justify-between text-alabaster z-10 pointer-events-none">
              <span className="font-serif text-xs sm:text-sm font-medium drop-shadow-sm text-alabaster">
                {item.title}
              </span>
              <span className="text-[0.62rem] tracking-wider text-gold/90 font-medium uppercase opacity-0 group-hover:opacity-100 transition-opacity">
                Tap to view
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Prominent "See More / Explore Full Gallery" Callout Card */}
      <div className="mt-7 sm:mt-10 rounded-2xl border border-gold/40 bg-gradient-to-br from-purple-950 via-purple-900 to-purple-950 p-5 xs:p-6 sm:p-8 text-alabaster shadow-xl relative overflow-hidden">
        {/* Ambient gold glow */}
        <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-gold/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-purple-900/80 px-3 py-1 text-[0.68rem] uppercase tracking-wider text-gold font-semibold mb-3 backdrop-blur-sm">
              <Sparkles size={12} className="text-gold" />
              <span>Dedicated Archival Gallery</span>
            </div>

            <h3 className="font-serif text-xl sm:text-2xl lg:text-3xl text-white font-medium">
              Spectate the Complete Visual &amp; Recital Archive
            </h3>

            <p className="mt-2 text-xs sm:text-sm text-purple-200/90 leading-relaxed font-light">
              Explore all {galleryStats.totalPhotos} high-resolution stage
              photographs and {galleryStats.totalVideos} curated recital film
              records preserved across six classical seasons (2021–2026).
            </p>

            {/* Season Badges */}
            <div className="mt-4 flex flex-wrap items-center gap-2 text-[0.68rem] text-gold uppercase tracking-wider font-medium">
              <span className="inline-flex items-center gap-1 rounded-md bg-purple-900/90 border border-purple-700/80 px-2.5 py-1">
                <Camera size={12} className="text-gold" />
                <span>{galleryStats.totalPhotos} Photos</span>
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-purple-900/90 border border-purple-700/80 px-2.5 py-1">
                <Film size={12} className="text-gold" />
                <span>{galleryStats.totalVideos} Recital Films</span>
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-purple-900/90 border border-purple-700/80 px-2.5 py-1 text-purple-200">
                <span>2021 – 2026</span>
              </span>
            </div>
          </div>

          {/* Action CTA */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <Link
              href="/gallery"
              className="btn-primary flex items-center justify-center gap-2.5 text-center text-xs sm:text-sm font-semibold tracking-wider uppercase py-3.5 px-6 shadow-gold"
            >
              <span>Explore Full Gallery ({galleryStats.totalPhotos}+ Photos)</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>

      {/* Lightbox Modal for Glance Photos */}
      <AnimatePresence>
        {activePhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[70] flex flex-col justify-between bg-purple-950/95 backdrop-blur-md p-3 sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-label="Media viewer"
            onClick={() => setActivePhoto(null)}
          >
            {/* Modal Top Bar */}
            <div
              className="flex items-center justify-between pb-3 border-b border-purple-800 text-alabaster max-w-6xl w-full mx-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3">
                <span className="text-[0.68rem] uppercase tracking-widest text-gold font-semibold rounded-full border border-gold/40 px-3 py-0.5 bg-purple-900/60">
                  {activePhoto.year}
                </span>
                <h3 className="font-serif text-base sm:text-lg text-alabaster font-medium">
                  {activePhoto.title}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/gallery"
                  className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-purple-900 px-3 py-1.5 text-xs text-gold hover:bg-gold hover:text-purple-950 transition-colors mr-2"
                >
                  <span>View All {galleryStats.totalPhotos} Photos</span>
                  <ArrowRight size={13} />
                </Link>
                <button
                  type="button"
                  onClick={() => setActivePhoto(null)}
                  className="h-11 w-11 rounded-full bg-purple-900 border border-gold/40 flex items-center justify-center text-gold transition-transform active:scale-95 hover:bg-gold hover:text-purple-950"
                  aria-label="Close viewer"
                >
                  <X size={22} />
                </button>
              </div>
            </div>

            {/* Modal Image Stage */}
            <div
              className="my-auto mx-auto max-w-5xl w-full flex items-center justify-center p-1 sm:p-4 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative max-h-[75vh] flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  key={activePhoto.src}
                  src={`${basePath}${activePhoto.src}`}
                  alt={
                    activePhoto.alt ||
                    `${activePhoto.title} - Kuchipudi classical dance recital`
                  }
                  className="max-h-[75vh] max-w-full object-contain rounded-xl shadow-2xl border border-purple-800"
                />
              </div>
            </div>

            {/* Modal Bottom Controls */}
            <div
              className="flex items-center justify-between pt-3 pb-[env(safe-area-inset-bottom,0px)] border-t border-purple-800 max-w-6xl w-full mx-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => moveLightbox(-1)}
                className="flex items-center gap-2 h-11 px-4 sm:px-5 rounded-full bg-purple-900 border border-purple-700 text-alabaster text-xs uppercase tracking-wider transition-colors hover:border-gold active:scale-95"
              >
                <ChevronLeft size={18} className="text-gold" />
                <span className="hidden xs:inline">Previous</span>
              </button>

              <div className="flex items-center gap-3">
                <span className="text-xs tracking-wider text-purple-300">
                  {activeIndex + 1} of {previewPhotos.length}
                </span>
                <Link
                  href="/gallery"
                  className="inline-flex sm:hidden items-center gap-1 text-xs text-gold underline"
                >
                  <span>See all in Gallery</span>
                  <ArrowRight size={12} />
                </Link>
              </div>

              <button
                type="button"
                onClick={() => moveLightbox(1)}
                className="flex items-center gap-2 h-11 px-4 sm:px-5 rounded-full bg-purple-900 border border-purple-700 text-alabaster text-xs uppercase tracking-wider transition-colors hover:border-gold active:scale-95"
              >
                <span className="hidden xs:inline">Next</span>
                <ChevronRight size={18} className="text-gold" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Section>
  );
}

