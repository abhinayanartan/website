"use client";

import { useState, useEffect, useMemo } from "react";
import {
  X,
  Calendar,
  Clock,
  Building2,
  Users,
  UserCheck,
  FileText,
  AlertCircle,
  Sparkles,
  Loader2,
  ShieldAlert,
  CheckCircle2,
} from "lucide-react";
import { DanceClass, Batch, Branch, ClassStatus, ClassInput } from "@/lib/types/academy";
import { TeacherProfile, FALLBACK_TEACHERS } from "@/lib/services/teacherService";
import { findDuplicateClass } from "@/lib/services/classService";

export default function ClassFormModal({
  isOpen,
  onClose,
  onSave,
  editingClass,
  branches,
  batches,
  teachers = FALLBACK_TEACHERS,
  existingClasses = [],
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (input: ClassInput, classId?: string) => Promise<{ success: boolean; error?: string }>;
  editingClass?: DanceClass | null;
  branches: Branch[];
  batches: Batch[];
  teachers?: TeacherProfile[];
  existingClasses?: DanceClass[];
}) {
  const isEditing = Boolean(editingClass);

  const defaultBranchId = editingClass?.branchId || branches[0]?.id || "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
  const branchBatches = batches.filter((b) => b.branchId === defaultBranchId);
  const defaultBatch = branchBatches[0] || batches[0];

  const todayStr = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState<ClassInput>({
    className: editingClass?.className || (defaultBatch ? `${defaultBatch.name} Session` : "Classical Dance Session"),
    branchId: defaultBranchId,
    batchId: editingClass?.batchId || defaultBatch?.id || "",
    teacherId: editingClass?.teacherId || defaultBatch?.teacherId || teachers[0]?.id,
    classDate: editingClass?.classDate || todayStr,
    startTime: editingClass?.startTime || defaultBatch?.startTime || "05:00 PM",
    endTime: editingClass?.endTime || defaultBatch?.endTime || "06:30 PM",
    status: editingClass?.status || "scheduled",
    notes: editingClass?.notes || "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<DanceClass | null>(null);

  // Available batches based on selected branch
  const availableBatches = useMemo(() => {
    if (!form.branchId) return batches;
    const filtered = batches.filter((b) => b.branchId === form.branchId);
    return filtered.length > 0 ? filtered : batches;
  }, [batches, form.branchId]);

  // Reset form when modal opens or editingClass changes
  useEffect(() => {
    if (editingClass) {
      setForm({
        className: editingClass.className,
        branchId: editingClass.branchId,
        batchId: editingClass.batchId,
        teacherId: editingClass.teacherId || teachers[0]?.id,
        classDate: editingClass.classDate,
        startTime: editingClass.startTime,
        endTime: editingClass.endTime,
        status: editingClass.status,
        notes: editingClass.notes || "",
      });
    } else {
      const activeBranchId = branches[0]?.id || "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
      const branchBatches = batches.filter((b) => b.branchId === activeBranchId);
      const chosenBatch = branchBatches[0] || batches[0];

      setForm({
        className: chosenBatch ? `${chosenBatch.name} Session` : "Classical Dance Session",
        branchId: activeBranchId,
        batchId: chosenBatch?.id || "",
        teacherId: chosenBatch?.teacherId || teachers[0]?.id,
        classDate: todayStr,
        startTime: chosenBatch?.startTime || "05:00 PM",
        endTime: chosenBatch?.endTime || "06:30 PM",
        status: "scheduled",
        notes: "",
      });
    }
    setErrorMessage(null);
    setSuccessMessage(null);
    setDuplicateWarning(null);
  }, [editingClass, branches, batches, teachers, isOpen, todayStr]);

  // Check for duplicate class scheduling in real time
  useEffect(() => {
    if (form.batchId && form.classDate && form.startTime) {
      const duplicate = findDuplicateClass(
        existingClasses,
        form.batchId,
        form.classDate,
        form.startTime,
        editingClass?.id
      );
      setDuplicateWarning(duplicate);
    } else {
      setDuplicateWarning(null);
    }
  }, [form.batchId, form.classDate, form.startTime, existingClasses, editingClass]);

  // Handle branch change -> update batches and automatically identify assigned teacher
  const handleBranchChange = (newBranchId: string) => {
    const branchBatches = batches.filter((b) => b.branchId === newBranchId);
    const firstBatch = branchBatches[0] || batches[0];

    // Find assigned teacher for this batch
    let assignedTeacherId = firstBatch?.teacherId;
    if (!assignedTeacherId && firstBatch?.teacherName) {
      const matchedTeacher = teachers.find(
        (t) => t.fullName.toLowerCase() === firstBatch.teacherName.toLowerCase()
      );
      assignedTeacherId = matchedTeacher?.id;
    }

    setForm((prev) => ({
      ...prev,
      branchId: newBranchId,
      batchId: firstBatch?.id || "",
      className: firstBatch ? `${firstBatch.name} Session` : prev.className,
      teacherId: assignedTeacherId || prev.teacherId,
      startTime: firstBatch?.startTime || prev.startTime,
      endTime: firstBatch?.endTime || prev.endTime,
    }));
  };

  // Handle batch selection -> auto-identify teacher, start time, and end time
  const handleBatchChange = (batchId: string) => {
    const selected = batches.find((b) => b.id === batchId);
    if (!selected) {
      setForm((prev) => ({ ...prev, batchId }));
      return;
    }

    // Auto-identify assigned teacher from batch
    let teacherId = selected.teacherId;
    if (!teacherId && selected.teacherName) {
      const matchedTeacher = teachers.find(
        (t) =>
          t.fullName.toLowerCase().includes(selected.teacherName.toLowerCase()) ||
          selected.teacherName.toLowerCase().includes(t.fullName.toLowerCase())
      );
      teacherId = matchedTeacher?.id;
    }

    setForm((prev) => ({
      ...prev,
      batchId,
      className: `${selected.name} Session`,
      teacherId: teacherId || prev.teacherId,
      startTime: selected.startTime || prev.startTime,
      endTime: selected.endTime || prev.endTime,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!form.className.trim()) {
      setErrorMessage("Please enter a class name.");
      return;
    }
    if (!form.branchId) {
      setErrorMessage("Please select a studio branch.");
      return;
    }
    if (!form.batchId) {
      setErrorMessage("Please assign a batch to this class.");
      return;
    }
    if (!form.classDate) {
      setErrorMessage("Please specify the class date.");
      return;
    }
    if (!form.startTime.trim()) {
      setErrorMessage("Please specify the class starting time.");
      return;
    }
    if (!form.endTime.trim()) {
      setErrorMessage("Please specify the class ending time.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await onSave(form, editingClass?.id);
      if (res.success) {
        setSuccessMessage(
          isEditing
            ? "Class details updated successfully!"
            : "Class scheduled successfully in Supabase!"
        );
        setTimeout(() => {
          onClose();
        }, 600);
      } else {
        setErrorMessage(res.error || "Failed to schedule class.");
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "An unexpected error occurred while communicating with database.");
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
      <div className="relative w-full max-w-xl rounded-3xl bg-white border border-brand-border shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-950 via-purple-900 to-[#1A0D33] p-6 text-white shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-gold/20 text-brand-gold border border-brand-gold/30">
                <Sparkles size={20} />
              </div>
              <div>
                <h2 className="font-serif text-lg sm:text-xl font-bold text-white">
                  {isEditing ? `Edit Class: ${editingClass?.className}` : "Schedule Dance Class"}
                </h2>
                <p className="text-xs text-brand-gold/90 mt-0.5">
                  Plan individual recital sessions, masterclasses, and batch practice
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
              <div className="leading-relaxed font-medium">{errorMessage}</div>
            </div>
          )}

          {successMessage && (
            <div className="flex items-start gap-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 p-3.5 text-xs text-emerald-800 animate-fadeIn">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed font-semibold">{successMessage}</div>
            </div>
          )}

          {duplicateWarning && (
            <div className="flex items-start gap-2.5 rounded-2xl bg-amber-50 border border-amber-300 p-3.5 text-xs text-amber-900 animate-fadeIn">
              <ShieldAlert size={16} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold block mb-0.5">Potential Schedule Conflict Detected</strong>
                <p className="leading-relaxed">
                  A class (&quot;{duplicateWarning.className}&quot;) is already scheduled for this batch on{" "}
                  <strong>{form.classDate}</strong> at <strong>{duplicateWarning.startTime}</strong>.
                </p>
              </div>
            </div>
          )}

          {/* Class Name */}
          <div>
            <label htmlFor="class-name-input" className="block font-semibold text-brand-dark mb-1">
              Class Name <span className="text-brand-accent">*</span>
            </label>
            <input
              id="class-name-input"
              type="text"
              required
              placeholder="e.g. Tarangam Brass Plate Intensive Practice"
              value={form.className}
              onChange={(e) => setForm({ ...form, className: e.target.value })}
              className="w-full rounded-xl border border-brand-border bg-[#F8F9FA] px-3.5 py-2.5 text-xs text-brand-dark focus:bg-white focus:border-brand-primary focus:outline-none transition-all"
            />
          </div>

          {/* Branch & Batch Cascading Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="class-branch-select" className="block font-semibold text-brand-dark mb-1">
                Branch <span className="text-brand-accent">*</span>
              </label>
              <select
                id="class-branch-select"
                required
                value={form.branchId}
                onChange={(e) => handleBranchChange(e.target.value)}
                className="w-full rounded-xl border border-brand-border bg-[#F8F9FA] px-3.5 py-2.5 text-xs text-brand-dark focus:bg-white focus:border-brand-primary focus:outline-none"
              >
                {branches.length > 0 ? (
                  branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.city})
                    </option>
                  ))
                ) : (
                  <option value="a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11">Vijayawada Main Studio</option>
                )}
              </select>
            </div>

            <div>
              <label htmlFor="class-batch-select" className="block font-semibold text-brand-dark mb-1">
                Batch <span className="text-brand-accent">*</span>
              </label>
              <select
                id="class-batch-select"
                required
                value={form.batchId}
                onChange={(e) => handleBatchChange(e.target.value)}
                className="w-full rounded-xl border border-brand-border bg-[#F8F9FA] px-3.5 py-2.5 text-xs text-brand-dark focus:bg-white focus:border-brand-primary focus:outline-none"
              >
                {availableBatches.length > 0 ? (
                  availableBatches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.level})
                    </option>
                  ))
                ) : (
                  <option value="">No batches available for this branch</option>
                )}
              </select>
            </div>
          </div>

          {/* Teacher (Auto-Identified from Batch with override option) */}
          <div>
            <label htmlFor="class-teacher-select" className="block font-semibold text-brand-dark mb-1 flex items-center justify-between">
              <span>Teacher <span className="text-brand-accent">*</span></span>
              <span className="text-[0.65rem] text-brand-gold-dark font-normal">
                Auto-assigned from batch
              </span>
            </label>
            <select
              id="class-teacher-select"
              required
              value={form.teacherId || ""}
              onChange={(e) => setForm({ ...form, teacherId: e.target.value })}
              className="w-full rounded-xl border border-brand-border bg-[#F8F9FA] px-3.5 py-2.5 text-xs text-brand-dark focus:bg-white focus:border-brand-primary focus:outline-none"
            >
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.fullName} ({t.role})
                </option>
              ))}
            </select>
          </div>

          {/* Date, Start Time, End Time */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label htmlFor="class-date-input" className="block font-semibold text-brand-dark mb-1">
                Class Date <span className="text-brand-accent">*</span>
              </label>
              <input
                id="class-date-input"
                type="date"
                required
                value={form.classDate}
                onChange={(e) => setForm({ ...form, classDate: e.target.value })}
                className="w-full rounded-xl border border-brand-border bg-[#F8F9FA] px-3.5 py-2.5 text-xs text-brand-dark focus:bg-white focus:border-brand-primary focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="class-start-time" className="block font-semibold text-brand-dark mb-1">
                Start Time <span className="text-brand-accent">*</span>
              </label>
              <input
                id="class-start-time"
                type="text"
                required
                placeholder="05:00 PM"
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                className="w-full rounded-xl border border-brand-border bg-[#F8F9FA] px-3.5 py-2.5 text-xs text-brand-dark focus:bg-white focus:border-brand-primary focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="class-end-time" className="block font-semibold text-brand-dark mb-1">
                End Time <span className="text-brand-accent">*</span>
              </label>
              <input
                id="class-end-time"
                type="text"
                required
                placeholder="06:30 PM"
                value={form.endTime}
                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                className="w-full rounded-xl border border-brand-border bg-[#F8F9FA] px-3.5 py-2.5 text-xs text-brand-dark focus:bg-white focus:border-brand-primary focus:outline-none"
              />
            </div>
          </div>

          {/* Status & Optional Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1">
              <label htmlFor="class-status-select" className="block font-semibold text-brand-dark mb-1">
                Class Status <span className="text-brand-accent">*</span>
              </label>
              <select
                id="class-status-select"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as ClassStatus })}
                className="w-full rounded-xl border border-brand-border bg-[#F8F9FA] px-3.5 py-2.5 text-xs text-brand-dark focus:bg-white focus:border-brand-primary focus:outline-none"
              >
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="class-notes-input" className="block font-semibold text-brand-dark mb-1">
                Optional Notes / Lesson Plan
              </label>
              <input
                id="class-notes-input"
                type="text"
                placeholder="Focus on Jatis 4 &amp; 5, bring Ghungroos"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full rounded-xl border border-brand-border bg-[#F8F9FA] px-3.5 py-2.5 text-xs text-brand-dark focus:bg-white focus:border-brand-primary focus:outline-none"
              />
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
            disabled={isSubmitting || Boolean(duplicateWarning)}
            type="button"
            className="inline-flex items-center gap-1.5 rounded-xl bg-purple-950 px-5 py-2.5 text-xs font-bold text-brand-gold shadow-md hover:bg-purple-900 active:scale-95 transition-all disabled:opacity-60 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={14} className="animate-spin text-brand-gold" />
                <span>Saving to Supabase...</span>
              </>
            ) : (
              <span>{isEditing ? "Update Class" : "Schedule Class"}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}