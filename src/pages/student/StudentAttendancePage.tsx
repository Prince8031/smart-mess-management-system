import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { attendanceAPI } from '../../services/api';
import { AttendanceRecord, StudentAttendanceSummary } from '../../types';
import { Modal } from '../../components/common/Modal';
import { FormInput } from '../../components/common/FormInput';
import {
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  CalendarOff,
  Check,
  RefreshCw,
  AlertTriangle,
  Utensils,
  Coffee,
  Sun,
  Sunset,
  Moon,
  Percent,
  TrendingUp,
  Award,
  HelpCircle,
  Info
} from 'lucide-react';

export const StudentAttendancePage: React.FC = () => {
  const { attendance, currentUser, menus, settings, isBackendConnected } = useApp();
  const { user } = useAuth();

  const activeStudent = currentUser;
  const studentRollNo = activeStudent?.studentId || 'ST001';
  const studentDbId = activeStudent?.id || 'std-prince';
  const studentName = activeStudent?.name || 'Prince Kumar';

  const [isLoading, setIsLoading] = useState(false);
  const [apiRecords, setApiRecords] = useState<AttendanceRecord[]>([]);
  const [apiSummary, setApiSummary] = useState<StudentAttendanceSummary | null>(null);

  // Leave Modal State
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [leaveSubmitted, setLeaveSubmitted] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    startDate: '2026-09-20',
    endDate: '2026-09-24',
    reason: 'Family festival and medical consultation leave'
  });

  // Fetch real attendance records for this student
  const fetchStudentData = async () => {
    setIsLoading(true);
    try {
      if (isBackendConnected) {
        const [recordsRes, summaryRes] = await Promise.allSettled([
          attendanceAPI.getStudentAttendance(studentDbId),
          attendanceAPI.getStudentSummary(studentDbId)
        ]);

        if (recordsRes.status === 'fulfilled' && recordsRes.value?.data) {
          setApiRecords(recordsRes.value.data);
        } else {
          // Fallback to local
          setApiRecords(attendance.filter(a => a.rollNo === studentRollNo || a.studentId === studentDbId));
        }

        if (summaryRes.status === 'fulfilled' && summaryRes.value) {
          setApiSummary(summaryRes.value);
        }
      } else {
        const localMatched = attendance.filter(a => a.rollNo === studentRollNo || a.studentId === studentDbId);
        setApiRecords(localMatched);
      }
    } catch {
      const localMatched = attendance.filter(a => a.rollNo === studentRollNo || a.studentId === studentDbId);
      setApiRecords(localMatched);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, [studentRollNo, studentDbId, isBackendConnected, attendance]);

  // Combined records (API records preferred, sorted newest first)
  const myRecords = useMemo(() => {
    const list = apiRecords.length > 0 ? [...apiRecords] : attendance.filter(a => a.rollNo === studentRollNo || a.studentId === studentDbId);
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [apiRecords, attendance, studentRollNo, studentDbId]);

  // Target today: default to 2026-09-16 (demo day) or actual today
  const targetDate = '2026-09-16';
  const todayRecord = myRecords.find(r => r.date === targetDate) || myRecords[0];

  // Day of week calculation for meal menu resolution
  const activeDate = todayRecord?.date || targetDate;
  const activeDayOfWeek = useMemo(() => {
    if (!activeDate) return 'Wednesday';
    const parts = activeDate.split('-').map(Number);
    if (parts.length < 3) return 'Wednesday';
    const d = new Date(parts[0], parts[1] - 1, parts[2]);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[d.getDay()] || 'Wednesday';
  }, [activeDate]);

  // Connect today's meal information from the Hostel 2 weekly menu
  const todayMealsMenu = useMemo(() => {
    const findCategory = (cat: string) =>
      menus.find(
        (m) =>
          m.dayOfWeek?.toLowerCase() === activeDayOfWeek.toLowerCase() &&
          m.category.toLowerCase() === cat.toLowerCase()
      );

    return {
      breakfast: findCategory('Breakfast'),
      lunch: findCategory('Lunch'),
      snacks: findCategory('Snacks'),
      dinner: findCategory('Dinner'),
    };
  }, [menus, activeDayOfWeek]);

  // Calculate stats manually if summary is not from backend
  const calculatedStats = useMemo(() => {
    if (apiSummary) return apiSummary;

    const totalDays = myRecords.length;
    let bfPresent = 0;
    let luPresent = 0;
    let snPresent = 0;
    let diPresent = 0;

    myRecords.forEach(r => {
      if (r.breakfast) bfPresent++;
      if (r.lunch) luPresent++;
      if (r.snacks) snPresent++;
      if (r.dinner) diPresent++;
    });

    const totalScheduledMeals = totalDays * 4;
    const totalPresentMeals = bfPresent + luPresent + snPresent + diPresent;
    const overallPercentage = totalScheduledMeals > 0 ? Math.round((totalPresentMeals / totalScheduledMeals) * 100) : 0;

    return {
      studentId: studentDbId,
      studentName,
      totalDays,
      totalScheduledMeals,
      totalPresentMeals,
      breakfast: { present: bfPresent, total: totalDays, percentage: totalDays > 0 ? Math.round((bfPresent / totalDays) * 100) : 0 },
      lunch: { present: luPresent, total: totalDays, percentage: totalDays > 0 ? Math.round((luPresent / totalDays) * 100) : 0 },
      snacks: { present: snPresent, total: totalDays, percentage: totalDays > 0 ? Math.round((snPresent / totalDays) * 100) : 0 },
      dinner: { present: diPresent, total: totalDays, percentage: totalDays > 0 ? Math.round((diPresent / totalDays) * 100) : 0 },
      overallPercentage,
    };
  }, [apiSummary, myRecords, studentDbId, studentName]);

  // Today's meal completion progress
  const todayMealsCount = todayRecord
    ? (todayRecord.breakfast ? 1 : 0) + (todayRecord.lunch ? 1 : 0) + (todayRecord.snacks ? 1 : 0) + (todayRecord.dinner ? 1 : 0)
    : 0;
  const todayProgressPercent = Math.round((todayMealsCount / 4) * 100);

  const handleApplyLeave = (e: React.FormEvent) => {
    e.preventDefault();
    setLeaveSubmitted(true);
    setTimeout(() => {
      setIsLeaveModalOpen(false);
      setLeaveSubmitted(false);
    }, 2500);
  };

  const getMealBadge = (isMarked: boolean | undefined, status: boolean | undefined) => {
    if (status === true) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
          <Check className="w-3 h-3" />
          <span>Present</span>
        </span>
      );
    }
    if (status === false) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
          <XCircle className="w-3 h-3" />
          <span>Absent</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
        <Clock className="w-3 h-3" />
        <span>Pending</span>
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Utensils className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <span>My Mess Attendance & Dining Logs</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time daily roll call records, meal consumption tracking, and monthly attendance analytics
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchStudentData}
            disabled={isLoading}
            title="Refresh Attendance"
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setIsLeaveModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors"
          >
            <CalendarOff className="w-4 h-4" />
            <span>Apply Mess Cut / Leave</span>
          </button>
        </div>
      </div>

      {/* Low Attendance Warning Banner (<75%) */}
      {calculatedStats.overallPercentage < 75 && (
        <div className="p-4 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-xs sm:text-sm text-amber-900 dark:text-amber-200 flex items-start gap-3 shadow-xs">
          <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
          <div>
            <p className="font-bold">Low Attendance Alert ({calculatedStats.overallPercentage}%):</p>
            <p className="text-xs mt-0.5">
              Your overall mess attendance is currently below the recommended <strong>75%</strong> threshold. Please ensure regular dining check-ins or submit timely mess rebate leave forms for authorized absences.
            </p>
          </div>
        </div>
      )}

      {/* SECTION 1: TODAY'S ATTENDANCE STATUS FOR ALL 4 MEALS */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Today's Roll Call Status
              </span>
              <span className="text-xs text-slate-400 font-mono">({todayRecord?.date || targetDate})</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
              Daily Dining Verification
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Daily Completed: <strong>{todayMealsCount} / 4 Meals</strong>
            </span>
            <div className="w-32 bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-emerald-500 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${todayProgressPercent}%` }}
              />
            </div>
            <span className="text-xs font-bold text-slate-900 dark:text-white">{todayProgressPercent}%</span>
          </div>
        </div>

        {/* 4 Meals Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          {/* Breakfast */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
                    <Coffee className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">Breakfast</h3>
                    <p className="text-[11px] text-slate-400 font-mono">07:30 - 09:30 AM</p>
                  </div>
                </div>
                {todayMealsMenu.breakfast?.dietType && (
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                    {todayMealsMenu.breakfast.dietType}
                  </span>
                )}
              </div>

              {/* Menu dish details */}
              <div className="my-2 p-2 rounded-lg bg-white dark:bg-slate-900/80 border border-slate-100 dark:border-slate-800">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">
                  {todayMealsMenu.breakfast?.name || 'Saada Paratha & Omelette'}
                </p>
                {todayMealsMenu.breakfast?.items && todayMealsMenu.breakfast.items.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {todayMealsMenu.breakfast.items.slice(0, 3).map((item, idx) => (
                      <span key={idx} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {item}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
              <span className="text-xs text-slate-500 font-medium">My Status:</span>
              {getMealBadge(true, todayRecord?.breakfast)}
            </div>
          </div>

          {/* Lunch */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300">
                    <Sun className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">Lunch</h3>
                    <p className="text-[11px] text-slate-400 font-mono">12:30 - 02:30 PM</p>
                  </div>
                </div>
                {todayMealsMenu.lunch?.dietType && (
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                    {todayMealsMenu.lunch.dietType}
                  </span>
                )}
              </div>

              {/* Menu dish details */}
              <div className="my-2 p-2 rounded-lg bg-white dark:bg-slate-900/80 border border-slate-100 dark:border-slate-800">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">
                  {todayMealsMenu.lunch?.name || 'Chawal, Chana Daal Fry & Sabji'}
                </p>
                {todayMealsMenu.lunch?.items && todayMealsMenu.lunch.items.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {todayMealsMenu.lunch.items.slice(0, 3).map((item, idx) => (
                      <span key={idx} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {item}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
              <span className="text-xs text-slate-500 font-medium">My Status:</span>
              {getMealBadge(true, todayRecord?.lunch)}
            </div>
          </div>

          {/* Snacks */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                    <Sunset className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">Snacks</h3>
                    <p className="text-[11px] text-slate-400 font-mono">05:00 - 06:30 PM</p>
                  </div>
                </div>
                {todayMealsMenu.snacks?.dietType && (
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                    {todayMealsMenu.snacks.dietType}
                  </span>
                )}
              </div>

              {/* Menu dish details */}
              <div className="my-2 p-2 rounded-lg bg-white dark:bg-slate-900/80 border border-slate-100 dark:border-slate-800">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">
                  {todayMealsMenu.snacks?.name || 'Hot Pasta / Noodles & Tea'}
                </p>
                {todayMealsMenu.snacks?.items && todayMealsMenu.snacks.items.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {todayMealsMenu.snacks.items.slice(0, 3).map((item, idx) => (
                      <span key={idx} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {item}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
              <span className="text-xs text-slate-500 font-medium">My Status:</span>
              {getMealBadge(true, todayRecord?.snacks)}
            </div>
          </div>

          {/* Dinner */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                    <Moon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">Dinner</h3>
                    <p className="text-[11px] text-slate-400 font-mono">08:00 - 10:00 PM</p>
                  </div>
                </div>
                {todayMealsMenu.dinner?.dietType && (
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                    todayMealsMenu.dinner.dietType === 'Non-Veg'
                      ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                      : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                  }`}>
                    {todayMealsMenu.dinner.dietType}
                  </span>
                )}
              </div>

              {/* Menu dish details */}
              <div className="my-2 p-2 rounded-lg bg-white dark:bg-slate-900/80 border border-slate-100 dark:border-slate-800">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">
                  {todayMealsMenu.dinner?.name || 'Chicken Curry / Paneer Masala Dinner'}
                </p>
                {todayMealsMenu.dinner?.items && todayMealsMenu.dinner.items.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {todayMealsMenu.dinner.items.slice(0, 3).map((item, idx) => (
                      <span key={idx} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {item}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
              <span className="text-xs text-slate-500 font-medium">My Status:</span>
              {getMealBadge(true, todayRecord?.dinner)}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: MONTHLY ATTENDANCE SUMMARY CARDS */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Monthly Attendance Analytics (September 2026)
          </h2>
          <span className="text-xs text-slate-500">
            Student: <strong>{studentName}</strong> ({studentRollNo})
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {/* Total Days */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-xs">
            <span className="text-[11px] font-medium text-slate-400 block">Total Days</span>
            <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">
              {calculatedStats.totalDays}
            </p>
            <span className="text-[10px] text-slate-400">Tracked period</span>
          </div>

          {/* Total Meals */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-xs">
            <span className="text-[11px] font-medium text-slate-400 block">Total Meals</span>
            <p className="text-xl font-bold text-emerald-600 mt-1">
              {calculatedStats.totalPresentMeals}
              <span className="text-xs font-normal text-slate-400"> / {calculatedStats.totalScheduledMeals}</span>
            </p>
            <span className="text-[10px] text-slate-400">Meals consumed</span>
          </div>

          {/* Breakfast Attendance % */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-xs">
            <span className="text-[11px] font-medium text-slate-400 block">Breakfast</span>
            <p className="text-xl font-bold text-amber-600 mt-1">
              {calculatedStats.breakfast.percentage}%
            </p>
            <span className="text-[10px] text-slate-400">
              {calculatedStats.breakfast.present}/{calculatedStats.breakfast.total} attended
            </span>
          </div>

          {/* Lunch Attendance % */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-xs">
            <span className="text-[11px] font-medium text-slate-400 block">Lunch</span>
            <p className="text-xl font-bold text-orange-600 mt-1">
              {calculatedStats.lunch.percentage}%
            </p>
            <span className="text-[10px] text-slate-400">
              {calculatedStats.lunch.present}/{calculatedStats.lunch.total} attended
            </span>
          </div>

          {/* Snacks Attendance % */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-xs">
            <span className="text-[11px] font-medium text-slate-400 block">Snacks</span>
            <p className="text-xl font-bold text-emerald-600 mt-1">
              {calculatedStats.snacks.percentage}%
            </p>
            <span className="text-[10px] text-slate-400">
              {calculatedStats.snacks.present}/{calculatedStats.snacks.total} attended
            </span>
          </div>

          {/* Dinner Attendance % */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-xs">
            <span className="text-[11px] font-medium text-slate-400 block">Dinner</span>
            <p className="text-xl font-bold text-indigo-600 mt-1">
              {calculatedStats.dinner.percentage}%
            </p>
            <span className="text-[10px] text-slate-400">
              {calculatedStats.dinner.present}/{calculatedStats.dinner.total} attended
            </span>
          </div>

          {/* Overall Attendance % */}
          <div className="bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-800 rounded-xl p-3.5 shadow-xs col-span-2 sm:col-span-4 lg:col-span-1 bg-emerald-50/40 dark:bg-emerald-950/20">
            <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 block">
              Overall Rate
            </span>
            <p className="text-xl font-black text-emerald-700 dark:text-emerald-300 mt-1">
              {calculatedStats.overallPercentage}%
            </p>
            <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
              {calculatedStats.overallPercentage >= 75 ? '✓ Compliant (≥75%)' : '⚠ Below 75%'}
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 3: ATTENDANCE HISTORY TABLE */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Daily Attendance History
            </h2>
            <p className="text-xs text-slate-500">
              Detailed chronological log of all marked breakfast, lunch, snacks, and dinner sessions
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {myRecords.length} Records Found
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50/80 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 text-center">Breakfast</th>
                <th className="px-4 py-3 text-center">Lunch</th>
                <th className="px-4 py-3 text-center">Snacks</th>
                <th className="px-4 py-3 text-center">Dinner</th>
                <th className="px-4 py-3 text-center">Meals Attended</th>
                <th className="px-4 py-3 text-right">Daily Turnout</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {myRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    No attendance records logged yet for this account.
                  </td>
                </tr>
              ) : (
                myRecords.map((r) => {
                  const attendedCount =
                    (r.breakfast ? 1 : 0) +
                    (r.lunch ? 1 : 0) +
                    (r.snacks ? 1 : 0) +
                    (r.dinner ? 1 : 0);
                  const isFull = attendedCount === 4;
                  const isZero = attendedCount === 0;

                  return (
                    <tr
                      key={r.id || r.date}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{r.date}</span>
                          {r.date === targetDate && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                              Today
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {r.breakfast ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                            <Check className="w-3.5 h-3.5" />
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400">
                            <XCircle className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {r.lunch ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                            <Check className="w-3.5 h-3.5" />
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400">
                            <XCircle className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {r.snacks ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                            <Check className="w-3.5 h-3.5" />
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400">
                            <XCircle className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {r.dinner ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                            <Check className="w-3.5 h-3.5" />
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400">
                            <XCircle className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center font-mono font-bold text-slate-800 dark:text-slate-200">
                        {attendedCount} / 4
                      </td>
                      <td className="px-4 py-3 text-right">
                        {isFull ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                            Full Day (4/4)
                          </span>
                        ) : isZero ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
                            Absent / Leave
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                            Partial ({attendedCount}/4)
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rebate Leave Application Modal */}
      <Modal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        title="Apply for Mess Cut / Dining Leave"
      >
        {leaveSubmitted ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
              <Check className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Leave Application Filed!
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Your mess cut rebate request from {leaveForm.startDate} to {leaveForm.endDate} has been submitted to the mess manager for ledger reconciliation.
            </p>
          </div>
        ) : (
          <form onSubmit={handleApplyLeave} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <FormInput
                label="Leave Start Date"
                type="date"
                required
                value={leaveForm.startDate}
                onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
              />
              <FormInput
                label="Leave End Date"
                type="date"
                required
                value={leaveForm.endDate}
                onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Reason for Mess Cut
              </label>
              <textarea
                rows={3}
                required
                value={leaveForm.reason}
                onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                placeholder="Mention valid academic, festival, or home visit reasons..."
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 p-2.5 text-xs sm:text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsLeaveModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
              >
                Submit Application
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
