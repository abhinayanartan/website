"use client";

import { MessageCircle, PhoneCall, Sparkles } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { contact } from "@/lib/content";

const whatsappNumber = contact.whatsapp.replace(/\D/g, "") || "919999999999";

export default function MobileActionBar() {
  const pathname = usePathname();
  const isGalleryPage = pathname?.startsWith("/gallery");
  const enrollHref = isGalleryPage ? "/#contact" : "#contact";

  return (
    <aside
      aria-label="Mobile quick actions"
      className="fixed inset-x-0 bottom-0 z-40 md:hidden pointer-events-none pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] px-3 transition-transform"
    >
      <div className="pointer-events-auto mx-auto max-w-sm rounded-full border border-gold/30 bg-purple-950/85 backdrop-blur-lg px-2 py-1.5 shadow-xl shadow-purple-950/40">
        <div className="grid grid-cols-3 gap-1.5 items-center">
          {/* Call Action */}
          <a
            href={`tel:${contact.phone}`}
            className="flex min-h-[40px] items-center justify-center gap-1.5 rounded-full bg-purple-900/70 px-2 py-1 text-xs font-medium text-alabaster border border-purple-700/50 transition-all active:scale-95 active:bg-purple-800 hover:text-gold"
            aria-label="Call Abhinaya Nartan Academy"
          >
            <PhoneCall size={14} className="text-gold shrink-0" />
            <span className="truncate">Call</span>
          </a>

          {/* WhatsApp Action */}
          <a
            href={`https://wa.me/${whatsappNumber}?text=Hello%20Abhinaya%20Nartan%2C%20I%20would%20like%20to%20learn%20more%20about%20Kuchipudi%20classes.`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-[40px] items-center justify-center gap-1.5 rounded-full bg-purple-900/70 px-2 py-1 text-xs font-medium text-alabaster border border-purple-700/50 transition-all active:scale-95 active:bg-purple-800 hover:text-emerald-300"
            aria-label="Chat on WhatsApp"
          >
            <MessageCircle size={14} className="text-emerald-400 shrink-0" />
            <span className="truncate">WhatsApp</span>
          </a>

          {/* Enroll Action - Compact Gold Pill */}
          <Link
            href={enrollHref}
            className="flex min-h-[40px] items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-gold to-amber-400 px-2 py-1 text-xs font-semibold text-purple-950 shadow-gold-sm transition-all active:scale-95 hover:brightness-105"
            aria-label="Enroll in Kuchipudi dance classes"
          >
            <Sparkles size={14} className="text-purple-950 shrink-0" />
            <span className="truncate">Enroll</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}
