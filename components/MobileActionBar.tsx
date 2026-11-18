"use client";

import { MapPin, MessageCircle, PhoneCall } from "lucide-react";
import { contact } from "@/lib/content";

const whatsappNumber = contact.whatsapp.replace(/\D/g, "") || "919999999999";

export default function MobileActionBar() {
  return (
    <aside
      aria-label="Mobile quick actions"
      className="fixed inset-x-0 bottom-0 z-40 md:hidden pointer-events-none pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] px-3 transition-transform"
    >
      <div className="pointer-events-auto mx-auto max-w-sm rounded-full border border-gold/30 bg-purple-950/85 backdrop-blur-lg px-2 py-1.5 shadow-xl shadow-purple-950/40">
        <div className="grid grid-cols-[0.85fr_0.85fr_1.3fr] items-center gap-1.5">
          {/* Directions */}
          <a
            href={contact.mapEmbedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-11 items-center justify-center gap-1.5 rounded-full border border-purple-700/50 bg-purple-900/70 px-2 py-1 text-xs font-medium text-alabaster transition-all hover:text-gold active:scale-95 active:bg-purple-800"
            aria-label="Open directions to Abhinaya Nartan Academy"
          >
            <MapPin size={15} className="shrink-0 text-gold" />
            <span className="truncate">Map</span>
          </a>

          {/* Call Action */}
          <a
            href={`tel:${contact.phone}`}
            className="flex min-h-11 items-center justify-center gap-1.5 rounded-full border border-purple-700/50 bg-purple-900/70 px-2 py-1 text-xs font-medium text-alabaster transition-all hover:text-gold active:scale-95 active:bg-purple-800"
            aria-label="Call Abhinaya Nartan Academy"
          >
            <PhoneCall size={15} className="shrink-0 text-gold" />
            <span className="truncate">Call</span>
          </a>

          {/* WhatsApp is the primary, complete enquiry path. */}
          <a
            href={`https://wa.me/${whatsappNumber}?text=Hello%20Abhinaya%20Nartan%2C%20I%20would%20like%20to%20learn%20more%20about%20Kuchipudi%20classes.`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-11 items-center justify-center gap-1.5 rounded-full bg-emerald-600 px-2 py-1 text-xs font-bold text-white shadow-lg shadow-emerald-950/20 transition-all hover:bg-emerald-500 active:scale-95"
            aria-label="Chat with Abhinaya Nartan Academy on WhatsApp to plan classes"
          >
            <MessageCircle size={16} className="shrink-0" />
            <span className="truncate">Chat to enroll</span>
          </a>
        </div>
      </div>
    </aside>
  );
}
