import React, { useState } from 'react';
import {
  Music,
  Activity,
  Plus,
  Trophy,
  Award,
  Calendar,
  UserCheck,
  CheckCircle2,
  X,
  FileSpreadsheet
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { MovementActivity } from '../../types';

export const CulturalSports: React.FC<{ activeTab?: 'cultural' | 'sports' }> = ({ activeTab = 'cultural' }) => {
  const { activities, addActivity, updateActivity, rooms } = useData();
  const { canManageSystem } = useAuth();
  const [currentType, setCurrentType] = useState<'cultural' | 'sports'>(activeTab);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState('');
  const [juryName, setJuryName] = useState('Ban Giám Khảo Nhà Trường');
  const [results, setResults] = useState<MovementActivity['results']>([]);

  const filteredActivities = activities.filter(a => a.type === currentType);

  const handleOpenAdd = () => {
    setName(currentType === 'cultural' ? 'Hội thi Tiếng hát Nội trú' : 'Giải Bóng đá Mini Nam');
    setDate(new Date().toISOString().slice(0, 10));
    setDescription(currentType === 'cultural' ? 'Giao lưu văn nghệ chào mừng ngày lễ' : 'Thi đấu thể thao rèn luyện sức khỏe');
    setJuryName('Ban Quản Sinh & Tổ Thể Dục');

    // Default rankings for top 3 rooms
    if (rooms.length >= 3) {
      setResults([
        { roomId: rooms[0].id, roomNumber: rooms[0].roomNumber, rank: '🥇 Nhất', pointsAwarded: 10, comment: 'Xuất sắc' },
        { roomId: rooms[1].id, roomNumber: rooms[1].roomNumber, rank: '🥈 Nhì', pointsAwarded: 8, comment: 'Đạt giải Nhì' },
        { roomId: rooms[2].id, roomNumber: rooms[2].roomNumber, rank: '🥉 Ba', pointsAwarded: 6, comment: 'Đạt giải Ba' },
      ]);
    }
    setIsModalOpen(true);
  };

  const handleSaveActivity = (e: React.FormEvent) => {
    e.preventDefault();
    addActivity({
      name,
      type: currentType,
      date,
      description,
      juryName,
      results,
    });
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold uppercase text-purple-700 tracking-wider mb-1 flex items-center gap-1.5">
            {currentType === 'cultural' ? <Music className="w-4 h-4" /> : <Activity className="w-4 h-4" />} Phong Trào Thi Đua
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            {currentType === 'cultural' ? '🎤 Văn Hóa – Văn Nghệ Nội Trú' : '⚽ Thể Dục – Thể Thao Nội Trú'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Tổ chức các hội thi, giải đấu và tự động cộng điểm thi đua tuần/tháng cho các phòng đạt giải
          </p>
        </div>

        <div className="flex items-center gap-2">
          {canManageSystem && (
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> TẠO CUỘC THI / GIẢI ĐẤU MỚI
            </button>
          )}
        </div>
      </div>

      {/* Switcher Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setCurrentType('cultural')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            currentType === 'cultural'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Music className="w-4 h-4" /> Văn Hóa – Văn Nghệ
        </button>
        <button
          onClick={() => setCurrentType('sports')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            currentType === 'sports'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Activity className="w-4 h-4" /> Thể Dục – Thể Thao
        </button>
      </div>

      {/* List of Activities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredActivities.map(act => (
          <div key={act.id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                  {act.type === 'cultural' ? 'Văn nghệ' : 'Thể thao'} • {act.date}
                </span>
                <h3 className="font-extrabold text-base text-slate-900 mt-2">{act.name}</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{act.description}</p>
              </div>
            </div>

            <div className="text-xs text-slate-500 font-medium">{act.juryName}</div>

            {/* Results Table */}
            <div className="border border-slate-100 rounded-2xl overflow-hidden bg-slate-50/50">
              <div className="px-3 py-2 bg-slate-100 text-[11px] font-bold text-slate-700 flex items-center justify-between">
                <span>KẾT QUẢ & ĐIỂM CỘNG THI ĐUA</span>
                <span>CỘNG ĐIỂM</span>
              </div>
              <div className="divide-y divide-slate-100">
                {act.results.map((res, idx) => (
                  <div key={idx} className="p-2.5 px-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{res.rank}</span>
                      <span className="font-extrabold text-blue-700">{res.roomNumber}</span>
                      {res.comment && <span className="text-slate-500 text-[11px]">({res.comment})</span>}
                    </div>
                    <span className="font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/50">
                      +{res.pointsAwarded}đ
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredActivities.length === 0 && (
        <div className="bg-white rounded-3xl p-12 text-center text-slate-400 border border-slate-200">
          Chưa có cuộc thi nào trong danh mục này. Hãy nhấn "Tạo cuộc thi / giải đấu mới" để bắt đầu!
        </div>
      )}

      {/* Add Contest Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-lg">Tạo Hoạt Động Phong Trào</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveActivity} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên phong trào / giải đấu</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ngày tổ chức</label>
                  <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ban giám khảo</label>
                  <input
                    type="text"
                    value={juryName}
                    onChange={e => setJuryName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nội dung / Mô tả</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition"
                >
                  Lưu cuộc thi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
