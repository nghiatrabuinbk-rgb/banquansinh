import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  FileText,
  Printer,
  Calendar,
  BarChart3,
  TrendingUp,
  Download,
  Users,
  CheckCircle2,
  XCircle,
  Trophy,
  Filter
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { exportHelper, ExportReportData } from '../../services/exportHelper';

export const ReportCenter: React.FC = () => {
  const { rooms, students, attendance, weekend, inspections, stats, settings } = useData();
  const { currentUser } = useAuth();

  const [reportType, setReportType] = useState<'daily' | 'weekly' | 'monthly' | 'semester' | 'yearly'>('daily');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [selectedWeek, setSelectedWeek] = useState<number>(settings.currentWeek);
  const [selectedMonth, setSelectedMonth] = useState<number>(10);

  // Generate Report Data Structure based on chosen report type
  const reportPayload: ExportReportData = useMemo(() => {
    const creatorName = currentUser.name;
    const reviewerName = 'Nguyễn Trọng Nghĩa (Trưởng ban QLNT)';

    if (reportType === 'daily') {
      const dayAttendance = attendance.filter(a => a.date === selectedDate);
      const morningRecords = dayAttendance.filter(a => a.session === 'morning');
      const presentCount = morningRecords.filter(a => a.status === 'present').length;
      const absentP = morningRecords.filter(a => a.status === 'absent_excused').length;
      const absentKP = morningRecords.filter(a => a.status === 'absent_unexcused').length;
      const homeCount = morningRecords.filter(a => a.status === 'home').length;

      const headers = ['STT', 'Phòng', 'Khu', 'Sĩ số', 'GV Phụ trách', 'Điểm danh Sáng', 'Điểm danh Tối', 'Ghi chú vắng / phát sinh'];
      const rows = rooms.map((r, idx) => {
        const roomMorning = morningRecords.filter(a => a.roomId === r.id);
        const present = roomMorning.filter(a => a.status === 'present').length;
        const absentNotes = roomMorning.filter(a => a.status !== 'present').map(a => `${a.studentName} (${a.note || a.status})`).join(', ');

        return [
          idx + 1,
          r.roomNumber,
          r.buildingZone,
          r.currentOccupancy,
          r.assignedTeacherName || 'Chưa gán',
          r.morningAttendanceDone ? `Có mặt: ${present}/${r.currentOccupancy}` : 'Chưa nhập',
          r.eveningAttendanceDone ? 'Đã nộp đầy đủ' : 'Chưa hoàn thành',
          absentNotes || 'Nề nếp ổn định',
        ];
      });

      return {
        title: 'BÁO CÁO TÌNH HÌNH NỘI TRÚ TRONG NGÀY',
        subTitle: `Ngày thực hiện: ${selectedDate} - Năm học ${settings.schoolYear}`,
        reportDate: selectedDate,
        creatorName,
        reviewerName,
        summaryStats: [
          { label: 'Tổng số học sinh nội trú', value: `${stats.totalStudents} em` },
          { label: 'Học sinh có mặt sáng', value: `${presentCount} em` },
          { label: 'Học sinh vắng có phép', value: `${absentP} em` },
          { label: 'Học sinh vắng không phép', value: `${absentKP} em` },
          { label: 'Học sinh về nhà trong ngày', value: `${homeCount} em` },
          { label: 'Số phòng đã hoàn thành nộp', value: `${stats.completedEveningRooms}/${stats.totalRooms} phòng` },
        ],
        headers,
        rows,
        notes: 'Báo cáo tổng hợp tình hình nề nếp và quân số học sinh nội trú trong ngày để gửi Ban Giám hiệu theo dõi chỉ đạo.',
      };
    } else if (reportType === 'weekly') {
      const headers = ['Hạng', 'Phòng', 'GV Phụ trách', 'Nội quy', 'Vệ sinh phòng', 'Nề nếp', 'Khu vực', 'Trực tuần', 'Phong trào', 'Tổng điểm', 'Đánh giá'];
      const sorted = [...rooms]
        .filter(r => r.status === 'active')
        .sort((a, b) => (b.currentScore || 0) - (a.currentScore || 0));

      const rows = sorted.map((r, idx) => {
        const score = r.currentScore || 90;
        const rankLabel = idx === 0 ? 'Hạng 1 (Xuất sắc)' : idx === 1 ? 'Hạng 2 (Tốt)' : idx === 2 ? 'Hạng 3 (Khá)' : `Hạng ${idx + 1}`;
        return [
          idx + 1,
          r.roomNumber,
          r.assignedTeacherName || 'Chưa gán',
          20,
          19,
          15,
          14,
          10,
          18,
          `${score}đ`,
          rankLabel,
        ];
      });

      return {
        title: `BÁO CÁO THI ĐUA VÀ NỀ NẾP TUẦN ${selectedWeek}`,
        subTitle: `Tuần học thứ ${selectedWeek} - Năm học ${settings.schoolYear}`,
        reportDate: new Date().toLocaleDateString('vi-VN'),
        creatorName,
        reviewerName,
        summaryStats: [
          { label: 'Tổng số phòng tham gia thi đua', value: `${sorted.length} phòng` },
          { label: 'Điểm trung bình toàn khu', value: `${stats.avgInspectionScore}/100 điểm` },
          { label: 'Phòng xuất sắc dẫn đầu', value: stats.topRoomName },
          { label: 'Phòng cần tăng cường nề nếp', value: stats.lowestRoomName },
        ],
        headers,
        rows,
        notes: 'Căn cứ bảng xếp hạng thi đua tuần để biểu dương trong buổi sinh hoạt đầu tuần và trừ điểm thi đua các phòng vi phạm.',
      };
    } else {
      // Monthly / Semester / Yearly
      const titleName = reportType === 'monthly' ? `BÁO CÁO TỔNG KẾT NỘI TRÚ THÁNG ${selectedMonth}` : reportType === 'semester' ? 'BÁO CÁO TỔNG KẾT HỌC KỲ I NỘI TRÚ' : 'BÁO CÁO TỔNG KẾT NĂM HỌC NỘI TRÚ';
      const headers = ['STT', 'Phòng', 'Sĩ số', 'GV Phụ trách', 'Tỷ lệ chuyên cần', 'Điểm thi đua TB', 'Xếp loại chung', 'Ghi chú'];
      const rows = rooms.map((r, idx) => [
        idx + 1,
        r.roomNumber,
        r.currentOccupancy,
        r.assignedTeacherName || 'Chưa gán',
        '98.5%',
        `${r.currentScore || 92}đ`,
        (r.currentScore || 90) >= 95 ? 'Tốt' : 'Khá',
        'Hoàn thành chỉ tiêu',
      ]);

      return {
        title: titleName,
        subTitle: `Năm học ${settings.schoolYear} - Trường PTDTBT THCS Xã Trà Đốc`,
        reportDate: new Date().toLocaleDateString('vi-VN'),
        creatorName,
        reviewerName,
        headers,
        rows,
        notes: 'Báo cáo lưu trữ hồ sơ phục vụ công tác thanh kiểm tra của Phòng GD&ĐT và báo cáo Ban Giám hiệu.',
      };
    }
  }, [reportType, selectedDate, selectedWeek, selectedMonth, attendance, rooms, stats, currentUser, settings]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold uppercase text-purple-700 tracking-wider mb-1 flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4" /> Trung Tâm Báo Cáo & Hồ Sơ Lưu Trữ
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            Hệ Thống Báo Cáo Nội Trú Tự Động
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Báo cáo chuẩn thể thức văn bản hành chính Việt Nam, hỗ trợ in ấn và xuất file
          </p>
        </div>

        {/* 3 Main Export Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => exportHelper.exportToExcel(reportPayload, `Bao_Cao_${reportType}`)}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 transition flex items-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4" /> XUẤT EXCEL (.XLSX)
          </button>
          <button
            onClick={() => exportHelper.exportToWord(reportPayload, `Bao_Cao_${reportType}`)}
            className="px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 transition flex items-center gap-2"
          >
            <FileText className="w-4 h-4" /> XUẤT WORD (.DOC)
          </button>
          <button
            onClick={() => exportHelper.openPrintPreview(reportPayload)}
            className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-500/20 transition flex items-center gap-2"
          >
            <Printer className="w-4 h-4" /> XUẤT PDF / IN A4
          </button>
        </div>
      </div>

      {/* Report Type Selector Tabs */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setReportType('daily')}
            className={`px-3.5 py-2 rounded-lg font-bold transition ${
              reportType === 'daily' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            1. Báo cáo Ngày
          </button>
          <button
            onClick={() => setReportType('weekly')}
            className={`px-3.5 py-2 rounded-lg font-bold transition ${
              reportType === 'weekly' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            2. Báo cáo Tuần
          </button>
          <button
            onClick={() => setReportType('monthly')}
            className={`px-3.5 py-2 rounded-lg font-bold transition ${
              reportType === 'monthly' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            3. Báo cáo Tháng
          </button>
          <button
            onClick={() => setReportType('semester')}
            className={`px-3.5 py-2 rounded-lg font-bold transition ${
              reportType === 'semester' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            4. Báo cáo Học kỳ
          </button>
          <button
            onClick={() => setReportType('yearly')}
            className={`px-3.5 py-2 rounded-lg font-bold transition ${
              reportType === 'yearly' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            5. Báo cáo Năm học
          </button>
        </div>

        {/* Date / Week filter */}
        <div className="flex items-center gap-2">
          {reportType === 'daily' && (
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 rounded-xl bg-white font-semibold"
            />
          )}

          {reportType === 'weekly' && (
            <select
              value={selectedWeek}
              onChange={e => setSelectedWeek(Number(e.target.value))}
              className="px-3 py-1.5 border border-slate-300 rounded-xl bg-white font-semibold"
            >
              {Array.from({ length: 35 }, (_, i) => i + 1).map(w => (
                <option key={w} value={w}>
                  Tuần thứ {w}
                </option>
              ))}
            </select>
          )}

          {reportType === 'monthly' && (
            <select
              value={selectedMonth}
              onChange={e => setSelectedMonth(Number(e.target.value))}
              className="px-3 py-1.5 border border-slate-300 rounded-xl bg-white font-semibold"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                <option key={m} value={m}>
                  Tháng {m}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Live Preview Paper Canvas */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm max-w-5xl mx-auto space-y-6">
        {/* Official Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-200 text-center sm:text-left">
          <div>
            <div className="font-extrabold text-sm uppercase text-slate-800">
              TRƯỜNG PTDTBT THCS XÃ TRÀ ĐỐC
            </div>
            <div className="text-xs text-slate-600 font-semibold italic">BAN QUẢN LÝ NỘI TRÚ</div>
            <div className="w-24 h-0.5 bg-slate-400 mx-auto sm:mx-0 mt-1"></div>
          </div>

          <div className="text-center sm:text-right">
            <div className="font-extrabold text-xs uppercase text-slate-800">
              CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
            </div>
            <div className="text-xs text-slate-700 font-bold">Độc lập - Tự do - Hạnh phúc</div>
            <div className="w-28 h-0.5 bg-slate-400 mx-auto sm:ml-auto sm:mr-0 mt-1"></div>
            <div className="text-[11px] text-slate-500 italic mt-1.5">
              Trà Đốc, ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="text-center space-y-1">
          <h3 className="text-lg sm:text-2xl font-black text-blue-950 uppercase tracking-tight">
            {reportPayload.title}
          </h3>
          <p className="text-xs text-slate-600 italic">{reportPayload.subTitle}</p>
        </div>

        {/* Quick Stats Highlights */}
        {reportPayload.summaryStats && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
            {reportPayload.summaryStats.map((stat, i) => (
              <div key={i}>
                <span className="text-slate-500">{stat.label}: </span>
                <strong className="text-slate-900">{stat.value}</strong>
              </div>
            ))}
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse border border-slate-200 text-xs">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-[11px] font-bold text-slate-800">
                {reportPayload.headers.map((h, i) => (
                  <th key={i} className="p-2.5 border border-slate-300 text-center">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {reportPayload.rows.map((row, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="p-2.5 border border-slate-200 text-slate-800">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Note */}
        {reportPayload.notes && (
          <div className="text-xs text-slate-500 italic">
            * {reportPayload.notes}
          </div>
        )}

        {/* Signatures */}
        <div className="pt-8 grid grid-cols-2 text-center text-xs">
          <div>
            <div className="font-bold text-slate-800 uppercase">NGƯỜI LẬP BÁO CÁO</div>
            <div className="text-[11px] text-slate-400 italic">(Ký và ghi rõ họ tên)</div>
            <div className="h-16"></div>
            <div className="font-bold text-slate-900">{reportPayload.creatorName}</div>
          </div>

          <div>
            <div className="font-bold text-slate-800 uppercase">TRƯỞNG BAN QUẢN LÝ NỘI TRÚ</div>
            <div className="text-[11px] text-slate-400 italic">(Ký duyệt và ghi rõ họ tên)</div>
            <div className="h-16"></div>
            <div className="font-bold text-slate-900">{reportPayload.reviewerName}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
