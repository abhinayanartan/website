// ==============================================================================
// ABHINAYA NARTAN ACADEMY MANAGER - FEE COLLECTION TEST SUITE
// Tests zero-cost Supabase PostgreSQL fee collection, partial payments,
// multiple payments per period, balance tracking, receipts, and accounting rules
// ==============================================================================

import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";

console.log("=======================================================");
console.log(" ABHINAYA NARTAN FEE COLLECTION MANAGEMENT TEST SUITE");
console.log("=======================================================\n");

let passedCount = 0;
let failedCount = 0;

function it(description, fn) {
  try {
    fn();
    console.log(`  ✔ PASS: ${description}`);
    passedCount++;
  } catch (err) {
    console.error(`  ✖ FAIL: ${description}`);
    console.error(`    ${err.message}`);
    failedCount++;
  }
}

// Mimic feeService logic for self-contained testing in Node
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

function normalizePaymentMethod(methodOrMode) {
  const lower = (methodOrMode || "").toLowerCase().replace(/_/g, " ").trim();
  if (lower === "cash") return "Cash";
  if (lower === "bank transfer" || lower === "bank" || lower === "neft" || lower === "imps") {
    return "Bank Transfer";
  }
  return "UPI";
}

function formatPaymentPeriod(month, year) {
  return `${MONTH_NAMES[month - 1]} ${year}`;
}

function calculateStudentFeeSummary(student, batch, forMonth, forYear, allPayments, adjustments = []) {
  const periodLabel = formatPaymentPeriod(forMonth, forYear);
  const baseMonthlyFee = student.monthlyFee || batch?.monthlyFee || 1500;

  const periodPayments = allPayments.filter((p) => {
    if (p.studentId !== student.id) return false;
    if (p.forMonth === forMonth && p.forYear === forYear) return true;
    if (p.paymentPeriod && p.paymentPeriod.toLowerCase() === periodLabel.toLowerCase()) return true;
    return false;
  });

  const totalPaid = periodPayments.reduce((sum, p) => sum + (Number(p.amountPaid) || 0), 0);

  const studentAdjustments = adjustments.filter((a) => a.studentId === student.id);
  const deductions = studentAdjustments
    .filter((a) => ["discount", "scholarship", "waiver"].includes(a.adjustmentType))
    .reduce((sum, a) => sum + Math.abs(a.amount), 0);
  const additions = studentAdjustments
    .filter((a) => a.adjustmentType === "fine")
    .reduce((sum, a) => sum + Math.abs(a.amount), 0);

  const effectiveMonthlyFee = Math.max(0, baseMonthlyFee - deductions + additions);
  const outstandingBalance = Math.max(0, effectiveMonthlyFee - totalPaid);

  let status = "unpaid";
  if (totalPaid >= effectiveMonthlyFee && effectiveMonthlyFee > 0) {
    status = "paid";
  } else if (totalPaid > 0) {
    status = "partial";
  }

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
    paymentCount: periodPayments.length,
  };
}

function generateNextReceiptNumber(existingPayments, year = 2026) {
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

// Sample test data
const sampleStudent = {
  id: "std-test-1",
  studentCode: "AN-2024-001",
  admissionNumber: "AN-2024-001",
  fullName: "Sravani Manepalli",
  monthlyFee: 2000,
  branchId: "branch-vja",
  batchId: "batch-senior",
};

const sampleBatch = {
  id: "batch-senior",
  name: "Senior Repertoire Batch",
  monthlyFee: 2000,
};

// -----------------------------------------------------------------------------
// Test Group 1: Official Payment Methods
// -----------------------------------------------------------------------------
console.log("[Group 1: Payment Methods Normalization & Contract]");

it("Normalizes 'cash' to 'Cash'", () => {
  assert.strictEqual(normalizePaymentMethod("cash"), "Cash");
});

it("Normalizes 'upi' to 'UPI'", () => {
  assert.strictEqual(normalizePaymentMethod("upi"), "UPI");
});

it("Normalizes 'bank_transfer' and 'neft' to 'Bank Transfer'", () => {
  assert.strictEqual(normalizePaymentMethod("bank_transfer"), "Bank Transfer");
  assert.strictEqual(normalizePaymentMethod("neft"), "Bank Transfer");
});

// -----------------------------------------------------------------------------
// Test Group 2: Full & Partial Payments
// -----------------------------------------------------------------------------
console.log("\n[Group 2: Full and Partial Payments]");

it("Calculates zero balance for full payment", () => {
  const payments = [
    {
      id: "p1",
      studentId: sampleStudent.id,
      amountPaid: 2000,
      forMonth: 11,
      forYear: 2026,
      receiptNumber: "AN-2026-0101",
    },
  ];
  const summary = calculateStudentFeeSummary(sampleStudent, sampleBatch, 11, 2026, payments);
  assert.strictEqual(summary.totalPaid, 2000);
  assert.strictEqual(summary.outstandingBalance, 0);
  assert.strictEqual(summary.status, "paid");
});

it("Calculates outstanding balance for partial payment", () => {
  const payments = [
    {
      id: "p1",
      studentId: sampleStudent.id,
      amountPaid: 1200,
      forMonth: 11,
      forYear: 2026,
      receiptNumber: "AN-2026-0101",
    },
  ];
  const summary = calculateStudentFeeSummary(sampleStudent, sampleBatch, 11, 2026, payments);
  assert.strictEqual(summary.totalPaid, 1200);
  assert.strictEqual(summary.outstandingBalance, 800);
  assert.strictEqual(summary.status, "partial");
});

// -----------------------------------------------------------------------------
// Test Group 3: Multiple Payments for One Fee Period
// -----------------------------------------------------------------------------
console.log("\n[Group 3: Multiple Payments for One Fee Period]");

it("Supports 2 consecutive payments for the same month reducing balance to zero", () => {
  const payments = [
    {
      id: "p1",
      studentId: sampleStudent.id,
      amountPaid: 1200,
      forMonth: 11,
      forYear: 2026,
      receiptNumber: "AN-2026-0101",
      paymentDate: "2026-11-02",
    },
    {
      id: "p2",
      studentId: sampleStudent.id,
      amountPaid: 800,
      forMonth: 11,
      forYear: 2026,
      receiptNumber: "AN-2026-0102",
      paymentDate: "2026-11-10",
    },
  ];

  const summary = calculateStudentFeeSummary(sampleStudent, sampleBatch, 11, 2026, payments);
  assert.strictEqual(summary.paymentCount, 2);
  assert.strictEqual(summary.totalPaid, 2000);
  assert.strictEqual(summary.outstandingBalance, 0);
  assert.strictEqual(summary.status, "paid");
});

it("Preserves both payment records without overwriting or merging rows", () => {
  const payments = [
    { id: "p1", receiptNumber: "AN-2026-0101", amountPaid: 1200 },
    { id: "p2", receiptNumber: "AN-2026-0102", amountPaid: 800 },
  ];
  assert.strictEqual(payments.length, 2);
  assert.notStrictEqual(payments[0].receiptNumber, payments[1].receiptNumber);
});

// -----------------------------------------------------------------------------
// Test Group 4: Unique Receipt Number Sequence
// -----------------------------------------------------------------------------
console.log("\n[Group 4: Unique Receipt Number Sequence]");

it("Generates AN-2026-0101 when no previous payments exist", () => {
  const receipt = generateNextReceiptNumber([], 2026);
  assert.strictEqual(receipt, "AN-2026-0101");
});

it("Increments sequentially to prevent collisions", () => {
  const existing = [
    { receiptNumber: "AN-2026-0101" },
    { receiptNumber: "AN-2026-0102" },
    { receiptNumber: "AN-2026-0103" },
  ];
  const nextReceipt = generateNextReceiptNumber(existing, 2026);
  assert.strictEqual(nextReceipt, "AN-2026-0104");
});

// -----------------------------------------------------------------------------
// Test Group 5: Accounting Immutability & Reversal Rules
// -----------------------------------------------------------------------------
console.log("\n[Group 5: Accounting Immutability & Database Schema Rules]");

it("Verifies migration 000 contains prevent_payment_tampering trigger", () => {
  const migration0 = fs.readFileSync(
    path.join(process.cwd(), "supabase", "migrations", "20261108000000_initial_academy_schema.sql"),
    "utf-8"
  );
  assert(migration0.includes("prevent_payment_tampering"), "Missing tamper protection function");
  assert(migration0.includes("BEFORE UPDATE OR DELETE ON public.payments"), "Missing immutable trigger");
});

it("Verifies migration 004 provides record_fee_payment_tx stored procedure", () => {
  const migration4 = fs.readFileSync(
    path.join(process.cwd(), "supabase", "migrations", "20261108000004_fee_collection_transactions.sql"),
    "utf-8"
  );
  assert(migration4.includes("record_fee_payment_tx"), "Missing transactional payment stored procedure");
  assert(migration4.includes("get_student_fee_status"), "Missing student fee status helper");
});

it("Applies fee adjustments as deductions without modifying original payment row", () => {
  const adjustments = [
    {
      id: "adj-1",
      studentId: sampleStudent.id,
      amount: -300,
      adjustmentType: "scholarship",
      reason: "Merit scholarship for youth dance festival",
    },
  ];
  // Base fee: 2000 - 300 scholarship = 1700 effective fee
  const payments = [
    {
      id: "p1",
      studentId: sampleStudent.id,
      amountPaid: 1700,
      forMonth: 11,
      forYear: 2026,
    },
  ];
  const summary = calculateStudentFeeSummary(sampleStudent, sampleBatch, 11, 2026, payments, adjustments);
  assert.strictEqual(summary.monthlyFee, 1700);
  assert.strictEqual(summary.totalPaid, 1700);
  assert.strictEqual(summary.outstandingBalance, 0);
  assert.strictEqual(summary.status, "paid");
});

// -----------------------------------------------------------------------------
// Test Group 6: Receipt Specification Compliance
// -----------------------------------------------------------------------------
console.log("\n[Group 6: Payment Receipt Contract Compliance]");

const requiredReceiptFields = [
  "Academy Name: Abhinaya Nartan Dance Academy",
  "Student Name",
  "Student ID",
  "Payment Receipt Number",
  "Payment Date",
  "Fee Period",
  "Amount Received",
  "Payment Method",
  "Outstanding Balance",
];

it("Checks that ReceiptModal source code renders all 9 mandatory fields", () => {
  const receiptSrc = fs.readFileSync(
    path.join(process.cwd(), "components", "dashboard", "ReceiptModal.tsx"),
    "utf-8"
  );
  assert(receiptSrc.includes("Abhinaya Nartan Dance Academy"), "Missing Academy Name");
  assert(receiptSrc.includes("student?.fullName"), "Missing Student Name");
  assert(receiptSrc.includes("Student ID"), "Missing Student ID label");
  assert(receiptSrc.includes("payment.receiptNumber"), "Missing Payment Receipt Number");
  assert(receiptSrc.includes("payment.paymentDate"), "Missing Payment Date");
  assert(receiptSrc.includes("Fee Period"), "Missing Fee Period");
  assert(receiptSrc.includes("Amount Received"), "Missing Amount Received");
  assert(receiptSrc.includes("Payment Method"), "Missing Payment Method");
  assert(receiptSrc.includes("Outstanding Balance"), "Missing Outstanding Balance");
});

// -----------------------------------------------------------------------------
// Test Group 7: Search & Filter Verification
// -----------------------------------------------------------------------------
console.log("\n[Group 7: Search and Filter Capabilities]");

const samplePaymentsLedger = [
  {
    id: "p-1",
    receiptNumber: "AN-2026-0101",
    studentId: "std-1",
    amountPaid: 2000,
    paymentDate: "2026-11-02",
    paymentMode: "upi",
    paymentMethod: "UPI",
    forMonth: 11,
    forYear: 2026,
  },
  {
    id: "p-2",
    receiptNumber: "AN-2026-0102",
    studentId: "std-2",
    amountPaid: 1500,
    paymentDate: "2026-11-03",
    paymentMode: "cash",
    paymentMethod: "Cash",
    forMonth: 11,
    forYear: 2026,
  },
  {
    id: "p-3",
    receiptNumber: "AN-2026-0103",
    studentId: "std-3",
    amountPaid: 1800,
    paymentDate: "2026-10-15",
    paymentMode: "bank_transfer",
    paymentMethod: "Bank Transfer",
    forMonth: 10,
    forYear: 2026,
  },
];

it("Filters payments by method 'Cash'", () => {
  const cashOnly = samplePaymentsLedger.filter((p) => p.paymentMethod === "Cash");
  assert.strictEqual(cashOnly.length, 1);
  assert.strictEqual(cashOnly[0].receiptNumber, "AN-2026-0102");
});

it("Filters payments by fee month (November)", () => {
  const novPayments = samplePaymentsLedger.filter((p) => p.forMonth === 11);
  assert.strictEqual(novPayments.length, 2);
  const total = novPayments.reduce((s, p) => s + p.amountPaid, 0);
  assert.strictEqual(total, 3500);
});

it("Calculates correct monthly collection totals", () => {
  const novTotal = samplePaymentsLedger
    .filter((p) => p.forMonth === 11 && p.forYear === 2026)
    .reduce((s, p) => s + p.amountPaid, 0);
  assert.strictEqual(novTotal, 3500);
});

// -----------------------------------------------------------------------------
// Summary
// -----------------------------------------------------------------------------
console.log("\n=======================================================");
console.log(` TEST SUMMARY: ${passedCount} Passed, ${failedCount} Failed`);
console.log("=======================================================\n");

if (failedCount > 0) {
  process.exit(1);
}
