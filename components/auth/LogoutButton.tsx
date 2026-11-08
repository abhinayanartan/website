"use client";

import { useState } from "react";
import { LogOut, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";

export default function LogoutButton({
  variant = "sidebar",
  className = "",
}: {
  variant?: "sidebar" | "header" | "button";
  className?: string;
}) {
  const { signOut } = useAuth();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await signOut();
      router.push("/login");
    } catch (e) {
      console.error("Logout failed:", e);
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (variant === "header") {
    return (
      <button
        onClick={handleLogout}
        disabled={isLoggingOut}
        type="button"
        title="Sign Out of Academy Manager"
        className={`flex h-8 w-8 items-center justify-center rounded-lg border border-brand-border text-brand-muted hover:text-rose-600 hover:border-rose-300 hover:bg-rose-50 transition-colors ${className}`}
        aria-label="Sign Out"
      >
        {isLoggingOut ? <Loader2 size={14} className="animate-spin text-brand-muted" /> : <LogOut size={14} />}
      </button>
    );
  }

  if (variant === "button") {
    return (
      <button
        onClick={handleLogout}
        disabled={isLoggingOut}
        type="button"
        className={`inline-flex items-center gap-2 rounded-xl border border-brand-border bg-white px-3.5 py-2 text-xs font-semibold text-brand-dark hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 active:scale-95 transition-all ${className}`}
      >
        {isLoggingOut ? <Loader2 size={13} className="animate-spin" /> : <LogOut size={13} />}
        <span>{isLoggingOut ? "Signing Out..." : "Sign Out"}</span>
      </button>
    );
  }

  // Default: Sidebar style
  return (
    <button
      onClick={handleLogout}
      disabled={isLoggingOut}
      type="button"
      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-brand-muted hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 border border-transparent transition-all ${className}`}
    >
      <div className="flex items-center gap-2">
        {isLoggingOut ? (
          <Loader2 size={14} className="animate-spin text-rose-600" />
        ) : (
          <LogOut size={14} className="text-brand-muted group-hover:text-rose-600" />
        )}
        <span>{isLoggingOut ? "Signing out..." : "Sign Out"}</span>
      </div>
      <span className="text-[0.62rem] uppercase font-bold tracking-wider text-brand-muted/70">
        Exit
      </span>
    </button>
  );
}
