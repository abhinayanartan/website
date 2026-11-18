"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState, useRef, useMemo } from "react";
import { Sparkles, ChevronLeft, ChevronRight, RotateCw, Hand, Search, HelpCircle, CheckCircle2, Award } from "lucide-react";
import Section from "./Section";
import { mudras } from "@/lib/content";

// Artistic classical gesture iconography SVG for 12 Mudras
function MudraIcon({ index }: { index: number }) {
  switch (index) {
    case 0: // Pataka (Flag / Flat hand)
      return (
        <svg className="w-16 h-16 text-gold" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M32 6C28 14 26 24 26 36C26 46 29 54 32 58" strokeLinecap="round" />
          <path d="M38 10C34 18 33 28 33 40C33 48 35 55 38 58" strokeLinecap="round" />
          <path d="M44 16C41 23 40 32 40 42C40 48 42 54 44 58" strokeLinecap="round" />
          <path d="M26 36C22 36 18 34 16 30C14 26 15 22 18 20" strokeLinecap="round" />
          <circle cx="32" cy="32" r="28" stroke="currentColor" strokeDasharray="3 3" opacity="0.3" />
        </svg>
      );
    case 1: // Tripataka (Three Parts of Flag / bent ring finger)
      return (
        <svg className="w-16 h-16 text-gold" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M28 8C26 16 25 26 26 38C27 48 30 55 33 58" strokeLinecap="round" />
          <path d="M36 12C34 19 33 28 34 40C35 48 38 55 40 58" strokeLinecap="round" />
          <path d="M42 30C41 33 39 36 38 42" strokeLinecap="round" />
          <path d="M22 34C18 34 15 30 15 24" strokeLinecap="round" />
          <circle cx="32" cy="32" r="28" stroke="currentColor" strokeDasharray="3 3" opacity="0.3" />
        </svg>
      );
    case 2: // Ardhapataka (Half Flag)
      return (
        <svg className="w-16 h-16 text-gold" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M26 8C25 18 25 28 26 40C27 48 30 54 32 58" strokeLinecap="round" />
          <path d="M34 12C33 20 33 30 34 42C35 48 38 54 40 58" strokeLinecap="round" />
          <path d="M40 32C39 36 38 40 38 44" strokeLinecap="round" />
          <path d="M44 36C43 40 42 42 42 46" strokeLinecap="round" />
          <circle cx="32" cy="32" r="28" stroke="currentColor" strokeDasharray="3 3" opacity="0.3" />
        </svg>
      );
    case 3: // Kartarimukha (Scissors)
      return (
        <svg className="w-16 h-16 text-gold" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M22 8L34 40" strokeLinecap="round" strokeWidth="2" />
          <path d="M38 10L30 40" strokeLinecap="round" strokeWidth="2" />
          <path d="M24 40C24 48 28 56 32 58" strokeLinecap="round" />
          <circle cx="32" cy="32" r="28" stroke="currentColor" strokeDasharray="3 3" opacity="0.3" />
        </svg>
      );
    case 4: // Mayura (Peacock)
      return (
        <svg className="w-16 h-16 text-gold" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="28" cy="24" r="6" stroke="currentColor" strokeWidth="2" />
          <path d="M34 22L46 10" strokeLinecap="round" strokeWidth="2" />
          <path d="M34 26L48 18" strokeLinecap="round" strokeWidth="2" />
          <path d="M32 30L46 28" strokeLinecap="round" strokeWidth="2" />
          <path d="M24 30C24 42 28 52 32 58" strokeLinecap="round" />
          <circle cx="32" cy="32" r="28" stroke="currentColor" strokeDasharray="3 3" opacity="0.3" />
        </svg>
      );
    case 5: // Ardhachandra (Crescent Moon)
      return (
        <svg className="w-16 h-16 text-gold" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M40 8C36 16 34 26 34 38C34 48 37 54 40 58" strokeLinecap="round" strokeWidth="2" />
          <path d="M34 34C24 34 16 28 14 20" strokeLinecap="round" strokeWidth="2" />
          <circle cx="32" cy="32" r="28" stroke="currentColor" strokeDasharray="3 3" opacity="0.3" />
        </svg>
      );
    case 6: // Sikhara (Spire / Peak)
      return (
        <svg className="w-16 h-16 text-gold" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M32 8V24" strokeLinecap="round" strokeWidth="2.5" />
          <rect x="22" y="24" width="20" height="26" rx="6" stroke="currentColor" />
          <path d="M22 32H42" strokeLinecap="round" opacity="0.6" />
          <path d="M22 40H42" strokeLinecap="round" opacity="0.6" />
          <circle cx="32" cy="32" r="28" stroke="currentColor" strokeDasharray="3 3" opacity="0.3" />
        </svg>
      );
    case 7: // Kapittha (Wood Apple)
      return (
        <svg className="w-16 h-16 text-gold" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="32" cy="22" r="10" stroke="currentColor" strokeWidth="2" />
          <path d="M32 14V30" strokeLinecap="round" strokeWidth="2" />
          <rect x="22" y="28" width="20" height="24" rx="6" stroke="currentColor" />
          <circle cx="32" cy="32" r="28" stroke="currentColor" strokeDasharray="3 3" opacity="0.3" />
        </svg>
      );
    case 8: // Katakamukha (Bracelet opening)
      return (
        <svg className="w-16 h-16 text-gold" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="32" cy="24" r="8" stroke="currentColor" strokeWidth="2" />
          <path d="M38 24C44 28 46 36 44 48" strokeLinecap="round" />
          <path d="M26 24C20 28 18 36 20 48" strokeLinecap="round" />
          <path d="M26 48C30 54 34 54 38 48" strokeLinecap="round" />
          <circle cx="32" cy="32" r="28" stroke="currentColor" strokeDasharray="3 3" opacity="0.3" />
        </svg>
      );
    case 9: // Suchi (Needle)
      return (
        <svg className="w-16 h-16 text-gold" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M32 6V30" strokeLinecap="round" strokeWidth="2.5" />
          <rect x="24" y="30" width="16" height="24" rx="5" stroke="currentColor" />
          <circle cx="32" cy="32" r="28" stroke="currentColor" strokeDasharray="3 3" opacity="0.3" />
        </svg>
      );
    case 10: // Padmakosha (Lotus Bud)
      return (
        <svg className="w-16 h-16 text-gold" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M24 44C20 32 24 18 32 12C40 18 44 32 40 44" strokeLinecap="round" strokeWidth="2" />
          <path d="M32 12V46" strokeLinecap="round" strokeDasharray="2 2" />
          <circle cx="32" cy="32" r="28" stroke="currentColor" strokeDasharray="3 3" opacity="0.3" />
        </svg>
      );
    default: // Alapadma (Blooming Lotus)
      return (
        <svg className="w-16 h-16 text-gold" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="32" cy="32" r="10" stroke="currentColor" strokeWidth="1.5" />
          <path d="M32 10C34 16 38 20 44 22" strokeLinecap="round" />
          <path d="M44 22C48 28 46 36 40 42" strokeLinecap="round" />
          <path d="M40 42C34 46 28 46 22 42" strokeLinecap="round" />
          <path d="M22 42C18 36 16 28 20 22" strokeLinecap="round" />
          <path d="M20 22C26 20 30 16 32 10" strokeLinecap="round" />
          <circle cx="32" cy="32" r="28" stroke="currentColor" strokeDasharray="3 3" opacity="0.3" />
        </svg>
      );
  }
}

// Interactive Quiz Questions
const QUIZ_QUESTIONS = [
  {
    question: "Which single-hand gesture (Asamyuta Hasta) represents clouds, forests, or divine blessings of protection?",
    options: ["Pataka", "Sikhara", "Suchi", "Katakamukha"],
    answer: "Pataka",
    hint: "It is the foundational flat-hand posture every dancer learns first.",
  },
  {
    question: "Which gesture features a closed fist with an upright thumb, depicting the mountain peak, a temple pillar, or Shiva Lingam?",
    options: ["Alapadma", "Mayura", "Sikhara", "Tripataka"],
    answer: "Sikhara",
    hint: "Its name literally translates to 'Peak' or 'Spire'.",
  },
  {
    question: "Which graceful hand posture evokes a radiant blooming lotus flower and celestial delight?",
    options: ["Alapadma", "Suchi", "Kapittha", "Ardhapataka"],
    answer: "Alapadma",
    hint: "Fingers are flared outward in circular concentric curves.",
  },
  {
    question: "Which gesture has the index and middle finger tips meeting the thumb to depict plucking blossoms or stringing a bow?",
    options: ["Kartarimukha", "Katakamukha", "Padmakosha", "Tripataka"],
    answer: "Katakamukha",
    hint: "Known as the 'Opening in a Bracelet'.",
  },
];

export default function MudraShowcase() {
  const [active, setActive] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [mode, setMode] = useState<"glossary" | "quiz">("glossary");

  // Quiz State
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedQuizOption, setSelectedQuizOption] = useState<string | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const container = scrollRef.current;
      const cardWidth = container.firstElementChild?.clientWidth || 280;
      const offset = direction === "left" ? -(cardWidth + 16) : cardWidth + 16;
      container.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  const handleToggle = (index: number) => {
    setActive((prev) => (prev === index ? null : index));
  };

  // Filter mudras
  const filteredMudras = useMemo(() => {
    return mudras.items.filter((item) => {
      const matchesCategory = activeCategory === "All" || item.category === activeCategory;
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.meaning.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.translation.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  // Quiz handlers
  const handleQuizAnswer = (option: string) => {
    if (selectedQuizOption !== null) return;
    setSelectedQuizOption(option);

    const isCorrect = option === QUIZ_QUESTIONS[currentQuizIndex].answer;
    if (isCorrect) {
      setQuizScore((prev) => prev + 1);
    }

    setTimeout(() => {
      if (currentQuizIndex + 1 < QUIZ_QUESTIONS.length) {
        setCurrentQuizIndex((prev) => prev + 1);
        setSelectedQuizOption(null);
      } else {
        setQuizCompleted(true);
      }
    }, 1100);
  };

  const resetQuiz = () => {
    setCurrentQuizIndex(0);
    setSelectedQuizOption(null);
    setQuizScore(0);
    setQuizCompleted(false);
  };

  return (
    <Section id="mudras" className="relative overflow-hidden bg-gradient-to-b from-purple-950 via-purple-900 to-purple-950 text-alabaster">
      <div className="relative">
        {/* Header & Mode Switch */}
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row sm:items-end">
          <div className="max-w-2xl text-center sm:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-purple-900/80 px-3.5 py-1 mb-4 shadow-sm">
              <Sparkles size={12} className="text-gold" />
              <span className="text-[0.68rem] uppercase tracking-[0.2em] text-gold font-medium">
                Living Natyashastra Glossary
              </span>
            </div>
            <h2 className="font-serif text-3xl xs:text-4xl sm:text-5xl font-medium leading-[1.12] text-white">
              {mudras.heading}
            </h2>
            <div className="gold-rule mt-4 mb-4" />
            <p className="text-sm xs:text-base leading-relaxed text-purple-100/90 font-light">
              {mudras.subtext}
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex shrink-0 rounded-full border border-purple-700/80 bg-purple-950 p-1 shadow-lg">
            <button
              type="button"
              onClick={() => setMode("glossary")}
              className={`rounded-full px-4 py-2 text-xs font-semibold tracking-wider transition-all ${
                mode === "glossary"
                  ? "bg-gold text-purple-950 shadow-gold-sm"
                  : "text-purple-300 hover:text-white"
              }`}
            >
              Explore Mudras
            </button>
            <button
              type="button"
              onClick={() => setMode("quiz")}
              className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold tracking-wider transition-all ${
                mode === "quiz"
                  ? "bg-gold text-purple-950 shadow-gold-sm"
                  : "text-purple-300 hover:text-white"
              }`}
            >
              <HelpCircle size={14} />
              <span>Knowledge Quiz</span>
            </button>
          </div>
        </div>

        {/* GLOSSARY MODE */}
        {mode === "glossary" ? (
          <div className="mt-8">
            {/* Search & Category Filter Bar */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              {/* Category Pills */}
              <div className="flex flex-wrap gap-2">
                {mudras.categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-semibold tracking-wide transition-all ${
                      activeCategory === cat
                        ? "bg-purple-800 text-gold border border-gold/60"
                        : "border border-purple-800 bg-purple-950/60 text-purple-200 hover:border-gold/40 hover:text-white"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Search Input */}
              <div className="relative w-full sm:w-64">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search mudra or meaning..."
                  className="w-full rounded-full border border-purple-700 bg-purple-950/80 py-2 pl-9 pr-4 text-xs text-alabaster placeholder:text-purple-400/70 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                />
              </div>
            </div>

            {/* Mobile Swipe Hint & Navigation */}
            <div className="mt-6 flex items-center justify-between sm:hidden">
              <div className="flex items-center gap-2 text-xs text-purple-300">
                <Hand size={14} className="text-gold animate-bounce" />
                <span>Tap card to flip meaning</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => scroll("left")}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-purple-700 bg-purple-900/60 text-gold"
                  aria-label="Previous"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => scroll("right")}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-purple-700 bg-purple-900/60 text-gold"
                  aria-label="Next"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Mudras Grid / Carousel */}
            <div
              ref={scrollRef}
              className="mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-6 pt-1 no-scrollbar sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:overflow-visible"
            >
              {filteredMudras.map((mudra, index) => {
                const isActive = active === index;

                return (
                  <div
                    key={mudra.name}
                    className="w-[82%] xs:w-[75%] shrink-0 snap-start sm:w-auto"
                  >
                    <motion.button
                      type="button"
                      onClick={() => handleToggle(index)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`relative w-full h-[320px] rounded-2xl border text-left p-6 transition-all duration-300 shadow-card flex flex-col justify-between overflow-hidden ${
                        isActive
                          ? "border-gold bg-gradient-to-br from-purple-800 via-purple-900 to-purple-950 shadow-gold-sm"
                          : "border-purple-700/70 bg-purple-900/80 hover:border-gold/60 hover:bg-purple-800/80"
                      }`}
                      aria-expanded={isActive}
                    >
                      {/* Background radial accent */}
                      <div className="absolute -top-12 -right-12 h-36 w-36 rounded-full bg-gold/10 blur-xl pointer-events-none" />

                      <AnimatePresence mode="wait">
                        {isActive ? (
                          /* Card Back: Meaning & Shloka */
                          <motion.div
                            key="back"
                            initial={{ opacity: 0, rotateY: -15 }}
                            animate={{ opacity: 1, rotateY: 0 }}
                            exit={{ opacity: 0, rotateY: 15 }}
                            transition={{ duration: 0.25 }}
                            className="flex h-full flex-col justify-between z-10"
                          >
                            <div>
                              <div className="flex items-center justify-between border-b border-purple-700 pb-2.5 mb-3">
                                <span className="text-[0.62rem] uppercase tracking-[0.2em] text-gold font-semibold">
                                  Sacred Meaning
                                </span>
                                <span className="text-xs font-serif text-purple-300">
                                  {mudra.name}
                                </span>
                              </div>

                              <p className="font-serif text-sm leading-relaxed text-gold-100 sm:text-base">
                                {mudra.meaning}
                              </p>

                              {mudra.shloka && (
                                <p className="mt-3 text-[0.68rem] font-serif italic text-purple-300/90 border-t border-purple-800/60 pt-2">
                                  {mudra.shloka}
                                </p>
                              )}
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t border-purple-700/60 text-[0.65rem] text-purple-300 uppercase tracking-wider">
                              <span className="text-gold font-medium">{mudra.category}</span>
                              <span className="flex items-center gap-1 text-gold/80">
                                <RotateCw size={11} /> Flip to view
                              </span>
                            </div>
                          </motion.div>
                        ) : (
                          /* Card Front: Gesture Illustration & Name */
                          <motion.div
                            key="front"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="flex h-full flex-col justify-between z-10"
                          >
                            <div>
                              <div className="flex items-center justify-between mb-4">
                                <span className="text-[0.65rem] uppercase tracking-[0.18em] text-vermilion-700 font-bold bg-white/10 px-2.5 py-0.5 rounded-full border border-white/10">
                                  Asamyuta Hasta
                                </span>
                                <span className="text-xs font-semibold text-purple-300">
                                  0{index + 1}
                                </span>
                              </div>

                              <div className="my-3 flex items-center justify-center py-2">
                                <MudraIcon index={mudra.iconIndex ?? index} />
                              </div>
                            </div>

                            <div>
                              <h3 className="font-serif text-xl sm:text-2xl font-medium text-white group-hover:text-gold transition-colors">
                                {mudra.name}
                              </h3>
                              <p className="text-xs text-purple-200 mt-1 italic font-light">
                                &ldquo;{mudra.translation}&rdquo;
                              </p>

                              <div className="mt-3 flex items-center justify-between text-[0.65rem] text-purple-300 border-t border-purple-800/60 pt-2">
                                <span className="text-gold/90">{mudra.category}</span>
                                <span className="flex items-center gap-1 text-gold/80 font-medium">
                                  <span>Story meaning</span>
                                  <span>→</span>
                                </span>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  </div>
                );
              })}
            </div>

            {filteredMudras.length === 0 && (
              <div className="rounded-2xl border border-purple-800 bg-purple-950/60 p-10 text-center text-purple-300">
                <p className="font-serif text-lg text-white">No mudras found matching &ldquo;{searchQuery}&rdquo;</p>
                <p className="mt-1 text-xs">Try searching for a different keyword or select &ldquo;All&rdquo; categories.</p>
              </div>
            )}
          </div>
        ) : (
          /* QUIZ MODE */
          <div className="mt-8 mx-auto max-w-2xl rounded-3xl border border-gold/40 bg-purple-950/80 p-6 shadow-2xl backdrop-blur-md sm:p-10">
            {!quizCompleted ? (
              <div>
                <div className="flex items-center justify-between border-b border-purple-800 pb-4">
                  <span className="rounded-full bg-gold/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-gold border border-gold/40">
                    Question {currentQuizIndex + 1} of {QUIZ_QUESTIONS.length}
                  </span>
                  <span className="font-serif text-sm text-purple-200">
                    Score: <strong className="text-gold">{quizScore}</strong>
                  </span>
                </div>

                <div className="my-6">
                  <h3 className="font-serif text-xl sm:text-2xl font-medium leading-relaxed text-alabaster">
                    {QUIZ_QUESTIONS[currentQuizIndex].question}
                  </h3>
                  <p className="mt-2 text-xs italic text-purple-300">
                    💡 Hint: {QUIZ_QUESTIONS[currentQuizIndex].hint}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {QUIZ_QUESTIONS[currentQuizIndex].options.map((option) => {
                    const isSelected = selectedQuizOption === option;
                    const isCorrect = option === QUIZ_QUESTIONS[currentQuizIndex].answer;

                    let btnClass = "border-purple-700 bg-purple-900/60 text-white hover:border-gold";
                    if (selectedQuizOption !== null) {
                      if (isCorrect) {
                        btnClass = "border-emerald-500 bg-emerald-900/80 text-emerald-100 font-bold";
                      } else if (isSelected) {
                        btnClass = "border-rose-500 bg-rose-900/80 text-rose-100";
                      }
                    }

                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => handleQuizAnswer(option)}
                        disabled={selectedQuizOption !== null}
                        className={`flex min-h-14 items-center justify-between rounded-xl border p-4 text-left font-serif text-base transition-all active:scale-95 ${btnClass}`}
                      >
                        <span>{option}</span>
                        {selectedQuizOption !== null && isCorrect && (
                          <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Quiz Score Celebration Card */
              <div className="text-center py-6">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gold text-purple-950 shadow-gold">
                  <Award size={32} />
                </div>
                <h3 className="mt-5 font-serif text-3xl font-medium text-white">
                  {quizScore === QUIZ_QUESTIONS.length ? "Vidya Praveena!" : "Classical Rasika"}
                </h3>
                <p className="mt-2 text-sm text-purple-200">
                  You scored <strong className="text-gold font-serif text-xl">{quizScore} / {QUIZ_QUESTIONS.length}</strong> on classical mudra knowledge.
                </p>
                <p className="mt-4 text-xs leading-relaxed text-purple-300 max-w-md mx-auto">
                  {quizScore === QUIZ_QUESTIONS.length
                    ? "Exceptional! You possess a refined natural intuition for the sacred storytelling of Kuchipudi."
                    : "Splendid effort! Hand gestures are a living language best mastered through hands-on guidance at the academy."}
                </p>

                <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={resetQuiz}
                    className="btn-gold-outline text-xs uppercase tracking-wider px-6 py-3"
                  >
                    Try Again
                  </button>
                  <a
                    href="#contact"
                    className="btn-primary text-xs uppercase tracking-wider px-6 py-3"
                  >
                    Learn Mudras in Class
                  </a>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Section>
  );
}
