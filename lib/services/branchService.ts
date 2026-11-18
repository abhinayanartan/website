// ==============================================================================
// ABHINAYA NARTAN ACADEMY MANAGER - BRANCH MANAGEMENT SERVICE
// Direct Supabase Integration with Local Synchronization
// ==============================================================================

import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabaseClient";
import { Branch } from "@/lib/types/academy";
import { AcademyDataStore } from "@/lib/academyStore";

export type BranchInput = Pick<Branch, "name" | "address" | "phone">;

export interface BranchServiceResult {
  success: boolean;
  branch?: Branch;
  error?: string;
}

const PRIMARY_BRANCH_ID = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";

function getDisplayCode(row: any): string {
  if (row.code) return row.code;
  if (row.id === PRIMARY_BRANCH_ID) return "VJA-01";
  const compactId = typeof row.id === "string" ? row.id.replace(/-/g, "").slice(0, 5).toUpperCase() : "NEW";
  return `STUDIO-${compactId}`;
}

export function mapDatabaseRowToBranch(row: any): Branch {
  return {
    id: row.id,
    name: row.branch_name || row.name || "Vijayawada Main Studio",
    code: getDisplayCode(row),
    city: row.city || (row.id === PRIMARY_BRANCH_ID ? "Vijayawada" : ""),
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

/**
 * Create a studio branch and require Supabase confirmation whenever the live
 * database is configured. The current branches table stores the public studio
 * details (name, address, contact number); display-only fields are derived by
 * mapDatabaseRowToBranch so we never claim an unsaved branch exists.
 */
export async function createBranch(input: BranchInput): Promise<BranchServiceResult> {
  if (!input.name.trim()) {
    return { success: false, error: "Branch name is required." };
  }

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return { success: false, error: "Database connection is unavailable. The branch was not saved." };
    }

    try {
      const { data, error } = await supabase
        .from("branches")
        .insert({
          branch_name: input.name.trim(),
          address: input.address?.trim() || null,
          contact_number: input.phone?.trim() || null,
        })
        .select("*")
        .single();

      if (error) {
        console.error("Failed to create branch in Supabase:", error);
        return { success: false, error: `Database error: ${error.message}` };
      }
      if (!data) {
        return { success: false, error: "The database did not confirm the new branch. Please try again." };
      }

      return { success: true, branch: mapDatabaseRowToBranch(data) };
    } catch (err: any) {
      console.error("Network exception creating branch:", err);
      return { success: false, error: err?.message || "Network exception communicating with Supabase database." };
    }
  }

  const localBranch: Branch = {
    id: `branch-${Date.now()}`,
    name: input.name.trim(),
    code: `STUDIO-${Date.now().toString().slice(-5)}`,
    city: "",
    address: input.address?.trim() || "",
    phone: input.phone?.trim() || "+91 93981 18249",
    isActive: true,
  };
  return { success: true, branch: localBranch };
}
