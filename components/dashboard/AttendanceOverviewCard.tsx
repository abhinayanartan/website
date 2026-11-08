"use client";

import { CheckSquare, Users, CheckCircle2, XCircle, Clock, ArrowRight } from "lucide-react";
import { Batch, Student, AttendanceRecord } from "@/lib/types/academy";

export default function AttendanceOverviewCard({
  batches,
  students,
  attendance,
  onOpenAttendance,
}: {
  batches: Batch[];
  students: Student[];
  attendance: AttendanceRecord[];
  onOpenAttendance: () => void;
}) {
  const todayStr = new Date().toISOString().split("T")[0];
  const todayRecords = attendance.filter((a) => a.date === todayStr);

  const presentCount = todayRecords.filter((a) => a.status === "present").length;
  const absentCount = todayRecords.filter((a) => a.status === "absent").length;
  const lateCount = todayRecords.filter((a) => a.status === "late").length;
  const activeStudentsCount = students.filter((s) => s.status === "active").length;
  const overallRate = activeStudentsCount > 0 ? Math.round((presentCount / activeStudentsCount) * 100) : 0;

  return (
    <div className="rounded-2xl border border-brand-border bg-white p-5 sm:p-6 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-brand-border/70">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <h3 className="font-serif text-base sm:text-lg font-bold text-brand-dark">
                Attendance Overview
              </h3>
            </div>
            <p className="text-xs text-brand-muted mt-0.5">
              Live studio attendance rate and batch breakdown for today
            </p>
          </div>
          <button
            onClick={onOpenAttendance}
            type="button"
            className="text-xs text-brand-primary-dark hover:text-brand-gold font-semibold flex items-center gap-1 transition-colors"
          >
            <span>Register</span>
            <ArrowRight size={13} />
          </button>
        </div>

        {/* Big Presence Progress Summary */}
        <div className="mt-4 grid grid-cols-3 gap-2.5 text-center">
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3">
            <span className="text-[0.65rem] font-bold uppercase tracking-wider text-emerald-800 flex items-center justify-center gap-1">
              <CheckCircle2 size={11} />
              <span>Present</span>
            </span>
            <span className="font-serif text-xl sm:text-2xl font-bold text-emerald-800 mt-0.5 block">
              {presentCount}
            </span>
          </div>

          <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-3">
            <span className="text-[0.65rem] font-bold uppercase tracking-wider text-brand-accent flex items-center justify-center gap-1">
              <XCircle size={11} />
              <span>Absent</span>
            </span>
            <span className="font-serif text-xl sm:text-2xl font-bold text-brand-accent mt-0.5 block">
              {absentCount}
            </span>
          </div>

          <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-3">
            <span className="text-[0.65rem] font-bold uppercase tracking-wider text-amber-800 flex items-center justify-center gap-1">
              <Clock size={11} />
              <span>Late</span>
            </span>
            <span className="font-serif text-xl sm:text-2xl font-bold text-amber-800 mt-0.5 block">
              {lateCount}
            </span>
          </div>
        </div>

        {/* Batch-by-Batch Presence Breakdown */}
        <div className="mt-5 space-y-3">
          <p className="text-[0.68rem] uppercase font-bold tracking-wider text-brand-muted">
            Presence by Batch:
          </p>

          <div className="space-y-2.5 text-xs">
            {batches.map((batch) => {
              const batchStudents = students.filter(
                (s) => s.batchId === batch.id && s.status === "active"
              );
              const batchRecords = todayRecords.filter((r) => r.batchId === batch.id);
              const presentInBatch = batchRecords.filter((r) => r.status === "present").length;
              const rate = batchStudents.length > 0 ? Math.round((presentInBatch / batchStudents.length) * 100) : 0;

              return (
                <div key={batch.id} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-brand-dark truncate max-w-[200px]">
                      {batch.name}
                    </span>
                    <span className="text-brand-muted font-medium">
                      {presentInBatch} / {batchStudents.length} ({rate}%)
                    </span>
                  </div>
                  <div className="w-full bg-[#E9ECEF] h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        rate >= 80 ? "bg-emerald-500" : rate >= 50 ? "bg-brand-gold" : "bg-brand-accent"
                      }`}
                      style={{ width: `${rate}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="mt-5 pt-3 border-t border-brand-border/60">
        <button
          onClick={onOpenAttendance}
          type="button"
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#F5F0FC] py-2.5 text-xs font-semibold text-brand-primary-dark hover:bg-brand-primary hover:text-white transition-all duration-200"
        >
          <CheckSquare size={14} />
          <span>Mark / Edit Today&apos;s Class Attendance</span>
        </button>
      </div>
    </div>
  );
}
