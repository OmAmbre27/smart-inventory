import React, { useState } from 'react';
import { Search, Filter, Package, Calendar, AlertTriangle, Settings } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { LowStockAlertBanner } from './LowStockAlertBanner';

interface InventoryTableProps {
  onAddInventory: () => void;
  onReduceStock: () => void;
  onManageThresholds?: () => void;
}

export function InventoryTable({ onAddInventory, onReduceStock, onManageThresholds }: InventoryTableProps) {
  const { getInventoryByOutlet, products, suppliers, selectedOutlet } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [showLowStockBanner, setShowLowStockBanner] = useState(true);

  if (!selectedOutlet) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center border border-gray-200">
        <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Outlet Selected</h3>
        <p className="text-gray-600">Please select an outlet to view inventory</p>
      </div>
    );
  }

  const inventory = getInventoryByOutlet(selectedOutlet);
  
  // Get thresholds for stock status calculation
  const getThresholds = () => {
    const saved = localStorage.getItem('lowStockThresholds');
    return saved ? JSON.parse(saved) : [];
  };

  const thresholds = getThresholds().filter((t: any) => t.outletId === selectedOutlet);
  
  const filteredInventory = inventory.filter(item => {
    const product = products.find(p => p.id === item.productId);
    if (!product) return false;
    
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    
    // Stock filter logic
    let matchesStockFilter = true;
    if (stockFilter !== 'all') {
      const threshold = thresholds.find((t: any) => t.productId === item.productId);
      if (threshold) {
        const currentStock = inventory
          .filter(inv => inv.productId === item.productId)
          .reduce((sum, inv) => sum + inv.quantity, 0);
        
        if (stockFilter === 'low_stock') {
          matchesStockFilter = currentStock <= threshold.threshold && currentStock > 0;
        } else if (stockFilter === 'out_of_stock') {
          matchesStockFilter = currentStock === 0;
        } else if (stockFilter === 'good_stock') {
          matchesStockFilter = currentStock > threshold.threshold;
        }
      } else if (stockFilter === 'no_threshold') {
        matchesStockFilter = true;
      } else {
        matchesStockFilter = false;
      }
    }
    
    return matchesSearch && matchesCategory && matchesStockFilter;
  });

  const getProductName = (productId: string) => {
    return products.find(p => p.id === productId)?.name || 'Unknown Product';
  };

  const getSupplierName = (supplierId: string) => {
    return suppliers.find(s => s.id === supplierId)?.name || 'Unknown Supplier';
  };

  const getStockStatus = (item: any) => {
    const product = products.find(p => p.id === item.productId);
    if (!product) return { status: 'unknown', color: 'bg-gray-100 text-gray-800', icon: null };

    // Get current total stock for this product
    const currentStock = inventory
      .filter(inv => inv.productId === item.productId)
      .reduce((sum, inv) => sum + inv.quantity, 0);

    // Check threshold
    const threshold = thresholds.find((t: any) => t.productId === item.productId);
    
    if (currentStock === 0) {
      return { 
        status: '🔴 Out of Stock', 
        color: 'bg-red-100 text-red-800 border border-red-300', 
        icon: <AlertTriangle className="w-3 h-3" />
      };
    }
    
    if (threshold && currentStock <= threshold.threshold) {
      return { 
        status: '🟠 Low Stock', 
        color: 'bg-orange-100 text-orange-800 border border-orange-300', 
        icon: <AlertTriangle className="w-3 h-3" />
      };
    }

    // Check expiry
    if (item.expiryDate) {
      const today = new Date();
      const expiryDate = new Date(item.expiryDate);
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysUntilExpiry <= 1) {
        return { status: '🔴 Expiring Soon', color: 'bg-red-100 text-red-800', icon: null };
      }
      
      if (daysUntilExpiry <= 3) {
        return { status: '🟡 Near Expiry', color: 'bg-yellow-100 text-yellow-800', icon: null };
      }
    }

    return { status: '🟢 Good Stock', color: 'bg-green-100 text-green-800', icon: null };
  };

  const categories = [...new Set(products.map(p => p.category))];

  return (
    <div className="space-y-6">
      {/* Low Stock Alert Banner */}
      {showLowStockBanner && (
        <LowStockAlertBanner onDismiss={() => setShowLowStockBanner(false)} />
      )}

      <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <h3 className="text-lg font-semibold text-gray-900">Current Inventory</h3>
            
            <div className="flex items-center space-x-3">
              {onManageThresholds && (
                <button
                  onClick={onManageThresholds}
                  className="flex items-center space-x-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  <span>Manage Thresholds</span>
                </button>
              )}
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 mt-4">
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="all">All Stock Levels</option>
              <option value="out_of_stock">🔴 Out of Stock</option>
              <option value="low_stock">🟠 Low Stock</option>
              <option value="good_stock">🟢 Good Stock</option>
              <option value="no_threshold">No Threshold Set</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Threshold
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expiry Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Supplier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Source
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInventory.map((item) => {
                const product = products.find(p => p.id === item.productId);
                const stockStatus = getStockStatus(item);
                const threshold = thresholds.find((t: any) => t.productId === item.productId);
                
                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                            <Package className="h-5 w-5 text-gray-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{getProductName(item.productId)}</div>
                          <div className="text-sm text-gray-500">{product?.category}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{item.quantity} {product?.unit}</div>
                      {item.batchNumber && (
                        <div className="text-sm text-gray-500">Batch: {item.batchNumber}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stockStatus.color}`}>
                        {stockStatus.icon}
                        <span className="ml-1">{stockStatus.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {threshold ? (
                        <div className="flex items-center space-x-1">
                          <AlertTriangle className="w-4 h-4 text-orange-500" />
                          <span>{threshold.threshold} {product?.unit}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">Not set</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.expiryDate ? (
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>{new Date(item.expiryDate).toLocaleDateString()}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">No expiry</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getSupplierName(item.supplierId)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.source === 'hyperpure' ? 'bg-purple-100 text-purple-800' :
                        item.source === 'local_market' ? 'bg-green-100 text-green-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {item.source.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredInventory.length === 0 && (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No inventory items found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || categoryFilter !== 'all' || stockFilter !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by adding your first inventory item.'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}