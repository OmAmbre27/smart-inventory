export interface User {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: UserRole;
  outletIds: string[];
  isActive: boolean;
  location?: string;
  createdAt: string;
  createdBy?: string;
  language?: 'en' | 'hi';
}

export type UserRole = 'super_admin' | 'admin' | 'manager' | 'storekeeper' | 'finance' | 'franchisee_viewer' | 'hygiene_supervisor';

export interface Outlet {
  id: string;
  name: string;
  address: string;
  phone: string;
  type: 'cloud_kitchen' | 'qsr' | 'hotel' | 'restaurant';
  managerId?: string;
  adminId?: string;
  isActive: boolean;
  createdAt: string;
  lastActivity?: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  unit: 'kg' | 'g' | 'l' | 'ml' | 'pieces';
  isPerishable: boolean;
  defaultSupplierId?: string;
  minStockThreshold: number;
  autoReorderQuantity?: number;
  createdAt: string;
}

export interface InventoryItem {
  id: string;
  productId: string;
  outletId: string;
  quantity: number;
  expiryDate?: string;
  supplierId: string;
  source: 'hyperpure' | 'local_market' | 'other' | 'transfer';
  batchNumber?: string;
  purchasePrice?: number;
  addedBy: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  isLocked?: boolean;
  lockDate?: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  email?: string;
  type: 'hyperpure' | 'local_market' | 'other';
  isActive: boolean;
  createdAt: string;
  performanceScore?: number;
  onTimeDeliveryRate?: number;
  qualityRating?: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  outletId: string;
  supplierId: string;
  items: POItem[];
  status: 'draft' | 'sent' | 'received' | 'cancelled';
  expectedDeliveryDate: string;
  totalAmount: number;
  createdBy: string;
  receivedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface POItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface StockReduction {
  id: string;
  productId: string;
  outletId: string;
  quantity: number;
  reason: 'sold' | 'spoilage' | 'theft' | 'other';
  notes?: string;
  reducedBy: string;
  createdAt: string;
}

export interface WastageEntry {
  id: string;
  productId: string;
  outletId: string;
  quantity: number;
  reason: string;
  photoUrl?: string;
  flaggedBy: string;
  createdAt: string;
}

export interface MenuItem {
  id: string;
  name: string;
  ingredients: MenuIngredient[];
  costPerPlate: number;
  sellingPrice?: number;
  category: string;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
}

export interface MenuIngredient {
  productId: string;
  quantity: number;
  unit: string;
}

export interface ManualOrder {
  id: string;
  outletId: string;
  source: 'whatsapp' | 'zomato' | 'swiggy' | 'ondc' | 'direct';
  customerName?: string;
  items: OrderItem[];
  totalAmount: number;
  notes?: string;
  createdBy: string;
  createdAt: string;
}

export interface OrderItem {
  menuItemId: string;
  quantity: number;
}

export interface OutletTransfer {
  id: string;
  fromOutletId: string;
  toOutletId: string;
  productId: string;
  quantity: number;
  transferPrice: number;
  notes?: string;
  transferredBy: string;
  createdAt: string;
}

export interface HygieneLog {
  id: string;
  outletId: string;
  photoUrl: string;
  comments?: string;
  status: 'pending' | 'approved' | 'flagged';
  uploadedBy: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
}

export interface GoodsReceived {
  id: string;
  outletId: string;
  productId: string;
  quantity: number;
  price: number;
  source: string;
  expiryDate?: string;
  receivedBy: string;
  createdAt: string;
}

export interface MenuReceiving {
  id: string;
  outletId: string;
  dishName: string;
  productId: string;
  quantity: number;
  pricePerUnit: number;
  receivedBy: string;
  createdAt: string;
}

export interface StockAudit {
  id: string;
  outletId: string;
  productId: string;
  systemQuantity: number;
  actualQuantity: number;
  difference: number;
  auditedBy: string;
  createdAt: string;
  notes?: string;
}

export interface LowStockAlert {
  id: string;
  productId: string;
  outletId: string;
  currentStock: number;
  threshold: number;
  suggestedReorder: number;
  isRead: boolean;
  createdAt: string;
}

export interface DailySummary {
  id: string;
  outletId: string;
  date: string;
  totalStockConsumed: number;
  pendingPOs: number;
  totalWastageValue: number;
  totalWastageWeight: number;
  hygienePhotoStatus: 'uploaded' | 'pending' | 'approved' | 'flagged';
  sentAt: string;
  sentTo: string[];
}

export interface VendorPerformance {
  id: string;
  supplierId: string;
  onTimeDeliveryRate: number;
  qualityScore: number;
  priceConsistency: number;
  overallScore: number;
  lastUpdated: string;
}

export interface CustomRole {
  id: string;
  name: string;
  permissions: string[];
  createdBy: string;
  createdAt: string;
}

export interface DashboardMetrics {
  totalItems: number;
  lowStockItems: number;
  nearExpiryItems: number;
  totalWastage: number;
  currentStockValue: number;
  itemsExpiringSoon: number;
  profitMargin?: number;
  monthlyRevenue?: number;
}

export interface ReportData {
  inventoryValue: Array<{ date: string; value: number }>;
  productUsage: Array<{ product: string; usage: number }>;
  dailySales: Array<{ date: string; sales: number }>;
  cogsData: Array<{ dish: string; cost: number; revenue: number; profit: number }>;
  profitability: Array<{ dish: string; margin: number; volume: number }>;
}

export interface Translation {
  key: string;
  en: string;
  hi: string;
}

export interface ActivityLog {
  id: string;
  outletId: string;
  userId: string;
  action: string;
  module: string;
  details: string;
  timestamp: string;
}

export interface SystemMetrics {
  totalOutlets: number;
  activeOutlets: number;
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  topPerformingOutlets: Array<{ outletId: string; name: string; revenue: number }>;
  recentActivity: ActivityLog[];
}