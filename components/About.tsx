"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Award, Compass, HeartHandshake } from "lucide-react";
import Section from "./Section";
import { about } from "@/lib/content";

const statIcons = [Award, HeartHandshake, Compass];
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export default function About() {
  return (
    <Section id="about" className="bg-alabaster">
      <div className="grid items-center gap-10 sm:gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
        {/* Visual Portrait / Emblem Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative mx-auto w-full max-w-sm sm:max-w-md lg:order-2"
        >
          {/* Temple Arch Frame */}
          <div className="relative aspect-[4/5] overflow-hidden rounded-t-[10rem] rounded-b-2xl border-2 border-gold/70 bg-gradient-to-b from-purple-100 via-alabaster to-purple-50 shadow-soft p-4 flex flex-col items-center justify-center">
            {/* Inner decorative arch */}
            <div className="absolute inset-2 rounded-t-[9.5rem] rounded-b-xl border border-gold/30 pointer-events-none" />

            <div className="relative h-48 w-48 sm:h-56 sm:w-56">
              <Image
                src={`${basePath}/logo-full.png`}
                alt="Kuchipudi dancer at Abhinaya Nartan"
                fill
                sizes="(max-width: 640px) 200px, 240px"
                className="object-contain drop-shadow-md"
              />
            </div>

            {/* Subtle caption beneath emblem */}
            <div className="mt-4 text-center px-4">
              <p className="font-serif text-lg font-medium text-purple-900">
                Parampara & Grace
              </p>
              <p className="text-[0.68rem] uppercase tracking-[0.2em] text-vermilion">
                Classical Kuchipudi Lineage
              </p>
            </div>
          </div>

          {/* Floating Gold Badge */}
          <div className="absolute -bottom-4 -left-2 sm:-left-4 bg-purple-900 text-alabaster border border-gold/80 px-4 py-2.5 rounded-lg shadow-gold-sm flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-gold animate-pulse" />
            <span className="text-[0.68rem] uppercase tracking-[0.18em] text-gold font-medium">
              Authentic Artistry
            </span>
          </div>

          {/* Corner border detail */}
          <div className="absolute -top-3 -right-3 h-16 w-16 border-t-2 border-r-2 border-gold pointer-events-none hidden xs:block" />
        </motion.div>

        {/* Narrative / Academy Story */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="lg:order-1"
        >
          <div className="section-eyebrow mb-3">
            <span className="h-1.5 w-1.5 rounded-full bg-vermilion" />
            Our Heritage & Purpose
          </div>

          <h2 className="section-title max-w-xl">{about.heading}</h2>

          <div className="gold-rule mt-5 sm:mt-6 mb-6" />

          {/* Story Paragraphs */}
          <div className="space-y-4 text-sm xs:text-base leading-relaxed text-ink/85 sm:text-lg">
            {about.paragraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          {/* Featured Quote Callout */}
          <blockquote className="mt-8 rounded-r-xl border-l-4 border-gold bg-purple-50/70 p-4 sm:p-5 shadow-sm">
            <p className="font-serif text-lg xs:text-xl sm:text-2xl italic leading-snug text-purple-900">
              “{about.quote}”
            </p>
          </blockquote>

          {/* Academy Metrics / Stats Cards */}
          <div className="mt-8 sm:mt-10 grid grid-cols-3 gap-2 xs:gap-3 sm:gap-4">
            {about.stats.map((stat, index) => {
              const Icon = statIcons[index % statIcons.length];
              return (
                <div
                  key={stat.label}
                  className="flex flex-col items-center justify-center rounded-xl border border-purple-100 bg-white/90 p-3 sm:p-4 text-center shadow-card transition-transform active:scale-95"
                >
                  <Icon size={18} className="text-gold mb-1.5" />
                  <p className="font-serif text-2xl xs:text-3xl sm:text-4xl font-semibold text-purple-900 leading-none">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-[0.6rem] xs:text-[0.65rem] sm:text-xs uppercase tracking-wider text-vermilion font-medium">
                    {stat.label}
                  </p>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </Section>
  );
}