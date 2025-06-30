import React, { useState, useRef, useEffect } from 'react';
import { Bell, Search, MapPin, X, AlertTriangle, Calendar, Package, Camera, CheckCircle, User } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';

interface HeaderProps {
  title: string;
}

interface Notification {
  id: string;
  type: 'low_stock' | 'expiring' | 'grn_received' | 'hygiene_pending';
  title: string;
  message: string;
  isRead: boolean;
  timestamp: string;
  outletId?: string;
}

export function Header({ title }: HeaderProps) {
  const { outlets, selectedOutlet, inventory, products, hygieneLogs, goodsReceived } = useApp();
  const { user, isImpersonating, impersonatedOutlet } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentOutlet = outlets.find(o => o.id === selectedOutlet);
  const effectiveOutlet = isImpersonating ? impersonatedOutlet : selectedOutlet;

  useEffect(() => {
    generateNotifications();
  }, [inventory, products, hygieneLogs, goodsReceived, selectedOutlet]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const generateNotifications = () => {
    const newNotifications: Notification[] = [];

    if (!effectiveOutlet) return;

    // Get thresholds from localStorage
    const getThresholds = () => {
      const saved = localStorage.getItem('lowStockThresholds');
      return saved ? JSON.parse(saved) : [];
    };

    const thresholds = getThresholds().filter((t: any) => t.outletId === effectiveOutlet);

    // Low stock notifications
    thresholds.forEach((threshold: any) => {
      const product = products.find(p => p.id === threshold.productId);
      if (!product) return;

      const currentStock = inventory
        .filter(item => item.productId === threshold.productId && item.outletId === effectiveOutlet)
        .reduce((sum, item) => sum + item.quantity, 0);

      if (currentStock <= threshold.threshold) {
        newNotifications.push({
          id: `low_stock_${threshold.productId}`,
          type: 'low_stock',
          title: currentStock === 0 ? 'Out of Stock' : 'Low Stock Alert',
          message: `${product.name}: ${currentStock} ${product.unit} (Threshold: ${threshold.threshold} ${product.unit})`,
          isRead: false,
          timestamp: new Date().toISOString(),
          outletId: effectiveOutlet,
        });
      }
    });

    // Expiring items notifications
    const today = new Date();
    const threeDaysFromNow = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);

    inventory
      .filter(item => item.outletId === effectiveOutlet && item.expiryDate)
      .forEach(item => {
        const expiryDate = new Date(item.expiryDate!);
        if (expiryDate <= threeDaysFromNow) {
          const product = products.find(p => p.id === item.productId);
          const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          
          newNotifications.push({
            id: `expiring_${item.id}`,
            type: 'expiring',
            title: daysUntilExpiry <= 0 ? 'Item Expired' : 'Item Expiring Soon',
            message: `${product?.name}: ${daysUntilExpiry <= 0 ? 'Expired' : `Expires in ${daysUntilExpiry} day${daysUntilExpiry !== 1 ? 's' : ''}`}`,
            isRead: false,
            timestamp: new Date().toISOString(),
            outletId: effectiveOutlet,
          });
        }
      });

    // GRN received notifications (last 24 hours)
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    goodsReceived
      .filter(grn => grn.outletId === effectiveOutlet && new Date(grn.createdAt) >= yesterday)
      .forEach(grn => {
        const product = products.find(p => p.id === grn.productId);
        newNotifications.push({
          id: `grn_${grn.id}`,
          type: 'grn_received',
          title: 'Goods Received',
          message: `${product?.name}: ${grn.quantity} ${product?.unit} received`,
          isRead: false,
          timestamp: grn.createdAt,
          outletId: effectiveOutlet,
        });
      });

    // Hygiene pending notifications
    const pendingHygiene = hygieneLogs.filter(log => 
      log.outletId === effectiveOutlet && log.status === 'pending'
    );

    if (pendingHygiene.length > 0) {
      newNotifications.push({
        id: `hygiene_pending_${effectiveOutlet}`,
        type: 'hygiene_pending',
        title: 'Hygiene Review Pending',
        message: `${pendingHygiene.length} hygiene log${pendingHygiene.length !== 1 ? 's' : ''} awaiting review`,
        isRead: false,
        timestamp: new Date().toISOString(),
        outletId: effectiveOutlet,
      });
    }

    // Sort by timestamp (newest first)
    newNotifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    setNotifications(newNotifications);
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === notificationId ? { ...notif, isRead: true } : notif
    ));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'low_stock':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'expiring':
        return <Calendar className="w-4 h-4 text-orange-600" />;
      case 'grn_received':
        return <Package className="w-4 h-4 text-green-600" />;
      case 'hygiene_pending':
        return <Camera className="w-4 h-4 text-blue-600" />;
      default:
        return <Bell className="w-4 h-4 text-gray-600" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'low_stock':
        return 'border-l-red-500 bg-red-50';
      case 'expiring':
        return 'border-l-orange-500 bg-orange-50';
      case 'grn_received':
        return 'border-l-green-500 bg-green-50';
      case 'hygiene_pending':
        return 'border-l-blue-500 bg-blue-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-4 lg:px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1 min-w-0">
          {/* Title Section */}
          <div className="min-w-0 flex-1">
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900 truncate">{title}</h1>
            <div className="flex items-center space-x-2 mt-1">
              <p className="text-xs lg:text-sm text-gray-600 hidden sm:block">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
              
              {/* Role and User Info */}
              {user && (
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-400">•</span>
                  <div className="flex items-center space-x-1">
                    <User className="w-3 h-3 text-gray-500" />
                    <span className="text-xs text-gray-600">
                      {user.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Current Outlet Badge */}
          {currentOutlet && (
            <div className="flex items-center space-x-2 px-3 py-2 bg-orange-50 rounded-lg border border-orange-200 min-w-0">
              <MapPin className="w-4 h-4 text-orange-600 flex-shrink-0" />
              <span className="text-sm font-medium text-orange-800 truncate">{currentOutlet.name}</span>
              {isImpersonating && (
                <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                  Viewing
                </span>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 lg:space-x-4 flex-shrink-0">
          {/* Search - Hidden on mobile, shown on larger screens */}
          <div className="relative hidden md:block">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search inventory..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent w-48 lg:w-64"
            />
          </div>

          {/* Mobile Search Button */}
          <button className="md:hidden p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 min-w-[44px] min-h-[44px] flex items-center justify-center">
            <Search className="w-5 h-5" />
          </button>

          {/* Notifications */}
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-gray-400 hover:text-gray-600 relative rounded-lg hover:bg-gray-100 min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden">
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                  <div className="flex items-center space-x-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Mark all read
                      </button>
                    )}
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <X className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center">
                      <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-3" />
                      <h3 className="text-sm font-medium text-gray-900">All caught up!</h3>
                      <p className="text-sm text-gray-500 mt-1">No new notifications</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          onClick={() => markAsRead(notification.id)}
                          className={`p-4 hover:bg-gray-50 cursor-pointer border-l-4 ${getNotificationColor(notification.type)} ${
                            !notification.isRead ? 'bg-opacity-50' : 'bg-opacity-20'
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 mt-1">
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className={`text-sm font-medium ${!notification.isRead ? 'text-gray-900' : 'text-gray-600'}`}>
                                  {notification.title}
                                </p>
                                {!notification.isRead && (
                                  <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></div>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(notification.timestamp).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}