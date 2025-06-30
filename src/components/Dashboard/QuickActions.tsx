import React from 'react';
import { Plus, ShoppingCart, FileText, ChefHat, ClipboardList, Package, TruckIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface QuickActionsProps {
  onActionClick?: (action: string) => void;
}

export function QuickActions({ onActionClick }: QuickActionsProps) {
  const { hasPermission, user } = useAuth();

  const getActionsForRole = () => {
    if (user?.role === 'storekeeper') {
      return [
        {
          id: 'inventory',
          title: 'Add Inventory',
          description: 'Add new stock items',
          icon: <Plus className="w-6 h-6" />,
          color: 'from-green-500 to-green-600',
          permission: 'add_inventory',
        },
        {
          id: 'manual-orders',
          title: 'Add Manual Order',
          description: 'Record manual orders',
          icon: <ClipboardList className="w-6 h-6" />,
          color: 'from-purple-500 to-purple-600',
          permission: 'add_manual_orders',
        },
        {
          id: 'hygiene-logs',
          title: 'Upload Hygiene Photo',
          description: 'Daily hygiene check',
          icon: <Package className="w-6 h-6" />,
          color: 'from-blue-500 to-blue-600',
          permission: 'upload_hygiene',
        },
        {
          id: 'goods-receiving',
          title: 'Goods Receiving',
          description: 'Log received goods',
          icon: <TruckIcon className="w-6 h-6" />,
          color: 'from-indigo-500 to-indigo-600',
          permission: 'add_inventory',
        },
      ];
    }

    return [
      {
        id: 'inventory',
        title: 'Add Product',
        description: 'Add new products to catalog',
        icon: <Plus className="w-6 h-6" />,
        color: 'from-blue-500 to-blue-600',
        permission: 'add_products',
      },
      {
        id: 'purchase-orders',
        title: 'Create PO',
        description: 'Create purchase order',
        icon: <ShoppingCart className="w-6 h-6" />,
        color: 'from-orange-500 to-orange-600',
        permission: 'create_po',
      },
      {
        id: 'reports',
        title: 'View Reports',
        description: 'Access analytics & reports',
        icon: <FileText className="w-6 h-6" />,
        color: 'from-purple-500 to-purple-600',
        permission: 'view_reports',
      },
      {
        id: 'menu',
        title: 'Add Menu Item',
        description: 'Create new menu items',
        icon: <ChefHat className="w-6 h-6" />,
        color: 'from-red-500 to-red-600',
        permission: 'manage_recipes',
      },
      {
        id: 'manual-orders',
        title: 'Manual Orders',
        description: 'Record manual orders',
        icon: <ClipboardList className="w-6 h-6" />,
        color: 'from-green-500 to-green-600',
        permission: 'add_manual_orders',
      },
      {
        id: 'hygiene-logs',
        title: 'Hygiene Logs',
        description: 'Review hygiene status',
        icon: <Package className="w-6 h-6" />,
        color: 'from-teal-500 to-teal-600',
        permission: 'upload_hygiene',
      },
    ];
  };

  const actions = getActionsForRole().filter(action => hasPermission(action.permission));

  const handleActionClick = (actionId: string) => {
    if (onActionClick) {
      onActionClick(actionId);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={() => handleActionClick(action.id)}
            className="p-4 rounded-xl border border-gray-200 hover:border-gray-300 transition-all duration-200 text-left group hover:shadow-md cursor-pointer bg-white hover:bg-gray-50 min-h-[120px] touch-feedback"
          >
            <div className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
              <div className="text-white">{action.icon}</div>
            </div>
            <h4 className="font-medium text-gray-900 mb-1">{action.title}</h4>
            <p className="text-sm text-gray-600">{action.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}