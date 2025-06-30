import React, { useState } from 'react';
import { Package, Plus, Upload } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { useGoogleSheets } from '../../contexts/GoogleSheetsContext';
import { SyncStatusIndicator } from '../GoogleSheets/SyncStatusIndicator';

export function GoodsReceivingManual() {
  const { products, outlets, addGoodsReceived, selectedOutlet, addProduct } = useApp();
  const { user } = useAuth();
  const { updateSheet } = useGoogleSheets();
  const [activeTab, setActiveTab] = useState<'manual' | 'sheet'>('manual');
  const [showAddProduct, setShowAddProduct] = useState(false);
  
  const [formData, setFormData] = useState({
    outletId: selectedOutlet || '',
    productId: '',
    quantity: '',
    price: '',
    source: '',
    expiryDate: '',
  });

  const [newProduct, setNewProduct] = useState({
    name: '',
    category: '',
    unit: 'kg' as const,
    isPerishable: true,
  });

  const [sheetData, setSheetData] = useState('');

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    const goodsData = {
      outletId: formData.outletId,
      productId: formData.productId,
      quantity: parseFloat(formData.quantity),
      price: parseFloat(formData.price),
      source: formData.source,
      expiryDate: formData.expiryDate || undefined,
      receivedBy: user.id,
    };

    addGoodsReceived(goodsData);

    // Update Google Sheets
    try {
      const product = products.find(p => p.id === formData.productId);
      const outlet = outlets.find(o => o.id === formData.outletId);
      
      const sheetData = {
        'Date': new Date().toISOString(),
        'Outlet': outlet?.name || '',
        'Ingredient': product?.name || '',
        'Quantity': formData.quantity,
        'Unit': product?.unit || '',
        'Price': formData.price,
        'Source': formData.source,
        'Expiry Date': formData.expiryDate || 'N/A',
        'Received By': user.name,
      };
      
      await updateSheet('goodsReceived', [sheetData]);
    } catch (error) {
      console.error('Failed to update Google Sheets:', error);
    }

    setFormData({
      outletId: selectedOutlet || '',
      productId: '',
      quantity: '',
      price: '',
      source: '',
      expiryDate: '',
    });

    alert('✅ Goods received and inventory updated!');
  };

  const handleSheetUpload = async () => {
    try {
      const lines = sheetData.trim().split('\n');
      const headers = lines[0].split(',');
      const data = lines.slice(1).map(line => {
        const values = line.split(',');
        return headers.reduce((obj, header, index) => {
          obj[header.trim()] = values[index]?.trim() || '';
          return obj;
        }, {} as any);
      });

      await updateSheet('goodsReceived', data);
      alert('✅ Bulk goods receiving data uploaded successfully!');
      setSheetData('');
    } catch (error) {
      alert('❌ Failed to upload data. Please check the format.');
    }
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    addProduct(newProduct);
    setFormData(prev => ({ ...prev, productId: '' }));
    setNewProduct({ name: '', category: '', unit: 'kg', isPerishable: true });
    setShowAddProduct(false);
  };

  const downloadTemplate = () => {
    const template = `Ingredient,Qty,Price,Unit,Supplier,Date,Outlet
Tomatoes,25,3.50,kg,Fresh Farm,${new Date().toISOString().split('T')[0]},Main Kitchen
Chicken Breast,15,12.00,kg,Hyperpure,${new Date().toISOString().split('T')[0]},Main Kitchen`;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'goods-receiving-template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Goods Receiving</h2>
          <p className="text-gray-600 mt-1">Receive inventory manually or via Google Sheets</p>
        </div>
        <SyncStatusIndicator sheetType="goodsReceived" showDetails />
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('manual')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'manual'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              📥 Manual Receiving
            </button>
            <button
              onClick={() => setActiveTab('sheet')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'sheet'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              📄 Google Sheet Upload
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'manual' ? (
            <form onSubmit={handleManualSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Outlet *</label>
                  <select
                    value={formData.outletId}
                    onChange={(e) => setFormData(prev => ({ ...prev, outletId: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select outlet</option>
                    {outlets.map(outlet => (
                      <option key={outlet.id} value={outlet.id}>{outlet.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">Ingredient Name *</label>
                    <button
                      type="button"
                      onClick={() => setShowAddProduct(true)}
                      className="text-sm text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add New</span>
                    </button>
                  </div>
                  <select
                    value={formData.productId}
                    onChange={(e) => setFormData(prev => ({ ...prev, productId: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quantity *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.quantity}
                    onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter quantity"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter price"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Source *</label>
                  <input
                    type="text"
                    value={formData.source}
                    onChange={(e) => setFormData(prev => ({ ...prev, source: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Vendor Name, Local Market, Transfer"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-lg"
                >
                  Receive Goods
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Upload Instructions</h4>
                <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1">
                  <li>Download the CSV template</li>
                  <li>Fill in your goods receiving data</li>
                  <li>Copy and paste the CSV content below</li>
                  <li>Click upload to sync with Google Sheets</li>
                </ol>
              </div>

              <button
                onClick={downloadTemplate}
                className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                <Package className="w-4 h-4" />
                <span>Download Template</span>
              </button>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CSV Data (Ingredient, Qty, Price, Unit, Supplier, Date, Outlet)
                </label>
                <textarea
                  value={sheetData}
                  onChange={(e) => setSheetData(e.target.value)}
                  rows={10}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Paste your CSV data here..."
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSheetUpload}
                  disabled={!sheetData.trim()}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload to Sheets</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Product</h3>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                <input
                  type="text"
                  value={newProduct.category}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Unit *</label>
                <select
                  value={newProduct.unit}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, unit: e.target.value as any }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="kg">Kilograms (kg)</option>
                  <option value="g">Grams (g)</option>
                  <option value="l">Liters (l)</option>
                  <option value="ml">Milliliters (ml)</option>
                  <option value="pieces">Pieces</option>
                </select>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPerishable"
                  checked={newProduct.isPerishable}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, isPerishable: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="isPerishable" className="ml-2 text-sm text-gray-700">
                  Is Perishable
                </label>
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowAddProduct(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}