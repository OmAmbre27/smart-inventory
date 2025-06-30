import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (action: string) => boolean;
  isLoading: boolean;
  addUser: (userData: Omit<User, 'id' | 'createdAt'>) => void;
  updateUser: (userId: string, updates: Partial<User>) => void;
  deleteUser: (userId: string) => void;
  resetUserPassword: (userId: string, newPassword: string) => void;
  getAllUsers: () => User[];
  getUsersByRole: (role: UserRole) => User[];
  impersonateOutlet: (outletId: string) => void;
  stopImpersonation: () => void;
  isImpersonating: boolean;
  impersonatedOutlet: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo including Super Admin
const mockUsers: User[] = [
  {
    id: '0',
    name: 'Super Admin',
    email: 'owner@smartkitchen.com',
    mobile: '+91 98765 43200',
    role: 'super_admin',
    outletIds: ['all'], // Special identifier for global access
    isActive: true,
    location: 'Global HQ',
    createdAt: '2024-01-01',
  },
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@smartkitchen.com',
    mobile: '+91 98765 43210',
    role: 'admin',
    outletIds: ['1', '2'], // Only assigned outlets
    isActive: true,
    location: 'Head Office',
    createdAt: '2024-01-01',
  },
  {
    id: '1b',
    name: 'Admin User B',
    email: 'admin2@smartkitchen.com',
    mobile: '+91 98765 43215',
    role: 'admin',
    outletIds: ['3', '4'], // Different outlets
    isActive: true,
    location: 'Regional Office',
    createdAt: '2024-01-01',
  },
  {
    id: '2',
    name: 'Manager Rajesh',
    email: 'manager@smartkitchen.com',
    mobile: '+91 98765 43211',
    role: 'manager',
    outletIds: ['1'],
    isActive: true,
    location: 'Downtown Branch',
    createdAt: '2024-01-01',
    createdBy: '1',
  },
  {
    id: '3',
    name: 'Storekeeper Priya',
    email: 'storekeeper@smartkitchen.com',
    mobile: '+91 98765 43212',
    role: 'storekeeper',
    outletIds: ['1'],
    isActive: true,
    location: 'Downtown Branch',
    createdAt: '2024-01-01',
    createdBy: '2',
  },
];

const rolePermissions = {
  super_admin: [
    'global_access',
    'manage_all_outlets',
    'manage_all_users',
    'view_all_reports',
    'system_settings',
    'impersonate_users',
    'view_system_metrics',
    'manage_admins',
    'outlet_assignment',
    'global_reports',
    'activity_monitoring',
    'view_all_outlets',
    'manage_outlets', // Only Super Admin can manage outlets
    'manage_users',
    'reduce_inventory',
    'view_reports',
    'manage_recipes',
    'add_products',
    'manage_suppliers',
    'create_po',
    'add_inventory',
    'view_wastage',
    'add_manual_orders',
    'outlet_transfer',
    'manage_inventory',
    'upload_hygiene'
  ],
  admin: [
    'view_all_outlets', // Only for assigned outlets
    // 'manage_outlets', // REMOVED - Admins cannot manage outlets
    'manage_users',
    'reduce_inventory',
    'view_reports',
    'manage_recipes',
    'add_products',
    'manage_suppliers',
    'create_po',
    'add_inventory',
    'view_wastage',
    'add_manual_orders',
    'outlet_transfer',
    'manage_inventory',
    'upload_hygiene'
  ],
  manager: [
    'manage_inventory',
    'reduce_inventory',
    'view_reports',
    'add_products',
    'manage_suppliers',
    'create_po',
    'add_inventory',
    'view_wastage',
    'add_manual_orders',
    'manage_users_limited',
    'outlet_transfer',
    'upload_hygiene'
  ],
  storekeeper: [
    'add_inventory',
    'add_manual_orders',
    'view_inventory_only',
    'upload_hygiene'
  ]
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [isLoading, setIsLoading] = useState(true);
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [impersonatedOutlet, setImpersonatedOutlet] = useState<string | null>(null);
  const [originalUser, setOriginalUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const foundUser = users.find(u => u.email === email && u.isActive);
    
    if (foundUser && password === 'demo123') {
      setUser(foundUser);
      localStorage.setItem('currentUser', JSON.stringify(foundUser));
      return true;
    }
    
    return false;
  };

  const logout = () => {
    setUser(null);
    setIsImpersonating(false);
    setImpersonatedOutlet(null);
    setOriginalUser(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('selectedOutlet');
  };

  const hasPermission = (action: string): boolean => {
    if (!user) return false;
    return rolePermissions[user.role]?.includes(action) || false;
  };

  const impersonateOutlet = (outletId: string) => {
    if (user && hasPermission('impersonate_users')) {
      if (!originalUser) {
        setOriginalUser(user);
      }
      setIsImpersonating(true);
      setImpersonatedOutlet(outletId);
    }
  };

  const stopImpersonation = () => {
    if (originalUser) {
      setUser(originalUser);
      setOriginalUser(null);
    }
    setIsImpersonating(false);
    setImpersonatedOutlet(null);
  };

  const addUser = (userData: Omit<User, 'id' | 'createdAt'>) => {
    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      createdBy: user?.id,
    };
    setUsers(prev => [...prev, newUser]);
  };

  const updateUser = (userId: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(u => 
      u.id === userId ? { ...u, ...updates } : u
    ));
    
    if (user && user.id === userId) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    }
  };

  const deleteUser = (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
  };

  const resetUserPassword = (userId: string, newPassword: string) => {
    // In a real app, this would make an API call
    console.log(`Password reset for user ${userId}: ${newPassword}`);
  };

  const getAllUsers = () => {
    // Super Admin can see all users
    if (user?.role === 'super_admin') {
      return users;
    } else if (user?.role === 'admin') {
      // Admin can only see users in their assigned outlets (but not other admins)
      return users.filter(u => 
        u.id === user.id || // Can see themselves
        (u.role !== 'admin' && u.outletIds.some(outletId => user.outletIds.includes(outletId))) || // Users in same outlets (but not other admins)
        u.createdBy === user.id // Users they created
      );
    } else if (user?.role === 'manager') {
      // Manager can see users in their outlets
      return users.filter(u => 
        u.id === user.id || // Can see themselves
        (u.role === 'storekeeper' && u.outletIds.some(outletId => user.outletIds.includes(outletId))) ||
        u.createdBy === user.id
      );
    }
    return []; // Storekeepers can't see other users
  };

  const getUsersByRole = (role: UserRole) => {
    const visibleUsers = getAllUsers();
    return visibleUsers.filter(u => u.role === role);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      hasPermission, 
      isLoading,
      addUser,
      updateUser,
      deleteUser,
      resetUserPassword,
      getAllUsers,
      getUsersByRole,
      impersonateOutlet,
      stopImpersonation,
      isImpersonating,
      impersonatedOutlet,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}