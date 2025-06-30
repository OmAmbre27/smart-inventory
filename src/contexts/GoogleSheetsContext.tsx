import React, { createContext, useContext, useState, useEffect } from 'react';

export interface GoogleSheetsConfig {
  inventorySheetId: string;
  goodsReceivedSheetId: string;
  menuItemsSheetId: string;
  manualOrdersSheetId: string;
  hygieneLogsSheetId: string;
  outletTransfersSheetId: string;
  reportsSheetId: string;
}

export interface SyncStatus {
  isConnected: boolean;
  lastSync: string | null;
  syncInProgress: boolean;
  error: string | null;
}

interface GoogleSheetsContextType {
  config: GoogleSheetsConfig | null;
  syncStatus: SyncStatus;
  connectSheets: (config: GoogleSheetsConfig) => Promise<boolean>;
  syncData: (sheetType: string) => Promise<boolean>;
  syncAllSheets: () => Promise<boolean>;
  updateSheet: (sheetType: string, data: any[]) => Promise<boolean>;
  readSheet: (sheetType: string) => Promise<any[]>;
  setSyncStatus: (status: Partial<SyncStatus>) => void;
}

const GoogleSheetsContext = createContext<GoogleSheetsContextType | undefined>(undefined);

export function GoogleSheetsProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<GoogleSheetsConfig | null>(null);
  const [syncStatus, setSyncStatusState] = useState<SyncStatus>({
    isConnected: false,
    lastSync: null,
    syncInProgress: false,
    error: null,
  });

  useEffect(() => {
    const savedConfig = localStorage.getItem('googleSheetsConfig');
    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig);
        setConfig(parsedConfig);
        setSyncStatusState(prev => ({ ...prev, isConnected: true }));
      } catch (error) {
        console.error('Failed to load Google Sheets config:', error);
      }
    }
  }, []);

  const connectSheets = async (newConfig: GoogleSheetsConfig): Promise<boolean> => {
    try {
      setSyncStatusState(prev => ({ ...prev, syncInProgress: true, error: null }));
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setConfig(newConfig);
      localStorage.setItem('googleSheetsConfig', JSON.stringify(newConfig));
      
      setSyncStatusState({
        isConnected: true,
        lastSync: new Date().toISOString(),
        syncInProgress: false,
        error: null,
      });
      
      return true;
    } catch (error) {
      setSyncStatusState(prev => ({
        ...prev,
        syncInProgress: false,
        error: 'Failed to connect to Google Sheets',
      }));
      return false;
    }
  };

  const syncData = async (sheetType: string): Promise<boolean> => {
    if (!config) return false;
    
    try {
      setSyncStatusState(prev => ({ ...prev, syncInProgress: true, error: null }));
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSyncStatusState(prev => ({
        ...prev,
        lastSync: new Date().toISOString(),
        syncInProgress: false,
      }));
      
      return true;
    } catch (error) {
      setSyncStatusState(prev => ({
        ...prev,
        syncInProgress: false,
        error: `Failed to sync ${sheetType}`,
      }));
      return false;
    }
  };

  const syncAllSheets = async (): Promise<boolean> => {
    if (!config) return false;
    
    try {
      setSyncStatusState(prev => ({ ...prev, syncInProgress: true, error: null }));
      
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setSyncStatusState(prev => ({
        ...prev,
        lastSync: new Date().toISOString(),
        syncInProgress: false,
      }));
      
      return true;
    } catch (error) {
      setSyncStatusState(prev => ({
        ...prev,
        syncInProgress: false,
        error: 'Failed to sync all sheets',
      }));
      return false;
    }
  };

  const updateSheet = async (sheetType: string, data: any[]): Promise<boolean> => {
    if (!config) return false;
    
    try {
      console.log(`Updating ${sheetType} sheet with data:`, data);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSyncStatusState(prev => ({
        ...prev,
        lastSync: new Date().toISOString(),
      }));
      
      return true;
    } catch (error) {
      console.error(`Failed to update ${sheetType} sheet:`, error);
      return false;
    }
  };

  const readSheet = async (sheetType: string): Promise<any[]> => {
    if (!config) return [];
    
    try {
      console.log(`Reading ${sheetType} sheet`);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return [];
    } catch (error) {
      console.error(`Failed to read ${sheetType} sheet:`, error);
      return [];
    }
  };

  const setSyncStatus = (status: Partial<SyncStatus>) => {
    setSyncStatusState(prev => ({ ...prev, ...status }));
  };

  return (
    <GoogleSheetsContext.Provider value={{
      config,
      syncStatus,
      connectSheets,
      syncData,
      syncAllSheets,
      updateSheet,
      readSheet,
      setSyncStatus,
    }}>
      {children}
    </GoogleSheetsContext.Provider>
  );
}

export function useGoogleSheets() {
  const context = useContext(GoogleSheetsContext);
  if (context === undefined) {
    throw new Error('useGoogleSheets must be used within a GoogleSheetsProvider');
  }
  return context;
}