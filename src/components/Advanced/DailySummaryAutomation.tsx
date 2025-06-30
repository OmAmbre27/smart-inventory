import React, { useState, useEffect } from 'react';
import { Clock, Send, Settings, Bell, CheckCircle, AlertCircle } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { DailySummary } from '../../types';
import { AutomationService } from '../../utils/automation';
import { formatCurrency } from '../../utils/currency';

export function DailySummaryAutomation() {
  const { selectedOutlet, outlets, inventory, purchaseOrders, wastageEntries, hygieneLogs } = useApp();
  const { user } = useAuth();
  const [summaries, setSummaries] = useState<DailySummary[]>([]);
  const [automationSettings, setAutomationSettings] = useState({
    enabled: true,
    sendTime: '22:00',
    recipients: ['admin@smartkitchen.com', 'manager@smartkitchen.com'],
    includeWhatsApp: true,
    includeEmail: true,
  });
  const [lastSummaryTime, setLastSummaryTime] = useState<string | null>(null);

  useEffect(() => {
    // Load last summary time from localStorage
    const lastTime = localStorage.getItem('lastSummaryTime');
    if (lastTime) {
      setLastSummaryTime(lastTime);
    }
  }, []);

  const generateTodaysSummary = async () => {
    if (!selectedOutlet) return;

    const today = new Date().toISOString().split('T')[0];
    
    // Calculate today's metrics
    const todaysWastage = wastageEntries.filter(entry => 
      entry.outletId === selectedOutlet && 
      entry.createdAt.startsWith(today)
    );

    const pendingPOs = purchaseOrders.filter(po => 
      po.outletId === selectedOutlet && 
      po.status === 'sent'
    ).length;

    const totalWastageValue = todaysWastage.reduce((sum, entry) => {
      // Mock calculation - in real app, this would use actual product prices
      return sum + (entry.quantity * 50); // ₹50 average per unit
    }, 0);

    const totalWastageWeight = todaysWastage.reduce((sum, entry) => sum + entry.quantity, 0);

    const todaysHygiene = hygieneLogs.filter(log => 
      log.outletId === selectedOutlet && 
      log.createdAt.startsWith(today)
    );

    const hygieneStatus = todaysHygiene.length > 0 
      ? todaysHygiene[0].status 
      : 'pending';

    // Mock stock consumed calculation
    const stockConsumed = Math.floor(Math.random() * 100) + 50; // 50-150 units

    const summary = AutomationService.generateDailySummary(selectedOutlet, {
      stockConsumed,
      pendingPOs,
      wastageValue: totalWastageValue,
      wastageWeight: totalWastageWeight,
      hygieneStatus,
      recipients: automationSettings.recipients,
    });

    setSummaries(prev => [summary, ...prev]);

    // Send the summary
    const sent = await AutomationService.sendDailySummary(selectedOutlet, summary);
    
    if (sent) {
      const currentTime = new Date().toISOString();
      setLastSummaryTime(currentTime);
      localStorage.setItem('lastSummaryTime', currentTime);
      alert('✅ Daily summary sent successfully!');
    } else {
      alert('❌ Failed to send daily summary.');
    }
  };

  const scheduleAutomation = () => {
    AutomationService.scheduleAutomation('daily_summary', automationSettings.sendTime);
    alert(`✅ Daily summary scheduled for ${automationSettings.sendTime}`);
  };

  const getOutletName = (outletId: string) => {
    return outlets.find(o => o.id === outletId)?.name || 'Unknown Outlet';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'uploaded':
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'flagged':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Daily Summary Automation</h2>
          <p className="text-gray-600 mt-1">Automated daily reports via WhatsApp and Email</p>
        </div>
        
        <div className="flex items-center space-x-3">
          {lastSummaryTime && (
            <div className="bg-green-50 px-3 py-2 rounded-lg border border-green-200">
              <p className="text-sm text-green-800">
                Last sent: {new Date(lastSummaryTime).toLocaleString()}
              </p>
            </div>
          )}
          
          <button
            onClick={generateTodaysSummary}
            disabled={!selectedOutlet}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>Send Now</span>
          </button>
        </div>
      </div>

      {/* Automation Settings */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Settings className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Automation Settings</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="flex items-center space-x-2 mb-4">
              <input
                type="checkbox"
                checked={automationSettings.enabled}
                onChange={(e) => setAutomationSettings(prev => ({ ...prev, enabled: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Enable Daily Automation</span>
            </label>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Send Time</label>
              <input
                type="time"
                value={automationSettings.sendTime}
                onChange={(e) => setAutomationSettings(prev => ({ ...prev, sendTime: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={automationSettings.includeWhatsApp}
                  onChange={(e) => setAutomationSettings(prev => ({ ...prev, includeWhatsApp: e.target.checked }))}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span className="text-sm text-gray-700">Send via WhatsApp</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={automationSettings.includeEmail}
                  onChange={(e) => setAutomationSettings(prev => ({ ...prev, includeEmail: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Send via Email</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Recipients</label>
            <div className="space-y-2">
              {automationSettings.recipients.map((recipient, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="email"
                    value={recipient}
                    onChange={(e) => {
                      const newRecipients = [...automationSettings.recipients];
                      newRecipients[index] = e.target.value;
                      setAutomationSettings(prev => ({ ...prev, recipients: newRecipients }));
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter email address"
                  />
                  <button
                    onClick={() => {
                      const newRecipients = automationSettings.recipients.filter((_, i) => i !== index);
                      setAutomationSettings(prev => ({ ...prev, recipients: newRecipients }));
                    }}
                    className="text-red-600 hover:text-red-800"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                onClick={() => setAutomationSettings(prev => ({ 
                  ...prev, 
                  recipients: [...prev.recipients, ''] 
                }))}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                + Add Recipient
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={scheduleAutomation}
            disabled={!automationSettings.enabled}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            Save & Schedule
          </button>
        </div>
      </div>

      {/* Summary History */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Summary History ({summaries.length})</h3>
        </div>

        <div className="divide-y divide-gray-200">
          {summaries.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No summaries sent</h3>
              <p className="mt-1 text-sm text-gray-500">
                Daily summaries will appear here once sent.
              </p>
            </div>
          ) : (
            summaries.map((summary) => (
              <div key={summary.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">
                      Daily Summary - {getOutletName(summary.outletId)}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {new Date(summary.date).toLocaleDateString()} • Sent at {new Date(summary.sentAt).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(summary.hygienePhotoStatus)}
                    <span className="text-sm text-gray-600">
                      Sent to {summary.sentTo.length} recipient{summary.sentTo.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-blue-600 font-medium">Stock Consumed</p>
                    <p className="text-blue-900 font-bold">{summary.totalStockConsumed} units</p>
                  </div>
                  
                  <div className="bg-orange-50 p-3 rounded-lg">
                    <p className="text-orange-600 font-medium">Pending POs</p>
                    <p className="text-orange-900 font-bold">{summary.pendingPOs}</p>
                  </div>
                  
                  <div className="bg-red-50 p-3 rounded-lg">
                    <p className="text-red-600 font-medium">Wastage Value</p>
                    <p className="text-red-900 font-bold">{formatCurrency(summary.totalWastageValue)}</p>
                  </div>
                  
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-green-600 font-medium">Hygiene Status</p>
                    <p className="text-green-900 font-bold capitalize">{summary.hygienePhotoStatus}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}