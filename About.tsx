"use client";

import { motion } from "framer-motion";
import { User } from "lucide-react";
import Section from "./Section";
import { about } from "@/lib/content";

export default function About() {
  return (
    <Section id="about" className="bg-white">
      <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
        {/* Text side */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <p className="section-eyebrow mb-3">Our Story</p>
          <h2 className="section-title mb-6">{about.heading}</h2>
          <div className="mb-8 h-px w-24 bg-gold-gradient" />
          <div className="space-y-5 text-lg leading-relaxed text-ink/80">
            {about.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          <a href="#mudras" className="btn-outline mt-10">
            Discover the Mudras
          </a>
        </motion.div>

        {/* Image side */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="relative mx-auto w-full max-w-md"
        >
          {/* offset gold frame */}
          <div className="absolute -bottom-4 -right-4 h-full w-full rounded-t-[10rem] rounded-b-3xl border-2 border-gold" />
          {/* Replace this div with <Image src="/founder.jpg" ... /> */}
          <div className="relative flex aspect-[4/5] w-full flex-col items-center justify-center overflow-hidden rounded-t-[10rem] rounded-b-3xl border-4 border-purple-300 bg-gradient-to-b from-purple-100 to-purple-50 shadow-soft">
            <User className="h-24 w-24 text-purple-300" strokeWidth={1} />
            <p className="mt-3 text-sm uppercase tracking-widest text-purple-400">Founder Photo</p>
          </div>

          {/* Quote card */}
          <figure className="absolute -bottom-10 -left-4 max-w-[280px] rounded-2xl bg-purple-900 p-6 shadow-soft sm:-left-10">
            <blockquote className="font-serif text-sm italic leading-relaxed text-gold-100">
              “{about.quote}”
            </blockquote>
            <figcaption className="mt-3 text-xs uppercase tracking-widest text-gold">
              — Our Founder
            </figcaption>
          </figure>
        </motion.div>
      </div>
    </Section>
  );
}
