"use client";

import { LucideIcon, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon: LucideIcon;
  variant?: "primary" | "gold" | "accent" | "success";
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  onClick?: () => void;
}

export default function MetricCard({
  title,
  value,
  subtext,
  icon: Icon,
  variant = "primary",
  trend,
  trendValue,
  onClick,
}: MetricCardProps) {
  // Brand color mappings
  // Primary: #B79CED (Light Purple), Gold: #D4AF37, Accent: #E8552D (Reddish Orange)
  const styles = {
    primary: {
      border: "border-brand-primary/40 hover:border-brand-primary",
      iconBg: "bg-[#F5F0FC] text-brand-primary-dark",
      textAccent: "text-brand-dark",
      badge: "bg-purple-50 text-purple-700",
    },
    gold: {
      border: "border-brand-gold/40 hover:border-brand-gold",
      iconBg: "bg-[#FDFBF4] text-brand-gold-dark",
      textAccent: "text-brand-dark",
      badge: "bg-amber-50 text-amber-800",
    },
    accent: {
      border: "border-brand-accent/40 hover:border-brand-accent",
      iconBg: "bg-[#FEF5F2] text-brand-accent",
      textAccent: "text-brand-accent",
      badge: "bg-rose-50 text-brand-accent",
    },
    success: {
      border: "border-emerald-200 hover:border-emerald-400",
      iconBg: "bg-emerald-50 text-emerald-700",
      textAccent: "text-emerald-800",
      badge: "bg-emerald-50 text-emerald-700",
    },
  }[variant];

  return (
    <div
      onClick={onClick}
      className={`group relative rounded-2xl border bg-white p-5 shadow-card transition-all duration-300 hover:shadow-card-hover ${
        styles.border
      } ${onClick ? "cursor-pointer" : ""}`}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-brand-muted">
          {title}
        </span>
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105 ${styles.iconBg}`}
        >
          <Icon size={18} strokeWidth={2.2} />
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-2.5">
        <span className={`font-serif text-2xl sm:text-3xl font-bold tracking-tight ${styles.textAccent}`}>
          {value}
        </span>
        {trendValue && (
          <span
            className={`inline-flex items-center text-[0.68rem] font-bold px-1.5 py-0.5 rounded-full ${
              trend === "up"
                ? "bg-emerald-50 text-emerald-700"
                : trend === "down"
                ? "bg-rose-50 text-rose-700"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {trend === "up" ? (
              <ArrowUpRight size={11} className="mr-0.5" />
            ) : trend === "down" ? (
              <ArrowDownRight size={11} className="mr-0.5" />
            ) : null}
            {trendValue}
          </span>
        )}
      </div>

      {subtext && (
        <p className="mt-1.5 text-[0.72rem] font-medium text-brand-muted truncate">
          {subtext}
        </p>
      )}
    </div>
  );
}
