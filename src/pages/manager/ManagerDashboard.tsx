import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { DashboardCard } from '../../components/common/DashboardCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  Users,
  Utensils,
  PackageX,
  AlertCircle,
  Clock,
  ArrowRight,
  ChefHat,
  CheckCircle2,
  Calendar
} from 'lucide-react';

export const ManagerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { students, menus, inventory, complaints, attendance, currentUser } = useApp();

  const today = '2026-09-16';
  const todayAttendance = attendance.filter(a => a.date === today);

  const breakfastCount = todayAttendance.filter(a => a.breakfast).length;
  const lunchCount = todayAttendance.filter(a => a.lunch).length;
  const snacksCount = todayAttendance.filter(a => a.snacks).length;
  const dinnerCount = todayAttendance.filter(a => a.dinner).length;

  const lowStock = inventory.filter(i => i.status === 'Low Stock' || i.status === 'Out of Stock');
  const kitchenComplaints = complaints.filter(c => c.category === 'Food Quality' || c.category === 'Hygiene');
  const todayMenus = menus.filter(m => m.dayOfWeek === 'Wednesday');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
              <ChefHat className="w-4 h-4" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Mess Manager Portal
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Kitchen operations, dining counter meal tallies, rations, and hygiene oversight.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-600 dark:text-slate-400 font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl shadow-2xs flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-blue-500" />
            <span>Shift: Day Duty (Annapurna Hall)</span>
          </span>
        </div>
      </div>

      {/* 4 Counter Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard
          title="Breakfast Turnout"
          value={`${breakfastCount} / ${students.length}`}
          subtitle="Served this morning"
          icon={Utensils}
          iconColor="text-blue-600 bg-blue-50 dark:bg-blue-950/50 dark:text-blue-400"
          onClick={() => navigate('/manager/attendance')}
        />
        <DashboardCard
          title="Lunch Turnout"
          value={`${lunchCount} / ${students.length}`}
          subtitle="Served at afternoon counter"
          icon={Utensils}
          iconColor="text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-400"
          onClick={() => navigate('/manager/attendance')}
        />
        <DashboardCard
          title="Low Ration SKUs"
          value={lowStock.length}
          subtitle="Buffer reorder required"
          icon={PackageX}
          iconColor="text-rose-600 bg-rose-50 dark:bg-rose-950/50 dark:text-rose-400"
          onClick={() => navigate('/manager/inventory')}
        />
        <DashboardCard
          title="Kitchen Grievances"
          value={kitchenComplaints.length}
          subtitle="Under remediation"
          icon={AlertCircle}
          iconColor="text-purple-600 bg-purple-50 dark:bg-purple-950/50 dark:text-purple-400"
          onClick={() => navigate('/manager/complaints')}
        />
      </div>

      {/* Quick Meal Headcount Tally */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Dining Hall Live Headcount (Today)
            </h2>
            <p className="text-xs text-slate-500">Live counts recorded at mess counter check-in</p>
          </div>
          <button
            onClick={() => navigate('/manager/attendance')}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            <span>Open Attendance Register</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Breakfast</span>
            <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">{breakfastCount} meals</p>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-blue-600 h-full rounded-full" style={{ width: `${(breakfastCount / students.length) * 100}%` }} />
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Lunch</span>
            <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">{lunchCount} meals</p>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${(lunchCount / students.length) * 100}%` }} />
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Snacks & Tea</span>
            <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">{snacksCount} meals</p>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-amber-500 h-full rounded-full" style={{ width: `${(snacksCount / students.length) * 100}%` }} />
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Dinner</span>
            <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">{dinnerCount} meals</p>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${(dinnerCount / students.length) * 100}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Today's Kitchen Schedule & Pantry Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Kitchen Schedule */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Today's Cook Schedule (Wednesday)
            </h2>
            <button
              onClick={() => navigate('/manager/menu')}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              Update Schedule →
            </button>
          </div>

          <div className="space-y-3">
            {todayMenus.map(m => (
              <div
                key={m.id}
                className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-start justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {m.category}: {m.name}
                    </span>
                    <StatusBadge status={m.dietType} size="sm" />
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                    {m.items.join(', ')}
                  </p>
                  <span className="text-[10px] text-slate-400 block mt-1 font-mono">
                    Service Window: {m.timing}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock Ration Supplies */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Critical Pantry Replenishment
            </h2>
            <button
              onClick={() => navigate('/manager/inventory')}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              Restock All →
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {lowStock.map(item => (
              <div key={item.id} className="py-2.5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {item.name}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Category: {item.category} • Supplier: {item.supplier || 'Campus Store'}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-rose-600 dark:text-rose-400 block">
                    {item.quantity} {item.unit}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Min buffer: {item.minimumStock} {item.unit}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
