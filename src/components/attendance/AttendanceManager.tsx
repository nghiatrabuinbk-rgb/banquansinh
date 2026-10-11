import React, { useState, useMemo } from 'react';
import {
  ClipboardCheck,
  Sun,
  Moon,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  Search,
  Building,
  Save,
  Check,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { AttendanceStatus } from '../../types';

export const AttendanceManager: React.FC = () => {
  const { rooms, students, attendance, bulkSaveRoomAttendance, settings } = useData();
  const { currentUser, isTeacherOnly, assignedRoomId } = useAuth();

  // If teacher, locked to their room; otherwise can switch between all rooms
  const initialRoomId = isTeacherOnly && assignedRoomId ? assignedRoomId : (rooms[0]?.id || '');
  const [selectedRoomId, setSelectedRoomId] = useState<string>(initialRoomId);
  const [selectedSession, setSelectedSession] = useState<'morning' | 'evening'>('morning');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [filterQuery, setFilterQuery] = useState('');
  const [showSavedToast, setShowSavedToast] = useState(false);

  // Draft state for attendance
  const [draftStatus, setDraftStatus] = useState<Record<string, AttendanceStatus>>({});
  const [draftNotes, setDraftNotes] = useState<Record<string, string>>({});

  // Visible rooms
  const visibleRooms = useMemo(() => {
    if (isTeacherOnly && assignedRoomId) {
      return rooms.filter(r => r.id === assignedRoomId);
    }
    return rooms;
  }, [rooms, isTeacherOnly, assignedRoomId]);

  const activeRoom = rooms.find(r => r.id === selectedRoomId);

  // Students in selected room
  const roomStudents = useMemo(() => {
    return students.filter(
      s => s.roomId === selectedRoomId && s.boardingStatus === 'Đang ở nội trú'
    );
  }, [students, selectedRoomId]);

  // Sync draft state with existing records whenever room/session/date changes
  React.useEffect(() => {
    const drafts: Record<string, AttendanceStatus> = {};
    const notes: Record<string, string> = {};

    roomStudents.forEach(s => {
      const rec = attendance.find(
        a => a.studentId === s.id && a.date === selectedDate && a.session === selectedSession
      );
      drafts[s.id] = rec ? rec.status : 'present';
      notes[s.id] = rec?.note || '';
    });

    setDraftStatus(drafts);
    setDraftNotes(notes);
  }, [selectedRoomId, selectedSession, selectedDate, roomStudents, attendance]);

  // 1-Touch Mark All Present
  const handleMarkAllPresent = () => {
    const updated: Record<string, AttendanceStatus> = {};
    roomStudents.forEach(s => {
      updated[s.id] = 'present';
    });
    setDraftStatus(updated);
  };

  // Save current room attendance
  const handleSave = () => {
    if (!activeRoom) return;

    const payload = roomStudents.map(s => ({
      studentId: s.id,
      studentName: s.fullName,
      status: draftStatus[s.id] || 'present',
      note: draftNotes[s.id] || undefined,
    }));

    bulkSaveRoomAttendance(activeRoom.id, selectedSession, selectedDate, payload);
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 3000);
  };

  // Filtered student list for search
  const filteredStudents = useMemo(() => {
    const q = filterQuery.toLowerCase().trim();
    if (!q) return roomStudents;
    return roomStudents.filter(
      s =>
        s.fullName.toLowerCase().includes(q) ||
        s.gradeClass.toLowerCase().includes(q) ||
        s.village.toLowerCase().includes(q)
    );
  }, [roomStudents, filterQuery]);

  // Calculation of present / absent
  const stats = useMemo(() => {
    let present = 0;
    let absentExcused = 0;
    let absentUnexcused = 0;
    let home = 0;
    let other = 0;

    roomStudents.forEach(s => {
      const st = draftStatus[s.id] || 'present';
      if (st === 'present') present++;
      else if (st === 'absent_excused') absentExcused++;
      else if (st === 'absent_unexcused') absentUnexcused++;
      else if (st === 'home') home++;
      else other++;
    });

    const rate = roomStudents.length > 0 ? Math.round((present / roomStudents.length) * 100) : 100;

    return { present, absentExcused, absentUnexcused, home, other, rate };
  }, [roomStudents, draftStatus]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Title & Controls Header */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="text-xs font-bold uppercase text-emerald-700 tracking-wider mb-1 flex items-center gap-1.5">
              <ClipboardCheck className="w-4 h-4" /> Nghiệp Vụ Điểm Danh Hằng Ngày
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              Điểm Danh Học Sinh Nội Trú
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Thời gian quy định: Sáng ({settings.morningTimeWindow.start} - {settings.morningTimeWindow.end}) • Tối ({settings.eveningTimeWindow.start} - {settings.eveningTimeWindow.end})
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleMarkAllPresent}
              className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 1-Chạm: Tất cả có mặt
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-extrabold shadow-md shadow-blue-500/20 transition flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" /> LƯU & XÁC NHẬN
            </button>
          </div>
        </div>

        {/* Filters: Session, Date, Room */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {/* Session Switcher */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Buổi điểm danh</label>
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setSelectedSession('morning')}
                className={`py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                  selectedSession === 'morning'
                    ? 'bg-amber-400 text-slate-950 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sun className="w-3.5 h-3.5" /> Sáng
              </button>
              <button
                type="button"
                onClick={() => setSelectedSession('evening')}
                className={`py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                  selectedSession === 'evening'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Moon className="w-3.5 h-3.5" /> Tối
              </button>
            </div>
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Ngày điểm danh</label>
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="w-full text-xs font-semibold px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          {/* Room Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Chọn phòng ở</label>
            <select
              value={selectedRoomId}
              onChange={e => setSelectedRoomId(e.target.value)}
              disabled={isTeacherOnly}
              className="w-full text-xs font-semibold px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-slate-100 disabled:text-slate-600"
            >
              {visibleRooms.map(r => (
                <option key={r.id} value={r.id}>
                  {r.roomNumber} - {r.name} ({r.currentOccupancy} em)
                </option>
              ))}
            </select>
          </div>

          {/* Fast Search input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Lọc tên học sinh</label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={filterQuery}
                onChange={e => setFilterQuery(e.target.value)}
                placeholder="Tìm tên, lớp..."
                className="w-full text-xs pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {showSavedToast && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-800 text-xs font-bold flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            Đã lưu dữ liệu điểm danh buổi {selectedSession === 'morning' ? 'Sáng' : 'Tối'} cho {activeRoom?.roomNumber} ngày {selectedDate}!
          </div>
          <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full">
            Đã đồng bộ
          </span>
        </div>
      )}

      {/* Summary KPI Strip for Current Room */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 text-center">
          <div className="text-[11px] text-slate-500">Sĩ số phòng</div>
          <div className="text-xl font-black text-slate-900">{roomStudents.length}</div>
        </div>
        <div className="bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-200 text-center">
          <div className="text-[11px] text-emerald-700 font-semibold">Có mặt</div>
          <div className="text-xl font-black text-emerald-700">{stats.present}</div>
        </div>
        <div className="bg-amber-50/70 p-3.5 rounded-2xl border border-amber-200 text-center">
          <div className="text-[11px] text-amber-800 font-semibold">Vắng có phép</div>
          <div className="text-xl font-black text-amber-800">{stats.absentExcused}</div>
        </div>
        <div className="bg-rose-50/70 p-3.5 rounded-2xl border border-rose-200 text-center">
          <div className="text-[11px] text-rose-700 font-semibold">Vắng KP</div>
          <div className="text-xl font-black text-rose-700">{stats.absentUnexcused}</div>
        </div>
        <div className="bg-blue-50/70 p-3.5 rounded-2xl border border-blue-200 text-center">
          <div className="text-[11px] text-blue-700 font-semibold">Về nhà</div>
          <div className="text-xl font-black text-blue-700">{stats.home}</div>
        </div>
        <div className="bg-purple-50/70 p-3.5 rounded-2xl border border-purple-200 text-center">
          <div className="text-[11px] text-purple-700 font-semibold">Tỷ lệ chuyên cần</div>
          <div className="text-xl font-black text-purple-700">{stats.rate}%</div>
        </div>
      </div>

      {/* Student List Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="font-bold text-xs sm:text-sm text-slate-800">
            {activeRoom?.roomNumber} - {activeRoom?.name} • Giáo viên phụ trách: {activeRoom?.assignedTeacherName || 'Chưa gán'}
          </div>
          <div className="text-xs text-slate-500">
            {filteredStudents.length} học sinh
          </div>
        </div>

        {filteredStudents.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            Không có học sinh nào trong phòng này hoặc không khớp với bộ lọc tìm kiếm.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredStudents.map((st, idx) => {
              const currentStatus = draftStatus[st.id] || 'present';
              return (
                <div
                  key={st.id}
                  className="p-4 hover:bg-slate-50/60 transition flex flex-col md:flex-row md:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                        {st.fullName}
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200/60">
                          {st.gradeClass}
                        </span>
                        <span className="text-[10px] text-slate-400 font-normal">
                          ({st.gender})
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {st.village} • {st.hamletLeader} • SĐT: {st.parentPhone}
                      </div>
                    </div>
                  </div>

                  {/* Status buttons */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setDraftStatus(prev => ({ ...prev, [st.id]: 'present' }))}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                        currentStatus === 'present'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Có mặt
                    </button>
                    <button
                      type="button"
                      onClick={() => setDraftStatus(prev => ({ ...prev, [st.id]: 'absent_excused' }))}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                        currentStatus === 'absent_excused'
                          ? 'bg-amber-500 text-slate-950 shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Phép
                    </button>
                    <button
                      type="button"
                      onClick={() => setDraftStatus(prev => ({ ...prev, [st.id]: 'absent_unexcused' }))}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                        currentStatus === 'absent_unexcused'
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Không phép
                    </button>
                    <button
                      type="button"
                      onClick={() => setDraftStatus(prev => ({ ...prev, [st.id]: 'home' }))}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                        currentStatus === 'home'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Về nhà
                    </button>
                  </div>

                  {/* Note input */}
                  <div className="w-full md:w-56">
                    <input
                      type="text"
                      placeholder="Ghi chú (ốm, lý do...)"
                      value={draftNotes[st.id] || ''}
                      onChange={e => setDraftNotes(prev => ({ ...prev, [st.id]: e.target.value }))}
                      className="w-full text-xs px-3 py-1.5 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-blue-500 bg-slate-50"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer save */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            Dữ liệu sau khi lưu sẽ tự động đồng bộ vào Báo cáo chuyên cần và Tiến độ các phòng.
          </div>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl shadow-md transition"
          >
            LƯU VÀ XÁC NHẬN ĐIỂM DANH
          </button>
        </div>
      </div>
    </div>
  );
};
