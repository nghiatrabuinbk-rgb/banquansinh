import React, { useState, useMemo } from 'react';
import {
  Camera,
  Upload,
  Calendar,
  Filter,
  Search,
  Eye,
  X,
  UserCheck,
  Building,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { EvidenceItem } from '../../types';

export const EvidenceGallery: React.FC = () => {
  const { evidences, rooms, addEvidence } = useData();
  const { currentUser, canScoreInspection } = useAuth();

  const [filterRoom, setFilterRoom] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [selectedImage, setSelectedImage] = useState<EvidenceItem | null>(null);

  // Upload modal state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [targetRoomId, setTargetRoomId] = useState(rooms[0]?.id || '');
  const [category, setCategory] = useState<EvidenceItem['category']>('Vệ sinh phòng ở');
  const [score, setScore] = useState(20);
  const [maxScore, setMaxScore] = useState(20);
  const [notes, setNotes] = useState('');
  const [photoDataUrl, setPhotoDataUrl] = useState('');

  const filteredEvidences = useMemo(() => {
    return evidences.filter(e => {
      if (filterRoom !== 'all' && e.roomId !== filterRoom) return false;
      if (filterCategory !== 'all' && e.category !== filterCategory) return false;
      return true;
    });
  }, [evidences, filterRoom, filterCategory]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = evt => {
      setPhotoDataUrl(evt.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoDataUrl) {
      alert('Vui lòng chọn hoặc chụp ảnh minh chứng!');
      return;
    }

    const matchedRoom = rooms.find(r => r.id === targetRoomId);
    const now = new Date();
    const dateStr = now.toLocaleDateString('vi-VN');
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    addEvidence({
      roomId: targetRoomId,
      roomNumber: matchedRoom?.roomNumber || 'P.101',
      category,
      date: dateStr,
      time: timeStr,
      inspectorName: currentUser.name,
      score,
      maxScore,
      notes: notes || `Minh chứng ${category}`,
      imageUrl: photoDataUrl,
    });

    setIsUploadOpen(false);
    setPhotoDataUrl('');
    setNotes('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold uppercase text-blue-700 tracking-wider mb-1 flex items-center gap-1.5">
            <Camera className="w-4 h-4" /> Hệ Thống Minh Chứng Hình Ảnh
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            Thư Viện Ảnh Minh Chứng Thi Đua ({evidences.length} ảnh)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Minh chứng xác thực cho vệ sinh phòng ở, vệ sinh khu vực, nề nếp và trực tuần
          </p>
        </div>

        {canScoreInspection && (
          <button
            onClick={() => setIsUploadOpen(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition flex items-center gap-2"
          >
            <Camera className="w-4 h-4" /> CHỤP / TẢI ẢNH MỚI
          </button>
        )}
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="font-bold text-slate-700 mr-2">Phòng:</label>
            <select
              value={filterRoom}
              onChange={e => setFilterRoom(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 rounded-xl bg-white font-semibold"
            >
              <option value="all">Tất cả phòng</option>
              {rooms.map(r => (
                <option key={r.id} value={r.id}>
                  {r.roomNumber} - {r.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 mr-2">Tiêu chí:</label>
            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 rounded-xl bg-white font-semibold"
            >
              <option value="all">Tất cả tiêu chí</option>
              <option value="Vệ sinh phòng ở">Vệ sinh phòng ở</option>
              <option value="Vệ sinh khu vực">Vệ sinh khu vực</option>
              <option value="Phòng trực tuần">Phòng trực tuần</option>
              <option value="Nội quy">Nội quy</option>
              <option value="Nề nếp">Nề nếp</option>
            </select>
          </div>
        </div>

        <span className="text-slate-500">
          Hiển thị <strong>{filteredEvidences.length}</strong> hình ảnh
        </span>
      </div>

      {/* Gallery Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredEvidences.map(item => (
          <div
            key={item.id}
            onClick={() => setSelectedImage(item)}
            className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition cursor-pointer group flex flex-col"
          >
            <div className="relative aspect-4/3 overflow-hidden bg-slate-100">
              <img
                src={item.imageUrl}
                alt={item.notes}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
              />
              <span className="absolute top-2 left-2 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                {item.roomNumber}
              </span>
              <span className="absolute bottom-2 right-2 bg-amber-500 text-slate-950 text-[11px] font-black px-2 py-0.5 rounded-md shadow-xs">
                {item.score}/{item.maxScore}đ
              </span>
            </div>

            <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
              <div>
                <div className="text-[11px] font-bold text-blue-700">{item.category}</div>
                <p className="text-xs text-slate-800 line-clamp-2 mt-0.5 leading-relaxed font-medium">
                  {item.notes}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                <span>{item.date} • {item.time}</span>
                <span className="truncate max-w-[100px] text-slate-600 font-semibold">{item.inspectorName}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredEvidences.length === 0 && (
        <div className="bg-white rounded-3xl p-12 text-center text-slate-400 border border-slate-200">
          Chưa có hình ảnh minh chứng nào phù hợp với bộ lọc.
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl animate-in zoom-in-95"
          >
            <div className="relative">
              <img
                src={selectedImage.imageUrl}
                alt={selectedImage.notes}
                className="w-full max-h-[60vh] object-contain bg-black"
              />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-3 right-3 p-1.5 bg-black/60 text-white rounded-full hover:bg-black"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-blue-100 text-blue-800">
                    Phòng {selectedImage.roomNumber}
                  </span>
                  <span className="ml-2 text-xs font-bold text-slate-600">
                    {selectedImage.category}
                  </span>
                </div>
                <div className="text-lg font-black text-amber-600">
                  {selectedImage.score}/{selectedImage.maxScore} điểm
                </div>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {selectedImage.notes}
              </p>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div>Thời gian: <strong>{selectedImage.date} lúc {selectedImage.time}</strong></div>
                <div>Người chấm: <strong>{selectedImage.inspectorName}</strong></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Evidence Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                <Camera className="w-5 h-5 text-blue-600" /> Tải Lên Ảnh Minh Chứng
              </h3>
              <button onClick={() => setIsUploadOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Gắn với phòng</label>
                  <select
                    value={targetRoomId}
                    onChange={e => setTargetRoomId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white font-semibold"
                  >
                    {rooms.map(r => (
                      <option key={r.id} value={r.id}>
                        {r.roomNumber} - {r.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tiêu chí đánh giá</label>
                  <select
                    value={category}
                    onChange={e => {
                      const cat = e.target.value as any;
                      setCategory(cat);
                      setMaxScore(cat === 'Vệ sinh phòng ở' ? 20 : cat === 'Vệ sinh khu vực' ? 15 : 10);
                      setScore(cat === 'Vệ sinh phòng ở' ? 20 : cat === 'Vệ sinh khu vực' ? 15 : 10);
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white font-semibold"
                  >
                    <option value="Vệ sinh phòng ở">Vệ sinh phòng ở (Max 20đ)</option>
                    <option value="Vệ sinh khu vực">Vệ sinh khu vực (Max 15đ)</option>
                    <option value="Phòng trực tuần">Phòng trực tuần (Max 10đ)</option>
                    <option value="Nội quy">Nội quy (Max 20đ)</option>
                    <option value="Nề nếp">Nề nếp (Max 15đ)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Chọn ảnh hoặc Chụp từ camera</label>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileChange}
                  className="w-full file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-blue-600 file:text-white file:font-semibold"
                />
              </div>

              {photoDataUrl && (
                <div className="rounded-xl overflow-hidden border border-slate-200 max-h-40">
                  <img src={photoDataUrl} alt="Preview" className="w-full h-40 object-cover" />
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ghi chú / Nhận xét hiện trường</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Ghi nhận tình trạng vệ sinh, chăn màn hoặc bồn hoa..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition"
                >
                  Lưu minh chứng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
