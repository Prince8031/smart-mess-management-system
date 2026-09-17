import React from 'react';

interface StatusBadgeProps {
  status: string;
  variant?: 'solid' | 'subtle';
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, variant = 'subtle', size = 'sm' }) => {
  const getColors = () => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'in stock':
      case 'paid':
      case 'completed':
      case 'resolved':
      case 'present':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800';
      case 'low stock':
      case 'in progress':
      case 'partially paid':
      case 'pending':
      case 'medium':
      case 'important':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800';
      case 'out of stock':
      case 'overdue':
      case 'failed':
      case 'high':
      case 'urgent':
      case 'inactive':
      case 'absent':
        return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800';
      case 'on leave':
      case 'special':
      case 'low':
      case 'normal':
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800';
      case 'veg':
        return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-400 dark:border-green-800';
      case 'non-veg':
        return 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-800';
      case 'jain':
        return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-800';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
    }
  };

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs sm:text-sm';

  return (
    <span className={`inline-flex items-center font-medium rounded-md border ${sizeClasses} ${getColors()} whitespace-nowrap`}>
      {status}
    </span>
  );
};
