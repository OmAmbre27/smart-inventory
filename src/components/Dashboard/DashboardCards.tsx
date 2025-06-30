import React from 'react';
import { Package, AlertTriangle, Calendar, Trash2, DollarSign, Clock } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency } from '../../utils/currency';

export function DashboardCards() {
  const { selectedOutlet, getDashboardMetrics } = useApp();
  const { user } = useAuth();
  
  if (!selectedOutlet) return null;
  
  const metrics = getDashboardMetrics(selectedOutlet);

  const getCardsForRole = () => {
    if (user?.role === 'storekeeper') {
      return [
        {
          title: 'Current Stock Items',
          value: metrics.totalItems,
          icon: <Package className="w-6 lg:w-8 h-6 lg:h-8" />,
          color: 'from-blue-500 to-blue-600',
          textColor: 'text-blue-600',
          bgColor: 'bg-blue-50',
        },
        {
          title: 'Items Expiring Soon',
          value: metrics.itemsExpiringSoon,
          icon: <Clock className="w-6 lg:w-8 h-6 lg:h-8" />,
          color: 'from-orange-500 to-orange-600',
          textColor: 'text-orange-600',
          bgColor: 'bg-orange-50',
        },
      ];
    }

    return [
      {
        title: 'Total Items',
        value: metrics.totalItems,
        icon: <Package className="w-6 lg:w-8 h-6 lg:h-8" />,
        color: 'from-blue-500 to-blue-600',
        textColor: 'text-blue-600',
        bgColor: 'bg-blue-50',
      },
      {
        title: 'Low Stock Items',
        value: metrics.lowStockItems,
        icon: <AlertTriangle className="w-6 lg:w-8 h-6 lg:h-8" />,
        color: 'from-amber-500 to-amber-600',
        textColor: 'text-amber-600',
        bgColor: 'bg-amber-50',
      },
      {
        title: 'Near Expiry',
        value: metrics.nearExpiryItems,
        icon: <Calendar className="w-6 lg:w-8 h-6 lg:h-8" />,
        color: 'from-red-500 to-red-600',
        textColor: 'text-red-600',
        bgColor: 'bg-red-50',
      },
      {
        title: 'Total Wastage',
        value: `${metrics.totalWastage} units`,
        icon: <Trash2 className="w-6 lg:w-8 h-6 lg:h-8" />,
        color: 'from-purple-500 to-purple-600',
        textColor: 'text-purple-600',
        bgColor: 'bg-purple-50',
      },
      {
        title: 'Stock Value',
        value: formatCurrency(metrics.currentStockValue),
        icon: <DollarSign className="w-6 lg:w-8 h-6 lg:h-8" />,
        color: 'from-green-500 to-green-600',
        textColor: 'text-green-600',
        bgColor: 'bg-green-50',
      },
    ];
  };

  const cards = getCardsForRole();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 lg:gap-6 mb-6 lg:mb-8">
      {cards.map((card, index) => (
        <div
          key={index}
          className="bg-white rounded-2xl shadow-lg p-4 lg:p-6 border border-gray-200 hover:shadow-xl transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs lg:text-sm font-medium text-gray-600 mb-2 truncate">{card.title}</p>
              <p className="text-lg lg:text-2xl font-bold text-gray-900 truncate">{card.value}</p>
            </div>
            <div className={`${card.bgColor} p-2 lg:p-3 rounded-xl flex-shrink-0 ml-2`}>
              <div className={card.textColor}>{card.icon}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}