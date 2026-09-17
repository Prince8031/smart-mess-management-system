import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MenuItem } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { FormInput } from '../../components/common/FormInput';
import { Select } from '../../components/common/Select';
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog';
import { Utensils, Plus, Edit2, Trash2, Calendar, Flame, Clock } from 'lucide-react';

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
] as const;

export const MenuPage: React.FC = () => {
  const { menus, addMenuItem, updateMenuItem, deleteMenuItem } = useApp();

  const [selectedDay, setSelectedDay] = useState<typeof DAYS_OF_WEEK[number]>('Wednesday');
  const [activeCategory, setActiveCategory] = useState<'All' | 'Breakfast' | 'Lunch' | 'Snacks' | 'Dinner'>('All');
  const [viewMode, setViewMode] = useState<'day' | 'weekly'>('day');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Breakfast' as MenuItem['category'],
    itemsString: '',
    timing: '7:30 AM - 9:30 AM',
    calories: 450,
    dietType: 'Veg' as MenuItem['dietType'],
    dayOfWeek: 'Wednesday' as MenuItem['dayOfWeek']
  });

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      category: activeCategory === 'All' ? 'Breakfast' : activeCategory,
      itemsString: '',
      timing: '7:30 AM - 9:30 AM',
      calories: 450,
      dietType: 'Veg',
      dayOfWeek: selectedDay
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      itemsString: item.items.join(', '),
      timing: item.timing,
      calories: item.calories || 400,
      dietType: item.dietType,
      dayOfWeek: item.dayOfWeek
    });
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const itemsList = formData.itemsString
      .split(',')
      .map(i => i.trim())
      .filter(Boolean);

    addMenuItem({
      name: formData.name,
      category: formData.category,
      items: itemsList.length > 0 ? itemsList : ['Assorted items'],
      timing: formData.timing,
      calories: Number(formData.calories) || 450,
      dietType: formData.dietType,
      dayOfWeek: formData.dayOfWeek
    });
    setIsAddModalOpen(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      const itemsList = formData.itemsString
        .split(',')
        .map(i => i.trim())
        .filter(Boolean);

      updateMenuItem(editingItem.id, {
        name: formData.name,
        category: formData.category,
        items: itemsList.length > 0 ? itemsList : editingItem.items,
        timing: formData.timing,
        calories: Number(formData.calories),
        dietType: formData.dietType,
        dayOfWeek: formData.dayOfWeek
      });
      setEditingItem(null);
    }
  };

  // Filter menus
  const dayFilteredMenus = menus.filter(m => {
    if (m.dayOfWeek !== selectedDay) return false;
    if (activeCategory !== 'All' && m.category !== activeCategory) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Menu Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Design and schedule daily meals across Breakfast, Lunch, Snacks, and Dinner
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="p-1 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center gap-1 text-xs font-semibold">
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'day'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Daily View
            </button>
            <button
              onClick={() => setViewMode('weekly')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'weekly'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Weekly Schedule
            </button>
          </div>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Menu</span>
          </button>
        </div>
      </div>

      {viewMode === 'day' ? (
        <div className="space-y-4">
          {/* Day of week bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {DAYS_OF_WEEK.map(day => (
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

          {/* Meal category pills */}
          <div className="flex items-center gap-2">
            {(['All', 'Breakfast', 'Lunch', 'Snacks', 'Dinner'] as const).map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  activeCategory === cat
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Cards for meals */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dayFilteredMenus.map(menu => (
              <div
                key={menu.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400 border border-blue-200 dark:border-blue-900">
                        {menu.category}
                      </span>
                      <StatusBadge status={menu.dietType} size="sm" />
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(menu)}
                        className="p-1.5 rounded-md text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors"
                        title="Edit Menu"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingItemId(menu.id)}
                        className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Delete Menu"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-3">
                    {menu.name}
                  </h3>

                  <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {menu.timing}
                    </span>
                    <span className="flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-amber-500" />
                      {menu.calories} kcal
                    </span>
                  </div>

                  {/* Items list */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Included Dishes & Beverages:
                    </p>
                    <ul className="space-y-1.5">
                      {menu.items.map((it, idx) => (
                        <li
                          key={idx}
                          className="text-xs text-slate-700 dark:text-slate-300 flex items-center gap-2"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                          <span>{it}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Day: {menu.dayOfWeek}</span>
                  <span>Kitchen: Annapurna & Vindhya</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Weekly View */
        <div className="space-y-6">
          {DAYS_OF_WEEK.map(day => {
            const dayMenus = menus.filter(m => m.dayOfWeek === day);
            return (
              <div
                key={day}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span>{day}</span>
                  </h3>
                  <span className="text-xs text-slate-500 font-medium">
                    {dayMenus.length} Meals Planned
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {(['Breakfast', 'Lunch', 'Snacks', 'Dinner'] as const).map(cat => {
                    const m = dayMenus.find(item => item.category === cat);
                    return (
                      <div
                        key={cat}
                        className="p-3.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                              {cat}
                            </span>
                            {m && <StatusBadge status={m.dietType} size="sm" />}
                          </div>
                          {m ? (
                            <>
                              <p className="text-xs font-semibold text-slate-900 dark:text-white line-clamp-1">
                                {m.name}
                              </p>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                                {m.items.join(', ')}
                              </p>
                            </>
                          ) : (
                            <p className="text-xs text-slate-400 italic">No menu scheduled</p>
                          )}
                        </div>
                        {m && (
                          <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-[10px] text-slate-400 flex items-center justify-between">
                            <span>{m.timing}</span>
                            <span>{m.calories} kcal</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Menu Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Schedule New Menu"
        maxWidth="lg"
      >
        <form onSubmit={handleSaveAdd} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Menu Title"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. South Indian Feast / Rajma Thali"
            />
            <Select
              label="Meal Category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
              options={['Breakfast', 'Lunch', 'Snacks', 'Dinner']}
            />
            <Select
              label="Day of Week"
              value={formData.dayOfWeek}
              onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value as any })}
              options={DAYS_OF_WEEK.map(d => ({ value: d, label: d }))}
            />
            <Select
              label="Dietary Classification"
              value={formData.dietType}
              onChange={(e) => setFormData({ ...formData, dietType: e.target.value as any })}
              options={['Veg', 'Non-Veg', 'Special']}
            />
            <FormInput
              label="Service Timing"
              required
              value={formData.timing}
              onChange={(e) => setFormData({ ...formData, timing: e.target.value })}
              placeholder="e.g. 7:30 AM - 9:30 AM"
            />
            <FormInput
              label="Estimated Calories (kcal)"
              type="number"
              value={formData.calories}
              onChange={(e) => setFormData({ ...formData, calories: Number(e.target.value) })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Menu Items (comma-separated list)
            </label>
            <textarea
              rows={3}
              required
              value={formData.itemsString}
              onChange={(e) => setFormData({ ...formData, itemsString: e.target.value })}
              placeholder="e.g. Steamed Rice, Dal Tadka, Paneer Butter Masala, Roti, Gulab Jamun"
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 p-2.5 text-xs sm:text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
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
              Save Menu Item
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Menu Modal */}
      <Modal
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
        title="Edit Meal Menu"
        maxWidth="lg"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Menu Title"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <Select
              label="Meal Category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
              options={['Breakfast', 'Lunch', 'Snacks', 'Dinner']}
            />
            <Select
              label="Day of Week"
              value={formData.dayOfWeek}
              onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value as any })}
              options={DAYS_OF_WEEK.map(d => ({ value: d, label: d }))}
            />
            <Select
              label="Dietary Classification"
              value={formData.dietType}
              onChange={(e) => setFormData({ ...formData, dietType: e.target.value as any })}
              options={['Veg', 'Non-Veg', 'Special']}
            />
            <FormInput
              label="Service Timing"
              required
              value={formData.timing}
              onChange={(e) => setFormData({ ...formData, timing: e.target.value })}
            />
            <FormInput
              label="Estimated Calories (kcal)"
              type="number"
              value={formData.calories}
              onChange={(e) => setFormData({ ...formData, calories: Number(e.target.value) })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Menu Items (comma-separated list)
            </label>
            <textarea
              rows={3}
              required
              value={formData.itemsString}
              onChange={(e) => setFormData({ ...formData, itemsString: e.target.value })}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 p-2.5 text-xs sm:text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setEditingItem(null)}
              className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
            >
              Update Menu
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={!!deletingItemId}
        onClose={() => setDeletingItemId(null)}
        onConfirm={() => {
          if (deletingItemId) deleteMenuItem(deletingItemId);
        }}
        title="Delete Menu"
        message="Are you sure you want to remove this meal entry from the weekly schedule?"
        confirmText="Yes, Delete"
      />
    </div>
  );
};
