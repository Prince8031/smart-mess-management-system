import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FormInput } from '../../components/common/FormInput';
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog';
import { Settings, Save, RotateCcw, CheckCircle2, ShieldAlert } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, resetToDefaults } = useApp();

  const [formData, setFormData] = useState({
    messName: settings.messName,
    collegeName: settings.collegeName,
    defaultMealRate: settings.defaultMealRate,
    lateFeePerDay: settings.lateFeePerDay,
    minDaysForMessCut: settings.minDaysForMessCut,
    breakfastTiming: settings.timings.breakfast,
    lunchTiming: settings.timings.lunch,
    snacksTiming: settings.timings.snacks,
    dinnerTiming: settings.timings.dinner
  });

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      messName: formData.messName,
      collegeName: formData.collegeName,
      defaultMealRate: Number(formData.defaultMealRate),
      lateFeePerDay: Number(formData.lateFeePerDay),
      minDaysForMessCut: Number(formData.minDaysForMessCut),
      timings: {
        breakfast: formData.breakfastTiming,
        lunch: formData.lunchTiming,
        snacks: formData.snacksTiming,
        dinner: formData.dinnerTiming
      }
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleResetData = () => {
    resetToDefaults();
    setIsResetConfirmOpen(false);
    window.location.reload();
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            System Configuration & Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Institutional parameters, meal pricing rules, meal timings, and hostel policies
          </p>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Settings saved and applied successfully across all modules!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Organization Info */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Institution & Dining Facility Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Mess Facility Name"
              required
              value={formData.messName}
              onChange={(e) => setFormData({ ...formData, messName: e.target.value })}
            />
            <FormInput
              label="College / University Name"
              required
              value={formData.collegeName}
              onChange={(e) => setFormData({ ...formData, collegeName: e.target.value })}
            />
          </div>
        </div>

        {/* Pricing & Billing Policies */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Rates & Billing Policies
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormInput
              label="Default Base Rate per Meal (₹)"
              type="number"
              required
              value={formData.defaultMealRate}
              onChange={(e) => setFormData({ ...formData, defaultMealRate: Number(e.target.value) })}
              helperText="Charged per attended meal"
            />
            <FormInput
              label="Late Fee per Day (₹)"
              type="number"
              required
              value={formData.lateFeePerDay}
              onChange={(e) => setFormData({ ...formData, lateFeePerDay: Number(e.target.value) })}
              helperText="Applied post due date"
            />
            <FormInput
              label="Minimum Days for Mess Cut"
              type="number"
              required
              value={formData.minDaysForMessCut}
              onChange={(e) => setFormData({ ...formData, minDaysForMessCut: Number(e.target.value) })}
              helperText="Continuous leave required for rebate"
            />
          </div>
        </div>

        {/* Service Timings */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Dining Hall Service Timings
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Breakfast Timings"
              value={formData.breakfastTiming}
              onChange={(e) => setFormData({ ...formData, breakfastTiming: e.target.value })}
            />
            <FormInput
              label="Lunch Timings"
              value={formData.lunchTiming}
              onChange={(e) => setFormData({ ...formData, lunchTiming: e.target.value })}
            />
            <FormInput
              label="Evening Snacks Timings"
              value={formData.snacksTiming}
              onChange={(e) => setFormData({ ...formData, snacksTiming: e.target.value })}
            />
            <FormInput
              label="Dinner Timings"
              value={formData.dinnerTiming}
              onChange={(e) => setFormData({ ...formData, dinnerTiming: e.target.value })}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-xs transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>

      {/* Danger Zone: Reset Mock Data */}
      <div className="bg-rose-50/50 dark:bg-rose-950/20 rounded-xl border border-rose-200 dark:border-rose-900/50 p-5 space-y-3">
        <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-bold text-sm">
          <ShieldAlert className="w-4 h-4" />
          <span>Developer / Demo Data Control</span>
        </div>
        <p className="text-xs text-rose-600 dark:text-rose-300">
          Reset local changes, restored all 20 demo students, 3 managers, pantry inventory items, menus, and attendance records back to the fresh factory seed.
        </p>
        <button
          type="button"
          onClick={() => setIsResetConfirmOpen(true)}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-xs transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset All Mock Data to Default</span>
        </button>
      </div>

      {/* Reset Confirmation */}
      <ConfirmationDialog
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={handleResetData}
        title="Reset All Local Storage Data"
        message="Are you sure? All student edits, recorded cash payments, inventory adjustments, and custom notices will be wiped and replaced with default seeds."
        confirmText="Yes, Reset Factory Seeds"
      />
    </div>
  );
};
