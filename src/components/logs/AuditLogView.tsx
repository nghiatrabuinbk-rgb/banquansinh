import React, { useState, useMemo } from 'react';
import {
  History,
  Search,
  Filter,
  UserCheck,
  Calendar,
  FileSpreadsheet,
  Download
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { exportHelper } from '../../services/exportHelper';

export const AuditLogView: React.FC = () => {
  const { auditLogs } = useData();
  const { currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterModule, setFilterModule] = useState('all');

  const filteredLogs = useMemo(() => {
    return auditLogs.filter(log => {
      if (filterModule !== 'all' && log.module !== filterModule) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          log.userName.toLowerCase().includes(q) ||
          log.action.toLowerCase().includes(q) ||
          log.details.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [auditLogs, filterModule, searchQuery]);

  const handleExport = () => {
    const headers = ['STT', 'Thời gian', 'Người thực hiện', 'Hành động', 'Phân hệ', 'Nội dung chi tiết'];
    const rows = filteredLogs.map((l, idx) => [
      idx + 1,
      l.timestamp,
      l.userName,
      l.action,
      l.module,
      l.details,
    ]);

    exportHelper.exportToExcel({
      title: 'NHẬT KÝ THAO TÁC HỆ THỐNG NỘI TRÚ',
      subTitle: `Trường PTDTBT THCS Xã Trà Đốc - Trích xuất ngày ${new Date().toLocaleDateString('vi-VN')}`,
      reportDate: new Date().toLocaleDateString('vi-VN'),
      creatorName: currentUser.name,
      reviewerName: 'Nguyễn Trọng Nghĩa',
      headers,
      rows,
    }, 'Nhat_Ky_He_Thong');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold uppercase text-slate-600 tracking-wider mb-1 flex items-center gap-1.5">
            <History className="w-4 h-4 text-blue-600" /> Giám Sát & Bảo Mật Hệ Thống
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            Nhật Ký Thao Tác Hệ Thống (Audit Logs)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Ghi nhận toàn bộ thao tác đăng nhập, điểm danh, chấm thi đua, sửa đổi và xuất file
          </p>
        </div>

        <button
          onClick={handleExport}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 transition flex items-center gap-2"
        >
          <FileSpreadsheet className="w-4 h-4" /> Xuất Nhật Ký (Excel)
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Tìm theo người dùng, nội dung..."
              className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-xl"
            />
          </div>

          <select
            value={filterModule}
            onChange={e => setFilterModule(e.target.value)}
            className="px-3 py-1.5 border border-slate-300 rounded-xl bg-white font-semibold"
          >
            <option value="all">Tất cả phân hệ</option>
            <option value="Điểm danh">Điểm danh</option>
            <option value="Thi đua">Thi đua</option>
            <option value="Đăng ký cuối tuần">Đăng ký cuối tuần</option>
            <option value="Học sinh">Học sinh</option>
            <option value="Phòng ở">Phòng ở</option>
            <option value="Minh chứng">Minh chứng</option>
            <option value="Người dùng">Người dùng</option>
            <option value="Xác thực">Xác thực</option>
          </select>
        </div>

        <span className="text-slate-500">
          Hiển thị <strong>{filteredLogs.length}</strong> nhật ký
        </span>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-extrabold uppercase tracking-wider text-slate-600">
                <th className="py-3 px-4 w-44">Thời gian</th>
                <th className="py-3 px-4">Người thực hiện</th>
                <th className="py-3 px-4">Hành động</th>
                <th className="py-3 px-4">Phân hệ</th>
                <th className="py-3 px-4">Nội dung chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900">{log.userName}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-md font-semibold text-[11px] bg-blue-50 text-blue-800 border border-blue-200/50">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-600">{log.module}</td>
                  <td className="py-3 px-4 text-slate-700 leading-relaxed font-medium">
                    {log.details}
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
