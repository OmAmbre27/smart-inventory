import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppProvider, useApp } from './contexts/AppContext';
import { GoogleSheetsProvider } from './contexts/GoogleSheetsContext';
import { LoginForm } from './components/Auth/LoginForm';
import { Sidebar } from './components/Layout/Sidebar';
import { Header } from './components/Layout/Header';
import { MobileBottomNav } from './components/Layout/MobileBottomNav';
import { OutletSelection } from './components/Outlets/OutletSelection';
import { OutletManagement } from './components/Outlets/OutletManagement';
import { UserManagement } from './components/Users/UserManagement';
import { Dashboard } from './components/Dashboard/Dashboard';
import { InventoryManagement } from './components/Inventory/InventoryManagement';
import { ManualOrdersManagement } from './components/ManualOrders/ManualOrdersManagement';
import { ManualOrdersReport } from './components/ManualOrders/ManualOrdersReport';
import { GoodsReceivingManual } from './components/GoodsReceiving/GoodsReceivingManual';
import { OutletTransfer } from './components/OutletTransfer/OutletTransfer';
import { WastageLog } from './components/Wastage/WastageLog';
import { MenuManagement } from './components/Menu/MenuManagement';
import { ReportsManagement } from './components/Reports/ReportsManagement';
import { SettingsManagement } from './components/Settings/SettingsManagement';
import { UserOutletAssignment } from './components/Settings/UserOutletAssignment';
import { HygieneLogs } from './components/HygieneLogs/HygieneLogs';
import { MenuReceiving } from './components/MenuReceiving/MenuReceiving';
import { LowStockAlerts } from './components/Advanced/LowStockAlerts';
import { LowStockReport } from './components/Advanced/LowStockReport';
import { StockAuditComponent } from './components/Advanced/StockAudit';
import { ExpiryWarnings } from './components/Advanced/ExpiryWarnings';
import { VendorPerformanceComponent } from './components/Advanced/VendorPerformance';
import { RecipeProfitability } from './components/Advanced/RecipeProfitability';
import { DailySummaryAutomation } from './components/Advanced/DailySummaryAutomation';
import { SuperAdminDashboard } from './components/SuperAdmin/SuperAdminDashboard';
import { GlobalOutletManagement } from './components/SuperAdmin/GlobalOutletManagement';
import { GlobalAdminManagement } from './components/SuperAdmin/GlobalAdminManagement';
import { GlobalReports } from './components/SuperAdmin/GlobalReports';

function MainApp() {
  const { user, isLoading, hasPermission, isImpersonating, impersonatedOutlet } = useAuth();
  const { selectedOutlet, outlets, setSelectedOutlet } = useApp();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Define getTabTitle function before using it
  const getTabTitle = (tab: string) => {
    switch (tab) {
      case 'super-admin-dashboard':
        return 'Super Admin Dashboard';
      case 'global-outlets':
        return 'Global Outlet Management';
      case 'global-admins':
        return 'Global Admin Management';
      case 'global-reports':
        return 'Global Reports & Analytics';
      case 'dashboard':
        return 'Dashboard';
      case 'outlets':
        return 'Outlet Manager';
      case 'users':
        return 'User Management';
      case 'inventory':
        return 'Inventory Management';
      case 'manual-orders':
        return 'Manual Order Entry';
      case 'manual-orders-report':
        return 'Manual Orders Report';
      case 'goods-receiving':
        return 'Goods Receiving';
      case 'outlet-transfer':
        return 'Outlet Transfer';
      case 'wastage':
        return 'Wastage Log';
      case 'menu':
        return 'Menu Management';
      case 'hygiene-logs':
        return 'Hygiene Logs';
      case 'menu-receiving':
        return 'Menu Receiving';
      case 'low-stock-alerts':
        return 'Low Stock Alerts';
      case 'low-stock-report':
        return 'Low Stock Report';
      case 'stock-audit':
        return 'Stock Audit';
      case 'expiry-warnings':
        return 'Expiry Warnings';
      case 'vendor-performance':
        return 'Vendor Performance';
      case 'recipe-profitability':
        return 'Recipe Profitability';
      case 'daily-summary':
        return 'Daily Summary Automation';
      case 'reports':
        return 'Reports & Analytics';
      case 'settings':
        return 'Settings';
      default:
        return 'Dashboard';
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'super-admin-dashboard':
        return <SuperAdminDashboard />;
      case 'global-outlets':
        return <GlobalOutletManagement />;
      case 'global-admins':
        return <GlobalAdminManagement />;
      case 'global-reports':
        return <GlobalReports />;
      case 'dashboard':
        return <Dashboard onNavigate={setActiveTab} />;
      case 'outlets':
        return <OutletManagement />;
      case 'users':
        return <UserManagement />;
      case 'inventory':
        return <InventoryManagement />;
      case 'manual-orders':
        return <ManualOrdersManagement />;
      case 'manual-orders-report':
        return <ManualOrdersReport />;
      case 'goods-receiving':
        return <GoodsReceivingManual />;
      case 'outlet-transfer':
        return <OutletTransfer />;
      case 'wastage':
        return <WastageLog />;
      case 'menu':
        return <MenuManagement />;
      case 'hygiene-logs':
        return <HygieneLogs />;
      case 'menu-receiving':
        return <MenuReceiving />;
      case 'low-stock-alerts':
        return <LowStockAlerts />;
      case 'low-stock-report':
        return <LowStockReport />;
      case 'stock-audit':
        return <StockAuditComponent />;
      case 'expiry-warnings':
        return <ExpiryWarnings />;
      case 'vendor-performance':
        return <VendorPerformanceComponent />;
      case 'recipe-profitability':
        return <RecipeProfitability />;
      case 'daily-summary':
        return <DailySummaryAutomation />;
      case 'reports':
        return <ReportsManagement />;
      case 'settings':
        return <SettingsManagement />;
      case 'purchase-orders':
        return (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Purchase Orders</h3>
            <p className="text-gray-600 mb-4">Coming soon - Manage purchase orders and vendor relationships</p>
            <button
              onClick={() => window.open('https://docs.google.com/spreadsheets', '_blank')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Preview Vendor Sheet
            </button>
          </div>
        );
      default:
        return <Dashboard onNavigate={setActiveTab} />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  // Super Admin gets special dashboard by default
  if (user.role === 'super_admin' && activeTab === 'dashboard') {
    setActiveTab('super-admin-dashboard');
  }

  // Handle impersonation mode
  const effectiveOutlet = isImpersonating ? impersonatedOutlet : selectedOutlet;

  // Super Admin bypass: No outlet access check for super_admin
  if (user.role === 'super_admin') {
    // Super Admin can access everything without outlet assignment
    return (
      <div className="min-h-screen bg-gray-50 flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-64 flex-shrink-0">
          <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
        
        {/* Mobile Sidebar */}
        <div className="lg:hidden">
          <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          <Header title={getTabTitle(activeTab)} />
          
          <main className="flex-1 p-4 lg:p-6 overflow-x-hidden">
            {renderTabContent()}
          </main>
        </div>

        {/* Mobile Bottom Navigation */}
        <MobileBottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    );
  }

  // Regular user outlet access checks
  const userHasOutletAccess = user.outletIds && user.outletIds.length > 0 && !user.outletIds.includes('all');
  
  if (hasPermission('view_all_outlets') && !effectiveOutlet && !['outlets', 'users', 'super-admin-dashboard', 'global-outlets', 'global-admins', 'global-reports'].includes(activeTab)) {
    return <OutletSelection />;
  }

  if (!hasPermission('view_all_outlets') && !userHasOutletAccess) {
    return <UserOutletAssignment />;
  }

  if (!effectiveOutlet && userHasOutletAccess && !['outlets', 'users', 'super-admin-dashboard', 'global-outlets', 'global-admins', 'global-reports'].includes(activeTab)) {
    const availableOutlets = outlets.filter(outlet => 
      user.outletIds?.includes(outlet.id)
    );
    if (availableOutlets.length > 0) {
      setSelectedOutlet(availableOutlets[0].id);
      return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-600"></div>
        </div>
      );
    }
  }

  if (!effectiveOutlet && !['outlets', 'users', 'super-admin-dashboard', 'global-outlets', 'global-admins', 'global-reports'].includes(activeTab) && !hasPermission('view_all_outlets')) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Outlet Access</h2>
          <p className="text-gray-600">Please contact your administrator to assign you to an outlet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 flex-shrink-0">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
      
      {/* Mobile Sidebar */}
      <div className="lg:hidden">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header title={getTabTitle(activeTab)} />
        
        <main className="flex-1 p-4 lg:p-6 overflow-x-hidden">
          {renderTabContent()}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <GoogleSheetsProvider>
          <MainApp />
        </GoogleSheetsProvider>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;