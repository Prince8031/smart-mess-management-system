import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Complaint } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { FormInput } from '../../components/common/FormInput';
import { Select } from '../../components/common/Select';
import { MessageSquarePlus, AlertCircle, CheckCircle2, Clock, ShieldAlert } from 'lucide-react';

export const StudentComplaintsPage: React.FC = () => {
  const { complaints, addComplaint, currentUser } = useApp();

  const studentRollNo = currentUser?.studentId || 'CS2023-014';
  const myComplaints = complaints.filter(c => c.rollNo === studentRollNo);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Food Quality',
    priority: 'Normal' as Complaint['priority'],
    description: ''
  });

  const handleOpenAdd = () => {
    setFormData({
      title: '',
      category: 'Food Quality',
      priority: 'Normal',
      description: ''
    });
    setIsAddModalOpen(true);
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    addComplaint({
      studentId: currentUser?.id || 'demo-student',
      studentName: currentUser?.name || 'Aarav Sharma',
      rollNo: studentRollNo,
      title: formData.title,
      description: formData.description,
      category: formData.category,
      priority: formData.priority,
      status: 'Pending',
      date: new Date().toISOString().split('T')[0]
    });
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            My Grievances & Redressal Tracking
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Report food hygiene issues, taste concerns, dining hall maintenance, and check warden remediation notes
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors"
        >
          <MessageSquarePlus className="w-4 h-4" />
          <span>File New Complaint</span>
        </button>
      </div>

      <div className="space-y-4">
        {myComplaints.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <h3 className="font-bold text-slate-800 dark:text-white text-sm">No Active Complaints</h3>
            <p className="text-xs text-slate-500 mt-1">You currently have no open dining grievances registered.</p>
          </div>
        ) : (
          myComplaints.map(c => (
            <div
              key={c.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {c.category}
                  </span>
                  <StatusBadge status={c.priority} size="sm" />
                  <span className="text-xs text-slate-400">Filed on {c.date}</span>
                </div>
                <StatusBadge status={c.status} size="md" />
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {c.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
                  {c.description}
                </p>
              </div>

              {/* Warden / Manager Resolution Note */}
              {c.adminNotes && (
                <div className="p-3.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-xs text-emerald-900 dark:text-emerald-200">
                  <span className="font-bold block mb-1">Kitchen Supervisor / Warden Resolution:</span>
                  <p>{c.adminNotes}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* File Complaint Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="File a Grievance with Mess Committee"
        maxWidth="md"
      >
        <form onSubmit={handleSaveAdd} className="space-y-4">
          <FormInput
            label="Grievance Title / Subject"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. Quality of milk during breakfast was substandard"
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Issue Category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              options={['Food Quality', 'Hygiene', 'Timings', 'Billing Issue', 'Menu Variety', 'Staff Behavior']}
            />
            <Select
              label="Priority Level"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
              options={['Normal', 'Urgent']}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Detailed Description
            </label>
            <textarea
              rows={4}
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="State what happened, which meal counter, and approximate time..."
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 p-2.5 text-xs sm:text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
            >
              Submit Grievance
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
