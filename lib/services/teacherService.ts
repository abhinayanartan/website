// ==============================================================================
// ABHINAYA NARTAN ACADEMY MANAGER - TEACHER / FACULTY SERVICE
// Dynamic Profile Loading from Supabase public.profiles
// ==============================================================================

import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabaseClient";

export interface TeacherProfile {
  id: string;
  fullName: string;
  role: "admin" | "teacher";
  branchId?: string;
  email?: string;
}

export const FALLBACK_TEACHERS: TeacherProfile[] = [
  {
    id: "usr-admin-sravani-001",
    fullName: "Guru Smt. Radhika",
    role: "admin",
    branchId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  },
  {
    id: "usr-teacher-krishna-002",
    fullName: "Guru Sri Krishna",
    role: "teacher",
    branchId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  },
  {
    id: "usr-teacher-ramesh-003",
    fullName: "Sri K. Ramesh Master",
    role: "teacher",
    branchId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  },
  {
    id: "usr-teacher-sravani-004",
    fullName: "Smt. Sravani Rao",
    role: "teacher",
    branchId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  },
];

export async function getTeachersFromDatabase(): Promise<TeacherProfile[]> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, full_name, role, branch_id")
          .in("role", ["teacher", "admin"])
          .order("full_name", { ascending: true });

        if (!error && data && data.length > 0) {
          return data.map((row: any) => ({
            id: row.id,
            fullName: row.full_name || "Faculty Guru",
            role: row.role as "admin" | "teacher",
            branchId: row.branch_id || undefined,
          }));
        } else if (error) {
          console.warn("Supabase profiles/teachers fetch warning:", error.message);
        }
      } catch (err) {
        console.error("Error communicating with Supabase profiles:", err);
      }
    }
  }

  return FALLBACK_TEACHERS;
}
