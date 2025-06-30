import React, { useState, useEffect } from 'react';
import { 
  Building, 
  Users, 
  TrendingUp, 
  Activity, 
  Eye, 
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Package,
  BarChart3,
  Filter
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { SystemMetrics, ActivityLog } from '../../types';
import { formatCurrency } from '../../utils/currency';

export function SuperAdminDashboard() {
  const { outlets, manualOrders, inventory, wastageEntries, setSelectedOutlet } = useApp();
  const { getAllUsers, impersonateOutlet } = useAuth();
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    totalOutlets: 0,
    activeOutlets: 0,
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    topPerformingOutlets: [],
    recentActivity: [],
  });
  const [selectedOutletFilter, setSelectedOutletFilter] = useState<string>('all');

  useEffect(() => {
    calculateSystemMetrics();
  }, [outlets, manualOrders]);

  const calculateSystemMetrics = () => {
    const allUsers = getAllUsers();
    const activeOutlets = outlets.filter(o => o.isActive);
    const totalRevenue = manualOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    
    // Calculate top performing outlets
    const outletRevenue = outlets.map(outlet => {
      const outletOrders = manualOrders.filter(order => order.outletId === outlet.id);
      const revenue = outletOrders.reduce((sum, order) => sum + order.totalAmount, 0);
      return {
        outletId: outlet.id,
        name: outlet.name,
        revenue,
      };
    }).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

    // Mock recent activity
    const recentActivity: ActivityLog[] = [
      {
        id: '1',
        outletId: '1',
        userId: '3',
        action: 'Added inventory',
        module: 'Inventory',
        details: 'Added 25kg Tomatoes',
        timestamp: new Date().toISOString(),
      },
      {
        id: '2',
        outletId: '2',
        userId: '2',
        action: 'Manual order',
        module: 'Orders',
        details: 'Order from WhatsApp - ₹450',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      },
      {
        id: '3',
        outletId: '1',
        userId: '3',
        action: 'Hygiene upload',
        module: 'Hygiene',
        details: 'Daily cleaning photo uploaded',
        timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      },
    ];

    setSystemMetrics({
      totalOutlets: outlets.length,
      activeOutlets: activeOutlets.length,
      totalUsers: allUsers.length,
      totalOrders: manualOrders.length,
      totalRevenue,
      topPerformingOutlets: outletRevenue,
      recentActivity,
    });
  };

  const getOutletStatus = (outlet: any) => {
    const lastActivity = outlet.lastActivity ? new Date(outlet.lastActivity) : new Date();
    const daysSinceActivity = Math.floor((Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceActivity > 3) {
      return { status: 'inactive', color: 'text-red-600 bg-red-100', icon: AlertTriangle };
    } else if (daysSinceActivity > 1) {
      return { status: 'warning', color: 'text-yellow-600 bg-yellow-100', icon: Clock };
    }
    return { status: 'active', color: 'text-green-600 bg-green-100', icon: CheckCircle };
  };

  const handleOutletView = (outletId: string) => {
    setSelectedOutlet(outletId);
    impersonateOutlet(outletId);
  };

  const getFilteredData = () => {
    if (selectedOutletFilter === 'all') {
      return {
        orders: manualOrders,
        inventory: inventory,
        wastage: wastageEntries,
      };
    }
    
    return {
      orders: manualOrders.filter(order => order.outletId === selectedOutletFilter),
      inventory: inventory.filter(item => item.outletId === selectedOutletFilter),
      wastage: wastageEntries.filter(entry => entry.outletId === selectedOutletFilter),
    };
  };

  const filteredData = getFilteredData();
  const filteredRevenue = filteredData.orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const filteredInventoryValue = filteredData.inventory.reduce((sum, item) => 
    sum + (item.quantity * (item.purchasePrice || 0)), 0
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Super Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Global overview of all SmartKitchen operations</p>
        </div>
        
        {/* Outlet Filter */}
        <div className="flex items-center space-x-3">
          <Filter className="w-5 h-5 text-gray-600" />
          <select
            value={selectedOutletFilter}
            onChange={(e) => setSelectedOutletFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All Outlets</option>
            {outlets.map(outlet => (
              <option key={outlet.id} value={outlet.id}>{outlet.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* System Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Total Outlets</p>
              <p className="text-2xl font-bold text-gray-900">{systemMetrics.totalOutlets}</p>
              <p className="text-sm text-green-600 mt-1">
                {systemMetrics.activeOutlets} active
              </p>
            </div>
            <div className="bg-blue-50 p-3 rounded-xl">
              <Building className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{systemMetrics.totalUsers}</p>
              <p className="text-sm text-blue-600 mt-1">Across all outlets</p>
            </div>
            <div className="bg-purple-50 p-3 rounded-xl">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">
                {selectedOutletFilter === 'all' ? 'Total Orders' : 'Outlet Orders'}
              </p>
              <p className="text-2xl font-bold text-gray-900">{filteredData.orders.length}</p>
              <p className="text-sm text-green-600 mt-1">
                {selectedOutletFilter === 'all' ? 'All time' : 'This outlet'}
              </p>
            </div>
            <div className="bg-green-50 p-3 rounded-xl">
              <Package className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">
                {selectedOutletFilter === 'all' ? 'Total Revenue' : 'Outlet Revenue'}
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(filteredRevenue)}
              </p>
              <p className="text-sm text-green-600 mt-1">
                {selectedOutletFilter === 'all' ? 'All outlets' : 'This outlet'}
              </p>
            </div>
            <div className="bg-orange-50 p-3 rounded-xl">
              <DollarSign className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Outlet Status Overview */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Outlet Activity Monitor</h3>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {outlets.map((outlet) => {
              const status = getOutletStatus(outlet);
              const StatusIcon = status.icon;
              
              return (
                <div key={outlet.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className={`p-2 rounded-lg ${status.color}`}>
                        <StatusIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{outlet.name}</h4>
                        <p className="text-sm text-gray-500">{outlet.type}</p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleOutletView(outlet.id)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View as Admin"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    <p>Status: <span className="capitalize">{status.status}</span></p>
                    <p>Last Activity: {outlet.lastActivity ? new Date(outlet.lastActivity).toLocaleDateString() : 'Never'}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top Performing Outlets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Top Performing Outlets</h3>
          </div>
          
          <div className="p-6">
            <div className="space-y-4">
              {systemMetrics.topPerformingOutlets.map((outlet, index) => (
                <div key={outlet.outletId} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{outlet.name}</p>
                      <p className="text-sm text-gray-500">Revenue</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">{formatCurrency(outlet.revenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          </div>
          
          <div className="p-6">
            <div className="space-y-4">
              {systemMetrics.recentActivity.map((activity) => {
                const outlet = outlets.find(o => o.id === activity.outletId);
                return (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="bg-blue-50 p-2 rounded-lg">
                      <Activity className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                      <p className="text-sm text-gray-600">{activity.details}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {outlet?.name} • {new Date(activity.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-left">
            <Building className="w-6 h-6 text-blue-600 mb-2" />
            <h4 className="font-medium text-gray-900">Add New Outlet</h4>
            <p className="text-sm text-gray-600">Onboard a new restaurant or cloud kitchen</p>
          </button>
          
          <button className="p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-left">
            <Users className="w-6 h-6 text-purple-600 mb-2" />
            <h4 className="font-medium text-gray-900">Manage Admins</h4>
            <p className="text-sm text-gray-600">Add or assign outlet administrators</p>
          </button>
          
          <button className="p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-left">
            <BarChart3 className="w-6 h-6 text-green-600 mb-2" />
            <h4 className="font-medium text-gray-900">Global Reports</h4>
            <p className="text-sm text-gray-600">View system-wide analytics and insights</p>
          </button>
        </div>
      </div>
    </div>
  );
}