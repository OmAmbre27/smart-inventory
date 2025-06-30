import React from 'react';
import { LayoutDashboard, Package, ClipboardList, BarChart3, Camera } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface MobileBottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function MobileBottomNav({ activeTab, onTabChange }: MobileBottomNavProps) {
  const { hasPermission } = useAuth();

  const bottomNavItems = [
    {
      id: 'dashboard',
      label: 'Home',
      icon: <LayoutDashboard className="w-5 h-5" />,
      permissions: ['view_all_outlets', 'manage_inventory', 'add_inventory'],
    },
    {
      id: 'inventory',
      label: 'Inventory',
      icon: <Package className="w-5 h-5" />,
      permissions: ['manage_inventory', 'add_inventory', 'view_inventory_only'],
    },
    {
      id: 'manual-orders',
      label: 'Orders',
      icon: <ClipboardList className="w-5 h-5" />,
      permissions: ['add_manual_orders'],
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: <BarChart3 className="w-5 h-5" />,
      permissions: ['view_reports'],
    },
    {
      id: 'hygiene-logs',
      label: 'Hygiene',
      icon: <Camera className="w-5 h-5" />,
      permissions: ['upload_hygiene', 'view_reports', 'manage_inventory'],
    },
  ];

  const filteredItems = bottomNavItems.filter(item => 
    item.permissions.some(permission => hasPermission(permission))
  );

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-2 z-30">
      <div className="flex justify-around items-center">
        {filteredItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 min-w-[60px] min-h-[60px] ${
              activeTab === item.id
                ? 'bg-orange-100 text-orange-600'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            {item.icon}
            <span className="text-xs font-medium mt-1">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}