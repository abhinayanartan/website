"use client";

import {
  Users,
  UserCheck,
  CheckCircle2,
  XCircle,
  CreditCard,
  AlertTriangle,
  Calendar,
  Clock,
  ArrowRight,
  UserPlus,
  Send,
  CalendarPlus,
  ClipboardCheck,
  Sparkles,
} from "lucide-react";
import MetricCard from "./MetricCard";
import MonthlyCollectionChart from "./MonthlyCollectionChart";
import AttendanceOverviewCard from "./AttendanceOverviewCard";
import RecentPaymentsTable from "./RecentPaymentsTable";
import { Student, Batch, FeePayment, AttendanceRecord, DanceClass, FeeAdjustment } from "@/lib/types/academy";
import { getIndiaDate, getIndiaDateParts } from "@/lib/date";
import { calculateStudentFeeSummary } from "@/lib/services/feeService";

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function OverviewContent({
  students,
  batches,
  feePayments,
  attendance,
  classes,
  feeAdjustments,
  onNavigateTab,
  onOpenAttendanceForBatch,
  onOpenEnrollModal,
  onOpenFeeModal,
  onViewReceipt,
}: {
  students: Student[];
  batches: Batch[];
  feePayments: FeePayment[];
  attendance: AttendanceRecord[];
  classes: DanceClass[];
  feeAdjustments: FeeAdjustment[];
  onNavigateTab: (tab: string) => void;
  onOpenAttendanceForBatch: (batchId: string) => void;
  onOpenEnrollModal: () => void;
  onOpenFeeModal: () => void;
  onViewReceipt: (payment: FeePayment) => void;
}) {
  const todayStr = getIndiaDate();
  const { month: currentMonth, year: currentYear } = getIndiaDateParts();

  const totalStudents = students.length;
  const activeStudents = students.filter((s) => s.status === "active").length;

  // Attendance metrics for today
  const todayAttendance = attendance.filter((a) => a.date === todayStr);
  const presentToday = todayAttendance.filter((a) => a.status === "present").length;
  const absentToday = todayAttendance.filter((a) => a.status === "absent").length;

  // Fees metrics for current month
  const thisMonthPayments = feePayments.filter(
    (p) => p.forMonth === currentMonth && p.forYear === currentYear
  );
  const feesCollectedThisMonth = thisMonthPayments.reduce((sum, p) => sum + p.amountPaid, 0);

  // Pending fees calculation
  const pendingFeeSummaries = students
    .filter((student) => student.status === "active")
    .map((student) =>
      calculateStudentFeeSummary(
        student,
        batches.find((batch) => batch.id === student.batchId),
        currentMonth,
        currentYear,
        feePayments,
        feeAdjustments
      )
    )
    .filter((summary) => summary.outstandingBalance > 0);
  const pendingFeesTotal = pendingFeeSummaries.reduce(
    (sum, summary) => sum + summary.outstandingBalance,
    0
  );

  const todayClasses = classes
    .filter((danceClass) => danceClass.classDate === todayStr && danceClass.status !== "cancelled")
    .sort((first, second) => first.startTime.localeCompare(second.startTime));

  const needsFirstBatch = batches.length === 0;
  const isNewAcademy = students.length === 0;

  if (isNewAcademy) {
    const setupSteps = [
      {
        number: "01",
        title: "Create a batch",
        description: "Add the class name, schedule, teacher, capacity, and monthly fee.",
        icon: CalendarPlus,
        active: needsFirstBatch,
      },
      {
        number: "02",
        title: "Enroll students",
        description: "Assign each dancer to their batch and record guardian details.",
        icon: UserPlus,
        active: !needsFirstBatch,
      },
      {
        number: "03",
        title: "Mark attendance",
        description: "Use the daily register once your first class has started.",
        icon: ClipboardCheck,
      },
    ];

    return (
      <section className="mx-auto max-w-3xl py-2 sm:py-8">
        <div className="overflow-hidden rounded-3xl border border-brand-primary/25 bg-gradient-to-br from-purple-950 via-purple-900 to-[#4A2879] text-white shadow-xl">
          <div className="p-6 sm:p-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-gold/40 bg-brand-gold/10 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-brand-gold">
              <Sparkles size={13} />
              <span>Academy setup</span>
            </div>
            <h1 className="mt-4 font-serif text-2xl font-bold leading-tight sm:text-4xl">
              {needsFirstBatch ? "Your academy is ready for its first class." : "Your first batch is ready for enrollment."}
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-purple-100 sm:text-base">
              {needsFirstBatch
                ? "Start by creating the first batch. Once it is saved, you can enroll dancers and begin taking attendance from this dashboard."
                : "Enroll your first dancer and assign their monthly fee. Attendance and fee collection will then be ready when the class begins."}
            </p>
            <button
              type="button"
              onClick={() => onNavigateTab(needsFirstBatch ? "batches" : "students")}
              className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-brand-gold px-5 py-3 text-sm font-bold text-purple-950 shadow-gold-sm transition-transform active:scale-[0.98] sm:w-auto"
            >
              {needsFirstBatch ? <CalendarPlus size={18} /> : <UserPlus size={18} />}
              <span>{needsFirstBatch ? "Create your first batch" : "Enroll your first student"}</span>
              <ArrowRight size={16} />
            </button>
          </div>

          <div className="grid border-t border-white/10 bg-black/10 sm:grid-cols-3">
            {setupSteps.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.number} className="flex gap-3 border-b border-white/10 p-5 last:border-b-0 sm:block sm:border-b-0 sm:border-r sm:last:border-r-0 sm:p-6">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${step.active ? "bg-brand-gold text-purple-950" : "bg-white/10 text-brand-gold"}`}>
                    <Icon size={18} />
                  </div>
                  <div className="sm:mt-4">
                    <p className="text-[0.62rem] font-bold tracking-[0.18em] text-brand-gold">STEP {step.number}</p>
                    <h2 className="mt-0.5 font-serif text-base font-bold">{step.title}</h2>
                    <p className="mt-1 text-xs leading-relaxed text-purple-200">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      {/* 6 Primary Metric Cards as specified */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* 1. Total Students */}
        <MetricCard
          title="Total Students"
          value={totalStudents}
          subtext="Registered dancers"
          icon={Users}
          variant="primary"
          onClick={() => onNavigateTab("students")}
        />

        {/* 2. Active Students */}
        <MetricCard
          title="Active Students"
          value={activeStudents}
          subtext={`${totalStudents - activeStudents} inactive/leave`}
          icon={UserCheck}
          variant="primary"
          onClick={() => onNavigateTab("students")}
        />

        {/* 3. Present Today */}
        <MetricCard
          title="Present Today"
          value={presentToday}
          subtext="In classical batches"
          icon={CheckCircle2}
          variant="success"
          onClick={() => onNavigateTab("attendance")}
        />

        {/* 4. Absent Today */}
        <MetricCard
          title="Absent Today"
          value={absentToday}
          subtext="Needs follow-up"
          icon={XCircle}
          variant="accent"
          onClick={() => onNavigateTab("attendance")}
        />

        {/* 5. Fees Collected This Month */}
        <MetricCard
          title="Fees Collected"
          value={`₹${feesCollectedThisMonth.toLocaleString("en-IN")}`}
          subtext={`${thisMonthPayments.length} verified receipts`}
          icon={CreditCard}
          variant="gold"
          onClick={() => onNavigateTab("payment-history")}
        />

        {/* 6. Pending Fees */}
        <MetricCard
          title="Pending Fees"
          value={`₹${pendingFeesTotal.toLocaleString("en-IN")}`}
          subtext={`${pendingFeeSummaries.length} students with dues`}
          icon={AlertTriangle}
          variant="accent"
          onClick={() => onNavigateTab("pending-fees")}
        />
      </div>

      {/* Main Visuals Row: Monthly Fee Collection Chart & Attendance Overview */}
      <div className="grid lg:grid-cols-12 gap-6 items-stretch">
        {/* Monthly Fee Collection Chart (7 columns) */}
        <div className="lg:col-span-7">
          <MonthlyCollectionChart feePayments={feePayments} students={students} />
        </div>

        {/* Attendance Overview (5 columns) */}
        <div className="lg:col-span-5 flex flex-col">
          <AttendanceOverviewCard
            batches={batches}
            students={students}
            attendance={attendance}
            onOpenAttendance={() => onNavigateTab("attendance")}
          />
        </div>
      </div>

      {/* Bottom Grid: Recent Payments Table & Quick Actions */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Recent Payments Table (8 columns) */}
        <div className="lg:col-span-8">
          <RecentPaymentsTable
            payments={feePayments}
            students={students}
            batches={batches}
            onViewReceipt={onViewReceipt}
            onNavigateHistory={() => onNavigateTab("payment-history")}
          />
        </div>

          {/* Today's Studio Work & Actions (4 columns) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card hover:shadow-card-hover transition-all">
            <div className="flex items-center justify-between pb-3 border-b border-brand-border">
              <div className="flex items-center gap-2">
                <Calendar size={15} className="text-brand-gold-dark" />
                <h3 className="font-serif text-base font-bold text-brand-dark">
                    Today at the Studio
                </h3>
              </div>
              <button
                  onClick={() => onNavigateTab("classes")}
                  type="button"
                  className="flex items-center gap-1 text-xs font-semibold text-brand-primary-dark hover:text-brand-gold"
              >
                  <span>Calendar ({todayClasses.length})</span>
                  <ArrowRight size={12} />
              </button>
            </div>

              <div className="mt-2 divide-y divide-gray-100 text-xs">
                {todayClasses.length === 0 ? (
                  <div className="py-5 text-center">
                    <p className="font-semibold text-brand-dark">No class is scheduled for today.</p>
                    <p className="mt-1 text-[0.68rem] leading-relaxed text-brand-muted">
                      Add a dated class in the calendar when you are ready to take attendance.
                    </p>
                    <button
                      type="button"
                      onClick={() => onNavigateTab("classes")}
                      className="mt-3 inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-brand-primary/30 bg-[#F5F0FC] px-3 text-xs font-semibold text-brand-primary-dark"
                    >
                      <CalendarPlus size={14} />
                      <span>Open class calendar</span>
                    </button>
                  </div>
                ) : (
                  todayClasses.slice(0, 3).map((danceClass) => {
                    const enrolledCount = students.filter(
                      (student) => student.batchId === danceClass.batchId && student.status === "active"
                    ).length;
                    const label = danceClass.batchName || danceClass.className || "Scheduled class";

                    return (
                      <div key={danceClass.id} className="py-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-brand-dark">{label}</p>
                            <p className="mt-0.5 flex items-center gap-1 text-[0.68rem] text-brand-muted">
                              <Clock size={11} className="shrink-0 text-brand-gold-dark" />
                              <span>{danceClass.startTime} – {danceClass.endTime}</span>
                            </p>
                          </div>
                          <span className="shrink-0 rounded-md border border-brand-border bg-[#F8F9FA] px-2 py-1 text-[0.65rem] font-bold text-brand-primary-dark">
                            {enrolledCount} dancers
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => onOpenAttendanceForBatch(danceClass.batchId)}
                          className="mt-2 inline-flex min-h-10 items-center gap-1.5 text-xs font-semibold text-brand-primary-dark hover:text-brand-gold"
                        >
                          <ClipboardCheck size={14} />
                          <span>Start attendance</span>
                          <ArrowRight size={13} />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
          </div>

          {/* Quick Action Shortcuts Card */}
          <div className="rounded-2xl border border-brand-primary/30 bg-gradient-to-br from-[#F5F0FC] via-white to-[#FDFBF4] p-5 shadow-sm space-y-2.5">
            <h4 className="font-serif text-sm font-bold text-brand-dark">
              Quick Administrative Tasks
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={onOpenEnrollModal}
                type="button"
                className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-white border border-brand-border text-brand-dark font-semibold hover:border-brand-primary hover:text-brand-primary-dark shadow-sm transition-all"
              >
                <UserPlus size={13} className="text-brand-primary-dark" />
                <span>Enroll Dancer</span>
              </button>

              <button
                onClick={onOpenFeeModal}
                type="button"
                className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-white border border-brand-border text-brand-dark font-semibold hover:border-brand-gold hover:text-brand-gold-dark shadow-sm transition-all"
              >
                <CreditCard size={13} className="text-brand-gold-dark" />
                <span>Receive Fee</span>
              </button>
            </div>

            <button
              onClick={() => onNavigateTab("pending-fees")}
              type="button"
              className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-brand-accent/10 border border-brand-accent/30 text-brand-accent font-semibold hover:bg-brand-accent hover:text-white transition-all text-xs"
            >
              <Send size={13} />
              <span>Send WhatsApp Reminders ({pendingFeeSummaries.length} Due)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
