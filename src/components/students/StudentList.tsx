import React, { useState, useMemo, useRef } from 'react';
import {
  Users,
  Plus,
  Search,
  Filter,
  FileSpreadsheet,
  Edit2,
  Trash2,
  ArrowRightLeft,
  Phone,
  MapPin,
  Calendar,
  X,
  Upload,
  Download,
  CheckCircle2,
  Eye,
  UserPlus,
  UserCheck,
  Sparkles,
  ClipboardList,
  AlertCircle
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Student } from '../../types';

export const StudentList: React.FC = () => {
  const { students, rooms, addStudent, updateStudent, deleteStudent, transferStudentRoom, importStudentsBatch } = useData();
  const { canManageSystem, isTeacherOnly, assignedRoomId, currentUser } = useAuth();

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClass, setFilterClass] = useState('all');
  const [filterRoom, setFilterRoom] = useState(isTeacherOnly && assignedRoomId ? assignedRoomId : 'all');
  const [filterVillage, setFilterVillage] = useState('all');
  const [filterGender, setFilterGender] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSource, setFilterSource] = useState<'all' | 'teacher' | 'admin'>('all');

  // Modals
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [isQuickTeacherInputOpen, setIsQuickTeacherInputOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [targetTransferRoomId, setTargetTransferRoomId] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state for single student (Admin / standard)
  const [formData, setFormData] = useState<Partial<Student>>({
    fullName: '',
    dateOfBirth: '2014-01-01',
    gender: 'Nam',
    gradeClass: '6/1',
    village: 'Thôn 1',
    hamletLeader: 'Nóc Ông Tuân',
    parentName: '',
    parentPhone: '',
    roomId: isTeacherOnly && assignedRoomId ? assignedRoomId : (rooms[0]?.id || ''),
    boardingStatus: 'Đang ở nội trú',
    note: '',
  });

  // Teacher input modal states: mode tabs, target room & fields
  const [teacherModalTab, setTeacherModalTab] = useState<'batch' | 'single'>('batch');
  const [teacherTargetRoomId, setTeacherTargetRoomId] = useState<string>(
    isTeacherOnly && assignedRoomId ? assignedRoomId : (rooms[0]?.id || '')
  );
  const [quickPasteText, setQuickPasteText] = useState('');
  const [quickDefaultClass, setQuickDefaultClass] = useState('6/1');
  const [quickDefaultVillage, setQuickDefaultVillage] = useState('Thôn 1');
  const [quickDefaultHamlet, setQuickDefaultHamlet] = useState('Nóc Ông Tuân');

  // Teacher single form fields
  const [teacherSingleName, setTeacherSingleName] = useState('');
  const [teacherSingleDob, setTeacherSingleDob] = useState('2014-01-01');
  const [teacherSingleGender, setTeacherSingleGender] = useState<'Nam' | 'Nữ'>('Nam');
  const [teacherSingleClass, setTeacherSingleClass] = useState('6/1');
  const [teacherSingleVillage, setTeacherSingleVillage] = useState('Thôn 1');
  const [teacherSingleHamlet, setTeacherSingleHamlet] = useState('Nóc Ông Tuân');
  const [teacherSingleParent, setTeacherSingleParent] = useState('');
  const [teacherSinglePhone, setTeacherSinglePhone] = useState('');
  const [teacherSingleNote, setTeacherSingleNote] = useState('Giáo viên trực phòng tự nhập');

  const assignedRoom = rooms.find(r => r.id === assignedRoomId);

  // Can current user edit or add student
  const canUserOperateOnStudent = (student?: Student) => {
    if (canManageSystem) return true;
    if (isTeacherOnly && assignedRoomId) {
      if (!student) return true; // Can add to their room
      return student.roomId === assignedRoomId; // Can edit their own room's students
    }
    return false;
  };

  // Classify students by input source
  const teacherEnteredStudents = useMemo(() => {
    return students.filter(
      s => s.entrySource === 'teacher' || (s.note && (s.note.includes('trực phòng') || s.note.includes('tự nhập')))
    );
  }, [students]);

  const adminEnteredStudents = useMemo(() => {
    return students.filter(s => !teacherEnteredStudents.some(ts => ts.id === s.id));
  }, [students, teacherEnteredStudents]);

  const roomsWithTeacherInputCount = useMemo(() => {
    const rIds = new Set(teacherEnteredStudents.filter(s => s.boardingStatus === 'Đang ở nội trú').map(s => s.roomId));
    return rIds.size;
  }, [teacherEnteredStudents]);

  // Extract unique villages & classes
  const uniqueVillages = useMemo(() => {
    return Array.from(new Set(students.map(s => s.village).filter(Boolean)));
  }, [students]);

  const uniqueClasses = useMemo(() => {
    return Array.from(new Set(students.map(s => s.gradeClass).filter(Boolean))).sort();
  }, [students]);

  // Filtered List
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      if (isTeacherOnly && assignedRoomId && s.roomId !== assignedRoomId) return false;
      if (filterRoom !== 'all' && s.roomId !== filterRoom) return false;
      if (filterClass !== 'all' && s.gradeClass !== filterClass) return false;
      if (filterVillage !== 'all' && s.village !== filterVillage) return false;
      if (filterGender !== 'all' && s.gender !== filterGender) return false;
      if (filterStatus !== 'all' && s.boardingStatus !== filterStatus) return false;

      // Filter by source: teacher self input vs admin
      if (filterSource === 'teacher' && !teacherEnteredStudents.some(ts => ts.id === s.id)) return false;
      if (filterSource === 'admin' && teacherEnteredStudents.some(ts => ts.id === s.id)) return false;

      if (searchQuery) {
        const q = searchQuery.toLowerCase().trim();
        return (
          s.fullName.toLowerCase().includes(q) ||
          s.gradeClass.toLowerCase().includes(q) ||
          s.roomNumber.toLowerCase().includes(q) ||
          s.village.toLowerCase().includes(q) ||
          s.hamletLeader.toLowerCase().includes(q) ||
          s.parentName.toLowerCase().includes(q) ||
          s.parentPhone.includes(q)
        );
      }
      return true;
    });
  }, [students, isTeacherOnly, assignedRoomId, filterRoom, filterClass, filterVillage, filterGender, filterStatus, filterSource, teacherEnteredStudents, searchQuery]);

  const handleOpenAdd = () => {
    setSelectedStudent(null);
    setFormData({
      fullName: '',
      dateOfBirth: '2014-05-10',
      gender: 'Nam',
      gradeClass: '6/1',
      village: 'Thôn 1',
      hamletLeader: 'Nóc Ông Tuân',
      parentName: '',
      parentPhone: '098',
      roomId: isTeacherOnly && assignedRoomId ? assignedRoomId : (rooms[0]?.id || ''),
      boardingStatus: 'Đang ở nội trú',
      note: '',
    });
    setIsAddEditModalOpen(true);
  };

  const handleOpenEdit = (student: Student) => {
    setSelectedStudent(student);
    setFormData({ ...student });
    setIsAddEditModalOpen(true);
  };

  const handleOpenTransfer = (student: Student) => {
    setSelectedStudent(student);
    setTargetTransferRoomId(rooms.find(r => r.id !== student.roomId)?.id || '');
    setIsTransferModalOpen(true);
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    const targetRoomId = isTeacherOnly && assignedRoomId ? assignedRoomId : (formData.roomId || rooms[0]?.id);
    const targetRoom = rooms.find(r => r.id === targetRoomId);

    if (selectedStudent) {
      updateStudent({
        ...selectedStudent,
        ...(formData as Student),
        roomId: targetRoomId,
        roomNumber: targetRoom ? targetRoom.roomNumber : selectedStudent.roomNumber,
        teacherName: targetRoom ? targetRoom.assignedTeacherName : selectedStudent.teacherName,
        entrySource: selectedStudent.entrySource || (isTeacherOnly ? 'teacher' : 'admin'),
      });
      setToastMessage(`Đã cập nhật hồ sơ học sinh ${formData.fullName} thành công!`);
    } else {
      addStudent({
        fullName: formData.fullName || '',
        dateOfBirth: formData.dateOfBirth || '',
        gender: formData.gender as any,
        gradeClass: formData.gradeClass || '',
        village: formData.village || '',
        hamletLeader: formData.hamletLeader || '',
        parentName: formData.parentName || '',
        parentPhone: formData.parentPhone || '',
        roomId: targetRoom?.id || '',
        roomNumber: targetRoom?.roomNumber || '',
        teacherName: targetRoom?.assignedTeacherName,
        boardingStatus: formData.boardingStatus as any || 'Đang ở nội trú',
        note: formData.note || (isTeacherOnly ? 'Giáo viên trực phòng tự nhập' : 'Hồ sơ tuyển sinh'),
        entrySource: isTeacherOnly ? 'teacher' : 'admin',
      });
      setToastMessage(`Đã thêm học sinh ${formData.fullName} vào phòng ${targetRoom?.roomNumber}!`);
    }
    setIsAddEditModalOpen(false);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleExecuteTransfer = () => {
    if (selectedStudent && targetTransferRoomId) {
      transferStudentRoom(selectedStudent.id, targetTransferRoomId);
      setIsTransferModalOpen(false);
      setToastMessage(`Đã chuyển học sinh ${selectedStudent.fullName} sang phòng mới thành công!`);
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handleDelete = (student: Student) => {
    if (confirm(`Bạn có chắc muốn xóa hồ sơ học sinh ${student.fullName} không?`)) {
      deleteStudent(student.id);
      setToastMessage(`Đã xóa học sinh ${student.fullName}!`);
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  // Submit single student for teacher
  const handleTeacherSingleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetRoomId = isTeacherOnly && assignedRoomId ? assignedRoomId : (teacherTargetRoomId || rooms[0]?.id);
    const targetRoom = rooms.find(r => r.id === targetRoomId);
    if (!targetRoom) return;

    if (targetRoom.currentOccupancy >= targetRoom.capacity) {
      if (!confirm(`Phòng ${targetRoom.roomNumber} đã đủ ${targetRoom.capacity} em. Bạn có chắc muốn tiếp tục thêm?`)) {
        return;
      }
    }

    addStudent({
      fullName: teacherSingleName,
      dateOfBirth: teacherSingleDob || '2014-01-01',
      gender: teacherSingleGender,
      gradeClass: teacherSingleClass,
      village: teacherSingleVillage,
      hamletLeader: teacherSingleHamlet,
      parentName: teacherSingleParent,
      parentPhone: teacherSinglePhone,
      roomId: targetRoom.id,
      roomNumber: targetRoom.roomNumber,
      teacherName: targetRoom.assignedTeacherName,
      boardingStatus: 'Đang ở nội trú',
      note: teacherSingleNote || 'Giáo viên trực phòng tự nhập',
      entrySource: 'teacher',
    });

    setToastMessage(`Đã thêm thành công học sinh ${teacherSingleName} vào phòng ${targetRoom.roomNumber}!`);
    setTeacherSingleName('');
    setTeacherSingleParent('');
    setTeacherSinglePhone('');
    setIsQuickTeacherInputOpen(false);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Submit quick batch students for teacher
  const handleQuickTeacherBatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetRoomId = isTeacherOnly && assignedRoomId ? assignedRoomId : (teacherTargetRoomId || rooms[0]?.id);
    const targetRoom = rooms.find(r => r.id === targetRoomId) || (isTeacherOnly && assignedRoom ? assignedRoom : rooms[0]);

    const lines = quickPasteText
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0);

    if (lines.length === 0) {
      alert('Vui lòng nhập danh sách họ tên học sinh!');
      return;
    }

    const newItems: Omit<Student, 'id'>[] = lines.map(line => {
      // Check if comma-separated: Name, Gender, Class, Village, Hamlet, Parent, Phone
      const parts = line.split(/[,;\t]/).map(p => p.trim());
      const name = parts[0] || 'Học sinh mới';
      const gender = parts[1] === 'Nữ' || parts[1] === 'nữ' ? 'Nữ' : 'Nam';
      const gClass = parts[2] || quickDefaultClass;
      const village = parts[3] || quickDefaultVillage;
      const hamlet = parts[4] || quickDefaultHamlet;
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
        roomId: targetRoom.id,
        roomNumber: targetRoom.roomNumber,
        teacherName: targetRoom.assignedTeacherName,
        boardingStatus: 'Đang ở nội trú',
        note: `Giáo viên trực phòng tự nhập`,
        entrySource: 'teacher',
      };
    });

    importStudentsBatch(newItems);
    setToastMessage(`Đã thêm thành công ${newItems.length} học sinh vào phòng ${targetRoom.roomNumber}!`);
    setIsQuickTeacherInputOpen(false);
    setQuickPasteText('');
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Excel Template Download
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        'Họ và tên': 'Hồ Văn Tân',
        'Ngày sinh': '2014-05-15',
        'Giới tính': 'Nam',
        'Lớp': '6/1',
        'Thôn': 'Thôn 1',
        'Nóc ông/bà': 'Nóc Ông Tuân',
        'Cha mẹ (Con ông/bà)': 'Hồ Văn Sơn',
        'Số điện thoại': '0983112233',
        'Phòng': isTeacherOnly && assignedRoom ? assignedRoom.roomNumber : 'P.101',
        'Trạng thái': 'Đang ở nội trú',
        'Ghi chú': 'Học sinh ngoan',
      },
      {
        'Họ và tên': 'Đinh Thị Loan',
        'Ngày sinh': '2014-08-20',
        'Giới tính': 'Nữ',
        'Lớp': '6/2',
        'Thôn': 'Thôn 2',
        'Nóc ông/bà': 'Nóc Ông Reo',
        'Cha mẹ (Con ông/bà)': 'Đinh Văn Nam',
        'Số điện thoại': '0978112244',
        'Phòng': isTeacherOnly && assignedRoom ? assignedRoom.roomNumber : 'P.201',
        'Trạng thái': 'Đang ở nội trú',
        'Ghi chú': '',
      },
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Mau_Nhap_Hoc_Sinh');
    XLSX.writeFile(wb, 'Mau_Nhap_Hoc_Sinh_Tra_Doc.xlsx');
  };

  // Excel File Upload & Parse
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = evt => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsName = wb.SheetNames[0];
        const ws = wb.Sheets[wsName];
        const rows = XLSX.utils.sheet_to_json<any>(ws);

        if (rows && rows.length > 0) {
          const mappedStudents: Omit<Student, 'id'>[] = rows.map(r => {
            const roomNum = isTeacherOnly && assignedRoom ? assignedRoom.roomNumber : (r['Phòng'] || 'P.101');
            const matchedRoom = rooms.find(rm => rm.roomNumber === roomNum) || (isTeacherOnly && assignedRoom ? assignedRoom : rooms[0]);

            return {
              fullName: r['Họ và tên'] || r['Họ tên'] || 'Học sinh mới',
              dateOfBirth: r['Ngày sinh'] || '2014-01-01',
              gender: r['Giới tính'] === 'Nữ' ? 'Nữ' : 'Nam',
              gradeClass: r['Lớp'] || '6/1',
              village: r['Thôn'] || 'Thôn 1',
              hamletLeader: r['Nóc ông/bà'] || r['Nóc'] || 'Nóc Ông Tuân',
              parentName: r['Cha mẹ (Con ông/bà)'] || r['Cha mẹ'] || '',
              parentPhone: String(r['Số điện thoại'] || r['SĐT'] || ''),
              roomId: matchedRoom.id,
              roomNumber: matchedRoom.roomNumber,
              teacherName: matchedRoom.assignedTeacherName,
              boardingStatus: (r['Trạng thái'] as any) || 'Đang ở nội trú',
              note: r['Ghi chú'] || '',
            };
          });

          importStudentsBatch(mappedStudents);
          setToastMessage(`Đã nhập thành công ${mappedStudents.length} học sinh từ file Excel!`);
          setIsImportModalOpen(false);
          setTimeout(() => setToastMessage(null), 3000);
        }
      } catch (err) {
        alert('Có lỗi khi đọc file Excel. Vui lòng kiểm tra định dạng file!');
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-black uppercase text-blue-700 tracking-wider mb-1 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-blue-600" /> QUẢN LÝ HỌC SINH NỘI TRÚ
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            Quản Lý Hồ Sơ Học Sinh & Tự Nhập Của Giáo Viên Trực Phòng
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Trường PTDTBT THCS Xã Trà Đốc • Quy mô hiện tại: <strong className="text-blue-800 font-bold">{students.length} học sinh</strong> (Dưới 400 em, dưới 30 phòng)
          </p>
        </div>

        {/* Action Buttons for Teacher & Admin */}
        <div className="flex flex-wrap items-center gap-2">
          {/* TỰ NHẬP HỌC SINH CỦA GIÁO VIÊN TRỰC PHÒNG */}
          <button
            onClick={() => {
              if (isTeacherOnly && assignedRoomId) {
                setTeacherTargetRoomId(assignedRoomId);
              }
              setIsQuickTeacherInputOpen(true);
            }}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-md shadow-emerald-500/20 transition flex items-center gap-1.5"
            title="Giáo viên trực phòng tự nhập danh sách học sinh phòng mình"
          >
            <UserPlus className="w-4 h-4" /> TỰ NHẬP HỌC SINH CỦA GIÁO VIÊN TRỰC PHÒNG
          </button>

          <button
            onClick={() => setIsImportModalOpen(true)}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-slate-200"
          >
            <Upload className="w-4 h-4 text-slate-600" /> Nhập Excel
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-md shadow-blue-500/20 transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Thêm từng em
          </button>
        </div>
      </div>

      {/* Trạng Thái Quản Lý Học Sinh: Tự Nhập Học Sinh Của Giáo Viên Trực Phòng */}
      <div className="bg-gradient-to-r from-emerald-50/90 via-teal-50/70 to-blue-50/90 p-4 sm:p-5 rounded-3xl border border-emerald-200 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white font-extrabold text-[10px] uppercase tracking-wide">
                Trạng Thái Quản Lý Học Sinh
              </span>
              <span className="text-xs font-black text-slate-800">
                Tự nhập học sinh của giáo viên trực phòng
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
              Phân quyền theo quy chế nội trú: <strong>Giáo viên trực phòng</strong> có toàn quyền <strong>tự nhập, cập nhật và quản lý học sinh thuộc phòng mình phụ trách</strong> (dưới 400 học sinh toàn trường). Ban giám hiệu và Trưởng ban Nguyễn Trọng Nghĩa theo dõi dữ liệu tổng hợp.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                if (isTeacherOnly && assignedRoomId) {
                  setTeacherTargetRoomId(assignedRoomId);
                }
                setIsQuickTeacherInputOpen(true);
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-sm transition flex items-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" /> Bắt đầu tự nhập ngay
            </button>
          </div>
        </div>
      </div>

      {/* Trạng Thái Quản Lý Học Sinh - KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">TỔNG SỐ HỌC SINH</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{students.length} em</div>
          <div className="text-[11px] text-blue-600 font-semibold mt-0.5">Quy mô: Dưới 400 em</div>
        </div>

        <div className="bg-emerald-50/80 p-4 rounded-2xl border border-emerald-200">
          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">GV TRỰC PHÒNG TỰ NHẬP</div>
          <div className="text-2xl font-black text-emerald-700 mt-1">{teacherEnteredStudents.length} em</div>
          <div className="text-[11px] text-emerald-600 font-bold mt-0.5">
            Chiếm {Math.round((teacherEnteredStudents.length / Math.max(students.length, 1)) * 100)}% tổng số em
          </div>
        </div>

        <div className="bg-blue-50/80 p-4 rounded-2xl border border-blue-200">
          <div className="text-[11px] font-bold uppercase tracking-wider text-blue-800">BQL / TUYỂN SINH NHẬP</div>
          <div className="text-2xl font-black text-blue-700 mt-1">{adminEnteredStudents.length} em</div>
          <div className="text-[11px] text-blue-600 mt-0.5">Nhập từ file Excel / hồ sơ</div>
        </div>

        <div className="bg-indigo-50/80 p-4 rounded-2xl border border-indigo-200">
          <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-800">PHÒNG ĐÃ CÓ HỌC SINH</div>
          <div className="text-2xl font-black text-indigo-700 mt-1">
            {roomsWithTeacherInputCount}/{rooms.length} phòng
          </div>
          <div className="text-[11px] text-indigo-600 mt-0.5">GV đã tự nhập danh sách</div>
        </div>
      </div>

      {/* Teacher Status Bar for Room */}
      {isTeacherOnly && assignedRoom && (
        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/90 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
              {assignedRoom.roomNumber}
            </span>
            <div>
              <div className="font-extrabold text-blue-950 text-sm">{assignedRoom.name} - Giáo viên: {currentUser.name}</div>
              <div className="text-slate-600 mt-0.5">
                Khu: <strong>{assignedRoom.buildingZone}</strong> • Sĩ số: <strong>{filteredStudents.length}</strong> / {assignedRoom.capacity} em
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setTeacherTargetRoomId(assignedRoom.id);
                setIsQuickTeacherInputOpen(true);
              }}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition flex items-center gap-1.5 shadow-xs"
            >
              <UserPlus className="w-3.5 h-3.5" /> Tự nhập học sinh phòng tôi
            </button>
          </div>
        </div>
      )}

      {toastMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {toastMessage}
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
        {/* Source Filter Tabs: Tất cả vs GV trực phòng tự nhập vs BQL */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 text-xs">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setFilterSource('all')}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                filterSource === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tất cả học sinh ({students.length})
            </button>
            <button
              onClick={() => setFilterSource('teacher')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                filterSource === 'teacher' ? 'bg-emerald-600 text-white shadow-xs' : 'text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" /> Do GV trực phòng tự nhập ({teacherEnteredStudents.length})
            </button>
            <button
              onClick={() => setFilterSource('admin')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                filterSource === 'admin' ? 'bg-blue-600 text-white shadow-xs' : 'text-blue-700 hover:bg-blue-50'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" /> Do BQL / Tuyển sinh ({adminEnteredStudents.length})
            </button>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Hiển thị <strong>{filteredStudents.length}</strong> học sinh
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Search Box */}
          <div className="lg:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">Tìm kiếm</label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Tên học sinh, SĐT, nóc..."
                className="w-full text-xs pl-9 pr-3 py-2 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          {/* Filter Class */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Lớp</label>
            <select
              value={filterClass}
              onChange={e => setFilterClass(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl bg-white font-semibold"
            >
              <option value="all">Tất cả lớp</option>
              {uniqueClasses.map(c => (
                <option key={c} value={c}>
                  Lớp {c}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Room */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Phòng ở</label>
            <select
              value={filterRoom}
              onChange={e => setFilterRoom(e.target.value)}
              disabled={isTeacherOnly}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl bg-white font-semibold"
            >
              <option value="all">Tất cả phòng</option>
              {rooms.map(r => (
                <option key={r.id} value={r.id}>
                  {r.roomNumber} - {r.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Village */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Thôn</label>
            <select
              value={filterVillage}
              onChange={e => setFilterVillage(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl bg-white font-semibold"
            >
              <option value="all">Tất cả thôn</option>
              {uniqueVillages.map(v => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Gender */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Giới tính</label>
            <select
              value={filterGender}
              onChange={e => setFilterGender(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl bg-white font-semibold"
            >
              <option value="all">Tất cả</option>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
          <span>
            Tìm thấy <strong>{filteredStudents.length}</strong> học sinh
          </span>
          {(searchQuery || filterClass !== 'all' || filterRoom !== 'all' || filterVillage !== 'all' || filterGender !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterClass('all');
                setFilterRoom(isTeacherOnly && assignedRoomId ? assignedRoomId : 'all');
                setFilterVillage('all');
                setFilterGender('all');
              }}
              className="text-blue-600 font-bold hover:underline"
            >
              Xóa bộ lọc
            </button>
          )}
        </div>
      </div>

      {/* Main Student Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-extrabold uppercase tracking-wider text-slate-600">
                <th className="py-3.5 px-3 text-center w-12">STT</th>
                <th className="py-3.5 px-3">Họ và tên</th>
                <th className="py-3.5 px-3 text-center">Giới tính</th>
                <th className="py-3.5 px-3 text-center">Lớp</th>
                <th className="py-3.5 px-3">Phòng ở</th>
                <th className="py-3.5 px-3">Thôn / Nóc</th>
                <th className="py-3.5 px-3">Phụ huynh (SĐT)</th>
                <th className="py-3.5 px-3">Trạng thái</th>
                <th className="py-3.5 px-3 text-center w-28">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredStudents.map((st, idx) => {
                const canOperate = canUserOperateOnStudent(st);
                const isTeacherSource = st.entrySource === 'teacher' || (st.note && (st.note.includes('trực phòng') || st.note.includes('tự nhập')));
                return (
                  <tr key={st.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-3 text-center font-bold text-slate-400">{idx + 1}</td>
                    <td className="py-3 px-3">
                      <div className="font-extrabold text-slate-900 text-sm">{st.fullName}</div>
                      <div className="text-[11px] text-slate-400">Sinh ngày: {st.dateOfBirth}</div>
                      <div className="mt-1">
                        {isTeacherSource ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-300">
                            <UserCheck className="w-3 h-3 text-emerald-700" /> GV trực phòng tự nhập
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                            <FileSpreadsheet className="w-3 h-3 text-slate-500" /> BQL / Tuyển sinh
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-md font-semibold text-[10px] ${
                          st.gender === 'Nam' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'
                        }`}
                      >
                        {st.gender}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200/50">
                        {st.gradeClass}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-800">{st.roomNumber}</div>
                      <div className="text-[11px] text-slate-400">{st.teacherName}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="text-slate-700 font-semibold">{st.village}</div>
                      <div className="text-[11px] text-slate-400">{st.hamletLeader}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="text-slate-800">{st.parentName}</div>
                      <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" /> {st.parentPhone}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          st.boardingStatus === 'Đang ở nội trú'
                            ? 'bg-emerald-100 text-emerald-800'
                            : st.boardingStatus === 'Tạm vắng'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {st.boardingStatus}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      {canOperate ? (
                        <div className="inline-flex items-center gap-1">
                          {canManageSystem && (
                            <button
                              onClick={() => handleOpenTransfer(st)}
                              className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                              title="Chuyển phòng"
                            >
                              <ArrowRightLeft className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenEdit(st)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="Sửa thông tin học sinh"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(st)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                            title="Xóa học sinh"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400">Chỉ xem</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredStudents.length === 0 && (
          <div className="text-center py-12 text-slate-400 text-xs">
            Không tìm thấy học sinh nào theo điều kiện lọc đã chọn.
          </div>
        )}
      </div>

      {/* Modal: TỰ NHẬP HỌC SINH CỦA GIÁO VIÊN TRỰC PHÒNG */}
      {isQuickTeacherInputOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-emerald-600" /> Tự Nhập Học Sinh Của Giáo Viên Trực Phòng & Quản Trị Viên
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Giáo viên trực phòng & Quản trị viên tự nhập danh sách học sinh vào phòng nội trú phụ trách
                </p>
              </div>
              <button onClick={() => setIsQuickTeacherInputOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Room Selector Banner */}
            <div className="mt-3.5 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
              <div>
                <span className="text-slate-500 font-medium">Phòng ở tiếp nhận:</span>
                <div className="font-black text-slate-900 text-sm mt-0.5">
                  {rooms.find(r => r.id === teacherTargetRoomId)?.roomNumber || 'Chưa chọn'} - {rooms.find(r => r.id === teacherTargetRoomId)?.name}
                </div>
                <div className="text-[11px] text-slate-500">
                  GV phụ trách: <strong>{rooms.find(r => r.id === teacherTargetRoomId)?.assignedTeacherName || 'Chưa gán'}</strong> • Hiện có:{' '}
                  <strong>
                    {rooms.find(r => r.id === teacherTargetRoomId)?.currentOccupancy}/{rooms.find(r => r.id === teacherTargetRoomId)?.capacity} em
                  </strong>
                </div>
              </div>

              {!isTeacherOnly && (
                <div className="shrink-0">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Đổi phòng khác:</label>
                  <select
                    value={teacherTargetRoomId}
                    onChange={e => setTeacherTargetRoomId(e.target.value)}
                    className="px-3 py-1.5 border border-slate-300 rounded-xl bg-white font-bold text-xs"
                  >
                    {rooms.map(r => (
                      <option key={r.id} value={r.id}>
                        {r.roomNumber} - {r.name} ({r.currentOccupancy}/{r.capacity} em)
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Input Mode Tabs: Batch vs Single */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl mt-3.5 text-xs font-black">
              <button
                type="button"
                onClick={() => setTeacherModalTab('batch')}
                className={`flex-1 py-2 rounded-lg transition flex items-center justify-center gap-1.5 ${
                  teacherModalTab === 'batch' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ClipboardList className="w-3.5 h-3.5 text-emerald-600" /> Dán danh sách nhanh (Nhiều em)
              </button>
              <button
                type="button"
                onClick={() => setTeacherModalTab('single')}
                className={`flex-1 py-2 rounded-lg transition flex items-center justify-center gap-1.5 ${
                  teacherModalTab === 'single' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Plus className="w-3.5 h-3.5 text-blue-600" /> Tự nhập chi tiết từng em
              </button>
            </div>

            {teacherModalTab === 'batch' ? (
              <form onSubmit={handleQuickTeacherBatchSubmit} className="space-y-4 mt-3 text-xs">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-950 leading-relaxed">
                  <strong>Cách nhập nhanh:</strong> Nhập hoặc dán danh sách học sinh vào ô bên dưới, mỗi học sinh trên 1 dòng.
                  <div className="text-[11px] text-slate-600 mt-1">
                    Định dạng: <code>Họ và tên [dấu phẩy] Giới tính [dấu phẩy] Lớp [dấu phẩy] Thôn [dấu phẩy] Nóc [dấu phẩy] Cha mẹ [dấu phẩy] SĐT</code>
                    <br />(Hoặc chỉ cần nhập mỗi dòng 1 Họ tên, hệ thống tự động gán thông tin mặc định bên dưới).
                  </div>
                </div>

                {/* Defaults */}
                <div className="grid grid-cols-3 gap-2.5 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <div>
                    <label className="block font-black text-slate-700 mb-1">Lớp mặc định</label>
                    <input
                      type="text"
                      value={quickDefaultClass}
                      onChange={e => setQuickDefaultClass(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-xl bg-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-black text-slate-700 mb-1">Thôn mặc định</label>
                    <input
                      type="text"
                      value={quickDefaultVillage}
                      onChange={e => setQuickDefaultVillage(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-xl bg-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-black text-slate-700 mb-1">Nóc ông/bà</label>
                    <input
                      type="text"
                      value={quickDefaultHamlet}
                      onChange={e => setQuickDefaultHamlet(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-xl bg-white font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-black text-slate-700 mb-1">
                    Danh sách học sinh (Mỗi em 1 dòng) *
                  </label>
                  <textarea
                    rows={6}
                    required
                    value={quickPasteText}
                    onChange={e => setQuickPasteText(e.target.value)}
                    placeholder={`Ví dụ:\nHồ Văn Hải, Nam, 6/1, Thôn 1, Nóc Ông Tuân, Hồ Văn Đạt, 0983112233\nĐinh Thị Lan, Nữ, 6/1, Thôn 2, Nóc Ông Reo, Đinh Văn Nam, 0978223344\nTrần Văn Kiên\nLê Văn Tý`}
                    className="w-full font-mono text-xs px-3.5 py-2.5 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsQuickTeacherInputOpen(false)}
                    className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 font-black text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-500/20 transition flex items-center gap-1.5"
                  >
                    <UserPlus className="w-4 h-4" /> Xác nhận lưu vào phòng
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleTeacherSingleSubmit} className="space-y-3.5 mt-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-black text-slate-700 mb-1">Họ và tên học sinh *</label>
                    <input
                      type="text"
                      required
                      value={teacherSingleName}
                      onChange={e => setTeacherSingleName(e.target.value)}
                      placeholder="Ví dụ: Hồ Văn Nam"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-black text-slate-700 mb-1">Ngày sinh</label>
                    <input
                      type="date"
                      value={teacherSingleDob}
                      onChange={e => setTeacherSingleDob(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-black text-slate-700 mb-1">Giới tính</label>
                    <select
                      value={teacherSingleGender}
                      onChange={e => setTeacherSingleGender(e.target.value as any)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white font-bold"
                    >
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-black text-slate-700 mb-1">Lớp</label>
                    <input
                      type="text"
                      required
                      value={teacherSingleClass}
                      onChange={e => setTeacherSingleClass(e.target.value)}
                      placeholder="6/1, 6/2..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-black text-slate-700 mb-1">Thôn</label>
                    <input
                      type="text"
                      required
                      value={teacherSingleVillage}
                      onChange={e => setTeacherSingleVillage(e.target.value)}
                      placeholder="Thôn 1, Thôn 2, Làng Sen..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-black text-slate-700 mb-1">Nóc ông/bà</label>
                    <input
                      type="text"
                      required
                      value={teacherSingleHamlet}
                      onChange={e => setTeacherSingleHamlet(e.target.value)}
                      placeholder="Nóc Ông Tuân, Nóc Ông Reo..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-black text-slate-700 mb-1">Cha/mẹ (Con ông/bà)</label>
                    <input
                      type="text"
                      value={teacherSingleParent}
                      onChange={e => setTeacherSingleParent(e.target.value)}
                      placeholder="Tên cha hoặc mẹ"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-black text-slate-700 mb-1">Số điện thoại liên hệ</label>
                    <input
                      type="text"
                      value={teacherSinglePhone}
                      onChange={e => setTeacherSinglePhone(e.target.value)}
                      placeholder="098..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-black text-slate-700 mb-1">Ghi chú</label>
                  <input
                    type="text"
                    value={teacherSingleNote}
                    onChange={e => setTeacherSingleNote(e.target.value)}
                    placeholder="Ghi chú hoàn cảnh, cán sự phòng..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsQuickTeacherInputOpen(false)}
                    className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 font-black text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-500/20 transition flex items-center gap-1.5"
                  >
                    <UserPlus className="w-4 h-4" /> Lưu học sinh này vào phòng
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Add / Edit Student Modal */}
      {isAddEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-lg">
                {selectedStudent ? `Sửa Hồ Sơ: ${selectedStudent.fullName}` : 'Thêm Học Sinh Mới'}
              </h3>
              <button onClick={() => setIsAddEditModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Họ và tên học sinh *</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Ví dụ: Hồ Văn Nam"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ngày sinh</label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={e => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Giới tính</label>
                  <select
                    value={formData.gender}
                    onChange={e => setFormData({ ...formData, gender: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Lớp học</label>
                  <input
                    type="text"
                    required
                    value={formData.gradeClass}
                    onChange={e => setFormData({ ...formData, gradeClass: e.target.value })}
                    placeholder="Ví dụ: 6/1, 6/2, 7/1..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Thôn</label>
                  <input
                    type="text"
                    required
                    value={formData.village}
                    onChange={e => setFormData({ ...formData, village: e.target.value })}
                    placeholder="Ví dụ: Thôn 1, Thôn 2, Làng Sen..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nóc ông/bà</label>
                  <input
                    type="text"
                    required
                    value={formData.hamletLeader}
                    onChange={e => setFormData({ ...formData, hamletLeader: e.target.value })}
                    placeholder="Ví dụ: Nóc Ông Tuân, Nóc Ông Reo..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Cha/mẹ (Con ông/bà)</label>
                  <input
                    type="text"
                    value={formData.parentName}
                    onChange={e => setFormData({ ...formData, parentName: e.target.value })}
                    placeholder="Họ tên cha hoặc mẹ"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Số điện thoại liên hệ</label>
                  <input
                    type="text"
                    value={formData.parentPhone}
                    onChange={e => setFormData({ ...formData, parentPhone: e.target.value })}
                    placeholder="098..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Xếp vào phòng ở</label>
                  <select
                    value={isTeacherOnly && assignedRoomId ? assignedRoomId : formData.roomId}
                    disabled={isTeacherOnly}
                    onChange={e => setFormData({ ...formData, roomId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white disabled:bg-slate-100 font-semibold"
                  >
                    {rooms.map(r => (
                      <option key={r.id} value={r.id}>
                        {r.roomNumber} - {r.name} ({r.currentOccupancy}/{r.capacity})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Trạng thái nội trú</label>
                  <select
                    value={formData.boardingStatus}
                    onChange={e => setFormData({ ...formData, boardingStatus: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
                  >
                    <option value="Đang ở nội trú">Đang ở nội trú</option>
                    <option value="Nghỉ nội trú">Nghỉ nội trú</option>
                    <option value="Tạm vắng">Tạm vắng</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ghi chú thêm</label>
                <textarea
                  rows={2}
                  value={formData.note || ''}
                  onChange={e => setFormData({ ...formData, note: e.target.value })}
                  placeholder="Ví dụ: Cán sự phòng, hoàn cảnh khó khăn..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddEditModalOpen(false)}
                  className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition"
                >
                  {selectedStudent ? 'Lưu thay đổi' : 'Thêm học sinh'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transfer Room Modal */}
      {isTransferModalOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <h3 className="font-extrabold text-slate-900 text-lg mb-2">
              Chuyển Phòng Học Sinh
            </h3>
            <p className="text-xs text-slate-600 mb-4">
              Chuyển em <strong>{selectedStudent.fullName}</strong> từ phòng{' '}
              <span className="text-rose-600 font-bold">{selectedStudent.roomNumber}</span> sang phòng mới:
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
                    <option key={r.id} value={r.id} disabled={r.id === selectedStudent.roomId}>
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

      {/* Import from Excel Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" /> Nhập Danh Sách Bằng Excel
              </h3>
              <button onClick={() => setIsImportModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 mt-4 text-xs">
              <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl text-blue-900 leading-relaxed">
                Tải file mẫu Excel chuẩn để điền danh sách học sinh (có đầy đủ các cột: Họ tên, Ngày sinh, Giới tính, Lớp, Thôn, Nóc, Cha mẹ, SĐT, Phòng).
                {isTeacherOnly && assignedRoom && (
                  <div className="mt-1 font-bold text-blue-950">
                    * Bạn đang đăng nhập với tư cách giáo viên trực {assignedRoom.roomNumber}. Các học sinh tải lên sẽ được tự động xếp vào phòng của bạn.
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold flex items-center justify-center gap-2 transition border border-slate-300"
              >
                <Download className="w-4 h-4 text-blue-600" /> TẢI FILE MẪU EXCEL (.XLSX)
              </button>

              <div className="pt-2">
                <label className="block font-bold text-slate-700 mb-1">
                  Chọn file Excel (.xlsx / .xls) từ máy tính để tải lên:
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileUpload}
                  className="w-full text-xs file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
