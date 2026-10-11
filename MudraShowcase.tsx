"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Hand } from "lucide-react";
import Section from "./Section";
import { mudras } from "@/lib/content";

export default function MudraShowcase() {
  // active = hovered (desktop) or tapped (mobile)
  const [active, setActive] = useState<number | null>(null);

  return (
    <Section id="mudras" className="bg-gradient-to-b from-alabaster to-purple-50">
      <header className="mx-auto mb-14 max-w-2xl text-center">
        <p className="section-eyebrow mb-3">Mudra Showcase</p>
        <h2 className="section-title mb-5">{mudras.heading}</h2>
        <div className="gold-rule mb-6" />
        <p className="text-lg text-ink/75">{mudras.subtext}</p>
      </header>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {mudras.items.map((m, i) => {
          const isActive = active === i;
          return (
            <motion.button
              key={m.name}
              type="button"
              onHoverStart={() => setActive(i)}
              onHoverEnd={() => setActive(null)}
              onClick={() => setActive(isActive ? null : i)}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(null)}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.12 }}
              whileHover={{ y: -8 }}
              aria-expanded={isActive}
              className={`relative flex h-80 flex-col items-center justify-center overflow-hidden rounded-3xl border-2 p-6 text-center transition-colors duration-500 ${
                isActive
                  ? "border-gold bg-purple-800 shadow-gold"
                  : "border-purple-100 bg-white shadow-soft"
              }`}
            >
              {/* Front: icon + name */}
              <motion.div
                animate={{ y: isActive ? -50 : 0, scale: isActive ? 0.8 : 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="flex flex-col items-center"
              >
                <div
                  className={`mb-5 flex h-20 w-20 items-center justify-center rounded-full transition-colors duration-500 ${
                    isActive ? "bg-gold" : "bg-purple-50"
                  }`}
                >
                  <Hand
                    className={isActive ? "text-purple-900" : "text-purple"}
                    size={38}
                    strokeWidth={1.5}
                  />
                </div>
                <h3
                  className={`font-serif text-2xl font-bold transition-colors duration-500 ${
                    isActive ? "text-gold" : "text-purple-800"
                  }`}
                >
                  {m.name}
                </h3>
                <p
                  className={`mt-1 text-sm italic transition-colors duration-500 ${
                    isActive ? "text-gold-200" : "text-vermilion"
                  }`}
                >
                  {m.translation}
                </p>
              </motion.div>

              {/* Back: meaning reveal */}
              <AnimatePresence>
                {isActive && (
                  <motion.p
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 30 }}
                    transition={{ duration: 0.35 }}
                    className="absolute inset-x-6 bottom-8 text-sm leading-relaxed text-purple-50"
                  >
                    {m.meaning}
                  </motion.p>
                )}
              </AnimatePresence>

              {!isActive && (
                <span className="absolute bottom-5 text-xs uppercase tracking-widest text-ink/40">
                  Hover to reveal
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
    </Section>
  );
}
