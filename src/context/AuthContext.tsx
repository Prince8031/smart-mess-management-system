import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { INITIAL_ADMIN } from '../mockData';
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
    return localStorage.getItem('mess_token');
  });

  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!localStorage.getItem('mess_token') && user) {
      localStorage.setItem('mess_token', `admin_jwt_${Date.now()}`);
      setToken(localStorage.getItem('mess_token'));
    }
  }, [user]);

  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    setLoading(true);

    const cleanEmail = email.toLowerCase().trim();
    const cleanPassword = password.trim();

    try {
      const apiResponse = await authAPI.login({ email: cleanEmail, password: cleanPassword });
      if (apiResponse && apiResponse.success && apiResponse.token && apiResponse.user) {
        localStorage.setItem('mess_token', apiResponse.token);
        localStorage.setItem('smart_mess_current_user', JSON.stringify(apiResponse.user));
        setToken(apiResponse.token);
        setUser(apiResponse.user);
        setLoading(false);
        return { success: true };
      }
    } catch {
      // Fall through to admin-only local verification below.
    }

    if (cleanEmail === INITIAL_ADMIN.email.toLowerCase() && cleanPassword === 'Password@123') {
      const adminToken = `admin_jwt_${Date.now()}`;
      localStorage.setItem('mess_token', adminToken);
      localStorage.setItem('smart_mess_current_user', JSON.stringify(INITIAL_ADMIN));
      setToken(adminToken);
      setUser(INITIAL_ADMIN);
      setLoading(false);
      return { success: true };
    }

    setLoading(false);
    return { success: false, message: 'Invalid email or password.' };
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
