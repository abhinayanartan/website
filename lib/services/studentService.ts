// ==============================================================================
// ABHINAYA NARTAN ACADEMY MANAGER - STUDENT MANAGEMENT SERVICE
// Direct Supabase Integration with Local Synchronization & Duplicate Prevention
// ==============================================================================

import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabaseClient";
import { Student } from "@/lib/types/academy";
import { AcademyDataStore } from "@/lib/academyStore";

export interface StudentInput {
  fullName: string;
  dateOfBirth?: string;
  gender?: "female" | "male" | "other";
  parentName: string;
  parentPhone: string;
  studentPhone?: string;
  address?: string;
  joiningDate?: string;
  branchId: string;
  batchId: string;
  monthlyFee: number;
  level?: "Beginner" | "Intermediate" | "Advanced";
  status?: "active" | "inactive" | "on_leave";
  notes?: string;
}

export interface StudentServiceResult {
  success: boolean;
  student?: Student;
  error?: string;
  isDuplicate?: boolean;
}

// Convert Supabase database row to frontend Student model
export function mapDatabaseRowToStudent(row: any): Student {
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
    level: (row.level as Student["level"]) || "Beginner",
    status: (row.status as Student["status"]) || "active",
    address: row.address || "",
    notes: row.notes || "",
  };
}

// Convert frontend model to Supabase insert payload
export function mapStudentToDatabaseRow(student: StudentInput, generatedCode: string): any {
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

/**
 * Generate Next Unique Student Code: Format AN-YYYY-XXX (e.g. AN-2026-009)
 */
export function generateNextStudentCode(existingStudents: Student[]): string {
  const currentYear = new Date().getFullYear();
  const yearPrefix = `AN-${currentYear}-`;

  // Find highest number for the current year
  let maxSeq = 0;
  for (const s of existingStudents) {
    const code = s.studentCode || s.admissionNumber || "";
    if (code.startsWith(yearPrefix)) {
      const numPart = parseInt(code.replace(yearPrefix, ""), 10);
      if (!isNaN(numPart) && numPart > maxSeq) {
        maxSeq = numPart;
      }
    } else if (code.startsWith("AN-")) {
      // Check legacy format
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

/**
 * Check if a duplicate registration exists based on Full Name and Parent Phone Number
 */
export function findDuplicateStudent(
  students: Student[],
  fullName: string,
  parentPhone: string,
  excludeId?: string
): Student | null {
  const cleanName = fullName.trim().toLowerCase();
  const cleanDigits = parentPhone.replace(/\D/g, "").slice(-10); // Match last 10 digits

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

/**
 * Fetch all students from Supabase, syncing with local cache
 */
export async function getStudentsFromDatabase(): Promise<Student[]> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("students")
          .select("*")
          .order("created_at", { ascending: false });

        if (!error && data && data.length > 0) {
          const mapped = data.map(mapDatabaseRowToStudent);
          AcademyDataStore.saveStudents(mapped);
          return mapped;
        } else if (error) {
          console.warn("Supabase students fetch warning, using local store:", error.message);
        }
      } catch (err) {
        console.error("Error communicating with Supabase students:", err);
      }
    }
  }

  // Fallback to local store
  return AcademyDataStore.getStudents();
}

/**
 * Add a New Student (Validated, Duplicate Prevented & Synced with Supabase)
 */
export async function createStudent(
  input: StudentInput,
  existingStudents: Student[]
): Promise<StudentServiceResult> {
  // 1. Validation
  if (!input.fullName.trim()) {
    return { success: false, error: "Student full name is required." };
  }
  if (!input.parentName.trim()) {
    return { success: false, error: "Parent or guardian name is required." };
  }
  if (!input.parentPhone.trim()) {
    return { success: false, error: "Parent contact number is required." };
  }
  if (!input.branchId) {
    return { success: false, error: "Please select an academy branch." };
  }
  if (!input.batchId) {
    return { success: false, error: "Please assign a dance batch." };
  }
  if (input.monthlyFee < 0) {
    return { success: false, error: "Monthly fee cannot be negative." };
  }

  // 2. Prevent Accidental Duplicate Registrations
  const duplicate = findDuplicateStudent(existingStudents, input.fullName, input.parentPhone);
  if (duplicate) {
    return {
      success: false,
      isDuplicate: true,
      student: duplicate,
      error: `A student named "${duplicate.fullName}" is already registered with parent phone ${input.parentPhone} (Student Code: ${duplicate.studentCode || duplicate.admissionNumber}).`,
    };
  }

  // 3. Generate unique student code
  const studentCode = generateNextStudentCode(existingStudents);
  const joiningDate = input.joiningDate || new Date().toISOString().split("T")[0];

  let newStudent: Student;

  // 4. Save to Supabase if configured
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const payload = mapStudentToDatabaseRow(input, studentCode);
        const { data, error } = await supabase
          .from("students")
          .insert(payload)
          .select()
          .single();

        if (error) {
          console.error("Failed to insert student into Supabase:", error);
          return { success: false, error: `Database error: ${error.message}` };
        }

        if (data) {
          newStudent = mapDatabaseRowToStudent(data);
          // Sync with local cache
          const updated = [newStudent, ...existingStudents];
          AcademyDataStore.saveStudents(updated);
          return { success: true, student: newStudent };
        }
      } catch (err: any) {
        console.error("Network exception while saving student:", err);
      }
    }
  }

  // 5. Local / Offline mode fallback
  newStudent = {
    id: `std-${Date.now()}`,
    admissionNumber: studentCode,
    studentCode: studentCode,
    branchId: input.branchId,
    batchId: input.batchId,
    fullName: input.fullName.trim(),
    parentName: input.parentName.trim(),
    phone: input.parentPhone.trim(),
    parentPhone: input.parentPhone.trim(),
    studentPhone: input.studentPhone?.trim(),
    whatsapp: input.parentPhone.trim(),
    dateOfBirth: input.dateOfBirth,
    gender: input.gender || "female",
    enrollmentDate: joiningDate,
    joiningDate: joiningDate,
    monthlyFee: input.monthlyFee,
    level: input.level || "Beginner",
    status: input.status || "active",
    address: input.address?.trim() || "",
    notes: input.notes?.trim() || "",
  };

  const updated = [newStudent, ...existingStudents];
  AcademyDataStore.saveStudents(updated);
  return { success: true, student: newStudent };
}

/**
 * Edit an Existing Student Record (Preserving Historical Data & Codes)
 */
export async function updateStudent(
  studentId: string,
  updates: Partial<StudentInput>,
  existingStudents: Student[]
): Promise<StudentServiceResult> {
  const current = existingStudents.find((s) => s.id === studentId);
  if (!current) {
    return { success: false, error: "Student record not found." };
  }

  // Check duplicate if name or phone changed
  if (updates.fullName || updates.parentPhone) {
    const checkName = updates.fullName || current.fullName;
    const checkPhone = updates.parentPhone || current.parentPhone || current.phone;
    const duplicate = findDuplicateStudent(existingStudents, checkName, checkPhone, studentId);
    if (duplicate) {
      return {
        success: false,
        isDuplicate: true,
        student: duplicate,
        error: `Another student named "${duplicate.fullName}" already exists with this phone number.`,
      };
    }
  }

  // Prepare updated student object
  const updatedStudent: Student = {
    ...current,
    fullName: updates.fullName !== undefined ? updates.fullName.trim() : current.fullName,
    parentName: updates.parentName !== undefined ? updates.parentName.trim() : current.parentName,
    parentPhone: updates.parentPhone !== undefined ? updates.parentPhone.trim() : current.parentPhone,
    phone: updates.parentPhone !== undefined ? updates.parentPhone.trim() : current.phone,
    whatsapp: updates.parentPhone !== undefined ? updates.parentPhone.trim() : current.whatsapp,
    studentPhone: updates.studentPhone !== undefined ? updates.studentPhone.trim() : current.studentPhone,
    address: updates.address !== undefined ? updates.address.trim() : current.address,
    dateOfBirth: updates.dateOfBirth !== undefined ? updates.dateOfBirth : current.dateOfBirth,
    gender: updates.gender !== undefined ? updates.gender : current.gender,
    joiningDate: updates.joiningDate !== undefined ? updates.joiningDate : (current.joiningDate || current.enrollmentDate),
    enrollmentDate: updates.joiningDate !== undefined ? updates.joiningDate : current.enrollmentDate,
    branchId: updates.branchId !== undefined ? updates.branchId : current.branchId,
    batchId: updates.batchId !== undefined ? updates.batchId : current.batchId,
    monthlyFee: updates.monthlyFee !== undefined ? updates.monthlyFee : (current.monthlyFee || 1500),
    level: updates.level !== undefined ? updates.level : current.level,
    status: updates.status !== undefined ? updates.status : current.status,
    notes: updates.notes !== undefined ? updates.notes.trim() : current.notes,
  };

  // Update in Supabase if configured
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const payload: any = {};
        if (updates.fullName !== undefined) payload.full_name = updates.fullName.trim();
        if (updates.parentName !== undefined) payload.parent_name = updates.parentName.trim();
        if (updates.parentPhone !== undefined) payload.parent_phone = updates.parentPhone.trim();
        if (updates.studentPhone !== undefined) payload.student_phone = updates.studentPhone.trim();
        if (updates.address !== undefined) payload.address = updates.address.trim();
        if (updates.dateOfBirth !== undefined) payload.date_of_birth = updates.dateOfBirth;
        if (updates.gender !== undefined) payload.gender = updates.gender;
        if (updates.joiningDate !== undefined) payload.joining_date = updates.joiningDate;
        if (updates.branchId !== undefined) payload.branch_id = updates.branchId;
        if (updates.batchId !== undefined) payload.batch_id = updates.batchId;
        if (updates.monthlyFee !== undefined) payload.monthly_fee = updates.monthlyFee;
        if (updates.status !== undefined) payload.status = updates.status;

        const { error } = await supabase
          .from("students")
          .update(payload)
          .eq("id", studentId);

        if (error) {
          console.error("Failed to update student in Supabase:", error);
          return { success: false, error: `Database error: ${error.message}` };
        }
      } catch (err: any) {
        console.error("Exception updating student in Supabase:", err);
      }
    }
  }

  // Update local cache
  const updatedList = existingStudents.map((s) => (s.id === studentId ? updatedStudent : s));
  AcademyDataStore.saveStudents(updatedList);
  return { success: true, student: updatedStudent };
}
