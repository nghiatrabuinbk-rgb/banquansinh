import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider, useData } from './context/DataContext';
import { Navbar } from './components/common/Navbar';
import { Sidebar, NavTab } from './components/common/Sidebar';
import { QuickSearchModal } from './components/common/QuickSearchModal';
import { NotificationDrawer } from './components/common/NotificationDrawer';

// Main Views
import { MainDashboard } from './components/dashboard/MainDashboard';
import { HeadMasterDashboard } from './components/dashboard/HeadMasterDashboard';
import { TeacherDashboard } from './components/dashboard/TeacherDashboard';
import { AttendanceManager } from './components/attendance/AttendanceManager';
import { WeekendManager } from './components/weekend/WeekendManager';
import { RoomList } from './components/rooms/RoomList';
import { StudentList } from './components/students/StudentList';
import { ProgressTracker } from './components/progress/ProgressTracker';
import { InspectionManager } from './components/inspection/InspectionManager';
import { CulturalSports } from './components/activities/CulturalSports';
import { EvidenceGallery } from './components/evidence/EvidenceGallery';
import { ReportCenter } from './components/reports/ReportCenter';
import { UserManager } from './components/users/UserManager';
import { AuditLogView } from './components/logs/AuditLogView';
import { SettingsView } from './components/settings/SettingsView';

const MainAppLayout: React.FC = () => {
  const { currentUser, isTeacherOnly } = useAuth();
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Global hotkey Ctrl+K / Cmd+K for quick search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const renderCurrentView = () => {
    switch (currentTab) {
      case 'dashboard':
        if (currentUser.role === 'head_master') {
          return <HeadMasterDashboard onNavigateTab={setCurrentTab} onSelectRoomForAttendance={() => setCurrentTab('attendance')} />;
        }
        if (isTeacherOnly) {
          return <TeacherDashboard onNavigateTab={setCurrentTab} />;
        }
        return <MainDashboard onNavigateTab={setCurrentTab} onSelectRoomForAttendance={() => setCurrentTab('attendance')} />;

      case 'attendance':
        return <AttendanceManager />;

      case 'weekend':
        return <WeekendManager />;

      case 'rooms':
        return <RoomList />;

      case 'students':
        return <StudentList />;

      case 'teachers':
      case 'users':
        return <UserManager />;

      case 'inspection':
      case 'hygiene_discipline':
        return <InspectionManager />;

      case 'cultural':
        return <CulturalSports activeTab="cultural" />;

      case 'sports':
        return <CulturalSports activeTab="sports" />;

      case 'evidence':
        return <EvidenceGallery />;

      case 'reports':
      case 'export':
        return <ReportCenter />;

      case 'alerts':
        return <ProgressTracker />;

      case 'settings':
        return <SettingsView />;

      case 'audit_logs':
        return <AuditLogView />;

      default:
        return <MainDashboard onNavigateTab={setCurrentTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenNotifications={() => setIsNotificationOpen(true)}
        onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        isMobileSidebarOpen={isMobileSidebarOpen}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Navigation Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Content Area */}
        <main className="flex-1 w-full p-4 sm:p-6 lg:p-8 lg:pl-72 transition-all">
          {renderCurrentView()}
        </main>
      </div>

      {/* Global Quick Search Modal */}
      <QuickSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigateToStudent={() => setCurrentTab('students')}
        onNavigateToRoom={() => setCurrentTab('rooms')}
      />

      {/* Notification / Warning Drawer */}
      <NotificationDrawer
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        onNavigateToRoom={() => setCurrentTab('attendance')}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <MainAppLayout />
      </DataProvider>
    </AuthProvider>
  );
}
