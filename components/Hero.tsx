"use client";

import Image from "next/image";
import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, ChevronDown } from "lucide-react";
import { hero } from "@/lib/content";
import RhythmFinderModal from "./RhythmFinderModal";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export default function Hero() {
  const [isFinderOpen, setIsFinderOpen] = useState(false);
  return (
    <section
      id="home"
      className="relative isolate flex min-h-[100svh] items-center overflow-hidden bg-gradient-to-b from-purple-950 via-purple-900 to-purple-950 pb-16 pt-20 text-alabaster md:pb-24 md:pt-24"
    >
      {/* Ambient background motif */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <Image
          src={`${basePath}/logo-full.png`}
          alt=""
          fill
          priority
          sizes="100vw"
          className="scale-110 object-contain object-center opacity-[0.07] md:object-[70%_center] md:scale-100"
        />
        <div className="absolute left-1/2 top-1/3 h-[350px] w-[350px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/15 blur-[100px] sm:h-[500px] sm:w-[500px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-purple-950 via-purple-900/60 to-purple-950/80" />
      </div>

      <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-10 px-4 xs:px-6 sm:px-8 md:px-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-3xl"
        >
          {/* Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-purple-900/80 px-3.5 py-1.5 backdrop-blur-sm mb-6">
            <Sparkles size={13} className="text-gold" />
            <span className="text-[0.68rem] xs:text-xs font-medium uppercase tracking-[0.2em] text-gold">
              Classical Kuchipudi Academy
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="font-serif text-3xl font-medium leading-[1.08] tracking-tight text-alabaster xs:text-4xl sm:text-6xl md:text-7xl">
            Experience the living grace of{" "}
            <span className="bg-gold-gradient bg-clip-text text-transparent italic font-normal">
              Kuchipudi
            </span>
          </h1>

          {/* Subheadline */}
          <p className="mt-5 xs:mt-6 sm:mt-7 max-w-2xl text-sm xs:text-base sm:text-lg leading-relaxed text-purple-100/90 font-light">
            {hero.subheadline}
          </p>

          {/* CTA Actions */}
          <div className="mt-8 flex flex-col items-stretch gap-3.5 xs:flex-row xs:items-center sm:mt-10 sm:gap-5">
            <a
              href={hero.primaryCta.href}
              className="btn-primary text-center text-sm xs:text-base font-semibold tracking-wide"
            >
              {hero.primaryCta.label}
            </a>
            <button
              type="button"
              onClick={() => setIsFinderOpen(true)}
              className="btn-gold-outline text-center text-sm xs:text-base group flex items-center justify-center gap-2"
            >
              <span>{hero.secondaryCta.label}</span>
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          {/* Trust Badges */}
          <div className="mt-10 border-t border-purple-700/60 pt-6 sm:mt-12">
            <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-[0.68rem] xs:text-xs uppercase tracking-[0.16em] text-purple-200">
              {hero.trust.map((item, index) => (
                <div key={item} className="flex items-center gap-3">
                  <span className="h-1.5 w-1.5 rounded-full bg-gold shrink-0" />
                  <span className="font-medium">{item}</span>
                  {index < hero.trust.length - 1 && (
                    <span className="hidden xs:inline text-purple-600 font-bold ml-2">/</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.figure
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.85, ease: "easeOut", delay: 0.14 }}
          className="relative mx-auto w-full max-w-md lg:max-w-none"
        >
          <div className="absolute -right-3 -top-3 hidden h-24 w-24 border-r border-t border-gold/70 sm:block" aria-hidden="true" />
          <div className="relative aspect-[4/4.7] overflow-hidden rounded-t-[9rem] rounded-b-3xl border border-gold/60 bg-purple-950 p-2 shadow-2xl shadow-purple-950/40 sm:rounded-t-[11rem]">
            <div className="relative h-full overflow-hidden rounded-t-[8.4rem] rounded-b-[1.25rem] sm:rounded-t-[10.4rem]">
              <Image
                src={`${basePath}/gallery/2026/2026%20p1.jpg`}
                alt="Two Abhinaya Nartan Kuchipudi dancers holding awards and certificates"
                fill
                priority
                sizes="(max-width: 640px) 90vw, (max-width: 1024px) 440px, 42vw"
                className="object-cover object-[center_42%]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-purple-950/90 via-purple-950/10 to-transparent" />
            </div>

            <figcaption className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-purple-950/80 px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-gold backdrop-blur-sm">
                <Sparkles size={12} aria-hidden="true" />
                <span>Celebrating the journey</span>
              </div>
              <p className="mt-3 max-w-xs font-serif text-lg leading-snug text-white sm:text-xl">
                A living academy tradition, shaped one dancer at a time.
              </p>
            </figcaption>
          </div>
        </motion.figure>
      </div>

      {/* Keep this desktop-only so it never competes with the iPhone action bar. */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
        className="pointer-events-none absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-1 opacity-70 md:flex"
      >
        <span className="text-[0.6rem] uppercase tracking-[0.25em] text-gold/80">Scroll</span>
        <ChevronDown size={14} className="text-gold" />
      </motion.div>

      {/* Interactive Batch Matcher Modal */}
      <RhythmFinderModal isOpen={isFinderOpen} onClose={() => setIsFinderOpen(false)} />
    </section>
  );
}
