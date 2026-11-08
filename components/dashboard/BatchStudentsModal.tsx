"use client";

import { useState } from "react";
import {
  X,
  Users,
  Building2,
  Calendar,
  Clock,
  UserCheck,
  ArrowRightLeft,
  MessageCircle,
  Phone,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { Batch, Student, Branch } from "@/lib/types/academy";

export default function BatchStudentsModal({
  batch,
  branch,
  allBatches,
  students,
  onClose,
  onTransferStudent,
}: {
  batch: Batch;
  branch?: Branch;
  allBatches: Batch[];
  students: Student[];
  onClose: () => void;
  onTransferStudent: (
    studentId: string,
    targetBatchId: string
  ) => Promise<{ success: boolean; error?: string }>;
}) {
  const batchStudents = students.filter((s) => s.batchId === batch.id);

  // Transfer Student Sub-State
  const [transferringStudent, setTransferringStudent] = useState<Student | null>(null);
  const [targetBatchId, setTargetBatchId] = useState<string>("");
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferStatus, setTransferStatus] = useState<"idle" | "success" | "error">("idle");
  const [transferMessage, setTransferMessage] = useState<string | null>(null);

  const availableTargetBatches = allBatches.filter((b) => b.id !== batch.id);

  const handleStartTransfer = (student: Student) => {
    setTransferringStudent(student);
    setTargetBatchId(availableTargetBatches[0]?.id || "");
    setTransferStatus("idle");
    setTransferMessage(null);
  };

  const handleConfirmTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferringStudent || !targetBatchId) return;

    try {
      setIsTransferring(true);
      const res = await onTransferStudent(transferringStudent.id, targetBatchId);
      if (res.success) {
        setTransferStatus("success");
        const targetBatch = allBatches.find((b) => b.id === targetBatchId);
        setTransferMessage(
          `Successfully transferred ${transferringStudent.fullName} to "${targetBatch?.name}". All historical attendance and fee receipts have been safely preserved.`
        );
        setTimeout(() => {
          setTransferringStudent(null);
          setTransferStatus("idle");
        }, 2200);
      } else {
        setTransferStatus("error");
        setTransferMessage(res.error || "Failed to transfer student.");
      }
    } catch (err: any) {
      setTransferStatus("error");
      setTransferMessage(err?.message || "An unexpected error occurred during transfer.");
    } finally {
      setIsTransferring(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-purple-950/70 backdrop-blur-sm animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-2xl rounded-3xl bg-white border border-brand-border shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-purple-950 via-purple-900 to-[#1A0D33] p-6 text-white shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="rounded-full bg-brand-gold/20 text-brand-gold border border-brand-gold/30 px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider">
                  {batch.level}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[0.62rem] font-bold uppercase ${
                    batch.isActive || batch.status === "active"
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/40"
                      : "bg-gray-500/20 text-gray-300 border border-gray-400/40"
                  }`}
                >
                  {batch.status || (batch.isActive ? "active" : "inactive")}
                </span>
              </div>

              <h2 className="font-serif text-xl sm:text-2xl font-bold text-white mt-1.5">
                {batch.name}
              </h2>

              <div className="flex items-center gap-4 mt-2 text-xs text-white/80 flex-wrap">
                <span className="flex items-center gap-1.5">
                  <Building2 size={13} className="text-brand-gold" />
                  <span>{branch?.name || "Vijayawada Main Studio"}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <UserCheck size={13} className="text-brand-gold" />
                  <span>{batch.teacherName}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={13} className="text-brand-gold" />
                  <span>
                    {batch.scheduleDays.join(", ")} • {batch.startTime} – {batch.endTime}
                  </span>
                </span>
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

        {/* Transfer Student Inline Drawer / Sub-Modal */}
        {transferringStudent && (
          <div className="bg-[#FAF9F6] border-b border-brand-border p-5 animate-fadeIn">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-100 text-purple-950">
                  <ArrowRightLeft size={16} />
                </div>
                <div>
                  <h4 className="font-serif text-sm font-bold text-brand-dark">
                    Transfer Student: {transferringStudent.fullName}
                  </h4>
                  <p className="text-[0.68rem] text-brand-muted">
                    Moving from <strong>{batch.name}</strong> to a new batch
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setTransferringStudent(null)}
                className="text-brand-muted hover:text-brand-dark"
              >
                <X size={16} />
              </button>
            </div>

            {transferStatus === "success" ? (
              <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-3.5 text-xs text-emerald-800 flex items-center gap-2.5">
                <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                <span>{transferMessage}</span>
              </div>
            ) : (
              <form onSubmit={handleConfirmTransfer} className="space-y-3 text-xs">
                {transferStatus === "error" && (
                  <div className="rounded-xl bg-rose-50 border border-rose-200 p-2.5 text-xs text-rose-800 flex items-center gap-2">
                    <AlertCircle size={14} className="text-rose-600 shrink-0" />
                    <span>{transferMessage}</span>
                  </div>
                )}

                <div>
                  <label htmlFor="target-batch-select" className="block font-semibold text-brand-dark mb-1">
                    Select Target Dance Batch
                  </label>
                  <select
                    id="target-batch-select"
                    required
                    value={targetBatchId}
                    onChange={(e) => setTargetBatchId(e.target.value)}
                    className="w-full rounded-xl border border-brand-border bg-white px-3.5 py-2 text-xs text-brand-dark focus:border-brand-primary focus:outline-none cursor-pointer"
                  >
                    {availableTargetBatches.map((tb) => (
                      <option key={tb.id} value={tb.id}>
                        {tb.name} ({tb.scheduleDays.join(", ")} • ₹{tb.monthlyFee}/mo)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Ledger Preservation Notice */}
                <div className="rounded-xl bg-purple-50/70 border border-purple-100 p-2.5 text-[0.68rem] text-purple-900 flex items-start gap-2">
                  <ShieldCheck size={14} className="text-brand-primary-dark shrink-0 mt-0.5" />
                  <p>
                    <strong>Financial &amp; Attendance Safety Guarantee:</strong> Previous attendance logs and paid fee receipts remain permanently linked to the student&apos;s classical profile and will not be erased.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setTransferringStudent(null)}
                    className="rounded-xl border border-brand-border bg-white px-3.5 py-1.5 text-xs font-semibold text-brand-dark hover:bg-gray-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isTransferring}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-purple-950 px-4 py-1.5 text-xs font-bold text-brand-gold shadow-sm hover:bg-purple-900 transition-all disabled:opacity-60 cursor-pointer"
                  >
                    {isTransferring ? (
                      <>
                        <Loader2 size={13} className="animate-spin text-brand-gold" />
                        <span>Transferring...</span>
                      </>
                    ) : (
                      <>
                        <ArrowRightLeft size={13} />
                        <span>Confirm Transfer</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Enrolled Students Table Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-sm font-bold text-brand-dark flex items-center gap-2">
              <Users size={16} className="text-brand-primary-dark" />
              <span>Enrolled Dancers ({batchStudents.length} / {batch.maxCapacity})</span>
            </h3>

            <span className="text-xs text-brand-muted">
              Capacity: {Math.round((batchStudents.length / batch.maxCapacity) * 100)}%
            </span>
          </div>

          {batchStudents.length === 0 ? (
            <div className="py-12 text-center text-brand-muted bg-[#F8F9FA] rounded-2xl border border-brand-border">
              <Users size={32} className="mx-auto text-brand-muted/60 mb-2" />
              <p className="font-semibold text-brand-dark text-xs">No students currently enrolled in this batch.</p>
              <p className="text-[0.68rem] text-brand-muted mt-0.5">
                New admissions can be assigned to this batch from the Student Management roster.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-brand-border bg-white shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8F9FA] border-b border-brand-border text-brand-muted text-[0.65rem] uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-4">Code &amp; Name</th>
                    <th className="py-3 px-4">Parent Phone</th>
                    <th className="py-3 px-4">Level</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border/60">
                  {batchStudents.map((s) => {
                    const studentCode = s.studentCode || s.admissionNumber || "AN-2026-000";
                    const parentPhone = s.parentPhone || s.phone || "";
                    const cleanPhone = parentPhone.replace(/\D/g, "");

                    return (
                      <tr key={s.id} className="hover:bg-purple-50/30 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-semibold text-brand-dark block text-xs">
                            {s.fullName}
                          </span>
                          <span className="font-mono text-[0.62rem] text-brand-gold-dark bg-brand-gold/10 px-1 rounded border border-brand-gold/20">
                            {studentCode}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-brand-muted text-xs">{parentPhone}</span>
                            <a
                              href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                                `Namaste regarding ${s.fullName} in ${batch.name}.`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-700 hover:text-emerald-800 p-0.5"
                              title="Chat on WhatsApp"
                            >
                              <MessageCircle size={13} />
                            </a>
                            <a
                              href={`tel:${parentPhone}`}
                              className="text-purple-800 hover:text-purple-950 p-0.5"
                              title="Call Parent"
                            >
                              <Phone size={12} />
                            </a>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span className="rounded-full bg-purple-50 border border-purple-100 px-2 py-0.5 text-[0.62rem] font-semibold text-brand-primary-dark">
                            {s.level || "Beginner"}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[0.62rem] font-bold ${
                              s.status === "active"
                                ? "bg-emerald-50 text-emerald-800"
                                : s.status === "on_leave"
                                ? "bg-amber-50 text-amber-800"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {s.status}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleStartTransfer(s)}
                            className="inline-flex items-center gap-1 rounded-lg border border-brand-primary/40 bg-[#F5F0FC] px-2.5 py-1 text-[0.68rem] font-semibold text-brand-primary-dark hover:bg-brand-primary hover:text-white transition-all active:scale-95"
                            title="Transfer dancer to another batch"
                          >
                            <ArrowRightLeft size={11} />
                            <span>Transfer</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-brand-border bg-[#F8F9FA] flex items-center justify-between shrink-0">
          <span className="text-[0.68rem] text-brand-muted">
            Batch Tuition: <strong>₹{batch.monthlyFee}/month</strong>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-brand-border bg-white px-4 py-2 text-xs font-semibold text-brand-dark hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
