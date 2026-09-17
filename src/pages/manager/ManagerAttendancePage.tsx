import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { attendanceAPI } from '../../services/api';
import { AttendanceRecord } from '../../types';
import {
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  CheckCheck,
  Users,
  Filter,
  Save,
  AlertCircle,
  RefreshCw,
  Utensils,
  Coffee,
  Sun,
  Sunset,
  Moon,
  Building2,
  Check,
  X
} from 'lucide-react';

type MealType = 'breakfast' | 'lunch' | 'snacks' | 'dinner';

interface StudentAttendanceRow {
  studentId: string;
  rollNo: string;
  name: string;
  roomNo: string;
  hostelBlock: string;
  status: boolean;
  markedAt?: string | null;
  markedBy?: string | null;
  hasExistingRecord: boolean;
}

const MEAL_INFO: Record<MealType, { label: string; icon: React.ElementType; time: string; color: string }> = {
  breakfast: { label: 'Breakfast', icon: Coffee, time: '07:30 - 09:30 AM', color: 'amber' },
  lunch: { label: 'Lunch', icon: Sun, time: '12:30 - 02:30 PM', color: 'orange' },
  snacks: { label: 'Snacks', icon: Sunset, time: '05:00 - 06:30 PM', color: 'emerald' },
  dinner: { label: 'Dinner', icon: Moon, time: '08:00 - 10:00 PM', color: 'indigo' },
};

export const ManagerAttendancePage: React.FC = () => {
  const { students, attendance, menus, saveMealAttendance, isBackendConnected } = useApp();
  const { user } = useAuth();

  const [selectedDate, setSelectedDate] = useState<string>('2026-09-16');
  const [selectedMeal, setSelectedMeal] = useState<MealType>('lunch');
  const [searchTerm, setSearchTerm] = useState('');
  const [hostelFilter, setHostelFilter] = useState('All');
  const [attendanceState, setAttendanceState] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiRecords, setApiRecords] = useState<AttendanceRecord[]>([]);

  // Calculate day of the week for the selected date
  const selectedDayOfWeek = useMemo(() => {
    if (!selectedDate) return 'Wednesday';
    const parts = selectedDate.split('-').map(Number);
    if (parts.length < 3) return 'Wednesday';
    const d = new Date(parts[0], parts[1] - 1, parts[2]);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[d.getDay()] || 'Wednesday';
  }, [selectedDate]);

  // Connect current meal information from the Hostel 2 weekly menu
  const currentMealMenu = useMemo(() => {
    const categoryMap: Record<MealType, string> = {
      breakfast: 'Breakfast',
      lunch: 'Lunch',
      snacks: 'Snacks',
      dinner: 'Dinner',
    };
    const targetCategory = categoryMap[selectedMeal];
    return menus.find(
      (m) =>
        m.dayOfWeek?.toLowerCase() === selectedDayOfWeek.toLowerCase() &&
        m.category.toLowerCase() === targetCategory.toLowerCase()
    );
  }, [menus, selectedDayOfWeek, selectedMeal]);

  // Distinct hostel list from students & settings
  const hostelList = useMemo(() => {
    const set = new Set<string>();
    students.forEach((s) => {
      if (s.hostelBlock) set.add(s.hostelBlock);
    });
    return Array.from(set);
  }, [students]);

  // Load attendance from API or fallback to context
  const loadAttendance = async (date: string) => {
    setIsLoading(true);
    try {
      if (isBackendConnected) {
        const res = await attendanceAPI.getAttendance({ date });
        if (res && res.data) {
          setApiRecords(res.data);
        }
      } else {
        const localMatched = attendance.filter((a) => a.date === date);
        setApiRecords(localMatched);
      }
    } catch {
      const localMatched = attendance.filter((a) => a.date === date);
      setApiRecords(localMatched);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAttendance(selectedDate);
  }, [selectedDate, isBackendConnected]);

  // Synchronize student attendance state when date, meal or apiRecords change
  useEffect(() => {
    const stateMap: Record<string, boolean> = {};
    const relevantRecords = apiRecords.length > 0 ? apiRecords : attendance.filter((a) => a.date === selectedDate);

    students.forEach((st) => {
      const rec = relevantRecords.find(
        (r) => r.rollNo === (st.studentId || st.id) || r.studentId === st.id
      );
      if (rec) {
        stateMap[st.id] = !!rec[selectedMeal];
      } else {
        // default to present or false? default to true as students usually attend
        stateMap[st.id] = false;
      }
    });

    setAttendanceState(stateMap);
  }, [selectedMeal, selectedDate, apiRecords, attendance, students]);

  // Toggle single student
  const handleToggle = (studentId: string) => {
    setAttendanceState((prev) => ({
      ...prev,
      [studentId]: !prev[studentId],
    }));
  };

  // Mark all present
  const handleMarkAll = (status: boolean) => {
    setAttendanceState((prev) => {
      const next = { ...prev };
      filteredStudents.forEach((st) => {
        next[st.id] = status;
      });
      return next;
    });
  };

  // Filter students
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      if (hostelFilter !== 'All' && s.hostelBlock !== hostelFilter) return false;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesName = s.name.toLowerCase().includes(q);
        const matchesRoll = (s.studentId || '').toLowerCase().includes(q);
        const matchesRoom = (s.roomNo || '').toLowerCase().includes(q);
        return matchesName || matchesRoll || matchesRoom;
      }
      return true;
    });
  }, [students, hostelFilter, searchTerm]);

  // Count statistics
  const presentCount = filteredStudents.filter((s) => attendanceState[s.id] === true).length;
  const absentCount = filteredStudents.length - presentCount;
  const presentRate = filteredStudents.length > 0 ? Math.round((presentCount / filteredStudents.length) * 100) : 0;

  // Save Attendance to Backend
  const handleSaveAttendance = async () => {
    setIsSaving(true);
    setSaveSuccessMessage(null);

    // Save for all students in current hostel filter scope (or all students if 'All')
    const targetStudents = hostelFilter === 'All' ? students : students.filter((s) => s.hostelBlock === hostelFilter);

    const recordsToSave = targetStudents.map((st) => ({
      studentId: st.id,
      rollNo: st.studentId || st.id,
      studentName: st.name,
      roomNo: st.roomNo || 'N/A',
      hostelBlock: st.hostelBlock || 'Hostel 2 (Boys)',
      status: !!attendanceState[st.id],
    }));

    try {
      await saveMealAttendance(selectedDate, selectedMeal, recordsToSave);
      
      // Optimistically update apiRecords locally
      setApiRecords((prev) => {
        const updated = [...prev];
        recordsToSave.forEach((item) => {
          const idx = updated.findIndex((r) => r.rollNo === item.rollNo || r.studentId === item.studentId);
          const nowStr = new Date().toISOString();
          const markerName = user?.name || 'Manager';
          if (idx >= 0) {
            updated[idx] = {
              ...updated[idx],
              [selectedMeal]: item.status,
              [`${selectedMeal}Detail`]: { status: item.status, markedAt: nowStr, markedBy: markerName },
              updatedAt: nowStr,
              updatedBy: markerName,
            } as any;
          } else {
            updated.unshift({
              id: `att-${Date.now()}-${item.rollNo}`,
              studentId: item.studentId,
              rollNo: item.rollNo,
              studentName: item.studentName,
              roomNo: item.roomNo,
              hostelBlock: item.hostelBlock,
              date: selectedDate,
              breakfast: selectedMeal === 'breakfast' ? item.status : false,
              lunch: selectedMeal === 'lunch' ? item.status : false,
              snacks: selectedMeal === 'snacks' ? item.status : false,
              dinner: selectedMeal === 'dinner' ? item.status : false,
              [`${selectedMeal}Detail`]: { status: item.status, markedAt: nowStr, markedBy: markerName },
              totalPresent: item.status ? 1 : 0,
              totalMeals: 4,
              updatedAt: nowStr,
              updatedBy: markerName,
            } as any);
          }
        });
        return updated;
      });

      setSaveSuccessMessage(
        `✓ ${MEAL_INFO[selectedMeal].label} attendance for ${selectedDate} saved successfully! (${presentCount} Present, ${absentCount} Absent)`
      );
      // Background reload from API
      loadAttendance(selectedDate);
    } catch {
      setSaveSuccessMessage('Attendance recorded locally in session.');
    } finally {
      setIsSaving(false);
      setTimeout(() => {
        setSaveSuccessMessage(null);
      }, 5000);
    }
  };

  const activeMealMeta = MEAL_INFO[selectedMeal];
  const ActiveMealIcon = activeMealMeta.icon;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Utensils className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <span>Daily Mess Attendance Register</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Mark & manage student dining turnout per meal with real-time sync and audit tracking
          </p>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl shadow-xs">
            <Calendar className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span className="text-xs text-slate-500 font-medium">Date:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-xs sm:text-sm font-semibold bg-transparent text-slate-900 dark:text-white focus:outline-hidden"
            />
          </div>

          <button
            onClick={() => loadAttendance(selectedDate)}
            disabled={isLoading}
            title="Refresh Attendance"
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Meal Selection Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(Object.keys(MEAL_INFO) as MealType[]).map((mealKey) => {
          const info = MEAL_INFO[mealKey];
          const Icon = info.icon;
          const isSelected = selectedMeal === mealKey;

          return (
            <button
              key={mealKey}
              onClick={() => setSelectedMeal(mealKey)}
              className={`p-4 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 ring-2 ring-emerald-500/20'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`p-2 rounded-lg ${
                      isSelected
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
                      {info.label}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {info.time}
                    </p>
                  </div>
                </div>
                {isSelected && (
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Quick Turnout Stats Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
              <ActiveMealIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Active Session: <strong className="text-slate-800 dark:text-slate-200">{activeMealMeta.label}</strong> ({selectedDate})
              </div>
              <div className="flex items-center gap-3 mt-1">
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Present: {presentCount}
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-md border border-rose-200 dark:border-rose-800">
                  <XCircle className="w-3.5 h-3.5" /> Absent: {absentCount}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Total: <strong>{filteredStudents.length}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Turnout Progress Bar */}
          <div className="sm:w-64">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Turnout Progress</span>
              <span className="font-bold text-slate-900 dark:text-white">{presentRate}%</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-emerald-500 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${presentRate}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Success Notification Alert */}
      {saveSuccessMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm font-semibold flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{saveSuccessMessage}</span>
          </div>
          <button
            onClick={() => setSaveSuccessMessage(null)}
            className="text-emerald-700 dark:text-emerald-400 hover:opacity-75"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Today's Meal Information (Hostel 2 Weekly Menu) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 shrink-0">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  Hostel 2 Weekly Menu • {selectedDayOfWeek} {activeMealMeta.label}
                </span>
                {currentMealMenu?.dietType && (
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                      currentMealMenu.dietType === 'Veg'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                        : currentMealMenu.dietType === 'Non-Veg'
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                        : 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-300 dark:border-purple-800'
                    }`}
                  >
                    {currentMealMenu.dietType}
                  </span>
                )}
                {currentMealMenu?.calories && (
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                    {currentMealMenu.calories} kcal
                  </span>
                )}
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-0.5">
                {currentMealMenu?.name || `Hostel 2 ${activeMealMeta.label} Special`}
              </h3>
              {currentMealMenu?.items && currentMealMenu.items.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {currentMealMenu.items.map((item, idx) => (
                    <span
                      key={idx}
                      className="text-xs font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto text-xs text-slate-500 dark:text-slate-400 font-mono bg-slate-50 dark:bg-slate-800/60 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 shrink-0">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Serving: {currentMealMenu?.timing || activeMealMeta.time}</span>
          </div>
        </div>
      </div>

      {/* Main Student Register Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        {/* Register Toolbar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search and Filter */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 flex-1 max-w-xl">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search student name, roll no, room..."
                className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={hostelFilter}
                onChange={(e) => setHostelFilter(e.target.value)}
                className="bg-transparent text-xs text-slate-900 dark:text-white focus:outline-hidden"
              >
                <option value="All">All Hostels</option>
                {hostelList.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleMarkAll(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 transition-colors flex items-center gap-1.5"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark All Present</span>
            </button>

            <button
              onClick={() => handleMarkAll(false)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800 transition-colors flex items-center gap-1.5"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Mark All Absent</span>
            </button>

            <button
              onClick={handleSaveAttendance}
              disabled={isSaving}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Save className={`w-3.5 h-3.5 ${isSaving ? 'animate-spin' : ''}`} />
              <span>{isSaving ? 'Saving...' : 'Save Attendance'}</span>
            </button>
          </div>
        </div>

        {/* Student Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50/80 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3">Roll No</th>
                <th className="px-4 py-3">Student Name</th>
                <th className="px-4 py-3">Hostel & Room</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Toggle Attendance</th>
                <th className="px-4 py-3 text-right">Audit Trail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    No students found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((st) => {
                  const isPresent = !!attendanceState[st.id];
                  const existingRec = apiRecords.find(
                    (r) => r.rollNo === (st.studentId || st.id) || r.studentId === st.id
                  );
                  const mealDetail = existingRec?.[`${selectedMeal}Detail` as keyof AttendanceRecord] as any;
                  const markedByText = mealDetail?.markedBy || existingRec?.updatedBy || (existingRec ? 'Manager' : null);
                  const markedAtText = mealDetail?.markedAt || existingRec?.updatedAt;

                  return (
                    <tr
                      key={st.id}
                      className={`hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors ${
                        isPresent ? 'bg-emerald-50/20 dark:bg-emerald-950/10' : ''
                      }`}
                    >
                      <td className="px-4 py-3 font-mono font-bold text-slate-700 dark:text-slate-300">
                        {st.studentId || st.id}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-slate-900 dark:text-white block">
                          {st.name}
                        </span>
                        <span className="text-xs text-slate-400">
                          {st.branch || st.department || 'Student'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                        <span className="font-medium text-slate-800 dark:text-slate-200 block">
                          {st.hostelBlock || 'Hostel 2'}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          Room: {st.roomNo || 'H2-101'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {isPresent ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                            <Check className="w-3 h-3" />
                            <span>Present</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                            <X className="w-3 h-3" />
                            <span>Absent</span>
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="inline-flex rounded-lg p-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                          <button
                            type="button"
                            onClick={() =>
                              setAttendanceState((prev) => ({ ...prev, [st.id]: true }))
                            }
                            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                              isPresent
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                            }`}
                          >
                            Present
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setAttendanceState((prev) => ({ ...prev, [st.id]: false }))
                            }
                            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                              !isPresent
                                ? 'bg-rose-600 text-white shadow-xs'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                            }`}
                          >
                            Absent
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {markedByText ? (
                          <div className="text-xs">
                            <span className="text-slate-600 dark:text-slate-300 font-medium block">
                              {markedByText}
                            </span>
                            <span className="text-slate-400 text-[11px] font-mono">
                              {markedAtText ? new Date(markedAtText).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Verified'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Not yet recorded</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info bar */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <span>
            Showing {filteredStudents.length} student records for <strong>{activeMealMeta.label}</strong> on <strong>{selectedDate}</strong>
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveAttendance}
              disabled={isSaving}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white shadow-xs transition-colors flex items-center gap-1"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
