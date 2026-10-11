"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, ChevronDown } from "lucide-react";
import { hero } from "@/lib/content";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export default function Hero() {
  return (
    <section
      id="home"
      className="relative flex min-h-[100svh] items-center overflow-hidden bg-gradient-to-b from-purple-950 via-purple-900 to-purple-950 text-alabaster pt-20 pb-16 md:pt-24 md:pb-24"
    >
      {/* Background Graphic & Ambient Lighting */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <Image
          src={`${basePath}/logo-full.png`}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-contain object-center opacity-10 mix-blend-screen scale-110 md:object-[70%_center] md:scale-100"
        />
        {/* Golden ambient radial light behind content */}
        <div className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 h-[350px] w-[350px] sm:h-[500px] sm:w-[500px] rounded-full bg-gold/15 blur-[100px]" />
        {/* Deep purple vignette gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-purple-950 via-purple-900/60 to-purple-950/80" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 xs:px-6 sm:px-8 md:px-12">
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
          <h1 className="font-serif text-3xl xs:text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-medium tracking-tight leading-[1.08] text-alabaster">
            Experience the Divine Grace of{" "}
            <span className="bg-gold-gradient bg-clip-text text-transparent italic font-normal">
              Kuchipudi
            </span>
          </h1>

          {/* Subheadline */}
          <p className="mt-5 xs:mt-6 sm:mt-7 max-w-2xl text-sm xs:text-base sm:text-lg leading-relaxed text-purple-100/90 font-light">
            {hero.subheadline}
          </p>

          {/* CTA Actions */}
          <div className="mt-8 sm:mt-10 flex flex-col xs:flex-row items-stretch xs:items-center gap-3.5 sm:gap-5">
            <a
              href={hero.primaryCta.href}
              className="btn-primary text-center text-sm xs:text-base font-semibold tracking-wide"
            >
              {hero.primaryCta.label}
            </a>
            <a
              href={hero.secondaryCta.href}
              className="btn-gold-outline text-center text-sm xs:text-base group flex items-center justify-center gap-2"
            >
              <span>{hero.secondaryCta.label}</span>
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </a>
          </div>

          {/* Trust Badges */}
          <div className="mt-10 sm:mt-12 pt-6 border-t border-purple-700/60">
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
      </div>

      {/* Subtle Scroll Down Prompt for Mobile & Desktop */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
        className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-70 pointer-events-none"
      >
        <span className="text-[0.6rem] uppercase tracking-[0.25em] text-gold/80">Scroll</span>
        <ChevronDown size={14} className="text-gold" />
      </motion.div>
    </section>
  );
}