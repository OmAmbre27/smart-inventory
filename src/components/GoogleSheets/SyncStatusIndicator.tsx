import React from 'react';
import { CheckCircle, AlertCircle, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { useGoogleSheets } from '../../contexts/GoogleSheetsContext';

interface SyncStatusIndicatorProps {
  sheetType?: string;
  showDetails?: boolean;
}

export function SyncStatusIndicator({ sheetType, showDetails = false }: SyncStatusIndicatorProps) {
  const { syncStatus, syncData } = useGoogleSheets();

  const handleSync = async () => {
    if (sheetType) {
      await syncData(sheetType);
    }
  };

  const getStatusIcon = () => {
    if (syncStatus.syncInProgress) {
      return <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />;
    }
    
    if (!syncStatus.isConnected) {
      return <WifiOff className="w-4 h-4 text-red-600" />;
    }
    
    if (syncStatus.error) {
      return <AlertCircle className="w-4 h-4 text-amber-600" />;
    }
    
    return <CheckCircle className="w-4 h-4 text-green-600" />;
  };

  const getStatusText = () => {
    if (syncStatus.syncInProgress) return 'Syncing...';
    if (!syncStatus.isConnected) return 'Disconnected';
    if (syncStatus.error) return 'Sync Error';
    return 'Synced';
  };

  const getStatusColor = () => {
    if (syncStatus.syncInProgress) return 'text-blue-600 bg-blue-50';
    if (!syncStatus.isConnected) return 'text-red-600 bg-red-50';
    if (syncStatus.error) return 'text-amber-600 bg-amber-50';
    return 'text-green-600 bg-green-50';
  };

  if (!showDetails) {
    return (
      <div className="flex items-center space-x-2">
        {getStatusIcon()}
        <span className="text-sm font-medium">{getStatusText()}</span>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
      {getStatusIcon()}
      <span>{getStatusText()}</span>
      {syncStatus.lastSync && (
        <span className="text-xs opacity-75">
          {new Date(syncStatus.lastSync).toLocaleTimeString()}
        </span>
      )}
      {sheetType && syncStatus.isConnected && !syncStatus.syncInProgress && (
        <button
          onClick={handleSync}
          className="ml-2 p-1 hover:bg-white hover:bg-opacity-50 rounded"
          title="Sync now"
        >
          <RefreshCw className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}