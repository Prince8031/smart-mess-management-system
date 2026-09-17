import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { DashboardCard } from '../../components/common/DashboardCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { FormInput } from '../../components/common/FormInput';
import { Select } from '../../components/common/Select';
import {
  Utensils,
  Receipt,
  CheckCircle,
  AlertCircle,
  Calendar,
  CreditCard,
  MessageSquarePlus,
  ArrowRight,
  Clock,
  Sparkles,
  Flame,
  Check
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, menus, bills, attendance, notices, addComplaint } = useApp();

  const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false);
  const [complaintForm, setComplaintForm] = useState({
    title: '',
    category: 'Food Quality',
    priority: 'Normal' as 'Normal' | 'Urgent',
    description: ''
  });

  const studentName = currentUser?.name || 'Aarav Sharma';
  const studentId = currentUser?.studentId || 'CS2023-014';
  const hostelBlock = currentUser?.hostelBlock || 'Block A (Boys)';
  const roomNo = currentUser?.roomNo || 'A-204';
  const dietPref = currentUser?.dietPreference || 'Veg';

  // Find latest bill
  const myBill = bills.find(b => b.rollNo === studentId) || bills[0];

  // Today's attendance
  const todayRec = attendance.find(a => a.rollNo === studentId && a.date === '2026-09-16');

  // Today's Menu (GEC Sheikhpura Hostel 2 - Monday Schedule: Aalu Paratha, Chawal & Dal, Ice cream, Roti)
  const todayMenus = menus.filter(m => m.dayOfWeek === 'Monday');

  const handleFileComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    addComplaint({
      studentId: currentUser?.id || 'demo-student-id',
      studentName,
      rollNo: studentId,
      title: complaintForm.title,
      description: complaintForm.description,
      category: complaintForm.category,
      priority: complaintForm.priority,
      status: 'Pending',
      date: new Date().toISOString().split('T')[0]
    });
    setIsComplaintModalOpen(false);
    setComplaintForm({ title: '', category: 'Food Quality', priority: 'Normal', description: '' });
    navigate('/student/complaints');
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 text-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5" />
              Student Dining Dashboard
            </span>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              Welcome back, {studentName}!
            </h1>
            <p className="text-xs sm:text-sm text-blue-100">
              {studentId} • Room {roomNo} ({hostelBlock}) • Diet: {dietPref}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsComplaintModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-xs transition-colors border border-white/20"
            >
              <MessageSquarePlus className="w-4 h-4" />
              <span>Raise Issue</span>
            </button>
            <button
              onClick={() => navigate('/student/billing')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white text-blue-700 hover:bg-blue-50 text-xs font-bold shadow-xs transition-colors"
            >
              <Receipt className="w-4 h-4" />
              <span>Mess Bills</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard
          title="Current Month Dues"
          value={myBill ? `₹${myBill.dueAmount.toLocaleString()}` : '₹0'}
          subtitle={myBill?.dueAmount > 0 ? `Due by ${myBill.dueDate}` : 'Fully settled'}
          icon={Receipt}
          iconColor="text-rose-600 bg-rose-50 dark:bg-rose-950/50 dark:text-rose-400"
          onClick={() => navigate('/student/billing')}
        />
        <DashboardCard
          title="Meals Taken (Sep)"
          value={myBill ? `${myBill.totalMeals} meals` : '85 meals'}
          subtitle="Attendance record"
          icon={CheckCircle}
          iconColor="text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-400"
          onClick={() => navigate('/student/attendance')}
        />
        <DashboardCard
          title="Diet Preference"
          value={dietPref}
          subtitle="Registered kitchen profile"
          icon={Utensils}
          iconColor="text-blue-600 bg-blue-50 dark:bg-blue-950/50 dark:text-blue-400"
          onClick={() => navigate('/student/profile')}
        />
        <DashboardCard
          title="New Notices"
          value={notices.length}
          subtitle="From Chief Warden"
          icon={Calendar}
          iconColor="text-purple-600 bg-purple-50 dark:bg-purple-950/50 dark:text-purple-400"
          onClick={() => navigate('/student/notices')}
        />
      </div>

      {/* Today's Check-in Status */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Today's Meal Counter Check-in Status
          </h2>
          <span className="text-xs text-slate-400">Wednesday, 16 Sep 2026</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">Breakfast</span>
              <span className="text-[11px] text-slate-400">7:30 - 9:30 AM</span>
            </div>
            {todayRec?.breakfast ? (
              <span className="p-1 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                <Check className="w-4 h-4" />
              </span>
            ) : (
              <span className="text-xs text-slate-400 font-medium">Skipped</span>
            )}
          </div>

          <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">Lunch</span>
              <span className="text-[11px] text-slate-400">12:30 - 2:30 PM</span>
            </div>
            {todayRec?.lunch ? (
              <span className="p-1 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                <Check className="w-4 h-4" />
              </span>
            ) : (
              <span className="text-xs text-slate-400 font-medium">Pending</span>
            )}
          </div>

          <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">Snacks & Tea</span>
              <span className="text-[11px] text-slate-400">5:00 - 6:30 PM</span>
            </div>
            {todayRec?.snacks ? (
              <span className="p-1 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                <Check className="w-4 h-4" />
              </span>
            ) : (
              <span className="text-xs text-slate-400 font-medium">Upcoming</span>
            )}
          </div>

          <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">Dinner</span>
              <span className="text-[11px] text-slate-400">8:00 - 10:00 PM</span>
            </div>
            {todayRec?.dinner ? (
              <span className="p-1 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                <Check className="w-4 h-4" />
              </span>
            ) : (
              <span className="text-xs text-slate-400 font-medium">Upcoming</span>
            )}
          </div>
        </div>
      </div>

      {/* Grid: Today's Menu & Latest Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Meals Menu */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Today's Dining Hall Menu
              </h2>
              <p className="text-xs text-slate-500">GEC Sheikhpura • Hostel 2</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/student/today-menu')}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <span>Full Today View</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {todayMenus.map(menu => (
              <div
                key={menu.id}
                className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase font-bold text-blue-600 dark:text-blue-400">
                      {menu.category}
                    </span>
                    <span className="text-xs font-semibold text-slate-900 dark:text-white">
                      • {menu.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={menu.dietType} size="sm" />
                    <span className="text-[11px] text-amber-600 font-semibold flex items-center gap-0.5">
                      <Flame className="w-3 h-3" />
                      {menu.calories} kcal
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2">
                  {menu.items.join(', ')}
                </p>
                <span className="text-[10px] text-slate-400 block mt-1.5 font-mono">
                  {menu.timing}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Notices & Official Circulars */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Mess Circulars & Announcements
                </h2>
                <p className="text-xs text-slate-500">Official updates from Chief Warden</p>
              </div>
              <button
                onClick={() => navigate('/student/notices')}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                All Notices →
              </button>
            </div>

            <div className="space-y-3">
              {notices.slice(0, 3).map(n => (
                <div key={n.id} className="p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                      {n.title}
                    </h3>
                    <StatusBadge status={n.priority} size="sm" />
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mt-1">
                    {n.description}
                  </p>
                  <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between">
                    <span>{n.date}</span>
                    <span>By: {n.postedBy}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500">Going home this weekend?</span>
            <button
              onClick={() => navigate('/student/attendance')}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
            >
              Apply Mess Cut Leave →
            </button>
          </div>
        </div>
      </div>

      {/* Quick Complaint Modal */}
      <Modal
        isOpen={isComplaintModalOpen}
        onClose={() => setIsComplaintModalOpen(false)}
        title="Raise a Mess Grievance"
        subtitle="Submit feedback or report hygiene issues directly to the warden"
        maxWidth="md"
      >
        <form onSubmit={handleFileComplaint} className="space-y-4">
          <FormInput
            label="Issue Summary"
            required
            value={complaintForm.title}
            onChange={(e) => setComplaintForm({ ...complaintForm, title: e.target.value })}
            placeholder="e.g. Rice was undercooked during lunch"
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Grievance Category"
              value={complaintForm.category}
              onChange={(e) => setComplaintForm({ ...complaintForm, category: e.target.value })}
              options={['Food Quality', 'Hygiene', 'Timings', 'Billing Issue', 'Menu Variety', 'Staff Behavior']}
            />
            <Select
              label="Priority"
              value={complaintForm.priority}
              onChange={(e) => setComplaintForm({ ...complaintForm, priority: e.target.value as any })}
              options={['Normal', 'Urgent']}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Detailed Description
            </label>
            <textarea
              rows={4}
              required
              value={complaintForm.description}
              onChange={(e) => setComplaintForm({ ...complaintForm, description: e.target.value })}
              placeholder="Provide specific details, dining hall name, and counter number..."
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 p-2.5 text-xs sm:text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsComplaintModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
            >
              Submit Grievance
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
