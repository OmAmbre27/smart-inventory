import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { Store, Plus, MapPin, Phone, Users } from 'lucide-react';

export function OutletSelection() {
  const { outlets, addOutlet, setSelectedOutlet } = useApp();
  const { hasPermission, user } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newOutlet, setNewOutlet] = useState({
    name: '',
    address: '',
    phone: '',
  });

  // Only Super Admin can add outlets
  const canAddOutlets = user?.role === 'super_admin';

  const handleAddOutlet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canAddOutlets) return;
    
    addOutlet({
      ...newOutlet,
      isActive: true,
    });
    setNewOutlet({ name: '', address: '', phone: '' });
    setShowAddForm(false);
  };

  const handleSelectOutlet = (outletId: string) => {
    setSelectedOutlet(outletId);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Select Outlet</h1>
            <p className="text-gray-600">Choose an outlet to manage its inventory</p>
          </div>
          
          {/* Only Super Admin can add outlets */}
          {canAddOutlets && (
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-3 rounded-xl hover:from-orange-600 hover:to-red-700 transition-all shadow-lg"
            >
              <Plus className="w-5 h-5" />
              <span>Add Outlet</span>
            </button>
          )}
        </div>

        {/* Role Restriction Notice */}
        {!canAddOutlets && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8">
            <div className="flex items-center space-x-2">
              <Store className="w-5 h-5 text-blue-600" />
              <div>
                <h4 className="font-medium text-blue-900">Outlet Selection</h4>
                <p className="text-sm text-blue-700 mt-1">
                  You can select from your assigned outlets. Only Super Admin can create new outlets.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Add Outlet Form - Only for Super Admin */}
        {showAddForm && canAddOutlets && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Outlet</h3>
            <form onSubmit={handleAddOutlet} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Outlet Name *</label>
                  <input
                    type="text"
                    value={newOutlet.name}
                    onChange={(e) => setNewOutlet(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Enter outlet name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    value={newOutlet.phone}
                    onChange={(e) => setNewOutlet(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Enter phone number"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
                <textarea
                  value={newOutlet.address}
                  onChange={(e) => setNewOutlet(prev => ({ ...prev, address: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Enter complete address"
                  required
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl hover:from-orange-600 hover:to-red-700 transition-all"
                >
                  Add Outlet
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {outlets.map((outlet) => (
            <div
              key={outlet.id}
              onClick={() => handleSelectOutlet(outlet.id)}
              className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-all duration-300 cursor-pointer group hover:border-orange-300"
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Store className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{outlet.name}</h3>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    outlet.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {outlet.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{outlet.address}</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span className="text-sm">{outlet.phone}</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100">
                <button className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-2 px-4 rounded-lg hover:from-orange-600 hover:to-red-700 transition-all font-medium">
                  Select Outlet
                </button>
              </div>
            </div>
          ))}
        </div>

        {outlets.length === 0 && (
          <div className="text-center py-12">
            <Store className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No outlets found</h3>
            <p className="text-gray-600 mb-6">
              {canAddOutlets 
                ? 'Get started by adding your first outlet location.'
                : 'No outlets have been assigned to you yet. Please contact your administrator.'
              }
            </p>
            {canAddOutlets && (
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-3 rounded-xl hover:from-orange-600 hover:to-red-700 transition-all"
              >
                Add First Outlet
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}