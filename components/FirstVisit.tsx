import { ArrowUpRight, CalendarDays, MapPin, MessageCircle, Sparkles } from "lucide-react";
import Section from "./Section";
import { contact, firstVisit } from "@/lib/content";

const visitIcons = [MapPin, CalendarDays, Sparkles];
const cleanWhatsapp = contact.whatsapp.replace(/\D/g, "");

export default function FirstVisit() {
  return (
    <Section id="first-visit" className="bg-white">
      <div className="overflow-hidden rounded-3xl border border-purple-200/90 bg-gradient-to-br from-purple-950 via-purple-900 to-[#4A2879] text-alabaster shadow-xl">
        <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
          <div className="relative overflow-hidden p-6 sm:p-8 lg:p-10">
            <div className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-gold/20 blur-3xl" aria-hidden="true" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-purple-900/60 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-gold">
                <Sparkles size={13} aria-hidden="true" />
                <span>{firstVisit.eyebrow}</span>
              </div>
              <h2 className="mt-5 max-w-md font-serif text-3xl font-medium leading-tight sm:text-4xl">
                {firstVisit.heading}
              </h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-purple-100 sm:text-base">
                {firstVisit.subtext}
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <a
                  href={`https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent("Hello Abhinaya Nartan, I would like to plan a first visit and learn about a suitable Kuchipudi batch.")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-gold px-5 py-3 text-sm font-bold text-purple-950 shadow-gold-sm transition-transform hover:brightness-105 active:scale-[0.98]"
                >
                  <MessageCircle size={18} aria-hidden="true" />
                  <span>Plan a visit on WhatsApp</span>
                </a>
                <a
                  href={contact.mapEmbedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-gold/60 px-5 py-3 text-sm font-semibold text-gold transition-colors hover:bg-gold hover:text-purple-950"
                >
                  <MapPin size={18} aria-hidden="true" />
                  <span>Open directions</span>
                </a>
              </div>
            </div>
          </div>

          <div className="grid border-t border-white/10 bg-black/10 sm:grid-cols-3 lg:border-l lg:border-t-0">
            {firstVisit.details.map((detail, index) => {
              const Icon = visitIcons[index];

              return (
                <div key={detail.title} className="border-b border-white/10 p-5 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0 lg:p-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-gold">
                    <Icon size={19} aria-hidden="true" />
                  </div>
                  <h3 className="mt-5 font-serif text-lg font-medium text-white">{detail.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-purple-100">{detail.body}</p>
                  <p className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-gold">
                    <span>{detail.note}</span>
                    {index === 0 && <ArrowUpRight size={13} aria-hidden="true" />}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Section>
  );
}
