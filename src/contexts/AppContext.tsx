import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Outlet, 
  Product, 
  InventoryItem, 
  Supplier, 
  PurchaseOrder, 
  StockReduction, 
  WastageEntry, 
  MenuItem, 
  ManualOrder,
  DashboardMetrics,
  OutletTransfer,
  HygieneLog,
  GoodsReceived,
  MenuReceiving
} from '../types';
import { mockData } from '../data/mockData';
import { useAuth } from './AuthContext';

interface AppContextType {
  // State
  outlets: Outlet[];
  products: Product[];
  inventory: InventoryItem[];
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  stockReductions: StockReduction[];
  wastageEntries: WastageEntry[];
  menuItems: MenuItem[];
  manualOrders: ManualOrder[];
  outletTransfers: OutletTransfer[];
  hygieneLogs: HygieneLog[];
  goodsReceived: GoodsReceived[];
  menuReceiving: MenuReceiving[];
  selectedOutlet: string | null;
  
  // Actions
  setSelectedOutlet: (outletId: string) => void;
  addOutlet: (outlet: Omit<Outlet, 'id' | 'createdAt'>) => void;
  updateOutlet: (outletId: string, updates: Partial<Outlet>) => void;
  deleteOutlet: (outletId: string) => void;
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  addInventoryItem: (item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  addSupplier: (supplier: Omit<Supplier, 'id' | 'createdAt'>) => void;
  createPurchaseOrder: (po: Omit<PurchaseOrder, 'id' | 'poNumber' | 'createdAt' | 'updatedAt'>) => void;
  markPOAsReceived: (poId: string, receivedBy: string) => void;
  reduceStock: (reduction: Omit<StockReduction, 'id' | 'createdAt'>) => void;
  addWastageEntry: (wastage: Omit<WastageEntry, 'id' | 'createdAt'>) => void;
  addMenuItem: (menuItem: Omit<MenuItem, 'id' | 'createdAt'>) => void;
  addManualOrder: (order: Omit<ManualOrder, 'id' | 'createdAt'>) => void;
  deleteManualOrder: (orderId: string) => void;
  addOutletTransfer: (transfer: Omit<OutletTransfer, 'id' | 'createdAt'>) => void;
  addHygieneLog: (log: Omit<HygieneLog, 'id' | 'createdAt'>) => void;
  updateHygieneLogStatus: (logId: string, status: 'approved' | 'flagged', reviewedBy: string) => void;
  addGoodsReceived: (goods: Omit<GoodsReceived, 'id' | 'createdAt'>) => void;
  addMenuReceiving: (menuReceiving: Omit<MenuReceiving, 'id' | 'createdAt'>) => void;
  getDashboardMetrics: (outletId: string) => DashboardMetrics;
  getInventoryByOutlet: (outletId: string) => InventoryItem[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [outlets, setOutlets] = useState<Outlet[]>(mockData.outlets);
  const [products, setProducts] = useState<Product[]>(mockData.products);
  const [inventory, setInventory] = useState<InventoryItem[]>(mockData.inventory);
  const [suppliers, setSuppliers] = useState<Supplier[]>(mockData.suppliers);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(mockData.purchaseOrders);
  const [stockReductions, setStockReductions] = useState<StockReduction[]>(mockData.stockReductions);
  const [wastageEntries, setWastageEntries] = useState<WastageEntry[]>(mockData.wastageEntries);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(mockData.menuItems);
  const [manualOrders, setManualOrders] = useState<ManualOrder[]>(mockData.manualOrders);
  const [outletTransfers, setOutletTransfers] = useState<OutletTransfer[]>([]);
  const [hygieneLogs, setHygieneLogs] = useState<HygieneLog[]>([]);
  const [goodsReceived, setGoodsReceived] = useState<GoodsReceived[]>([]);
  const [menuReceiving, setMenuReceiving] = useState<MenuReceiving[]>([]);
  const [selectedOutlet, setSelectedOutletState] = useState<string | null>(null);

  // Filter data based on user's outlet access
  const getFilteredOutlets = () => {
    if (!user) return [];
    // Super Admin has access to all outlets
    if (user.role === 'super_admin' || user.outletIds.includes('all')) return outlets;
    return outlets.filter(outlet => user.outletIds.includes(outlet.id));
  };

  const getFilteredData = <T extends { outletId: string }>(data: T[]): T[] => {
    if (!user) return [];
    // Super Admin has access to all data
    if (user.role === 'super_admin' || user.outletIds.includes('all')) return data;
    const userOutlets = user.outletIds;
    return data.filter(item => userOutlets.includes(item.outletId));
  };

  useEffect(() => {
    const stored = localStorage.getItem('selectedOutlet');
    if (stored && user) {
      // Super Admin can access any outlet
      if (user.role === 'super_admin' || user.outletIds.includes('all')) {
        setSelectedOutletState(stored);
      } else if (user.outletIds.includes(stored)) {
        setSelectedOutletState(stored);
      } else {
        // Auto-select first available outlet for non-super admin users
        const availableOutlets = getFilteredOutlets();
        if (availableOutlets.length > 0) {
          setSelectedOutlet(availableOutlets[0].id);
        }
      }
    } else if (user && user.role !== 'super_admin' && !user.outletIds?.includes('all')) {
      const availableOutlets = getFilteredOutlets();
      if (availableOutlets.length > 0) {
        setSelectedOutlet(availableOutlets[0].id);
      }
    }
  }, [user, outlets]);

  const setSelectedOutlet = (outletId: string) => {
    // Super Admin can access any outlet
    if (user && (user.role === 'super_admin' || user.outletIds.includes('all') || user.outletIds.includes(outletId))) {
      setSelectedOutletState(outletId);
      localStorage.setItem('selectedOutlet', outletId);
    }
  };

  const addOutlet = (outlet: Omit<Outlet, 'id' | 'createdAt'>) => {
    const newOutlet: Outlet = {
      ...outlet,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setOutlets(prev => [...prev, newOutlet]);
  };

  const updateOutlet = (outletId: string, updates: Partial<Outlet>) => {
    setOutlets(prev => prev.map(outlet => 
      outlet.id === outletId ? { ...outlet, ...updates } : outlet
    ));
  };

  const deleteOutlet = (outletId: string) => {
    setOutlets(prev => prev.filter(outlet => outlet.id !== outletId));
  };

  const addProduct = (product: Omit<Product, 'id' | 'createdAt'>) => {
    const newProduct: Product = {
      ...product,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setProducts(prev => [...prev, newProduct]);
  };

  const addInventoryItem = (item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newItem: InventoryItem = {
      ...item,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setInventory(prev => [...prev, newItem]);
  };

  const addSupplier = (supplier: Omit<Supplier, 'id' | 'createdAt'>) => {
    const newSupplier: Supplier = {
      ...supplier,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setSuppliers(prev => [...prev, newSupplier]);
  };

  const createPurchaseOrder = (po: Omit<PurchaseOrder, 'id' | 'poNumber' | 'createdAt' | 'updatedAt'>) => {
    const newPO: PurchaseOrder = {
      ...po,
      id: Date.now().toString(),
      poNumber: `PO-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setPurchaseOrders(prev => [...prev, newPO]);
  };

  const markPOAsReceived = (poId: string, receivedBy: string) => {
    setPurchaseOrders(prev => prev.map(po => 
      po.id === poId 
        ? { ...po, status: 'received', receivedBy, updatedAt: new Date().toISOString() }
        : po
    ));

    const po = purchaseOrders.find(p => p.id === poId);
    if (po) {
      po.items.forEach(item => {
        addInventoryItem({
          productId: item.productId,
          outletId: po.outletId,
          quantity: item.quantity,
          supplierId: po.supplierId,
          source: 'other',
          purchasePrice: item.unitPrice,
          addedBy: receivedBy,
        });
      });
    }
  };

  const reduceStock = (reduction: Omit<StockReduction, 'id' | 'createdAt'>) => {
    const newReduction: StockReduction = {
      ...reduction,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setStockReductions(prev => [...prev, newReduction]);

    setInventory(prev => prev.map(item => {
      if (item.productId === reduction.productId && item.outletId === reduction.outletId) {
        const newQuantity = Math.max(0, item.quantity - reduction.quantity);
        return { ...item, quantity: newQuantity, updatedAt: new Date().toISOString() };
      }
      return item;
    }));
  };

  const addWastageEntry = (wastage: Omit<WastageEntry, 'id' | 'createdAt'>) => {
    const newWastage: WastageEntry = {
      ...wastage,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setWastageEntries(prev => [...prev, newWastage]);
  };

  const addMenuItem = (menuItem: Omit<MenuItem, 'id' | 'createdAt'>) => {
    const newMenuItem: MenuItem = {
      ...menuItem,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setMenuItems(prev => [...prev, newMenuItem]);
  };

  const addManualOrder = (order: Omit<ManualOrder, 'id' | 'createdAt'>) => {
    const newOrder: ManualOrder = {
      ...order,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setManualOrders(prev => [...prev, newOrder]);

    order.items.forEach(orderItem => {
      const menuItem = menuItems.find(m => m.id === orderItem.menuItemId);
      if (menuItem) {
        menuItem.ingredients.forEach(ingredient => {
          const totalQuantityNeeded = ingredient.quantity * orderItem.quantity;
          reduceStock({
            productId: ingredient.productId,
            outletId: order.outletId,
            quantity: totalQuantityNeeded,
            reason: 'sold',
            notes: `Manual order: ${menuItem.name}`,
            reducedBy: order.createdBy,
          });
        });
      }
    });
  };

  const deleteManualOrder = (orderId: string) => {
    const orderToDelete = manualOrders.find(order => order.id === orderId);
    if (!orderToDelete) return;

    orderToDelete.items.forEach(orderItem => {
      const menuItem = menuItems.find(m => m.id === orderItem.menuItemId);
      if (menuItem) {
        menuItem.ingredients.forEach(ingredient => {
          const totalQuantityToRestore = ingredient.quantity * orderItem.quantity;
          
          addInventoryItem({
            productId: ingredient.productId,
            outletId: orderToDelete.outletId,
            quantity: totalQuantityToRestore,
            supplierId: products.find(p => p.id === ingredient.productId)?.defaultSupplierId || '1',
            source: 'other',
            notes: `Restored from deleted order: ${menuItem.name}`,
            addedBy: user?.id || 'system',
          });
        });
      }
    });

    setManualOrders(prev => prev.filter(order => order.id !== orderId));
  };

  const addOutletTransfer = (transfer: Omit<OutletTransfer, 'id' | 'createdAt'>) => {
    const newTransfer: OutletTransfer = {
      ...transfer,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setOutletTransfers(prev => [...prev, newTransfer]);

    reduceStock({
      productId: transfer.productId,
      outletId: transfer.fromOutletId,
      quantity: transfer.quantity,
      reason: 'other',
      notes: `Transfer to ${outlets.find(o => o.id === transfer.toOutletId)?.name}`,
      reducedBy: transfer.transferredBy,
    });

    addInventoryItem({
      productId: transfer.productId,
      outletId: transfer.toOutletId,
      quantity: transfer.quantity,
      supplierId: products.find(p => p.id === transfer.productId)?.defaultSupplierId || '1',
      source: 'transfer',
      purchasePrice: transfer.transferPrice,
      notes: `Transfer from ${outlets.find(o => o.id === transfer.fromOutletId)?.name}`,
      addedBy: transfer.transferredBy,
    });
  };

  const addHygieneLog = (log: Omit<HygieneLog, 'id' | 'createdAt'>) => {
    const newLog: HygieneLog = {
      ...log,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setHygieneLogs(prev => [...prev, newLog]);
  };

  const updateHygieneLogStatus = (logId: string, status: 'approved' | 'flagged', reviewedBy: string) => {
    setHygieneLogs(prev => prev.map(log => 
      log.id === logId 
        ? { ...log, status, reviewedBy, reviewedAt: new Date().toISOString() }
        : log
    ));
  };

  const addGoodsReceived = (goods: Omit<GoodsReceived, 'id' | 'createdAt'>) => {
    const newGoods: GoodsReceived = {
      ...goods,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setGoodsReceived(prev => [...prev, newGoods]);

    addInventoryItem({
      productId: goods.productId,
      outletId: goods.outletId,
      quantity: goods.quantity,
      supplierId: products.find(p => p.id === goods.productId)?.defaultSupplierId || '1',
      source: 'other',
      purchasePrice: goods.price,
      expiryDate: goods.expiryDate,
      addedBy: goods.receivedBy,
    });
  };

  const addMenuReceiving = (menuRec: Omit<MenuReceiving, 'id' | 'createdAt'>) => {
    const newMenuReceiving: MenuReceiving = {
      ...menuRec,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setMenuReceiving(prev => [...prev, newMenuReceiving]);

    addInventoryItem({
      productId: menuRec.productId,
      outletId: menuRec.outletId,
      quantity: menuRec.quantity,
      supplierId: products.find(p => p.id === menuRec.productId)?.defaultSupplierId || '1',
      source: 'other',
      purchasePrice: menuRec.pricePerUnit,
      notes: `Menu receiving: ${menuRec.dishName}`,
      addedBy: menuRec.receivedBy,
    });
  };

  const getInventoryByOutlet = (outletId: string): InventoryItem[] => {
    return inventory.filter(item => item.outletId === outletId);
  };

  const getDashboardMetrics = (outletId: string): DashboardMetrics => {
    const outletInventory = getInventoryByOutlet(outletId);
    const outletWastage = wastageEntries.filter(w => w.outletId === outletId);
    
    const totalItems = outletInventory.length;
    const lowStockItems = outletInventory.filter(item => item.quantity < 10).length;
    
    const today = new Date();
    const threeDaysFromNow = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);
    
    const nearExpiryItems = outletInventory.filter(item => {
      if (!item.expiryDate) return false;
      const expiryDate = new Date(item.expiryDate);
      return expiryDate <= threeDaysFromNow;
    }).length;

    const totalWastage = outletWastage.reduce((sum, w) => sum + w.quantity, 0);
    const currentStockValue = outletInventory.reduce((sum, item) => 
      sum + (item.quantity * (item.purchasePrice || 0)), 0
    );

    const itemsExpiringSoon = outletInventory.filter(item => {
      if (!item.expiryDate) return false;
      const expiryDate = new Date(item.expiryDate);
      const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
      return expiryDate <= tomorrow;
    }).length;

    return {
      totalItems,
      lowStockItems,
      nearExpiryItems,
      totalWastage,
      currentStockValue,
      itemsExpiringSoon,
    };
  };

  return (
    <AppContext.Provider value={{
      outlets: getFilteredOutlets(),
      products,
      inventory: getFilteredData(inventory),
      suppliers,
      purchaseOrders: getFilteredData(purchaseOrders),
      stockReductions: getFilteredData(stockReductions),
      wastageEntries: getFilteredData(wastageEntries),
      menuItems,
      manualOrders: getFilteredData(manualOrders),
      outletTransfers: getFilteredData(outletTransfers),
      hygieneLogs: getFilteredData(hygieneLogs),
      goodsReceived: getFilteredData(goodsReceived),
      menuReceiving: getFilteredData(menuReceiving),
      selectedOutlet,
      setSelectedOutlet,
      addOutlet,
      updateOutlet,
      deleteOutlet,
      addProduct,
      addInventoryItem,
      addSupplier,
      createPurchaseOrder,
      markPOAsReceived,
      reduceStock,
      addWastageEntry,
      addMenuItem,
      addManualOrder,
      deleteManualOrder,
      addOutletTransfer,
      addHygieneLog,
      updateHygieneLogStatus,
      addGoodsReceived,
      addMenuReceiving,
      getDashboardMetrics,
      getInventoryByOutlet,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}