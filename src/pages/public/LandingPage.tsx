import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  Utensils,
  CalendarCheck,
  Receipt,
  Package,
  AlertCircle,
  ArrowRight,
  Shield,
  ChefHat,
  GraduationCap,
  CheckCircle2,
  Clock,
  Sparkles,
  Sun,
  Moon
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { switchRole, theme, toggleTheme } = useApp();

  const handleQuickEnter = (role: 'admin' | 'manager' | 'student') => {
    switchRole(role);
    navigate(`/${role}`);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-white flex flex-col font-sans selection:bg-blue-500 selection:text-white">
      {/* Top Navbar */}
      <header className="border-b border-slate-100 dark:border-slate-800/80 sticky top-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-xs">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">
                Smart Mess
              </span>
              <span className="text-xs text-blue-600 dark:text-blue-400 font-medium block -mt-1">
                College & Hostel OS
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Login
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 text-sm font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-xs shadow-blue-500/20 transition-all"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Next-Generation College Dining Platform</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-tight sm:leading-tight">
            Smart Mess Management System
          </h1>

          <p className="mt-5 text-base sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Manage meals, attendance, billing, inventory and complaints in one place.
            Designed specifically for modern campus hostels, universities, and mess contractors.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <button
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-sm transition-all flex items-center justify-center gap-2 group"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <button
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-200 font-semibold text-sm transition-colors"
            >
              Sign In to Portal
            </button>
          </div>

          {/* Quick Sandbox Role Launcher */}
          <div className="mt-12 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 max-w-2xl mx-auto">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
              Explore Role Dashboards Directly (Phase 1 Instant Demo):
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
              <button
                onClick={() => handleQuickEnter('admin')}
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-all shadow-2xs hover:shadow-xs"
              >
                <Shield className="w-4 h-4 text-indigo-500" />
                <span>Admin View</span>
              </button>
              <button
                onClick={() => handleQuickEnter('manager')}
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-amber-400 dark:hover:border-amber-500 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-all shadow-2xs hover:shadow-xs"
              >
                <ChefHat className="w-4 h-4 text-amber-500" />
                <span>Manager View</span>
              </button>
              <button
                onClick={() => handleQuickEnter('student')}
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-400 dark:hover:border-emerald-500 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-all shadow-2xs hover:shadow-xs"
              >
                <GraduationCap className="w-4 h-4 text-emerald-500" />
                <span>Student View</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-16 bg-slate-50 dark:bg-slate-900/50 border-y border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Complete Digital Management for Hostel Dining
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400">
              Replace outdated paper mess registers, unverified headcount estimation, and manual bill vouchers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 flex items-center justify-center mb-4">
                <Utensils className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-2">
                Dynamic Menu & Nutrition
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Publish 7-day breakfast, lunch, snack, and dinner schedules with dietary tags (Veg, Non-Veg, Jain), allergy notes, and calorie counts.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 flex items-center justify-center mb-4">
                <CalendarCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-2">
                Accurate Attendance & Rebates
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Log meal attendances per session. Students request mess cut leave rebates in advance with automatic credit adjustments.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400 flex items-center justify-center mb-4">
                <Receipt className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-2">
                Automated Monthly Billing
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Calculations based strictly on verified daily meal attendance records and fixed meal rates. Integrated offline counter receipts and printable statements.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 flex items-center justify-center mb-4">
                <Package className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-2">
                Kitchen Inventory Tracking
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Real-time stock levels for grains, dairy, cooking gas, and spices with automated threshold alerts for low and out-of-stock items.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
              <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 flex items-center justify-center mb-4">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-2">
                Feedback & Complaint Redressal
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Students report quality, hygiene, or timing issues directly. Managers respond with status notes until complaints reach resolution.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 flex items-center justify-center mb-4">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-2">
                Official Notices & Feast Alerts
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Broadcast instant hostel announcements, holiday meal schedules, and special event banquets to all resident students.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Banner */}
      <section className="py-12 bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-3xl sm:text-4xl font-black text-blue-600 dark:text-blue-400">1,850+</p>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">Meals Served Daily</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400">99.8%</p>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">Billing Reconciliation</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-black text-purple-600 dark:text-purple-400">&lt; 12 hrs</p>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">Complaint Resolution</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-black text-amber-600 dark:text-amber-400">0%</p>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">Ghost Meal Fraud</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
          <div className="flex flex-col items-center justify-center gap-2 text-center sm:gap-3">
            <p className="text-xs sm:text-sm font-medium tracking-wide text-slate-600 dark:text-slate-300">
              © 2026 Smart Mess Management System
            </p>
            <p className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-100 tracking-[0.02em]">
              <span className="text-slate-600 dark:text-slate-300">Developed by </span>
              <span className="text-blue-600 dark:text-blue-400">Prince Kumar</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
