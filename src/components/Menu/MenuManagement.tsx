import React, { useState } from 'react';
import { ChefHat, Plus, Upload, Download, Calculator, FileSpreadsheet } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useGoogleSheets } from '../../contexts/GoogleSheetsContext';
import { SyncStatusIndicator } from '../GoogleSheets/SyncStatusIndicator';
import { MenuItemForm } from './MenuItemForm';
import { MenuItemsTable } from './MenuItemsTable';

export function MenuManagement() {
  const { menuItems } = useApp();
  const { config, updateSheet } = useGoogleSheets();
  const [activeView, setActiveView] = useState<'list' | 'add' | 'upload'>('list');
  const [uploadData, setUploadData] = useState('');

  const handleUploadSheet = async () => {
    try {
      // Parse CSV data
      const lines = uploadData.trim().split('\n');
      const headers = lines[0].split(',');
      const data = lines.slice(1).map(line => {
        const values = line.split(',');
        return headers.reduce((obj, header, index) => {
          obj[header.trim()] = values[index]?.trim() || '';
          return obj;
        }, {} as any);
      });

      // Update Google Sheet
      if (config) {
        await updateSheet('menu', data);
        alert('✅ Menu data uploaded to Google Sheets successfully!');
        setUploadData('');
        setActiveView('list');
      }
    } catch (error) {
      alert('❌ Failed to upload menu data. Please check the format.');
    }
  };

  const downloadTemplate = () => {
    const template = `Dish Name,Ingredient,Quantity,Unit,Outlet,Cost Per Plate,Category
Chicken Curry,Chicken Breast,0.2,kg,Main Kitchen,8.50,Main Course
Chicken Curry,Tomatoes,0.1,kg,Main Kitchen,8.50,Main Course
Vegetable Rice,Rice,0.15,kg,Main Kitchen,4.25,Main Course
Vegetable Rice,Mixed Vegetables,0.1,kg,Main Kitchen,4.25,Main Course`;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'menu-template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const renderContent = () => {
    switch (activeView) {
      case 'add':
        return <MenuItemForm onBack={() => setActiveView('list')} />;
      case 'upload':
        return (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Upload className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Upload Menu from Google Sheets</h3>
            </div>

            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Upload Instructions</h4>
              <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1">
                <li>Download the template CSV file</li>
                <li>Fill in your menu items and recipes</li>
                <li>Copy and paste the CSV content below</li>
                <li>Click upload to sync with Google Sheets</li>
              </ol>
            </div>

            <div className="mb-4">
              <button
                onClick={downloadTemplate}
                className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                <Download className="w-4 h-4" />
                <span>Download Template</span>
              </button>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CSV Data (Dish Name, Ingredient, Quantity, Unit, Outlet, Cost Per Plate, Category)
              </label>
              <textarea
                value={uploadData}
                onChange={(e) => setUploadData(e.target.value)}
                rows={10}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Paste your CSV data here..."
              />
            </div>

            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setActiveView('list')}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUploadSheet}
                disabled={!uploadData.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Upload to Sheets
              </button>
            </div>
          </div>
        );
      default:
        return <MenuItemsTable />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Menu Management</h2>
          <p className="text-gray-600 mt-1">Manage menu items, recipes, and ingredient calculations</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <SyncStatusIndicator sheetType="menu" showDetails />
          
          {activeView === 'list' && (
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveView('upload')}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Upload Sheet</span>
              </button>
              <button
                onClick={() => setActiveView('add')}
                className="flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 py-2 rounded-lg hover:from-orange-600 hover:to-red-700"
              >
                <Plus className="w-4 h-4" />
                <span>Add Menu Item</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {renderContent()}
    </div>
  );
}