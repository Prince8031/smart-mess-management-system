import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const { currentUser } = useApp();
  const location = useLocation();

  const activeUser = user || currentUser;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Authenticating session...</p>
        </div>
      </div>
    );
  }

  // If no user at all, redirect to /login
  if (!activeUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role authorization
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(activeUser.role)) {
    const redirectPath =
      activeUser.role === 'admin'
        ? '/admin/dashboard'
        : activeUser.role === 'manager'
        ? '/manager/dashboard'
        : '/student/dashboard';

    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};
