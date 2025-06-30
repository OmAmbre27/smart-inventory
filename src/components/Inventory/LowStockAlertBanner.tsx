import React from 'react';
import { AlertTriangle, Bell, X } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

interface LowStockItem {
  productId: string;
  productName: string;
  currentStock: number;
  threshold: number;
  unit: string;
  severity: 'critical' | 'warning';
}

interface LowStockAlertBannerProps {
  onDismiss?: () => void;
}

export function LowStockAlertBanner({ onDismiss }: LowStockAlertBannerProps) {
  const { inventory, products, selectedOutlet } = useApp();
  
  // Get thresholds from localStorage
  const getThresholds = () => {
    const saved = localStorage.getItem('lowStockThresholds');
    return saved ? JSON.parse(saved) : [];
  };

  const checkLowStock = (): LowStockItem[] => {
    if (!selectedOutlet) return [];
    
    const thresholds = getThresholds().filter((t: any) => t.outletId === selectedOutlet);
    const lowStockItems: LowStockItem[] = [];
    
    thresholds.forEach((threshold: any) => {
      const product = products.find(p => p.id === threshold.productId);
      if (!product) return;
      
      const currentStock = inventory
        .filter(item => item.productId === threshold.productId && item.outletId === selectedOutlet)
        .reduce((sum, item) => sum + item.quantity, 0);
      
      if (currentStock <= threshold.threshold) {
        lowStockItems.push({
          productId: threshold.productId,
          productName: product.name,
          currentStock,
          threshold: threshold.threshold,
          unit: product.unit,
          severity: currentStock === 0 ? 'critical' : 'warning',
        });
      }
    });
    
    return lowStockItems;
  };

  const lowStockItems = checkLowStock();
  
  if (lowStockItems.length === 0) return null;

  const criticalItems = lowStockItems.filter(item => item.severity === 'critical');
  const warningItems = lowStockItems.filter(item => item.severity === 'warning');

  return (
    <div className="bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-500 rounded-lg p-4 mb-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className="bg-red-100 p-2 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-red-900 mb-2">
              ⚠️ Low Stock Alert ({lowStockItems.length} items)
            </h3>
            
            {criticalItems.length > 0 && (
              <div className="mb-3">
                <h4 className="font-medium text-red-800 mb-1">🔴 Out of Stock ({criticalItems.length})</h4>
                <div className="space-y-1">
                  {criticalItems.slice(0, 3).map(item => (
                    <div key={item.productId} className="text-sm text-red-700">
                      <span className="font-medium">{item.productName}</span> - 
                      <span className="text-red-900 font-bold"> 0 {item.unit}</span> 
                      (Threshold: {item.threshold} {item.unit})
                    </div>
                  ))}
                  {criticalItems.length > 3 && (
                    <div className="text-sm text-red-600">
                      +{criticalItems.length - 3} more items out of stock
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {warningItems.length > 0 && (
              <div>
                <h4 className="font-medium text-orange-800 mb-1">🟠 Low Stock ({warningItems.length})</h4>
                <div className="space-y-1">
                  {warningItems.slice(0, 3).map(item => (
                    <div key={item.productId} className="text-sm text-orange-700">
                      <span className="font-medium">{item.productName}</span> - 
                      <span className="text-orange-900 font-bold"> {item.currentStock} {item.unit}</span> 
                      (Threshold: {item.threshold} {item.unit})
                    </div>
                  ))}
                  {warningItems.length > 3 && (
                    <div className="text-sm text-orange-600">
                      +{warningItems.length - 3} more items below threshold
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <div className="mt-3 flex items-center space-x-4">
              <button className="text-sm bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition-colors">
                📧 Notify Manager
              </button>
              <button className="text-sm bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors">
                📋 Create Purchase Order
              </button>
            </div>
          </div>
        </div>
        
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-red-400 hover:text-red-600 p-1 hover:bg-red-100 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}