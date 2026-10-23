"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Instagram,
  Facebook,
  Youtube,
  ArrowUp,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";
import { footer, contact } from "@/lib/content";

const icons = { instagram: Instagram, facebook: Facebook, youtube: Youtube };
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export default function Footer() {
  const pathname = usePathname();
  const isGalleryPage = pathname?.startsWith("/gallery");

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative bg-purple-950 text-purple-100 pt-16 pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] md:pb-12">
      <div className="temple-divider absolute left-0 right-0 top-0" />

      <div className="mx-auto grid max-w-7xl gap-10 px-5 pt-8 md:grid-cols-3 md:gap-12 md:px-8">
        {/* Brand Information */}
        <div>
          <Link
            href="/"
            className="inline-block rounded-xl border border-gold/50 bg-white p-3.5 shadow-gold-sm mb-5 transition-transform hover:scale-[1.02]"
          >
            <Image
              src={`${basePath}/logo-full.png`}
              alt="Abhinaya Nartan Dance Academy"
              width={220}
              height={140}
              className="h-auto w-48 object-contain"
            />
          </Link>
          <p className="max-w-xs text-sm leading-relaxed text-purple-200">
            {footer.tagline}
          </p>
          <div className="mt-4 flex items-center gap-2 text-xs uppercase tracking-widest text-gold">
            <Sparkles size={13} />
            <span>Kuchipudi Vidya Peetham</span>
          </div>
        </div>

        {/* Directory Links */}
        <div>
          <h2 className="mb-4 font-serif text-xl sm:text-2xl text-gold">
            Academy Directory
          </h2>
          <ul className="space-y-2.5">
            {footer.links.map((link) => {
              const targetHref =
                isGalleryPage && link.href.startsWith("#")
                  ? `/${link.href}`
                  : link.href;

              return (
                <li key={`${link.label}-${link.href}`}>
                  <Link
                    href={targetHref}
                    className="text-sm text-purple-200 transition-colors hover:text-gold active:text-gold"
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Studio Visiting & Class Schedule Concise Reference */}
        <div>
          <h2 className="mb-4 font-serif text-xl sm:text-2xl text-gold">
            Studio &amp; Classes
          </h2>
          <div className="max-w-xs text-xs xs:text-sm leading-relaxed text-purple-200 space-y-2.5">
            <div>
              <span className="text-white font-medium block">Weekly Batches:</span>
              <span>Mon, Wed, Fri &amp; Sun</span>
            </div>
            <div>
              <span className="text-white font-medium block">Studio Location:</span>
              <span>{contact.location}</span>
            </div>
            <div className="pt-1">
              <Link
                href={isGalleryPage ? "/#contact" : "#contact"}
                className="inline-flex items-center gap-1 text-gold hover:underline font-medium text-xs transition-colors"
              >
                <span>View full schedule &amp; enroll</span>
                <ArrowUpRight size={13} />
              </Link>
            </div>
          </div>

          <div className="mt-6">
            <p className="text-[0.68rem] uppercase tracking-wider text-purple-300 mb-2.5">
              Connect on Social
            </p>
            <div className="flex gap-3">
              {footer.socials.map((social) => {
                const Icon =
                  icons[social.platform as keyof typeof icons] || Instagram;
                return (
                  <a
                    key={social.platform}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${social.platform}: ${social.label}`}
                    className="flex h-11 w-11 items-center justify-center rounded-lg border border-purple-800 bg-purple-900/60 text-gold transition-all hover:border-gold hover:bg-gold/10 active:scale-95"
                  >
                    <Icon size={18} />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Copyright & Back to Top Row */}
      <div className="mt-12 border-t border-purple-900 px-5 pt-6 text-center md:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-xs text-purple-300">{footer.copyright}</p>
          <button
            type="button"
            onClick={scrollToTop}
            className="inline-flex items-center gap-1.5 rounded-full border border-purple-800 bg-purple-900/80 px-4 py-2 text-xs text-gold hover:border-gold active:scale-95"
          >
            <span>Back to top</span>
            <ArrowUp size={14} />
          </button>
        </div>
      </div>
    </footer>
  );
}
