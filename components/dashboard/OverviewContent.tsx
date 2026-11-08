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
} from "lucide-react";
import MetricCard from "./MetricCard";
import MonthlyCollectionChart from "./MonthlyCollectionChart";
import AttendanceOverviewCard from "./AttendanceOverviewCard";
import RecentPaymentsTable from "./RecentPaymentsTable";
import { Student, Batch, FeePayment, AttendanceRecord } from "@/lib/types/academy";

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function OverviewContent({
  students,
  batches,
  feePayments,
  attendance,
  onNavigateTab,
  onOpenEnrollModal,
  onOpenFeeModal,
  onViewReceipt,
}: {
  students: Student[];
  batches: Batch[];
  feePayments: FeePayment[];
  attendance: AttendanceRecord[];
  onNavigateTab: (tab: string) => void;
  onOpenEnrollModal: () => void;
  onOpenFeeModal: () => void;
  onViewReceipt: (payment: FeePayment) => void;
}) {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const todayStr = new Date().toISOString().split("T")[0];

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
  const paidStudentIds = new Set(thisMonthPayments.map((p) => p.studentId));
  const pendingStudents = students.filter(
    (s) => s.status === "active" && !paidStudentIds.has(s.id)
  );
  const pendingFeesTotal = pendingStudents.reduce((sum, s) => {
    const b = batches.find((batch) => batch.id === s.batchId);
    return sum + (b?.monthlyFee || 1500);
  }, 0);

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
          trend="up"
          trendValue="+14%"
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
          trend="up"
          trendValue="+8%"
          onClick={() => onNavigateTab("payment-history")}
        />

        {/* 6. Pending Fees */}
        <MetricCard
          title="Pending Fees"
          value={`₹${pendingFeesTotal.toLocaleString("en-IN")}`}
          subtext={`${pendingStudents.length} students overdue`}
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

        {/* Today's Studio Batches & Actions (4 columns) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card hover:shadow-card-hover transition-all">
            <div className="flex items-center justify-between pb-3 border-b border-brand-border">
              <div className="flex items-center gap-2">
                <Calendar size={15} className="text-brand-gold-dark" />
                <h3 className="font-serif text-base font-bold text-brand-dark">
                  Class Schedule
                </h3>
              </div>
              <button
                onClick={() => onNavigateTab("batches")}
                type="button"
                className="text-xs text-brand-primary-dark font-semibold hover:text-brand-gold flex items-center gap-1"
              >
                <span>All ({batches.length})</span>
                <ArrowRight size={12} />
              </button>
            </div>

            <div className="divide-y divide-gray-100 mt-2 text-xs">
              {batches.slice(0, 3).map((b) => {
                const count = students.filter(
                  (s) => s.batchId === b.id && s.status === "active"
                ).length;

                return (
                  <div key={b.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-brand-dark truncate max-w-[170px]">
                        {b.name}
                      </p>
                      <p className="text-[0.68rem] text-brand-muted flex items-center gap-1 mt-0.5">
                        <Clock size={11} className="text-brand-gold-dark" />
                        <span>{b.scheduleDays.join(", ")} • {b.startTime}</span>
                      </p>
                    </div>
                    <span className="rounded-md bg-[#F8F9FA] px-2 py-1 text-[0.68rem] font-bold text-brand-primary-dark border border-brand-border">
                      {count} / {b.maxCapacity}
                    </span>
                  </div>
                );
              })}
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
              <span>Send WhatsApp Reminders ({pendingStudents.length} Due)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
