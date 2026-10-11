"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { hero } from "@/lib/content";

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const blobY = useTransform(scrollYProgress, [0, 1], ["0%", "60%"]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section
      id="home"
      ref={ref}
      className="relative flex h-screen min-h-[640px] items-center justify-center overflow-hidden bg-alabaster"
    >
      {/* Parallax background */}
      <motion.div style={{ y: bgY }} className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-50 via-alabaster to-gold-50" />
        <Image
          src="/logo-full.png"
          alt=""
          fill
          priority
          className="object-contain opacity-[0.06]"
          aria-hidden
        />
      </motion.div>
      <motion.div style={{ y: blobY }} className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-24 top-1/4 h-96 w-96 rounded-full bg-purple/20 blur-3xl" />
        <div className="absolute -right-24 bottom-1/4 h-96 w-96 rounded-full bg-gold/25 blur-3xl" />
        <div className="absolute left-1/2 top-2/3 h-64 w-64 -translate-x-1/2 rounded-full bg-vermilion/10 blur-3xl" />
      </motion.div>

      {/* Content */}
      <motion.div style={{ opacity: fade }} className="mx-auto max-w-4xl px-6 pt-20 text-center">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="section-eyebrow mb-6"
        >
          Abhinaya Nartan Dance Academy
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.15 }}
          className="font-serif text-5xl font-bold leading-[1.1] text-purple-800 md:text-7xl"
        >
          Experience the Divine Grace of{" "}
          <span className="bg-gold-gradient bg-clip-text text-transparent">Kuchipudi</span>
        </motion.h1>

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.35 }}
          className="mx-auto mt-8 max-w-2xl font-sans text-lg font-normal leading-relaxed text-ink/75 md:text-xl"
        >
          {hero.subheadline}
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.55 }}
          className="mt-12 flex flex-col items-center justify-center gap-6 sm:flex-row"
        >
          <a href={hero.primaryCta.href} className="btn-primary text-lg">
            {hero.primaryCta.label}
          </a>
          <a
            href={hero.secondaryCta.href}
            className="group font-medium text-purple transition hover:text-purple-700"
          >
            {hero.secondaryCta.label}
            <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">→</span>
          </a>
        </motion.div>
      </motion.div>

      {/* Scroll cue */}
      <motion.div
        style={{ opacity: fade }}
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-8 left-1/2 h-10 w-6 -translate-x-1/2 rounded-full border-2 border-gold/70"
      >
        <span className="mx-auto mt-2 block h-2 w-1 rounded-full bg-gold" />
      </motion.div>
    </section>
  );
}
