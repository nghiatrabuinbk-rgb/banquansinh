import {
  User,
  Room,
  Student,
  AttendanceRecord,
  WeekendRecord,
  InspectionScore,
  EvidenceItem,
  MovementActivity,
  AuditLog,
  AppSettings
} from '../types';

export const DEFAULT_SETTINGS: AppSettings = {
  schoolName: 'TRƯỜNG PTDTBT THCS XÃ TRÀ ĐỐC',
  subTitle: 'HỆ THỐNG QUẢN LÝ HỌC SINH NỘI TRÚ',
  location: 'XÃ TRÀ ĐỐC - TP. ĐÀ NẴNG',
  headMasterName: 'Nguyễn Trọng Nghĩa',
  headMasterTitle: 'Trưởng ban Quản lý Nội trú học sinh',
  schoolYear: '2026 - 2027',
  currentWeek: 6,
  morningTimeWindow: {
    start: '05:30',
    end: '07:30',
  },
  eveningTimeWindow: {
    start: '19:00',
    end: '21:30',
  },
  scoreWeights: {
    rules: 20,
    roomHygiene: 20,
    discipline: 15,
    areaHygiene: 15,
    duty: 10,
    cultural: 10,
    sports: 10,
  }
};

export const INITIAL_USERS: User[] = [
  {
    id: 'u-admin-1',
    gmail: 'nghiatrabui.nbk@gmail.com',
    name: 'Nguyễn Trọng Nghĩa',
    role: 'head_master',
    status: 'active',
    createdAt: '2026-08-15',
  },
  {
    id: 'u-admin-2',
    gmail: 'admin.bgh@tradoc.edu.vn',
    name: 'Thầy Lê Hoàng Long (Hiệu Trưởng)',
    role: 'principal',
    status: 'active',
    createdAt: '2026-08-15',
  },
  {
    id: 'u-super-1',
    gmail: 'quan-tri-vien@tradoc.edu.vn',
    name: 'Quản Trị Viên Hệ Thống',
    role: 'admin',
    status: 'active',
    createdAt: '2026-08-15',
  },
  {
    id: 'u-super-2',
    gmail: 'quansinh.nam@tradoc.edu.vn',
    name: 'Thầy Đinh Văn Nam (Ban Quản Sinh)',
    role: 'supervisor',
    status: 'active',
    createdAt: '2026-08-20',
  },
  {
    id: 'u-gv-1',
    gmail: 'mai.ho@tradoc.edu.vn',
    name: 'Cô Hồ Thị Mai',
    role: 'teacher',
    assignedRoomId: 'r-101',
    status: 'active',
    createdAt: '2026-08-20',
  },
  {
    id: 'u-gv-2',
    gmail: 'binh.tran@tradoc.edu.vn',
    name: 'Thầy Trần Văn Bình',
    role: 'teacher',
    assignedRoomId: 'r-102',
    status: 'active',
    createdAt: '2026-08-20',
  },
  {
    id: 'u-gv-3',
    gmail: 'hoa.le@tradoc.edu.vn',
    name: 'Cô Lê Thị Hoa',
    role: 'teacher',
    assignedRoomId: 'r-103',
    status: 'active',
    createdAt: '2026-08-20',
  },
  {
    id: 'u-gv-4',
    gmail: 'son.pham@tradoc.edu.vn',
    name: 'Thầy Phạm Văn Sơn',
    role: 'teacher',
    assignedRoomId: 'r-104',
    status: 'active',
    createdAt: '2026-08-20',
  },
  {
    id: 'u-gv-5',
    gmail: 'lan.nguyen@tradoc.edu.vn',
    name: 'Cô Nguyễn Thị Lan',
    role: 'teacher',
    assignedRoomId: 'r-201',
    status: 'active',
    createdAt: '2026-08-20',
  },
  {
    id: 'u-gv-6',
    gmail: 'tung.vo@tradoc.edu.vn',
    name: 'Thầy Võ Thanh Tùng',
    role: 'teacher',
    assignedRoomId: 'r-202',
    status: 'active',
    createdAt: '2026-08-20',
  }
];

export const INITIAL_ROOMS: Room[] = [
  {
    id: 'r-101',
    roomNumber: 'P.101',
    name: 'Phòng Nam Khối 6A',
    buildingZone: 'Khu A (Nam)',
    capacity: 20,
    currentOccupancy: 18,
    assignedTeacherId: 'u-gv-1',
    assignedTeacherName: 'Cô Hồ Thị Mai',
    maleCount: 18,
    femaleCount: 0,
    status: 'active',
    currentScore: 98,
    morningAttendanceDone: true,
    eveningAttendanceDone: true,
    weekendDone: true,
    lastSubmitTime: '20:15',
  },
  {
    id: 'r-102',
    roomNumber: 'P.102',
    name: 'Phòng Nam Khối 7A',
    buildingZone: 'Khu A (Nam)',
    capacity: 20,
    currentOccupancy: 19,
    assignedTeacherId: 'u-gv-2',
    assignedTeacherName: 'Thầy Trần Văn Bình',
    maleCount: 19,
    femaleCount: 0,
    status: 'active',
    currentScore: 95,
    morningAttendanceDone: true,
    eveningAttendanceDone: true,
    weekendDone: true,
    lastSubmitTime: '20:45',
  },
  {
    id: 'r-103',
    roomNumber: 'P.103',
    name: 'Phòng Nam Khối 8A',
    buildingZone: 'Khu A (Nam)',
    capacity: 20,
    currentOccupancy: 17,
    assignedTeacherId: 'u-gv-3',
    assignedTeacherName: 'Cô Lê Thị Hoa',
    maleCount: 17,
    femaleCount: 0,
    status: 'active',
    currentScore: 92,
    morningAttendanceDone: true,
    eveningAttendanceDone: false,
    weekendDone: true,
    lastSubmitTime: '06:40',
  },
  {
    id: 'r-104',
    roomNumber: 'P.104',
    name: 'Phòng Nam Khối 9A',
    buildingZone: 'Khu A (Nam)',
    capacity: 20,
    currentOccupancy: 18,
    assignedTeacherId: 'u-gv-4',
    assignedTeacherName: 'Thầy Phạm Văn Sơn',
    maleCount: 18,
    femaleCount: 0,
    status: 'active',
    currentScore: 89,
    morningAttendanceDone: true,
    eveningAttendanceDone: false,
    weekendDone: false,
    lastSubmitTime: '06:50',
  },
  {
    id: 'r-201',
    roomNumber: 'P.201',
    name: 'Phòng Nữ Khối 6B',
    buildingZone: 'Khu B (Nữ)',
    capacity: 20,
    currentOccupancy: 18,
    assignedTeacherId: 'u-gv-5',
    assignedTeacherName: 'Cô Nguyễn Thị Lan',
    maleCount: 0,
    femaleCount: 18,
    status: 'active',
    currentScore: 99,
    morningAttendanceDone: true,
    eveningAttendanceDone: true,
    weekendDone: true,
    lastSubmitTime: '20:05',
  },
  {
    id: 'r-202',
    roomNumber: 'P.202',
    name: 'Phòng Nữ Khối 7B',
    buildingZone: 'Khu B (Nữ)',
    capacity: 20,
    currentOccupancy: 19,
    assignedTeacherId: 'u-gv-6',
    assignedTeacherName: 'Thầy Võ Thanh Tùng',
    maleCount: 0,
    femaleCount: 19,
    status: 'active',
    currentScore: 96,
    morningAttendanceDone: true,
    eveningAttendanceDone: true,
    weekendDone: true,
    lastSubmitTime: '21:02',
  },
  {
    id: 'r-203',
    roomNumber: 'P.203',
    name: 'Phòng Nữ Khối 8B',
    buildingZone: 'Khu B (Nữ)',
    capacity: 20,
    currentOccupancy: 17,
    assignedTeacherId: 'u-gv-3',
    assignedTeacherName: 'Cô Lê Thị Hoa',
    maleCount: 0,
    femaleCount: 17,
    status: 'active',
    currentScore: 94,
    morningAttendanceDone: true,
    eveningAttendanceDone: false,
    weekendDone: false,
    lastSubmitTime: '06:25',
  },
  {
    id: 'r-204',
    roomNumber: 'P.204',
    name: 'Phòng Nữ Khối 9B',
    buildingZone: 'Khu B (Nữ)',
    capacity: 20,
    currentOccupancy: 18,
    assignedTeacherId: 'u-gv-1',
    assignedTeacherName: 'Cô Hồ Thị Mai',
    maleCount: 0,
    femaleCount: 18,
    status: 'active',
    currentScore: 97,
    morningAttendanceDone: true,
    eveningAttendanceDone: true,
    weekendDone: true,
    lastSubmitTime: '19:55',
  },
  {
    id: 'r-301',
    roomNumber: 'P.301',
    name: 'Phòng Nam Ghép 8-9',
    buildingZone: 'Khu C (Mới)',
    capacity: 20,
    currentOccupancy: 15,
    assignedTeacherId: 'u-gv-4',
    assignedTeacherName: 'Thầy Phạm Văn Sơn',
    maleCount: 15,
    femaleCount: 0,
    status: 'active',
    currentScore: 88,
    morningAttendanceDone: false,
    eveningAttendanceDone: false,
    weekendDone: false,
    lastSubmitTime: 'Chưa nhập',
  },
  {
    id: 'r-302',
    roomNumber: 'P.302',
    name: 'Phòng Nữ Ghép 8-9',
    buildingZone: 'Khu C (Mới)',
    capacity: 20,
    currentOccupancy: 16,
    assignedTeacherId: 'u-gv-5',
    assignedTeacherName: 'Cô Nguyễn Thị Lan',
    maleCount: 0,
    femaleCount: 16,
    status: 'active',
    currentScore: 93,
    morningAttendanceDone: true,
    eveningAttendanceDone: false,
    weekendDone: true,
    lastSubmitTime: '07:15',
  }
];

export const INITIAL_STUDENTS: Student[] = [
  // Room P.101 (Nam Khối 6A)
  {
    id: 's-101-1',
    fullName: 'Hồ Văn Nam',
    dateOfBirth: '2014-04-12',
    gender: 'Nam',
    gradeClass: '6/1',
    village: 'Thôn 1',
    hamletLeader: 'Nóc Ông Tuân',
    parentName: 'Hồ Văn Đạt',
    parentPhone: '0983112233',
    roomId: 'r-101',
    roomNumber: 'P.101',
    teacherName: 'Cô Hồ Thị Mai',
    boardingStatus: 'Đang ở nội trú',
    note: 'Cán sự phòng, ngoan ngoãn',
  },
  {
    id: 's-101-2',
    fullName: 'Đinh Văn Hải',
    dateOfBirth: '2014-07-25',
    gender: 'Nam',
    gradeClass: '6/1',
    village: 'Thôn 2',
    hamletLeader: 'Nóc Ông Reo',
    parentName: 'Đinh Văn Bảy',
    parentPhone: '0978223344',
    roomId: 'r-101',
    roomNumber: 'P.101',
    teacherName: 'Cô Hồ Thị Mai',
    boardingStatus: 'Đang ở nội trú',
  },
  {
    id: 's-101-3',
    fullName: 'Hồ Văn Dũng',
    dateOfBirth: '2014-11-03',
    gender: 'Nam',
    gradeClass: '6/1',
    village: 'Thôn 3',
    hamletLeader: 'Nóc Ông Dũng',
    parentName: 'Hồ Văn Thao',
    parentPhone: '0965334455',
    roomId: 'r-101',
    roomNumber: 'P.101',
    teacherName: 'Cô Hồ Thị Mai',
    boardingStatus: 'Đang ở nội trú',
  },
  {
    id: 's-101-4',
    fullName: 'Trần Văn Kiên',
    dateOfBirth: '2014-02-18',
    gender: 'Nam',
    gradeClass: '6/2',
    village: 'Làng Sen',
    hamletLeader: 'Nóc Bà Mơ',
    parentName: 'Trần Văn Quý',
    parentPhone: '0912445566',
    roomId: 'r-101',
    roomNumber: 'P.101',
    teacherName: 'Cô Hồ Thị Mai',
    boardingStatus: 'Đang ở nội trú',
  },
  {
    id: 's-101-5',
    fullName: 'Lê Văn Tý',
    dateOfBirth: '2014-09-09',
    gender: 'Nam',
    gradeClass: '6/2',
    village: 'Thôn 4',
    hamletLeader: 'Nóc Ông Mười',
    parentName: 'Lê Văn Long',
    parentPhone: '0905556677',
    roomId: 'r-101',
    roomNumber: 'P.101',
    teacherName: 'Cô Hồ Thị Mai',
    boardingStatus: 'Đang ở nội trú',
  },

  // Room P.102 (Nam Khối 7A)
  {
    id: 's-102-1',
    fullName: 'Hồ Văn Thắng',
    dateOfBirth: '2013-05-15',
    gender: 'Nam',
    gradeClass: '7/1',
    village: 'Thôn 1',
    hamletLeader: 'Nóc Ông Tuân',
    parentName: 'Hồ Văn Lộc',
    parentPhone: '0971123456',
    roomId: 'r-102',
    roomNumber: 'P.102',
    teacherName: 'Thầy Trần Văn Bình',
    boardingStatus: 'Đang ở nội trú',
  },
  {
    id: 's-102-2',
    fullName: 'Đinh Văn Hoàng',
    dateOfBirth: '2013-08-20',
    gender: 'Nam',
    gradeClass: '7/1',
    village: 'Thôn 2',
    hamletLeader: 'Nóc Ông Reo',
    parentName: 'Đinh Văn Minh',
    parentPhone: '0982234567',
    roomId: 'r-102',
    roomNumber: 'P.102',
    teacherName: 'Thầy Trần Văn Bình',
    boardingStatus: 'Đang ở nội trú',
  },
  {
    id: 's-102-3',
    fullName: 'Nguyễn Văn Phúc',
    dateOfBirth: '2013-12-10',
    gender: 'Nam',
    gradeClass: '7/2',
    village: 'Làng Mới',
    hamletLeader: 'Nóc Ông Dũng',
    parentName: 'Nguyễn Văn Đạt',
    parentPhone: '0913345678',
    roomId: 'r-102',
    roomNumber: 'P.102',
    teacherName: 'Thầy Trần Văn Bình',
    boardingStatus: 'Đang ở nội trú',
  },

  // Room P.201 (Nữ Khối 6B)
  {
    id: 's-201-1',
    fullName: 'Hồ Thị Xoan',
    dateOfBirth: '2014-03-08',
    gender: 'Nữ',
    gradeClass: '6/1',
    village: 'Thôn 1',
    hamletLeader: 'Nóc Ông Tuân',
    parentName: 'Hồ Văn Nhị',
    parentPhone: '0984567890',
    roomId: 'r-201',
    roomNumber: 'P.201',
    teacherName: 'Cô Nguyễn Thị Lan',
    boardingStatus: 'Đang ở nội trú',
    note: 'Lớp phó học tập',
  },
  {
    id: 's-201-2',
    fullName: 'Đinh Thị Mơ',
    dateOfBirth: '2014-06-19',
    gender: 'Nữ',
    gradeClass: '6/1',
    village: 'Thôn 3',
    hamletLeader: 'Nóc Bà Mơ',
    parentName: 'Đinh Văn Khương',
    parentPhone: '0975678901',
    roomId: 'r-201',
    roomNumber: 'P.201',
    teacherName: 'Cô Nguyễn Thị Lan',
    boardingStatus: 'Đang ở nội trú',
  },
  {
    id: 's-201-3',
    fullName: 'Hồ Thị Diệu',
    dateOfBirth: '2014-10-22',
    gender: 'Nữ',
    gradeClass: '6/2',
    village: 'Thôn 2',
    hamletLeader: 'Nóc Ông Reo',
    parentName: 'Hồ Văn Định',
    parentPhone: '0966789012',
    roomId: 'r-201',
    roomNumber: 'P.201',
    teacherName: 'Cô Nguyễn Thị Lan',
    boardingStatus: 'Đang ở nội trú',
  },
  {
    id: 's-201-4',
    fullName: 'Trần Thị Thu Thảo',
    dateOfBirth: '2014-01-14',
    gender: 'Nữ',
    gradeClass: '6/2',
    village: 'Làng Sen',
    hamletLeader: 'Nóc Ông Tuân',
    parentName: 'Trần Văn Hòa',
    parentPhone: '0907890123',
    roomId: 'r-201',
    roomNumber: 'P.201',
    teacherName: 'Cô Nguyễn Thị Lan',
    boardingStatus: 'Đang ở nội trú',
  },

  // Room P.202 (Nữ Khối 7B)
  {
    id: 's-202-1',
    fullName: 'Hồ Thị Thơm',
    dateOfBirth: '2013-04-05',
    gender: 'Nữ',
    gradeClass: '7/1',
    village: 'Thôn 4',
    hamletLeader: 'Nóc Ông Mười',
    parentName: 'Hồ Văn Tiến',
    parentPhone: '0988901234',
    roomId: 'r-202',
    roomNumber: 'P.202',
    teacherName: 'Thầy Võ Thanh Tùng',
    boardingStatus: 'Đang ở nội trú',
  },
  {
    id: 's-202-2',
    fullName: 'Đinh Thị Lụa',
    dateOfBirth: '2013-09-12',
    gender: 'Nữ',
    gradeClass: '7/2',
    village: 'Thôn 1',
    hamletLeader: 'Nóc Ông Tuân',
    parentName: 'Đinh Văn Khôi',
    parentPhone: '0979012345',
    roomId: 'r-202',
    roomNumber: 'P.202',
    teacherName: 'Thầy Võ Thanh Tùng',
    boardingStatus: 'Đang ở nội trú',
  },

  // Room P.103 (Nam Khối 8A)
  {
    id: 's-103-1',
    fullName: 'Hồ Văn Lượng',
    dateOfBirth: '2012-07-07',
    gender: 'Nam',
    gradeClass: '8/1',
    village: 'Thôn 2',
    hamletLeader: 'Nóc Ông Reo',
    parentName: 'Hồ Văn Sơn',
    parentPhone: '0919123456',
    roomId: 'r-103',
    roomNumber: 'P.103',
    teacherName: 'Cô Lê Thị Hoa',
    boardingStatus: 'Đang ở nội trú',
  },
  {
    id: 's-103-2',
    fullName: 'Lê Văn Cường',
    dateOfBirth: '2012-10-18',
    gender: 'Nam',
    gradeClass: '8/2',
    village: 'Thôn 3',
    hamletLeader: 'Nóc Ông Dũng',
    parentName: 'Lê Văn Tài',
    parentPhone: '0938234567',
    roomId: 'r-103',
    roomNumber: 'P.103',
    teacherName: 'Cô Lê Thị Hoa',
    boardingStatus: 'Đang ở nội trú',
  },

  // Room P.104 (Nam Khối 9A)
  {
    id: 's-104-1',
    fullName: 'Đinh Văn Trưởng',
    dateOfBirth: '2011-02-14',
    gender: 'Nam',
    gradeClass: '9/1',
    village: 'Thôn 1',
    hamletLeader: 'Nóc Ông Tuân',
    parentName: 'Đinh Văn Thân',
    parentPhone: '0947345678',
    roomId: 'r-104',
    roomNumber: 'P.104',
    teacherName: 'Thầy Phạm Văn Sơn',
    boardingStatus: 'Đang ở nội trú',
  },
  {
    id: 's-104-2',
    fullName: 'Hồ Văn Tân',
    dateOfBirth: '2011-11-20',
    gender: 'Nam',
    gradeClass: '9/2',
    village: 'Làng Sen',
    hamletLeader: 'Nóc Bà Mơ',
    parentName: 'Hồ Văn Chúc',
    parentPhone: '0926456789',
    roomId: 'r-104',
    roomNumber: 'P.104',
    teacherName: 'Thầy Phạm Văn Sơn',
    boardingStatus: 'Đang ở nội trú',
  }
];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  // Morning today
  {
    id: 'att-m-1',
    studentId: 's-101-1',
    studentName: 'Hồ Văn Nam',
    roomId: 'r-101',
    roomNumber: 'P.101',
    date: '2026-10-05',
    session: 'morning',
    status: 'present',
    submittedBy: 'Cô Hồ Thị Mai',
    submittedAt: '06:15 05/10/2026',
  },
  {
    id: 'att-m-2',
    studentId: 's-101-2',
    studentName: 'Đinh Văn Hải',
    roomId: 'r-101',
    roomNumber: 'P.101',
    date: '2026-10-05',
    session: 'morning',
    status: 'present',
    submittedBy: 'Cô Hồ Thị Mai',
    submittedAt: '06:15 05/10/2026',
  },
  {
    id: 'att-m-3',
    studentId: 's-101-3',
    studentName: 'Hồ Văn Dũng',
    roomId: 'r-101',
    roomNumber: 'P.101',
    date: '2026-10-05',
    session: 'morning',
    status: 'absent_excused',
    note: 'Nghỉ ốm nhẹ, đang ở phòng y tế',
    submittedBy: 'Cô Hồ Thị Mai',
    submittedAt: '06:15 05/10/2026',
  },
  {
    id: 'att-m-4',
    studentId: 's-101-4',
    studentName: 'Trần Văn Kiên',
    roomId: 'r-101',
    roomNumber: 'P.101',
    date: '2026-10-05',
    session: 'morning',
    status: 'present',
    submittedBy: 'Cô Hồ Thị Mai',
    submittedAt: '06:15 05/10/2026',
  },
  {
    id: 'att-m-5',
    studentId: 's-101-5',
    studentName: 'Lê Văn Tý',
    roomId: 'r-101',
    roomNumber: 'P.101',
    date: '2026-10-05',
    session: 'morning',
    status: 'present',
    submittedBy: 'Cô Hồ Thị Mai',
    submittedAt: '06:15 05/10/2026',
  },
  // Evening today for P.101
  {
    id: 'att-e-1',
    studentId: 's-101-1',
    studentName: 'Hồ Văn Nam',
    roomId: 'r-101',
    roomNumber: 'P.101',
    date: '2026-10-05',
    session: 'evening',
    status: 'present',
    submittedBy: 'Cô Hồ Thị Mai',
    submittedAt: '20:15 05/10/2026',
  },
  {
    id: 'att-e-2',
    studentId: 's-101-2',
    studentName: 'Đinh Văn Hải',
    roomId: 'r-101',
    roomNumber: 'P.101',
    date: '2026-10-05',
    session: 'evening',
    status: 'present',
    submittedBy: 'Cô Hồ Thị Mai',
    submittedAt: '20:15 05/10/2026',
  },
  {
    id: 'att-e-3',
    studentId: 's-101-3',
    studentName: 'Hồ Văn Dũng',
    roomId: 'r-101',
    roomNumber: 'P.101',
    date: '2026-10-05',
    session: 'evening',
    status: 'absent_excused',
    note: 'Đang theo dõi y tế',
    submittedBy: 'Cô Hồ Thị Mai',
    submittedAt: '20:15 05/10/2026',
  },
  {
    id: 'att-e-4',
    studentId: 's-101-4',
    studentName: 'Trần Văn Kiên',
    roomId: 'r-101',
    roomNumber: 'P.101',
    date: '2026-10-05',
    session: 'evening',
    status: 'present',
    submittedBy: 'Cô Hồ Thị Mai',
    submittedAt: '20:15 05/10/2026',
  },
  {
    id: 'att-e-5',
    studentId: 's-101-5',
    studentName: 'Lê Văn Tý',
    roomId: 'r-101',
    roomNumber: 'P.101',
    date: '2026-10-05',
    session: 'evening',
    status: 'present',
    submittedBy: 'Cô Hồ Thị Mai',
    submittedAt: '20:15 05/10/2026',
  },
  // P.201 morning & evening
  {
    id: 'att-m-201-1',
    studentId: 's-201-1',
    studentName: 'Hồ Thị Xoan',
    roomId: 'r-201',
    roomNumber: 'P.201',
    date: '2026-10-05',
    session: 'morning',
    status: 'present',
    submittedBy: 'Cô Nguyễn Thị Lan',
    submittedAt: '06:05 05/10/2026',
  },
  {
    id: 'att-m-201-2',
    studentId: 's-201-2',
    studentName: 'Đinh Thị Mơ',
    roomId: 'r-201',
    roomNumber: 'P.201',
    date: '2026-10-05',
    session: 'morning',
    status: 'present',
    submittedBy: 'Cô Nguyễn Thị Lan',
    submittedAt: '06:05 05/10/2026',
  },
  {
    id: 'att-m-201-3',
    studentId: 's-201-3',
    studentName: 'Hồ Thị Diệu',
    roomId: 'r-201',
    roomNumber: 'P.201',
    date: '2026-10-05',
    session: 'morning',
    status: 'present',
    submittedBy: 'Cô Nguyễn Thị Lan',
    submittedAt: '06:05 05/10/2026',
  },
  {
    id: 'att-m-201-4',
    studentId: 's-201-4',
    studentName: 'Trần Thị Thu Thảo',
    roomId: 'r-201',
    roomNumber: 'P.201',
    date: '2026-10-05',
    session: 'morning',
    status: 'home',
    note: 'Về nhà có phép chữa răng',
    submittedBy: 'Cô Nguyễn Thị Lan',
    submittedAt: '06:05 05/10/2026',
  }
];

export const INITIAL_WEEKEND: WeekendRecord[] = [
  {
    id: 'wk-1',
    studentId: 's-101-1',
    studentName: 'Hồ Văn Nam',
    gradeClass: '6/1',
    roomId: 'r-101',
    roomNumber: 'P.101',
    village: 'Thôn 1',
    hamletLeader: 'Nóc Ông Tuân',
    parentName: 'Hồ Văn Đạt',
    parentPhone: '0983112233',
    date: '2026-10-09',
    status: 'stay',
    reason: 'Ôn tập Đội tuyển Thể thao',
    submittedBy: 'Cô Hồ Thị Mai',
    submittedAt: '15:20 05/10/2026',
  },
  {
    id: 'wk-2',
    studentId: 's-101-2',
    studentName: 'Đinh Văn Hải',
    gradeClass: '6/1',
    roomId: 'r-101',
    roomNumber: 'P.101',
    village: 'Thôn 2',
    hamletLeader: 'Nóc Ông Reo',
    parentName: 'Đinh Văn Bảy',
    parentPhone: '0978223344',
    date: '2026-10-09',
    status: 'home',
    reason: 'Về thăm gia đình cuối tuần',
    submittedBy: 'Cô Hồ Thị Mai',
    submittedAt: '15:20 05/10/2026',
  },
  {
    id: 'wk-3',
    studentId: 's-101-3',
    studentName: 'Hồ Văn Dũng',
    gradeClass: '6/1',
    roomId: 'r-101',
    roomNumber: 'P.101',
    village: 'Thôn 3',
    hamletLeader: 'Nóc Ông Dũng',
    parentName: 'Hồ Văn Thao',
    parentPhone: '0965334455',
    date: '2026-10-09',
    status: 'stay',
    reason: 'Nhà xa, ở lại ôn thi môn Toán',
    submittedBy: 'Cô Hồ Thị Mai',
    submittedAt: '15:20 05/10/2026',
  },
  {
    id: 'wk-4',
    studentId: 's-201-1',
    studentName: 'Hồ Thị Xoan',
    gradeClass: '6/1',
    roomId: 'r-201',
    roomNumber: 'P.201',
    village: 'Thôn 1',
    hamletLeader: 'Nóc Ông Tuân',
    parentName: 'Hồ Văn Nhị',
    parentPhone: '0984567890',
    date: '2026-10-09',
    status: 'stay',
    reason: 'Tập văn nghệ đội múa',
    submittedBy: 'Cô Nguyễn Thị Lan',
    submittedAt: '16:00 05/10/2026',
  },
  {
    id: 'wk-5',
    studentId: 's-201-2',
    studentName: 'Đinh Thị Mơ',
    gradeClass: '6/1',
    roomId: 'r-201',
    roomNumber: 'P.201',
    village: 'Thôn 3',
    hamletLeader: 'Nóc Bà Mơ',
    parentName: 'Đinh Văn Khương',
    parentPhone: '0975678901',
    date: '2026-10-09',
    status: 'home',
    reason: 'Phụ giúp gia đình thu hoạch quế',
    submittedBy: 'Cô Nguyễn Thị Lan',
    submittedAt: '16:00 05/10/2026',
  },
  {
    id: 'wk-6',
    studentId: 's-201-4',
    studentName: 'Trần Thị Thu Thảo',
    gradeClass: '6/2',
    roomId: 'r-201',
    roomNumber: 'P.201',
    village: 'Làng Sen',
    hamletLeader: 'Nóc Ông Tuân',
    parentName: 'Trần Văn Hòa',
    parentPhone: '0907890123',
    date: '2026-10-09',
    status: 'home',
    reason: 'Khám chữa bệnh tại trạm y tế',
    submittedBy: 'Cô Nguyễn Thị Lan',
    submittedAt: '16:00 05/10/2026',
  },
  {
    id: 's-pending-1',
    studentId: 's-103-1',
    studentName: 'Hồ Văn Lượng',
    gradeClass: '8/1',
    roomId: 'r-103',
    roomNumber: 'P.103',
    village: 'Thôn 2',
    hamletLeader: 'Nóc Ông Reo',
    parentName: 'Hồ Văn Sơn',
    parentPhone: '0919123456',
    date: '2026-10-09',
    status: 'pending',
    submittedBy: 'Hệ thống',
    submittedAt: 'Chưa đăng ký',
  }
];

export const INITIAL_INSPECTIONS: InspectionScore[] = [
  {
    id: 'insp-201',
    roomId: 'r-201',
    roomNumber: 'P.201',
    weekNumber: 6,
    month: 10,
    schoolYear: '2026 - 2027',
    rulesScore: 20,
    roomHygieneScore: 20,
    disciplineScore: 15,
    areaHygieneScore: 15,
    dutyScore: 10,
    culturalScore: 9,
    sportsScore: 10,
    totalScore: 99,
    inspectorName: 'Thầy Đinh Văn Nam (Ban Quản sinh)',
    inspectionDate: '05/10/2026',
    notes: 'Phòng cực kỳ sạch sẽ, chăn màn gấp vuông góc, nề nếp gương mẫu.',
    evidenceImages: [
      'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1540518614846-7ede433c4550?auto=format&fit=crop&w=600&q=80'
    ]
  },
  {
    id: 'insp-101',
    roomId: 'r-101',
    roomNumber: 'P.101',
    weekNumber: 6,
    month: 10,
    schoolYear: '2026 - 2027',
    rulesScore: 20,
    roomHygieneScore: 19,
    disciplineScore: 15,
    areaHygieneScore: 15,
    dutyScore: 10,
    culturalScore: 9,
    sportsScore: 10,
    totalScore: 98,
    inspectorName: 'Nguyễn Trọng Nghĩa (Trưởng ban)',
    inspectionDate: '05/10/2026',
    notes: 'Vệ sinh phòng xuất sắc, hành lang sạch bóng.',
    evidenceImages: [
      'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=600&q=80'
    ]
  },
  {
    id: 'insp-204',
    roomId: 'r-204',
    roomNumber: 'P.204',
    weekNumber: 6,
    month: 10,
    schoolYear: '2026 - 2027',
    rulesScore: 20,
    roomHygieneScore: 19,
    disciplineScore: 15,
    areaHygieneScore: 14,
    dutyScore: 10,
    culturalScore: 10,
    sportsScore: 9,
    totalScore: 97,
    inspectorName: 'Ban Quản sinh',
    inspectionDate: '05/10/2026',
    notes: 'Nữ khối 9 nề nếp tốt, tích cực phong trào.',
    evidenceImages: []
  },
  {
    id: 'insp-202',
    roomId: 'r-202',
    roomNumber: 'P.202',
    weekNumber: 6,
    month: 10,
    schoolYear: '2026 - 2027',
    rulesScore: 19,
    roomHygieneScore: 19,
    disciplineScore: 15,
    areaHygieneScore: 14,
    dutyScore: 10,
    culturalScore: 9,
    sportsScore: 10,
    totalScore: 96,
    inspectorName: 'Ban Quản sinh',
    inspectionDate: '05/10/2026',
    notes: 'Trực nhật đúng lịch, gọn gàng.',
    evidenceImages: []
  },
  {
    id: 'insp-102',
    roomId: 'r-102',
    roomNumber: 'P.102',
    weekNumber: 6,
    month: 10,
    schoolYear: '2026 - 2027',
    rulesScore: 19,
    roomHygieneScore: 18,
    disciplineScore: 15,
    areaHygieneScore: 14,
    dutyScore: 10,
    culturalScore: 9,
    sportsScore: 10,
    totalScore: 95,
    inspectorName: 'Ban Quản sinh',
    inspectionDate: '05/10/2026',
    notes: 'Khối 7 nam đoàn kết, giờ tự học nghiêm túc.',
    evidenceImages: []
  },
  {
    id: 'insp-301',
    roomId: 'r-301',
    roomNumber: 'P.301',
    weekNumber: 6,
    month: 10,
    schoolYear: '2026 - 2027',
    rulesScore: 18,
    roomHygieneScore: 17,
    disciplineScore: 14,
    areaHygieneScore: 13,
    dutyScore: 9,
    culturalScore: 8,
    sportsScore: 9,
    totalScore: 88,
    inspectorName: 'Ban Quản sinh',
    inspectionDate: '05/10/2026',
    notes: 'Cần chú ý xếp giày dép ngay ngắn ở cửa ra vào.',
    evidenceImages: []
  }
];

export const INITIAL_EVIDENCES: EvidenceItem[] = [
  {
    id: 'ev-1',
    roomId: 'r-201',
    roomNumber: 'P.201',
    category: 'Vệ sinh phòng ở',
    date: '05/10/2026',
    time: '18:20',
    inspectorName: 'Ban quản sinh',
    score: 20,
    maxScore: 20,
    notes: 'Giường chiếu chăn màn gấp chuẩn quân đội, sàn nhà lau sạch bóng không hạt bụi.',
    imageUrl: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'ev-2',
    roomId: 'r-101',
    roomNumber: 'P.101',
    category: 'Vệ sinh khu vực',
    date: '05/10/2026',
    time: '17:15',
    inspectorName: 'Nguyễn Trọng Nghĩa (Trưởng ban)',
    score: 15,
    maxScore: 15,
    notes: 'Sân trước và bồn hoa được làm cỏ, tưới nước sạch sẽ, không có rác.',
    imageUrl: 'https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'ev-3',
    roomId: 'r-101',
    roomNumber: 'P.101',
    category: 'Phòng trực tuần',
    date: '05/10/2026',
    time: '12:30',
    inspectorName: 'Ban quản sinh',
    score: 10,
    maxScore: 10,
    notes: 'Khu vực bếp ăn tập thể được lau dọn khô ráo, bàn ghế xếp thẳng hàng ngay ngắn.',
    imageUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80',
  }
];

export const INITIAL_ACTIVITIES: MovementActivity[] = [
  {
    id: 'act-1',
    name: 'Hội thi Tiếng hát Nội trú Chào mừng 20/11',
    type: 'cultural',
    date: '2026-10-02',
    description: 'Hội thi văn nghệ biểu diễn các làn điệu dân ca vùng cao và ca khúc về thầy cô mái trường.',
    juryName: 'Ban Giám Khảo: Thầy Nghĩa, Cô Mai, Thầy Bình',
    results: [
      { roomId: 'r-201', roomNumber: 'P.201', rank: '🥇 Nhất', pointsAwarded: 10, comment: 'Tiết mục múa cồng chiêng xuất sắc' },
      { roomId: 'r-101', roomNumber: 'P.101', rank: '🥈 Nhì', pointsAwarded: 8, comment: 'Đơn ca giọng hát truyền cảm' },
      { roomId: 'r-204', roomNumber: 'P.204', rank: '🥉 Ba', pointsAwarded: 6, comment: 'Tốp ca đồng thanh biểu cảm tốt' },
      { roomId: 'r-102', roomNumber: 'P.102', rank: '🏅 Khuyến khích', pointsAwarded: 4, comment: 'Tiết mục múa sạp sôi nổi' },
    ],
    images: ['https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80']
  },
  {
    id: 'act-2',
    name: 'Giải Bóng đá Mini Nam Nội trú THCS Trà Đốc',
    type: 'sports',
    date: '2026-09-28',
    description: 'Giải đấu giao lưu thể thao tăng cường tình đoàn kết giữa các phòng nam khu nội trú.',
    juryName: 'Tổ Thể dục & Ban Quản sinh',
    results: [
      { roomId: 'r-101', roomNumber: 'P.101', rank: '🥇 Nhất', pointsAwarded: 10, comment: 'Vô địch kịch tính loạt luân lưu' },
      { roomId: 'r-102', roomNumber: 'P.102', rank: '🥈 Nhì', pointsAwarded: 8, comment: 'Á quân thi đấu kiên cường' },
      { roomId: 'r-103', roomNumber: 'P.103', rank: '🥉 Ba', pointsAwarded: 6, comment: 'Lối chơi đẹp mắt' },
    ],
    images: ['https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=600&q=80']
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    userId: 'u-admin-1',
    userName: 'Nguyễn Trọng Nghĩa (Trưởng ban)',
    action: 'Đăng nhập',
    module: 'Hệ thống',
    details: 'Đăng nhập thành công từ Google Account nghiatrabui.nbk@gmail.com',
    timestamp: '2026-10-05 06:00:12',
  },
  {
    id: 'log-2',
    userId: 'u-gv-1',
    userName: 'Cô Hồ Thị Mai',
    action: 'Nhập điểm danh',
    module: 'Điểm danh',
    details: 'Nhập điểm danh sáng cho phòng P.101 (18/18 học sinh, 1 phép)',
    timestamp: '2026-10-05 06:15:30',
  },
  {
    id: 'log-3',
    userId: 'u-super-2',
    userName: 'Thầy Đinh Văn Nam',
    action: 'Chấm thi đua',
    module: 'Thi đua',
    details: 'Chấm thi đua tuần 6 cho P.201 đạt 99/100 điểm kèm minh chứng ảnh',
    timestamp: '2026-10-05 18:22:45',
  },
  {
    id: 'log-4',
    userId: 'u-gv-1',
    userName: 'Cô Hồ Thị Mai',
    action: 'Nhập điểm danh',
    module: 'Điểm danh',
    details: 'Nhập điểm danh tối cho phòng P.101 (18/18 học sinh)',
    timestamp: '2026-10-05 20:15:10',
  }
];

// LocalStorage Keys
const KEYS = {
  SETTINGS: 'tra_doc_settings',
  USERS: 'tra_doc_users',
  ROOMS: 'tra_doc_rooms',
  STUDENTS: 'tra_doc_students',
  ATTENDANCE: 'tra_doc_attendance',
  WEEKEND: 'tra_doc_weekend',
  INSPECTIONS: 'tra_doc_inspections',
  EVIDENCES: 'tra_doc_evidences',
  ACTIVITIES: 'tra_doc_activities',
  AUDIT_LOGS: 'tra_doc_audit_logs',
  CURRENT_USER_ID: 'tra_doc_current_user_id',
};

// Storage helper functions
export const storageService = {
  getSettings(): AppSettings {
    const raw = localStorage.getItem(KEYS.SETTINGS);
    return raw ? JSON.parse(raw) : DEFAULT_SETTINGS;
  },

  saveSettings(settings: AppSettings): void {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  },

  getUsers(): User[] {
    const raw = localStorage.getItem(KEYS.USERS);
    return raw ? JSON.parse(raw) : INITIAL_USERS;
  },

  saveUsers(users: User[]): void {
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
  },

  getRooms(): Room[] {
    const raw = localStorage.getItem(KEYS.ROOMS);
    const list: Room[] = raw ? JSON.parse(raw) : INITIAL_ROOMS;
    return list.map((r, idx) => {
      if (!r.createdByType) {
        const isAdminAdded = idx >= 4;
        return {
          ...r,
          createdByType: (isAdminAdded ? 'admin' : 'preset') as 'admin' | 'preset',
          createdByUserName: isAdminAdded ? 'Quản trị viên Nguyễn Trọng Nghĩa' : 'Hệ thống Trường Trà Đốc',
          createdByRole: isAdminAdded ? 'admin' : 'system',
          createdAt: r.createdAt || '2026-08-25',
          roomNotes: r.roomNotes || (isAdminAdded ? 'Phòng do Quản trị viên tự thêm & cấp phát giường tủ' : 'Phòng nội trú tiêu chuẩn'),
          equipment: r.equipment || ['10 giường tầng sắt', 'Tủ cá nhân 20 ngăn', 'Quạt trần & đèn LED', 'Bình nước nóng'],
        };
      }
      return r;
    });
  },

  saveRooms(rooms: Room[]): void {
    localStorage.setItem(KEYS.ROOMS, JSON.stringify(rooms));
  },

  getStudents(): Student[] {
    const raw = localStorage.getItem(KEYS.STUDENTS);
    const list: Student[] = raw ? JSON.parse(raw) : INITIAL_STUDENTS;
    return list.map((s, idx) => {
      if (!s.entrySource) {
        const isTeacher = (s.note && (s.note.includes('tự nhập') || s.note.includes('trực phòng'))) || idx % 2 === 0;
        return {
          ...s,
          entrySource: isTeacher ? 'teacher' : 'excel',
          note: s.note || (isTeacher ? 'Giáo viên trực phòng tự nhập' : 'Hồ sơ tuyển sinh Excel'),
        };
      }
      return s;
    });
  },

  saveStudents(students: Student[]): void {
    localStorage.setItem(KEYS.STUDENTS, JSON.stringify(students));
  },

  getAttendance(): AttendanceRecord[] {
    const raw = localStorage.getItem(KEYS.ATTENDANCE);
    return raw ? JSON.parse(raw) : INITIAL_ATTENDANCE;
  },

  saveAttendance(attendance: AttendanceRecord[]): void {
    localStorage.setItem(KEYS.ATTENDANCE, JSON.stringify(attendance));
  },

  getWeekend(): WeekendRecord[] {
    const raw = localStorage.getItem(KEYS.WEEKEND);
    return raw ? JSON.parse(raw) : INITIAL_WEEKEND;
  },

  saveWeekend(weekend: WeekendRecord[]): void {
    localStorage.setItem(KEYS.WEEKEND, JSON.stringify(weekend));
  },

  getInspections(): InspectionScore[] {
    const raw = localStorage.getItem(KEYS.INSPECTIONS);
    return raw ? JSON.parse(raw) : INITIAL_INSPECTIONS;
  },

  saveInspections(inspections: InspectionScore[]): void {
    localStorage.setItem(KEYS.INSPECTIONS, JSON.stringify(inspections));
  },

  getEvidences(): EvidenceItem[] {
    const raw = localStorage.getItem(KEYS.EVIDENCES);
    return raw ? JSON.parse(raw) : INITIAL_EVIDENCES;
  },

  saveEvidences(evidences: EvidenceItem[]): void {
    localStorage.setItem(KEYS.EVIDENCES, JSON.stringify(evidences));
  },

  getActivities(): MovementActivity[] {
    const raw = localStorage.getItem(KEYS.ACTIVITIES);
    return raw ? JSON.parse(raw) : INITIAL_ACTIVITIES;
  },

  saveActivities(activities: MovementActivity[]): void {
    localStorage.setItem(KEYS.ACTIVITIES, JSON.stringify(activities));
  },

  getAuditLogs(): AuditLog[] {
    const raw = localStorage.getItem(KEYS.AUDIT_LOGS);
    return raw ? JSON.parse(raw) : INITIAL_AUDIT_LOGS;
  },

  addAuditLog(user: User, action: string, module: string, details: string): void {
    const current = this.getAuditLogs();
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const timeStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    
    const newLog: AuditLog = {
      id: 'log-' + Date.now(),
      userId: user.id,
      userName: `${user.name} (${user.role})`,
      action,
      module,
      details,
      timestamp: timeStr,
    };
    current.unshift(newLog);
    localStorage.setItem(KEYS.AUDIT_LOGS, JSON.stringify(current.slice(0, 500))); // Keep last 500
  },

  getCurrentUserId(): string {
    return localStorage.getItem(KEYS.CURRENT_USER_ID) || 'u-admin-1';
  },

  setCurrentUserId(id: string): void {
    localStorage.setItem(KEYS.CURRENT_USER_ID, id);
  },

  // Export full JSON backup
  exportFullBackup(): string {
    const backup = {
      timestamp: new Date().toISOString(),
      school: 'TRƯỜNG PTDTBT THCS XÃ TRÀ ĐỐC',
      settings: this.getSettings(),
      users: this.getUsers(),
      rooms: this.getRooms(),
      students: this.getStudents(),
      attendance: this.getAttendance(),
      weekend: this.getWeekend(),
      inspections: this.getInspections(),
      evidences: this.getEvidences(),
      activities: this.getActivities(),
      auditLogs: this.getAuditLogs(),
    };
    return JSON.stringify(backup, null, 2);
  },

  // Restore full backup
  restoreFullBackup(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.settings) this.saveSettings(data.settings);
      if (data.users) this.saveUsers(data.users);
      if (data.rooms) this.saveRooms(data.rooms);
      if (data.students) this.saveStudents(data.students);
      if (data.attendance) this.saveAttendance(data.attendance);
      if (data.weekend) this.saveWeekend(data.weekend);
      if (data.inspections) this.saveInspections(data.inspections);
      if (data.evidences) this.saveEvidences(data.evidences);
      if (data.activities) this.saveActivities(data.activities);
      return true;
    } catch (e) {
      console.error('Failed to parse restore data', e);
      return false;
    }
  },

  // Reset to factory sample data
  resetAll(): void {
    localStorage.clear();
  }
};
