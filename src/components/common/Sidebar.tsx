import React from 'react';
import {
  LayoutDashboard,
  Users,
  Home,
  UserCheck,
  ClipboardCheck,
  CalendarCheck,
  Trophy,
  Sparkles,
  Music,
  Activity,
  Camera,
  BarChart3,
  FileSpreadsheet,
  Bell,
  Settings,
  ShieldAlert,
  History,
  DoorOpen,
  Award
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

export type NavTab =
  | 'dashboard'
  | 'students'
  | 'rooms'
  | 'teachers'
  | 'attendance'
  | 'weekend'
  | 'inspection'
  | 'hygiene_discipline'
  | 'cultural'
  | 'sports'
  | 'evidence'
  | 'reports'
  | 'export'
  | 'alerts'
  | 'settings'
  | 'users'
  | 'audit_logs';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isMobileOpen,
  onCloseMobile,
}) => {
  const { currentUser, isTeacherOnly, assignedRoomId } = useAuth();
  const { alerts, rooms } = useData();

  const assignedRoom = rooms.find(r => r.id === assignedRoomId);

  const navItems = [
    {
      id: 'dashboard' as NavTab,
      label: currentUser.role === 'head_master' ? 'Trưởng Ban Dashboard' : 'Dashboard Tổng Quan',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'attendance' as NavTab,
      label: isTeacherOnly ? 'Điểm danh phòng mình' : 'Điểm danh hằng ngày',
      icon: ClipboardCheck,
      badge: 'Chính',
      badgeColor: 'bg-emerald-100 text-emerald-800',
    },
    {
      id: 'weekend' as NavTab,
      label: 'Đăng ký cuối tuần',
      icon: CalendarCheck,
      badge: null,
    },
    {
      id: 'rooms' as NavTab,
      label: isTeacherOnly ? 'Phòng của tôi' : 'Quản lý phòng ở',
      icon: Home,
      badge: isTeacherOnly && assignedRoom ? assignedRoom.roomNumber : null,
      badgeColor: 'bg-blue-100 text-blue-800',
    },
    {
      id: 'students' as NavTab,
      label: isTeacherOnly ? 'Học sinh phòng tôi' : 'Quản lý học sinh',
      icon: Users,
      badge: null,
    },
    {
      id: 'teachers' as NavTab,
      label: 'Giáo viên trực phòng',
      icon: UserCheck,
      badge: null,
      hideForTeacher: true,
    },
    {
      id: 'inspection' as NavTab,
      label: 'Thi đua khu nội trú',
      icon: Trophy,
      badge: '100đ',
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    {
      id: 'hygiene_discipline' as NavTab,
      label: 'Vệ sinh – nề nếp',
      icon: Sparkles,
      badge: null,
    },
    {
      id: 'cultural' as NavTab,
      label: 'Văn hóa – văn nghệ',
      icon: Music,
      badge: null,
    },
    {
      id: 'sports' as NavTab,
      label: 'Thể dục – thể thao',
      icon: Activity,
      badge: null,
    },
    {
      id: 'evidence' as NavTab,
      label: 'Minh chứng hình ảnh',
      icon: Camera,
      badge: null,
    },
    {
      id: 'reports' as NavTab,
      label: 'Báo cáo thống kê',
      icon: BarChart3,
      badge: null,
    },
    {
      id: 'export' as NavTab,
      label: 'Xuất file Excel/Word/PDF',
      icon: FileSpreadsheet,
      badge: 'In',
      badgeColor: 'bg-purple-100 text-purple-800',
    },
    {
      id: 'alerts' as NavTab,
      label: 'Thông báo & Cảnh báo',
      icon: Bell,
      badge: alerts.length > 0 ? String(alerts.length) : null,
      badgeColor: 'bg-rose-500 text-white',
    },
    {
      id: 'users' as NavTab,
      label: 'Người dùng & phân quyền',
      icon: ShieldAlert,
      badge: null,
      adminOnly: true,
    },
    {
      id: 'settings' as NavTab,
      label: 'Cài đặt hệ thống',
      icon: Settings,
      badge: null,
      adminOnly: true,
    },
    {
      id: 'audit_logs' as NavTab,
      label: 'Nhật ký hệ thống',
      icon: History,
      badge: null,
      adminOnly: true,
    },
  ];

  const filteredItems = navItems.filter(item => {
    if (item.adminOnly && !['admin', 'head_master'].includes(currentUser.role)) {
      return false;
    }
    if (item.hideForTeacher && isTeacherOnly) {
      return false;
    }
    return true;
  });

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Main Sidebar */}
      <aside
        className={`fixed top-16 sm:top-20 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200/80 shadow-xs flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Teacher Quick Notification Banner */}
        {isTeacherOnly && (
          <div className="p-3 mx-3 mt-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-xl text-xs">
            <div className="font-bold text-blue-900 flex items-center gap-1">
              <DoorOpen className="w-3.5 h-3.5 text-blue-600" />
              {assignedRoom ? assignedRoom.name : 'Giáo viên trực phòng'}
            </div>
            <div className="text-[11px] text-slate-600 mt-0.5">
              Phòng được phân công: <strong>{assignedRoom ? assignedRoom.roomNumber : 'Chưa gán'}</strong>
            </div>
          </div>
        )}

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          {filteredItems.map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition group ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-600'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`px-1.5 py-0.5 text-[10px] font-bold rounded-md shrink-0 ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : item.badgeColor || 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer Info */}
        <div className="p-3 border-t border-slate-100 text-[11px] text-slate-400 text-center">
          <div className="font-semibold text-slate-600">Trường PTDTBT THCS Xã Trà Đốc</div>
          <div>Bảo trợ: Ban QLNT Học Sinh</div>
        </div>
      </aside>
    </>
  );
};
