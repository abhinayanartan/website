"use client";

import { useState, useMemo } from "react";
import {
  CreditCard,
  CheckCircle2,
  Receipt,
  User,
  Calendar,
  Sparkles,
  QrCode,
  Banknote,
  Building,
  Search,
  AlertCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Check,
} from "lucide-react";
import { Student, Batch, FeePayment, OfficialPaymentMethod } from "@/lib/types/academy";
import {
  MONTH_NAMES,
  calculateStudentFeeSummary,
  FeePaymentInput,
  FeePaymentResult,
  recordFeePayment,
  formatPaymentPeriod,
} from "@/lib/services/feeService";

export default function FeeCollectionView({
  students,
  batches,
  feePayments,
  onCollectFee,
  onViewReceipt,
  preselectedStudentId,
}: {
  students: Student[];
  batches: Batch[];
  feePayments: FeePayment[];
  onCollectFee: (paymentInput: FeePaymentInput) => Promise<FeePaymentResult | void> | void;
  onViewReceipt: (payment: FeePayment) => void;
  preselectedStudentId?: string;
}) {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  // Step 1: Student Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    preselectedStudentId || students[0]?.id || ""
  );

  // Step 4: Payment Period State
  const [forMonth, setForMonth] = useState<number>(currentMonth);
  const [forYear, setForYear] = useState<number>(currentYear);

  // Step 5: Amount Received State
  const [amountReceived, setAmountReceived] = useState<string>("");

  // Step 6: Payment Method State (Cash, UPI, Bank Transfer)
  const [paymentMethod, setPaymentMethod] = useState<OfficialPaymentMethod>("UPI");

  // Step 7: Transaction Reference & Notes
  const [transactionRef, setTransactionRef] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  // Accounting and Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Active students only
  const activeStudents = useMemo(
    () => students.filter((s) => s.status === "active"),
    [students]
  );

  // Filter students by search term
  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return activeStudents.slice(0, 15);
    const q = searchQuery.toLowerCase().trim();
    return activeStudents.filter(
      (s) =>
        s.fullName.toLowerCase().includes(q) ||
        (s.studentCode && s.studentCode.toLowerCase().includes(q)) ||
        (s.admissionNumber && s.admissionNumber.toLowerCase().includes(q)) ||
        (s.parentName && s.parentName.toLowerCase().includes(q)) ||
        (s.parentPhone && s.parentPhone.includes(q)) ||
        (s.phone && s.phone.includes(q))
    );
  }, [activeStudents, searchQuery]);

  // Selected Student & Assigned Batch
  const selectedStudent = useMemo(
    () => students.find((s) => s.id === selectedStudentId) || activeStudents[0],
    [students, selectedStudentId, activeStudents]
  );

  const selectedBatch = useMemo(
    () => batches.find((b) => b.id === selectedStudent?.batchId),
    [batches, selectedStudent]
  );

  // Step 3: Monthly Fee & Real-time Balance Calculation
  const feeSummary = useMemo(() => {
    if (!selectedStudent) return null;
    return calculateStudentFeeSummary(
      selectedStudent,
      selectedBatch,
      forMonth,
      forYear,
      feePayments
    );
  }, [selectedStudent, selectedBatch, forMonth, forYear, feePayments]);

  const defaultMonthlyFee = selectedStudent?.monthlyFee || selectedBatch?.monthlyFee || 1500;
  const currentOutstanding = feeSummary?.outstandingBalance ?? defaultMonthlyFee;

  // Monthly collection statistics
  const currentMonthCollection = useMemo(() => {
    return feePayments
      .filter((p) => p.forMonth === currentMonth && p.forYear === currentYear)
      .reduce((sum, p) => sum + (Number(p.amountPaid) || 0), 0);
  }, [feePayments, currentMonth, currentYear]);

  const todayStr = new Date().toISOString().split("T")[0];
  const todayCollection = useMemo(() => {
    return feePayments
      .filter((p) => p.paymentDate === todayStr)
      .reduce((sum, p) => sum + (Number(p.amountPaid) || 0), 0);
  }, [feePayments, todayStr]);

  // Helper: Autofill full or partial amount
  const handleSetAmount = (amount: number) => {
    setAmountReceived(String(amount));
    setErrorMessage(null);
  };

  // Step 8 & 9: Save Payment and Trigger Receipt
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) {
      setErrorMessage("Please select a student to record fee payment.");
      return;
    }

    const numAmount = parseFloat(amountReceived);
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMessage("Please enter a valid payment amount greater than ₹0.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const payload: FeePaymentInput = {
        studentId: selectedStudent.id,
        amountPaid: numAmount,
        paymentDate: new Date().toISOString().split("T")[0],
        forMonth,
        forYear,
        paymentMethod,
        transactionRef: transactionRef.trim() || undefined,
        notes: notes.trim() || undefined,
        branchId: selectedStudent.branchId,
        batchId: selectedStudent.batchId,
      };

      // Call parent handler
      const res = await onCollectFee(payload);

      setSuccessMessage(
        `Payment of ₹${numAmount.toLocaleString(
          "en-IN"
        )} recorded successfully into the permanent ledger!`
      );
      setAmountReceived("");
      setTransactionRef("");
      setNotes("");

      // If res returned payment object, view receipt
      if (res && res.payment) {
        onViewReceipt(res.payment);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to record payment. Please check database connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-brand-dark">
            Fee Collection Management
          </h2>
          <p className="text-xs text-brand-muted mt-0.5">
            Process full or partial tuition collections, record payment methods, track outstanding balances, and issue verified receipts.
          </p>
        </div>

        {/* Studio Real-time Counters */}
        <div className="flex items-center gap-2">
          <div className="rounded-xl border border-brand-border bg-white px-3.5 py-2 shadow-sm text-right">
            <span className="text-[0.62rem] uppercase font-bold text-brand-muted block">
              This Month ({MONTH_NAMES[currentMonth - 1]})
            </span>
            <span className="font-serif text-sm sm:text-base font-bold text-emerald-800">
              ₹{currentMonthCollection.toLocaleString("en-IN")}
            </span>
          </div>

          <div className="rounded-xl border border-brand-border bg-white px-3.5 py-2 shadow-sm text-right">
            <span className="text-[0.62rem] uppercase font-bold text-brand-muted block">
              Today&apos;s Collection
            </span>
            <span className="font-serif text-sm sm:text-base font-bold text-purple-950">
              ₹{todayCollection.toLocaleString("en-IN")}
            </span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Responsive Layout */}
      <div className="grid lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: 9-Step Payment Terminal (7 cols) */}
        <div className="lg:col-span-7 rounded-3xl border border-brand-border bg-white p-6 shadow-card space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-brand-border">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-primary/20 text-brand-primary-dark">
                <CreditCard size={18} />
              </span>
              <div>
                <h3 className="font-serif text-base font-bold text-brand-dark">
                  Fee Collection Terminal
                </h3>
                <p className="text-[0.7rem] text-brand-muted">
                  Official Kuchipudi Vidya Peetham Ledger
                </p>
              </div>
            </div>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 border border-brand-primary/30 text-brand-primary-dark text-xs font-semibold">
              <ShieldCheck size={13} />
              <span>Immutable Ledger</span>
            </span>
          </div>

          {/* Feedback Alerts */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 size={15} className="shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 text-xs">
            {/* Step 1: Search for a Student */}
            <div>
              <label className="block font-bold text-brand-dark mb-1.5">
                Step 1: Search for a Student <span className="text-brand-accent">*</span>
              </label>
              <div className="relative mb-2">
                <Search
                  size={14}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-muted"
                />
                <input
                  type="text"
                  placeholder="Type student name, student ID (e.g. AN-2024-001), or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-brand-border bg-[#F8F9FA] pl-9 pr-3 py-2.5 text-xs text-brand-dark placeholder:text-brand-muted/70 focus:border-brand-primary focus:bg-white focus:outline-none transition-all"
                />
              </div>

              {/* Student Dropdown / Selector */}
              <select
                value={selectedStudent?.id || ""}
                onChange={(e) => {
                  setSelectedStudentId(e.target.value);
                  setAmountReceived("");
                  setErrorMessage(null);
                }}
                className="w-full rounded-xl border border-brand-border p-2.5 text-xs text-brand-dark font-medium focus:border-brand-primary focus:outline-none bg-white"
              >
                {filteredStudents.map((s) => {
                  const bName = batches.find((b) => b.id === s.batchId)?.name || "Unassigned";
                  const code = s.studentCode || s.admissionNumber || "AN";
                  return (
                    <option key={s.id} value={s.id}>
                      {s.fullName} ({code}) • {bName} • ₹{s.monthlyFee || 1500}/mo
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Step 2 & 3: Display Student Profile & Monthly Fee */}
            {selectedStudent && (
              <div className="rounded-2xl border border-brand-primary/30 bg-gradient-to-br from-[#F5F0FC] via-white to-[#FDFBF4] p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-gold text-purple-950 font-serif font-bold text-sm shadow-gold-sm">
                      {selectedStudent.fullName
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-serif font-bold text-sm sm:text-base text-purple-950">
                          {selectedStudent.fullName}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[0.62rem] font-bold uppercase bg-purple-100 text-purple-900 border border-purple-200">
                          {selectedStudent.studentCode || selectedStudent.admissionNumber}
                        </span>
                      </div>
                      <p className="text-[0.7rem] text-brand-muted mt-0.5">
                        Parent: <strong>{selectedStudent.parentName}</strong> •{" "}
                        {selectedStudent.parentPhone || selectedStudent.phone}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[0.68rem] uppercase font-bold text-brand-muted block">
                      Monthly Tuition Fee
                    </span>
                    <span className="font-serif text-base font-bold text-emerald-800 block">
                      ₹{defaultMonthlyFee.toLocaleString("en-IN")}/mo
                    </span>
                    <span className="text-[0.65rem] text-brand-muted block">
                      {selectedBatch?.name}
                    </span>
                  </div>
                </div>

                {/* Real-time Period Breakdown Card */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-purple-100 text-center">
                  <div className="bg-white/80 p-2 rounded-xl border border-purple-100">
                    <span className="text-[0.62rem] uppercase font-bold text-brand-muted block">
                      Target Fee
                    </span>
                    <span className="font-bold text-brand-dark text-xs">
                      ₹{defaultMonthlyFee.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="bg-white/80 p-2 rounded-xl border border-purple-100">
                    <span className="text-[0.62rem] uppercase font-bold text-brand-muted block">
                      Already Paid
                    </span>
                    <span className="font-bold text-emerald-800 text-xs">
                      ₹{(feeSummary?.totalPaid || 0).toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="bg-white/80 p-2 rounded-xl border border-purple-100">
                    <span className="text-[0.62rem] uppercase font-bold text-brand-muted block">
                      Outstanding Balance
                    </span>
                    <span
                      className={`font-bold text-xs ${
                        currentOutstanding === 0 ? "text-emerald-700" : "text-rose-700"
                      }`}
                    >
                      ₹{currentOutstanding.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                {feeSummary && feeSummary.paymentCount > 0 && (
                  <div className="flex items-center justify-between text-[0.7rem] text-purple-900 bg-purple-100/60 px-3 py-1.5 rounded-lg">
                    <span>
                      {feeSummary.paymentCount} previous payment(s) recorded for this period.
                    </span>
                    {feeSummary.latestReceiptNumber && (
                      <span className="font-mono font-semibold">
                        Last Receipt: {feeSummary.latestReceiptNumber}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Select Payment Period */}
            <div className="space-y-1.5">
              <label className="block font-bold text-brand-dark">
                Step 2: Select Payment Period <span className="text-brand-accent">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[0.68rem] text-brand-muted mb-1">
                    Tuition Month
                  </label>
                  <select
                    value={forMonth}
                    onChange={(e) => setForMonth(Number(e.target.value))}
                    className="w-full rounded-xl border border-brand-border p-2.5 text-xs text-brand-dark focus:border-brand-primary focus:outline-none bg-white font-medium"
                  >
                    {MONTH_NAMES.map((name, idx) => (
                      <option key={name} value={idx + 1}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[0.68rem] text-brand-muted mb-1">
                    Academic Year
                  </label>
                  <input
                    type="number"
                    value={forYear}
                    onChange={(e) => setForYear(Number(e.target.value))}
                    className="w-full rounded-xl border border-brand-border p-2.5 text-xs text-brand-dark focus:border-brand-primary focus:outline-none font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Step 5: Enter Amount Received (Full vs Partial) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block font-bold text-brand-dark">
                  Step 3: Enter Amount Received (₹) <span className="text-brand-accent">*</span>
                </label>
                <span className="text-[0.68rem] text-brand-muted">
                  Supports full or partial payments
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-serif font-bold text-brand-muted">
                    ₹
                  </span>
                  <input
                    type="number"
                    min={1}
                    step={1}
                    placeholder={
                      currentOutstanding > 0
                        ? `Enter amount (e.g. ${currentOutstanding})`
                        : "Enter amount"
                    }
                    value={amountReceived}
                    onChange={(e) => setAmountReceived(e.target.value)}
                    className="w-full rounded-xl border border-brand-border pl-8 pr-3 py-2.5 text-sm sm:text-base font-serif font-bold text-emerald-800 focus:border-brand-primary focus:outline-none"
                  />
                </div>

                {/* Quick 1-Click Fill Helpers */}
                {currentOutstanding > 0 && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleSetAmount(currentOutstanding)}
                      className="px-3 py-2.5 rounded-xl bg-purple-50 border border-brand-primary/30 text-brand-primary-dark text-xs font-bold hover:bg-brand-primary hover:text-white transition-all"
                    >
                      Full Due (₹{currentOutstanding})
                    </button>

                    {currentOutstanding >= 1000 && (
                      <button
                        type="button"
                        onClick={() => handleSetAmount(Math.round(currentOutstanding / 2))}
                        className="px-3 py-2.5 rounded-xl border border-brand-border bg-[#F8F9FA] text-brand-dark text-xs font-semibold hover:bg-gray-100 transition-all"
                      >
                        Half (₹{Math.round(currentOutstanding / 2)})
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Dynamic Balance Projection Preview */}
              {amountReceived && !isNaN(Number(amountReceived)) && (
                <div className="p-2.5 rounded-xl bg-[#F8F9FA] border border-brand-border flex items-center justify-between text-[0.72rem]">
                  <span>Remaining balance after this payment:</span>
                  <span className="font-bold text-purple-950">
                    ₹
                    {Math.max(0, currentOutstanding - Number(amountReceived)).toLocaleString("en-IN")}
                    {currentOutstanding - Number(amountReceived) <= 0
                      ? " (Settled in Full)"
                      : " (Partial Due)"}
                  </span>
                </div>
              )}
            </div>

            {/* Step 6: Select Payment Method (Cash, UPI, Bank Transfer) */}
            <div className="space-y-1.5">
              <label className="block font-bold text-brand-dark">
                Step 4: Select Payment Method <span className="text-brand-accent">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("UPI")}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border transition-all ${
                    paymentMethod === "UPI"
                      ? "border-brand-primary bg-[#F5F0FC] text-brand-primary-dark font-bold shadow-sm"
                      : "border-brand-border bg-white text-brand-dark hover:bg-gray-50"
                  }`}
                >
                  <QrCode size={18} />
                  <span>UPI / QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("Cash")}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border transition-all ${
                    paymentMethod === "Cash"
                      ? "border-emerald-400 bg-emerald-50 text-emerald-800 font-bold shadow-sm"
                      : "border-brand-border bg-white text-brand-dark hover:bg-gray-50"
                  }`}
                >
                  <Banknote size={18} />
                  <span>Studio Cash</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("Bank Transfer")}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border transition-all ${
                    paymentMethod === "Bank Transfer"
                      ? "border-blue-400 bg-blue-50 text-blue-800 font-bold shadow-sm"
                      : "border-brand-border bg-white text-brand-dark hover:bg-gray-50"
                  }`}
                >
                  <Building size={18} />
                  <span>Bank Transfer</span>
                </button>
              </div>
            </div>

            {/* Step 7: Enter Transaction Reference & Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-brand-dark mb-1">
                  Step 5: Transaction Reference / UTR
                </label>
                <input
                  type="text"
                  placeholder={
                    paymentMethod === "UPI"
                      ? "e.g. PhonePe Txn ID or UPI Ref"
                      : paymentMethod === "Bank Transfer"
                      ? "e.g. NEFT / IMPS Reference"
                      : "e.g. Studio Cash Voucher Ref"
                  }
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  className="w-full rounded-xl border border-brand-border p-2.5 text-xs text-brand-dark focus:border-brand-primary focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-brand-dark mb-1">
                  Accounting Notes / Remarks
                </label>
                <input
                  type="text"
                  placeholder="e.g. Partial advance received from father"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-xl border border-brand-border p-2.5 text-xs text-brand-dark focus:border-brand-primary focus:outline-none"
                />
              </div>
            </div>

            {/* Step 8 & 9: Save Payment and Generate Receipt Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-gold py-3.5 text-xs sm:text-sm font-bold text-purple-950 shadow-gold-sm hover:brightness-105 active:scale-[0.99] disabled:opacity-50 transition-all cursor-pointer"
              >
                <Receipt size={17} />
                <span>
                  {isSubmitting
                    ? "Recording to Immutable Ledger..."
                    : `Save Payment & Generate Receipt (₹${
                        amountReceived ? Number(amountReceived).toLocaleString("en-IN") : "0"
                      })`}
                </span>
              </button>
              <p className="text-[0.68rem] text-center text-brand-muted mt-2">
                Accounting Rule: Receipts are generated exclusively upon verified commitment to Supabase.
              </p>
            </div>
          </form>
        </div>

        {/* Right Column: Studio UPI QR & Recent Verified Ledger (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Studio UPI QR Card */}
          <div className="rounded-3xl border border-brand-primary/30 bg-gradient-to-br from-[#F5F0FC] via-white to-[#FDFBF4] p-5 shadow-card text-center space-y-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-primary/20 text-brand-primary-dark px-3 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider">
              <Sparkles size={11} />
              <span>Studio Quick Collection QR</span>
            </span>
            <h4 className="font-serif text-base font-bold text-purple-950">
              Abhinaya Nartan Academy UPI
            </h4>
            <div className="p-4 mx-auto w-40 h-40 bg-white rounded-2xl border border-brand-border flex flex-col items-center justify-center shadow-inner">
              <QrCode size={100} className="text-purple-950" />
              <span className="text-[0.62rem] font-mono text-brand-muted mt-1.5">
                9398118249@upi
              </span>
            </div>
            <p className="text-xs text-brand-dark font-medium">
              VPA: <strong className="font-mono text-purple-900">9398118249@upi</strong>
            </p>
            <p className="text-[0.7rem] text-brand-muted">
              Scan with PhonePe, Google Pay, BHIM, or Paytm at reception counter.
            </p>
          </div>

          {/* Recent Payments Stream for this Session */}
          <div className="rounded-3xl border border-brand-border bg-white p-5 shadow-card space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-brand-border">
              <h4 className="font-serif text-sm font-bold text-brand-dark">
                Recent Verified Receipts
              </h4>
              <span className="text-[0.68rem] text-brand-muted font-mono">
                {feePayments.length} Total Records
              </span>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {feePayments.slice(0, 6).map((payment) => {
                const student = students.find((s) => s.id === payment.studentId);
                const method = payment.paymentMethod || payment.paymentMode.toUpperCase();
                return (
                  <div
                    key={payment.id}
                    className="p-3 rounded-xl border border-brand-border bg-[#F8F9FA] hover:bg-white hover:border-brand-primary/40 transition-all flex items-center justify-between gap-3"
                  >
                    <div>
                      <span className="font-bold text-brand-dark block text-xs">
                        {student?.fullName || "Academy Student"}
                      </span>
                      <div className="flex items-center gap-2 text-[0.68rem] text-brand-muted font-mono mt-0.5">
                        <span>{payment.receiptNumber}</span>
                        <span>•</span>
                        <span>{payment.paymentPeriod || `${payment.forMonth}/${payment.forYear}`}</span>
                        <span>•</span>
                        <span className="uppercase text-purple-900 font-semibold">{method}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-serif font-bold text-emerald-800 text-xs block">
                        ₹{payment.amountPaid.toLocaleString("en-IN")}
                      </span>
                      <button
                        type="button"
                        onClick={() => onViewReceipt(payment)}
                        className="text-[0.68rem] font-semibold text-brand-primary-dark hover:underline"
                      >
                        View Receipt
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
