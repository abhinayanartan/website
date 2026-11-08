import {
  Branch,
  Batch,
  Student,
  AttendanceRecord,
  FeePayment,
  UserProfile,
} from "./types/academy";

export interface MonthlyChartData {
  month: string;
  shortMonth: string;
  year: number;
  collected: number;
  target: number;
  studentCount: number;
}

export const initialBranches: Branch[] = [
  {
    id: "branch-vja",
    name: "Vijayawada Main Studio",
    code: "VJA-01",
    city: "Vijayawada",
    address: "Bunder Road, Vijayawada, Andhra Pradesh",
    phone: "+91 93981 18249",
    isActive: true,
  },
  {
    id: "branch-gnt",
    name: "Guntur Satellite Center",
    code: "GNT-01",
    city: "Guntur",
    address: "Lakshmipuram, Guntur, Andhra Pradesh",
    phone: "+91 93981 18249",
    isActive: false,
  },
];

export const initialBatches: Batch[] = [
  {
    id: "batch-1",
    branchId: "branch-vja",
    name: "Junior Balagopala (Beginners)",
    level: "Beginner",
    scheduleDays: ["Mon", "Wed", "Fri"],
    startTime: "05:00 PM",
    endTime: "06:30 PM",
    teacherName: "Guru Smt. Radhika",
    maxCapacity: 20,
    monthlyFee: 1500,
    isActive: true,
  },
  {
    id: "batch-2",
    branchId: "branch-vja",
    name: "Abhinaya & Natya Masters",
    level: "Intermediate",
    scheduleDays: ["Mon", "Wed", "Fri"],
    startTime: "06:30 PM",
    endTime: "08:00 PM",
    teacherName: "Guru Smt. Radhika",
    maxCapacity: 18,
    monthlyFee: 1800,
    isActive: true,
  },
  {
    id: "batch-3",
    branchId: "branch-vja",
    name: "Tarangam Brass Plate Intensive",
    level: "Advanced",
    scheduleDays: ["Sun"],
    startTime: "09:00 AM",
    endTime: "12:00 PM",
    teacherName: "Guru Sri Krishna",
    maxCapacity: 15,
    monthlyFee: 2200,
    isActive: true,
  },
  {
    id: "batch-4",
    branchId: "branch-vja",
    name: "Weekend Senior Repertoire",
    level: "Advanced",
    scheduleDays: ["Sun"],
    startTime: "06:00 PM",
    endTime: "08:00 PM",
    teacherName: "Guru Smt. Radhika",
    maxCapacity: 16,
    monthlyFee: 1600,
    isActive: true,
  },
];

export const initialStudents: Student[] = [
  {
    id: "std-1",
    admissionNumber: "AN-2024-001",
    branchId: "branch-vja",
    batchId: "batch-3",
    fullName: "Sravani Manepalli",
    parentName: "Srinivasa Rao M.",
    phone: "+91 98480 12345",
    whatsapp: "+91 98480 12345",
    email: "sravani.m@example.com",
    enrollmentDate: "2024-01-10",
    level: "Advanced",
    status: "active",
    address: "Benz Circle, Vijayawada",
    notes: "Lead soloist in Tarangam plate recital.",
  },
  {
    id: "std-2",
    admissionNumber: "AN-2024-002",
    branchId: "branch-vja",
    batchId: "batch-2",
    fullName: "Ananya Varma",
    parentName: "Ramesh Varma",
    phone: "+91 94401 56789",
    whatsapp: "+91 94401 56789",
    email: "ananya.v@example.com",
    enrollmentDate: "2024-02-15",
    level: "Intermediate",
    status: "active",
    address: "Governorpet, Vijayawada",
  },
  {
    id: "std-3",
    admissionNumber: "AN-2025-015",
    branchId: "branch-vja",
    batchId: "batch-1",
    fullName: "Keerthi Priya K.",
    parentName: "Venkateswarlu K.",
    phone: "+91 98665 43210",
    whatsapp: "+91 98665 43210",
    enrollmentDate: "2025-04-01",
    level: "Beginner",
    status: "active",
    address: "Moghalrajpuram, Vijayawada",
  },
  {
    id: "std-4",
    admissionNumber: "AN-2025-018",
    branchId: "branch-vja",
    batchId: "batch-1",
    fullName: "Divya Tejaswi",
    parentName: "Narasimha Murthy",
    phone: "+91 99890 24680",
    whatsapp: "+91 99890 24680",
    enrollmentDate: "2025-05-10",
    level: "Beginner",
    status: "active",
    address: "Labbipet, Vijayawada",
  },
  {
    id: "std-5",
    admissionNumber: "AN-2024-009",
    branchId: "branch-vja",
    batchId: "batch-2",
    fullName: "Bhavana Chowdary",
    parentName: "Subba Rao Ch.",
    phone: "+91 98492 13579",
    whatsapp: "+91 98492 13579",
    enrollmentDate: "2024-06-01",
    level: "Intermediate",
    status: "active",
    address: "Patamata, Vijayawada",
  },
  {
    id: "std-6",
    admissionNumber: "AN-2023-004",
    branchId: "branch-vja",
    batchId: "batch-3",
    fullName: "Harini Rayudu",
    parentName: "Prasad Rayudu",
    phone: "+91 94901 98765",
    whatsapp: "+91 94901 98765",
    enrollmentDate: "2023-08-20",
    level: "Advanced",
    status: "active",
    address: "Gunadala, Vijayawada",
  },
  {
    id: "std-7",
    admissionNumber: "AN-2025-022",
    branchId: "branch-vja",
    batchId: "batch-4",
    fullName: "Pooja Sri",
    parentName: "Mallikarjuna Rao",
    phone: "+91 93467 89012",
    whatsapp: "+91 93467 89012",
    enrollmentDate: "2025-09-05",
    level: "Advanced",
    status: "active",
    address: "Satyanarayanapuram, Vijayawada",
  },
  {
    id: "std-8",
    admissionNumber: "AN-2026-001",
    branchId: "branch-vja",
    batchId: "batch-1",
    fullName: "Tanvi Sri Sai",
    parentName: "Satish Kumar",
    phone: "+91 91771 23456",
    whatsapp: "+91 91771 23456",
    enrollmentDate: "2026-01-08",
    level: "Beginner",
    status: "active",
    address: "One Town, Vijayawada",
  },
  {
    id: "std-9",
    admissionNumber: "AN-2026-003",
    branchId: "branch-vja",
    batchId: "batch-2",
    fullName: "Sahithi Reddy",
    parentName: "Chandra Sekhar R.",
    phone: "+91 95023 45678",
    whatsapp: "+91 95023 45678",
    enrollmentDate: "2026-02-01",
    level: "Intermediate",
    status: "active",
    address: "Gollapudi, Vijayawada",
  },
  {
    id: "std-10",
    admissionNumber: "AN-2025-030",
    branchId: "branch-vja",
    batchId: "batch-4",
    fullName: "Meghana Kollipara",
    parentName: "Ravindra Babu K.",
    phone: "+91 98488 99001",
    whatsapp: "+91 98488 99001",
    enrollmentDate: "2025-11-12",
    level: "Advanced",
    status: "active",
    address: "Kanuru, Vijayawada",
  },
  {
    id: "std-11",
    admissionNumber: "AN-2024-019",
    branchId: "branch-vja",
    batchId: "batch-1",
    fullName: "Aadhya Varma",
    parentName: "Kalyan Varma",
    phone: "+91 96180 77665",
    whatsapp: "+91 96180 77665",
    enrollmentDate: "2024-09-15",
    level: "Beginner",
    status: "on_leave",
    address: "Tadigadapa, Vijayawada",
    notes: "Exam preparation leave.",
  },
  {
    id: "std-12",
    admissionNumber: "AN-2023-011",
    branchId: "branch-vja",
    batchId: "batch-2",
    fullName: "Yuktha Sri",
    parentName: "Nagaraju G.",
    phone: "+91 99499 11223",
    whatsapp: "+91 99499 11223",
    enrollmentDate: "2023-10-01",
    level: "Intermediate",
    status: "active",
    address: "Poranki, Vijayawada",
  },
  {
    id: "std-13",
    admissionNumber: "AN-2026-007",
    branchId: "branch-vja",
    batchId: "batch-3",
    fullName: "Lasya Priya",
    parentName: "Gopala Krishna",
    phone: "+91 98850 44556",
    whatsapp: "+91 98850 44556",
    enrollmentDate: "2026-03-01",
    level: "Advanced",
    status: "active",
    address: "Enikepadu, Vijayawada",
  },
  {
    id: "std-14",
    admissionNumber: "AN-2026-009",
    branchId: "branch-vja",
    batchId: "batch-1",
    fullName: "Nandini Rao",
    parentName: "Hanumantha Rao",
    phone: "+91 97011 22334",
    whatsapp: "+91 97011 22334",
    enrollmentDate: "2026-03-15",
    level: "Beginner",
    status: "active",
    address: "Penumaluru, Vijayawada",
  },
  {
    id: "std-15",
    admissionNumber: "AN-2024-025",
    branchId: "branch-vja",
    batchId: "batch-4",
    fullName: "Vaishnavi Devi",
    parentName: "Samba Siva Rao",
    phone: "+91 94412 88990",
    whatsapp: "+91 94412 88990",
    enrollmentDate: "2024-11-20",
    level: "Advanced",
    status: "active",
    address: "Gudivada Road, Vijayawada",
  },
  {
    id: "std-16",
    admissionNumber: "AN-2023-018",
    branchId: "branch-vja",
    batchId: "batch-2",
    fullName: "Charitha Sree",
    parentName: "Rama Rao P.",
    phone: "+91 99663 33445",
    whatsapp: "+91 99663 33445",
    enrollmentDate: "2023-12-05",
    level: "Intermediate",
    status: "inactive",
    address: "Auto Nagar, Vijayawada",
    notes: "Relocated temporarily for higher studies.",
  },
];

export const initialFeePayments: FeePayment[] = [
  {
    id: "fee-1",
    receiptNumber: "AN-2026-0101",
    studentId: "std-1",
    branchId: "branch-vja",
    batchId: "batch-3",
    forMonth: 11,
    forYear: 2026,
    amountPaid: 2200,
    paymentDate: "2026-11-02",
    paymentMode: "upi",
    transactionRef: "UPI-4309819231",
    collectedBy: "Guru Smt. Radhika",
    notes: "November monthly fee received via PhonePe",
  },
  {
    id: "fee-2",
    receiptNumber: "AN-2026-0102",
    studentId: "std-2",
    branchId: "branch-vja",
    batchId: "batch-2",
    forMonth: 11,
    forYear: 2026,
    amountPaid: 1800,
    paymentDate: "2026-11-03",
    paymentMode: "upi",
    transactionRef: "UPI-4310023412",
    collectedBy: "Guru Smt. Radhika",
  },
  {
    id: "fee-3",
    receiptNumber: "AN-2026-0103",
    studentId: "std-3",
    branchId: "branch-vja",
    batchId: "batch-1",
    forMonth: 11,
    forYear: 2026,
    amountPaid: 1500,
    paymentDate: "2026-11-04",
    paymentMode: "cash",
    collectedBy: "Guru Smt. Radhika",
    notes: "Cash handed at studio desk",
  },
  {
    id: "fee-4",
    receiptNumber: "AN-2026-0104",
    studentId: "std-6",
    branchId: "branch-vja",
    batchId: "batch-3",
    forMonth: 11,
    forYear: 2026,
    amountPaid: 2200,
    paymentDate: "2026-11-05",
    paymentMode: "bank_transfer",
    transactionRef: "NEFT-SBI99812",
    collectedBy: "Guru Smt. Radhika",
  },
  {
    id: "fee-5",
    receiptNumber: "AN-2026-0105",
    studentId: "std-8",
    branchId: "branch-vja",
    batchId: "batch-1",
    forMonth: 11,
    forYear: 2026,
    amountPaid: 1500,
    paymentDate: "2026-11-06",
    paymentMode: "upi",
    transactionRef: "UPI-4312389101",
    collectedBy: "Guru Smt. Radhika",
  },
  {
    id: "fee-6",
    receiptNumber: "AN-2026-0106",
    studentId: "std-10",
    branchId: "branch-vja",
    batchId: "batch-4",
    forMonth: 11,
    forYear: 2026,
    amountPaid: 1600,
    paymentDate: "2026-11-07",
    paymentMode: "upi",
    transactionRef: "UPI-4314459812",
    collectedBy: "Guru Smt. Radhika",
  },
  {
    id: "fee-7",
    receiptNumber: "AN-2026-0107",
    studentId: "std-13",
    branchId: "branch-vja",
    batchId: "batch-3",
    forMonth: 11,
    forYear: 2026,
    amountPaid: 2200,
    paymentDate: "2026-11-07",
    paymentMode: "upi",
    transactionRef: "UPI-4315582319",
    collectedBy: "Guru Smt. Radhika",
  },
  {
    id: "fee-8",
    receiptNumber: "AN-2026-0108",
    studentId: "std-14",
    branchId: "branch-vja",
    batchId: "batch-1",
    forMonth: 11,
    forYear: 2026,
    amountPaid: 1500,
    paymentDate: "2026-11-08",
    paymentMode: "cash",
    collectedBy: "Guru Smt. Radhika",
    notes: "Cash receipt issued at studio counter",
  },
];

export const initialMonthlyChartData: MonthlyChartData[] = [
  { month: "June", shortMonth: "Jun", year: 2026, collected: 21500, target: 24000, studentCount: 13 },
  { month: "July", shortMonth: "Jul", year: 2026, collected: 23800, target: 25000, studentCount: 14 },
  { month: "August", shortMonth: "Aug", year: 2026, collected: 24200, target: 26000, studentCount: 14 },
  { month: "September", shortMonth: "Sep", year: 2026, collected: 25900, target: 27000, studentCount: 15 },
  { month: "October", shortMonth: "Oct", year: 2026, collected: 26500, target: 28000, studentCount: 15 },
  { month: "November", shortMonth: "Nov", year: 2026, collected: 22800, target: 28000, studentCount: 16 },
];

export const getInitialAttendance = (): AttendanceRecord[] => {
  const today = new Date().toISOString().split("T")[0];
  return [
    { id: "att-1", studentId: "std-1", batchId: "batch-3", branchId: "branch-vja", date: today, status: "present" },
    { id: "att-2", studentId: "std-2", batchId: "batch-2", branchId: "branch-vja", date: today, status: "present" },
    { id: "att-3", studentId: "std-3", batchId: "batch-1", branchId: "branch-vja", date: today, status: "present" },
    { id: "att-4", studentId: "std-4", batchId: "batch-1", branchId: "branch-vja", date: today, status: "late" },
    { id: "att-5", studentId: "std-5", batchId: "batch-2", branchId: "branch-vja", date: today, status: "present" },
    { id: "att-6", studentId: "std-6", batchId: "batch-3", branchId: "branch-vja", date: today, status: "present" },
    { id: "att-7", studentId: "std-7", batchId: "batch-4", branchId: "branch-vja", date: today, status: "absent" },
    { id: "att-8", studentId: "std-8", batchId: "batch-1", branchId: "branch-vja", date: today, status: "present" },
    { id: "att-9", studentId: "std-9", batchId: "batch-2", branchId: "branch-vja", date: today, status: "present" },
    { id: "att-10", studentId: "std-10", batchId: "batch-4", branchId: "branch-vja", date: today, status: "present" },
    { id: "att-11", studentId: "std-11", batchId: "batch-1", branchId: "branch-vja", date: today, status: "absent" },
    { id: "att-12", studentId: "std-12", batchId: "batch-2", branchId: "branch-vja", date: today, status: "present" },
    { id: "att-13", studentId: "std-13", batchId: "batch-3", branchId: "branch-vja", date: today, status: "present" },
    { id: "att-14", studentId: "std-14", batchId: "batch-1", branchId: "branch-vja", date: today, status: "present" },
    { id: "att-15", studentId: "std-15", batchId: "batch-4", branchId: "branch-vja", date: today, status: "present" },
  ];
};

export const defaultUser: UserProfile = {
  id: "usr-admin-1",
  name: "Guru Smt. Radhika",
  email: "radhika@abhinayanartan.com",
  role: "super_admin",
  phone: "+91 93981 18249",
  branchId: "branch-vja",
};

// Storage keys
const STORAGE_KEY_STUDENTS = "an_academy_students_v2";
const STORAGE_KEY_BATCHES = "an_academy_batches_v2";
const STORAGE_KEY_FEES = "an_academy_fees_v2";
const STORAGE_KEY_ATTENDANCE = "an_academy_attendance_v2";
const STORAGE_KEY_BRANCHES = "an_academy_branches_v2";
const STORAGE_KEY_USER = "an_academy_user_v2";

export class AcademyDataStore {
  static isClient(): boolean {
    return typeof window !== "undefined";
  }

  static getBranches(): Branch[] {
    if (!this.isClient()) return initialBranches;
    const raw = localStorage.getItem(STORAGE_KEY_BRANCHES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_BRANCHES, JSON.stringify(initialBranches));
      return initialBranches;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return initialBranches;
    }
  }

  static getBatches(): Batch[] {
    if (!this.isClient()) return initialBatches;
    const raw = localStorage.getItem(STORAGE_KEY_BATCHES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_BATCHES, JSON.stringify(initialBatches));
      return initialBatches;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return initialBatches;
    }
  }

  static saveBatches(batches: Batch[]) {
    if (this.isClient()) {
      localStorage.setItem(STORAGE_KEY_BATCHES, JSON.stringify(batches));
    }
  }

  static getStudents(): Student[] {
    if (!this.isClient()) return initialStudents;
    const raw = localStorage.getItem(STORAGE_KEY_STUDENTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(initialStudents));
      return initialStudents;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return initialStudents;
    }
  }

  static saveStudents(students: Student[]) {
    if (this.isClient()) {
      localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(students));
    }
  }

  static getFeePayments(): FeePayment[] {
    if (!this.isClient()) return initialFeePayments;
    const raw = localStorage.getItem(STORAGE_KEY_FEES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_FEES, JSON.stringify(initialFeePayments));
      return initialFeePayments;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return initialFeePayments;
    }
  }

  static saveFeePayments(payments: FeePayment[]) {
    if (this.isClient()) {
      localStorage.setItem(STORAGE_KEY_FEES, JSON.stringify(payments));
    }
  }

  static getAttendance(): AttendanceRecord[] {
    if (!this.isClient()) return getInitialAttendance();
    const raw = localStorage.getItem(STORAGE_KEY_ATTENDANCE);
    if (!raw) {
      const init = getInitialAttendance();
      localStorage.setItem(STORAGE_KEY_ATTENDANCE, JSON.stringify(init));
      return init;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return getInitialAttendance();
    }
  }

  static saveAttendance(records: AttendanceRecord[]) {
    if (this.isClient()) {
      localStorage.setItem(STORAGE_KEY_ATTENDANCE, JSON.stringify(records));
    }
  }

  static getUser(): UserProfile {
    if (!this.isClient()) return defaultUser;
    const raw = localStorage.getItem(STORAGE_KEY_USER);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(defaultUser));
      return defaultUser;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return defaultUser;
    }
  }

  static saveUser(user: UserProfile) {
    if (this.isClient()) {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    }
  }

  static resetToDemoData() {
    if (!this.isClient()) return;
    localStorage.setItem(STORAGE_KEY_BRANCHES, JSON.stringify(initialBranches));
    localStorage.setItem(STORAGE_KEY_BATCHES, JSON.stringify(initialBatches));
    localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(initialStudents));
    localStorage.setItem(STORAGE_KEY_FEES, JSON.stringify(initialFeePayments));
    localStorage.setItem(STORAGE_KEY_ATTENDANCE, JSON.stringify(getInitialAttendance()));
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(defaultUser));
  }
}
