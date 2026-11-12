"use client";

import { useEffect, useState } from "react";
import { ShieldAlert } from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/lib/auth/AuthContext";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import OverviewContent from "@/components/dashboard/OverviewContent";
import StudentsView from "@/components/dashboard/StudentsView";
import BatchesView from "@/components/dashboard/BatchesView";
import ClassesView from "@/components/dashboard/ClassesView";
import AttendanceView from "@/components/dashboard/AttendanceView";
import FeeCollectionView from "@/components/dashboard/FeeCollectionView";
import PaymentHistoryView from "@/components/dashboard/PaymentHistoryView";
import PendingFeesView from "@/components/dashboard/PendingFeesView";
import ReportsView from "@/components/dashboard/ReportsView";
import SettingsView from "@/components/dashboard/SettingsView";
import ReceiptModal from "@/components/dashboard/ReceiptModal";
import {
  getStudentsFromDatabase,
  createStudent,
  updateStudent,
  StudentInput,
  StudentServiceResult,
} from "@/lib/services/studentService";
import {
  getBatchesFromDatabase,
  createBatch,
  updateBatch,
  toggleBatchStatus,
  transferStudentBatch,
  BatchInput,
  BatchServiceResult,
} from "@/lib/services/batchService";
import { getBranchesFromDatabase } from "@/lib/services/branchService";
import {
  getTeachersFromDatabase,
  TeacherProfile,
  FALLBACK_TEACHERS,
} from "@/lib/services/teacherService";
import {
  getClassesFromDatabase,
  createClass,
  updateClass,
  deleteClass,
} from "@/lib/services/classService";
import { getAttendanceFromDatabase } from "@/lib/services/attendanceService";
import {
  getFeePaymentsFromDatabase,
  recordFeePayment,
  FeePaymentInput,
  FeePaymentResult,
} from "@/lib/services/feeService";
import {
  AcademyDataStore,
  initialBranches,
  initialBatches,
  initialStudents,
  initialFeePayments,
} from "@/lib/academyStore";
import {
  Branch,
  Batch,
  Student,
  DanceClass,
  ClassInput,
  ClassServiceResult,
  AttendanceRecord,
  FeePayment,
  UserProfile,
} from "@/lib/types/academy";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [selectedBranchId, setSelectedBranchId] = useState<string>("all");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [branches, setBranches] = useState<Branch[]>([]);
  const [teachers, setTeachers] = useState<TeacherProfile[]>(FALLBACK_TEACHERS);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<DanceClass[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [feePayments, setFeePayments] = useState<FeePayment[]>([]);
  const { user: authUser } = useAuth();
  const [user, setUser] = useState<UserProfile>(AcademyDataStore.getUser());

  // Receipt modal state
  const [activeReceiptPayment, setActiveReceiptPayment] = useState<FeePayment | null>(null);
  const [preselectedFeeStudentId, setPreselectedFeeStudentId] = useState<string | null>(null);

  // Load from Supabase on mount (falling back to synchronized store)
  useEffect(() => {
    async function loadInitialData() {
      setBranches(AcademyDataStore.getBranches());
      setFeePayments(AcademyDataStore.getFeePayments());

      try {
        const [
          dbBranches,
          dbTeachers,
          dbStudents,
          dbBatches,
          dbClasses,
          dbAttendance,
          dbPayments,
        ] = await Promise.all([
          getBranchesFromDatabase(),
          getTeachersFromDatabase(),
          getStudentsFromDatabase(),
          getBatchesFromDatabase(),
          getClassesFromDatabase(),
          getAttendanceFromDatabase(),
          getFeePaymentsFromDatabase(),
        ]);

        if (dbBranches && dbBranches.length > 0) setBranches(dbBranches);
        if (dbTeachers && dbTeachers.length > 0) setTeachers(dbTeachers);
        if (dbStudents) setStudents(dbStudents);
        if (dbBatches) setBatches(dbBatches);
        if (dbClasses) setClasses(dbClasses);
        if (dbAttendance) setAttendance(dbAttendance);
        if (dbPayments && dbPayments.length > 0) setFeePayments(dbPayments);
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      }
    }
    loadInitialData();
  }, []);

  // Synchronize authenticated staff profile
  useEffect(() => {
    if (authUser) {
      setUser({
        id: authUser.id,
        name: authUser.fullName,
        email: authUser.email,
        role: authUser.role === "admin" ? "super_admin" : "teacher",
        branchId: authUser.branchId || undefined,
      });
      if (authUser.role === "teacher" && authUser.branchId) {
        setSelectedBranchId(authUser.branchId);
      }
    }
  }, [authUser]);

  // Role-Based Filtering
  const isTeacher = user.role === "teacher";

  // Teachers are scoped to their assigned batches
  const teacherBatches = batches.filter(
    (b) =>
      (b.teacherId && b.teacherId === user.id) ||
      b.teacherName.toLowerCase().includes(user.name.toLowerCase()) ||
      b.teacherName.toLowerCase().includes("ramesh") ||
      (user.branchId && b.branchId === user.branchId)
  );

  const accessibleBatches = isTeacher ? teacherBatches : batches;
  const accessibleBatchIds = new Set(accessibleBatches.map((b) => b.id));

  // Filter entities by active branch and role
  const branchFilteredStudents =
    selectedBranchId === "all"
      ? students
      : students.filter((s) => s.branchId === selectedBranchId);

  const visibleStudents = isTeacher
    ? branchFilteredStudents.filter((s) => accessibleBatchIds.has(s.batchId))
    : branchFilteredStudents;

  const branchFilteredBatches =
    selectedBranchId === "all"
      ? accessibleBatches
      : accessibleBatches.filter((b) => b.branchId === selectedBranchId);

  const visibleBatches = branchFilteredBatches;

  // Filter Classes by active branch and role
  const branchFilteredClasses =
    selectedBranchId === "all"
      ? classes
      : classes.filter((c) => c.branchId === selectedBranchId);

  const visibleClasses = isTeacher
    ? branchFilteredClasses.filter(
        (c) => (c.teacherId && c.teacherId === user.id) || accessibleBatchIds.has(c.batchId)
      )
    : branchFilteredClasses;

  const visibleFeePayments =
    selectedBranchId === "all"
      ? feePayments
      : feePayments.filter((p) => p.branchId === selectedBranchId);

  // Pending count for sidebar badge
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const thisMonthPaidIds = new Set(
    feePayments
      .filter((p) => p.forMonth === currentMonth && p.forYear === currentYear)
      .map((p) => p.studentId)
  );
  const pendingCount = visibleStudents.filter(
    (s) => s.status === "active" && !thisMonthPaidIds.has(s.id)
  ).length;

  // Handlers for Students
  const handleAddStudent = async (input: StudentInput): Promise<StudentServiceResult> => {
    const res = await createStudent(input, students);
    if (res.success && res.student) {
      setStudents([res.student, ...students]);
    }
    return res;
  };

  const handleEditStudent = async (
    studentId: string,
    updates: Partial<StudentInput>
  ): Promise<StudentServiceResult> => {
    const res = await updateStudent(studentId, updates, students);
    if (res.success && res.student) {
      setStudents((prev) => prev.map((s) => (s.id === studentId ? res.student! : s)));
    }
    return res;
  };

  const handleUpdateStudentStatus = async (studentId: string, status: Student["status"]) => {
    await updateStudent(studentId, { status }, students);
    setStudents((prev) => prev.map((s) => (s.id === studentId ? { ...s, status } : s)));
  };

  // Handlers for Batches
  const handleAddBatch = async (input: BatchInput): Promise<BatchServiceResult> => {
    const res = await createBatch(input, batches);
    if (res.success && res.batch) {
      setBatches([...batches, res.batch]);
    }
    return res;
  };

  const handleEditBatch = async (
    batchId: string,
    updates: Partial<BatchInput>
  ): Promise<BatchServiceResult> => {
    const res = await updateBatch(batchId, updates, batches);
    if (res.success && res.batch) {
      setBatches((prev) => prev.map((b) => (b.id === batchId ? res.batch! : b)));
    }
    return res;
  };

  const handleToggleBatchStatus = async (batchId: string): Promise<BatchServiceResult> => {
    const res = await toggleBatchStatus(batchId, batches);
    if (res.success && res.batch) {
      setBatches((prev) => prev.map((b) => (b.id === batchId ? res.batch! : b)));
    }
    return res;
  };

  const handleTransferStudent = async (studentId: string, targetBatchId: string) => {
    const res = await transferStudentBatch(studentId, targetBatchId, students);
    if (res.success && res.student) {
      setStudents((prev) => prev.map((s) => (s.id === studentId ? res.student! : s)));
    }
    return res;
  };

  // Handlers for Classes
  const handleAddClass = async (input: ClassInput): Promise<ClassServiceResult> => {
    const res = await createClass(input, classes);
    if (res.success && res.class) {
      setClasses([res.class, ...classes]);
    }
    return res;
  };

  const handleEditClass = async (
    classId: string,
    updates: Partial<ClassInput>
  ): Promise<ClassServiceResult> => {
    const res = await updateClass(classId, updates, classes);
    if (res.success && res.class) {
      setClasses((prev) => prev.map((c) => (c.id === classId ? res.class! : c)));
    }
    return res;
  };

  const handleDeleteClass = async (classId: string) => {
    const res = await deleteClass(classId, classes);
    if (res.success) {
      setClasses((prev) => prev.filter((c) => c.id !== classId));
    }
    return res;
  };

  const handleSaveAttendance = (records: AttendanceRecord[]) => {
    setAttendance(records);
    AcademyDataStore.saveAttendance(records);
  };

  const handleAddFeePayment = async (input: FeePaymentInput): Promise<FeePaymentResult> => {
    const student = students.find((s) => s.id === input.studentId);
    if (!student) {
      return { success: false, error: "Student not found in academy records." };
    }
    const batch = batches.find((b) => b.id === student.batchId);
    const res = await recordFeePayment(
      {
        ...input,
        collectedBy: user.name,
      },
      feePayments,
      student,
      batch
    );

    if (res.success && res.payment) {
      setFeePayments((prev) => [res.payment!, ...prev]);
      setActiveReceiptPayment(res.payment);
    }
    return res;
  };

  const handleAddBranch = (newBranchData: Omit<Branch, "id">) => {
    const newBranch: Branch = {
      ...newBranchData,
      id: `branch-${Date.now()}`,
    };
    const updated = [...branches, newBranch];
    setBranches(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("an_academy_branches_v2", JSON.stringify(updated));
    }
  };

  const handleResetData = () => {
    AcademyDataStore.resetToDemoData();
    setBranches(initialBranches);
    setBatches(initialBatches);
    setStudents(initialStudents);
    setFeePayments(initialFeePayments);
    setAttendance(AcademyDataStore.getAttendance());
    setClasses(AcademyDataStore.getClasses());
  };

  const handleToggleRole = () => {
    // Only administrators can toggle the preview perspective
    if (authUser?.role === "admin" || !authUser) {
      const newRole = user.role === "super_admin" ? "teacher" : "super_admin";
      const updated: UserProfile = {
        ...user,
        role: newRole,
        name:
          newRole === "super_admin"
            ? (authUser?.fullName || "Smt. Sravani Rao")
            : "Sri K. Ramesh Master",
      };
      setUser(updated);
      AcademyDataStore.saveUser(updated);
    }
  };

  const handleQuickPayFromPending = async (student: Student, amount: number) => {
    const batch = batches.find((b) => b.id === student.batchId);
    const res = await recordFeePayment(
      {
        studentId: student.id,
        amountPaid: amount,
        forMonth: currentMonth,
        forYear: currentYear,
        paymentMethod: "UPI",
        transactionRef: `UPI-SETTLE-${Date.now().toString().slice(-6)}`,
        collectedBy: user.name,
        notes: "Quick payment settled via WhatsApp reminder",
        branchId: student.branchId,
        batchId: student.batchId,
      },
      feePayments,
      student,
      batch
    );

    if (res.success && res.payment) {
      setFeePayments((prev) => [res.payment!, ...prev]);
      setActiveReceiptPayment(res.payment);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#F8F9FA] text-brand-dark flex font-sans antialiased">
        {/* Desktop & Mobile Responsive Sidebar (10 items including Classes) */}
        <DashboardSidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          user={user}
          pendingCount={pendingCount}
          activeStudentsCount={visibleStudents.filter((s) => s.status === "active").length}
          isOpenMobile={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <div className="flex-1 min-w-0 flex flex-col min-h-screen">
          {/* Top Navbar */}
          <DashboardNavbar
            branches={branches}
            selectedBranchId={selectedBranchId}
            onSelectBranch={setSelectedBranchId}
            user={user}
            onToggleRole={handleToggleRole}
            onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
            onOpenEnrollModal={() => setActiveTab("students")}
            onOpenFeeModal={() => setActiveTab("fee-collection")}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />

          {/* View Port Container */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
            {/* 1. Overview */}
            {activeTab === "overview" && (
              <OverviewContent
                students={visibleStudents}
                batches={visibleBatches}
                feePayments={visibleFeePayments}
                attendance={attendance}
                onNavigateTab={setActiveTab}
                onOpenEnrollModal={() => setActiveTab("students")}
                onOpenFeeModal={() => setActiveTab("fee-collection")}
                onViewReceipt={setActiveReceiptPayment}
              />
            )}

            {/* 2. Students */}
            {activeTab === "students" && (
              <StudentsView
                students={visibleStudents}
                batches={visibleBatches}
                branches={branches}
                onAddStudent={handleAddStudent}
                onEditStudent={handleEditStudent}
                onUpdateStatus={handleUpdateStudentStatus}
                onQuickCollectFee={(student) => {
                  setPreselectedFeeStudentId(student.id);
                  setActiveTab("fee-collection");
                }}
              />
            )}

            {/* 3. Batches */}
            {activeTab === "batches" && (
              <BatchesView
                batches={visibleBatches}
                students={students}
                branches={branches}
                teachers={teachers}
                onAddBatch={handleAddBatch}
                onEditBatch={handleEditBatch}
                onToggleStatus={handleToggleBatchStatus}
                onTransferStudent={handleTransferStudent}
              />
            )}

            {/* 4. Classes */}
            {activeTab === "classes" && (
              <ClassesView
                classes={visibleClasses}
                batches={visibleBatches}
                branches={branches}
                teachers={teachers}
                onAddClass={handleAddClass}
                onEditClass={handleEditClass}
                onDeleteClass={handleDeleteClass}
              />
            )}

            {/* 5. Attendance */}
            {activeTab === "attendance" && (
              <AttendanceView
                batches={visibleBatches}
                students={visibleStudents}
                branches={branches}
                attendance={attendance}
                user={user}
                onSaveAttendance={handleSaveAttendance}
              />
            )}

            {/* 6. Fee Collection */}
            {activeTab === "fee-collection" && (
              <FeeCollectionView
                students={visibleStudents}
                batches={visibleBatches}
                feePayments={visibleFeePayments}
                onCollectFee={handleAddFeePayment}
                onViewReceipt={setActiveReceiptPayment}
                preselectedStudentId={preselectedFeeStudentId || undefined}
              />
            )}

            {/* 7. Payment History */}
            {activeTab === "payment-history" && (
              <PaymentHistoryView
                feePayments={visibleFeePayments}
                students={visibleStudents}
                batches={visibleBatches}
                onViewReceipt={setActiveReceiptPayment}
              />
            )}

            {/* 8. Pending Fees */}
            {activeTab === "pending-fees" && (
              <PendingFeesView
                students={visibleStudents}
                batches={visibleBatches}
                branches={branches}
                feePayments={visibleFeePayments}
                onQuickPay={handleQuickPayFromPending}
                onNavigateFeeCollection={(studentId) => {
                  setPreselectedFeeStudentId(studentId);
                  setActiveTab("fee-collection");
                }}
              />
            )}

            {/* 9. Reports */}
            {activeTab === "reports" && (
              <ReportsView
                students={visibleStudents}
                batches={visibleBatches}
                branches={branches}
                feePayments={visibleFeePayments}
                attendance={attendance}
              />
            )}

            {/* 10. Settings */}
            {activeTab === "settings" && (
              isTeacher ? (
                <div className="bg-white rounded-3xl border border-brand-border p-8 text-center max-w-md mx-auto my-12 shadow-sm">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50 text-brand-primary-dark mb-4 border border-brand-primary/20">
                    <ShieldAlert size={28} />
                  </div>
                  <h3 className="font-serif text-lg font-bold text-brand-dark">
                    Director Administration Only
                  </h3>
                  <p className="mt-2 text-xs text-brand-muted leading-relaxed">
                    Studio branch provisioning and database synchronization are restricted to Academy Directors. Your faculty profile is authorized for student instruction, attendance, and batch management.
                  </p>
                </div>
              ) : (
                <SettingsView
                  branches={branches}
                  onAddBranch={handleAddBranch}
                  onResetData={handleResetData}
                />
              )
            )}
          </main>
        </div>

        {/* Digital Fee Receipt Modal Voucher */}
        {activeReceiptPayment && (
          <ReceiptModal
            payment={activeReceiptPayment}
            student={students.find((s) => s.id === activeReceiptPayment.studentId)}
            batch={batches.find((b) => b.id === activeReceiptPayment.batchId)}
            onClose={() => setActiveReceiptPayment(null)}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}