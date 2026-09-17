import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// Base URL configured via environment variables, defaulting to '/api' for full-stack integration
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request Interceptor: Attach JWT Bearer Token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('mess_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Format error message cleanly and handle session expiration
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; success?: boolean }>) => {
    if (error.response?.status === 401) {
      // Don't auto-clear if we were just attempting login
      if (!error.config?.url?.includes('/auth/login')) {
        console.warn('Session expired or unauthorized. Clearing stored token.');
        localStorage.removeItem('mess_token');
      }
    }
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred while communicating with the server.';
    return Promise.reject(new Error(message));
  }
);

// --- Auth API ---
export const authAPI = {
  login: async (credentials: { email: string; password: string }) => {
    const res = await apiClient.post('/auth/login', credentials);
    return res.data;
  },
  register: async (userData: any) => {
    const res = await apiClient.post('/auth/register', userData);
    return res.data;
  },
  getMe: async () => {
    const res = await apiClient.get('/auth/me');
    return res.data;
  },
  logout: async () => {
    const res = await apiClient.post('/auth/logout');
    return res.data;
  },
};

// --- Users API ---
export const userAPI = {
  getUsers: async (params?: any) => {
    const res = await apiClient.get('/users', { params });
    return res.data.data;
  },
  getUser: async (id: string) => {
    const res = await apiClient.get(`/users/${id}`);
    return res.data.data;
  },
  updateUser: async (id: string, data: any) => {
    const res = await apiClient.put(`/users/${id}`, data);
    return res.data.data;
  },
  deleteUser: async (id: string) => {
    const res = await apiClient.delete(`/users/${id}`);
    return res.data;
  },
};

// --- Students API ---
export const studentAPI = {
  getStudents: async (params?: any) => {
    const res = await apiClient.get('/students', { params });
    return res.data.data;
  },
  getStudent: async (id: string) => {
    const res = await apiClient.get(`/students/${id}`);
    return res.data.data;
  },
  createStudent: async (data: any) => {
    const res = await apiClient.post('/students', data);
    return res.data.data;
  },
  updateStudent: async (id: string, data: any) => {
    const res = await apiClient.put(`/students/${id}`, data);
    return res.data.data;
  },
  deleteStudent: async (id: string) => {
    const res = await apiClient.delete(`/students/${id}`);
    return res.data;
  },
};

// --- Menu API ---
export const menuAPI = {
  getMenu: async (params?: any) => {
    const res = await apiClient.get('/menu', { params });
    return res.data.data;
  },
  getMenuItem: async (id: string) => {
    const res = await apiClient.get(`/menu/${id}`);
    return res.data.data;
  },
  createMenuItem: async (data: any) => {
    const res = await apiClient.post('/menu', data);
    return res.data.data;
  },
  updateMenuItem: async (id: string, data: any) => {
    const res = await apiClient.put(`/menu/${id}`, data);
    return res.data.data;
  },
  deleteMenuItem: async (id: string) => {
    const res = await apiClient.delete(`/menu/${id}`);
    return res.data;
  },
};

// --- Attendance API ---
export const attendanceAPI = {
  getAttendance: async (params?: any) => {
    const res = await apiClient.get('/attendance', { params });
    return res.data;
  },
  getTodayAttendance: async (date?: string) => {
    const res = await apiClient.get('/attendance/today', { params: { date } });
    return res.data.data;
  },
  getStudentAttendance: async (studentId: string) => {
    const res = await apiClient.get(`/attendance/student/${studentId}`);
    return res.data;
  },
  getStudentSummary: async (studentId: string) => {
    const res = await apiClient.get(`/attendance/student/${studentId}/summary`);
    return res.data.data;
  },
  getAttendanceReport: async (params?: any) => {
    const res = await apiClient.get('/attendance/report', { params });
    return res.data.data;
  },
  markAttendance: async (data: any) => {
    const res = await apiClient.post('/attendance', data);
    return res.data;
  },
  updateAttendance: async (id: string, data: any) => {
    const res = await apiClient.put(`/attendance/${id}`, data);
    return res.data;
  },
  patchMealAttendance: async (id: string, data: { meal: string; status: boolean }) => {
    const res = await apiClient.patch(`/attendance/${id}/meal`, data);
    return res.data;
  },
  deleteAttendance: async (id: string) => {
    const res = await apiClient.delete(`/attendance/${id}`);
    return res.data;
  },
};

// --- Monthly Mess Billing API (Phase 4) ---
export const billAPI = {
  getBills: async (params?: any) => {
    const res = await apiClient.get('/billing', { params });
    return res.data.data;
  },
  getMyBills: async () => {
    const res = await apiClient.get('/billing/my');
    return res.data.data;
  },
  getBillById: async (id: string) => {
    const res = await apiClient.get(`/billing/${id}`);
    return res.data.data;
  },
  getBillsByMonth: async (year: number, month: number, params?: any) => {
    const res = await apiClient.get(`/billing/month/${year}/${month}`, { params });
    return res.data.data;
  },
  getStudentBills: async (studentId: string) => {
    const res = await apiClient.get(`/billing/student/${studentId}`);
    return res.data;
  },
  generateMonthlyBill: async (data: {
    studentId?: string;
    rollNo?: string;
    month: number;
    year: number;
    generateAll?: boolean;
  }) => {
    const res = await apiClient.post('/billing/generate', data);
    return res.data;
  },
  recalculateBill: async (id: string) => {
    const res = await apiClient.post(`/billing/recalculate/${id}`);
    return res.data;
  },
  updateBillStatus: async (id: string, status: 'PAID' | 'PENDING' | 'Partially Paid' | string) => {
    const res = await apiClient.patch(`/billing/${id}/status`, { status });
    return res.data;
  },
  updateBillAdjustment: async (id: string, data: { adjustment: number; adjustmentReason: string }) => {
    const res = await apiClient.patch(`/billing/${id}/adjustment`, data);
    return res.data;
  },
  getMonthlyReport: async (year: number, month: number) => {
    const res = await apiClient.get('/billing/reports/monthly', { params: { year, month } });
    return res.data.data;
  },
  getMealRates: async () => {
    const res = await apiClient.get('/billing/rates');
    return res.data.data;
  },
  updateMealRates: async (rates: { breakfast: number; lunch: number; snacks: number; dinner: number }) => {
    const res = await apiClient.put('/billing/rates', rates);
    return res.data.data;
  },
  createBill: async (data: any) => {
    const res = await apiClient.post('/billing', data);
    return res.data.data;
  },
  updateBill: async (id: string, data: any) => {
    const res = await apiClient.put(`/billing/${id}`, data);
    return res.data.data;
  },
};

// --- Payments API ---
export const paymentAPI = {
  getPayments: async (params?: any) => {
    const res = await apiClient.get('/payments', { params });
    return res.data.data;
  },
  recordPayment: async (data: any) => {
    const res = await apiClient.post('/payments', data);
    return res.data.data;
  },
};

// --- Inventory API ---
export const inventoryAPI = {
  getInventory: async (params?: any) => {
    const res = await apiClient.get('/inventory', { params });
    return res.data.data;
  },
  createItem: async (data: any) => {
    const res = await apiClient.post('/inventory', data);
    return res.data.data;
  },
  updateItem: async (id: string, data: any) => {
    const res = await apiClient.put(`/inventory/${id}`, data);
    return res.data.data;
  },
  deleteItem: async (id: string) => {
    const res = await apiClient.delete(`/inventory/${id}`);
    return res.data;
  },
};

// --- Complaints API ---
export const complaintAPI = {
  getComplaints: async (params?: any) => {
    const res = await apiClient.get('/complaints', { params });
    return res.data.data;
  },
  getStudentComplaints: async (studentId: string) => {
    const res = await apiClient.get(`/complaints/student/${studentId}`);
    return res.data.data;
  },
  createComplaint: async (data: any) => {
    const res = await apiClient.post('/complaints', data);
    return res.data.data;
  },
  updateComplaint: async (id: string, data: any) => {
    const res = await apiClient.put(`/complaints/${id}`, data);
    return res.data.data;
  },
};

// --- Notices API ---
export const noticeAPI = {
  getNotices: async (params?: any) => {
    const res = await apiClient.get('/notices', { params });
    return res.data.data;
  },
  createNotice: async (data: any) => {
    const res = await apiClient.post('/notices', data);
    return res.data.data;
  },
  updateNotice: async (id: string, data: any) => {
    const res = await apiClient.put(`/notices/${id}`, data);
    return res.data.data;
  },
  deleteNotice: async (id: string) => {
    const res = await apiClient.delete(`/notices/${id}`);
    return res.data;
  },
};

// --- Dashboard API ---
export const dashboardAPI = {
  getAdminDashboard: async () => {
    const res = await apiClient.get('/dashboard/admin');
    return res.data.data;
  },
  getManagerDashboard: async () => {
    const res = await apiClient.get('/dashboard/manager');
    return res.data.data;
  },
  getStudentDashboard: async () => {
    const res = await apiClient.get('/dashboard/student');
    return res.data.data;
  },
};

// --- Settings API ---
export const settingsAPI = {
  getSettings: async () => {
    const res = await apiClient.get('/settings');
    return res.data.data;
  },
  updateSettings: async (data: any) => {
    const res = await apiClient.put('/settings', data);
    return res.data.data;
  },
};
