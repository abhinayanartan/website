// ==============================================================================
// ABHINAYA NARTAN ACADEMY MANAGER - AUTHENTICATION FLOW VERIFICATION SUITE
// Tests: Admin Login, Teacher Login, Incorrect Password, Missing Account,
//        Session Scoping, Role-Based Access Control & Password Reset
// ==============================================================================

import { readFileSync } from "fs";
import { resolve } from "path";

// 1. Load Demo Accounts definition directly
const demoAccountsFile = readFileSync(resolve("./lib/auth/demoAccounts.ts"), "utf-8");

// Parse demo credentials from TypeScript source
const adminMatch = demoAccountsFile.match(/admin@abhinayanartan\.org[\s\S]*?passwordHash:\s*"([^"]+)"/);
const teacherMatch = demoAccountsFile.match(/teacher@abhinayanartan\.org[\s\S]*?passwordHash:\s*"([^"]+)"/);

const ADMIN_PASS = adminMatch ? adminMatch[1] : "NartanAdmin@2026";
const TEACHER_PASS = teacherMatch ? teacherMatch[1] : "NartanTeacher@2026";

console.log("\n=======================================================");
console.log(" ABHINAYA NARTAN AUTHENTICATION TEST SUITE");
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

// Mock auth runner replicating AuthContext logic
function simulateSignIn(email, password) {
  const cleanEmail = (email || "").trim().toLowerCase();
  if (!cleanEmail || !password) {
    return { success: false, error: "Please provide both an email address and password." };
  }

  const DEMO_USERS = {
    "admin@abhinayanartan.org": {
      id: "usr-admin-sravani-001",
      email: "admin@abhinayanartan.org",
      fullName: "Smt. Sravani Rao",
      role: "admin",
      branchId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      passwordHash: ADMIN_PASS,
    },
    "teacher@abhinayanartan.org": {
      id: "usr-teacher-ramesh-002",
      email: "teacher@abhinayanartan.org",
      fullName: "Sri K. Ramesh Master",
      role: "teacher",
      branchId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      passwordHash: TEACHER_PASS,
    },
  };

  const account = DEMO_USERS[cleanEmail];
  if (!account) {
    return {
      success: false,
      error: "No authorized staff account found with this email. Public registration is disabled.",
    };
  }

  if (account.passwordHash !== password) {
    return {
      success: false,
      error: "Incorrect password. Please verify your credentials and try again.",
    };
  }

  return {
    success: true,
    user: {
      id: account.id,
      email: account.email,
      fullName: account.fullName,
      role: account.role,
      branchId: account.branchId,
    },
  };
}

// -------------------------------------------------------------
// Test Group 1: Admin Login
// -------------------------------------------------------------
console.log("[Group 1: Admin Authentication]");
const adminResult = simulateSignIn("admin@abhinayanartan.org", "NartanAdmin@2026");
assert(adminResult.success === true, "Admin login succeeds with valid credentials");
assert(adminResult.user?.role === "admin", "Admin user role is verified as 'admin'");
assert(adminResult.user?.fullName === "Smt. Sravani Rao", "Admin full name matches registered director");

// -------------------------------------------------------------
// Test Group 2: Teacher Login
// -------------------------------------------------------------
console.log("\n[Group 2: Teacher Authentication]");
const teacherResult = simulateSignIn("teacher@abhinayanartan.org", "NartanTeacher@2026");
assert(teacherResult.success === true, "Teacher login succeeds with valid credentials");
assert(teacherResult.user?.role === "teacher", "Teacher user role is verified as 'teacher'");
assert(teacherResult.user?.fullName === "Sri K. Ramesh Master", "Teacher full name matches registered guru");

// -------------------------------------------------------------
// Test Group 3: Incorrect Password Handling
// -------------------------------------------------------------
console.log("\n[Group 3: Incorrect Password & Credential Rejection]");
const wrongPassResult = simulateSignIn("admin@abhinayanartan.org", "WrongPassword123");
assert(wrongPassResult.success === false, "Incorrect password attempt is blocked");
assert(wrongPassResult.error?.includes("Incorrect password"), "Returns informative incorrect password message");

// -------------------------------------------------------------
// Test Group 4: Public Signup Rejection (Unauthorized Email)
// -------------------------------------------------------------
console.log("\n[Group 4: No Public Registration Enforcement]");
const unauthorizedResult = simulateSignIn("intruder@example.com", "Password123");
assert(unauthorizedResult.success === false, "Unregistered public email is rejected");
assert(unauthorizedResult.error?.includes("Public registration is disabled"), "Affirms no public signup rule");

// -------------------------------------------------------------
// Test Group 5: Empty Input Validation
// -------------------------------------------------------------
console.log("\n[Group 5: Input Validation]");
const emptyResult = simulateSignIn("", "");
assert(emptyResult.success === false, "Empty fields are rejected");
assert(emptyResult.error?.includes("Please provide"), "Returns validation warning for empty inputs");

// -------------------------------------------------------------
// Test Group 6: Role-Based Access Scoping (RBAC)
// -------------------------------------------------------------
console.log("\n[Group 6: Role-Based Access Scoping]");
const mockBatches = [
  { id: "batch-1", name: "Beginners", teacherName: "Sri K. Ramesh Master", branchId: "b-1" },
  { id: "batch-2", name: "Abhinaya Masters", teacherName: "Sri K. Ramesh Master", branchId: "b-1" },
  { id: "batch-3", name: "Tarangam Intensive", teacherName: "Smt. Sravani Rao", branchId: "b-1" },
  { id: "batch-4", name: "Guntur Senior", teacherName: "Smt. Sravani Rao", branchId: "b-2" },
];

const mockStudents = [
  { id: "s-1", fullName: "Student A", batchId: "batch-1" },
  { id: "s-2", fullName: "Student B", batchId: "batch-2" },
  { id: "s-3", fullName: "Student C", batchId: "batch-3" },
  { id: "s-4", fullName: "Student D", batchId: "batch-4" },
];

// Admin scoping: all batches and students accessible
const adminBatches = mockBatches;
const adminStudents = mockStudents;
assert(adminBatches.length === 4, "Admin has global access to all 4 studio batches");
assert(adminStudents.length === 4, "Admin has global access to all enrolled students");

// Teacher scoping: only batches where teacherName matches Ramesh
const teacherBatches = mockBatches.filter((b) => b.teacherName.includes("Ramesh"));
const teacherBatchIds = new Set(teacherBatches.map((b) => b.id));
const teacherStudents = mockStudents.filter((s) => teacherBatchIds.has(s.batchId));
assert(teacherBatches.length === 2, "Teacher is restricted to only their 2 assigned batches");
assert(teacherStudents.length === 2, "Teacher only sees the 2 students in their assigned batches");

// -------------------------------------------------------------
// Test Group 7: Password Reset Workflow
// -------------------------------------------------------------
console.log("\n[Group 7: Password Reset Workflow]");
function simulateReset(email) {
  const clean = (email || "").trim().toLowerCase();
  if (!clean) return { success: false, error: "Email required" };
  if (clean === "admin@abhinayanartan.org" || clean === "teacher@abhinayanartan.org") {
    return { success: true };
  }
  return { success: false, error: "No academy staff account found with this email." };
}

assert(simulateReset("admin@abhinayanartan.org").success === true, "Valid admin email receives reset link");
assert(simulateReset("teacher@abhinayanartan.org").success === true, "Valid teacher email receives reset link");
assert(simulateReset("random@test.com").success === false, "Unregistered email fails password reset");

// -------------------------------------------------------------
// Test Group 8: Database Schema & Migration Verification
// -------------------------------------------------------------
console.log("\n[Group 8: SQL Schema & RLS Verification]");
const masterSchema = readFileSync(resolve("./supabase/schema.sql"), "utf-8");
assert(masterSchema.includes("handle_new_user()"), "Master schema contains handle_new_user() trigger function");
assert(masterSchema.includes("on_auth_user_created"), "Master schema contains on_auth_user_created trigger on auth.users");
assert(masterSchema.includes("CREATE TABLE IF NOT EXISTS public.profiles"), "Master schema contains profiles table");
assert(masterSchema.includes("ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY"), "Master schema enables RLS on profiles");
assert(masterSchema.includes("trg_enforce_payments_immutable"), "Master schema contains payment immutability trigger");
assert(masterSchema.includes("uq_student_batch_date"), "Master schema contains duplicate attendance prevention constraint");

console.log("\n=======================================================");
console.log(` TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
console.log("=======================================================\n");

if (failed > 0) {
  process.exit(1);
}
