import React, { useState, useMemo } from 'react';
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Building,
  UserCheck,
  Calendar,
  Filter,
  FileSpreadsheet,
  Award
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { exportHelper } from '../../services/exportHelper';

export const ProgressTracker: React.FC = () => {
  const { rooms, attendance, weekend, settings } = useData();
  const { currentUser } = useAuth();
  const [filterSort, setFilterSort] = useState<'all' | 'completed' | 'on_time' | 'late' | 'not_submitted'>('all');

  const todayStr = new Date().toISOString().slice(0, 10);

  // Compute status for each room
  const progressList = useMemo(() => {
    return rooms.map(room => {
      const morningRecords = attendance.filter(
        a => a.roomId === room.id && a.session === 'morning' && a.date === todayStr
      );
      const eveningRecords = attendance.filter(
        a => a.roomId === room.id && a.session === 'evening' && a.date === todayStr
      );
      const weekendRecords = weekend.filter(
        w => w.roomId === room.id && w.status !== 'pending'
      );

      const hasMorning = morningRecords.length > 0 || !!room.morningAttendanceDone;
      const hasEvening = eveningRecords.length > 0 || !!room.eveningAttendanceDone;
      const hasWeekend = weekendRecords.length > 0 || !!room.weekendDone;

      // Submission timestamps
      const lastMorningSubmit = morningRecords[0]?.submittedAt || '';
      const lastEveningSubmit = eveningRecords[0]?.submittedAt || '';
      const lastTime = room.lastSubmitTime || (lastEveningSubmit ? lastEveningSubmit.slice(0, 5) : lastMorningSubmit ? lastMorningSubmit.slice(0, 5) : 'Chưa có');

      // Classification: Đã hoàn thành, Chưa hoàn thành, Đúng giờ, Muộn, Chưa nhập
      let category: 'Đã hoàn thành' | 'Đúng giờ' | 'Nhập sớm' | 'Nhập muộn' | 'Chưa hoàn thành' = 'Chưa hoàn thành';
      let badgeColor = 'bg-amber-100 text-amber-800';

      if (hasMorning && hasEvening) {
        category = 'Đã hoàn thành';
        badgeColor = 'bg-emerald-100 text-emerald-800';
      } else if (!hasMorning && !hasEvening) {
        category = 'Chưa hoàn thành';
        badgeColor = 'bg-rose-100 text-rose-800';
      } else {
        category = 'Đúng giờ';
        badgeColor = 'bg-blue-100 text-blue-800';
      }

      return {
        room,
        hasMorning,
        hasEvening,
        hasWeekend,
        lastTime,
        category,
        badgeColor,
      };
    });
  }, [rooms, attendance, weekend, todayStr]);

  const filteredProgress = useMemo(() => {
    if (filterSort === 'completed') {
      return progressList.filter(p => p.hasMorning && p.hasEvening);
    }
    if (filterSort === 'not_submitted') {
      return progressList.filter(p => !p.hasMorning && !p.hasEvening);
    }
    return progressList;
  }, [progressList, filterSort]);

  const handleExport = () => {
    const headers = ['STT', 'Phòng', 'Giáo viên phụ trách', 'Điểm danh sáng', 'Điểm danh tối', 'Đăng ký cuối tuần', 'Thời gian nhập', 'Trạng thái'];
    const rows = filteredProgress.map((p, idx) => [
      idx + 1,
      p.room.roomNumber,
      p.room.assignedTeacherName || 'Chưa phân công',
      p.hasMorning ? 'Đã nhập (✓)' : 'Chưa nhập (✗)',
      p.hasEvening ? 'Đã nhập (✓)' : 'Chưa nhập (✗)',
      p.hasWeekend ? 'Đã nộp (✓)' : 'Chưa xong (✗)',
      p.lastTime,
      p.category,
    ]);

    exportHelper.exportToExcel({
      title: 'BÁO CÁO TIẾN ĐỘ NHẬP DỮ LIỆU CÁC PHÒNG',
      subTitle: `Ngày ${todayStr} - Trường PTDTBT THCS Xã Trà Đốc`,
      reportDate: new Date().toLocaleDateString('vi-VN'),
      creatorName: currentUser.name,
      reviewerName: 'Nguyễn Trọng Nghĩa',
      headers,
      rows,
    }, 'Tien_Do_Nhap_Lieu');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold uppercase text-blue-700 tracking-wider mb-1 flex items-center gap-1.5">
            <Clock className="w-4 h-4" /> Giám Sát Thời Gian & Tiến Độ Nhập Dữ Liệu
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            Tiến Độ Nhập Dữ Liệu Các Phòng
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Theo dõi chi tiết thời gian giáo viên nộp điểm danh sáng, tối và cuối tuần làm tiêu chí thi đua
          </p>
        </div>

        <button
          onClick={handleExport}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 transition flex items-center gap-1.5"
        >
          <FileSpreadsheet className="w-4 h-4" /> Xuất Tiến Độ (Excel)
        </button>
      </div>

      {/* Filter Options */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setFilterSort('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              filterSort === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Tất cả phòng ({rooms.length})
          </button>
          <button
            onClick={() => setFilterSort('completed')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              filterSort === 'completed' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            🟢 Đã hoàn thành ({progressList.filter(p => p.hasMorning && p.hasEvening).length})
          </button>
          <button
            onClick={() => setFilterSort('not_submitted')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              filterSort === 'not_submitted' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            🔴 Chưa nộp sáng/tối ({progressList.filter(p => !p.hasMorning && !p.hasEvening).length})
          </button>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Khung giờ chuẩn: Sáng ({settings.morningTimeWindow.start} - {settings.morningTimeWindow.end}) | Tối ({settings.eveningTimeWindow.start} - {settings.eveningTimeWindow.end})
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-extrabold uppercase tracking-wider text-slate-600">
                <th className="py-3.5 px-4 text-center w-12">Phòng</th>
                <th className="py-3.5 px-4">Giáo viên phụ trách</th>
                <th className="py-3.5 px-4 text-center">Điểm danh sáng</th>
                <th className="py-3.5 px-4 text-center">Điểm danh tối</th>
                <th className="py-3.5 px-4 text-center">Cuối tuần</th>
                <th className="py-3.5 px-4 text-center">Thời gian nhập</th>
                <th className="py-3.5 px-4 text-center">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredProgress.map(({ room, hasMorning, hasEvening, hasWeekend, lastTime, category, badgeColor }) => (
                <tr key={room.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3.5 px-4 text-center font-black text-slate-900 text-sm">
                    {room.roomNumber}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-800">{room.assignedTeacherName || 'Chưa phân công'}</div>
                    <div className="text-[11px] text-slate-400">{room.buildingZone}</div>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {hasMorning ? (
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/50">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Đã nhập
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md">
                        <XCircle className="w-3.5 h-3.5 text-rose-500" /> Chưa
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {hasEvening ? (
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/50">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Đã nhập
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                        <Clock className="w-3.5 h-3.5 text-amber-500" /> Chờ tối
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {hasWeekend ? (
                      <span className="text-emerald-700 font-bold">✓ Đã nộp</span>
                    ) : (
                      <span className="text-slate-400">Chưa xong</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-700">
                    {lastTime}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${badgeColor}`}>
                      {category}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
