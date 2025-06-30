import React, { useState } from 'react';
import { Settings, Users, Shield, FileSpreadsheet } from 'lucide-react';
import { GoogleSheetsSetup } from '../GoogleSheets/GoogleSheetsSetup';

export function SettingsManagement() {
  const [activeTab, setActiveTab] = useState('sheets');

  const tabs = [
    { id: 'sheets', label: 'Google Sheets', icon: FileSpreadsheet },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'general', label: 'General', icon: Settings },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'sheets':
        return <GoogleSheetsSetup />;
      case 'users':
        return (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center">
            <Users className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">User Management</h3>
            <p className="text-gray-600">Manage user roles, permissions, and outlet assignments.</p>
          </div>
        );
      case 'security':
        return (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center">
            <Shield className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Security Settings</h3>
            <p className="text-gray-600">Configure 2FA, session timeouts, and audit logs.</p>
          </div>
        );
      case 'general':
        return (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center">
            <Settings className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">General Settings</h3>
            <p className="text-gray-600">System preferences and configuration options.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
          <p className="text-gray-600 mt-1">System configuration and integrations</p>
        </div>
      </div>

      <div className="flex space-x-6">
        <div className="w-64 bg-white rounded-2xl shadow-lg border border-gray-200 p-4">
          <nav className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="flex-1">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}