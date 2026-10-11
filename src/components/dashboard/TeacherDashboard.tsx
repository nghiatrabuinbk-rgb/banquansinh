import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Home,
  Users,
  Sun,
  Moon,
  Clock,
  Sparkles,
  Send,
  CalendarCheck,
  AlertCircle,
  UserPlus,
  Plus,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { AttendanceStatus, Student } from '../../types';

interface TeacherDashboardProps {
  onNavigateTab: (tab: any) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ onNavigateTab }) => {
  const { currentUser, assignedRoomId } = useAuth();
  const { rooms, students, bulkSaveRoomAttendance, attendance, settings, addStudent, importStudentsBatch } = useData();

  const assignedRoom = rooms.find(r => r.id === assignedRoomId);
  const roomStudents = students.filter(
    s => s.roomId === assignedRoomId && s.boardingStatus === 'Đang ở nội trú'
  );

  const todayStr = new Date().toISOString().slice(0, 10);
  const [selectedSession, setSelectedSession] = useState<'morning' | 'evening'>('morning');
  const [attendanceDraft, setAttendanceDraft] = useState<Record<string, AttendanceStatus>>({});
  const [noteDraft, setNoteDraft] = useState<Record<string, string>>({});
  const [justSaved, setJustSaved] = useState(false);

  // Teacher Student Input Modal State
  const [isInputModalOpen, setIsInputModalOpen] = useState(false);
  const [inputMode, setInputMode] = useState<'single' | 'batch'>('single');
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentGender, setNewStudentGender] = useState<'Nam' | 'Nữ'>('Nam');
  const [newStudentClass, setNewStudentClass] = useState('6/1');
  const [newStudentVillage, setNewStudentVillage] = useState('Thôn 1');
  const [newStudentHamlet, setNewStudentHamlet] = useState('Nóc Ông Tuân');
  const [newStudentParent, setNewStudentParent] = useState('');
  const [newStudentPhone, setNewStudentPhone] = useState('');
  const [batchText, setBatchText] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initialize draft from existing attendance
  React.useEffect(() => {
    const drafts: Record<string, AttendanceStatus> = {};
    const notes: Record<string, string> = {};

    roomStudents.forEach(s => {
      const existing = attendance.find(
        a => a.studentId === s.id && a.date === todayStr && a.session === selectedSession
      );
      drafts[s.id] = existing ? existing.status : 'present';
      notes[s.id] = existing?.note || '';
    });

    setAttendanceDraft(drafts);
    setNoteDraft(notes);
  }, [selectedSession, assignedRoomId, students, attendance]);

  const handleMarkAllPresent = () => {
    const drafts: Record<string, AttendanceStatus> = {};
    roomStudents.forEach(s => {
      drafts[s.id] = 'present';
    });
    setAttendanceDraft(drafts);
  };

  const handleSaveAttendance = () => {
    if (!assignedRoom) return;

    const payload = roomStudents.map(s => ({
      studentId: s.id,
      studentName: s.fullName,
      status: attendanceDraft[s.id] || 'present',
      note: noteDraft[s.id] || undefined,
    }));

    bulkSaveRoomAttendance(assignedRoom.id, selectedSession, todayStr, payload);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 3000);
  };

  // Handle single student addition by teacher
  const handleAddSingleStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignedRoom) return;

    addStudent({
      fullName: newStudentName,
      dateOfBirth: '2014-01-01',
      gender: newStudentGender,
      gradeClass: newStudentClass,
      village: newStudentVillage,
      hamletLeader: newStudentHamlet,
      parentName: newStudentParent,
      parentPhone: newStudentPhone,
      roomId: assignedRoom.id,
      roomNumber: assignedRoom.roomNumber,
      teacherName: currentUser.name,
      boardingStatus: 'Đang ở nội trú',
      note: 'Giáo viên trực phòng tự nhập',
      entrySource: 'teacher',
    });

    setToastMessage(`Đã thêm thành công học sinh ${newStudentName} vào ${assignedRoom.roomNumber}!`);
    setNewStudentName('');
    setNewStudentParent('');
    setNewStudentPhone('');
    setIsInputModalOpen(false);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Handle batch student addition by teacher
  const handleAddBatchStudents = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignedRoom) return;

    const lines = batchText
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0);

    if (lines.length === 0) {
      alert('Vui lòng nhập danh sách họ tên học sinh!');
      return;
    }

    const newItems: Omit<Student, 'id'>[] = lines.map(line => {
      const parts = line.split(/[,;\t]/).map(p => p.trim());
      const name = parts[0] || 'Học sinh mới';
      const gender = parts[1] === 'Nữ' || parts[1] === 'nữ' ? 'Nữ' : 'Nam';
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
        roomId: assignedRoom.id,
        roomNumber: assignedRoom.roomNumber,
        teacherName: currentUser.name,
        boardingStatus: 'Đang ở nội trú',
        note: 'Giáo viên trực phòng tự nhập hàng loạt',
        entrySource: 'teacher',
      };
    });

    importStudentsBatch(newItems);
    setToastMessage(`Đã thêm thành công ${newItems.length} học sinh vào phòng ${assignedRoom.roomNumber}!`);
    setBatchText('');
    setIsInputModalOpen(false);
    setTimeout(() => setToastMessage(null), 3000);
  };

  if (!assignedRoom) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center text-amber-900">
        <AlertCircle className="w-8 h-8 mx-auto text-amber-600 mb-2" />
        <h3 className="font-bold text-base">Tài khoản chưa được phân công phòng</h3>
        <p className="text-xs text-amber-700 mt-1">
          Vui lòng liên hệ Thầy Nguyễn Trọng Nghĩa (Trưởng ban QLNT) hoặc Quản trị viên để được gán phòng phụ trách.
        </p>
      </div>
    );
  }

  const isMorningDone = assignedRoom.morningAttendanceDone;
  const isEveningDone = assignedRoom.eveningAttendanceDone;

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      {/* Teacher Header Card */}
      <div className="bg-gradient-to-br from-blue-700 via-indigo-700 to-slate-900 rounded-3xl p-5 sm:p-6 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-bold mb-2">
              <Home className="w-3.5 h-3.5" /> {assignedRoom.roomNumber} - {assignedRoom.name}
            </div>
            <h2 className="text-xl sm:text-2xl font-black">{currentUser.name}</h2>
            <div className="text-xs text-blue-100 mt-0.5">
              Khu: {assignedRoom.buildingZone} • Sĩ số: <strong>{roomStudents.length}</strong>/{assignedRoom.capacity} em
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsInputModalOpen(true)}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-black shadow-md shadow-emerald-500/30 transition flex items-center gap-1.5"
              title="Tự nhập thêm học sinh vào phòng của bạn"
            >
              <UserPlus className="w-4 h-4" /> TỰ NHẬP HỌC SINH CỦA GIÁO VIÊN TRỰC PHÒNG
            </button>

            <div className="bg-white/10 px-4 py-2 rounded-2xl backdrop-blur-xs border border-white/20 text-center">
              <div className="text-[11px] text-blue-200">Điểm thi đua</div>
              <div className="text-2xl font-black text-amber-300">{assignedRoom.currentScore || 90}đ</div>
            </div>
          </div>
        </div>
      </div>

      {toastMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {toastMessage}
        </div>
      )}

      {/* Quick Session Selector & Action Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedSession('morning')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
              selectedSession === 'morning'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Sun className="w-4 h-4" />
            Điểm danh Sáng ({settings.morningTimeWindow.start} - {settings.morningTimeWindow.end})
            {isMorningDone && <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.5 rounded-md">Đã nộp</span>}
          </button>

          <button
            onClick={() => setSelectedSession('evening')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
              selectedSession === 'evening'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Moon className="w-4 h-4" />
            Điểm danh Tối ({settings.eveningTimeWindow.start} - {settings.eveningTimeWindow.end})
            {isEveningDone && <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.5 rounded-md">Đã nộp</span>}
          </button>
        </div>

        {/* 1-Touch button: Tất cả có mặt */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleMarkAllPresent}
            className="flex-1 sm:flex-none px-3.5 py-2 text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded-xl transition flex items-center justify-center gap-1.5"
            title="Đánh dấu nhanh tất cả học sinh có mặt"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            1-Chạm: Tất cả có mặt
          </button>

          <button
            onClick={handleSaveAttendance}
            className="flex-1 sm:flex-none px-5 py-2 text-xs font-black text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition flex items-center justify-center gap-1.5"
          >
            <Send className="w-4 h-4" />
            LƯU & NỘP DỮ LIỆU
          </button>
        </div>
      </div>

      {justSaved && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Đã lưu và đồng bộ dữ liệu điểm danh thành công lúc {new Date().toLocaleTimeString('vi-VN')}!
        </div>
      )}

      {/* Student List for Quick Tap on Mobile */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700">
          <div className="flex items-center gap-2">
            <span>DANH SÁCH HỌC SINH ({roomStudents.length} EM)</span>
            <button
              onClick={() => setIsInputModalOpen(true)}
              className="text-[11px] text-blue-600 hover:underline font-bold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Thêm em mới
            </button>
          </div>
          <span className="text-slate-400">Chọn trạng thái cho từng em</span>
        </div>

        {roomStudents.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            Phòng hiện tại chưa có học sinh nào.
            <div className="mt-2">
              <button
                onClick={() => setIsInputModalOpen(true)}
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold inline-flex items-center gap-1.5"
              >
                <UserPlus className="w-4 h-4" /> Tự nhập danh sách học sinh vào phòng ngay
              </button>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {roomStudents.map((st, idx) => {
              const status = attendanceDraft[st.id] || 'present';
              return (
                <div
                  key={st.id}
                  className="p-3 sm:p-4 hover:bg-slate-50/70 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                        {st.fullName}
                        <span className="text-[10px] font-semibold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md">
                          {st.gradeClass}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {st.village} • {st.hamletLeader} • PH: {st.parentName} ({st.parentPhone})
                      </div>
                    </div>
                  </div>

                  {/* Status Pills */}
                  <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => setAttendanceDraft(prev => ({ ...prev, [st.id]: 'present' }))}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        status === 'present'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Có mặt
                    </button>

                    <button
                      type="button"
                      onClick={() => setAttendanceDraft(prev => ({ ...prev, [st.id]: 'absent_excused' }))}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        status === 'absent_excused'
                          ? 'bg-amber-500 text-slate-950 shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Vắng có phép
                    </button>

                    <button
                      type="button"
                      onClick={() => setAttendanceDraft(prev => ({ ...prev, [st.id]: 'absent_unexcused' }))}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        status === 'absent_unexcused'
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Vắng KP
                    </button>

                    <button
                      type="button"
                      onClick={() => setAttendanceDraft(prev => ({ ...prev, [st.id]: 'home' }))}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        status === 'home'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Về nhà
                    </button>
                  </div>

                  {/* Note input if absent or special */}
                  {status !== 'present' && (
                    <div className="w-full sm:w-48 mt-1 sm:mt-0">
                      <input
                        type="text"
                        placeholder="Lý do (ốm, việc nhà...)"
                        value={noteDraft[st.id] || ''}
                        onChange={e => setNoteDraft(prev => ({ ...prev, [st.id]: e.target.value }))}
                        className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500 bg-slate-50"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom Save Bar */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Hãy nhấn Lưu & Nộp để hoàn thành điểm danh đúng giờ quy định.
          </span>
          <button
            onClick={handleSaveAttendance}
            className="px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition"
          >
            LƯU VÀ HOÀN TẤT ĐIỂM DANH
          </button>
        </div>
      </div>

      {/* Modal: Tự Nhập Học Sinh Của Giáo Viên Trực Phòng */}
      {isInputModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-emerald-600" /> Tự Nhập Học Sinh Phòng {assignedRoom.roomNumber}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Thêm học sinh mới trực tiếp vào phòng bạn phụ trách
                </p>
              </div>
              <button onClick={() => setIsInputModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl mt-4 text-xs font-bold">
              <button
                type="button"
                onClick={() => setInputMode('single')}
                className={`flex-1 py-1.5 rounded-lg transition ${
                  inputMode === 'single' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Nhập từng học sinh
              </button>
              <button
                type="button"
                onClick={() => setInputMode('batch')}
                className={`flex-1 py-1.5 rounded-lg transition ${
                  inputMode === 'batch' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Nhập nhanh nhiều em (Paste danh sách)
              </button>
            </div>

            {inputMode === 'single' ? (
              <form onSubmit={handleAddSingleStudent} className="space-y-3.5 mt-4 text-xs">
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
                      placeholder="Họ tên cha mẹ"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Số điện thoại</label>
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
                    onClick={() => setIsInputModalOpen(false)}
                    className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition"
                  >
                    Thêm vào phòng
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleAddBatchStudents} className="space-y-3.5 mt-4 text-xs">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 leading-relaxed text-[11px]">
                  Dán hoặc nhập danh sách học sinh vào ô bên dưới (mỗi em một dòng). Có thể nhập chỉ họ tên, hoặc phân cách bằng dấu phẩy:
                  <br /><code>Hồ Văn A, Nam, 6/1, Thôn 1, Nóc Ông Tuân, Phụ huynh, 098...</code>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Danh sách học sinh (Mỗi em 1 dòng) *
                  </label>
                  <textarea
                    rows={6}
                    required
                    value={batchText}
                    onChange={e => setBatchText(e.target.value)}
                    placeholder={`Hồ Văn Hải\nĐinh Văn Hoàng\nLê Văn Tý`}
                    className="w-full font-mono text-xs px-3.5 py-2.5 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsInputModalOpen(false)}
                    className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition flex items-center gap-1.5"
                  >
                    <UserPlus className="w-4 h-4" /> Thêm danh sách vào phòng
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
