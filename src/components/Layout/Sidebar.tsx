import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Trash2, 
  ChefHat,
  FileText,
  Users,
  LogOut,
  Store,
  ClipboardList,
  TruckIcon,
  BarChart3,
  Settings,
  ArrowRightLeft,
  Camera,
  Clock,
  AlertTriangle,
  Search,
  DollarSign,
  Bell,
  Star,
  Menu,
  X,
  Crown,
  Building,
  Globe
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  permissions: string[];
}

const navItems: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <LayoutDashboard className="w-5 h-5" />,
    permissions: ['view_all_outlets', 'manage_inventory', 'add_inventory', 'global_access'],
  },
  {
    id: 'outlets',
    label: 'Outlet Manager',
    icon: <Store className="w-5 h-5" />,
    permissions: ['view_all_outlets'],
  },
  {
    id: 'users',
    label: 'User Management',
    icon: <Users className="w-5 h-5" />,
    permissions: ['manage_users', 'manage_users_limited'],
  },
  {
    id: 'inventory',
    label: 'Inventory',
    icon: <Package className="w-5 h-5" />,
    permissions: ['manage_inventory', 'add_inventory', 'view_inventory_only'],
  },
  {
    id: 'manual-orders',
    label: 'Manual Order Entry',
    icon: <ClipboardList className="w-5 h-5" />,
    permissions: ['add_manual_orders'],
  },
  {
    id: 'goods-receiving',
    label: 'Goods Receiving',
    icon: <TruckIcon className="w-5 h-5" />,
    permissions: ['manage_inventory', 'add_inventory'],
  },
  {
    id: 'outlet-transfer',
    label: 'Outlet Transfer',
    icon: <ArrowRightLeft className="w-5 h-5" />,
    permissions: ['outlet_transfer'],
  },
  {
    id: 'menu',
    label: 'Menu Management',
    icon: <ChefHat className="w-5 h-5" />,
    permissions: ['manage_recipes'],
  },
  {
    id: 'hygiene-logs',
    label: 'Hygiene Logs',
    icon: <Camera className="w-5 h-5" />,
    permissions: ['upload_hygiene', 'view_reports', 'manage_inventory'],
  },
  {
    id: 'manual-orders-report',
    label: 'Manual Orders Report',
    icon: <BarChart3 className="w-5 h-5" />,
    permissions: ['view_reports', 'manage_inventory'],
  },
  {
    id: 'wastage',
    label: 'Wastage Log',
    icon: <Trash2 className="w-5 h-5" />,
    permissions: ['view_wastage', 'manage_inventory'],
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: <FileText className="w-5 h-5" />,
    permissions: ['view_reports'],
  },
];

// Super Admin Items
const superAdminItems: NavItem[] = [
  {
    id: 'super-admin-dashboard',
    label: 'Super Admin Dashboard',
    icon: <Crown className="w-5 h-5" />,
    permissions: ['global_access'],
  },
  {
    id: 'global-outlets',
    label: 'Global Outlets',
    icon: <Building className="w-5 h-5" />,
    permissions: ['manage_all_outlets'],
  },
  {
    id: 'global-admins',
    label: 'Admin Management',
    icon: <Users className="w-5 h-5" />,
    permissions: ['manage_admins'],
  },
  {
    id: 'global-reports',
    label: 'Global Reports',
    icon: <Globe className="w-5 h-5" />,
    permissions: ['global_reports'],
  },
];

// Advanced Features
const advancedItems: NavItem[] = [
  {
    id: 'low-stock-alerts',
    label: 'Low Stock Alerts',
    icon: <AlertTriangle className="w-5 h-5" />,
    permissions: ['manage_inventory', 'view_reports'],
  },
  {
    id: 'low-stock-report',
    label: 'Low Stock Report',
    icon: <Bell className="w-5 h-5" />,
    permissions: ['manage_inventory', 'view_reports'],
  },
  {
    id: 'stock-audit',
    label: 'Stock Audit',
    icon: <Search className="w-5 h-5" />,
    permissions: ['manage_inventory'],
  },
  {
    id: 'expiry-warnings',
    label: 'Expiry Warnings',
    icon: <Clock className="w-5 h-5" />,
    permissions: ['manage_inventory', 'view_reports'],
  },
  {
    id: 'vendor-performance',
    label: 'Vendor Performance',
    icon: <Star className="w-5 h-5" />,
    permissions: ['view_reports', 'manage_inventory'],
  },
  {
    id: 'recipe-profitability',
    label: 'Recipe Profitability',
    icon: <DollarSign className="w-5 h-5" />,
    permissions: ['view_reports', 'manage_recipes'],
  },
  {
    id: 'daily-summary',
    label: 'Daily Summary',
    icon: <Bell className="w-5 h-5" />,
    permissions: ['view_reports', 'manage_inventory'],
  },
];

// Coming Soon Items
const comingSoonItems = [
  {
    id: 'purchase-orders',
    label: 'Purchase Orders',
    icon: <ShoppingCart className="w-5 h-5" />,
    description: 'Manage POs & Vendors',
  },
  {
    id: 'vendor-management',
    label: 'Vendor Management',
    icon: <Users className="w-5 h-5" />,
    description: 'Rate & Track Vendors',
  },
];

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const { user, logout, hasPermission, isImpersonating, stopImpersonation } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const filteredNavItems = navItems.filter(item => 
    item.permissions.some(permission => hasPermission(permission))
  );

  const filteredSuperAdminItems = superAdminItems.filter(item => 
    item.permissions.some(permission => hasPermission(permission))
  );

  const filteredAdvancedItems = advancedItems.filter(item => 
    item.permissions.some(permission => hasPermission(permission))
  );

  const handleTabChange = (tab: string) => {
    onTabChange(tab);
    setIsMobileMenuOpen(false); // Close mobile menu after selection
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleMobileMenu}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-white rounded-xl shadow-lg border border-gray-200"
      >
        {isMobileMenuOpen ? (
          <X className="w-6 h-6 text-gray-600" />
        ) : (
          <Menu className="w-6 h-6 text-gray-600" />
        )}
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-40 w-80 lg:w-64 
        bg-white shadow-lg h-full flex flex-col border-r border-gray-200
        transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
              <ChefHat className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">SmartKitchen</h1>
              <p className="text-sm text-gray-600">Inventory System</p>
            </div>
          </div>
        </div>

        {/* Impersonation Banner */}
        {isImpersonating && (
          <div className="bg-yellow-50 border-b border-yellow-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Crown className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">Impersonating Outlet</span>
              </div>
              <button
                onClick={stopImpersonation}
                className="text-yellow-600 hover:text-yellow-800 text-sm font-medium"
              >
                Exit
              </button>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          {/* Super Admin Navigation */}
          {filteredSuperAdminItems.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-4">
                👑 Super Admin
              </h3>
              <ul className="space-y-2">
                {filteredSuperAdminItems.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => handleTabChange(item.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-4 rounded-xl text-left transition-all duration-200 min-h-[48px] ${
                        activeTab === item.id
                          ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {item.icon}
                      <span className="font-medium text-sm">{item.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Main Navigation */}
          <div className="mb-8">
            <ul className="space-y-2">
              {filteredNavItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => handleTabChange(item.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-4 rounded-xl text-left transition-all duration-200 min-h-[48px] ${
                      activeTab === item.id
                        ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {item.icon}
                    <span className="font-medium text-sm">{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Advanced Features */}
          {filteredAdvancedItems.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-4">
                🚀 Advanced Features
              </h3>
              <ul className="space-y-2">
                {filteredAdvancedItems.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => handleTabChange(item.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-4 rounded-xl text-left transition-all duration-200 min-h-[48px] ${
                        activeTab === item.id
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {item.icon}
                      <span className="font-medium text-sm">{item.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Settings */}
          <div className="mb-8">
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => handleTabChange('settings')}
                  className={`w-full flex items-center space-x-3 px-4 py-4 rounded-xl text-left transition-all duration-200 min-h-[48px] ${
                    activeTab === 'settings'
                      ? 'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Settings className="w-5 h-5" />
                  <span className="font-medium text-sm">Settings</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Coming Soon Section */}
          <div className="mt-8">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-4">
              Coming Soon
            </h3>
            <ul className="space-y-2">
              {comingSoonItems.map((item) => (
                <li key={item.id}>
                  <div className="flex items-center space-x-3 px-4 py-4 rounded-xl text-gray-400 cursor-not-allowed min-h-[48px]">
                    {item.icon}
                    <div>
                      <span className="font-medium text-sm">{item.label}</span>
                      <p className="text-xs">{item.description}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {user?.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize flex items-center space-x-1">
                {user?.role === 'super_admin' && <Crown className="w-3 h-3" />}
                <span>{user?.role?.replace('_', ' ')}</span>
              </p>
            </div>
          </div>
          
          <button
            onClick={logout}
            className="w-full flex items-center space-x-3 px-4 py-4 text-gray-700 hover:bg-red-50 hover:text-red-700 rounded-xl transition-all duration-200 min-h-[48px]"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium text-sm">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
}