"use client";

import { useState } from "react";
import {
  Building2,
  Database,
  RotateCcw,
  Plus,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  X,
} from "lucide-react";
import { Branch } from "@/lib/types/academy";
import { isSupabaseConfigured } from "@/lib/supabaseClient";

export default function SettingsView({
  branches,
  onAddBranch,
  onResetData,
}: {
  branches: Branch[];
  onAddBranch: (branch: Omit<Branch, "id">) => void;
  onResetData: () => void;
}) {
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [branchForm, setBranchForm] = useState({
    name: "",
    code: "",
    city: "Vijayawada",
    address: "",
    phone: "+91 93981 18249",
    isActive: true,
  });

  const [resetConfirm, setResetConfirm] = useState(false);
  const supabaseActive = isSupabaseConfigured();

  const handleCreateBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchForm.name.trim() || !branchForm.code.trim()) return;

    onAddBranch({
      name: branchForm.name.trim(),
      code: branchForm.code.trim().toUpperCase(),
      city: branchForm.city.trim(),
      address: branchForm.address.trim(),
      phone: branchForm.phone.trim(),
      isActive: branchForm.isActive,
    });

    setBranchForm({
      name: "",
      code: "",
      city: "Vijayawada",
      address: "",
      phone: "+91 93981 18249",
      isActive: true,
    });
    setShowBranchModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <h2 className="font-serif text-xl sm:text-2xl font-bold text-purple-950">
          Academy &amp; System Settings
        </h2>
        <p className="text-xs text-ink/70 mt-0.5">
          Manage branches, inspect free-tier Supabase database status, and control system preferences.
        </p>
      </div>

      {/* Multi-Branch Management Section */}
      <div className="rounded-2xl border border-purple-100 bg-white p-5 sm:p-6 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-purple-100">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50 text-purple-900">
              <Building2 size={18} />
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-purple-950">
                Academy Branches ({branches.length})
              </h3>
              <p className="text-xs text-ink/60">
                Multi-branch support enabled from Day 1 for future satellite centers
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowBranchModal(true)}
            type="button"
            className="inline-flex items-center gap-1.5 rounded-lg bg-gold px-3.5 py-1.5 text-xs font-semibold text-purple-950 shadow-gold-sm hover:brightness-105 active:scale-95 transition-all self-start sm:self-auto"
          >
            <Plus size={14} />
            <span>Add New Branch</span>
          </button>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {branches.map((b) => (
            <div
              key={b.id}
              className="p-4 rounded-xl border border-purple-100 bg-purple-50/30 flex flex-col justify-between gap-2"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-purple-900 bg-white border border-purple-200 px-2 py-0.5 rounded">
                    {b.code}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[0.65rem] font-semibold ${
                      b.isActive
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                        : "bg-gray-100 text-gray-700 border border-gray-200"
                    }`}
                  >
                    {b.isActive ? "Active Studio" : "Upcoming"}
                  </span>
                </div>
                <h4 className="font-serif text-sm font-bold text-purple-950 mt-2">
                  {b.name}
                </h4>
                <p className="text-xs text-ink/70 mt-0.5">{b.address || b.city}</p>
              </div>
              <div className="text-[0.7rem] text-purple-700 font-medium">
                Phone: {b.phone || "+91 93981 18249"}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Supabase Free-Tier Integration Status Card */}
      <div className="rounded-2xl border border-purple-100 bg-white p-5 sm:p-6 shadow-card space-y-4">
        <div className="flex items-center gap-2.5 pb-4 border-b border-purple-100">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
            <Database size={18} />
          </div>
          <div>
            <h3 className="font-serif text-base font-bold text-purple-950">
              Supabase Free-Tier Database Connection
            </h3>
            <p className="text-xs text-ink/60">
              Cloud PostgreSQL instance status and authentication configuration
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-purple-100 bg-alabaster space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-ink/70">Database Backend:</span>
            {supabaseActive ? (
              <span className="inline-flex items-center gap-1.5 text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                <CheckCircle2 size={13} />
                <span>Supabase Live Connected</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-amber-800 font-semibold bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                <ShieldCheck size={13} />
                <span>Local Persistent Storage Mode (Active &amp; Functional)</span>
              </span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-ink/70">Budget / Monthly Hosting:</span>
            <span className="font-semibold text-emerald-700 font-serif text-sm">
              Strictly ₹0 / month (100% Free Forever)
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-ink/70">Schema Migration File:</span>
            <span className="font-mono text-purple-900 bg-white px-2 py-0.5 rounded border border-purple-200">
              supabase/schema.sql
            </span>
          </div>
        </div>

        {!supabaseActive && (
          <div className="rounded-xl border border-gold/40 bg-purple-950 text-alabaster p-4 text-xs space-y-2">
            <div className="flex items-center gap-2 text-gold font-semibold text-sm">
              <Sparkles size={16} />
              <span>How to link your Free Supabase Project (Optional):</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-purple-200 text-[0.75rem]">
              <li>Create a free account at <strong>supabase.com</strong> (no credit card required).</li>
              <li>Create a project in region <strong>AWS Mumbai (ap-south-1)</strong>.</li>
              <li>Open <strong>SQL Editor</strong> in Supabase and run the provided script in <code>supabase/schema.sql</code>.</li>
              <li>Copy your Project URL and Anon Key into <code>.env.local</code> as shown in <code>.env.example</code>.</li>
            </ol>
          </div>
        )}
      </div>

      {/* Demo Data Reset Card */}
      <div className="rounded-2xl border border-rose-100 bg-white p-5 sm:p-6 shadow-card space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif text-base font-bold text-rose-900 flex items-center gap-2">
              <RotateCcw size={16} />
              <span>Reset Demo Data</span>
            </h3>
            <p className="text-xs text-ink/60 mt-0.5">
              Reset all student records, fee payments, and attendance marks back to the original seed state.
            </p>
          </div>

          {resetConfirm ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onResetData();
                  setResetConfirm(false);
                }}
                className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white shadow hover:bg-rose-700"
              >
                Confirm Reset
              </button>
              <button
                type="button"
                onClick={() => setResetConfirm(false)}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setResetConfirm(true)}
              className="rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-1.5 text-xs font-semibold text-rose-800 hover:bg-rose-100 transition-colors"
            >
              Reset Data
            </button>
          )}
        </div>
      </div>

      {/* Add New Branch Modal */}
      {showBranchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-purple-950/80 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-2xl border border-gold/40 bg-white p-6 text-ink shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-purple-100">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-gold" />
                <h3 className="font-serif text-lg font-bold text-purple-950">
                  Register New Branch
                </h3>
              </div>
              <button
                onClick={() => setShowBranchModal(false)}
                type="button"
                className="text-ink/60 hover:text-purple-950"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateBranch} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-purple-950 mb-1">
                  Branch Name <span className="text-vermilion">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Guntur Classical Studio"
                  value={branchForm.name}
                  onChange={(e) => setBranchForm({ ...branchForm, name: e.target.value })}
                  className="w-full rounded-lg border border-purple-200 p-2.5 text-xs text-ink focus:border-gold focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-purple-950 mb-1">
                    Branch Code <span className="text-vermilion">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="GNT-01"
                    value={branchForm.code}
                    onChange={(e) => setBranchForm({ ...branchForm, code: e.target.value })}
                    className="w-full rounded-lg border border-purple-200 p-2.5 text-xs text-ink focus:border-gold focus:outline-none font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-purple-950 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    placeholder="Guntur"
                    value={branchForm.city}
                    onChange={(e) => setBranchForm({ ...branchForm, city: e.target.value })}
                    className="w-full rounded-lg border border-purple-200 p-2.5 text-xs text-ink focus:border-gold focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-purple-950 mb-1">
                  Studio Address
                </label>
                <input
                  type="text"
                  placeholder="Street / Landmark"
                  value={branchForm.address}
                  onChange={(e) => setBranchForm({ ...branchForm, address: e.target.value })}
                  className="w-full rounded-lg border border-purple-200 p-2.5 text-xs text-ink focus:border-gold focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-purple-100">
                <button
                  type="button"
                  onClick={() => setShowBranchModal(false)}
                  className="rounded-lg border border-purple-200 px-4 py-2 text-xs font-semibold text-purple-950 hover:bg-purple-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-gold px-4 py-2 text-xs font-semibold text-purple-950 shadow-gold-sm hover:brightness-105"
                >
                  Add Branch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
