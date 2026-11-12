"use client";

import { useState } from "react";
import {
  Calendar,
  Clock,
  Users,
  Plus,
  Sparkles,
  CreditCard,
  UserCheck,
  Building2,
  Edit,
  Power,
  PowerOff,
  Eye,
  CheckCircle2,
} from "lucide-react";
import { Batch, Student, Branch } from "@/lib/types/academy";
import BatchFormModal from "@/components/dashboard/BatchFormModal";
import BatchStudentsModal from "@/components/dashboard/BatchStudentsModal";
import { BatchInput, BatchServiceResult } from "@/lib/services/batchService";
import { TeacherProfile } from "@/lib/services/teacherService";

export default function BatchesView({
  batches,
  students,
  branches = [],
  teachers,
  onAddBatch,
  onEditBatch,
  onToggleStatus,
  onTransferStudent,
}: {
  batches: Batch[];
  students: Student[];
  branches?: Branch[];
  teachers?: TeacherProfile[];
  onAddBatch: (batch: BatchInput) => Promise<BatchServiceResult>;
  onEditBatch: (batchId: string, updates: Partial<BatchInput>) => Promise<BatchServiceResult>;
  onToggleStatus: (batchId: string) => Promise<BatchServiceResult>;
  onTransferStudent: (
    studentId: string,
    targetBatchId: string
  ) => Promise<{ success: boolean; error?: string }>;
}) {
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);
  const [viewingBatchStudents, setViewingBatchStudents] = useState<Batch | null>(null);

  // Filters
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const filteredBatches = batches.filter((b) => {
    const matchesBranch = selectedBranch === "all" || b.branchId === selectedBranch;
    const isAct = b.isActive || b.status === "active";
    const matchesStatus =
      selectedStatus === "all" ||
      (selectedStatus === "active" && isAct) ||
      (selectedStatus === "inactive" && !isAct);

    return matchesBranch && matchesStatus;
  });

  const handleOpenAdd = () => {
    setEditingBatch(null);
    setShowAddModal(true);
  };

  const handleOpenEdit = (batch: Batch) => {
    setEditingBatch(batch);
    setShowAddModal(true);
  };

  const handleSaveBatch = async (input: BatchInput, batchId?: string) => {
    if (batchId) {
      return await onEditBatch(batchId, input);
    } else {
      return await onAddBatch(input);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-xl sm:text-2xl font-bold text-brand-dark">
              Batch &amp; Timetable Management
            </h1>
            <span className="rounded-full bg-brand-primary/10 border border-brand-primary/30 px-3 py-0.5 text-xs font-bold text-brand-primary-dark">
              {batches.length} Batches
            </span>
          </div>
          <p className="text-xs text-brand-muted mt-1">
            Configure classical training schedules, guru assignments, studio branches, and student allocations.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          type="button"
          className="inline-flex items-center gap-2 rounded-xl bg-brand-gold px-4 py-2.5 text-xs font-bold text-purple-950 shadow-gold-sm hover:brightness-105 active:scale-95 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus size={15} />
          <span>Create New Batch</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-brand-border shadow-sm text-xs">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Building2 size={14} className="text-brand-gold-dark" />
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="rounded-xl border border-brand-border bg-[#F8F9FA] px-3 py-2 text-xs text-brand-dark focus:border-brand-primary focus:bg-white focus:outline-none cursor-pointer"
            >
              <option value="all">All Studio Branches</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="rounded-xl border border-brand-border bg-[#F8F9FA] px-3 py-2 text-xs text-brand-dark focus:border-brand-primary focus:bg-white focus:outline-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Batches Only</option>
              <option value="inactive">Inactive Batches Only</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-brand-muted">
          Showing <strong>{filteredBatches.length}</strong> of {batches.length} batches
        </div>
      </div>

      {/* Batches Overview Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-5">
        {filteredBatches.map((batch) => {
          const isAct = batch.isActive || batch.status === "active";
          const branch = branches.find((br) => br.id === batch.branchId);
          const batchStudents = students.filter(
            (s) => s.batchId === batch.id && s.status === "active"
          );
          const capacityPct = Math.min(
            Math.round((batchStudents.length / batch.maxCapacity) * 100),
            100
          );

          return (
            <div
              key={batch.id}
              className={`rounded-3xl border bg-white p-5 sm:p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${
                isAct ? "border-brand-border" : "border-gray-300 opacity-75 bg-gray-50/50"
              }`}
            >
              <div>
                {/* Card Top: Level, Status & Monthly Fee */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <span className="rounded-full bg-purple-50 border border-purple-100 px-2.5 py-0.5 text-[0.65rem] font-semibold text-brand-primary-dark uppercase tracking-wider">
                        {batch.level}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[0.62rem] font-bold uppercase ${
                          isAct
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : "bg-gray-200 text-gray-700 border border-gray-300"
                        }`}
                      >
                        {isAct ? "Active" : "Inactive"}
                      </span>
                    </div>

                    <h3 className="font-serif text-lg font-bold text-brand-dark">
                      {batch.name}
                    </h3>

                    <div className="flex items-center gap-1.5 text-xs text-brand-muted mt-0.5">
                      <Building2 size={12} className="text-brand-gold-dark shrink-0" />
                      <span>{branch?.name || "Vijayawada Main Studio"}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-serif text-xl font-bold text-purple-950">
                      ₹{batch.monthlyFee.toLocaleString("en-IN")}
                    </span>
                    <span className="text-[0.65rem] text-brand-muted block">/ month</span>
                  </div>
                </div>

                {/* Schedule Details Box */}
                <div className="mt-4 space-y-2 text-xs text-brand-dark/90 bg-[#F8F9FA] p-3.5 rounded-2xl border border-brand-border">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-brand-gold-dark shrink-0" />
                    <span className="font-semibold text-brand-dark">
                      {batch.scheduleDays.join(", ")}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-brand-gold-dark shrink-0" />
                    <span>
                      {batch.startTime} – {batch.endTime}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <UserCheck size={14} className="text-brand-primary-dark shrink-0" />
                    <span>
                      Guru: <strong>{batch.teacherName}</strong>
                    </span>
                  </div>
                </div>

                {/* Capacity Progress Bar */}
                <div className="mt-4 pt-3 border-t border-brand-border">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-brand-muted flex items-center gap-1">
                      <Users size={13} className="text-brand-primary-dark" />
                      <span>Enrolled Dancers</span>
                    </span>
                    <span className="font-bold text-brand-dark">
                      {batchStudents.length} / {batch.maxCapacity} ({capacityPct}%)
                    </span>
                  </div>

                  <div className="w-full bg-purple-100/70 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        capacityPct >= 90
                          ? "bg-rose-500"
                          : capacityPct >= 70
                          ? "bg-amber-500"
                          : "bg-brand-gold"
                      }`}
                      style={{ width: `${capacityPct}%` }}
                    />
                  </div>
                </div>

                {/* Enrolled Students Preview Chips */}
                <div className="mt-3">
                  <div className="flex flex-wrap gap-1">
                    {batchStudents.length === 0 ? (
                      <span className="text-[0.68rem] text-brand-muted italic">
                        No students enrolled currently
                      </span>
                    ) : (
                      batchStudents.slice(0, 4).map((s) => (
                        <span
                          key={s.id}
                          className="rounded-lg bg-white border border-brand-border px-2 py-0.5 text-[0.68rem] text-brand-dark font-medium shadow-2xs"
                        >
                          {s.fullName}
                        </span>
                      ))
                    )}
                    {batchStudents.length > 4 && (
                      <span className="rounded-lg bg-purple-100 px-2 py-0.5 text-[0.68rem] text-brand-primary-dark font-bold">
                        +{batchStudents.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="mt-5 pt-3 border-t border-brand-border flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setViewingBatchStudents(batch)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-purple-950 px-3.5 py-1.5 text-xs font-semibold text-brand-gold hover:bg-purple-900 transition-colors cursor-pointer"
                >
                  <Eye size={13} />
                  <span>View Students ({batchStudents.length})</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(batch)}
                    className="flex h-8 w-8 items-center justify-center rounded-xl border border-brand-border bg-white text-brand-muted hover:border-brand-primary hover:text-brand-primary-dark hover:bg-[#F5F0FC] transition-colors"
                    title="Edit Batch Information"
                  >
                    <Edit size={14} />
                  </button>

                  <button
                    type="button"
                    onClick={() => onToggleStatus(batch.id)}
                    className={`flex h-8 w-8 items-center justify-center rounded-xl border transition-colors ${
                      isAct
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200"
                        : "border-gray-300 bg-gray-100 text-gray-500 hover:bg-emerald-50 hover:text-emerald-700"
                    }`}
                    title={isAct ? "Deactivate Batch" : "Activate Batch"}
                  >
                    {isAct ? <Power size={14} /> : <PowerOff size={14} />}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Batch Form Modal (Create / Edit) */}
      <BatchFormModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleSaveBatch}
        editingBatch={editingBatch}
        branches={branches}
        teachers={teachers}
        existingBatches={batches}
      />

      {/* Batch Enrolled Students & Transfer Modal */}
      {viewingBatchStudents && (
        <BatchStudentsModal
          batch={viewingBatchStudents}
          branch={branches.find((b) => b.id === viewingBatchStudents.branchId)}
          allBatches={batches}
          students={students}
          onClose={() => setViewingBatchStudents(null)}
          onTransferStudent={onTransferStudent}
        />
      )}
    </div>
  );
}
