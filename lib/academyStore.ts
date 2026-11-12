import {
  Branch,
  Batch,
  Student,
  AttendanceRecord,
  FeePayment,
  UserProfile,
  DanceClass,
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
    id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    name: "Vijayawada Main Studio",
    code: "VJA-01",
    city: "Vijayawada",
    address: "Bunder Road, Vijayawada, Andhra Pradesh",
    phone: "+91 93981 18249",
    isActive: true,
  },
];

export const initialBatches: Batch[] = [
  {
    id: "c1111111-1111-1111-1111-111111111111",
    branchId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    name: "Junior Balagopala (Beginners)",
    level: "Beginner",
    scheduleDays: ["Mon", "Wed", "Fri"],
    startTime: "05:00 PM",
    endTime: "06:30 PM",
    teacherName: "G RESHMA",
    teacherId: "usr-admin-reshma-001",
    maxCapacity: 20,
    monthlyFee: 1500,
    isActive: true,
    status: "active",
  },
  {
    id: "c2222222-2222-2222-2222-222222222222",
    branchId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    name: "Abhinaya & Natya Masters",
    level: "Intermediate",
    scheduleDays: ["Mon", "Wed", "Fri"],
    startTime: "06:30 PM",
    endTime: "08:00 PM",
    teacherName: "G RESHMA",
    teacherId: "usr-admin-reshma-001",
    maxCapacity: 18,
    monthlyFee: 1800,
    isActive: true,
    status: "active",
  },
  {
    id: "c3333333-3333-3333-3333-333333333333",
    branchId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    name: "Tarangam Brass Plate Intensive",
    level: "Advanced",
    scheduleDays: ["Sun"],
    startTime: "09:00 AM",
    endTime: "12:00 PM",
    teacherName: "G RESHMA",
    teacherId: "usr-admin-reshma-001",
    maxCapacity: 15,
    monthlyFee: 2200,
    isActive: true,
    status: "active",
  },
  {
    id: "c4444444-4444-4444-4444-444444444444",
    branchId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    name: "Weekend Senior Repertoire",
    level: "Advanced",
    scheduleDays: ["Sun"],
    startTime: "06:00 PM",
    endTime: "08:00 PM",
    teacherName: "G RESHMA",
    teacherId: "usr-admin-reshma-001",
    maxCapacity: 16,
    monthlyFee: 1600,
    isActive: true,
    status: "active",
  },
];

export const initialStudents: Student[] = [
  {
    id: "std-1",
    admissionNumber: "AN-2024-001",
    branchId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    batchId: "c3333333-3333-3333-3333-333333333333",
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
    branchId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    batchId: "c2222222-2222-2222-2222-222222222222",
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
    branchId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    batchId: "c1111111-1111-1111-1111-111111111111",
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
    branchId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    batchId: "c1111111-1111-1111-1111-111111111111",
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
    branchId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    batchId: "c2222222-2222-2222-2222-222222222222",
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
    branchId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    batchId: "c3333333-3333-3333-3333-333333333333",
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
    branchId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    batchId: "c4444444-4444-4444-4444-444444444444",
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
    branchId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    batchId: "c1111111-1111-1111-1111-111111111111",
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
    branchId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    batchId: "c2222222-2222-2222-2222-222222222222",
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
    branchId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    batchId: "c4444444-4444-4444-4444-444444444444",
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
    branchId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    batchId: "c1111111-1111-1111-1111-111111111111",
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
    branchId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    batchId: "c2222222-2222-2222-2222-222222222222",
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
    branchId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    batchId: "c3333333-3333-3333-3333-333333333333",
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
    branchId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    batchId: "c1111111-1111-1111-1111-111111111111",
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
    branchId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    batchId: "c4444444-4444-4444-4444-444444444444",
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
    branchId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    batchId: "c2222222-2222-2222-2222-222222222222",
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
    branchId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    batchId: "c3333333-3333-3333-3333-333333333333",
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
    branchId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    batchId: "c2222222-2222-2222-2222-222222222222",
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
    branchId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    batchId: "c1111111-1111-1111-1111-111111111111",
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
    branchId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    batchId: "c3333333-3333-3333-3333-333333333333",
    forMonth: 11,
    forYear: 2026,
    amountPaid: 2200,
    paymentDate: "2026-11-05",
    paymentMode: "bank_transfer",
    transactionRef: "NEFT-SBI99812",
    collectedBy: "G RESHMA",
  },
  {
    id: "fee-5",
    receiptNumber: "AN-2026-0105",
    studentId: "std-8",
    branchId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    batchId: "c1111111-1111-1111-1111-111111111111",
    forMonth: 11,
    forYear: 2026,
    amountPaid: 1500,
    paymentDate: "2026-11-06",
    paymentMode: "upi",
    transactionRef: "UPI-4312389101",
    collectedBy: "G RESHMA",
  },
  {
    id: "fee-6",
    receiptNumber: "AN-2026-0106",
    studentId: "std-10",
    branchId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    batchId: "c4444444-4444-4444-4444-444444444444",
    forMonth: 11,
    forYear: 2026,
    amountPaid: 1600,
    paymentDate: "2026-11-07",
    paymentMode: "upi",
    transactionRef: "UPI-4314459812",
    collectedBy: "G RESHMA",
  },
  {
    id: "fee-7",
    receiptNumber: "AN-2026-0107",
    studentId: "std-13",
    branchId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    batchId: "c3333333-3333-3333-3333-333333333333",
    forMonth: 11,
    forYear: 2026,
    amountPaid: 2200,
    paymentDate: "2026-11-07",
    paymentMode: "upi",
    transactionRef: "UPI-4315582319",
    collectedBy: "G RESHMA",
  },
  {
    id: "fee-8",
    receiptNumber: "AN-2026-0108",
    studentId: "std-14",
    branchId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    batchId: "c1111111-1111-1111-1111-111111111111",
    forMonth: 11,
    forYear: 2026,
    amountPaid: 1500,
    paymentDate: "2026-11-08",
    paymentMode: "cash",
    collectedBy: "G RESHMA",
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
    { id: "att-1", studentId: "std-1", batchId: "c3333333-3333-3333-3333-333333333333", branchId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11", date: today, status: "present" },
    { id: "att-2", studentId: "std-2", batchId: "c2222222-2222-2222-2222-222222222222", branchId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11", date: today, status: "present" },
    { id: "att-3", studentId: "std-3", batchId: "c1111111-1111-1111-1111-111111111111", branchId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11", date: today, status: "present" },
    { id: "att-4", studentId: "std-4", batchId: "c1111111-1111-1111-1111-111111111111", branchId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11", date: today, status: "late" },
    { id: "att-5", studentId: "std-5", batchId: "c2222222-2222-2222-2222-222222222222", branchId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11", date: today, status: "present" },
    { id: "att-6", studentId: "std-6", batchId: "c3333333-3333-3333-3333-333333333333", branchId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11", date: today, status: "present" },
    { id: "att-7", studentId: "std-7", batchId: "c4444444-4444-4444-4444-444444444444", branchId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11", date: today, status: "absent" },
    { id: "att-8", studentId: "std-8", batchId: "c1111111-1111-1111-1111-111111111111", branchId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11", date: today, status: "present" },
    { id: "att-9", studentId: "std-9", batchId: "c2222222-2222-2222-2222-222222222222", branchId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11", date: today, status: "present" },
    { id: "att-10", studentId: "std-10", batchId: "c4444444-4444-4444-4444-444444444444", branchId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11", date: today, status: "present" },
    { id: "att-11", studentId: "std-11", batchId: "c1111111-1111-1111-1111-111111111111", branchId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11", date: today, status: "absent" },
    { id: "att-12", studentId: "std-12", batchId: "c2222222-2222-2222-2222-222222222222", branchId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11", date: today, status: "present" },
    { id: "att-13", studentId: "std-13", batchId: "c3333333-3333-3333-3333-333333333333", branchId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11", date: today, status: "present" },
    { id: "att-14", studentId: "std-14", batchId: "c1111111-1111-1111-1111-111111111111", branchId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11", date: today, status: "present" },
    { id: "att-15", studentId: "std-15", batchId: "c4444444-4444-4444-4444-444444444444", branchId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11", date: today, status: "present" },
  ];
};

export const defaultUser: UserProfile = {
  id: "usr-admin-reshma-001",
  name: "G RESHMA",
  email: "reshmagujjala249@gmail.com",
  role: "super_admin",
  phone: "+91 93981 18249",
  branchId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
};

export const initialClasses: DanceClass[] = [
  {
    id: "cls-1",
    className: "Adavus Revision & Footwork",
    branchId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    branchName: "Vijayawada Main Studio",
    batchId: "c1111111-1111-1111-1111-111111111111",
    batchName: "Junior Balagopala (Beginners)",
    teacherId: "usr-admin-reshma-001",
    teacherName: "G RESHMA",
    classDate: new Date().toISOString().split("T")[0],
    startTime: "05:00 PM",
    endTime: "06:30 PM",
    status: "scheduled",
    notes: "Basic footwork Adavus revision and Hastas alignment",
  },
  {
    id: "cls-2",
    className: "Abhinaya & Expression Practice",
    branchId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    branchName: "Vijayawada Main Studio",
    batchId: "c2222222-2222-2222-2222-222222222222",
    batchName: "Abhinaya & Natya Masters",
    teacherId: "usr-admin-reshma-001",
    teacherName: "G RESHMA",
    classDate: new Date().toISOString().split("T")[0],
    startTime: "06:30 PM",
    endTime: "08:00 PM",
    status: "scheduled",
    notes: "Navarasa facial expressions and Krishna Sabdam",
  },
];

// Storage keys
const STORAGE_KEY_STUDENTS = "an_academy_students_v2";
const STORAGE_KEY_BATCHES = "an_academy_batches_v2";
const STORAGE_KEY_FEES = "an_academy_fees_v2";
const STORAGE_KEY_ATTENDANCE = "an_academy_attendance_v2";
const STORAGE_KEY_BRANCHES = "an_academy_branches_v2";
const STORAGE_KEY_CLASSES = "an_academy_classes_v2";
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
      const branches = JSON.parse(raw) as Branch[];
      const migrated = branches
        .filter((branch) => branch.name !== "Guntur Satellite Center")
        .map((b) => (b.id === "branch-vja" ? { ...b, id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11" } : b));
      if (JSON.stringify(migrated) !== raw) {
        localStorage.setItem(STORAGE_KEY_BRANCHES, JSON.stringify(migrated));
      }
      return migrated.length > 0 ? migrated : initialBranches;
    } catch {
      return initialBranches;
    }
  }

  static saveBranches(branches: Branch[]) {
    if (this.isClient()) {
      localStorage.setItem(STORAGE_KEY_BRANCHES, JSON.stringify(branches));
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
      const batches = JSON.parse(raw) as Batch[];
      const migrated = batches.map((b) => {
        let branchId = b.branchId;
        if (branchId === "branch-vja") branchId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
        let id = b.id;
        if (id === "batch-1") id = "c1111111-1111-1111-1111-111111111111";
        else if (id === "batch-2") id = "c2222222-2222-2222-2222-222222222222";
        else if (id === "batch-3") id = "c3333333-3333-3333-3333-333333333333";
        else if (id === "batch-4") id = "c4444444-4444-4444-4444-444444444444";
        return { ...b, id, branchId };
      });
      return migrated.length > 0 ? migrated : initialBatches;
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
      const students = JSON.parse(raw) as Student[];
      const migrated = students.map((s) => {
        let branchId = s.branchId;
        if (branchId === "branch-vja") branchId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
        let batchId = s.batchId;
        if (batchId === "batch-1") batchId = "c1111111-1111-1111-1111-111111111111";
        else if (batchId === "batch-2") batchId = "c2222222-2222-2222-2222-222222222222";
        else if (batchId === "batch-3") batchId = "c3333333-3333-3333-3333-333333333333";
        else if (batchId === "batch-4") batchId = "c4444444-4444-4444-4444-444444444444";
        return { ...s, branchId, batchId };
      });
      return migrated.length > 0 ? migrated : initialStudents;
    } catch {
      return initialStudents;
    }
  }

  static saveStudents(students: Student[]) {
    if (this.isClient()) {
      localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(students));
    }
  }

  static getClasses(): DanceClass[] {
    if (!this.isClient()) return initialClasses;
    const raw = localStorage.getItem(STORAGE_KEY_CLASSES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_CLASSES, JSON.stringify(initialClasses));
      return initialClasses;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return initialClasses;
    }
  }

  static saveClasses(classes: DanceClass[]) {
    if (this.isClient()) {
      localStorage.setItem(STORAGE_KEY_CLASSES, JSON.stringify(classes));
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
