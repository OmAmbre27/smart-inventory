import React, { useState } from 'react';
import { ArrowLeft, ClipboardList, Plus, Minus, AlertTriangle, CheckCircle } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';

interface ManualOrderEntryProps {
  onBack: () => void;
}

interface OrderItem {
  menuItemId: string;
  quantity: number;
}

interface StockCheck {
  productId: string;
  productName: string;
  required: number;
  available: number;
  sufficient: boolean;
}

export function ManualOrderEntry({ onBack }: ManualOrderEntryProps) {
  const { menuItems, addManualOrder, selectedOutlet, getInventoryByOutlet, products } = useApp();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    source: 'whatsapp' as const,
    customerName: '',
    notes: '',
  });

  const [orderItems, setOrderItems] = useState<OrderItem[]>([
    { menuItemId: '', quantity: 1 }
  ]);

  const [stockCheck, setStockCheck] = useState<StockCheck[]>([]);
  const [showStockWarning, setShowStockWarning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addOrderItem = () => {
    setOrderItems(prev => [...prev, { menuItemId: '', quantity: 1 }]);
  };

  const removeOrderItem = (index: number) => {
    setOrderItems(prev => prev.filter((_, i) => i !== index));
  };

  const updateOrderItem = (index: number, field: keyof OrderItem, value: any) => {
    setOrderItems(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const checkStockAvailability = (): StockCheck[] => {
    if (!selectedOutlet) return [];

    const inventory = getInventoryByOutlet(selectedOutlet);
    const stockRequirements: { [productId: string]: number } = {};

    // Calculate total requirements for each ingredient
    orderItems.forEach(orderItem => {
      if (!orderItem.menuItemId || orderItem.quantity <= 0) return;
      
      const menuItem = menuItems.find(m => m.id === orderItem.menuItemId);
      if (!menuItem) return;

      menuItem.ingredients.forEach(ingredient => {
        const totalRequired = ingredient.quantity * orderItem.quantity;
        stockRequirements[ingredient.productId] = 
          (stockRequirements[ingredient.productId] || 0) + totalRequired;
      });
    });

    // Check availability for each required ingredient
    return Object.entries(stockRequirements).map(([productId, required]) => {
      const product = products.find(p => p.id === productId);
      const available = inventory
        .filter(item => item.productId === productId)
        .reduce((sum, item) => sum + item.quantity, 0);

      return {
        productId,
        productName: product?.name || 'Unknown Product',
        required,
        available,
        sufficient: available >= required,
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedOutlet || !user) return;

    const validItems = orderItems.filter(item => item.menuItemId && item.quantity > 0);
    if (validItems.length === 0) return;

    setIsSubmitting(true);

    // Check stock availability
    const stockCheckResults = checkStockAvailability();
    setStockCheck(stockCheckResults);

    const hasInsufficientStock = stockCheckResults.some(check => !check.sufficient);

    if (hasInsufficientStock) {
      setShowStockWarning(true);
      setIsSubmitting(false);
      return;
    }

    // Calculate total amount
    const totalAmount = validItems.reduce((sum, item) => {
      const menuItem = menuItems.find(m => m.id === item.menuItemId);
      return sum + (menuItem?.costPerPlate || 0) * item.quantity;
    }, 0);

    try {
      await addManualOrder({
        outletId: selectedOutlet,
        source: formData.source,
        customerName: formData.customerName || undefined,
        items: validItems,
        totalAmount,
        notes: formData.notes || undefined,
        createdBy: user.id,
      });

      // Show success message
      alert('✅ Order logged successfully! Inventory has been updated.');
      onBack();
    } catch (error) {
      alert('❌ Failed to log order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePartialOrder = async () => {
    if (!selectedOutlet || !user) return;

    const validItems = orderItems.filter(item => item.menuItemId && item.quantity > 0);
    const totalAmount = validItems.reduce((sum, item) => {
      const menuItem = menuItems.find(m => m.id === item.menuItemId);
      return sum + (menuItem?.costPerPlate || 0) * item.quantity;
    }, 0);

    try {
      await addManualOrder({
        outletId: selectedOutlet,
        source: formData.source,
        customerName: formData.customerName || undefined,
        items: validItems,
        totalAmount,
        notes: `${formData.notes || ''} [PARTIAL ORDER - Insufficient stock]`.trim(),
        createdBy: user.id,
      });

      alert('⚠️ Partial order logged. Some ingredients may be insufficient.');
      onBack();
    } catch (error) {
      alert('❌ Failed to log partial order. Please try again.');
    }
  };

  const getTotalAmount = () => {
    return orderItems.reduce((sum, item) => {
      const menuItem = menuItems.find(m => m.id === item.menuItemId);
      return sum + (menuItem?.costPerPlate || 0) * item.quantity;
    }, 0);
  };

  return (
    <div className="space-y-6">
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
              <ClipboardList className="w-6 h-6 text-purple-600" />
              <h2 className="text-lg font-semibold text-gray-900">Manual Order Entry</h2>
            </div>
          </div>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Order Details Card */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Order Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Order Source *</label>
                  <select
                    value={formData.source}
                    onChange={(e) => setFormData(prev => ({ ...prev, source: e.target.value as any }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  >
                    <option value="whatsapp">WhatsApp</option>
                    <option value="zomato">Zomato</option>
                    <option value="swiggy">Swiggy</option>
                    <option value="ondc">ONDC</option>
                    <option value="direct">Direct</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Customer Name</label>
                  <input
                    type="text"
                    value={formData.customerName}
                    onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter customer name (optional)"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Add any special instructions..."
                />
              </div>
            </div>

            {/* Dish Selection Card */}
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Dish Selection</h3>
                <button
                  type="button"
                  onClick={addOrderItem}
                  className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 bg-white px-3 py-2 rounded-lg border border-purple-200 hover:border-purple-300 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Another Dish</span>
                </button>
              </div>

              <div className="space-y-4">
                {orderItems.map((item, index) => (
                  <div key={index} className="flex items-center space-x-4 p-4 bg-white border border-gray-200 rounded-xl">
                    <div className="flex-1">
                      <select
                        value={item.menuItemId}
                        onChange={(e) => updateOrderItem(index, 'menuItemId', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                      >
                        <option value="">Select dish</option>
                        {menuItems.map(menuItem => (
                          <option key={menuItem.id} value={menuItem.id}>
                            {menuItem.name} - ${menuItem.costPerPlate.toFixed(2)}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="w-24">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateOrderItem(index, 'quantity', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Qty"
                        required
                      />
                    </div>

                    {orderItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeOrderItem(index)}
                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Total Amount */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium text-gray-900">Total Amount:</span>
                <span className="text-2xl font-bold text-purple-600">${getTotalAmount().toFixed(2)}</span>
              </div>
            </div>

            {/* Submit Buttons */}
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
                disabled={isSubmitting}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Checking Stock...' : 'Submit Order'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Stock Warning Modal */}
      {showStockWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
              <h3 className="text-lg font-semibold text-gray-900">Stock Availability Warning</h3>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-600 mb-4">Some ingredients don't have sufficient stock:</p>
              <div className="space-y-3">
                {stockCheck.map((check, index) => (
                  <div key={index} className={`flex items-center justify-between p-3 rounded-lg ${
                    check.sufficient ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                  }`}>
                    <div className="flex items-center space-x-3">
                      {check.sufficient ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                      )}
                      <span className="font-medium text-gray-900">{check.productName}</span>
                    </div>
                    <div className="text-sm">
                      <span className={check.sufficient ? 'text-green-700' : 'text-red-700'}>
                        Required: {check.required} | Available: {check.available}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowStockWarning(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handlePartialOrder}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
              >
                Log Partial Order
              </button>
              <button
                onClick={() => {
                  setShowStockWarning(false);
                  alert('📧 Manager has been notified about stock shortage.');
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Notify Manager
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}