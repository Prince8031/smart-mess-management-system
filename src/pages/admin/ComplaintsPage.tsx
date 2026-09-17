import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Complaint } from '../../types';
import { DataTable, Column } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { Select } from '../../components/common/Select';
import { AlertCircle, CheckCircle2, MessageSquare, Clock, Filter, Eye } from 'lucide-react';

export const ComplaintsPage: React.FC = () => {
  const { complaints, updateComplaintStatus, addComplaintNote } = useApp();

  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [resolutionStatus, setResolutionStatus] = useState<Complaint['status']>('Resolved');
  const [resolutionNote, setResolutionNote] = useState('');

  const handleOpenAction = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setResolutionStatus(complaint.status);
    setResolutionNote(complaint.resolutionNotes || complaint.adminNotes || '');
  };

  const handleSaveResolution = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedComplaint) {
      updateComplaintStatus(selectedComplaint.id, resolutionStatus, resolutionNote);
      setSelectedComplaint(null);
    }
  };

  const columns: Column<Complaint>[] = [
    {
      header: 'Complaint Details',
      accessor: 'title',
      render: (row) => (
        <div>
          <span className="font-semibold text-slate-900 dark:text-white">{row.title}</span>
          <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{row.description}</p>
        </div>
      )
    },
    {
      header: 'Student',
      accessor: 'studentName',
      render: (row) => (
        <div>
          <span className="font-medium text-slate-800 dark:text-slate-200">{row.studentName}</span>
          <span className="block text-[11px] font-mono text-slate-400">{row.rollNo}</span>
        </div>
      )
    },
    {
      header: 'Category',
      accessor: 'category',
      render: (row) => <span className="text-xs font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">{row.category}</span>
    },
    {
      header: 'Priority',
      accessor: 'priority',
      render: (row) => <StatusBadge status={row.priority} size="sm" />
    },
    {
      header: 'Filed On',
      accessor: 'date'
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
          onClick={() => handleOpenAction(row)}
          className="px-2.5 py-1 text-xs font-semibold rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300 transition-colors"
        >
          Review
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Mess Grievance & Complaints Redressal
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Student feedback, meal hygiene inspection logs, and kitchen remediation tracker
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xs text-slate-500 flex items-center gap-3">
            <span className="flex items-center gap-1.5 font-medium text-amber-600">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              {complaints.filter(c => c.status === 'Pending').length} Pending
            </span>
            <span className="flex items-center gap-1.5 font-medium text-blue-600">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              {complaints.filter(c => c.status === 'In Progress').length} In Progress
            </span>
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={complaints}
        keyExtractor={(item) => item.id}
        searchPlaceholder="Search complaints, category, or student..."
        searchKeys={['title', 'description', 'studentName', 'category', 'rollNo', 'status']}
        itemsPerPage={10}
      />

      {/* Review / Status Update Modal */}
      <Modal
        isOpen={!!selectedComplaint}
        onClose={() => setSelectedComplaint(null)}
        title="Grievance Redressal & Action"
        maxWidth="md"
      >
        {selectedComplaint && (
          <form onSubmit={handleSaveResolution} className="space-y-4">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold text-slate-500">
                  {selectedComplaint.category} Grievance
                </span>
                <StatusBadge status={selectedComplaint.priority} size="sm" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                {selectedComplaint.title}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                "{selectedComplaint.description}"
              </p>
              <div className="pt-2 text-[11px] text-slate-400 border-t border-slate-200 dark:border-slate-700 flex justify-between">
                <span>Filed by: {selectedComplaint.studentName} ({selectedComplaint.rollNo})</span>
                <span>Date: {selectedComplaint.date}</span>
              </div>
            </div>

            <Select
              label="Update Grievance Status"
              value={resolutionStatus}
              onChange={(e) => setResolutionStatus(e.target.value as any)}
              options={['Pending', 'In Progress', 'Resolved']}
            />

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Kitchen Warden / Manager Remediation Note
              </label>
              <textarea
                rows={3}
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
                placeholder="Explain the inspection findings or action taken by the mess staff..."
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 p-2.5 text-xs sm:text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedComplaint(null)}
                className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
              >
                Save Resolution
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
