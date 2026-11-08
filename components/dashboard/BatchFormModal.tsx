"use client";

import { useState, useEffect } from "react";
import {
  X,
  Calendar,
  Clock,
  Building2,
  UserCheck,
  CreditCard,
  Users,
  AlertCircle,
  Sparkles,
  Loader2,
} from "lucide-react";
import { Batch, Branch } from "@/lib/types/academy";
import { BatchInput } from "@/lib/services/batchService";

const ALL_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const PRESET_TEACHERS = [
  "Guru Smt. Radhika",
  "Guru Sri Krishna",
  "Sri K. Ramesh Master",
  "Smt. Sravani Rao",
];

export default function BatchFormModal({
  isOpen,
  onClose,
  onSave,
  editingBatch,
  branches,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (input: BatchInput, batchId?: string) => Promise<{ success: boolean; error?: string }>;
  editingBatch?: Batch | null;
  branches: Branch[];
}) {
  const isEditing = Boolean(editingBatch);

  const defaultBranchId = editingBatch?.branchId || branches[0]?.id || "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";

  const [form, setForm] = useState<BatchInput>({
    name: editingBatch?.name || "",
    branchId: defaultBranchId,
    teacherName: editingBatch?.teacherName || "Guru Smt. Radhika",
    level: editingBatch?.level || "Beginner",
    scheduleDays: editingBatch?.scheduleDays || ["Mon", "Wed", "Fri"],
    startTime: editingBatch?.startTime || "05:00 PM",
    endTime: editingBatch?.endTime || "06:30 PM",
    maxCapacity: editingBatch?.maxCapacity || 20,
    monthlyFee: editingBatch?.monthlyFee || 1500,
    status: editingBatch?.status || "active",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (editingBatch) {
      setForm({
        name: editingBatch.name,
        branchId: editingBatch.branchId || branches[0]?.id || "",
        teacherName: editingBatch.teacherName || "Guru Smt. Radhika",
        level: editingBatch.level || "Beginner",
        scheduleDays: editingBatch.scheduleDays || ["Mon", "Wed", "Fri"],
        startTime: editingBatch.startTime || "05:00 PM",
        endTime: editingBatch.endTime || "06:30 PM",
        maxCapacity: editingBatch.maxCapacity || 20,
        monthlyFee: editingBatch.monthlyFee || 1500,
        status: editingBatch.status || (editingBatch.isActive ? "active" : "inactive"),
      });
    } else {
      setForm({
        name: "",
        branchId: branches[0]?.id || "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
        teacherName: "Guru Smt. Radhika",
        level: "Beginner",
        scheduleDays: ["Mon", "Wed", "Fri"],
        startTime: "05:00 PM",
        endTime: "06:30 PM",
        maxCapacity: 20,
        monthlyFee: 1500,
        status: "active",
      });
    }
    setErrorMessage(null);
  }, [editingBatch, branches, isOpen]);

  const handleToggleDay = (day: string) => {
    if (form.scheduleDays.includes(day)) {
      if (form.scheduleDays.length > 1) {
        setForm({ ...form, scheduleDays: form.scheduleDays.filter((d) => d !== day) });
      }
    } else {
      setForm({ ...form, scheduleDays: [...form.scheduleDays, day] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!form.name.trim()) {
      setErrorMessage("Please enter a batch title.");
      return;
    }
    if (!form.branchId) {
      setErrorMessage("Please select a studio branch.");
      return;
    }
    if (!form.scheduleDays || form.scheduleDays.length === 0) {
      setErrorMessage("Please select at least one class day.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await onSave(form, editingBatch?.id);
      if (res.success) {
        onClose();
      } else {
        setErrorMessage(res.error || "Unable to save batch.");
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-purple-950/70 backdrop-blur-sm animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-lg rounded-3xl bg-white border border-brand-border shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-950 via-purple-900 to-[#1A0D33] p-6 text-white shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-gold/20 text-brand-gold border border-brand-gold/30">
                <Sparkles size={20} />
              </div>
              <div>
                <h2 className="font-serif text-lg sm:text-xl font-bold text-white">
                  {isEditing ? `Edit Batch: ${editingBatch?.name}` : "Create New Dance Batch"}
                </h2>
                <p className="text-xs text-brand-gold/90 mt-0.5">
                  Configure training schedules, guru assignment, and studio limits
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              type="button"
              className="rounded-full p-1.5 text-white/70 hover:bg-white/10 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs text-brand-dark flex-1">
          {errorMessage && (
            <div className="flex items-start gap-2.5 rounded-2xl bg-rose-50 border border-rose-200 p-3.5 text-xs text-rose-800 animate-fadeIn">
              <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {/* Batch Name */}
          <div>
            <label htmlFor="batch-title-input" className="block font-semibold text-brand-dark mb-1">
              Batch Title <span className="text-brand-accent">*</span>
            </label>
            <input
              id="batch-title-input"
              type="text"
              required
              placeholder="e.g. Tarangam Brass Plate Intensive - Sunday"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-xl border border-brand-border bg-[#F8F9FA] px-3.5 py-2.5 text-xs text-brand-dark focus:bg-white focus:border-brand-primary focus:outline-none transition-all"
            />
          </div>

          {/* Branch & Level */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="batch-branch-select" className="block font-semibold text-brand-dark mb-1">
                Studio Branch <span className="text-brand-accent">*</span>
              </label>
              <select
                id="batch-branch-select"
                required
                value={form.branchId}
                onChange={(e) => setForm({ ...form, branchId: e.target.value })}
                className="w-full rounded-xl border border-brand-border bg-[#F8F9FA] px-3.5 py-2.5 text-xs text-brand-dark focus:bg-white focus:border-brand-primary focus:outline-none"
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.city})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="batch-dance-level" className="block font-semibold text-brand-dark mb-1">
                Dance Curriculum Level
              </label>
              <select
                id="batch-dance-level"
                value={form.level}
                onChange={(e) => setForm({ ...form, level: e.target.value as any })}
                className="w-full rounded-xl border border-brand-border bg-[#F8F9FA] px-3.5 py-2.5 text-xs text-brand-dark focus:bg-white focus:border-brand-primary focus:outline-none"
              >
                <option value="Beginner">Beginner (Adavus &amp; Footwork)</option>
                <option value="Intermediate">Intermediate (Abhinaya &amp; Jatis)</option>
                <option value="Advanced">Advanced (Tarangam &amp; Stage)</option>
              </select>
            </div>
          </div>

          {/* Teacher Assignment */}
          <div>
            <label htmlFor="batch-teacher-name" className="block font-semibold text-brand-dark mb-1">
              Assigned Faculty Guru <span className="text-brand-accent">*</span>
            </label>
            <div className="space-y-1.5">
              <input
                id="batch-teacher-name"
                type="text"
                required
                placeholder="Guru name"
                value={form.teacherName}
                onChange={(e) => setForm({ ...form, teacherName: e.target.value })}
                className="w-full rounded-xl border border-brand-border bg-[#F8F9FA] px-3.5 py-2.5 text-xs text-brand-dark focus:bg-white focus:border-brand-primary focus:outline-none"
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                {PRESET_TEACHERS.map((teacher) => (
                  <button
                    key={teacher}
                    type="button"
                    onClick={() => setForm({ ...form, teacherName: teacher })}
                    className={`px-2.5 py-1 rounded-lg text-[0.68rem] font-semibold transition-all ${
                      form.teacherName === teacher
                        ? "bg-purple-900 text-white"
                        : "bg-purple-50 text-purple-900 border border-purple-200 hover:border-brand-gold"
                    }`}
                  >
                    {teacher}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Schedule Days Multi-Select */}
          <div>
            <label className="block font-semibold text-brand-dark mb-1.5">
              Class Schedule Days <span className="text-brand-accent">*</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {ALL_DAYS.map((day) => {
                const isSelected = form.scheduleDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleToggleDay(day)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      isSelected
                        ? "bg-purple-950 text-brand-gold border-purple-950 shadow-sm"
                        : "bg-[#F8F9FA] text-brand-dark border-brand-border hover:border-brand-primary"
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Start Time & End Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="batch-start-time" className="block font-semibold text-brand-dark mb-1">
                Class Starting Time <span className="text-brand-accent">*</span>
              </label>
              <input
                id="batch-start-time"
                type="text"
                required
                placeholder="05:00 PM"
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                className="w-full rounded-xl border border-brand-border bg-[#F8F9FA] px-3.5 py-2.5 text-xs text-brand-dark focus:bg-white focus:border-brand-primary focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="batch-end-time" className="block font-semibold text-brand-dark mb-1">
                Class Ending Time <span className="text-brand-accent">*</span>
              </label>
              <input
                id="batch-end-time"
                type="text"
                required
                placeholder="06:30 PM"
                value={form.endTime}
                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                className="w-full rounded-xl border border-brand-border bg-[#F8F9FA] px-3.5 py-2.5 text-xs text-brand-dark focus:bg-white focus:border-brand-primary focus:outline-none"
              />
            </div>
          </div>

          {/* Max Capacity & Monthly Fee */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label htmlFor="batch-capacity-limit" className="block font-semibold text-brand-dark mb-1">
                Max Capacity
              </label>
              <input
                id="batch-capacity-limit"
                type="number"
                min="5"
                max="50"
                value={form.maxCapacity}
                onChange={(e) => setForm({ ...form, maxCapacity: Number(e.target.value) })}
                className="w-full rounded-xl border border-brand-border bg-[#F8F9FA] px-3.5 py-2.5 text-xs text-brand-dark focus:bg-white focus:border-brand-primary focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="batch-tuition-fee" className="block font-semibold text-brand-dark mb-1">
                Monthly Fee (₹)
              </label>
              <input
                id="batch-tuition-fee"
                type="number"
                min="500"
                step="100"
                value={form.monthlyFee}
                onChange={(e) => setForm({ ...form, monthlyFee: Number(e.target.value) })}
                className="w-full rounded-xl border border-brand-border bg-[#F8F9FA] px-3.5 py-2.5 text-xs text-brand-dark focus:bg-white focus:border-brand-primary focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="batch-status-toggle" className="block font-semibold text-brand-dark mb-1">
                Status
              </label>
              <select
                id="batch-status-toggle"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                className="w-full rounded-xl border border-brand-border bg-[#F8F9FA] px-3.5 py-2.5 text-xs text-brand-dark focus:bg-white focus:border-brand-primary focus:outline-none"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="p-4 border-t border-brand-border bg-[#F8F9FA] flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-brand-border bg-white px-4 py-2 text-xs font-semibold text-brand-dark hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            type="button"
            className="inline-flex items-center gap-1.5 rounded-xl bg-purple-950 px-5 py-2.5 text-xs font-bold text-brand-gold shadow-md hover:bg-purple-900 active:scale-95 transition-all disabled:opacity-60 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={14} className="animate-spin text-brand-gold" />
                <span>Saving to Supabase...</span>
              </>
            ) : (
              <span>{isEditing ? "Update Batch Information" : "Create Dance Batch"}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
