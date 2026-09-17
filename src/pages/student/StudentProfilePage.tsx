import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { FormInput } from '../../components/common/FormInput';
import { Select } from '../../components/common/Select';
import { User, Utensils, Save, CheckCircle2, Shield } from 'lucide-react';

export const StudentProfilePage: React.FC = () => {
  const { currentUser, updateStudent } = useApp();

  const [diet, setDiet] = useState<'Veg' | 'Non-Veg' | 'Jain'>(
    currentUser?.dietPreference || 'Veg'
  );
  const [phone, setPhone] = useState(currentUser?.phone || '+91 98765 43210');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser) {
      updateStudent(currentUser.id, {
        dietPreference: diet,
        phone
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Student Dining Profile
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Manage your dietary preference, contact details, and view registered hostel room information
        </p>
      </div>

      {saveSuccess && (
        <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Dietary preferences updated! Kitchen counters have received the update.</span>
        </div>
      )}

      {/* Main Profile Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-blue-600 text-white font-bold text-2xl flex items-center justify-center">
            {currentUser?.name?.charAt(0) || 'A'}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {currentUser?.name}
            </h2>
            <p className="text-xs text-slate-500 font-mono">
              Roll No: {currentUser?.studentId} • {currentUser?.branch}
            </p>
            <div className="mt-1 flex items-center gap-2">
              <StatusBadge status={currentUser?.status || 'Active'} size="sm" />
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400 border border-blue-200 dark:border-blue-900">
                {currentUser?.messHall || 'Annapurna Hall'}
              </span>
            </div>
          </div>
        </div>

        {/* Read-only Hostel Registry Data */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
            <span className="text-slate-400 block">Hostel Block</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{currentUser?.hostelBlock}</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
            <span className="text-slate-400 block">Room Number</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{currentUser?.roomNo}</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
            <span className="text-slate-400 block">Institutional Email</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{currentUser?.email}</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
            <span className="text-slate-400 block">Academic Standing</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{currentUser?.year}</span>
          </div>
        </div>

        {/* Editable Diet & Contact */}
        <form onSubmit={handleSave} className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Dietary Preferences & Notification Contact
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Kitchen Dietary Classification"
              value={diet}
              onChange={(e) => setDiet(e.target.value as any)}
              options={['Veg', 'Non-Veg', 'Jain']}
            />
            <FormInput
              label="WhatsApp / SMS Alert Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Update Preferences</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
