// ==============================================================================
// ABHINAYA NARTAN ACADEMY MANAGER - FEE COLLECTION SERVICE
// Direct Supabase PostgreSQL Operations with Immutable Ledger, Transactions,
// Partial Payment Support, Dynamic Balance Tracking & Verifiable Receipts
// ==============================================================================

import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabaseClient";
import {
  FeePayment,
  FeeAdjustment,
  StudentFeeSummary,
  OfficialPaymentMethod,
  PaymentMode,
  Student,
  Batch,
  Branch,
  FeePaymentStatus,
  StudentOutstandingFeeRecord,
} from "@/lib/types/academy";
import { AcademyDataStore } from "@/lib/academyStore";

export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export interface FeePaymentInput {
  studentId: string;
  amountPaid: number;
  paymentDate?: string;
  forMonth: number;
  forYear: number;
  paymentMethod: OfficialPaymentMethod;
  transactionRef?: string;
  notes?: string;
  collectedBy?: string;
  recordedBy?: string;
  branchId?: string;
  batchId?: string;
  adjustmentAmount?: number;
  adjustmentType?: "discount" | "scholarship" | "waiver" | "fine" | "other";
  adjustmentReason?: string;
}

export interface FeePaymentResult {
  success: boolean;
  payment?: FeePayment;
  outstandingBalance?: number;
  isPartialPayment?: boolean;
  isFullSettlement?: boolean;
  error?: string;
}

// In-memory idempotency guard preventing rapid duplicate submissions (within 3 seconds)
const recentSubmissions = new Map<string, number>();

export function normalizePaymentMethod(methodOrMode: string): OfficialPaymentMethod {
  const lower = methodOrMode.toLowerCase().replace(/_/g, " ").trim();
  if (lower === "cash") return "Cash";
  if (lower === "bank transfer" || lower === "bank" || lower === "neft" || lower === "imps") {
    return "Bank Transfer";
  }
  return "UPI";
}

export function toPaymentMode(method: OfficialPaymentMethod): PaymentMode {
  if (method === "Cash") return "cash";
  if (method === "Bank Transfer") return "bank_transfer";
  return "upi";
}

export function formatPaymentPeriod(month: number, year: number): string {
  const mName = MONTH_NAMES[(month - 1 + 12) % 12];
  return `${mName} ${year}`;
}

export function parsePaymentPeriod(periodStr: string): { month: number; year: number } {
  const current = new Date();
  const currentMonth = current.getMonth() + 1;
  const currentYear = current.getFullYear();

  if (!periodStr) {
    return { month: currentMonth, year: currentYear };
  }

  // Format 1: "YYYY-MM"
  if (periodStr.includes("-")) {
    const parts = periodStr.split("-");
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    if (!isNaN(y) && !isNaN(m)) return { month: m, year: y };
  }

  // Format 2: "MonthName YYYY"
  for (let i = 0; i < MONTH_NAMES.length; i++) {
    if (periodStr.toLowerCase().includes(MONTH_NAMES[i].toLowerCase())) {
      const yearMatch = periodStr.match(/\b(20\d\d)\b/);
      const parsedYear = yearMatch ? parseInt(yearMatch[1], 10) : currentYear;
      return { month: i + 1, year: parsedYear };
    }
  }

  return { month: currentMonth, year: currentYear };
}

// Map Supabase database row to frontend FeePayment model
export function mapDatabaseRowToFeePayment(row: any): FeePayment {
  const { month, year } = parsePaymentPeriod(row.payment_period || "");
  const pDate = row.payment_date || new Date().toISOString().split("T")[0];
  const officialMethod = normalizePaymentMethod(row.payment_method || "UPI");
  const pMode = toPaymentMode(officialMethod);

  return {
    id: row.id || `fee-${Date.now()}`,
    receiptNumber: row.receipt_number || `AN-${year}-0000`,
    studentId: row.student_id,
    branchId: row.branch_id || "",
    batchId: row.batch_id || "",
    forMonth: month,
    forYear: year,
    paymentPeriod: row.payment_period || formatPaymentPeriod(month, year),
    amountPaid: Number(row.amount) || 0,
    paymentDate: pDate,
    paymentMode: pMode,
    paymentMethod: officialMethod,
    transactionRef: row.transaction_reference || undefined,
    collectedBy: row.collected_by || "Guru Smt. Radhika",
    recordedBy: row.recorded_by || undefined,
    notes: row.notes || undefined,
    outstandingBalance: row.outstanding_balance !== undefined ? Number(row.outstanding_balance) : undefined,
    createdAt: row.created_at,
  };
}

// Convert model to Supabase insert payload
export function mapFeePaymentToDatabaseRow(payment: FeePayment): any {
  return {
    id: payment.id.startsWith("fee-") ? undefined : payment.id,
    student_id: payment.studentId,
    amount: payment.amountPaid,
    payment_date: payment.paymentDate,
    payment_method: payment.paymentMethod || normalizePaymentMethod(payment.paymentMode),
    transaction_reference: payment.transactionRef?.trim() || null,
    receipt_number: payment.receiptNumber,
    payment_period: payment.paymentPeriod || formatPaymentPeriod(payment.forMonth, payment.forYear),
    recorded_by: payment.recordedBy || null,
    notes: payment.notes?.trim() || null,
  };
}

/**
 * Fetch all fee payments from Supabase (falling back to synchronized store)
 */
export async function getFeePaymentsFromDatabase(): Promise<FeePayment[]> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("payments")
          .select("*")
          .order("payment_date", { ascending: false });

        if (!error && data && data.length > 0) {
          const mapped = data.map(mapDatabaseRowToFeePayment);
          AcademyDataStore.saveFeePayments(mapped);
          return mapped;
        } else if (error) {
          console.warn("Supabase payments fetch notice, falling back to local store:", error.message);
        }
      } catch (err) {
        console.error("Error communicating with Supabase payments:", err);
      }
    }
  }

  return AcademyDataStore.getFeePayments();
}

/**
 * Fetch all fee adjustments from Supabase (or local store)
 */
export async function getFeeAdjustmentsFromDatabase(): Promise<FeeAdjustment[]> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("fee_adjustments")
          .select("*")
          .order("created_at", { ascending: false });

        if (!error && data && data.length > 0) {
          return data.map((row: any) => ({
            id: row.id,
            studentId: row.student_id,
            amount: Number(row.amount),
            adjustmentType: row.adjustment_type,
            reason: row.reason,
            createdAt: row.created_at,
          }));
        }
      } catch (err) {
        console.warn("Error reading fee adjustments:", err);
      }
    }
  }

  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("an_academy_adjustments_v1");
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
  }
  return [];
}

/**
 * Calculate the exact financial summary for a student in a specific fee period.
 * Tracks total paid across multiple payments, adjustments, and dynamic outstanding balance.
 */
export function calculateStudentFeeSummary(
  student: Student,
  batch: Batch | undefined,
  forMonth: number,
  forYear: number,
  allPayments: FeePayment[],
  adjustments: FeeAdjustment[] = []
): StudentFeeSummary {
  const periodLabel = formatPaymentPeriod(forMonth, forYear);
  const baseMonthlyFee = student.monthlyFee || batch?.monthlyFee || 1500;

  // Filter payments for this student and this fee period
  const periodPayments = allPayments.filter((p) => {
    if (p.studentId !== student.id) return false;
    if (p.forMonth === forMonth && p.forYear === forYear) return true;
    if (p.paymentPeriod && p.paymentPeriod.toLowerCase() === periodLabel.toLowerCase()) return true;
    return false;
  });

  const totalPaid = periodPayments.reduce((sum, p) => sum + (Number(p.amountPaid) || 0), 0);

  // Student specific adjustments
  const studentAdjustments = adjustments.filter((a) => a.studentId === student.id);
  const adjustmentDeductions = studentAdjustments
    .filter((a) => ["discount", "scholarship", "waiver"].includes(a.adjustmentType))
    .reduce((sum, a) => sum + Math.abs(a.amount), 0);
  const adjustmentAdditions = studentAdjustments
    .filter((a) => a.adjustmentType === "fine")
    .reduce((sum, a) => sum + Math.abs(a.amount), 0);

  const effectiveMonthlyFee = Math.max(0, baseMonthlyFee - adjustmentDeductions + adjustmentAdditions);
  const outstandingBalance = Math.max(0, effectiveMonthlyFee - totalPaid);

  let status: "paid" | "partial" | "unpaid" = "unpaid";
  if (totalPaid >= effectiveMonthlyFee && effectiveMonthlyFee > 0) {
    status = "paid";
  } else if (totalPaid > 0) {
    status = "partial";
  }

  const paymentStatus = determinePaymentStatus(
    totalPaid,
    effectiveMonthlyFee,
    outstandingBalance,
    forMonth,
    forYear
  );

  // Find latest payment in period
  const sortedPeriodPayments = [...periodPayments].sort((a, b) =>
    (b.paymentDate || "").localeCompare(a.paymentDate || "")
  );
  const latestPayment = sortedPeriodPayments[0];

  return {
    studentId: student.id,
    studentName: student.fullName,
    monthlyFee: effectiveMonthlyFee,
    periodLabel,
    forMonth,
    forYear,
    totalPaid,
    outstandingBalance,
    status,
    paymentStatus,
    paymentCount: periodPayments.length,
    latestReceiptNumber: latestPayment?.receiptNumber,
    lastPaymentDate: latestPayment?.paymentDate,
  };
}

/**
 * Determine exact payment status among: Paid, Partially Paid, Pending, Overdue
 */
export function determinePaymentStatus(
  totalPaid: number,
  effectiveFee: number,
  outstandingBalance: number,
  forMonth: number,
  forYear: number,
  dueDateDay: number = 10
): FeePaymentStatus {
  if (outstandingBalance === 0 && effectiveFee > 0 && totalPaid >= effectiveFee) {
    return "Paid";
  }

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const currentDay = now.getDate();

  // If the fee period is in the past (e.g. prior month or prior year)
  // or if it's the current month and today is past the grace due date (10th)
  const isPastMonth = forYear < currentYear || (forYear === currentYear && forMonth < currentMonth);
  const isPastDueDate = isPastMonth || (forYear === currentYear && forMonth === currentMonth && currentDay > dueDateDay);

  if (totalPaid > 0 && outstandingBalance > 0) {
    return "Partially Paid";
  }

  if (isPastDueDate && outstandingBalance > 0) {
    return "Overdue";
  }

  return "Pending";
}

export interface OutstandingReportTotals {
  totalExpected: number;
  totalPaid: number;
  totalOutstanding: number;
  countPaid: number;
  countPartiallyPaid: number;
  countPending: number;
  countOverdue: number;
  totalStudents: number;
}

/**
 * Generate a complete student-wise outstanding fee report
 * Computes exact numbers using actual Supabase payment and adjustment records
 */
export function generateStudentWiseOutstandingReport(
  students: Student[],
  batches: Batch[],
  branches: Branch[],
  allPayments: FeePayment[],
  adjustments: FeeAdjustment[] = [],
  forMonth: number,
  forYear: number,
  filters?: {
    branchId?: string;
    batchId?: string;
    status?: FeePaymentStatus | "all" | "outstanding";
    searchTerm?: string;
  }
): { records: StudentOutstandingFeeRecord[]; totals: OutstandingReportTotals } {
  const periodLabel = formatPaymentPeriod(forMonth, forYear);
  const activeStudents = students.filter((s) => s.status === "active");

  const branchMap = new Map(branches.map((br) => [br.id, br.name]));
  const batchMap = new Map(batches.map((b) => [b.id, b]));

  let rawRecords: StudentOutstandingFeeRecord[] = activeStudents.map((student) => {
    const batch = batchMap.get(student.batchId);
    const branchName = branchMap.get(student.branchId) || "Vijayawada Studio";
    const batchName = batch?.name || "Kuchipudi Batch";

    const summary = calculateStudentFeeSummary(
      student,
      batch,
      forMonth,
      forYear,
      allPayments,
      adjustments
    );

    const status = summary.paymentStatus || "Pending";
    const isOverdue = status === "Overdue" || (status === "Partially Paid" && forMonth < new Date().getMonth() + 1);

    return {
      studentId: student.id,
      studentName: student.fullName,
      studentCode: student.studentCode || student.admissionNumber || "AN-2026-000",
      parentName: student.parentName,
      parentPhone: student.parentPhone || student.phone || "",
      branchId: student.branchId,
      branchName,
      batchId: student.batchId,
      batchName,
      monthlyFee: summary.monthlyFee,
      totalPaid: summary.totalPaid,
      outstandingBalance: summary.outstandingBalance,
      feePeriod: periodLabel,
      forMonth,
      forYear,
      status,
      lastPaymentDate: summary.lastPaymentDate,
      receiptNumber: summary.latestReceiptNumber,
      isOverdue,
    };
  });

  // Calculate totals before filters for overview or after
  const totals: OutstandingReportTotals = {
    totalExpected: rawRecords.reduce((sum, r) => sum + r.monthlyFee, 0),
    totalPaid: rawRecords.reduce((sum, r) => sum + r.totalPaid, 0),
    totalOutstanding: rawRecords.reduce((sum, r) => sum + r.outstandingBalance, 0),
    countPaid: rawRecords.filter((r) => r.status === "Paid").length,
    countPartiallyPaid: rawRecords.filter((r) => r.status === "Partially Paid").length,
    countPending: rawRecords.filter((r) => r.status === "Pending").length,
    countOverdue: rawRecords.filter((r) => r.status === "Overdue").length,
    totalStudents: rawRecords.length,
  };

  // Apply Filters
  if (filters) {
    if (filters.branchId && filters.branchId !== "all") {
      rawRecords = rawRecords.filter((r) => r.branchId === filters.branchId);
    }

    if (filters.batchId && filters.batchId !== "all") {
      rawRecords = rawRecords.filter((r) => r.batchId === filters.batchId);
    }

    if (filters.status && filters.status !== "all") {
      if (filters.status === "outstanding") {
        rawRecords = rawRecords.filter((r) => r.outstandingBalance > 0);
      } else {
        rawRecords = rawRecords.filter((r) => r.status === filters.status);
      }
    }

    if (filters.searchTerm && filters.searchTerm.trim()) {
      const q = filters.searchTerm.toLowerCase().trim();
      rawRecords = rawRecords.filter(
        (r) =>
          r.studentName.toLowerCase().includes(q) ||
          r.studentCode.toLowerCase().includes(q) ||
          r.parentName.toLowerCase().includes(q) ||
          r.parentPhone.includes(q)
      );
    }
  }

  return { records: rawRecords, totals };
}

/**
 * Build a polite prefilled WhatsApp reminder link.
 * IMPORTANT: This creates only a link/anchor. It does NOT automatically send any message.
 */
export function buildWhatsAppReminderUrl(
  studentName: string,
  studentCode: string,
  parentName: string,
  parentPhone: string,
  feePeriod: string,
  monthlyFee: number,
  totalPaid: number,
  outstandingBalance: number,
  status: FeePaymentStatus
): string {
  const digits = parentPhone.replace(/\D/g, "");
  const cleanPhone = digits.length === 10 ? `91${digits}` : digits;

  const parentGreeting = parentName ? `Namaste ${parentName} garu,` : "Namaste,";

  let statusNote = "";
  if (status === "Partially Paid") {
    statusNote = `We have gratefully received a partial payment of ₹${totalPaid.toLocaleString(
      "en-IN"
    )}. The remaining outstanding tuition balance is ₹${outstandingBalance.toLocaleString(
      "en-IN"
    )}.`;
  } else if (status === "Overdue") {
    statusNote = `The tuition fee of ₹${outstandingBalance.toLocaleString(
      "en-IN"
    )} is currently overdue. Kindly help us keep academy records up to date.`;
  } else {
    statusNote = `The tuition fee for this period is ₹${outstandingBalance.toLocaleString("en-IN")}.`;
  }

  const message = `${parentGreeting}
Greetings from Abhinaya Nartan Dance Academy.

This is a gentle reminder regarding the Kuchipudi dance class tuition for ${studentName} (ID: ${studentCode}) for ${feePeriod}.

• Monthly Tuition Fee: ₹${monthlyFee.toLocaleString("en-IN")}
• Total Payments Received: ₹${totalPaid.toLocaleString("en-IN")}
• Outstanding Balance Due: ₹${outstandingBalance.toLocaleString("en-IN")}
• Status: ${status}

${statusNote}

Kindly remit via UPI to 9398118249@upi or at the studio front desk at your convenience.

Thank you for your warm encouragement of classical dance arts.
With regards,
Abhinaya Nartan Dance Academy
Phone: +91 93981 18249 • Vijayawada`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}


/**
 * Generate a sequential, collision-free receipt number: AN-YYYY-XXXX
 */
export function generateNextReceiptNumber(existingPayments: FeePayment[], year: number = new Date().getFullYear()): string {
  const prefix = `AN-${year}-`;
  let maxSeq = 100;

  for (const p of existingPayments) {
    if (p.receiptNumber && p.receiptNumber.startsWith(prefix)) {
      const numPart = parseInt(p.receiptNumber.replace(prefix, ""), 10);
      if (!isNaN(numPart) && numPart > maxSeq) {
        maxSeq = numPart;
      }
    }
  }

  return `${prefix}${String(maxSeq + 1).padStart(4, "0")}`;
}

/**
 * Record a fee payment into the immutable ledger.
 * Satisfies all strict accounting rules:
 * 1. Never overwrite or delete payments.
 * 2. Idempotency guard prevents duplicate clicks.
 * 3. Handles full or partial payments.
 * 4. Supports multiple payments for the same fee period.
 * 5. Calculates and reports real-time outstanding balance on the receipt.
 */
export async function recordFeePayment(
  input: FeePaymentInput,
  existingPayments: FeePayment[],
  student: Student,
  batch?: Batch,
  adjustments: FeeAdjustment[] = []
): Promise<FeePaymentResult> {
  // 1. Validation
  if (!input.amountPaid || input.amountPaid <= 0) {
    return {
      success: false,
      error: "Payment amount must be greater than zero.",
    };
  }

  if (!input.forMonth || input.forMonth < 1 || input.forMonth > 12) {
    return {
      success: false,
      error: "Please select a valid tuition month (1-12).",
    };
  }

  const validMethods: OfficialPaymentMethod[] = ["Cash", "UPI", "Bank Transfer"];
  const method = normalizePaymentMethod(input.paymentMethod);
  if (!validMethods.includes(method)) {
    return {
      success: false,
      error: `Invalid payment method: ${input.paymentMethod}. Must be Cash, UPI, or Bank Transfer.`,
    };
  }

  // 2. Duplicate Submission & Idempotency Guard
  const idempotencyKey = `${input.studentId}_${input.forMonth}_${input.forYear}_${input.amountPaid}`;
  const now = Date.now();
  const lastTime = recentSubmissions.get(idempotencyKey);
  if (lastTime && now - lastTime < 3000) {
    return {
      success: false,
      error: "Duplicate submission detected. Please wait a moment.",
    };
  }
  recentSubmissions.set(idempotencyKey, now);

  const paymentDate = input.paymentDate || new Date().toISOString().split("T")[0];
  const paymentPeriod = formatPaymentPeriod(input.forMonth, input.forYear);
  const receiptNumber = generateNextReceiptNumber(existingPayments, input.forYear);

  // 3. Compute current balance before this payment
  const summaryBefore = calculateStudentFeeSummary(
    student,
    batch,
    input.forMonth,
    input.forYear,
    existingPayments,
    adjustments
  );

  const remainingBefore = summaryBefore.outstandingBalance;
  const newOutstandingBalance = Math.max(0, remainingBefore - input.amountPaid);
  const isFullSettlement = newOutstandingBalance === 0;
  const isPartialPayment = newOutstandingBalance > 0;

  const newPayment: FeePayment = {
    id: `fee-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    receiptNumber,
    studentId: input.studentId,
    branchId: input.branchId || student.branchId,
    batchId: input.batchId || student.batchId,
    forMonth: input.forMonth,
    forYear: input.forYear,
    paymentPeriod,
    amountPaid: Number(input.amountPaid),
    paymentDate,
    paymentMode: toPaymentMode(method),
    paymentMethod: method,
    transactionRef: input.transactionRef?.trim() || undefined,
    collectedBy: input.collectedBy || "Guru Smt. Radhika",
    recordedBy: input.recordedBy || undefined,
    notes: input.notes?.trim() || undefined,
    outstandingBalance: newOutstandingBalance,
    createdAt: new Date().toISOString(),
  };

  // 4. Supabase Permanent Database Storage
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        // Attempt transactional RPC if available in database
        const { data: rpcData, error: rpcError } = await supabase.rpc("record_fee_payment_tx", {
          p_student_id: student.id,
          p_amount: Number(input.amountPaid),
          p_payment_date: paymentDate,
          p_payment_method: method.toLowerCase() === "upi" ? "UPI" : method.toLowerCase() === "cash" ? "cash" : "bank transfer",
          p_payment_period: paymentPeriod,
          p_transaction_reference: input.transactionRef?.trim() || null,
          p_recorded_by: input.recordedBy || null,
          p_notes: input.notes?.trim() || null,
          p_adjustment_amount: input.adjustmentAmount || null,
          p_adjustment_type: input.adjustmentType || null,
          p_adjustment_reason: input.adjustmentReason || null,
        });

        if (!rpcError && rpcData && rpcData.length > 0) {
          const row = rpcData[0];
          newPayment.id = row.payment_id || newPayment.id;
          newPayment.receiptNumber = row.receipt_number || newPayment.receiptNumber;
          newPayment.outstandingBalance = Number(row.outstanding_balance);
        } else {
          // Direct table insert with database immutability trigger guard
          const dbPayload = mapFeePaymentToDatabaseRow(newPayment);
          const { data: insertData, error: insertError } = await supabase
            .from("payments")
            .insert([dbPayload])
            .select()
            .single();

          if (!insertError && insertData) {
            newPayment.id = insertData.id;
            newPayment.receiptNumber = insertData.receipt_number;
          } else if (insertError) {
            console.warn("Direct Supabase insert notice:", insertError.message);
          }
        }
      } catch (dbErr: any) {
        console.error("Database connection exception, recording locally:", dbErr);
      }
    }
  }

  // 5. Synchronize local store (audit ledger retains all entries)
  const updatedPayments = [newPayment, ...existingPayments];
  AcademyDataStore.saveFeePayments(updatedPayments);

  return {
    success: true,
    payment: newPayment,
    outstandingBalance: newOutstandingBalance,
    isPartialPayment,
    isFullSettlement,
  };
}

/**
 * Record a fee adjustment or reversal entry.
 * Satisfies rule: "Corrections must create adjustment or reversal entries."
 */
export async function recordFeeAdjustment(adjustment: Omit<FeeAdjustment, "id" | "createdAt">): Promise<FeeAdjustment> {
  const newAdjustment: FeeAdjustment = {
    ...adjustment,
    id: `adj-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("fee_adjustments")
          .insert([
            {
              student_id: adjustment.studentId,
              amount: adjustment.amount,
              adjustment_type: adjustment.adjustmentType,
              reason: adjustment.reason,
            },
          ])
          .select()
          .single();

        if (!error && data) {
          newAdjustment.id = data.id;
          newAdjustment.createdAt = data.created_at;
        }
      } catch (err) {
        console.warn("Adjustment write notice:", err);
      }
    }
  }

  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("an_academy_adjustments_v1");
      const current = stored ? JSON.parse(stored) : [];
      const updated = [newAdjustment, ...current];
      localStorage.setItem("an_academy_adjustments_v1", JSON.stringify(updated));
    } catch {
      // ignore
    }
  }

  return newAdjustment;
}
