"use client";

import { useState, useEffect } from "react";
import {
  X,
  User,
  HeartHandshake,
  Phone,
  Building2,
  Calendar,
  CreditCard,
  MapPin,
  AlertCircle,
  Sparkles,
  Loader2,
  ShieldAlert,
} from "lucide-react";
import { Student, Batch, Branch } from "@/lib/types/academy";
import { StudentInput, findDuplicateStudent, generateNextStudentCode } from "@/lib/services/studentService";

export default function StudentFormModal({
  isOpen,
  onClose,
  onSave,
  editingStudent,
  branches,
  batches,
  existingStudents,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (input: StudentInput, studentId?: string) => Promise<{ success: boolean; error?: string }>;
  editingStudent?: Student | null;
  branches: Branch[];
  batches: Batch[];
  existingStudents: Student[];
}) {
  const isEditing = Boolean(editingStudent);

  // Suggested code for preview
  const defaultCode = isEditing
    ? editingStudent?.studentCode || editingStudent?.admissionNumber || "AN-2026-000"
    : generateNextStudentCode(existingStudents);

  const defaultBranchId = editingStudent?.branchId || branches[0]?.id || "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
  const defaultBatchId = editingStudent?.batchId || batches[0]?.id || "";
  const initialBatch = batches.find((b) => b.id === defaultBatchId);

  const [form, setForm] = useState<StudentInput>({
    fullName: editingStudent?.fullName || "",
    dateOfBirth: editingStudent?.dateOfBirth || "",
    gender: editingStudent?.gender || "female",
    parentName: editingStudent?.parentName || "",
    parentPhone: editingStudent?.parentPhone || editingStudent?.phone || "",
    studentPhone: editingStudent?.studentPhone || "",
    address: editingStudent?.address || "",
    joiningDate: editingStudent?.joiningDate || editingStudent?.enrollmentDate || new Date().toISOString().split("T")[0],
    branchId: defaultBranchId,
    batchId: defaultBatchId,
    monthlyFee: editingStudent?.monthlyFee || initialBatch?.monthlyFee || 1500,
    level: editingStudent?.level || "Beginner",
    status: editingStudent?.status || "active",
    notes: editingStudent?.notes || "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<Student | null>(null);

  // Reset form when modal opens or editingStudent changes
  useEffect(() => {
    if (editingStudent) {
      setForm({
        fullName: editingStudent.fullName,
        dateOfBirth: editingStudent.dateOfBirth || "",
        gender: editingStudent.gender || "female",
        parentName: editingStudent.parentName,
        parentPhone: editingStudent.parentPhone || editingStudent.phone || "",
        studentPhone: editingStudent.studentPhone || "",
        address: editingStudent.address || "",
        joiningDate: editingStudent.joiningDate || editingStudent.enrollmentDate || new Date().toISOString().split("T")[0],
        branchId: editingStudent.branchId || branches[0]?.id || "",
        batchId: editingStudent.batchId || batches[0]?.id || "",
        monthlyFee: editingStudent.monthlyFee || 1500,
        level: editingStudent.level || "Beginner",
        status: editingStudent.status || "active",
        notes: editingStudent.notes || "",
      });
    } else {
      const firstBatch = batches[0];
      setForm({
        fullName: "",
        dateOfBirth: "",
        gender: "female",
        parentName: "",
        parentPhone: "",
        studentPhone: "",
        address: "",
        joiningDate: new Date().toISOString().split("T")[0],
        branchId: branches[0]?.id || "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
        batchId: firstBatch?.id || "",
        monthlyFee: firstBatch?.monthlyFee || 1500,
        level: "Beginner",
        status: "active",
        notes: "",
      });
    }
    setErrorMessage(null);
    setDuplicateWarning(null);
  }, [editingStudent, branches, batches, isOpen]);

  // Real-time check for accidental duplicate entries
  useEffect(() => {
    if (form.fullName.trim().length >= 3 && form.parentPhone.replace(/\D/g, "").length >= 7) {
      const match = findDuplicateStudent(
        existingStudents,
        form.fullName,
        form.parentPhone,
        editingStudent?.id
      );
      setDuplicateWarning(match);
    } else {
      setDuplicateWarning(null);
    }
  }, [form.fullName, form.parentPhone, existingStudents, editingStudent]);

  // When batch changes, automatically update the suggested monthly fee
  const handleBatchChange = (batchId: string) => {
    const selected = batches.find((b) => b.id === batchId);
    setForm((prev) => ({
      ...prev,
      batchId,
      monthlyFee: selected ? selected.monthlyFee : prev.monthlyFee,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (!form.fullName.trim()) {
      setErrorMessage("Please enter the student's full name.");
      return;
    }
    if (!form.parentName.trim()) {
      setErrorMessage("Please enter the parent or guardian name.");
      return;
    }
    if (!form.parentPhone.trim()) {
      setErrorMessage("Please enter the parent contact phone number.");
      return;
    }
    if (!form.branchId) {
      setErrorMessage("Please select a studio branch.");
      return;
    }
    if (!form.batchId) {
      setErrorMessage("Please assign a dance batch.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await onSave(form, editingStudent?.id);
      if (res.success) {
        onClose();
      } else {
        setErrorMessage(res.error || "Unable to save student record.");
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
      <div className="relative w-full max-w-2xl rounded-3xl bg-white border border-brand-border shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-950 via-purple-900 to-[#1A0D33] p-6 text-white shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-gold/20 text-brand-gold border border-brand-gold/30">
                <Sparkles size={20} />
              </div>
              <div>
                <h2 className="font-serif text-lg sm:text-xl font-bold text-white">
                  {isEditing ? `Edit Student: ${editingStudent?.fullName}` : "Enroll New Student"}
                </h2>
                <div className="flex items-center gap-2 text-xs text-brand-gold/90 font-mono mt-0.5">
                  <span>Student Code: {defaultCode}</span>
                  {isEditing && <span>• Preserving Historical Audit</span>}
                </div>
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

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-xs text-brand-dark flex-1">
          {/* Error Notice */}
          {errorMessage && (
            <div className="flex items-start gap-2.5 rounded-2xl bg-rose-50 border border-rose-200 p-3.5 text-xs text-rose-800 animate-fadeIn">
              <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {/* Duplicate Registration Warning Banner */}
          {duplicateWarning && (
            <div className="flex items-start gap-3 rounded-2xl bg-amber-50 border border-amber-300 p-4 text-xs text-amber-900 animate-fadeIn">
              <ShieldAlert size={18} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold block mb-0.5">
                  Potential Duplicate Registration Detected
                </strong>
                <p className="leading-relaxed">
                  A student named <strong>&quot;{duplicateWarning.fullName}&quot;</strong> is already registered with parent phone{" "}
                  <strong>{form.parentPhone}</strong> (Code:{" "}
                  <span className="font-mono">{duplicateWarning.studentCode || duplicateWarning.admissionNumber}</span>).
                  Please verify to prevent accidental double enrollment.
                </p>
              </div>
            </div>
          )}

          {/* Section 1: Student Information */}
          <div className="space-y-3">
            <h3 className="font-serif text-xs font-bold uppercase tracking-wider text-brand-muted flex items-center gap-1.5 border-b border-brand-border pb-1.5">
              <User size={13} className="text-brand-gold-dark" />
              <span>Student Personal Details</span>
            </h3>

            <div>
              <label htmlFor="student-full-name" className="block font-semibold text-brand-dark mb-1">
                Full Name <span className="text-brand-accent">*</span>
              </label>
              <input
                id="student-full-name"
                type="text"
                required
                placeholder="e.g. Sravani Manepalli"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                className="w-full rounded-xl border border-brand-border bg-[#F8F9FA] px-3.5 py-2.5 text-xs text-brand-dark focus:bg-white focus:border-brand-primary focus:outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="student-dob" className="block font-semibold text-brand-dark mb-1">
                  Date of Birth
                </label>
                <input
                  id="student-dob"
                  type="date"
                  value={form.dateOfBirth}
                  onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                  className="w-full rounded-xl border border-brand-border bg-[#F8F9FA] px-3.5 py-2.5 text-xs text-brand-dark focus:bg-white focus:border-brand-primary focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="student-gender" className="block font-semibold text-brand-dark mb-1">
                  Gender
                </label>
                <select
                  id="student-gender"
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value as any })}
                  className="w-full rounded-xl border border-brand-border bg-[#F8F9FA] px-3.5 py-2.5 text-xs text-brand-dark focus:bg-white focus:border-brand-primary focus:outline-none"
                >
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Parent & Contact Details */}
          <div className="space-y-3 pt-2">
            <h3 className="font-serif text-xs font-bold uppercase tracking-wider text-brand-muted flex items-center gap-1.5 border-b border-brand-border pb-1.5">
              <HeartHandshake size={13} className="text-brand-primary" />
              <span>Parent &amp; Guardian Contact</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="parent-guardian-name" className="block font-semibold text-brand-dark mb-1">
                  Parent / Guardian Name <span className="text-brand-accent">*</span>
                </label>
                <input
                  id="parent-guardian-name"
                  type="text"
                  required
                  placeholder="e.g. Srinivasa Rao M."
                  value={form.parentName}
                  onChange={(e) => setForm({ ...form, parentName: e.target.value })}
                  className="w-full rounded-xl border border-brand-border bg-[#F8F9FA] px-3.5 py-2.5 text-xs text-brand-dark focus:bg-white focus:border-brand-primary focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="parent-phone-number" className="block font-semibold text-brand-dark mb-1">
                  Parent Phone / WhatsApp <span className="text-brand-accent">*</span>
                </label>
                <input
                  id="parent-phone-number"
                  type="tel"
                  required
                  placeholder="+91 98480 12345"
                  value={form.parentPhone}
                  onChange={(e) => setForm({ ...form, parentPhone: e.target.value })}
                  className="w-full rounded-xl border border-brand-border bg-[#F8F9FA] px-3.5 py-2.5 text-xs text-brand-dark focus:bg-white focus:border-brand-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="student-direct-phone" className="block font-semibold text-brand-dark mb-1">
                  Student Phone <span className="text-brand-muted font-normal">(Optional)</span>
                </label>
                <input
                  id="student-direct-phone"
                  type="tel"
                  placeholder="Student direct contact"
                  value={form.studentPhone}
                  onChange={(e) => setForm({ ...form, studentPhone: e.target.value })}
                  className="w-full rounded-xl border border-brand-border bg-[#F8F9FA] px-3.5 py-2.5 text-xs text-brand-dark focus:bg-white focus:border-brand-primary focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="student-residence-address" className="block font-semibold text-brand-dark mb-1">
                  Residential Address
                </label>
                <input
                  id="student-residence-address"
                  type="text"
                  placeholder="e.g. Benz Circle, Vijayawada"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full rounded-xl border border-brand-border bg-[#F8F9FA] px-3.5 py-2.5 text-xs text-brand-dark focus:bg-white focus:border-brand-primary focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Studio & Batch Assignment */}
          <div className="space-y-3 pt-2">
            <h3 className="font-serif text-xs font-bold uppercase tracking-wider text-brand-muted flex items-center gap-1.5 border-b border-brand-border pb-1.5">
              <Building2 size={13} className="text-brand-gold-dark" />
              <span>Studio Branch &amp; Batch Assignment</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="student-branch-select" className="block font-semibold text-brand-dark mb-1">
                  Studio Branch <span className="text-brand-accent">*</span>
                </label>
                <select
                  id="student-branch-select"
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
                <label htmlFor="student-batch-select" className="block font-semibold text-brand-dark mb-1">
                  Assign Dance Batch <span className="text-brand-accent">*</span>
                </label>
                <select
                  id="student-batch-select"
                  required
                  value={form.batchId}
                  onChange={(e) => handleBatchChange(e.target.value)}
                  className="w-full rounded-xl border border-brand-border bg-[#F8F9FA] px-3.5 py-2.5 text-xs text-brand-dark focus:bg-white focus:border-brand-primary focus:outline-none"
                >
                  {batches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} — ₹{b.monthlyFee}/mo
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label htmlFor="student-monthly-fee" className="block font-semibold text-brand-dark mb-1">
                  Monthly Fee (₹) <span className="text-brand-accent">*</span>
                </label>
                <input
                  id="student-monthly-fee"
                  type="number"
                  min="0"
                  step="50"
                  required
                  value={form.monthlyFee}
                  onChange={(e) => setForm({ ...form, monthlyFee: Number(e.target.value) })}
                  className="w-full rounded-xl border border-brand-border bg-[#F8F9FA] px-3.5 py-2.5 text-xs text-brand-dark focus:bg-white focus:border-brand-primary focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="student-joining-date" className="block font-semibold text-brand-dark mb-1">
                  Joining Date <span className="text-brand-accent">*</span>
                </label>
                <input
                  id="student-joining-date"
                  type="date"
                  required
                  value={form.joiningDate}
                  onChange={(e) => setForm({ ...form, joiningDate: e.target.value })}
                  className="w-full rounded-xl border border-brand-border bg-[#F8F9FA] px-3.5 py-2.5 text-xs text-brand-dark focus:bg-white focus:border-brand-primary focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="student-dance-level" className="block font-semibold text-brand-dark mb-1">
                  Dance Level
                </label>
                <select
                  id="student-dance-level"
                  value={form.level}
                  onChange={(e) => setForm({ ...form, level: e.target.value as any })}
                  className="w-full rounded-xl border border-brand-border bg-[#F8F9FA] px-3.5 py-2.5 text-xs text-brand-dark focus:bg-white focus:border-brand-primary focus:outline-none"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="student-status-select" className="block font-semibold text-brand-dark mb-1">
                  Student Status
                </label>
                <select
                  id="student-status-select"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                  className="w-full rounded-xl border border-brand-border bg-[#F8F9FA] px-3.5 py-2.5 text-xs text-brand-dark focus:bg-white focus:border-brand-primary focus:outline-none"
                >
                  <option value="active">Active</option>
                  <option value="on_leave">On Leave</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label htmlFor="student-artistic-notes" className="block font-semibold text-brand-dark mb-1">
                  Classical Background / Notes
                </label>
                <input
                  id="student-artistic-notes"
                  type="text"
                  placeholder="Stage experience, Tarangam recital, etc."
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full rounded-xl border border-brand-border bg-[#F8F9FA] px-3.5 py-2.5 text-xs text-brand-dark focus:bg-white focus:border-brand-primary focus:outline-none"
                />
              </div>
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
              <span>{isEditing ? "Update Student Profile" : "Save & Register Student"}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
