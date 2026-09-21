import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import {
  User,
  UserRole,
  MenuItem,
  InventoryItem,
  Complaint,
  Notice,
  BillRecord,
  PaymentRecord,
  AttendanceRecord,
  MessSettings,
} from '../types';
import {
  INITIAL_STUDENTS,
  INITIAL_MANAGERS,
  INITIAL_ADMIN,
  INITIAL_MENUS,
  INITIAL_INVENTORY,
  INITIAL_COMPLAINTS,
  INITIAL_NOTICES,
  INITIAL_BILLS,
  INITIAL_PAYMENTS,
  INITIAL_ATTENDANCE,
  INITIAL_SETTINGS,
} from '../mockData';
import {
  studentAPI,
  userAPI,
  menuAPI,
  attendanceAPI,
  billAPI,
  paymentAPI,
  inventoryAPI,
  complaintAPI,
  noticeAPI,
  settingsAPI,
} from '../services/api';

interface AppContextType {
  currentUser: User | null;
  currentRole: UserRole;
  setCurrentUser: (user: User | null) => void;
  setCurrentRole: (role: UserRole) => void;
  switchRole: (role: UserRole, targetId?: string) => Promise<void>;
  login: (emailOrId: string, role: UserRole) => boolean;
  logout: () => void;

  theme: 'light' | 'dark';
  toggleTheme: () => void;

  isLoadingData: boolean;
  isBackendConnected: boolean;
  refreshBackendData: () => Promise<void>;

  students: User[];
  addStudent: (student: Omit<User, 'id'>) => Promise<void>;
  updateStudent: (id: string, data: Partial<User>) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;

  managers: User[];
  addManager: (manager: Omit<User, 'id'>) => void;
  updateManager: (id: string, data: Partial<User>) => void;
  deleteManager: (id: string) => void;

  menus: MenuItem[];
  addMenuItem: (item: Omit<MenuItem, 'id'>) => Promise<void>;
  updateMenuItem: (id: string, data: Partial<MenuItem>) => Promise<void>;
  deleteMenuItem: (id: string) => Promise<void>;

  inventory: InventoryItem[];
  addInventoryItem: (item: any) => Promise<void>;
  updateInventoryItem: (id: string, data: Partial<InventoryItem>) => Promise<void>;
  deleteInventoryItem: (id: string) => Promise<void>;
  restockItem: (id: string, quantityToAdd: number) => Promise<void>;
  restockInventoryItem: (id: string, quantityToAdd: number) => Promise<void>;

  complaints: Complaint[];
  addComplaint: (complaint: any) => Promise<void>;
  updateComplaintStatus: (id: string, status: Complaint['status'], resolutionNotes?: string) => Promise<void>;
  addComplaintNote: (id: string, note: string) => Promise<void>;

  notices: Notice[];
  addNotice: (notice: any) => Promise<void>;
  deleteNotice: (id: string) => Promise<void>;

  bills: BillRecord[];
  addBill: (bill: Omit<BillRecord, 'id'>) => Promise<void>;
  markBillAsPaid: (billId: string, paymentMethod?: any) => Promise<void>;
  markBillStatus: (billId: string, status: 'PAID' | 'PENDING' | 'Partially Paid') => Promise<void>;
  recalculateBill: (billId: string) => Promise<any>;
  updateBillAdjustment: (billId: string, adjustment: number, adjustmentReason: string) => Promise<any>;
  generateMonthlyBill: (data: { studentId?: string; rollNo?: string; month: number; year: number; generateAll?: boolean }) => Promise<any>;
  refreshBills: () => Promise<void>;

  payments: PaymentRecord[];
  recordPayment: (payment: Omit<PaymentRecord, 'id' | 'transactionId' | 'date'>) => Promise<void>;

  attendance: AttendanceRecord[];
  toggleMealAttendance: (recordId: string, meal: 'breakfast' | 'lunch' | 'snacks' | 'dinner') => Promise<void>;
  batchMarkAttendance: (date: string, meal: 'breakfast' | 'lunch' | 'snacks' | 'dinner', present: boolean) => Promise<void>;
  saveMealAttendance: (
    date: string,
    meal: 'breakfast' | 'lunch' | 'snacks' | 'dinner',
    studentRecords: { studentId: string; rollNo: string; studentName?: string; roomNo?: string; hostelBlock?: string; status: boolean }[]
  ) => Promise<void>;

  settings: MessSettings;
  updateSettings: (newSettings: Partial<MessSettings>) => Promise<void>;
  resetAllData: () => void;
  resetToDefaults: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function getStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(`smart_mess_${key}`);
    if (!item) return fallback;

    const parsed = JSON.parse(item);
    if (Array.isArray(parsed) && parsed.length === 0) return fallback;
    if (parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed) && Object.keys(parsed).length === 0) return fallback;

    return parsed;
  } catch {
    return fallback;
  }
}

export function setStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(`smart_mess_${key}`, JSON.stringify(value));
  } catch (e) {
    console.error('Storage writing error', e);
  }
}

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('smart_mess_theme') as 'light' | 'dark') || 'light';
  });

  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);

  const [students, setStudents] = useState<User[]>(() => getStorage('students', INITIAL_STUDENTS));
  const [managers, setManagers] = useState<User[]>(() => getStorage('managers', INITIAL_MANAGERS));
  const [menus, setMenus] = useState<MenuItem[]>(() => getStorage('menus', INITIAL_MENUS));
  const [inventory, setInventory] = useState<InventoryItem[]>(() => getStorage('inventory', INITIAL_INVENTORY));
  const [complaints, setComplaints] = useState<Complaint[]>(() => getStorage('complaints', INITIAL_COMPLAINTS));
  const [notices, setNotices] = useState<Notice[]>(() => getStorage('notices', INITIAL_NOTICES));
  const [bills, setBills] = useState<BillRecord[]>(() => getStorage('bills', INITIAL_BILLS));
  const [payments, setPayments] = useState<PaymentRecord[]>(() => getStorage('payments', INITIAL_PAYMENTS));
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => getStorage('attendance', INITIAL_ATTENDANCE));
  const [settings, setSettings] = useState<MessSettings>(() => getStorage('settings', INITIAL_SETTINGS));

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = getStorage<User | null>('current_user', null);
    return saved || INITIAL_ADMIN;
  });

  const currentRole: UserRole = currentUser ? currentUser.role : 'admin';

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('smart_mess_theme', theme);
  }, [theme]);

  useEffect(() => { setStorage('students', students); }, [students]);
  useEffect(() => { setStorage('managers', managers); }, [managers]);
  useEffect(() => { setStorage('menus', menus); }, [menus]);
  useEffect(() => { setStorage('inventory', inventory); }, [inventory]);
  useEffect(() => { setStorage('complaints', complaints); }, [complaints]);
  useEffect(() => { setStorage('notices', notices); }, [notices]);
  useEffect(() => { setStorage('bills', bills); }, [bills]);
  useEffect(() => { setStorage('payments', payments); }, [payments]);
  useEffect(() => { setStorage('attendance', attendance); }, [attendance]);
  useEffect(() => { setStorage('settings', settings); }, [settings]);
  useEffect(() => { setStorage('current_user', currentUser); }, [currentUser]);

  const refreshBackendData = useCallback(async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500);

      const [
        fetchedStudents,
        fetchedManagers,
        fetchedMenu,
        fetchedAttendance,
        fetchedBills,
        fetchedPayments,
        fetchedInventory,
        fetchedComplaints,
        fetchedNotices,
        fetchedSettings,
      ] = await Promise.allSettled([
        studentAPI.getStudents(),
        userAPI.getUsers({ role: 'manager' }),
        menuAPI.getMenu(),
        attendanceAPI.getAttendance(),
        billAPI.getBills(),
        paymentAPI.getPayments(),
        inventoryAPI.getInventory(),
        complaintAPI.getComplaints(),
        noticeAPI.getNotices(),
        settingsAPI.getSettings(),
      ]);

      clearTimeout(timeoutId);

      if (fetchedStudents.status === 'fulfilled' && Array.isArray(fetchedStudents.value)) {
        setStudents(fetchedStudents.value);
        setIsBackendConnected(true);
      }
      if (fetchedManagers.status === 'fulfilled' && Array.isArray(fetchedManagers.value)) {
        setManagers(fetchedManagers.value);
      }
      if (fetchedMenu.status === 'fulfilled' && Array.isArray(fetchedMenu.value)) {
        setMenus(fetchedMenu.value);
      }
      if (fetchedAttendance.status === 'fulfilled') {
        const attData = (fetchedAttendance.value as any)?.data || fetchedAttendance.value;
        if (Array.isArray(attData)) setAttendance(attData);
      }
      if (fetchedBills.status === 'fulfilled' && Array.isArray(fetchedBills.value)) setBills(fetchedBills.value);
      if (fetchedPayments.status === 'fulfilled' && Array.isArray(fetchedPayments.value)) setPayments(fetchedPayments.value);
      if (fetchedInventory.status === 'fulfilled' && Array.isArray(fetchedInventory.value)) setInventory(fetchedInventory.value);
      if (fetchedComplaints.status === 'fulfilled' && Array.isArray(fetchedComplaints.value)) setComplaints(fetchedComplaints.value);
      if (fetchedNotices.status === 'fulfilled' && Array.isArray(fetchedNotices.value)) setNotices(fetchedNotices.value);
      if (fetchedSettings.status === 'fulfilled' && fetchedSettings.value) setSettings(fetchedSettings.value);
    } catch {
      setIsBackendConnected(false);
    }
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const setCurrentRole = (role: UserRole) => {
    void switchRole(role);
  };

  const switchRole = async (role: UserRole, targetId?: string) => {
    if (role === 'admin') {
      setCurrentUser(INITIAL_ADMIN);
      return;
    }
    if (role === 'manager') {
      const mgr = targetId ? managers.find((m) => m.id === targetId) : managers[0];
      setCurrentUser(mgr || null);
      return;
    }
    if (role === 'student') {
      const std = targetId ? students.find((s) => s.id === targetId) : students[0];
      setCurrentUser(std || null);
      return;
    }
  };

  const login = (emailOrId: string, role: UserRole): boolean => {
    if (role === 'admin') {
      if (emailOrId.toLowerCase().trim() === INITIAL_ADMIN.email.toLowerCase()) {
        setCurrentUser(INITIAL_ADMIN);
        return true;
      }
      return false;
    }

    if (role === 'manager') {
      const mgr = managers.find((m) => m.email.toLowerCase() === emailOrId.toLowerCase() || m.id === emailOrId);
      if (mgr) {
        setCurrentUser(mgr);
        return true;
      }
      return false;
    }

    if (role === 'student') {
      const std = students.find((s) => s.email.toLowerCase() === emailOrId.toLowerCase() || (s.studentId && s.studentId.toLowerCase() === emailOrId.toLowerCase()));
      if (std) {
        setCurrentUser(std);
        return true;
      }
      return false;
    }

    return false;
  };

  const logout = () => {
    localStorage.removeItem('mess_token');
    setCurrentUser(null);
  };

  const addStudent = async (studentData: Omit<User, 'id'>) => {
    const fallbackId = `s-${Date.now()}`;
    const newStudent = { id: fallbackId, ...studentData };
    setStudents((prev) => [newStudent, ...prev]);

    try {
      if (isBackendConnected) {
        await studentAPI.createStudent(studentData);
      }
    } catch {
      // local state already updated
    }
  };

  const resetAllData = () => {
    setStudents(INITIAL_STUDENTS);
    setManagers(INITIAL_MANAGERS);
    setMenus(INITIAL_MENUS);
    setInventory(INITIAL_INVENTORY);
    setComplaints(INITIAL_COMPLAINTS);
    setNotices(INITIAL_NOTICES);
    setBills(INITIAL_BILLS);
    setPayments(INITIAL_PAYMENTS);
    setAttendance(INITIAL_ATTENDANCE);
    setSettings(INITIAL_SETTINGS);
  };

  const applyAttendanceUpdate = (date: string, meal: 'breakfast' | 'lunch' | 'snacks' | 'dinner', records: Array<{ studentId: string; rollNo: string; studentName?: string; roomNo?: string; hostelBlock?: string; status: boolean }>) => {
    setAttendance((prev) => {
      const baseById = new Map(prev.filter((item) => item.date === date).map((item) => [item.studentId || item.rollNo, item]));
      const next = prev.filter((item) => item.date !== date);

      const updated = records.map((studentRecord) => {
        const existing = baseById.get(studentRecord.studentId) || baseById.get(studentRecord.rollNo);
        const now = new Date().toISOString();
        const merged = existing ? { ...existing } : {
          id: `attendance-${Date.now()}-${studentRecord.studentId}`,
          studentId: studentRecord.studentId,
          rollNo: studentRecord.rollNo,
          studentName: studentRecord.studentName || 'Student',
          roomNo: studentRecord.roomNo || 'N/A',
          hostelBlock: studentRecord.hostelBlock || 'Hostel 2 (Boys)',
          date,
          breakfast: false,
          lunch: false,
          snacks: false,
          dinner: false,
          totalPresent: 0,
          totalMeals: 4,
          updatedAt: now,
          updatedBy: 'System',
        } as AttendanceRecord;

        merged[meal] = studentRecord.status;
        merged[`${meal}Detail`] = { status: studentRecord.status, markedAt: now, markedBy: 'System' };
        merged.updatedAt = now;
        merged.updatedBy = 'System';
        merged.totalPresent = Number(Boolean(merged.breakfast)) + Number(Boolean(merged.lunch)) + Number(Boolean(merged.snacks)) + Number(Boolean(merged.dinner));

        return merged;
      });

      return [...updated, ...next];
    });
  };

  const toggleMealAttendance = async (recordId: string, meal: 'breakfast' | 'lunch' | 'snacks' | 'dinner') => {
    const target = attendance.find((item) => item.id === recordId || item.studentId === recordId || item.rollNo === recordId);
    if (!target) return;

    const nextStatus = !target[meal];
    const updatePayload = {
      ...target,
      [meal]: nextStatus,
      [`${meal}Detail`]: { status: nextStatus, markedAt: new Date().toISOString(), markedBy: 'Admin' },
      updatedAt: new Date().toISOString(),
      updatedBy: 'Admin',
    } as AttendanceRecord;
    updatePayload.totalPresent = Number(Boolean(updatePayload.breakfast)) + Number(Boolean(updatePayload.lunch)) + Number(Boolean(updatePayload.snacks)) + Number(Boolean(updatePayload.dinner));

    setAttendance((prev) => prev.map((item) => (item.id === recordId || item.studentId === recordId || item.rollNo === recordId ? updatePayload : item)));

    if (isBackendConnected) {
      try {
        await attendanceAPI.patchMealAttendance(recordId, { meal, status: nextStatus });
      } catch {
        // local state remains as optimistic update
      }
    }
  };

  const batchMarkAttendance = async (date: string, meal: 'breakfast' | 'lunch' | 'snacks' | 'dinner', present: boolean) => {
    const records = students.map((student) => ({
      studentId: student.id,
      rollNo: student.studentId || student.id,
      studentName: student.name,
      roomNo: student.roomNo || 'N/A',
      hostelBlock: student.hostelBlock || 'Hostel 2 (Boys)',
      status: present,
    }));

    if (isBackendConnected) {
      try {
        await attendanceAPI.markAttendance({ date, meal, records });
      } catch {
        // fall through to local state update
      }
    }

    applyAttendanceUpdate(date, meal, records);
  };

  const saveMealAttendance = async (
    date: string,
    meal: 'breakfast' | 'lunch' | 'snacks' | 'dinner',
    studentRecords: { studentId: string; rollNo: string; studentName?: string; roomNo?: string; hostelBlock?: string; status: boolean }[]
  ) => {
    if (studentRecords.length === 0) return;

    if (isBackendConnected) {
      try {
        await attendanceAPI.markAttendance({ date, meal, records: studentRecords });
      } catch {
        // fall through to local state update
      }
    }

    applyAttendanceUpdate(date, meal, studentRecords);
  };

  const resetToDefaults = resetAllData;

  return (
    <AppContext.Provider
      value={{
        currentUser,
        currentRole,
        setCurrentUser,
        setCurrentRole,
        switchRole,
        login,
        logout,
        theme,
        toggleTheme,
        isLoadingData,
        isBackendConnected,
        refreshBackendData,
        students,
        addStudent,
        updateStudent: async () => undefined,
        deleteStudent: async () => undefined,
        managers,
        addManager: () => undefined,
        updateManager: () => undefined,
        deleteManager: () => undefined,
        menus,
        addMenuItem: async () => undefined,
        updateMenuItem: async () => undefined,
        deleteMenuItem: async () => undefined,
        inventory,
        addInventoryItem: async () => undefined,
        updateInventoryItem: async () => undefined,
        deleteInventoryItem: async () => undefined,
        restockItem: async () => undefined,
        restockInventoryItem: async () => undefined,
        complaints,
        addComplaint: async () => undefined,
        updateComplaintStatus: async () => undefined,
        addComplaintNote: async () => undefined,
        notices,
        addNotice: async () => undefined,
        deleteNotice: async () => undefined,
        bills,
        addBill: async () => undefined,
        markBillAsPaid: async () => undefined,
        markBillStatus: async () => undefined,
        recalculateBill: async () => undefined,
        updateBillAdjustment: async () => undefined,
        generateMonthlyBill: async () => undefined,
        refreshBills: async () => undefined,
        payments,
        recordPayment: async () => undefined,
        attendance,
        toggleMealAttendance,
        batchMarkAttendance,
        saveMealAttendance,
        settings,
        updateSettings: async () => undefined,
        resetAllData,
        resetToDefaults,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
