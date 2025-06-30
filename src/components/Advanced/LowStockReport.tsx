import React, { useState } from 'react';
import { AlertTriangle, Download, Filter, Package, TrendingDown } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { formatCurrency } from '../../utils/currency';

export function LowStockReport() {
  const { inventory, products, outlets, selectedOutlet } = useApp();
  const [filters, setFilters] = useState({
    outlet: selectedOutlet || 'all',
    category: 'all',
    severity: 'all',
  });

  // Get thresholds from localStorage
  const getThresholds = () => {
    const saved = localStorage.getItem('lowStockThresholds');
    return saved ? JSON.parse(saved) : [];
  };

  const generateLowStockReport = () => {
    const thresholds = getThresholds();
    const lowStockItems: any[] = [];

    thresholds.forEach((threshold: any) => {
      const product = products.find(p => p.id === threshold.productId);
      if (!product) return;

      // Filter by outlet if specified
      if (filters.outlet !== 'all' && threshold.outletId !== filters.outlet) return;

      // Filter by category if specified
      if (filters.category !== 'all' && product.category !== filters.category) return;

      const currentStock = inventory
        .filter(item => item.productId === threshold.productId && item.outletId === threshold.outletId)
        .reduce((sum, item) => sum + item.quantity, 0);

      if (currentStock <= threshold.threshold) {
        const severity = currentStock === 0 ? 'critical' : 'warning';
        
        // Filter by severity if specified
        if (filters.severity !== 'all' && severity !== filters.severity) return;

        const outlet = outlets.find(o => o.id === threshold.outletId);
        const estimatedValue = currentStock * (product.defaultSupplierId ? 50 : 0); // Mock price

        lowStockItems.push({
          productName: product.name,
          category: product.category,
          outletName: outlet?.name || 'Unknown',
          currentStock,
          threshold: threshold.threshold,
          unit: product.unit,
          severity,
          estimatedValue,
          suggestedReorder: Math.max(threshold.threshold * 2, 10),
        });
      }
    });

    return lowStockItems.sort((a, b) => {
      if (a.severity === 'critical' && b.severity !== 'critical') return -1;
      if (b.severity === 'critical' && a.severity !== 'critical') return 1;
      return a.currentStock - b.currentStock;
    });
  };

  const lowStockItems = generateLowStockReport();

  const exportReport = () => {
    const headers = ['Product', 'Category', 'Outlet', 'Current Stock', 'Threshold', 'Unit', 'Severity', 'Suggested Reorder'];
    const csvData = lowStockItems.map(item => [
      item.productName,
      item.category,
      item.outletName,
      item.currentStock,
      item.threshold,
      item.unit,
      item.severity,
      item.suggestedReorder,
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `low-stock-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border border-red-300';
      case 'warning':
        return 'bg-orange-100 text-orange-800 border border-orange-300';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const categories = [...new Set(products.map(p => p.category))];
  const criticalCount = lowStockItems.filter(item => item.severity === 'critical').length;
  const warningCount = lowStockItems.filter(item => item.severity === 'warning').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Low Stock Report</h2>
          <p className="text-gray-600 mt-1">Monitor items below threshold levels</p>
        </div>
        
        <button
          onClick={exportReport}
          className="flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-all shadow-lg"
        >
          <Download className="w-5 h-5" />
          <span>Export Report</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Critical Items</p>
              <p className="text-2xl font-bold text-red-600">{criticalCount}</p>
              <p className="text-sm text-red-500 mt-1">Out of stock</p>
            </div>
            <div className="bg-red-50 p-3 rounded-xl">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Warning Items</p>
              <p className="text-2xl font-bold text-orange-600">{warningCount}</p>
              <p className="text-sm text-orange-500 mt-1">Below threshold</p>
            </div>
            <div className="bg-orange-50 p-3 rounded-xl">
              <TrendingDown className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Total Items</p>
              <p className="text-2xl font-bold text-gray-900">{lowStockItems.length}</p>
              <p className="text-sm text-gray-500 mt-1">Need attention</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-xl">
              <Package className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Outlet</label>
            <select
              value={filters.outlet}
              onChange={(e) => setFilters(prev => ({ ...prev, outlet: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="all">All Outlets</option>
              {outlets.map(outlet => (
                <option key={outlet.id} value={outlet.id}>{outlet.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Severity</label>
            <select
              value={filters.severity}
              onChange={(e) => setFilters(prev => ({ ...prev, severity: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="all">All Severities</option>
              <option value="critical">🔴 Critical (Out of Stock)</option>
              <option value="warning">🟠 Warning (Low Stock)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Low Stock Items Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Low Stock Items ({lowStockItems.length})</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Outlet
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Threshold
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Severity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Suggested Reorder
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {lowStockItems.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{item.productName}</div>
                      <div className="text-sm text-gray-500">{item.category}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.outletName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {item.currentStock} {item.unit}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-orange-600 font-medium">
                      {item.threshold} {item.unit}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityBadge(item.severity)}`}>
                      {item.severity === 'critical' ? '🔴 Critical' : '🟠 Warning'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-blue-600">
                      {item.suggestedReorder} {item.unit}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {lowStockItems.length === 0 && (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No low stock items</h3>
            <p className="mt-1 text-sm text-gray-500">
              All items are above their threshold levels.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}