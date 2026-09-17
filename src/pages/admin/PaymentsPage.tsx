import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PaymentRecord } from '../../types';
import { DataTable, Column } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { FormInput } from '../../components/common/FormInput';
import { Select } from '../../components/common/Select';
import {
  Banknote,
  PlusCircle,
  CheckCircle2,
  Download,
  Search,
  FileCheck,
  Receipt,
  Printer,
  Calendar,
  Building,
  Check
} from 'lucide-react';

export const PaymentsPage: React.FC = () => {
  const { payments, students, bills, settings, recordPayment, markBillStatus } = useApp();

  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<PaymentRecord | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    studentId: students[0]?.id || '',
    amount: 2620,
    date: '2026-09-16',
    method: 'Counter Cash' as PaymentRecord['method'],
    status: 'Completed' as PaymentRecord['status'],
    referenceNo: '',
    remarks: ''
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleRecord = (e: React.FormEvent) => {
    e.preventDefault();
    const student = students.find((s) => s.id === formData.studentId) || students[0];
    const pendingBill = bills.find((b) => b.studentId === student.id && (b.dueAmount ?? b.totalAmount) > 0);

    const amt = Number(formData.amount);
    const voucher = formData.referenceNo || `CTR-${Date.now().toString().slice(-6)}`;

    recordPayment({
      studentId: student.id,
      studentName: student.name,
      rollNo: student.studentId || 'N/A',
      billId: pendingBill?.id,
      amount: amt,
      method: formData.method,
      status: formData.status,
      referenceNo: voucher
    });

    if (pendingBill) {
      const isFull = amt >= (pendingBill.dueAmount ?? pendingBill.totalAmount);
      markBillStatus(pendingBill.id, isFull ? 'PAID' : 'Partially Paid');
    }

    showToast(`Recorded offline payment of ₹${amt.toLocaleString()} for ${student.name}`);
    setIsRecordModalOpen(false);
  };

  // Export Payment Ledger CSV
  const handleExportCSV = () => {
    const headers = [
      'Transaction ID',
      'Student Name',
      'Roll No',
      'Payment Date',
      'Amount (INR)',
      'Payment Mode',
      'Counter Voucher / Ref',
      'Status',
      'Station / Desk'
    ];

    const rows = payments.map((p) => [
      p.transactionId,
      `"${p.studentName}"`,
      p.rollNo,
      p.date,
      p.amount,
      p.method,
      p.referenceNo || 'Counter Direct',
      p.status,
      'Hostel 2 Dining Accounts Counter'
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Mess_Payment_Ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported payment ledger CSV successfully!');
  };

  // Summary figures
  const totalCollected = payments.reduce((acc, p) => acc + (p.amount || 0), 0);
  const totalCount = payments.length;
  const cashCount = payments.filter((p) => p.method === 'Counter Cash' || p.method === 'Cash').length;
  const bankChallanCount = payments.filter((p) => p.method === 'Bank Challan').length;

  const columns: Column<PaymentRecord>[] = [
    {
      header: 'Voucher / Txn ID',
      accessor: 'transactionId',
      render: (row) => (
        <div>
          <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
            {row.transactionId}
          </span>
          <span className="block text-[10px] text-slate-400 font-mono">
            {row.referenceNo || 'Direct Counter'}
          </span>
        </div>
      )
    },
    {
      header: 'Student',
      accessor: 'studentName',
      render: (row) => (
        <div>
          <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">
            {row.studentName}
          </span>
          <span className="block text-[11px] font-mono text-slate-400">{row.rollNo}</span>
        </div>
      )
    },
    {
      header: 'Amount Paid',
      accessor: 'amount',
      render: (row) => (
        <span className="font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400">
          ₹{row.amount.toLocaleString()}
        </span>
      )
    },
    {
      header: 'Payment Date',
      accessor: 'date',
      render: (row) => (
        <span className="text-xs text-slate-600 dark:text-slate-400">{row.date}</span>
      )
    },
    {
      header: 'Offline Channel',
      accessor: 'method',
      render: (row) => (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-300">
          <Banknote className="w-3.5 h-3.5 text-emerald-600" />
          {row.method}
        </span>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status} size="sm" />
    },
    {
      header: 'Action',
      className: 'text-right',
      render: (row) => (
        <button
          onClick={() => setSelectedReceipt(row)}
          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
        >
          <Receipt className="w-3.5 h-3.5 text-blue-600" />
          <span>Receipt</span>
        </button>
      )
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
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-1">
            <Banknote className="w-3.5 h-3.5" />
            Cash Counter & Physical Payment Ledger
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Offline Payments Ledger
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Physical in-person cash receipts, bank challans, and counter voucher entries for hostel dining fees
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Ledger CSV</span>
          </button>

          <button
            onClick={() => setIsRecordModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Record Offline Payment</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Total In-Person Collected
          </span>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            ₹{totalCollected.toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Cleared at counter</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Total Transactions
          </span>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{totalCount}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Logged ledger vouchers</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Counter Cash Entries
          </span>
          <p className="text-2xl font-black text-blue-600 dark:text-blue-400">{cashCount}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Direct desk currency</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Bank Challans & Slips
          </span>
          <p className="text-2xl font-black text-purple-600 dark:text-purple-400">{bankChallanCount}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Bank stamp verified</span>
        </div>
      </div>

      {/* Payments Data Table */}
      <DataTable
        columns={columns}
        data={payments}
        keyExtractor={(item) => item.id}
        searchPlaceholder="Search by transaction ID, student, roll no, or voucher..."
        searchKeys={['transactionId', 'studentName', 'rollNo', 'referenceNo', 'method']}
        itemsPerPage={10}
      />

      {/* Record Payment Modal */}
      <Modal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        title="Record Offline Counter Payment"
        subtitle="Log an in-person cash collection, deposit slip, or bank challan"
        maxWidth="md"
      >
        <form onSubmit={handleRecord} className="space-y-4 text-xs">
          <Select
            label="Select Student"
            value={formData.studentId}
            onChange={(e) => {
              const sid = e.target.value;
              const pendingBill = bills.find((b) => b.studentId === sid && (b.dueAmount ?? b.totalAmount) > 0);
              setFormData({
                ...formData,
                studentId: sid,
                amount: pendingBill?.dueAmount ?? pendingBill?.totalAmount ?? 2620
              });
            }}
            options={students.map((s) => ({
              value: s.id,
              label: `${s.name} (${s.studentId}) • ${s.hostelBlock || 'Hostel 2'}, Rm ${s.roomNo || '101'}`
            }))}
          />

          <div className="grid grid-cols-2 gap-3">
            <FormInput
              label="Payment Amount (₹)"
              type="number"
              required
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
              helperText="Full or partial payment"
            />

            <FormInput
              label="Payment Date"
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Collection Channel"
              value={formData.method}
              onChange={(e) => setFormData({ ...formData, method: e.target.value as any })}
              options={['Counter Cash', 'Cash', 'Bank Challan', 'Office Deposit']}
            />

            <FormInput
              label="Voucher / Challan Ref No"
              required
              value={formData.referenceNo}
              onChange={(e) => setFormData({ ...formData, referenceNo: e.target.value })}
              placeholder="e.g. CTR-0921"
            />
          </div>

          <FormInput
            label="Counter Remarks / Collected By"
            value={formData.remarks}
            onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
            placeholder="e.g. Received at Hostel 2 mess desk"
          />

          <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 text-[11px] text-blue-800 dark:text-blue-300">
            * No online gateway. All fees must be submitted in cash or stamped bank challan at the hostel counter.
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsRecordModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
            >
              Confirm & Save Ledger Entry
            </button>
          </div>
        </form>
      </Modal>

      {/* Official Payment Receipt Modal */}
      <Modal
        isOpen={!!selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
        title="Official Counter Payment Receipt"
        maxWidth="sm"
      >
        {selectedReceipt && (
          <div className="space-y-4 text-xs">
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4 shadow-xs">
              {/* Institution Header */}
              <div className="text-center border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  {settings.collegeName || 'GEC Sheikhpura'}
                </h3>
                <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold">
                  {settings.messName || 'Hostel 2 Dining Mess'}
                </p>
                <span className="inline-block px-2 py-0.5 mt-1 text-[10px] uppercase font-bold tracking-wider rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  OFFICIAL COUNTER RECEIPT
                </span>
              </div>

              {/* Receipt Details */}
              <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Receipt / Txn ID:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {selectedReceipt.transactionId}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">Student Name:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {selectedReceipt.studentName}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">Roll No / ID:</span>
                  <span className="font-mono">{selectedReceipt.rollNo}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">Payment Date:</span>
                  <span>{selectedReceipt.date}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">Collection Mode:</span>
                  <span className="font-medium text-emerald-600">{selectedReceipt.method}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">Voucher / Challan:</span>
                  <span className="font-mono">{selectedReceipt.referenceNo || 'Direct Counter'}</span>
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-between font-bold text-base text-slate-900 dark:text-white">
                  <span>Amount Settled:</span>
                  <span className="text-emerald-600 font-mono">
                    ₹{selectedReceipt.amount.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Counter Stamp Footer */}
              <div className="pt-3 border-t border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                <div>
                  <p className="font-semibold text-slate-600 dark:text-slate-400">Verified & Stamped</p>
                  <p>Mess Accounts Desk</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-600 dark:text-slate-400">Status</p>
                  <p className="text-emerald-600 font-bold">COMPLETED</p>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Receipt</span>
              </button>

              <button
                onClick={() => setSelectedReceipt(null)}
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
