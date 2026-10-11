import React, { useState } from 'react';
import {
  Bell,
  Search,
  UserCheck,
  Shield,
  School,
  ChevronDown,
  LogOut,
  Calendar,
  Sparkles,
  RefreshCw,
  Building,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

interface NavbarProps {
  onOpenSearch: () => void;
  onOpenNotifications: () => void;
  onToggleMobileSidebar: () => void;
  isMobileSidebarOpen: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSearch,
  onOpenNotifications,
  onToggleMobileSidebar,
  isMobileSidebarOpen,
}) => {
  const { currentUser, allUsers, switchUserById, loginWithGooglePopup } = useAuth();
  const { alerts, stats } = useData();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [customEmailInput, setCustomEmailInput] = useState('');

  const todayStr = new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date());

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <span className="bg-purple-100 text-purple-700 px-2.5 py-0.5 rounded-full text-xs font-semibold">Quản Trị Viên</span>;
      case 'principal':
        return <span className="bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full text-xs font-semibold">Ban Giám Hiệu</span>;
      case 'head_master':
        return <span className="bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full text-xs font-semibold">Trưởng Ban QLNT</span>;
      case 'supervisor':
        return <span className="bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full text-xs font-semibold">Ban Quản Sinh</span>;
      case 'teacher':
        return <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full text-xs font-semibold">Giáo Viên Trực</span>;
      default:
        return null;
    }
  };

  const handleGoogleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await loginWithGooglePopup(customEmailInput || undefined);
    setShowGoogleModal(false);
    setCustomEmailInput('');
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Left: Mobile hamburger & School Logo / Title */}
            <div className="flex items-center gap-3">
              <button
                onClick={onToggleMobileSidebar}
                className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-hidden"
                aria-label="Toggle menu"
              >
                {isMobileSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>

              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 font-extrabold text-base">
                  <School className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-blue-700">
                    Trường PTDTBT THCS Xã Trà Đốc - TP. Đà Nẵng
                  </div>
                  <h1 className="text-sm sm:text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
                    QUẢN LÝ NỘI TRÚ
                    <span className="hidden sm:inline-block text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200/60 px-2 py-0.5 rounded-md">
                      2026-2027
                    </span>
                  </h1>
                </div>
              </div>
            </div>

            {/* Middle: Date & Quick Key Metrics */}
            <div className="hidden xl:flex items-center gap-5 text-xs text-slate-600">
              <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/70">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span className="font-semibold text-slate-800 capitalize">{todayStr}</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-2.5 py-1 rounded-lg">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="font-bold">{stats.totalStudents}</span> học sinh
                </div>
                <div className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200/60 px-2.5 py-1 rounded-lg">
                  <Building className="w-3.5 h-3.5" />
                  <span className="font-bold">{stats.totalRooms}</span> phòng
                </div>
              </div>
            </div>

            {/* Right: Search, Notifications, User Switcher */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Quick Search Button */}
              <button
                onClick={onOpenSearch}
                className="flex items-center gap-2 px-2.5 sm:px-3 py-2 text-xs text-slate-500 bg-slate-100/80 hover:bg-slate-200/70 rounded-xl transition border border-slate-200/50"
                title="Tìm kiếm nhanh (Ctrl+K)"
              >
                <Search className="w-4 h-4 text-slate-500" />
                <span className="hidden md:inline font-medium">Tìm kiếm nhanh...</span>
                <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 bg-white border border-slate-200 rounded-md">
                  ⌘K
                </kbd>
              </button>

              {/* Notification Bell */}
              <button
                onClick={onOpenNotifications}
                className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
                title="Cảnh báo hệ thống"
              >
                <Bell className="w-5 h-5" />
                {alerts.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-xs">
                    {alerts.length}
                  </span>
                )}
              </button>

              {/* User profile & Fast switcher */}
              <div className="relative">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl hover:bg-slate-100 border border-slate-200 transition focus:outline-hidden"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div className="hidden sm:block text-left">
                    <div className="text-xs font-bold text-slate-800 line-clamp-1 max-w-[130px]">
                      {currentUser.name}
                    </div>
                    <div>{getRoleBadge(currentUser.role)}</div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                </button>

                {/* Dropdown Menu */}
                {showUserDropdown && (
                  <div
                    className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50 animate-in fade-in zoom-in-95 duration-100"
                    onMouseLeave={() => setShowUserDropdown(false)}
                  >
                    <div className="pb-3 mb-2 border-b border-slate-100">
                      <div className="text-xs text-slate-400 font-medium">Tài khoản đang đăng nhập:</div>
                      <div className="font-bold text-slate-800 text-sm">{currentUser.name}</div>
                      <div className="text-xs text-slate-500">{currentUser.gmail}</div>
                      <div className="mt-1.5">{getRoleBadge(currentUser.role)}</div>
                      {currentUser.assignedRoomId && (
                        <div className="mt-1 text-xs text-blue-600 font-semibold">
                          Phụ trách: Phòng {currentUser.assignedRoomId.replace('r-', 'P.')}
                        </div>
                      )}
                    </div>

                    <div className="mb-2">
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        Chuyển đổi vai trò kiểm tra nhanh:
                      </div>
                      <div className="space-y-1 max-h-52 overflow-y-auto pr-1">
                        {allUsers.map(user => (
                          <button
                            key={user.id}
                            onClick={() => {
                              switchUserById(user.id);
                              setShowUserDropdown(false);
                            }}
                            className={`w-full text-left p-2 rounded-xl text-xs flex items-center justify-between transition ${
                              user.id === currentUser.id
                                ? 'bg-blue-50 text-blue-800 font-bold border border-blue-200/80'
                                : 'hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            <div>
                              <div className="line-clamp-1">{user.name}</div>
                              <div className="text-[10px] text-slate-400">{user.gmail}</div>
                            </div>
                            <div>{getRoleBadge(user.role)}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex flex-col gap-1.5">
                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          setShowGoogleModal(true);
                        }}
                        className="w-full py-2 px-3 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition flex items-center justify-center gap-2"
                      >
                        <UserCheck className="w-4 h-4" /> Đăng nhập Gmail khác
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Google Login Dialog */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold">
                  G
                </div>
                <h3 className="font-bold text-slate-900 text-base">Đăng Nhập Google / Gmail</h3>
              </div>
              <button
                onClick={() => setShowGoogleModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 mb-4">
              Nhập email Google của bạn hoặc chọn nhanh tài khoản Trưởng ban{' '}
              <strong className="text-blue-700">nghiatrabui.nbk@gmail.com</strong> để toàn quyền quản lý khu nội trú.
            </p>

            <form onSubmit={handleGoogleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Địa chỉ Email Google (Gmail)
                </label>
                <input
                  type="email"
                  value={customEmailInput}
                  onChange={e => setCustomEmailInput(e.target.value)}
                  placeholder="Ví dụ: nghiatrabui.nbk@gmail.com"
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    await loginWithGooglePopup('nghiatrabui.nbk@gmail.com');
                    setShowGoogleModal(false);
                  }}
                  className="w-full py-2.5 px-4 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2"
                >
                  <Shield className="w-4 h-4 text-amber-700" /> Đăng nhập với tư cách Thầy Nguyễn Trọng Nghĩa (Trưởng ban)
                </button>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowGoogleModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition"
                  >
                    Xác nhận đăng nhập
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
