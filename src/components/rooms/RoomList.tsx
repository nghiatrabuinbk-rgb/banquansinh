import React, { useState, useMemo, useEffect } from 'react';
import {
  Home,
  Plus,
  Edit2,
  Trash2,
  Lock,
  Unlock,
  Users,
  Building,
  UserCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  X,
  Trophy,
  Sliders,
  Layers,
  Sparkles,
  UserPlus,
  Eye,
  ArrowRightLeft,
  Phone,
  MapPin,
  ClipboardList,
  ShieldCheck,
  Check,
  Wrench,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Room, Student } from '../../types';

export const RoomList: React.FC = () => {
  const {
    rooms,
    addRoom,
    updateRoom,
    deleteRoom,
    toggleRoomLock,
    setTotalRoomsCount,
    batchCreateRooms,
    students,
    addStudent,
    importStudentsBatch,
    transferStudentRoom,
    deleteStudent,
    openAddRoomModalSignal,
  } = useData();

  const { allUsers, canManageSystem, canManageRooms, isTeacherOnly, assignedRoomId, currentUser } = useAuth();
  const canManage = canManageSystem || canManageRooms;

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBatchCountModalOpen, setIsBatchCountModalOpen] = useState(false);
  const [isCustomBatchModalOpen, setIsCustomBatchModalOpen] = useState(false);
  const [isAddStudentToRoomOpen, setIsAddStudentToRoomOpen] = useState(false);
  const [isViewRoomStudentsOpen, setIsViewRoomStudentsOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  // Selected Room Context
  const [selectedRoomForStudent, setSelectedRoomForStudent] = useState<Room | null>(null);
  const [selectedStudentForTransfer, setSelectedStudentForTransfer] = useState<Student | null>(null);
  const [targetTransferRoomId, setTargetTransferRoomId] = useState('');
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  // Filter by Room Occupancy Status
  const [occupancyFilter, setOccupancyFilter] = useState<'all' | 'available' | 'full' | 'empty' | 'admin'>('all');
  const [zoneFilter, setZoneFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Form State for Single Room / Administrator & Headmaster Room Creation
  const [adminAddRoomTab, setAdminAddRoomTab] = useState<'single' | 'batch' | 'presets'>('single');
  const [roomNumber, setRoomNumber] = useState('');
  const [name, setName] = useState('');
  const [buildingZone, setBuildingZone] = useState<'Khu A (Nam)' | 'Khu B (Nữ)' | 'Khu C (Mới)'>('Khu A (Nam)');
  const [capacity, setCapacity] = useState(20);
  const [assignedTeacherId, setAssignedTeacherId] = useState('');
  const [roomEquipment, setRoomEquipment] = useState('10 giường tầng sắt, Tủ cá nhân 20 ngăn, Đèn LED & quạt trần');
  const [roomNotes, setRoomNotes] = useState('');
  const [initialStudentsText, setInitialStudentsText] = useState('');

  // Form State for "Tự nhập số lượng phòng ở"
  const [targetRoomsCount, setTargetRoomsCount] = useState<number>(rooms.length || 12);
  const [defaultRoomCapacity, setDefaultRoomCapacity] = useState<number>(20);
  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form State for "Tạo hàng loạt theo khu"
  const [batchCountInput, setBatchCountInput] = useState<number>(4);
  const [batchStartNumber, setBatchStartNumber] = useState<number>(101);
  const [batchZone, setBatchZone] = useState<'Khu A (Nam)' | 'Khu B (Nữ)' | 'Khu C (Mới)'>('Khu A (Nam)');
  const [batchCapacity, setBatchCapacity] = useState<number>(20);

  // Form State for "Tự nhập học sinh vào phòng ở"
  const [studentInputMode, setStudentInputMode] = useState<'single' | 'batch'>('single');
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentGender, setNewStudentGender] = useState<'Nam' | 'Nữ'>('Nam');
  const [newStudentClass, setNewStudentClass] = useState('6/1');
  const [newStudentVillage, setNewStudentVillage] = useState('Thôn 1');
  const [newStudentHamlet, setNewStudentHamlet] = useState('Nóc Ông Tuân');
  const [newStudentParent, setNewStudentParent] = useState('');
  const [newStudentPhone, setNewStudentPhone] = useState('');
  const [studentBatchPaste, setStudentBatchPaste] = useState('');

  // Visible rooms (teacher sees only their room, others see all)
  const baseVisibleRooms = isTeacherOnly && assignedRoomId
    ? rooms.filter(r => r.id === assignedRoomId)
    : rooms;

  // Filtered rooms by occupancy status & zone & search
  const visibleRooms = useMemo(() => {
    return baseVisibleRooms.filter(r => {
      if (zoneFilter !== 'all' && r.buildingZone !== zoneFilter) return false;

      const isFull = r.currentOccupancy >= r.capacity;
      const isEmpty = r.currentOccupancy === 0;
      const isAvailable = r.currentOccupancy > 0 && r.currentOccupancy < r.capacity;
      const isAdminCreated =
        r.createdByType === 'admin' ||
        r.createdByRole === 'head_master' ||
        (r.createdByUserName && (r.createdByUserName.includes('Quản trị') || r.createdByUserName.includes('Trưởng ban')));

      if (occupancyFilter === 'available' && (isFull || isEmpty)) return false;
      if (occupancyFilter === 'full' && !isFull) return false;
      if (occupancyFilter === 'empty' && !isEmpty) return false;
      if (occupancyFilter === 'admin' && !isAdminCreated) return false;

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          r.roomNumber.toLowerCase().includes(q) ||
          r.name.toLowerCase().includes(q) ||
          (r.assignedTeacherName && r.assignedTeacherName.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [baseVisibleRooms, occupancyFilter, zoneFilter, searchQuery]);

  // Overview metrics
  const totalCapacity = rooms.reduce((sum, r) => sum + r.capacity, 0);
  const totalOccupancy = rooms.reduce((sum, r) => sum + r.currentOccupancy, 0);
  const activeRoomsCount = rooms.filter(r => r.status === 'active').length;
  const lockedRoomsCount = rooms.filter(r => r.status === 'locked').length;
  const availableRoomsCount = rooms.filter(r => r.currentOccupancy < r.capacity).length;
  const fullRoomsCount = rooms.filter(r => r.currentOccupancy >= r.capacity).length;
  const emptyRoomsCount = rooms.filter(r => r.currentOccupancy === 0).length;
  const adminRoomsCount = rooms.filter(
    r =>
      r.createdByType === 'admin' ||
      r.createdByRole === 'head_master' ||
      (r.createdByUserName && (r.createdByUserName.includes('Quản trị') || r.createdByUserName.includes('Trưởng ban')))
  ).length;

  // Handlers for Single Room Create/Edit
  const handleOpenAddModal = () => {
    setEditingRoom(null);
    setAdminAddRoomTab('single');
    // Calculate smart next room number
    const existingNums = rooms.map(r => {
      const match = r.roomNumber.match(/\d+/);
      return match ? parseInt(match[0], 10) : 0;
    });
    const maxNum = existingNums.length > 0 ? Math.max(...existingNums) : 100;
    const nextNum = maxNum > 0 ? maxNum + 1 : rooms.length + 101;
    setRoomNumber(`P.${nextNum}`);
    setName(`Phòng Khối ${rooms.length % 4 + 6}`);
    setBuildingZone('Khu A (Nam)');
    setCapacity(20);
    setAssignedTeacherId('');
    setRoomEquipment('10 giường tầng sắt, Tủ cá nhân 20 ngăn, Đèn LED & quạt trần');
    setRoomNotes(currentUser?.role === 'head_master' ? 'Phòng do Trưởng ban Quản lý Thầy Nguyễn Trọng Nghĩa tự thêm & quản lý' : 'Phòng do Quản trị viên tự thêm & quản lý');
    setInitialStudentsText('');
    setIsModalOpen(true);
  };

  useEffect(() => {
    if (openAddRoomModalSignal > 0) {
      handleOpenAddModal();
    }
  }, [openAddRoomModalSignal]);

  const handleOpenEditModal = (room: Room) => {
    setEditingRoom(room);
    setAdminAddRoomTab('single');
    setRoomNumber(room.roomNumber);
    setName(room.name);
    setBuildingZone(room.buildingZone);
    setCapacity(room.capacity);
    setAssignedTeacherId(room.assignedTeacherId || '');
    setRoomEquipment(room.equipment ? room.equipment.join(', ') : '10 giường tầng sắt, Tủ cá nhân 20 ngăn, Đèn LED & quạt trần');
    setRoomNotes(room.roomNotes || '');
    setInitialStudentsText('');
    setIsModalOpen(true);
  };

  const handleApplyPreset = (preset: {
    name: string;
    zone: 'Khu A (Nam)' | 'Khu B (Nữ)' | 'Khu C (Mới)';
    capacity: number;
    equipment: string;
    notes: string;
  }) => {
    const existingNums = rooms.map(r => {
      const match = r.roomNumber.match(/\d+/);
      return match ? parseInt(match[0], 10) : 0;
    });
    const maxNum = existingNums.length > 0 ? Math.max(...existingNums) : 100;
    const nextNum = maxNum > 0 ? maxNum + 1 : rooms.length + 101;
    setRoomNumber(`P.${nextNum}`);
    setName(preset.name);
    setBuildingZone(preset.zone);
    setCapacity(preset.capacity);
    setRoomEquipment(preset.equipment);
    setRoomNotes(preset.notes);
    setAdminAddRoomTab('single');
  };

  const handleSubmitRoom = (e: React.FormEvent) => {
    e.preventDefault();
    const assignedUser = allUsers.find(u => u.id === assignedTeacherId);
    const equipList = roomEquipment
      ? roomEquipment.split(/[,;\n]/).map(s => s.trim()).filter(s => s.length > 0)
      : ['10 giường tầng sắt', 'Tủ đồ cá nhân', 'Đèn LED & quạt trần'];

    const isHeadMaster = currentUser?.role === 'head_master';
    const userRoleTitle = isHeadMaster ? 'Trưởng ban Quản lý' : currentUser?.role === 'principal' ? 'Hiệu trưởng' : 'Quản trị viên';
    const creatorDisplayName = currentUser?.name
      ? (isHeadMaster && !currentUser.name.includes('Trưởng ban') ? `Trưởng ban QL ${currentUser.name}` : currentUser.name)
      : (isHeadMaster ? 'Trưởng ban Quản lý Nguyễn Trọng Nghĩa' : 'Quản trị viên');

    if (editingRoom) {
      updateRoom({
        ...editingRoom,
        roomNumber,
        name,
        buildingZone,
        capacity,
        assignedTeacherId: assignedUser?.id,
        assignedTeacherName: assignedUser?.name,
        equipment: equipList,
        roomNotes: roomNotes || editingRoom.roomNotes,
      });
      setAlertMessage({ type: 'success', text: `${userRoleTitle} đã cập nhật thông tin phòng ${roomNumber} thành công!` });
    } else {
      const newRoomId = 'r-' + Date.now();
      addRoom({
        roomNumber,
        name,
        buildingZone,
        capacity,
        currentOccupancy: 0,
        maleCount: 0,
        femaleCount: 0,
        assignedTeacherId: assignedUser?.id,
        assignedTeacherName: assignedUser?.name,
        status: 'active',
        currentScore: 95,
        morningAttendanceDone: false,
        eveningAttendanceDone: false,
        weekendDone: false,
        createdByType: 'admin',
        createdByUserName: creatorDisplayName,
        createdByRole: currentUser?.role || 'head_master',
        createdAt: new Date().toISOString().split('T')[0],
        equipment: equipList,
        roomNotes: roomNotes || `Phòng do ${userRoleTitle} tự thêm & quản lý`,
      });

      // If initial students provided by admin or head master
      if (initialStudentsText.trim().length > 0) {
        const lines = initialStudentsText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        if (lines.length > 0) {
          const newStudents: Omit<Student, 'id'>[] = lines.map(line => {
            const parts = line.split(/[,;\t]/).map(p => p.trim());
            const sName = parts[0] || 'Học sinh mới';
            const gender = parts[1] === 'Nữ' || parts[1] === 'nữ' ? 'Nữ' : buildingZone.includes('Nữ') ? 'Nữ' : 'Nam';
            const gClass = parts[2] || '6/1';
            const village = parts[3] || 'Thôn 1';
            const hamlet = parts[4] || 'Nóc Ông Tuân';
            return {
              fullName: sName,
              dateOfBirth: '2014-01-01',
              gender,
              gradeClass: gClass,
              village,
              hamletLeader: hamlet,
              parentName: parts[5] || '',
              parentPhone: parts[6] || '',
              roomId: newRoomId,
              roomNumber: roomNumber,
              teacherName: assignedUser?.name,
              boardingStatus: 'Đang ở nội trú',
              note: `${userRoleTitle} tự nhập khi tạo phòng`,
              entrySource: 'admin',
            };
          });
          importStudentsBatch(newStudents);
          setAlertMessage({
            type: 'success',
            text: `${userRoleTitle} đã tự thêm phòng ${roomNumber} (${name}) và tự nhập thêm ${newStudents.length} học sinh vào phòng!`,
          });
          setIsModalOpen(false);
          return;
        }
      }

      setAlertMessage({ type: 'success', text: `${userRoleTitle} đã tự thêm phòng ở học sinh ${roomNumber} (${name}) thành công!` });
    }
    setIsModalOpen(false);
  };

  const handleDeleteRoom = (room: Room) => {
    if (confirm(`Bạn có chắc chắn muốn xóa phòng ${room.roomNumber} (${room.name}) không?`)) {
      const ok = deleteRoom(room.id);
      if (ok) {
        setAlertMessage({ type: 'success', text: `Đã xóa phòng ${room.roomNumber}!` });
      }
    }
  };

  // Submit "Tự nhập số lượng phòng ở"
  const handleApplyRoomsCount = (e: React.FormEvent) => {
    e.preventDefault();
    const result = setTotalRoomsCount(Number(targetRoomsCount), Number(defaultRoomCapacity));
    if (result.success) {
      setAlertMessage({ type: 'success', text: result.message });
      setIsBatchCountModalOpen(false);
    } else {
      setAlertMessage({ type: 'error', text: result.message });
    }
  };

  // Submit "Tạo phòng hàng loạt theo khu"
  const handleBatchCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    batchCreateRooms(Number(batchCountInput), Number(batchStartNumber), Number(batchCapacity), batchZone);
    setAlertMessage({
      type: 'success',
      text: `Đã tạo thêm thành công ${batchCountInput} phòng mới cho ${batchZone}!`,
    });
    setIsCustomBatchModalOpen(false);
  };

  // Open "Tự nhập học sinh vào phòng ở"
  const handleOpenAddStudentToRoom = (room: Room) => {
    setSelectedRoomForStudent(room);
    setNewStudentName('');
    setNewStudentGender(room.buildingZone.includes('Nữ') ? 'Nữ' : 'Nam');
    setNewStudentClass('6/1');
    setNewStudentVillage('Thôn 1');
    setNewStudentHamlet('Nóc Ông Tuân');
    setNewStudentParent('');
    setNewStudentPhone('');
    setStudentBatchPaste('');
    setStudentInputMode('single');
    setIsAddStudentToRoomOpen(true);
  };

  // Open "Xem học sinh phòng ở"
  const handleOpenViewRoomStudents = (room: Room) => {
    setSelectedRoomForStudent(room);
    setIsViewRoomStudentsOpen(true);
  };

  // Submit Single Student into Room
  const handleSaveStudentToRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoomForStudent) return;

    if (selectedRoomForStudent.currentOccupancy >= selectedRoomForStudent.capacity) {
      if (!confirm(`Phòng ${selectedRoomForStudent.roomNumber} đã đủ sức chứa (${selectedRoomForStudent.capacity} em). Bạn vẫn muốn thêm học sinh này vào không?`)) {
        return;
      }
    }

    addStudent({
      fullName: newStudentName,
      dateOfBirth: '2014-01-01',
      gender: newStudentGender,
      gradeClass: newStudentClass,
      village: newStudentVillage,
      hamletLeader: newStudentHamlet,
      parentName: newStudentParent,
      parentPhone: newStudentPhone,
      roomId: selectedRoomForStudent.id,
      roomNumber: selectedRoomForStudent.roomNumber,
      teacherName: selectedRoomForStudent.assignedTeacherName,
      boardingStatus: 'Đang ở nội trú',
      note: 'Tự nhập trực tiếp tại phòng ở',
    });

    setAlertMessage({
      type: 'success',
      text: `Đã tự nhập thêm học sinh ${newStudentName} vào phòng ${selectedRoomForStudent.roomNumber} thành công!`,
    });
    setIsAddStudentToRoomOpen(false);
  };

  // Submit Batch Students into Room
  const handleSaveBatchStudentsToRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoomForStudent) return;

    const lines = studentBatchPaste
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0);

    if (lines.length === 0) {
      alert('Vui lòng nhập ít nhất một dòng tên học sinh!');
      return;
    }

    const availableSlots = selectedRoomForStudent.capacity - selectedRoomForStudent.currentOccupancy;
    if (lines.length > availableSlots && availableSlots > 0) {
      if (!confirm(`Phòng ${selectedRoomForStudent.roomNumber} chỉ còn trống ${availableSlots} chỗ, nhưng bạn đang nhập ${lines.length} học sinh. Bạn có muốn tiếp tục thêm không?`)) {
        return;
      }
    }

    const newItems: Omit<Student, 'id'>[] = lines.map(line => {
      const parts = line.split(/[,;\t]/).map(p => p.trim());
      const name = parts[0] || 'Học sinh mới';
      const gender = parts[1] === 'Nữ' || parts[1] === 'nữ' ? 'Nữ' : selectedRoomForStudent.buildingZone.includes('Nữ') ? 'Nữ' : 'Nam';
      const gClass = parts[2] || newStudentClass;
      const village = parts[3] || newStudentVillage;
      const hamlet = parts[4] || newStudentHamlet;
      const parent = parts[5] || '';
      const phone = parts[6] || '';

      return {
        fullName: name,
        dateOfBirth: '2014-01-01',
        gender,
        gradeClass: gClass,
        village,
        hamletLeader: hamlet,
        parentName: parent,
        parentPhone: phone,
        roomId: selectedRoomForStudent.id,
        roomNumber: selectedRoomForStudent.roomNumber,
        teacherName: selectedRoomForStudent.assignedTeacherName,
        boardingStatus: 'Đang ở nội trú',
        note: 'Tự nhập hàng loạt tại phòng ở',
      };
    });

    importStudentsBatch(newItems);
    setAlertMessage({
      type: 'success',
      text: `Đã tự nhập thêm thành công ${newItems.length} học sinh vào phòng ${selectedRoomForStudent.roomNumber}!`,
    });
    setIsAddStudentToRoomOpen(false);
  };

  // Students of currently viewed room
  const currentRoomStudents = useMemo(() => {
    if (!selectedRoomForStudent) return [];
    return students.filter(s => s.roomId === selectedRoomForStudent.id && s.boardingStatus === 'Đang ở nội trú');
  }, [selectedRoomForStudent, students]);

  const handleOpenTransferStudent = (st: Student) => {
    setSelectedStudentForTransfer(st);
    setTargetTransferRoomId(rooms.find(r => r.id !== st.roomId)?.id || '');
    setIsTransferModalOpen(true);
  };

  const handleExecuteTransfer = () => {
    if (selectedStudentForTransfer && targetTransferRoomId) {
      transferStudentRoom(selectedStudentForTransfer.id, targetTransferRoomId);
      setIsTransferModalOpen(false);
      setAlertMessage({
        type: 'success',
        text: `Đã chuyển học sinh ${selectedStudentForTransfer.fullName} sang phòng mới thành công!`,
      });
    }
  };

  const handleDeleteStudentFromRoom = (st: Student) => {
    if (confirm(`Bạn có chắc muốn xóa học sinh ${st.fullName} khỏi phòng ${st.roomNumber} không?`)) {
      deleteStudent(st.id);
      setAlertMessage({ type: 'success', text: `Đã xóa học sinh ${st.fullName} khỏi phòng!` });
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-black uppercase text-blue-700 tracking-wider mb-1 flex items-center gap-1.5">
            <Home className="w-4 h-4 text-blue-600" /> QUẢN LÝ PHÒNG Ở NỘI TRÚ
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            Hệ Thống Quản Lý Phòng Ở & Tự Nhập Học Sinh
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Trường PTDTBT THCS Xã Trà Đốc • Quy mô: <strong className="text-blue-800 font-bold">{rooms.length} phòng</strong> (Dưới 30 phòng, dưới 400 học sinh) • Do QTV tự thêm: <strong className="text-purple-700 font-bold">{adminRoomsCount} phòng</strong>
          </p>
        </div>

        {/* Global Action Bar with prominent manual room and student inputs */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Direct Add Student to Any Room Button */}
          <button
            onClick={() => handleOpenAddStudentToRoom(rooms[0])}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-md shadow-emerald-500/20 transition flex items-center gap-1.5"
            title="Tự nhập thêm học sinh trực tiếp vào phòng ở"
          >
            <UserPlus className="w-4 h-4" /> TỰ NHẬP HỌC SINH VÀO PHÒNG
          </button>

          {canManage && (
            <>
              {/* NHẬP THỦ CÔNG SỐ LƯỢNG PHÒNG Ở HỌC SINH */}
              <button
                onClick={() => {
                  setTargetRoomsCount(rooms.length);
                  setIsBatchCountModalOpen(true);
                }}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-md shadow-indigo-500/20 transition flex items-center gap-1.5"
                title="Tự nhập thủ công số lượng phòng ở học sinh mong muốn cho toàn trường"
              >
                <Sliders className="w-4 h-4" /> NHẬP THỦ CÔNG SỐ LƯỢNG PHÒNG Ở HỌC SINH
              </button>

              {/* TỰ THÊM PHÒNG Ở HỌC SINH CỦA TRƯỞNG BAN QL & QTV */}
              <button
                onClick={handleOpenAddModal}
                className="px-4 py-2.5 bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 hover:from-blue-800 hover:to-purple-800 text-white rounded-xl text-xs font-black shadow-md shadow-indigo-500/25 transition flex items-center gap-1.5"
                title="Trưởng ban Quản lý và Quản trị viên có quyền tự thêm phòng ở học sinh mới với cấu hình trang bị và phân công giáo viên"
              >
                <Plus className="w-4 h-4 text-amber-300" /> 👑 TRƯỞNG BAN QL & QTV TỰ THÊM PHÒNG Ở
              </button>
            </>
          )}
        </div>
      </div>

      {alertMessage && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold flex items-center justify-between shadow-xs animate-in fade-in ${
            alertMessage.type === 'success'
              ? 'bg-emerald-50 border border-emerald-300 text-emerald-800'
              : 'bg-rose-50 border border-rose-300 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {alertMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span>{alertMessage.text}</span>
          </div>
          <button onClick={() => setAlertMessage(null)} className="p-1 hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Trạng Thái & Nội Dung Quản Lý Phòng Ở: Trưởng Ban Quản Lý & Quản Trị Viên Tự Thêm Phòng Ở */}
      <div className="bg-gradient-to-r from-blue-50/90 via-indigo-50/80 to-purple-50/90 p-5 rounded-3xl border border-indigo-200 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-0.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-extrabold text-[10px] uppercase tracking-wide flex items-center gap-1">
                👑 Trưởng Ban Quản Lý & QTV
              </span>
              <span className="text-xs font-black text-slate-800">
                Trưởng ban Quản lý có quyền tự thêm phòng ở & tự nhập số lượng phòng ở học sinh
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
              Hệ thống đáp ứng chuẩn nội trú trường THCS Xã Trà Đốc: <strong>Tổng số phòng dưới 30 phòng</strong>, <strong>dưới 400 học sinh nội trú</strong>. <strong>Trưởng ban Quản lý Thầy Nguyễn Trọng Nghĩa</strong> và Ban quản trị có toàn quyền <strong>tự thêm phòng ở học sinh</strong> (từng phòng hoặc hàng loạt theo khu), trang bị tiện nghi, phân công giáo viên trực phòng và <strong>tự nhập trực tiếp học sinh vào từng phòng</strong>.
            </p>
          </div>

          {canManage && (
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                onClick={handleOpenAddModal}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-xl text-xs font-black shadow-xs transition flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5 text-amber-300" /> Tự thêm phòng ở ngay
              </button>
              <button
                onClick={() => {
                  setTargetRoomsCount(rooms.length);
                  setIsBatchCountModalOpen(true);
                }}
                className="px-3.5 py-2 bg-white hover:bg-slate-50 text-indigo-900 border border-indigo-200 rounded-xl text-xs font-black transition flex items-center gap-1.5"
              >
                <Sliders className="w-3.5 h-3.5 text-indigo-700" /> Nhập số lượng phòng ({rooms.length})
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Trạng Thái Quản Lý Phòng Ở & Học Sinh - KPI Dashboard */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">TỔNG SỐ PHÒNG</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{rooms.length} phòng</div>
          <div className="text-[11px] text-indigo-600 font-bold mt-0.5">Quy mô toàn trường</div>
        </div>

        <div className="bg-purple-50/80 p-4 rounded-2xl border border-purple-200">
          <div className="text-[11px] font-bold uppercase tracking-wider text-purple-900 flex items-center gap-1">
            <span>👑 DO TBQL / QTV THÊM</span>
          </div>
          <div className="text-2xl font-black text-purple-800 mt-1">{adminRoomsCount} phòng</div>
          <div className="text-[11px] text-purple-700 font-semibold mt-0.5">
            Tỷ lệ: {rooms.length > 0 ? Math.round((adminRoomsCount / rooms.length) * 100) : 0}% quy mô
          </div>
        </div>

        <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200">
          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">CÒN CHỖ TRỐNG</div>
          <div className="text-2xl font-black text-emerald-700 mt-1">{availableRoomsCount} phòng</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">Sẵn sàng tự nhập thêm HS</div>
        </div>

        <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200">
          <div className="text-[11px] font-bold uppercase tracking-wider text-amber-800">TỔNG SỨC CHỨA</div>
          <div className="text-2xl font-black text-amber-700 mt-1">{totalCapacity} em</div>
          <div className="text-[11px] text-amber-600 mt-0.5">Toàn bộ khu nội trú</div>
        </div>

        <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-200">
          <div className="text-[11px] font-bold uppercase tracking-wider text-blue-800">ĐÃ CÓ HỌC SINH</div>
          <div className="text-2xl font-black text-blue-700 mt-1">{totalOccupancy} em</div>
          <div className="text-[11px] text-blue-600 mt-0.5">
            Lấp đầy: {totalCapacity > 0 ? Math.round((totalOccupancy / totalCapacity) * 100) : 0}%
          </div>
        </div>

        <div className="bg-rose-50/70 p-4 rounded-2xl border border-rose-200">
          <div className="text-[11px] font-bold uppercase tracking-wider text-rose-800">PHÒNG ĐÃ ĐỦ</div>
          <div className="text-2xl font-black text-rose-700 mt-1">
            {fullRoomsCount} phòng
          </div>
          <div className="text-[11px] text-rose-600 mt-0.5">Còn thiếu: {Math.max(totalCapacity - totalOccupancy, 0)} chỗ</div>
        </div>
      </div>

      {/* Filter Toolbar: Filter by Occupancy Status & Khu */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setOccupancyFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              occupancyFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tất cả ({baseVisibleRooms.length})
          </button>
          <button
            onClick={() => setOccupancyFilter('available')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              occupancyFilter === 'available' ? 'bg-emerald-600 text-white shadow-xs' : 'text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            🟢 Còn chỗ tự nhập ({availableRoomsCount})
          </button>
          <button
            onClick={() => setOccupancyFilter('full')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              occupancyFilter === 'full' ? 'bg-rose-600 text-white shadow-xs' : 'text-rose-700 hover:bg-rose-50'
            }`}
          >
            🔴 Đã đầy sĩ số ({fullRoomsCount})
          </button>
          <button
            onClick={() => setOccupancyFilter('empty')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              occupancyFilter === 'empty' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-amber-800 hover:bg-amber-50'
            }`}
          >
            🟡 Phòng trống ({emptyRoomsCount})
          </button>
          <button
            onClick={() => setOccupancyFilter('admin')}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1 ${
              occupancyFilter === 'admin' ? 'bg-purple-700 text-white shadow-xs' : 'text-purple-700 hover:bg-purple-50'
            }`}
          >
            <span>👑 Do TBQL / QTV thêm ({adminRoomsCount})</span>
          </button>
        </div>

        {/* Zone & Search */}
        <div className="flex items-center gap-2">
          <select
            value={zoneFilter}
            onChange={e => setZoneFilter(e.target.value)}
            className="px-3 py-1.5 border border-slate-300 rounded-xl bg-white font-semibold"
          >
            <option value="all">Tất cả các khu</option>
            <option value="Khu A (Nam)">Khu A (Nam)</option>
            <option value="Khu B (Nữ)">Khu B (Nữ)</option>
            <option value="Khu C (Mới)">Khu C (Mới)</option>
          </select>

          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Tìm phòng, GV..."
            className="px-3 py-1.5 border border-slate-300 rounded-xl w-36 sm:w-48"
          />
        </div>
      </div>

      {/* Grid of Rooms with Direct "TỰ NHẬP HỌC SINH" Button */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {visibleRooms.map(room => {
          const roomStudents = students.filter(s => s.roomId === room.id && s.boardingStatus === 'Đang ở nội trú');
          const male = roomStudents.filter(s => s.gender === 'Nam').length;
          const female = roomStudents.filter(s => s.gender === 'Nữ').length;
          const emptySlots = Math.max(room.capacity - room.currentOccupancy, 0);
          const isFull = room.currentOccupancy >= room.capacity;
          const isEmpty = room.currentOccupancy === 0;

          // Status Badge for Student Occupancy
          let studentStatusBadge = (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold">
              <span>🟢 TRẠNG THÁI: Cho phép tự nhập thêm (Còn {emptySlots} chỗ)</span>
            </div>
          );

          if (isFull) {
            studentStatusBadge = (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 text-[11px] font-bold">
                <span>🔴 TRẠNG THÁI: Đã đủ sĩ số học sinh</span>
              </div>
            );
          } else if (isEmpty) {
            studentStatusBadge = (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 text-[11px] font-bold">
                <span>🟡 TRẠNG THÁI: Phòng trống (Sẵn sàng tự nhập)</span>
              </div>
            );
          }

          return (
            <div
              key={room.id}
              className={`rounded-3xl border transition p-5 shadow-xs bg-white flex flex-col justify-between ${
                room.status === 'locked'
                  ? 'border-slate-300 bg-slate-50/80 opacity-75'
                  : isFull
                  ? 'border-slate-200'
                  : 'border-slate-200 hover:border-emerald-300 hover:shadow-md'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-black text-slate-900">{room.roomNumber}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        room.status === 'active'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {room.status === 'active' ? 'Đang mở' : 'Đã khóa'}
                    </span>
                    {(room.createdByType === 'admin' ||
                      room.createdByRole === 'head_master' ||
                      (room.createdByUserName && (room.createdByUserName.includes('Quản trị') || room.createdByUserName.includes('Trưởng ban')))) && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-purple-100 text-purple-900 border border-purple-200 flex items-center gap-1">
                        👑 {room.createdByRole === 'head_master' || (room.createdByUserName && room.createdByUserName.includes('Trưởng ban')) ? 'Trưởng ban QL thêm' : 'QTV tự thêm'}
                      </span>
                    )}
                  </div>

                  <span className="text-xs font-black text-amber-600 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200/60 flex items-center gap-1">
                    <Trophy className="w-3.5 h-3.5 text-amber-500" /> {room.currentScore || 90}đ
                  </span>
                </div>

                {/* Room Name & Zone */}
                <h4 className="font-bold text-sm text-slate-800">{room.name}</h4>
                <div className="text-xs text-slate-500 mt-0.5 flex items-center justify-between">
                  <span>{room.buildingZone}</span>
                  {room.createdByUserName && (
                    <span className="text-[10px] text-purple-700 font-semibold truncate max-w-[130px]" title={room.createdByUserName}>
                      {room.createdByUserName.replace('Quản trị viên ', 'QTV ')}
                    </span>
                  )}
                </div>
                {room.equipment && room.equipment.length > 0 && (
                  <div className="mt-1.5 text-[10px] text-slate-500 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200/60 line-clamp-1 truncate flex items-center gap-1">
                    <Wrench className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{room.equipment.join(' • ')}</span>
                  </div>
                )}

                {/* Student Occupancy Status Badge */}
                <div className="mt-2.5">
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">
                    Trạng thái tự nhập thêm học sinh:
                  </div>
                  {studentStatusBadge}
                </div>

                {/* Occupancy Progress */}
                <div className="mt-3 p-3 bg-slate-50 rounded-2xl space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 font-medium">Sĩ số học sinh:</span>
                    <span className="font-bold text-slate-900">
                      {room.currentOccupancy} / {room.capacity} em
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isFull ? 'bg-rose-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min((room.currentOccupancy / room.capacity) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span>Nam: <strong className="text-slate-700">{male}</strong> | Nữ: <strong className="text-slate-700">{female}</strong></span>
                    <span>Còn trống: <strong className="text-emerald-700">{emptySlots} chỗ</strong></span>
                  </div>
                </div>

                {/* Assigned Teacher */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-600 truncate">
                    <UserCheck className="w-4 h-4 text-blue-600 shrink-0" />
                    <span className="truncate">GV: <strong className="text-slate-800">{room.assignedTeacherName || 'Chưa gán'}</strong></span>
                  </div>
                  <div className="text-[11px] shrink-0">
                    {room.eveningAttendanceDone ? (
                      <span className="text-emerald-600 font-bold">✓ Nộp tối</span>
                    ) : room.morningAttendanceDone ? (
                      <span className="text-amber-600 font-bold">⏳ Chờ tối</span>
                    ) : (
                      <span className="text-rose-600 font-bold">✗ Chưa nộp</span>
                    )}
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS: TỰ NHẬP HỌC SINH VÀO PHÒNG & XEM DANH SÁCH */}
              <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  {/* Button 1: Tự nhập học sinh vào phòng này */}
                  <button
                    onClick={() => handleOpenAddStudentToRoom(room)}
                    className="w-full py-2.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-xs transition flex items-center justify-center gap-1"
                    title="Tự nhập thêm học sinh trực tiếp vào phòng này"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>+ TỰ NHẬP HS</span>
                  </button>

                  {/* Button 2: Xem danh sách học sinh của phòng */}
                  <button
                    onClick={() => handleOpenViewRoomStudents(room)}
                    className="w-full py-2.5 px-2 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-xl text-xs font-black transition flex items-center justify-center gap-1"
                    title="Xem chi tiết danh sách học sinh của phòng này"
                  >
                    <Eye className="w-3.5 h-3.5 text-blue-600" />
                    <span>Xem HS ({room.currentOccupancy})</span>
                  </button>
                </div>

                {/* Admin & Headmaster Actions */}
                {canManage && (
                  <div className="flex items-center justify-end gap-1.5 pt-1 text-xs">
                    <button
                      onClick={() => toggleRoomLock(room.id)}
                      className="p-1 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 text-[11px] font-semibold flex items-center gap-1"
                      title={room.status === 'locked' ? 'Mở khóa phòng' : 'Khóa phòng'}
                    >
                      {room.status === 'locked' ? <Unlock className="w-3.5 h-3.5 text-emerald-600" /> : <Lock className="w-3.5 h-3.5 text-slate-400" />}
                    </button>
                    <button
                      onClick={() => handleOpenEditModal(room)}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg text-[11px] font-semibold flex items-center gap-1"
                      title="Chỉnh sửa phòng"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Sửa
                    </button>
                    <button
                      onClick={() => handleDeleteRoom(room)}
                      className="p-1 text-rose-600 hover:bg-rose-50 rounded-lg text-[11px] font-semibold flex items-center gap-1"
                      title="Xóa phòng"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Xóa
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {visibleRooms.length === 0 && (
        <div className="bg-white rounded-3xl p-12 text-center text-slate-400 border border-slate-200">
          Không có phòng nào khớp với bộ lọc trạng thái đã chọn.
        </div>
      )}

      {/* MODAL 1: TỰ NHẬP HỌC SINH TRỰC TIẾP VÀO PHÒNG Ở */}
      {isAddStudentToRoomOpen && selectedRoomForStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-emerald-600" /> Tự Nhập Học Sinh Vào {selectedRoomForStudent.roomNumber}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Phòng: <strong>{selectedRoomForStudent.name}</strong> • Hiện tại: <strong>{selectedRoomForStudent.currentOccupancy}/{selectedRoomForStudent.capacity} em</strong>
                </p>
              </div>
              <button onClick={() => setIsAddStudentToRoomOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Select Room change if needed */}
            <div className="mt-3 p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">Đổi phòng nhập nếu muốn:</span>
              <select
                value={selectedRoomForStudent.id}
                onChange={e => {
                  const target = rooms.find(r => r.id === e.target.value);
                  if (target) setSelectedRoomForStudent(target);
                }}
                className="px-3 py-1 border border-slate-300 rounded-xl bg-white font-bold text-slate-900"
              >
                {rooms.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.roomNumber} - {r.name} ({r.currentOccupancy}/{r.capacity} em)
                  </option>
                ))}
              </select>
            </div>

            {/* Input Mode Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl mt-3 text-xs font-bold">
              <button
                type="button"
                onClick={() => setStudentInputMode('single')}
                className={`flex-1 py-1.5 rounded-lg transition ${
                  studentInputMode === 'single' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Nhập từng học sinh
              </button>
              <button
                type="button"
                onClick={() => setStudentInputMode('batch')}
                className={`flex-1 py-1.5 rounded-lg transition ${
                  studentInputMode === 'batch' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Nhập nhanh nhiều em (Dán danh sách)
              </button>
            </div>

            {studentInputMode === 'single' ? (
              <form onSubmit={handleSaveStudentToRoom} className="space-y-3.5 mt-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Họ và tên học sinh *</label>
                  <input
                    type="text"
                    required
                    value={newStudentName}
                    onChange={e => setNewStudentName(e.target.value)}
                    placeholder="Ví dụ: Hồ Văn Sơn"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-semibold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Giới tính</label>
                    <select
                      value={newStudentGender}
                      onChange={e => setNewStudentGender(e.target.value as any)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white font-semibold"
                    >
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Lớp</label>
                    <input
                      type="text"
                      required
                      value={newStudentClass}
                      onChange={e => setNewStudentClass(e.target.value)}
                      placeholder="6/1, 7/1..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Thôn</label>
                    <input
                      type="text"
                      required
                      value={newStudentVillage}
                      onChange={e => setNewStudentVillage(e.target.value)}
                      placeholder="Thôn 1, Thôn 2..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Nóc ông/bà</label>
                    <input
                      type="text"
                      required
                      value={newStudentHamlet}
                      onChange={e => setNewStudentHamlet(e.target.value)}
                      placeholder="Nóc Ông Tuân..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Cha/mẹ (Con ông/bà)</label>
                    <input
                      type="text"
                      value={newStudentParent}
                      onChange={e => setNewStudentParent(e.target.value)}
                      placeholder="Họ tên cha hoặc mẹ"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Số điện thoại liên hệ</label>
                    <input
                      type="text"
                      value={newStudentPhone}
                      onChange={e => setNewStudentPhone(e.target.value)}
                      placeholder="098..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsAddStudentToRoomOpen(false)}
                    className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition"
                  >
                    Xác nhận thêm vào {selectedRoomForStudent.roomNumber}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSaveBatchStudentsToRoom} className="space-y-3.5 mt-4 text-xs">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 leading-relaxed text-[11px]">
                  Nhập hoặc dán danh sách học sinh vào ô bên dưới (mỗi em một dòng).
                  <br />Định dạng: <code>Họ và tên, Giới tính, Lớp, Thôn, Nóc, Cha mẹ, SĐT</code> (hoặc chỉ cần gõ tên mỗi em 1 dòng).
                </div>

                {/* Defaults */}
                <div className="grid grid-cols-3 gap-2.5 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Lớp mặc định</label>
                    <input
                      type="text"
                      value={newStudentClass}
                      onChange={e => setNewStudentClass(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-xl bg-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Thôn mặc định</label>
                    <input
                      type="text"
                      value={newStudentVillage}
                      onChange={e => setNewStudentVillage(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-xl bg-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Nóc ông/bà</label>
                    <input
                      type="text"
                      value={newStudentHamlet}
                      onChange={e => setNewStudentHamlet(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-xl bg-white font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Danh sách học sinh (Mỗi em 1 dòng) *
                  </label>
                  <textarea
                    rows={6}
                    required
                    value={studentBatchPaste}
                    onChange={e => setStudentBatchPaste(e.target.value)}
                    placeholder={`Ví dụ:\nHồ Văn Hải, Nam, 6/1, Thôn 1, Nóc Ông Tuân, Hồ Văn Đạt, 0983112233\nĐinh Văn Hoàng, Nam, 6/1, Thôn 2, Nóc Ông Reo\nTrần Văn Kiên\nLê Văn Tý`}
                    className="w-full font-mono text-xs px-3.5 py-2.5 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsAddStudentToRoomOpen(false)}
                    className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition flex items-center gap-1.5"
                  >
                    <UserPlus className="w-4 h-4" /> Xác nhận lưu vào {selectedRoomForStudent.roomNumber}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL 2: XEM DANH SÁCH HỌC SINH CỦA PHÒNG Ở */}
      {isViewRoomStudentsOpen && selectedRoomForStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" /> Danh Sách Học Sinh: {selectedRoomForStudent.roomNumber}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedRoomForStudent.name} • GV: {selectedRoomForStudent.assignedTeacherName || 'Chưa gán'} • Hiện có <strong>{currentRoomStudents.length}/{selectedRoomForStudent.capacity} em</strong>
                </p>
              </div>
              <button onClick={() => setIsViewRoomStudentsOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto my-4 space-y-2 pr-1 text-xs">
              {currentRoomStudents.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  Phòng này hiện tại chưa có học sinh nào.
                  <div className="mt-3">
                    <button
                      onClick={() => {
                        setIsViewRoomStudentsOpen(false);
                        handleOpenAddStudentToRoom(selectedRoomForStudent);
                      }}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold inline-flex items-center gap-1.5"
                    >
                      <UserPlus className="w-4 h-4" /> Tự nhập học sinh vào phòng này ngay
                    </button>
                  </div>
                </div>
              ) : (
                currentRoomStudents.map((st, idx) => (
                  <div
                    key={st.id}
                    className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center shrink-0 text-xs">
                        {idx + 1}
                      </span>
                      <div>
                        <div className="font-bold text-slate-900 flex items-center gap-2">
                          {st.fullName}
                          <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md font-semibold border border-blue-200/50">
                            {st.gradeClass}
                          </span>
                          <span className="text-[10px] text-slate-500">({st.gender})</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 flex flex-wrap gap-2">
                          <span>{st.village} ({st.hamletLeader})</span>
                          <span>• PH: {st.parentName} ({st.parentPhone})</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-auto">
                      <button
                        onClick={() => handleOpenTransferStudent(st)}
                        className="px-2.5 py-1 text-[11px] bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg font-bold flex items-center gap-1"
                        title="Chuyển sang phòng khác"
                      >
                        <ArrowRightLeft className="w-3 h-3" /> Đổi phòng
                      </button>
                      <button
                        onClick={() => handleDeleteStudentFromRoom(st)}
                        className="p-1 text-rose-600 hover:bg-rose-50 rounded-lg"
                        title="Xóa khỏi phòng"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => {
                  setIsViewRoomStudentsOpen(false);
                  handleOpenAddStudentToRoom(selectedRoomForStudent);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
              >
                <UserPlus className="w-4 h-4" /> Tự nhập thêm học sinh vào phòng này
              </button>

              <button
                type="button"
                onClick={() => setIsViewRoomStudentsOpen(false)}
                className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl text-xs"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: CHUYỂN PHÒNG HỌC SINH */}
      {isTransferModalOpen && selectedStudentForTransfer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <h3 className="font-extrabold text-slate-900 text-lg mb-2">Chuyển Phòng Học Sinh</h3>
            <p className="text-xs text-slate-600 mb-4">
              Chuyển em <strong>{selectedStudentForTransfer.fullName}</strong> từ phòng{' '}
              <span className="text-rose-600 font-bold">{selectedStudentForTransfer.roomNumber}</span> sang phòng mới:
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Chọn phòng mới</label>
                <select
                  value={targetTransferRoomId}
                  onChange={e => setTargetTransferRoomId(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-xl bg-white font-semibold"
                >
                  {rooms.map(r => (
                    <option key={r.id} value={r.id} disabled={r.id === selectedStudentForTransfer.roomId}>
                      {r.roomNumber} - {r.name} ({r.currentOccupancy}/{r.capacity} em)
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsTransferModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleExecuteTransfer}
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition"
                >
                  Xác nhận chuyển
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: NHẬP THỦ CÔNG SỐ LƯỢNG PHÒNG Ở HỌC SINH */}
      {isBatchCountModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-indigo-600" /> Nhập Thủ Công Số Lượng Phòng Ở Học Sinh
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tự nhập và điều chỉnh số lượng phòng ở cho trường PTDTBT THCS Xã Trà Đốc
                </p>
              </div>
              <button onClick={() => setIsBatchCountModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplyRoomsCount} className="space-y-4 mt-4 text-xs">
              <div className="p-3.5 bg-indigo-50 border border-indigo-200 rounded-2xl text-indigo-950 leading-relaxed space-y-1.5">
                <div className="font-black text-indigo-900 text-xs uppercase tracking-wide">
                  Quy chuẩn nội trú THCS Xã Trà Đốc:
                </div>
                <div className="text-xs text-indigo-900">
                  • Số lượng phòng hiện tại: <strong>{rooms.length} phòng</strong> (Quy mô: Dưới 30 phòng).
                </div>
                <div className="text-xs text-indigo-800">
                  • Bạn có thể tự nhập thủ công số lượng phòng mong muốn. Hệ thống sẽ tự động cập nhật và phân bổ danh sách phòng theo các khu nhà (Khu A Nam, Khu B Nữ, Khu C Mới).
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div>
                <label className="block font-black text-slate-700 mb-1.5">
                  Chọn nhanh số lượng phòng chuẩn:
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[10, 12, 15, 18, 20, 24, 28, 30].map(cnt => (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() => setTargetRoomsCount(cnt)}
                      className={`py-2 px-2 rounded-xl font-black text-xs transition border ${
                        targetRoomsCount === cnt
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-slate-50 hover:bg-indigo-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {cnt} phòng
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-black text-slate-700 mb-1">
                  Hoặc tự nhập thủ công số lượng phòng ở học sinh *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  max={50}
                  value={targetRoomsCount}
                  onChange={e => setTargetRoomsCount(Number(e.target.value))}
                  placeholder="Nhập số lượng phòng (ví dụ: 16, 20, 25, 30...)"
                  className="w-full text-base font-black px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Trường THCS Trà Đốc quy mô tối đa 30 phòng nội trú.
                </span>
              </div>

              <div>
                <label className="block font-black text-slate-700 mb-1">
                  Sức chứa tối đa mặc định mỗi phòng (Học sinh/phòng)
                </label>
                <input
                  type="number"
                  min={5}
                  max={40}
                  value={defaultRoomCapacity}
                  onChange={e => setDefaultRoomCapacity(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsBatchCountModalOpen(false)}
                  className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 font-black text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-500/20 transition flex items-center gap-1.5"
                >
                  <Sliders className="w-4 h-4" /> Xác nhận cập nhật số lượng phòng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: NỘI DUNG TỰ THÊM PHÒNG Ở HỌC SINH CỦA TRƯỞNG BAN QUẢN LÝ & QUẢN TRỊ VIÊN */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 max-h-[92vh] overflow-y-auto flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-xl bg-purple-100 text-purple-700">
                    <ShieldCheck className="w-5 h-5 text-purple-700" />
                  </span>
                  <h3 className="font-black text-slate-900 text-lg">
                    {editingRoom
                      ? `Sửa Thông Tin Phòng ${editingRoom.roomNumber}`
                      : 'Nội Dung Tự Thêm Phòng Ở Học Sinh Của Trưởng Ban Quản Lý & QTV'}
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Trưởng ban Quản lý Thầy Nguyễn Trọng Nghĩa & Quản trị viên tự thêm phòng ở học sinh, thiết lập trang bị và phân công giáo viên trực
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Tabs for Administrator and Headmaster (Only when creating new room) */}
            {!editingRoom && (
              <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-slate-100 rounded-2xl mt-4 text-xs font-black">
                <button
                  type="button"
                  onClick={() => setAdminAddRoomTab('single')}
                  className={`py-2 px-2 rounded-xl transition text-center flex items-center justify-center gap-1.5 ${
                    adminAddRoomTab === 'single'
                      ? 'bg-white text-purple-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5 text-purple-600" />
                  <span>Tự thêm từng phòng</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAdminAddRoomTab('batch')}
                  className={`py-2 px-2 rounded-xl transition text-center flex items-center justify-center gap-1.5 ${
                    adminAddRoomTab === 'batch'
                      ? 'bg-white text-purple-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Thêm hàng loạt theo khu</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAdminAddRoomTab('presets')}
                  className={`py-2 px-2 rounded-xl transition text-center flex items-center justify-center gap-1.5 ${
                    adminAddRoomTab === 'presets'
                      ? 'bg-white text-purple-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Mẫu chuẩn Trà Đốc</span>
                </button>
              </div>
            )}

            {/* TAB 1: TỰ THÊM TỪNG PHÒNG Ở HỌC SINH (HOẶC CHỈNH SỬA) */}
            {(editingRoom || adminAddRoomTab === 'single') && (
              <form onSubmit={handleSubmitRoom} className="space-y-4 mt-4 text-xs">
                <div className="p-3 bg-purple-50/80 border border-purple-200 rounded-2xl text-purple-950 flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
                  <div className="text-[11px] leading-relaxed">
                    <strong>Chế độ Trưởng ban Quản lý & QTV tự thêm:</strong> Phòng tạo mới sẽ tự động được ghi nhận quyền quản lý của <strong>{currentUser?.name || 'Trưởng ban Quản lý Nguyễn Trọng Nghĩa'} ({currentUser?.role === 'head_master' ? 'Trưởng ban Quản lý' : currentUser?.role === 'principal' ? 'Hiệu trưởng' : 'Quản trị viên'})</strong>, cấp phát số phòng và kết nối trực tiếp với danh sách điểm danh, chấm sao thi đua hàng tuần.
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-black text-slate-700 mb-1">
                      Số phòng (Mã phòng) *
                    </label>
                    <input
                      type="text"
                      required
                      value={roomNumber}
                      onChange={e => setRoomNumber(e.target.value)}
                      placeholder="Ví dụ: P.105, P.205"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl font-black text-slate-900 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-black text-slate-700 mb-1">
                      Sức chứa tối đa (Em) *
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={50}
                      value={capacity}
                      onChange={e => setCapacity(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-black text-slate-700 mb-1">
                    Tên phòng / Mục đích sử dụng *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Ví dụ: Phòng Nam Khối 6, Phòng Nữ Khối 8-9, Phòng Tự Quản Khối 9..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-black text-slate-700 mb-1">Khu nhà nội trú</label>
                    <select
                      value={buildingZone}
                      onChange={e => setBuildingZone(e.target.value as any)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white font-semibold"
                    >
                      <option value="Khu A (Nam)">Khu A (Nam)</option>
                      <option value="Khu B (Nữ)">Khu B (Nữ)</option>
                      <option value="Khu C (Mới)">Khu C (Mới)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-black text-slate-700 mb-1">
                      Giáo viên phụ trách trực phòng
                    </label>
                    <select
                      value={assignedTeacherId}
                      onChange={e => setAssignedTeacherId(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white font-semibold"
                    >
                      <option value="">-- Chưa phân công --</option>
                      {allUsers
                        .filter(u => u.status === 'active')
                        .map(u => (
                          <option key={u.id} value={u.id}>
                            {u.name} ({u.role})
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                {/* Trang thiết bị phòng ở */}
                <div>
                  <label className="block font-black text-slate-700 mb-1">
                    Trang thiết bị & cơ sở vật chất phòng ở
                  </label>
                  <input
                    type="text"
                    value={roomEquipment}
                    onChange={e => setRoomEquipment(e.target.value)}
                    placeholder="10 giường tầng sắt, Tủ đồ 20 ngăn, Đèn LED & quạt trần..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white font-medium text-slate-800"
                  />
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {['10 giường tầng sắt', 'Tủ đồ cá nhân 20 ngăn', 'Quạt trần & đèn LED', 'Bình nước nóng lạnh', 'Bàn học tự quản'].map(eq => (
                      <button
                        key={eq}
                        type="button"
                        onClick={() => {
                          if (!roomEquipment.includes(eq)) {
                            setRoomEquipment(prev => (prev ? `${prev}, ${eq}` : eq));
                          }
                        }}
                        className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                      >
                        + {eq}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Ghi chú quản trị viên */}
                <div>
                  <label className="block font-black text-slate-700 mb-1">
                    Ghi chú của Quản trị viên
                  </label>
                  <input
                    type="text"
                    value={roomNotes}
                    onChange={e => setRoomNotes(e.target.value)}
                    placeholder="Ví dụ: Phòng mới sơn sửa đầu năm học, ưu tiên học sinh thôn 3..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-slate-800"
                  />
                </div>

                {/* Tùy chọn tự nhập luôn học sinh khi tạo phòng mới */}
                {!editingRoom && (
                  <div className="pt-2 border-t border-slate-100">
                    <label className="block font-black text-slate-800 mb-1 flex items-center gap-1.5">
                      <UserPlus className="w-4 h-4 text-emerald-600" />
                      <span>Tự nhập luôn học sinh vào phòng này ngay khi tạo (Tùy chọn)</span>
                    </label>
                    <p className="text-[11px] text-slate-500 mb-1.5">
                      Nhập tên học sinh (mỗi em một dòng). Có thể nhập: <code>Họ và tên, Giới tính, Lớp, Thôn</code> hoặc chỉ cần gõ tên.
                    </p>
                    <textarea
                      rows={3}
                      value={initialStudentsText}
                      onChange={e => setInitialStudentsText(e.target.value)}
                      placeholder={`Ví dụ:\nHồ Văn Sơn, Nam, 6/1, Thôn 1\nĐinh Văn Hải, Nam, 6/1, Thôn 2`}
                      className="w-full font-mono text-xs px-3 py-2 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white"
                    />
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 font-black text-white bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 rounded-xl shadow-md shadow-purple-500/20 transition flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4 text-amber-300" />
                    <span>{editingRoom ? 'Lưu cập nhật phòng' : 'Xác nhận tạo phòng ở học sinh ngay'}</span>
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: QUẢN TRỊ VIÊN TỰ THÊM HÀNG LOẠT THEO KHU */}
            {!editingRoom && adminAddRoomTab === 'batch' && (
              <form onSubmit={handleBatchCreateSubmit} className="space-y-4 mt-4 text-xs">
                <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-2xl text-indigo-950 text-[11px] leading-relaxed">
                  <strong>Tự thêm hàng loạt:</strong> Cho phép quản trị viên khởi tạo nhanh một dãy phòng mới cho khu nhà (Khu A Nam, Khu B Nữ, Khu C Mới) theo quy cách chuẩn của trường THCS Xã Trà Đốc.
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-black text-slate-700 mb-1">
                      Số lượng phòng cần thêm *
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={15}
                      value={batchCountInput}
                      onChange={e => setBatchCountInput(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl font-black text-base bg-white"
                    />
                    <div className="flex gap-1 mt-1.5">
                      {[2, 3, 4, 6, 8].map(cnt => (
                        <button
                          key={cnt}
                          type="button"
                          onClick={() => setBatchCountInput(cnt)}
                          className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-indigo-100 text-slate-700 text-[10px] font-bold"
                        >
                          +{cnt} phòng
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block font-black text-slate-700 mb-1">
                      Số phòng bắt đầu (P...) *
                    </label>
                    <input
                      type="number"
                      required
                      min={101}
                      max={999}
                      value={batchStartNumber}
                      onChange={e => setBatchStartNumber(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl font-black text-base bg-white"
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      Ví dụ: 105 sẽ tạo P.105, P.106...
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-black text-slate-700 mb-1">Khu nhà áp dụng</label>
                    <select
                      value={batchZone}
                      onChange={e => setBatchZone(e.target.value as any)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white font-semibold"
                    >
                      <option value="Khu A (Nam)">Khu A (Nam)</option>
                      <option value="Khu B (Nữ)">Khu B (Nữ)</option>
                      <option value="Khu C (Mới)">Khu C (Mới)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-black text-slate-700 mb-1">
                      Sức chứa đồng bộ mỗi phòng (Em)
                    </label>
                    <input
                      type="number"
                      required
                      min={5}
                      max={40}
                      value={batchCapacity}
                      onChange={e => setBatchCapacity(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold bg-white"
                    />
                  </div>
                </div>

                {/* Preview */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="font-bold text-slate-700 mb-1 text-[11px]">
                    Xem trước danh sách {batchCountInput} phòng sắp tạo:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {Array.from({ length: Math.min(batchCountInput, 15) }).map((_, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-indigo-900 font-black text-xs shadow-2xs"
                      >
                        P.{batchStartNumber + i} ({batchZone.split(' ')[1] || batchZone})
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 font-black text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-500/20 transition flex items-center gap-1.5"
                  >
                    <Layers className="w-4 h-4" />
                    <span>Xác nhận tạo hàng loạt {batchCountInput} phòng</span>
                  </button>
                </div>
              </form>
            )}

            {/* TAB 3: MẪU PHÒNG CHUẨN NỘI TRÚ TRÀ ĐỐC */}
            {!editingRoom && adminAddRoomTab === 'presets' && (
              <div className="space-y-3 mt-4 text-xs">
                <p className="text-slate-600 text-xs">
                  Chọn một trong các mẫu phòng chuẩn dưới đây để quản trị viên tự thêm vào hệ thống chỉ với một chạm:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Preset 1 */}
                  <div className="p-4 rounded-2xl border border-slate-200 hover:border-blue-400 bg-white hover:bg-blue-50/40 transition flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-black text-blue-800">MẪU 1: PHÒNG NAM KHỐI 6-7</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-bold">Khu A</span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm">Phòng Nam Tiêu Chuẩn</h4>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Sức chứa: <strong>20 học sinh</strong> • 10 giường tầng sắt, tủ cá nhân 20 ngăn, đèn quạt trần đầy đủ.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        handleApplyPreset({
                          name: 'Phòng Nam Tiêu Chuẩn Khối 6-7',
                          zone: 'Khu A (Nam)',
                          capacity: 20,
                          equipment: '10 giường tầng sắt, Tủ đồ cá nhân 20 ngăn, Quạt trần & đèn LED',
                          notes: 'Phòng nam tiêu chuẩn trường PTDTBT THCS Xã Trà Đốc',
                        })
                      }
                      className="mt-3 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition flex items-center justify-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Áp dụng & Điền mẫu này
                    </button>
                  </div>

                  {/* Preset 2 */}
                  <div className="p-4 rounded-2xl border border-slate-200 hover:border-rose-400 bg-white hover:bg-rose-50/40 transition flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-black text-rose-800">MẪU 2: PHÒNG NỮ KHỐI 8-9</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 font-bold">Khu B</span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm">Phòng Nữ Tiêu Chuẩn</h4>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Sức chứa: <strong>20 học sinh</strong> • 10 giường tầng sắt, tủ cá nhân, đèn học chống cận, gương soi.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        handleApplyPreset({
                          name: 'Phòng Nữ Tiêu Chuẩn Khối 8-9',
                          zone: 'Khu B (Nữ)',
                          capacity: 20,
                          equipment: '10 giường tầng sắt, Tủ đồ cá nhân 20 ngăn, Đèn học chống cận, Quạt trần',
                          notes: 'Phòng nữ tiêu chuẩn khu B trường Trà Đốc',
                        })
                      }
                      className="mt-3 w-full py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition flex items-center justify-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Áp dụng & Điền mẫu này
                    </button>
                  </div>

                  {/* Preset 3 */}
                  <div className="p-4 rounded-2xl border border-slate-200 hover:border-emerald-400 bg-white hover:bg-emerald-50/40 transition flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-black text-emerald-800">MẪU 3: PHÒNG MỚI KHANG TRANG</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold">Khu C Mới</span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm">Phòng Khu C Mới</h4>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Sức chứa: <strong>15 học sinh</strong> • Giường tầng mới 100%, tủ locker, bình nước nóng lạnh.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        handleApplyPreset({
                          name: 'Phòng Nội Trú Khang Trang Khu C',
                          zone: 'Khu C (Mới)',
                          capacity: 15,
                          equipment: '8 giường tầng mới 100%, Tủ locker cá nhân, Bình nước nóng lạnh',
                          notes: 'Dãy nhà nội trú mới khang trang đưa vào sử dụng',
                        })
                      }
                      className="mt-3 w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition flex items-center justify-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Áp dụng & Điền mẫu này
                    </button>
                  </div>

                  {/* Preset 4 */}
                  <div className="p-4 rounded-2xl border border-slate-200 hover:border-purple-400 bg-white hover:bg-purple-50/40 transition flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-black text-purple-800">MẪU 4: PHÒNG TỰ QUẢN / HSG</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 font-bold">Tự Quản</span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm">Phòng Khối 9 Tự Quản</h4>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Sức chứa: <strong>12 học sinh</strong> • Bàn học tập đôi, đèn học LED cá nhân, giá sách tự quản.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        handleApplyPreset({
                          name: 'Phòng Tự Quản Học Sinh Giỏi Khối 9',
                          zone: 'Khu C (Mới)',
                          capacity: 12,
                          equipment: '6 giường tầng, Bàn học tập đôi, Đèn LED học tập, Giá sách tự quản',
                          notes: 'Phòng bồi dưỡng học sinh giỏi và ôn thi lớp 10',
                        })
                      }
                      className="mt-3 w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition flex items-center justify-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Áp dụng & Điền mẫu này
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-end pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
