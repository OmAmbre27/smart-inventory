import React, { useState, useEffect } from 'react';
import { AlertTriangle, Bell, Package, RefreshCw, CheckCircle } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { LowStockAlert } from '../../types';
import { formatCurrency } from '../../utils/currency';
import { AutomationService } from '../../utils/automation';

export function LowStockAlerts() {
  const { inventory, products, outlets, selectedOutlet } = useApp();
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<LowStockAlert[]>([]);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    checkLowStock();
  }, [inventory, products]);

  const checkLowStock = async () => {
    setIsChecking(true);
    
    const outletInventory = selectedOutlet 
      ? inventory.filter(item => item.outletId === selectedOutlet)
      : inventory;
    
    const lowStockAlerts = AutomationService.checkLowStock(outletInventory, products);
    setAlerts(lowStockAlerts);
    
    // Send notifications for new alerts
    for (const alert of lowStockAlerts) {
      await AutomationService.sendLowStockAlert(alert);
    }
    
    setIsChecking(false);
  };

  const markAsRead = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, isRead: true } : alert
    ));
  };

  const getProductName = (productId: string) => {
    return products.find(p => p.id === productId)?.name || 'Unknown Product';
  };

  const getOutletName = (outletId: string) => {
    return outlets.find(o => o.id === outletId)?.name || 'Unknown Outlet';
  };

  const unreadAlerts = alerts.filter(alert => !alert.isRead);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Low Stock Alerts</h2>
          <p className="text-gray-600 mt-1">Monitor and manage inventory thresholds</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-red-50 px-3 py-2 rounded-lg border border-red-200">
            <Bell className="w-4 h-4 text-red-600" />
            <span className="text-sm font-medium text-red-800">
              {unreadAlerts.length} Unread Alerts
            </span>
          </div>
          
          <button
            onClick={checkLowStock}
            disabled={isChecking}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
            <span>Check Stock</span>
          </button>
        </div>
      </div>

      {/* Alert Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Critical Alerts</p>
              <p className="text-2xl font-bold text-red-600">
                {alerts.filter(a => a.currentStock === 0).length}
              </p>
            </div>
            <div className="bg-red-50 p-3 rounded-xl">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Low Stock Items</p>
              <p className="text-2xl font-bold text-amber-600">
                {alerts.filter(a => a.currentStock > 0 && a.currentStock <= a.threshold).length}
              </p>
            </div>
            <div className="bg-amber-50 p-3 rounded-xl">
              <Package className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Suggested Reorders</p>
              <p className="text-2xl font-bold text-blue-600">
                {alerts.reduce((sum, alert) => sum + alert.suggestedReorder, 0)}
              </p>
            </div>
            <div className="bg-blue-50 p-3 rounded-xl">
              <RefreshCw className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Active Alerts ({alerts.length})</h3>
        </div>

        <div className="divide-y divide-gray-200">
          {alerts.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">All Stock Levels Good</h3>
              <p className="mt-1 text-sm text-gray-500">
                No low stock alerts at this time.
              </p>
            </div>
          ) : (
            alerts.map((alert) => {
              const product = products.find(p => p.id === alert.productId);
              const isOutOfStock = alert.currentStock === 0;
              
              return (
                <div
                  key={alert.id}
                  className={`p-6 hover:bg-gray-50 transition-colors ${
                    !alert.isRead ? 'bg-red-50 border-l-4 border-red-500' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-xl ${
                        isOutOfStock ? 'bg-red-100' : 'bg-amber-100'
                      }`}>
                        {isOutOfStock ? (
                          <AlertTriangle className="w-6 h-6 text-red-600" />
                        ) : (
                          <Package className="w-6 h-6 text-amber-600" />
                        )}
                      </div>
                      
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">
                          {getProductName(alert.productId)}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {getOutletName(alert.outletId)} • {product?.unit}
                        </p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className={`text-sm font-medium ${
                            isOutOfStock ? 'text-red-600' : 'text-amber-600'
                          }`}>
                            Current: {alert.currentStock} {product?.unit}
                          </span>
                          <span className="text-sm text-gray-500">
                            Threshold: {alert.threshold} {product?.unit}
                          </span>
                          <span className="text-sm text-blue-600">
                            Suggested: {alert.suggestedReorder} {product?.unit}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <p className="text-sm text-gray-500">
                          {new Date(alert.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(alert.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                      
                      {!alert.isRead && (
                        <button
                          onClick={() => markAsRead(alert.id)}
                          className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700"
                        >
                          Mark Read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}