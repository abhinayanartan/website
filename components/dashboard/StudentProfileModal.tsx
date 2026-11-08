"use client";

import { useEffect } from "react";
import {
  X,
  Phone,
  MessageCircle,
  Calendar,
  Building2,
  CreditCard,
  MapPin,
  Clock,
  Sparkles,
  Edit,
  GraduationCap,
  HeartHandshake,
} from "lucide-react";
import { Student, Batch, Branch } from "@/lib/types/academy";

export default function StudentProfileModal({
  student,
  batch,
  branch,
  onClose,
  onEdit,
  onQuickCollectFee,
}: {
  student: Student;
  batch?: Batch;
  branch?: Branch;
  onClose: () => void;
  onEdit: (student: Student) => void;
  onQuickCollectFee: (student: Student) => void;
}) {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const studentCode = student.studentCode || student.admissionNumber || "AN-2026-000";
  const joiningDate = student.joiningDate || student.enrollmentDate || "2024-01-01";
  const parentPhone = student.parentPhone || student.phone || "";
  const cleanPhone = parentPhone.replace(/\D/g, "");
  const monthlyFee = student.monthlyFee || batch?.monthlyFee || 1500;

  // Calculate age if DOB exists
  let ageDisplay = "";
  if (student.dateOfBirth) {
    const birthYear = new Date(student.dateOfBirth).getFullYear();
    const currentYear = new Date().getFullYear();
    if (!isNaN(birthYear)) {
      ageDisplay = `${currentYear - birthYear} years old`;
    }
  }

  // Calculate tenure
  const joinYear = new Date(joiningDate).getFullYear();
  const currentYear = new Date().getFullYear();
  const tenureYears = currentYear - joinYear;
  const tenureDisplay =
    tenureYears <= 0
      ? "Joined this year"
      : tenureYears === 1
      ? "1 year of dedicated practice"
      : `${tenureYears} years of dedicated practice`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-purple-950/70 backdrop-blur-sm animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-2xl rounded-3xl bg-white border border-brand-border shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Banner Header */}
        <div className="bg-gradient-to-r from-purple-950 via-purple-900 to-[#1A0D33] p-6 text-white relative shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-gold text-purple-950 font-serif font-bold text-lg shadow-gold-sm">
                {student.fullName
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-white">
                    {student.fullName}
                  </h2>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[0.62rem] font-bold uppercase tracking-wider ${
                      student.status === "active"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/40"
                        : student.status === "on_leave"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-400/40"
                        : "bg-gray-500/20 text-gray-300 border border-gray-400/40"
                    }`}
                  >
                    {student.status.replace("_", " ")}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-brand-gold/90 font-mono">
                  <span>Student Code: {studentCode}</span>
                  {ageDisplay && <span>• {ageDisplay}</span>}
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              type="button"
              className="rounded-full p-1.5 text-white/70 hover:bg-white/10 hover:text-white transition-colors"
              aria-label="Close Profile"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Body: Scrollable Details */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-brand-dark flex-1">
          {/* Quick Communication & Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#F8F9FA] border border-brand-border">
            <div className="flex items-center gap-2">
              <a
                href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                  `Namaste from Abhinaya Nartan Dance Academy regarding ${student.fullName}.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 active:scale-95 transition-all"
              >
                <MessageCircle size={14} />
                <span>WhatsApp Parent</span>
              </a>

              <a
                href={`tel:${parentPhone}`}
                className="inline-flex items-center gap-1.5 rounded-xl border border-brand-border bg-white px-3.5 py-2 text-xs font-semibold text-brand-dark hover:border-brand-primary hover:text-brand-primary-dark active:scale-95 transition-all"
              >
                <Phone size={14} />
                <span>Call ({parentPhone})</span>
              </a>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onQuickCollectFee(student);
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-brand-gold px-3.5 py-2 text-xs font-semibold text-purple-950 shadow-gold-sm hover:brightness-105 active:scale-95 transition-all"
              >
                <CreditCard size={14} />
                <span>Collect Fee (₹{monthlyFee})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEdit(student);
                }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-brand-primary/40 bg-[#F5F0FC] px-3.5 py-2 text-xs font-semibold text-brand-primary-dark hover:bg-brand-primary hover:text-white active:scale-95 transition-all"
              >
                <Edit size={14} />
                <span>Edit Profile</span>
              </button>
            </div>
          </div>

          {/* Grid Layout: Academic & Studio Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Studio & Batch Assignment */}
            <div className="p-4 rounded-2xl border border-brand-border bg-white shadow-sm space-y-3">
              <h3 className="font-serif text-sm font-bold text-brand-dark flex items-center gap-2">
                <Building2 size={16} className="text-brand-gold-dark" />
                <span>Studio & Batch Assignment</span>
              </h3>

              <div className="space-y-2 pt-1">
                <div>
                  <span className="text-[0.68rem] text-brand-muted block">Studio Branch</span>
                  <span className="font-semibold text-brand-dark">
                    {branch?.name || "Vijayawada Main Studio"}
                  </span>
                </div>

                <div>
                  <span className="text-[0.68rem] text-brand-muted block">Assigned Batch</span>
                  <span className="font-semibold text-brand-primary-dark">
                    {batch?.name || "Unassigned Batch"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[0.68rem] text-brand-muted block">Timetable</span>
                    <span className="text-brand-dark flex items-center gap-1">
                      <Clock size={12} className="text-brand-muted" />
                      <span>{batch?.scheduleDays.join(", ") || "Mon, Wed, Fri"}</span>
                    </span>
                  </div>
                  <div>
                    <span className="text-[0.68rem] text-brand-muted block">Faculty Guru</span>
                    <span className="text-brand-dark">
                      {batch?.teacherName || "Smt. Sravani Rao"}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-[0.68rem] text-brand-muted block">Classical Dance Level</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-semibold text-brand-primary-dark border border-purple-100">
                    <Sparkles size={11} className="text-brand-gold" />
                    <span>{student.level || "Beginner"}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Parent & Guardian Contact Details */}
            <div className="p-4 rounded-2xl border border-brand-border bg-white shadow-sm space-y-3">
              <h3 className="font-serif text-sm font-bold text-brand-dark flex items-center gap-2">
                <HeartHandshake size={16} className="text-brand-primary" />
                <span>Parent & Guardian Information</span>
              </h3>

              <div className="space-y-2 pt-1">
                <div>
                  <span className="text-[0.68rem] text-brand-muted block">Parent / Guardian Name</span>
                  <span className="font-semibold text-brand-dark">{student.parentName}</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[0.68rem] text-brand-muted block">Primary Phone / WhatsApp</span>
                    <span className="font-mono text-brand-dark">{parentPhone}</span>
                  </div>
                  <div>
                    <span className="text-[0.68rem] text-brand-muted block">Student Phone</span>
                    <span className="font-mono text-brand-dark">
                      {student.studentPhone || "Not provided"}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-[0.68rem] text-brand-muted block">Residential Address</span>
                  <span className="text-brand-dark flex items-start gap-1">
                    <MapPin size={13} className="text-brand-muted shrink-0 mt-0.5" />
                    <span>{student.address || "Vijayawada, Andhra Pradesh"}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Academic Journey & Financial Terms */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Enrollment Tenure */}
            <div className="p-4 rounded-2xl border border-brand-border bg-white shadow-sm space-y-2">
              <h3 className="font-serif text-sm font-bold text-brand-dark flex items-center gap-2">
                <Calendar size={16} className="text-brand-gold-dark" />
                <span>Academy Tenure</span>
              </h3>
              <div>
                <span className="text-[0.68rem] text-brand-muted block">Admission Joining Date</span>
                <span className="font-semibold text-brand-dark">{joiningDate}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-purple-50/60 border border-purple-100 flex items-center gap-2">
                <GraduationCap size={16} className="text-brand-primary-dark shrink-0" />
                <span className="text-xs text-brand-primary-dark font-medium">{tenureDisplay}</span>
              </div>
            </div>

            {/* Financial Terms */}
            <div className="p-4 rounded-2xl border border-brand-border bg-white shadow-sm space-y-2">
              <h3 className="font-serif text-sm font-bold text-brand-dark flex items-center gap-2">
                <CreditCard size={16} className="text-emerald-700" />
                <span>Monthly Fee Structure</span>
              </h3>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[0.68rem] text-brand-muted block">Standard Class Tuition</span>
                  <span className="font-serif text-xl font-bold text-purple-950">
                    ₹{monthlyFee.toLocaleString("en-IN")}
                  </span>
                  <span className="text-[0.68rem] text-brand-muted"> / month</span>
                </div>
                <span className="rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 font-semibold text-xs">
                  Active Subscription
                </span>
              </div>
            </div>
          </div>

          {/* Background / Notes */}
          {student.notes && (
            <div className="p-4 rounded-2xl border border-brand-border bg-[#F8F9FA]">
              <span className="text-[0.68rem] font-bold uppercase tracking-wider text-brand-muted block mb-1">
                Artistic Notes & Background
              </span>
              <p className="text-xs text-brand-dark leading-relaxed">{student.notes}</p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-brand-border bg-[#F8F9FA] flex items-center justify-between shrink-0">
          <span className="text-[0.68rem] text-brand-muted">
            Enrolled in Abhinaya Nartan Kuchipudi Academy
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-brand-border bg-white px-4 py-2 text-xs font-semibold text-brand-dark hover:bg-gray-50 transition-colors"
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
}
