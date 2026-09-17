import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { BillRecord } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { billAPI } from '../../services/api';
import { MonthlyBillPDFModal } from '../../components/billing/MonthlyBillPDFModal';
import {
  Receipt,
  CheckCircle2,
  Clock,
  Building2,
  Info,
  Printer,
  Calendar,
  Utensils,
  ChevronRight,
  Coffee,
  Sun,
  Sunset,
  Moon,
  AlertCircle
} from 'lucide-react';

export const StudentBillingPage: React.FC = () => {
  const { bills, currentUser, settings, isBackendConnected } = useApp();

  const studentRollNo = currentUser?.studentId || 'ST001';
  const studentId = currentUser?.id || 'std-prince';

  const [studentBills, setStudentBills] = useState<BillRecord[]>([]);
  const [selectedBillForInvoice, setSelectedBillForInvoice] = useState<BillRecord | null>(null);
  const [filterYear, setFilterYear] = useState<number>(2026);

  // Sync bills from backend or context
  useEffect(() => {
    const fetchBills = async () => {
      if (isBackendConnected) {
        try {
          const res = await billAPI.getMyBills();
          if (Array.isArray(res) && res.length > 0) {
            setStudentBills(res);
            return;
          }
        } catch {
          // fallback to context
        }
      }

      // Filter from AppContext bills
      const matching = bills.filter(
        (b) =>
          b.rollNo === studentRollNo ||
          b.studentId === studentId ||
          b.studentId === currentUser?.id
      );
      setStudentBills(matching.length > 0 ? matching : bills.slice(0, 3));
    };

    fetchBills();
  }, [bills, currentUser, isBackendConnected, studentRollNo, studentId]);

  // Calculations for summary metrics
  const pendingBills = studentBills.filter(
    (b) => b.status === 'PENDING' || b.status === 'Pending' || b.status === 'Overdue'
  );
  const totalDue = pendingBills.reduce((acc, b) => acc + (b.dueAmount ?? b.totalAmount ?? 0), 0);
  const latestBill = studentBills[0];
  const paidBillsCount = studentBills.filter(
    (b) => b.status === 'PAID' || b.status === 'Paid'
  ).length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-1">
            <Receipt className="w-3.5 h-3.5" />
            Monthly Dining Invoices
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            My Mess Bills
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Official monthly mess fees calculated from your verified daily meal attendance records
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Filter Year:</span>
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(Number(e.target.value))}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={2026}>2026</option>
            <option value={2025}>2025</option>
          </select>
        </div>
      </div>

      {/* Official Notice Card (Strict Offline Policy) */}
      <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/70 dark:bg-blue-950/30 text-blue-950 dark:text-blue-200 flex items-start gap-3 shadow-xs">
        <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <p className="font-bold text-sm text-blue-900 dark:text-blue-100">
            Offline Fee Settlement Notice
          </p>
          <p className="text-blue-800 dark:text-blue-300 leading-relaxed">
            Per hostel administration rules, mess fees are generated <strong>monthly only</strong> based on verified meal register attendance. 
            All dues must be cleared in person at the <strong>Hostel Mess Office / Accounts Counter</strong> by the <strong>5th of every month</strong>. 
            Once submitted, the manager will update your status to <strong>PAID</strong> with an official stamp and receipt number.
          </p>
        </div>
      </div>

      {/* Top 3 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block mb-1">
            Total Outstanding Balance
          </span>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-extrabold ${totalDue > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
              ₹{totalDue.toLocaleString()}
            </span>
            {totalDue > 0 ? (
              <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-1.5 py-0.5 rounded">
                Dues Pending
              </span>
            ) : (
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">
                All Cleared
              </span>
            )}
          </div>
          <span className="text-[11px] text-slate-400 mt-2 block">
            {pendingBills.length} pending bill(s) awaiting counter payment
          </span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block mb-1">
            Latest Invoiced Month
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-extrabold text-slate-900 dark:text-white">
              {latestBill?.month || 'September 2026'}
            </span>
            <StatusBadge status={latestBill?.status || 'PENDING'} size="sm" />
          </div>
          <span className="text-[11px] text-slate-400 mt-2 block">
            Total {latestBill?.totalMeals || 89} meals • Rate snapshot locked
          </span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block mb-1">
            Payment History Record
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {paidBillsCount}
            </span>
            <span className="text-xs text-slate-600 dark:text-slate-400">
              months settled
            </span>
          </div>
          <span className="text-[11px] text-slate-400 mt-2 block">
            Verified at Hostel 2 Dining Office
          </span>
        </div>
      </div>

      {/* Monthly Bills List */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-600" />
          Monthly Bill Statements & Breakdown
        </h2>

        {studentBills.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
            <Info className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              No monthly bills generated yet
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Monthly bills are generated at the end of each billing cycle by the mess manager.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {studentBills.map((bill) => {
              const isPaid = bill.status === 'PAID' || bill.status === 'Paid';
              const bCount = bill.breakfastCount ?? 22;
              const bRate = bill.breakfastRate ?? 20;
              const bAmt = bill.breakfastAmount ?? bCount * bRate;

              const lCount = bill.lunchCount ?? 24;
              const lRate = bill.lunchRate ?? 40;
              const lAmt = bill.lunchAmount ?? lCount * lRate;

              const sCount = bill.snacksCount ?? 20;
              const sRate = bill.snacksRate ?? 15;
              const sAmt = bill.snacksAmount ?? sCount * sRate;

              const dCount = bill.dinnerCount ?? 23;
              const dRate = bill.dinnerRate ?? 40;
              const dAmt = bill.dinnerAmount ?? dCount * dRate;

              const subtotal = bill.subtotal ?? bAmt + lAmt + sAmt + dAmt;
              const adj = bill.adjustment ?? 0;
              const finalTotal = bill.totalAmount ?? Math.max(0, subtotal + adj);

              return (
                <div
                  key={bill.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                >
                  {/* Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                          {bill.month}
                        </h3>
                        <span className="text-xs text-slate-400 font-mono">
                          (Year {bill.year})
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Total {bill.totalMeals ?? (bCount + lCount + sCount + dCount)} verified meals • Student: {bill.studentName} ({bill.rollNo})
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <StatusBadge status={isPaid ? 'PAID' : 'PENDING'} size="md" />
                      <button
                        onClick={() => setSelectedBillForInvoice(bill)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
                      >
                        <Receipt className="w-3.5 h-3.5 text-blue-600" />
                        <span>View Statement</span>
                      </button>
                    </div>
                  </div>

                  {/* 4-Meal Breakdown Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {/* Breakfast */}
                    <div className="p-3 rounded-lg bg-amber-50/60 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30">
                      <div className="flex items-center justify-between text-xs text-amber-800 dark:text-amber-300 font-medium mb-1">
                        <span className="flex items-center gap-1">
                          <Coffee className="w-3.5 h-3.5 text-amber-600" /> Breakfast
                        </span>
                        <span className="text-[11px] text-slate-500">@₹{bRate}</span>
                      </div>
                      <div className="flex items-baseline justify-between mt-1">
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {bCount} taken
                        </span>
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                          ₹{bAmt}
                        </span>
                      </div>
                    </div>

                    {/* Lunch */}
                    <div className="p-3 rounded-lg bg-orange-50/60 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/30">
                      <div className="flex items-center justify-between text-xs text-orange-800 dark:text-orange-300 font-medium mb-1">
                        <span className="flex items-center gap-1">
                          <Sun className="w-3.5 h-3.5 text-orange-600" /> Lunch
                        </span>
                        <span className="text-[11px] text-slate-500">@₹{lRate}</span>
                      </div>
                      <div className="flex items-baseline justify-between mt-1">
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {lCount} taken
                        </span>
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                          ₹{lAmt}
                        </span>
                      </div>
                    </div>

                    {/* Snacks */}
                    <div className="p-3 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30">
                      <div className="flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300 font-medium mb-1">
                        <span className="flex items-center gap-1">
                          <Sunset className="w-3.5 h-3.5 text-emerald-600" /> Snacks
                        </span>
                        <span className="text-[11px] text-slate-500">@₹{sRate}</span>
                      </div>
                      <div className="flex items-baseline justify-between mt-1">
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {sCount} taken
                        </span>
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                          ₹{sAmt}
                        </span>
                      </div>
                    </div>

                    {/* Dinner */}
                    <div className="p-3 rounded-lg bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30">
                      <div className="flex items-center justify-between text-xs text-indigo-800 dark:text-indigo-300 font-medium mb-1">
                        <span className="flex items-center gap-1">
                          <Moon className="w-3.5 h-3.5 text-indigo-600" /> Dinner
                        </span>
                        <span className="text-[11px] text-slate-500">@₹{dRate}</span>
                      </div>
                      <div className="flex items-baseline justify-between mt-1">
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {dCount} taken
                        </span>
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                          ₹{dAmt}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Totals & Settlement Row */}
                  <div className="pt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
                    <div className="text-xs space-y-0.5">
                      <div className="flex items-center gap-3">
                        <span className="text-slate-500 dark:text-slate-400">
                          Subtotal: <strong>₹{subtotal.toLocaleString()}</strong>
                        </span>
                        {adj !== 0 && (
                          <span className={adj < 0 ? 'text-emerald-600 font-semibold' : 'text-rose-600 font-semibold'}>
                            Adjustment: {adj < 0 ? `-₹${Math.abs(adj)}` : `+₹${adj}`}
                            {bill.adjustmentReason && ` (${bill.adjustmentReason})`}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {isPaid ? (
                          <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Settled on {bill.paidAt ? new Date(bill.paidAt).toLocaleDateString() : 'Counter Office'}
                          </span>
                        ) : (
                          <span>Due Date: {bill.dueDate || '5th of following month'}</span>
                        )}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 self-end sm:self-auto">
                      <div className="text-right">
                        <span className="text-[11px] text-slate-400 block">Net Payable Amount</span>
                        <span className="text-lg font-black text-blue-600 dark:text-blue-400">
                          ₹{finalTotal.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Official Mess Statement A4 Printable Modal */}
      <MonthlyBillPDFModal
        isOpen={!!selectedBillForInvoice}
        onClose={() => setSelectedBillForInvoice(null)}
        bill={selectedBillForInvoice}
        collegeName={settings.collegeName || 'GEC Sheikhpura'}
        messName={settings.messName || 'Hostel 2 Dining Mess'}
      />
    </div>
  );
};
