import React, { useState, useEffect } from 'react';
import { AlertTriangle, Settings, Save, Edit, Trash2, Plus } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';

interface LowStockThreshold {
  id: string;
  productId: string;
  outletId: string;
  threshold: number;
  reason?: string;
  setBy: string;
  lastUpdated: string;
}

export function LowStockThresholds() {
  const { products, selectedOutlet, outlets } = useApp();
  const { user, hasPermission } = useAuth();
  const [thresholds, setThresholds] = useState<LowStockThreshold[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingThreshold, setEditingThreshold] = useState<LowStockThreshold | null>(null);
  
  const [formData, setFormData] = useState({
    productId: '',
    threshold: '',
    reason: '',
  });

  useEffect(() => {
    // Load existing thresholds from localStorage
    const savedThresholds = localStorage.getItem('lowStockThresholds');
    if (savedThresholds) {
      setThresholds(JSON.parse(savedThresholds));
    }
  }, []);

  const saveThresholds = (newThresholds: LowStockThreshold[]) => {
    setThresholds(newThresholds);
    localStorage.setItem('lowStockThresholds', JSON.stringify(newThresholds));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedOutlet || !user) return;

    if (editingThreshold) {
      const updatedThresholds = thresholds.map(t => 
        t.id === editingThreshold.id 
          ? {
              ...t,
              threshold: parseFloat(formData.threshold),
              reason: formData.reason,
              setBy: user.id,
              lastUpdated: new Date().toISOString(),
            }
          : t
      );
      saveThresholds(updatedThresholds);
      setEditingThreshold(null);
    } else {
      const newThreshold: LowStockThreshold = {
        id: Date.now().toString(),
        productId: formData.productId,
        outletId: selectedOutlet,
        threshold: parseFloat(formData.threshold),
        reason: formData.reason,
        setBy: user.id,
        lastUpdated: new Date().toISOString(),
      };
      saveThresholds([...thresholds, newThreshold]);
    }

    setFormData({ productId: '', threshold: '', reason: '' });
    setShowAddForm(false);
  };

  const handleEdit = (threshold: LowStockThreshold) => {
    setEditingThreshold(threshold);
    setFormData({
      productId: threshold.productId,
      threshold: threshold.threshold.toString(),
      reason: threshold.reason || '',
    });
    setShowAddForm(true);
  };

  const handleDelete = (thresholdId: string) => {
    const updatedThresholds = thresholds.filter(t => t.id !== thresholdId);
    saveThresholds(updatedThresholds);
  };

  const outletThresholds = thresholds.filter(t => t.outletId === selectedOutlet);
  const canManageThresholds = hasPermission('manage_inventory') || hasPermission('view_reports');

  if (!canManageThresholds) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-red-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
        <p className="text-gray-600">You don't have permission to manage stock thresholds.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Low Stock Thresholds</h2>
          <p className="text-gray-600 mt-1">Set minimum stock levels for automatic alerts</p>
        </div>
        
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-3 rounded-xl hover:from-orange-600 hover:to-red-700 transition-all shadow-lg"
        >
          <Plus className="w-5 h-5" />
          <span>Set Threshold</span>
        </button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Settings className="w-6 h-6 text-orange-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              {editingThreshold ? 'Edit Threshold' : 'Set New Threshold'}
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product *</label>
                <select
                  value={formData.productId}
                  onChange={(e) => setFormData(prev => ({ ...prev, productId: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                  disabled={!!editingThreshold}
                >
                  <option value="">Select product</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name} ({product.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Threshold *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.threshold}
                  onChange={(e) => setFormData(prev => ({ ...prev, threshold: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Enter minimum quantity"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Reason/Notes</label>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Why this threshold? (e.g., High demand item, Long lead time)"
              />
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingThreshold(null);
                  setFormData({ productId: '', threshold: '', reason: '' });
                }}
                className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl hover:from-orange-600 hover:to-red-700 transition-all"
              >
                <Save className="w-4 h-4 inline mr-2" />
                {editingThreshold ? 'Update Threshold' : 'Set Threshold'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Thresholds Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Current Thresholds ({outletThresholds.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Threshold
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reason
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Set By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Updated
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {outletThresholds.map((threshold) => {
                const product = products.find(p => p.id === threshold.productId);
                return (
                  <tr key={threshold.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {product?.name || 'Unknown Product'}
                      </div>
                      <div className="text-sm text-gray-500">{product?.category}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-orange-600">
                        {threshold.threshold} {product?.unit}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {threshold.reason || 'No reason provided'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user?.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(threshold.lastUpdated).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(threshold)}
                          className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded"
                          title="Edit Threshold"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(threshold.id)}
                          className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded"
                          title="Delete Threshold"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {outletThresholds.length === 0 && (
          <div className="text-center py-12">
            <Settings className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No thresholds set</h3>
            <p className="mt-1 text-sm text-gray-500">
              Set minimum stock thresholds to receive automatic alerts.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}