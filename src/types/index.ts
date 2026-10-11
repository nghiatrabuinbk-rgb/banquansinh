export type Role = 'admin' | 'principal' | 'head_master' | 'supervisor' | 'teacher';

export interface User {
  id: string;
  gmail: string;
  name: string;
  role: Role;
  assignedRoomId?: string; // For teachers: only assigned to this room
  status: 'active' | 'locked';
  avatar?: string;
  createdAt: string;
}

export interface Room {
  id: string;
  roomNumber: string; // e.g. "P.101"
  name: string; // e.g. "Phòng Nam Khối 6-7"
  buildingZone: 'Khu A (Nam)' | 'Khu B (Nữ)' | 'Khu C (Mới)';
  capacity: number; // Max students
  currentOccupancy: number;
  assignedTeacherId?: string;
  assignedTeacherName?: string;
  maleCount: number;
  femaleCount: number;
  status: 'active' | 'locked' | 'maintenance';
  currentScore?: number; // Latest weekly inspection score
  morningAttendanceDone?: boolean;
  eveningAttendanceDone?: boolean;
  weekendDone?: boolean;
  lastSubmitTime?: string;
  createdByType?: 'admin' | 'batch' | 'preset' | 'system';
  createdByUserName?: string;
  createdByRole?: string;
  createdAt?: string;
  roomNotes?: string;
  equipment?: string[];
}

export interface Student {
  id: string;
  fullName: string;
  dateOfBirth: string;
  gender: 'Nam' | 'Nữ';
  gradeClass: string; // e.g. "6/1", "6/2", "7/1", "8/1", "9/1"
  village: string; // Thôn (Thôn 1, Thôn 2, Thôn 3, Thôn 4, Làng Sen, etc.)
  hamletLeader: string; // Nóc ông/bà (e.g. "Nóc Ông Tuân", "Nóc Ông Reo")
  parentName: string; // Con ông/bà
  parentPhone: string;
  roomId: string;
  roomNumber: string;
  teacherName?: string;
  boardingStatus: 'Đang ở nội trú' | 'Nghỉ nội trú' | 'Tạm vắng';
  note?: string;
  entrySource?: 'teacher' | 'admin' | 'excel';
}

export type AttendanceStatus = 'present' | 'absent_excused' | 'absent_unexcused' | 'home' | 'boarding_leave' | 'other';

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  roomId: string;
  roomNumber: string;
  date: string; // YYYY-MM-DD
  session: 'morning' | 'evening'; // Sáng / Tối
  status: AttendanceStatus;
  note?: string;
  submittedBy: string; // Teacher name / admin
  submittedAt: string; // ISO or formatted
  isLateSubmit?: boolean;
}

export type WeekendStatus = 'stay' | 'home' | 'pending';

export interface WeekendRecord {
  id: string;
  studentId: string;
  studentName: string;
  gradeClass: string;
  roomId: string;
  roomNumber: string;
  village: string;
  hamletLeader: string;
  parentName: string;
  parentPhone: string;
  date: string; // Target weekend date
  status: WeekendStatus;
  reason?: string;
  note?: string;
  submittedBy: string;
  submittedAt: string;
}

export interface InspectionScore {
  id: string;
  roomId: string;
  roomNumber: string;
  weekNumber: number; // 1 to 35
  month: number;
  schoolYear: string; // e.g. "2026-2027"
  rulesScore: number; // Max 20
  roomHygieneScore: number; // Max 20
  disciplineScore: number; // Max 15
  areaHygieneScore: number; // Max 15
  dutyScore: number; // Max 10 (Restroom & Kitchen/Dining)
  culturalScore: number; // Max 10
  sportsScore: number; // Max 10
  totalScore: number; // Max 100
  inspectorName: string;
  inspectionDate: string;
  notes?: string;
  evidenceImages: string[]; // URLs or base64
}

export interface EvidenceItem {
  id: string;
  roomId: string;
  roomNumber: string;
  category: 'Nội quy' | 'Vệ sinh phòng ở' | 'Nề nếp' | 'Vệ sinh khu vực' | 'Phòng trực tuần' | 'Văn nghệ' | 'Thể dục thể thao';
  date: string;
  time: string;
  inspectorName: string;
  score: number;
  maxScore: number;
  notes: string;
  imageUrl: string;
}

export interface MovementActivity {
  id: string;
  name: string; // e.g. "Hội thi Tiếng hát Nội trú Chào mừng 20/11", "Giải bóng đá mini Nam"
  type: 'cultural' | 'sports';
  date: string;
  description: string;
  juryName: string;
  results: {
    roomId: string;
    roomNumber: string;
    rank: '🥇 Nhất' | '🥈 Nhì' | '🥉 Ba' | '🏅 Khuyến khích' | 'Tham gia';
    pointsAwarded: number;
    comment?: string;
  }[];
  images?: string[];
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  module: string;
  details: string;
  timestamp: string;
  ip?: string;
}

export interface AppSettings {
  schoolName: string;
  subTitle: string;
  location: string;
  headMasterName: string;
  headMasterTitle: string;
  schoolYear: string;
  currentWeek: number;
  morningTimeWindow: {
    start: string; // "05:30"
    end: string;   // "07:30"
  };
  eveningTimeWindow: {
    start: string; // "19:00"
    end: string;   // "21:30"
  };
  scoreWeights: {
    rules: number;       // default 20
    roomHygiene: number; // default 20
    discipline: number;  // default 15
    areaHygiene: number; // default 15
    duty: number;        // default 10
    cultural: number;    // default 10
    sports: number;      // default 10
  };
  firebaseConfig?: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
  };
}
