"use client";

import { useState, useMemo } from "react";
import {
  FileText,
  Download,
  PieChart,
  BarChart3,
  TrendingUp,
  CreditCard,
  Users,
  CheckCircle2,
  Calendar,
  Building,
  Printer,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  FileSpreadsheet,
  Clock,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import { Student, Batch, Branch, FeePayment, AttendanceRecord } from "@/lib/types/academy";
import {
  MONTH_NAMES,
  generateDailyAttendanceReport,
  generateMonthlyAttendanceReport,
  generateStudentWiseAttendanceReport,
  generateMonthlyFeeCollectionReport,
  generateStudentEnrollmentReport,
  generateBranchWiseCollectionReport,
  generatePaymentMethodReport,
  generateMonthlyRevenueChartData,
  generateAttendanceTrendsChartData,
  generateEnrollmentGrowthChartData,
  generateBranchRevenueChartData,
  exportToCSV,
} from "@/lib/services/reportService";
import { generateStudentWiseOutstandingReport } from "@/lib/services/feeService";

type ReportType =
  | "daily-attendance"
  | "monthly-attendance"
  | "student-attendance"
  | "monthly-collection"
  | "pending-fees"
  | "student-enrollment"
  | "branch-collection"
  | "payment-methods";

type ChartTab = "monthly-collection" | "attendance-trends" | "enrollment-growth" | "branch-revenue";

export default function ReportsView({
  students,
  batches,
  branches = [],
  feePayments,
  attendance,
}: {
  students: Student[];
  batches: Batch[];
  branches?: Branch[];
  feePayments: FeePayment[];
  attendance: AttendanceRecord[];
}) {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const todayStr = new Date().toISOString().split("T")[0];

  // Active view: Report selector & Active Chart
  const [activeReport, setActiveReport] = useState<ReportType>("daily-attendance");
  const [activeChart, setActiveChart] = useState<ChartTab>("monthly-collection");

  // Filters State
  const [targetDate, setTargetDate] = useState<string>(todayStr);
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedBranchId, setSelectedBranchId] = useState<string>("all");
  const [selectedBatchId, setSelectedBatchId] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  // Scoped batches by branch
  const availableBatches = useMemo(() => {
    if (selectedBranchId === "all") return batches;
    return batches.filter((b) => b.branchId === selectedBranchId);
  }, [batches, selectedBranchId]);

  // Toast helper
  const showToast = (msg: string) => {
    setDownloadNotice(msg);
    setTimeout(() => setDownloadNotice(null), 3000);
  };

  // ---------------------------------------------------------------------------
  // 1. Daily Attendance Report Data
  // ---------------------------------------------------------------------------
  const dailyAttendanceData = useMemo(() => {
    return generateDailyAttendanceReport(
      students,
      batches,
      branches,
      attendance,
      targetDate,
      { branchId: selectedBranchId, batchId: selectedBatchId }
    );
  }, [students, batches, branches, attendance, targetDate, selectedBranchId, selectedBatchId]);

  // ---------------------------------------------------------------------------
  // 2. Monthly Attendance Report Data
  // ---------------------------------------------------------------------------
  const monthlyAttendanceData = useMemo(() => {
    return generateMonthlyAttendanceReport(
      attendance,
      selectedMonth,
      selectedYear,
      { branchId: selectedBranchId, batchId: selectedBatchId }
    );
  }, [attendance, selectedMonth, selectedYear, selectedBranchId, selectedBatchId]);

  // ---------------------------------------------------------------------------
  // 3. Student-wise Attendance Report Data
  // ---------------------------------------------------------------------------
  const studentWiseAttendanceData = useMemo(() => {
    return generateStudentWiseAttendanceReport(
      students,
      batches,
      branches,
      attendance,
      {
        month: selectedMonth,
        year: selectedYear,
        branchId: selectedBranchId,
        batchId: selectedBatchId,
        searchTerm,
      }
    );
  }, [students, batches, branches, attendance, selectedMonth, selectedYear, selectedBranchId, selectedBatchId, searchTerm]);

  // ---------------------------------------------------------------------------
  // 4. Monthly Fee Collection Report Data
  // ---------------------------------------------------------------------------
  const monthlyCollectionData = useMemo(() => {
    return generateMonthlyFeeCollectionReport(
      feePayments,
      students,
      batches,
      branches,
      selectedMonth,
      selectedYear,
      { branchId: selectedBranchId, batchId: selectedBatchId }
    );
  }, [feePayments, students, batches, branches, selectedMonth, selectedYear, selectedBranchId, selectedBatchId]);

  // ---------------------------------------------------------------------------
  // 5. Pending Fee Report Data
  // ---------------------------------------------------------------------------
  const pendingFeeData = useMemo(() => {
    return generateStudentWiseOutstandingReport(
      students,
      batches,
      branches,
      feePayments,
      [],
      selectedMonth,
      selectedYear,
      {
        branchId: selectedBranchId,
        batchId: selectedBatchId,
        status: "outstanding",
        searchTerm,
      }
    );
  }, [students, batches, branches, feePayments, selectedMonth, selectedYear, selectedBranchId, selectedBatchId, searchTerm]);

  // ---------------------------------------------------------------------------
  // 6. Student Enrollment Report Data
  // ---------------------------------------------------------------------------
  const enrollmentData = useMemo(() => {
    return generateStudentEnrollmentReport(students, batches, branches, {
      branchId: selectedBranchId,
      batchId: selectedBatchId,
      year: selectedYear,
    });
  }, [students, batches, branches, selectedBranchId, selectedBatchId, selectedYear]);

  // ---------------------------------------------------------------------------
  // 7. Branch-wise Collection Report Data
  // ---------------------------------------------------------------------------
  const branchCollectionData = useMemo(() => {
    return generateBranchWiseCollectionReport(
      branches,
      students,
      feePayments,
      selectedMonth,
      selectedYear
    );
  }, [branches, students, feePayments, selectedMonth, selectedYear]);

  // ---------------------------------------------------------------------------
  // 8. Payment Method Report Data
  // ---------------------------------------------------------------------------
  const paymentMethodData = useMemo(() => {
    return generatePaymentMethodReport(feePayments, selectedMonth, selectedYear);
  }, [feePayments, selectedMonth, selectedYear]);

  // ---------------------------------------------------------------------------
  // Dashboard Charts Data (100% Calculated from Real Database Records)
  // ---------------------------------------------------------------------------
  const monthlyRevenueChartData = useMemo(() => {
    return generateMonthlyRevenueChartData(feePayments, students, selectedYear);
  }, [feePayments, students, selectedYear]);

  const attendanceTrendsChartData = useMemo(() => {
    return generateAttendanceTrendsChartData(attendance);
  }, [attendance]);

  const enrollmentGrowthChartData = useMemo(() => {
    return generateEnrollmentGrowthChartData(students, selectedYear);
  }, [students, selectedYear]);

  const branchRevenueChartData = useMemo(() => {
    return generateBranchRevenueChartData(branches, students, feePayments);
  }, [branches, students, feePayments]);

  // ---------------------------------------------------------------------------
  // Export Handlers
  // ---------------------------------------------------------------------------
  const handleExportAttendanceExcel = () => {
    const headers = [
      "Student Name",
      "Student ID",
      "Branch",
      "Batch",
      "Total Classes",
      "Present",
      "Absent",
      "Leave",
      "Attendance Rate %",
      "Rating",
    ];

    const rows = studentWiseAttendanceData.map((r) => [
      r.studentName,
      r.studentCode,
      r.branchName,
      r.batchName,
      r.totalClasses,
      r.present,
      r.absent,
      r.leave,
      `${r.percentage}%`,
      r.rating,
    ]);

    exportToCSV(`Abhinaya_Nartan_Attendance_Report_${MONTH_NAMES[selectedMonth - 1]}_${selectedYear}`, headers, rows);
    showToast("Attendance CSV downloaded successfully (Excel compatible)");
  };

  const handleExportFeeCollectionExcel = () => {
    const headers = [
      "Receipt Number",
      "Payment Date",
      "Student Name",
      "Student ID",
      "Batch",
      "Branch",
      "Fee Period",
      "Amount Paid",
      "Payment Method",
      "Transaction Ref",
      "Collected By",
    ];

    const rows = monthlyCollectionData.rows.map((r) => [
      r.receiptNumber,
      r.paymentDate,
      r.studentName,
      r.studentCode,
      r.batchName,
      r.branchName,
      r.feePeriod,
      r.amountPaid,
      r.paymentMethod,
      r.transactionRef,
      r.collectedBy,
    ]);

    exportToCSV(`Abhinaya_Nartan_Fee_Collections_${MONTH_NAMES[selectedMonth - 1]}_${selectedYear}`, headers, rows);
    showToast("Fee Collections CSV downloaded successfully (Excel compatible)");
  };

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Header - Hidden in Print */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-brand-dark">
              Academy Reports &amp; Analytics
            </h2>
            <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 text-purple-900 border border-purple-200 px-2.5 py-0.5 text-[0.68rem] font-bold">
              <ShieldCheck size={12} />
              <span>Real Database Records</span>
            </span>
          </div>
          <p className="text-xs text-brand-muted mt-0.5">
            Audit daily/monthly attendance registers, tuition revenues, branch collections, student enrollments, and payment channels.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2">
          {downloadNotice && (
            <div className="inline-flex items-center gap-1 rounded-xl bg-emerald-50 border border-emerald-300 px-3 py-1.5 text-xs font-semibold text-emerald-800 shadow-sm animate-fadeIn">
              <CheckCircle2 size={13} className="text-emerald-600" />
              <span>{downloadNotice}</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleExportAttendanceExcel}
            className="inline-flex items-center gap-1.5 rounded-xl border border-brand-border bg-white px-3 py-2 text-xs font-semibold text-brand-dark hover:border-brand-primary hover:text-brand-primary-dark shadow-sm transition-all"
          >
            <Download size={13} />
            <span>Attendance CSV</span>
          </button>

          <button
            type="button"
            onClick={handleExportFeeCollectionExcel}
            className="inline-flex items-center gap-1.5 rounded-xl border border-brand-border bg-white px-3 py-2 text-xs font-semibold text-brand-dark hover:border-brand-primary hover:text-brand-primary-dark shadow-sm transition-all"
          >
            <Download size={13} />
            <span>Fees CSV</span>
          </button>

          <button
            type="button"
            onClick={handlePrintPDF}
            className="inline-flex items-center gap-1.5 rounded-xl bg-purple-950 px-3.5 py-2 text-xs font-semibold text-brand-gold shadow-sm hover:brightness-110 active:scale-95 transition-all"
          >
            <Printer size={13} />
            <span>Print PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Report Header - Appears exclusively during print */}
      <div className="hidden print:block text-center border-b border-brand-border pb-4 mb-4">
        <h1 className="font-serif text-2xl font-bold text-purple-950">
          Abhinaya Nartan Dance Academy
        </h1>
        <p className="text-xs uppercase tracking-widest text-brand-gold-dark font-semibold">
          Kuchipudi Classical Dance Academy • Official Audit Report
        </p>
        <p className="text-[0.7rem] text-brand-muted mt-1">
          Report Generated: {new Date().toLocaleDateString("en-IN", { dateStyle: "full" })} • Vijayawada
        </p>
      </div>

      {/* SECTION 1: Interactive Dashboard Charts (Hidden in Print) */}
      <div className="rounded-3xl border border-brand-border bg-white p-5 sm:p-6 shadow-card space-y-4 print:hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-brand-border">
          <div className="flex items-center gap-2">
            <BarChart3 size={18} className="text-brand-gold-dark" />
            <h3 className="font-serif text-base font-bold text-brand-dark">
              Executive Analytics &amp; Visual Trends
            </h3>
          </div>

          {/* Chart Tabs Switcher */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            <button
              type="button"
              onClick={() => setActiveChart("monthly-collection")}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                activeChart === "monthly-collection"
                  ? "bg-purple-950 text-brand-gold shadow-sm"
                  : "bg-gray-50 text-brand-muted hover:text-brand-dark"
              }`}
            >
              Fee Collection Trend
            </button>

            <button
              type="button"
              onClick={() => setActiveChart("attendance-trends")}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                activeChart === "attendance-trends"
                  ? "bg-purple-950 text-brand-gold shadow-sm"
                  : "bg-gray-50 text-brand-muted hover:text-brand-dark"
              }`}
            >
              Attendance Trends
            </button>

            <button
              type="button"
              onClick={() => setActiveChart("enrollment-growth")}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                activeChart === "enrollment-growth"
                  ? "bg-purple-950 text-brand-gold shadow-sm"
                  : "bg-gray-50 text-brand-muted hover:text-brand-dark"
              }`}
            >
              Enrollment Growth
            </button>

            <button
              type="button"
              onClick={() => setActiveChart("branch-revenue")}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                activeChart === "branch-revenue"
                  ? "bg-purple-950 text-brand-gold shadow-sm"
                  : "bg-gray-50 text-brand-muted hover:text-brand-dark"
              }`}
            >
              Branch Revenue
            </button>
          </div>
        </div>

        {/* Chart View Port */}
        <div className="pt-2">
          {/* Chart 1: Monthly Fee Collection */}
          {activeChart === "monthly-collection" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-brand-muted">
                <span>Last 6 Months Realized Tuition Revenue vs Academy Targets</span>
                <span className="font-semibold text-purple-950">
                  Total Realized: ₹{monthlyRevenueChartData.reduce((s, p) => s + p.collected, 0).toLocaleString("en-IN")}
                </span>
              </div>

              <div className="grid grid-cols-6 gap-2 sm:gap-4 h-48 items-end relative border-b border-brand-border pt-4">
                {monthlyRevenueChartData.map((pt, idx) => {
                  const maxVal = Math.max(...monthlyRevenueChartData.map((d) => Math.max(d.collected, d.target)), 1000) * 1.15;
                  const heightPct = Math.min(100, Math.max(8, Math.round((pt.collected / maxVal) * 100)));
                  const targetPct = Math.min(100, Math.max(8, Math.round((pt.target / maxVal) * 100)));
                  return (
                    <div key={`${pt.monthName}-${idx}`} className="flex flex-col items-center h-full justify-end group">
                      <span className="text-[0.62rem] font-bold text-emerald-800 opacity-0 group-hover:opacity-100 transition-opacity mb-1 font-mono">
                        ₹{(pt.collected / 1000).toFixed(1)}k
                      </span>
                      <div
                        className="w-full rounded-t-lg bg-gradient-to-t from-purple-900 to-brand-primary group-hover:brightness-110 transition-all shadow-sm"
                        style={{ height: `${heightPct}%` }}
                      />
                      <span className="text-[0.68rem] font-medium text-brand-muted mt-2">
                        {pt.monthName}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Chart 2: Attendance Trends */}
          {activeChart === "attendance-trends" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-brand-muted">
                <span>Daily Class Attendance Rate % (Last 7 Sessions)</span>
                <span className="font-semibold text-emerald-800">
                  Latest Session: {attendanceTrendsChartData[attendanceTrendsChartData.length - 1]?.attendanceRate || 0}%
                </span>
              </div>

              {attendanceTrendsChartData.length === 0 ? (
                <div className="py-12 text-center text-xs text-brand-muted">
                  No attendance sessions recorded yet. Record daily attendance to generate trend lines.
                </div>
              ) : (
                <div className="grid grid-cols-7 gap-2 sm:gap-4 h-48 items-end relative border-b border-brand-border pt-4">
                  {attendanceTrendsChartData.map((pt, idx) => {
                    const heightPct = Math.max(10, pt.attendanceRate);
                    return (
                      <div key={pt.date} className="flex flex-col items-center h-full justify-end group">
                        <span className="text-[0.65rem] font-bold text-purple-950 mb-1">
                          {pt.attendanceRate}%
                        </span>
                        <div
                          className="w-full rounded-t-lg bg-gradient-to-t from-emerald-700 to-emerald-400 group-hover:brightness-110 transition-all shadow-sm"
                          style={{ height: `${heightPct}%` }}
                        />
                        <span className="text-[0.68rem] font-mono text-brand-muted mt-2">
                          {pt.displayDate}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Chart 3: Student Enrollment Growth */}
          {activeChart === "enrollment-growth" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-brand-muted">
                <span>Cumulative Student Growth across {selectedYear}</span>
                <span className="font-semibold text-purple-950">
                  Total Active Roster: {students.filter((s) => s.status === "active").length} dancers
                </span>
              </div>

              <div className="grid grid-cols-12 gap-1 sm:gap-2 h-48 items-end relative border-b border-brand-border pt-4">
                {enrollmentGrowthChartData.map((pt) => {
                  const maxGrowth = Math.max(...enrollmentGrowthChartData.map((d) => d.cumulativeTotal), 1);
                  const heightPct = Math.max(8, Math.round((pt.cumulativeTotal / maxGrowth) * 100));
                  return (
                    <div key={pt.period} className="flex flex-col items-center h-full justify-end group">
                      <div
                        className="w-full rounded-t-md bg-gradient-to-t from-purple-950 to-brand-gold group-hover:brightness-110 transition-all shadow-sm"
                        style={{ height: `${heightPct}%` }}
                      />
                      <span className="text-[0.58rem] font-medium text-brand-muted mt-2">
                        {pt.period}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Chart 4: Branch-wise Revenue */}
          {activeChart === "branch-revenue" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-brand-muted">
                <span>Revenue Share by Studio Branch Location</span>
                <span className="font-semibold text-purple-950">
                  Total Revenue: ₹{feePayments.reduce((s, p) => s + p.amountPaid, 0).toLocaleString("en-IN")}
                </span>
              </div>

              <div className="space-y-3 pt-2">
                {branchRevenueChartData.map((br) => (
                  <div key={br.branchName} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-brand-dark">{br.branchName}</span>
                      <span className="font-serif font-bold text-emerald-800">
                        ₹{br.revenue.toLocaleString("en-IN")} ({br.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                      <div
                        className="bg-brand-primary h-full rounded-full transition-all duration-500"
                        style={{ width: `${br.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SECTION 2: Universal Filter Control Bar (Hidden in Print) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 bg-white p-4 rounded-3xl border border-brand-border shadow-sm text-xs print:hidden">
        {/* Report Type Selector */}
        <div className="lg:col-span-2">
          <label className="block text-[0.65rem] font-bold uppercase text-brand-muted mb-1">
            Active Report View
          </label>
          <select
            value={activeReport}
            onChange={(e) => setActiveReport(e.target.value as ReportType)}
            className="w-full rounded-xl border border-brand-border bg-white px-3 py-2 text-xs text-brand-dark font-bold focus:border-brand-primary focus:outline-none"
          >
            <option value="daily-attendance">1. Daily Attendance Report</option>
            <option value="monthly-attendance">2. Monthly Attendance Report</option>
            <option value="student-attendance">3. Student-wise Attendance Report</option>
            <option value="monthly-collection">4. Monthly Fee Collection Report</option>
            <option value="pending-fees">5. Pending Fee Report</option>
            <option value="student-enrollment">6. Student Enrollment Report</option>
            <option value="branch-collection">7. Branch-wise Collection Report</option>
            <option value="payment-methods">8. Payment Method Report</option>
          </select>
        </div>

        {/* Date Selector for Daily Report / Month Selector */}
        {activeReport === "daily-attendance" ? (
          <div>
            <label className="block text-[0.65rem] font-bold uppercase text-brand-muted mb-1">
              Class Date
            </label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full rounded-xl border border-brand-border bg-white px-3 py-2 text-xs text-brand-dark focus:border-brand-primary focus:outline-none"
            />
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <div className="flex-1">
              <label className="block text-[0.65rem] font-bold uppercase text-brand-muted mb-1">
                Month
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="w-full rounded-xl border border-brand-border bg-white px-2.5 py-2 text-xs text-brand-dark focus:border-brand-primary focus:outline-none font-medium"
              >
                {MONTH_NAMES.map((name, idx) => (
                  <option key={name} value={idx + 1}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-18">
              <label className="block text-[0.65rem] font-bold uppercase text-brand-muted mb-1">
                Year
              </label>
              <input
                type="number"
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="w-full rounded-xl border border-brand-border bg-white px-2 py-2 text-xs text-brand-dark focus:border-brand-primary focus:outline-none font-medium"
              />
            </div>
          </div>
        )}

        {/* Branch Filter */}
        <div>
          <label className="block text-[0.65rem] font-bold uppercase text-brand-muted mb-1">
            Studio Branch
          </label>
          <select
            value={selectedBranchId}
            onChange={(e) => {
              setSelectedBranchId(e.target.value);
              setSelectedBatchId("all");
            }}
            className="w-full rounded-xl border border-brand-border bg-white px-3 py-2 text-xs text-brand-dark focus:border-brand-primary focus:outline-none font-medium"
          >
            <option value="all">All Branches</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        {/* Batch Filter */}
        <div>
          <label className="block text-[0.65rem] font-bold uppercase text-brand-muted mb-1">
            Batch / Timetable
          </label>
          <select
            value={selectedBatchId}
            onChange={(e) => setSelectedBatchId(e.target.value)}
            className="w-full rounded-xl border border-brand-border bg-white px-3 py-2 text-xs text-brand-dark focus:border-brand-primary focus:outline-none font-medium"
          >
            <option value="all">All Batches</option>
            {availableBatches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        {/* Search */}
        <div>
          <label className="block text-[0.65rem] font-bold uppercase text-brand-muted mb-1">
            Search Filter
          </label>
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
            <input
              type="text"
              placeholder="Filter dancer name, code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-brand-border bg-[#F8F9FA] pl-8 pr-2.5 py-2 text-xs text-brand-dark focus:border-brand-primary focus:bg-white focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* SECTION 3: The 8 Reports Table Views */}
      <div className="overflow-x-auto rounded-3xl border border-brand-border bg-white shadow-card">
        {/* REPORT 1: Daily Attendance Report */}
        {activeReport === "daily-attendance" && (
          <div>
            <div className="p-4 border-b border-brand-border flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[#F8F9FA]">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-purple-950" />
                <h3 className="font-serif font-bold text-sm text-brand-dark">
                  Daily Attendance Register ({targetDate})
                </h3>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span>Enrolled: <strong>{dailyAttendanceData.totalActive}</strong></span>
                <span className="text-emerald-700">Present: <strong>{dailyAttendanceData.presentCount}</strong></span>
                <span className="text-rose-700">Absent: <strong>{dailyAttendanceData.absentCount}</strong></span>
                <span className="text-amber-700">Leave: <strong>{dailyAttendanceData.leaveCount}</strong></span>
                <span className="font-bold text-purple-950">Rate: {dailyAttendanceData.attendanceRate}%</span>
              </div>
            </div>

            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F9FA] text-brand-muted uppercase tracking-wider text-[0.65rem] border-b border-brand-border">
                <tr>
                  <th className="py-3 px-4 font-bold">Dancer Name</th>
                  <th className="py-3 px-4 font-bold">Student ID</th>
                  <th className="py-3 px-4 font-bold">Branch</th>
                  <th className="py-3 px-4 font-bold">Batch</th>
                  <th className="py-3 px-4 font-bold">Status</th>
                  <th className="py-3 px-4 font-bold">Marked By</th>
                  <th className="py-3 px-4 font-bold">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/60">
                {dailyAttendanceData.records.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-brand-muted">
                      No active students found for the selected branch/batch filters.
                    </td>
                  </tr>
                ) : (
                  dailyAttendanceData.records.map((r) => (
                    <tr key={r.studentId} className="hover:bg-purple-50/20">
                      <td className="py-3 px-4 font-semibold text-brand-dark">{r.studentName}</td>
                      <td className="py-3 px-4 font-mono text-[0.68rem] text-brand-muted">{r.studentCode}</td>
                      <td className="py-3 px-4 text-brand-muted">{r.branchName}</td>
                      <td className="py-3 px-4 font-medium text-purple-950">{r.batchName}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[0.62rem] font-bold uppercase tracking-wider ${
                            r.status === "present"
                              ? "bg-emerald-100 text-emerald-900 border border-emerald-200"
                              : r.status === "absent"
                              ? "bg-rose-100 text-rose-900 border border-rose-200"
                              : r.status === "leave"
                              ? "bg-amber-100 text-amber-900 border border-amber-200"
                              : "bg-gray-100 text-gray-700 border border-gray-200"
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-brand-muted">{r.markedBy || "—"}</td>
                      <td className="py-3 px-4 text-brand-muted italic">{r.remarks || "—"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* REPORT 2: Monthly Attendance Report */}
        {activeReport === "monthly-attendance" && (
          <div>
            <div className="p-4 border-b border-brand-border flex items-center justify-between bg-[#F8F9FA]">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-purple-950" />
                <h3 className="font-serif font-bold text-sm text-brand-dark">
                  Monthly Class Sessions Attendance Summary ({monthlyAttendanceData.monthName} {monthlyAttendanceData.year})
                </h3>
              </div>
              <span className="text-xs font-bold text-emerald-800">
                Average Monthly Attendance: {monthlyAttendanceData.averageMonthlyRate}%
              </span>
            </div>

            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F9FA] text-brand-muted uppercase tracking-wider text-[0.65rem] border-b border-brand-border">
                <tr>
                  <th className="py-3 px-4 font-bold">Class Date</th>
                  <th className="py-3 px-4 font-bold">Present Marks</th>
                  <th className="py-3 px-4 font-bold">Absent Marks</th>
                  <th className="py-3 px-4 font-bold">Leave Marks</th>
                  <th className="py-3 px-4 font-bold">Session Rate %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/60">
                {monthlyAttendanceData.dailyBreakdown.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-brand-muted">
                      No attendance sessions recorded for {monthlyAttendanceData.monthName} {monthlyAttendanceData.year}.
                    </td>
                  </tr>
                ) : (
                  monthlyAttendanceData.dailyBreakdown.map((d) => (
                    <tr key={d.date} className="hover:bg-purple-50/20">
                      <td className="py-3 px-4 font-medium text-brand-dark">{d.date}</td>
                      <td className="py-3 px-4 font-semibold text-emerald-800">{d.present}</td>
                      <td className="py-3 px-4 font-semibold text-rose-800">{d.absent}</td>
                      <td className="py-3 px-4 font-semibold text-amber-800">{d.leave}</td>
                      <td className="py-3 px-4 font-serif font-bold text-purple-950">{d.rate}%</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* REPORT 3: Student-wise Attendance Report */}
        {activeReport === "student-attendance" && (
          <div>
            <div className="p-4 border-b border-brand-border flex items-center justify-between bg-[#F8F9FA]">
              <div className="flex items-center gap-2">
                <Users size={16} className="text-purple-950" />
                <h3 className="font-serif font-bold text-sm text-brand-dark">
                  Student-wise Classical Attendance Rating ({MONTH_NAMES[selectedMonth - 1]} {selectedYear})
                </h3>
              </div>
              <span className="text-xs text-brand-muted font-mono">{studentWiseAttendanceData.length} Dancers</span>
            </div>

            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F9FA] text-brand-muted uppercase tracking-wider text-[0.65rem] border-b border-brand-border">
                <tr>
                  <th className="py-3 px-4 font-bold">Student Name</th>
                  <th className="py-3 px-4 font-bold">Student ID</th>
                  <th className="py-3 px-4 font-bold">Branch</th>
                  <th className="py-3 px-4 font-bold">Batch</th>
                  <th className="py-3 px-4 font-bold">Total Classes</th>
                  <th className="py-3 px-4 font-bold">Present</th>
                  <th className="py-3 px-4 font-bold">Absent</th>
                  <th className="py-3 px-4 font-bold">Leave</th>
                  <th className="py-3 px-4 font-bold">Percentage</th>
                  <th className="py-3 px-4 font-bold">Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/60">
                {studentWiseAttendanceData.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-10 text-center text-brand-muted">
                      No student records found.
                    </td>
                  </tr>
                ) : (
                  studentWiseAttendanceData.map((s) => (
                    <tr key={s.studentId} className="hover:bg-purple-50/20">
                      <td className="py-3 px-4 font-semibold text-brand-dark">{s.studentName}</td>
                      <td className="py-3 px-4 font-mono text-[0.68rem] text-brand-muted">{s.studentCode}</td>
                      <td className="py-3 px-4 text-brand-muted">{s.branchName}</td>
                      <td className="py-3 px-4 font-medium text-purple-950">{s.batchName}</td>
                      <td className="py-3 px-4 font-bold text-brand-dark">{s.totalClasses}</td>
                      <td className="py-3 px-4 font-semibold text-emerald-800">{s.present}</td>
                      <td className="py-3 px-4 font-semibold text-rose-800">{s.absent}</td>
                      <td className="py-3 px-4 font-semibold text-amber-800">{s.leave}</td>
                      <td className="py-3 px-4 font-serif font-bold text-purple-950">{s.percentage}%</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[0.62rem] font-bold ${
                            s.percentage >= 85
                              ? "bg-emerald-100 text-emerald-900 border border-emerald-200"
                              : s.percentage >= 70
                              ? "bg-blue-100 text-blue-900 border border-blue-200"
                              : s.totalClasses === 0
                              ? "bg-gray-100 text-gray-700"
                              : "bg-rose-100 text-rose-900 border border-rose-200"
                          }`}
                        >
                          {s.rating}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* REPORT 4: Monthly Fee Collection Report */}
        {activeReport === "monthly-collection" && (
          <div>
            <div className="p-4 border-b border-brand-border flex items-center justify-between bg-[#F8F9FA]">
              <div className="flex items-center gap-2">
                <CreditCard size={16} className="text-purple-950" />
                <h3 className="font-serif font-bold text-sm text-brand-dark">
                  Monthly Fee Collections Register ({MONTH_NAMES[selectedMonth - 1]} {selectedYear})
                </h3>
              </div>
              <span className="font-serif font-bold text-emerald-800 text-sm">
                Total Realized: ₹{monthlyCollectionData.totalCollected.toLocaleString("en-IN")}
              </span>
            </div>

            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F9FA] text-brand-muted uppercase tracking-wider text-[0.65rem] border-b border-brand-border">
                <tr>
                  <th className="py-3 px-4 font-bold">Receipt ID</th>
                  <th className="py-3 px-4 font-bold">Date</th>
                  <th className="py-3 px-4 font-bold">Student Name</th>
                  <th className="py-3 px-4 font-bold">Batch &amp; Branch</th>
                  <th className="py-3 px-4 font-bold">Period</th>
                  <th className="py-3 px-4 font-bold">Amount</th>
                  <th className="py-3 px-4 font-bold">Method</th>
                  <th className="py-3 px-4 font-bold">Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/60">
                {monthlyCollectionData.rows.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-brand-muted">
                      No fee payments recorded for {MONTH_NAMES[selectedMonth - 1]} {selectedYear}.
                    </td>
                  </tr>
                ) : (
                  monthlyCollectionData.rows.map((p) => (
                    <tr key={p.receiptNumber} className="hover:bg-purple-50/20">
                      <td className="py-3 px-4 font-mono font-bold text-purple-950">{p.receiptNumber}</td>
                      <td className="py-3 px-4 font-medium">{p.paymentDate}</td>
                      <td className="py-3 px-4 font-semibold text-brand-dark">
                        {p.studentName}
                        <span className="block text-[0.65rem] text-brand-muted font-mono">{p.studentCode}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-purple-900">{p.batchName}</span>
                        <span className="block text-[0.65rem] text-brand-muted">{p.branchName}</span>
                      </td>
                      <td className="py-3 px-4 font-medium">{p.feePeriod}</td>
                      <td className="py-3 px-4 font-serif font-bold text-emerald-800">
                        ₹{p.amountPaid.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[0.65rem] font-bold uppercase bg-purple-100 text-purple-900">
                          {p.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[0.68rem] text-brand-muted">{p.transactionRef}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* REPORT 5: Pending Fee Report */}
        {activeReport === "pending-fees" && (
          <div>
            <div className="p-4 border-b border-brand-border flex items-center justify-between bg-[#F8F9FA]">
              <div className="flex items-center gap-2">
                <AlertCircle size={16} className="text-rose-700" />
                <h3 className="font-serif font-bold text-sm text-rose-800">
                  Outstanding Tuition Dues Report ({MONTH_NAMES[selectedMonth - 1]} {selectedYear})
                </h3>
              </div>
              <span className="font-serif font-bold text-rose-800 text-sm">
                Total Outstanding: ₹{pendingFeeData.totals.totalOutstanding.toLocaleString("en-IN")}
              </span>
            </div>

            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F9FA] text-brand-muted uppercase tracking-wider text-[0.65rem] border-b border-brand-border">
                <tr>
                  <th className="py-3 px-4 font-bold">Dancer Name</th>
                  <th className="py-3 px-4 font-bold">Parent &amp; Phone</th>
                  <th className="py-3 px-4 font-bold">Batch</th>
                  <th className="py-3 px-4 font-bold">Fee Period</th>
                  <th className="py-3 px-4 font-bold">Monthly Fee</th>
                  <th className="py-3 px-4 font-bold">Total Paid</th>
                  <th className="py-3 px-4 font-bold">Outstanding</th>
                  <th className="py-3 px-4 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/60">
                {pendingFeeData.records.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-brand-muted">
                      No outstanding fees recorded for the selected period.
                    </td>
                  </tr>
                ) : (
                  pendingFeeData.records.map((r) => (
                    <tr key={r.studentId} className="hover:bg-purple-50/20">
                      <td className="py-3 px-4 font-semibold text-brand-dark">
                        {r.studentName}
                        <span className="block text-[0.65rem] text-brand-muted font-mono">{r.studentCode}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div>{r.parentName}</div>
                        <span className="text-[0.65rem] text-brand-muted font-mono">{r.parentPhone}</span>
                      </td>
                      <td className="py-3 px-4 font-medium text-purple-950">{r.batchName}</td>
                      <td className="py-3 px-4 font-medium">{r.feePeriod}</td>
                      <td className="py-3 px-4 font-medium">₹{r.monthlyFee.toLocaleString("en-IN")}</td>
                      <td className="py-3 px-4 font-semibold text-emerald-800">₹{r.totalPaid.toLocaleString("en-IN")}</td>
                      <td className="py-3 px-4 font-serif font-bold text-rose-700">
                        ₹{r.outstandingBalance.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[0.62rem] font-bold uppercase bg-rose-100 text-rose-900 border border-rose-200">
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* REPORT 6: Student Enrollment Report */}
        {activeReport === "student-enrollment" && (
          <div>
            <div className="p-4 border-b border-brand-border flex items-center justify-between bg-[#F8F9FA]">
              <div className="flex items-center gap-2">
                <Users size={16} className="text-purple-950" />
                <h3 className="font-serif font-bold text-sm text-brand-dark">
                  Student Enrollment &amp; Roster Register ({selectedYear})
                </h3>
              </div>
              <div className="text-xs space-x-3">
                <span>Active: <strong>{enrollmentData.totalActive}</strong></span>
                <span>On Leave: <strong>{enrollmentData.totalOnLeave}</strong></span>
                <span>{selectedYear} Admissions: <strong>{enrollmentData.yearAdmissions}</strong></span>
              </div>
            </div>

            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F9FA] text-brand-muted uppercase tracking-wider text-[0.65rem] border-b border-brand-border">
                <tr>
                  <th className="py-3 px-4 font-bold">Student Name</th>
                  <th className="py-3 px-4 font-bold">Student ID</th>
                  <th className="py-3 px-4 font-bold">Admission Date</th>
                  <th className="py-3 px-4 font-bold">Branch &amp; Batch</th>
                  <th className="py-3 px-4 font-bold">Classical Level</th>
                  <th className="py-3 px-4 font-bold">Parent &amp; Phone</th>
                  <th className="py-3 px-4 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/60">
                {enrollmentData.rows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-brand-muted">
                      No students found.
                    </td>
                  </tr>
                ) : (
                  enrollmentData.rows.map((s) => (
                    <tr key={s.studentCode} className="hover:bg-purple-50/20">
                      <td className="py-3 px-4 font-semibold text-brand-dark">{s.studentName}</td>
                      <td className="py-3 px-4 font-mono text-[0.68rem] text-brand-muted">{s.studentCode}</td>
                      <td className="py-3 px-4 font-medium">{s.joiningDate}</td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-purple-950">{s.batchName}</span>
                        <span className="block text-[0.65rem] text-brand-muted">{s.branchName}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[0.65rem] font-bold bg-purple-50 text-brand-primary-dark border border-purple-100">
                          {s.level}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div>{s.parentName}</div>
                        <span className="text-[0.65rem] text-brand-muted font-mono">{s.parentPhone}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[0.62rem] font-bold uppercase ${
                            s.status === "active"
                              ? "bg-emerald-100 text-emerald-900 border border-emerald-200"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* REPORT 7: Branch-wise Collection Report */}
        {activeReport === "branch-collection" && (
          <div>
            <div className="p-4 border-b border-brand-border flex items-center justify-between bg-[#F8F9FA]">
              <div className="flex items-center gap-2">
                <Building size={16} className="text-purple-950" />
                <h3 className="font-serif font-bold text-sm text-brand-dark">
                  Studio Branch Performance &amp; Realization ({MONTH_NAMES[selectedMonth - 1]} {selectedYear})
                </h3>
              </div>
            </div>

            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F9FA] text-brand-muted uppercase tracking-wider text-[0.65rem] border-b border-brand-border">
                <tr>
                  <th className="py-3 px-4 font-bold">Branch Name</th>
                  <th className="py-3 px-4 font-bold">Enrolled Students</th>
                  <th className="py-3 px-4 font-bold">Transactions</th>
                  <th className="py-3 px-4 font-bold">Expected Revenue</th>
                  <th className="py-3 px-4 font-bold">Total Collected</th>
                  <th className="py-3 px-4 font-bold">Realization Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/60">
                {branchCollectionData.map((b) => (
                  <tr key={b.branchId} className="hover:bg-purple-50/20">
                    <td className="py-3 px-4 font-semibold text-brand-dark">{b.branchName}</td>
                    <td className="py-3 px-4 font-medium">{b.enrolledStudents} dancers</td>
                    <td className="py-3 px-4 font-mono">{b.transactionCount}</td>
                    <td className="py-3 px-4 font-medium">₹{b.expectedRevenue.toLocaleString("en-IN")}</td>
                    <td className="py-3 px-4 font-serif font-bold text-emerald-800">
                      ₹{b.totalCollected.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 px-4 font-bold text-purple-950">{b.realizationRate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* REPORT 8: Payment Method Report */}
        {activeReport === "payment-methods" && (
          <div>
            <div className="p-4 border-b border-brand-border flex items-center justify-between bg-[#F8F9FA]">
              <div className="flex items-center gap-2">
                <CreditCard size={16} className="text-purple-950" />
                <h3 className="font-serif font-bold text-sm text-brand-dark">
                  Payment Channels Distribution ({MONTH_NAMES[selectedMonth - 1]} {selectedYear})
                </h3>
              </div>
            </div>

            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F9FA] text-brand-muted uppercase tracking-wider text-[0.65rem] border-b border-brand-border">
                <tr>
                  <th className="py-3 px-4 font-bold">Payment Method</th>
                  <th className="py-3 px-4 font-bold">Transactions Count</th>
                  <th className="py-3 px-4 font-bold">Percentage Share</th>
                  <th className="py-3 px-4 font-bold">Total Amount</th>
                  <th className="py-3 px-4 font-bold">Average Ticket Size</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/60">
                {paymentMethodData.map((m) => (
                  <tr key={m.method} className="hover:bg-purple-50/20">
                    <td className="py-3 px-4 font-bold text-purple-950">{m.method}</td>
                    <td className="py-3 px-4 font-mono">{m.transactionCount}</td>
                    <td className="py-3 px-4 font-medium text-brand-dark">{m.percentageShare}%</td>
                    <td className="py-3 px-4 font-serif font-bold text-emerald-800">
                      ₹{m.totalAmount.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 px-4 font-serif font-semibold text-brand-dark">
                      ₹{m.averageTicketSize.toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Printable Signatory Footer */}
      <div className="hidden print:flex items-center justify-between text-xs pt-8 border-t border-brand-border">
        <div>
          <p className="font-semibold text-purple-950">Guru Smt. Radhika</p>
          <p className="text-[0.68rem] text-brand-muted">Artistic Director &amp; Principal</p>
        </div>
        <div className="text-right">
          <p className="font-semibold text-purple-950">Abhinaya Nartan Dance Academy</p>
          <p className="text-[0.68rem] text-brand-muted">Vijayawada, Andhra Pradesh</p>
        </div>
      </div>
    </div>
  );
}
