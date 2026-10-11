import React from 'react';
import {
  Users,
  Home,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Trophy,
  ArrowRight,
  Sparkles,
  FileSpreadsheet,
  CalendarCheck,
  Send,
  Building,
  UserCheck,
  Plus
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { NavTab } from '../common/Sidebar';

interface HeadMasterDashboardProps {
  onNavigateTab: (tab: NavTab) => void;
  onSelectRoomForAttendance?: (roomId: string) => void;
}

export const HeadMasterDashboard: React.FC<HeadMasterDashboardProps> = ({
  onNavigateTab,
  onSelectRoomForAttendance,
}) => {
  const { rooms, stats, alerts, inspections, settings, triggerOpenAddRoomModal } = useData();
  const { currentUser } = useAuth();

  // Top 5 inspection rooms
  const sortedRooms = [...rooms]
    .filter(r => r.status === 'active')
    .sort((a, b) => (b.currentScore || 0) - (a.currentScore || 0));

  const top5Rooms = sortedRooms.slice(0, 5);

  const getRankBadge = (idx: number) => {
    switch (idx) {
      case 0:
        return <span className="text-xl">🥇</span>;
      case 1:
        return <span className="text-xl">🥈</span>;
      case 2:
        return <span className="text-xl">🥉</span>;
      default:
        return (
          <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-extrabold text-xs flex items-center justify-center">
            {idx + 1}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Headmaster Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-bold mb-3">
              👨💼 TRƯỞNG BAN QUẢN LÝ NỘI TRÚ
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-1">
              Thầy {settings.headMasterName}
            </h2>
            <p className="text-sm text-blue-200/90 max-w-xl">
              Hệ thống theo dõi và điều hành toàn bộ khu nội trú Trường PTDTBT THCS Xã Trà Đốc - TP. Đà Nẵng
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => {
                triggerOpenAddRoomModal();
                onNavigateTab('rooms');
              }}
              className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl text-xs font-black shadow-lg shadow-indigo-500/30 transition flex items-center gap-1.5"
              title="Trưởng ban Quản lý có quyền tự thêm phòng ở và phân bổ sĩ số nội trú"
            >
              <Plus className="w-4 h-4 text-amber-300" /> Tự thêm phòng ở ngay
            </button>
            <button
              onClick={() => onNavigateTab('attendance')}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/30 transition flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" /> Kiểm tra điểm danh
            </button>
            <button
              onClick={() => onNavigateTab('inspection')}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-bold shadow-lg shadow-amber-500/30 transition flex items-center gap-1.5"
            >
              <Trophy className="w-4 h-4" /> Chấm điểm thi đua
            </button>
            <button
              onClick={() => onNavigateTab('export')}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-4 h-4" /> Xuất báo cáo
            </button>
          </div>
        </div>
      </div>

      {/* Quyền Thêm Phòng Ở Của Trưởng Ban Quản Lý */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 rounded-3xl p-5 sm:p-6 text-white border border-indigo-500/30 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-950 font-black text-[11px] uppercase tracking-wider flex items-center gap-1">
                👑 Quyền hạn Trưởng Ban Quản Lý
              </span>
              <span className="text-xs font-black text-amber-300">
                Toàn quyền thêm phòng ở, cấu hình tiện nghi và tự nhập học sinh nội trú
              </span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">
              Theo đúng chức năng nhiệm vụ: <strong>Trưởng ban Quản lý Thầy {settings.headMasterName}</strong> có toàn quyền <strong>tự thêm phòng ở học sinh</strong> (từng phòng đơn lẻ hoặc tạo hàng loạt theo các Khu A/B/C), thiết lập cơ sở vật chất (10 giường tầng sắt, tủ cá nhân 20 ngăn), phân công giáo viên trực phòng và <strong>tự nhập trực tiếp học sinh theo từng nóc, thôn</strong> vào phòng ở.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => {
                triggerOpenAddRoomModal();
                onNavigateTab('rooms');
              }}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 rounded-xl text-xs font-black shadow-md shadow-amber-500/20 transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 text-slate-950" /> Tự Thêm Phòng Ở Mới
            </button>
            <button
              onClick={() => onNavigateTab('rooms')}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <Building className="w-4 h-4 text-blue-300" /> Quản Lý {rooms.length} Phòng Ở
            </button>
            <button
              onClick={() => onNavigateTab('students')}
              className="px-4 py-2.5 bg-emerald-600/80 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <Users className="w-4 h-4" /> Tự Nhập Học Sinh Vào Phòng
            </button>
          </div>
        </div>
      </div>

      {/* 6 Key Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Students */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Tổng học sinh</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">{stats.totalStudents}</div>
          <div className="text-[11px] text-slate-500 mt-1">
            Nam: {stats.maleStudents} | Nữ: {stats.femaleStudents}
          </div>
        </div>

        {/* Total Rooms */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Tổng phòng</span>
            <Home className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">{stats.totalRooms}</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">
            {rooms.filter(r => r.status === 'active').length} đang hoạt động
          </div>
        </div>

        {/* Present */}
        <div className="bg-white rounded-2xl p-4 border border-emerald-200/80 shadow-xs bg-emerald-50/20">
          <div className="flex items-center justify-between text-emerald-700 mb-2">
            <span className="text-xs font-semibold">🟢 Có mặt</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-700">{stats.presentMorning}</div>
          <div className="text-[11px] text-emerald-600 mt-1">Điểm danh sáng</div>
        </div>

        {/* Absent */}
        <div className="bg-white rounded-2xl p-4 border border-rose-200/80 shadow-xs bg-rose-50/20">
          <div className="flex items-center justify-between text-rose-700 mb-2">
            <span className="text-xs font-semibold">🔴 Vắng</span>
            <XCircle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-700">
            {stats.absentExcusedMorning + stats.absentUnexcusedMorning}
          </div>
          <div className="text-[11px] text-rose-600 mt-1">
            Phép: {stats.absentExcusedMorning} | KP: {stats.absentUnexcusedMorning}
          </div>
        </div>

        {/* Home */}
        <div className="bg-white rounded-2xl p-4 border border-amber-200/80 shadow-xs bg-amber-50/20">
          <div className="flex items-center justify-between text-amber-800 mb-2">
            <span className="text-xs font-semibold">🏡 Về nhà</span>
            <Building className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-800">{stats.homeMorning}</div>
          <div className="text-[11px] text-amber-700 mt-1">Về nhà trong tuần</div>
        </div>

        {/* Weekend Stay */}
        <div className="bg-white rounded-2xl p-4 border border-purple-200/80 shadow-xs bg-purple-50/20">
          <div className="flex items-center justify-between text-purple-700 mb-2">
            <span className="text-xs font-semibold">🏫 Ở lại cuối tuần</span>
            <CalendarCheck className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-purple-700">{stats.weekendStayCount}</div>
          <div className="text-[11px] text-purple-600 mt-1">Về nhà: {stats.weekendHomeCount} em</div>
        </div>
      </div>

      {/* Main Grid: Room Submission Progress & Top 5 Ranking */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Room Submission Progress Matrix */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                TIẾN ĐỘ NHẬP DỮ LIỆU CÁC PHÒNG
              </h3>
              <p className="text-xs text-slate-500">
                Theo dõi tình trạng nhập điểm danh sáng, tối và đăng ký cuối tuần của từng phòng
              </p>
            </div>
            {/* Color Legend */}
            <div className="flex items-center gap-3 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-emerald-700">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Đã hoàn thành
              </span>
              <span className="flex items-center gap-1.5 text-amber-700">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Đang nhập
              </span>
              <span className="flex items-center gap-1.5 text-rose-700">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Chưa nhập
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {rooms.map(room => {
              const isFullDone = room.morningAttendanceDone && room.eveningAttendanceDone;
              const isPartial = room.morningAttendanceDone && !room.eveningAttendanceDone;
              const isNotDone = !room.morningAttendanceDone && !room.eveningAttendanceDone;

              const cardBg = isFullDone
                ? 'bg-emerald-50/60 border-emerald-200 hover:border-emerald-300'
                : isPartial
                ? 'bg-amber-50/60 border-amber-200 hover:border-amber-300'
                : 'bg-rose-50/60 border-rose-200 hover:border-rose-300';

              const badgeColor = isFullDone
                ? 'bg-emerald-100 text-emerald-800'
                : isPartial
                ? 'bg-amber-100 text-amber-800'
                : 'bg-rose-100 text-rose-800';

              const statusText = isFullDone
                ? '🟢 Đã hoàn thành'
                : isPartial
                ? '🟡 Chưa điểm danh tối'
                : '🔴 Chưa nhập sáng/tối';

              return (
                <div
                  key={room.id}
                  onClick={() => onSelectRoomForAttendance && onSelectRoomForAttendance(room.id)}
                  className={`p-3.5 rounded-xl border transition cursor-pointer ${cardBg} shadow-2xs`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-extrabold text-slate-900 text-base">{room.roomNumber}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${badgeColor}`}>
                      {statusText}
                    </span>
                  </div>

                  <div className="text-xs font-semibold text-slate-700 truncate">{room.name}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    GV: <strong className="text-slate-800">{room.assignedTeacherName || 'Chưa phân công'}</strong>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-600">
                    <div>
                      Sáng: {room.morningAttendanceDone ? '✓' : '✗'} | Tối: {room.eveningAttendanceDone ? '✓' : '✗'}
                    </div>
                    <div className="font-bold text-blue-700">
                      Thi đua: {room.currentScore || 90}đ
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Col: Top 5 Thi Đua & Cảnh Báo Khẩn Cấp */}
        <div className="space-y-6">
          {/* Top 5 Thi Đua */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-500" /> TOP PHÒNG THI ĐUA XUẤT SẮC
              </h3>
              <button
                onClick={() => onNavigateTab('inspection')}
                className="text-xs font-bold text-blue-600 hover:underline"
              >
                Xem tất cả
              </button>
            </div>

            <div className="space-y-2.5">
              {top5Rooms.map((room, idx) => (
                <div
                  key={room.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/70 transition"
                >
                  <div className="flex items-center gap-3">
                    {getRankBadge(idx)}
                    <div>
                      <div className="font-bold text-xs text-slate-900">{room.roomNumber} - {room.name}</div>
                      <div className="text-[11px] text-slate-500">{room.assignedTeacherName}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-black text-amber-600">{room.currentScore || 90}đ</div>
                    <div className="text-[10px] text-slate-400">Tuần {settings.currentWeek}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cảnh Báo Khẩn Cấp Box */}
          <div className="bg-rose-50/70 border border-rose-200 rounded-2xl p-5 shadow-xs">
            <h3 className="font-bold text-rose-900 text-sm flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-rose-600" /> CẢNH BÁO CẦN XỬ LÝ NGAY
            </h3>

            {alerts.length === 0 ? (
              <div className="text-xs text-emerald-700 font-semibold bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                ✓ Tất cả các phòng đều thực hiện nghiêm túc, không có cảnh báo vi phạm.
              </div>
            ) : (
              <div className="space-y-2">
                {alerts.slice(0, 4).map(alert => (
                  <div key={alert.id} className="text-xs bg-white p-2.5 rounded-xl border border-rose-100 shadow-2xs">
                    <div className="font-bold text-rose-800">{alert.title}</div>
                    <div className="text-slate-600 mt-0.5 leading-relaxed">{alert.message}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
