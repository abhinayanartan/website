"use client";

import { useState, useMemo } from "react";
import {
  Search,
  UserPlus,
  MessageCircle,
  Phone,
  Eye,
  Edit,
  Building2,
  Calendar,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Filter,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
} from "lucide-react";
import { Student, Batch, Branch } from "@/lib/types/academy";
import StudentProfileModal from "@/components/dashboard/StudentProfileModal";
import StudentFormModal from "@/components/dashboard/StudentFormModal";
import { StudentInput, StudentServiceResult } from "@/lib/services/studentService";

const PAGE_SIZE = 8;

export default function StudentsView({
  students,
  batches,
  branches = [],
  onAddStudent,
  onEditStudent,
  onUpdateStatus,
  onQuickCollectFee,
}: {
  students: Student[];
  batches: Batch[];
  branches?: Branch[];
  onAddStudent: (input: StudentInput) => Promise<StudentServiceResult>;
  onEditStudent: (studentId: string, updates: Partial<StudentInput>) => Promise<StudentServiceResult>;
  onUpdateStatus: (studentId: string, status: Student["status"]) => void;
  onQuickCollectFee?: (student: Student) => void;
}) {
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [selectedBatch, setSelectedBatch] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);

  // Modals State
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);

  // Filtering Logic
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const code = s.studentCode || s.admissionNumber || "";
      const pPhone = s.parentPhone || s.phone || "";

      const matchesSearch =
        searchTerm.trim() === "" ||
        s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pPhone.includes(searchTerm) ||
        (s.address && s.address.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesBranch =
        selectedBranch === "all" || s.branchId === selectedBranch;

      const matchesBatch =
        selectedBatch === "all" || s.batchId === selectedBatch;

      const matchesStatus =
        selectedStatus === "all" || s.status === selectedStatus;

      const matchesLevel =
        selectedLevel === "all" || s.level === selectedLevel;

      return matchesSearch && matchesBranch && matchesBatch && matchesStatus && matchesLevel;
    });
  }, [students, searchTerm, selectedBranch, selectedBatch, selectedStatus, selectedLevel]);

  // Reset page to 1 when filters change
  const totalPages = Math.ceil(filteredStudents.length / PAGE_SIZE) || 1;
  const paginatedStudents = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredStudents.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredStudents, currentPage]);

  const handleOpenAddModal = () => {
    setEditingStudent(null);
    setShowFormModal(true);
  };

  const handleOpenEditModal = (student: Student) => {
    setEditingStudent(student);
    setShowFormModal(true);
  };

  const handleSaveStudent = async (input: StudentInput, studentId?: string) => {
    if (studentId) {
      return await onEditStudent(studentId, input);
    } else {
      return await onAddStudent(input);
    }
  };

  // Metrics Bar counts
  const activeCount = students.filter((s) => s.status === "active").length;
  const onLeaveCount = students.filter((s) => s.status === "on_leave").length;
  const inactiveCount = students.filter((s) => s.status === "inactive").length;

  return (
    <div className="space-y-6">
      {/* Top Header & Metrics Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-xl sm:text-2xl font-bold text-brand-dark">
              Student Management
            </h1>
            <span className="rounded-full bg-brand-primary/10 border border-brand-primary/30 px-3 py-0.5 text-xs font-bold text-brand-primary-dark">
              {students.length} Total Enrolled
            </span>
          </div>
          <p className="text-xs text-brand-muted mt-1">
            Manage classical dance admissions, batch allocations, parent channels, and student profiles.
          </p>
        </div>

        {/* "+ Enroll New Student" CTA */}
        <button
          onClick={handleOpenAddModal}
          type="button"
          className="inline-flex items-center gap-2 rounded-xl bg-brand-gold px-4 py-2.5 text-xs font-bold text-purple-950 shadow-gold-sm hover:brightness-105 active:scale-95 transition-all self-start sm:self-auto cursor-pointer"
        >
          <UserPlus size={15} />
          <span>Enroll New Student</span>
        </button>
      </div>

      {/* Quick Metrics Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-white border border-brand-border shadow-sm">
          <span className="text-[0.68rem] font-semibold text-brand-muted uppercase tracking-wider block">
            Active Dancers
          </span>
          <span className="font-serif text-xl sm:text-2xl font-bold text-emerald-800">
            {activeCount}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-brand-border shadow-sm">
          <span className="text-[0.68rem] font-semibold text-brand-muted uppercase tracking-wider block">
            On Sabbatical / Leave
          </span>
          <span className="font-serif text-xl sm:text-2xl font-bold text-amber-700">
            {onLeaveCount}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-brand-border shadow-sm">
          <span className="text-[0.68rem] font-semibold text-brand-muted uppercase tracking-wider block">
            Inactive Archive
          </span>
          <span className="font-serif text-xl sm:text-2xl font-bold text-gray-600">
            {inactiveCount}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-brand-border shadow-sm">
          <span className="text-[0.68rem] font-semibold text-brand-muted uppercase tracking-wider block">
            Active Batches
          </span>
          <span className="font-serif text-xl sm:text-2xl font-bold text-brand-primary-dark">
            {batches.length}
          </span>
        </div>
      </div>

      {/* Search & Advanced Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-brand-border shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Universal Search Input */}
          <div className="relative lg:col-span-2">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-muted" />
            <input
              type="text"
              placeholder="Search by student name, code, parent, or phone..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-xl border border-brand-border bg-[#F8F9FA] pl-9 pr-3.5 py-2 text-xs text-brand-dark placeholder:text-brand-muted/70 focus:border-brand-primary focus:bg-white focus:outline-none transition-all"
            />
          </div>

          {/* Filter by Branch */}
          <select
            value={selectedBranch}
            onChange={(e) => {
              setSelectedBranch(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-xl border border-brand-border bg-[#F8F9FA] px-3 py-2 text-xs text-brand-dark focus:border-brand-primary focus:bg-white focus:outline-none cursor-pointer"
          >
            <option value="all">All Studio Branches</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>

          {/* Filter by Batch */}
          <select
            value={selectedBatch}
            onChange={(e) => {
              setSelectedBatch(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-xl border border-brand-border bg-[#F8F9FA] px-3 py-2 text-xs text-brand-dark focus:border-brand-primary focus:bg-white focus:outline-none cursor-pointer"
          >
            <option value="all">All Batches</option>
            {batches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>

          {/* Filter by Status */}
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-xl border border-brand-border bg-[#F8F9FA] px-3 py-2 text-xs text-brand-dark focus:border-brand-primary focus:bg-white focus:outline-none cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="on_leave">On Leave Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Students Data Table */}
      <div className="overflow-hidden rounded-2xl border border-brand-border bg-white shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gradient-to-r from-purple-950 to-purple-900 text-alabaster uppercase tracking-wider text-[0.65rem]">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Student Code &amp; Name</th>
                <th className="py-3.5 px-4 font-semibold">Parent &amp; Contacts</th>
                <th className="py-3.5 px-4 font-semibold">Branch &amp; Batch</th>
                <th className="py-3.5 px-4 font-semibold">Joining Date</th>
                <th className="py-3.5 px-4 font-semibold">Monthly Fee</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-50">
              {paginatedStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-brand-muted">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-purple-50 text-brand-muted mb-3">
                      <GraduationCap size={24} />
                    </div>
                    <p className="font-semibold text-brand-dark">No students match your query</p>
                    <p className="text-xs text-brand-muted mt-0.5">
                      Try clearing search keywords or selecting all branches/batches.
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedStudents.map((student) => {
                  const studentCode = student.studentCode || student.admissionNumber || "AN-2026-000";
                  const batch = batches.find((b) => b.id === student.batchId);
                  const branch = branches.find((br) => br.id === student.branchId);
                  const parentPhone = student.parentPhone || student.phone || "";
                  const cleanPhone = parentPhone.replace(/\D/g, "");
                  const joiningDate = student.joiningDate || student.enrollmentDate || "2024-01-01";
                  const fee = student.monthlyFee || batch?.monthlyFee || 1500;

                  return (
                    <tr
                      key={student.id}
                      className="hover:bg-[#FAF9F6] transition-colors group cursor-pointer"
                      onClick={(e) => {
                        // Prevent opening profile modal if user clicked a link/button/select
                        const target = e.target as HTMLElement;
                        if (target.closest("button") || target.closest("a") || target.closest("select")) return;
                        setViewingStudent(student);
                      }}
                    >
                      {/* Code & Name with Avatar */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F5F0FC] text-brand-primary-dark font-serif font-bold text-xs border border-brand-primary/20">
                            {student.fullName
                              .split(" ")
                              .map((n) => n[0])
                              .slice(0, 2)
                              .join("")}
                          </div>
                          <div>
                            <span className="font-semibold text-brand-dark text-sm block group-hover:text-brand-primary-dark transition-colors">
                              {student.fullName}
                            </span>
                            <span className="font-mono text-[0.65rem] text-brand-gold-dark bg-brand-gold/10 px-1.5 py-0.5 rounded border border-brand-gold/30">
                              {studentCode}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Parent & Quick Contact */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-brand-dark">{student.parentName}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-mono text-[0.68rem] text-brand-muted">{parentPhone}</span>
                          <a
                            href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                              `Namaste, Greetings from Abhinaya Nartan Dance Academy regarding ${student.fullName}.`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-600 hover:text-white transition-colors"
                            title="Chat on WhatsApp"
                          >
                            <MessageCircle size={12} />
                          </a>
                          <a
                            href={`tel:${parentPhone}`}
                            onClick={(e) => e.stopPropagation()}
                            className="flex h-6 w-6 items-center justify-center rounded-lg bg-purple-50 text-purple-900 border border-purple-200 hover:bg-purple-900 hover:text-brand-gold transition-colors"
                            title="Call Parent"
                          >
                            <Phone size={11} />
                          </a>
                        </div>
                      </td>

                      {/* Branch & Batch */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-brand-dark">
                          {batch?.name || "Unassigned Batch"}
                        </div>
                        <div className="text-[0.68rem] text-brand-muted">
                          {branch?.name || "Vijayawada Main Studio"}
                        </div>
                      </td>

                      {/* Joining Date & Level */}
                      <td className="py-3.5 px-4">
                        <div className="text-brand-dark font-medium">{joiningDate}</div>
                        <span className="inline-block mt-0.5 rounded-full bg-purple-50 border border-purple-100 px-2 py-0.5 text-[0.62rem] font-semibold text-brand-primary-dark">
                          {student.level || "Beginner"}
                        </span>
                      </td>

                      {/* Monthly Fee */}
                      <td className="py-3.5 px-4">
                        <span className="font-serif font-bold text-brand-dark text-sm">
                          ₹{fee.toLocaleString("en-IN")}
                        </span>
                        <span className="text-[0.65rem] text-brand-muted block">/ month</span>
                      </td>

                      {/* Status Dropdown */}
                      <td className="py-3.5 px-4">
                        <select
                          value={student.status}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) =>
                            onUpdateStatus(student.id, e.target.value as Student["status"])
                          }
                          className={`rounded-full px-2.5 py-1 text-[0.65rem] font-bold border cursor-pointer outline-none transition-all ${
                            student.status === "active"
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                              : student.status === "on_leave"
                              ? "bg-amber-50 text-amber-800 border-amber-200"
                              : "bg-gray-100 text-gray-700 border-gray-200"
                          }`}
                        >
                          <option value="active">Active</option>
                          <option value="on_leave">On Leave</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => setViewingStudent(student)}
                            className="flex h-8 w-8 items-center justify-center rounded-xl border border-brand-border bg-white text-brand-muted hover:border-brand-primary hover:text-brand-primary-dark hover:bg-[#F5F0FC] transition-colors"
                            title="View Full Profile"
                          >
                            <Eye size={14} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(student)}
                            className="flex h-8 w-8 items-center justify-center rounded-xl border border-brand-border bg-white text-brand-muted hover:border-brand-primary hover:text-brand-primary-dark hover:bg-[#F5F0FC] transition-colors"
                            title="Edit Student"
                          >
                            <Edit size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {filteredStudents.length > 0 && (
          <div className="p-4 border-t border-brand-border bg-[#F8F9FA] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-brand-muted">
            <div>
              Showing{" "}
              <span className="font-semibold text-brand-dark">
                {(currentPage - 1) * PAGE_SIZE + 1}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-brand-dark">
                {Math.min(currentPage * PAGE_SIZE, filteredStudents.length)}
              </span>{" "}
              of <span className="font-semibold text-brand-dark">{filteredStudents.length}</span> students
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-brand-border bg-white text-brand-dark disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                aria-label="Previous page"
              >
                <ChevronLeft size={16} />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setCurrentPage(pageNum)}
                  className={`h-8 w-8 rounded-lg text-xs font-semibold transition-all ${
                    currentPage === pageNum
                      ? "bg-purple-950 text-brand-gold shadow-sm"
                      : "border border-brand-border bg-white text-brand-dark hover:bg-gray-50"
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-brand-border bg-white text-brand-dark disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                aria-label="Next page"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Individual Student Profile Modal */}
      {viewingStudent && (
        <StudentProfileModal
          student={viewingStudent}
          batch={batches.find((b) => b.id === viewingStudent.batchId)}
          branch={branches.find((br) => br.id === viewingStudent.branchId)}
          onClose={() => setViewingStudent(null)}
          onEdit={(s) => {
            setViewingStudent(null);
            handleOpenEditModal(s);
          }}
          onQuickCollectFee={(s) => {
            setViewingStudent(null);
            if (onQuickCollectFee) onQuickCollectFee(s);
          }}
        />
      )}

      {/* Student Registration & Edit Form Modal */}
      <StudentFormModal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        onSave={handleSaveStudent}
        editingStudent={editingStudent}
        branches={branches}
        batches={batches}
        existingStudents={students}
      />
    </div>
  );
}
