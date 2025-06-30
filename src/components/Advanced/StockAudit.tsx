import React, { useState } from 'react';
import { ClipboardCheck, Search, AlertCircle, CheckCircle, Package } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { useGoogleSheets } from '../../contexts/GoogleSheetsContext';
import { StockAudit } from '../../types';
import { formatCurrency } from '../../utils/currency';

export function StockAuditComponent() {
  const { products, getInventoryByOutlet, selectedOutlet, outlets } = useApp();
  const { user } = useAuth();
  const { updateSheet } = useGoogleSheets();
  const [audits, setAudits] = useState<StockAudit[]>([]);
  const [activeAudit, setActiveAudit] = useState<{
    productId: string;
    systemQuantity: number;
    actualQuantity: string;
    notes: string;
  } | null>(null);

  const [searchTerm, setSearchTerm] = useState('');

  const inventory = selectedOutlet ? getInventoryByOutlet(selectedOutlet) : [];
  
  const filteredProducts = products.filter(product => {
    const hasInventory = inventory.some(item => item.productId === product.id);
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    return hasInventory && matchesSearch;
  });

  const startAudit = (productId: string) => {
    const systemQuantity = inventory
      .filter(item => item.productId === productId)
      .reduce((sum, item) => sum + item.quantity, 0);

    setActiveAudit({
      productId,
      systemQuantity,
      actualQuantity: '',
      notes: '',
    });
  };

  const submitAudit = async () => {
    if (!activeAudit || !selectedOutlet || !user) return;

    const actualQty = parseFloat(activeAudit.actualQuantity);
    const difference = actualQty - activeAudit.systemQuantity;

    const audit: StockAudit = {
      id: Date.now().toString(),
      outletId: selectedOutlet,
      productId: activeAudit.productId,
      systemQuantity: activeAudit.systemQuantity,
      actualQuantity: actualQty,
      difference,
      auditedBy: user.id,
      createdAt: new Date().toISOString(),
      notes: activeAudit.notes || undefined,
    };

    setAudits(prev => [audit, ...prev]);

    // Update Google Sheets
    try {
      const product = products.find(p => p.id === activeAudit.productId);
      const outlet = outlets.find(o => o.id === selectedOutlet);
      
      const sheetData = {
        'Date': new Date().toISOString(),
        'Outlet': outlet?.name || '',
        'Product': product?.name || '',
        'System Quantity': activeAudit.systemQuantity,
        'Actual Quantity': actualQty,
        'Difference': difference,
        'Variance %': ((difference / activeAudit.systemQuantity) * 100).toFixed(2),
        'Audited By': user.name,
        'Notes': activeAudit.notes || '',
      };
      
      await updateSheet('stockAudit', [sheetData]);
    } catch (error) {
      console.error('Failed to update Google Sheets:', error);
    }

    setActiveAudit(null);
    alert('✅ Stock audit completed and logged!');
  };

  const getVarianceColor = (difference: number, systemQty: number) => {
    const variance = Math.abs(difference / systemQty) * 100;
    if (variance === 0) return 'text-green-600';
    if (variance <= 5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProductName = (productId: string) => {
    return products.find(p => p.id === productId)?.name || 'Unknown Product';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Stock Audit (Cycle Count)</h2>
          <p className="text-gray-600 mt-1">Perform physical stock verification and track discrepancies</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products to audit..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Products for Audit */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Products Available for Audit</h3>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredProducts.map((product) => {
            const systemQuantity = inventory
              .filter(item => item.productId === product.id)
              .reduce((sum, item) => sum + item.quantity, 0);

            return (
              <div key={product.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="bg-blue-50 p-3 rounded-xl">
                      <Package className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">{product.name}</h4>
                      <p className="text-sm text-gray-600">{product.category}</p>
                      <p className="text-sm font-medium text-blue-600">
                        System Stock: {systemQuantity} {product.unit}
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => startAudit(product.id)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Start Audit
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <ClipboardCheck className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? 'Try adjusting your search criteria.' : 'No products available for audit.'}
            </p>
          </div>
        )}
      </div>

      {/* Audit History */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Audits ({audits.length})</h3>
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
                  System Qty
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actual Qty
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Difference
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Audited By
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {audits.map((audit) => {
                const product = products.find(p => p.id === audit.productId);
                const variance = (audit.difference / audit.systemQuantity) * 100;
                
                return (
                  <tr key={audit.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(audit.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{product?.name}</div>
                      <div className="text-sm text-gray-500">{product?.category}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {audit.systemQuantity} {product?.unit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {audit.actualQuantity} {product?.unit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${getVarianceColor(audit.difference, audit.systemQuantity)}`}>
                        {audit.difference > 0 ? '+' : ''}{audit.difference} {product?.unit}
                      </div>
                      <div className={`text-xs ${getVarianceColor(audit.difference, audit.systemQuantity)}`}>
                        {variance.toFixed(1)}% variance
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user?.name}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {audits.length === 0 && (
          <div className="text-center py-12">
            <ClipboardCheck className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No audits completed</h3>
            <p className="mt-1 text-sm text-gray-500">
              Start your first stock audit to track inventory accuracy.
            </p>
          </div>
        )}
      </div>

      {/* Audit Modal */}
      {activeAudit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center space-x-3 mb-6">
              <ClipboardCheck className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Stock Audit</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product</label>
                <p className="text-lg font-medium text-gray-900">
                  {getProductName(activeAudit.productId)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">System Quantity</label>
                <p className="text-lg font-medium text-blue-600">
                  {activeAudit.systemQuantity} {products.find(p => p.id === activeAudit.productId)?.unit}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Actual Counted Quantity *</label>
                <input
                  type="number"
                  step="0.01"
                  value={activeAudit.actualQuantity}
                  onChange={(e) => setActiveAudit(prev => prev ? { ...prev, actualQuantity: e.target.value } : null)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter actual counted quantity"
                  required
                />
              </div>

              {activeAudit.actualQuantity && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Difference:</span>
                    <span className={`text-lg font-bold ${
                      parseFloat(activeAudit.actualQuantity) - activeAudit.systemQuantity > 0 
                        ? 'text-green-600' 
                        : parseFloat(activeAudit.actualQuantity) - activeAudit.systemQuantity < 0
                        ? 'text-red-600'
                        : 'text-gray-600'
                    }`}>
                      {parseFloat(activeAudit.actualQuantity) - activeAudit.systemQuantity > 0 ? '+' : ''}
                      {(parseFloat(activeAudit.actualQuantity) - activeAudit.systemQuantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  value={activeAudit.notes}
                  onChange={(e) => setActiveAudit(prev => prev ? { ...prev, notes: e.target.value } : null)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add notes about discrepancies..."
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => setActiveAudit(null)}
                className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitAudit}
                disabled={!activeAudit.actualQuantity}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50"
              >
                Complete Audit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}