"use client";

import { ShieldCheck, UserCheck } from "lucide-react";
import { StaffRole } from "@/lib/types/auth";

export default function RoleBadge({
  role,
  size = "md",
}: {
  role: StaffRole;
  size?: "sm" | "md" | "lg";
}) {
  const isAdmin = role === "admin";

  const sizeClasses = {
    sm: "px-2 py-0.5 text-[0.62rem] gap-1",
    md: "px-2.5 py-1 text-xs gap-1.5",
    lg: "px-3 py-1.5 text-xs gap-2",
  }[size];

  const iconSizes = {
    sm: 11,
    md: 13,
    lg: 15,
  }[size];

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full border transition-all ${sizeClasses} ${
        isAdmin
          ? "bg-[#F5F0FC] text-brand-primary-dark border-brand-primary/40 shadow-sm"
          : "bg-emerald-50 text-emerald-800 border-emerald-200 shadow-sm"
      }`}
    >
      {isAdmin ? (
        <>
          <ShieldCheck size={iconSizes} className="text-brand-primary-dark" />
          <span>Administrator</span>
        </>
      ) : (
        <>
          <UserCheck size={iconSizes} className="text-emerald-700" />
          <span>Faculty Teacher</span>
        </>
      )}
    </span>
  );
}
