"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  Play,
  Film,
  Camera,
  Calendar,
  Layers,
  Sparkles,
} from "lucide-react";
import { useEffect, useState, useCallback, useRef } from "react";
import Section from "./Section";
import { gallery } from "@/lib/content";
import {
  galleryData,
  allGalleryItems,
  galleryStats,
  MediaItem,
  YearGallery,
} from "@/lib/galleryData";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

// CSS Grid mosaic frame classes to produce a Google Photos-style layout
const frameClasses: Record<MediaItem["frame"], string> = {
  big: "col-span-2 row-span-2 min-h-[280px] sm:min-h-[340px] md:min-h-[400px]",
  wide: "col-span-2 row-span-1 min-h-[150px] sm:min-h-[180px] md:min-h-[200px]",
  tall: "col-span-1 row-span-2 min-h-[280px] sm:min-h-[340px] md:min-h-[400px]",
  standard: "col-span-1 row-span-1 min-h-[150px] sm:min-h-[180px] md:min-h-[200px]",
};

// Video preview card with hover autoplay and tap-to-open
function VideoPreviewCard({
  item,
  onSelect,
}: {
  item: MediaItem;
  onSelect: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const fullSrc = `${basePath}${item.src}`;

  const handleMouseEnter = () => {
    if (videoRef.current) {
      videoRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  return (
    <div
      onClick={onSelect}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`group relative overflow-hidden rounded-xl border border-purple-900/60 bg-purple-950 shadow-card transition-all duration-300 hover:border-gold hover:shadow-gold-sm cursor-pointer ${
        frameClasses[item.frame]
      }`}
    >
      <video
        ref={videoRef}
        src={fullSrc}
        playsInline
        muted
        loop
        preload="metadata"
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />

      {/* Subtle vignette gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-purple-950/80 via-transparent to-black/20 pointer-events-none" />

      {/* Top Video Indicator Pill */}
      <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1.5 rounded-full bg-purple-950/80 backdrop-blur-md px-2.5 py-1 text-[0.62rem] font-semibold tracking-wider uppercase text-gold border border-gold/40">
        <Film size={12} className="text-gold" />
        <span>Video</span>
      </div>

      {/* Center Play Button Overlay */}
      <div
        className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300 ${
          isPlaying ? "opacity-0" : "opacity-90 group-hover:opacity-100"
        }`}
      >
        <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-purple-900/80 text-gold border border-gold/70 shadow-gold backdrop-blur-sm transition-transform duration-300 group-hover:scale-110">
          <Play size={20} className="ml-1 text-gold fill-gold" />
        </div>
      </div>

      {/* Bottom Info Bar */}
      <div className="absolute bottom-0 inset-x-0 p-2.5 sm:p-3 flex items-center justify-between text-alabaster z-10">
        <span className="font-serif text-xs sm:text-sm font-medium drop-shadow-sm text-alabaster">
          {item.title}
        </span>
        <span className="text-[0.62rem] tracking-wider text-gold/80 font-medium uppercase">
          Tap to Play
        </span>
      </div>
    </div>
  );
}

// Photo preview card with hover zoom and tap-to-open
function PhotoPreviewCard({
  item,
  onSelect,
}: {
  item: MediaItem;
  onSelect: () => void;
}) {
  const fullSrc = `${basePath}${item.src}`;

  return (
    <div
      onClick={onSelect}
      className={`group relative overflow-hidden rounded-xl border border-purple-200/80 bg-purple-950 shadow-card transition-all duration-300 hover:border-gold hover:shadow-gold-sm cursor-pointer ${
        frameClasses[item.frame]
      }`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={fullSrc}
        alt={item.title}
        loading="lazy"
        decoding="async"
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />

      {/* Vignette Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-purple-950/70 via-transparent to-transparent opacity-60 group-hover:opacity-90 transition-opacity pointer-events-none" />

      {/* Top Hover Pill */}
      <div className="absolute top-2.5 right-2.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-950/80 text-gold border border-gold/40 shadow-sm backdrop-blur-sm">
          <Maximize2 size={14} />
        </div>
      </div>

      {/* Bottom Title */}
      <div className="absolute bottom-0 inset-x-0 p-2.5 sm:p-3 flex items-center justify-between text-alabaster z-10">
        <span className="font-serif text-xs sm:text-sm font-medium drop-shadow-sm text-alabaster">
          {item.title}
        </span>
        <span className="text-[0.62rem] tracking-wider text-gold/90 font-medium uppercase opacity-0 group-hover:opacity-100 transition-opacity">
          View
        </span>
      </div>
    </div>
  );
}

export default function Gallery() {
  const [selectedYear, setSelectedYear] = useState<string>("All");
  const [selectedType, setSelectedType] = useState<"all" | "photo" | "video">("all");
  const [activeItem, setActiveItem] = useState<MediaItem | null>(null);

  // Filter year archives
  const displayedGalleries: YearGallery[] =
    selectedYear === "All"
      ? galleryData
      : galleryData.filter((g) => g.year === selectedYear);

  // Compute flattened list of active items for Lightbox next/prev navigation
  const activeItemsList: MediaItem[] = displayedGalleries.flatMap((g) =>
    g.items.filter((it) => (selectedType === "all" ? true : it.type === selectedType))
  );

  const activeIndex = activeItem
    ? activeItemsList.findIndex((it) => it.id === activeItem.id)
    : -1;

  // Move forward or backwards in Lightbox
  const moveLightbox = useCallback(
    (direction: number) => {
      if (!activeItem || activeItemsList.length === 0) return;
      const curIdx = activeItemsList.findIndex((it) => it.id === activeItem.id);
      if (curIdx === -1) return;
      const nextIdx =
        (curIdx + direction + activeItemsList.length) % activeItemsList.length;
      setActiveItem(activeItemsList[nextIdx]);
    },
    [activeItem, activeItemsList]
  );

  // Lock body scroll when Lightbox is active
  useEffect(() => {
    if (activeItem) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [activeItem]);

  // Keyboard navigation for Lightbox
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!activeItem) return;
      if (event.key === "Escape") setActiveItem(null);
      if (event.key === "ArrowRight") moveLightbox(1);
      if (event.key === "ArrowLeft") moveLightbox(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeItem, moveLightbox]);

  return (
    <Section id="gallery" className="bg-alabaster">
      {/* Section Header */}
      <header className="mb-8 sm:mb-12 max-w-3xl">
        <div className="section-eyebrow mb-3">
          <span className="h-1.5 w-1.5 rounded-full bg-vermilion" />
          Studio Archive • 2026 – 2021
        </div>
        <h2 className="section-title">{gallery.heading}</h2>
        <div className="gold-rule mt-5 mb-5" />
        <p className="text-sm xs:text-base leading-relaxed text-ink/80 sm:text-lg">
          {gallery.subtext}
        </p>

        {/* Global Stats Summary Pill */}
        <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-purple-950 font-medium">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-white px-3.5 py-1.5 shadow-sm">
            <Camera size={14} className="text-gold" />
            <span>{galleryStats.totalPhotos} Photos</span>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-white px-3.5 py-1.5 shadow-sm">
            <Film size={14} className="text-gold" />
            <span>{galleryStats.totalVideos} Videos</span>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-white px-3.5 py-1.5 shadow-sm">
            <Calendar size={14} className="text-gold" />
            <span>6 Classical Seasons</span>
          </div>
        </div>

        {/* Year Filter Tabs (2026 first) & Media Type Selector */}
        <div className="mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-purple-200/80 pb-4">
          {/* Year Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            <button
              type="button"
              onClick={() => setSelectedYear("All")}
              className={`min-h-[38px] px-4 rounded-full text-xs font-semibold uppercase tracking-wider transition-all shrink-0 active:scale-95 ${
                selectedYear === "All"
                  ? "bg-purple-900 text-alabaster shadow-md"
                  : "bg-white border border-purple-200 text-purple-900 hover:border-gold"
              }`}
            >
              All Years
            </button>
            {galleryStats.years.map((year) => (
              <button
                key={year}
                type="button"
                onClick={() => setSelectedYear(year)}
                className={`min-h-[38px] px-3.5 rounded-full text-xs font-semibold tracking-wider transition-all shrink-0 active:scale-95 ${
                  selectedYear === year
                    ? "bg-purple-900 text-alabaster shadow-md"
                    : "bg-white border border-purple-200 text-purple-900 hover:border-gold"
                }`}
              >
                {year}
              </button>
            ))}
          </div>

          {/* Media Type Toggle: All / Photos / Videos */}
          <div className="inline-flex items-center rounded-lg border border-purple-200 bg-white p-1 self-start sm:self-auto shrink-0 shadow-sm">
            <button
              type="button"
              onClick={() => setSelectedType("all")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                selectedType === "all"
                  ? "bg-purple-900 text-alabaster font-semibold"
                  : "text-purple-900 hover:text-gold"
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setSelectedType("photo")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                selectedType === "photo"
                  ? "bg-purple-900 text-alabaster font-semibold"
                  : "text-purple-900 hover:text-gold"
              }`}
            >
              Photos
            </button>
            <button
              type="button"
              onClick={() => setSelectedType("video")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                selectedType === "video"
                  ? "bg-purple-900 text-alabaster font-semibold"
                  : "text-purple-900 hover:text-gold"
              }`}
            >
              Videos
            </button>
          </div>
        </div>
      </header>

      {/* Year-by-Year Feed (2026 at top down to 2021) */}
      <div className="space-y-14 sm:space-y-20">
        {displayedGalleries.map((yearGroup) => {
          const filteredYearItems = yearGroup.items.filter((it) =>
            selectedType === "all" ? true : it.type === selectedType
          );

          if (filteredYearItems.length === 0) return null;

          return (
            <section
              key={yearGroup.year}
              id={`archive-${yearGroup.year}`}
              className="scroll-mt-24"
            >
              {/* Year Header Bar */}
              <div className="mb-5 flex flex-wrap items-baseline justify-between gap-3 border-b border-purple-100 pb-3">
                <div className="flex items-center gap-3">
                  <span className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-purple-900">
                    {yearGroup.year}
                  </span>
                  <span className="text-[0.68rem] uppercase tracking-[0.2em] font-semibold text-vermilion-700">
                    Classical Showcase
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-ink/70">
                  <span>{yearGroup.totalPhotos} Photos</span>
                  <span>•</span>
                  <span>{yearGroup.totalVideos} Videos</span>
                </div>
              </div>

              {/* Google Photos Mosaic Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-3 md:gap-4 auto-rows-[150px] sm:auto-rows-[180px] md:auto-rows-[200px] grid-flow-dense">
                {filteredYearItems.map((item) =>
                  item.type === "video" ? (
                    <VideoPreviewCard
                      key={item.id}
                      item={item}
                      onSelect={() => setActiveItem(item)}
                    />
                  ) : (
                    <PhotoPreviewCard
                      key={item.id}
                      item={item}
                      onSelect={() => setActiveItem(item)}
                    />
                  )
                )}
              </div>
            </section>
          );
        })}
      </div>

      {/* Full-Screen Lightbox Modal */}
      <AnimatePresence>
        {activeItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[70] flex flex-col justify-between bg-purple-950/95 backdrop-blur-md p-3 sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-label="Media viewer"
            onClick={() => setActiveItem(null)}
          >
            {/* Modal Top Bar */}
            <div
              className="flex items-center justify-between pb-3 border-b border-purple-800 text-alabaster max-w-6xl w-full mx-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3">
                <span className="text-[0.68rem] uppercase tracking-widest text-gold font-semibold rounded-full border border-gold/40 px-3 py-0.5 bg-purple-900/60">
                  {activeItem.year} • {activeItem.type.toUpperCase()}
                </span>
                <h3 className="font-serif text-base sm:text-lg text-alabaster font-medium">
                  {activeItem.title}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-purple-300 mr-2 hidden sm:inline">
                  {activeIndex + 1} / {activeItemsList.length}
                </span>
                <button
                  type="button"
                  onClick={() => setActiveItem(null)}
                  className="h-11 w-11 rounded-full bg-purple-900 border border-gold/40 flex items-center justify-center text-gold transition-transform active:scale-95 hover:bg-gold hover:text-purple-950"
                  aria-label="Close viewer"
                >
                  <X size={22} />
                </button>
              </div>
            </div>

            {/* Modal Media Display Stage */}
            <div
              className="my-auto mx-auto max-w-5xl w-full flex items-center justify-center p-1 sm:p-4 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {activeItem.type === "video" ? (
                <div className="relative w-full max-h-[75vh] flex items-center justify-center">
                  <video
                    key={activeItem.src}
                    src={`${basePath}${activeItem.src}`}
                    controls
                    autoPlay
                    playsInline
                    className="max-h-[75vh] max-w-full rounded-xl shadow-2xl bg-black border border-purple-800"
                  />
                </div>
              ) : (
                <div className="relative max-h-[75vh] flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    key={activeItem.src}
                    src={`${basePath}${activeItem.src}`}
                    alt={activeItem.title}
                    className="max-h-[75vh] max-w-full object-contain rounded-xl shadow-2xl border border-purple-800"
                  />
                </div>
              )}
            </div>

            {/* Modal Bottom Controls */}
            <div
              className="flex items-center justify-between pt-3 border-t border-purple-800 max-w-6xl w-full mx-auto"
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

              <div className="flex items-center gap-2 text-xs tracking-wider text-purple-300">
                <Sparkles size={14} className="text-gold" />
                <span>
                  {activeItem.filename} ({activeIndex + 1} of {activeItemsList.length})
                </span>
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