"use client";

import { X, Printer, Award, Sparkles, MessageCircle } from "lucide-react";
import Image from "next/image";
import { Student, Batch } from "@/lib/types/academy";
import { getIndiaDate } from "@/lib/date";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

interface StudentCertificateModalProps {
  student: Student;
  batch?: Batch;
  onClose: () => void;
}

export default function StudentCertificateModal({
  student,
  batch,
  onClose,
}: StudentCertificateModalProps) {
  const currentDate = getIndiaDate();
  const studentCode = student.studentCode || student.admissionNumber || "AN-2026";
  const parentPhone = (student.parentPhone || student.phone || "").replace(/\D/g, "");

  const handlePrint = () => {
    window.print();
  };

  const whatsappMessage = `🎓 *ABHINAYA NARTAN DANCE ACADEMY*\n*Certificate of Classical Natya Achievement*\n──────────────────\nWe are delighted to honor *${student.fullName}* (${studentCode}) for their dedicated practice, grace, and progress in Kuchipudi Classical Dance.\n\n• Batch: ${batch?.name || "Assigned Batch"}\n• Level: ${student.level || "Beginner"}\n• Academy: Abhinaya Nartan, Vijayawada\n\nMay this classical dance journey bring joy, poise, and lifelong artistry!\n\n_Guru Reshma & Academy Faculty_`;

  const whatsappUrl = parentPhone
    ? `https://wa.me/${parentPhone.startsWith("91") ? parentPhone : `91${parentPhone}`}?text=${encodeURIComponent(whatsappMessage)}`
    : `https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-purple-950/85 p-4 backdrop-blur-sm print:p-0 print:bg-white animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-gold/50 bg-white text-ink shadow-2xl print:border-none print:shadow-none print:max-w-none">
        {/* Top Action Bar (Hidden during print) */}
        <div className="flex items-center justify-between border-b border-purple-800 bg-purple-950 px-6 py-3.5 text-white print:hidden">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gold">
            <Sparkles size={14} />
            <span>Classical Dance Certificate Voucher</span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-3.5 py-1 text-xs font-semibold text-white shadow-sm hover:bg-emerald-500 active:scale-95 transition-all"
            >
              <MessageCircle size={13} />
              <span className="hidden xs:inline">WhatsApp</span>
            </a>
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-full bg-gold px-3.5 py-1 text-xs font-semibold text-purple-950 shadow-gold-sm hover:brightness-105 active:scale-95 transition-all"
            >
              <Printer size={13} />
              <span>Print / Save PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-1 text-purple-200 hover:text-white transition-colors"
              aria-label="Close certificate dialog"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Printable Certificate Page */}
        <div className="p-8 sm:p-12 print:p-8 relative bg-[#FFFDF9] text-center border-8 border-double border-[#D4AF37]/60 m-2 rounded-2xl shadow-inner">
          {/* Subtle watermark background emblem */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.04]">
            <Image
              src={`${basePath}/logo-an.png`}
              alt=""
              width={350}
              height={350}
              className="object-contain"
            />
          </div>

          <div className="relative z-10">
            {/* Academy Emblem Header */}
            <div className="mx-auto mb-3 inline-block rounded-full border border-gold/40 bg-purple-950 p-2.5 shadow-md">
              <Image
                src={`${basePath}/logo-an.png`}
                alt="Abhinaya Nartan Emblem"
                width={52}
                height={52}
                className="h-12 w-12 object-contain"
              />
            </div>

            <p className="text-[0.68rem] font-bold uppercase tracking-[0.28em] text-[#8C2D19]">
              Kuchipudi Vidya Peetham • Vijayawada
            </p>

            <h1 className="mt-1 font-serif text-2xl font-bold tracking-tight text-purple-950 sm:text-3xl">
              Abhinaya Nartan Dance Academy
            </h1>

            <div className="mx-auto mt-4 mb-4 h-0.5 w-32 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />

            <p className="font-serif text-sm italic text-purple-900 sm:text-base">
              Certificate of Classical Dance Excellence
            </p>

            <p className="mt-6 text-xs text-ink/75 uppercase tracking-widest font-semibold">
              This is proudly conferred upon
            </p>

            {/* Student Name */}
            <h2 className="mt-2 font-serif text-3xl font-bold text-purple-950 sm:text-4xl underline decoration-gold/60 underline-offset-8">
              {student.fullName}
            </h2>

            <p className="mt-1 font-mono text-[0.72rem] text-ink/60">
              Student ID: {studentCode}
            </p>

            {/* Certificate Citation */}
            <p className="mx-auto mt-5 max-w-lg text-xs leading-relaxed text-ink/80 sm:text-sm">
              in formal recognition of their sincere devotion, artistic poise, rhythmic precision, and commendable progress in the sacred classical art of <strong>Kuchipudi</strong> as a member of <strong>{batch?.name || "the academy"}</strong>.
            </p>

            {/* Level & Date */}
            <div className="mx-auto mt-6 inline-flex items-center gap-3 rounded-full border border-gold/40 bg-purple-50/60 px-4 py-1 text-xs text-purple-950">
              <Award size={15} className="text-gold" />
              <span>Attained Level: <strong>{student.level || "Beginner"}</strong></span>
              <span>•</span>
              <span>Date: <strong>{currentDate}</strong></span>
            </div>

            {/* Signatures */}
            <div className="mt-10 grid grid-cols-2 gap-8 border-t border-[#D4AF37]/40 pt-6 text-left">
              <div>
                <p className="font-serif text-xs font-bold text-purple-950">
                  Vijayawada Studio, Andhra Pradesh
                </p>
                <p className="text-[0.65rem] text-ink/60">
                  Abhinaya Nartan Academy
                </p>
              </div>

              <div className="text-right">
                <p className="font-serif text-xs font-bold text-purple-950">
                  Guru Reshma
                </p>
                <p className="text-[0.65rem] text-ink/60">
                  Artistic Director & Founder
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
