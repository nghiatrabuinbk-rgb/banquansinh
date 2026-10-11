import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';
import { storageService } from '../services/storage';

interface AuthContextType {
  currentUser: User;
  allUsers: User[];
  setCurrentUser: (user: User) => void;
  switchUserById: (userId: string) => void;
  loginWithGooglePopup: (customEmail?: string) => Promise<boolean>;
  logout: () => void;
  hasRole: (roles: Role[]) => boolean;
  canManageSystem: boolean;
  canManageRooms: boolean;
  canViewAllRooms: boolean;
  canScoreInspection: boolean;
  canExportReports: boolean;
  canEditSettings: boolean;
  isTeacherOnly: boolean;
  assignedRoomId?: string;
  refreshUsers: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => storageService.getUsers());
  const [currentUserId, setCurrentUserId] = useState<string>(() => storageService.getCurrentUserId());

  // Find user or default to head master Nguyễn Trọng Nghĩa
  const currentUser = users.find(u => u.id === currentUserId) || users[0] || {
    id: 'u-admin-1',
    gmail: 'nghiatrabui.nbk@gmail.com',
    name: 'Nguyễn Trọng Nghĩa',
    role: 'head_master' as Role,
    status: 'active' as const,
    createdAt: '2026-08-15',
  };

  const refreshUsers = () => {
    const list = storageService.getUsers();
    setUsers(list);
  };

  const switchUserById = (userId: string) => {
    const target = users.find(u => u.id === userId);
    if (target) {
      if (target.status === 'locked') {
        alert('Tài khoản này hiện đang bị khóa bởi Quản trị viên!');
        return;
      }
      setCurrentUserId(userId);
      storageService.setCurrentUserId(userId);
      storageService.addAuditLog(target, 'Chuyển tài khoản', 'Xác thực', `Chuyển sang người dùng ${target.name} (${target.role})`);
    }
  };

  const loginWithGooglePopup = async (customEmail?: string): Promise<boolean> => {
    const emailToUse = customEmail || 'nghiatrabui.nbk@gmail.com';
    let matched = users.find(u => u.gmail.toLowerCase() === emailToUse.toLowerCase());

    if (!matched) {
      // If new user via Google, register as teacher or viewer
      const newUser: User = {
        id: 'u-g-' + Date.now(),
        gmail: emailToUse,
        name: emailToUse.split('@')[0],
        role: 'teacher',
        status: 'active',
        createdAt: new Date().toISOString().slice(0, 10),
      };
      const updated = [...users, newUser];
      storageService.saveUsers(updated);
      setUsers(updated);
      matched = newUser;
    }

    if (matched.status === 'locked') {
      alert('Tài khoản này hiện đang bị khóa bởi Quản trị viên!');
      return false;
    }

    setCurrentUserId(matched.id);
    storageService.setCurrentUserId(matched.id);
    storageService.addAuditLog(matched, 'Đăng nhập Google', 'Xác thực', `Đăng nhập thành công với tài khoản ${matched.gmail}`);
    return true;
  };

  const logout = () => {
    // Switch to default admin or prompt
    const defaultUser = users[0];
    if (defaultUser) {
      setCurrentUserId(defaultUser.id);
      storageService.setCurrentUserId(defaultUser.id);
    }
  };

  const hasRole = (roles: Role[]) => {
    return roles.includes(currentUser.role);
  };

  const canManageSystem = ['admin', 'head_master'].includes(currentUser.role);
  const canManageRooms = ['admin', 'head_master', 'principal'].includes(currentUser.role);
  const canViewAllRooms = ['admin', 'principal', 'head_master', 'supervisor'].includes(currentUser.role);
  const canScoreInspection = ['admin', 'head_master', 'supervisor'].includes(currentUser.role);
  const canExportReports = ['admin', 'principal', 'head_master'].includes(currentUser.role);
  const canEditSettings = ['admin', 'head_master'].includes(currentUser.role);
  const isTeacherOnly = currentUser.role === 'teacher';
  const assignedRoomId = currentUser.assignedRoomId;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        allUsers: users,
        setCurrentUser: (u) => switchUserById(u.id),
        switchUserById,
        loginWithGooglePopup,
        logout,
        hasRole,
        canManageSystem,
        canManageRooms,
        canViewAllRooms,
        canScoreInspection,
        canExportReports,
        canEditSettings,
        isTeacherOnly,
        assignedRoomId,
        refreshUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
