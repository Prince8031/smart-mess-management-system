import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { InventoryItem } from '../../types';
import { DataTable, Column } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { FormInput } from '../../components/common/FormInput';
import { Select } from '../../components/common/Select';
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog';
import { PlusCircle, RefreshCw, Edit2, Trash2, Package, AlertTriangle } from 'lucide-react';

export const InventoryPage: React.FC = () => {
  const { inventory, addInventoryItem, updateInventoryItem, restockInventoryItem, deleteInventoryItem } = useApp();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [restockItem, setRestockItem] = useState<InventoryItem | null>(null);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);

  const [restockQty, setRestockQty] = useState(50);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Grains & Pulses',
    quantity: 100,
    unit: 'kg',
    minimumStock: 25,
    supplier: 'Metro Wholesale'
  });

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      category: 'Grains & Pulses',
      quantity: 100,
      unit: 'kg',
      minimumStock: 25,
      supplier: 'Metro Wholesale'
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      minimumStock: item.minimumStock,
      supplier: item.supplier || ''
    });
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = Number(formData.quantity);
    const min = Number(formData.minimumStock);
    const status: InventoryItem['status'] =
      qty === 0 ? 'Out of Stock' : qty <= min ? 'Low Stock' : 'In Stock';

    addInventoryItem({
      name: formData.name,
      category: formData.category,
      quantity: qty,
      unit: formData.unit,
      minimumStock: min,
      status,
      lastRestocked: new Date().toISOString().split('T')[0],
      supplier: formData.supplier
    });
    setIsAddModalOpen(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      const qty = Number(formData.quantity);
      const min = Number(formData.minimumStock);
      const status: InventoryItem['status'] =
        qty === 0 ? 'Out of Stock' : qty <= min ? 'Low Stock' : 'In Stock';

      updateInventoryItem(editingItem.id, {
        name: formData.name,
        category: formData.category,
        quantity: qty,
        unit: formData.unit,
        minimumStock: min,
        status,
        supplier: formData.supplier
      });
      setEditingItem(null);
    }
  };

  const handleConfirmRestock = (e: React.FormEvent) => {
    e.preventDefault();
    if (restockItem) {
      restockInventoryItem(restockItem.id, Number(restockQty));
      setRestockItem(null);
      setRestockQty(50);
    }
  };

  const columns: Column<InventoryItem>[] = [
    {
      header: 'Item Name',
      accessor: 'name',
      render: (row) => (
        <div>
          <span className="font-semibold text-slate-900 dark:text-white">{row.name}</span>
          <span className="block text-[11px] text-slate-400">Supplier: {row.supplier || 'Campus Central Store'}</span>
        </div>
      )
    },
    {
      header: 'Category',
      accessor: 'category'
    },
    {
      header: 'Available Stock',
      accessor: 'quantity',
      render: (row) => (
        <span className={`font-bold ${row.quantity <= row.minimumStock ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>
          {row.quantity} {row.unit}
        </span>
      )
    },
    {
      header: 'Minimum Level',
      accessor: 'minimumStock',
      render: (row) => <span className="text-slate-500 font-mono text-xs">{row.minimumStock} {row.unit}</span>
    },
    {
      header: 'Last Restocked',
      accessor: 'lastRestocked',
      render: (row) => <span className="text-xs text-slate-500">{row.lastRestocked}</span>
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
            onClick={() => {
              setRestockItem(row);
              setRestockQty(row.minimumStock * 2);
            }}
            title="Quick Restock"
            className="p-1.5 rounded-md text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleOpenEdit(row)}
            title="Edit Item"
            className="p-1.5 rounded-md text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeletingItemId(row.id)}
            title="Delete Item"
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
            Mess Raw Material & Inventory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Pantry provisions, ration monitoring, minimum buffer triggers and restock requests
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Inventory Item</span>
          </button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={inventory}
        keyExtractor={(item) => item.id}
        searchPlaceholder="Search pantry items, categories, suppliers..."
        searchKeys={['name', 'category', 'supplier', 'status']}
        itemsPerPage={10}
      />

      {/* Add Item Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Pantry Inventory Item"
        maxWidth="md"
      >
        <form onSubmit={handleSaveAdd} className="space-y-4">
          <FormInput
            label="Item Name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Basmati Rice, Mustard Oil, Toor Dal"
          />
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              options={['Grains & Pulses', 'Dairy', 'Vegetables', 'Cooking Essentials', 'Spices', 'Beverages']}
            />
            <FormInput
              label="Measuring Unit"
              required
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              placeholder="e.g. kg, Liters, Bags, Packets"
            />
            <FormInput
              label="Opening Quantity"
              type="number"
              required
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
            />
            <FormInput
              label="Minimum Stock Threshold"
              type="number"
              required
              value={formData.minimumStock}
              onChange={(e) => setFormData({ ...formData, minimumStock: Number(e.target.value) })}
              helperText="Alert triggered below this level"
            />
          </div>
          <FormInput
            label="Approved Supplier"
            value={formData.supplier}
            onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
            placeholder="e.g. Agro Foods Wholesaler"
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
              Add Item
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Item Modal */}
      <Modal
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
        title="Edit Inventory Item"
        maxWidth="md"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <FormInput
            label="Item Name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              options={['Grains & Pulses', 'Dairy', 'Vegetables', 'Cooking Essentials', 'Spices', 'Beverages']}
            />
            <FormInput
              label="Measuring Unit"
              required
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
            />
            <FormInput
              label="Current Quantity"
              type="number"
              required
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
            />
            <FormInput
              label="Minimum Threshold"
              type="number"
              required
              value={formData.minimumStock}
              onChange={(e) => setFormData({ ...formData, minimumStock: Number(e.target.value) })}
            />
          </div>
          <FormInput
            label="Supplier"
            value={formData.supplier}
            onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
          />

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
              Update Item
            </button>
          </div>
        </form>
      </Modal>

      {/* Restock Modal */}
      <Modal
        isOpen={!!restockItem}
        onClose={() => setRestockItem(null)}
        title="Replenish Pantry Stock"
        maxWidth="sm"
      >
        {restockItem && (
          <form onSubmit={handleConfirmRestock} className="space-y-4">
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-500">Item:</span>
              <p className="font-bold text-slate-900 dark:text-white text-sm">{restockItem.name}</p>
              <p className="text-xs text-slate-500">
                Current: {restockItem.quantity} {restockItem.unit} (Min buffer: {restockItem.minimumStock} {restockItem.unit})
              </p>
            </div>

            <FormInput
              label={`Additional Quantity to Inward (${restockItem.unit})`}
              type="number"
              required
              min={1}
              value={restockQty}
              onChange={(e) => setRestockQty(Number(e.target.value))}
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRestockItem(null)}
                className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg"
              >
                Inward & Restock
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={!!deletingItemId}
        onClose={() => setDeletingItemId(null)}
        onConfirm={() => {
          if (deletingItemId) deleteInventoryItem(deletingItemId);
        }}
        title="Delete Inventory Item"
        message="Are you sure you want to remove this grocery item from pantry records?"
        confirmText="Yes, Delete"
      />
    </div>
  );
};
