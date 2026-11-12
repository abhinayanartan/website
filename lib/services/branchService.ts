// ==============================================================================
// ABHINAYA NARTAN ACADEMY MANAGER - BRANCH MANAGEMENT SERVICE
// Direct Supabase Integration with Local Synchronization
// ==============================================================================

import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabaseClient";
import { Branch } from "@/lib/types/academy";
import { AcademyDataStore, initialBranches } from "@/lib/academyStore";

export function mapDatabaseRowToBranch(row: any): Branch {
  return {
    id: row.id,
    name: row.branch_name || row.name || "Vijayawada Main Studio",
    code: row.code || "VJA-01",
    city: row.city || "Vijayawada",
    address: row.address || "",
    phone: row.contact_number || row.phone || "+91 93981 18249",
    isActive: row.is_active !== undefined ? Boolean(row.is_active) : true,
  };
}

export async function getBranchesFromDatabase(): Promise<Branch[]> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("branches")
          .select("*")
          .order("branch_name", { ascending: true });

        if (!error && data && data.length > 0) {
          const mapped = data.map(mapDatabaseRowToBranch);
          AcademyDataStore.saveBranches(mapped);
          return mapped;
        } else if (error) {
          console.warn("Supabase branches fetch warning, using local store:", error.message);
        }
      } catch (err) {
        console.error("Error communicating with Supabase branches:", err);
      }
    }
  }

  // Fallback to local store
  return AcademyDataStore.getBranches();
}
