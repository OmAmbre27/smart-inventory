import React, { useState } from 'react';
import { ArrowRightLeft, Building, Package } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { useGoogleSheets } from '../../contexts/GoogleSheetsContext';
import { SyncStatusIndicator } from '../GoogleSheets/SyncStatusIndicator';

export function OutletTransfer() {
  const { outlets, products, addOutletTransfer, getInventoryByOutlet } = useApp();
  const { user } = useAuth();
  const { updateSheet } = useGoogleSheets();
  
  const [formData, setFormData] = useState({
    fromOutletId: '',
    toOutletId: '',
    productId: '',
    quantity: '',
    transferPrice: '',
    notes: '',
  });

  const [transferHistory, setTransferHistory] = useState<any[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    // Check if source outlet has enough stock
    const sourceInventory = getInventoryByOutlet(formData.fromOutletId);
    const availableStock = sourceInventory
      .filter(item => item.productId === formData.productId)
      .reduce((sum, item) => sum + item.quantity, 0);

    if (availableStock < parseFloat(formData.quantity)) {
      alert('❌ Insufficient stock in source outlet');
      return;
    }

    const transferData = {
      fromOutletId: formData.fromOutletId,
      toOutletId: formData.toOutletId,
      productId: formData.productId,
      quantity: parseFloat(formData.quantity),
      transferPrice: parseFloat(formData.transferPrice),
      notes: formData.notes || undefined,
      transferredBy: user.id,
    };

    addOutletTransfer(transferData);

    // Update Google Sheets
    try {
      const product = products.find(p => p.id === formData.productId);
      const fromOutlet = outlets.find(o => o.id === formData.fromOutletId);
      const toOutlet = outlets.find(o => o.id === formData.toOutletId);
      
      const sheetData = {
        'Date': new Date().toISOString(),
        'From Outlet': fromOutlet?.name || '',
        'To Outlet': toOutlet?.name || '',
        'Product': product?.name || '',
        'Quantity': formData.quantity,
        'Unit': product?.unit || '',
        'Transfer Price': formData.transferPrice,
        'Notes': formData.notes || '',
        'Transferred By': user.name,
      };
      
      await updateSheet('outletTransfers', [sheetData]);
    } catch (error) {
      console.error('Failed to update Google Sheets:', error);
    }

    setFormData({
      fromOutletId: '',
      toOutletId: '',
      productId: '',
      quantity: '',
      transferPrice: '',
      notes: '',
    });

    alert('✅ Transfer completed successfully!');
  };

  const getAvailableStock = () => {
    if (!formData.fromOutletId || !formData.productId) return 0;
    
    const inventory = getInventoryByOutlet(formData.fromOutletId);
    return inventory
      .filter(item => item.productId === formData.productId)
      .reduce((sum, item) => sum + item.quantity, 0);
  };

  const selectedProduct = products.find(p => p.id === formData.productId);
  const availableStock = getAvailableStock();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Outlet Transfer</h2>
          <p className="text-gray-600 mt-1">Transfer inventory between outlets</p>
        </div>
        <SyncStatusIndicator sheetType="outletTransfers" showDetails />
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <ArrowRightLeft className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">New Transfer</h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">From Outlet *</label>
              <select
                value={formData.fromOutletId}
                onChange={(e) => setFormData(prev => ({ ...prev, fromOutletId: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select source outlet</option>
                {outlets.map(outlet => (
                  <option key={outlet.id} value={outlet.id}>{outlet.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">To Outlet *</label>
              <select
                value={formData.toOutletId}
                onChange={(e) => setFormData(prev => ({ ...prev, toOutletId: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select destination outlet</option>
                {outlets.filter(outlet => outlet.id !== formData.fromOutletId).map(outlet => (
                  <option key={outlet.id} value={outlet.id}>{outlet.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Product *</label>
              <select
                value={formData.productId}
                onChange={(e) => setFormData(prev => ({ ...prev, productId: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select product</option>
                {products.map(product => (
                  <option key={product.id} value={product.id}>
                    {product.name} ({product.unit})
                  </option>
                ))}
              </select>
              {formData.fromOutletId && formData.productId && (
                <p className="text-sm text-gray-500 mt-1">
                  Available: {availableStock} {selectedProduct?.unit}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity * {selectedProduct && `(${selectedProduct.unit})`}
              </label>
              <input
                type="number"
                step="0.01"
                max={availableStock}
                value={formData.quantity}
                onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter quantity to transfer"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Transfer Price ($) *</label>
              <input
                type="number"
                step="0.01"
                value={formData.transferPrice}
                onChange={(e) => setFormData(prev => ({ ...prev, transferPrice: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter transfer price"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Add transfer notes..."
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!formData.fromOutletId || !formData.toOutletId || availableStock < parseFloat(formData.quantity || '0')}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg disabled:opacity-50"
            >
              Complete Transfer
            </button>
          </div>
        </form>
      </div>

      {/* Transfer Summary */}
      {formData.fromOutletId && formData.toOutletId && formData.productId && formData.quantity && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-4">Transfer Summary</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <Building className="w-4 h-4 text-blue-600" />
              <span className="text-blue-800">
                From: {outlets.find(o => o.id === formData.fromOutletId)?.name}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <ArrowRightLeft className="w-4 h-4 text-blue-600" />
              <span className="text-blue-800">
                To: {outlets.find(o => o.id === formData.toOutletId)?.name}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Package className="w-4 h-4 text-blue-600" />
              <span className="text-blue-800">
                {formData.quantity} {selectedProduct?.unit} of {selectedProduct?.name}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}