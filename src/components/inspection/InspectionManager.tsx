import React, { useState, useMemo } from 'react';
import {
  Trophy,
  Camera,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Save,
  Star,
  Sparkles,
  Building,
  UserCheck,
  FileSpreadsheet,
  Award,
  Filter,
  Eye,
  X
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { InspectionScore } from '../../types';
import { exportHelper } from '../../services/exportHelper';

export const InspectionManager: React.FC = () => {
  const { rooms, inspections, saveInspectionScore, addEvidence, settings } = useData();
  const { currentUser, canScoreInspection } = useAuth();

  const [selectedRoomId, setSelectedRoomId] = useState<string>(rooms[0]?.id || '');
  const [selectedWeek, setSelectedWeek] = useState<number>(settings.currentWeek);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Criteria Scores State
  const [rulesScore, setRulesScore] = useState<number>(20);
  const [roomHygieneScore, setRoomHygieneScore] = useState<number>(20);
  const [disciplineScore, setDisciplineScore] = useState<number>(15);
  const [areaHygieneScore, setAreaHygieneScore] = useState<number>(15);
  const [dutyScore, setDutyScore] = useState<number>(10);
  const [culturalScore, setCulturalScore] = useState<number>(10);
  const [sportsScore, setSportsScore] = useState<number>(10);
  const [inspectorNotes, setInspectorNotes] = useState<string>('');

  // Evidence preview photo upload
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState<string>('');
  const [uploadedCategory, setUploadedCategory] = useState<'Vệ sinh phòng ở' | 'Vệ sinh khu vực' | 'Phòng trực tuần'>('Vệ sinh phòng ở');

  const activeRoom = rooms.find(r => r.id === selectedRoomId);

  // Load existing inspection score if already exists for this room & week
  React.useEffect(() => {
    const existing = inspections.find(
      i => i.roomId === selectedRoomId && i.weekNumber === selectedWeek
    );
    if (existing) {
      setRulesScore(existing.rulesScore);
      setRoomHygieneScore(existing.roomHygieneScore);
      setDisciplineScore(existing.disciplineScore);
      setAreaHygieneScore(existing.areaHygieneScore);
      setDutyScore(existing.dutyScore);
      setCulturalScore(existing.culturalScore);
      setSportsScore(existing.sportsScore);
      setInspectorNotes(existing.notes || '');
    } else {
      // Default maximums
      setRulesScore(settings.scoreWeights.rules);
      setRoomHygieneScore(settings.scoreWeights.roomHygiene);
      setDisciplineScore(settings.scoreWeights.discipline);
      setAreaHygieneScore(settings.scoreWeights.areaHygiene);
      setDutyScore(settings.scoreWeights.duty);
      setCulturalScore(settings.scoreWeights.cultural);
      setSportsScore(settings.scoreWeights.sports);
      setInspectorNotes('');
    }
  }, [selectedRoomId, selectedWeek, inspections, settings]);

  const currentTotal =
    rulesScore +
    roomHygieneScore +
    disciplineScore +
    areaHygieneScore +
    dutyScore +
    culturalScore +
    sportsScore;

  // Handle Photo File Upload
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = evt => {
      const dataUrl = evt.target?.result as string;
      setUploadedPhotoUrl(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  // Submit inspection score
  const handleSaveScore = () => {
    if (!activeRoom) return;

    const now = new Date();
    const dateStr = now.toLocaleDateString('vi-VN');
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    // If evidence uploaded, save it to evidence gallery too
    if (uploadedPhotoUrl) {
      addEvidence({
        roomId: activeRoom.id,
        roomNumber: activeRoom.roomNumber,
        category: uploadedCategory,
        date: dateStr,
        time: timeStr,
        inspectorName: currentUser.name,
        score: uploadedCategory === 'Vệ sinh phòng ở' ? roomHygieneScore : uploadedCategory === 'Vệ sinh khu vực' ? areaHygieneScore : dutyScore,
        maxScore: uploadedCategory === 'Vệ sinh phòng ở' ? 20 : uploadedCategory === 'Vệ sinh khu vực' ? 15 : 10,
        notes: inspectorNotes || `Minh chứng ${uploadedCategory} tuần ${selectedWeek}`,
        imageUrl: uploadedPhotoUrl,
      });
    }

    saveInspectionScore({
      roomId: activeRoom.id,
      roomNumber: activeRoom.roomNumber,
      weekNumber: selectedWeek,
      month: now.getMonth() + 1,
      schoolYear: settings.schoolYear,
      rulesScore,
      roomHygieneScore,
      disciplineScore,
      areaHygieneScore,
      dutyScore,
      culturalScore,
      sportsScore,
      totalScore: currentTotal,
      inspectorName: `${currentUser.name} (${currentUser.role})`,
      inspectionDate: dateStr,
      notes: inspectorNotes,
      evidenceImages: uploadedPhotoUrl ? [uploadedPhotoUrl] : [],
    });

    setToastMessage(`Đã chấm điểm thi đua Tuần ${selectedWeek} cho ${activeRoom.roomNumber}: ${currentTotal}/100 điểm!`);
    setUploadedPhotoUrl('');
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Ranking calculation according to Section XIII:
  // Sort priority: Total -> Rules -> Room Hygiene -> Discipline -> Area Hygiene
  const rankedRooms = useMemo(() => {
    return [...rooms]
      .filter(r => r.status === 'active')
      .map(r => {
        const insp = inspections.find(i => i.roomId === r.id && i.weekNumber === selectedWeek);
        return {
          room: r,
          rules: insp ? insp.rulesScore : 19,
          roomHygiene: insp ? insp.roomHygieneScore : 19,
          discipline: insp ? insp.disciplineScore : 15,
          areaHygiene: insp ? insp.areaHygieneScore : 14,
          duty: insp ? insp.dutyScore : 10,
          cultural: insp ? insp.culturalScore : 9,
          sports: insp ? insp.sportsScore : 10,
          total: insp ? insp.totalScore : r.currentScore || 90,
          notes: insp?.notes || '',
        };
      })
      .sort((a, b) => {
        if (b.total !== a.total) return b.total - a.total;
        if (b.rules !== a.rules) return b.rules - a.rules;
        if (b.roomHygiene !== a.roomHygiene) return b.roomHygiene - a.roomHygiene;
        return b.discipline - a.discipline;
      });
  }, [rooms, inspections, selectedWeek]);

  // Export Leaderboard to Excel
  const handleExportRanking = () => {
    const headers = ['Hạng', 'Phòng', 'GV phụ trách', 'Nội quy (20)', 'Vệ sinh phòng (20)', 'Nề nếp (15)', 'Khu vực (15)', 'Trực tuần (10)', 'Văn nghệ (10)', 'Thể thao (10)', 'Tổng điểm (100)'];
    const rows = rankedRooms.map((item, idx) => [
      idx + 1,
      item.room.roomNumber,
      item.room.assignedTeacherName || 'Chưa gán',
      item.rules,
      item.roomHygiene,
      item.discipline,
      item.areaHygiene,
      item.duty,
      item.cultural,
      item.sports,
      item.total,
    ]);

    exportHelper.exportToExcel({
      title: `BẢNG XẾP HẠNG THI ĐUA KHU NỘI TRÚ - TUẦN ${selectedWeek}`,
      subTitle: `Năm học ${settings.schoolYear} - Trường PTDTBT THCS Xã Trà Đốc`,
      reportDate: new Date().toLocaleDateString('vi-VN'),
      creatorName: currentUser.name,
      reviewerName: 'Nguyễn Trọng Nghĩa',
      headers,
      rows,
    }, `Thi_Dua_Tuan_${selectedWeek}`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold uppercase text-amber-700 tracking-wider mb-1 flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-amber-500" /> Hệ Thống Đánh Giá Thi Đua Phòng Ở
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            Thi Đua Khu Nội Trú (Thang 100 Điểm / Tuần)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            7 tiêu chí đánh giá toàn diện: Nội quy, Vệ sinh, Nề nếp, Khu vực, Trực tuần, Văn nghệ, Thể thao
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportRanking}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 transition flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-4 h-4" /> Xuất Bảng Xếp Hạng (Excel)
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {toastMessage}
        </div>
      )}

      {/* Main Grid: Scoring Box & Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 Cols): Scoring Form for Examiner */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">CHẤM ĐIỂM PHÒNG Ở</h3>
              <p className="text-xs text-slate-500">Người chấm: <strong>{currentUser.name}</strong></p>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-400 font-semibold">TỔNG ĐIỂM:</div>
              <div className="text-2xl font-black text-amber-600">{currentTotal}/100</div>
            </div>
          </div>

          {/* Select Room & Week */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Chọn phòng</label>
              <select
                value={selectedRoomId}
                onChange={e => setSelectedRoomId(e.target.value)}
                className="w-full text-xs font-bold px-3 py-2 border border-slate-300 rounded-xl bg-white"
              >
                {rooms.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.roomNumber} - {r.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tuần học</label>
              <select
                value={selectedWeek}
                onChange={e => setSelectedWeek(Number(e.target.value))}
                className="w-full text-xs font-bold px-3 py-2 border border-slate-300 rounded-xl bg-white"
              >
                {Array.from({ length: 35 }, (_, i) => i + 1).map(w => (
                  <option key={w} value={w}>
                    Tuần {w}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 7 Criteria Sliders / Point Inputs */}
          <div className="space-y-3 pt-2">
            {/* Tiêu chí 1: Nội quy */}
            <div className="p-3 bg-slate-50 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-800">1. Nội quy nhà trường (Giờ giấc, nề nếp)</span>
                <span className="text-blue-700">{rulesScore} / {settings.scoreWeights.rules}đ</span>
              </div>
              <input
                type="range"
                min={0}
                max={settings.scoreWeights.rules}
                value={rulesScore}
                onChange={e => setRulesScore(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            {/* Tiêu chí 2: Vệ sinh phòng */}
            <div className="p-3 bg-slate-50 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-800">2. Vệ sinh phòng ở (Sàn, giường, chăn màn)</span>
                <span className="text-blue-700">{roomHygieneScore} / {settings.scoreWeights.roomHygiene}đ</span>
              </div>
              <input
                type="range"
                min={0}
                max={settings.scoreWeights.roomHygiene}
                value={roomHygieneScore}
                onChange={e => setRoomHygieneScore(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            {/* Tiêu chí 3: Nề nếp */}
            <div className="p-3 bg-slate-50 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-800">3. Nề nếp phòng ở (Đoàn kết, tự quản)</span>
                <span className="text-blue-700">{disciplineScore} / {settings.scoreWeights.discipline}đ</span>
              </div>
              <input
                type="range"
                min={0}
                max={settings.scoreWeights.discipline}
                value={disciplineScore}
                onChange={e => setDisciplineScore(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            {/* Tiêu chí 4: Vệ sinh khu vực */}
            <div className="p-3 bg-slate-50 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-800">4. Vệ sinh khu vực (Sân, bồn hoa, rác)</span>
                <span className="text-blue-700">{areaHygieneScore} / {settings.scoreWeights.areaHygiene}đ</span>
              </div>
              <input
                type="range"
                min={0}
                max={settings.scoreWeights.areaHygiene}
                value={areaHygieneScore}
                onChange={e => setAreaHygieneScore(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            {/* Tiêu chí 5: Phòng trực tuần */}
            <div className="p-3 bg-slate-50 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-800">5. Phòng trực tuần (Nhà vệ sinh, bếp/ăn)</span>
                <span className="text-blue-700">{dutyScore} / {settings.scoreWeights.duty}đ</span>
              </div>
              <input
                type="range"
                min={0}
                max={settings.scoreWeights.duty}
                value={dutyScore}
                onChange={e => setDutyScore(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            {/* Tiêu chí 6 & 7: Văn nghệ & Thể thao */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 bg-slate-50 rounded-xl space-y-1">
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span>6. Văn hóa - Văn nghệ</span>
                  <span className="text-blue-700">{culturalScore}/{settings.scoreWeights.cultural}đ</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={settings.scoreWeights.cultural}
                  value={culturalScore}
                  onChange={e => setCulturalScore(Number(e.target.value))}
                  className="w-full accent-blue-600"
                />
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl space-y-1">
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span>7. Thể dục - Thể thao</span>
                  <span className="text-blue-700">{sportsScore}/{settings.scoreWeights.sports}đ</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={settings.scoreWeights.sports}
                  value={sportsScore}
                  onChange={e => setSportsScore(Number(e.target.value))}
                  className="w-full accent-blue-600"
                />
              </div>
            </div>
          </div>

          {/* Evidence photo upload */}
          <div className="p-3 bg-blue-50/60 border border-blue-200/80 rounded-2xl space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-blue-900 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-blue-600" /> Chụp / Tải ảnh minh chứng
              </span>
              <select
                value={uploadedCategory}
                onChange={e => setUploadedCategory(e.target.value as any)}
                className="text-[11px] font-semibold px-2 py-1 border border-blue-200 rounded-lg bg-white"
              >
                <option value="Vệ sinh phòng ở">Vệ sinh phòng ở</option>
                <option value="Vệ sinh khu vực">Vệ sinh khu vực</option>
                <option value="Phòng trực tuần">Phòng trực tuần</option>
              </select>
            </div>

            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoSelect}
              className="w-full text-[11px] file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[11px] file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
            />

            {uploadedPhotoUrl && (
              <div className="relative mt-2 rounded-xl overflow-hidden border border-blue-200 max-h-32">
                <img src={uploadedPhotoUrl} alt="Minh chứng" className="w-full h-32 object-cover" />
                <button
                  type="button"
                  onClick={() => setUploadedPhotoUrl('')}
                  className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-full hover:bg-black"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Nhận xét của người chấm</label>
            <textarea
              rows={2}
              value={inspectorNotes}
              onChange={e => setInspectorNotes(e.target.value)}
              placeholder="Ghi chú cụ thể ưu điểm hoặc điểm trừ cần khắc phục..."
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl"
            />
          </div>

          <button
            type="button"
            disabled={!canScoreInspection}
            onClick={handleSaveScore}
            className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black rounded-xl shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" /> LƯU ĐIỂM THI ĐUA ({currentTotal} ĐIỂM)
          </button>
        </div>

        {/* Right Column (7 Cols): Leaderboard & Details */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">
                BẢNG XẾP HẠNG THI ĐUA - TUẦN {selectedWeek}
              </h3>
              <p className="text-xs text-slate-500">
                Thứ tự xếp hạng giải quyết hòa điểm theo quy định: Nội quy → Vệ sinh → Nề nếp
              </p>
            </div>
            <span className="text-xs font-bold bg-amber-50 text-amber-800 px-3 py-1 rounded-full border border-amber-200">
              Tổng {rankedRooms.length} phòng
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-extrabold uppercase tracking-wider text-slate-600">
                  <th className="py-3 px-2 text-center w-10">Hạng</th>
                  <th className="py-3 px-3">Phòng</th>
                  <th className="py-3 px-2 text-center">NQ (20)</th>
                  <th className="py-3 px-2 text-center">VS (20)</th>
                  <th className="py-3 px-2 text-center">NN (15)</th>
                  <th className="py-3 px-2 text-center">KV (15)</th>
                  <th className="py-3 px-2 text-center">TT (10)</th>
                  <th className="py-3 px-2 text-center">VN/TT</th>
                  <th className="py-3 px-3 text-center">Tổng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {rankedRooms.map((item, idx) => {
                  return (
                    <tr
                      key={item.room.id}
                      onClick={() => setSelectedRoomId(item.room.id)}
                      className={`hover:bg-slate-50 transition cursor-pointer ${
                        item.room.id === selectedRoomId ? 'bg-blue-50/70 font-semibold' : ''
                      }`}
                    >
                      <td className="py-3 px-2 text-center">
                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-extrabold text-slate-900">{item.room.roomNumber}</div>
                        <div className="text-[10px] text-slate-400">{item.room.name}</div>
                      </td>
                      <td className="py-3 px-2 text-center font-bold text-slate-700">{item.rules}</td>
                      <td className="py-3 px-2 text-center font-bold text-slate-700">{item.roomHygiene}</td>
                      <td className="py-3 px-2 text-center font-bold text-slate-700">{item.discipline}</td>
                      <td className="py-3 px-2 text-center font-bold text-slate-700">{item.areaHygiene}</td>
                      <td className="py-3 px-2 text-center font-bold text-slate-700">{item.duty}</td>
                      <td className="py-3 px-2 text-center text-slate-600">
                        {item.cultural + item.sports}đ
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="text-sm font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200/50">
                          {item.total}đ
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
