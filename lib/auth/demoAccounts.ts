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
  "reshmagujjala249@gmail.com": {
    user: {
      id: "usr-admin-reshma-001",
      email: "reshmagujjala249@gmail.com",
      fullName: "G RESHMA",
      role: "admin",
      branchId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      createdAt: "2024-01-01T00:00:00.000Z",
    },
    passwordHash: "NartanAdmin@2026",
    description: "Academy Administrator & Faculty Guru (G RESHMA)",
  },
  "admin@abhinayanartan.org": {
    user: {
      id: "usr-admin-reshma-001",
      email: "reshmagujjala249@gmail.com",
      fullName: "G RESHMA",
      role: "admin",
      branchId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      createdAt: "2024-01-01T00:00:00.000Z",
    },
    passwordHash: "NartanAdmin@2026",
    description: "Academy Administrator & Faculty Guru (G RESHMA)",
  },
};
