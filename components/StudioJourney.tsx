import Link from "next/link";
import { ArrowRight, Footprints, Music2, Theater } from "lucide-react";
import Section from "./Section";
import { learningPath } from "@/lib/content";

const pathIcons = [Footprints, Music2, Theater];

export default function StudioJourney() {
  return (
    <Section id="learning-path" className="overflow-hidden bg-[#F6F1FB]">
      <div className="relative">
        <div
          className="pointer-events-none absolute -right-24 -top-20 h-72 w-72 rounded-full bg-gold/15 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative max-w-3xl">
          <div className="section-eyebrow mb-3">
            <span className="h-1.5 w-1.5 rounded-full bg-vermilion" />
            {learningPath.eyebrow}
          </div>
          <h2 className="section-title">{learningPath.heading}</h2>
          <div className="gold-rule mt-4 mb-4 sm:mt-5 sm:mb-5" />
          <p className="max-w-2xl text-sm leading-relaxed text-ink/80 sm:text-lg">
            {learningPath.subtext}
          </p>
        </div>

        <div className="relative mt-8 grid gap-4 md:mt-10 md:grid-cols-3 md:gap-5">
          {learningPath.paths.map((path, index) => {
            const Icon = pathIcons[index];

            return (
              <article
                key={path.title}
                className="group flex min-h-full flex-col rounded-2xl border border-purple-200/80 bg-white p-5 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-gold/70 hover:shadow-card-hover sm:p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-950 text-gold shadow-sm">
                    <Icon size={21} aria-hidden="true" />
                  </div>
                  <span className="font-serif text-3xl leading-none text-purple-100">
                    0{index + 1}
                  </span>
                </div>

                <p className="mt-6 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-vermilion-700">
                  {path.label}
                </p>
                <h3 className="mt-2 font-serif text-2xl font-medium leading-tight text-purple-900">
                  {path.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-ink/75">{path.description}</p>

                <div className="mt-5 border-t border-purple-100 pt-4">
                  <p className="text-xs font-semibold text-purple-800">{path.detail}</p>
                  <Link
                    href="#contact"
                    className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-purple-900 transition-colors hover:text-gold"
                  >
                    <span>{path.cta}</span>
                    <ArrowRight size={16} aria-hidden="true" className="transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>

        <div className="relative mt-6 flex flex-col gap-3 rounded-2xl border border-purple-200 bg-white/75 p-4 sm:mt-8 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <p className="text-sm text-ink/75">
            Not sure where to begin? A short conversation is enough to find the right starting point.
          </p>
          <Link
            href="#first-visit"
            className="inline-flex min-h-11 shrink-0 items-center gap-2 text-sm font-semibold text-purple-900 hover:text-gold"
          >
            <span>See your first-visit guide</span>
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </Section>
  );
}
