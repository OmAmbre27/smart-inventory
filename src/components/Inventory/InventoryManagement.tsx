import React, { useState } from 'react';
import { InventoryTable } from './InventoryTable';
import { AddInventoryForm } from './AddInventoryForm';
import { ReduceStockForm } from './ReduceStockForm';
import { LowStockThresholds } from '../Advanced/LowStockThresholds';
import { useAuth } from '../../contexts/AuthContext';

export function InventoryManagement() {
  const [activeView, setActiveView] = useState<'list' | 'add' | 'reduce' | 'thresholds'>('list');
  const { hasPermission } = useAuth();

  const renderContent = () => {
    switch (activeView) {
      case 'add':
        return <AddInventoryForm onBack={() => setActiveView('list')} />;
      case 'reduce':
        return <ReduceStockForm onBack={() => setActiveView('list')} />;
      case 'thresholds':
        return <LowStockThresholds />;
      default:
        return (
          <InventoryTable 
            onAddInventory={() => setActiveView('add')}
            onReduceStock={() => setActiveView('reduce')}
            onManageThresholds={() => setActiveView('thresholds')}
          />
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Inventory Management</h2>
          <p className="text-gray-600 mt-1">Manage your stock levels and track inventory</p>
        </div>
        
        {activeView === 'list' && (
          <div className="flex space-x-3">
            {hasPermission('add_inventory') && (
              <button
                onClick={() => setActiveView('add')}
                className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-lg"
              >
                Add Inventory
              </button>
            )}
            {hasPermission('reduce_inventory') && (
              <button
                onClick={() => setActiveView('reduce')}
                className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl hover:from-red-600 hover:to-red-700 transition-all shadow-lg"
              >
                Reduce Stock
              </button>
            )}
          </div>
        )}

        {activeView === 'thresholds' && (
          <button
            onClick={() => setActiveView('list')}
            className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-6 py-3 rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all shadow-lg"
          >
            Back to Inventory
          </button>
        )}
      </div>

      {renderContent()}
    </div>
  );
}