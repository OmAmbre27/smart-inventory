import React, { useState, useEffect } from 'react';
import { Calendar, AlertTriangle, Clock, Package, Filter } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { formatCurrency } from '../../utils/currency';

interface ExpiryItem {
  id: string;
  productName: string;
  quantity: number;
  unit: string;
  expiryDate: string;
  daysUntilExpiry: number;
  status: 'fresh' | 'near_expiry' | 'expired';
  outletName: string;
  purchasePrice?: number;
}

export function ExpiryWarnings() {
  const { inventory, products, outlets, selectedOutlet } = useApp();
  const [expiryItems, setExpiryItems] = useState<ExpiryItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'fresh' | 'near_expiry' | 'expired'>('all');

  useEffect(() => {
    calculateExpiryStatus();
  }, [inventory, products, outlets, selectedOutlet]);

  const calculateExpiryStatus = () => {
    const today = new Date();
    const items: ExpiryItem[] = [];

    const filteredInventory = selectedOutlet 
      ? inventory.filter(item => item.outletId === selectedOutlet)
      : inventory;

    filteredInventory.forEach(item => {
      if (!item.expiryDate) return;

      const product = products.find(p => p.id === item.productId);
      const outlet = outlets.find(o => o.id === item.outletId);
      const expiryDate = new Date(item.expiryDate);
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      let status: 'fresh' | 'near_expiry' | 'expired';
      if (daysUntilExpiry < 0) {
        status = 'expired';
      } else if (daysUntilExpiry <= 3) {
        status = 'near_expiry';
      } else {
        status = 'fresh';
      }

      items.push({
        id: item.id,
        productName: product?.name || 'Unknown Product',
        quantity: item.quantity,
        unit: product?.unit || '',
        expiryDate: item.expiryDate,
        daysUntilExpiry,
        status,
        outletName: outlet?.name || 'Unknown Outlet',
        purchasePrice: item.purchasePrice,
      });
    });

    // Sort by days until expiry (expired first, then near expiry)
    items.sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);
    setExpiryItems(items);
  };

  const filteredItems = expiryItems.filter(item => 
    filter === 'all' || item.status === filter
  );

  const getStatusBadge = (status: string, daysUntilExpiry: number) => {
    switch (status) {
      case 'expired':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Expired ({Math.abs(daysUntilExpiry)} days ago)
          </span>
        );
      case 'near_expiry':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
            <Clock className="w-3 h-3 mr-1" />
            Expires in {daysUntilExpiry} day{daysUntilExpiry !== 1 ? 's' : ''}
          </span>
        );
      case 'fresh':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <Package className="w-3 h-3 mr-1" />
            Fresh ({daysUntilExpiry} days left)
          </span>
        );
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'expired':
        return 'border-l-red-500 bg-red-50';
      case 'near_expiry':
        return 'border-l-orange-500 bg-orange-50';
      case 'fresh':
        return 'border-l-green-500 bg-green-50';
      default:
        return 'border-l-gray-500';
    }
  };

  const expiredCount = expiryItems.filter(item => item.status === 'expired').length;
  const nearExpiryCount = expiryItems.filter(item => item.status === 'near_expiry').length;
  const freshCount = expiryItems.filter(item => item.status === 'fresh').length;

  const totalExpiredValue = expiryItems
    .filter(item => item.status === 'expired')
    .reduce((sum, item) => sum + (item.quantity * (item.purchasePrice || 0)), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Expiry Warnings</h2>
          <p className="text-gray-600 mt-1">Monitor product shelf life and prevent wastage</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Expired Items</p>
              <p className="text-2xl font-bold text-red-600">{expiredCount}</p>
              <p className="text-xs text-red-500 mt-1">
                Value: {formatCurrency(totalExpiredValue)}
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
              <p className="text-sm font-medium text-gray-600 mb-2">Near Expiry</p>
              <p className="text-2xl font-bold text-orange-600">{nearExpiryCount}</p>
              <p className="text-xs text-orange-500 mt-1">Next 3 days</p>
            </div>
            <div className="bg-orange-50 p-3 rounded-xl">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Fresh Items</p>
              <p className="text-2xl font-bold text-green-600">{freshCount}</p>
              <p className="text-xs text-green-500 mt-1">Good condition</p>
            </div>
            <div className="bg-green-50 p-3 rounded-xl">
              <Package className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Total Items</p>
              <p className="text-2xl font-bold text-gray-900">{expiryItems.length}</p>
              <p className="text-xs text-gray-500 mt-1">With expiry dates</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-xl">
              <Calendar className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <div className="flex space-x-2">
            {[
              { key: 'all', label: 'All Items', count: expiryItems.length },
              { key: 'expired', label: 'Expired', count: expiredCount },
              { key: 'near_expiry', label: 'Near Expiry', count: nearExpiryCount },
              { key: 'fresh', label: 'Fresh', count: freshCount },
            ].map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setFilter(key as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {label} ({count})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Items List */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {filter === 'all' ? 'All Items' : 
             filter === 'expired' ? 'Expired Items' :
             filter === 'near_expiry' ? 'Near Expiry Items' : 'Fresh Items'} 
            ({filteredItems.length})
          </h3>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No items found</h3>
              <p className="mt-1 text-sm text-gray-500">
                No items match the selected filter criteria.
              </p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className={`p-6 border-l-4 ${getStatusColor(item.status)}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="bg-white p-3 rounded-xl shadow-sm">
                      <Package className="w-6 h-6 text-gray-600" />
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">{item.productName}</h4>
                      <p className="text-sm text-gray-600">{item.outletName}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-sm font-medium text-gray-900">
                          {item.quantity} {item.unit}
                        </span>
                        {item.purchasePrice && (
                          <span className="text-sm text-gray-600">
                            Value: {formatCurrency(item.quantity * item.purchasePrice)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="mb-2">
                      {getStatusBadge(item.status, item.daysUntilExpiry)}
                    </div>
                    <p className="text-sm text-gray-500">
                      Expires: {new Date(item.expiryDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}