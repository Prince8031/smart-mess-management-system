import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Calendar, Clock, Flame, Utensils, Heart } from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;

export const StudentMenuPage: React.FC = () => {
  const { menus, currentUser } = useApp();

  const [selectedDay, setSelectedDay] = useState<typeof DAYS[number]>('Monday');
  const [selectedMeal, setSelectedMeal] = useState<'All' | 'Breakfast' | 'Lunch' | 'Snacks' | 'Dinner'>('All');

  const filteredMenus = menus.filter(m => {
    if (m.dayOfWeek !== selectedDay) return false;
    if (selectedMeal !== 'All' && m.category !== selectedMeal) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
              GEC Sheikhpura
            </span>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              Hostel 2 Weekly Menu
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Hostel Dining Menu & Timings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Nutritional information, chef specials, and weekly dining schedules (Subject to seasonal availability)
          </p>
        </div>
      </div>

      {/* Day Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {DAYS.map(day => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedDay === day
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2">
        {(['All', 'Breakfast', 'Lunch', 'Snacks', 'Dinner'] as const).map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedMeal(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              selectedMeal === cat
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Meal Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredMenus.map(menu => (
          <div
            key={menu.id}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400 border border-blue-200 dark:border-blue-900">
                  {menu.category}
                </span>
                <div className="flex items-center gap-2">
                  <StatusBadge status={menu.dietType} size="sm" />
                  <span className="text-xs text-amber-600 font-semibold flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5" />
                    {menu.calories} kcal
                  </span>
                </div>
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-white mt-3">
                {menu.name}
              </h3>

              <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{menu.timing}</span>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Items on Counter:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {menu.items.map((it, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-md text-xs bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                    >
                      {it}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span>Day: {menu.dayOfWeek}</span>
              <span>Kitchen: Hostel 2 Central Mess</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
