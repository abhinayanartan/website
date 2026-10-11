"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState, useRef } from "react";
import { Sparkles, ChevronLeft, ChevronRight, RotateCw, Hand } from "lucide-react";
import Section from "./Section";
import { mudras } from "@/lib/content";

// Artistic classical gesture iconography SVG
function MudraIcon({ index }: { index: number }) {
  // Different artistic classical mudra motifs for each card
  switch (index) {
    case 0: // Pataka (Flag / Flat hand)
      return (
        <svg className="w-16 h-16 text-gold/80" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M32 6C28 14 26 24 26 36C26 46 29 54 32 58" strokeLinecap="round" />
          <path d="M38 10C34 18 33 28 33 40C33 48 35 55 38 58" strokeLinecap="round" />
          <path d="M44 16C41 23 40 32 40 42C40 48 42 54 44 58" strokeLinecap="round" />
          <path d="M26 36C22 36 18 34 16 30C14 26 15 22 18 20" strokeLinecap="round" />
          <circle cx="32" cy="32" r="28" stroke="currentColor" strokeDasharray="3 3" opacity="0.4" />
        </svg>
      );
    case 1: // Tripataka (Three Parts of Flag / bent ring finger)
      return (
        <svg className="w-16 h-16 text-gold/80" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M28 8C26 16 25 26 26 38C27 48 30 55 33 58" strokeLinecap="round" />
          <path d="M36 12C34 19 33 28 34 40C35 48 38 55 40 58" strokeLinecap="round" />
          <path d="M42 30C41 33 39 36 38 42" strokeLinecap="round" />
          <path d="M22 34C18 34 15 30 15 24" strokeLinecap="round" />
          <circle cx="32" cy="32" r="28" stroke="currentColor" strokeDasharray="3 3" opacity="0.4" />
        </svg>
      );
    case 2: // Sikhara (Spire / raised thumb fist)
      return (
        <svg className="w-16 h-16 text-gold/80" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M32 8V24" strokeLinecap="round" strokeWidth="2.5" />
          <rect x="22" y="24" width="20" height="26" rx="6" stroke="currentColor" />
          <path d="M22 32H42" strokeLinecap="round" opacity="0.6" />
          <path d="M22 40H42" strokeLinecap="round" opacity="0.6" />
          <circle cx="32" cy="32" r="28" stroke="currentColor" strokeDasharray="3 3" opacity="0.4" />
        </svg>
      );
    default: // Katakamukha (Opening in a Bracelet / joined fingers)
      return (
        <svg className="w-16 h-16 text-gold/80" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="32" cy="24" r="8" stroke="currentColor" strokeWidth="2" />
          <path d="M38 24C44 28 46 36 44 48" strokeLinecap="round" />
          <path d="M26 24C20 28 18 36 20 48" strokeLinecap="round" />
          <path d="M26 48C30 54 34 54 38 48" strokeLinecap="round" />
          <circle cx="32" cy="32" r="28" stroke="currentColor" strokeDasharray="3 3" opacity="0.4" />
        </svg>
      );
  }
}

export default function MudraShowcase() {
  const [active, setActive] = useState<number | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const container = scrollRef.current;
      const cardWidth = container.firstElementChild?.clientWidth || 280;
      const offset = direction === "left" ? -(cardWidth + 16) : cardWidth + 16;
      container.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  const scrollToSlide = (index: number) => {
    if (scrollRef.current) {
      const container = scrollRef.current;
      const card = container.children[index] as HTMLElement | undefined;
      if (card) {
        card.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
      }
      setCurrentSlide(index);
    }
  };

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const cardWidth = container.firstElementChild?.clientWidth || 280;
    const gap = 16;
    const slide = Math.round(container.scrollLeft / (cardWidth + gap));
    setCurrentSlide(Math.min(Math.max(slide, 0), mudras.items.length - 1));
  };

  const handleToggle = (index: number) => {
    setActive((prev) => (prev === index ? null : index));
  };

  return (
    <Section id="mudras" className="bg-gradient-to-b from-purple-950 via-purple-900 to-purple-950 text-alabaster">
      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16 items-start">
        {/* Section Header */}
        <header className="max-w-md">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-purple-900/80 px-3.5 py-1 mb-4">
            <Sparkles size={12} className="text-gold" />
            <span className="text-[0.68rem] uppercase tracking-[0.2em] text-gold font-medium">
              Living Glossary
            </span>
          </div>

          <h2 className="font-serif text-3xl xs:text-4xl sm:text-5xl lg:text-6xl font-medium leading-[1.12] text-white">
            {mudras.heading}
          </h2>

          <div className="gold-rule mt-5 mb-5" />

          <p className="text-sm xs:text-base leading-relaxed text-purple-100/90 font-light">
            {mudras.subtext}
          </p>

          {/* Interactive Mobile Guidance Hint */}
          <div className="mt-6 flex items-center gap-2.5 rounded-lg bg-purple-800/40 border border-purple-700/60 p-3 text-xs text-purple-200">
            <Hand size={16} className="text-gold shrink-0 animate-bounce" />
            <span>Tap any gesture card to reveal its divine storytelling meaning.</span>
          </div>

          {/* Carousel Arrows (Mobile & Tablet) */}
          <div className="mt-6 flex items-center gap-3 lg:hidden">
            <button
              type="button"
              onClick={() => scroll("left")}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/40 bg-purple-900/80 text-gold active:scale-95"
              aria-label="Previous mudra"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              onClick={() => scroll("right")}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/40 bg-purple-900/80 text-gold active:scale-95"
              aria-label="Next mudra"
            >
              <ChevronRight size={20} />
            </button>
            <span className="text-xs uppercase tracking-widest text-purple-300 ml-2">
              Swipe to explore
            </span>
          </div>
        </header>

        {/* Carousel / Grid Container */}
        <div>
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-6 pt-1 no-scrollbar lg:grid lg:grid-cols-2 lg:gap-6 lg:overflow-visible"
          >
            {mudras.items.map((mudra, index) => {
              const isActive = active === index;

              return (
                <div
                  key={mudra.name}
                  className="w-[82%] xs:w-[75%] sm:w-[60%] shrink-0 snap-start lg:w-auto"
                >
                  <motion.button
                    type="button"
                    onClick={() => handleToggle(index)}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    className={`relative w-full h-[320px] rounded-2xl border text-left p-6 transition-all duration-300 shadow-card flex flex-col justify-between overflow-hidden ${
                      isActive
                        ? "border-gold bg-gradient-to-br from-purple-800 via-purple-900 to-purple-950 shadow-gold-sm"
                        : "border-purple-700/70 bg-purple-900/80 hover:border-gold/60 hover:bg-purple-800/80"
                    }`}
                    aria-expanded={isActive}
                  >
                    {/* Background subtle radial ornament */}
                    <div className="absolute -top-12 -right-12 h-36 w-36 rounded-full bg-gold/10 blur-xl pointer-events-none" />

                    <AnimatePresence mode="wait">
                      {isActive ? (
                        /* Card Back: Meaning & Translation */
                        <motion.div
                          key="back"
                          initial={{ opacity: 0, rotateY: -15 }}
                          animate={{ opacity: 1, rotateY: 0 }}
                          exit={{ opacity: 0, rotateY: 15 }}
                          transition={{ duration: 0.3 }}
                          className="flex h-full flex-col justify-between z-10"
                        >
                          <div>
                            <div className="flex items-center justify-between border-b border-purple-700 pb-3 mb-4">
                              <span className="text-[0.68rem] uppercase tracking-[0.2em] text-gold font-semibold">
                                Sacred Meaning
                              </span>
                              <span className="text-xs font-serif text-purple-300">
                                {mudra.name}
                              </span>
                            </div>

                            <p className="font-serif text-base xs:text-lg sm:text-xl leading-relaxed text-gold-100">
                              {mudra.meaning}
                            </p>
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t border-purple-800/80">
                            <span className="text-[0.68rem] uppercase tracking-wider text-purple-300 italic">
                              &ldquo;{mudra.translation}&rdquo;
                            </span>
                            <span className="inline-flex items-center gap-1.5 text-[0.68rem] uppercase tracking-wider text-gold font-medium">
                              <RotateCw size={12} />
                              Flip Back
                            </span>
                          </div>
                        </motion.div>
                      ) : (
                        /* Card Front: Sanskrit Title, Icon, Translation */
                        <motion.div
                          key="front"
                          initial={{ opacity: 0, rotateY: 15 }}
                          animate={{ opacity: 1, rotateY: 0 }}
                          exit={{ opacity: 0, rotateY: -15 }}
                          transition={{ duration: 0.3 }}
                          className="flex h-full flex-col justify-between z-10"
                        >
                          {/* Top: Card index & subtle emblem */}
                          <div className="flex items-start justify-between">
                            <span className="font-serif text-3xl xs:text-4xl font-light text-purple-400">
                              0{index + 1}
                            </span>
                            <div className="h-9 w-9 rounded-full border border-gold/40 flex items-center justify-center bg-purple-950/40">
                              <Sparkles size={14} className="text-gold" />
                            </div>
                          </div>

                          {/* Center: Mudra Icon Artwork */}
                          <div className="flex justify-center py-2">
                            <MudraIcon index={index} />
                          </div>

                          {/* Bottom: Name & Translation */}
                          <div>
                            <h3 className="font-serif text-2xl xs:text-3xl text-white font-medium">
                              {mudra.name}
                            </h3>
                            <p className="mt-1 text-xs xs:text-sm text-gold italic">
                              &ldquo;{mudra.translation}&rdquo;
                            </p>

                            <div className="mt-3 flex items-center justify-between pt-3 border-t border-purple-700/50">
                              <span className="text-[0.65rem] uppercase tracking-[0.18em] text-purple-300">
                                Single Hand
                              </span>
                              <span className="inline-flex items-center gap-1 text-[0.65rem] uppercase tracking-wider text-gold font-medium">
                                Tap to reveal →
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>
                </div>
              );
            })}
          </div>

          {/* Indicator Dots for Mobile Screen */}
          <div className="mt-4 flex items-center justify-center gap-2 lg:hidden">
            {mudras.items.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => scrollToSlide(index)}
                className={`h-1.5 rounded-full transition-all ${
                  currentSlide === index ? "w-8 bg-gold" : "w-2 bg-purple-700"
                }`}
                aria-label={`Scroll to mudra ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="temple-divider mt-12 sm:mt-16" />
    </Section>
  );
}