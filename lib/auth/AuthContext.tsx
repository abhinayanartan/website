"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabaseClient";
import { AuthContextType, StaffUser, StaffRole } from "@/lib/types/auth";
import { DEMO_ACCOUNTS } from "@/lib/auth/demoAccounts";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_STORAGE_KEY = "abhinaya_staff_auth_session";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const demoModeEnabled = process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === "true";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<StaffUser | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const isConfigured = isSupabaseConfigured();

  // Helper to fetch profile from public.profiles
  const fetchProfile = useCallback(async (userId: string, email: string): Promise<StaffUser> => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return {
        id: userId,
        email,
        fullName: email.split("@")[0],
        role: "teacher",
      };
    }

    try {
      const { data, error: profileErr } = await supabase
        .from("profiles")
        .select("id, full_name, role, branch_id, created_at")
        .eq("id", userId)
        .single();

      if (profileErr || !data) {
        console.warn("Profile not found in public.profiles, falling back to auth metadata:", profileErr);
        return {
          id: userId,
          email,
          fullName: email.split("@")[0],
          role: "teacher",
        };
      }

      return {
        id: data.id,
        email,
        fullName: data.full_name || email.split("@")[0],
        role: (data.role as StaffRole) || "teacher",
        branchId: data.branch_id,
        createdAt: data.created_at,
      };
    } catch (err) {
      console.error("Error fetching staff profile:", err);
      return {
        id: userId,
        email,
        fullName: email.split("@")[0],
        role: "teacher",
      };
    }
  }, []);

  // Initialize session on mount
  useEffect(() => {
    let mounted = true;

    async function initSession() {
      setIsLoading(true);

      if (isConfigured) {
        const supabase = getSupabaseClient();
        if (supabase) {
          try {
            const { data } = await supabase.auth.getSession();
            if (data.session && data.session.user) {
              const staffUser = await fetchProfile(data.session.user.id, data.session.user.email || "");
              if (mounted) {
                setUser(staffUser);
                setSession(data.session);
              }
            } else {
              if (mounted) {
                setUser(null);
                setSession(null);
              }
            }
          } catch (err) {
            console.error("Failed to restore Supabase auth session:", err);
            if (mounted) {
              setUser(null);
              setSession(null);
            }
          }
        }
      } else if (demoModeEnabled) {
        // Fallback: check localStorage for explicitly enabled local preview mode
        try {
          const stored = typeof window !== "undefined" ? localStorage.getItem(DEMO_STORAGE_KEY) : null;
          if (stored) {
            const parsed = JSON.parse(stored) as StaffUser;
            if (mounted) {
              setUser(parsed);
              setSession({ access_token: "demo-jwt-token", user: { id: parsed.id, email: parsed.email } });
            }
          }
        } catch (e) {
          console.warn("Could not read demo auth session:", e);
        }
      }

      if (mounted) {
        setIsLoading(false);
      }
    }

    initSession();

    // Listen to Supabase Auth state changes if configured
    if (isConfigured) {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, newSession) => {
          if (!mounted) return;

          if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "USER_UPDATED") {
            if (newSession?.user) {
              const staffUser = await fetchProfile(newSession.user.id, newSession.user.email || "");
              setUser(staffUser);
              setSession(newSession);
            }
          } else if (event === "SIGNED_OUT") {
            setUser(null);
            setSession(null);
          }
        });

        return () => {
          mounted = false;
          authListener.subscription.unsubscribe();
        };
      }
    }

    return () => {
      mounted = false;
    };
  }, [isConfigured, fetchProfile]);

  // Sign In with Email & Password
  const signInWithEmail = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    setError(null);
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !pass) {
      const err = "Please provide both an email address and password.";
      setError(err);
      return { success: false, error: err };
    }

    if (isConfigured) {
      const supabase = getSupabaseClient();
      if (!supabase) {
        return { success: false, error: "Database client is not available." };
      }

      try {
        const { data, error: signInErr } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: pass,
        });

        if (signInErr) {
          let userMessage = signInErr.message;
          if (signInErr.message.toLowerCase().includes("invalid login credentials")) {
            userMessage = "Invalid email or password. Please verify your credentials and try again.";
          } else if (signInErr.message.toLowerCase().includes("email not confirmed")) {
            userMessage = "This staff account email has not been confirmed. Please contact an Academy Director.";
          }
          setError(userMessage);
          return { success: false, error: userMessage };
        }

        if (data.session && data.user) {
          const staffUser = await fetchProfile(data.user.id, data.user.email || cleanEmail);
          setUser(staffUser);
          setSession(data.session);
          return { success: true };
        }

        return { success: false, error: "Authentication did not return a valid session." };
      } catch (err: any) {
        const msg = err?.message || "An unexpected error occurred during sign in.";
        setError(msg);
        return { success: false, error: msg };
      }
    }

    if (!demoModeEnabled) {
      const msg = "Production authentication is unavailable. Configure Supabase before signing in.";
      setError(msg);
      return { success: false, error: msg };
    }

    // Demo / Offline Mode handling
    const demoAccount = DEMO_ACCOUNTS[cleanEmail];
    if (!demoAccount) {
      const msg = "No authorized staff account found with this email. Public registration is disabled.";
      setError(msg);
      return { success: false, error: msg };
    }

    if (demoAccount.passwordHash !== pass) {
      const msg = "Incorrect password. Please verify your credentials and try again.";
      setError(msg);
      return { success: false, error: msg };
    }

    // Valid demo account
    setUser(demoAccount.user);
    setSession({
      access_token: "demo-jwt-token",
      user: { id: demoAccount.user.id, email: demoAccount.user.email },
    });
    try {
      localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(demoAccount.user));
    } catch (e) {
      console.warn("Failed to persist demo session in localStorage", e);
    }
    return { success: true };
  };

  // Sign Out
  const signOut = async (): Promise<void> => {
    if (isConfigured) {
      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          await supabase.auth.signOut();
        } catch (e) {
          console.error("Error signing out from Supabase:", e);
        }
      }
    }

    // Clear state & storage
    setUser(null);
    setSession(null);
    setError(null);
    try {
      localStorage.removeItem(DEMO_STORAGE_KEY);
    } catch (e) {
      console.warn("Failed to clear demo session from localStorage", e);
    }
  };

  // Reset Password
  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    setError(null);
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      return { success: false, error: "Please enter your staff email address." };
    }

    if (isConfigured) {
      const supabase = getSupabaseClient();
      if (!supabase) return { success: false, error: "Supabase client not available." };

      const redirectUrl =
        typeof window !== "undefined"
          ? `${window.location.origin}${basePath}/reset-password/`
          : undefined;

      const { error: resetErr } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: redirectUrl,
      });

      if (resetErr) {
        setError(resetErr.message);
        return { success: false, error: resetErr.message };
      }
      return { success: true };
    }

    if (!demoModeEnabled) {
      return { success: false, error: "Password reset is unavailable until Supabase is configured." };
    }

    // Demo Mode fallback
    if (!DEMO_ACCOUNTS[cleanEmail]) {
      return { success: false, error: "No academy staff account found with this email." };
    }
    return { success: true };
  };

  // Update Password
  const updatePassword = async (newPassword: string): Promise<{ success: boolean; error?: string }> => {
    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: "Password must be at least 6 characters long." };
    }

    if (isConfigured) {
      const supabase = getSupabaseClient();
      if (!supabase) return { success: false, error: "Supabase client not available." };

      const { error: updateErr } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateErr) {
        return { success: false, error: updateErr.message };
      }
      return { success: true };
    }

    if (!demoModeEnabled) {
      return { success: false, error: "Password update is unavailable until Supabase is configured." };
    }

    // Demo mode: pretend successful
    return { success: true };
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        error,
        isConfigured,
        isDemoMode: !isConfigured && demoModeEnabled,
        signInWithEmail,
        signOut,
        resetPassword,
        updatePassword,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
