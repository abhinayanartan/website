"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Menu, X } from "lucide-react";

const links = [
  { href: "#home", label: "Home" },
  { href: "#about", label: "About" },
  { href: "#mudras", label: "Mudras" },
  { href: "#gallery", label: "Gallery" },
  { href: "#contact", label: "Contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled || open
          ? "bg-alabaster/95 shadow-soft backdrop-blur-md"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
        <a href="#home" className="flex items-center gap-3" aria-label="Abhinaya Nartan home">
          <Image
            src="/logo-an.png"
            alt="Abhinaya Nartan Dance Academy logo"
            width={52}
            height={44}
            className="h-11 w-auto"
            priority
          />
          <span className="hidden font-serif text-lg font-bold text-purple-700 sm:block">
            Abhinaya <span className="text-gold">Nartan</span>
          </span>
        </a>

        {/* Desktop links */}
        <ul className="hidden items-center gap-9 md:flex">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="group relative text-sm font-medium tracking-wide text-ink transition-colors hover:text-purple"
              >
                {l.label}
                <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-gold-gradient transition-all duration-300 group-hover:w-full" />
              </a>
            </li>
          ))}
          <li>
            <a href="#contact" className="btn-primary !px-6 !py-2.5 text-sm">
              Enroll Now
            </a>
          </li>
        </ul>

        {/* Mobile toggle */}
        <button
          className="text-purple-700 md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {open ? <X size={28} /> : <Menu size={28} />}
        </button>
      </nav>

      {/* Mobile menu */}
      <div
        className={`overflow-hidden transition-[max-height] duration-500 md:hidden ${
          open ? "max-h-96" : "max-h-0"
        }`}
      >
        <ul className="flex flex-col gap-1 px-6 pb-6">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                onClick={() => setOpen(false)}
                className="block border-b border-purple-100 py-3 font-medium text-ink hover:text-purple"
              >
                {l.label}
              </a>
            </li>
          ))}
          <li className="pt-4">
            <a href="#contact" onClick={() => setOpen(false)} className="btn-primary w-full">
              Enroll Now
            </a>
          </li>
        </ul>
      </div>
    </header>
  );
}
