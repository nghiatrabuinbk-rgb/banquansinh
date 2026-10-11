import React from 'react';
import {
  Users,
  Home,
  CheckCircle2,
  XCircle,
  Building,
  CalendarCheck,
  Trophy,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  FileText,
  Clock,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { NavTab } from '../common/Sidebar';

interface MainDashboardProps {
  onNavigateTab: (tab: NavTab) => void;
  onSelectRoomForAttendance?: (roomId: string) => void;
}

export const MainDashboard: React.FC<MainDashboardProps> = ({
  onNavigateTab,
  onSelectRoomForAttendance,
}) => {
  const { rooms, students, stats, alerts, settings } = useData();
  const { currentUser } = useAuth();

  const activeRooms = rooms.filter(r => r.status === 'active');

  const sortedRooms = [...activeRooms].sort(
    (a, b) => (b.currentScore || 0) - (a.currentScore || 0)
  );

  return (
    <div className="space-y-6">
      {/* Top Banner with App and School Identity */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-extrabold uppercase text-blue-700 tracking-wider mb-1 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" /> Hệ Thống Quản Lý Nội Trú Trực Tuyến
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            {settings.schoolName}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {settings.subTitle} • {settings.location} • Năm học {settings.schoolYear}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigateTab('attendance')}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" /> Điểm danh ngay
          </button>
          <button
            onClick={() => onNavigateTab('weekend')}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
          >
            <CalendarCheck className="w-4 h-4" /> DS Cuối tuần
          </button>
          <button
            onClick={() => onNavigateTab('reports')}
            className="px-4 py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
          >
            <FileText className="w-4 h-4" /> Báo cáo tổng hợp
          </button>
        </div>
      </div>

      {/* 5 Main Dashboard Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: HỌC SINH */}
        <div
          onClick={() => onNavigateTab('students')}
          className="bg-white rounded-2xl p-4 border border-slate-200 hover:border-blue-400 transition cursor-pointer shadow-xs group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">HỌC SINH NỘI TRÚ</span>
            <Users className="w-5 h-5 text-blue-600 group-hover:scale-110 transition" />
          </div>
          <div className="text-3xl font-black text-slate-900">{stats.totalStudents}</div>
          <div className="flex items-center justify-between text-xs text-slate-500 mt-2 pt-2 border-t border-slate-100">
            <span>Nam: <strong className="text-slate-800">{stats.maleStudents}</strong></span>
            <span>Nữ: <strong className="text-slate-800">{stats.femaleStudents}</strong></span>
          </div>
        </div>

        {/* Card 2: PHÒNG Ở */}
        <div
          onClick={() => onNavigateTab('rooms')}
          className="bg-white rounded-2xl p-4 border border-slate-200 hover:border-indigo-400 transition cursor-pointer shadow-xs group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">PHÒNG Ở</span>
            <Home className="w-5 h-5 text-indigo-600 group-hover:scale-110 transition" />
          </div>
          <div className="text-3xl font-black text-slate-900">{stats.totalRooms}</div>
          <div className="flex items-center justify-between text-xs text-slate-500 mt-2 pt-2 border-t border-slate-100">
            <span className="text-emerald-600 font-semibold">Đã nhập: {stats.completedEveningRooms}</span>
            <span className="text-rose-600 font-semibold">Chưa: {stats.totalRooms - stats.completedEveningRooms}</span>
          </div>
        </div>

        {/* Card 3: ĐIỂM DANH */}
        <div
          onClick={() => onNavigateTab('attendance')}
          className="bg-white rounded-2xl p-4 border border-slate-200 hover:border-emerald-400 transition cursor-pointer shadow-xs group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">ĐIỂM DANH SÁNG</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition" />
          </div>
          <div className="text-3xl font-black text-emerald-600">{stats.presentMorning}</div>
          <div className="flex items-center justify-between text-xs text-slate-500 mt-2 pt-2 border-t border-slate-100">
            <span className="text-rose-600 font-semibold">Vắng: {stats.absentExcusedMorning + stats.absentUnexcusedMorning}</span>
            <span className="text-amber-600 font-semibold">Về nhà: {stats.homeMorning}</span>
          </div>
        </div>

        {/* Card 4: CUỐI TUẦN */}
        <div
          onClick={() => onNavigateTab('weekend')}
          className="bg-white rounded-2xl p-4 border border-slate-200 hover:border-purple-400 transition cursor-pointer shadow-xs group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Ở LẠI CUỐI TUẦN</span>
            <CalendarCheck className="w-5 h-5 text-purple-600 group-hover:scale-110 transition" />
          </div>
          <div className="text-3xl font-black text-purple-600">{stats.weekendStayCount}</div>
          <div className="flex items-center justify-between text-xs text-slate-500 mt-2 pt-2 border-t border-slate-100">
            <span>Về nhà: <strong className="text-slate-800">{stats.weekendHomeCount}</strong></span>
            <span className="text-amber-600 font-bold">Chưa ĐK: {stats.weekendPendingCount}</span>
          </div>
        </div>

        {/* Card 5: THI ĐUA */}
        <div
          onClick={() => onNavigateTab('inspection')}
          className="bg-white rounded-2xl p-4 border border-slate-200 hover:border-amber-400 transition cursor-pointer shadow-xs group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">THI ĐUA TUẦN</span>
            <Trophy className="w-5 h-5 text-amber-500 group-hover:scale-110 transition" />
          </div>
          <div className="text-3xl font-black text-amber-600">{stats.avgInspectionScore}đ</div>
          <div className="flex items-center justify-between text-xs text-slate-500 mt-2 pt-2 border-t border-slate-100">
            <span className="text-emerald-700 font-bold">Dẫn đầu: {stats.topRoomName}</span>
            <span className="text-slate-400">Tuần {settings.currentWeek}</span>
          </div>
        </div>
      </div>

      {/* Main Section: Room Grid with Status Badges and Inspection Ranking */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Room status grid */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-base">TÌNH TRẠNG CÁC PHÒNG Ở</h3>
              <p className="text-xs text-slate-500">Bấm vào phòng để xem danh sách hoặc điểm danh</p>
            </div>
            <button
              onClick={() => onNavigateTab('rooms')}
              className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
            >
              Quản lý chi tiết <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {rooms.map(room => (
              <div
                key={room.id}
                onClick={() => onSelectRoomForAttendance && onSelectRoomForAttendance(room.id)}
                className="p-3.5 rounded-xl border border-slate-200/90 hover:border-blue-400 hover:shadow-xs transition bg-white cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-black text-base text-slate-900 group-hover:text-blue-600">
                    {room.roomNumber}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      room.eveningAttendanceDone
                        ? 'bg-emerald-100 text-emerald-800'
                        : room.morningAttendanceDone
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {room.eveningAttendanceDone ? 'Đã nộp tối' : room.morningAttendanceDone ? 'Chờ tối' : 'Chưa nộp'}
                  </span>
                </div>

                <div className="text-xs text-slate-600 font-medium truncate">{room.name}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  GV: <strong className="text-slate-700">{room.assignedTeacherName || 'Chưa phân công'}</strong>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">
                    Sĩ số: <strong className="text-slate-800">{room.currentOccupancy}</strong>/{room.capacity}
                  </span>
                  <span className="font-bold text-amber-600">{room.currentScore || 90} điểm</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Thi Đua Chart & Cảnh Báo */}
        <div className="space-y-6">
          {/* Thi đua bar ranking */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-500" /> BẢNG XẾP HẠNG THI ĐUA
              </h3>
              <span className="text-[11px] text-slate-500">Thang 100đ</span>
            </div>

            <div className="space-y-2.5">
              {sortedRooms.slice(0, 6).map((r, idx) => {
                const score = r.currentScore || 90;
                const percent = Math.min(Math.max(score, 0), 100);
                return (
                  <div key={r.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-800">
                        #{idx + 1} {r.roomNumber} - {r.name}
                      </span>
                      <span className="text-blue-700 font-bold">{score}đ</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          idx === 0
                            ? 'bg-gradient-to-r from-amber-400 to-amber-600'
                            : idx === 1
                            ? 'bg-gradient-to-r from-slate-400 to-slate-600'
                            : idx === 2
                            ? 'bg-gradient-to-r from-amber-600 to-amber-800'
                            : 'bg-blue-500'
                        }`}
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => onNavigateTab('inspection')}
              className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition text-center mt-2 border border-slate-200/80"
            >
              Xem chi tiết 7 tiêu chí thi đua
            </button>
          </div>

          {/* Cảnh Báo Card */}
          <div className="bg-white rounded-2xl border border-rose-200 p-5 shadow-xs">
            <h3 className="font-bold text-rose-900 text-sm flex items-center gap-1.5 mb-3">
              <AlertTriangle className="w-4 h-4 text-rose-600" /> CẢNH BÁO DỮ LIỆU
            </h3>
            <div className="space-y-2 text-xs">
              {alerts.slice(0, 3).map(a => (
                <div key={a.id} className="p-2.5 rounded-xl bg-rose-50/70 border border-rose-100">
                  <div className="font-bold text-rose-900">{a.title}</div>
                  <div className="text-slate-600 mt-0.5">{a.message}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
