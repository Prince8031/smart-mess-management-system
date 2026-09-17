import React from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Bell, Calendar, UserCheck } from 'lucide-react';

export const StudentNoticesPage: React.FC = () => {
  const { notices } = useApp();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Mess Announcements & Circulars
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Official bulletins regarding festival feasts, kitchen maintenance, mess cuts and voting polls
        </p>
      </div>

      <div className="space-y-4">
        {notices.map(notice => (
          <div
            key={notice.id}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-3"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <StatusBadge status={notice.priority} size="sm" />
                <span className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  Target: {notice.targetAudience}
                </span>
              </div>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {notice.date}
              </span>
            </div>

            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {notice.title}
            </h3>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {notice.description}
            </p>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-blue-500" />
              <span>Announced by: <strong>{notice.postedBy}</strong></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
