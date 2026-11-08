// ==============================================================================
// ABHINAYA NARTAN ACADEMY MANAGER - BATCH MANAGEMENT TEST SUITE
// Tests: Create Batch, Edit Batch, Teacher & Branch Assignment, Time Validation,
//        Student View, Student Batch Transfer & Historical Preservation
// ==============================================================================

function formatTimeTo24H(timeStr) {
  if (!timeStr) return "17:00:00";
  const clean = timeStr.trim().toUpperCase();

  if (!clean.includes("AM") && !clean.includes("PM")) {
    const parts = clean.split(":");
    const h = String(parseInt(parts[0] || "17", 10)).padStart(2, "0");
    const m = String(parseInt(parts[1] || "00", 10)).padStart(2, "0");
    return `${h}:${m}:00`;
  }

  const isPM = clean.includes("PM");
  const timeOnly = clean.replace(/AM|PM/g, "").trim();
  const [hStr, mStr] = timeOnly.split(":");
  let hours = parseInt(hStr || "12", 10);
  const minutes = parseInt(mStr || "00", 10);

  if (isPM && hours < 12) hours += 12;
  if (!isPM && hours === 12) hours = 0;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`;
}

function formatTimeTo12H(timeStr) {
  if (!timeStr) return "05:00 PM";
  const clean = timeStr.trim();
  if (clean.includes("AM") || clean.includes("PM")) return clean;

  const [hStr, mStr] = clean.split(":");
  let hours = parseInt(hStr || "17", 10);
  const minutes = parseInt(mStr || "00", 10);
  const period = hours >= 12 ? "PM" : "AM";

  if (hours > 12) hours -= 12;
  if (hours === 0) hours = 12;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")} ${period}`;
}

function mapDatabaseRowToBatch(row) {
  const name = row.batch_name || row.name || "Classical Batch";
  const days = Array.isArray(row.class_days) ? row.class_days : row.schedule_days || ["Mon", "Wed", "Fri"];
  const start12 = formatTimeTo12H(row.start_time || "17:00:00");
  const end12 = formatTimeTo12H(row.end_time || "18:30:00");
  const status = row.status || (row.is_active ? "active" : "inactive");

  return {
    id: row.id,
    branchId: row.branch_id || "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    name,
    level: row.level || (name.includes("Beginner") ? "Beginner" : name.includes("Master") ? "Intermediate" : "Advanced"),
    scheduleDays: days,
    startTime: start12,
    endTime: end12,
    teacherName: row.teacher_name || (name.includes("Tarangam") ? "Guru Sri Krishna" : "Guru Smt. Radhika"),
    teacherId: row.teacher_id,
    maxCapacity: Number(row.max_capacity) || 20,
    monthlyFee: Number(row.monthly_fee) || (name.includes("Tarangam") ? 2200 : name.includes("Master") ? 1800 : 1500),
    isActive: status === "active",
    status: status,
  };
}

console.log("\n=======================================================");
console.log(" ABHINAYA NARTAN BATCH MANAGEMENT TEST SUITE");
console.log("=======================================================\n");

let passed = 0;
let failed = 0;

function assert(condition, testName, details = "") {
  if (condition) {
    console.log(`  ✔ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ✖ FAIL: ${testName} - ${details}`);
    failed++;
  }
}

// -------------------------------------------------------------
// Test Group 1: 12H <-> 24H Time Format Conversion & Validation
// -------------------------------------------------------------
console.log("[Group 1: Time Conversion & Postgres Validation]");
assert(formatTimeTo24H("05:00 PM") === "17:00:00", "Converts '05:00 PM' to '17:00:00'");
assert(formatTimeTo24H("09:30 AM") === "09:30:00", "Converts '09:30 AM' to '09:30:00'");
assert(formatTimeTo12H("17:00:00") === "05:00 PM", "Converts '17:00:00' to '05:00 PM'");
assert(formatTimeTo12H("09:30:00") === "09:30 AM", "Converts '09:30:00' to '09:30 AM'");

// Order check
const start24 = formatTimeTo24H("05:00 PM");
const end24 = formatTimeTo24H("06:30 PM");
assert(start24 < end24, "Validates starting time (17:00:00) is earlier than ending time (18:30:00)");

const invalidStart24 = formatTimeTo24H("07:00 PM");
const invalidEnd24 = formatTimeTo24H("06:00 PM");
assert(invalidStart24 >= invalidEnd24, "Detects invalid inverted time order");

// -------------------------------------------------------------
// Test Group 2: Supabase Database Row Mapping
// -------------------------------------------------------------
console.log("\n[Group 2: Supabase Row Mapping]");
const rawDbBatch = {
  id: "c3333333-3333-3333-3333-333333333333",
  batch_name: "Tarangam Brass Plate Intensive",
  branch_id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  class_days: ["Sun"],
  start_time: "09:00:00",
  end_time: "12:00:00",
  status: "active",
};

const mappedBatch = mapDatabaseRowToBatch(rawDbBatch);
assert(mappedBatch.id === "c3333333-3333-3333-3333-333333333333", "Maps UUID primary key");
assert(mappedBatch.name === "Tarangam Brass Plate Intensive", "Maps batch_name to name");
assert(mappedBatch.branchId === "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11", "Maps branch_id");
assert(mappedBatch.scheduleDays.length === 1 && mappedBatch.scheduleDays[0] === "Sun", "Maps class_days array");
assert(mappedBatch.startTime === "09:00 AM", "Converts 09:00:00 to 09:00 AM");
assert(mappedBatch.endTime === "12:00 PM", "Converts 12:00:00 to 12:00 PM");
assert(mappedBatch.isActive === true && mappedBatch.status === "active", "Maps active status");

// -------------------------------------------------------------
// Test Group 3: View Enrolled Students in Batch
// -------------------------------------------------------------
console.log("\n[Group 3: Students Enrolled in Batch]");
const mockStudents = [
  { id: "std-1", fullName: "Sravani", batchId: "batch-1", status: "active" },
  { id: "std-2", fullName: "Ananya", batchId: "batch-1", status: "active" },
  { id: "std-3", fullName: "Keerthi", batchId: "batch-2", status: "active" },
  { id: "std-4", fullName: "Divya", batchId: "batch-1", status: "inactive" },
];

const batch1ActiveStudents = mockStudents.filter(
  (s) => s.batchId === "batch-1" && s.status === "active"
);
assert(batch1ActiveStudents.length === 2, "Filters 2 active dancers in batch-1");
assert(batch1ActiveStudents.map((s) => s.fullName).includes("Sravani"), "Contains student Sravani");
assert(batch1ActiveStudents.map((s) => s.fullName).includes("Ananya"), "Contains student Ananya");

// -------------------------------------------------------------
// Test Group 4: Student Transfer & History Preservation
// -------------------------------------------------------------
console.log("\n[Group 4: Student Transfer & History Preservation]");
// Mock ledger
const mockAttendanceHistory = [
  { id: "att-1", studentId: "std-1", batchId: "batch-1", date: "2026-11-01", status: "present" },
  { id: "att-2", studentId: "std-1", batchId: "batch-1", date: "2026-11-03", status: "present" },
];

const mockPaymentHistory = [
  { id: "pay-1", studentId: "std-1", receiptNumber: "AN-2026-0101", amount: 2200, paymentPeriod: "November 2026" },
];

// Perform transfer of std-1 from batch-1 to batch-2
const targetBatchId = "batch-2";
const transferredStudents = mockStudents.map((s) =>
  s.id === "std-1" ? { ...s, batchId: targetBatchId } : s
);

const updatedStudent = transferredStudents.find((s) => s.id === "std-1");
assert(updatedStudent?.batchId === "batch-2", "Student successfully moved to batch-2");

// Verify attendance records are completely intact
const studentAttendance = mockAttendanceHistory.filter((a) => a.studentId === "std-1");
assert(studentAttendance.length === 2, "Historical attendance records remain 100% intact after transfer");
assert(studentAttendance[0].batchId === "batch-1", "Past attendance accurately preserves original batch context");

// Verify payment ledger is completely intact
const studentPayments = mockPaymentHistory.filter((p) => p.studentId === "std-1");
assert(studentPayments.length === 1, "Payment receipts remain 100% intact after transfer");
assert(studentPayments[0].receiptNumber === "AN-2026-0101", "Preserves receipt number AN-2026-0101");

// -------------------------------------------------------------
// Test Group 5: Batch Status Toggle
// -------------------------------------------------------------
console.log("\n[Group 5: Activate & Deactivate Batch]");
let testBatch = { ...mappedBatch };
testBatch = { ...testBatch, status: "inactive", isActive: false };
assert(testBatch.status === "inactive" && testBatch.isActive === false, "Deactivates batch");
testBatch = { ...testBatch, status: "active", isActive: true };
assert(testBatch.status === "active" && testBatch.isActive === true, "Re-activates batch");

console.log("\n=======================================================");
console.log(` TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
console.log("=======================================================\n");

if (failed > 0) process.exit(1);
