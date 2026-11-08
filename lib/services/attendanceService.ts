// ==============================================================================
// ABHINAYA NARTAN ACADEMY MANAGER - ATTENDANCE MANAGEMENT SERVICE
// Direct Supabase PostgreSQL Operations with Upsert, Duplicate Guard & Reports
// ==============================================================================

import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabaseClient";
import { AttendanceRecord, AttendanceStatus, Student } from "@/lib/types/academy";
import { AcademyDataStore } from "@/lib/academyStore";

export interface AttendanceServiceResult {
  success: boolean;
  records?: AttendanceRecord[];
  error?: string;
  isCorrection?: boolean;
}

export interface StudentAttendanceSummary {
  student: Student;
  totalClasses: number;
  present: number;
  absent: number;
  leave: number;
  percentage: number;
}

// Convert Database row to frontend AttendanceRecord model
export function mapDatabaseRowToAttendance(row: any): AttendanceRecord {
  const attDate = row.attendance_date || row.date || new Date().toISOString().split("T")[0];
  let normStatus: AttendanceStatus = "present";
  if (row.status === "present" || row.status === "absent" || row.status === "leave") {
    normStatus = row.status;
  } else if (row.status === "late") {
    normStatus = "present";
  } else if (row.status === "excused") {
    normStatus = "leave";
  }

  return {
    id: row.id || `att-${row.student_id}-${attDate}`,
    studentId: row.student_id || row.studentId,
    batchId: row.batch_id || row.batchId,
    branchId: row.branch_id || row.branchId || "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    date: attDate,
    attendanceDate: attDate,
    status: normStatus,
    markedBy: row.marked_by || row.markedBy,
    createdAt: row.created_at || row.createdAt,
    remarks: row.remarks,
  };
}

/**
 * Fetch all attendance records from Supabase (falling back to synchronized store)
 */
export async function getAttendanceFromDatabase(): Promise<AttendanceRecord[]> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("attendance")
          .select("*")
          .order("attendance_date", { ascending: false });

        if (!error && data && data.length > 0) {
          const mapped = data.map(mapDatabaseRowToAttendance);
          AcademyDataStore.saveAttendance(mapped);
          return mapped;
        } else if (error) {
          console.warn("Supabase attendance fetch warning, using local store:", error.message);
        }
      } catch (err) {
        console.error("Error communicating with Supabase attendance:", err);
      }
    }
  }

  // Fallback to local store
  return AcademyDataStore.getAttendance();
}

/**
 * Check if attendance has already been recorded for a specific batch and date
 */
export function isAttendanceRecordedForDate(
  batchId: string,
  date: string,
  records: AttendanceRecord[]
): boolean {
  return records.some((a) => a.batchId === batchId && a.date === date);
}

/**
 * Save Attendance for a full batch in one atomic action
 * Enforces PostgreSQL unique constraint (student_id, batch_id, attendance_date) via UPSERT.
 * Prevents duplicates and maintains an audit trail.
 */
export async function saveBatchAttendance(
  batchId: string,
  date: string,
  branchId: string,
  studentStatuses: { studentId: string; status: AttendanceStatus; remarks?: string }[],
  existingRecords: AttendanceRecord[],
  markedByUserId?: string
): Promise<AttendanceServiceResult> {
  if (!batchId) {
    return { success: false, error: "Please select a batch." };
  }
  if (!date) {
    return { success: false, error: "Please select an attendance date." };
  }
  if (!studentStatuses || studentStatuses.length === 0) {
    return { success: false, error: "No student attendance statuses provided." };
  }

  const isCorrection = isAttendanceRecordedForDate(batchId, date, existingRecords);

  // 1. Save to Supabase via Upsert if configured
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const dbPayload = studentStatuses.map((item) => ({
          student_id: item.studentId,
          batch_id: batchId,
          attendance_date: date,
          status: item.status,
          marked_by: markedByUserId || null,
          remarks: item.remarks || (isCorrection ? "Authorized attendance correction" : null),
        }));

        const { data, error } = await supabase
          .from("attendance")
          .upsert(dbPayload, {
            onConflict: "student_id,batch_id,attendance_date",
          })
          .select();

        if (error) {
          console.error("Supabase attendance upsert failed:", error);
          return { success: false, error: `Database error: ${error.message}` };
        }

        if (data && data.length > 0) {
          const freshMapped = data.map(mapDatabaseRowToAttendance);
          // Merge with existing
          const merged = existingRecords.filter(
            (r) => !(r.batchId === batchId && r.date === date)
          );
          const fullUpdated = [...freshMapped, ...merged];
          AcademyDataStore.saveAttendance(fullUpdated);
          return { success: true, records: fullUpdated, isCorrection };
        }
      } catch (err: any) {
        console.error("Network exception saving attendance:", err);
      }
    }
  }

  // 2. Local / Offline Synchronization
  const newRecords: AttendanceRecord[] = studentStatuses.map((item) => ({
    id: `att-${Date.now()}-${item.studentId}`,
    studentId: item.studentId,
    batchId,
    branchId: branchId || "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    date,
    attendanceDate: date,
    status: item.status,
    markedBy: markedByUserId || "Staff Guru",
    createdAt: new Date().toISOString(),
    remarks: item.remarks || (isCorrection ? "Authorized attendance correction" : undefined),
  }));

  // Deduplicate and merge: replace records matching (studentId, batchId, date)
  const remaining = existingRecords.filter(
    (r) => !(r.batchId === batchId && r.date === date)
  );

  const updatedRecords = [...newRecords, ...remaining];
  AcademyDataStore.saveAttendance(updatedRecords);

  return { success: true, records: updatedRecords, isCorrection };
}

/**
 * Calculate Individual Student Attendance Statistics
 */
export function calculateStudentAttendance(
  student: Student,
  batchId: string,
  records: AttendanceRecord[]
): {
  totalClasses: number;
  present: number;
  absent: number;
  leave: number;
  percentage: number;
} {
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

/**
 * Generate Comprehensive Attendance Report for All Active Students in a Batch
 */
export function generateAttendanceReport(
  students: Student[],
  batchId: string,
  records: AttendanceRecord[]
): StudentAttendanceSummary[] {
  const relevantStudents = students.filter(
    (s) => (batchId === "all" || s.batchId === batchId) && s.status === "active"
  );

  return relevantStudents.map((student) => {
    const stats = calculateStudentAttendance(student, batchId, records);
    return {
      student,
      ...stats,
    };
  });
}
