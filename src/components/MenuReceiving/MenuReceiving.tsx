import React, { useState } from 'react';
import { ChefHat, Plus } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { useGoogleSheets } from '../../contexts/GoogleSheetsContext';
import { SyncStatusIndicator } from '../GoogleSheets/SyncStatusIndicator';

export function MenuReceiving() {
  const { products, addMenuReceiving, selectedOutlet, outlets } = useApp();
  const { user } = useAuth();
  const { updateSheet } = useGoogleSheets();
  
  const [formData, setFormData] = useState({
    dishName: '',
    productId: '',
    quantity: '',
    pricePerUnit: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedOutlet || !user) return;

    const menuReceivingData = {
      outletId: selectedOutlet,
      dishName: formData.dishName,
      productId: formData.productId,
      quantity: parseFloat(formData.quantity),
      pricePerUnit: parseFloat(formData.pricePerUnit),
      receivedBy: user.id,
    };

    addMenuReceiving(menuReceivingData);

    // Update Google Sheets
    try {
      const product = products.find(p => p.id === formData.productId);
      const outlet = outlets.find(o => o.id === selectedOutlet);
      
      const sheetData = {
        'Date': new Date().toISOString(),
        'Outlet': outlet?.name || '',
        'Dish Name': formData.dishName,
        'Ingredient': product?.name || '',
        'Quantity': formData.quantity,
        'Unit': product?.unit || '',
        'Price Per Unit': formData.pricePerUnit,
        'Total Cost': (parseFloat(formData.quantity) * parseFloat(formData.pricePerUnit)).toFixed(2),
        'Received By': user.name,
      };
      
      await updateSheet('menuReceiving', [sheetData]);
    } catch (error) {
      console.error('Failed to update Google Sheets:', error);
    }

    setFormData({
      dishName: '',
      productId: '',
      quantity: '',
      pricePerUnit: '',
    });

    alert('✅ Menu receiving logged successfully!');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Menu Receiving</h2>
          <p className="text-gray-600 mt-1">Log dish ingredients received from bulk preparation</p>
        </div>
        <SyncStatusIndicator sheetType="menuReceiving" showDetails />
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <ChefHat className="w-6 h-6 text-orange-600" />
          <h3 className="text-lg font-semibold text-gray-900">Log Menu Ingredient Receiving</h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Dish Name *</label>
              <input
                type="text"
                value={formData.dishName}
                onChange={(e) => setFormData(prev => ({ ...prev, dishName: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Enter dish name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ingredient *</label>
              <select
                value={formData.productId}
                onChange={(e) => setFormData(prev => ({ ...prev, productId: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              >
                <option value="">Select ingredient</option>
                {products.map(product => (
                  <option key={product.id} value={product.id}>
                    {product.name} ({product.unit})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quantity Received *</label>
              <input
                type="number"
                step="0.01"
                value={formData.quantity}
                onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Enter quantity"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price per Unit ($) *</label>
              <input
                type="number"
                step="0.01"
                value={formData.pricePerUnit}
                onChange={(e) => setFormData(prev => ({ ...prev, pricePerUnit: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Enter price per unit"
                required
              />
            </div>
          </div>

          {formData.quantity && formData.pricePerUnit && (
            <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium text-orange-900">Total Cost:</span>
                <span className="text-2xl font-bold text-orange-600">
                  ${(parseFloat(formData.quantity || '0') * parseFloat(formData.pricePerUnit || '0')).toFixed(2)}
                </span>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-3 rounded-xl hover:from-orange-600 hover:to-red-700 transition-all shadow-lg"
            >
              Log Menu Receiving
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}