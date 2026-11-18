import {
  AttendanceRecord,
  Batch,
  Branch,
  DanceClass,
  FeePayment,
  Student,
  UserProfile,
} from "./types/academy";
import { isSupabaseConfigured } from "./supabaseClient";

export interface MonthlyChartData {
  month: string;
  shortMonth: string;
  year: number;
  collected: number;
  target: number;
  studentCount: number;
}

// The production academy starts from this one real branch. Operational records
// are intentionally empty until authorised staff create them.
export const initialBranches: Branch[] = [
  {
    id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    name: "Vijayawada Main Studio",
    code: "VJA-01",
    city: "Vijayawada",
    address: "Bunder Road, Vijayawada, Andhra Pradesh",
    phone: "+91 93981 18249",
    isActive: true,
  },
];

export const initialBatches: Batch[] = [];
export const initialStudents: Student[] = [];
export const initialFeePayments: FeePayment[] = [];
export const initialClasses: DanceClass[] = [];
export const getInitialAttendance = (): AttendanceRecord[] => [];

const monthFormatter = new Intl.DateTimeFormat("en-IN", { month: "short" });
export const initialMonthlyChartData: MonthlyChartData[] = Array.from({ length: 6 }, (_, index) => {
  const date = new Date();
  date.setMonth(date.getMonth() - (5 - index));
  return {
    month: monthFormatter.format(date),
    shortMonth: monthFormatter.format(date),
    year: date.getFullYear(),
    collected: 0,
    target: 0,
    studentCount: 0,
  };
});

// This state is only used until the authenticated profile loads from Supabase.
export const defaultUser: UserProfile = {
  id: "",
  name: "Academy Staff",
  email: "",
  role: "teacher",
};

const STORAGE_KEY_STUDENTS = "an_academy_students_v3";
const STORAGE_KEY_BATCHES = "an_academy_batches_v3";
const STORAGE_KEY_FEES = "an_academy_fees_v3";
const STORAGE_KEY_ATTENDANCE = "an_academy_attendance_v3";
const STORAGE_KEY_BRANCHES = "an_academy_branches_v3";
const STORAGE_KEY_CLASSES = "an_academy_classes_v3";
const STORAGE_KEY_USER = "an_academy_user_v3";
const ALL_STORAGE_KEYS = [
  STORAGE_KEY_STUDENTS,
  STORAGE_KEY_BATCHES,
  STORAGE_KEY_FEES,
  STORAGE_KEY_ATTENDANCE,
  STORAGE_KEY_BRANCHES,
  STORAGE_KEY_CLASSES,
  STORAGE_KEY_USER,
];

export class AcademyDataStore {
  static isClient(): boolean {
    return typeof window !== "undefined";
  }

  /**
   * Browser storage is an offline-development fallback only. In production we
   * have Supabase configured, so retaining PII and payment history in a shared
   * browser would allow the next device user to see the previous staff
   * member's data before a remote session is restored.
   */
  private static usesRemoteData(): boolean {
    return isSupabaseConfigured();
  }

  private static discard(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch {
      // Storage can be disabled by the browser; there is nothing to retain.
    }
  }

  private static read<T>(key: string, fallback: T): T {
    if (!this.isClient()) return fallback;
    if (this.usesRemoteData()) {
      this.discard(key);
      return fallback;
    }
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  }

  private static write<T>(key: string, value: T): void {
    if (!this.isClient()) return;
    if (this.usesRemoteData()) {
      this.discard(key);
      return;
    }
    localStorage.setItem(key, JSON.stringify(value));
  }

  /** Remove every legacy academy cache key from this browser. */
  static clearLocalCache(): void {
    if (!this.isClient()) return;
    ALL_STORAGE_KEYS.forEach((key) => this.discard(key));
  }

  static getBranches(): Branch[] {
    return this.read(STORAGE_KEY_BRANCHES, initialBranches);
  }

  static saveBranches(branches: Branch[]): void {
    this.write(STORAGE_KEY_BRANCHES, branches);
  }

  static getBatches(): Batch[] {
    return this.read(STORAGE_KEY_BATCHES, initialBatches);
  }

  static saveBatches(batches: Batch[]): void {
    this.write(STORAGE_KEY_BATCHES, batches);
  }

  static getStudents(): Student[] {
    return this.read(STORAGE_KEY_STUDENTS, initialStudents);
  }

  static saveStudents(students: Student[]): void {
    this.write(STORAGE_KEY_STUDENTS, students);
  }

  static getClasses(): DanceClass[] {
    return this.read(STORAGE_KEY_CLASSES, initialClasses);
  }

  static saveClasses(classes: DanceClass[]): void {
    this.write(STORAGE_KEY_CLASSES, classes);
  }

  static getFeePayments(): FeePayment[] {
    return this.read(STORAGE_KEY_FEES, initialFeePayments);
  }

  static saveFeePayments(payments: FeePayment[]): void {
    this.write(STORAGE_KEY_FEES, payments);
  }

  static getAttendance(): AttendanceRecord[] {
    return this.read(STORAGE_KEY_ATTENDANCE, getInitialAttendance());
  }

  static saveAttendance(records: AttendanceRecord[]): void {
    this.write(STORAGE_KEY_ATTENDANCE, records);
  }

  static getUser(): UserProfile {
    return this.read(STORAGE_KEY_USER, defaultUser);
  }

  static saveUser(user: UserProfile): void {
    this.write(STORAGE_KEY_USER, user);
  }

}
