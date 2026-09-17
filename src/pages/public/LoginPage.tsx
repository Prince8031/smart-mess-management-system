import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import {
  Utensils,
  Shield,
  ChefHat,
  GraduationCap,
  Lock,
  Mail,
  AlertCircle,
  UserPlus,
  ArrowRight,
  Database,
  CheckCircle2,
} from 'lucide-react';
import { authAPI } from '../../services/api';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login: authLogin } = useAuth();
  const { login: appLogin, switchRole } = useApp();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [role, setRole] = useState<UserRole>('admin');
  const [email, setEmail] = useState('admin@messsystem.com');
  const [password, setPassword] = useState('Password@123');
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [hostelBlock, setHostelBlock] = useState('Block A');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const from = (location.state as any)?.from?.pathname;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (mode === 'register') {
      if (!name.trim() || !email.trim() || !password.trim()) {
        setError('Please fill in all required registration fields.');
        return;
      }
      setIsLoading(true);
      try {
        const regRes = await authAPI.register({
          name,
          email,
          password,
          role: 'student',
          studentId: studentId || `STU-${Date.now().toString().slice(-4)}`,
          roomNumber: roomNumber || '101',
          hostelBlock,
        });

        if (regRes.success) {
          setSuccessMessage('Student account created successfully! Signing you in...');
          const loginResult = await authLogin(email, password);
          if (loginResult.success) {
            appLogin(email, 'student');
            navigate('/student');
            return;
          }
          setMode('login');
        } else {
          setError(regRes.message || 'Registration failed. Please try again.');
        }
      } catch (err: any) {
        setError(err.message || 'Registration failed.');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await authLogin(email, password);
      if (result.success) {
        appLogin(email, role);
        if (from) {
          navigate(from, { replace: true });
        } else {
          if (role === 'admin') navigate('/admin');
          else if (role === 'manager') navigate('/manager');
          else navigate('/student');
        }
      } else {
        // If credentials not found on API, try app fallback
        const appFallbackSuccess = appLogin(email, role);
        if (appFallbackSuccess) {
          switchRole(role);
          if (role === 'admin') navigate('/admin');
          else if (role === 'manager') navigate('/manager');
          else navigate('/student');
        } else {
          setError(result.message || 'Invalid credentials. Please use the quick demo accounts below.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Network error occurred during authentication.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = async (targetRole: UserRole, targetEmail: string) => {
    setRole(targetRole);
    setEmail(targetEmail);
    setPassword('Password@123');
    setError('');
    setSuccessMessage('');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div
          onClick={() => navigate('/')}
          className="flex items-center justify-center gap-2.5 cursor-pointer mb-4"
        >
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-md">
            <Utensils className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Smart Mess
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Hostel Dining Management
            </p>
          </div>
        </div>

        <h2 className="text-center text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {mode === 'login' ? 'Sign in to your portal' : 'Student Mess Registration'}
        </h2>
        <p className="mt-1 text-center text-xs text-slate-500 dark:text-slate-400">
          {mode === 'login'
            ? 'Access your hostel dining dashboard with role-based JWT authentication'
            : 'Create your digital hostel mess inmate account'}
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white dark:bg-slate-900 py-8 px-6 sm:px-10 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Mode Switcher Tabs */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 mb-5">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError('');
              }}
              className={`flex-1 pb-2.5 text-xs font-semibold text-center border-b-2 transition-colors ${
                mode === 'login'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setRole('student');
                setError('');
              }}
              className={`flex-1 pb-2.5 text-xs font-semibold text-center border-b-2 transition-colors ${
                mode === 'register'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              New Student Sign Up
            </button>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {mode === 'login' && (
              /* Role Selector Tabs */
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Select Your Role
                </label>
                <div className="grid grid-cols-3 gap-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setRole('admin');
                      setEmail('admin@messsystem.com');
                    }}
                    className={`flex flex-col items-center py-2 px-1 rounded-lg text-xs font-medium transition-all ${
                      role === 'admin'
                        ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Shield className="w-4 h-4 mb-1" />
                    <span>Admin</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setRole('manager');
                      setEmail('manager@messsystem.com');
                    }}
                    className={`flex flex-col items-center py-2 px-1 rounded-lg text-xs font-medium transition-all ${
                      role === 'manager'
                        ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <ChefHat className="w-4 h-4 mb-1" />
                    <span>Manager</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setRole('student');
                      setEmail('student@messsystem.com');
                    }}
                    className={`flex flex-col items-center py-2 px-1 rounded-lg text-xs font-medium transition-all ${
                      role === 'student'
                        ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <GraduationCap className="w-4 h-4 mb-1" />
                    <span>Student</span>
                  </button>
                </div>
              </div>
            )}

            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rohan Verma"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Student Roll No
                    </label>
                    <input
                      type="text"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      placeholder="e.g. CS2024-089"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Room & Block
                    </label>
                    <input
                      type="text"
                      value={roomNumber}
                      onChange={(e) => setRoomNumber(e.target.value)}
                      placeholder="e.g. Room 304, Block B"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Email / Username */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. admin@messsystem.com"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            {mode === 'login' && (
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded-sm text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                  <span className="text-xs text-slate-600 dark:text-slate-400">Remember me</span>
                </label>

                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-xs transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Authenticating...</span>
                </>
              ) : mode === 'register' ? (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Create Student Account</span>
                </>
              ) : (
                <>
                  <span>Sign in as {role === 'admin' ? 'Admin' : role === 'manager' ? 'Mess Manager' : 'Student'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials helper */}
          {mode === 'login' && (
            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  1-Click Seeded Demo Credentials
                </p>
                <span className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                  <Database className="w-3 h-3" /> MongoDB Ready
                </span>
              </div>
              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => handleQuickFill('admin', 'admin@messsystem.com')}
                  className="w-full p-2 text-left rounded-lg bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs flex items-center justify-between transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                >
                  <div className="flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <div>
                      <span className="text-slate-700 dark:text-slate-300 font-semibold block">Chief Warden (Admin)</span>
                      <span className="text-[10px] text-slate-400">admin@messsystem.com / Password@123</span>
                    </div>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-medium">Auto-Fill</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickFill('manager', 'manager@messsystem.com')}
                  className="w-full p-2 text-left rounded-lg bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs flex items-center justify-between transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                >
                  <div className="flex items-center gap-2">
                    <ChefHat className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <div>
                      <span className="text-slate-700 dark:text-slate-300 font-semibold block">Rajesh Pandey (Manager)</span>
                      <span className="text-[10px] text-slate-400">manager@messsystem.com / Password@123</span>
                    </div>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 font-medium">Auto-Fill</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickFill('student', 'student@messsystem.com')}
                  className="w-full p-2 text-left rounded-lg bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs flex items-center justify-between transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                >
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <div>
                      <span className="text-slate-700 dark:text-slate-300 font-semibold block">Aarav Sharma (Student)</span>
                      <span className="text-[10px] text-slate-400">student@messsystem.com / Password@123</span>
                    </div>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-medium">Auto-Fill</span>
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
          >
            ← Back to Home Page
          </button>
        </div>
      </div>
    </div>
  );
};
