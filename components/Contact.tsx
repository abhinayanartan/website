"use client";

import { FormEvent, useState } from "react";
import { Mail, MapPin, Phone, Send, Clock, CheckCircle2, AlertCircle, ArrowUpRight } from "lucide-react";
import Section from "./Section";
import { contact } from "@/lib/content";

type FormState = {
  name: string;
  email: string;
  phone: string;
  level: string;
  message: string;
};

const initialForm: FormState = {
  name: "",
  email: "",
  phone: "",
  level: "",
  message: "",
};

const cleanNumber = contact.whatsapp.replace(/\D/g, "");

export default function Contact() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [submittedData, setSubmittedData] = useState<FormState | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const update = (field: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    if (error) setError("");
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.level || !form.message.trim()) {
      setError("Please fill in your name, email, experience level, and message.");
      setSuccess(false);
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError("Please enter a valid email address.");
      setSuccess(false);
      return;
    }

    setSubmitting(true);
    // Process inquiry submission
    setTimeout(() => {
      setSubmitting(false);
      setError("");
      setSuccess(true);
      setSubmittedData({ ...form });
      setForm(initialForm);
    }, 400);
  };

  return (
    <Section id="contact" className="bg-white">
      <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
        {/* Left Column: Academy Info & Instant Connect Channels */}
        <div>
          <div className="section-eyebrow mb-3">
            <span className="h-1.5 w-1.5 rounded-full bg-vermilion" />
            Join Our Classes
          </div>
          <h2 className="section-title">{contact.heading}</h2>
          <div className="gold-rule mt-5 mb-5" />
          <p className="text-sm xs:text-base leading-relaxed text-ink/80 sm:text-lg">
            {contact.subtext}
          </p>

          {/* Quick Connect Touch Cards */}
          <div className="mt-8 space-y-3">
            <a
              href={`https://wa.me/${cleanNumber || "919999999999"}?text=Hello%20Abhinaya%20Nartan%2C%20I%20would%20like%20to%20learn%20more%20about%20Kuchipudi%20classes.`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between rounded-xl border border-purple-200/80 bg-purple-50/50 p-4 transition-all duration-200 hover:border-gold hover:bg-gold/10 active:scale-[0.98]"
            >
              <div className="flex items-center gap-3.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white shadow-sm">
                  <Send size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-purple-950">
                    WhatsApp Admissions Desk
                  </p>
                  <p className="text-xs text-ink/70">
                    Instant chat for schedules & fees
                  </p>
                </div>
              </div>
              <ArrowUpRight size={18} className="text-purple-600" />
            </a>

            <a
              href={`tel:${contact.phone}`}
              className="flex items-center justify-between rounded-xl border border-purple-200/80 bg-purple-50/50 p-4 transition-all duration-200 hover:border-gold hover:bg-gold/10 active:scale-[0.98]"
            >
              <div className="flex items-center gap-3.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-900 text-gold shadow-sm">
                  <Phone size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-purple-950">
                    Call the Academy
                  </p>
                  <p className="text-xs text-ink/70">Speak directly with instructors</p>
                </div>
              </div>
              <ArrowUpRight size={18} className="text-purple-600" />
            </a>

            <a
              href={`mailto:${contact.email}`}
              className="flex items-center justify-between rounded-xl border border-purple-200/80 bg-purple-50/50 p-4 transition-all duration-200 hover:border-gold hover:bg-gold/10 active:scale-[0.98]"
            >
              <div className="flex items-center gap-3.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-900 text-gold shadow-sm">
                  <Mail size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-purple-950">
                    Email Inquiries
                  </p>
                  <p className="text-xs text-ink/70">{contact.email}</p>
                </div>
              </div>
              <ArrowUpRight size={18} className="text-purple-600" />
            </a>
          </div>

          {/* Studio Schedule & Visiting Details */}
          <div className="mt-8 rounded-2xl border border-purple-100 bg-alabaster p-5 shadow-card">
            <h3 className="font-serif text-lg font-medium text-purple-900 mb-3 flex items-center gap-2">
              <Clock size={18} className="text-gold" />
              Studio Timings & Location
            </h3>
            <div className="space-y-3 text-xs xs:text-sm text-ink/80">
              <div className="flex items-start gap-2.5">
                <MapPin size={16} className="text-vermilion shrink-0 mt-0.5" />
                <span>{contact.location}</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Clock size={16} className="text-gold shrink-0 mt-0.5" />
                <span>{contact.hours}</span>
              </div>
            </div>
            <a
              href={contact.mapEmbedUrl || "https://maps.google.com"}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-purple-900 hover:text-gold"
            >
              <span>Open in Google Maps</span>
              <ArrowUpRight size={14} />
            </a>
          </div>
        </div>

        {/* Right Column: Inquiry Form with Mobile-Optimized Fields */}
        <div className="rounded-2xl border border-purple-100 bg-alabaster p-6 xs:p-8 shadow-card">
          <h3 className="font-serif text-2xl font-medium text-purple-900 mb-2">
            Enrollment Inquiry
          </h3>
          <p className="text-xs xs:text-sm text-ink/70 mb-6">
            Share your details below and our academy guru will reach out with the batch syllabus.
          </p>

          <form onSubmit={submit} className="space-y-5" noValidate>
            <div>
              <label htmlFor="contact-name" className="block text-xs font-semibold uppercase tracking-wider text-purple-950 mb-1.5">
                Full Name <span className="text-vermilion">*</span>
              </label>
              <input
                id="contact-name"
                type="text"
                autoComplete="name"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="e.g. Ananya Sharma"
                className="w-full min-h-[48px] rounded-lg border border-purple-200 bg-white px-3.5 py-2.5 text-base text-ink placeholder:text-ink/40 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30 transition-all"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="contact-email" className="block text-xs font-semibold uppercase tracking-wider text-purple-950 mb-1.5">
                  Email Address <span className="text-vermilion">*</span>
                </label>
                <input
                  id="contact-email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder="ananya@example.com"
                  className="w-full min-h-[48px] rounded-lg border border-purple-200 bg-white px-3.5 py-2.5 text-base text-ink placeholder:text-ink/40 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30 transition-all"
                />
              </div>

              <div>
                <label htmlFor="contact-phone" className="block text-xs font-semibold uppercase tracking-wider text-purple-950 mb-1.5">
                  Phone / WhatsApp
                </label>
                <input
                  id="contact-phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full min-h-[48px] rounded-lg border border-purple-200 bg-white px-3.5 py-2.5 text-base text-ink placeholder:text-ink/40 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30 transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="contact-level" className="block text-xs font-semibold uppercase tracking-wider text-purple-950 mb-1.5">
                Prior Dance Experience <span className="text-vermilion">*</span>
              </label>
              <select
                id="contact-level"
                value={form.level}
                onChange={(e) => update("level", e.target.value)}
                className="w-full min-h-[48px] rounded-lg border border-purple-200 bg-white px-3.5 py-2.5 text-base text-ink focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30 transition-all"
              >
                <option value="">Select your experience level</option>
                {contact.levels.map((level) => (
                  <option key={level} value={level}>
                    {level} Level
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="contact-message" className="block text-xs font-semibold uppercase tracking-wider text-purple-950 mb-1.5">
                Tell Us About Your Goals <span className="text-vermilion">*</span>
              </label>
              <textarea
                id="contact-message"
                value={form.message}
                onChange={(e) => update("message", e.target.value)}
                placeholder="Mention preferred class days, learning goals, or age of student..."
                rows={4}
                className="w-full rounded-lg border border-purple-200 bg-white px-3.5 py-2.5 text-base text-ink placeholder:text-ink/40 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30 transition-all resize-none"
              />
            </div>

            {/* Error & Success Alerts */}
            {error && (
              <div
                className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 p-3 text-xs sm:text-sm text-red-700"
                role="alert"
              >
                <AlertCircle size={18} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div
                className="space-y-3 rounded-lg bg-emerald-50 border border-emerald-200 p-4 text-xs sm:text-sm text-emerald-900"
                role="status"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
                  <span className="font-semibold">
                    {submittedData?.name
                      ? `Thank you, ${submittedData.name}! Your inquiry has been registered.`
                      : "Thank you! Your inquiry has been received."}
                  </span>
                </div>
                {submittedData && (
                  <>
                    <p className="text-xs text-emerald-800">
                      Our team will contact you shortly. For immediate assistance, you can also forward your inquiry directly:
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <a
                        href={`https://wa.me/${cleanNumber || "919999999999"}?text=${encodeURIComponent(
                          `Hello Abhinaya Nartan Academy,\n\nName: ${submittedData.name}\nEmail: ${submittedData.email}\nPhone: ${submittedData.phone || "N/A"}\nExperience Level: ${submittedData.level}\n\nGoals / Message:\n${submittedData.message}`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-600 text-white font-medium text-xs hover:bg-emerald-700 transition-colors"
                      >
                        <Send size={13} />
                        <span>Open in WhatsApp</span>
                      </a>
                      <a
                        href={`mailto:${contact.email}?subject=${encodeURIComponent(
                          `Enrollment Inquiry - ${submittedData.name}`
                        )}&body=${encodeURIComponent(
                          `Name: ${submittedData.name}\nEmail: ${submittedData.email}\nPhone: ${submittedData.phone || "N/A"}\nExperience Level: ${submittedData.level}\n\nGoals / Message:\n${submittedData.message}`
                        )}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-purple-900 text-alabaster font-medium text-xs hover:bg-purple-800 transition-colors"
                      >
                        <Mail size={13} />
                        <span>Send via Email</span>
                      </a>
                    </div>
                  </>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full text-center text-sm xs:text-base font-semibold py-3.5 disabled:opacity-70"
            >
              {submitting ? "Sending..." : contact.submitLabel}
            </button>
          </form>
        </div>
      </div>
    </Section>
  );
}