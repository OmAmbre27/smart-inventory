import React from 'react';
import { Clock, Package, ShoppingCart, Trash2 } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

export function RecentActivity() {
  const { inventory, stockReductions, purchaseOrders, selectedOutlet } = useApp();

  if (!selectedOutlet) return null;

  // Get recent activities for the selected outlet
  const recentInventory = inventory
    .filter(item => item.outletId === selectedOutlet)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  const recentReductions = stockReductions
    .filter(reduction => reduction.outletId === selectedOutlet)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 2);

  const recentPOs = purchaseOrders
    .filter(po => po.outletId === selectedOutlet)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 2);

  const activities = [
    ...recentInventory.map(item => ({
      id: item.id,
      type: 'inventory',
      title: 'Stock Added',
      description: `Added ${item.quantity} units`,
      time: item.createdAt,
      icon: <Package className="w-4 h-4" />,
      color: 'text-green-600 bg-green-100',
    })),
    ...recentReductions.map(reduction => ({
      id: reduction.id,
      type: 'reduction',
      title: 'Stock Reduced',
      description: `${reduction.quantity} units - ${reduction.reason}`,
      time: reduction.createdAt,
      icon: <Trash2 className="w-4 h-4" />,
      color: 'text-red-600 bg-red-100',
    })),
    ...recentPOs.map(po => ({
      id: po.id,
      type: 'purchase',
      title: 'Purchase Order',
      description: `${po.poNumber} - ${po.status}`,
      time: po.createdAt,
      icon: <ShoppingCart className="w-4 h-4" />,
      color: 'text-blue-600 bg-blue-100',
    })),
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h3>
      
      <div className="space-y-4">
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="mx-auto h-12 w-12 text-gray-400 mb-3" />
            <p className="text-gray-500">No recent activity</p>
          </div>
        ) : (
          activities.map((activity) => (
            <div key={activity.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className={`p-2 rounded-lg ${activity.color}`}>
                {activity.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                <p className="text-sm text-gray-600 truncate">{activity.description}</p>
              </div>
              <div className="text-xs text-gray-500">
                {new Date(activity.time).toLocaleDateString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}