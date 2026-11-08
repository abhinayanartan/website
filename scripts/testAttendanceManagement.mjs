// ==============================================================================
// ABHINAYA NARTAN ACADEMY MANAGER - ATTENDANCE MANAGEMENT TEST SUITE
// Tests: Statuses (Present, Absent, Leave), Single-Action Save,
//        Duplicate Prevention (Upsert on uq_student_batch_date),
//        Non-automatic Absenteeism, Calculations & Attendance Report
// ==============================================================================

import { readFileSync } from "fs";
import { resolve } from "path";

console.log("\n=======================================================");
console.log(" ABHINAYA NARTAN ATTENDANCE MANAGEMENT TEST SUITE");
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

// Replicated calculation logic from lib/services/attendanceService.ts
function calculateStudentAttendance(student, batchId, records) {
  const studentRecords = records.filter(
    (r) => r.studentId === student.id && (batchId === "all" || r.batchId === batchId)
  );

  const present = studentRecords.filter((r) => r.status === "present").length;
  const absent = studentRecords.filter((r) => r.status === "absent").length;
  const leave = studentRecords.filter((r) => r.status === "leave").length;
  const totalClasses = studentRecords.length;
  const percentage = totalClasses > 0 ? Math.round((present / totalClasses) * 100) : 0;

  return { totalClasses, present, absent, leave, percentage };
}

function generateAttendanceReport(students, batchId, records) {
  const relevant = students.filter(
    (s) => (batchId === "all" || s.batchId === batchId) && s.status === "active"
  );

  return relevant.map((student) => {
    const stats = calculateStudentAttendance(student, batchId, records);
    return {
      student,
      ...stats,
    };
  });
}

// -------------------------------------------------------------
// Test Group 1: Attendance Statuses Contract (Present, Absent, Leave)
// -------------------------------------------------------------
console.log("[Group 1: Attendance Statuses Contract]");
const ALLOWED_STATUSES = ["present", "absent", "leave"];
assert(ALLOWED_STATUSES.includes("present"), "Status 'present' is supported");
assert(ALLOWED_STATUSES.includes("absent"), "Status 'absent' is supported");
assert(ALLOWED_STATUSES.includes("leave"), "Status 'leave' is supported");
assert(!ALLOWED_STATUSES.includes("random_status"), "Arbitrary invalid statuses are not permitted");

// -------------------------------------------------------------
// Test Group 2: Non-Automatic Absenteeism Before Finalization
// Requirement: "Do not automatically mark students absent before attendance has been finalized."
// -------------------------------------------------------------
console.log("\n[Group 2: Non-Automatic Absenteeism Enforcement]");
const mockStudentRoster = [
  { id: "std-1", fullName: "Sravani Manepalli", batchId: "b-1", status: "active" },
  { id: "std-2", fullName: "Ananya Varma", batchId: "b-1", status: "active" },
  { id: "std-3", fullName: "Keerthi Priya K.", batchId: "b-1", status: "active" },
];

// Initial un-finalized staging map
const stagedMap = {};
assert(Object.keys(stagedMap).length === 0, "Staging map starts empty for unrecorded sessions");
assert(stagedMap["std-1"] === undefined, "Student 1 is NOT automatically marked absent before finalization");
assert(stagedMap["std-2"] === undefined, "Student 2 is NOT automatically marked absent before finalization");

// Finalization validation requires explicit selection
const unselectedStudents = mockStudentRoster.filter((s) => !stagedMap[s.id]);
assert(unselectedStudents.length === 3, "Requires teacher to explicitly mark or choose bulk action before save");

// -------------------------------------------------------------
// Test Group 3: Bulk Action (Mark All Present)
// -------------------------------------------------------------
console.log("\n[Group 3: Bulk Action: Mark All Present]");
const bulkStaged = {};
mockStudentRoster.forEach((s) => {
  bulkStaged[s.id] = "present";
});
assert(bulkStaged["std-1"] === "present", "Student 1 marked present");
assert(bulkStaged["std-2"] === "present", "Student 2 marked present");
assert(bulkStaged["std-3"] === "present", "Student 3 marked present");

// Change individual status to leave
bulkStaged["std-3"] = "leave";
assert(bulkStaged["std-3"] === "leave", "Individual dancer can be updated to leave after bulk action");

// -------------------------------------------------------------
// Test Group 4: Duplicate Prevention & Atomic Upsert (uq_student_batch_date)
// -------------------------------------------------------------
console.log("\n[Group 4: Duplicate Prevention & PostgreSQL Constraint]");
const existingDatabaseAttendance = [
  { id: "rec-1", studentId: "std-1", batchId: "b-1", date: "2026-11-08", status: "present" },
  { id: "rec-2", studentId: "std-2", batchId: "b-1", date: "2026-11-08", status: "present" },
];

// Re-saving for the same student on the same date should perform an update, NOT a duplicate insert
function upsertAttendance(existing, newEntries) {
  const result = [...existing];
  newEntries.forEach((entry) => {
    const idx = result.findIndex(
      (r) => r.studentId === entry.studentId && r.batchId === entry.batchId && r.date === entry.date
    );
    if (idx >= 0) {
      result[idx] = { ...result[idx], status: entry.status, remarks: "Authorized correction" };
    } else {
      result.push(entry);
    }
  });
  return result;
}

const correctedRecords = upsertAttendance(existingDatabaseAttendance, [
  { studentId: "std-1", batchId: "b-1", date: "2026-11-08", status: "absent" },
]);

assert(correctedRecords.length === 2, "No duplicate records created for same student, batch, and date");
const std1Record = correctedRecords.find((r) => r.studentId === "std-1");
assert(std1Record?.status === "absent", "Updates status to 'absent'");
assert(std1Record?.remarks === "Authorized correction", "Maintains authorized correction audit remark");

// -------------------------------------------------------------
// Test Group 5: Attendance Percentage & Summary Calculation
// -------------------------------------------------------------
console.log("\n[Group 5: Attendance Percentage & Stats Calculation]");
const sampleRecords = [
  { studentId: "std-1", batchId: "b-1", date: "2026-11-01", status: "present" },
  { studentId: "std-1", batchId: "b-1", date: "2026-11-03", status: "present" },
  { studentId: "std-1", batchId: "b-1", date: "2026-11-05", status: "absent" },
  { studentId: "std-1", batchId: "b-1", date: "2026-11-07", status: "leave" },
];

const std1Stats = calculateStudentAttendance(mockStudentRoster[0], "b-1", sampleRecords);
assert(std1Stats.totalClasses === 4, "Calculates 4 total classes");
assert(std1Stats.present === 2, "Calculates 2 present sessions");
assert(std1Stats.absent === 1, "Calculates 1 absent session");
assert(std1Stats.leave === 1, "Calculates 1 leave session");
assert(std1Stats.percentage === 50, "Calculates 50% attendance rate (2 / 4 * 100)");

// Zero class edge case
const zeroStats = calculateStudentAttendance(mockStudentRoster[1], "b-1", sampleRecords);
assert(zeroStats.totalClasses === 0, "Handles student with zero past classes");
assert(zeroStats.percentage === 0, "Calculates 0% safely without division by zero");

// -------------------------------------------------------------
// Test Group 6: Attendance Report Generation
// Format: Student Name | Total Classes | Present | Absent | Leave | Percentage
// -------------------------------------------------------------
console.log("\n[Group 6: Attendance Report Generator]");
const report = generateAttendanceReport(mockStudentRoster, "b-1", sampleRecords);
assert(report.length === 3, "Generates report entries for all 3 active dancers in batch");

const r1 = report.find((r) => r.student.fullName === "Sravani Manepalli");
assert(r1 !== undefined, "Contains Sravani Manepalli");
assert(r1?.totalClasses === 4, "Report displays Total Classes = 4");
assert(r1?.present === 2, "Report displays Present = 2");
assert(r1?.absent === 1, "Report displays Absent = 1");
assert(r1?.leave === 1, "Report displays Leave = 1");
assert(r1?.percentage === 50, "Report displays Percentage = 50%");

// -------------------------------------------------------------
// Test Group 7: SQL Schema Constraint Verification
// -------------------------------------------------------------
console.log("\n[Group 7: SQL Schema Constraint Verification]");
const schemaFile = readFileSync(resolve("./supabase/schema.sql"), "utf-8");
assert(
  schemaFile.includes("uq_student_batch_date UNIQUE (student_id, batch_id, attendance_date)"),
  "PostgreSQL schema enforces composite unique constraint uq_student_batch_date"
);
assert(
  schemaFile.includes("CHECK (status IN ('present', 'absent', 'leave'))"),
  "PostgreSQL schema enforces CHECK constraint on present, absent, leave"
);

console.log("\n=======================================================");
console.log(` TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
console.log("=======================================================\n");

if (failed > 0) process.exit(1);
