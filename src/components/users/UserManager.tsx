import React, { useState } from 'react';
import {
  Users,
  Shield,
  Plus,
  Lock,
  Unlock,
  CheckCircle2,
  X,
  Edit2,
  Trash2,
  DoorOpen,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { User, Role } from '../../types';
import { storageService } from '../../services/storage';

export const UserManager: React.FC = () => {
  const { allUsers, currentUser, refreshUsers } = useAuth();
  const { rooms } = useData();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [name, setName] = useState('');
  const [gmail, setGmail] = useState('');
  const [role, setRole] = useState<Role>('teacher');
  const [assignedRoomId, setAssignedRoomId] = useState('');

  const handleOpenAdd = () => {
    setEditingUser(null);
    setName('');
    setGmail('');
    setRole('teacher');
    setAssignedRoomId(rooms[0]?.id || '');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setName(user.name);
    setGmail(user.gmail);
    setRole(user.role);
    setAssignedRoomId(user.assignedRoomId || '');
    setIsModalOpen(true);
  };

  const handleToggleLock = (user: User) => {
    if (user.id === currentUser.id) {
      alert('Không thể tự khóa tài khoản đang đăng nhập!');
      return;
    }
    const updated = allUsers.map(u => {
      if (u.id === user.id) {
        const nextStatus = u.status === 'locked' ? 'active' : 'locked';
        return { ...u, status: nextStatus as 'active' | 'locked' };
      }
      return u;
    });
    storageService.saveUsers(updated);
    storageService.addAuditLog(currentUser, 'Khóa/Mở tài khoản', 'Người dùng', `Đổi trạng thái tài khoản ${user.name}`);
    refreshUsers();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      const updated = allUsers.map(u => {
        if (u.id === editingUser.id) {
          return {
            ...u,
            name,
            gmail,
            role,
            assignedRoomId: role === 'teacher' ? assignedRoomId : undefined,
          };
        }
        return u;
      });
      storageService.saveUsers(updated);
      storageService.addAuditLog(currentUser, 'Sửa người dùng', 'Người dùng', `Cập nhật thông tin ${name}`);
    } else {
      const newUser: User = {
        id: 'u-' + Date.now(),
        name,
        gmail,
        role,
        assignedRoomId: role === 'teacher' ? assignedRoomId : undefined,
        status: 'active',
        createdAt: new Date().toISOString().slice(0, 10),
      };
      const updated = [...allUsers, newUser];
      storageService.saveUsers(updated);
      storageService.addAuditLog(currentUser, 'Tạo người dùng', 'Người dùng', `Tạo tài khoản mới ${name} (${role})`);
    }
    refreshUsers();
    setIsModalOpen(false);
  };

  const getRoleBadge = (r: Role) => {
    switch (r) {
      case 'admin':
        return <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded-full">Quản trị viên</span>;
      case 'principal':
        return <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full">Ban Giám Hiệu</span>;
      case 'head_master':
        return <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full">Trưởng Ban QLNT</span>;
      case 'supervisor':
        return <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">Ban Quản Sinh</span>;
      case 'teacher':
        return <span className="bg-slate-100 text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded-full">Giáo Viên Trực</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold uppercase text-purple-700 tracking-wider mb-1 flex items-center gap-1.5">
            <Shield className="w-4 h-4" /> Quản Lý Hệ Thống Người Dùng & Phân Quyền
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            Danh Sách Tài Khoản & Phân Quyền ({allUsers.length} tài khoản)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            5 nhóm quyền: Quản trị viên, Ban Giám hiệu, Trưởng ban, Ban Quản sinh, Giáo viên trực phòng
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> TẠO TÀI KHOẢN MỚI
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-extrabold uppercase tracking-wider text-slate-600">
                <th className="py-3.5 px-4 text-center w-12">STT</th>
                <th className="py-3.5 px-4">Họ và tên</th>
                <th className="py-3.5 px-4">Địa chỉ Google/Gmail</th>
                <th className="py-3.5 px-4">Vai trò hệ thống</th>
                <th className="py-3.5 px-4">Phòng phụ trách</th>
                <th className="py-3.5 px-4 text-center">Trạng thái</th>
                <th className="py-3.5 px-4 text-center w-28">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {allUsers.map((user, idx) => {
                const assignedRoom = rooms.find(r => r.id === user.assignedRoomId);
                return (
                  <tr key={user.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 text-center font-bold text-slate-400">{idx + 1}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-extrabold text-slate-900">{user.name}</div>
                      <div className="text-[10px] text-slate-400">Tham gia: {user.createdAt}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-mono">{user.gmail}</td>
                    <td className="py-3.5 px-4">{getRoleBadge(user.role)}</td>
                    <td className="py-3.5 px-4">
                      {assignedRoom ? (
                        <span className="font-bold text-blue-700">
                          {assignedRoom.roomNumber} ({assignedRoom.name})
                        </span>
                      ) : (
                        <span className="text-slate-400">--</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          user.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {user.status === 'active' ? 'Hoạt động' : 'Bị khóa'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleToggleLock(user)}
                          className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100"
                          title={user.status === 'active' ? 'Khóa tài khoản' : 'Mở khóa'}
                        >
                          {user.status === 'active' ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5 text-emerald-600" />}
                        </button>
                        <button
                          onClick={() => handleOpenEdit(user)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="Sửa thông tin"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Permission Matrix Card */}
      <div className="bg-gradient-to-r from-blue-50/70 via-indigo-50/60 to-purple-50/70 rounded-3xl p-5 sm:p-6 border border-indigo-200/80 shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-5 h-5 text-indigo-700" />
          <h3 className="font-black text-slate-900 text-base">
            Quy Định Phân Quyền Quản Lý & Thêm Phòng Ở Nội Trú
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
          <div className="p-3.5 bg-white rounded-2xl border border-amber-200 shadow-2xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-black text-amber-900 flex items-center gap-1">
                👑 Trưởng Ban Quản Lý (head_master)
              </span>
              <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full">
                Toàn quyền phòng ở
              </span>
            </div>
            <ul className="space-y-1 text-slate-700 text-[11px] list-disc list-inside">
              <li><strong>Toàn quyền tự thêm phòng ở học sinh</strong> (từng phòng / hàng loạt theo khu).</li>
              <li><strong>Nhập thủ công số lượng phòng ở</strong> cho toàn trường.</li>
              <li><strong>Tự nhập học sinh trực tiếp vào từng phòng ở</strong>.</li>
              <li>Phân công giáo viên trực phòng, theo dõi điểm danh, chấm thi đua.</li>
            </ul>
          </div>

          <div className="p-3.5 bg-white rounded-2xl border border-purple-200 shadow-2xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-black text-purple-900 flex items-center gap-1">
                ⚙️ Quản Trị Viên (admin)
              </span>
              <span className="text-[10px] bg-purple-100 text-purple-900 font-bold px-2 py-0.5 rounded-full">
                Toàn hệ thống
              </span>
            </div>
            <ul className="space-y-1 text-slate-700 text-[11px] list-disc list-inside">
              <li>Tự thêm phòng ở, sửa/xóa phòng ở học sinh.</li>
              <li>Quản lý danh sách tài khoản người dùng và phân quyền.</li>
              <li>Cài đặt cấu hình trường học, nhật ký hệ thống, sao lưu.</li>
            </ul>
          </div>

          <div className="p-3.5 bg-white rounded-2xl border border-blue-200 shadow-2xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-black text-blue-900 flex items-center gap-1">
                👨🏫 Giáo Viên Trực Phòng (teacher)
              </span>
              <span className="text-[10px] bg-blue-100 text-blue-900 font-bold px-2 py-0.5 rounded-full">
                Theo phòng
              </span>
            </div>
            <ul className="space-y-1 text-slate-700 text-[11px] list-disc list-inside">
              <li>Điểm danh sáng & tối cho phòng mình phụ trách.</li>
              <li>Đăng ký và xác nhận học sinh ở lại cuối tuần.</li>
              <li>Tự nhập thông tin học sinh vào phòng mình phụ trách.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Add / Edit User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-lg">
                {editingUser ? 'Sửa Tài Khoản' : 'Thêm Người Dùng Mới'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Họ và tên *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Ví dụ: Thầy Trần Văn Bình"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Địa chỉ Google/Gmail *</label>
                <input
                  type="email"
                  required
                  value={gmail}
                  onChange={e => setGmail(e.target.value)}
                  placeholder="Ví dụ: binh.tran@tradoc.edu.vn"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Phân quyền vai trò</label>
                <select
                  value={role}
                  onChange={e => setRole(e.target.value as Role)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white font-semibold"
                >
                  <option value="teacher">Giáo viên trực phòng (Chỉ phòng mình)</option>
                  <option value="supervisor">Ban Quản sinh (Chấm thi đua, theo dõi nề nếp)</option>
                  <option value="head_master">Trưởng Ban Quản lý Nội trú (Toàn quyền tự thêm phòng ở & học sinh)</option>
                  <option value="principal">Ban Giám Hiệu (Xem báo cáo, xuất file)</option>
                  <option value="admin">Quản trị viên (Toàn quyền hệ thống)</option>
                </select>
              </div>

              {role === 'teacher' && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phân công phòng phụ trách</label>
                  <select
                    value={assignedRoomId}
                    onChange={e => setAssignedRoomId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white font-semibold"
                  >
                    <option value="">-- Chưa gán phòng --</option>
                    {rooms.map(r => (
                      <option key={r.id} value={r.id}>
                        {r.roomNumber} - {r.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

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
                  {editingUser ? 'Lưu thay đổi' : 'Tạo tài khoản'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
