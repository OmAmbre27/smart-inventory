import React, { useState } from 'react';
import { BarChart3, TrendingUp, FileText, Download, Filter, DollarSign, Package, Trash2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { useApp } from '../../contexts/AppContext';
import { useGoogleSheets } from '../../contexts/GoogleSheetsContext';
import { SyncStatusIndicator } from '../GoogleSheets/SyncStatusIndicator';

export function ReportsManagement() {
  const { inventory, manualOrders, wastageEntries, selectedOutlet, products, outlets } = useApp();
  const { config } = useGoogleSheets();
  const [activeReport, setActiveReport] = useState('dashboard');
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    outlet: selectedOutlet || 'all',
  });

  // Sample data for charts
  const inventoryValueData = [
    { date: '2024-01-01', value: 15000 },
    { date: '2024-01-02', value: 16200 },
    { date: '2024-01-03', value: 15800 },
    { date: '2024-01-04', value: 17500 },
    { date: '2024-01-05', value: 18200 },
    { date: '2024-01-06', value: 16900 },
    { date: '2024-01-07', value: 19100 },
  ];

  const productUsageData = [
    { product: 'Tomatoes', usage: 45 },
    { product: 'Chicken', usage: 38 },
    { product: 'Rice', usage: 52 },
    { product: 'Onions', usage: 28 },
    { product: 'Oil', usage: 15 },
  ];

  const dailySalesData = [
    { date: '2024-01-01', sales: 1250 },
    { date: '2024-01-02', sales: 1380 },
    { date: '2024-01-03', sales: 1150 },
    { date: '2024-01-04', sales: 1420 },
    { date: '2024-01-05', sales: 1680 },
    { date: '2024-01-06', sales: 1520 },
    { date: '2024-01-07', sales: 1750 },
  ];

  const cogsData = [
    { dish: 'Chicken Curry', cost: 8.50, revenue: 15.00, profit: 6.50 },
    { dish: 'Vegetable Rice', cost: 4.25, revenue: 8.00, profit: 3.75 },
    { dish: 'Fish Fry', cost: 12.00, revenue: 20.00, profit: 8.00 },
    { dish: 'Dal Curry', cost: 3.50, revenue: 6.50, profit: 3.00 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const generateInventoryReport = () => {
    const outletInventory = inventory.filter(item => 
      filters.outlet === 'all' || item.outletId === filters.outlet
    );

    return outletInventory.map(item => {
      const product = products.find(p => p.id === item.productId);
      return {
        'Product Name': product?.name || 'Unknown',
        'Category': product?.category || 'Unknown',
        'Current Stock': item.quantity,
        'Unit': product?.unit || '',
        'Expiry Date': item.expiryDate || 'N/A',
        'Purchase Price': item.purchasePrice || 0,
        'Stock Value': (item.quantity * (item.purchasePrice || 0)).toFixed(2),
        'Source': item.source,
        'Last Updated': new Date(item.updatedAt).toLocaleDateString(),
      };
    });
  };

  const generateWastageReport = () => {
    let filteredWastage = wastageEntries;
    
    if (filters.outlet !== 'all') {
      filteredWastage = filteredWastage.filter(entry => entry.outletId === filters.outlet);
    }
    
    if (filters.dateFrom) {
      filteredWastage = filteredWastage.filter(entry => 
        new Date(entry.createdAt) >= new Date(filters.dateFrom)
      );
    }
    
    if (filters.dateTo) {
      filteredWastage = filteredWastage.filter(entry => 
        new Date(entry.createdAt) <= new Date(filters.dateTo)
      );
    }

    return filteredWastage.map(entry => {
      const product = products.find(p => p.id === entry.productId);
      return {
        'Date': new Date(entry.createdAt).toLocaleDateString(),
        'Product': product?.name || 'Unknown',
        'Quantity Wasted': entry.quantity,
        'Unit': product?.unit || '',
        'Reason': entry.reason,
        'Outlet': outlets.find(o => o.id === entry.outletId)?.name || 'Unknown',
      };
    });
  };

  const generateCOGSReport = () => {
    let filteredOrders = manualOrders;
    
    if (filters.outlet !== 'all') {
      filteredOrders = filteredOrders.filter(order => order.outletId === filters.outlet);
    }
    
    if (filters.dateFrom) {
      filteredOrders = filteredOrders.filter(order => 
        new Date(order.createdAt) >= new Date(filters.dateFrom)
      );
    }
    
    if (filters.dateTo) {
      filteredOrders = filteredOrders.filter(order => 
        new Date(order.createdAt) <= new Date(filters.dateTo)
      );
    }

    return filteredOrders.map(order => ({
      'Date': new Date(order.createdAt).toLocaleDateString(),
      'Order Source': order.source,
      'Customer': order.customerName || 'Anonymous',
      'Total Revenue': order.totalAmount.toFixed(2),
      'Items Sold': order.items.length,
      'Outlet': outlets.find(o => o.id === order.outletId)?.name || 'Unknown',
    }));
  };

  const exportReport = (reportType: string) => {
    let data: any[] = [];
    let filename = '';

    switch (reportType) {
      case 'inventory':
        data = generateInventoryReport();
        filename = 'inventory-summary';
        break;
      case 'wastage':
        data = generateWastageReport();
        filename = 'wastage-report';
        break;
      case 'cogs':
        data = generateCOGSReport();
        filename = 'cogs-report';
        break;
    }

    if (data.length === 0) {
      alert('No data available for export');
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => `"${row[header]}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const openGoogleSheet = (sheetType: string) => {
    if (!config) {
      alert('Google Sheets not configured. Please set up integration first.');
      return;
    }

    let sheetId = '';
    switch (sheetType) {
      case 'inventory':
        sheetId = config.inventorySheetId;
        break;
      case 'wastage':
        sheetId = config.hygieneLogsSheetId;
        break;
      case 'reports':
        sheetId = config.reportsSheetId;
        break;
    }

    if (sheetId) {
      window.open(`https://docs.google.com/spreadsheets/d/${sheetId}/edit`, '_blank');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>
          <p className="text-gray-600 mt-1">Comprehensive reporting and business intelligence</p>
        </div>
        <SyncStatusIndicator sheetType="reports" showDetails />
      </div>

      {/* Report Navigation */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <div className="flex flex-wrap gap-4 mb-6">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
            { id: 'inventory', label: 'Inventory Summary', icon: Package },
            { id: 'wastage', label: 'Wastage Report', icon: Trash2 },
            { id: 'cogs', label: 'COGS Report', icon: DollarSign },
          ].map((report) => (
            <button
              key={report.id}
              onClick={() => setActiveReport(report.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                activeReport === report.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <report.icon className="w-4 h-4" />
              <span>{report.label}</span>
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Outlet</label>
            <select
              value={filters.outlet}
              onChange={(e) => setFilters(prev => ({ ...prev, outlet: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Outlets</option>
              {outlets.map(outlet => (
                <option key={outlet.id} value={outlet.id}>{outlet.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end space-x-2">
            <button
              onClick={() => exportReport(activeReport)}
              className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => openGoogleSheet(activeReport)}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              <FileText className="w-4 h-4" />
              <span>Open Sheet</span>
            </button>
          </div>
        </div>

        {/* Report Content */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          {activeReport === 'dashboard' && (
            <div className="p-6 space-y-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Analytics Dashboard</h3>
              
              {/* Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Inventory Value Trend */}
                <div className="bg-white p-6 rounded-lg border">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Inventory Value Trend</h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={inventoryValueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Product Usage */}
                <div className="bg-white p-6 rounded-lg border">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Product Usage</h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={productUsageData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="product" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="usage" fill="#10B981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Daily Sales */}
                <div className="bg-white p-6 rounded-lg border">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Daily Sales Trend</h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={dailySalesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="sales" stroke="#F59E0B" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* COGS Analysis */}
                <div className="bg-white p-6 rounded-lg border">
                  <h4 className="text-md font-medium text-gray-900 mb-4">COGS vs Revenue</h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={cogsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="dish" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="cost" fill="#EF4444" />
                      <Bar dataKey="revenue" fill="#10B981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {activeReport === 'inventory' && (
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Inventory Summary</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left">Product</th>
                      <th className="px-4 py-2 text-left">Stock</th>
                      <th className="px-4 py-2 text-left">Value</th>
                      <th className="px-4 py-2 text-left">Expiry</th>
                    </tr>
                  </thead>
                  <tbody>
                    {generateInventoryReport().slice(0, 10).map((item, index) => (
                      <tr key={index} className="border-t">
                        <td className="px-4 py-2">{item['Product Name']}</td>
                        <td className="px-4 py-2">{item['Current Stock']} {item['Unit']}</td>
                        <td className="px-4 py-2">${item['Stock Value']}</td>
                        <td className="px-4 py-2">{item['Expiry Date']}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeReport === 'wastage' && (
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Wastage Report</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left">Date</th>
                      <th className="px-4 py-2 text-left">Product</th>
                      <th className="px-4 py-2 text-left">Quantity</th>
                      <th className="px-4 py-2 text-left">Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {generateWastageReport().slice(0, 10).map((item, index) => (
                      <tr key={index} className="border-t">
                        <td className="px-4 py-2">{item['Date']}</td>
                        <td className="px-4 py-2">{item['Product']}</td>
                        <td className="px-4 py-2">{item['Quantity Wasted']} {item['Unit']}</td>
                        <td className="px-4 py-2">{item['Reason']}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeReport === 'cogs' && (
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Cost of Goods Sold (COGS)</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left">Date</th>
                      <th className="px-4 py-2 text-left">Source</th>
                      <th className="px-4 py-2 text-left">Revenue</th>
                      <th className="px-4 py-2 text-left">Items</th>
                    </tr>
                  </thead>
                  <tbody>
                    {generateCOGSReport().slice(0, 10).map((item, index) => (
                      <tr key={index} className="border-t">
                        <td className="px-4 py-2">{item['Date']}</td>
                        <td className="px-4 py-2">{item['Order Source']}</td>
                        <td className="px-4 py-2">${item['Total Revenue']}</td>
                        <td className="px-4 py-2">{item['Items Sold']}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}