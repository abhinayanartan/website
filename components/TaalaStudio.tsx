"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Play, Pause, Volume2, VolumeX, Sparkles, Music, RotateCcw, Info } from "lucide-react";
import Section from "./Section";

type TalaBeat = {
  index: number;
  syllable: string;
  action: "Clap" | "Finger Count" | "Wave";
  actionTelugu: string;
  isSamam?: boolean;
};

type TalaDefinition = {
  id: string;
  name: string;
  angam: string;
  totalBeats: number;
  description: string;
  jathiExample: string;
  beats: TalaBeat[];
};

const TALAS: TalaDefinition[] = [
  {
    id: "adi",
    name: "Adi Talam (8 Beats)",
    angam: "Chaturasra Jathi Triputa Tala · 1 Laghu (4) + 2 Drutams (2+2)",
    totalBeats: 8,
    description:
      "The foundational rhythm of South Indian classical dance. Ideal for practicing initial Adugus (steps) and foundational Kuchipudi jathis.",
    jathiExample: "Tha - Dhi - Thom - Nam · Tha - Ka - Dhi - Mi",
    beats: [
      { index: 1, syllable: "Tha", action: "Clap", actionTelugu: "Tattu (Clap)", isSamam: true },
      { index: 2, syllable: "Ka", action: "Finger Count", actionTelugu: "Pinky Finger" },
      { index: 3, syllable: "Dhi", action: "Finger Count", actionTelugu: "Ring Finger" },
      { index: 4, syllable: "Mi", action: "Finger Count", actionTelugu: "Middle Finger" },
      { index: 5, syllable: "Tha", action: "Clap", actionTelugu: "Tattu (Clap)" },
      { index: 6, syllable: "Ka", action: "Wave", actionTelugu: "Veechu (Wave)" },
      { index: 7, syllable: "Jo", action: "Clap", actionTelugu: "Tattu (Clap)" },
      { index: 8, syllable: "Nu", action: "Wave", actionTelugu: "Veechu (Wave)" },
    ],
  },
  {
    id: "rupaka",
    name: "Rupaka Talam (6 Beats)",
    angam: "1 Drutam (2) + 1 Laghu (4)",
    totalBeats: 6,
    description:
      "A dynamic, brisk cycle frequently used in expressive Sabdams, varnams, and brisk rhythmic Kuchipudi Shabdam patterns.",
    jathiExample: "Dhi - Tha | Tha - Ka - Dhi - Mi",
    beats: [
      { index: 1, syllable: "Dhi", action: "Clap", actionTelugu: "Tattu (Clap)", isSamam: true },
      { index: 2, syllable: "Tha", action: "Wave", actionTelugu: "Veechu (Wave)" },
      { index: 3, syllable: "Tha", action: "Clap", actionTelugu: "Tattu (Clap)" },
      { index: 4, syllable: "Ka", action: "Finger Count", actionTelugu: "Little Finger" },
      { index: 5, syllable: "Dhi", action: "Finger Count", actionTelugu: "Ring Finger" },
      { index: 6, syllable: "Mi", action: "Finger Count", actionTelugu: "Middle Finger" },
    ],
  },
  {
    id: "misra-chapu",
    name: "Misra Chapu (7 Beats)",
    angam: "Syncopated 3 + 2 + 2 Cycle",
    totalBeats: 7,
    description:
      "An evocative, swaying rhythmic cycle used in soulful Kritis, devotional Padams, and intricate narrative Kuchipudi choreography.",
    jathiExample: "Tha - Ki - Ta | Tha - Ka | Dhi - Mi",
    beats: [
      { index: 1, syllable: "Tha", action: "Clap", actionTelugu: "Tattu", isSamam: true },
      { index: 2, syllable: "Ki", action: "Finger Count", actionTelugu: "Count" },
      { index: 3, syllable: "Ta", action: "Finger Count", actionTelugu: "Count" },
      { index: 4, syllable: "Tha", action: "Clap", actionTelugu: "Tattu" },
      { index: 5, syllable: "Ka", action: "Finger Count", actionTelugu: "Count" },
      { index: 6, syllable: "Dhi", action: "Clap", actionTelugu: "Tattu" },
      { index: 7, syllable: "Mi", action: "Finger Count", actionTelugu: "Count" },
    ],
  },
  {
    id: "khanda-chapu",
    name: "Khanda Chapu (5 Beats)",
    angam: "Energetic 2 + 3 Cycle",
    totalBeats: 5,
    description:
      "A fast, buoyant rhythm favored for lively Tillanas, Tarangams (dancing upon the brass plate), and brisk dramatic sequences.",
    jathiExample: "Tha - Ka | Tha - Ki - Ta",
    beats: [
      { index: 1, syllable: "Tha", action: "Clap", actionTelugu: "Tattu", isSamam: true },
      { index: 2, syllable: "Ka", action: "Finger Count", actionTelugu: "Count" },
      { index: 3, syllable: "Tha", action: "Clap", actionTelugu: "Tattu" },
      { index: 4, syllable: "Ki", action: "Finger Count", actionTelugu: "Count" },
      { index: 5, syllable: "Ta", action: "Finger Count", actionTelugu: "Count" },
    ],
  },
];

export default function TaalaStudio() {
  const [selectedTalaId, setSelectedTalaId] = useState("adi");
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(68);
  const [currentBeatIndex, setCurrentBeatIndex] = useState<number | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const activeBeatRef = useRef<number>(0);

  const activeTala = TALAS.find((t) => t.id === selectedTalaId) || TALAS[0];

  // Synthesize authentic woodblock / talam bell percussion using Web Audio API
  const playSound = useCallback((action: "Clap" | "Finger Count" | "Wave", isSamam: boolean) => {
    if (isMuted || typeof window === "undefined") return;

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;

      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const now = ctx.currentTime;

      if (isSamam) {
        // Samam / Primary Beat: Resonant brass bell & temple talam click
        osc.type = "sine";
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(320, now + 0.12);

        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      } else if (action === "Clap") {
        // Tattu: Solid wooden block click
        osc.type = "triangle";
        osc.frequency.setValueAtTime(620, now);
        osc.frequency.exponentialRampToValueAtTime(220, now + 0.08);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      } else if (action === "Wave") {
        // Veechu: Softer acoustic tap
        osc.type = "sine";
        osc.frequency.setValueAtTime(540, now);
        osc.frequency.exponentialRampToValueAtTime(180, now + 0.06);

        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      } else {
        // Finger Count: Delicate click
        osc.type = "sine";
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.04);

        gain.gain.setValueAtTime(0.14, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      }

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.2);
    } catch {
      // Audio autoplay gracefully handled if browser blocks
    }
  }, [isMuted]);

  // Rhythm loop runner
  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setCurrentBeatIndex(null);
      activeBeatRef.current = 0;
      return;
    }

    const intervalMs = (60 / bpm) * 1000;

    const tick = () => {
      const beatIdx = activeBeatRef.current;
      const beat = activeTala.beats[beatIdx];

      setCurrentBeatIndex(beatIdx);
      if (beat) {
        playSound(beat.action, Boolean(beat.isSamam));
      }

      activeBeatRef.current = (beatIdx + 1) % activeTala.beats.length;
    };

    tick();
    timerRef.current = setInterval(tick, intervalMs);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isPlaying, bpm, activeTala, playSound]);

  const togglePlay = () => {
    if (!isPlaying && audioCtxRef.current && audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
    setIsPlaying((prev) => !prev);
  };

  const handleTalaChange = (id: string) => {
    setSelectedTalaId(id);
    activeBeatRef.current = 0;
    setCurrentBeatIndex(null);
  };

  const currentBeat = currentBeatIndex !== null ? activeTala.beats[currentBeatIndex] : null;

  return (
    <Section id="taala-studio" className="relative overflow-hidden bg-gradient-to-b from-[#180A2E] via-purple-950 to-[#220E40] text-alabaster">
      {/* Ambient background ornamentation */}
      <div className="pointer-events-none absolute -left-20 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full bg-gold/10 blur-[120px]" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-20 top-1/4 h-80 w-80 rounded-full bg-purple-700/20 blur-[120px]" aria-hidden="true" />

      <div className="relative mx-auto max-w-5xl">
        {/* Section Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-purple-900/80 px-4 py-1.5 shadow-sm">
            <Sparkles size={13} className="text-gold" />
            <span className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-gold">
              Interactive Classical Laboratory
            </span>
          </div>

          <h2 className="mt-4 font-serif text-3xl font-medium sm:text-4xl lg:text-5xl text-alabaster">
            The Living Pulse of <span className="italic bg-gold-gradient bg-clip-text text-transparent">Taala</span>
          </h2>
          <div className="gold-rule mx-auto mt-4 mb-4" />
          <p className="mx-auto max-w-2xl text-sm leading-relaxed text-purple-100/90 sm:text-base font-light">
            In Kuchipudi, rhythm is not merely a count—it is the divine heartbeat (*Laya*) that guides every stamp of the feet (*Adugu*) and flourish of the hands. Practice and experience classical tala cycles below.
          </p>
        </div>

        {/* Studio Box */}
        <div className="mt-10 overflow-hidden rounded-3xl border border-gold/30 bg-purple-950/70 p-5 shadow-2xl backdrop-blur-md sm:p-8">
          {/* Tala Selector Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 border-b border-purple-800/80 pb-5">
            {TALAS.map((tala) => (
              <button
                key={tala.id}
                type="button"
                onClick={() => handleTalaChange(tala.id)}
                className={`rounded-full px-4 py-2 text-xs font-semibold tracking-wider transition-all sm:text-sm ${
                  selectedTalaId === tala.id
                    ? "bg-gold text-purple-950 shadow-gold-sm"
                    : "border border-purple-700/70 bg-purple-900/50 text-purple-200 hover:border-gold/50 hover:text-gold"
                }`}
              >
                {tala.name}
              </button>
            ))}
          </div>

          {/* Tala Description & Subtitle */}
          <div className="mt-5 flex flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-left">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-gold font-medium">
                {activeTala.angam}
              </p>
              <p className="mt-1 text-xs text-purple-200/90 sm:text-sm">
                {activeTala.description}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowInfo(!showInfo)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-purple-700/60 bg-purple-900/40 px-3 py-1.5 text-xs text-purple-300 hover:text-gold"
              aria-label="Toggle rhythm information"
            >
              <Info size={14} />
              <span>{showInfo ? "Hide Context" : "Classical Shloka"}</span>
            </button>
          </div>

          {/* Collapsible Info Panel */}
          {showInfo && (
            <div className="mt-4 rounded-xl border border-purple-700/50 bg-purple-900/40 p-4 text-xs text-purple-200">
              <p className="font-serif italic text-gold-100">
                &ldquo;Yatho Hasthas Thatho Dhrishti, Yatho Dhrishtis Thatho Manah, Yatho Manas Thatho Bhaavo, Yatho Bhaavas Thatho Rasah.&rdquo;
              </p>
              <p className="mt-2 text-purple-300">
                Where the hand moves, the eyes follow; where the eyes go, the mind accompanies; where the mind dwells, expression arises; and where expression lives, divine rasa is experienced.
              </p>
            </div>
          )}

          {/* Current Syllable & Visual Focus Banner */}
          <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-gold/40 bg-gradient-to-b from-purple-900/60 to-purple-950 p-6 text-center shadow-inner">
            <span className="text-[0.65rem] uppercase tracking-[0.25em] text-purple-300">
              Active Bol / Solkattu
            </span>
            <div className="mt-2 flex h-24 items-center justify-center">
              {currentBeat ? (
                <div className="animate-in fade-in zoom-in-95 duration-150">
                  <span className="font-serif text-5xl font-bold tracking-wider text-gold sm:text-6xl drop-shadow-md">
                    {currentBeat.syllable}
                  </span>
                  <div className="mt-2 flex items-center justify-center gap-2">
                    <span className="rounded-full bg-gold/20 px-2.5 py-0.5 text-[0.68rem] font-semibold uppercase tracking-wider text-gold border border-gold/40">
                      Beat {currentBeat.index} of {activeTala.totalBeats}
                    </span>
                    <span className="text-xs text-purple-200">
                      • {currentBeat.actionTelugu}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center text-purple-300/80">
                  <Music size={28} className="mx-auto mb-1 text-gold/60" />
                  <span className="text-xs tracking-wider">Tap &ldquo;Start Rhythm&rdquo; to begin beat cycle</span>
                </div>
              )}
            </div>

            {/* Syllable Progression Preview */}
            <p className="mt-4 font-serif text-sm tracking-widest text-purple-200/90">
              Solkattu: <span className="text-gold font-medium">{activeTala.jathiExample}</span>
            </p>
          </div>

          {/* Beat Progression Mandala Track */}
          <div className="mt-8">
            <div className="grid grid-cols-4 gap-2.5 sm:flex sm:flex-wrap sm:items-center sm:justify-center sm:gap-3">
              {activeTala.beats.map((beat, idx) => {
                const isActive = currentBeatIndex === idx;

                return (
                  <div
                    key={beat.index}
                    className={`relative flex flex-col items-center justify-center rounded-xl border p-3 transition-all duration-150 sm:h-20 sm:w-20 ${
                      isActive
                        ? "scale-105 border-gold bg-gold text-purple-950 shadow-gold"
                        : "border-purple-800 bg-purple-900/60 text-purple-200 hover:border-purple-600"
                    }`}
                  >
                    <span
                      className={`text-[0.62rem] font-bold uppercase tracking-wider ${
                        isActive ? "text-purple-950" : "text-purple-400"
                      }`}
                    >
                      {beat.action === "Clap" ? "Clap" : beat.action === "Wave" ? "Wave" : "Count"}
                    </span>
                    <span
                      className={`font-serif text-base font-bold sm:text-lg ${
                        isActive ? "text-purple-950" : "text-white"
                      }`}
                    >
                      {beat.syllable}
                    </span>
                    <span
                      className={`text-[0.6rem] font-semibold ${
                        isActive ? "text-purple-900" : "text-gold/80"
                      }`}
                    >
                      #{beat.index}
                    </span>

                    {/* Samam indicator dot */}
                    {beat.isSamam && (
                      <span
                        className="absolute -top-1.5 -right-1.5 h-3 w-3 rounded-full bg-vermilion border border-white"
                        title="Samam (First Beat of Cycle)"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Metronome & Audio Controls Bar */}
          <div className="mt-10 flex flex-col items-center justify-between gap-6 border-t border-purple-800/80 pt-6 md:flex-row">
            {/* Play/Pause & Reset */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={togglePlay}
                className={`inline-flex min-h-12 items-center gap-2 rounded-full px-6 text-sm font-bold uppercase tracking-wider transition-all active:scale-95 ${
                  isPlaying
                    ? "bg-vermilion text-white shadow-lg"
                    : "bg-gold text-purple-950 shadow-gold-sm hover:brightness-105"
                }`}
              >
                {isPlaying ? (
                  <>
                    <Pause size={18} fill="currentColor" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play size={18} fill="currentColor" />
                    <span>Start Rhythm</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsPlaying(false);
                  setCurrentBeatIndex(null);
                  activeBeatRef.current = 0;
                }}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-purple-700 bg-purple-900/60 text-purple-200 hover:text-white active:scale-95"
                aria-label="Reset Tala cycle"
              >
                <RotateCcw size={16} />
              </button>

              <button
                type="button"
                onClick={() => setIsMuted(!isMuted)}
                className={`flex h-11 w-11 items-center justify-center rounded-full border transition-colors active:scale-95 ${
                  isMuted
                    ? "border-rose-400/60 bg-rose-950/40 text-rose-300"
                    : "border-purple-700 bg-purple-900/60 text-gold hover:border-gold"
                }`}
                aria-label={isMuted ? "Unmute metronome audio" : "Mute metronome audio"}
              >
                {isMuted ? <VolumeX size={17} /> : <Volume2 size={17} />}
              </button>
            </div>

            {/* Tempo Slider (Kalam) */}
            <div className="flex w-full max-w-sm flex-col gap-2">
              <div className="flex items-center justify-between text-xs font-semibold text-purple-200">
                <span>Tempo / Laya</span>
                <span className="font-mono text-gold">{bpm} BPM</span>
              </div>
              <input
                type="range"
                min="44"
                max="132"
                step="2"
                value={bpm}
                onChange={(e) => setBpm(Number(e.target.value))}
                className="accent-gold h-2 w-full cursor-pointer rounded-lg bg-purple-800"
                aria-label="Tempo BPM slider"
              />
              <div className="flex justify-between text-[0.62rem] uppercase tracking-wider text-purple-300">
                <button
                  type="button"
                  onClick={() => setBpm(52)}
                  className={`hover:text-gold ${bpm === 52 ? "text-gold font-bold" : ""}`}
                >
                  Vilambita (Slow · 52)
                </button>
                <button
                  type="button"
                  onClick={() => setBpm(72)}
                  className={`hover:text-gold ${bpm === 72 ? "text-gold font-bold" : ""}`}
                >
                  Madhyama (72)
                </button>
                <button
                  type="button"
                  onClick={() => setBpm(96)}
                  className={`hover:text-gold ${bpm === 96 ? "text-gold font-bold" : ""}`}
                >
                  Dhruta (Fast · 96)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
