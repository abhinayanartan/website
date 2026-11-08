"use client";

import { useMemo, useState, useEffect } from "react";
import {
  AlertTriangle,
  MessageCircle,
  Phone,
  CheckCircle2,
  Send,
  CreditCard,
  Sparkles,
  Search,
  Filter,
  Download,
  Printer,
  Calendar,
  Building,
  Users,
  Clock,
  ArrowUpDown,
  Copy,
  Check,
  FileSpreadsheet,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import { Student, Batch, Branch, FeePayment, FeePaymentStatus } from "@/lib/types/academy";
import {
  MONTH_NAMES,
  generateStudentWiseOutstandingReport,
  buildWhatsAppReminderUrl,
  getFeeAdjustmentsFromDatabase,
} from "@/lib/services/feeService";

export default function PendingFeesView({
  students,
  batches,
  branches = [],
  feePayments,
  onQuickPay,
  onNavigateFeeCollection,
}: {
  students: Student[];
  batches: Batch[];
  branches?: Branch[];
  feePayments: FeePayment[];
  onQuickPay: (student: Student, amount: number) => void;
  onNavigateFeeCollection?: (studentId: string) => void;
}) {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  // Active view tab: "actionable" vs "report"
  const [activeViewTab, setActiveViewTab] = useState<"actionable" | "report">("actionable");

  // Filters State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedBranchId, setSelectedBranchId] = useState<string>("all");
  const [selectedBatchId, setSelectedBatchId] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<FeePaymentStatus | "all" | "outstanding">("outstanding");

  // Local adjustments state
  const [adjustments, setAdjustments] = useState<any[]>([]);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  useEffect(() => {
    async function loadAdjustments() {
      const adjs = await getFeeAdjustmentsFromDatabase();
      setAdjustments(adjs);
    }
    loadAdjustments();
  }, []);

  // Filter batches by selected branch
  const availableBatches = useMemo(() => {
    if (selectedBranchId === "all") return batches;
    return batches.filter((b) => b.branchId === selectedBranchId);
  }, [batches, selectedBranchId]);

  // Generate Report & Totals from actual database payments & adjustments
  const { records, totals } = useMemo(() => {
    return generateStudentWiseOutstandingReport(
      students,
      batches,
      branches,
      feePayments,
      adjustments,
      selectedMonth,
      selectedYear,
      {
        branchId: selectedBranchId,
        batchId: selectedBatchId,
        status: selectedStatus,
        searchTerm,
      }
    );
  }, [
    students,
    batches,
    branches,
    feePayments,
    adjustments,
    selectedMonth,
    selectedYear,
    selectedBranchId,
    selectedBatchId,
    selectedStatus,
    searchTerm,
  ]);

  // Outstanding only list for the actionable tab
  const actionableList = useMemo(() => {
    return records.filter((r) => r.outstandingBalance > 0);
  }, [records]);

  // Copy WhatsApp message to clipboard helper
  const handleCopyMessage = (record: (typeof records)[0]) => {
    const student = students.find((s) => s.id === record.studentId);
    if (!student) return;
    const url = buildWhatsAppReminderUrl(
      record.studentName,
      record.studentCode,
      record.parentName,
      record.parentPhone,
      record.feePeriod,
      record.monthlyFee,
      record.totalPaid,
      record.outstandingBalance,
      record.status
    );
    const params = new URLSearchParams(url.split("?")[1]);
    const text = params.get("text") || "";
    navigator.clipboard.writeText(text);
    setCopiedMessageId(record.studentId);
    setTimeout(() => setCopiedMessageId(null), 2500);
  };

  // CSV Export for Student-wise Report
  const handleExportCSV = () => {
    const headers = [
      "Student Name",
      "Student ID",
      "Branch",
      "Batch",
      "Parent Name",
      "Parent Phone",
      "Fee Period",
      "Monthly Fee",
      "Total Paid",
      "Outstanding Balance",
      "Status",
      "Last Payment Date",
      "Receipt Number",
    ];

    const rows = records.map((r) => [
      `"${r.studentName}"`,
      r.studentCode,
      `"${r.branchName}"`,
      `"${r.batchName}"`,
      `"${r.parentName}"`,
      r.parentPhone,
      `"${r.feePeriod}"`,
      r.monthlyFee,
      r.totalPaid,
      r.outstandingBalance,
      r.status,
      r.lastPaymentDate || "—",
      r.receiptNumber || "—",
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Abhinaya_Nartan_Outstanding_Fees_${MONTH_NAMES[selectedMonth - 1]}_${selectedYear}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-brand-dark">
              Pending Fees Management
            </h2>
            <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 text-purple-900 border border-purple-200 px-2.5 py-0.5 text-[0.68rem] font-bold">
              <ShieldCheck size={12} />
              <span>Real-time Supabase Calculations</span>
            </span>
          </div>
          <p className="text-xs text-brand-muted mt-0.5">
            Identify dancers with outstanding tuition balances, inspect payment statuses, generate student-wise outstanding reports, and dispatch respectful WhatsApp reminders.
          </p>
        </div>

        {/* Tab Switcher & Export */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="inline-flex rounded-xl bg-white border border-brand-border p-1 shadow-sm text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setActiveViewTab("actionable");
                if (selectedStatus === "Paid") setSelectedStatus("outstanding");
              }}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeViewTab === "actionable"
                  ? "bg-purple-950 text-brand-gold shadow-sm"
                  : "text-brand-muted hover:text-brand-dark"
              }`}
            >
              Actionable Dues ({totals.countPartiallyPaid + totals.countPending + totals.countOverdue})
            </button>
            <button
              type="button"
              onClick={() => setActiveViewTab("report")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeViewTab === "report"
                  ? "bg-purple-950 text-brand-gold shadow-sm"
                  : "text-brand-muted hover:text-brand-dark"
              }`}
            >
              Student-wise Report ({records.length})
            </button>
          </div>

          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 rounded-xl border border-brand-border bg-white px-3 py-2 text-xs font-semibold text-brand-dark hover:border-brand-primary hover:text-brand-primary-dark shadow-sm transition-all"
            title="Export CSV Report"
          >
            <Download size={14} />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Financial Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Expected */}
        <div className="rounded-2xl border border-brand-border bg-white p-4 shadow-card">
          <span className="text-[0.65rem] font-bold uppercase tracking-wider text-brand-muted block">
            Expected Monthly Revenue
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="font-serif text-lg sm:text-2xl font-bold text-brand-dark">
              ₹{totals.totalExpected.toLocaleString("en-IN")}
            </span>
            <span className="text-xs text-brand-muted">{totals.totalStudents} dancers</span>
          </div>
        </div>

        {/* Total Payments Received */}
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-card">
          <span className="text-[0.65rem] font-bold uppercase tracking-wider text-emerald-800 block">
            Payments Received
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="font-serif text-lg sm:text-2xl font-bold text-emerald-800">
              ₹{totals.totalPaid.toLocaleString("en-IN")}
            </span>
            <span className="text-xs text-emerald-700 font-semibold">
              {totals.countPaid} Paid Full
            </span>
          </div>
        </div>

        {/* Outstanding Dues */}
        <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-4 shadow-card">
          <span className="text-[0.65rem] font-bold uppercase tracking-wider text-rose-800 block">
            Outstanding Tuition Dues
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="font-serif text-lg sm:text-2xl font-bold text-rose-800">
              ₹{totals.totalOutstanding.toLocaleString("en-IN")}
            </span>
            <span className="text-xs text-rose-700 font-semibold">
              {totals.countOverdue} Overdue
            </span>
          </div>
        </div>

        {/* Breakdown Summary */}
        <div className="rounded-2xl border border-brand-border bg-white p-4 shadow-card flex flex-col justify-between">
          <span className="text-[0.65rem] font-bold uppercase tracking-wider text-brand-muted block">
            Collection Status
          </span>
          <div className="flex items-center gap-2 mt-1">
            <span className="px-2 py-0.5 rounded-full text-[0.65rem] font-bold bg-amber-100 text-amber-900 border border-amber-200">
              {totals.countPartiallyPaid} Partial
            </span>
            <span className="px-2 py-0.5 rounded-full text-[0.65rem] font-bold bg-purple-100 text-purple-900 border border-purple-200">
              {totals.countPending} Pending
            </span>
            <span className="px-2 py-0.5 rounded-full text-[0.65rem] font-bold bg-rose-100 text-rose-900 border border-rose-200">
              {totals.countOverdue} Overdue
            </span>
          </div>
        </div>
      </div>

      {/* Comprehensive Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 bg-white p-4 rounded-3xl border border-brand-border shadow-sm text-xs">
        {/* Search by Student Name */}
        <div className="relative">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-muted" />
          <input
            type="text"
            placeholder="Search student, ID, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-brand-border bg-[#F8F9FA] pl-9 pr-3 py-2 text-xs text-brand-dark placeholder:text-brand-muted/70 focus:border-brand-primary focus:bg-white focus:outline-none"
          />
        </div>

        {/* Fee Period Month & Year */}
        <div className="flex items-center gap-1.5">
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
          <input
            type="number"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="w-20 rounded-xl border border-brand-border bg-white px-2.5 py-2 text-xs text-brand-dark focus:border-brand-primary focus:outline-none font-medium"
          />
        </div>

        {/* Filter by Branch */}
        <select
          value={selectedBranchId}
          onChange={(e) => {
            setSelectedBranchId(e.target.value);
            setSelectedBatchId("all");
          }}
          className="rounded-xl border border-brand-border bg-white px-3 py-2 text-xs text-brand-dark focus:border-brand-primary focus:outline-none font-medium"
        >
          <option value="all">All Studio Branches</option>
          {branches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>

        {/* Filter by Batch */}
        <select
          value={selectedBatchId}
          onChange={(e) => setSelectedBatchId(e.target.value)}
          className="rounded-xl border border-brand-border bg-white px-3 py-2 text-xs text-brand-dark focus:border-brand-primary focus:outline-none font-medium"
        >
          <option value="all">All Batches</option>
          {availableBatches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>

        {/* Filter by Payment Status (Paid, Partially Paid, Pending, Overdue) */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value as any)}
          className="rounded-xl border border-brand-border bg-white px-3 py-2 text-xs text-brand-dark focus:border-brand-primary focus:outline-none font-bold"
        >
          <option value="all">All Payment Statuses</option>
          <option value="outstanding">Outstanding Only (Partial / Pending / Overdue)</option>
          <option value="Paid">Status: Paid</option>
          <option value="Partially Paid">Status: Partially Paid</option>
          <option value="Pending">Status: Pending</option>
          <option value="Overdue">Status: Overdue</option>
        </select>
      </div>

      {/* Gentle Notice regarding WhatsApp Policy */}
      <div className="rounded-2xl border border-purple-200/80 bg-purple-50/70 p-3.5 px-4 text-xs text-purple-950 flex items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-2.5">
          <MessageCircle size={16} className="text-emerald-700 shrink-0" />
          <span>
            <strong>Manual WhatsApp Dispatch Policy:</strong> In compliance with studio privacy, reminder links prefill respectful messages for individual parent numbers. Reminders are <strong>never sent automatically</strong>.
          </span>
        </div>
      </div>

      {/* TAB 1: Actionable Dues & Immediate Reminders */}
      {activeViewTab === "actionable" && (
        <div className="overflow-x-auto rounded-3xl border border-brand-border bg-white shadow-card">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8F9FA] text-brand-muted uppercase tracking-wider text-[0.65rem] border-b border-brand-border">
              <tr>
                <th className="py-3.5 px-4 font-bold">Dancer &amp; Code</th>
                <th className="py-3.5 px-4 font-bold">Parent Contact</th>
                <th className="py-3.5 px-4 font-bold">Branch &amp; Batch</th>
                <th className="py-3.5 px-4 font-bold">Fee Period</th>
                <th className="py-3.5 px-4 font-bold">Monthly Fee</th>
                <th className="py-3.5 px-4 font-bold">Received</th>
                <th className="py-3.5 px-4 font-bold">Outstanding Due</th>
                <th className="py-3.5 px-4 font-bold">Status</th>
                <th className="py-3.5 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/60">
              {actionableList.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-14 text-center text-brand-muted">
                    <CheckCircle2 size={36} className="mx-auto text-emerald-600 mb-2" />
                    <p className="font-bold text-sm text-emerald-800">
                      All Filtered Accounts Settled!
                    </p>
                    <p className="text-xs text-brand-muted mt-0.5">
                      No outstanding tuition dues recorded for the selected filters.
                    </p>
                  </td>
                </tr>
              ) : (
                actionableList.map((record) => {
                  const student = students.find((s) => s.id === record.studentId);
                  const cleanPhone = record.parentPhone.replace(/\D/g, "");
                  const reminderUrl = buildWhatsAppReminderUrl(
                    record.studentName,
                    record.studentCode,
                    record.parentName,
                    record.parentPhone,
                    record.feePeriod,
                    record.monthlyFee,
                    record.totalPaid,
                    record.outstandingBalance,
                    record.status
                  );

                  return (
                    <tr
                      key={record.studentId}
                      className={`hover:bg-purple-50/20 transition-colors ${
                        record.status === "Overdue" ? "bg-rose-50/30" : ""
                      }`}
                    >
                      {/* Dancer Name & Code */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-brand-dark text-sm">
                          {record.studentName}
                        </div>
                        <span className="font-mono text-[0.68rem] text-brand-muted">
                          ID: {record.studentCode}
                        </span>
                      </td>

                      {/* Parent Contact */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-brand-dark">{record.parentName}</div>
                        <a
                          href={`tel:${cleanPhone}`}
                          className="text-[0.68rem] text-brand-primary-dark font-mono hover:underline inline-flex items-center gap-1"
                        >
                          <Phone size={10} />
                          <span>{record.parentPhone || "Not provided"}</span>
                        </a>
                      </td>

                      {/* Branch & Batch */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-purple-950">{record.batchName}</div>
                        <span className="text-[0.65rem] text-brand-muted">
                          {record.branchName}
                        </span>
                      </td>

                      {/* Fee Period */}
                      <td className="py-3.5 px-4 font-medium text-brand-dark">
                        {record.feePeriod}
                      </td>

                      {/* Monthly Fee */}
                      <td className="py-3.5 px-4 font-semibold text-brand-dark">
                        ₹{record.monthlyFee.toLocaleString("en-IN")}
                      </td>

                      {/* Received */}
                      <td className="py-3.5 px-4 font-semibold text-emerald-800">
                        ₹{record.totalPaid.toLocaleString("en-IN")}
                      </td>

                      {/* Outstanding Due */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`font-serif text-sm font-bold ${
                            record.status === "Overdue" ? "text-rose-700" : "text-amber-800"
                          }`}
                        >
                          ₹{record.outstandingBalance.toLocaleString("en-IN")}
                        </span>
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[0.62rem] font-bold uppercase tracking-wider ${
                            record.status === "Overdue"
                              ? "bg-rose-100 text-rose-900 border border-rose-200"
                              : record.status === "Partially Paid"
                              ? "bg-amber-100 text-amber-900 border border-amber-200"
                              : "bg-purple-100 text-purple-900 border border-purple-200"
                          }`}
                        >
                          {record.status}
                        </span>
                      </td>

                      {/* Action Links */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Manual Clickable WhatsApp Reminder Link */}
                          <a
                            href={reminderUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-2.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 active:scale-95 transition-all"
                            title="Click to open WhatsApp Web / App with polite reminder"
                          >
                            <MessageCircle size={13} />
                            <span>WhatsApp</span>
                          </a>

                          {/* Copy Message Shortcut */}
                          <button
                            type="button"
                            onClick={() => handleCopyMessage(record)}
                            className="p-1.5 rounded-xl border border-brand-border bg-white text-brand-muted hover:text-brand-dark hover:border-brand-primary shadow-sm transition-all"
                            title="Copy polite reminder text"
                          >
                            {copiedMessageId === record.studentId ? (
                              <Check size={13} className="text-emerald-600" />
                            ) : (
                              <Copy size={13} />
                            )}
                          </button>

                          {/* Quick Settle Button */}
                          {student && (
                            <button
                              type="button"
                              onClick={() => {
                                if (onNavigateFeeCollection) {
                                  onNavigateFeeCollection(student.id);
                                } else {
                                  onQuickPay(student, record.outstandingBalance);
                                }
                              }}
                              className="inline-flex items-center gap-1 rounded-xl bg-brand-gold px-2.5 py-1.5 text-xs font-semibold text-purple-950 shadow-gold-sm hover:brightness-105 active:scale-95 transition-all"
                            >
                              <CreditCard size={13} />
                              <span>Settle</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 2: Comprehensive Student-wise Outstanding Fee Report */}
      {activeViewTab === "report" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-brand-border shadow-sm text-xs">
            <div className="flex items-center gap-2">
              <FileSpreadsheet size={16} className="text-purple-950" />
              <h3 className="font-serif font-bold text-sm text-brand-dark">
                Official Student-wise Fee Ledger Report ({MONTH_NAMES[selectedMonth - 1]} {selectedYear})
              </h3>
            </div>
            <span className="text-[0.68rem] text-brand-muted font-mono">
              Total Dancers: {records.length} • Filtered Outstanding: ₹
              {records.reduce((s, r) => s + r.outstandingBalance, 0).toLocaleString("en-IN")}
            </span>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-brand-border bg-white shadow-card">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F9FA] text-brand-muted uppercase tracking-wider text-[0.65rem] border-b border-brand-border">
                <tr>
                  <th className="py-3.5 px-4 font-bold">Student Name</th>
                  <th className="py-3.5 px-4 font-bold">Student ID</th>
                  <th className="py-3.5 px-4 font-bold">Branch</th>
                  <th className="py-3.5 px-4 font-bold">Batch</th>
                  <th className="py-3.5 px-4 font-bold">Parent Contact</th>
                  <th className="py-3.5 px-4 font-bold">Fee Period</th>
                  <th className="py-3.5 px-4 font-bold">Monthly Fee</th>
                  <th className="py-3.5 px-4 font-bold">Total Paid</th>
                  <th className="py-3.5 px-4 font-bold">Outstanding Balance</th>
                  <th className="py-3.5 px-4 font-bold">Payment Status</th>
                  <th className="py-3.5 px-4 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/60">
                {records.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="py-12 text-center text-brand-muted">
                      No student records found matching the specified report filters.
                    </td>
                  </tr>
                ) : (
                  records.map((r) => {
                    const student = students.find((s) => s.id === r.studentId);
                    const reminderUrl = buildWhatsAppReminderUrl(
                      r.studentName,
                      r.studentCode,
                      r.parentName,
                      r.parentPhone,
                      r.feePeriod,
                      r.monthlyFee,
                      r.totalPaid,
                      r.outstandingBalance,
                      r.status
                    );

                    return (
                      <tr key={r.studentId} className="hover:bg-purple-50/20 transition-colors">
                        <td className="py-3 px-4 font-semibold text-brand-dark">
                          {r.studentName}
                        </td>
                        <td className="py-3 px-4 font-mono text-[0.68rem] text-brand-muted">
                          {r.studentCode}
                        </td>
                        <td className="py-3 px-4 text-brand-muted">{r.branchName}</td>
                        <td className="py-3 px-4 font-medium text-purple-950">{r.batchName}</td>
                        <td className="py-3 px-4 text-brand-dark">
                          <div>{r.parentName}</div>
                          <span className="text-[0.65rem] text-brand-muted font-mono">{r.parentPhone}</span>
                        </td>
                        <td className="py-3 px-4 font-medium">{r.feePeriod}</td>
                        <td className="py-3 px-4 font-medium">₹{r.monthlyFee.toLocaleString("en-IN")}</td>
                        <td className="py-3 px-4 font-semibold text-emerald-800">
                          ₹{r.totalPaid.toLocaleString("en-IN")}
                        </td>
                        <td className="py-3 px-4 font-serif font-bold text-brand-dark">
                          <span className={r.outstandingBalance > 0 ? "text-rose-700" : "text-emerald-700"}>
                            ₹{r.outstandingBalance.toLocaleString("en-IN")}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[0.62rem] font-bold uppercase tracking-wider ${
                              r.status === "Paid"
                                ? "bg-emerald-100 text-emerald-900 border border-emerald-200"
                                : r.status === "Partially Paid"
                                ? "bg-amber-100 text-amber-900 border border-amber-200"
                                : r.status === "Overdue"
                                ? "bg-rose-100 text-rose-900 border border-rose-200"
                                : "bg-purple-100 text-purple-900 border border-purple-200"
                            }`}
                          >
                            {r.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          {r.outstandingBalance > 0 ? (
                            <a
                              href={reminderUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-xs font-semibold text-emerald-800 hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                            >
                              <MessageCircle size={11} />
                              <span>Remind</span>
                            </a>
                          ) : (
                            <span className="text-emerald-700 font-semibold text-[0.7rem] inline-flex items-center gap-1">
                              <CheckCircle2 size={12} />
                              <span>Settled</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
              {records.length > 0 && (
                <tfoot className="bg-[#F8F9FA] font-bold text-xs border-t-2 border-brand-border">
                  <tr>
                    <td colSpan={6} className="py-3 px-4 text-brand-dark uppercase tracking-wider text-[0.65rem]">
                      Report Column Totals ({records.length} records)
                    </td>
                    <td className="py-3 px-4 text-brand-dark">
                      ₹{records.reduce((s, r) => s + r.monthlyFee, 0).toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 px-4 text-emerald-800">
                      ₹{records.reduce((s, r) => s + r.totalPaid, 0).toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 px-4 font-serif text-rose-800">
                      ₹{records.reduce((s, r) => s + r.outstandingBalance, 0).toLocaleString("en-IN")}
                    </td>
                    <td colSpan={2} className="py-3 px-4 text-right text-brand-muted text-[0.68rem]">
                      Verified via Supabase Ledger
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
