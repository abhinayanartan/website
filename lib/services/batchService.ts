// ==============================================================================
// ABHINAYA NARTAN ACADEMY MANAGER - BATCH MANAGEMENT SERVICE
// Direct Supabase Integration with Batch CRUD, Student Transfers & Sync
// ==============================================================================

import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabaseClient";
import { Batch, Student } from "@/lib/types/academy";
import { AcademyDataStore } from "@/lib/academyStore";

export interface BatchInput {
  name: string;
  branchId: string;
  teacherName: string;
  teacherId?: string;
  level?: "Beginner" | "Intermediate" | "Advanced";
  scheduleDays: string[];
  startTime: string; // e.g. "05:00 PM" or "17:00"
  endTime: string;   // e.g. "06:30 PM" or "18:30"
  maxCapacity?: number;
  monthlyFee?: number;
  status?: "active" | "inactive";
}

export interface BatchServiceResult {
  success: boolean;
  batch?: Batch;
  error?: string;
}

// Convert 12h format ("05:00 PM") to 24h format for Postgres TIME ("17:00:00")
export function formatTimeTo24H(timeStr: string): string {
  if (!timeStr) return "17:00:00";
  const clean = timeStr.trim().toUpperCase();

  // If already in 24h format HH:MM or HH:MM:SS
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

// Convert 24h format ("17:00:00") to human 12h format ("05:00 PM")
export function formatTimeTo12H(timeStr: string): string {
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

// Map Supabase Database row to Batch model
export function mapDatabaseRowToBatch(row: any): Batch {
  const name = row.batch_name || row.name || "Classical Batch";
  const days = Array.isArray(row.class_days) ? row.class_days : row.schedule_days || ["Mon", "Wed", "Fri"];
  const start12 = formatTimeTo12H(row.start_time || "17:00:00");
  const end12 = formatTimeTo12H(row.end_time || "18:30:00");
  const status = row.status || (row.is_active ? "active" : "inactive");
  const teacherName = row.teacher?.full_name || row.teacher_name || (name.includes("Tarangam") ? "Guru Sri Krishna" : "Guru Smt. Radhika");

  return {
    id: row.id,
    branchId: row.branch_id || "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    name,
    level: (row.level as Batch["level"]) || (name.includes("Beginner") ? "Beginner" : name.includes("Master") ? "Intermediate" : "Advanced"),
    scheduleDays: days,
    startTime: start12,
    endTime: end12,
    teacherName,
    teacherId: row.teacher_id || row.teacher?.id,
    maxCapacity: Number(row.max_capacity) || 20,
    monthlyFee: Number(row.monthly_fee) || (name.includes("Tarangam") ? 2200 : name.includes("Master") ? 1800 : 1500),
    isActive: status === "active",
    status: status as "active" | "inactive",
  };
}

/**
 * Fetch all batches from Supabase (falling back to synchronized store)
 */
export async function getBatchesFromDatabase(): Promise<Batch[]> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("batches")
          .select(`
            *,
            teacher:profiles!batches_teacher_id_fkey(id, full_name)
          `)
          .order("created_at", { ascending: true });

        if (!error && data && data.length > 0) {
          const mapped = data.map(mapDatabaseRowToBatch);
          AcademyDataStore.saveBatches(mapped);
          return mapped;
        } else if (error) {
          console.warn("Supabase batches fetch warning, using local store:", error.message);
        }
      } catch (err) {
        console.error("Error communicating with Supabase batches:", err);
      }
    }
  }

  // Local fallback
  return AcademyDataStore.getBatches();
}

/**
 * Create a New Batch in Supabase
 */
export async function createBatch(
  input: BatchInput,
  existingBatches: Batch[]
): Promise<BatchServiceResult> {
  if (!input.name.trim()) {
    return { success: false, error: "Batch title is required." };
  }
  if (!input.branchId) {
    return { success: false, error: "Please select a studio branch." };
  }
  if (!input.scheduleDays || input.scheduleDays.length === 0) {
    return { success: false, error: "Please select at least one class day." };
  }

  const startTime24 = formatTimeTo24H(input.startTime);
  const endTime24 = formatTimeTo24H(input.endTime);

  // Validate start < end
  if (startTime24 >= endTime24) {
    return { success: false, error: "Class ending time must be later than the starting time." };
  }

  // Prevent duplicate batch names within the same branch
  const duplicate = existingBatches.find(
    (b) =>
      b.branchId === input.branchId &&
      b.name.trim().toLowerCase() === input.name.trim().toLowerCase()
  );
  if (duplicate) {
    return {
      success: false,
      error: `A batch named "${input.name.trim()}" already exists in this studio branch.`,
    };
  }

  let newBatch: Batch;

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("batches")
          .insert({
            batch_name: input.name.trim(),
            branch_id: input.branchId,
            teacher_id: input.teacherId || null,
            class_days: input.scheduleDays,
            start_time: startTime24,
            end_time: endTime24,
            status: input.status || "active",
          })
          .select(`
            *,
            teacher:profiles!batches_teacher_id_fkey(id, full_name)
          `)
          .single();

        if (error) {
          console.error("Failed to insert batch into Supabase:", error);
          return { success: false, error: `Database error: ${error.message}` };
        }

        if (data) {
          newBatch = mapDatabaseRowToBatch({
            ...data,
            level: input.level || "Beginner",
            monthly_fee: input.monthlyFee || 1500,
            max_capacity: input.maxCapacity || 20,
            teacher_name: input.teacherName || data.teacher?.full_name || "Guru Smt. Radhika",
          });
          const updated = [...existingBatches, newBatch];
          AcademyDataStore.saveBatches(updated);
          return { success: true, batch: newBatch };
        }
      } catch (err: any) {
        console.error("Network exception inserting batch:", err);
        return { success: false, error: err?.message || "Network error connecting to database." };
      }
    }
  }

  // Local / Demo Mode Fallback
  newBatch = {
    id: `batch-${Date.now()}`,
    branchId: input.branchId,
    name: input.name.trim(),
    level: input.level || "Beginner",
    scheduleDays: input.scheduleDays,
    startTime: formatTimeTo12H(startTime24),
    endTime: formatTimeTo12H(endTime24),
    teacherName: input.teacherName.trim() || "Guru Smt. Radhika",
    teacherId: input.teacherId,
    maxCapacity: input.maxCapacity || 20,
    monthlyFee: input.monthlyFee || 1500,
    isActive: (input.status || "active") === "active",
    status: input.status || "active",
  };

  const updated = [...existingBatches, newBatch];
  AcademyDataStore.saveBatches(updated);
  return { success: true, batch: newBatch };
}

/**
 * Update Batch Details in Supabase
 */
export async function updateBatch(
  batchId: string,
  updates: Partial<BatchInput>,
  existingBatches: Batch[]
): Promise<BatchServiceResult> {
  const current = existingBatches.find((b) => b.id === batchId);
  if (!current) {
    return { success: false, error: "Batch not found." };
  }

  const startTime24 = updates.startTime ? formatTimeTo24H(updates.startTime) : formatTimeTo24H(current.startTime);
  const endTime24 = updates.endTime ? formatTimeTo24H(updates.endTime) : formatTimeTo24H(current.endTime);

  if (startTime24 >= endTime24) {
    return { success: false, error: "Class ending time must be later than the starting time." };
  }

  const updatedBatch: Batch = {
    ...current,
    name: updates.name !== undefined ? updates.name.trim() : current.name,
    branchId: updates.branchId !== undefined ? updates.branchId : current.branchId,
    teacherName: updates.teacherName !== undefined ? updates.teacherName.trim() : current.teacherName,
    teacherId: updates.teacherId !== undefined ? updates.teacherId : current.teacherId,
    level: updates.level !== undefined ? updates.level : current.level,
    scheduleDays: updates.scheduleDays !== undefined ? updates.scheduleDays : current.scheduleDays,
    startTime: formatTimeTo12H(startTime24),
    endTime: formatTimeTo12H(endTime24),
    maxCapacity: updates.maxCapacity !== undefined ? updates.maxCapacity : current.maxCapacity,
    monthlyFee: updates.monthlyFee !== undefined ? updates.monthlyFee : current.monthlyFee,
    status: updates.status !== undefined ? updates.status : current.status,
    isActive: updates.status !== undefined ? updates.status === "active" : current.isActive,
  };

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const payload: any = {};
        if (updates.name !== undefined) payload.batch_name = updates.name.trim();
        if (updates.branchId !== undefined) payload.branch_id = updates.branchId;
        if (updates.teacherId !== undefined) payload.teacher_id = updates.teacherId;
        if (updates.scheduleDays !== undefined) payload.class_days = updates.scheduleDays;
        payload.start_time = startTime24;
        payload.end_time = endTime24;
        if (updates.status !== undefined) payload.status = updates.status;

        const { error } = await supabase
          .from("batches")
          .update(payload)
          .eq("id", batchId);

        if (error) {
          console.error("Failed to update batch in Supabase:", error);
          return { success: false, error: `Database error: ${error.message}` };
        }
      } catch (err: any) {
        console.error("Exception updating batch in Supabase:", err);
      }
    }
  }

  const updatedList = existingBatches.map((b) => (b.id === batchId ? updatedBatch : b));
  AcademyDataStore.saveBatches(updatedList);
  return { success: true, batch: updatedBatch };
}

/**
 * Toggle Batch Active / Inactive Status
 */
export async function toggleBatchStatus(
  batchId: string,
  existingBatches: Batch[]
): Promise<BatchServiceResult> {
  const current = existingBatches.find((b) => b.id === batchId);
  if (!current) {
    return { success: false, error: "Batch not found." };
  }

  const newStatus = current.status === "active" || current.isActive ? "inactive" : "active";
  return await updateBatch(batchId, { status: newStatus }, existingBatches);
}

/**
 * Transfer a Student Between Batches
 * Requirement: "Ensure batch transfers do not erase previous attendance or payment history."
 * Modifies student's batch_id in public.students while preserving all historical attendance and payments.
 */
export async function transferStudentBatch(
  studentId: string,
  targetBatchId: string,
  existingStudents: Student[]
): Promise<{ success: boolean; student?: Student; error?: string }> {
  const currentStudent = existingStudents.find((s) => s.id === studentId);
  if (!currentStudent) {
    return { success: false, error: "Student not found." };
  }

  if (currentStudent.batchId === targetBatchId) {
    return { success: false, error: "Student is already enrolled in this batch." };
  }

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { error } = await supabase
          .from("students")
          .update({ batch_id: targetBatchId })
          .eq("id", studentId);

        if (error) {
          console.error("Failed to transfer student in Supabase:", error);
          return { success: false, error: `Database error: ${error.message}` };
        }
      } catch (err: any) {
        console.error("Exception transferring student:", err);
      }
    }
  }

  const updatedStudent: Student = {
    ...currentStudent,
    batchId: targetBatchId,
  };

  const updatedList = existingStudents.map((s) => (s.id === studentId ? updatedStudent : s));
  AcademyDataStore.saveStudents(updatedList);
  return { success: true, student: updatedStudent };
}
