"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Maximize2, X, Sparkles, Image as ImageIcon } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import Section from "./Section";
import { gallery } from "@/lib/content";

type GalleryItem = {
  id: number;
  title: string;
  category: "Performances" | "Workshops" | "Costumes";
  tone: string;
  aspect: string;
  subtitle: string;
};

const items: GalleryItem[] = [
  {
    id: 1,
    title: "Rangapravesham Stage Recital",
    category: "Performances",
    tone: "from-purple-900 to-purple-950 text-alabaster",
    aspect: "aspect-[4/5]",
    subtitle: "Sacred invocation & Tarangam footwork",
  },
  {
    id: 2,
    title: "Navarasa Abhinaya Intensive",
    category: "Workshops",
    tone: "from-gold-100 to-amber-50 text-purple-900",
    aspect: "aspect-[4/3]",
    subtitle: "Mastering the nine classical emotional states",
  },
  {
    id: 3,
    title: "Traditional Brass Plate Tarangam",
    category: "Performances",
    tone: "from-purple-800 to-purple-900 text-alabaster",
    aspect: "aspect-[3/4]",
    subtitle: "Rhythmic balance on the rim of the brass thali",
  },
  {
    id: 4,
    title: "Silk Kanjeevaram & Temple Jewelry",
    category: "Costumes",
    tone: "from-amber-100 to-gold-50 text-purple-900",
    aspect: "aspect-square",
    subtitle: "Handcrafted pleated silk and Surya-Chandra ornaments",
  },
  {
    id: 5,
    title: "Guru-Shishya Parampara Sadhana",
    category: "Workshops",
    tone: "from-purple-100 to-purple-50 text-purple-900",
    aspect: "aspect-[4/5]",
    subtitle: "Daily adavus practice in the morning light",
  },
  {
    id: 6,
    title: "Ananda Tandavam Choreography",
    category: "Performances",
    tone: "from-purple-950 to-purple-900 text-alabaster",
    aspect: "aspect-[16/10]",
    subtitle: "Celebration of cosmic divine energy through dance",
  },
];

const categories = ["All", "Performances", "Workshops", "Costumes"] as const;

export default function Gallery() {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [selected, setSelected] = useState<number | null>(null);

  const filteredItems =
    activeCategory === "All"
      ? items
      : items.filter((item) => item.category === activeCategory);

  const move = useCallback(
    (direction: number) => {
      setSelected((prev) => {
        if (prev === null || filteredItems.length === 0) return null;
        const currentIndex = filteredItems.findIndex((it) => it.id === prev);
        if (currentIndex === -1) return filteredItems[0]?.id ?? null;
        const nextIndex =
          (currentIndex + direction + filteredItems.length) % filteredItems.length;
        return filteredItems[nextIndex]?.id ?? null;
      });
    },
    [filteredItems]
  );

  // Lock body scroll when modal is open
  useEffect(() => {
    if (selected !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selected]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (selected === null) return;
      if (event.key === "Escape") setSelected(null);
      if (event.key === "ArrowRight") move(1);
      if (event.key === "ArrowLeft") move(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected, move]);

  const activeItem = items.find((it) => it.id === selected);
  const currentFilteredIndex = filteredItems.findIndex((it) => it.id === selected);

  return (
    <Section id="gallery" className="bg-alabaster">
      <header className="mb-8 sm:mb-12 max-w-2xl">
        <div className="section-eyebrow mb-3">
          <span className="h-1.5 w-1.5 rounded-full bg-vermilion" />
          Studio Moments & Stages
        </div>
        <h2 className="section-title">{gallery.heading}</h2>
        <div className="gold-rule mt-5 mb-5" />
        <p className="text-sm xs:text-base leading-relaxed text-ink/80 sm:text-lg">
          {gallery.subtext}
        </p>

        {/* Category Filters (Mobile Horizontal Scroll) */}
        <div className="mt-7 flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`min-h-[40px] px-4 rounded-full text-xs uppercase tracking-wider font-medium transition-all shrink-0 active:scale-95 ${
                activeCategory === cat
                  ? "bg-purple-900 text-alabaster shadow-md"
                  : "bg-white border border-purple-200 text-purple-800 hover:border-gold"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      {/* Masonry Columns for Mobile & Tablet */}
      <div className="columns-1 xs:columns-2 lg:columns-3 gap-3 sm:gap-4 space-y-3 sm:space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredItems.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="break-inside-avoid"
            >
              <button
                type="button"
                onClick={() => setSelected(item.id)}
                className={`group relative w-full ${item.aspect} rounded-2xl overflow-hidden border border-purple-200/80 bg-gradient-to-br ${item.tone} p-5 text-left shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between`}
              >
                {/* Top Tag & Zoom Pill */}
                <div className="flex items-center justify-between w-full z-10">
                  <span className="rounded-full bg-black/20 backdrop-blur-sm px-2.5 py-1 text-[0.62rem] uppercase tracking-wider font-medium">
                    {item.category}
                  </span>
                  <span className="h-8 w-8 rounded-full bg-gold/20 flex items-center justify-center opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all">
                    <Maximize2 size={14} className="text-gold" />
                  </span>
                </div>

                {/* Decorative Center Emblem */}
                <div className="flex flex-col items-center justify-center my-auto py-4 opacity-40 group-hover:opacity-60 transition-opacity">
                  <Sparkles size={28} className="text-gold mb-1" />
                  <span className="text-[0.65rem] uppercase tracking-[0.2em] font-medium">
                    Abhinaya Nartan
                  </span>
                </div>

                {/* Bottom Details */}
                <div className="z-10 pt-2 border-t border-current/20">
                  <h3 className="font-serif text-lg xs:text-xl font-medium leading-snug">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-xs opacity-80 line-clamp-2">
                    {item.subtitle}
                  </p>
                  <div className="mt-2 flex items-center gap-1.5 text-[0.65rem] uppercase tracking-wider text-gold font-medium">
                    <span>View Story</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Lightbox Modal (Optimized for Mobile Touch) */}
      <AnimatePresence>
        {selected !== null && activeItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex flex-col justify-between bg-purple-950/95 backdrop-blur-md p-4 sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-label="Moment viewer"
            onClick={() => setSelected(null)}
          >
            {/* Modal Top Bar */}
            <div
              className="flex items-center justify-between pb-3 border-b border-purple-800 text-alabaster max-w-4xl w-full mx-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div>
                <span className="text-[0.68rem] uppercase tracking-widest text-gold font-semibold">
                  {activeItem.category}
                </span>
                <h3 className="font-serif text-lg sm:text-xl text-alabaster">
                  {activeItem.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="h-11 w-11 rounded-full bg-purple-900 border border-gold/40 flex items-center justify-center text-gold active:scale-95"
                aria-label="Close moment viewer"
              >
                <X size={22} />
              </button>
            </div>

            {/* Modal Content Frame */}
            <div
              className="my-auto mx-auto max-w-2xl w-full flex items-center justify-center p-2"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className={`relative w-full rounded-2xl border-2 border-gold/70 bg-gradient-to-br ${activeItem.tone} p-8 sm:p-12 shadow-2xl flex flex-col items-center justify-center text-center`}
              >
                <div className="h-16 w-16 rounded-full bg-gold/20 border border-gold flex items-center justify-center mb-6">
                  <ImageIcon size={30} className="text-gold" />
                </div>
                <span className="text-xs uppercase tracking-[0.25em] text-gold font-medium mb-2">
                  Classical Performance Archive
                </span>
                <h4 className="font-serif text-2xl sm:text-3xl font-medium mb-4">
                  {activeItem.title}
                </h4>
                <p className="max-w-md text-sm sm:text-base leading-relaxed opacity-90">
                  {activeItem.subtitle}
                </p>
                <div className="mt-8 flex items-center gap-2 text-xs uppercase tracking-wider text-gold border border-gold/40 px-4 py-2 rounded-full">
                  <Sparkles size={14} />
                  <span>Abhinaya Nartan Cultural Showcase</span>
                </div>
              </div>
            </div>

            {/* Modal Bottom Controls */}
            <div
              className="flex items-center justify-between pt-3 border-t border-purple-800 max-w-4xl w-full mx-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => move(-1)}
                className="flex items-center gap-2 h-11 px-4 rounded-full bg-purple-900 border border-purple-700 text-alabaster text-xs uppercase tracking-wider active:scale-95"
              >
                <ChevronLeft size={18} className="text-gold" />
                <span className="hidden xs:inline">Previous</span>
              </button>

              <span className="text-xs uppercase tracking-widest text-purple-300">
                {currentFilteredIndex + 1} / {filteredItems.length}
              </span>

              <button
                type="button"
                onClick={() => move(1)}
                className="flex items-center gap-2 h-11 px-4 rounded-full bg-purple-900 border border-purple-700 text-alabaster text-xs uppercase tracking-wider active:scale-95"
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