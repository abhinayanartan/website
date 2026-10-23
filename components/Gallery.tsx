"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  Film,
  Camera,
  Calendar,
  Sparkles,
  Youtube,
  Instagram,
  Facebook,
} from "lucide-react";
import { useEffect, useState, useCallback, useRef } from "react";
import Section from "./Section";
import { gallery } from "@/lib/content";
import {
  galleryData,
  galleryStats,
  MediaItem,
  YearGallery,
} from "@/lib/galleryData";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

// Pre-defined rhythmic mosaic frame patterns for Google Photos layout
const framePattern: MediaItem["frame"][] = [
  "big",      // 0: 2x2 featured
  "standard", // 1: 1x1
  "tall",     // 2: 1x2 portrait
  "standard", // 3: 1x1
  "wide",     // 4: 2x1 landscape
  "standard", // 5: 1x1
  "standard", // 6: 1x1
  "tall",     // 7: 1x2 portrait
  "wide",     // 8: 2x1 landscape
  "standard", // 9: 1x1
  "standard", // 10: 1x1
  "big",      // 11: 2x2 featured
];

const frameClasses: Record<MediaItem["frame"], string> = {
  big: "col-span-2 row-span-2 min-h-[280px] sm:min-h-[340px] md:min-h-[400px]",
  wide: "col-span-2 row-span-1 min-h-[150px] sm:min-h-[180px] md:min-h-[200px]",
  tall: "col-span-1 row-span-2 min-h-[280px] sm:min-h-[340px] md:min-h-[400px]",
  standard: "col-span-1 row-span-1 min-h-[150px] sm:min-h-[180px] md:min-h-[200px]",
};

// Photo preview card with hover zoom, gold frame accent, and tap-to-open
function PhotoPreviewCard({
  item,
  frame,
  onSelect,
}: {
  item: MediaItem;
  frame: MediaItem["frame"];
  onSelect: () => void;
}) {
  const [hasError, setHasError] = useState(false);
  const fullSrc = `${basePath}${item.src}`;
  const isAvailable = !hasError && !item.unavailable;

  return (
    <div
      onClick={isAvailable ? onSelect : undefined}
      className={`group relative overflow-hidden rounded-xl border border-purple-200/80 bg-purple-950 shadow-card transition-all duration-300 ${
        isAvailable
          ? "hover:border-gold hover:shadow-gold-sm cursor-pointer"
          : "cursor-default"
      } ${frameClasses[frame]}`}
    >
      {isAvailable ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={fullSrc}
          alt={item.alt || `${item.title} - Kuchipudi classical dance performance at Abhinaya Nartan Academy`}
          loading="lazy"
          decoding="async"
          onError={() => setHasError(true)}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        /* Intentional unavailable-state card rather than raw fallback text */
        <div className="h-full w-full flex flex-col items-center justify-center p-4 text-center bg-gradient-to-b from-purple-950 via-purple-900 to-purple-950 text-alabaster border border-gold/30 select-none">
          <div className="h-10 w-10 rounded-full bg-purple-900/90 border border-gold/50 flex items-center justify-center text-gold mb-2.5 shadow-sm">
            <Sparkles size={18} />
          </div>
          <span className="font-serif text-xs sm:text-sm font-medium text-amber-200">
            Archival Photograph
          </span>
          <span className="text-[0.62rem] uppercase tracking-wider text-purple-300 mt-1">
            Image Coming Soon
          </span>
        </div>
      )}

      {/* Vignette Overlay */}
      {isAvailable && (
        <div className="absolute inset-0 bg-gradient-to-t from-purple-950/70 via-transparent to-transparent opacity-60 group-hover:opacity-90 transition-opacity pointer-events-none" />
      )}

      {/* Top Hover Pill */}
      {isAvailable && (
        <div className="absolute top-2.5 right-2.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-950/80 text-gold border border-gold/40 shadow-sm backdrop-blur-sm">
            <Maximize2 size={14} />
          </div>
        </div>
      )}

      {/* Bottom Title */}
      {isAvailable && (
        <div className="absolute bottom-0 inset-x-0 p-2.5 sm:p-3 flex items-center justify-between text-alabaster z-10 pointer-events-none">
          <span className="font-serif text-xs sm:text-sm font-medium drop-shadow-sm text-alabaster">
            {item.title}
          </span>
          <span className="text-[0.62rem] tracking-wider text-gold/90 font-medium uppercase opacity-0 group-hover:opacity-100 transition-opacity">
            Tap to view
          </span>
        </div>
      )}
    </div>
  );
}

export default function Gallery({
  showHeader = true,
}: {
  showHeader?: boolean;
}) {
  const [selectedYear, setSelectedYear] = useState<string>("All");
  const [activePhoto, setActivePhoto] = useState<MediaItem | null>(null);
  const [lightboxError, setLightboxError] = useState<boolean>(false);
  const archiveRef = useRef<HTMLDivElement>(null);

  // Reset lightbox error when active photo changes
  useEffect(() => {
    setLightboxError(false);
  }, [activePhoto]);

  // Filter year archives (only photos for the grid)
  const displayedGalleries: YearGallery[] =
    selectedYear === "All"
      ? galleryData
      : galleryData.filter((g) => g.year === selectedYear);

  // Compute valid photos list for Lightbox navigation (opens only for valid photo items)
  const allPhotos: MediaItem[] = displayedGalleries.flatMap((g) =>
    g.items.filter((it) => it.type === "photo" && !it.unavailable)
  );

  const activeIndex = activePhoto
    ? allPhotos.findIndex((it) => it.id === activePhoto.id)
    : -1;

  // Move forward or backwards in Lightbox
  const moveLightbox = useCallback(
    (direction: number) => {
      if (!activePhoto || allPhotos.length === 0) return;
      const curIdx = allPhotos.findIndex((it) => it.id === activePhoto.id);
      if (curIdx === -1) return;
      const nextIdx = (curIdx + direction + allPhotos.length) % allPhotos.length;
      setActivePhoto(allPhotos[nextIdx]);
    },
    [activePhoto, allPhotos]
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

  const scrollToArchive = () => {
    archiveRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <Section id="gallery" className="bg-alabaster">
      {/* Section Header */}
      {showHeader && (
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
              <span>{galleryStats.totalPhotos} High-Res Photos</span>
            </div>
            <button
              type="button"
              onClick={scrollToArchive}
              className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-white px-3.5 py-1.5 shadow-sm text-purple-950 transition-colors hover:border-gold hover:text-gold"
            >
              <Film size={14} className="text-gold" />
              <span>{galleryStats.totalVideos} Recital Films (Curated Archive)</span>
            </button>
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-white px-3.5 py-1.5 shadow-sm">
              <Calendar size={14} className="text-gold" />
              <span>6 Classical Seasons</span>
            </div>
          </div>
        </header>
      )}

      {/* Year Filter Tabs (2026 first down to 2021) */}
      <div className="mb-8 sm:mb-12 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-purple-200/80 pb-4">
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
            All Years ({galleryStats.totalPhotos})
          </button>
          {galleryData.map((g) => (
            <button
              key={g.year}
              type="button"
              onClick={() => setSelectedYear(g.year)}
              className={`min-h-[38px] px-3.5 rounded-full text-xs font-semibold tracking-wider transition-all shrink-0 active:scale-95 ${
                selectedYear === g.year
                  ? "bg-purple-900 text-alabaster shadow-md"
                  : "bg-white border border-purple-200 text-purple-900 hover:border-gold"
              }`}
            >
              {g.year} ({g.totalPhotos})
            </button>
          ))}
        </div>

        {/* Quick jump to Recital Film Archive */}
        <button
          type="button"
          onClick={scrollToArchive}
          className="inline-flex items-center gap-2 rounded-lg border border-purple-200 bg-white px-3.5 py-2 text-xs font-medium text-purple-900 transition-all hover:border-gold hover:text-gold active:scale-95 self-start sm:self-auto shrink-0 shadow-sm"
        >
          <Film size={15} className="text-gold" />
          <span>Recital Film Archive ({galleryStats.totalVideos})</span>
        </button>
      </div>

      {/* Year-by-Year Photo Feed (2026 at the top down to 2021) */}
      <div className="space-y-14 sm:space-y-20">
        {displayedGalleries.map((yearGroup) => {
          const yearPhotos = yearGroup.items.filter((it) => it.type === "photo");

          if (yearPhotos.length === 0) return null;

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
                  <span className="text-[0.68rem] uppercase tracking-wider font-semibold text-vermilion-700">
                    Classical Showcase
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-ink/70">
                  <Camera size={13} className="text-gold" />
                  <span>{yearPhotos.length} Photos</span>
                </div>
              </div>

              {/* Google Photos Mosaic Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-3 md:gap-4 auto-rows-[150px] sm:auto-rows-[180px] md:auto-rows-[200px] grid-flow-dense">
                {yearPhotos.map((photo, idx) => {
                  let frame = framePattern[idx % framePattern.length];
                  if (yearPhotos.length <= 4 && frame === "big") {
                    frame = "wide";
                  }

                  return (
                    <PhotoPreviewCard
                      key={photo.id}
                      item={photo}
                      frame={frame}
                      onSelect={() => setActivePhoto(photo)}
                    />
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      {/* Refined Recital Film Archive Zone */}
      <div
        ref={archiveRef}
        id="recital-films"
        className="mt-20 sm:mt-28 overflow-hidden rounded-2xl border border-gold/40 bg-purple-950 text-alabaster shadow-2xl relative"
      >
        {/* Classical Header Banner */}
        <div className="w-full bg-gradient-to-r from-purple-900 via-purple-800 to-purple-900 py-2.5 px-4 text-gold font-semibold text-xs uppercase tracking-[0.22em] flex items-center justify-center gap-2.5 border-b border-gold/30 select-none">
          <Sparkles size={14} className="shrink-0 text-gold" />
          <span>Coming Soon: Recital Film Archive</span>
          <Sparkles size={14} className="shrink-0 text-gold" />
        </div>

        {/* Ambient Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gold/10 via-transparent to-transparent pointer-events-none" />

        {/* Main Content */}
        <div className="relative z-10 p-6 sm:p-10 lg:p-14">
          <div className="max-w-3xl mx-auto text-center">
            {/* Elegant Icon Badge */}
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full border border-gold/60 bg-purple-900/80 text-gold shadow-gold-sm mb-5">
              <Film size={28} />
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-purple-900/60 px-4 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-gold mb-4 backdrop-blur-sm">
              <Sparkles size={12} className="text-gold" />
              <span>Cinematic Heritage</span>
            </div>

            <h3 className="font-serif text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-white mb-3">
              Coming Soon: Recital Film Archive
            </h3>

            <p className="font-serif text-base sm:text-lg text-amber-200/90 italic mb-5 max-w-2xl mx-auto">
              A curated collection of performances and studio moments is being prepared.
            </p>

            <p className="text-sm xs:text-base leading-relaxed text-purple-200/90 max-w-2xl mx-auto font-light mb-8">
              Our recital film repository brings together 47 recorded performances, Tarangam brass plate invocations, and classroom rehearsals preserved across six classical seasons (2021–2026). Each presentation is intentionally cataloged for classical archival viewing, honoring the sacred rhythms and expressive abhinaya of Kuchipudi. Experience featured highlights on our official channels.
            </p>

            {/* Video Archive Breakdown Chips */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 mb-10 text-left">
              {galleryData.map((g) => (
                <div
                  key={g.year}
                  className="rounded-xl border border-purple-800 bg-purple-900/50 p-3 text-center backdrop-blur-sm"
                >
                  <p className="font-serif text-xl font-bold text-gold">{g.year}</p>
                  <p className="text-[0.68rem] text-purple-300 uppercase tracking-wider mt-0.5">
                    {g.totalVideos} Films
                  </p>
                  <span className="inline-block mt-1 text-[0.58rem] uppercase tracking-widest text-amber-300/80 font-medium">
                    Archived
                  </span>
                </div>
              ))}
            </div>

            {/* Social Premiere CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 flex-wrap">
              <a
                href="https://www.youtube.com/@ABHINAYANARTAN/videos"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-lg bg-red-600 px-5 py-3 text-xs sm:text-sm font-semibold uppercase tracking-wider text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
              >
                <Youtube size={18} />
                <span>YouTube Channel</span>
              </a>
              <a
                href="https://www.instagram.com/abhinayanartan/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-lg border border-pink-500/70 bg-gradient-to-r from-purple-900 to-pink-900/60 px-5 py-3 text-xs sm:text-sm font-semibold uppercase tracking-wider text-white shadow-sm transition-transform hover:scale-105 active:scale-95"
              >
                <Instagram size={18} />
                <span>Instagram Feed</span>
              </a>
              <a
                href="https://www.facebook.com/share/1BxEr9bppM/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-lg border border-blue-500/70 bg-blue-900/60 px-5 py-3 text-xs sm:text-sm font-semibold uppercase tracking-wider text-white shadow-sm transition-transform hover:scale-105 active:scale-95"
              >
                <Facebook size={18} />
                <span>Facebook Page</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Refined Ribbon */}
        <div className="w-full bg-gradient-to-r from-purple-900 via-purple-850 to-purple-900 py-2.5 px-4 text-purple-200 text-xs tracking-wider flex items-center justify-center gap-2 border-t border-gold/30">
          <Sparkles size={13} className="text-gold" />
          <span>47 Mastered Kuchipudi Recitals Across 2021–2026 Archive</span>
          <Sparkles size={13} className="text-gold" />
        </div>
      </div>

      {/* Full-Screen Lightbox Modal for Photos */}
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
                <span className="text-xs text-purple-300 mr-2 hidden sm:inline">
                  {activeIndex + 1} / {allPhotos.length}
                </span>
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
                {lightboxError || activePhoto.unavailable ? (
                  <div className="flex flex-col items-center justify-center p-8 rounded-xl border border-gold/30 bg-purple-900/80 text-center max-w-md">
                    <div className="h-14 w-14 rounded-full bg-purple-950 border border-gold/50 flex items-center justify-center text-gold mb-3">
                      <Sparkles size={24} />
                    </div>
                    <h4 className="font-serif text-lg text-alabaster mb-1">Archival Photograph</h4>
                    <p className="text-xs text-purple-300">Image coming soon • Archival preservation in progress</p>
                  </div>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={activePhoto.src}
                    src={`${basePath}${activePhoto.src}`}
                    alt={activePhoto.alt || `${activePhoto.title} - Kuchipudi classical dance recital`}
                    onError={() => setLightboxError(true)}
                    className="max-h-[75vh] max-w-full object-contain rounded-xl shadow-2xl border border-purple-800"
                  />
                )}
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

              <div className="flex items-center gap-2 text-xs tracking-wider text-purple-300">
                <Sparkles size={14} className="text-gold" />
                <span>
                  {activePhoto.filename} ({activeIndex + 1} of {allPhotos.length})
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
