import React, { useState } from 'react';
import { BarChart3, Download, Filter, TrendingUp, DollarSign, Package, Users } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency } from '../../utils/currency';

export function GlobalReports() {
  const { outlets, manualOrders, inventory, wastageEntries } = useApp();
  const { getAllUsers } = useAuth();
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    outlet: 'all',
    reportType: 'overview',
  });

  const allUsers = getAllUsers();

  // Calculate global metrics
  const totalRevenue = manualOrders.reduce((sum, order) => sum + order.totalAmount, 0);
  const totalOrders = manualOrders.length;
  const totalWastageValue = wastageEntries.length * 100; // Mock calculation
  const totalInventoryValue = inventory.reduce((sum, item) => 
    sum + (item.quantity * (item.purchasePrice || 0)), 0
  );

  // Revenue by outlet
  const revenueByOutlet = outlets.map(outlet => {
    const outletOrders = manualOrders.filter(order => order.outletId === outlet.id);
    const revenue = outletOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    return {
      name: outlet.name,
      revenue,
      orders: outletOrders.length,
    };
  }).sort((a, b) => b.revenue - a.revenue);

  // Orders trend (mock data)
  const ordersTrend = [
    { date: '2024-01-01', orders: 45, revenue: 12500 },
    { date: '2024-01-02', orders: 52, revenue: 14200 },
    { date: '2024-01-03', orders: 38, revenue: 10800 },
    { date: '2024-01-04', orders: 61, revenue: 16500 },
    { date: '2024-01-05', orders: 48, revenue: 13200 },
    { date: '2024-01-06', orders: 55, revenue: 15100 },
    { date: '2024-01-07', orders: 67, revenue: 18300 },
  ];

  // Outlet performance distribution
  const outletTypes = outlets.reduce((acc, outlet) => {
    acc[outlet.type] = (acc[outlet.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const outletTypeData = Object.entries(outletTypes).map(([type, count]) => ({
    name: type.replace('_', ' ').toUpperCase(),
    value: count,
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const exportGlobalReport = () => {
    const reportData = {
      summary: {
        totalOutlets: outlets.length,
        activeOutlets: outlets.filter(o => o.isActive).length,
        totalUsers: allUsers.length,
        totalRevenue,
        totalOrders,
        totalWastageValue,
        totalInventoryValue,
      },
      outletPerformance: revenueByOutlet,
      ordersTrend,
      outletTypes: outletTypeData,
    };

    const csvContent = [
      'Global SmartKitchen Report',
      '',
      'Summary Metrics',
      `Total Outlets,${reportData.summary.totalOutlets}`,
      `Active Outlets,${reportData.summary.activeOutlets}`,
      `Total Users,${reportData.summary.totalUsers}`,
      `Total Revenue,${formatCurrency(reportData.summary.totalRevenue)}`,
      `Total Orders,${reportData.summary.totalOrders}`,
      '',
      'Outlet Performance',
      'Outlet Name,Revenue,Orders',
      ...revenueByOutlet.map(outlet => 
        `${outlet.name},${formatCurrency(outlet.revenue)},${outlet.orders}`
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `global-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Global Reports & Analytics</h2>
          <p className="text-gray-600 mt-1">System-wide performance and insights</p>
        </div>
        
        <button
          onClick={exportGlobalReport}
          className="flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-all shadow-lg"
        >
          <Download className="w-5 h-5" />
          <span>Export Global Report</span>
        </button>
      </div>

      {/* Global Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</p>
              <p className="text-sm text-gray-500 mt-1">All outlets</p>
            </div>
            <div className="bg-green-50 p-3 rounded-xl">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Total Orders</p>
              <p className="text-2xl font-bold text-blue-600">{totalOrders}</p>
              <p className="text-sm text-gray-500 mt-1">Across platform</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-xl">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Inventory Value</p>
              <p className="text-2xl font-bold text-purple-600">{formatCurrency(totalInventoryValue)}</p>
              <p className="text-sm text-gray-500 mt-1">Current stock</p>
            </div>
            <div className="bg-purple-50 p-3 rounded-xl">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Active Users</p>
              <p className="text-2xl font-bold text-orange-600">{allUsers.filter(u => u.isActive).length}</p>
              <p className="text-sm text-gray-500 mt-1">Platform wide</p>
            </div>
            <div className="bg-orange-50 p-3 rounded-xl">
              <Users className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Report Filters</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
            <select
              value={filters.reportType}
              onChange={(e) => setFilters(prev => ({ ...prev, reportType: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="overview">Overview</option>
              <option value="revenue">Revenue Analysis</option>
              <option value="inventory">Inventory Analysis</option>
              <option value="performance">Performance Metrics</option>
            </select>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Outlet */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Outlet</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueByOutlet}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
              <Bar dataKey="revenue" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Orders Trend */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Orders Trend</h4>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={ordersTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="orders" stroke="#10B981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Outlet Types Distribution */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Outlet Types Distribution</h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={outletTypeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {outletTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Trend */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h4>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={ordersTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
              <Line type="monotone" dataKey="revenue" stroke="#F59E0B" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Performing Outlets Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Top Performing Outlets</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Outlet
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Orders
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Order Value
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {revenueByOutlet.slice(0, 10).map((outlet, index) => (
                <tr key={outlet.name} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                        index === 0 ? 'bg-yellow-500' : 
                        index === 1 ? 'bg-gray-400' : 
                        index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                      }`}>
                        {index + 1}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{outlet.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-green-600">{formatCurrency(outlet.revenue)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{outlet.orders}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatCurrency(outlet.orders > 0 ? outlet.revenue / outlet.orders : 0)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}