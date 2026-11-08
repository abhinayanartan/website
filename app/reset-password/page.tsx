"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, KeyRound, Loader2, ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { updatePassword } = useAuth();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (password.length < 6) {
      setStatus("error");
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setStatus("error");
      setErrorMessage("Passwords do not match. Please re-enter carefully.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await updatePassword(password);
      if (res.success) {
        setStatus("success");
      } else {
        setStatus("error");
        setErrorMessage(res.error || "Unable to update password. Recovery link may have expired.");
      }
    } catch (err: any) {
      setStatus("error");
      setErrorMessage(err?.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex flex-col justify-between selection:bg-brand-primary selection:text-white">
      {/* Header */}
      <header className="w-full border-b border-brand-border bg-white px-4 py-3 sm:px-8 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-3 group outline-none"
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
              Account Security & Recovery
            </span>
          </div>
        </Link>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl border border-brand-border shadow-card overflow-hidden">
            {/* Card Header */}
            <div className="bg-gradient-to-br from-purple-950 via-purple-900 to-[#1A0D33] p-6 text-white text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-gold/20 text-brand-gold mb-3">
                <KeyRound size={24} />
              </div>
              <h1 className="font-serif text-xl font-bold text-white">
                Set New Password
              </h1>
              <p className="mt-1 text-xs text-brand-gold/90">
                Update your credentials to regain access to Academy Manager
              </p>
            </div>

            <div className="p-6 sm:p-8 space-y-5">
              {status === "success" ? (
                <div className="space-y-5 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600">
                    <CheckCircle2 size={32} />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-brand-dark">
                      Password Updated Successfully
                    </h3>
                    <p className="mt-1 text-xs text-brand-muted leading-relaxed">
                      Your new password has been safely stored with encrypted credentials. You may now proceed to sign in.
                    </p>
                  </div>
                  <button
                    onClick={() => router.push("/login")}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-purple-950 py-3 px-4 text-xs font-bold text-brand-gold hover:bg-purple-900 transition-colors"
                  >
                    <span>Proceed to Staff Login</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {status === "error" && (
                    <div className="flex items-start gap-2.5 rounded-2xl bg-rose-50 border border-rose-200 p-3.5 text-xs text-rose-800">
                      <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {/* New Password */}
                  <div>
                    <label
                      htmlFor="new-password"
                      className="block text-xs font-semibold text-brand-dark mb-1.5"
                    >
                      New Account Password
                    </label>
                    <div className="relative">
                      <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-muted" />
                      <input
                        id="new-password"
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        className="w-full rounded-xl border border-brand-border bg-[#F8F9FA] pl-10 pr-10 py-2.5 text-xs text-brand-dark focus:bg-white focus:border-brand-primary focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-dark p-1"
                      >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label
                      htmlFor="confirm-password"
                      className="block text-xs font-semibold text-brand-dark mb-1.5"
                    >
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-muted" />
                      <input
                        id="confirm-password"
                        type={showPassword ? "text" : "password"}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        className="w-full rounded-xl border border-brand-border bg-[#F8F9FA] pl-10 pr-4 py-2.5 text-xs text-brand-dark focus:bg-white focus:border-brand-primary focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-purple-950 py-3 px-4 text-xs font-bold text-brand-gold shadow-md hover:bg-purple-900 transition-all disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={15} className="animate-spin text-brand-gold" />
                        <span>Updating Password...</span>
                      </>
                    ) : (
                      <span>Save New Password & Continue</span>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-brand-border bg-white py-4 px-6 text-center text-[0.7rem] text-brand-muted">
        <p>© {new Date().getFullYear()} Abhinaya Nartan Dance Academy. All rights reserved.</p>
      </footer>
    </div>
  );
}
