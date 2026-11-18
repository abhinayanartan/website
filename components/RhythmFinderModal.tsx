"use client";

import { useState } from "react";
import { X, Sparkles, ArrowRight, CheckCircle2, MessageCircle, RotateCcw } from "lucide-react";
import { contact } from "@/lib/content";

type StepOption = {
  id: string;
  label: string;
  description: string;
};

const STEP_1_OPTIONS: StepOption[] = [
  {
    id: "child",
    label: "Young Child (Ages 5–9)",
    description: "Gentle introduction to rhythm, posture, playful mudras, and bodily coordination.",
  },
  {
    id: "youth",
    label: "Youth & Teen (Ages 10–16)",
    description: "Structured classical discipline, Adugus (steps), Shlokas, and hand gestures.",
  },
  {
    id: "adult",
    label: "Adult Beginner (17+)",
    description: "A welcoming, zero-pressure space to explore classical grace, fitness, and heritage.",
  },
  {
    id: "experienced",
    label: "Returning / Experienced Dancer",
    description: "Repertoire advancement, complex Jathis, Tarangam (brass plate), and Abhinaya.",
  },
];

const STEP_2_OPTIONS: StepOption[] = [
  {
    id: "foundations",
    label: "Foundational Grace & Posture",
    description: "Master clean lines, Aramandi stamina, and classical aesthetics from scratch.",
  },
  {
    id: "arangetram",
    label: "Formal Arangetram & Certification",
    description: "Complete classical training track geared toward solo stage debut and diplomas.",
  },
  {
    id: "mindful",
    label: "Joyful Movement & Cultural Connection",
    description: "Dance as a soulful stress-reliever, holistic fitness, and artistic expression.",
  },
  {
    id: "stage",
    label: "Expressive Abhinaya & Stagecraft",
    description: "Bring ancient mythological and poetic stories alive through emotive facial expressions.",
  },
];

const STEP_3_OPTIONS: StepOption[] = [
  {
    id: "weekdays",
    label: "Weekday Evenings",
    description: "Mon, Wed, Fri · 6:00 PM – 8:00 PM",
  },
  {
    id: "weekends",
    label: "Weekend Intensives",
    description: "Sunday · 9:00 AM – 12:00 PM & 6:00 PM – 8:00 PM",
  },
  {
    id: "flexible",
    label: "Flexible / Either Schedule",
    description: "Open to whichever batch fits best based on instructor assessment.",
  },
];

interface RhythmFinderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RhythmFinderModal({ isOpen, onClose }: RhythmFinderModalProps) {
  const [step, setStep] = useState(1);
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<string | null>(null);

  if (!isOpen) return null;

  const cleanWhatsapp = contact.whatsapp.replace(/\D/g, "");

  const handleReset = () => {
    setStep(1);
    setSelectedProfile(null);
    setSelectedGoal(null);
    setSelectedSchedule(null);
  };

  const getRecommendation = () => {
    const profileObj = STEP_1_OPTIONS.find((o) => o.id === selectedProfile);
    const goalObj = STEP_2_OPTIONS.find((o) => o.id === selectedGoal);
    const schedObj = STEP_3_OPTIONS.find((o) => o.id === selectedSchedule);

    let batchName = "Balakendram Kuchipudi Foundations";
    if (selectedProfile === "adult") {
      batchName = "Sankalpa Adult Classical Studio";
    } else if (selectedProfile === "experienced") {
      batchName = "Varnam & Tarangam Advanced Repertoire";
    } else if (selectedProfile === "youth") {
      batchName = "Kalaradhana Youth Core Batch";
    }

    const whatsappMessage = `Hello Abhinaya Nartan Academy,\n\nI used the 'Find Your Rhythm' wizard on your website to find a suitable Kuchipudi batch:\n\n• Dancer Profile: ${profileObj?.label || "Unspecified"}\n• Primary Goal: ${goalObj?.label || "Unspecified"}\n• Preferred Days: ${schedObj?.label || "Unspecified"}\n• Recommended Focus: ${batchName}\n\nCould you please share details on batch schedule and upcoming enrollment?`;

    return {
      batchName,
      profileLabel: profileObj?.label,
      goalLabel: goalObj?.label,
      schedLabel: schedObj?.label,
      whatsappUrl: `https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(whatsappMessage)}`,
    };
  };

  const recommendation = step === 4 ? getRecommendation() : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-purple-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-gold/50 bg-gradient-to-b from-[#1E0D38] via-purple-950 to-[#2A0E4E] p-6 text-alabaster shadow-2xl sm:p-8">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-purple-700/60 bg-purple-900/60 text-purple-200 hover:text-white active:scale-95"
          aria-label="Close dialog"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-purple-900/60 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-gold">
            <Sparkles size={12} />
            <span>Interactive Batch Matcher</span>
          </div>
          <h3 className="mt-3 font-serif text-2xl font-medium sm:text-3xl text-white">
            Find Your Rhythm
          </h3>
          <p className="mt-1 text-xs text-purple-200/90">
            Answer 3 quick questions to discover your personalized Kuchipudi starting point.
          </p>

          {/* Progress bar */}
          <div className="mt-4 flex gap-1.5">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                  step >= s ? "bg-gold" : "bg-purple-900"
                }`}
              />
            ))}
          </div>
        </div>

        {/* STEP 1: Dancer Profile */}
        {step === 1 && (
          <div className="space-y-4">
            <p className="font-serif text-base text-gold-100 sm:text-lg">
              1. Who will be taking the classes?
            </p>
            <div className="grid gap-2.5">
              {STEP_1_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    setSelectedProfile(opt.id);
                    setStep(2);
                  }}
                  className="flex items-start justify-between rounded-xl border border-purple-800 bg-purple-900/40 p-4 text-left transition-all hover:border-gold hover:bg-purple-900/80 active:scale-[0.99]"
                >
                  <div>
                    <p className="font-serif text-sm font-semibold text-white sm:text-base">
                      {opt.label}
                    </p>
                    <p className="mt-0.5 text-xs text-purple-200/80">{opt.description}</p>
                  </div>
                  <ArrowRight size={16} className="text-gold shrink-0 mt-1 ml-2" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: Main Aspiration */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="font-serif text-base text-gold-100 sm:text-lg">
                2. What is your primary artistic goal?
              </p>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs text-purple-300 hover:text-white"
              >
                ← Back
              </button>
            </div>
            <div className="grid gap-2.5">
              {STEP_2_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    setSelectedGoal(opt.id);
                    setStep(3);
                  }}
                  className="flex items-start justify-between rounded-xl border border-purple-800 bg-purple-900/40 p-4 text-left transition-all hover:border-gold hover:bg-purple-900/80 active:scale-[0.99]"
                >
                  <div>
                    <p className="font-serif text-sm font-semibold text-white sm:text-base">
                      {opt.label}
                    </p>
                    <p className="mt-0.5 text-xs text-purple-200/80">{opt.description}</p>
                  </div>
                  <ArrowRight size={16} className="text-gold shrink-0 mt-1 ml-2" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: Preferred Schedule */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="font-serif text-base text-gold-100 sm:text-lg">
                3. What days suit you best?
              </p>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-xs text-purple-300 hover:text-white"
              >
                ← Back
              </button>
            </div>
            <div className="grid gap-2.5">
              {STEP_3_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    setSelectedSchedule(opt.id);
                    setStep(4);
                  }}
                  className="flex items-start justify-between rounded-xl border border-purple-800 bg-purple-900/40 p-4 text-left transition-all hover:border-gold hover:bg-purple-900/80 active:scale-[0.99]"
                >
                  <div>
                    <p className="font-serif text-sm font-semibold text-white sm:text-base">
                      {opt.label}
                    </p>
                    <p className="mt-0.5 text-xs text-purple-200/80">{opt.description}</p>
                  </div>
                  <CheckCircle2 size={16} className="text-gold shrink-0 mt-1 ml-2" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 4: Personalized Recommendation */}
        {step === 4 && recommendation && (
          <div className="space-y-5 animate-in fade-in duration-300">
            <div className="rounded-2xl border border-gold/60 bg-purple-900/70 p-5 shadow-inner">
              <span className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-vermilion-700 bg-white/10 px-2.5 py-0.5 rounded-full border border-white/10">
                Recommended Batch Match
              </span>
              <h4 className="mt-3 font-serif text-2xl font-medium text-white">
                {recommendation.batchName}
              </h4>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs border-t border-purple-700/60 pt-3">
                <div>
                  <span className="text-purple-300 block">Dancer Level:</span>
                  <span className="text-gold font-medium">{recommendation.profileLabel}</span>
                </div>
                <div>
                  <span className="text-purple-300 block">Focus:</span>
                  <span className="text-gold font-medium">{recommendation.goalLabel}</span>
                </div>
              </div>
              <div className="mt-2 text-xs">
                <span className="text-purple-300 block">Location:</span>
                <span className="text-white font-medium">Vijayawada Studio ({recommendation.schedLabel})</span>
              </div>
            </div>

            <p className="text-xs text-purple-200/90 leading-relaxed">
              We have pre-filled a WhatsApp inquiry message with your selections so the academy can immediately confirm open batch slots for you.
            </p>

            <div className="flex flex-col gap-2.5 sm:flex-row">
              <a
                href={recommendation.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onClose}
                className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-gold px-5 text-sm font-bold text-purple-950 shadow-gold-sm hover:brightness-105 active:scale-95"
              >
                <MessageCircle size={18} />
                <span>Confirm on WhatsApp</span>
              </a>
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex min-h-12 items-center justify-center gap-1.5 rounded-xl border border-purple-700 bg-purple-900/40 px-4 text-xs font-semibold text-purple-200 hover:text-white"
              >
                <RotateCcw size={14} />
                <span>Start Over</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
