"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Users,
  CheckCheck,
  Building2,
  Search,
  FileSpreadsheet,
  AlertTriangle,
  History,
  ShieldCheck,
  Loader2,
  ArrowRight,
  TrendingUp,
  Download,
} from "lucide-react";
import { Batch, Student, Branch, AttendanceRecord, AttendanceStatus, UserProfile } from "@/lib/types/academy";
import {
  saveBatchAttendance,
  isAttendanceRecordedForDate,
  calculateStudentAttendance,
  generateAttendanceReport,
  AttendanceServiceResult,
} from "@/lib/services/attendanceService";

export default function AttendanceView({
  batches,
  students,
  branches = [],
  attendance,
  user,
  onSaveAttendance,
}: {
  batches: Batch[];
  students: Student[];
  branches?: Branch[];
  attendance: AttendanceRecord[];
  user?: UserProfile;
  onSaveAttendance: (records: AttendanceRecord[]) => void;
}) {
  const todayStr = new Date().toISOString().split("T")[0];

  // Mode Selection: 'daily' | 'monthly' | 'report'
  const [activeViewMode, setActiveViewMode] = useState<"daily" | "monthly" | "report">("daily");

  // Main Workflow State
  const [selectedBranchId, setSelectedBranchId] = useState<string>("all");
  const [selectedBatchId, setSelectedBatchId] = useState<string>(batches[0]?.id || "");
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  // Search & Filter State
  const [studentSearch, setStudentSearch] = useState("");
  const [reportBatchFilter, setReportBatchFilter] = useState("all");

  // In-Memory Staging for Attendance Marking (Do not auto-mark absent before finalization)
  // Map: studentId -> AttendanceStatus ("present" | "absent" | "leave" | undefined)
  const [stagedStatuses, setStagedStatuses] = useState<Record<string, AttendanceStatus>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  // Filter batches by branch
  const availableBatches = useMemo(() => {
    if (selectedBranchId === "all") return batches;
    return batches.filter((b) => b.branchId === selectedBranchId);
  }, [batches, selectedBranchId]);

  // Keep selectedBatchId valid when branch changes
  useEffect(() => {
    if (availableBatches.length > 0 && !availableBatches.some((b) => b.id === selectedBatchId)) {
      setSelectedBatchId(availableBatches[0].id);
    }
  }, [availableBatches, selectedBatchId]);

  const currentBatch = batches.find((b) => b.id === selectedBatchId) || batches[0];
  const currentBranch = branches.find((br) => br.id === currentBatch?.branchId);

  // Active students enrolled in current batch
  const enrolledStudents = useMemo(() => {
    if (!selectedBatchId) return [];
    return students.filter(
      (s) => s.batchId === selectedBatchId && s.status === "active"
    );
  }, [students, selectedBatchId]);

  // Check if attendance has already been recorded for this date and batch
  const isAlreadyRecorded = useMemo(() => {
    return isAttendanceRecordedForDate(selectedBatchId, selectedDate, attendance);
  }, [selectedBatchId, selectedDate, attendance]);

  // Synchronize staged statuses whenever batch or date changes
  useEffect(() => {
    setFeedbackMessage(null);
    const existingForDay = attendance.filter(
      (a) => a.batchId === selectedBatchId && a.date === selectedDate
    );

    if (existingForDay.length > 0) {
      // Previously recorded: prefill with recorded statuses
      const map: Record<string, AttendanceStatus> = {};
      existingForDay.forEach((a) => {
        map[a.studentId] = a.status;
      });
      setStagedStatuses(map);
    } else {
      // Not yet marked: start completely empty (DO NOT automatically mark absent)
      setStagedStatuses({});
    }
  }, [selectedBatchId, selectedDate, attendance]);

  // Filter students by search term
  const displayedStudents = useMemo(() => {
    if (!studentSearch.trim()) return enrolledStudents;
    const q = studentSearch.toLowerCase();
    return enrolledStudents.filter(
      (s) =>
        s.fullName.toLowerCase().includes(q) ||
        (s.studentCode || s.admissionNumber || "").toLowerCase().includes(q) ||
        (s.parentPhone || s.phone || "").includes(q)
    );
  }, [enrolledStudents, studentSearch]);

  // Handlers for Marking Attendance
  const handleSetStudentStatus = (studentId: string, status: AttendanceStatus) => {
    setStagedStatuses((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  // Quick Action: Mark All Enrolled Students Present
  const handleMarkAllPresent = () => {
    const allPresentMap: Record<string, AttendanceStatus> = {};
    enrolledStudents.forEach((s) => {
      allPresentMap[s.id] = "present";
    });
    setStagedStatuses(allPresentMap);
    setFeedbackMessage({
      type: "info",
      text: "All enrolled students marked 'Present'. Click 'Save & Finalize Attendance' to persist to Supabase.",
    });
  };

  // Single Action: Save Attendance to Supabase
  const handleSaveAttendance = async () => {
    if (!selectedBatchId) return;

    // Check if every student has a status selected
    const unselected = enrolledStudents.filter((s) => !stagedStatuses[s.id]);
    if (unselected.length > 0) {
      setFeedbackMessage({
        type: "error",
        text: `Please mark a status (Present, Absent, or Leave) for ${unselected.length} remaining dancer(s) before finalizing.`,
      });
      return;
    }

    try {
      setIsSaving(true);
      setFeedbackMessage(null);

      const payload = enrolledStudents.map((s) => ({
        studentId: s.id,
        status: stagedStatuses[s.id] || "present",
      }));

      const res: AttendanceServiceResult = await saveBatchAttendance(
        selectedBatchId,
        selectedDate,
        currentBatch?.branchId || "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
        payload,
        attendance,
        user?.id
      );

      if (res.success && res.records) {
        onSaveAttendance(res.records);
        setFeedbackMessage({
          type: "success",
          text: res.isCorrection
            ? `Authorized correction saved permanently for "${currentBatch?.name}" on ${selectedDate}.`
            : `Attendance finalized and permanently stored in Supabase for "${currentBatch?.name}" on ${selectedDate}.`,
        });
      } else {
        setFeedbackMessage({
          type: "error",
          text: res.error || "Failed to record attendance.",
        });
      }
    } catch (err: any) {
      setFeedbackMessage({
        type: "error",
        text: err?.message || "An unexpected error occurred while saving to database.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Daily Metrics Calculation
  const presentCount = enrolledStudents.filter((s) => stagedStatuses[s.id] === "present").length;
  const absentCount = enrolledStudents.filter((s) => stagedStatuses[s.id] === "absent").length;
  const leaveCount = enrolledStudents.filter((s) => stagedStatuses[s.id] === "leave").length;
  const unmarkedCount = enrolledStudents.filter((s) => !stagedStatuses[s.id]).length;
  const totalMarked = presentCount + absentCount + leaveCount;
  const dailyAttendanceRate =
    totalMarked > 0 ? Math.round((presentCount / totalMarked) * 100) : 0;

  // Attendance Report Data
  const reportData = useMemo(() => {
    return generateAttendanceReport(students, reportBatchFilter, attendance);
  }, [students, reportBatchFilter, attendance]);

  // CSV Export for Attendance Report
  const handleExportCSV = () => {
    const headers = ["Student Name", "Student Code", "Batch", "Total Classes", "Present", "Absent", "Leave", "Attendance %"];
    const rows = reportData.map((item) => {
      const bName = batches.find((b) => b.id === item.student.batchId)?.name || "Unassigned";
      return [
        `"${item.student.fullName}"`,
        `"${item.student.studentCode || item.student.admissionNumber}"`,
        `"${bName}"`,
        item.totalClasses,
        item.present,
        item.absent,
        item.leave,
        `"${item.percentage}%"`,
      ].join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Abhinaya_Nartan_Attendance_Report_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & View Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-xl sm:text-2xl font-bold text-brand-dark">
            Attendance Management
          </h1>
          <p className="text-xs text-brand-muted mt-1">
            Track student discipline, log daily recital presence, and generate formal attendance audits.
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-white border border-brand-border rounded-2xl shadow-sm self-start sm:self-auto text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveViewMode("daily")}
            className={`px-3.5 py-1.5 rounded-xl transition-all ${
              activeViewMode === "daily"
                ? "bg-purple-950 text-brand-gold shadow-sm"
                : "text-brand-muted hover:text-brand-dark"
            }`}
          >
            Daily Register
          </button>
          <button
            type="button"
            onClick={() => setActiveViewMode("monthly")}
            className={`px-3.5 py-1.5 rounded-xl transition-all ${
              activeViewMode === "monthly"
                ? "bg-purple-950 text-brand-gold shadow-sm"
                : "text-brand-muted hover:text-brand-dark"
            }`}
          >
            Monthly Register
          </button>
          <button
            type="button"
            onClick={() => setActiveViewMode("report")}
            className={`px-3.5 py-1.5 rounded-xl transition-all ${
              activeViewMode === "report"
                ? "bg-purple-950 text-brand-gold shadow-sm"
                : "text-brand-muted hover:text-brand-dark"
            }`}
          >
            Attendance Report
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODE 1: DAILY ATTENDANCE REGISTER */}
      {/* ========================================================================= */}
      {activeViewMode === "daily" && (
        <div className="space-y-5">
          {/* Main 3-Step Selection Workflow Bar */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-brand-border shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-muted">
              <Sparkles size={13} className="text-brand-gold-dark" />
              <span>Step 1, 2 &amp; 3: Studio Session Selectors</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {/* Step 1: Select Branch */}
              <div>
                <label className="block text-xs font-semibold text-brand-dark mb-1 flex items-center gap-1.5">
                  <Building2 size={13} className="text-brand-gold-dark" />
                  <span>1. Studio Branch</span>
                </label>
                <select
                  value={selectedBranchId}
                  onChange={(e) => setSelectedBranchId(e.target.value)}
                  className="w-full rounded-xl border border-brand-border bg-[#F8F9FA] px-3.5 py-2.5 text-xs text-brand-dark focus:border-brand-primary focus:bg-white focus:outline-none cursor-pointer"
                >
                  <option value="all">All Studio Branches</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Step 2: Select Batch */}
              <div>
                <label className="block text-xs font-semibold text-brand-dark mb-1 flex items-center gap-1.5">
                  <Users size={13} className="text-brand-primary-dark" />
                  <span>2. Dance Batch</span>
                </label>
                <select
                  value={selectedBatchId}
                  onChange={(e) => setSelectedBatchId(e.target.value)}
                  className="w-full rounded-xl border border-brand-border bg-[#F8F9FA] px-3.5 py-2.5 text-xs text-brand-dark focus:border-brand-primary focus:bg-white focus:outline-none cursor-pointer font-medium"
                >
                  {availableBatches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.scheduleDays.join(", ")})
                    </option>
                  ))}
                </select>
              </div>

              {/* Step 3: Select Attendance Date */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-brand-dark flex items-center gap-1.5">
                    <Calendar size={13} className="text-brand-gold-dark" />
                    <span>3. Attendance Date</span>
                  </label>
                  {selectedDate !== todayStr && (
                    <button
                      type="button"
                      onClick={() => setSelectedDate(todayStr)}
                      className="text-[0.68rem] text-brand-primary-dark underline font-bold"
                    >
                      Set Today
                    </button>
                  )}
                </div>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full rounded-xl border border-brand-border bg-[#F8F9FA] px-3.5 py-2.5 text-xs text-brand-dark focus:border-brand-primary focus:bg-white focus:outline-none cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Feedback Messages (Success / Error / Info) */}
          {feedbackMessage && (
            <div
              className={`flex items-start gap-3 rounded-2xl p-4 text-xs animate-fadeIn ${
                feedbackMessage.type === "success"
                  ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                  : feedbackMessage.type === "error"
                  ? "bg-rose-50 border border-rose-200 text-rose-800"
                  : "bg-purple-50 border border-purple-200 text-purple-900"
              }`}
            >
              {feedbackMessage.type === "success" && <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />}
              {feedbackMessage.type === "error" && <AlertTriangle size={16} className="text-rose-600 shrink-0 mt-0.5" />}
              {feedbackMessage.type === "info" && <Sparkles size={16} className="text-brand-primary-dark shrink-0 mt-0.5" />}
              <div className="leading-relaxed font-medium">{feedbackMessage.text}</div>
            </div>
          )}

          {/* Authorized Correction / Already Recorded Notice */}
          {isAlreadyRecorded && (
            <div className="flex items-start gap-3 rounded-2xl bg-amber-50 border border-amber-300 p-4 text-xs text-amber-900 animate-fadeIn">
              <ShieldCheck size={18} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold block mb-0.5">
                  Attendance Already Finalized for this Class Session
                </strong>
                <p className="leading-relaxed">
                  Attendance records exist in the database for <strong>{currentBatch?.name}</strong> on <strong>{selectedDate}</strong>.
                  Authorized corrections can be made and saved below with database audit trail tracking.
                </p>
              </div>
            </div>
          )}

          {/* Attendance KPI Summary Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="rounded-2xl border border-brand-border bg-white p-3.5 text-center shadow-sm">
              <p className="text-[0.65rem] uppercase font-bold tracking-wider text-brand-muted">
                Enrolled Active
              </p>
              <p className="font-serif text-xl font-bold text-brand-dark mt-0.5">
                {enrolledStudents.length} Dancers
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-3.5 text-center shadow-sm">
              <p className="text-[0.65rem] uppercase font-bold tracking-wider text-emerald-800">
                Present
              </p>
              <p className="font-serif text-xl font-bold text-emerald-900 mt-0.5">
                {presentCount}
              </p>
            </div>

            <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-3.5 text-center shadow-sm">
              <p className="text-[0.65rem] uppercase font-bold tracking-wider text-rose-800">
                Absent
              </p>
              <p className="font-serif text-xl font-bold text-rose-900 mt-0.5">
                {absentCount}
              </p>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-3.5 text-center shadow-sm">
              <p className="text-[0.65rem] uppercase font-bold tracking-wider text-amber-800">
                On Leave
              </p>
              <p className="font-serif text-xl font-bold text-amber-900 mt-0.5">
                {leaveCount}
              </p>
            </div>

            <div className="col-span-2 sm:col-span-1 rounded-2xl border border-brand-border bg-white p-3.5 text-center shadow-sm">
              <p className="text-[0.65rem] uppercase font-bold tracking-wider text-brand-primary-dark flex items-center justify-center gap-1">
                <TrendingUp size={11} />
                <span>Attendance Rate</span>
              </p>
              <p className="font-serif text-xl font-bold text-brand-dark mt-0.5">
                {dailyAttendanceRate}%
              </p>
            </div>
          </div>

          {/* Student Roster Table & Marking Surface */}
          <div className="overflow-hidden rounded-2xl border border-brand-border bg-white shadow-card">
            {/* Table Header Controls */}
            <div className="p-4 border-b border-brand-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#F8F9FA]">
              <div className="relative w-full sm:w-72">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-muted" />
                <input
                  type="text"
                  placeholder="Filter dancers by name or roll no..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="w-full rounded-xl border border-brand-border bg-white pl-9 pr-3.5 py-1.5 text-xs text-brand-dark placeholder:text-brand-muted/70 focus:border-brand-primary focus:outline-none"
                />
              </div>

              {/* Bulk Quick Actions */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={handleMarkAllPresent}
                  disabled={enrolledStudents.length === 0}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-600 hover:text-white transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  <CheckCheck size={14} />
                  <span>Mark All Present</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveAttendance}
                  disabled={isSaving || enrolledStudents.length === 0}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-purple-950 px-4 py-2 text-xs font-bold text-brand-gold shadow-md hover:bg-purple-900 active:scale-95 transition-all disabled:opacity-60 cursor-pointer"
                >
                  {isSaving ? (
                    <>
                      <Loader2 size={13} className="animate-spin text-brand-gold" />
                      <span>Saving to Supabase...</span>
                    </>
                  ) : (
                    <>
                      <span>Save &amp; Finalize Attendance</span>
                      <ArrowRight size={13} />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gradient-to-r from-purple-950 to-purple-900 text-alabaster uppercase tracking-wider text-[0.65rem]">
                  <tr>
                    <th className="py-3.5 px-4 font-semibold">Student Code &amp; Dancer</th>
                    <th className="py-3.5 px-4 font-semibold">Parent Contact</th>
                    <th className="py-3.5 px-4 font-semibold">Level</th>
                    <th className="py-3.5 px-4 font-semibold text-center">Current Status</th>
                    <th className="py-3.5 px-4 font-semibold text-right">Attendance Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-50">
                  {displayedStudents.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-brand-muted">
                        <Users size={28} className="mx-auto text-brand-muted/50 mb-2" />
                        <p className="font-semibold text-brand-dark text-xs">
                          No active students found in {currentBatch?.name || "this batch"}.
                        </p>
                        <p className="text-[0.68rem] text-brand-muted mt-0.5">
                          Assign students to this batch from the Student Management roster.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    displayedStudents.map((student) => {
                      const studentCode = student.studentCode || student.admissionNumber || "AN-2026-000";
                      const currentStatus = stagedStatuses[student.id];

                      return (
                        <tr key={student.id} className="hover:bg-purple-50/30 transition-colors">
                          <td className="py-3.5 px-4">
                            <span className="font-semibold text-brand-dark text-sm block">
                              {student.fullName}
                            </span>
                            <span className="font-mono text-[0.65rem] text-brand-gold-dark bg-brand-gold/10 px-1.5 py-0.5 rounded border border-brand-gold/20">
                              {studentCode}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="text-brand-dark">{student.parentName}</div>
                            <span className="font-mono text-[0.68rem] text-brand-muted">
                              {student.parentPhone || student.phone}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="rounded-full bg-purple-50 border border-purple-100 px-2.5 py-0.5 text-[0.62rem] font-semibold text-brand-primary-dark">
                              {student.level || "Beginner"}
                            </span>
                          </td>

                          {/* Current Status Pill */}
                          <td className="py-3.5 px-4 text-center">
                            {currentStatus ? (
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold capitalize border ${
                                  currentStatus === "present"
                                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                    : currentStatus === "absent"
                                    ? "bg-rose-50 text-rose-800 border-rose-200"
                                    : "bg-amber-50 text-amber-800 border-amber-200"
                                }`}
                              >
                                {currentStatus === "present" && <CheckCircle2 size={13} className="text-emerald-600" />}
                                {currentStatus === "absent" && <XCircle size={13} className="text-rose-600" />}
                                {currentStatus === "leave" && <Clock size={13} className="text-amber-600" />}
                                <span>{currentStatus}</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 border border-gray-200 px-2.5 py-0.5 text-[0.65rem] text-gray-500 font-semibold italic">
                                Not Marked Yet
                              </span>
                            )}
                          </td>

                          {/* Attendance Status Selector Toggle Buttons */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="inline-flex items-center rounded-xl border border-brand-border bg-[#F8F9FA] p-1 gap-1">
                              {/* Present Button */}
                              <button
                                type="button"
                                onClick={() => handleSetStudentStatus(student.id, "present")}
                                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                                  currentStatus === "present"
                                    ? "bg-emerald-600 text-white shadow-sm"
                                    : "text-emerald-800 hover:bg-emerald-100"
                                }`}
                                title="Mark Present"
                              >
                                Present
                              </button>

                              {/* Absent Button */}
                              <button
                                type="button"
                                onClick={() => handleSetStudentStatus(student.id, "absent")}
                                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                                  currentStatus === "absent"
                                    ? "bg-rose-600 text-white shadow-sm"
                                    : "text-rose-800 hover:bg-rose-100"
                                }`}
                                title="Mark Absent"
                              >
                                Absent
                              </button>

                              {/* Leave Button */}
                              <button
                                type="button"
                                onClick={() => handleSetStudentStatus(student.id, "leave")}
                                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                                  currentStatus === "leave"
                                    ? "bg-amber-600 text-white shadow-sm"
                                    : "text-amber-800 hover:bg-amber-100"
                                }`}
                                title="Mark on Leave"
                              >
                                Leave
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

            {/* Bottom Finalize Button Bar */}
            {enrolledStudents.length > 0 && (
              <div className="p-4 border-t border-brand-border bg-[#F8F9FA] flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs text-brand-muted">
                  {unmarkedCount > 0 ? (
                    <span className="text-amber-700 font-semibold flex items-center gap-1.5">
                      <AlertTriangle size={13} />
                      <span>{unmarkedCount} dancer(s) need attendance status selected before saving.</span>
                    </span>
                  ) : (
                    <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
                      <CheckCircle2 size={13} />
                      <span>All {enrolledStudents.length} dancers marked. Ready to finalize.</span>
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleSaveAttendance}
                  disabled={isSaving}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-purple-950 px-5 py-2.5 text-xs font-bold text-brand-gold shadow-md hover:bg-purple-900 active:scale-95 transition-all disabled:opacity-60 cursor-pointer"
                >
                  {isSaving ? (
                    <>
                      <Loader2 size={14} className="animate-spin text-brand-gold" />
                      <span>Saving to Supabase...</span>
                    </>
                  ) : (
                    <span>Save &amp; Finalize Attendance</span>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: MONTHLY ATTENDANCE REGISTER */}
      {/* ========================================================================= */}
      {activeViewMode === "monthly" && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-brand-border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs">
                <Users size={14} className="text-brand-primary-dark" />
                <span className="font-semibold text-brand-dark">Batch:</span>
                <select
                  value={selectedBatchId}
                  onChange={(e) => setSelectedBatchId(e.target.value)}
                  className="rounded-xl border border-brand-border bg-[#F8F9FA] px-3 py-1.5 text-xs text-brand-dark focus:border-brand-primary font-medium"
                >
                  {batches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <span className="text-xs text-brand-muted">
              Monthly Matrix: <strong>{new Date().toLocaleString("default", { month: "long", year: "numeric" })}</strong>
            </span>
          </div>

          {/* Monthly Matrix Grid */}
          <div className="overflow-x-auto rounded-2xl border border-brand-border bg-white shadow-card">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F9FA] border-b border-brand-border text-brand-muted text-[0.65rem] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4 sticky left-0 bg-[#F8F9FA] z-10">Dancer</th>
                  {Array.from({ length: 15 }, (_, i) => i + 1).map((day) => (
                    <th key={day} className="py-3 px-2 text-center">
                      {day}
                    </th>
                  ))}
                  <th className="py-3 px-4 text-center font-bold text-brand-dark">Att %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-50">
                {enrolledStudents.map((s) => {
                  const stats = calculateStudentAttendance(s, selectedBatchId, attendance);
                  return (
                    <tr key={s.id} className="hover:bg-purple-50/20">
                      <td className="py-3 px-4 font-semibold text-brand-dark sticky left-0 bg-white z-10 whitespace-nowrap">
                        {s.fullName}
                      </td>
                      {Array.from({ length: 15 }, (_, i) => {
                        const dayNum = i + 1;
                        const dateStr = `2026-11-${String(dayNum).padStart(2, "0")}`;
                        const record = attendance.find(
                          (a) => a.studentId === s.id && a.date === dateStr && a.batchId === selectedBatchId
                        );

                        return (
                          <td key={dayNum} className="py-3 px-2 text-center">
                            {record ? (
                              <span
                                className={`inline-block w-5 h-5 rounded-full text-[0.65rem] font-bold leading-5 ${
                                  record.status === "present"
                                    ? "bg-emerald-100 text-emerald-800"
                                    : record.status === "absent"
                                    ? "bg-rose-100 text-rose-800"
                                    : "bg-amber-100 text-amber-800"
                                }`}
                              >
                                {record.status === "present" ? "P" : record.status === "absent" ? "A" : "L"}
                              </span>
                            ) : (
                              <span className="text-gray-300 text-[0.65rem]">-</span>
                            )}
                          </td>
                        );
                      })}
                      <td className="py-3 px-4 text-center font-bold text-brand-primary-dark">
                        {stats.percentage}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 3: ATTENDANCE REPORT & STUDENT LOOKUP */}
      {/* ========================================================================= */}
      {activeViewMode === "report" && (
        <div className="space-y-4">
          {/* Filter & Export Row */}
          <div className="bg-white p-4 rounded-2xl border border-brand-border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 text-xs">
                <Users size={14} className="text-brand-primary-dark" />
                <span className="font-semibold text-brand-dark">Filter Batch:</span>
                <select
                  value={reportBatchFilter}
                  onChange={(e) => setReportBatchFilter(e.target.value)}
                  className="rounded-xl border border-brand-border bg-[#F8F9FA] px-3 py-1.5 text-xs text-brand-dark focus:border-brand-primary font-medium"
                >
                  <option value="all">All Batches Combined</option>
                  {batches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 rounded-xl border border-brand-border bg-white px-3.5 py-1.5 text-xs font-semibold text-brand-dark hover:border-brand-primary hover:text-brand-primary-dark transition-all self-start sm:self-auto cursor-pointer"
            >
              <Download size={13} />
              <span>Export CSV Report</span>
            </button>
          </div>

          {/* Formal Attendance Report Table */}
          {/* Exact Columns Requested: Student Name | Total Classes | Present | Absent | Leave | Percentage */}
          <div className="overflow-hidden rounded-2xl border border-brand-border bg-white shadow-card">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gradient-to-r from-purple-950 to-purple-900 text-alabaster uppercase tracking-wider text-[0.65rem]">
                  <tr>
                    <th className="py-3.5 px-4 font-semibold">Student Name</th>
                    <th className="py-3.5 px-4 font-semibold text-center">Total Classes</th>
                    <th className="py-3.5 px-4 font-semibold text-center text-emerald-300">Present</th>
                    <th className="py-3.5 px-4 font-semibold text-center text-rose-300">Absent</th>
                    <th className="py-3.5 px-4 font-semibold text-center text-amber-300">Leave</th>
                    <th className="py-3.5 px-4 font-semibold text-center">Percentage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-50">
                  {reportData.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-brand-muted">
                        No students enrolled in this batch.
                      </td>
                    </tr>
                  ) : (
                    reportData.map(({ student, totalClasses, present, absent, leave, percentage }) => {
                      const studentCode = student.studentCode || student.admissionNumber || "AN-2026-000";

                      return (
                        <tr key={student.id} className="hover:bg-purple-50/20 transition-colors">
                          <td className="py-3.5 px-4">
                            <span className="font-semibold text-brand-dark text-sm block">
                              {student.fullName}
                            </span>
                            <span className="font-mono text-[0.65rem] text-brand-gold-dark bg-brand-gold/10 px-1 rounded border border-brand-gold/20">
                              {studentCode}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-center font-bold text-brand-dark">
                            {totalClasses}
                          </td>

                          <td className="py-3.5 px-4 text-center font-bold text-emerald-700 bg-emerald-50/30">
                            {present}
                          </td>

                          <td className="py-3.5 px-4 text-center font-bold text-rose-700 bg-rose-50/30">
                            {absent}
                          </td>

                          <td className="py-3.5 px-4 text-center font-bold text-amber-700 bg-amber-50/30">
                            {leave}
                          </td>

                          <td className="py-3.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <span className="font-serif font-bold text-sm text-brand-dark">
                                {percentage}%
                              </span>
                              <div className="w-16 bg-purple-100 h-2 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    percentage >= 80
                                      ? "bg-emerald-600"
                                      : percentage >= 60
                                      ? "bg-amber-500"
                                      : "bg-rose-500"
                                  }`}
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
