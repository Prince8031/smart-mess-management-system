import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  Utensils,
  Clock,
  Flame,
  Calendar,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Share2,
  Printer,
  ChevronRight,
  Info,
  ThumbsUp,
  Star,
  Check
} from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;

interface MealEmojiMap {
  [key: string]: string;
}

const MEAL_ICONS: MealEmojiMap = {
  Breakfast: '🥘',
  Lunch: '🍚',
  Snacks: '🍨',
  Dinner: '🫓'
};

export const TodayMenuPage: React.FC = () => {
  const navigate = useNavigate();
  const { menus, settings, currentUser } = useApp();

  // Selected day: default to Monday which has the user's specific requested Today's Menu
  const [selectedDay, setSelectedDay] = useState<typeof DAYS[number]>('Monday');
  const [activeTab, setActiveTab] = useState<'today' | 'weekly'>('today');
  const [attendancePreferences, setAttendancePreferences] = useState<{ [key: string]: boolean }>({
    Breakfast: true,
    Lunch: true,
    Snacks: true,
    Dinner: true
  });
  const [feedbackSent, setFeedbackSent] = useState<string | null>(null);
  const [starRatings, setStarRatings] = useState<{ [key: string]: number }>({
    Breakfast: 5,
    Lunch: 5,
    Snacks: 5,
    Dinner: 5
  });

  const dayMenus = menus.filter(m => m.dayOfWeek === selectedDay);

  const mealOrder = ['Breakfast', 'Lunch', 'Snacks', 'Dinner'] as const;
  const orderedMeals = mealOrder.map(cat => {
    return dayMenus.find(m => m.category === cat) || {
      id: `fallback-${cat}`,
      name: `${cat} Service`,
      category: cat,
      items: cat === 'Breakfast'
        ? ['Aalu Paratha', 'Dahi', 'Sauce']
        : cat === 'Lunch'
        ? ['Chawal', 'Masoor Dal', 'Mausami Sabji']
        : cat === 'Snacks'
        ? ['Ice Cream']
        : ['Roti', 'Chawal', 'Mausami Sabji'],
      timing: cat === 'Breakfast' ? '7:30 AM - 9:30 AM' : cat === 'Lunch' ? '12:30 PM - 2:30 PM' : cat === 'Snacks' ? '5:00 PM - 6:30 PM' : '8:00 PM - 10:00 PM',
      calories: 450,
      dietType: 'Veg',
      dayOfWeek: selectedDay
    };
  });

  const toggleAttendance = (mealCategory: string) => {
    setAttendancePreferences(prev => ({
      ...prev,
      [mealCategory]: !prev[mealCategory]
    }));
  };

  const handleRating = (mealCategory: string, rating: number) => {
    setStarRatings(prev => ({
      ...prev,
      [mealCategory]: rating
    }));
    setFeedbackSent(`Thank you! Rated ${rating}★ for ${mealCategory}`);
    setTimeout(() => setFeedbackSent(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-white backdrop-blur-xs tracking-wide uppercase">
                GEC Sheikhpura
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-400/20 text-amber-200 border border-amber-300/30">
                Hostel 2 • Official Mess Timetable
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-2.5">
              <span>🍽️</span>
              <span>Today's Dining Hall Menu</span>
            </h1>
            <p className="text-sm text-blue-100/90 max-w-2xl leading-relaxed">
              Freshly cooked nutritional meals following the GEC Sheikhpura Hostel 2 weekly roster.
              Items are prepared fresh in the central dining kitchen.
            </p>
          </div>

          {/* Quick Actions & Navigation Toggle */}
          <div className="flex items-center gap-2 flex-wrap sm:self-start">
            <div className="inline-flex p-1 rounded-xl bg-white/10 backdrop-blur-xs border border-white/15">
              <button
                onClick={() => setActiveTab('today')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'today'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                Today's Cards
              </button>
              <button
                onClick={() => setActiveTab('weekly')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'weekly'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                Full Weekly Roster
              </button>
            </div>
            <button
              onClick={() => window.print()}
              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/15 flex items-center gap-1.5 transition-colors"
              title="Print Menu"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print</span>
            </button>
          </div>
        </div>

        {/* Day of Week Selector */}
        <div className="mt-6 pt-4 border-t border-white/15 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-medium text-blue-200 mr-1 whitespace-nowrap">
            Select Day:
          </span>
          {DAYS.map(day => {
            const isToday = day === 'Monday';
            const isSelected = selectedDay === day;
            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <span>{day}</span>
                {isToday && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-900 text-amber-300 font-bold">
                    Today
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {feedbackSent && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-medium flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>{feedbackSent}</span>
        </div>
      )}

      {/* View Mode: Today's Detailed Meal Cards */}
      {activeTab === 'today' ? (
        <div className="space-y-6">
          {/* Quick Summary Pill Bar */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="font-semibold text-slate-900 dark:text-white">
                {selectedDay} Schedule Overview:
              </span>
              <span>4 Main Meals • 100% Hygienic Food Standard</span>
            </div>
            <div className="flex items-center gap-4 text-slate-500">
              <span>Breakfast: 7:30 - 9:30 AM</span>
              <span>Lunch: 12:30 - 2:30 PM</span>
              <span>Snacks: 5:00 - 6:30 PM</span>
              <span>Dinner: 8:00 - 10:00 PM</span>
            </div>
          </div>

          {/* 4 Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {orderedMeals.map(meal => {
              const emoji = MEAL_ICONS[meal.category] || '🍽️';
              const isAttending = attendancePreferences[meal.category] ?? true;

              return (
                <div
                  key={meal.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-200"
                >
                  <div className="space-y-4">
                    {/* Card Top: Category & Badge */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl p-2 rounded-xl bg-slate-100 dark:bg-slate-800">
                          {emoji}
                        </span>
                        <div>
                          <span className="text-xs font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                            {meal.category}
                          </span>
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-mono">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>{meal.timing}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <StatusBadge status={meal.dietType} size="sm" />
                        <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-md border border-amber-200/50 dark:border-amber-800/40">
                          <Flame className="w-3 h-3" />
                          {meal.calories} kcal
                        </span>
                      </div>
                    </div>

                    {/* Meal Title */}
                    <div>
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                        {meal.name}
                      </h2>
                    </div>

                    {/* Items List as requested by User */}
                    <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        Included Dishes & Counter Items:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {meal.items.map((item, idx) => {
                          let itemEmoji = '•';
                          if (item.toLowerCase().includes('paratha')) itemEmoji = '🥘';
                          else if (item.toLowerCase().includes('dahi')) itemEmoji = '🥣';
                          else if (item.toLowerCase().includes('chawal')) itemEmoji = '🍚';
                          else if (item.toLowerCase().includes('dal') || item.toLowerCase().includes('daal')) itemEmoji = '🥣';
                          else if (item.toLowerCase().includes('sabji') || item.toLowerCase().includes('bhujia')) itemEmoji = '🥗';
                          else if (item.toLowerCase().includes('ice cream')) itemEmoji = '🍨';
                          else if (item.toLowerCase().includes('roti') || item.toLowerCase().includes('poori')) itemEmoji = '🫓';
                          else if (item.toLowerCase().includes('tea') || item.toLowerCase().includes('chai')) itemEmoji = '☕';
                          else if (item.toLowerCase().includes('chips') || item.toLowerCase().includes('lays')) itemEmoji = '🥔';
                          else if (item.toLowerCase().includes('chicken') || item.toLowerCase().includes('fish')) itemEmoji = '🍗';
                          else if (item.toLowerCase().includes('sweet') || item.toLowerCase().includes('kheer') || item.toLowerCase().includes('booniya') || item.toLowerCase().includes('jalebi')) itemEmoji = '🍬';

                          return (
                            <span
                              key={idx}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/70 dark:border-slate-700/60 flex items-center gap-1.5"
                            >
                              <span>{itemEmoji}</span>
                              <span>{item}</span>
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom: Dining Action & Rating */}
                  <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1">
                        <span className="text-slate-400 font-medium">Chef Rating:</span>
                        <div className="flex items-center gap-0.5 text-amber-400">
                          {[1, 2, 3, 4, 5].map(star => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => handleRating(meal.category, star)}
                              className="hover:scale-125 transition-transform"
                              title={`Rate ${star} Stars`}
                            >
                              <Star
                                className={`w-3.5 h-3.5 ${
                                  (starRatings[meal.category] || 5) >= star
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-slate-300 dark:text-slate-600'
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={() => toggleAttendance(meal.category)}
                        className={`px-2.5 py-1 rounded-md font-semibold text-[11px] transition-colors flex items-center gap-1 ${
                          isAttending
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {isAttending ? (
                          <>
                            <Check className="w-3 h-3" />
                            <span>Attending</span>
                          </>
                        ) : (
                          <span>Marked Skip</span>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Full Weekly Timetable Grid from Image */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                GEC SHEIKHPURA • HOSTEL 2 - WEEKLY MENU
              </h2>
              <p className="text-xs text-slate-500">
                Official 7-day meal schedule for all hostel inmates
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              Active Timetable
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-900 text-white font-bold border-b border-slate-800">
                  <th className="p-3.5 font-bold uppercase tracking-wider w-28">DAY</th>
                  <th className="p-3.5 font-bold uppercase tracking-wider">BREAKFAST</th>
                  <th className="p-3.5 font-bold uppercase tracking-wider">LUNCH</th>
                  <th className="p-3.5 font-bold uppercase tracking-wider">SNACKS</th>
                  <th className="p-3.5 font-bold uppercase tracking-wider">DINNER</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {DAYS.map(day => {
                  const mDay = menus.filter(m => m.dayOfWeek === day);
                  const bf = mDay.find(m => m.category === 'Breakfast');
                  const lu = mDay.find(m => m.category === 'Lunch');
                  const sn = mDay.find(m => m.category === 'Snacks');
                  const di = mDay.find(m => m.category === 'Dinner');
                  const isCurrentSelected = day === selectedDay;

                  return (
                    <tr
                      key={day}
                      onClick={() => {
                        setSelectedDay(day);
                        setActiveTab('today');
                      }}
                      className={`cursor-pointer transition-colors ${
                        isCurrentSelected
                          ? 'bg-blue-50/70 dark:bg-blue-950/30'
                          : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      <td className="p-3.5 font-extrabold text-slate-900 dark:text-white border-r border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                        <div className="flex items-center gap-1.5">
                          <span>{day.toUpperCase()}</span>
                          {day === 'Monday' && (
                            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">
                              ★
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3.5 text-slate-700 dark:text-slate-300 font-medium">
                        {bf?.items.join(', ') || 'Aallu Paratha, Sauce, Dahi (1 dabu)'}
                      </td>
                      <td className="p-3.5 text-slate-700 dark:text-slate-300 font-medium">
                        {lu?.items.join(', ') || 'Chawal, Masoor Dal, Mausami Sabji, Chips'}
                      </td>
                      <td className="p-3.5 text-slate-700 dark:text-slate-300 font-medium">
                        {sn?.items.join(', ') || 'Ice Cream (Poha + Sev + Lemon Tea)'}
                      </td>
                      <td className="p-3.5 text-slate-700 dark:text-slate-300 font-medium">
                        {di?.items.join(', ') || 'Roti, Chawal, Mausami Sabji, Salaad, Channa Fry Daal'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Official Footer Note from Photo */}
      <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200 text-xs font-semibold flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span>NOTE: MENU IS SUBJECT TO CHANGE AS PER SEASONAL AVAILABILITY & WARDEN APPROVAL</span>
        </div>
        <button
          onClick={() => navigate('/student/menu')}
          className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
        >
          <span>Nutritional Details</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
