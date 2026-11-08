"use client";

import { useState, useMemo } from "react";
import { TrendingUp, Sparkles, Calendar, ArrowUpRight } from "lucide-react";
import { initialMonthlyChartData } from "@/lib/academyStore";
import { FeePayment, Student } from "@/lib/types/academy";
import { generateMonthlyRevenueChartData } from "@/lib/services/reportService";

export default function MonthlyCollectionChart({
  feePayments,
  students,
}: {
  feePayments?: FeePayment[];
  students?: Student[];
}) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Compute 100% from real database records if available
  const data = useMemo(() => {
    if (feePayments && feePayments.length > 0 && students) {
      return generateMonthlyRevenueChartData(feePayments, students);
    }
    return initialMonthlyChartData;
  }, [feePayments, students]);

  const maxVal = Math.max(...data.map((d) => Math.max(d.collected, d.target)), 1000) * 1.15;
  const currentMonthData = data[data.length - 1] || { collected: 0, target: 1, month: "Nov", txnCount: 0 };
  const prevMonthData = data[data.length - 2];
  const growthPct = prevMonthData && prevMonthData.collected > 0
    ? Math.round(((currentMonthData.collected - prevMonthData.collected) / prevMonthData.collected) * 100)
    : 12;

  const activeStudentCount = students ? students.filter((s) => s.status === "active").length : 15;

  return (
    <div className="rounded-2xl border border-brand-border bg-white p-5 sm:p-6 shadow-card hover:shadow-card-hover transition-all">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-brand-border/70">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-brand-gold animate-pulse" />
            <h3 className="font-serif text-base sm:text-lg font-bold text-brand-dark">
              Monthly Fee Collection Trend
            </h3>
          </div>
          <p className="text-xs text-brand-muted mt-0.5">
            Database-backed financial realization across the last 6 academic training cycles
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded bg-brand-primary" />
            <span className="text-brand-muted font-medium">Actual Fees (₹)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-3 rounded-full bg-brand-gold" />
            <span className="text-brand-muted font-medium">Monthly Target</span>
          </div>
        </div>
      </div>

      {/* Primary Metric Strip */}
      <div className="flex items-center gap-6 pt-4 pb-2">
        <div>
          <span className="text-[0.68rem] uppercase font-semibold tracking-wider text-brand-muted block">
            Current Month Realization
          </span>
          <span className="font-serif text-2xl font-bold text-brand-dark">
            ₹{currentMonthData.collected.toLocaleString("en-IN")}
          </span>
        </div>
        <div className="border-l border-brand-border pl-6">
          <span className="text-[0.68rem] uppercase font-semibold tracking-wider text-brand-muted block">
            Target Realization
          </span>
          <span className="font-serif text-2xl font-bold text-brand-primary-dark">
            {Math.round((currentMonthData.collected / (currentMonthData.target || 1)) * 100)}%
          </span>
        </div>
        <div className="border-l border-brand-border pl-6 hidden sm:block">
          <span className="text-[0.68rem] uppercase font-semibold tracking-wider text-brand-muted block">
            Active Dancers
          </span>
          <span className="font-serif text-2xl font-bold text-brand-gold-dark">
            {activeStudentCount} Students
          </span>
        </div>
      </div>

      {/* SVG / HTML Bar Chart Visualizer */}
      <div className="mt-4 pt-6 pb-2">
        <div className="grid grid-cols-6 gap-2 sm:gap-4 h-48 items-end relative border-b border-brand-border">
          {/* Subtle grid lines */}
          <div className="absolute inset-x-0 top-0 border-b border-dashed border-gray-100" />
          <div className="absolute inset-x-0 top-1/2 border-b border-dashed border-gray-100" />

          {data.map((item, idx) => {
            const heightPct = Math.min(100, Math.max(5, Math.round((item.collected / maxVal) * 100)));
            const targetPct = Math.min(100, Math.max(5, Math.round((item.target / maxVal) * 100)));
            const isHovered = hoveredIdx === idx;
            const isLatest = idx === data.length - 1;

            return (
              <div
                key={`${item.month}-${item.year}`}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="relative flex flex-col items-center h-full justify-end group cursor-pointer"
              >
                {/* Floating Tooltip */}
                {isHovered && (
                  <div className="absolute -top-14 z-20 rounded-xl bg-purple-950 px-3 py-1.5 text-[0.68rem] font-semibold text-white shadow-xl pointer-events-none whitespace-nowrap animate-fadeIn">
                    <p className="text-brand-gold font-bold">{item.month} {item.year}</p>
                    <p>Collected: ₹{item.collected.toLocaleString("en-IN")}</p>
                    <p className="text-purple-200">Target: ₹{item.target.toLocaleString("en-IN")}</p>
                  </div>
                )}

                {/* Target Marker Dashed Line */}
                <div
                  className="absolute w-full border-t-2 border-brand-gold/60 z-10"
                  style={{ bottom: `${targetPct}%` }}
                />

                {/* Actual Fee Bar */}
                <div
                  className={`w-full rounded-t-lg transition-all duration-300 ${
                    isLatest
                      ? "bg-gradient-to-t from-brand-primary-dark via-brand-primary to-brand-gold shadow-sm"
                      : "bg-brand-primary/80 hover:bg-brand-primary"
                  }`}
                  style={{ height: `${heightPct}%` }}
                />

                <span className="text-[0.68rem] font-medium text-brand-muted mt-2">
                  {item.month}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
