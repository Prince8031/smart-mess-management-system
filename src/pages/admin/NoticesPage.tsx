import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Notice } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { FormInput } from '../../components/common/FormInput';
import { Select } from '../../components/common/Select';
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog';
import { Bell, PlusCircle, Trash2, Calendar, UserCheck } from 'lucide-react';

export const NoticesPage: React.FC = () => {
  const { notices, addNotice, deleteNotice, currentUser } = useApp();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deletingNoticeId, setDeletingNoticeId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'Normal' as Notice['priority'],
    targetAudience: 'All Hostels' as Notice['targetAudience']
  });

  const handleOpenAdd = () => {
    setFormData({
      title: '',
      description: '',
      priority: 'Normal',
      targetAudience: 'All Hostels'
    });
    setIsAddModalOpen(true);
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    addNotice({
      title: formData.title,
      description: formData.description,
      priority: formData.priority,
      postedBy: currentUser?.name || 'Chief Warden (Mess Admin)',
      date: new Date().toISOString().split('T')[0],
      targetAudience: formData.targetAudience
    });
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Mess Notice Board
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Publish official announcements regarding feast menus, dining hours, mess cuts and renovations
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Publish Notice</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {notices.map(notice => (
          <div
            key={notice.id}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <StatusBadge status={notice.priority} size="sm" />
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {notice.targetAudience}
                  </span>
                </div>
                <button
                  onClick={() => setDeletingNoticeId(notice.id)}
                  className="p-1 text-slate-400 hover:text-rose-600 rounded-md transition-colors"
                  title="Delete Notice"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {notice.title}
              </h3>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                {notice.description}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {notice.date}
              </span>
              <span className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-300">
                <UserCheck className="w-3.5 h-3.5" />
                {notice.postedBy}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Notice Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Publish Official Dining Notice"
        maxWidth="md"
      >
        <form onSubmit={handleSaveAdd} className="space-y-4">
          <FormInput
            label="Notice Headline"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. Special Feast on Gandhi Jayanti"
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Urgency / Priority"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
              options={['Normal', 'Important', 'Urgent']}
            />
            <Select
              label="Target Audience"
              value={formData.targetAudience}
              onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value as any })}
              options={['All Hostels', 'Boys Hostels', 'Girls Hostels']}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Notice Description / Instructions
            </label>
            <textarea
              rows={4}
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Write detailed announcements, timings, special guidelines for students..."
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
              Publish Notice
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={!!deletingNoticeId}
        onClose={() => setDeletingNoticeId(null)}
        onConfirm={() => {
          if (deletingNoticeId) deleteNotice(deletingNoticeId);
        }}
        title="Remove Notice"
        message="Are you sure you want to take down this announcement from the student bulletin?"
        confirmText="Yes, Remove"
      />
    </div>
  );
};
