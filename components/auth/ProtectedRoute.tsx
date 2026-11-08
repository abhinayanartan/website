"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import { StaffRole } from "@/lib/types/auth";
import { ShieldAlert, ArrowLeft, Loader2 } from "lucide-react";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: StaffRole;
}

export default function ProtectedRoute({
  children,
  requiredRole,
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [isLoading, user, router]);

  // Loading state with classical branding
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex flex-col items-center justify-center p-6 text-center">
        <div className="relative mb-6">
          <div className="relative h-20 w-20 overflow-hidden rounded-full border-2 border-brand-gold bg-purple-950 p-2 shadow-lg animate-pulse">
            <Image
              src={`${basePath}/logo-an.png`}
              alt="Abhinaya Nartan Emblem"
              fill
              sizes="80px"
              className="object-contain"
              priority
            />
          </div>
          <div className="absolute -inset-2 rounded-full border border-brand-gold/40 border-t-brand-gold animate-spin" />
        </div>
        <h2 className="font-serif text-lg sm:text-xl font-bold text-brand-dark">
          Abhinaya Nartan Dance Academy
        </h2>
        <p className="mt-1 text-xs text-brand-muted flex items-center justify-center gap-1.5">
          <Loader2 size={13} className="animate-spin text-brand-gold-dark" />
          <span>Verifying Academy Staff Credentials...</span>
        </p>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex flex-col items-center justify-center p-6 text-center">
        <p className="text-xs text-brand-muted">Redirecting to Staff Login Portal...</p>
      </div>
    );
  }

  // Role restriction check
  if (requiredRole && user.role !== requiredRole) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-white rounded-2xl border border-rose-200 p-8 shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 border border-rose-200 text-rose-600 mb-4">
            <ShieldAlert size={28} />
          </div>
          <h3 className="font-serif text-lg font-bold text-brand-dark">
            Administrative Access Restricted
          </h3>
          <p className="mt-2 text-xs text-brand-muted leading-relaxed">
            Your staff account is currently recognized as a{" "}
            <span className="font-bold text-brand-dark capitalize">{user.role}</span>.
            This module contains director-level configuration reserved for Academy Administrators.
          </p>
          <div className="mt-6 pt-4 border-t border-brand-border flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => router.push("/dashboard")}
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-950 px-4 py-2.5 text-xs font-semibold text-brand-gold hover:bg-purple-900 transition-colors"
            >
              <ArrowLeft size={14} />
              <span>Return to Dashboard</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
