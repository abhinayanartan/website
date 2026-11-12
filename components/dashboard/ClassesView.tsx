"use client";

import { useState, useMemo } from "react";
import {
  CalendarDays,
  Clock,
  Users,
  Building2,
  UserCheck,
  Plus,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Edit,
  Trash2,
  Calendar as CalendarIcon,
} from "lucide-react";
import { DanceClass, Batch, Branch, ClassStatus, ClassInput, ClassServiceResult } from "@/lib/types/academy";
import { TeacherProfile, FALLBACK_TEACHERS } from "@/lib/services/teacherService";
import ClassFormModal from "@/components/dashboard/ClassFormModal";

export default function ClassesView({
  classes = [],
  batches = [],
  branches = [],
  teachers = FALLBACK_TEACHERS,
  onAddClass,
  onEditClass,
  onDeleteClass,
}: {
  classes: DanceClass[];
  batches: Batch[];
  branches?: Branch[];
  teachers?: TeacherProfile[];
  onAddClass: (input: ClassInput) => Promise<ClassServiceResult>;
  onEditClass: (classId: string, updates: Partial<ClassInput>) => Promise<ClassServiceResult>;
  onDeleteClass: (classId: string) => Promise<{ success: boolean; error?: string }>;
}) {
  const [activeTab, setActiveTab] = useState<"all" | "upcoming" | "completed">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [selectedBatch, setSelectedBatch] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingClass, setEditingClass] = useState<DanceClass | null>(null);

  const todayStr = new Date().toISOString().split("T")[0];

  // Filtering
  const filteredClasses = useMemo(() => {
    return classes.filter((c) => {
      // Tab filter
      if (activeTab === "upcoming") {
        if (c.status === "completed") return false;
        if (c.classDate < todayStr && c.status !== "scheduled") return false;
      } else if (activeTab === "completed") {
        if (c.status !== "completed") return false;
      }

      // Search term
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesName = c.className.toLowerCase().includes(term);
        const matchesTeacher = (c.teacherName || "").toLowerCase().includes(term);
        const matchesBatch = (c.batchName || "").toLowerCase().includes(term);
        if (!matchesName && !matchesTeacher && !matchesBatch) return false;
      }

      // Branch filter
      if (selectedBranch !== "all" && c.branchId !== selectedBranch) {
        return false;
      }

      // Batch filter
      if (selectedBatch !== "all" && c.batchId !== selectedBatch) {
        return false;
      }

      // Status filter
      if (selectedStatus !== "all" && c.status !== selectedStatus) {
        return false;
      }

      return true;
    });
  }, [classes, activeTab, searchTerm, selectedBranch, selectedBatch, selectedStatus, todayStr]);

  const upcomingCount = classes.filter(
    (c) => c.status === "scheduled" || (c.classDate >= todayStr && c.status !== "completed")
  ).length;
  const completedCount = classes.filter((c) => c.status === "completed").length;

  const handleOpenAdd = () => {
    setEditingClass(null);
    setShowAddModal(true);
  };

  const handleOpenEdit = (c: DanceClass) => {
    setEditingClass(c);
    setShowAddModal(true);
  };

  const handleSaveClass = async (input: ClassInput, classId?: string) => {
    if (classId) {
      return await onEditClass(classId, input);
    } else {
      return await onAddClass(input);
    }
  };

  const handleQuickStatusChange = async (c: DanceClass, newStatus: ClassStatus) => {
    await onEditClass(c.id, { status: newStatus });
  };

  const handleDelete = async (classId: string) => {
    if (window.confirm("Are you sure you want to remove this scheduled class?")) {
      await onDeleteClass(classId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-xl sm:text-2xl font-bold text-brand-dark">
              Class Schedule &amp; Timetable
            </h1>
            <span className="rounded-full bg-brand-primary/10 border border-brand-primary/30 px-3 py-0.5 text-xs font-bold text-brand-primary-dark">
              {classes.length} Total Sessions
            </span>
          </div>
          <p className="text-xs text-brand-muted mt-1">
            Schedule individual recital sessions, assign teachers, monitor attendance, and prevent room conflicts.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          type="button"
          className="inline-flex items-center gap-2 rounded-xl bg-purple-950 px-4 py-2.5 text-xs font-bold text-brand-gold shadow-md hover:bg-purple-900 active:scale-95 transition-all cursor-pointer shrink-0 self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>Schedule Class</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-brand-border pb-2 text-xs">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-4 py-2 rounded-xl font-bold transition-all ${
            activeTab === "all"
              ? "bg-purple-950 text-brand-gold shadow-sm"
              : "bg-white text-brand-dark border border-brand-border hover:bg-gray-50"
          }`}
        >
          All Classes ({classes.length})
        </button>
        <button
          onClick={() => setActiveTab("upcoming")}
          className={`px-4 py-2 rounded-xl font-bold transition-all ${
            activeTab === "upcoming"
              ? "bg-purple-950 text-brand-gold shadow-sm"
              : "bg-white text-brand-dark border border-brand-border hover:bg-gray-50"
          }`}
        >
          Upcoming ({upcomingCount})
        </button>
        <button
          onClick={() => setActiveTab("completed")}
          className={`px-4 py-2 rounded-xl font-bold transition-all ${
            activeTab === "completed"
              ? "bg-purple-950 text-brand-gold shadow-sm"
              : "bg-white text-brand-dark border border-brand-border hover:bg-gray-50"
          }`}
        >
          Completed ({completedCount})
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-brand-border bg-white p-4 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between text-xs">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
          <input
            type="text"
            placeholder="Search class, batch, or guru..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-brand-border bg-[#F8F9FA] text-xs focus:bg-white focus:border-brand-primary focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Branch Filter */}
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="rounded-xl border border-brand-border bg-[#F8F9FA] px-3 py-2 text-xs text-brand-dark focus:bg-white focus:outline-none"
          >
            <option value="all">All Branches</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>

          {/* Batch Filter */}
          <select
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
            className="rounded-xl border border-brand-border bg-[#F8F9FA] px-3 py-2 text-xs text-brand-dark focus:bg-white focus:outline-none"
          >
            <option value="all">All Batches</option>
            {batches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-xl border border-brand-border bg-[#F8F9FA] px-3 py-2 text-xs text-brand-dark focus:bg-white focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Classes Grid */}
      {filteredClasses.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-brand-border bg-white p-12 text-center text-xs text-brand-muted">
          <CalendarDays size={36} className="mx-auto mb-3 text-brand-muted opacity-40" />
          <p className="font-semibold text-brand-dark text-sm">No dance classes found</p>
          <p className="mt-1">
            {searchTerm || selectedBranch !== "all" || selectedBatch !== "all" || selectedStatus !== "all"
              ? "Try adjusting your search criteria or filters."
              : "Click '+ Schedule Class' above to schedule your first classical dance session."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClasses.map((c) => {
            const batch = batches.find((b) => b.id === c.batchId);
            const branch = branches.find((b) => b.id === c.branchId);
            const isCompleted = c.status === "completed";
            const isCancelled = c.status === "cancelled";

            return (
              <div
                key={c.id}
                className="rounded-2xl border border-brand-border bg-white p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-serif font-bold text-sm text-brand-dark leading-snug">
                      {c.className}
                    </h3>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[0.65rem] font-bold uppercase tracking-wider shrink-0 ${
                        isCompleted
                          ? "bg-emerald-100 text-emerald-800"
                          : isCancelled
                          ? "bg-rose-100 text-rose-800"
                          : "bg-purple-100 text-purple-900"
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-brand-muted mb-3">
                    <div className="flex items-center gap-1.5 text-brand-dark font-medium">
                      <CalendarIcon size={13} className="text-brand-gold-dark shrink-0" />
                      <span>{c.classDate}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Clock size={13} className="text-brand-primary shrink-0" />
                      <span>
                        {c.startTime} – {c.endTime}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Users size={13} className="text-brand-muted shrink-0" />
                      <span>Batch: {c.batchName || batch?.name || "Classical Batch"}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <UserCheck size={13} className="text-brand-muted shrink-0" />
                      <span>Guru: {c.teacherName || "Assigned Faculty"}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Building2 size={13} className="text-brand-muted shrink-0" />
                      <span>Branch: {c.branchName || branch?.name || "Main Studio"}</span>
                    </div>

                    {c.notes && (
                      <p className="mt-2 text-[0.7rem] italic bg-purple-50/60 p-2 rounded-lg text-purple-900 border border-purple-100">
                        &quot;{c.notes}&quot;
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-brand-border flex items-center justify-between gap-1 text-xs">
                  <div className="flex items-center gap-1">
                    {!isCompleted && (
                      <button
                        type="button"
                        onClick={() => handleQuickStatusChange(c, "completed")}
                        className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-50 transition-colors"
                        title="Mark Completed"
                      >
                        <CheckCircle2 size={16} />
                      </button>
                    )}
                    {!isCancelled && (
                      <button
                        type="button"
                        onClick={() => handleQuickStatusChange(c, "cancelled")}
                        className="p-1.5 rounded-lg text-rose-700 hover:bg-rose-50 transition-colors"
                        title="Mark Cancelled"
                      >
                        <XCircle size={16} />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(c)}
                      className="p-1.5 rounded-lg text-brand-dark hover:bg-gray-100 transition-colors"
                      title="Edit Class"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(c.id)}
                      className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete Class"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Class Form Modal */}
      <ClassFormModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleSaveClass}
        editingClass={editingClass}
        branches={branches}
        batches={batches}
        teachers={teachers}
        existingClasses={classes}
      />
    </div>
  );
}