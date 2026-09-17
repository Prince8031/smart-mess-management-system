import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  Sun,
  Moon,
  Bell,
  Utensils,
  ChevronDown,
  LogOut,
  UserCheck,
  Shield,
  ChefHat,
  GraduationCap,
  Database,
  RefreshCw,
} from 'lucide-react';
import { UserRole } from '../../types';

interface NavbarProps {
  onToggleMobileSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleMobileSidebar }) => {
  const {
    currentUser,
    currentRole,
    switchRole,
    logout: appLogout,
    theme,
    toggleTheme,
    notices,
    isBackendConnected,
    refreshBackendData,
    isLoadingData,
  } = useApp();
  const { logout: authLogout, user: authUser, login: authLogin } = useAuth();
  const navigate = useNavigate();
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);

  // Use authenticated user info if available, otherwise app context user
  const effectiveUser = authUser || currentUser;
  const effectiveRole = (effectiveUser?.role as UserRole) || currentRole || 'admin';

  const handleRoleChange = async (role: UserRole) => {
    setIsSwitching(true);
    setShowRoleDropdown(false);
    try {
      // Auto-authenticate with the seeded demo credentials for selected role
      const emailMap: Record<UserRole, string> = {
        admin: 'admin@messsystem.com',
        manager: 'manager@messsystem.com',
        student: 'student@messsystem.com',
      };
      await authLogin(emailMap[role], 'Password@123');
      await switchRole(role);
      if (role === 'admin') navigate('/admin');
      else if (role === 'manager') navigate('/manager');
      else if (role === 'student') navigate('/student');
    } catch {
      await switchRole(role);
      if (role === 'admin') navigate('/admin');
      else if (role === 'manager') navigate('/manager');
      else if (role === 'student') navigate('/student');
    } finally {
      setIsSwitching(false);
    }
  };

  const handleLogout = async () => {
    await authLogout();
    appLogout();
    navigate('/login');
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return <Shield className="w-3.5 h-3.5 text-indigo-500" />;
      case 'manager':
        return <ChefHat className="w-3.5 h-3.5 text-amber-500" />;
      case 'student':
        return <GraduationCap className="w-3.5 h-3.5 text-emerald-500" />;
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-4 sm:px-6">
      {/* Left section: Hamburger on mobile + Title/Brand */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileSidebar}
          aria-label="Open sidebar"
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div
          onClick={() => navigate('/')}
          className="flex items-center gap-2.5 cursor-pointer select-none"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-xs">
            <Utensils className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-white tracking-tight">
                Smart Mess
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-sm bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <Database className="w-2.5 h-2.5" />
                Phase 2 Backend
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 hidden sm:block">
              Hostel Dining Management
            </p>
          </div>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Sync / Refresh Data Button */}
        <button
          onClick={() => refreshBackendData()}
          disabled={isLoadingData}
          title="Refresh Data from MongoDB"
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:text-slate-300 dark:hover:bg-slate-800 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${isLoadingData ? 'animate-spin text-blue-500' : ''}`} />
        </button>

        {/* Role Switcher Button & Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowRoleDropdown(!showRoleDropdown)}
            disabled={isSwitching}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
          >
            {getRoleIcon(effectiveRole)}
            <span className="capitalize">{effectiveRole} View</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showRoleDropdown && (
            <div
              className="absolute right-0 mt-2 w-52 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg py-1.5 z-50 animate-in fade-in zoom-in-95"
              onMouseLeave={() => setShowRoleDropdown(false)}
            >
              <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Switch Role Preview
              </div>
              <button
                onClick={() => handleRoleChange('admin')}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 ${
                  effectiveRole === 'admin' ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-indigo-500" />
                  <span>Admin (Chief Warden)</span>
                </div>
                {effectiveRole === 'admin' && <UserCheck className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => handleRoleChange('manager')}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 ${
                  effectiveRole === 'manager' ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <ChefHat className="w-4 h-4 text-amber-500" />
                  <span>Mess Manager</span>
                </div>
                {effectiveRole === 'manager' && <UserCheck className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => handleRoleChange('student')}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 ${
                  effectiveRole === 'student' ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-emerald-500" />
                  <span>Student (Hostel Inmate)</span>
                </div>
                {effectiveRole === 'student' && <UserCheck className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}
        </div>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Notifications"
            className="relative p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
          </button>

          {showNotifications && (
            <div
              className="absolute right-0 mt-2 w-72 sm:w-80 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-3 z-50"
              onMouseLeave={() => setShowNotifications(false)}
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-900 dark:text-white">Mess Announcements</span>
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">
                  {notices.length} active
                </span>
              </div>
              <div className="mt-2 space-y-2 max-h-64 overflow-y-auto">
                {notices.slice(0, 3).map((n) => (
                  <div key={n.id} className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 text-xs">
                    <p className="font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">{n.title}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">{n.description}</p>
                    <span className="text-[10px] text-slate-400 mt-1 inline-block">{n.date}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* User Avatar & Logout */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold text-xs flex items-center justify-center shrink-0">
            {effectiveUser?.name ? effectiveUser.name.charAt(0) : 'U'}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight truncate max-w-[120px]">
              {effectiveUser?.name || 'User'}
            </p>
            <p className="text-[10px] text-slate-400 capitalize">
              {effectiveUser?.studentId || effectiveUser?.role}
            </p>
          </div>
          <button
            onClick={handleLogout}
            title="Log out"
            className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors ml-1"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
