// ==============================================================================
// ABHINAYA NARTAN ACADEMY MANAGER - CLASS MANAGEMENT SERVICE
// Direct Supabase Integration with Class Scheduling & Duplicate Prevention
// ==============================================================================

import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabaseClient";
import { DanceClass, ClassInput, ClassServiceResult, ClassStatus } from "@/lib/types/academy";
import { AcademyDataStore } from "@/lib/academyStore";
import { formatTimeTo24H, formatTimeTo12H } from "@/lib/services/batchService";

export function mapDatabaseRowToClass(row: any): DanceClass {
  const start12 = formatTimeTo12H(row.start_time || "17:00:00");
  const end12 = formatTimeTo12H(row.end_time || "18:30:00");

  return {
    id: row.id,
    className: row.class_name || "Classical Dance Session",
    branchId: row.branch_id,
    branchName: row.branch?.branch_name || undefined,
    batchId: row.batch_id,
    batchName: row.batch?.batch_name || undefined,
    teacherId: row.teacher_id || undefined,
    teacherName: row.teacher?.full_name || undefined,
    classDate: row.class_date,
    startTime: start12,
    endTime: end12,
    status: (row.status as ClassStatus) || "scheduled",
    notes: row.notes || "",
    createdAt: row.created_at,
  };
}

export function findDuplicateClass(
  existingClasses: DanceClass[],
  batchId: string,
  classDate: string,
  startTime: string,
  excludeId?: string
): DanceClass | null {
  const normTime = formatTimeTo24H(startTime);

  return (
    existingClasses.find((c) => {
      if (excludeId && c.id === excludeId) return false;
      return (
        c.batchId === batchId &&
        c.classDate === classDate &&
        formatTimeTo24H(c.startTime) === normTime &&
        c.status !== "cancelled"
      );
    }) || null
  );
}

export async function getClassesFromDatabase(): Promise<DanceClass[]> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("classes")
          .select(`
            *,
            branch:branches(id, branch_name),
            batch:batches(id, batch_name),
            teacher:profiles!classes_teacher_id_fkey(id, full_name)
          `)
          .order("class_date", { ascending: true })
          .order("start_time", { ascending: true });

        if (!error && data) {
          const mapped = data.map(mapDatabaseRowToClass);
          AcademyDataStore.saveClasses(mapped);
          return mapped;
        } else if (error) {
          console.warn("Supabase classes fetch warning, using local store:", error.message);
        }
      } catch (err) {
        console.error("Error communicating with Supabase classes:", err);
      }
    }
  }

  // Fallback to local store
  return AcademyDataStore.getClasses();
}

export async function createClass(
  input: ClassInput,
  existingClasses: DanceClass[]
): Promise<ClassServiceResult> {
  // 1. Validation
  if (!input.className.trim()) {
    return { success: false, error: "Class title / session name is required." };
  }
  if (!input.branchId) {
    return { success: false, error: "Please select an academy branch." };
  }
  if (!input.batchId) {
    return { success: false, error: "Please assign a dance batch." };
  }
  if (!input.classDate) {
    return { success: false, error: "Please select a scheduled class date." };
  }

  const startTime24 = formatTimeTo24H(input.startTime);
  const endTime24 = formatTimeTo24H(input.endTime);

  if (startTime24 >= endTime24) {
    return { success: false, error: "Class end time must be later than start time." };
  }

  // 2. Prevent accidental duplicate scheduling
  const duplicate = findDuplicateClass(
    existingClasses,
    input.batchId,
    input.classDate,
    input.startTime
  );
  if (duplicate) {
    return {
      success: false,
      isDuplicate: true,
      class: duplicate,
      error: `A class ("${duplicate.className}") is already scheduled for this batch on ${input.classDate} at ${duplicate.startTime}.`,
    };
  }

  let newClass: DanceClass;

  // 3. Save to Supabase
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const payload = {
          class_name: input.className.trim(),
          branch_id: input.branchId,
          batch_id: input.batchId,
          teacher_id: input.teacherId || null,
          class_date: input.classDate,
          start_time: startTime24,
          end_time: endTime24,
          status: input.status || "scheduled",
          notes: input.notes?.trim() || null,
        };

        const { data, error } = await supabase
          .from("classes")
          .insert(payload)
          .select(`
            *,
            branch:branches(id, branch_name),
            batch:batches(id, batch_name),
            teacher:profiles!classes_teacher_id_fkey(id, full_name)
          `)
          .single();

        if (error) {
          console.error("Failed to insert class into Supabase:", error);
          return { success: false, error: `Database error: ${error.message}` };
        }

        if (data) {
          newClass = mapDatabaseRowToClass(data);
          const updated = [...existingClasses, newClass];
          AcademyDataStore.saveClasses(updated);
          return { success: true, class: newClass };
        }
      } catch (err: any) {
        console.error("Network exception inserting class:", err);
        return { success: false, error: err?.message || "Network exception communicating with Supabase." };
      }
    }
  }

  // 4. Local / Offline Fallback
  newClass = {
    id: `cls-${Date.now()}`,
    className: input.className.trim(),
    branchId: input.branchId,
    batchId: input.batchId,
    teacherId: input.teacherId,
    teacherName: input.teacherName,
    classDate: input.classDate,
    startTime: formatTimeTo12H(startTime24),
    endTime: formatTimeTo12H(endTime24),
    status: input.status || "scheduled",
    notes: input.notes?.trim() || "",
    createdAt: new Date().toISOString(),
  };

  const updated = [...existingClasses, newClass];
  AcademyDataStore.saveClasses(updated);
  return { success: true, class: newClass };
}

export async function updateClass(
  classId: string,
  updates: Partial<ClassInput>,
  existingClasses: DanceClass[]
): Promise<ClassServiceResult> {
  const current = existingClasses.find((c) => c.id === classId);
  if (!current) {
    return { success: false, error: "Class session not found." };
  }

  const startTime24 = updates.startTime ? formatTimeTo24H(updates.startTime) : formatTimeTo24H(current.startTime);
  const endTime24 = updates.endTime ? formatTimeTo24H(updates.endTime) : formatTimeTo24H(current.endTime);

  if (startTime24 >= endTime24) {
    return { success: false, error: "Class end time must be later than start time." };
  }

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const payload: any = {};
        if (updates.className !== undefined) payload.class_name = updates.className.trim();
        if (updates.branchId !== undefined) payload.branch_id = updates.branchId;
        if (updates.batchId !== undefined) payload.batch_id = updates.batchId;
        if (updates.teacherId !== undefined) payload.teacher_id = updates.teacherId || null;
        if (updates.classDate !== undefined) payload.class_date = updates.classDate;
        if (updates.startTime !== undefined) payload.start_time = startTime24;
        if (updates.endTime !== undefined) payload.end_time = endTime24;
        if (updates.status !== undefined) payload.status = updates.status;
        if (updates.notes !== undefined) payload.notes = updates.notes?.trim() || null;

        const { data, error } = await supabase
          .from("classes")
          .update(payload)
          .eq("id", classId)
          .select(`
            *,
            branch:branches(id, branch_name),
            batch:batches(id, batch_name),
            teacher:profiles!classes_teacher_id_fkey(id, full_name)
          `)
          .single();

        if (error) {
          console.error("Failed to update class in Supabase:", error);
          return { success: false, error: `Database error: ${error.message}` };
        }

        if (data) {
          const updatedClass = mapDatabaseRowToClass(data);
          const updatedList = existingClasses.map((c) => (c.id === classId ? updatedClass : c));
          AcademyDataStore.saveClasses(updatedList);
          return { success: true, class: updatedClass };
        }
      } catch (err: any) {
        console.error("Network exception updating class:", err);
      }
    }
  }

  const updatedClass: DanceClass = {
    ...current,
    className: updates.className !== undefined ? updates.className.trim() : current.className,
    branchId: updates.branchId !== undefined ? updates.branchId : current.branchId,
    batchId: updates.batchId !== undefined ? updates.batchId : current.batchId,
    teacherId: updates.teacherId !== undefined ? updates.teacherId : current.teacherId,
    teacherName: updates.teacherName !== undefined ? updates.teacherName : current.teacherName,
    classDate: updates.classDate !== undefined ? updates.classDate : current.classDate,
    startTime: formatTimeTo12H(startTime24),
    endTime: formatTimeTo12H(endTime24),
    status: updates.status !== undefined ? updates.status : current.status,
    notes: updates.notes !== undefined ? updates.notes.trim() : current.notes,
  };

  const updatedList = existingClasses.map((c) => (c.id === classId ? updatedClass : c));
  AcademyDataStore.saveClasses(updatedList);
  return { success: true, class: updatedClass };
}

export async function deleteClass(
  classId: string,
  existingClasses: DanceClass[]
): Promise<{ success: boolean; error?: string }> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { error } = await supabase
          .from("classes")
          .delete()
          .eq("id", classId);

        if (error) {
          return { success: false, error: `Database error: ${error.message}` };
        }
      } catch (err: any) {
        return { success: false, error: err?.message || "Failed to delete class." };
      }
    }
  }

  const updated = existingClasses.filter((c) => c.id !== classId);
  AcademyDataStore.saveClasses(updated);
  return { success: true };
}
