import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { INITIAL_ADMIN, INITIAL_MANAGERS, INITIAL_STUDENTS } from '../mockData';
import { authAPI } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  updateProfileState: (updatedUser: Partial<User>) => void;
  setUserDirectly: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize user from localStorage, defaulting to demo admin for instant preview access
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('smart_mess_current_user');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // fallback
    }
    return INITIAL_ADMIN;
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('mess_token') || 'demo-preview-session-token';
  });

  const [loading, setLoading] = useState<boolean>(false);

  // Sync session token
  useEffect(() => {
    if (!localStorage.getItem('mess_token')) {
      localStorage.setItem('mess_token', 'demo-preview-session-token');
    }
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    setLoading(true);

    // 1. Try real backend API if active, with quick timeout
    try {
      const apiPromise = authAPI.login({ email, password });
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Backend timeout')), 1000)
      );
      const response = (await Promise.race([apiPromise, timeoutPromise])) as any;

      if (response && response.success && response.token && response.user) {
        localStorage.setItem('mess_token', response.token);
        localStorage.setItem('smart_mess_current_user', JSON.stringify(response.user));
        setToken(response.token);
        setUser(response.user);
        setLoading(false);
        return { success: true };
      }
    } catch {
      // Backend not running in standalone preview, fallback smoothly to local mock users
    }

    // 2. Standalone Mock Authentication Fallback
    const cleanEmail = email.toLowerCase().trim();

    // Check Admin
    if (cleanEmail === INITIAL_ADMIN.email.toLowerCase()) {
      const mockToken = `mock_jwt_admin_${Date.now()}`;
      localStorage.setItem('mess_token', mockToken);
      localStorage.setItem('smart_mess_current_user', JSON.stringify(INITIAL_ADMIN));
      setToken(mockToken);
      setUser(INITIAL_ADMIN);
      setLoading(false);
      return { success: true };
    }

    // Check Managers
    const matchedManager = INITIAL_MANAGERS.find(
      (m) => m.email.toLowerCase() === cleanEmail
    );
    if (matchedManager) {
      const mockToken = `mock_jwt_manager_${Date.now()}`;
      localStorage.setItem('mess_token', mockToken);
      localStorage.setItem('smart_mess_current_user', JSON.stringify(matchedManager));
      setToken(mockToken);
      setUser(matchedManager);
      setLoading(false);
      return { success: true };
    }

    // Check Students (from local storage or mock data)
    let allStudents = INITIAL_STUDENTS;
    try {
      const storedStudents = localStorage.getItem('smart_mess_students');
      if (storedStudents) {
        allStudents = JSON.parse(storedStudents);
      }
    } catch {
      // keep fallback
    }

    const matchedStudent = allStudents.find(
      (s) =>
        s.email.toLowerCase() === cleanEmail ||
        (s.studentId && s.studentId.toLowerCase() === cleanEmail)
    );

    if (matchedStudent) {
      const mockToken = `mock_jwt_student_${Date.now()}`;
      localStorage.setItem('mess_token', mockToken);
      localStorage.setItem('smart_mess_current_user', JSON.stringify(matchedStudent));
      setToken(mockToken);
      setUser(matchedStudent);
      setLoading(false);
      return { success: true };
    }

    // If any email provided with a role-like hint
    if (cleanEmail.includes('admin')) {
      setUser(INITIAL_ADMIN);
      setLoading(false);
      return { success: true };
    } else if (cleanEmail.includes('manager')) {
      setUser(INITIAL_MANAGERS[0]);
      setLoading(false);
      return { success: true };
    } else if (cleanEmail.length > 0) {
      // Default to first student for flexible demo testing
      setUser(INITIAL_STUDENTS[0]);
      setLoading(false);
      return { success: true };
    }

    setLoading(false);
    return { success: false, message: 'Invalid credentials. Please use demo accounts.' };
  };

  const logout = async (): Promise<void> => {
    try {
      await authAPI.logout();
    } catch {
      // Ignore network errors
    } finally {
      localStorage.removeItem('mess_token');
      localStorage.removeItem('smart_mess_current_user');
      setToken(null);
      setUser(null);
    }
  };

  const updateProfileState = (updatedUser: Partial<User>) => {
    if (user) {
      const updated = { ...user, ...updatedUser };
      setUser(updated);
      localStorage.setItem('smart_mess_current_user', JSON.stringify(updated));
    }
  };

  const setUserDirectly = (newUser: User | null) => {
    setUser(newUser);
    if (newUser) {
      localStorage.setItem('smart_mess_current_user', JSON.stringify(newUser));
      if (!token) {
        const mockTok = `mock_jwt_${newUser.role}_${Date.now()}`;
        setToken(mockTok);
        localStorage.setItem('mess_token', mockTok);
      }
    } else {
      localStorage.removeItem('smart_mess_current_user');
    }
  };

  const isAuthenticated = Boolean(user);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        loading,
        login,
        logout,
        updateProfileState,
        setUserDirectly,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
