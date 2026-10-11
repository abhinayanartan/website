import { MessageCircle, PhoneCall, Sparkles } from "lucide-react";
import { contact } from "@/lib/content";

const whatsappNumber = contact.whatsapp.replace(/\D/g, "") || "919999999999";

export default function MobileActionBar() {
  return (
    <aside
      aria-label="Mobile quick actions"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-gold/50 bg-purple-950/95 backdrop-blur-lg px-3 pt-2 pb-[calc(0.6rem+env(safe-area-inset-bottom,0px))] md:hidden shadow-[0_-8px_30px_rgba(26,13,51,0.5)]"
    >
      <div className="grid grid-cols-3 gap-2 items-center">
        {/* Call Action */}
        <a
          href={`tel:${contact.phone}`}
          className="flex min-h-[46px] flex-col items-center justify-center rounded-lg border border-purple-800/80 bg-purple-900/60 text-[0.62rem] uppercase tracking-[0.14em] text-alabaster transition-all active:scale-95 active:bg-purple-800"
        >
          <PhoneCall size={16} className="text-gold mb-0.5" />
          <span>Call</span>
        </a>

        {/* WhatsApp Action */}
        <a
          href={`https://wa.me/${whatsappNumber}?text=Hello%20Abhinaya%20Nartan%2C%20I%20would%20like%20to%20learn%20more%20about%20Kuchipudi%20classes.`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-[46px] flex-col items-center justify-center rounded-lg border border-purple-800/80 bg-purple-900/60 text-[0.62rem] uppercase tracking-[0.14em] text-alabaster transition-all active:scale-95 active:bg-purple-800"
        >
          <MessageCircle size={16} className="text-emerald-400 mb-0.5" />
          <span>WhatsApp</span>
        </a>

        {/* Enroll Action - Highlighted Gold Pill */}
        <a
          href="#contact"
          className="flex min-h-[46px] flex-col items-center justify-center rounded-lg bg-gold text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-purple-950 shadow-gold-sm transition-all active:scale-95 active:brightness-95"
        >
          <Sparkles size={16} className="text-purple-950 mb-0.5" />
          <span>Enroll</span>
        </a>
      </div>
    </aside>
  );
}