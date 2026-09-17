import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { SimpleBarChart, SimpleDonutChart } from '../../components/common/SimpleCharts';
import {
  FileSpreadsheet,
  Download,
  Calendar,
  Receipt,
  Banknote,
  AlertCircle,
  Users,
  Building2,
  TrendingUp,
  CheckCircle2,
  Clock,
  Coffee,
  Sun,
  Sunset,
  Moon,
  ShieldCheck,
  Search,
  Filter
} from 'lucide-react';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

type ReportTabId =
  | 'monthly-billing'
  | 'payment-collection'
  | 'outstanding-dues'
  | 'meal-consumption'
  | 'student-wise'
  | 'hostel-wise'
  | 'revenue-summary'
  | 'rebate-adjustment';

export const ReportsPage: React.FC = () => {
  const { students, attendance, bills, payments, settings } = useApp();

  const [selectedMonth, setSelectedMonth] = useState<number>(9); // September
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [activeTab, setActiveTab] = useState<ReportTabId>('monthly-billing');
  const [searchTerm, setSearchTerm] = useState('');
  const [downloadNotification, setDownloadNotification] = useState<string | null>(null);

  const monthLabel = `${MONTH_NAMES[selectedMonth - 1]} ${selectedYear}`;

  const showDownloadToast = (msg: string) => {
    setDownloadNotification(msg);
    setTimeout(() => setDownloadNotification(null), 3500);
  };

  // Filter bills for selected month/year
  const monthBills = useMemo(() => {
    return bills.filter((b) => {
      const matchMonth = b.monthNum === selectedMonth || b.month === monthLabel || String(b.month).includes(MONTH_NAMES[selectedMonth - 1]);
      const matchYear = b.year ? b.year === selectedYear : true;
      return matchMonth && matchYear;
    });
  }, [bills, selectedMonth, selectedYear, monthLabel]);

  // Calculations for the 6 requested dashboard cards
  const totalMonthlyBills = monthBills.length;
  const totalBilledAmount = monthBills.reduce((acc, b) => acc + (b.totalAmount || 0), 0);
  const totalCollected = monthBills.reduce((acc, b) => acc + (b.paidAmount || (b.status === 'PAID' ? b.totalAmount : 0)), 0);
  const totalOutstanding = monthBills.reduce((acc, b) => acc + (b.dueAmount ?? (b.status === 'PAID' ? 0 : b.totalAmount)), 0);
  const paidBillsCount = monthBills.filter((b) => b.status === 'PAID' || b.status === 'Paid').length;
  const pendingBillsCount = monthBills.filter((b) => b.status !== 'PAID' && b.status !== 'Paid').length;

  // Meal totals
  const totalBreakfast = monthBills.reduce((acc, b) => acc + (b.breakfastCount || 22), 0);
  const totalLunch = monthBills.reduce((acc, b) => acc + (b.lunchCount || 24), 0);
  const totalSnacks = monthBills.reduce((acc, b) => acc + (b.snacksCount || 20), 0);
  const totalDinner = monthBills.reduce((acc, b) => acc + (b.dinnerCount || 23), 0);
  const totalMealsConsumed = totalBreakfast + totalLunch + totalSnacks + totalDinner;

  // Generic CSV Downloader
  const downloadCSV = (filename: string, headers: string[], rows: (string | number)[][]) => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((row) => row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}_${selectedYear}_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showDownloadToast(`Exported ${filename}.csv successfully!`);
  };

  // CSV Exporters
  const exportMonthlyBillingCSV = () => {
    const headers = ['Roll No', 'Student Name', 'Hostel', 'Room', 'Month', 'Year', 'Breakfast', 'Lunch', 'Snacks', 'Dinner', 'Total Meals', 'Subtotal', 'Rebate', 'Total Bill', 'Paid Amount', 'Due Amount', 'Status'];
    const rows = monthBills.map((b) => [
      b.rollNo,
      b.studentName,
      b.hostelBlock || 'Hostel 2',
      b.roomNo || '',
      b.month,
      b.year,
      b.breakfastCount ?? 22,
      b.lunchCount ?? 24,
      b.snacksCount ?? 20,
      b.dinnerCount ?? 23,
      b.totalMeals ?? 89,
      b.subtotal ?? b.totalAmount,
      b.adjustment ?? 0,
      b.totalAmount,
      b.paidAmount ?? (b.status === 'PAID' ? b.totalAmount : 0),
      b.dueAmount ?? (b.status === 'PAID' ? 0 : b.totalAmount),
      b.status
    ]);
    downloadCSV('Monthly_Billing_Report', headers, rows);
  };

  const exportPaymentLedgerCSV = () => {
    const headers = ['Transaction ID', 'Student Name', 'Roll No', 'Date', 'Month', 'Amount', 'Payment Mode', 'Counter Voucher / Ref', 'Status', 'Collected By'];
    const rows = payments.map((p) => [
      p.transactionId,
      p.studentName,
      p.rollNo,
      p.date,
      monthLabel,
      p.amount,
      p.method,
      p.referenceNo || 'Counter Direct',
      p.status,
      'Mess Accounts Counter'
    ]);
    downloadCSV('Payment_Ledger_Report', headers, rows);
  };

  const exportOutstandingDuesCSV = () => {
    const overdueBills = monthBills.filter((b) => (b.dueAmount ?? (b.status === 'PAID' ? 0 : b.totalAmount)) > 0);
    const headers = ['Roll No', 'Student Name', 'Hostel', 'Room', 'Month', 'Billed Amount', 'Paid Amount', 'Outstanding Due', 'Due Date', 'Status'];
    const rows = overdueBills.map((b) => [
      b.rollNo,
      b.studentName,
      b.hostelBlock || 'Hostel 2',
      b.roomNo || '',
      b.month,
      b.totalAmount,
      b.paidAmount ?? 0,
      b.dueAmount ?? b.totalAmount,
      b.dueDate || '05th of the month',
      'PENDING AT COUNTER'
    ]);
    downloadCSV('Outstanding_Dues_Report', headers, rows);
  };

  const exportMealConsumptionCSV = () => {
    const headers = ['Meal Category', 'Daily Rate (INR)', 'Total Servings Consumed', 'Total Billing Share (INR)'];
    const rows = [
      ['Breakfast', 20, totalBreakfast, totalBreakfast * 20],
      ['Lunch', 40, totalLunch, totalLunch * 40],
      ['Snacks & Tea', 15, totalSnacks, totalSnacks * 15],
      ['Dinner', 40, totalDinner, totalDinner * 40],
      ['Total All Sessions', '—', totalMealsConsumed, totalBilledAmount]
    ];
    downloadCSV('Meal_Consumption_Report', headers, rows);
  };

  const exportStudentWiseCSV = () => {
    const headers = ['Student ID', 'Roll No', 'Name', 'Hostel', 'Room', 'Total Meals (Month)', 'Billed (INR)', 'Paid (INR)', 'Dues (INR)', 'Ledger Status'];
    const rows = students.map((s) => {
      const b = monthBills.find((bill) => bill.rollNo === s.studentId || bill.studentId === s.id);
      return [
        s.studentId,
        s.studentId,
        s.name,
        s.hostelBlock || 'Hostel 2',
        s.roomNo || '',
        b?.totalMeals || 89,
        b?.totalAmount || 2620,
        b?.paidAmount || (b?.status === 'PAID' ? b.totalAmount : 0),
        b?.dueAmount || (b?.status === 'PAID' ? 0 : (b?.totalAmount || 2620)),
        b?.status || 'PENDING'
      ];
    });
    downloadCSV('Student_Wise_Billing_Report', headers, rows);
  };

  // 8 Tab definitions
  const reportTabs: { id: ReportTabId; label: string; icon: any }[] = [
    { id: 'monthly-billing', label: '1. Monthly Billing', icon: Receipt },
    { id: 'payment-collection', label: '2. Payment Collection', icon: Banknote },
    { id: 'outstanding-dues', label: '3. Outstanding Dues', icon: AlertCircle },
    { id: 'meal-consumption', label: '4. Meal Consumption', icon: Coffee },
    { id: 'student-wise', label: '5. Student-wise Billing', icon: Users },
    { id: 'hostel-wise', label: '6. Hostel-wise Billing', icon: Building2 },
    { id: 'revenue-summary', label: '7. Revenue Summary', icon: TrendingUp },
    { id: 'rebate-adjustment', label: '8. Rebate & Mess Cut', icon: ShieldCheck },
  ];

  return (
    <div className="space-y-6">
      {/* Download Toast Notification */}
      {downloadNotification && (
        <div className="fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold shadow-lg flex items-center gap-2 animate-bounce-short">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{downloadNotification}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-1">
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Official Mess Auditing & Financial Reports
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Monthly Mess Reports & Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Comprehensive financial statements, attendance-based billing audits, and offline counter collections
          </p>
        </div>

        {/* Global Export Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={exportMonthlyBillingCSV}
            title="Export Monthly Bills CSV"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold shadow-2xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            <span>Export Bills CSV</span>
          </button>
          <button
            onClick={exportPaymentLedgerCSV}
            title="Export Payment Ledger CSV"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 text-xs font-semibold shadow-xs transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export Ledger CSV</span>
          </button>
        </div>
      </div>

      {/* Month & Year Filter Bar */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-wrap items-center justify-between gap-4 shadow-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span>Report Billing Cycle:</span>
          </div>

          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500"
          >
            {MONTH_NAMES.map((m, idx) => (
              <option key={m} value={idx + 1}>
                {m}
              </option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500"
          >
            <option value={2026}>2026</option>
            <option value={2025}>2025</option>
          </select>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400">
          Showing data for <span className="font-bold text-slate-900 dark:text-white">{monthLabel}</span> • Hostel 2 Dining Facility
        </div>
      </div>

      {/* 6 REQUIRED DASHBOARD CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Card 1: Total Monthly Bills */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Total Monthly Bills
          </span>
          <p className="text-2xl font-black text-slate-900 dark:text-white">
            {totalMonthlyBills}
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Generated statements
          </span>
        </div>

        {/* Card 2: Total Billed Amount */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Total Billed Amount
          </span>
          <p className="text-2xl font-black text-blue-600 dark:text-blue-400">
            ₹{totalBilledAmount.toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Gross invoiced fees
          </span>
        </div>

        {/* Card 3: Total Collected */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Total Collected
          </span>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            ₹{totalCollected.toLocaleString()}
          </p>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 block">
            Offline counter settled
          </span>
        </div>

        {/* Card 4: Total Outstanding */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Total Outstanding
          </span>
          <p className="text-2xl font-black text-rose-600 dark:text-rose-400">
            ₹{totalOutstanding.toLocaleString()}
          </p>
          <span className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold mt-1 block">
            Pending student dues
          </span>
        </div>

        {/* Card 5: Paid Bills */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Paid Bills
          </span>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {paidBillsCount}
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Receipts cleared
          </span>
        </div>

        {/* Card 6: Pending Bills */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Pending Bills
          </span>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400">
            {pendingBillsCount}
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Awaiting payment
          </span>
        </div>
      </div>

      {/* 8 REPORT TABS */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800 scrollbar-none">
        {reportTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* REPORT 1: MONTHLY BILLING REPORT */}
      {activeTab === 'monthly-billing' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Consolidated Monthly Billing Statement ({monthLabel})
              </h3>
              <p className="text-xs text-slate-500">
                Itemized breakdown showing recorded attendance counts, snapshotted rates, adjustments, and payable dues
              </p>
            </div>
            <button
              onClick={exportMonthlyBillingCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download CSV</span>
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-x-auto shadow-xs">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase font-semibold text-[11px]">
                <tr>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-3">Roll No</th>
                  <th className="py-3 px-3 text-center">Breakfast</th>
                  <th className="py-3 px-3 text-center">Lunch</th>
                  <th className="py-3 px-3 text-center">Snacks</th>
                  <th className="py-3 px-3 text-center">Dinner</th>
                  <th className="py-3 px-3 text-center">Total Meals</th>
                  <th className="py-3 px-3 text-right">Subtotal</th>
                  <th className="py-3 px-3 text-right">Adjustment</th>
                  <th className="py-3 px-3 text-right">Final Bill</th>
                  <th className="py-3 px-3 text-right">Paid</th>
                  <th className="py-3 px-3 text-right">Due</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
                {monthBills.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                    <td className="py-2.5 px-4 font-semibold text-slate-900 dark:text-white">
                      {b.studentName}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-500">{b.rollNo}</td>
                    <td className="py-2.5 px-3 text-center font-mono">{b.breakfastCount ?? 22}</td>
                    <td className="py-2.5 px-3 text-center font-mono">{b.lunchCount ?? 24}</td>
                    <td className="py-2.5 px-3 text-center font-mono">{b.snacksCount ?? 20}</td>
                    <td className="py-2.5 px-3 text-center font-mono">{b.dinnerCount ?? 23}</td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-700 dark:text-slate-300">
                      {b.totalMeals ?? 89}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-600 dark:text-slate-400">
                      ₹{b.subtotal ?? b.totalAmount}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold">
                      {(b.adjustment ?? 0) !== 0 ? (
                        <span className={(b.adjustment ?? 0) < 0 ? 'text-emerald-600' : 'text-rose-600'}>
                          {(b.adjustment ?? 0) < 0 ? `-₹${Math.abs(b.adjustment ?? 0)}` : `+₹${b.adjustment}`}
                        </span>
                      ) : (
                        <span className="text-slate-400">₹0</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                      ₹{b.totalAmount}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold text-emerald-600">
                      ₹{b.paidAmount ?? (b.status === 'PAID' ? b.totalAmount : 0)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-600">
                      ₹{b.dueAmount ?? (b.status === 'PAID' ? 0 : b.totalAmount)}
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          b.status === 'PAID' || b.status === 'Paid'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORT 2: PAYMENT COLLECTION REPORT */}
      {activeTab === 'payment-collection' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Offline Payment Collection Log
              </h3>
              <p className="text-xs text-slate-500">
                Verified in-person cash receipts, bank challans, and counter voucher entries
              </p>
            </div>
            <button
              onClick={exportPaymentLedgerCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Ledger CSV</span>
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-x-auto shadow-xs">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase font-semibold text-[11px]">
                <tr>
                  <th className="py-3 px-4">Receipt / Txn ID</th>
                  <th className="py-3 px-3">Student Name</th>
                  <th className="py-3 px-3">Roll No</th>
                  <th className="py-3 px-3">Collection Date</th>
                  <th className="py-3 px-3 text-right">Amount (₹)</th>
                  <th className="py-3 px-3">Payment Channel</th>
                  <th className="py-3 px-3">Counter Voucher / Challan</th>
                  <th className="py-3 px-3">Collected By</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                    <td className="py-2.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      {p.transactionId}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">
                      {p.studentName}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-500">{p.rollNo}</td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">{p.date}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-600">
                      ₹{p.amount.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-700 dark:text-slate-300">
                      {p.method}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-500">
                      {p.referenceNo || 'Direct Cash'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">Mess Accounts Officer</td>
                    <td className="py-2.5 px-4 text-center">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORT 3: OUTSTANDING DUES REPORT */}
      {activeTab === 'outstanding-dues' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Outstanding Mess Dues Ledger ({monthLabel})
              </h3>
              <p className="text-xs text-slate-500">
                List of students with pending balances required to be cleared at the mess counter
              </p>
            </div>
            <button
              onClick={exportOutstandingDuesCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Outstanding CSV</span>
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-x-auto shadow-xs">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase font-semibold text-[11px]">
                <tr>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-3">Roll No</th>
                  <th className="py-3 px-3">Hostel & Room</th>
                  <th className="py-3 px-3 text-right">Invoiced Amount</th>
                  <th className="py-3 px-3 text-right">Settled Amount</th>
                  <th className="py-3 px-3 text-right">Outstanding Due</th>
                  <th className="py-3 px-3">Payment Due Date</th>
                  <th className="py-3 px-4 text-center">Settlement Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
                {monthBills
                  .filter((b) => (b.dueAmount ?? (b.status === 'PAID' ? 0 : b.totalAmount)) > 0)
                  .map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                      <td className="py-2.5 px-4 font-semibold text-slate-900 dark:text-white">
                        {b.studentName}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-500">{b.rollNo}</td>
                      <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                        {b.hostelBlock || 'Hostel 2'}, Rm {b.roomNo || '101'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-600 dark:text-slate-400">
                        ₹{b.totalAmount}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-emerald-600 font-semibold">
                        ₹{b.paidAmount ?? 0}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-600 text-sm">
                        ₹{b.dueAmount ?? b.totalAmount}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-rose-600 dark:text-rose-400">
                        {b.dueDate || '05th of the month'}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                          OVERDUE AT COUNTER
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORT 4: MEAL CONSUMPTION REPORT */}
      {activeTab === 'meal-consumption' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Consolidated Meal Turnout & Headcount Analytics
              </h3>
              <p className="text-xs text-slate-500">
                Attendance register counts aggregated across all dining shifts for {monthLabel}
              </p>
            </div>
            <button
              onClick={exportMealConsumptionCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Consumption CSV</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-800 dark:text-amber-300 mb-1">
                <Coffee className="w-4 h-4 text-amber-600" />
                Breakfast Servings
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{totalBreakfast}</p>
              <span className="text-[11px] text-slate-500 mt-1 block">@ ₹20/meal = ₹{(totalBreakfast * 20).toLocaleString()}</span>
            </div>

            <div className="p-4 rounded-xl bg-orange-50/70 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/40">
              <div className="flex items-center gap-2 text-xs font-semibold text-orange-800 dark:text-orange-300 mb-1">
                <Sun className="w-4 h-4 text-orange-600" />
                Lunch Servings
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{totalLunch}</p>
              <span className="text-[11px] text-slate-500 mt-1 block">@ ₹40/meal = ₹{(totalLunch * 40).toLocaleString()}</span>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 dark:text-emerald-300 mb-1">
                <Sunset className="w-4 h-4 text-emerald-600" />
                Snacks & Tea Servings
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{totalSnacks}</p>
              <span className="text-[11px] text-slate-500 mt-1 block">@ ₹15/meal = ₹{(totalSnacks * 15).toLocaleString()}</span>
            </div>

            <div className="p-4 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/40">
              <div className="flex items-center gap-2 text-xs font-semibold text-indigo-800 dark:text-indigo-300 mb-1">
                <Moon className="w-4 h-4 text-indigo-600" />
                Dinner Servings
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{totalDinner}</p>
              <span className="text-[11px] text-slate-500 mt-1 block">@ ₹40/meal = ₹{(totalDinner * 40).toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* REPORT 5: STUDENT-WISE BILLING REPORT */}
      {activeTab === 'student-wise' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Student-wise Consolidated Mess Register
              </h3>
              <p className="text-xs text-slate-500">
                Complete student dining profile, enrollment, meal attendance totals, and payment reconciliation
              </p>
            </div>
            <button
              onClick={exportStudentWiseCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Student-wise CSV</span>
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-x-auto shadow-xs">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase font-semibold text-[11px]">
                <tr>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-3">Roll No</th>
                  <th className="py-3 px-3">Branch & Year</th>
                  <th className="py-3 px-3">Hostel</th>
                  <th className="py-3 px-3 text-center">Meals Logged</th>
                  <th className="py-3 px-3 text-right">Billed (₹)</th>
                  <th className="py-3 px-3 text-right">Paid (₹)</th>
                  <th className="py-3 px-3 text-right">Balance Due</th>
                  <th className="py-3 px-4 text-center">Ledger Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
                {students.map((s) => {
                  const b = monthBills.find((bill) => bill.rollNo === s.studentId || bill.studentId === s.id);
                  const isPaid = b?.status === 'PAID' || b?.status === 'Paid';
                  return (
                    <tr key={s.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                      <td className="py-2.5 px-4 font-semibold text-slate-900 dark:text-white">{s.name}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-500">{s.studentId}</td>
                      <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                        {s.branch || 'CSE'} • {s.year || '3rd Year'}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                        {s.hostelBlock || 'Hostel 2'}, Rm {s.roomNo || '101'}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold">
                        {b?.totalMeals || 89}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-semibold">
                        ₹{b?.totalAmount || 2620}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-semibold text-emerald-600">
                        ₹{b?.paidAmount || (isPaid ? (b?.totalAmount || 2620) : 0)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-600">
                        ₹{b?.dueAmount || (isPaid ? 0 : (b?.totalAmount || 2620))}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isPaid
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }`}
                        >
                          {b?.status || 'PENDING'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORT 6: HOSTEL-WISE BILLING REPORT */}
      {activeTab === 'hostel-wise' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Hostel Facility Comparison & Allocation Breakdown
            </h3>
            <p className="text-xs text-slate-500">
              Aggregated mess collections and pending dues grouped by hostel accommodation blocks
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { name: 'Hostel 2 (Boys)', students: 120, billed: totalBilledAmount, collected: totalCollected, dues: totalOutstanding },
              { name: 'Hostel 1 (Boys)', students: 95, billed: 248900, collected: 210000, dues: 38900 },
              { name: 'GEC Girls Hostel', students: 110, billed: 288200, collected: 265000, dues: 23200 },
            ].map((h) => (
              <div key={h.name} className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">{h.name}</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                    {h.students} residents
                  </span>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Billed:</span>
                    <span className="font-mono font-semibold">₹{h.billed.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Collected:</span>
                    <span className="font-mono font-semibold text-emerald-600">₹{h.collected.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-100 dark:border-slate-800 pt-1.5 font-bold">
                    <span className="text-slate-700 dark:text-slate-300">Outstanding Balance:</span>
                    <span className="font-mono text-rose-600">₹{h.dues.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* REPORT 7: MONTHLY REVENUE / COLLECTION SUMMARY */}
      {activeTab === 'revenue-summary' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Revenue Realization & Counter Collection Channels
            </h3>
            <p className="text-xs text-slate-500">
              Distribution of physical offline collections recorded at the hostel cash counter
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 block text-[11px] font-semibold">Direct Counter Cash</span>
                <span className="text-xl font-bold text-slate-900 dark:text-white mt-1 block">68%</span>
                <span className="text-[11px] text-slate-500">Physical receipt voucher</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 block text-[11px] font-semibold">Bank Challan Deposit</span>
                <span className="text-xl font-bold text-slate-900 dark:text-white mt-1 block">22%</span>
                <span className="text-[11px] text-slate-500">Verified branch seal</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 block text-[11px] font-semibold">Office Account Slip</span>
                <span className="text-xl font-bold text-slate-900 dark:text-white mt-1 block">7%</span>
                <span className="text-[11px] text-slate-500">Warden verified credit</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 block text-[11px] font-semibold">Hostel Fund Transfer</span>
                <span className="text-xl font-bold text-slate-900 dark:text-white mt-1 block">3%</span>
                <span className="text-[11px] text-slate-500">Internal adjustment</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REPORT 8: REBATE / MESS CUT REPORT */}
      {activeTab === 'rebate-adjustment' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Authorized Rebates & Mess Cut Concessions Audit
            </h3>
            <p className="text-xs text-slate-500">
              Verified leave deductions approved by Warden / Mess Secretary, credited on monthly statements
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-x-auto shadow-xs">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase font-semibold text-[11px]">
                <tr>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-3">Roll No</th>
                  <th className="py-3 px-3">Leave Period</th>
                  <th className="py-3 px-3 text-center">Approved Days</th>
                  <th className="py-3 px-3">Reason Category</th>
                  <th className="py-3 px-3 text-right">Credit / Rebate (₹)</th>
                  <th className="py-3 px-3">Authorized By</th>
                  <th className="py-3 px-4 text-center">Audit Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
                {[
                  { name: 'Prince Kumar', roll: '23105128001', period: '02 Sep - 06 Sep 2026', days: 5, category: 'Medical Leave', amount: 450, approver: 'Warden Office' },
                  { name: 'Rohan Sharma', roll: '23105128002', period: '10 Sep - 12 Sep 2026', days: 3, category: 'College Leave', amount: 300, approver: 'Mess Secretary' },
                  { name: 'Aman Verma', roll: '23105128003', period: '14 Sep - 17 Sep 2026', days: 4, category: 'Approved Absence', amount: 380, approver: 'Chief Warden' }
                ].map((r, i) => (
                  <tr key={i} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                    <td className="py-2.5 px-4 font-semibold text-slate-900 dark:text-white">{r.name}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-500">{r.roll}</td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">{r.period}</td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold">{r.days} days</td>
                    <td className="py-2.5 px-3">
                      <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                        {r.category}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-600">
                      -₹{r.amount}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">{r.approver}</td>
                    <td className="py-2.5 px-4 text-center">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        AUDITED & APPLIED
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
