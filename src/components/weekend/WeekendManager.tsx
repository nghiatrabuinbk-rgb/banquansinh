import React, { useState, useMemo } from 'react';
import {
  CalendarCheck,
  CheckCircle2,
  Home,
  Clock,
  Filter,
  Search,
  FileSpreadsheet,
  FileText,
  Printer,
  Save,
  Users,
  Building
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { exportHelper } from '../../services/exportHelper';
import { WeekendStatus } from '../../types';

export const WeekendManager: React.FC = () => {
  const { students, rooms, weekend, bulkSaveWeekend } = useData();
  const { currentUser, isTeacherOnly, assignedRoomId } = useAuth();

  const [filterRoom, setFilterRoom] = useState<string>(isTeacherOnly && assignedRoomId ? assignedRoomId : 'all');
  const [filterGrade, setFilterGrade] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [targetDate, setTargetDate] = useState<string>('2026-10-09'); // Next Friday/Weekend
  const [draftStatus, setDraftStatus] = useState<Record<string, WeekendStatus>>({});
  const [draftReasons, setDraftReasons] = useState<Record<string, string>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync drafts with existing weekend records
  React.useEffect(() => {
    const drafts: Record<string, WeekendStatus> = {};
    const reasons: Record<string, string> = {};

    students.forEach(s => {
      const rec = weekend.find(w => w.studentId === s.id && w.date === targetDate);
      drafts[s.id] = rec ? rec.status : 'pending';
      reasons[s.id] = rec?.reason || '';
    });

    setDraftStatus(drafts);
    setDraftReasons(reasons);
  }, [students, weekend, targetDate]);

  // Filter students based on permissions & criteria
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      if (s.boardingStatus !== 'Đang ở nội trú') return false;
      if (isTeacherOnly && assignedRoomId && s.roomId !== assignedRoomId) return false;
      if (filterRoom !== 'all' && s.roomId !== filterRoom) return false;
      if (filterGrade !== 'all' && !s.gradeClass.startsWith(filterGrade)) return false;

      const currentSt = draftStatus[s.id] || 'pending';
      if (filterStatus !== 'all' && currentSt !== filterStatus) return false;

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          s.fullName.toLowerCase().includes(q) ||
          s.gradeClass.toLowerCase().includes(q) ||
          s.roomNumber.toLowerCase().includes(q) ||
          s.village.toLowerCase().includes(q) ||
          s.hamletLeader.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [students, isTeacherOnly, assignedRoomId, filterRoom, filterGrade, filterStatus, searchQuery, draftStatus]);

  // Overall counts
  const summary = useMemo(() => {
    let stay = 0;
    let home = 0;
    let pending = 0;

    students.forEach(s => {
      if (s.boardingStatus === 'Đang ở nội trú') {
        const st = draftStatus[s.id] || 'pending';
        if (st === 'stay') stay++;
        else if (st === 'home') home++;
        else pending++;
      }
    });

    return { stay, home, pending, total: stay + home + pending };
  }, [students, draftStatus]);

  // Bulk save current changes
  const handleSave = () => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} ${now.toLocaleDateString('vi-VN')}`;

    const records = filteredStudents.map(s => ({
      studentId: s.id,
      studentName: s.fullName,
      gradeClass: s.gradeClass,
      roomId: s.roomId,
      roomNumber: s.roomNumber,
      village: s.village,
      hamletLeader: s.hamletLeader,
      parentName: s.parentName,
      parentPhone: s.parentPhone,
      date: targetDate,
      status: draftStatus[s.id] || 'pending',
      reason: draftReasons[s.id] || undefined,
      submittedBy: currentUser.name,
      submittedAt: timeStr,
    }));

    bulkSaveWeekend(records);
    setToastMessage(`Đã cập nhật trạng thái cuối tuần cho ${records.length} học sinh thành công!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // 1-Click: Mark all filtered students as Stay or Home
  const handleMarkFiltered = (status: WeekendStatus) => {
    const updated = { ...draftStatus };
    filteredStudents.forEach(s => {
      updated[s.id] = status;
    });
    setDraftStatus(updated);
  };

  // Prepare Report Data for Export (Excel, Word, PDF)
  const getExportData = () => {
    const stayList = filteredStudents.filter(s => (draftStatus[s.id] || 'pending') === 'stay');
    const headers = [
      'STT',
      'Họ và tên',
      'Lớp',
      'Phòng',
      'Thôn',
      'Nóc ông/bà',
      'Cha/mẹ (Con ông/bà)',
      'Số điện thoại',
      'Trạng thái',
      'Lý do / Ghi chú',
    ];

    const rows = filteredStudents.map((s, idx) => {
      const st = draftStatus[s.id] || 'pending';
      const stLabel = st === 'stay' ? 'Ở lại trường' : st === 'home' ? 'Về nhà' : 'Chưa đăng ký';
      return [
        idx + 1,
        s.fullName,
        s.gradeClass,
        s.roomNumber,
        s.village,
        s.hamletLeader,
        s.parentName,
        s.parentPhone,
        stLabel,
        draftReasons[s.id] || '',
      ];
    });

    return {
      title: 'DANH SÁCH HỌC SINH ĐĂNG KÝ Ở LẠI CUỐI TUẦN',
      subTitle: `Cuối tuần ngày: ${targetDate} - Năm học 2026-2027`,
      reportDate: new Date().toLocaleDateString('vi-VN'),
      creatorName: currentUser.name,
      reviewerName: 'Nguyễn Trọng Nghĩa',
      summaryStats: [
        { label: 'Tổng số học sinh', value: `${summary.total} em` },
        { label: 'Học sinh đăng ký ở lại trường', value: `${summary.stay} em` },
        { label: 'Học sinh về nhà thăm gia đình', value: `${summary.home} em` },
        { label: 'Học sinh chưa đăng ký', value: `${summary.pending} em` },
      ],
      headers,
      rows,
      notes: 'Danh sách dùng để báo cáo Ban Giám hiệu, Ban Quản sinh và phục vụ công tác tổ chức nấu ăn cuối tuần.',
    };
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold uppercase text-purple-700 tracking-wider mb-1 flex items-center gap-1.5">
            <CalendarCheck className="w-4 h-4" /> Quản Lý Đăng Ký Cuối Tuần
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            Học Sinh Ở Lại Trường Cuối Tuần
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Cập nhật từ thứ Hai đến thứ Sáu để tổ chức nấu ăn, quản lý an toàn nề nếp
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => exportHelper.exportToExcel(getExportData(), 'DS_Cuoi_Tuan')}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
            title="Xuất danh sách sang Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-4 h-4" /> XUẤT EXCEL
          </button>
          <button
            onClick={() => exportHelper.exportToWord(getExportData(), 'DS_Cuoi_Tuan')}
            className="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
            title="Xuất file văn bản Word (.doc)"
          >
            <FileText className="w-4 h-4" /> XUẤT WORD
          </button>
          <button
            onClick={() => exportHelper.openPrintPreview(getExportData())}
            className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
            title="In hoặc Lưu PDF"
          >
            <Printer className="w-4 h-4" /> XUẤT PDF / IN
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black shadow-md transition flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" /> LƯU THAY ĐỔI
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {toastMessage}
        </div>
      )}

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200">
          <div className="text-xs text-slate-500 font-medium">Tổng học sinh nội trú</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{summary.total}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Toàn khu nội trú</div>
        </div>

        <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200">
          <div className="text-xs text-emerald-800 font-bold">🟢 Ở lại trường</div>
          <div className="text-2xl font-black text-emerald-700 mt-1">{summary.stay}</div>
          <div className="text-[11px] text-emerald-600 mt-0.5">Chuẩn bị khẩu phần ăn</div>
        </div>

        <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-200">
          <div className="text-xs text-blue-800 font-bold">🔵 Về nhà</div>
          <div className="text-2xl font-black text-blue-700 mt-1">{summary.home}</div>
          <div className="text-[11px] text-blue-600 mt-0.5">Đã đăng ký về thăm nhà</div>
        </div>

        <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200">
          <div className="text-xs text-amber-800 font-bold">🟡 Chưa đăng ký</div>
          <div className="text-2xl font-black text-amber-700 mt-1">{summary.pending}</div>
          <div className="text-[11px] text-amber-600 mt-0.5">Cần giáo viên nhắc nhở</div>
        </div>
      </div>

      {/* Filter & Batch Actions Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Target Weekend Date */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Cuối tuần ngày</label>
            <input
              type="date"
              value={targetDate}
              onChange={e => setTargetDate(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl bg-white font-semibold"
            />
          </div>

          {/* Filter Room */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Lọc theo phòng</label>
            <select
              value={filterRoom}
              onChange={e => setFilterRoom(e.target.value)}
              disabled={isTeacherOnly}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl bg-white font-semibold"
            >
              <option value="all">Tất cả các phòng ({rooms.length})</option>
              {rooms.map(r => (
                <option key={r.id} value={r.id}>
                  {r.roomNumber} - {r.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Grade */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Lọc theo khối</label>
            <select
              value={filterGrade}
              onChange={e => setFilterGrade(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl bg-white font-semibold"
            >
              <option value="all">Tất cả các khối</option>
              <option value="6">Khối 6</option>
              <option value="7">Khối 7</option>
              <option value="8">Khối 8</option>
              <option value="9">Khối 9</option>
            </select>
          </div>

          {/* Filter Status */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Trạng thái đăng ký</label>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl bg-white font-semibold"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="stay">🟢 Ở lại trường</option>
              <option value="home">🔵 Về nhà</option>
              <option value="pending">🟡 Chưa đăng ký</option>
            </select>
          </div>

          {/* Search Query */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Tìm kiếm</label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Tên, thôn, nóc..."
                className="w-full text-xs pl-9 pr-3 py-2 border border-slate-200 rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* Quick Batch Actions */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-500 font-medium">
            Đang hiển thị <strong>{filteredStudents.length}</strong> học sinh
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleMarkFiltered('stay')}
              className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 font-bold hover:bg-emerald-100 transition"
            >
              Chọn tất cả: Ở lại trường
            </button>
            <button
              onClick={() => handleMarkFiltered('home')}
              className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-800 font-bold hover:bg-blue-100 transition"
            >
              Chọn tất cả: Về nhà
            </button>
          </div>
        </div>
      </div>

      {/* Main Table: DANH SÁCH HỌC SINH Ở LẠI CUỐI TUẦN */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-extrabold uppercase tracking-wider text-slate-600">
                <th className="py-3.5 px-3 text-center w-12">STT</th>
                <th className="py-3.5 px-3">Họ và tên</th>
                <th className="py-3.5 px-3 text-center">Lớp</th>
                <th className="py-3.5 px-3">Phòng</th>
                <th className="py-3.5 px-3">Thôn / Nóc</th>
                <th className="py-3.5 px-3">Cha mẹ (Con ông/bà)</th>
                <th className="py-3.5 px-3">Số điện thoại</th>
                <th className="py-3.5 px-3 text-center w-48">Trạng thái cuối tuần</th>
                <th className="py-3.5 px-3 w-56">Lý do / Ghi chú</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredStudents.map((st, idx) => {
                const currentSt = draftStatus[st.id] || 'pending';
                return (
                  <tr key={st.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-3 text-center font-bold text-slate-500">{idx + 1}</td>
                    <td className="py-3 px-3 font-bold text-slate-900">{st.fullName}</td>
                    <td className="py-3 px-3 text-center font-semibold text-blue-700">
                      <span className="bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/50">
                        {st.gradeClass}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-800">{st.roomNumber}</td>
                    <td className="py-3 px-3 text-slate-600">
                      <div>{st.village}</div>
                      <div className="text-[11px] text-slate-400">{st.hamletLeader}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-700 font-medium">{st.parentName}</td>
                    <td className="py-3 px-3 text-slate-600 font-mono">{st.parentPhone}</td>
                    <td className="py-3 px-3 text-center">
                      <div className="inline-flex rounded-xl p-0.5 bg-slate-100 gap-0.5">
                        <button
                          type="button"
                          onClick={() => setDraftStatus(prev => ({ ...prev, [st.id]: 'stay' }))}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                            currentSt === 'stay'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Ở lại
                        </button>
                        <button
                          type="button"
                          onClick={() => setDraftStatus(prev => ({ ...prev, [st.id]: 'home' }))}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                            currentSt === 'home'
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Về nhà
                        </button>
                        <button
                          type="button"
                          onClick={() => setDraftStatus(prev => ({ ...prev, [st.id]: 'pending' }))}
                          className={`px-2 py-1 rounded-lg text-[11px] font-bold transition ${
                            currentSt === 'pending'
                              ? 'bg-amber-400 text-slate-900 shadow-xs'
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          Chưa
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <input
                        type="text"
                        placeholder="Lý do (ôn thi, thăm nhà...)"
                        value={draftReasons[st.id] || ''}
                        onChange={e => setDraftReasons(prev => ({ ...prev, [st.id]: e.target.value }))}
                        className="w-full text-xs px-2.5 py-1 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500 bg-slate-50"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredStudents.length === 0 && (
          <div className="py-12 text-center text-slate-400 text-xs">
            Không có học sinh nào phù hợp với bộ lọc đăng ký cuối tuần.
          </div>
        )}

        {/* Bottom Save Bar */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Dữ liệu được lưu trữ tự động và sẵn sàng xuất báo cáo Excel, Word, PDF theo mẫu chính thức.
          </span>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl shadow-md transition"
          >
            LƯU VÀ XÁC NHẬN ĐĂNG KÝ
          </button>
        </div>
      </div>
    </div>
  );
};
