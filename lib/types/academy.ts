export type UserRole = "super_admin" | "branch_admin" | "teacher";

export interface Branch {
  id: string;
  name: string;
  code: string;
  city: string;
  address?: string;
  phone?: string;
  isActive: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  branchId?: string;
}

export interface Batch {
  id: string;
  branchId: string;
  name: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  scheduleDays: string[]; // e.g. ["Mon", "Wed", "Fri"]
  startTime: string; // e.g. "06:00 PM"
  endTime: string; // e.g. "08:00 PM"
  teacherName: string;
  teacherId?: string;
  maxCapacity: number;
  monthlyFee: number;
  isActive: boolean;
  status?: "active" | "inactive";
}

export interface Student {
  id: string;
  admissionNumber: string; // e.g. AN-2024-001
  studentCode?: string; // Supabase column alias
  branchId: string;
  batchId: string;
  fullName: string;
  parentName: string;
  phone: string;
  parentPhone?: string; // Supabase column alias
  studentPhone?: string;
  whatsapp: string;
  email?: string;
  dateOfBirth?: string; // YYYY-MM-DD
  gender?: "female" | "male" | "other";
  enrollmentDate: string; // YYYY-MM-DD
  joiningDate?: string; // Supabase column alias
  monthlyFee?: number;
  level: "Beginner" | "Intermediate" | "Advanced";
  status: "active" | "inactive" | "on_leave";
  address?: string;
  notes?: string;
}

export type AttendanceStatus = "present" | "absent" | "leave" | "late" | "excused";

export interface AttendanceRecord {
  id: string;
  studentId: string;
  batchId: string;
  branchId: string;
  date: string; // YYYY-MM-DD
  attendanceDate?: string; // Supabase column alias
  status: AttendanceStatus;
  markedBy?: string;
  createdAt?: string;
  remarks?: string;
}

export type PaymentMode = "upi" | "cash" | "bank_transfer" | "cheque";
export type OfficialPaymentMethod = "Cash" | "UPI" | "Bank Transfer";

export interface FeePayment {
  id: string;
  receiptNumber: string;
  studentId: string;
  branchId: string;
  batchId: string;
  forMonth: number; // 1-12
  forYear: number;
  paymentPeriod?: string; // e.g. "November 2026" or "2026-11"
  amountPaid: number;
  paymentDate: string; // YYYY-MM-DD
  paymentMode: PaymentMode;
  paymentMethod?: OfficialPaymentMethod;
  transactionRef?: string;
  collectedBy: string;
  recordedBy?: string;
  notes?: string;
  outstandingBalance?: number;
  createdAt?: string;
}

export interface FeeAdjustment {
  id: string;
  studentId: string;
  amount: number;
  adjustmentType: "discount" | "scholarship" | "waiver" | "fine" | "other";
  reason: string;
  createdAt: string;
}

export type FeePaymentStatus = "Paid" | "Partially Paid" | "Pending" | "Overdue";

export interface StudentFeeSummary {
  studentId: string;
  studentName: string;
  monthlyFee: number;
  periodLabel: string;
  forMonth: number;
  forYear: number;
  totalPaid: number;
  outstandingBalance: number;
  status: "paid" | "partial" | "unpaid";
  paymentStatus?: FeePaymentStatus;
  paymentCount: number;
  latestReceiptNumber?: string;
  lastPaymentDate?: string;
}

export interface StudentOutstandingFeeRecord {
  studentId: string;
  studentName: string;
  studentCode: string;
  parentName: string;
  parentPhone: string;
  branchId: string;
  branchName: string;
  batchId: string;
  batchName: string;
  monthlyFee: number;
  totalPaid: number;
  outstandingBalance: number;
  feePeriod: string;
  forMonth: number;
  forYear: number;
  status: FeePaymentStatus;
  lastPaymentDate?: string;
  receiptNumber?: string;
  isOverdue: boolean;
}

export interface PendingFeeItem {
  student: Student;
  batch: Batch;
  pendingMonths: string[];
  totalDue: number;
  lastPaymentDate?: string;
}

export interface DashboardMetrics {
  totalActiveStudents: number;
  totalBatches: number;
  monthlyRevenue: number;
  pendingFeesTotal: number;
  todayAttendanceRate: number;
  activeBranchName: string;
}

export type ClassStatus = "scheduled" | "in_progress" | "completed" | "cancelled";

export interface DanceClass {
  id: string;
  className: string;
  branchId: string;
  batchId: string;
  teacherId?: string;
  teacherName?: string;
  batchName?: string;
  branchName?: string;
  classDate: string; // YYYY-MM-DD
  startTime: string; // "17:00:00" or "05:00 PM"
  endTime: string;   // "18:30:00" or "06:30 PM"
  status: ClassStatus;
  notes?: string;
  createdAt?: string;
}

export interface ClassInput {
  className: string;
  branchId: string;
  batchId: string;
  teacherId?: string;
  teacherName?: string;
  classDate: string;
  startTime: string;
  endTime: string;
  status?: ClassStatus;
  notes?: string;
}

export interface ClassServiceResult {
  success: boolean;
  class?: DanceClass;
  error?: string;
  isDuplicate?: boolean;
}
