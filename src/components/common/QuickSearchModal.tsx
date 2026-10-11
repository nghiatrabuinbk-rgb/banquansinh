import React, { useState, useMemo } from 'react';
import { Search, X, User, Home, Phone, MapPin, Building, ChevronRight } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';

interface QuickSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToStudent?: (studentId: string) => void;
  onNavigateToRoom?: (roomId: string) => void;
}

export const QuickSearchModal: React.FC<QuickSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigateToStudent,
  onNavigateToRoom,
}) => {
  const { students, rooms } = useData();
  const { allUsers, isTeacherOnly, assignedRoomId } = useAuth();
  const [query, setQuery] = useState('');

  // If teacher only, filter students
  const visibleStudents = useMemo(() => {
    if (isTeacherOnly && assignedRoomId) {
      return students.filter(s => s.roomId === assignedRoomId);
    }
    return students;
  }, [students, isTeacherOnly, assignedRoomId]);

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return { students: [], rooms: [], teachers: [] };

    const matchedStudents = visibleStudents.filter(s =>
      s.fullName.toLowerCase().includes(q) ||
      s.gradeClass.toLowerCase().includes(q) ||
      s.roomNumber.toLowerCase().includes(q) ||
      s.village.toLowerCase().includes(q) ||
      s.hamletLeader.toLowerCase().includes(q) ||
      s.parentName.toLowerCase().includes(q) ||
      s.parentPhone.includes(q)
    );

    const matchedRooms = isTeacherOnly
      ? rooms.filter(r => r.id === assignedRoomId && (r.roomNumber.toLowerCase().includes(q) || r.name.toLowerCase().includes(q)))
      : rooms.filter(r =>
          r.roomNumber.toLowerCase().includes(q) ||
          r.name.toLowerCase().includes(q) ||
          r.buildingZone.toLowerCase().includes(q) ||
          (r.assignedTeacherName && r.assignedTeacherName.toLowerCase().includes(q))
        );

    const matchedTeachers = isTeacherOnly
      ? []
      : allUsers.filter(u =>
          u.name.toLowerCase().includes(q) ||
          u.gmail.toLowerCase().includes(q)
        );

    return {
      students: matchedStudents.slice(0, 10),
      rooms: matchedRooms.slice(0, 5),
      teachers: matchedTeachers.slice(0, 5),
    };
  }, [query, visibleStudents, rooms, allUsers, isTeacherOnly, assignedRoomId]);

  if (!isOpen) return null;

  const totalHits =
    searchResults.students.length + searchResults.rooms.length + searchResults.teachers.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100 bg-slate-50/50">
          <Search className="w-5 h-5 text-blue-600 mr-3 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Tìm theo tên học sinh, lớp, phòng, thôn, nóc ông/bà, SĐT phụ huynh, GV..."
            className="w-full bg-transparent text-sm sm:text-base text-slate-800 placeholder-slate-400 focus:outline-hidden"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="ml-2 text-xs font-semibold px-2 py-1 bg-slate-200/80 text-slate-600 hover:bg-slate-300 rounded-md"
          >
            ESC
          </button>
        </div>

        {/* Results Body */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {!query && (
            <div className="text-center py-8 text-slate-400 text-xs">
              Nhập từ khóa bất kỳ để tra cứu nhanh thông tin toàn trường (Ví dụ: "Hồ Văn", "6/1", "P.101", "Nóc Ông Reo", "0983...")
            </div>
          )}

          {query && totalHits === 0 && (
            <div className="text-center py-8 text-slate-500 text-sm">
              Không tìm thấy kết quả nào phù hợp với từ khóa "<strong>{query}</strong>".
            </div>
          )}

          {/* Students list */}
          {searchResults.students.length > 0 && (
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-600" /> Học Sinh ({searchResults.students.length})
              </div>
              <div className="space-y-1.5">
                {searchResults.students.map(s => (
                  <div
                    key={s.id}
                    onClick={() => {
                      if (onNavigateToStudent) onNavigateToStudent(s.id);
                      onClose();
                    }}
                    className="p-2.5 rounded-xl hover:bg-blue-50 border border-slate-100 hover:border-blue-200 transition cursor-pointer flex items-center justify-between group"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 group-hover:text-blue-700">
                          {s.fullName}
                        </span>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800">
                          Lớp {s.gradeClass}
                        </span>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800">
                          {s.roomNumber}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {s.village} ({s.hamletLeader})
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          Phụ huynh: {s.parentName} - {s.parentPhone}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rooms list */}
          {searchResults.rooms.length > 0 && (
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Home className="w-3.5 h-3.5 text-indigo-600" /> Phòng Ở ({searchResults.rooms.length})
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {searchResults.rooms.map(r => (
                  <div
                    key={r.id}
                    onClick={() => {
                      if (onNavigateToRoom) onNavigateToRoom(r.id);
                      onClose();
                    }}
                    className="p-2.5 rounded-xl hover:bg-indigo-50 border border-slate-100 hover:border-indigo-200 transition cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-sm text-slate-800">
                        {r.roomNumber} - {r.name}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {r.buildingZone} | GV: {r.assignedTeacherName || 'Chưa gán'}
                      </div>
                    </div>
                    <span className="text-xs font-bold px-2 py-1 rounded-md bg-slate-100 text-slate-700">
                      {r.currentOccupancy}/{r.capacity} em
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Teachers list */}
          {searchResults.teachers.length > 0 && (
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-emerald-600" /> Cán Bộ / Giáo Viên ({searchResults.teachers.length})
              </div>
              <div className="space-y-1.5">
                {searchResults.teachers.map(u => (
                  <div
                    key={u.id}
                    className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-800">{u.name}</div>
                      <div className="text-slate-500">{u.gmail}</div>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-semibold rounded-md">
                      {u.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
