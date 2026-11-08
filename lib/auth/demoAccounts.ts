// ==============================================================================
// ABHINAYA NARTAN ACADEMY MANAGER - DEMO / PREVIEW STAFF ACCOUNTS
// Used when Supabase environment variables are pending or during offline preview.
// ==============================================================================

import { StaffUser } from "@/lib/types/auth";

export interface DemoAccount {
  user: StaffUser;
  passwordHash: string; // Plaintext for demo preview matching
  description: string;
}

export const DEMO_ACCOUNTS: Record<string, DemoAccount> = {
  "admin@abhinayanartan.org": {
    user: {
      id: "usr-admin-sravani-001",
      email: "admin@abhinayanartan.org",
      fullName: "Smt. Sravani Rao",
      role: "admin",
      branchId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      createdAt: "2024-01-01T00:00:00.000Z",
    },
    passwordHash: "NartanAdmin@2026",
    description: "Academy Director & Super Administrator (Full Studio Management)",
  },
  "teacher@abhinayanartan.org": {
    user: {
      id: "usr-teacher-ramesh-002",
      email: "teacher@abhinayanartan.org",
      fullName: "Sri K. Ramesh Master",
      role: "teacher",
      branchId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      createdAt: "2024-02-01T00:00:00.000Z",
    },
    passwordHash: "NartanTeacher@2026",
    description: "Senior Kuchipudi Guru (Balagopala & Abhinaya Batches)",
  },
};
