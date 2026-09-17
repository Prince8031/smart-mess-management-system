import React from 'react';
import { BillRecord } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { Modal } from '../common/Modal';
import { Printer, Download, X, Building2, CheckCircle2 } from 'lucide-react';

interface MonthlyBillPDFModalProps {
  isOpen: boolean;
  onClose: () => void;
  bill: BillRecord | null;
  collegeName?: string;
  messName?: string;
}

export const MonthlyBillPDFModal: React.FC<MonthlyBillPDFModalProps> = ({
  isOpen,
  onClose,
  bill,
  collegeName = 'GEC Sheikhpura',
  messName = 'Hostel 2 Dining Mess',
}) => {
  if (!bill) return null;

  const bCount = bill.breakfastCount ?? 22;
  const bRate = bill.breakfastRate ?? 20;
  const bAmount = bill.breakfastAmount ?? bCount * bRate;

  const lCount = bill.lunchCount ?? 24;
  const lRate = bill.lunchRate ?? 40;
  const lAmount = bill.lunchAmount ?? lCount * lRate;

  const sCount = bill.snacksCount ?? 20;
  const sRate = bill.snacksRate ?? 15;
  const sAmount = bill.snacksAmount ?? sCount * sRate;

  const dCount = bill.dinnerCount ?? 23;
  const dRate = bill.dinnerRate ?? 40;
  const dAmount = bill.dinnerAmount ?? dCount * dRate;

  const subtotal = bill.subtotal ?? (bAmount + lAmount + sAmount + dAmount);
  const rebate = bill.adjustment ?? 0;
  const finalAmount = bill.totalAmount ?? Math.max(0, subtotal + rebate);
  const paidAmount = bill.paidAmount ?? (bill.status === 'PAID' || bill.status === 'Paid' ? finalAmount : 0);
  const outstandingAmount = bill.dueAmount ?? Math.max(0, finalAmount - paidAmount);

  const paymentStatus =
    paidAmount >= finalAmount
      ? 'PAID'
      : paidAmount > 0
      ? 'PARTIALLY PAID'
      : 'PENDING';

  const generatedDate = bill.generatedAt
    ? new Date(bill.generatedAt).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '16 Sep 2026';

  const billId = bill.id || `BILL-${bill.year || 2026}-${String(bill.monthNum || 9).padStart(2, '0')}-${bill.rollNo}`;
  const authorizedBy = bill.generatedByName || 'Mess Secretary / Warden';

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Generate text/csv formatted voucher download for student records
    const receiptContent = `
============================================================
SMART MESS MANAGEMENT SYSTEM - College & Hostel OS
${messName.toUpperCase()} | ${collegeName.toUpperCase()}
============================================================
MONTHLY MESS BILL STATEMENT (OFFLINE COUNTER)
------------------------------------------------------------
Bill ID:             ${billId}
Generated Date:      ${generatedDate}
Student Name:        ${bill.studentName}
Roll Number:         ${bill.rollNo}
Registration No:     ${bill.rollNo || 'REG-2023-CS-042'}
Hostel:              ${bill.hostelBlock || 'Hostel 2'}
Room:                ${bill.roomNo || 'H2-101'}
Billing Month:       ${bill.month} ${bill.year}
------------------------------------------------------------
MEAL CONSUMPTION BREAKDOWN:
Meal       | Quantity | Rate (INR) | Amount (INR)
------------------------------------------------------------
Breakfast  | ${String(bCount).padEnd(8)} | Rs.${String(bRate).padEnd(6)} | Rs.${bAmount}
Lunch      | ${String(lCount).padEnd(8)} | Rs.${String(lRate).padEnd(6)} | Rs.${lAmount}
Snacks     | ${String(sCount).padEnd(8)} | Rs.${String(sRate).padEnd(6)} | Rs.${sAmount}
Dinner     | ${String(dCount).padEnd(8)} | Rs.${String(dRate).padEnd(6)} | Rs.${dAmount}
------------------------------------------------------------
Subtotal:            Rs. ${subtotal}
Rebate/Adjustment:   Rs. ${rebate} (${bill.adjustmentReason || 'None'})
Final Monthly Bill:  Rs. ${finalAmount}
Paid Amount:         Rs. ${paidAmount}
Outstanding Amount:  Rs. ${outstandingAmount}
------------------------------------------------------------
Payment Mode:        OFFLINE COUNTER (No Online Gateway)
Payment Status:      ${paymentStatus}
Authorized By:       ${authorizedBy}
------------------------------------------------------------
Notice: This is an electronically generated mess statement.
Payment must be settled at the authorized mess counter.
============================================================
    `.trim();

    const blob = new Blob([receiptContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Mess_Bill_${bill.rollNo}_${bill.year}_${bill.monthNum || '09'}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Monthly Mess Bill — Official Statement"
      maxWidth="lg"
    >
      <div className="space-y-4">
        {/* Action Toolbar */}
        <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Bill ID:</span>
            <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">{billId}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              Download Statement
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF
            </button>
          </div>
        </div>

        {/* PRINTABLE BILL CANVAS (A4 Compatible) */}
        <div
          id="printable-monthly-bill"
          className="p-6 sm:p-8 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm space-y-6 font-sans print:border-none print:shadow-none print:p-0"
        >
          {/* Header */}
          <div className="text-center border-b-2 border-slate-900 dark:border-slate-100 pb-4">
            <div className="text-xs uppercase tracking-widest font-extrabold text-blue-700 dark:text-blue-400">
              SMART MESS MANAGEMENT SYSTEM
            </div>
            <div className="text-[11px] font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
              College & Hostel OS • {collegeName}
            </div>
            <h1 className="text-2xl font-black tracking-tight mt-2 text-slate-950 dark:text-white uppercase">
              MONTHLY MESS BILL
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
              {messName} • Invoicing Period: <span className="font-bold text-slate-900 dark:text-white">{bill.month}</span>
            </p>
          </div>

          {/* Student & Bill Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Student Name
              </span>
              <span className="font-bold text-slate-900 dark:text-white text-sm">
                {bill.studentName}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Roll Number
              </span>
              <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                {bill.rollNo}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Registration Number
              </span>
              <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                {bill.rollNo || 'REG-2023-CS-042'}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Hostel & Room
              </span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {bill.hostelBlock || 'Hostel 2'}, Rm {bill.roomNo || '101'}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Billing Month
              </span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {bill.month}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Academic Year
              </span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {bill.year || 2026}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Generated Date
              </span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {generatedDate}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Due Date
              </span>
              <span className="font-semibold text-rose-600 dark:text-rose-400">
                {bill.dueDate || '05th of the month'}
              </span>
            </div>
          </div>

          {/* MEAL CONSUMPTION TABLE */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
              Meal Consumption Breakdown
            </div>
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 uppercase text-[11px]">
                  <th className="py-2.5 px-3 text-left font-bold">Meal</th>
                  <th className="py-2.5 px-3 text-center font-bold">Quantity (Days)</th>
                  <th className="py-2.5 px-3 text-center font-bold">Rate</th>
                  <th className="py-2.5 px-3 text-right font-bold">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">
                    Breakfast
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono font-medium">{bCount}</td>
                  <td className="py-2.5 px-3 text-center font-mono">₹{bRate}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-semibold">₹{bAmount}</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">
                    Lunch
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono font-medium">{lCount}</td>
                  <td className="py-2.5 px-3 text-center font-mono">₹{lRate}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-semibold">₹{lAmount}</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">
                    Snacks & Tea
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono font-medium">{sCount}</td>
                  <td className="py-2.5 px-3 text-center font-mono">₹{sRate}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-semibold">₹{sAmount}</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">
                    Dinner
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono font-medium">{dCount}</td>
                  <td className="py-2.5 px-3 text-center font-mono">₹{dRate}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-semibold">₹{dAmount}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-300 dark:border-slate-700 font-bold">
                  <td colSpan={3} className="py-2 px-3 text-slate-600 dark:text-slate-400">
                    Subtotal (Total {bCount + lCount + sCount + dCount} Meals)
                  </td>
                  <td className="py-2 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                    ₹{subtotal}
                  </td>
                </tr>

                {rebate !== 0 && (
                  <tr className="text-xs">
                    <td colSpan={3} className="py-1 px-3 text-slate-500">
                      Rebate / Mess Cut Concession ({bill.adjustmentReason || 'Authorized Leave'})
                    </td>
                    <td className={`py-1 px-3 text-right font-mono font-bold ${rebate < 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {rebate < 0 ? `-₹${Math.abs(rebate)}` : `+₹${rebate}`}
                    </td>
                  </tr>
                )}

                <tr className="border-t border-slate-300 dark:border-slate-700 text-sm font-extrabold bg-slate-50/80 dark:bg-slate-800/40">
                  <td colSpan={3} className="py-2.5 px-3 text-slate-900 dark:text-white">
                    Final Monthly Bill Amount
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-base text-blue-700 dark:text-blue-400">
                    ₹{finalAmount}
                  </td>
                </tr>

                <tr className="text-xs">
                  <td colSpan={3} className="py-1.5 px-3 text-emerald-700 dark:text-emerald-400 font-semibold">
                    Paid Amount (Settled at Mess Counter)
                  </td>
                  <td className="py-1.5 px-3 text-right font-mono font-bold text-emerald-700 dark:text-emerald-400">
                    ₹{paidAmount}
                  </td>
                </tr>

                <tr className="border-t border-slate-200 dark:border-slate-700 text-xs font-bold">
                  <td colSpan={3} className="py-2 px-3 text-rose-600 dark:text-rose-400">
                    Outstanding Balance Dues
                  </td>
                  <td className="py-2 px-3 text-right font-mono text-sm text-rose-600 dark:text-rose-400">
                    ₹{outstandingAmount}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Payment Mode & Status Callout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Payment Mode
              </span>
              <span className="font-extrabold text-slate-900 dark:text-white tracking-wide">
                OFFLINE COUNTER
              </span>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Counter cash, office receipt, or verified bank challan
              </p>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Payment Status
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <span
                  className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider ${
                    paymentStatus === 'PAID'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : paymentStatus === 'PARTIALLY PAID'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                  }`}
                >
                  {paymentStatus}
                </span>
                {bill.paidByName && (
                  <span className="text-[11px] text-slate-400">
                    Verified by: {bill.paidByName}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Footer & Authorization Signatures */}
          <div className="pt-4 border-t-2 border-slate-200 dark:border-slate-800 space-y-4">
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Bill Metadata
                </span>
                <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                  <strong>Bill ID:</strong> <span className="font-mono">{billId}</span>
                </p>
                <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                  <strong>Generated Date:</strong> {generatedDate}
                </p>
                <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                  <strong>Authorized By:</strong> {authorizedBy}
                </p>
              </div>

              <div className="flex flex-col items-end justify-end">
                <div className="border-t border-slate-400 dark:border-slate-600 pt-1 w-44 text-center">
                  <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 block">
                    {authorizedBy}
                  </span>
                  <span className="text-[10px] text-slate-400 block uppercase tracking-wider">
                    Authorized Signatory / Seal
                  </span>
                </div>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-100/70 dark:bg-slate-800/30 text-center text-[11px] text-slate-500 dark:text-slate-400">
              <p className="font-medium">
                This is an electronically generated mess statement.
              </p>
              <p className="text-[10px] mt-0.5">
                Payment must be settled at the authorized mess counter.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};
