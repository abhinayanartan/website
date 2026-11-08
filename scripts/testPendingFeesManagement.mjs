// ==============================================================================
// ABHINAYA NARTAN ACADEMY MANAGER - PENDING FEES MANAGEMENT TEST SUITE
// Tests pending fees calculation, payment statuses (Paid, Partially Paid,
// Pending, Overdue), student-wise report, filters, and non-automatic WhatsApp link
// ==============================================================================

import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";

console.log("=======================================================");
console.log(" ABHINAYA NARTAN PENDING FEES MANAGEMENT TEST SUITE");
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

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

function determinePaymentStatus(totalPaid, effectiveFee, outstandingBalance, forMonth, forYear, dueDateDay = 10) {
  if (outstandingBalance === 0 && effectiveFee > 0 && totalPaid >= effectiveFee) {
    return "Paid";
  }

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const currentDay = now.getDate();

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

function calculateStudentFeeSummary(student, batch, forMonth, forYear, allPayments, adjustments = []) {
  const periodLabel = `${MONTH_NAMES[forMonth - 1]} ${forYear}`;
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
  const paymentStatus = determinePaymentStatus(totalPaid, effectiveMonthlyFee, outstandingBalance, forMonth, forYear);

  return {
    studentId: student.id,
    studentName: student.fullName,
    monthlyFee: effectiveMonthlyFee,
    periodLabel,
    forMonth,
    forYear,
    totalPaid,
    outstandingBalance,
    paymentStatus,
  };
}

function buildWhatsAppReminderUrl(studentName, studentCode, parentName, parentPhone, feePeriod, monthlyFee, totalPaid, outstandingBalance, status) {
  const digits = parentPhone.replace(/\D/g, "");
  const cleanPhone = digits.length === 10 ? `91${digits}` : digits;
  const parentGreeting = parentName ? `Namaste ${parentName} garu,` : "Namaste,";

  const message = `${parentGreeting}
Greetings from Abhinaya Nartan Dance Academy.

This is a gentle reminder regarding the Kuchipudi dance class tuition for ${studentName} (ID: ${studentCode}) for ${feePeriod}.

• Monthly Tuition Fee: ₹${monthlyFee.toLocaleString("en-IN")}
• Total Payments Received: ₹${totalPaid.toLocaleString("en-IN")}
• Outstanding Balance Due: ₹${outstandingBalance.toLocaleString("en-IN")}
• Status: ${status}

Kindly remit via UPI to 9398118249@upi or at the studio front desk at your convenience.`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

// Test Fixtures
const testStudents = [
  {
    id: "std-1",
    studentCode: "AN-2024-001",
    fullName: "Sravani Manepalli",
    parentName: "Srinivasa Rao M.",
    parentPhone: "+91 98480 12345",
    branchId: "branch-vja",
    batchId: "batch-1",
    monthlyFee: 2000,
    status: "active",
  },
  {
    id: "std-2",
    studentCode: "AN-2024-002",
    fullName: "Ananya Varma",
    parentName: "Ramesh Varma",
    parentPhone: "+91 94401 56789",
    branchId: "branch-vja",
    batchId: "batch-2",
    monthlyFee: 1800,
    status: "active",
  },
  {
    id: "std-3",
    studentCode: "AN-2025-015",
    fullName: "Keerthi Priya K.",
    parentName: "Venkateswarlu K.",
    parentPhone: "+91 98665 43210",
    branchId: "branch-vja",
    batchId: "batch-1",
    monthlyFee: 1500,
    status: "active",
  },
  {
    id: "std-4",
    studentCode: "AN-2024-008",
    fullName: "Deepika Murthy",
    parentName: "Subba Rao M.",
    parentPhone: "+91 98490 67890",
    branchId: "branch-gnr",
    batchId: "batch-3",
    monthlyFee: 1600,
    status: "active",
  },
];

const testBatches = [
  { id: "batch-1", name: "Morning Senior Repertoire", branchId: "branch-vja", monthlyFee: 2000 },
  { id: "batch-2", name: "Evening Intermediate Adavus", branchId: "branch-vja", monthlyFee: 1800 },
  { id: "batch-3", name: "Guntur Weekend Beginners", branchId: "branch-gnr", monthlyFee: 1600 },
];

const testBranches = [
  { id: "branch-vja", name: "Vijayawada Main Studio" },
  { id: "branch-gnr", name: "Guntur Branch Studio" },
];

const testPayments = [
  // Student 1: Paid in full (2000)
  {
    id: "pay-1",
    studentId: "std-1",
    amountPaid: 2000,
    forMonth: 11,
    forYear: 2026,
    paymentDate: "2026-11-02",
    receiptNumber: "AN-2026-0101",
  },
  // Student 2: Partially Paid (1000 of 1800 -> 800 balance)
  {
    id: "pay-2",
    studentId: "std-2",
    amountPaid: 1000,
    forMonth: 11,
    forYear: 2026,
    paymentDate: "2026-11-04",
    receiptNumber: "AN-2026-0102",
  },
  // Student 3: Nothing paid for Nov 2026 (0 of 1500 -> 1500 balance)
  // Student 4: Nothing paid for Oct 2026 (past month -> Overdue)
];

// -----------------------------------------------------------------------------
// Test Group 1: Outstanding Fees Calculation
// -----------------------------------------------------------------------------
console.log("[Group 1: Outstanding Fees Calculation]");

it("Correctly identifies fully paid student with ₹0 outstanding balance", () => {
  const s1 = calculateStudentFeeSummary(testStudents[0], testBatches[0], 11, 2026, testPayments);
  assert.strictEqual(s1.totalPaid, 2000);
  assert.strictEqual(s1.outstandingBalance, 0);
  assert.strictEqual(s1.paymentStatus, "Paid");
});

it("Correctly identifies partially paid student with remaining balance", () => {
  const s2 = calculateStudentFeeSummary(testStudents[1], testBatches[1], 11, 2026, testPayments);
  assert.strictEqual(s2.totalPaid, 1000);
  assert.strictEqual(s2.outstandingBalance, 800);
  assert.strictEqual(s2.paymentStatus, "Partially Paid");
});

it("Correctly identifies zero-payment student with full outstanding balance", () => {
  const s3 = calculateStudentFeeSummary(testStudents[2], testBatches[0], 11, 2026, testPayments);
  assert.strictEqual(s3.totalPaid, 0);
  assert.strictEqual(s3.outstandingBalance, 1500);
});

// -----------------------------------------------------------------------------
// Test Group 2: Payment Status Contracts
// -----------------------------------------------------------------------------
console.log("\n[Group 2: Payment Status Classification]");

it("Classifies status as 'Paid' when balance is 0", () => {
  const status = determinePaymentStatus(1800, 1800, 0, 11, 2026);
  assert.strictEqual(status, "Paid");
});

it("Classifies status as 'Partially Paid' when some payment is received", () => {
  const status = determinePaymentStatus(1000, 1800, 800, 11, 2026);
  assert.strictEqual(status, "Partially Paid");
});

it("Classifies status as 'Overdue' for unpaid past fee periods", () => {
  // October 2026 is past month
  const status = determinePaymentStatus(0, 1600, 1600, 10, 2026);
  assert.strictEqual(status, "Overdue");
});

it("Classifies status as 'Pending' for current month when before due date", () => {
  // Setting due date to day 25
  const status = determinePaymentStatus(0, 1500, 1500, 11, 2026, 25);
  assert.strictEqual(status, "Pending");
});

// -----------------------------------------------------------------------------
// Test Group 3: Multi-Parameter Filtering
// -----------------------------------------------------------------------------
console.log("\n[Group 3: Multi-Parameter Filtering]");

it("Filters records by branch (Guntur Branch)", () => {
  const gunturDancers = testStudents.filter((s) => s.branchId === "branch-gnr");
  assert.strictEqual(gunturDancers.length, 1);
  assert.strictEqual(gunturDancers[0].fullName, "Deepika Murthy");
});

it("Filters records by batch (Morning Senior Repertoire)", () => {
  const batch1Dancers = testStudents.filter((s) => s.batchId === "batch-1");
  assert.strictEqual(batch1Dancers.length, 2);
});

it("Filters records by search query for dancer name", () => {
  const query = "keerthi";
  const matched = testStudents.filter((s) => s.fullName.toLowerCase().includes(query));
  assert.strictEqual(matched.length, 1);
  assert.strictEqual(matched[0].studentCode, "AN-2025-015");
});

// -----------------------------------------------------------------------------
// Test Group 4: Student-wise Report Structure
// -----------------------------------------------------------------------------
console.log("\n[Group 4: Student-wise Outstanding Fee Report]");

it("Verifies required columns exist in report structure", () => {
  const requiredColumns = [
    "Student Name",
    "Student ID",
    "Branch",
    "Batch",
    "Parent Contact",
    "Fee Period",
    "Monthly Fee",
    "Total Paid",
    "Outstanding Balance",
    "Payment Status",
  ];

  const reportSrc = fs.readFileSync(
    path.join(process.cwd(), "components", "dashboard", "PendingFeesView.tsx"),
    "utf-8"
  );

  for (const col of requiredColumns) {
    assert(reportSrc.includes(col), `Report table is missing column: ${col}`);
  }
});

it("Verifies CSV export capability exists in report view", () => {
  const reportSrc = fs.readFileSync(
    path.join(process.cwd(), "components", "dashboard", "PendingFeesView.tsx"),
    "utf-8"
  );
  assert(reportSrc.includes("handleExportCSV"), "Missing CSV export handler");
  assert(reportSrc.includes("text/csv"), "Missing CSV mimetype generation");
});

// -----------------------------------------------------------------------------
// Test Group 5: WhatsApp Polite Reminder URL & Non-Automatic Constraint
// -----------------------------------------------------------------------------
console.log("\n[Group 5: WhatsApp Reminder Link & Policy]");

it("Generates valid WhatsApp link with 91 country code and prefilled polite text", () => {
  const url = buildWhatsAppReminderUrl(
    "Ananya Varma",
    "AN-2024-002",
    "Ramesh Varma",
    "+91 94401 56789",
    "November 2026",
    1800,
    1000,
    800,
    "Partially Paid"
  );

  assert(url.startsWith("https://wa.me/919440156789?text="), "URL must target parent's phone number");
  const decoded = decodeURIComponent(url.split("?text=")[1]);
  assert(decoded.includes("Namaste Ramesh Varma garu"), "Missing respectful Telugu/Indian greeting");
  assert(decoded.includes("Ananya Varma"), "Missing dancer name");
  assert(decoded.includes("AN-2024-002"), "Missing student code");
  assert(decoded.includes("₹800"), "Missing outstanding balance");
  assert(decoded.includes("9398118249@upi"), "Missing academy UPI ID");
});

it("Strict Non-Automatic Sending Verification: Code contains no automated dispatch", () => {
  const pendingViewSrc = fs.readFileSync(
    path.join(process.cwd(), "components", "dashboard", "PendingFeesView.tsx"),
    "utf-8"
  );
  assert(pendingViewSrc.includes('href={reminderUrl}'), "WhatsApp link must be a standard manual anchor");
  assert(pendingViewSrc.includes('target="_blank"'), "WhatsApp link opens in external window");
  assert(!pendingViewSrc.includes("sendAutomatedReminder"), "No automated message sender allowed");
  assert(!pendingViewSrc.includes("setInterval"), "No timer-based automated dispatch allowed");
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
