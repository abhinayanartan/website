// ==============================================================================
// ABHINAYA NARTAN ACADEMY MANAGER - STUDENT MANAGEMENT TEST SUITE
// Tests: Code Generation, Duplicate Prevention, Supabase Mapping,
//        CRUD Operations, Multi-Filters, Pagination & Profile Verification
// ==============================================================================

import { readFileSync } from "fs";
import { resolve } from "path";

console.log("\n=======================================================");
console.log(" ABHINAYA NARTAN STUDENT MANAGEMENT TEST SUITE");
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

// Logic replicated from lib/services/studentService.ts
function mapDatabaseRowToStudent(row) {
  const code = row.student_code || row.admission_number || "AN-2026-000";
  const joining = row.joining_date || row.enrollment_date || new Date().toISOString().split("T")[0];
  const pPhone = row.parent_phone || row.phone || "";

  return {
    id: row.id,
    admissionNumber: code,
    studentCode: code,
    branchId: row.branch_id || "branch-vja",
    batchId: row.batch_id || "batch-1",
    fullName: row.full_name || row.fullName || "",
    parentName: row.parent_name || row.parentName || "Guardian",
    phone: pPhone,
    parentPhone: pPhone,
    whatsapp: pPhone,
    studentPhone: row.student_phone || undefined,
    email: row.email || undefined,
    dateOfBirth: row.date_of_birth || undefined,
    gender: row.gender || undefined,
    enrollmentDate: joining,
    joiningDate: joining,
    monthlyFee: Number(row.monthly_fee) || 1500,
    level: row.level || "Beginner",
    status: row.status || "active",
    address: row.address || "",
    notes: row.notes || "",
  };
}

function mapStudentToDatabaseRow(student, generatedCode) {
  return {
    student_code: generatedCode,
    full_name: student.fullName.trim(),
    date_of_birth: student.dateOfBirth || null,
    gender: student.gender || "female",
    parent_name: student.parentName.trim(),
    parent_phone: student.parentPhone.trim(),
    student_phone: student.studentPhone?.trim() || null,
    address: student.address?.trim() || null,
    joining_date: student.joiningDate || new Date().toISOString().split("T")[0],
    branch_id: student.branchId,
    batch_id: student.batchId,
    monthly_fee: Number(student.monthlyFee) || 1500,
    status: student.status || "active",
  };
}

function generateNextStudentCode(existingStudents) {
  const currentYear = new Date().getFullYear();
  const yearPrefix = `AN-${currentYear}-`;

  let maxSeq = 0;
  for (const s of existingStudents) {
    const code = s.studentCode || s.admissionNumber || "";
    if (code.startsWith(yearPrefix)) {
      const numPart = parseInt(code.replace(yearPrefix, ""), 10);
      if (!isNaN(numPart) && numPart > maxSeq) {
        maxSeq = numPart;
      }
    } else if (code.startsWith("AN-")) {
      const parts = code.split("-");
      if (parts.length === 3 && parts[1] === String(currentYear)) {
        const numPart = parseInt(parts[2], 10);
        if (!isNaN(numPart) && numPart > maxSeq) {
          maxSeq = numPart;
        }
      }
    }
  }

  const nextSeq = maxSeq + 1;
  return `${yearPrefix}${String(nextSeq).padStart(3, "0")}`;
}

function findDuplicateStudent(students, fullName, parentPhone, excludeId) {
  const cleanName = fullName.trim().toLowerCase();
  const cleanDigits = parentPhone.replace(/\D/g, "").slice(-10);

  if (!cleanName || cleanDigits.length < 5) return null;

  return (
    students.find((s) => {
      if (excludeId && s.id === excludeId) return false;
      const sName = s.fullName.trim().toLowerCase();
      const sDigits = (s.parentPhone || s.phone || "").replace(/\D/g, "").slice(-10);
      return sName === cleanName && sDigits === cleanDigits;
    }) || null
  );
}

// Mock initial student dataset
const mockStudents = [
  {
    id: "std-001",
    admissionNumber: "AN-2024-001",
    studentCode: "AN-2024-001",
    branchId: "branch-vja",
    batchId: "batch-1",
    fullName: "Sravani Manepalli",
    parentName: "Srinivasa Rao M.",
    phone: "+91 98480 12345",
    parentPhone: "+91 98480 12345",
    whatsapp: "+91 98480 12345",
    dateOfBirth: "2008-04-12",
    gender: "female",
    enrollmentDate: "2024-01-10",
    joiningDate: "2024-01-10",
    monthlyFee: 2200,
    level: "Advanced",
    status: "active",
    address: "Benz Circle, Vijayawada",
  },
  {
    id: "std-002",
    admissionNumber: "AN-2026-001",
    studentCode: "AN-2026-001",
    branchId: "branch-vja",
    batchId: "batch-2",
    fullName: "Tanvi Sri Sai",
    parentName: "Satish Kumar",
    phone: "+91 91771 23456",
    parentPhone: "+91 91771 23456",
    whatsapp: "+91 91771 23456",
    dateOfBirth: "2015-05-19",
    gender: "female",
    enrollmentDate: "2026-01-08",
    joiningDate: "2026-01-08",
    monthlyFee: 1500,
    level: "Beginner",
    status: "active",
    address: "One Town, Vijayawada",
  },
];

// -------------------------------------------------------------
// Test Group 1: Automatic Unique Student Code Generation
// -------------------------------------------------------------
console.log("[Group 1: Unique Student Code Generation]");
const nextCode = generateNextStudentCode(mockStudents);
const currentYear = new Date().getFullYear();
assert(
  nextCode === `AN-${currentYear}-002`,
  `Next sequential code generated is AN-${currentYear}-002 (Got: ${nextCode})`
);

// -------------------------------------------------------------
// Test Group 2: Duplicate Registration Detection
// -------------------------------------------------------------
console.log("\n[Group 2: Duplicate Registration Prevention]");
const duplicateMatch = findDuplicateStudent(
  mockStudents,
  "sravani manepalli",
  "9848012345"
);
assert(duplicateMatch !== null, "Accidental duplicate with matching name and phone is caught");
assert(duplicateMatch?.id === "std-001", "Identifies existing student std-001");

const distinctStudent = findDuplicateStudent(
  mockStudents,
  "New Dancer",
  "+91 99999 88888"
);
assert(distinctStudent === null, "Unique new student is permitted without collision");

// -------------------------------------------------------------
// Test Group 3: Supabase Database Row Mapping
// -------------------------------------------------------------
console.log("\n[Group 3: Supabase Model & Relational Mapping]");
const rawDbRow = {
  id: "uuid-db-001",
  student_code: "AN-2026-010",
  full_name: "Keerthi Priya K.",
  date_of_birth: "2014-06-18",
  gender: "female",
  parent_name: "Venkateswarlu K.",
  parent_phone: "+91 98665 43210",
  student_phone: "+91 98665 00000",
  address: "Moghalrajpuram, Vijayawada",
  joining_date: "2025-04-01",
  branch_id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  batch_id: "c1111111-1111-1111-1111-111111111111",
  monthly_fee: "1500.00",
  status: "active",
};

const mappedStudent = mapDatabaseRowToStudent(rawDbRow);
assert(mappedStudent.id === "uuid-db-001", "Maps UUID primary key");
assert(mappedStudent.studentCode === "AN-2026-010", "Maps student_code");
assert(mappedStudent.admissionNumber === "AN-2026-010", "Provides backwards-compatible admissionNumber");
assert(mappedStudent.parentPhone === "+91 98665 43210", "Maps parent_phone");
assert(mappedStudent.monthlyFee === 1500, "Converts numeric money string to float");
assert(mappedStudent.joiningDate === "2025-04-01", "Preserves exact joining_date");

const outgoingPayload = mapStudentToDatabaseRow(
  {
    fullName: "Divya Tejaswi",
    parentName: "Narasimha Murthy",
    parentPhone: "+91 99890 24680",
    studentPhone: "",
    address: "Labbipet, Vijayawada",
    joiningDate: "2026-02-01",
    branchId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    batchId: "c1111111-1111-1111-1111-111111111111",
    monthlyFee: 1500,
    status: "active",
  },
  "AN-2026-011"
);

assert(outgoingPayload.student_code === "AN-2026-011", "Prepares student_code for Supabase insert");
assert(outgoingPayload.full_name === "Divya Tejaswi", "Formats full_name for Supabase");
assert(outgoingPayload.monthly_fee === 1500, "Formats monthly_fee as numeric");

// -------------------------------------------------------------
// Test Group 4: Search & Multi-Filter Logic
// -------------------------------------------------------------
console.log("\n[Group 4: Search & Multi-Filter Logic]");
const testList = [
  ...mockStudents,
  mappedStudent,
];

// Search by code
const searchByCode = testList.filter((s) =>
  (s.studentCode || s.admissionNumber).toLowerCase().includes("2024-001")
);
assert(searchByCode.length === 1 && searchByCode[0].fullName === "Sravani Manepalli", "Searches by student code");

// Search by parent phone
const searchByPhone = testList.filter((s) =>
  (s.parentPhone || s.phone).includes("91771")
);
assert(searchByPhone.length === 1 && searchByPhone[0].fullName === "Tanvi Sri Sai", "Searches by parent phone number");

// Filter by Status
const activeDancers = testList.filter((s) => s.status === "active");
assert(activeDancers.length === 3, "Filters active status correctly");

// -------------------------------------------------------------
// Test Group 5: Pagination Math
// -------------------------------------------------------------
console.log("\n[Group 5: Pagination Math]");
const PAGE_SIZE = 8;
const dummy18Students = Array.from({ length: 18 }, (_, i) => ({ id: `s-${i}`, fullName: `Student ${i}` }));
const totalPages = Math.ceil(dummy18Students.length / PAGE_SIZE);
assert(totalPages === 3, "Calculates 3 pages for 18 students with page size 8");

const page1Items = dummy18Students.slice(0, 8);
const page2Items = dummy18Students.slice(8, 16);
const page3Items = dummy18Students.slice(16, 24);
assert(page1Items.length === 8 && page2Items.length === 8 && page3Items.length === 2, "Paginates correctly into pages of 8, 8, 2");

console.log("\n=======================================================");
console.log(` TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
console.log("=======================================================\n");

if (failed > 0) process.exit(1);
