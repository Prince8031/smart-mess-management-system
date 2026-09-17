import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { attendanceAPI } from '../../services/api';
import { AttendanceRecord, StudentReportRow } from '../../types';
import { DashboardCard } from '../../components/common/DashboardCard';
import { Modal } from '../../components/common/Modal';
import {
  Calendar,
  CheckCircle,
  XCircle,
  Users,
  Search,
  CheckCheck,
  Percent,
  Utensils,
  Download,
  AlertTriangle,
  Trash2,
  RefreshCw,
  Filter,
  FileSpreadsheet,
  Building2,
  Clock,
  ArrowUpDown,
  Check,
  X,
  Pencil
} from 'lucide-react';

type ViewTab = 'register' | 'low_attendance' | 'reports';

export const AttendancePage: React.FC = () => {
  const { attendance, menus, toggleMealAttendance, batchMarkAttendance, isBackendConnected } = useApp();

  const [activeTab, setActiveTab] = useState<ViewTab>('register');
  const [selectedDate, setSelectedDate] = useState('2026-09-16');
  const [selectedMeal, setSelectedMeal] = useState<'breakfast' | 'lunch' | 'snacks' | 'dinner'>('lunch');
  const [searchTerm, setSearchTerm] = useState('');
  const [blockFilter, setBlockFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(false);
  const [apiRecords, setApiRecords] = useState<AttendanceRecord[]>([]);

  // Correction Modal State (Admin audit & adjustment)
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);
  const [editForm, setEditForm] = useState<{
    breakfast: boolean;
    lunch: boolean;
    snacks: boolean;
    dinner: boolean;
    correctionNote: string;
  }>({
    breakfast: false,
    lunch: false,
    snacks: false,
    dinner: false,
    correctionNote: '',
  });
  const [isSavingCorrection, setIsSavingCorrection] = useState(false);

  // Day of week calculation for meal menu resolution
  const selectedDayOfWeek = useMemo(() => {
    if (!selectedDate) return 'Wednesday';
    const parts = selectedDate.split('-').map(Number);
    if (parts.length < 3) return 'Wednesday';
    const d = new Date(parts[0], parts[1] - 1, parts[2]);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[d.getDay()] || 'Wednesday';
  }, [selectedDate]);

  // Connect Hostel 2 weekly menu items for the selected date
  const selectedDayMenus = useMemo(() => {
    const getCat = (cat: string) =>
      menus.find(
        (m) =>
          m.dayOfWeek?.toLowerCase() === selectedDayOfWeek.toLowerCase() &&
          m.category.toLowerCase() === cat.toLowerCase()
      );
    return {
      breakfast: getCat('Breakfast'),
      lunch: getCat('Lunch'),
      snacks: getCat('Snacks'),
      dinner: getCat('Dinner'),
    };
  }, [menus, selectedDayOfWeek]);

  // Report Date Range Filters
  const [reportStartDate, setReportStartDate] = useState('2026-09-01');
  const [reportEndDate, setReportEndDate] = useState('2026-09-16');
  const [reportData, setReportData] = useState<{ summary?: any; students: StudentReportRow[] }>({
    students: []
  });

  // Delete Record Modal State
  const [deleteTarget, setDeleteTarget] = useState<AttendanceRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch Attendance Records
  const loadAttendance = async (date: string) => {
    setIsLoading(true);
    try {
      if (isBackendConnected) {
        const res = await attendanceAPI.getAttendance({ date });
        if (res && res.data) {
          setApiRecords(res.data);
        }
      } else {
        setApiRecords(attendance.filter(a => a.date === date));
      }
    } catch {
      setApiRecords(attendance.filter(a => a.date === date));
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch Attendance Report
  const loadReport = async () => {
    try {
      if (isBackendConnected) {
        const data = await attendanceAPI.getAttendanceReport({
          startDate: reportStartDate,
          endDate: reportEndDate,
        });
        if (data) {
          setReportData(data);
        }
      }
    } catch {
      // Fallback compute from local attendance
    }
  };

  useEffect(() => {
    loadAttendance(selectedDate);
  }, [selectedDate, isBackendConnected]);

  useEffect(() => {
    if (activeTab === 'reports' || activeTab === 'low_attendance') {
      loadReport();
    }
  }, [activeTab, reportStartDate, reportEndDate, isBackendConnected]);

  // Combined records for selected date
  const dateRecords = useMemo(() => {
    if (apiRecords.length > 0) return apiRecords;
    return attendance.filter(a => a.date === selectedDate);
  }, [apiRecords, attendance, selectedDate]);

  // Filter by search & block
  const filteredRecords = useMemo(() => {
    return dateRecords.filter(rec => {
      if (blockFilter !== 'All' && rec.hostelBlock !== blockFilter) return false;
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        return (
          rec.studentName.toLowerCase().includes(term) ||
          rec.rollNo.toLowerCase().includes(term)
        );
      }
      return true;
    });
  }, [dateRecords, blockFilter, searchTerm]);

  // Overall statistics
  const totalEnrolled = dateRecords.length || 20;
  const presentCount = dateRecords.filter(r => r[selectedMeal]).length;
  const absentCount = totalEnrolled - presentCount;
  const attendancePercentage = totalEnrolled > 0 ? Math.round((presentCount / totalEnrolled) * 100) : 0;

  // Meal breakdown for selected date
  const breakfastCount = dateRecords.filter(r => r.breakfast).length;
  const lunchCount = dateRecords.filter(r => r.lunch).length;
  const snacksCount = dateRecords.filter(r => r.snacks).length;
  const dinnerCount = dateRecords.filter(r => r.dinner).length;

  // Low attendance students (< 75%) calculation
  const lowAttendanceStudents = useMemo(() => {
    if (reportData.students.length > 0) {
      return reportData.students.filter(s => s.overallPercentage < 75);
    }
    // Calculate from attendance context records
    const studentAgg: Record<string, { name: string; rollNo: string; hostel: string; attended: number; total: number }> = {};
    attendance.forEach(rec => {
      if (!studentAgg[rec.rollNo]) {
        studentAgg[rec.rollNo] = {
          name: rec.studentName,
          rollNo: rec.rollNo,
          hostel: rec.hostelBlock,
          attended: 0,
          total: 0
        };
      }
      studentAgg[rec.rollNo].total += 4;
      if (rec.breakfast) studentAgg[rec.rollNo].attended++;
      if (rec.lunch) studentAgg[rec.rollNo].attended++;
      if (rec.snacks) studentAgg[rec.rollNo].attended++;
      if (rec.dinner) studentAgg[rec.rollNo].attended++;
    });

    return Object.values(studentAgg)
      .map(s => ({
        studentId: s.rollNo,
        rollNo: s.rollNo,
        studentName: s.name,
        roomNo: 'N/A',
        hostelBlock: s.hostel,
        totalDays: Math.round(s.total / 4),
        breakfastPercentage: Math.round((s.attended / s.total) * 100),
        lunchPercentage: Math.round((s.attended / s.total) * 100),
        snacksPercentage: Math.round((s.attended / s.total) * 100),
        dinnerPercentage: Math.round((s.attended / s.total) * 100),
        overallPercentage: Math.round((s.attended / s.total) * 100)
      }))
      .filter(s => s.overallPercentage < 75);
  }, [reportData, attendance]);

  // Export Attendance Report as CSV
  const handleExportCSV = () => {
    const headers = ['Roll No', 'Student Name', 'Hostel Block', 'Date', 'Breakfast', 'Lunch', 'Snacks', 'Dinner', 'Total Present'];
    const rows = (apiRecords.length > 0 ? apiRecords : attendance).map(r => [
      r.rollNo,
      `"${r.studentName}"`,
      `"${r.hostelBlock}"`,
      r.date,
      r.breakfast ? 'Present' : 'Absent',
      r.lunch ? 'Present' : 'Absent',
      r.snacks ? 'Present' : 'Absent',
      r.dinner ? 'Present' : 'Absent',
      (r.breakfast ? 1 : 0) + (r.lunch ? 1 : 0) + (r.snacks ? 1 : 0) + (r.dinner ? 1 : 0)
    ]);

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `mess_attendance_report_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Open Attendance Correction Modal
  const handleOpenEdit = (rec: AttendanceRecord) => {
    setEditingRecord(rec);
    setEditForm({
      breakfast: Boolean(rec.breakfast),
      lunch: Boolean(rec.lunch),
      snacks: Boolean(rec.snacks),
      dinner: Boolean(rec.dinner),
      correctionNote: '',
    });
  };

  // Save Attendance Correction
  const handleSaveCorrection = async () => {
    if (!editingRecord) return;
    setIsSavingCorrection(true);
    try {
      const updatedData: Partial<AttendanceRecord> = {
        breakfast: editForm.breakfast,
        lunch: editForm.lunch,
        snacks: editForm.snacks,
        dinner: editForm.dinner,
        totalPresent:
          (editForm.breakfast ? 1 : 0) +
          (editForm.lunch ? 1 : 0) +
          (editForm.snacks ? 1 : 0) +
          (editForm.dinner ? 1 : 0),
      };

      if (isBackendConnected && editingRecord.id) {
        await attendanceAPI.updateAttendance(editingRecord.id, updatedData);
      }

      // Optimistically update apiRecords
      setApiRecords((prev) =>
        prev.map((r) => {
          if (r.id === editingRecord.id || r.rollNo === editingRecord.rollNo) {
            const nowStr = new Date().toISOString();
            return {
              ...r,
              ...updatedData,
              updatedAt: nowStr,
              updatedBy: 'Admin (Corrected)',
            };
          }
          return r;
        })
      );

      setEditingRecord(null);
    } catch (err) {
      console.error('Failed to save correction', err);
    } finally {
      setIsSavingCorrection(false);
    }
  };

  // Inline toggle for individual meals
  const handleInlineToggleMeal = async (
    rec: AttendanceRecord,
    meal: 'breakfast' | 'lunch' | 'snacks' | 'dinner'
  ) => {
    const nextStatus = !rec[meal];

    // Optimistically update apiRecords
    setApiRecords((prev) =>
      prev.map((r) => {
        if (r.id === rec.id || r.rollNo === rec.rollNo) {
          const nowStr = new Date().toISOString();
          return {
            ...r,
            [meal]: nextStatus,
            [`${meal}Detail`]: { status: nextStatus, markedAt: nowStr, markedBy: 'Admin' },
            updatedAt: nowStr,
            updatedBy: 'Admin',
          };
        }
        return r;
      })
    );

    try {
      await toggleMealAttendance(rec.id, meal);
    } catch (err) {
      console.error('Failed to toggle meal', err);
    }
  };

  // Batch mark attendance for active meal
  const handleAdminBatchMark = async (status: boolean) => {
    setApiRecords((prev) =>
      prev.map((r) => {
        const nowStr = new Date().toISOString();
        return {
          ...r,
          [selectedMeal]: status,
          [`${selectedMeal}Detail`]: { status, markedAt: nowStr, markedBy: 'Admin (Batch)' },
          updatedAt: nowStr,
          updatedBy: 'Admin (Batch)',
        };
      })
    );

    try {
      await batchMarkAttendance(selectedDate, selectedMeal, status);
    } catch (err) {
      console.error('Failed batch mark', err);
    }
  };

  // Delete Attendance Record (Admin only)
  const handleDeleteRecord = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      if (isBackendConnected && deleteTarget.id) {
        await attendanceAPI.deleteAttendance(deleteTarget.id);
      }
      setApiRecords(prev => prev.filter(r => r.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      console.error('Failed to delete attendance record', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Utensils className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span>Attendance Monitoring & Audit Console</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Admin oversight: daily roll calls, meal head counts, low attendance alerts, and ledger export
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => loadAttendance(selectedDate)}
            disabled={isLoading}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
            title="Refresh Records"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs sm:text-sm font-semibold shadow-xs transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('register')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'register'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Daily Register & Head Count
        </button>

        <button
          onClick={() => setActiveTab('low_attendance')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${
            activeTab === 'low_attendance'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Low Attendance Alerts</span>
          {lowAttendanceStudents.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white text-amber-800 font-bold">
              {lowAttendanceStudents.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${
            activeTab === 'reports'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Aggregate Reports</span>
        </button>
      </div>

      {/* VIEW TAB 1: DAILY REGISTER */}
      {activeTab === 'register' && (
        <div className="space-y-6">
          {/* Summary Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <DashboardCard
              title="Total Enrolled"
              value={totalEnrolled}
              subtitle={`Active students on ${selectedDate}`}
              icon={Users}
              iconColor="text-blue-600 bg-blue-50 dark:bg-blue-950/50 dark:text-blue-400"
            />
            <DashboardCard
              title={`${selectedMeal.toUpperCase()} Head Count`}
              value={presentCount}
              subtitle="Served at dining counter"
              icon={CheckCircle}
              iconColor="text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-400"
            />
            <DashboardCard
              title="Absent / On Leave"
              value={absentCount}
              subtitle="Mess cut or skipped"
              icon={XCircle}
              iconColor="text-rose-600 bg-rose-50 dark:bg-rose-950/50 dark:text-rose-400"
            />
            <DashboardCard
              title="Attendance Rate"
              value={`${attendancePercentage}%`}
              subtitle="Overall turnout ratio"
              icon={Percent}
              iconColor="text-purple-600 bg-purple-50 dark:bg-purple-950/50 dark:text-purple-400"
            />
          </div>

          {/* All-Meal Turnout Overview Bar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Today's Mess Head Count By Meal Session ({selectedDate})
              </h3>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-2 py-1 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div
                onClick={() => setSelectedMeal('breakfast')}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedMeal === 'breakfast'
                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 ring-1 ring-blue-500'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Breakfast (7:30 - 9:30 AM)</span>
                  {selectedDayMenus.breakfast?.dietType && (
                    <span className="text-[10px] px-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono">
                      {selectedDayMenus.breakfast.dietType}
                    </span>
                  )}
                </div>
                <span className="text-lg font-bold text-slate-900 dark:text-white block mt-0.5">
                  {breakfastCount} <span className="text-xs font-normal text-slate-400">/ {totalEnrolled}</span>
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate block mt-0.5">
                  {selectedDayMenus.breakfast?.name || 'Saada Paratha & Omelette'}
                </span>
              </div>

              <div
                onClick={() => setSelectedMeal('lunch')}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedMeal === 'lunch'
                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 ring-1 ring-blue-500'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Lunch (12:30 - 2:30 PM)</span>
                  {selectedDayMenus.lunch?.dietType && (
                    <span className="text-[10px] px-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono">
                      {selectedDayMenus.lunch.dietType}
                    </span>
                  )}
                </div>
                <span className="text-lg font-bold text-slate-900 dark:text-white block mt-0.5">
                  {lunchCount} <span className="text-xs font-normal text-slate-400">/ {totalEnrolled}</span>
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate block mt-0.5">
                  {selectedDayMenus.lunch?.name || 'Chawal, Chana Daal Fry & Sabji'}
                </span>
              </div>

              <div
                onClick={() => setSelectedMeal('snacks')}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedMeal === 'snacks'
                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 ring-1 ring-blue-500'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Snacks (5:00 - 6:30 PM)</span>
                  {selectedDayMenus.snacks?.dietType && (
                    <span className="text-[10px] px-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono">
                      {selectedDayMenus.snacks.dietType}
                    </span>
                  )}
                </div>
                <span className="text-lg font-bold text-slate-900 dark:text-white block mt-0.5">
                  {snacksCount} <span className="text-xs font-normal text-slate-400">/ {totalEnrolled}</span>
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate block mt-0.5">
                  {selectedDayMenus.snacks?.name || 'Hot Pasta / Noodles & Tea'}
                </span>
              </div>

              <div
                onClick={() => setSelectedMeal('dinner')}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedMeal === 'dinner'
                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 ring-1 ring-blue-500'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Dinner (8:00 - 10:00 PM)</span>
                  {selectedDayMenus.dinner?.dietType && (
                    <span className="text-[10px] px-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono">
                      {selectedDayMenus.dinner.dietType}
                    </span>
                  )}
                </div>
                <span className="text-lg font-bold text-slate-900 dark:text-white block mt-0.5">
                  {dinnerCount} <span className="text-xs font-normal text-slate-400">/ {totalEnrolled}</span>
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate block mt-0.5">
                  {selectedDayMenus.dinner?.name || 'Chicken Curry / Paneer Masala'}
                </span>
              </div>
            </div>

            {/* Menu Items Preview for Selected Meal */}
            {selectedDayMenus[selectedMeal] && (
              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Hostel 2 Menu: {selectedDayMenus[selectedMeal]?.name}
                  </span>
                  {selectedDayMenus[selectedMeal]?.calories && (
                    <span className="text-[10px] text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                      {selectedDayMenus[selectedMeal]?.calories} kcal
                    </span>
                  )}
                </div>
                {selectedDayMenus[selectedMeal]?.items && (
                  <div className="flex flex-wrap gap-1">
                    {selectedDayMenus[selectedMeal]?.items.map((it, idx) => (
                      <span key={idx} className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded">
                        {it}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Attendance Register Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
            {/* Toolbar */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-1 max-w-md">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search student or roll number..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <select
                  value={blockFilter}
                  onChange={(e) => setBlockFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="All">All Hostels</option>
                  <option value="Hostel 2 (Boys)">Hostel 2 (Boys)</option>
                  <option value="Block A (Boys)">Block A</option>
                  <option value="Block B (Girls)">Block B</option>
                  <option value="Block C (Boys)">Block C</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleAdminBatchMark(true)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 transition-colors flex items-center gap-1.5"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Mark All Present</span>
                </button>
                <button
                  onClick={() => handleAdminBatchMark(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800 transition-colors"
                >
                  Reset All Absent
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50/80 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Student Name</th>
                    <th className="px-4 py-3">Roll No</th>
                    <th className="px-4 py-3">Hostel Block</th>
                    <th className="px-4 py-3 text-center">Breakfast</th>
                    <th className="px-4 py-3 text-center">Lunch</th>
                    <th className="px-4 py-3 text-center">Snacks</th>
                    <th className="px-4 py-3 text-center">Dinner</th>
                    <th className="px-4 py-3 text-center">Active ({selectedMeal})</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {filteredRecords.map(rec => {
                    const isPresentForActiveMeal = rec[selectedMeal];
                    return (
                      <tr key={rec.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                          {rec.studentName}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-slate-500">
                          {rec.rollNo}
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                          {rec.hostelBlock}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleInlineToggleMeal(rec, 'breakfast')}
                            className={`p-1 rounded-md transition-colors ${
                              rec.breakfast ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-300 dark:text-slate-600'
                            }`}
                            title="Toggle Breakfast"
                          >
                            {rec.breakfast ? <CheckCircle className="w-4 h-4 mx-auto" /> : <XCircle className="w-4 h-4 mx-auto" />}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleInlineToggleMeal(rec, 'lunch')}
                            className={`p-1 rounded-md transition-colors ${
                              rec.lunch ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-300 dark:text-slate-600'
                            }`}
                            title="Toggle Lunch"
                          >
                            {rec.lunch ? <CheckCircle className="w-4 h-4 mx-auto" /> : <XCircle className="w-4 h-4 mx-auto" />}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleInlineToggleMeal(rec, 'snacks')}
                            className={`p-1 rounded-md transition-colors ${
                              rec.snacks ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-300 dark:text-slate-600'
                            }`}
                            title="Toggle Snacks"
                          >
                            {rec.snacks ? <CheckCircle className="w-4 h-4 mx-auto" /> : <XCircle className="w-4 h-4 mx-auto" />}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleInlineToggleMeal(rec, 'dinner')}
                            className={`p-1 rounded-md transition-colors ${
                              rec.dinner ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-300 dark:text-slate-600'
                            }`}
                            title="Toggle Dinner"
                          >
                            {rec.dinner ? <CheckCircle className="w-4 h-4 mx-auto" /> : <XCircle className="w-4 h-4 mx-auto" />}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleInlineToggleMeal(rec, selectedMeal)}
                            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                              isPresentForActiveMeal
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-rose-100 text-rose-800 hover:bg-rose-200 dark:bg-rose-950 dark:text-rose-300'
                            }`}
                          >
                            {isPresentForActiveMeal ? 'Present' : 'Absent'}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => handleOpenEdit(rec)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors"
                              title="Correct Attendance Record"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(rec)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                              title="Delete Record"
                            >
                              <Trash2 className="w-4 h-4" />
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
        </div>
      )}

      {/* VIEW TAB 2: LOW ATTENDANCE ALERTS (<75%) */}
      {activeTab === 'low_attendance' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 flex items-start gap-3 shadow-xs">
            <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div>
              <p className="font-bold text-sm">Automated Compliance Alert System</p>
              <p className="text-xs mt-0.5">
                Students listed below have an overall mess attendance of less than <strong>75%</strong> in the current tracking period. Admins can initiate parent notifications, review rebate requests, or issue attendance warnings.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Defaulter Students Below 75% Threshold ({lowAttendanceStudents.length} Found)
              </h2>
              <span className="text-xs text-slate-400 font-mono">Minimum Required: 75.0%</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50/80 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Roll No</th>
                    <th className="px-4 py-3">Student Name</th>
                    <th className="px-4 py-3">Hostel Block</th>
                    <th className="px-4 py-3 text-center">Tracked Days</th>
                    <th className="px-4 py-3 text-center">Overall Attendance</th>
                    <th className="px-4 py-3 text-right">Compliance Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {lowAttendanceStudents.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                        ✓ Excellent! No students are currently below the 75% attendance threshold.
                      </td>
                    </tr>
                  ) : (
                    lowAttendanceStudents.map((st) => (
                      <tr key={st.rollNo} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="px-4 py-3 font-mono font-bold text-slate-700 dark:text-slate-300">
                          {st.rollNo}
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                          {st.studentName}
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                          {st.hostelBlock}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {st.totalDays} Days
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="inline-flex items-center gap-2">
                            <div className="w-20 bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                              <div
                                className="bg-rose-500 h-2 rounded-full"
                                style={{ width: `${st.overallPercentage}%` }}
                              />
                            </div>
                            <span className="font-bold text-rose-600 dark:text-rose-400">
                              {st.overallPercentage}%
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Defaulter (&lt;75%)</span>
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW TAB 3: AGGREGATE REPORTS */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Periodic Attendance Report Generator
                </h3>
                <p className="text-xs text-slate-500">
                  Select start and end dates to aggregate multi-week mess consumption rates
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={reportStartDate}
                  onChange={(e) => setReportStartDate(e.target.value)}
                  className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
                <span className="text-xs text-slate-400">to</span>
                <input
                  type="date"
                  value={reportEndDate}
                  onChange={(e) => setReportEndDate(e.target.value)}
                  className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
                <button
                  onClick={loadReport}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors"
                >
                  Generate
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Summary Ledger ({reportStartDate} to {reportEndDate})
              </h2>
              <button
                onClick={handleExportCSV}
                className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export This Report</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50/80 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Roll No</th>
                    <th className="px-4 py-3">Student Name</th>
                    <th className="px-4 py-3 text-center">Breakfast %</th>
                    <th className="px-4 py-3 text-center">Lunch %</th>
                    <th className="px-4 py-3 text-center">Snacks %</th>
                    <th className="px-4 py-3 text-center">Dinner %</th>
                    <th className="px-4 py-3 text-right">Overall Turnout</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {reportData.students.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                        No report entries found for the selected date range. Click "Generate" to refresh.
                      </td>
                    </tr>
                  ) : (
                    reportData.students.map((st) => (
                      <tr key={st.rollNo} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="px-4 py-3 font-mono font-bold text-slate-700 dark:text-slate-300">
                          {st.rollNo}
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                          {st.studentName}
                        </td>
                        <td className="px-4 py-3 text-center">{st.breakfastPercentage}%</td>
                        <td className="px-4 py-3 text-center">{st.lunchPercentage}%</td>
                        <td className="px-4 py-3 text-center">{st.snacksPercentage}%</td>
                        <td className="px-4 py-3 text-center">{st.dinnerPercentage}%</td>
                        <td className="px-4 py-3 text-right font-bold text-slate-900 dark:text-white">
                          {st.overallPercentage}%
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Confirm Record Deletion"
      >
        <div className="space-y-4">
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            Are you sure you want to permanently delete the attendance record for{' '}
            <strong>{deleteTarget?.studentName}</strong> ({deleteTarget?.rollNo}) on{' '}
            <strong>{deleteTarget?.date}</strong>?
          </p>
          <p className="text-xs text-rose-600 font-semibold">
            This action cannot be undone and will update the student's monthly bill meal count.
          </p>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setDeleteTarget(null)}
              className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteRecord}
              disabled={isDeleting}
              className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg disabled:opacity-50"
            >
              {isDeleting ? 'Deleting...' : 'Delete Record'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Admin Attendance Correction Modal */}
      <Modal
        isOpen={!!editingRecord}
        onClose={() => setEditingRecord(null)}
        title="Admin Attendance Audit & Correction"
      >
        <div className="space-y-4">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-sm text-slate-900 dark:text-white">
                {editingRecord?.studentName}
              </span>
              <span className="font-mono text-xs text-slate-500 font-semibold">
                {editingRecord?.rollNo}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span>Hostel: <strong>{editingRecord?.hostelBlock}</strong></span>
              <span>Date: <strong>{editingRecord?.date}</strong></span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
              Meal Status Overrides
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {/* Breakfast */}
              <div
                onClick={() => setEditForm((f) => ({ ...f, breakfast: !f.breakfast }))}
                className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                  editForm.breakfast
                    ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 text-slate-500'
                }`}
              >
                <div>
                  <p className="text-xs font-bold">Breakfast</p>
                  <p className="text-[10px] text-slate-400">07:30 - 09:30 AM</p>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                    editForm.breakfast
                      ? 'bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {editForm.breakfast ? 'Present' : 'Absent'}
                </span>
              </div>

              {/* Lunch */}
              <div
                onClick={() => setEditForm((f) => ({ ...f, lunch: !f.lunch }))}
                className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                  editForm.lunch
                    ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 text-slate-500'
                }`}
              >
                <div>
                  <p className="text-xs font-bold">Lunch</p>
                  <p className="text-[10px] text-slate-400">12:30 - 02:30 PM</p>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                    editForm.lunch
                      ? 'bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {editForm.lunch ? 'Present' : 'Absent'}
                </span>
              </div>

              {/* Snacks */}
              <div
                onClick={() => setEditForm((f) => ({ ...f, snacks: !f.snacks }))}
                className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                  editForm.snacks
                    ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 text-slate-500'
                }`}
              >
                <div>
                  <p className="text-xs font-bold">Snacks</p>
                  <p className="text-[10px] text-slate-400">05:00 - 06:30 PM</p>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                    editForm.snacks
                      ? 'bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {editForm.snacks ? 'Present' : 'Absent'}
                </span>
              </div>

              {/* Dinner */}
              <div
                onClick={() => setEditForm((f) => ({ ...f, dinner: !f.dinner }))}
                className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                  editForm.dinner
                    ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 text-slate-500'
                }`}
              >
                <div>
                  <p className="text-xs font-bold">Dinner</p>
                  <p className="text-[10px] text-slate-400">08:00 - 10:00 PM</p>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                    editForm.dinner
                      ? 'bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {editForm.dinner ? 'Present' : 'Absent'}
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Audit / Correction Reason (Optional)
            </label>
            <input
              type="text"
              value={editForm.correctionNote}
              onChange={(e) => setEditForm((f) => ({ ...f, correctionNote: e.target.value }))}
              placeholder="e.g. Student provided approved late slip or medical proof"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setEditingRecord(null)}
              className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveCorrection}
              disabled={isSavingCorrection}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50"
            >
              {isSavingCorrection ? 'Saving Changes...' : 'Save Attendance Correction'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
