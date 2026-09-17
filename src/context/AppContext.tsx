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

function getStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(`smart_mess_${key}`);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function setStorage<T>(key: string, value: T): void {
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
  const [menus, setMenus] = useState<MenuItem[]>(() => {
    const saved = getStorage<MenuItem[]>('menus', INITIAL_MENUS);
    if (!Array.isArray(saved) || saved.length === 0 || saved[0]?.name === 'South Indian Platter') {
      setStorage('menus', INITIAL_MENUS);
      return INITIAL_MENUS;
    }
    return saved;
  });
  const [inventory, setInventory] = useState<InventoryItem[]>(() => getStorage('inventory', INITIAL_INVENTORY));
  const [complaints, setComplaints] = useState<Complaint[]>(() => getStorage('complaints', INITIAL_COMPLAINTS));
  const [notices, setNotices] = useState<Notice[]>(() => getStorage('notices', INITIAL_NOTICES));
  const [bills, setBills] = useState<BillRecord[]>(() => getStorage('bills', INITIAL_BILLS));
  const [payments, setPayments] = useState<PaymentRecord[]>(() => getStorage('payments', INITIAL_PAYMENTS));
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => getStorage('attendance', INITIAL_ATTENDANCE));
  const [settings, setSettings] = useState<MessSettings>(() => {
    const saved = getStorage<MessSettings>('settings', INITIAL_SETTINGS);
    if (!saved || saved.messName === 'IIT Campus Central Mess System') {
      setStorage('settings', INITIAL_SETTINGS);
      return INITIAL_SETTINGS;
    }
    return saved;
  });

  // Current user state defaults to Admin for immediate frictionless preview demo
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = getStorage<User | null>('current_user', null);
    return saved || INITIAL_ADMIN;
  });

  const currentRole: UserRole = currentUser ? currentUser.role : 'admin';

  // Apply dark class to document root
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('smart_mess_theme', theme);
  }, [theme]);

  // Sync to local storage as client cache
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

  // Optionally attempt backend sync if a backend is running, otherwise silently use mock data
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

      if (fetchedStudents.status === 'fulfilled' && fetchedStudents.value?.length > 0) {
        setStudents(fetchedStudents.value);
        setIsBackendConnected(true);
      }

      if (fetchedManagers.status === 'fulfilled' && fetchedManagers.value?.length > 0) {
        setManagers(fetchedManagers.value);
      }

      if (fetchedMenu.status === 'fulfilled' && fetchedMenu.value?.length > 0) {
        setMenus(fetchedMenu.value);
      }

      if (fetchedAttendance.status === 'fulfilled') {
        const attData = (fetchedAttendance.value as any)?.data || fetchedAttendance.value;
        if (Array.isArray(attData) && attData.length > 0) {
          setAttendance(attData);
        }
      }

      if (fetchedBills.status === 'fulfilled' && fetchedBills.value?.length > 0) {
        setBills(fetchedBills.value);
      }

      if (fetchedPayments.status === 'fulfilled' && fetchedPayments.value?.length > 0) {
        setPayments(fetchedPayments.value);
      }

      if (fetchedInventory.status === 'fulfilled' && fetchedInventory.value?.length > 0) {
        setInventory(fetchedInventory.value);
      }

      if (fetchedComplaints.status === 'fulfilled' && fetchedComplaints.value?.length > 0) {
        setComplaints(fetchedComplaints.value);
      }

      if (fetchedNotices.status === 'fulfilled' && fetchedNotices.value?.length > 0) {
        setNotices(fetchedNotices.value);
      }

      if (fetchedSettings.status === 'fulfilled' && fetchedSettings.value) {
        setSettings(fetchedSettings.value);
      }
    } catch {
      // Standalone preview mode: silently uses rich local mock data
      setIsBackendConnected(false);
    }
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const setCurrentRole = (role: UserRole) => {
    switchRole(role);
  };

  const switchRole = async (role: UserRole, targetId?: string) => {
    if (role === 'admin') {
      setCurrentUser(INITIAL_ADMIN);
    } else if (role === 'manager') {
      const mgr = targetId ? managers.find((m) => m.id === targetId) : managers[0];
      setCurrentUser(mgr || INITIAL_MANAGERS[0]);
    } else if (role === 'student') {
      const std = targetId ? students.find((s) => s.id === targetId) : students[0];
      setCurrentUser(std || INITIAL_STUDENTS[0]);
    }
  };

  const login = (emailOrId: string, role: UserRole): boolean => {
    if (role === 'admin') {
      setCurrentUser(INITIAL_ADMIN);
      return true;
    }
    if (role === 'manager') {
      const mgr = managers.find(
        (m) => m.email.toLowerCase() === emailOrId.toLowerCase() || m.id === emailOrId
      );
      setCurrentUser(mgr || managers[0] || INITIAL_MANAGERS[0]);
      return true;
    }
    if (role === 'student') {
      const std = students.find(
        (s) =>
          s.email.toLowerCase() === emailOrId.toLowerCase() ||
          (s.studentId && s.studentId.toLowerCase() === emailOrId.toLowerCase())
      );
      setCurrentUser(std || students[0] || INITIAL_STUDENTS[0]);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('mess_token');
    setCurrentUser(INITIAL_ADMIN); // reset to demo admin for preview convenience
  };

  // Student CRUD operations
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

  const updateStudent = async (id: string, data: Partial<User>) => {
    setStudents((prev) => prev.map((s) => (s.id === id || s.studentId === id ? { ...s, ...data } : s)));
    try {
      if (isBackendConnected) {
        await studentAPI.updateStudent(id, data);
      }
    } catch {
      // local state already updated
    }
  };

  const deleteStudent = async (id: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== id && s.studentId !== id));
    try {
      if (isBackendConnected) {
        await studentAPI.deleteStudent(id);
      }
    } catch {
      // local state already updated
    }
  };

  // Manager CRUD operations
  const addManager = (managerData: Omit<User, 'id'>) => {
    const newManager: User = { ...managerData, id: `mgr-${Date.now()}` };
    setManagers((prev) => [...prev, newManager]);
  };

  const updateManager = (id: string, data: Partial<User>) => {
    setManagers((prev) => prev.map((m) => (m.id === id ? { ...m, ...data } : m)));
  };

  const deleteManager = (id: string) => {
    setManagers((prev) => prev.filter((m) => m.id !== id));
  };

  // Menu CRUD operations
  const addMenuItem = async (itemData: Omit<MenuItem, 'id'>) => {
    const fallbackId = `m-${Date.now()}`;
    const newItem = { ...itemData, id: fallbackId };
    setMenus((prev) => [...prev, newItem]);
    try {
      if (isBackendConnected) {
        await menuAPI.createMenuItem(itemData);
      }
    } catch {
      // local state already updated
    }
  };

  const updateMenuItem = async (id: string, data: Partial<MenuItem>) => {
    setMenus((prev) => prev.map((m) => (m.id === id ? { ...m, ...data } : m)));
    try {
      if (isBackendConnected) {
        await menuAPI.updateMenuItem(id, data);
      }
    } catch {
      // local state already updated
    }
  };

  const deleteMenuItem = async (id: string) => {
    setMenus((prev) => prev.filter((m) => m.id !== id));
    try {
      if (isBackendConnected) {
        await menuAPI.deleteMenuItem(id);
      }
    } catch {
      // local state already updated
    }
  };

  // Inventory CRUD operations
  const addInventoryItem = async (itemData: any) => {
    const qty = Number(itemData.quantity) || 0;
    const min = Number(itemData.minimumStock) || 0;
    const computedStatus = itemData.status || (qty <= 0 ? 'Out of Stock' : qty <= min ? 'Low Stock' : 'In Stock');
    const newItem: InventoryItem = {
      ...itemData,
      id: `inv-${Date.now()}`,
      status: computedStatus,
    };
    setInventory((prev) => [newItem, ...prev]);

    try {
      if (isBackendConnected) {
        await inventoryAPI.createItem(itemData);
      }
    } catch {
      // local state already updated
    }
  };

  const updateInventoryItem = async (id: string, data: Partial<InventoryItem>) => {
    setInventory((prev) =>
      prev.map((i) => {
        if (i.id === id) {
          const updated = { ...i, ...data };
          const q = updated.quantity;
          const min = updated.minimumStock;
          updated.status = q <= 0 ? 'Out of Stock' : q <= min ? 'Low Stock' : 'In Stock';
          return updated;
        }
        return i;
      })
    );

    try {
      if (isBackendConnected) {
        await inventoryAPI.updateItem(id, data);
      }
    } catch {
      // local state already updated
    }
  };

  const deleteInventoryItem = async (id: string) => {
    setInventory((prev) => prev.filter((i) => i.id !== id));
    try {
      if (isBackendConnected) {
        await inventoryAPI.deleteItem(id);
      }
    } catch {
      // local state already updated
    }
  };

  const restockInventoryItem = async (id: string, quantityToAdd: number) => {
    const item = inventory.find((i) => i.id === id);
    if (item) {
      const newQuantity = item.quantity + quantityToAdd;
      await updateInventoryItem(id, {
        quantity: newQuantity,
        lastRestocked: new Date().toISOString().split('T')[0],
      });
    }
  };

  const restockItem = restockInventoryItem;

  // Complaints CRUD operations
  const addComplaint = async (complaintData: any) => {
    const newComplaint: Complaint = {
      ...complaintData,
      id: `cmp-${Date.now()}`,
      date: complaintData.date || new Date().toISOString().split('T')[0],
    };
    setComplaints((prev) => [newComplaint, ...prev]);

    try {
      if (isBackendConnected) {
        await complaintAPI.createComplaint(complaintData);
      }
    } catch {
      // local state already updated
    }
  };

  const updateComplaintStatus = async (
    id: string,
    status: Complaint['status'],
    resolutionNotes?: string
  ) => {
    setComplaints((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              status,
              resolutionNotes: resolutionNotes || c.resolutionNotes,
              response: resolutionNotes || c.response,
              resolvedAt: status === 'Resolved' ? new Date().toISOString().split('T')[0] : c.resolvedAt,
            }
          : c
      )
    );

    try {
      if (isBackendConnected) {
        await complaintAPI.updateComplaint(id, {
          status,
          resolutionNotes,
          response: resolutionNotes,
        });
      }
    } catch {
      // local state already updated
    }
  };

  const addComplaintNote = async (id: string, note: string) => {
    setComplaints((prev) => prev.map((c) => (c.id === id ? { ...c, adminNotes: note } : c)));
    try {
      if (isBackendConnected) {
        await complaintAPI.updateComplaint(id, { adminNotes: note });
      }
    } catch {
      // local state already updated
    }
  };

  // Notices CRUD operations
  const addNotice = async (noticeData: any) => {
    const newNotice: Notice = {
      ...noticeData,
      id: `not-${Date.now()}`,
      date: noticeData.date || new Date().toISOString().split('T')[0],
    };
    setNotices((prev) => [newNotice, ...prev]);

    try {
      if (isBackendConnected) {
        await noticeAPI.createNotice(noticeData);
      }
    } catch {
      // local state already updated
    }
  };

  const deleteNotice = async (id: string) => {
    setNotices((prev) => prev.filter((n) => n.id !== id));
    try {
      if (isBackendConnected) {
        await noticeAPI.deleteNotice(id);
      }
    } catch {
      // local state already updated
    }
  };

  // Bills operations
  const addBill = async (billData: Omit<BillRecord, 'id'>) => {
    const newBill: BillRecord = {
      ...billData,
      id: `bill-${Date.now()}`,
    };
    setBills((prev) => [newBill, ...prev]);

    try {
      if (isBackendConnected) {
        await billAPI.createBill(billData);
      }
    } catch {
      // local state already updated
    }
  };

  const markBillAsPaid = async (billId: string, paymentMethod: any = 'Cash') => {
    const targetBill = bills.find((b) => b.id === billId);
    if (!targetBill) return;

    setBills((prev) =>
      prev.map((b) =>
        b.id === billId
          ? { ...b, paidAmount: b.totalAmount, dueAmount: 0, status: 'Paid' }
          : b
      )
    );

    const safeMethod: PaymentRecord['method'] = paymentMethod || 'Cash';

    setPayments((prev) => [
      {
        id: `pay-${Date.now()}`,
        transactionId: `TXN-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        studentId: targetBill.studentId,
        studentName: targetBill.studentName,
        rollNo: targetBill.rollNo,
        billId,
        amount: targetBill.dueAmount,
        date: new Date().toISOString().split('T')[0],
        method: safeMethod,
        status: 'Completed',
      },
      ...prev,
    ]);

    try {
      if (isBackendConnected) {
        await paymentAPI.recordPayment({
          billId,
          studentId: targetBill.studentId,
          rollNo: targetBill.rollNo,
          studentName: targetBill.studentName,
          amount: targetBill.dueAmount,
          paymentMethod: safeMethod,
        });
      }
    } catch {
      // local state already updated
    }
  };

  const markBillStatus = async (billId: string, status: 'PAID' | 'PENDING' | 'Partially Paid') => {
    const isPaid = status === 'PAID';
    setBills((prev) =>
      prev.map((b) =>
        b.id === billId
          ? {
              ...b,
              status,
              paidAmount: isPaid ? b.totalAmount : status === 'Partially Paid' ? Math.round(b.totalAmount / 2) : 0,
              dueAmount: isPaid ? 0 : status === 'Partially Paid' ? Math.round(b.totalAmount / 2) : b.totalAmount,
              paidAt: isPaid ? new Date().toISOString() : null,
              paidByName: isPaid ? currentUser?.name || 'Manager' : '',
            }
          : b
      )
    );

    try {
      if (isBackendConnected) {
        await billAPI.updateBillStatus(billId, status);
      }
    } catch (e) {
      console.error('Failed to update bill status on backend', e);
    }
  };

  const recalculateBill = async (billId: string) => {
    try {
      if (isBackendConnected) {
        const res = await billAPI.recalculateBill(billId);
        if (res?.data) {
          setBills((prev) => prev.map((b) => (b.id === billId ? res.data : b)));
          return res.data;
        }
      }
    } catch (e) {
      console.error('Failed to recalculate bill on backend', e);
    }

    // Local fallback calculation from attendance
    const target = bills.find((b) => b.id === billId);
    if (!target) return null;
    const targetMonth = target.monthNum || 9;
    const studentRoll = target.rollNo;
    const studentAtt = attendance.filter((a) => a.rollNo === studentRoll);
    let bf = 0, lu = 0, sn = 0, di = 0;
    for (const a of studentAtt) {
      if (a.breakfast) bf++;
      if (a.lunch) lu++;
      if (a.snacks) sn++;
      if (a.dinner) di++;
    }
    const bfr = target.breakfastRate || 20;
    const lur = target.lunchRate || 40;
    const snr = target.snacksRate || 15;
    const dir = target.dinnerRate || 40;
    const bfa = bf * bfr;
    const lua = lu * lur;
    const sna = sn * snr;
    const dia = di * dir;
    const sub = bfa + lua + sna + dia;
    const adj = target.adjustment || 0;
    const tot = Math.max(0, sub + adj);

    const updated: BillRecord = {
      ...target,
      breakfastCount: bf,
      lunchCount: lu,
      snacksCount: sn,
      dinnerCount: di,
      breakfastAmount: bfa,
      lunchAmount: lua,
      snacksAmount: sna,
      dinnerAmount: dia,
      subtotal: sub,
      totalAmount: tot,
      totalMeals: bf + lu + sn + di,
      dueAmount: target.status === 'PAID' ? 0 : tot,
      paidAmount: target.status === 'PAID' ? tot : 0,
    };
    setBills((prev) => prev.map((b) => (b.id === billId ? updated : b)));
    return updated;
  };

  const updateBillAdjustment = async (billId: string, adjustment: number, adjustmentReason: string) => {
    const adj = Number(adjustment) || 0;
    setBills((prev) =>
      prev.map((b) => {
        if (b.id === billId) {
          const sub = b.subtotal || b.totalAmount;
          const newTot = Math.max(0, sub + adj);
          return {
            ...b,
            adjustment: adj,
            adjustmentReason,
            totalAmount: newTot,
            dueAmount: b.status === 'PAID' ? 0 : newTot,
            paidAmount: b.status === 'PAID' ? newTot : 0,
            adjustedBy: currentUser?.name || 'Staff',
            adjustedAt: new Date().toISOString(),
          };
        }
        return b;
      })
    );

    try {
      if (isBackendConnected) {
        const res = await billAPI.updateBillAdjustment(billId, { adjustment: adj, adjustmentReason });
        return res?.data;
      }
    } catch (e) {
      console.error('Failed to update bill adjustment on backend', e);
    }
  };

  const generateMonthlyBill = async (data: {
    studentId?: string;
    rollNo?: string;
    month: number;
    year: number;
    generateAll?: boolean;
  }) => {
    try {
      if (isBackendConnected) {
        const res = await billAPI.generateMonthlyBill(data);
        if (res?.data) {
          if (Array.isArray(res.data)) {
            setBills((prev) => [...res.data, ...prev]);
          } else {
            setBills((prev) => [res.data, ...prev]);
          }
          return res;
        }
      }
    } catch (e: any) {
      if (e?.response?.data?.message) {
        throw new Error(e.response.data.message);
      }
      throw e;
    }

    // Local fallback generation
    const MONTH_NAMES = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const monthName = `${MONTH_NAMES[data.month - 1]} ${data.year}`;

    if (data.generateAll) {
      const newGenerated: BillRecord[] = [];
      for (const st of students) {
        const alreadyExists = bills.some(
          (b) =>
            (b.studentId === st.id || b.rollNo === st.studentId) &&
            ((b.monthNum === data.month && b.year === data.year) || b.month === monthName)
        );
        if (alreadyExists) continue;

        const b: BillRecord = {
          id: `bill-gen-${st.studentId}-${Date.now()}`,
          studentId: st.id,
          studentName: st.name,
          rollNo: st.studentId || 'N/A',
          roomNo: st.roomNo || 'H2-101',
          hostelBlock: st.hostelBlock || 'Hostel 2 (Boys)',
          month: monthName,
          monthNum: data.month,
          monthName,
          year: data.year,
          breakfastCount: 22,
          lunchCount: 23,
          snacksCount: 20,
          dinnerCount: 22,
          breakfastRate: 20,
          lunchRate: 40,
          snacksRate: 15,
          dinnerRate: 40,
          breakfastAmount: 440,
          lunchAmount: 920,
          snacksAmount: 300,
          dinnerAmount: 880,
          subtotal: 2540,
          adjustment: 0,
          totalAmount: 2540,
          totalMeals: 87,
          status: 'PENDING',
          paidAmount: 0,
          dueAmount: 2540,
          dueDate: `${data.year}-${String(data.month + 1).padStart(2, '0')}-05`,
          generatedAt: new Date().toISOString(),
          generatedByName: currentUser?.name || 'Manager',
        };
        newGenerated.push(b);
      }
      setBills((prev) => [...newGenerated, ...prev]);
      return { success: true, count: newGenerated.length };
    } else {
      const st =
        students.find((s) => s.id === data.studentId || s.studentId === data.rollNo) ||
        students[0];
      const alreadyExists = bills.some(
        (b) =>
          (b.studentId === st.id || b.rollNo === st.studentId) &&
          ((b.monthNum === data.month && b.year === data.year) || b.month === monthName)
      );
      if (alreadyExists) {
        throw new Error('Monthly bill already exists for this student.');
      }

      const b: BillRecord = {
        id: `bill-gen-${st.studentId}-${Date.now()}`,
        studentId: st.id,
        studentName: st.name,
        rollNo: st.studentId || 'N/A',
        roomNo: st.roomNo || 'H2-101',
        hostelBlock: st.hostelBlock || 'Hostel 2 (Boys)',
        month: monthName,
        monthNum: data.month,
        monthName,
        year: data.year,
        breakfastCount: 22,
        lunchCount: 24,
        snacksCount: 20,
        dinnerCount: 23,
        breakfastRate: 20,
        lunchRate: 40,
        snacksRate: 15,
        dinnerRate: 40,
        breakfastAmount: 440,
        lunchAmount: 960,
        snacksAmount: 300,
        dinnerAmount: 920,
        subtotal: 2620,
        adjustment: 0,
        totalAmount: 2620,
        totalMeals: 89,
        status: 'PENDING',
        paidAmount: 0,
        dueAmount: 2620,
        dueDate: `${data.year}-${String(data.month + 1).padStart(2, '0')}-05`,
        generatedAt: new Date().toISOString(),
        generatedByName: currentUser?.name || 'Manager',
      };
      setBills((prev) => [b, ...prev]);
      return { success: true, data: b };
    }
  };

  const refreshBills = async () => {
    try {
      if (isBackendConnected) {
        const fetched = await billAPI.getBills();
        if (Array.isArray(fetched)) {
          setBills(fetched);
        }
      }
    } catch (e) {
      console.error('Failed to refresh bills', e);
    }
  };

  // Payments operations
  const recordPayment = async (paymentData: Omit<PaymentRecord, 'id' | 'transactionId' | 'date'>) => {
    const newPayment: PaymentRecord = {
      ...paymentData,
      id: `pay-${Date.now()}`,
      transactionId: `TXN-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      date: new Date().toISOString().split('T')[0],
      status: 'Completed',
    };
    setPayments((prev) => [newPayment, ...prev]);

    if (paymentData.billId) {
      setBills((prev) =>
        prev.map((b) => {
          if (b.id === paymentData.billId) {
            const newPaid = b.paidAmount + paymentData.amount;
            const newDue = Math.max(0, b.totalAmount - newPaid);
            return {
              ...b,
              paidAmount: newPaid,
              dueAmount: newDue,
              status: newDue === 0 ? 'Paid' : 'Partially Paid',
            };
          }
          return b;
        })
      );
    }

    try {
      if (isBackendConnected) {
        await paymentAPI.recordPayment(paymentData);
      }
    } catch {
      // local state already updated
    }
  };

  // Attendance operations
  const toggleMealAttendance = async (
    recordId: string,
    meal: 'breakfast' | 'lunch' | 'snacks' | 'dinner'
  ) => {
    const existing = attendance.find((a) => a.id === recordId);
    const updatedVal = existing ? !existing[meal] : true;

    setAttendance((prev) =>
      prev.map((a) => (a.id === recordId ? { ...a, [meal]: updatedVal } : a))
    );

    try {
      if (isBackendConnected) {
        await attendanceAPI.updateAttendance(recordId, { [meal]: updatedVal });
      }
    } catch {
      // local state already updated
    }
  };

  const batchMarkAttendance = async (
    date: string,
    meal: 'breakfast' | 'lunch' | 'snacks' | 'dinner',
    present: boolean
  ) => {
    setAttendance((prev) =>
      prev.map((a) => (a.date === date ? { ...a, [meal]: present } : a))
    );
  };

  const saveMealAttendance = async (
    date: string,
    meal: 'breakfast' | 'lunch' | 'snacks' | 'dinner',
    studentRecords: { studentId: string; rollNo: string; studentName?: string; roomNo?: string; hostelBlock?: string; status: boolean }[]
  ) => {
    // Optimistic local state update
    setAttendance((prev) => {
      const updated = [...prev];
      for (const item of studentRecords) {
        const idx = updated.findIndex(
          (a) => (a.rollNo === item.rollNo || a.studentId === item.studentId) && a.date === date
        );
        if (idx >= 0) {
          updated[idx] = {
            ...updated[idx],
            [meal]: item.status,
            updatedAt: new Date().toISOString(),
            updatedBy: currentUser?.name || 'Manager',
          };
        } else {
          updated.unshift({
            id: `att-${Date.now()}-${item.rollNo}`,
            studentId: item.studentId,
            rollNo: item.rollNo,
            studentName: item.studentName || 'Student',
            roomNo: item.roomNo || 'H2-101',
            hostelBlock: item.hostelBlock || 'Hostel 2 (Boys)',
            date,
            breakfast: meal === 'breakfast' ? item.status : false,
            lunch: meal === 'lunch' ? item.status : false,
            snacks: meal === 'snacks' ? item.status : false,
            dinner: meal === 'dinner' ? item.status : false,
            totalPresent: item.status ? 1 : 0,
            totalMeals: 4,
            updatedAt: new Date().toISOString(),
            updatedBy: currentUser?.name || 'Manager',
          });
        }
      }
      return updated;
    });

    // Sync with backend API
    try {
      if (isBackendConnected) {
        await attendanceAPI.markAttendance({
          date,
          meal,
          records: studentRecords,
        });
      }
    } catch (err) {
      console.warn('Backend sync failed, using optimistic state', err);
    }
  };

  // Settings
  const updateSettings = async (newSettings: Partial<MessSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    try {
      if (isBackendConnected) {
        await settingsAPI.updateSettings(newSettings);
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
        updateStudent,
        deleteStudent,
        managers,
        addManager,
        updateManager,
        deleteManager,
        menus,
        addMenuItem,
        updateMenuItem,
        deleteMenuItem,
        inventory,
        addInventoryItem,
        updateInventoryItem,
        deleteInventoryItem,
        restockItem,
        restockInventoryItem,
        complaints,
        addComplaint,
        updateComplaintStatus,
        addComplaintNote,
        notices,
        addNotice,
        deleteNotice,
        bills,
        addBill,
        markBillAsPaid,
        markBillStatus,
        recalculateBill,
        updateBillAdjustment,
        generateMonthlyBill,
        refreshBills,
        payments,
        recordPayment,
        attendance,
        toggleMealAttendance,
        batchMarkAttendance,
        saveMealAttendance,
        settings,
        updateSettings,
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
