import React, { useState } from 'react';
import { Trash2, AlertTriangle, Camera, Plus } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { useGoogleSheets } from '../../contexts/GoogleSheetsContext';
import { SyncStatusIndicator } from '../GoogleSheets/SyncStatusIndicator';

export function WastageLog() {
  const { wastageEntries, addWastageEntry, products, selectedOutlet } = useApp();
  const { user } = useAuth();
  const { updateSheet } = useGoogleSheets();
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    productId: '',
    quantity: '',
    reason: '',
    photoUrl: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedOutlet || !user) return;

    const wastageData = {
      productId: formData.productId,
      outletId: selectedOutlet,
      quantity: parseFloat(formData.quantity),
      reason: formData.reason,
      photoUrl: formData.photoUrl || undefined,
      flaggedBy: user.id,
    };

    addWastageEntry(wastageData);

    // Update Google Sheets
    try {
      const product = products.find(p => p.id === formData.productId);
      const sheetData = {
        'Date': new Date().toISOString(),
        'Product': product?.name || '',
        'Quantity': formData.quantity,
        'Unit': product?.unit || '',
        'Reason': formData.reason,
        'Flagged By': user.name,
        'Outlet': selectedOutlet,
      };
      
      await updateSheet('wastage', [sheetData]);
    } catch (error) {
      console.error('Failed to update Google Sheets:', error);
    }

    setFormData({ productId: '', quantity: '', reason: '', photoUrl: '' });
    setShowAddForm(false);
  };

  const outletWastage = wastageEntries.filter(entry => entry.outletId === selectedOutlet);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Wastage Log</h2>
          <p className="text-gray-600 mt-1">Track and manage food wastage and spoilage</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <SyncStatusIndicator sheetType="wastage" showDetails />
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center space-x-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl hover:from-red-600 hover:to-red-700 transition-all shadow-lg"
          >
            <Plus className="w-5 h-5" />
            <span>Log Wastage</span>
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Trash2 className="w-6 h-6 text-red-600" />
            <h3 className="text-lg font-semibold text-gray-900">Log Wastage Entry</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product *</label>
                <select
                  value={formData.productId}
                  onChange={(e) => setFormData(prev => ({ ...prev, productId: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.quantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Enter quantity wasted"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Reason *</label>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Describe the reason for wastage (e.g., expired, damaged, overcooked)"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Photo Evidence (Optional)</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Camera className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">Click to upload photo or drag and drop</p>
                <input
                  type="file"
                  accept="image/*"
                  className="mt-2"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all"
              >
                Log Wastage
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Wastage Entries ({outletWastage.length})</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reason
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Flagged By
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {outletWastage.map((entry) => {
                const product = products.find(p => p.id === entry.productId);
                return (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(entry.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <AlertTriangle className="w-4 h-4 text-red-600 mr-2" />
                        <span className="text-sm font-medium text-gray-900">
                          {product?.name || 'Unknown Product'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {entry.quantity} {product?.unit}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900">{entry.reason}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user?.name || 'Unknown User'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {outletWastage.length === 0 && (
          <div className="text-center py-12">
            <Trash2 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No wastage entries found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Wastage entries will appear here once you start logging them.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}