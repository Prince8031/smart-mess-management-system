import React from 'react';
import { NavLink } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Users,
  UserCog,
  UtensilsCrossed,
  CalendarCheck,
  Receipt,
  Banknote,
  Package,
  AlertCircle,
  BellRing,
  BarChart3,
  Settings,
  CalendarDays,
  User,
  Clock,
  X
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
  badge?: string | number;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { currentRole, complaints, inventory, notices } = useApp();

  const pendingComplaintsCount = complaints.filter(c => c.status === 'Pending').length;
  const lowStockCount = inventory.filter(i => i.status === 'Low Stock' || i.status === 'Out of Stock').length;

  const adminNavItems: NavItem[] = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: "Today's Menu", path: '/admin/today-menu', icon: Clock },
    { label: 'Students', path: '/admin/students', icon: Users },
    { label: 'Mess Managers', path: '/admin/managers', icon: UserCog },
    { label: 'Menu Management', path: '/admin/menu', icon: UtensilsCrossed },
    { label: 'Attendance', path: '/admin/attendance', icon: CalendarCheck },
    { label: 'Billing', path: '/admin/billing', icon: Receipt },
    { label: 'Payment Ledger', path: '/admin/payments', icon: Banknote },
    { label: 'Inventory', path: '/admin/inventory', icon: Package, badge: lowStockCount > 0 ? lowStockCount : undefined },
    { label: 'Complaints', path: '/admin/complaints', icon: AlertCircle, badge: pendingComplaintsCount > 0 ? pendingComplaintsCount : undefined },
    { label: 'Notices', path: '/admin/notices', icon: BellRing, badge: notices.length },
    { label: 'Reports', path: '/admin/reports', icon: BarChart3 },
    { label: 'Settings', path: '/admin/settings', icon: Settings }
  ];

  const managerNavItems: NavItem[] = [
    { label: 'Dashboard', path: '/manager', icon: LayoutDashboard },
    { label: "Today's Menu", path: '/manager/today-menu', icon: Clock },
    { label: 'Weekly Menu', path: '/manager/weekly-menu', icon: CalendarDays },
    { label: 'Attendance', path: '/manager/attendance', icon: CalendarCheck },
    { label: 'Inventory', path: '/manager/inventory', icon: Package, badge: lowStockCount > 0 ? lowStockCount : undefined },
    { label: 'Complaints', path: '/manager/complaints', icon: AlertCircle, badge: pendingComplaintsCount > 0 ? pendingComplaintsCount : undefined },
    { label: 'Notices', path: '/manager/notices', icon: BellRing },
    { label: 'Reports', path: '/manager/reports', icon: BarChart3 },
    { label: 'Profile', path: '/manager/profile', icon: User }
  ];

  const studentNavItems: NavItem[] = [
    { label: 'Dashboard', path: '/student', icon: LayoutDashboard },
    { label: "Today's Menu", path: '/student/today-menu', icon: Clock },
    { label: 'Weekly Menu', path: '/student/weekly-menu', icon: CalendarDays },
    { label: 'My Attendance', path: '/student/attendance', icon: CalendarCheck },
    { label: 'Monthly Mess Bill', path: '/student/billing', icon: Receipt },
    { label: 'Complaints', path: '/student/complaints', icon: AlertCircle },
    { label: 'Notices', path: '/student/notices', icon: BellRing },
    { label: 'Profile', path: '/student/profile', icon: User }
  ];

  const navItems = currentRole === 'admin'
    ? adminNavItems
    : currentRole === 'manager'
    ? managerNavItems
    : studentNavItems;

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800">
      {/* Mobile Header with close */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
            SM
          </div>
          <span className="font-bold text-slate-800 dark:text-white">Smart Mess Menu</span>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Role tag banner */}
      <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30">
        <div className="flex items-center justify-between">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 dark:text-slate-500">
            Navigation
          </span>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300">
            {currentRole}
          </span>
        </div>
      </div>

      {/* Nav links */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        {navItems.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin' || item.path === '/manager' || item.path === '/student'}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-white text-blue-600'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 dark:text-slate-500 flex items-center justify-between">
        <span>Smart Mess v1.0</span>
        <span className="inline-flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Online
        </span>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 h-[calc(100vh-4rem)] sticky top-16 z-20">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/50 dark:bg-slate-950/80 backdrop-blur-xs transition-opacity"
            onClick={onClose}
          />
          <div className="fixed inset-y-0 left-0 w-64 max-w-xs z-50 shadow-2xl transition-transform transform">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
