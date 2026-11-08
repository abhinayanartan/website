"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  UserCheck,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  ArrowLeft,
  KeyRound,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";
import { DEMO_ACCOUNTS } from "@/lib/auth/demoAccounts";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export default function LoginPage() {
  const router = useRouter();
  const { user, signInWithEmail, resetPassword, isLoading: authLoading, isDemoMode, error: authError, clearError } = useAuth();

  // Form State
  const [activePortal, setActivePortal] = useState<"admin" | "teacher">("admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Password Reset Modal State
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetStatus, setResetStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  // If already logged in, redirect straight to dashboard
  useEffect(() => {
    if (!authLoading && user) {
      router.replace("/dashboard");
    }
  }, [user, authLoading, router]);

  // Sync activePortal default email in demo mode
  const handlePortalSwitch = (portal: "admin" | "teacher") => {
    setActivePortal(portal);
    clearError();
    setFormError(null);
    if (portal === "admin") {
      setEmail("admin@abhinayanartan.org");
      setPassword("NartanAdmin@2026");
    } else {
      setEmail("teacher@abhinayanartan.org");
      setPassword("NartanTeacher@2026");
    }
  };

  // Form Submit Handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    clearError();

    if (!email.trim()) {
      setFormError("Please enter your registered academy email address.");
      return;
    }
    if (!password) {
      setFormError("Please enter your account password.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await signInWithEmail(email, password);
      if (res.success) {
        router.push("/dashboard");
      } else {
        setFormError(res.error || "Authentication failed. Please verify credentials.");
      }
    } catch (err: any) {
      setFormError(err?.message || "An unexpected network error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick populate demo helper
  const handleUseDemo = (role: "admin" | "teacher") => {
    handlePortalSwitch(role);
  };

  // Password Reset Handler
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) {
      setResetStatus("error");
      setResetMessage("Please provide a valid academy email address.");
      return;
    }

    try {
      setResetStatus("loading");
      const res = await resetPassword(resetEmail);
      if (res.success) {
        setResetStatus("success");
        setResetMessage(
          "Password reset link has been dispatched to your email. Check your inbox and follow the secure instructions."
        );
      } else {
        setResetStatus("error");
        setResetMessage(res.error || "Failed to initiate password reset.");
      }
    } catch (err: any) {
      setResetStatus("error");
      setResetMessage(err?.message || "An unexpected error occurred.");
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex flex-col justify-between selection:bg-brand-primary selection:text-white">
      {/* Top Header / Public Website Link */}
      <header className="w-full border-b border-brand-border bg-white px-4 py-3 sm:px-8 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-3 group outline-none"
          title="Return to Abhinaya Nartan Public Website"
        >
          <div className="relative h-9 w-9 overflow-hidden rounded-full border border-brand-gold bg-purple-950 p-1 shadow-sm">
            <Image
              src={`${basePath}/logo-an.png`}
              alt="Abhinaya Nartan Emblem"
              fill
              sizes="36px"
              className="object-contain"
              priority
            />
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-sm font-bold text-brand-dark leading-tight group-hover:text-brand-primary-dark transition-colors">
              Abhinaya Nartan Dance Academy
            </span>
            <span className="text-[0.62rem] uppercase tracking-[0.2em] text-brand-gold-dark font-bold">
              Kuchipudi Classical Arts • Est. 2021
            </span>
          </div>
        </Link>

        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-full border border-brand-border px-3.5 py-1.5 text-xs font-semibold text-brand-dark hover:border-brand-primary hover:text-brand-primary-dark transition-all"
        >
          <ArrowLeft size={13} />
          <span className="hidden sm:inline">Public Website</span>
        </Link>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-white rounded-3xl border border-brand-border shadow-card overflow-hidden">
            {/* Card Header */}
            <div className="bg-gradient-to-br from-purple-950 via-purple-900 to-[#1A0D33] p-6 sm:p-8 text-white text-center relative overflow-hidden">
              {/* Subtle Gold Decorative Ring */}
              <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full border border-brand-gold/20" />
              <div className="absolute -left-12 -bottom-12 h-40 w-40 rounded-full border border-brand-gold/10" />

              <div className="relative z-10 flex flex-col items-center">
                <div className="h-16 w-16 relative overflow-hidden rounded-full border-2 border-brand-gold/70 bg-purple-900/80 p-2 shadow-lg mb-3">
                  <Image
                    src={`${basePath}/logo-an.png`}
                    alt="Emblem"
                    fill
                    sizes="64px"
                    className="object-contain"
                  />
                </div>
                <h1 className="font-serif text-xl sm:text-2xl font-bold text-white tracking-wide">
                  Academy Manager
                </h1>
                <p className="mt-1 text-xs text-brand-gold/90 flex items-center gap-1.5">
                  <Sparkles size={12} className="text-brand-gold" />
                  <span>Faculty & Administration Portal</span>
                </p>
              </div>
            </div>

            {/* Role Portal Switcher */}
            <div className="p-2 bg-[#F8F9FA] border-b border-brand-border grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => handlePortalSwitch("admin")}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                  activePortal === "admin"
                    ? "bg-white text-brand-primary-dark shadow-sm border border-brand-primary/30"
                    : "text-brand-muted hover:text-brand-dark"
                }`}
              >
                <ShieldCheck size={14} className={activePortal === "admin" ? "text-brand-primary-dark" : ""} />
                <span>Admin Portal</span>
              </button>

              <button
                type="button"
                onClick={() => handlePortalSwitch("teacher")}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                  activePortal === "teacher"
                    ? "bg-white text-emerald-800 shadow-sm border border-emerald-300"
                    : "text-brand-muted hover:text-brand-dark"
                }`}
              >
                <UserCheck size={14} className={activePortal === "teacher" ? "text-emerald-700" : ""} />
                <span>Teacher Portal</span>
              </button>
            </div>

            {/* Form Content */}
            <div className="p-6 sm:p-8 space-y-5">
              {/* Error Notice */}
              {(formError || authError) && (
                <div className="flex items-start gap-2.5 rounded-2xl bg-rose-50 border border-rose-200 p-3.5 text-xs text-rose-800 animate-fadeIn">
                  <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
                  <div className="leading-relaxed">
                    {formError || authError}
                  </div>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleLogin} className="space-y-4">
                {/* Email Address */}
                <div>
                  <label
                    htmlFor="staff-email"
                    className="block text-xs font-semibold text-brand-dark mb-1.5"
                  >
                    Staff Email Address
                  </label>
                  <div className="relative">
                    <Mail
                      size={15}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-muted"
                    />
                    <input
                      id="staff-email"
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setFormError(null);
                        clearError();
                      }}
                      placeholder={
                        activePortal === "admin"
                          ? "admin@abhinayanartan.org"
                          : "teacher@abhinayanartan.org"
                      }
                      className="w-full rounded-xl border border-brand-border bg-[#F8F9FA] pl-10 pr-4 py-2.5 text-xs text-brand-dark placeholder:text-brand-muted/70 focus:border-brand-primary focus:bg-white focus:outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="staff-password"
                      className="block text-xs font-semibold text-brand-dark"
                    >
                      Account Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setShowResetModal(true);
                        setResetEmail(email);
                        setResetStatus("idle");
                        setResetMessage(null);
                      }}
                      className="text-[0.68rem] font-semibold text-brand-primary-dark hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock
                      size={15}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-muted"
                    />
                    <input
                      id="staff-password"
                      type={showPassword ? "text" : "password"}
                      required
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setFormError(null);
                        clearError();
                      }}
                      placeholder="••••••••••••"
                      className="w-full rounded-xl border border-brand-border bg-[#F8F9FA] pl-10 pr-10 py-2.5 text-xs text-brand-dark placeholder:text-brand-muted/70 focus:border-brand-primary focus:bg-white focus:outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-dark p-1"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-purple-950 py-3 px-4 text-xs font-bold text-brand-gold shadow-md hover:bg-purple-900 active:scale-[0.98] transition-all disabled:opacity-60 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={15} className="animate-spin text-brand-gold" />
                      <span>Authenticating Credentials...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In to {activePortal === "admin" ? "Admin" : "Teacher"} Workspace</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </form>

              {/* Security & No Public Registration Notice */}
              <div className="rounded-2xl bg-[#F8F9FA] border border-brand-border p-3.5 text-center">
                <p className="text-[0.68rem] text-brand-muted leading-relaxed">
                  <strong className="text-brand-dark block mb-0.5">Strictly Authorized Academy Staff Only</strong>
                  Public registration is closed. New student registrations and queries must be submitted through the public website.
                </p>
              </div>

              {/* Demo Credentials Quick Switcher */}
              {isDemoMode && (
              <div className="pt-2 border-t border-brand-border">
                <p className="text-[0.65rem] font-bold uppercase tracking-wider text-brand-muted text-center mb-2.5 flex items-center justify-center gap-1.5">
                  <KeyRound size={12} className="text-brand-gold-dark" />
                  <span>One-Click Test Accounts ({isDemoMode ? "Preview Mode" : "Supabase Connected"})</span>
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleUseDemo("admin")}
                    className="p-2 rounded-xl border border-brand-border bg-white text-left hover:border-brand-primary hover:bg-[#F5F0FC]/40 transition-all group"
                  >
                    <div className="flex items-center gap-1 text-[0.68rem] font-bold text-brand-dark group-hover:text-brand-primary-dark">
                      <ShieldCheck size={11} className="text-brand-primary-dark" />
                      <span>Director Admin</span>
                    </div>
                    <span className="text-[0.62rem] text-brand-muted block truncate">
                      admin@abhinayanartan.org
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleUseDemo("teacher")}
                    className="p-2 rounded-xl border border-brand-border bg-white text-left hover:border-emerald-400 hover:bg-emerald-50/40 transition-all group"
                  >
                    <div className="flex items-center gap-1 text-[0.68rem] font-bold text-brand-dark group-hover:text-emerald-800">
                      <UserCheck size={11} className="text-emerald-700" />
                      <span>Faculty Teacher</span>
                    </div>
                    <span className="text-[0.62rem] text-brand-muted block truncate">
                      teacher@abhinayanartan.org
                    </span>
                  </button>
                </div>
              </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-brand-border bg-white py-4 px-6 text-center text-[0.7rem] text-brand-muted">
        <p>© {new Date().getFullYear()} Abhinaya Nartan Dance Academy. All rights reserved. Encrypted with PostgreSQL Row Level Security.</p>
      </footer>

      {/* Password Reset Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-purple-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm bg-white rounded-3xl border border-brand-border p-6 shadow-2xl relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-gold/20 text-purple-950">
                <KeyRound size={20} />
              </div>
              <div>
                <h3 className="font-serif text-base font-bold text-brand-dark">
                  Reset Password
                </h3>
                <p className="text-[0.68rem] text-brand-muted">
                  Send a password recovery link to your registered email
                </p>
              </div>
            </div>

            {resetStatus === "success" ? (
              <div className="space-y-4">
                <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-xs text-emerald-800 flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">{resetMessage}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  className="w-full rounded-xl bg-purple-950 py-2.5 text-xs font-semibold text-brand-gold hover:bg-purple-900 transition-colors"
                >
                  Return to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handlePasswordReset} className="space-y-4">
                {resetStatus === "error" && (
                  <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800 flex items-center gap-2">
                    <AlertCircle size={14} className="text-rose-600 shrink-0" />
                    <span>{resetMessage}</span>
                  </div>
                )}

                <div>
                  <label htmlFor="reset-email-input" className="block text-xs font-semibold text-brand-dark mb-1">
                    Your Academy Email
                  </label>
                  <input
                    id="reset-email-input"
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="you@abhinayanartan.org"
                    className="w-full rounded-xl border border-brand-border bg-[#F8F9FA] px-3.5 py-2.5 text-xs text-brand-dark focus:bg-white focus:border-brand-primary focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowResetModal(false)}
                    className="flex-1 rounded-xl border border-brand-border py-2.5 text-xs font-semibold text-brand-dark hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={resetStatus === "loading"}
                    className="flex-1 rounded-xl bg-purple-950 py-2.5 text-xs font-semibold text-brand-gold hover:bg-purple-900 transition-colors flex items-center justify-center gap-1.5"
                  >
                    {resetStatus === "loading" ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <span>Send Link</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
