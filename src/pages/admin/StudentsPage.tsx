import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User } from '../../types';
import { DataTable, Column } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { FormInput } from '../../components/common/FormInput';
import { Select } from '../../components/common/Select';
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog';
import { UserPlus, Eye, Edit2, Trash2, Download } from 'lucide-react';

export const StudentsPage: React.FC = () => {
  const { students, addStudent, updateStudent, deleteStudent, settings } = useApp();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<User | null>(null);
  const [viewingStudent, setViewingStudent] = useState<User | null>(null);
  const [deletingStudentId, setDeletingStudentId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    studentId: '',
    roomNo: '',
    hostelBlock: settings.hostelBlocks[0] || 'Block A (Boys)',
    messHall: 'Annapurna Hall',
    phone: '',
    dietPreference: 'Veg' as 'Veg' | 'Non-Veg' | 'Jain',
    status: 'Active' as 'Active' | 'Inactive' | 'On Leave',
    year: '1st Year',
    branch: 'Computer Science'
  });

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      email: '',
      studentId: '',
      roomNo: '',
      hostelBlock: settings.hostelBlocks[0] || 'Block A (Boys)',
      messHall: 'Annapurna Hall',
      phone: '',
      dietPreference: 'Veg',
      status: 'Active',
      year: '1st Year',
      branch: 'Computer Science'
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (student: User) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      email: student.email,
      studentId: student.studentId || '',
      roomNo: student.roomNo || '',
      hostelBlock: student.hostelBlock || settings.hostelBlocks[0],
      messHall: student.messHall || 'Annapurna Hall',
      phone: student.phone || '',
      dietPreference: student.dietPreference || 'Veg',
      status: student.status || 'Active',
      year: student.year || '1st Year',
      branch: student.branch || 'Computer Science'
    });
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    addStudent({
      ...formData,
      role: 'student'
    });
    setIsAddModalOpen(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStudent) {
      updateStudent(editingStudent.id, formData);
      setEditingStudent(null);
    }
  };

  const columns: Column<User>[] = [
    {
      header: 'Student Name',
      accessor: 'name',
      render: (row) => (
        <div>
          <span className="font-semibold text-slate-900 dark:text-white">{row.name}</span>
          <span className="block text-xs text-slate-500">{row.email}</span>
        </div>
      )
    },
    {
      header: 'Roll / ID',
      accessor: 'studentId',
      render: (row) => <span className="font-mono text-xs">{row.studentId || 'N/A'}</span>
    },
    {
      header: 'Hostel & Room',
      render: (row) => (
        <span>
          {row.hostelBlock} • {row.roomNo}
        </span>
      )
    },
    {
      header: 'Diet',
      accessor: 'dietPreference',
      render: (row) => <StatusBadge status={row.dietPreference || 'Veg'} size="sm" />
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
            onClick={() => setViewingStudent(row)}
            title="View Details"
            className="p-1.5 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleOpenEdit(row)}
            title="Edit Student"
            className="p-1.5 rounded-md text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeletingStudentId(row.id)}
            title="Delete Student"
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
            Student Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Registered hostel inmates subscribed to mess meals ({students.length} total)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Student</span>
          </button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={students}
        keyExtractor={(item) => item.id}
        searchPlaceholder="Search by name, roll no, or hostel..."
        searchKeys={['name', 'studentId', 'hostelBlock', 'email']}
        itemsPerPage={10}
      />

      {/* Add Student Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Student"
        subtitle="Enroll a hostel inmate into the dining registry"
        maxWidth="lg"
      >
        <form onSubmit={handleSaveAdd} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Full Name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Rahul Sharma"
            />
            <FormInput
              label="Email Address"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="e.g. rahul@hostel.edu"
            />
            <FormInput
              label="Student ID / Roll No"
              required
              value={formData.studentId}
              onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
              placeholder="e.g. CS2024-055"
            />
            <FormInput
              label="Room Number"
              required
              value={formData.roomNo}
              onChange={(e) => setFormData({ ...formData, roomNo: e.target.value })}
              placeholder="e.g. A-302"
            />
            <Select
              label="Hostel Block"
              value={formData.hostelBlock}
              onChange={(e) => setFormData({ ...formData, hostelBlock: e.target.value })}
              options={settings.hostelBlocks}
            />
            <Select
              label="Dietary Preference"
              value={formData.dietPreference}
              onChange={(e) => setFormData({ ...formData, dietPreference: e.target.value as any })}
              options={['Veg', 'Non-Veg', 'Jain']}
            />
            <FormInput
              label="Phone Number"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+91 98765 00000"
            />
            <Select
              label="Enrollment Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              options={['Active', 'Inactive', 'On Leave']}
            />
          </div>
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
              Save Student
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Student Modal */}
      <Modal
        isOpen={!!editingStudent}
        onClose={() => setEditingStudent(null)}
        title="Edit Student Information"
        maxWidth="lg"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Full Name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <FormInput
              label="Email Address"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <FormInput
              label="Student ID / Roll No"
              required
              value={formData.studentId}
              onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
            />
            <FormInput
              label="Room Number"
              required
              value={formData.roomNo}
              onChange={(e) => setFormData({ ...formData, roomNo: e.target.value })}
            />
            <Select
              label="Hostel Block"
              value={formData.hostelBlock}
              onChange={(e) => setFormData({ ...formData, hostelBlock: e.target.value })}
              options={settings.hostelBlocks}
            />
            <Select
              label="Dietary Preference"
              value={formData.dietPreference}
              onChange={(e) => setFormData({ ...formData, dietPreference: e.target.value as any })}
              options={['Veg', 'Non-Veg', 'Jain']}
            />
            <FormInput
              label="Phone Number"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <Select
              label="Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              options={['Active', 'Inactive', 'On Leave']}
            />
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setEditingStudent(null)}
              className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
            >
              Update Student
            </button>
          </div>
        </form>
      </Modal>

      {/* View Student Details Modal */}
      <Modal
        isOpen={!!viewingStudent}
        onClose={() => setViewingStudent(null)}
        title="Student Profile & Dining Details"
        maxWidth="md"
      >
        {viewingStudent && (
          <div className="space-y-4 text-xs sm:text-sm">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-bold text-base flex items-center justify-center">
                {viewingStudent.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  {viewingStudent.name}
                </h3>
                <p className="text-slate-500">{viewingStudent.studentId} • {viewingStudent.branch}</p>
                <div className="mt-1 flex items-center gap-2">
                  <StatusBadge status={viewingStudent.status} size="sm" />
                  <StatusBadge status={viewingStudent.dietPreference || 'Veg'} size="sm" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                <span className="text-[11px] text-slate-400 block">Hostel Block</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{viewingStudent.hostelBlock}</span>
              </div>
              <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                <span className="text-[11px] text-slate-400 block">Room Number</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{viewingStudent.roomNo}</span>
              </div>
              <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                <span className="text-[11px] text-slate-400 block">Email</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">{viewingStudent.email}</span>
              </div>
              <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                <span className="text-[11px] text-slate-400 block">Phone</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{viewingStudent.phone || 'N/A'}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={!!deletingStudentId}
        onClose={() => setDeletingStudentId(null)}
        onConfirm={() => {
          if (deletingStudentId) deleteStudent(deletingStudentId);
        }}
        title="Delete Student Record"
        message="Are you sure you want to remove this student from the dining registry? This will permanently delete their account and records."
        confirmText="Yes, Delete"
      />
    </div>
  );
};
