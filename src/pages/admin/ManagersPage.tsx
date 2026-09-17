import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User } from '../../types';
import { DataTable, Column } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { FormInput } from '../../components/common/FormInput';
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog';
import { UserPlus, Edit2, Trash2, ChefHat, Phone, Mail, Clock } from 'lucide-react';

export const ManagersPage: React.FC = () => {
  const { managers, addManager, updateManager, deleteManager } = useApp();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingManager, setEditingManager] = useState<User | null>(null);
  const [deletingManagerId, setDeletingManagerId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    messHall: 'Annapurna Hall (Main Mess)',
    branch: 'Day Shift (6:30 AM - 3:30 PM)',
    status: 'Active' as 'Active' | 'Inactive'
  });

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      messHall: 'Annapurna Hall (Main Mess)',
      branch: 'Day Shift (6:30 AM - 3:30 PM)',
      status: 'Active'
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (mgr: User) => {
    setEditingManager(mgr);
    setFormData({
      name: mgr.name,
      email: mgr.email,
      phone: mgr.phone || '',
      messHall: mgr.messHall || '',
      branch: mgr.branch || '',
      status: (mgr.status === 'Active' ? 'Active' : 'Inactive') as any
    });
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    addManager({
      ...formData,
      role: 'manager'
    });
    setIsAddModalOpen(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingManager) {
      updateManager(editingManager.id, formData);
      setEditingManager(null);
    }
  };

  const columns: Column<User>[] = [
    {
      header: 'Manager Name',
      accessor: 'name',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-bold text-xs flex items-center justify-center">
            {row.name.charAt(0)}
          </div>
          <div>
            <span className="font-semibold text-slate-900 dark:text-white">{row.name}</span>
            <span className="block text-xs text-slate-500">{row.email}</span>
          </div>
        </div>
      )
    },
    {
      header: 'Assigned Mess Hall',
      accessor: 'messHall',
      render: (row) => <span className="font-medium text-slate-800 dark:text-slate-200">{row.messHall}</span>
    },
    {
      header: 'Shift & Duty Hours',
      accessor: 'branch',
      render: (row) => (
        <span className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          {row.branch}
        </span>
      )
    },
    {
      header: 'Contact',
      accessor: 'phone',
      render: (row) => <span className="font-mono text-xs">{row.phone || 'N/A'}</span>
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status} size="sm" />
    },
    {
      header: 'Actions',
      className: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => handleOpenEdit(row)}
            title="Edit Manager"
            className="p-1.5 rounded-md text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeletingManagerId(row.id)}
            title="Delete Manager"
            className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Mess Managers
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Kitchen supervisors, dining hall contractors and shift supervisors ({managers.length} active)
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Mess Manager</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={managers}
        keyExtractor={(item) => item.id}
        searchPlaceholder="Search by name, mess hall, or shift..."
        searchKeys={['name', 'email', 'messHall']}
        itemsPerPage={5}
      />

      {/* Add Manager Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Mess Manager"
        subtitle="Appoint a supervisor to an operational dining hall"
        maxWidth="md"
      >
        <form onSubmit={handleSaveAdd} className="space-y-4">
          <FormInput
            label="Full Name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Ramesh Kumar"
          />
          <FormInput
            label="Institutional Email"
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="e.g. ramesh.kumar@hostel.edu"
          />
          <FormInput
            label="Contact Phone"
            required
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+91 98000 00000"
          />
          <FormInput
            label="Assigned Mess Hall"
            required
            value={formData.messHall}
            onChange={(e) => setFormData({ ...formData, messHall: e.target.value })}
            placeholder="e.g. Annapurna Hall (Boys Mess)"
          />
          <FormInput
            label="Shift / Duty Hours"
            required
            value={formData.branch}
            onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
            placeholder="e.g. Day Shift (6:30 AM - 3:30 PM)"
          />
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
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
              Save Manager
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Manager Modal */}
      <Modal
        isOpen={!!editingManager}
        onClose={() => setEditingManager(null)}
        title="Edit Mess Manager"
        maxWidth="md"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <FormInput
            label="Full Name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <FormInput
            label="Institutional Email"
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <FormInput
            label="Contact Phone"
            required
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
          <FormInput
            label="Assigned Mess Hall"
            required
            value={formData.messHall}
            onChange={(e) => setFormData({ ...formData, messHall: e.target.value })}
          />
          <FormInput
            label="Shift / Duty Hours"
            required
            value={formData.branch}
            onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
          />
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setEditingManager(null)}
              className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
            >
              Update Manager
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={!!deletingManagerId}
        onClose={() => setDeletingManagerId(null)}
        onConfirm={() => {
          if (deletingManagerId) deleteManager(deletingManagerId);
        }}
        title="Remove Mess Manager"
        message="Are you sure you want to revoke this manager's access to the dining hall management system?"
        confirmText="Yes, Remove"
      />
    </div>
  );
};
