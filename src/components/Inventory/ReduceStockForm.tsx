import React, { useState } from 'react';
import { ArrowLeft, Minus } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';

interface ReduceStockFormProps {
  onBack: () => void;
}

export function ReduceStockForm({ onBack }: ReduceStockFormProps) {
  const { products, getInventoryByOutlet, reduceStock, selectedOutlet } = useApp();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    productId: '',
    quantity: '',
    reason: 'sold' as const,
    notes: '',
  });

  if (!selectedOutlet) return null;

  const inventory = getInventoryByOutlet(selectedOutlet);
  const availableProducts = products.filter(product => 
    inventory.some(item => item.productId === product.id && item.quantity > 0)
  );

  const selectedProduct = products.find(p => p.id === formData.productId);
  const availableQuantity = inventory
    .filter(item => item.productId === formData.productId)
    .reduce((sum, item) => sum + item.quantity, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedOutlet || !user) return;

    reduceStock({
      productId: formData.productId,
      outletId: selectedOutlet,
      quantity: parseFloat(formData.quantity),
      reason: formData.reason,
      notes: formData.notes || undefined,
      reducedBy: user.id,
    });

    onBack();
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-3">
            <Minus className="w-6 h-6 text-red-600" />
            <h2 className="text-lg font-semibold text-gray-900">Reduce Stock</h2>
          </div>
        </div>
      </div>

      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Item Name *</label>
              <select
                value={formData.productId}
                onChange={(e) => setFormData(prev => ({ ...prev, productId: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              >
                <option value="">Select item</option>
                {availableProducts.map(product => {
                  const qty = inventory
                    .filter(item => item.productId === product.id)
                    .reduce((sum, item) => sum + item.quantity, 0);
                  return (
                    <option key={product.id} value={product.id}>
                      {product.name} (Available: {qty} {product.unit})
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity * {selectedProduct && `(${selectedProduct.unit})`}
              </label>
              <input
                type="number"
                step="0.01"
                max={availableQuantity}
                value={formData.quantity}
                onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Enter quantity to reduce"
                required
              />
              {selectedProduct && (
                <p className="text-sm text-gray-500 mt-1">
                  Available: {availableQuantity} {selectedProduct.unit}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Reason *</label>
              <select
                value={formData.reason}
                onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value as any }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              >
                <option value="sold">Sold</option>
                <option value="spoilage">Spoilage</option>
                <option value="theft">Theft</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Add any additional notes..."
            />
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onBack}
              className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all"
            >
              Reduce Stock
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}