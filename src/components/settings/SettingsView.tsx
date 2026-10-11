import React, { useState } from 'react';
import {
  Settings,
  Clock,
  Trophy,
  Database,
  Download,
  Upload,
  RotateCcw,
  CheckCircle2,
  Save,
  Shield,
  Cloud
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { storageService } from '../../services/storage';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, resetToSampleData } = useData();
  const { canEditSettings } = useAuth();

  const [morningStart, setMorningStart] = useState(settings.morningTimeWindow.start);
  const [morningEnd, setMorningEnd] = useState(settings.morningTimeWindow.end);
  const [eveningStart, setEveningStart] = useState(settings.eveningTimeWindow.start);
  const [eveningEnd, setEveningEnd] = useState(settings.eveningTimeWindow.end);

  const [rulesWeight, setRulesWeight] = useState(settings.scoreWeights.rules);
  const [roomHygieneWeight, setRoomHygieneWeight] = useState(settings.scoreWeights.roomHygiene);
  const [disciplineWeight, setDisciplineWeight] = useState(settings.scoreWeights.discipline);
  const [areaHygieneWeight, setAreaHygieneWeight] = useState(settings.scoreWeights.areaHygiene);
  const [dutyWeight, setDutyWeight] = useState(settings.scoreWeights.duty);
  const [culturalWeight, setCulturalWeight] = useState(settings.scoreWeights.cultural);
  const [sportsWeight, setSportsWeight] = useState(settings.scoreWeights.sports);

  const [headMasterName, setHeadMasterName] = useState(settings.headMasterName);
  const [schoolYear, setSchoolYear] = useState(settings.schoolYear);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const totalPoints =
    rulesWeight +
    roomHygieneWeight +
    disciplineWeight +
    areaHygieneWeight +
    dutyWeight +
    culturalWeight +
    sportsWeight;

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      ...settings,
      headMasterName,
      schoolYear,
      morningTimeWindow: {
        start: morningStart,
        end: morningEnd,
      },
      eveningTimeWindow: {
        start: eveningStart,
        end: eveningEnd,
      },
      scoreWeights: {
        rules: rulesWeight,
        roomHygiene: roomHygieneWeight,
        discipline: disciplineWeight,
        areaHygiene: areaHygieneWeight,
        duty: dutyWeight,
        cultural: culturalWeight,
        sports: sportsWeight,
      },
    });

    setToastMessage('Đã lưu cấu hình hệ thống thành công!');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleExportBackup = () => {
    const jsonStr = storageService.exportFullBackup();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Sao_Luu_Noi_Tru_Tra_Doc_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRestoreBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = evt => {
      const content = evt.target?.result as string;
      const success = storageService.restoreFullBackup(content);
      if (success) {
        alert('Khôi phục dữ liệu thành công! Trang sẽ được làm mới.');
        window.location.reload();
      } else {
        alert('File sao lưu không đúng định dạng!');
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (confirm('CẢNH BÁO: Thao tác này sẽ đặt lại toàn bộ dữ liệu mẫu ban đầu của trường THCS Xã Trà Đốc. Bạn có chắc muốn tiếp tục không?')) {
      resetToSampleData();
      alert('Đã đặt lại dữ liệu gốc thành công!');
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold uppercase text-slate-600 tracking-wider mb-1 flex items-center gap-1.5">
            <Settings className="w-4 h-4 text-blue-600" /> Cấu Hình & Tham Số Hệ Thống
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            Cài Đặt Hệ Thống Nội Trú
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Thiết lập thời gian điểm danh, trọng số thang điểm thi đua, sao lưu & khôi phục
          </p>
        </div>
      </div>

      {toastMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {toastMessage}
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Section 1: Thời gian điểm danh */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Clock className="w-5 h-5 text-blue-600" />
            <h3 className="font-extrabold text-slate-900 text-sm">
              KHUNG GIỜ QUY ĐỊNH ĐIỂM DANH SÁNG & TỐI
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Morning */}
            <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-2xl space-y-3">
              <div className="font-bold text-amber-900 flex items-center justify-between">
                <span>Điểm danh Buổi Sáng</span>
                <span className="text-[11px] text-amber-700">Mặc định: 05:30 - 07:30</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 mb-1">Giờ bắt đầu</label>
                  <input
                    type="time"
                    value={morningStart}
                    onChange={e => setMorningStart(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-xl bg-white font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Giờ kết thúc</label>
                  <input
                    type="time"
                    value={morningEnd}
                    onChange={e => setMorningEnd(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-xl bg-white font-semibold"
                  />
                </div>
              </div>
            </div>

            {/* Evening */}
            <div className="p-4 bg-indigo-50/60 border border-indigo-200 rounded-2xl space-y-3">
              <div className="font-bold text-indigo-900 flex items-center justify-between">
                <span>Điểm danh Buổi Tối</span>
                <span className="text-[11px] text-indigo-700">Mặc định: 19:00 - 21:30</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 mb-1">Giờ bắt đầu</label>
                  <input
                    type="time"
                    value={eveningStart}
                    onChange={e => setEveningStart(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-xl bg-white font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Giờ kết thúc</label>
                  <input
                    type="time"
                    value={eveningEnd}
                    onChange={e => setEveningEnd(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-xl bg-white font-semibold"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Trọng số thang điểm thi đua */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              <h3 className="font-extrabold text-slate-900 text-sm">
                TRỌNG SỐ THANG ĐIỂM THI ĐUA (TỔNG: {totalPoints} ĐIỂM)
              </h3>
            </div>
            <span
              className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                totalPoints === 100 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}
            >
              {totalPoints === 100 ? 'Chuẩn 100đ' : `${totalPoints}đ (Chưa cân)`}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl space-y-1">
              <label className="font-bold text-slate-700">1. Nội quy nhà trường</label>
              <input
                type="number"
                min={0}
                max={50}
                value={rulesWeight}
                onChange={e => setRulesWeight(Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-xl bg-white font-bold"
              />
            </div>

            <div className="p-3 bg-slate-50 rounded-xl space-y-1">
              <label className="font-bold text-slate-700">2. Vệ sinh phòng ở</label>
              <input
                type="number"
                min={0}
                max={50}
                value={roomHygieneWeight}
                onChange={e => setRoomHygieneWeight(Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-xl bg-white font-bold"
              />
            </div>

            <div className="p-3 bg-slate-50 rounded-xl space-y-1">
              <label className="font-bold text-slate-700">3. Nề nếp phòng ở</label>
              <input
                type="number"
                min={0}
                max={50}
                value={disciplineWeight}
                onChange={e => setDisciplineWeight(Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-xl bg-white font-bold"
              />
            </div>

            <div className="p-3 bg-slate-50 rounded-xl space-y-1">
              <label className="font-bold text-slate-700">4. Vệ sinh khu vực</label>
              <input
                type="number"
                min={0}
                max={50}
                value={areaHygieneWeight}
                onChange={e => setAreaHygieneWeight(Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-xl bg-white font-bold"
              />
            </div>

            <div className="p-3 bg-slate-50 rounded-xl space-y-1">
              <label className="font-bold text-slate-700">5. Phòng trực tuần</label>
              <input
                type="number"
                min={0}
                max={50}
                value={dutyWeight}
                onChange={e => setDutyWeight(Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-xl bg-white font-bold"
              />
            </div>

            <div className="p-3 bg-slate-50 rounded-xl space-y-1">
              <label className="font-bold text-slate-700">6. Văn hóa - Văn nghệ</label>
              <input
                type="number"
                min={0}
                max={50}
                value={culturalWeight}
                onChange={e => setCulturalWeight(Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-xl bg-white font-bold"
              />
            </div>

            <div className="p-3 bg-slate-50 rounded-xl space-y-1">
              <label className="font-bold text-slate-700">7. Thể dục - Thể thao</label>
              <input
                type="number"
                min={0}
                max={50}
                value={sportsWeight}
                onChange={e => setSportsWeight(Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-xl bg-white font-bold"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Thông tin ban quản lý */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="font-extrabold text-slate-900 text-sm pb-2 border-b border-slate-100">
            THÔNG TIN TRƯỜNG & BAN QUẢN LÝ
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Trưởng Ban Quản lý Nội trú</label>
              <input
                type="text"
                value={headMasterName}
                onChange={e => setHeadMasterName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Năm học</label>
              <input
                type="text"
                value={schoolYear}
                onChange={e => setSchoolYear(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold"
              />
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className="flex items-center justify-end">
          <button
            type="submit"
            disabled={!canEditSettings}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl shadow-md transition flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> LƯU TOÀN BỘ CẤU HÌNH
          </button>
        </div>
      </form>

      {/* Section 4: Sao Lưu & Khôi Phục Dữ Liệu */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Database className="w-5 h-5 text-indigo-600" />
          <h3 className="font-extrabold text-slate-900 text-sm">
            SAO LƯU & KHÔI PHỤC TOÀN BỘ DỮ LIỆU
          </h3>
        </div>

        <p className="text-xs text-slate-500">
          Xuất toàn bộ cơ sở dữ liệu (phòng, học sinh, điểm danh, thi đua, minh chứng, nhật ký) ra file JSON để lưu trữ an toàn hoặc khôi phục khi cần thiết.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleExportBackup}
            className="px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 rounded-xl text-xs font-bold transition flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> SAO LƯU DỮ LIỆU (JSON)
          </button>

          <label className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer">
            <Upload className="w-4 h-4" /> KHÔI PHỤC TỪ FILE JSON
            <input
              type="file"
              accept=".json"
              onChange={handleRestoreBackup}
              className="hidden"
            />
          </label>

          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-xl text-xs font-bold transition flex items-center gap-2 ml-auto"
          >
            <RotateCcw className="w-4 h-4" /> ĐẶT LẠI DỮ LIỆU MẪU GỐC
          </button>
        </div>
      </div>
    </div>
  );
};
