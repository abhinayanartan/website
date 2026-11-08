"use client";

import { useState, useMemo } from "react";
import {
  History,
  Search,
  Filter,
  Receipt,
  Download,
  CreditCard,
  QrCode,
  Banknote,
  Building,
  Calendar,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { FeePayment, Student, Batch } from "@/lib/types/academy";
import { MONTH_NAMES, normalizePaymentMethod } from "@/lib/services/feeService";

export default function PaymentHistoryView({
  feePayments,
  students,
  batches,
  onViewReceipt,
}: {
  feePayments: FeePayment[];
  students: Student[];
  batches: Batch[];
  onViewReceipt: (payment: FeePayment) => void;
}) {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [selectedMethod, setSelectedMethod] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const PAGE_SIZE = 10;

  // Filtered payments list
  const filteredPayments = useMemo(() => {
    return feePayments.filter((p) => {
      const student = students.find((s) => s.id === p.studentId);
      const studentName = student?.fullName || "";
      const studentCode = student?.studentCode || student?.admissionNumber || "";
      const method = p.paymentMethod || normalizePaymentMethod(p.paymentMode);

      // Search matching student name, student ID, receipt number, or UTR ref
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.receiptNumber.toLowerCase().includes(q) ||
        studentName.toLowerCase().includes(q) ||
        studentCode.toLowerCase().includes(q) ||
        (p.transactionRef && p.transactionRef.toLowerCase().includes(q)) ||
        (p.notes && p.notes.toLowerCase().includes(q));

      // Month filter
      const matchesMonth =
        selectedMonth === "all" || p.forMonth === Number(selectedMonth);

      // Method filter
      const matchesMethod =
        selectedMethod === "all" ||
        method.toLowerCase() === selectedMethod.toLowerCase() ||
        p.paymentMode.toLowerCase() === selectedMethod.toLowerCase();

      // Date filter
      const matchesDate = !selectedDate || p.paymentDate === selectedDate;

      return matchesSearch && matchesMonth && matchesMethod && matchesDate;
    });
  }, [feePayments, students, searchTerm, selectedMonth, selectedMethod, selectedDate]);

  // Statistics
  const totalFilteredRevenue = useMemo(
    () => filteredPayments.reduce((sum, p) => sum + (Number(p.amountPaid) || 0), 0),
    [filteredPayments]
  );

  const totalPages = Math.max(1, Math.ceil(filteredPayments.length / PAGE_SIZE));
  const paginatedPayments = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredPayments.slice(start, start + PAGE_SIZE);
  }, [filteredPayments, currentPage]);

  const thisMonthTotal = useMemo(
    () =>
      feePayments
        .filter((p) => p.forMonth === currentMonth && p.forYear === currentYear)
        .reduce((sum, p) => sum + (Number(p.amountPaid) || 0), 0),
    [feePayments, currentMonth, currentYear]
  );

  // CSV Export
  const handleExportCSV = () => {
    const headers = [
      "Receipt Number",
      "Payment Date",
      "Student Name",
      "Student ID",
      "Batch",
      "Fee Period",
      "Amount Paid",
      "Payment Method",
      "Transaction Ref",
      "Outstanding Balance",
      "Recorded By",
    ];

    const rows = filteredPayments.map((p) => {
      const student = students.find((s) => s.id === p.studentId);
      const batch = batches.find((b) => b.id === p.batchId);
      const method = p.paymentMethod || normalizePaymentMethod(p.paymentMode);
      return [
        p.receiptNumber,
        p.paymentDate,
        `"${student?.fullName || "Student"}"`,
        student?.studentCode || student?.admissionNumber || "N/A",
        `"${batch?.name || "Kuchipudi"}"`,
        `"${p.paymentPeriod || `${MONTH_NAMES[(p.forMonth - 1) % 12]} ${p.forYear}`}"`,
        p.amountPaid,
        method,
        `"${p.transactionRef || ""}"`,
        p.outstandingBalance !== undefined ? p.outstandingBalance : "",
        `"${p.collectedBy || "Guru Smt. Radhika"}"`,
      ].join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Abhinaya_Nartan_Ledger_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-brand-dark">
            Payment History &amp; Transaction Ledger
          </h2>
          <p className="text-xs text-brand-muted mt-0.5">
            Audit verified classical tuition payments, track receipt numbers, and inspect digital vouchers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-brand-border bg-white p-3 shadow-sm flex items-center gap-3">
            <div>
              <span className="text-[0.65rem] uppercase font-bold text-brand-muted block">
                Filtered Total
              </span>
              <span className="font-serif text-lg sm:text-xl font-bold text-emerald-800">
                ₹{totalFilteredRevenue.toLocaleString("en-IN")}
              </span>
            </div>
            <span className="text-xs text-brand-muted border-l border-brand-border pl-3">
              {filteredPayments.length} receipts
            </span>
          </div>

          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 rounded-xl border border-brand-border bg-white px-3.5 py-2.5 text-xs font-semibold text-brand-dark hover:border-brand-primary hover:text-brand-primary-dark shadow-sm transition-all"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-white p-4 rounded-2xl border border-brand-border shadow-sm">
        {/* Search by Student Name / ID / Receipt */}
        <div className="relative">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-muted" />
          <input
            type="text"
            placeholder="Search student, ID, receipt, UTR..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-brand-border bg-[#F8F9FA] pl-9 pr-3 py-2 text-xs text-brand-dark placeholder:text-brand-muted/70 focus:border-brand-primary focus:bg-white focus:outline-none"
          />
        </div>

        {/* Filter by Payment Date */}
        <div>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full rounded-xl border border-brand-border bg-white px-3 py-2 text-xs text-brand-dark focus:border-brand-primary focus:outline-none"
            title="Filter by payment date"
          />
        </div>

        {/* Month Filter */}
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="rounded-xl border border-brand-border bg-white px-3 py-2 text-xs text-brand-dark focus:border-brand-primary focus:outline-none"
        >
          <option value="all">All Fee Periods</option>
          {MONTH_NAMES.map((name, idx) => (
            <option key={name} value={idx + 1}>
              {name} {currentYear}
            </option>
          ))}
        </select>

        {/* Payment Method Filter */}
        <select
          value={selectedMethod}
          onChange={(e) => setSelectedMethod(e.target.value)}
          className="rounded-xl border border-brand-border bg-white px-3 py-2 text-xs text-brand-dark focus:border-brand-primary focus:outline-none"
        >
          <option value="all">All Payment Methods</option>
          <option value="Cash">Cash</option>
          <option value="UPI">UPI</option>
          <option value="Bank Transfer">Bank Transfer</option>
        </select>
      </div>

      {/* Complete Payments Table */}
      <div className="overflow-x-auto rounded-2xl border border-brand-border bg-white shadow-card">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#F8F9FA] text-brand-muted uppercase tracking-wider text-[0.65rem] border-b border-brand-border">
            <tr>
              <th className="py-3.5 px-4 font-bold">Receipt ID</th>
              <th className="py-3.5 px-4 font-bold">Payment Date</th>
              <th className="py-3.5 px-4 font-bold">Student Name</th>
              <th className="py-3.5 px-4 font-bold">Fee Period</th>
              <th className="py-3.5 px-4 font-bold">Method &amp; Ref</th>
              <th className="py-3.5 px-4 font-bold">Amount Paid</th>
              <th className="py-3.5 px-4 font-bold">Outstanding</th>
              <th className="py-3.5 px-4 font-bold text-right">Receipt Voucher</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border/60">
            {paginatedPayments.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-brand-muted">
                  No payment records found matching the specified filters.
                </td>
              </tr>
            ) : (
              paginatedPayments.map((payment) => {
                const student = students.find((s) => s.id === payment.studentId);
                const batch = batches.find((b) => b.id === payment.batchId);
                const monthName = MONTH_NAMES[(payment.forMonth - 1) % 12];
                const method = payment.paymentMethod || normalizePaymentMethod(payment.paymentMode);
                const bal = payment.outstandingBalance;

                return (
                  <tr key={payment.id} className="hover:bg-purple-50/20 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-purple-950 text-xs block">
                        {payment.receiptNumber}
                      </span>
                      <span className="text-[0.65rem] text-brand-muted font-mono">
                        {batch?.name || "Kuchipudi"}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-medium text-brand-dark">
                      {payment.paymentDate}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-brand-dark text-sm">
                        {student?.fullName || "Academy Student"}
                      </div>
                      <span className="font-mono text-[0.68rem] text-brand-muted">
                        ID: {student?.studentCode || student?.admissionNumber || "—"}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-medium text-purple-950">
                      {payment.paymentPeriod || `${monthName} ${payment.forYear}`}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block rounded-md px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider ${
                          method === "UPI"
                            ? "bg-purple-100 text-purple-900 border border-purple-200"
                            : method === "Cash"
                            ? "bg-emerald-100 text-emerald-900 border border-emerald-200"
                            : "bg-blue-100 text-blue-900 border border-blue-200"
                        }`}
                      >
                        {method}
                      </span>
                      {payment.transactionRef && (
                        <span className="block text-[0.65rem] text-brand-muted font-mono mt-0.5 truncate max-w-[130px]">
                          {payment.transactionRef}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-serif text-sm font-bold text-emerald-800">
                        ₹{payment.amountPaid.toLocaleString("en-IN")}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      {bal !== undefined ? (
                        <span
                          className={`text-xs font-semibold ${
                            bal === 0 ? "text-emerald-700" : "text-amber-700"
                          }`}
                        >
                          ₹{bal.toLocaleString("en-IN")}
                        </span>
                      ) : (
                        <span className="text-brand-muted text-[0.7rem]">—</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => onViewReceipt(payment)}
                        type="button"
                        className="inline-flex items-center gap-1.5 rounded-xl border border-brand-border bg-white px-2.5 py-1 text-xs font-semibold text-brand-dark hover:border-brand-gold hover:bg-[#FDFBF4] active:scale-95 transition-all shadow-sm"
                      >
                        <Receipt size={13} className="text-brand-gold-dark" />
                        <span>Receipt</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-brand-border bg-[#F8F9FA] text-xs">
            <span className="text-brand-muted">
              Showing {(currentPage - 1) * PAGE_SIZE + 1}–
              {Math.min(currentPage * PAGE_SIZE, filteredPayments.length)} of {filteredPayments.length} receipts
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg border border-brand-border bg-white font-semibold text-brand-dark hover:border-brand-primary disabled:opacity-40 transition-all"
              >
                Previous
              </button>
              <span className="px-2 font-bold text-brand-dark">
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 rounded-lg border border-brand-border bg-white font-semibold text-brand-dark hover:border-brand-primary disabled:opacity-40 transition-all"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
