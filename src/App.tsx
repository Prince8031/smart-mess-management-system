import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { DashboardLayout } from './layouts/DashboardLayout';

// Public Pages
import { LandingPage } from './pages/public/LandingPage';
import { LoginPage } from './pages/public/LoginPage';
import { ForgotPasswordPage } from './pages/public/ForgotPasswordPage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { StudentsPage } from './pages/admin/StudentsPage';
import { ManagersPage } from './pages/admin/ManagersPage';
import { MenuPage } from './pages/admin/MenuPage';
import { AttendancePage } from './pages/admin/AttendancePage';
import { BillingPage } from './pages/admin/BillingPage';
import { PaymentsPage } from './pages/admin/PaymentsPage';
import { InventoryPage } from './pages/admin/InventoryPage';
import { ComplaintsPage } from './pages/admin/ComplaintsPage';
import { NoticesPage } from './pages/admin/NoticesPage';
import { ReportsPage } from './pages/admin/ReportsPage';
import { SettingsPage } from './pages/admin/SettingsPage';

// Manager Pages
import { ManagerDashboard } from './pages/manager/ManagerDashboard';
import { ManagerAttendancePage } from './pages/manager/ManagerAttendancePage';

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { StudentMenuPage } from './pages/student/StudentMenuPage';
import { StudentAttendancePage } from './pages/student/StudentAttendancePage';
import { StudentBillingPage } from './pages/student/StudentBillingPage';
import { StudentComplaintsPage } from './pages/student/StudentComplaintsPage';
import { StudentNoticesPage } from './pages/student/StudentNoticesPage';
import { StudentProfilePage } from './pages/student/StudentProfilePage';

// Common Today's Menu Page
import { TodayMenuPage } from './pages/common/TodayMenuPage';

export function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            {/* Admin Routes - Protected for Admin */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="today-menu" element={<TodayMenuPage />} />
              <Route path="students" element={<StudentsPage />} />
              <Route path="managers" element={<ManagersPage />} />
              <Route path="menu" element={<MenuPage />} />
              <Route path="weekly-menu" element={<MenuPage />} />
              <Route path="attendance" element={<AttendancePage />} />
              <Route path="billing" element={<BillingPage />} />
              <Route path="payments" element={<PaymentsPage />} />
              <Route path="inventory" element={<InventoryPage />} />
              <Route path="complaints" element={<ComplaintsPage />} />
              <Route path="notices" element={<NoticesPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            {/* Manager Routes - Protected for Manager & Admin */}
            <Route
              path="/manager"
              element={
                <ProtectedRoute allowedRoles={['admin', 'manager']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<ManagerDashboard />} />
              <Route path="today-menu" element={<TodayMenuPage />} />
              <Route path="menu" element={<MenuPage />} />
              <Route path="weekly-menu" element={<MenuPage />} />
              <Route path="attendance" element={<ManagerAttendancePage />} />
              <Route path="inventory" element={<InventoryPage />} />
              <Route path="complaints" element={<ComplaintsPage />} />
              <Route path="notices" element={<NoticesPage />} />
              <Route path="reports" element={<ReportsPage />} />
            </Route>

            {/* Student Routes - Protected for Student & Admin */}
            <Route
              path="/student"
              element={
                <ProtectedRoute allowedRoles={['student', 'admin']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<StudentDashboard />} />
              <Route path="today-menu" element={<TodayMenuPage />} />
              <Route path="menu" element={<StudentMenuPage />} />
              <Route path="weekly-menu" element={<StudentMenuPage />} />
              <Route path="attendance" element={<StudentAttendancePage />} />
              <Route path="billing" element={<StudentBillingPage />} />
              <Route path="payments" element={<StudentBillingPage />} />
              <Route path="complaints" element={<StudentComplaintsPage />} />
              <Route path="notices" element={<StudentNoticesPage />} />
              <Route path="profile" element={<StudentProfilePage />} />
            </Route>

            {/* Catch-all fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
