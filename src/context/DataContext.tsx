import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Room,
  Student,
  AttendanceRecord,
  WeekendRecord,
  InspectionScore,
  EvidenceItem,
  MovementActivity,
  AuditLog,
  AppSettings,
  AttendanceStatus,
  WeekendStatus
} from '../types';
import { storageService } from '../services/storage';
import { useAuth } from './AuthContext';

export interface SystemAlert {
  id: string;
  type: 'urgent' | 'warning' | 'info' | 'success'; // 🔴 Khẩn cấp, 🟠 Cần xử lý, 🟡 Cần chú ý, 🟢 Hoàn thành
  title: string;
  message: string;
  targetRoomId?: string;
  time?: string;
}

interface DataContextType {
  // State
  rooms: Room[];
  students: Student[];
  attendance: AttendanceRecord[];
  weekend: WeekendRecord[];
  inspections: InspectionScore[];
  evidences: EvidenceItem[];
  activities: MovementActivity[];
  auditLogs: AuditLog[];
  settings: AppSettings;
  alerts: SystemAlert[];

  // Mutators for Rooms
  addRoom: (room: Omit<Room, 'id'>) => void;
  updateRoom: (room: Room) => void;
  deleteRoom: (roomId: string) => boolean;
  toggleRoomLock: (roomId: string) => void;
  setTotalRoomsCount: (targetCount: number, defaultCapacity?: number) => { success: boolean; message: string };
  batchCreateRooms: (count: number, startNumber: number, capacity: number, zone: 'Khu A (Nam)' | 'Khu B (Nữ)' | 'Khu C (Mới)') => void;
  updateAllRooms: (newRooms: Room[]) => void;
  openAddRoomModalSignal: number;
  triggerOpenAddRoomModal: () => void;

  // Mutators for Students
  addStudent: (student: Omit<Student, 'id'>) => void;
  updateStudent: (student: Student) => void;
  deleteStudent: (studentId: string) => boolean;
  transferStudentRoom: (studentId: string, newRoomId: string) => void;
  importStudentsBatch: (newStudents: Omit<Student, 'id'>[]) => void;

  // Mutators for Attendance
  saveStudentAttendance: (record: Omit<AttendanceRecord, 'id'>) => void;
  bulkSaveRoomAttendance: (
    roomId: string,
    session: 'morning' | 'evening',
    date: string,
    records: { studentId: string; studentName: string; status: AttendanceStatus; note?: string }[]
  ) => void;

  // Mutators for Weekend
  saveWeekendRecord: (record: Omit<WeekendRecord, 'id'>) => void;
  bulkSaveWeekend: (records: Omit<WeekendRecord, 'id'>[]) => void;

  // Mutators for Inspection
  saveInspectionScore: (score: Omit<InspectionScore, 'id'>) => void;

  // Mutators for Evidence
  addEvidence: (item: Omit<EvidenceItem, 'id'>) => void;

  // Mutators for Activities
  addActivity: (activity: Omit<MovementActivity, 'id'>) => void;
  updateActivity: (activity: MovementActivity) => void;

  // Settings & System
  updateSettings: (newSettings: AppSettings) => void;
  resetToSampleData: () => void;
  refreshAll: () => void;

  // Quick stats
  stats: {
    totalStudents: number;
    maleStudents: number;
    femaleStudents: number;
    totalRooms: number;
    completedMorningRooms: number;
    completedEveningRooms: number;
    presentMorning: number;
    absentExcusedMorning: number;
    absentUnexcusedMorning: number;
    homeMorning: number;
    weekendStayCount: number;
    weekendHomeCount: number;
    weekendPendingCount: number;
    avgInspectionScore: number;
    topRoomName: string;
    lowestRoomName: string;
  };
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();

  const [rooms, setRooms] = useState<Room[]>(() => storageService.getRooms());
  const [students, setStudents] = useState<Student[]>(() => storageService.getStudents());
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => storageService.getAttendance());
  const [weekend, setWeekend] = useState<WeekendRecord[]>(() => storageService.getWeekend());
  const [inspections, setInspections] = useState<InspectionScore[]>(() => storageService.getInspections());
  const [evidences, setEvidences] = useState<EvidenceItem[]>(() => storageService.getEvidences());
  const [activities, setActivities] = useState<MovementActivity[]>(() => storageService.getActivities());
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => storageService.getAuditLogs());
  const [settings, setSettings] = useState<AppSettings>(() => storageService.getSettings());
  const [openAddRoomModalSignal, setOpenAddRoomModalSignal] = useState(0);

  const triggerOpenAddRoomModal = () => {
    setOpenAddRoomModalSignal(prev => prev + 1);
  };

  const refreshAll = () => {
    setRooms(storageService.getRooms());
    setStudents(storageService.getStudents());
    setAttendance(storageService.getAttendance());
    setWeekend(storageService.getWeekend());
    setInspections(storageService.getInspections());
    setEvidences(storageService.getEvidences());
    setActivities(storageService.getActivities());
    setAuditLogs(storageService.getAuditLogs());
    setSettings(storageService.getSettings());
  };

  // Recalculate room counts on students change
  useEffect(() => {
    const updatedRooms = rooms.map(room => {
      const roomStudents = students.filter(s => s.roomId === room.id && s.boardingStatus === 'Đang ở nội trú');
      const male = roomStudents.filter(s => s.gender === 'Nam').length;
      const female = roomStudents.filter(s => s.gender === 'Nữ').length;
      return {
        ...room,
        currentOccupancy: roomStudents.length,
        maleCount: male,
        femaleCount: female,
      };
    });
    // check if changed
    const hasDiff = updatedRooms.some((r, idx) => r.currentOccupancy !== rooms[idx]?.currentOccupancy);
    if (hasDiff) {
      setRooms(updatedRooms);
      storageService.saveRooms(updatedRooms);
    }
  }, [students]);

  // Mutator: Add Room (Quản trị viên tự thêm phòng ở học sinh)
  const addRoom = (roomData: Omit<Room, 'id'>) => {
    const newRoom: Room = {
      ...roomData,
      id: 'r-' + Date.now(),
      createdByType: (roomData.createdByType || (currentUser?.role === 'teacher' ? 'teacher' : 'admin')) as any,
      createdByUserName: roomData.createdByUserName || currentUser?.name || 'Quản trị viên',
      createdByRole: roomData.createdByRole || currentUser?.role || 'admin',
      createdAt: roomData.createdAt || new Date().toISOString().split('T')[0],
      equipment: roomData.equipment || ['10 giường tầng sắt', 'Tủ đồ cá nhân', 'Đèn LED & quạt trần'],
    };
    const next = [...rooms, newRoom];
    setRooms(next);
    storageService.saveRooms(next);
    const roleTitle = currentUser?.role === 'head_master' ? 'Trưởng ban Quản lý' : currentUser?.role === 'principal' ? 'Ban Giám Hiệu' : 'Quản trị viên';
    storageService.addAuditLog(currentUser, `${roleTitle} tự thêm phòng`, 'Phòng ở', `Tạo phòng ${newRoom.roomNumber} - ${newRoom.name} (${newRoom.buildingZone})`);
    setAuditLogs(storageService.getAuditLogs());
  };

  // Mutator: Update Room
  const updateRoom = (updated: Room) => {
    const next = rooms.map(r => (r.id === updated.id ? updated : r));
    setRooms(next);
    storageService.saveRooms(next);
    storageService.addAuditLog(currentUser, 'Cập nhật phòng', 'Phòng ở', `Cập nhật thông tin phòng ${updated.roomNumber}`);
    setAuditLogs(storageService.getAuditLogs());
  };

  // Mutator: Delete Room
  const deleteRoom = (roomId: string): boolean => {
    const hasStudents = students.some(s => s.roomId === roomId);
    if (hasStudents) {
      alert('Không thể xóa phòng đang có học sinh ở! Vui lòng chuyển học sinh sang phòng khác trước.');
      return false;
    }
    const target = rooms.find(r => r.id === roomId);
    const next = rooms.filter(r => r.id !== roomId);
    setRooms(next);
    storageService.saveRooms(next);
    if (target) {
      storageService.addAuditLog(currentUser, 'Xóa phòng', 'Phòng ở', `Đã xóa phòng ${target.roomNumber} - ${target.name}`);
      setAuditLogs(storageService.getAuditLogs());
    }
    return true;
  };

  // Mutator: Lock/Unlock room
  const toggleRoomLock = (roomId: string) => {
    const next = rooms.map(r => {
      if (r.id === roomId) {
        const newStatus = r.status === 'locked' ? 'active' : 'locked';
        return { ...r, status: newStatus as 'active' | 'locked' };
      }
      return r;
    });
    setRooms(next);
    storageService.saveRooms(next);
    const target = rooms.find(r => r.id === roomId);
    if (target) {
      storageService.addAuditLog(currentUser, 'Khóa/Mở phòng', 'Phòng ở', `Thay đổi trạng thái phòng ${target.roomNumber}`);
      setAuditLogs(storageService.getAuditLogs());
    }
  };

  // Mutator: Set Total Rooms Count (Tự nhập số lượng phòng ở)
  const setTotalRoomsCount = (targetCount: number, defaultCapacity: number = 20): { success: boolean; message: string } => {
    if (targetCount < 1) {
      return { success: false, message: 'Số lượng phòng phải lớn hơn 0!' };
    }

    const currentCount = rooms.length;
    if (targetCount === currentCount) {
      return { success: true, message: `Số lượng phòng hiện tại đã là ${targetCount} phòng!` };
    }

    if (targetCount > currentCount) {
      // Add missing rooms
      const addedRooms: Room[] = [];
      for (let i = currentCount + 1; i <= targetCount; i++) {
        const roomNum = `P.${i < 10 ? '10' + i : i < 20 ? '20' + (i - 10) : '30' + (i - 20)}`;
        const zone: 'Khu A (Nam)' | 'Khu B (Nữ)' | 'Khu C (Mới)' =
          i % 3 === 1 ? 'Khu A (Nam)' : i % 3 === 2 ? 'Khu B (Nữ)' : 'Khu C (Mới)';
        addedRooms.push({
          id: `r-auto-${Date.now()}-${i}`,
          roomNumber: roomNum,
          name: `Phòng Nội Trú Số ${i}`,
          buildingZone: zone,
          capacity: defaultCapacity,
          currentOccupancy: 0,
          maleCount: 0,
          femaleCount: 0,
          status: 'active',
          currentScore: 95,
          morningAttendanceDone: false,
          eveningAttendanceDone: false,
          weekendDone: false,
        });
      }
      const nextRooms = [...rooms, ...addedRooms];
      setRooms(nextRooms);
      storageService.saveRooms(nextRooms);
      storageService.addAuditLog(currentUser, 'Tự nhập số lượng phòng', 'Phòng ở', `Thiết lập tăng quy mô thành ${targetCount} phòng (thêm mới ${addedRooms.length} phòng)`);
      setAuditLogs(storageService.getAuditLogs());
      return { success: true, message: `Đã tự động tạo thêm ${addedRooms.length} phòng, nâng tổng số lên ${targetCount} phòng thành công!` };
    } else {
      // Decrease rooms: check if any trailing rooms have students
      const roomsToKeep = rooms.slice(0, targetCount);
      const roomsToRemove = rooms.slice(targetCount);
      const roomsWithStudents = roomsToRemove.filter(r => students.some(s => s.roomId === r.id && s.boardingStatus === 'Đang ở nội trú'));

      if (roomsWithStudents.length > 0) {
        return {
          success: false,
          message: `Không thể giảm xuống ${targetCount} phòng vì các phòng (${roomsWithStudents.map(r => r.roomNumber).join(', ')}) đang có học sinh nội trú ở! Hãy chuyển học sinh trước.`
        };
      }

      setRooms(roomsToKeep);
      storageService.saveRooms(roomsToKeep);
      storageService.addAuditLog(currentUser, 'Tự nhập số lượng phòng', 'Phòng ở', `Thiết lập giảm quy mô từ ${currentCount} xuống ${targetCount} phòng`);
      setAuditLogs(storageService.getAuditLogs());
      return { success: true, message: `Đã cập nhật tổng số lượng thành ${targetCount} phòng thành công!` };
    }
  };

  // Mutator: Batch create rooms (Quản trị viên tự thêm hàng loạt phòng)
  const batchCreateRooms = (count: number, startNumber: number, capacity: number, zone: 'Khu A (Nam)' | 'Khu B (Nữ)' | 'Khu C (Mới)') => {
    const newRooms: Room[] = [];
    for (let i = 0; i < count; i++) {
      const num = startNumber + i;
      newRooms.push({
        id: `r-batch-${Date.now()}-${i}`,
        roomNumber: `P.${num}`,
        name: `Phòng ${zone.split(' ')[0]} ${num}`,
        buildingZone: zone,
        capacity,
        currentOccupancy: 0,
        maleCount: 0,
        femaleCount: 0,
        status: 'active',
        currentScore: 95,
        morningAttendanceDone: false,
        eveningAttendanceDone: false,
        weekendDone: false,
        createdByType: 'admin',
        createdByUserName: currentUser?.name || 'Quản trị viên',
        createdByRole: currentUser?.role || 'admin',
        createdAt: new Date().toISOString().split('T')[0],
        equipment: ['10 giường tầng sắt', 'Tủ đồ cá nhân', 'Đèn LED & quạt trần'],
      });
    }
    const next = [...rooms, ...newRooms];
    setRooms(next);
    storageService.saveRooms(next);
    storageService.addAuditLog(currentUser, 'Quản trị viên tự thêm phòng hàng loạt', 'Phòng ở', `Tạo thêm ${count} phòng thuộc ${zone} bắt đầu từ P.${startNumber}`);
    setAuditLogs(storageService.getAuditLogs());
  };

  // Mutator: Update All Rooms (Lưu bảng nhập thủ công số lượng phòng ở)
  const updateAllRooms = (newRooms: Room[]) => {
    // Recalculate occupancy from students
    const updated = newRooms.map(room => {
      const roomStudents = students.filter(s => s.roomId === room.id && s.boardingStatus === 'Đang ở nội trú');
      return {
        ...room,
        currentOccupancy: roomStudents.length,
        maleCount: roomStudents.filter(s => s.gender === 'Nam').length,
        femaleCount: roomStudents.filter(s => s.gender === 'Nữ').length,
      };
    });
    setRooms(updated);
    storageService.saveRooms(updated);
    storageService.addAuditLog(currentUser, 'Cập nhật danh sách phòng thủ công', 'Phòng ở', `Cập nhật toàn bộ danh mục ${updated.length} phòng ở học sinh`);
    setAuditLogs(storageService.getAuditLogs());
  };

  // Mutator: Add Student
  const addStudent = (studentData: Omit<Student, 'id'>) => {
    const newStudent: Student = {
      ...studentData,
      id: 's-' + Date.now(),
    };
    const next = [...students, newStudent];
    setStudents(next);
    storageService.saveStudents(next);
    storageService.addAuditLog(currentUser, 'Thêm học sinh', 'Học sinh', `Thêm em ${newStudent.fullName} (${newStudent.gradeClass}) vào ${newStudent.roomNumber}`);
    setAuditLogs(storageService.getAuditLogs());
  };

  // Mutator: Update Student
  const updateStudent = (updated: Student) => {
    const next = students.map(s => (s.id === updated.id ? updated : s));
    setStudents(next);
    storageService.saveStudents(next);
    storageService.addAuditLog(currentUser, 'Cập nhật học sinh', 'Học sinh', `Sửa thông tin học sinh ${updated.fullName}`);
    setAuditLogs(storageService.getAuditLogs());
  };

  // Mutator: Delete Student
  const deleteStudent = (studentId: string): boolean => {
    const target = students.find(s => s.id === studentId);
    const next = students.filter(s => s.id !== studentId);
    setStudents(next);
    storageService.saveStudents(next);
    if (target) {
      storageService.addAuditLog(currentUser, 'Xóa học sinh', 'Học sinh', `Xóa hồ sơ học sinh ${target.fullName} (${target.gradeClass})`);
      setAuditLogs(storageService.getAuditLogs());
    }
    return true;
  };

  // Mutator: Transfer Student Room
  const transferStudentRoom = (studentId: string, newRoomId: string) => {
    const targetRoom = rooms.find(r => r.id === newRoomId);
    if (!targetRoom) return;
    const next = students.map(s => {
      if (s.id === studentId) {
        return {
          ...s,
          roomId: targetRoom.id,
          roomNumber: targetRoom.roomNumber,
          teacherName: targetRoom.assignedTeacherName,
        };
      }
      return s;
    });
    setStudents(next);
    storageService.saveStudents(next);
    const targetStudent = students.find(s => s.id === studentId);
    storageService.addAuditLog(
      currentUser,
      'Chuyển phòng',
      'Học sinh',
      `Chuyển học sinh ${targetStudent?.fullName} sang ${targetRoom.roomNumber}`
    );
    setAuditLogs(storageService.getAuditLogs());
  };

  // Mutator: Import Students batch (from Excel)
  const importStudentsBatch = (newStudents: Omit<Student, 'id'>[]) => {
    const formatted: Student[] = newStudents.map((st, idx) => ({
      ...st,
      id: `s-imp-${Date.now()}-${idx}`,
    }));
    const next = [...students, ...formatted];
    setStudents(next);
    storageService.saveStudents(next);
    storageService.addAuditLog(currentUser, 'Nhập danh sách Excel', 'Học sinh', `Đã nhập thành công ${formatted.length} học sinh từ file`);
    setAuditLogs(storageService.getAuditLogs());
  };

  // Mutator: Save student attendance (single)
  const saveStudentAttendance = (recordData: Omit<AttendanceRecord, 'id'>) => {
    const existingIdx = attendance.findIndex(
      a => a.studentId === recordData.studentId && a.date === recordData.date && a.session === recordData.session
    );
    let next: AttendanceRecord[];
    if (existingIdx >= 0) {
      next = [...attendance];
      next[existingIdx] = { ...recordData, id: attendance[existingIdx].id };
    } else {
      next = [...attendance, { ...recordData, id: 'att-' + Date.now() }];
    }
    setAttendance(next);
    storageService.saveAttendance(next);
  };

  // Mutator: Bulk save room attendance
  const bulkSaveRoomAttendance = (
    roomId: string,
    session: 'morning' | 'evening',
    date: string,
    records: { studentId: string; studentName: string; status: AttendanceStatus; note?: string }[]
  ) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const fullTimeStr = `${timeStr} ${date}`;
    const targetRoom = rooms.find(r => r.id === roomId);

    // Filter out existing records for this room & date & session
    const otherRecords = attendance.filter(
      a => !(a.roomId === roomId && a.date === date && a.session === session)
    );

    const newRecords: AttendanceRecord[] = records.map((r, idx) => ({
      id: `att-${roomId}-${session}-${date}-${idx}-${Date.now()}`,
      studentId: r.studentId,
      studentName: r.studentName,
      roomId,
      roomNumber: targetRoom ? targetRoom.roomNumber : '',
      date,
      session,
      status: r.status,
      note: r.note,
      submittedBy: currentUser.name,
      submittedAt: fullTimeStr,
    }));

    const nextAttendance = [...otherRecords, ...newRecords];
    setAttendance(nextAttendance);
    storageService.saveAttendance(nextAttendance);

    // Update room submission status
    const updatedRooms = rooms.map(r => {
      if (r.id === roomId) {
        return {
          ...r,
          morningAttendanceDone: session === 'morning' ? true : r.morningAttendanceDone,
          eveningAttendanceDone: session === 'evening' ? true : r.eveningAttendanceDone,
          lastSubmitTime: timeStr,
        };
      }
      return r;
    });
    setRooms(updatedRooms);
    storageService.saveRooms(updatedRooms);

    // Audit log
    storageService.addAuditLog(
      currentUser,
      `Điểm danh ${session === 'morning' ? 'Sáng' : 'Tối'}`,
      'Điểm danh',
      `Nhập điểm danh ${session === 'morning' ? 'sáng' : 'tối'} phòng ${targetRoom?.roomNumber} (${records.length} học sinh) lúc ${timeStr}`
    );
    setAuditLogs(storageService.getAuditLogs());
  };

  // Mutator: Save Weekend Record
  const saveWeekendRecord = (record: Omit<WeekendRecord, 'id'>) => {
    const existingIdx = weekend.findIndex(w => w.studentId === record.studentId && w.date === record.date);
    let next: WeekendRecord[];
    if (existingIdx >= 0) {
      next = [...weekend];
      next[existingIdx] = { ...record, id: weekend[existingIdx].id };
    } else {
      next = [...weekend, { ...record, id: 'wk-' + Date.now() }];
    }
    setWeekend(next);
    storageService.saveWeekend(next);
  };

  const bulkSaveWeekend = (records: Omit<WeekendRecord, 'id'>[]) => {
    const newItems: WeekendRecord[] = records.map((r, idx) => ({
      ...r,
      id: `wk-${Date.now()}-${idx}`,
    }));

    // Filter out existing by studentId and date
    const targetDates = new Set(records.map(r => r.date));
    const targetStudentIds = new Set(records.map(r => r.studentId));

    const kept = weekend.filter(w => !(targetDates.has(w.date) && targetStudentIds.has(w.studentId)));
    const next = [...kept, ...newItems];

    setWeekend(next);
    storageService.saveWeekend(next);

    // Mark rooms as weekend completed
    const affectedRoomIds = Array.from(new Set(records.map(r => r.roomId)));
    const updatedRooms = rooms.map(r => {
      if (affectedRoomIds.includes(r.id)) {
        return { ...r, weekendDone: true };
      }
      return r;
    });
    setRooms(updatedRooms);
    storageService.saveRooms(updatedRooms);

    storageService.addAuditLog(currentUser, 'Cập nhật đăng ký cuối tuần', 'Đăng ký cuối tuần', `Cập nhật ${records.length} lượt đăng ký ở lại/về nhà`);
    setAuditLogs(storageService.getAuditLogs());
  };

  // Mutator: Save Inspection Score
  const saveInspectionScore = (scoreData: Omit<InspectionScore, 'id'>) => {
    const total =
      scoreData.rulesScore +
      scoreData.roomHygieneScore +
      scoreData.disciplineScore +
      scoreData.areaHygieneScore +
      scoreData.dutyScore +
      scoreData.culturalScore +
      scoreData.sportsScore;

    const fullScore: InspectionScore = {
      ...scoreData,
      id: 'insp-' + Date.now(),
      totalScore: total,
    };

    const next = [fullScore, ...inspections.filter(i => !(i.roomId === scoreData.roomId && i.weekNumber === scoreData.weekNumber))];
    setInspections(next);
    storageService.saveInspections(next);

    // Update room's latest score
    const updatedRooms = rooms.map(r => {
      if (r.id === scoreData.roomId) {
        return { ...r, currentScore: total };
      }
      return r;
    });
    setRooms(updatedRooms);
    storageService.saveRooms(updatedRooms);

    storageService.addAuditLog(
      currentUser,
      'Chấm điểm thi đua',
      'Thi đua',
      `Chấm điểm tuần ${scoreData.weekNumber} cho ${scoreData.roomNumber}: ${total}/100 điểm`
    );
    setAuditLogs(storageService.getAuditLogs());
  };

  // Mutator: Add Evidence
  const addEvidence = (item: Omit<EvidenceItem, 'id'>) => {
    const newEvidence: EvidenceItem = {
      ...item,
      id: 'ev-' + Date.now(),
    };
    const next = [newEvidence, ...evidences];
    setEvidences(next);
    storageService.saveEvidences(next);

    storageService.addAuditLog(
      currentUser,
      'Tải ảnh minh chứng',
      'Minh chứng',
      `Tải ảnh minh chứng cho phòng ${item.roomNumber} - Tiêu chí: ${item.category}`
    );
    setAuditLogs(storageService.getAuditLogs());
  };

  // Mutator: Add / Update Activities
  const addActivity = (actData: Omit<MovementActivity, 'id'>) => {
    const newAct: MovementActivity = {
      ...actData,
      id: 'act-' + Date.now(),
    };
    const next = [newAct, ...activities];
    setActivities(next);
    storageService.saveActivities(next);

    storageService.addAuditLog(currentUser, 'Thêm phong trào', 'Phong trào', `Tạo cuộc thi/giải đấu: ${newAct.name}`);
    setAuditLogs(storageService.getAuditLogs());
  };

  const updateActivity = (act: MovementActivity) => {
    const next = activities.map(a => (a.id === act.id ? act : a));
    setActivities(next);
    storageService.saveActivities(next);

    storageService.addAuditLog(currentUser, 'Cập nhật phong trào', 'Phong trào', `Cập nhật kết quả giải đấu: ${act.name}`);
    setAuditLogs(storageService.getAuditLogs());
  };

  // Mutator: Settings
  const updateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    storageService.saveSettings(newSettings);
    storageService.addAuditLog(currentUser, 'Cài đặt hệ thống', 'Cấu hình', 'Thay đổi cấu hình thời gian điểm danh hoặc thang điểm');
    setAuditLogs(storageService.getAuditLogs());
  };

  // Reset to sample data
  const resetToSampleData = () => {
    storageService.resetAll();
    refreshAll();
  };

  // Computed alerts
  const alerts: SystemAlert[] = useMemo(() => {
    const list: SystemAlert[] = [];
    const activeRooms = rooms.filter(r => r.status === 'active');

    // 1. Check rooms missing evening attendance
    activeRooms.forEach(r => {
      if (!r.eveningAttendanceDone) {
        list.push({
          id: `alert-e-${r.id}`,
          type: 'urgent',
          title: `Chưa điểm danh tối: ${r.roomNumber}`,
          message: `${r.roomNumber} (${r.assignedTeacherName || 'Chưa phân công'}) chưa hoàn thành điểm danh tối theo khung giờ quy định.`,
          targetRoomId: r.id,
        });
      }
    });

    // 2. Check rooms missing morning attendance
    activeRooms.forEach(r => {
      if (!r.morningAttendanceDone) {
        list.push({
          id: `alert-m-${r.id}`,
          type: 'warning',
          title: `Chưa điểm danh sáng: ${r.roomNumber}`,
          message: `${r.roomNumber} chưa có dữ liệu điểm danh sáng hôm nay.`,
          targetRoomId: r.id,
        });
      }
    });

    // 3. Check weekend pending registrations
    const pendingWeekendCount = weekend.filter(w => w.status === 'pending').length;
    if (pendingWeekendCount > 0) {
      list.push({
        id: 'alert-weekend-pending',
        type: 'warning',
        title: `Đăng ký cuối tuần`,
        message: `Hiện còn ${pendingWeekendCount} học sinh chưa cập nhật trạng thái ở lại trường hay về nhà cuối tuần này.`,
      });
    }

    // 4. Check low score rooms
    activeRooms.forEach(r => {
      if (r.currentScore && r.currentScore < 90) {
        list.push({
          id: `alert-score-${r.id}`,
          type: 'info',
          title: `Điểm thi đua cần cải thiện: ${r.roomNumber}`,
          message: `${r.roomNumber} đạt ${r.currentScore}/100 điểm, cần tăng cường vệ sinh phòng ở và giữ gìn nề nếp.`,
          targetRoomId: r.id,
        });
      }
    });

    return list;
  }, [rooms, weekend]);

  // Computed summary stats
  const stats = useMemo(() => {
    const totalStudents = students.filter(s => s.boardingStatus === 'Đang ở nội trú').length;
    const maleStudents = students.filter(s => s.boardingStatus === 'Đang ở nội trú' && s.gender === 'Nam').length;
    const femaleStudents = students.filter(s => s.boardingStatus === 'Đang ở nội trú' && s.gender === 'Nữ').length;

    const totalRooms = rooms.length;
    const activeRooms = rooms.filter(r => r.status === 'active');
    const completedMorningRooms = activeRooms.filter(r => r.morningAttendanceDone).length;
    const completedEveningRooms = activeRooms.filter(r => r.eveningAttendanceDone).length;

    // Attendance stats for today morning
    const morningRecords = attendance.filter(a => a.session === 'morning');
    const presentMorning = morningRecords.filter(a => a.status === 'present').length;
    const absentExcusedMorning = morningRecords.filter(a => a.status === 'absent_excused').length;
    const absentUnexcusedMorning = morningRecords.filter(a => a.status === 'absent_unexcused').length;
    const homeMorning = morningRecords.filter(a => a.status === 'home').length;

    // Weekend stats
    const weekendStayCount = weekend.filter(w => w.status === 'stay').length;
    const weekendHomeCount = weekend.filter(w => w.status === 'home').length;
    const weekendPendingCount = weekend.filter(w => w.status === 'pending').length;

    // Inspection scores
    const activeScores = rooms
      .filter(r => r.status === 'active' && r.currentScore !== undefined)
      .map(r => r.currentScore as number);

    const avgInspectionScore = activeScores.length > 0 ? Math.round((activeScores.reduce((a, b) => a + b, 0) / activeScores.length) * 10) / 10 : 0;

    const sortedRooms = [...rooms].sort((a, b) => (b.currentScore || 0) - (a.currentScore || 0));
    const topRoomName = sortedRooms[0]?.roomNumber || 'P.201';
    const lowestRoomName = sortedRooms[sortedRooms.length - 1]?.roomNumber || 'P.301';

    return {
      totalStudents,
      maleStudents,
      femaleStudents,
      totalRooms,
      completedMorningRooms,
      completedEveningRooms,
      presentMorning,
      absentExcusedMorning,
      absentUnexcusedMorning,
      homeMorning,
      weekendStayCount,
      weekendHomeCount,
      weekendPendingCount,
      avgInspectionScore,
      topRoomName,
      lowestRoomName,
    };
  }, [students, rooms, attendance, weekend]);

  return (
    <DataContext.Provider
      value={{
        rooms,
        students,
        attendance,
        weekend,
        inspections,
        evidences,
        activities,
        auditLogs,
        settings,
        alerts,
        addRoom,
        updateRoom,
        deleteRoom,
        toggleRoomLock,
        setTotalRoomsCount,
        batchCreateRooms,
        updateAllRooms,
        openAddRoomModalSignal,
        triggerOpenAddRoomModal,
        addStudent,
        updateStudent,
        deleteStudent,
        transferStudentRoom,
        importStudentsBatch,
        saveStudentAttendance,
        bulkSaveRoomAttendance,
        saveWeekendRecord,
        bulkSaveWeekend,
        saveInspectionScore,
        addEvidence,
        addActivity,
        updateActivity,
        updateSettings,
        resetToSampleData,
        refreshAll,
        stats,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
};
