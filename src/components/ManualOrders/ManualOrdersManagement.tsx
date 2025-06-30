import React, { useState } from 'react';
import { ManualOrderEntry } from './ManualOrderEntry';
import { ManualOrdersTable } from './ManualOrdersTable';
import { Plus } from 'lucide-react';

export function ManualOrdersManagement() {
  const [showAddForm, setShowAddForm] = useState(false);

  if (showAddForm) {
    return <ManualOrderEntry onBack={() => setShowAddForm(false)} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Manual Order Entry</h2>
          <p className="text-gray-600 mt-1">Record orders from various sources and update inventory</p>
        </div>
        
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all shadow-lg"
        >
          <Plus className="w-5 h-5" />
          <span>Add Manual Order</span>
        </button>
      </div>

      <ManualOrdersTable />
    </div>
  );
}