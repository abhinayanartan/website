// ==============================================================================
// ABHINAYA NARTAN ACADEMY MANAGER - AUTHENTICATION TYPES
// ==============================================================================

export type StaffRole = "admin" | "teacher";

export interface StaffUser {
  id: string;
  email: string;
  fullName: string;
  role: StaffRole;
  branchId?: string | null;
  createdAt?: string;
  avatarUrl?: string;
}

export interface AuthContextType {
  user: StaffUser | null;
  session: any | null;
  isLoading: boolean;
  error: string | null;
  isConfigured: boolean;
  isDemoMode: boolean;
  signInWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
  clearError: () => void;
}
