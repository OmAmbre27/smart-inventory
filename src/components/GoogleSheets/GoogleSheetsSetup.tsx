import React, { useState } from 'react';
import { FileSpreadsheet, Link, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { useGoogleSheets, GoogleSheetsConfig } from '../../contexts/GoogleSheetsContext';

export function GoogleSheetsSetup() {
  const { config, syncStatus, connectSheets, syncAllSheets } = useGoogleSheets();
  const [showSetup, setShowSetup] = useState(!config);
  const [formData, setFormData] = useState<GoogleSheetsConfig>({
    inventorySheetId: '',
    menuSheetId: '',
    purchaseOrdersSheetId: '',
    vendorsSheetId: '',
    goodsReceivedSheetId: '',
    wastageSheetId: '',
    reportsSheetId: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await connectSheets(formData);
    if (success) {
      setShowSetup(false);
    }
  };

  const handleSync = async () => {
    await syncAllSheets();
  };

  if (!showSetup && config) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <FileSpreadsheet className="w-6 h-6 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Google Sheets Integration</h3>
          </div>
          <div className="flex items-center space-x-2">
            {syncStatus.isConnected ? (
              <div className="flex items-center space-x-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm font-medium">Connected</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-red-600">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm font-medium">Disconnected</span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Last Sync</h4>
            <p className="text-sm text-gray-600">
              {syncStatus.lastSync 
                ? new Date(syncStatus.lastSync).toLocaleString()
                : 'Never'
              }
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Status</h4>
            <p className="text-sm text-gray-600">
              {syncStatus.syncInProgress ? 'Syncing...' : 'Ready'}
            </p>
          </div>
        </div>

        {syncStatus.error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{syncStatus.error}</p>
          </div>
        )}

        <div className="flex justify-between">
          <button
            onClick={() => setShowSetup(true)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Reconfigure
          </button>
          <button
            onClick={handleSync}
            disabled={syncStatus.syncInProgress}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${syncStatus.syncInProgress ? 'animate-spin' : ''}`} />
            <span>Sync All Sheets</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <FileSpreadsheet className="w-6 h-6 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Connect Google Sheets</h3>
      </div>

      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Setup Instructions</h4>
        <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1">
          <li>Create Google Sheets for each module (Inventory, Menu, etc.)</li>
          <li>Share each sheet with edit permissions</li>
          <li>Copy the Sheet ID from each URL</li>
          <li>Paste the IDs below to connect</li>
        </ol>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Inventory Sheet ID *
            </label>
            <input
              type="text"
              value={formData.inventorySheetId}
              onChange={(e) => setFormData(prev => ({ ...prev, inventorySheetId: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Menu & Recipes Sheet ID *
            </label>
            <input
              type="text"
              value={formData.menuSheetId}
              onChange={(e) => setFormData(prev => ({ ...prev, menuSheetId: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Purchase Orders Sheet ID
            </label>
            <input
              type="text"
              value={formData.purchaseOrdersSheetId}
              onChange={(e) => setFormData(prev => ({ ...prev, purchaseOrdersSheetId: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vendors Sheet ID
            </label>
            <input
              type="text"
              value={formData.vendorsSheetId}
              onChange={(e) => setFormData(prev => ({ ...prev, vendorsSheetId: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Goods Received Sheet ID
            </label>
            <input
              type="text"
              value={formData.goodsReceivedSheetId}
              onChange={(e) => setFormData(prev => ({ ...prev, goodsReceivedSheetId: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Wastage Log Sheet ID
            </label>
            <input
              type="text"
              value={formData.wastageSheetId}
              onChange={(e) => setFormData(prev => ({ ...prev, wastageSheetId: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => setShowSetup(false)}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={syncStatus.syncInProgress}
            className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Link className="w-4 h-4" />
            <span>Connect Sheets</span>
          </button>
        </div>
      </form>
    </div>
  );
}