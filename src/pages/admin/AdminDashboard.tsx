import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { DashboardCard } from '../../components/common/DashboardCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { SimpleBarChart, SimpleDonutChart } from '../../components/common/SimpleCharts';
import {
  Users,
  Utensils,
  Receipt,
  DollarSign,
  PackageX,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  Clock,
  ExternalLink
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { students, menus, inventory, complaints, bills, payments, attendance } = useApp();

  // Metrics calculations
  const totalStudents = students.length;
  const todayAttendanceRecords = attendance.filter(a => a.date === '2026-09-16');
  const todayMealsCount = todayAttendanceRecords.reduce((acc, curr) => {
    let count = 0;
    if (curr.breakfast) count++;
    if (curr.lunch) count++;
    if (curr.snacks) count++;
    if (curr.dinner) count++;
    return acc + count;
  }, 0);

  const pendingPaymentsTotal = bills.reduce((acc, b) => acc + b.dueAmount, 0);
  const monthlyRevenue = payments.reduce((acc, p) => p.status === 'Completed' ? acc + p.amount : acc, 0);
  const lowStockItems = inventory.filter(i => i.status === 'Low Stock' || i.status === 'Out of Stock');
  const openComplaints = complaints.filter(c => c.status === 'Pending' || c.status === 'In Progress');

  // Meal Statistics Chart Data (Mon - Sun)
  const mealStatsData = [
    { label: 'Mon', value: 340, secondaryValue: 310 },
    { label: 'Tue', value: 360, secondaryValue: 325 },
    { label: 'Wed', value: 385, secondaryValue: 370 },
    { label: 'Thu', value: 330, secondaryValue: 315 },
    { label: 'Fri', value: 410, secondaryValue: 395 },
    { label: 'Sat', value: 440, secondaryValue: 420 },
    { label: 'Sun', value: 460, secondaryValue: 450 }
  ];

  // Revenue By Hostels Donut Chart
  const revenueDonut = [
    { label: 'Block A (Boys)', value: 14500, color: '#3b82f6' },
    { label: 'Block B (Boys)', value: 12800, color: '#6366f1' },
    { label: 'Block C (Boys)', value: 11200, color: '#8b5cf6' },
    { label: 'Block G (Girls)', value: 13900, color: '#10b981' },
    { label: 'Block H (Girls)', value: 12400, color: '#f59e0b' }
  ];

  // Today's menu (GEC Sheikhpura Hostel 2: Aalu Paratha, Chawal & Dal, Ice Cream, Roti)
  const todayMenus = menus.filter(m => m.dayOfWeek === 'Monday');

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Admin Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Real-time monitoring of hostel dining, payments, inventory & student grievances.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Mess Halls Active
          </span>
        </div>
      </div>

      {/* 6 Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <DashboardCard
          title="Total Students"
          value={totalStudents}
          subtitle="Enrolled in dining"
          icon={Users}
          iconColor="text-blue-600 bg-blue-50 dark:bg-blue-950/50 dark:text-blue-400"
          onClick={() => navigate('/admin/students')}
        />
        <DashboardCard
          title="Today's Meals"
          value={todayMealsCount}
          subtitle="Consumed so far"
          icon={Utensils}
          iconColor="text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-400"
          onClick={() => navigate('/admin/attendance')}
        />
        <DashboardCard
          title="Pending Payments"
          value={`₹${pendingPaymentsTotal.toLocaleString()}`}
          subtitle="Outstanding dues"
          icon={Receipt}
          iconColor="text-amber-600 bg-amber-50 dark:bg-amber-950/50 dark:text-amber-400"
          onClick={() => navigate('/admin/billing')}
        />
        <DashboardCard
          title="Monthly Revenue"
          value={`₹${monthlyRevenue.toLocaleString()}`}
          subtitle="Collected this month"
          icon={DollarSign}
          iconColor="text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 dark:text-indigo-400"
          trend={{ value: '14.2%', isPositive: true, label: 'vs last mo' }}
          onClick={() => navigate('/admin/payments')}
        />
        <DashboardCard
          title="Low Stock Items"
          value={lowStockItems.length}
          subtitle="Requires reorder"
          icon={PackageX}
          iconColor="text-rose-600 bg-rose-50 dark:bg-rose-950/50 dark:text-rose-400"
          onClick={() => navigate('/admin/inventory')}
        />
        <DashboardCard
          title="Open Complaints"
          value={openComplaints.length}
          subtitle="Grievances unresolved"
          icon={AlertCircle}
          iconColor="text-purple-600 bg-purple-50 dark:bg-purple-950/50 dark:text-purple-400"
          onClick={() => navigate('/admin/complaints')}
        />
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Meal Statistics Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                Meal Consumption Statistics
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Weekly turnout comparing Lunch vs Dinner servings
              </p>
            </div>
            <button
              onClick={() => navigate('/admin/reports')}
              className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <span>Full Report</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <SimpleBarChart
            data={mealStatsData}
            primaryLabel="Lunch Headcount"
            secondaryLabel="Dinner Headcount"
            height={210}
            valueSuffix=" meals"
          />
        </div>

        {/* Revenue Distribution Donut */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between">
          <div className="mb-2">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Revenue by Hostel Block
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Contribution to monthly dining budget
            </p>
          </div>
          <div className="py-2">
            <SimpleDonutChart
              data={revenueDonut}
              centerLabel={`₹${(monthlyRevenue / 1000).toFixed(0)}k`}
              centerSub="Collected"
              size={150}
            />
          </div>
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>Billing cycle: Sep 1 - Sep 30</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">Target: ₹75,000</span>
          </div>
        </div>
      </div>

      {/* Grid: Low-Stock Alerts & Today's Menu */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low-stock Alerts */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <PackageX className="w-4 h-4 text-rose-500" />
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                Low-Stock Alerts ({lowStockItems.length})
              </h2>
            </div>
            <button
              onClick={() => navigate('/admin/inventory')}
              className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              Manage Inventory →
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {lowStockItems.slice(0, 4).map(item => (
              <div key={item.id} className="py-2.5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{item.name}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Category: {item.category} • Supplier: {item.supplier || 'Campus Store'}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-rose-600 dark:text-rose-400 block">
                    {item.quantity} {item.unit}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Min: {item.minimumStock} {item.unit}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Today's Menu Preview */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" />
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                Today's Menu (GEC Sheikhpura • Hostel 2)
              </h2>
            </div>
            <button
              onClick={() => navigate('/admin/today-menu')}
              className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              Today's View →
            </button>
          </div>

          <div className="space-y-2.5">
            {todayMenus.map(m => (
              <div
                key={m.id}
                className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-start justify-between gap-2"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {m.category}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {m.timing}
                    </span>
                    <StatusBadge status={m.dietType} size="sm" />
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-1">
                    {m.items.join(', ')}
                  </p>
                </div>
                <span className="text-[11px] font-semibold text-slate-500 shrink-0">
                  {m.calories} kcal
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tables: Recent Payments & Recent Complaints */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Payments */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Recent Payments
            </h2>
            <button
              onClick={() => navigate('/admin/payments')}
              className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              View All Payments →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="pb-2">Student</th>
                  <th className="pb-2">Txn ID</th>
                  <th className="pb-2">Amount</th>
                  <th className="pb-2">Method</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {payments.slice(0, 5).map(pay => (
                  <tr key={pay.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-2.5 font-medium text-slate-800 dark:text-slate-200">
                      {pay.studentName}
                      <span className="block text-[10px] text-slate-400">{pay.rollNo}</span>
                    </td>
                    <td className="py-2.5 font-mono text-[11px] text-slate-500">
                      {pay.transactionId.slice(-8)}
                    </td>
                    <td className="py-2.5 font-bold text-slate-900 dark:text-white">
                      ₹{pay.amount.toLocaleString()}
                    </td>
                    <td className="py-2.5 text-slate-600 dark:text-slate-400">
                      {pay.method}
                    </td>
                    <td className="py-2.5">
                      <StatusBadge status={pay.status} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Complaints */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Recent Complaints
            </h2>
            <button
              onClick={() => navigate('/admin/complaints')}
              className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              Redressal Board →
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {complaints.slice(0, 4).map(cmp => (
              <div key={cmp.id} className="py-2.5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {cmp.title}
                  </h3>
                  <StatusBadge status={cmp.status} size="sm" />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                  {cmp.description}
                </p>
                <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-400">
                  <span>By: {cmp.studentName} ({cmp.rollNo})</span>
                  <span>•</span>
                  <span>{cmp.date}</span>
                  <span>•</span>
                  <span className="capitalize">{cmp.category}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
