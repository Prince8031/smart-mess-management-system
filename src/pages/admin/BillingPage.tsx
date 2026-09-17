import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { BillRecord, MealRates } from '../../types';
import { DataTable, Column } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { FormInput } from '../../components/common/FormInput';
import { Select } from '../../components/common/Select';
import { MonthlyBillPDFModal } from '../../components/billing/MonthlyBillPDFModal';
import { billAPI } from '../../services/api';
import {
  Receipt,
  PlusCircle,
  CheckCircle2,
  Clock,
  RotateCcw,
  Sliders,
  Download,
  Printer,
  Calendar,
  DollarSign,
  TrendingUp,
  Building,
  Coffee,
  Sun,
  Sunset,
  Moon,
  AlertCircle,
  FileSpreadsheet,
  Check,
  Search,
  Filter,
  Banknote,
  ShieldCheck
} from 'lucide-react';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const BillingPage: React.FC = () => {
  const {
    bills,
    students,
    settings,
    currentUser,
    isBackendConnected,
    markBillStatus,
    recalculateBill,
    updateBillAdjustment,
    generateMonthlyBill,
    recordPayment,
    refreshBills
  } = useApp();

  const [activeTab, setActiveTab] = useState<'bills' | 'rates'>('bills');
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedMonth, setSelectedMonth] = useState<number>(9); // September

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHostel, setSelectedHostel] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

  // Modals state
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [generateMode, setGenerateMode] = useState<'all' | 'single'>('all');
  const [targetStudentId, setTargetStudentId] = useState<string>(students[0]?.id || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationFeedback, setGenerationFeedback] = useState<string | null>(null);

  // View PDF / Print Modal
  const [selectedBillForPDF, setSelectedBillForPDF] = useState<BillRecord | null>(null);

  // Offline Payment Modal state
  const [selectedBillForPayment, setSelectedBillForPayment] = useState<BillRecord | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentDate, setPaymentDate] = useState<string>('2026-09-16');
  const [receiptNumber, setReceiptNumber] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'Counter Cash' | 'Cash' | 'Bank Challan' | 'Office Deposit'>('Counter Cash');
  const [collectedBy, setCollectedBy] = useState<string>('Mess Accounts Desk');
  const [paymentRemarks, setPaymentRemarks] = useState<string>('');
  const [isSavingPayment, setIsSavingPayment] = useState<boolean>(false);

  // Rebate / Mess Cut Modal state
  const [selectedBillForRebate, setSelectedBillForRebate] = useState<BillRecord | null>(null);
  const [rebateStartDate, setRebateStartDate] = useState<string>('2026-09-02');
  const [rebateEndDate, setRebateEndDate] = useState<string>('2026-09-06');
  const [rebateDays, setRebateDays] = useState<number>(5);
  const [rebateCategory, setRebateCategory] = useState<'Medical Leave' | 'College Leave' | 'Hostel Leave' | 'Approved Absence' | 'Other'>('Medical Leave');
  const [rebateReason, setRebateReason] = useState<string>('');
  const [rebateDeductionAmount, setRebateDeductionAmount] = useState<number>(450);
  const [isSavingRebate, setIsSavingRebate] = useState<boolean>(false);

  // Meal rates state
  const [mealRates, setMealRates] = useState<MealRates>({
    breakfast: 20,
    lunch: 40,
    snacks: 15,
    dinner: 40
  });
  const [isUpdatingRates, setIsUpdatingRates] = useState(false);
  const [ratesSuccessMsg, setRatesSuccessMsg] = useState(false);

  // Status message toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load rates from backend if connected
  useEffect(() => {
    const loadRates = async () => {
      if (isBackendConnected) {
        try {
          const rates = await billAPI.getMealRates();
          if (rates) setMealRates(rates);
        } catch {
          // fallback
        }
      }
    };
    loadRates();
  }, [isBackendConnected]);

  // Handle bill generation
  const handleGenerateBills = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setGenerationFeedback(null);

    try {
      if (generateMode === 'all') {
        await generateMonthlyBill({
          month: selectedMonth,
          year: selectedYear,
          generateAll: true
        });
        showToast(`Successfully generated monthly bills for active students (${selectedMonth}/${selectedYear})!`);
      } else {
        const student = students.find((s) => s.id === targetStudentId) || students[0];
        await generateMonthlyBill({
          studentId: student.id,
          rollNo: student.studentId,
          month: selectedMonth,
          year: selectedYear,
          generateAll: false
        });
        showToast(`Successfully generated monthly bill for ${student.name}!`);
      }
      setIsGenerateModalOpen(false);
    } catch (err: any) {
      setGenerationFeedback(err.message || 'Failed to generate monthly bill. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle Recalculate
  const handleRecalculate = async (billId: string) => {
    try {
      await recalculateBill(billId);
      showToast('Bill recalculated successfully based on verified attendance records!');
    } catch {
      showToast('Error recalculating bill.');
    }
  };

  // Handle Offline Payment Confirmation
  const handleConfirmOfflinePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBillForPayment) return;
    setIsSavingPayment(true);

    try {
      const bill = selectedBillForPayment;
      const amt = Number(paymentAmount);
      const isFullPayment = amt >= (bill.dueAmount || bill.totalAmount);
      const newStatus: 'PAID' | 'Partially Paid' = isFullPayment ? 'PAID' : 'Partially Paid';

      // Update bill status and dues in context/backend
      await markBillStatus(bill.id, newStatus);

      // Record in offline payment ledger
      recordPayment({
        studentId: bill.studentId,
        studentName: bill.studentName,
        rollNo: bill.rollNo,
        billId: bill.id,
        amount: amt,
        method: paymentMethod,
        status: 'Completed',
        referenceNo: receiptNumber || `CTR-${Date.now().toString().slice(-6)}`
      });

      showToast(`Offline payment of ₹${amt.toLocaleString()} recorded for ${bill.studentName}. Status: ${newStatus}`);
      setSelectedBillForPayment(null);
    } catch {
      showToast('Failed to record payment.');
    } finally {
      setIsSavingPayment(false);
    }
  };

  // Handle Rebate / Mess Cut Save
  const handleSaveRebate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBillForRebate) return;
    setIsSavingRebate(true);

    try {
      const deduction = -Math.abs(Number(rebateDeductionAmount));
      const reasonText = `${rebateCategory} (${rebateStartDate} to ${rebateEndDate}, ${rebateDays} days): ${rebateReason || 'Approved Leave'}`;

      await updateBillAdjustment(
        selectedBillForRebate.id,
        deduction,
        reasonText
      );

      showToast(`Rebate of ₹${Math.abs(deduction)} applied to ${selectedBillForRebate.studentName}'s monthly bill.`);
      setSelectedBillForRebate(null);
    } catch {
      showToast('Failed to apply rebate.');
    } finally {
      setIsSavingRebate(false);
    }
  };

  // Handle Meal Rates Update
  const handleSaveRates = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingRates(true);
    try {
      if (isBackendConnected) {
        await billAPI.updateMealRates(mealRates);
      }
      setRatesSuccessMsg(true);
      showToast('Meal rates updated successfully! New rates will apply to upcoming bills.');
      setTimeout(() => setRatesSuccessMsg(false), 3000);
    } catch {
      showToast('Failed to save meal rates.');
    } finally {
      setIsUpdatingRates(false);
    }
  };

  // Export CSV Handler
  const handleExportCSV = () => {
    const monthName = `${MONTH_NAMES[selectedMonth - 1]} ${selectedYear}`;
    const relevant = bills.filter(
      (b) => (b.monthNum === selectedMonth && b.year === selectedYear) || b.month === monthName
    );

    const headers = [
      'Roll No',
      'Student Name',
      'Hostel',
      'Room',
      'Month',
      'Year',
      'Breakfast Count',
      'Lunch Count',
      'Snacks Count',
      'Dinner Count',
      'Total Meals',
      'Subtotal',
      'Rebate / Adjustment',
      'Reason',
      'Final Monthly Bill',
      'Paid Amount',
      'Outstanding Due',
      'Payment Status',
      'Payment Mode'
    ];

    const rows = relevant.map((b) => [
      b.rollNo,
      `"${b.studentName}"`,
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
      `"${b.adjustmentReason || ''}"`,
      b.totalAmount,
      b.paidAmount ?? (b.status === 'PAID' ? b.totalAmount : 0),
      b.dueAmount ?? (b.status === 'PAID' ? 0 : b.totalAmount),
      b.status,
      'OFFLINE COUNTER'
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Hostel2_Monthly_Bills_${selectedYear}_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Downloaded billing CSV report successfully!');
  };

  // Filter bills by month/year, search term, hostel, and payment status
  const filteredBills = useMemo(() => {
    const mStr = `${MONTH_NAMES[selectedMonth - 1]} ${selectedYear}`;
    return bills.filter((b) => {
      const matchMonth = (b.monthNum === selectedMonth && b.year === selectedYear) || b.month === mStr || !b.monthNum;
      if (!matchMonth) return false;

      // Hostel filter
      if (selectedHostel !== 'All') {
        const block = b.hostelBlock || 'Hostel 2';
        if (!block.includes(selectedHostel)) return false;
      }

      // Status filter
      if (selectedStatus !== 'All') {
        const isPaid = b.status === 'PAID' || b.status === 'Paid';
        if (selectedStatus === 'PAID' && !isPaid) return false;
        if (selectedStatus === 'PENDING' && isPaid) return false;
        if (selectedStatus === 'PARTIAL' && b.status !== 'Partially Paid') return false;
      }

      // Search term
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchName = b.studentName?.toLowerCase().includes(term);
        const matchRoll = b.rollNo?.toLowerCase().includes(term);
        const matchRoom = b.roomNo?.toLowerCase().includes(term);
        if (!matchName && !matchRoll && !matchRoom) return false;
      }

      return true;
    });
  }, [bills, selectedMonth, selectedYear, selectedHostel, selectedStatus, searchTerm]);

  // Table Columns definition
  const columns: Column<BillRecord>[] = [
    {
      header: 'Student & Hostel',
      accessor: 'studentName',
      render: (row) => (
        <div>
          <span className="font-semibold text-slate-900 dark:text-white block text-xs">
            {row.studentName}
          </span>
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-400">
            <span>{row.rollNo}</span>
            <span>• {row.hostelBlock || 'Hostel 2'}, Rm {row.roomNo || '101'}</span>
          </div>
        </div>
      )
    },
    {
      header: 'Month',
      accessor: 'month',
      render: (row) => (
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          {row.month}
        </span>
      )
    },
    {
      header: 'Meals Breakdown',
      accessor: 'totalMeals',
      render: (row) => {
        const bf = row.breakfastCount ?? 22;
        const lu = row.lunchCount ?? 24;
        const sn = row.snacksCount ?? 20;
        const di = row.dinnerCount ?? 23;
        return (
          <div>
            <span className="font-bold text-xs text-slate-900 dark:text-white">
              {row.totalMeals ?? (bf + lu + sn + di)} meals
            </span>
            <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5 font-medium">
              <span title="Breakfast">{bf}B</span>•
              <span title="Lunch">{lu}L</span>•
              <span title="Snacks">{sn}S</span>•
              <span title="Dinner">{di}D</span>
            </div>
          </div>
        );
      }
    },
    {
      header: 'Subtotal & Rebate',
      render: (row) => {
        const sub = row.subtotal ?? row.totalAmount;
        const adj = row.adjustment ?? 0;
        return (
          <div className="text-xs">
            <span className="font-medium text-slate-700 dark:text-slate-300 font-mono">₹{sub}</span>
            {adj !== 0 ? (
              <span className={`block font-semibold text-[10px] font-mono ${adj < 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {adj < 0 ? `-₹${Math.abs(adj)} Rebate` : `+₹${adj} Adj`}
              </span>
            ) : (
              <span className="block text-[10px] text-slate-400">No rebate</span>
            )}
          </div>
        );
      }
    },
    {
      header: 'Final Bill',
      accessor: 'totalAmount',
      render: (row) => (
        <span className="font-bold text-xs font-mono text-slate-900 dark:text-white">
          ₹{row.totalAmount.toLocaleString()}
        </span>
      )
    },
    {
      header: 'Paid / Due',
      render: (row) => {
        const isPaid = row.status === 'PAID' || row.status === 'Paid';
        const paid = row.paidAmount ?? (isPaid ? row.totalAmount : 0);
        const due = row.dueAmount ?? (isPaid ? 0 : row.totalAmount);
        return (
          <div className="text-xs font-mono">
            <span className="text-emerald-600 font-semibold block">₹{paid} paid</span>
            <span className={`text-[11px] font-bold ${due > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
              ₹{due} due
            </span>
          </div>
        );
      }
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => {
        const isPaid = row.status === 'PAID' || row.status === 'Paid';
        return <StatusBadge status={isPaid ? 'PAID' : 'PENDING'} size="sm" />;
      }
    },
    {
      header: 'Actions',
      className: 'text-right',
      render: (row) => {
        const isPaid = row.status === 'PAID' || row.status === 'Paid';
        return (
          <div className="flex items-center justify-end gap-1">
            {/* Record Offline Payment Button */}
            <button
              onClick={() => {
                setSelectedBillForPayment(row);
                setPaymentAmount(row.dueAmount ?? (isPaid ? 0 : row.totalAmount));
                setReceiptNumber(`REC-${Date.now().toString().slice(-6)}`);
              }}
              title="Record Offline Counter Payment"
              className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 transition-colors"
            >
              <Banknote className="w-3 h-3" />
              <span>Record Pay</span>
            </button>

            {/* Apply Rebate / Mess Cut */}
            <button
              onClick={() => {
                setSelectedBillForRebate(row);
                setRebateDeductionAmount(450);
                setRebateReason('');
              }}
              title="Apply Rebate / Mess Cut"
              className="p-1.5 rounded-md text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
            </button>

            {/* Recalculate Attendance */}
            <button
              onClick={() => handleRecalculate(row.id)}
              title="Recalculate bill from verified attendance"
              className="p-1.5 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* View Statement & Print PDF */}
            <button
              onClick={() => setSelectedBillForPDF(row)}
              title="Print Monthly Bill Statement (A4 PDF)"
              className="p-1.5 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      }
    }
  ];

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold shadow-lg flex items-center gap-2 animate-bounce-short">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-1">
            <Receipt className="w-3.5 h-3.5" />
            Monthly Dining Invoicing System
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Hostel Monthly Billing
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Attendance-driven monthly dining statements, snapshotted rates, rebate cuts, and offline counter settlement
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Bills CSV</span>
          </button>

          <button
            onClick={() => {
              setGenerationFeedback(null);
              setIsGenerateModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Generate Monthly Bills</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('bills')}
          className={`pb-2.5 px-3 border-b-2 transition-colors ${
            activeTab === 'bills'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          Monthly Invoices
        </button>
        <button
          onClick={() => setActiveTab('rates')}
          className={`pb-2.5 px-3 border-b-2 transition-colors ${
            activeTab === 'rates'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          Meal Rates Configuration
        </button>
      </div>

      {/* SEARCH & FILTERS BAR */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search student, roll no, room..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
            />
          </div>

          {/* Month & Year Selectors */}
          <div className="flex items-center gap-2">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="w-1/2 px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold text-slate-800 dark:text-slate-200"
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
              className="w-1/2 px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold text-slate-800 dark:text-slate-200"
            >
              <option value={2026}>2026</option>
              <option value={2025}>2025</option>
            </select>
          </div>

          {/* Hostel Filter */}
          <div>
            <select
              value={selectedHostel}
              onChange={(e) => setSelectedHostel(e.target.value)}
              className="w-full px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold text-slate-800 dark:text-slate-200"
            >
              <option value="All">All Hostels</option>
              <option value="Hostel 2">Hostel 2 (Boys)</option>
              <option value="Block A">Hostel 1 (Block A)</option>
              <option value="Girls">Girls Hostel Block</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold text-slate-800 dark:text-slate-200"
            >
              <option value="All">All Payment Statuses</option>
              <option value="PENDING">PENDING (Unpaid)</option>
              <option value="PARTIAL">PARTIALLY PAID</option>
              <option value="PAID">PAID (Settled)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-500">
          <span>
            Showing <strong className="text-slate-900 dark:text-white">{filteredBills.length}</strong> monthly statements
          </span>
          <span className="font-semibold text-blue-600 dark:text-blue-400">
            Billing Period: {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
          </span>
        </div>
      </div>

      {/* TAB 1: MONTHLY INVOICES TABLE */}
      {activeTab === 'bills' && (
        <DataTable
          columns={columns}
          data={filteredBills}
          keyExtractor={(item) => item.id}
          searchPlaceholder="Filter current table..."
          searchKeys={['studentName', 'rollNo', 'month', 'status']}
          itemsPerPage={10}
        />
      )}

      {/* TAB 2: MEAL RATES CONFIGURATION */}
      {activeTab === 'rates' && (
        <div className="max-w-2xl bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6 shadow-xs">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Default Meal Unit Rates (₹)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              These unit rates are locked and snapshotted onto monthly bills at the moment bills are generated.
            </p>
          </div>

          {ratesSuccessMsg && (
            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Meal rates successfully saved.</span>
            </div>
          )}

          <form onSubmit={handleSaveRates} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="Breakfast Rate (₹)"
                type="number"
                value={mealRates.breakfast}
                onChange={(e) => setMealRates({ ...mealRates, breakfast: Number(e.target.value) })}
                required
              />
              <FormInput
                label="Lunch Rate (₹)"
                type="number"
                value={mealRates.lunch}
                onChange={(e) => setMealRates({ ...mealRates, lunch: Number(e.target.value) })}
                required
              />
              <FormInput
                label="Snacks Rate (₹)"
                type="number"
                value={mealRates.snacks}
                onChange={(e) => setMealRates({ ...mealRates, snacks: Number(e.target.value) })}
                required
              />
              <FormInput
                label="Dinner Rate (₹)"
                type="number"
                value={mealRates.dinner}
                onChange={(e) => setMealRates({ ...mealRates, dinner: Number(e.target.value) })}
                required
              />
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
              <strong>Daily Standard Cost:</strong> ₹{mealRates.breakfast + mealRates.lunch + mealRates.snacks + mealRates.dinner} per full day (4 meals). A full 30-day month comes to approximately ₹{((mealRates.breakfast + mealRates.lunch + mealRates.snacks + mealRates.dinner) * 30).toLocaleString()}.
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isUpdatingRates}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs disabled:opacity-50"
              >
                {isUpdatingRates ? 'Saving Rates...' : 'Update & Lock Rates'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* GENERATE MONTHLY BILLS MODAL */}
      <Modal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        title="Generate Monthly Mess Bills"
        subtitle="Aggregates verified daily attendance and applies snapshotted rates"
        maxWidth="md"
      >
        <form onSubmit={handleGenerateBills} className="space-y-4 text-xs">
          {generationFeedback && (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{generationFeedback}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Generation Target
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setGenerateMode('all')}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  generateMode === 'all'
                    ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/60 ring-1 ring-blue-600 text-blue-600 dark:text-blue-400 font-semibold'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                All Students (Batch)
              </button>
              <button
                type="button"
                onClick={() => setGenerateMode('single')}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  generateMode === 'single'
                    ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/60 ring-1 ring-blue-600 text-blue-600 dark:text-blue-400 font-semibold'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                Single Student
              </button>
            </div>
          </div>

          {generateMode === 'single' && (
            <Select
              label="Select Student"
              value={targetStudentId}
              onChange={(e) => setTargetStudentId(e.target.value)}
              options={students.map((s) => ({
                value: s.id,
                label: `${s.name} (${s.studentId}) • Room ${s.roomNo || 'N/A'}`
              }))}
            />
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Month
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium"
              >
                {MONTH_NAMES.map((m, idx) => (
                  <option key={m} value={idx + 1}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Year
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium"
              >
                <option value={2026}>2026</option>
                <option value={2025}>2025</option>
              </select>
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg space-y-1 text-[11px] text-slate-500 dark:text-slate-400">
            <p className="font-semibold text-slate-700 dark:text-slate-300">
              Active Meal Rate Snapshots:
            </p>
            <p>
              Breakfast: ₹{mealRates.breakfast} • Lunch: ₹{mealRates.lunch} • Snacks: ₹{mealRates.snacks} • Dinner: ₹{mealRates.dinner}
            </p>
            <p className="text-[10px] text-slate-400 mt-1">
              * Generates ONE consolidated monthly bill per student. Prevents duplicate bills automatically.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsGenerateModalOpen(false)}
              className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isGenerating}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold disabled:opacity-50"
            >
              {isGenerating ? 'Processing Attendance...' : 'Generate Bills'}
            </button>
          </div>
        </form>
      </Modal>

      {/* OFFLINE PAYMENT RECORDING MODAL */}
      <Modal
        isOpen={!!selectedBillForPayment}
        onClose={() => setSelectedBillForPayment(null)}
        title="Record Offline Counter Payment"
        subtitle={selectedBillForPayment ? `${selectedBillForPayment.studentName} (${selectedBillForPayment.rollNo})` : ''}
        maxWidth="md"
      >
        {selectedBillForPayment && (
          <form onSubmit={handleConfirmOfflinePayment} className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-3">
              <div>
                <span className="text-slate-400 block text-[11px]">Billing Period:</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedBillForPayment.month}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Net Total Due:</span>
                <span className="font-bold text-rose-600 text-sm font-mono">
                  ₹{selectedBillForPayment.dueAmount ?? selectedBillForPayment.totalAmount}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormInput
                label="Payment Amount (₹)"
                type="number"
                required
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(Number(e.target.value))}
                helperText="Enter full or partial payment amount"
              />

              <FormInput
                label="Payment Date"
                type="date"
                required
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Payment Channel"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                options={['Counter Cash', 'Cash', 'Bank Challan', 'Office Deposit']}
              />

              <FormInput
                label="Counter Receipt / Challan Ref No"
                required
                value={receiptNumber}
                onChange={(e) => setReceiptNumber(e.target.value)}
                placeholder="e.g. REC-SEP-0042"
              />
            </div>

            <FormInput
              label="Collected By / Desk In-Charge"
              value={collectedBy}
              onChange={(e) => setCollectedBy(e.target.value)}
            />

            <FormInput
              label="Admin / Manager Remarks"
              value={paymentRemarks}
              onChange={(e) => setPaymentRemarks(e.target.value)}
              placeholder="e.g. Received full monthly mess fee at counter"
            />

            <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-800 dark:text-emerald-300">
              ✓ Upon saving, this transaction will update the student's bill balance and create an entry in the official payment ledger.
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedBillForPayment(null)}
                className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-300 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSavingPayment}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold disabled:opacity-50"
              >
                {isSavingPayment ? 'Recording...' : 'Confirm Offline Payment'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* REBATE / MESS CUT MODAL */}
      <Modal
        isOpen={!!selectedBillForRebate}
        onClose={() => setSelectedBillForRebate(null)}
        title="Apply Authorized Rebate / Mess Cut"
        subtitle={selectedBillForRebate ? `${selectedBillForRebate.studentName} (${selectedBillForRebate.rollNo})` : ''}
        maxWidth="md"
      >
        {selectedBillForRebate && (
          <form onSubmit={handleSaveRebate} className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-3">
              <div>
                <span className="text-slate-400 block text-[11px]">Current Subtotal:</span>
                <span className="font-bold text-slate-900 dark:text-white font-mono">
                  ₹{selectedBillForRebate.subtotal ?? selectedBillForRebate.totalAmount}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Current Net Payable:</span>
                <span className="font-bold text-blue-600 text-sm font-mono">
                  ₹{selectedBillForRebate.totalAmount}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <FormInput
                label="Leave Start Date"
                type="date"
                required
                value={rebateStartDate}
                onChange={(e) => setRebateStartDate(e.target.value)}
              />

              <FormInput
                label="Leave End Date"
                type="date"
                required
                value={rebateEndDate}
                onChange={(e) => setRebateEndDate(e.target.value)}
              />

              <FormInput
                label="Approved Days"
                type="number"
                required
                value={rebateDays}
                onChange={(e) => {
                  const days = Number(e.target.value);
                  setRebateDays(days);
                  // Approximate 90 INR / day full diet rebate
                  setRebateDeductionAmount(days * 90);
                }}
              />
            </div>

            <Select
              label="Leave Reason Category"
              value={rebateCategory}
              onChange={(e) => setRebateCategory(e.target.value as any)}
              options={['Medical Leave', 'College Leave', 'Hostel Leave', 'Approved Absence', 'Other']}
            />

            <FormInput
              label="Detailed Reason & Approval Note"
              required
              value={rebateReason}
              onChange={(e) => setRebateReason(e.target.value)}
              placeholder="e.g. Sanctioned medical leave with doctor certificate approved by Warden"
            />

            <FormInput
              label="Rebate Deduction Amount (₹)"
              type="number"
              required
              value={rebateDeductionAmount}
              onChange={(e) => setRebateDeductionAmount(Number(e.target.value))}
              helperText="This amount will be deducted from the student's monthly bill as a concession"
            />

            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 flex justify-between items-center font-bold">
              <span>New Bill Amount After Rebate:</span>
              <span className="text-blue-700 dark:text-blue-300 text-sm font-mono">
                ₹{Math.max(0, (selectedBillForRebate.subtotal ?? selectedBillForRebate.totalAmount) - Number(rebateDeductionAmount))}
              </span>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedBillForRebate(null)}
                className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-300 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSavingRebate}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold disabled:opacity-50"
              >
                {isSavingRebate ? 'Saving Rebate...' : 'Apply Rebate & Update Bill'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* DEDICATED A4 PRINTABLE MONTHLY BILL MODAL */}
      <MonthlyBillPDFModal
        isOpen={!!selectedBillForPDF}
        onClose={() => setSelectedBillForPDF(null)}
        bill={selectedBillForPDF}
        collegeName={settings.collegeName || 'GEC Sheikhpura'}
        messName={settings.messName || 'Hostel 2 Dining Mess'}
      />
    </div>
  );
};
