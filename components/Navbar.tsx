"use client";

import Image from "next/image";
import { Menu, X, Phone, MessageCircle, Mail } from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { contact } from "@/lib/content";

const links = [
  { href: "#about", label: "Our Heritage" },
  { href: "#mudras", label: "Mudras Glossary" },
  { href: "#gallery", label: "Studio Moments" },
  { href: "#contact", label: "Contact & Enroll" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const cleanWhatsapp = contact.whatsapp.replace(/\D/g, "");

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-alabaster/95 shadow-card backdrop-blur-md border-b border-purple-100/70"
          : "bg-gradient-to-b from-purple-950/80 via-purple-900/40 to-transparent"
      }`}
    >
      <nav className="mx-auto flex h-[68px] max-w-7xl items-center justify-between px-4 sm:px-6 md:px-8">
        {/* Brand Logo & Name */}
        <a
          href="#home"
          aria-label="Abhinaya Nartan home"
          className="group flex items-center gap-3 py-1 outline-none"
        >
          <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full border border-gold/40 bg-purple-900/60 p-1 transition-transform group-hover:scale-105">
            <Image
              src="/logo-an.png"
              alt="Abhinaya Nartan Emblem"
              fill
              sizes="44px"
              className="object-contain"
              priority
            />
          </div>
          <div className="flex flex-col">
            <span
              className={`font-serif text-base sm:text-lg font-medium leading-tight transition-colors ${
                scrolled ? "text-purple-900" : "text-alabaster"
              }`}
            >
              Abhinaya Nartan
            </span>
            <span className="text-[0.62rem] uppercase tracking-[0.22em] text-gold">
              Dance Academy
            </span>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <div className="hidden items-center gap-7 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`text-xs uppercase tracking-[0.18em] transition-colors hover:text-gold ${
                scrolled ? "text-purple-900 font-medium" : "text-alabaster"
              }`}
            >
              {link.label}
            </a>
          ))}
          <a href="#contact" className="btn-primary text-xs uppercase tracking-[0.18em] px-5 py-2.5">
            Enroll Now
          </a>
        </div>

        {/* Mobile Menu Toggle Button */}
        <button
          type="button"
          className={`flex h-11 w-11 items-center justify-center rounded-full transition-all active:scale-95 md:hidden ${
            scrolled
              ? "text-purple-900 hover:bg-purple-100"
              : "text-gold bg-purple-900/50 border border-gold/40 hover:bg-purple-900/80"
          }`}
          onClick={() => setOpen((prev) => !prev)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 top-[68px] z-50 flex flex-col justify-between overflow-y-auto bg-gradient-to-b from-purple-950 via-purple-900 to-purple-950 px-6 py-8 text-alabaster md:hidden shadow-2xl"
          >
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                <p className="text-[0.68rem] uppercase tracking-[0.25em] text-gold font-medium">
                  Kuchipudi Dance Academy
                </p>
              </div>
              <h2 className="font-serif text-2xl text-alabaster mb-6">
                Preserving Sacred Classical Grace
              </h2>

              {/* Navigation Items */}
              <div className="flex flex-col divide-y divide-purple-800/80">
                {links.map((link, index) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="group flex min-h-[58px] items-center justify-between py-3 transition-colors active:text-gold"
                  >
                    <div className="flex items-center gap-4">
                      <span className="font-serif text-sm text-gold/70">
                        0{index + 1}
                      </span>
                      <span className="font-serif text-xl text-alabaster group-hover:text-gold transition-colors">
                        {link.label}
                      </span>
                    </div>
                    <span className="text-gold/50 group-hover:text-gold group-hover:translate-x-1 transition-all">
                      →
                    </span>
                  </a>
                ))}
              </div>

              {/* Primary Mobile CTA */}
              <div className="mt-8">
                <a
                  href="#contact"
                  onClick={() => setOpen(false)}
                  className="btn-primary w-full text-center text-sm font-semibold tracking-wider uppercase py-3.5"
                >
                  Begin Your Journey
                </a>
              </div>
            </div>

            {/* Quick Contact Footer inside Drawer */}
            <div className="mt-8 pt-6 border-t border-purple-800/80">
              <p className="text-[0.62rem] uppercase tracking-[0.2em] text-purple-300 mb-3">
                Quick Connect
              </p>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <a
                  href={`tel:${contact.phone}`}
                  className="flex flex-col items-center gap-1 p-2.5 rounded bg-purple-800/50 border border-purple-700/60 active:bg-gold/20"
                >
                  <Phone size={16} className="text-gold" />
                  <span className="text-[0.68rem]">Call</span>
                </a>
                <a
                  href={`https://wa.me/${cleanWhatsapp}?text=Hello%20Abhinaya%20Nartan%2C%20I%20would%20like%20to%20inquire%20about%20classes.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-1 p-2.5 rounded bg-purple-800/50 border border-purple-700/60 active:bg-gold/20"
                >
                  <MessageCircle size={16} className="text-gold" />
                  <span className="text-[0.68rem]">WhatsApp</span>
                </a>
                <a
                  href={`mailto:${contact.email}`}
                  className="flex flex-col items-center gap-1 p-2.5 rounded bg-purple-800/50 border border-purple-700/60 active:bg-gold/20"
                >
                  <Mail size={16} className="text-gold" />
                  <span className="text-[0.68rem]">Email</span>
                </a>
              </div>
              <p className="mt-4 text-center text-[0.65rem] text-purple-300">
                {contact.hours}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}