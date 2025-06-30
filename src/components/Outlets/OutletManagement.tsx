import React, { useState } from 'react';
import { Store, Plus, Edit, Trash2, MapPin, Phone, User, ToggleLeft, ToggleRight } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { Outlet } from '../../types';

export function OutletManagement() {
  const { outlets, addOutlet, updateOutlet, deleteOutlet } = useApp();
  const { hasPermission, getUsersByRole, user } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingOutlet, setEditingOutlet] = useState<Outlet | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    managerId: '',
    isActive: true,
  });

  const managers = getUsersByRole('manager');

  // Only Super Admin can manage outlets
  const canManageOutlets = user?.role === 'super_admin';
  const canViewOutlets = hasPermission('view_all_outlets') || user?.role === 'super_admin';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canManageOutlets) return;
    
    if (editingOutlet) {
      updateOutlet(editingOutlet.id, formData);
      setEditingOutlet(null);
    } else {
      addOutlet(formData);
    }
    
    setFormData({
      name: '',
      address: '',
      phone: '',
      managerId: '',
      isActive: true,
    });
    setShowAddForm(false);
  };

  const handleEdit = (outlet: Outlet) => {
    if (!canManageOutlets) return;
    
    setEditingOutlet(outlet);
    setFormData({
      name: outlet.name,
      address: outlet.address,
      phone: outlet.phone,
      managerId: outlet.managerId || '',
      isActive: outlet.isActive,
    });
    setShowAddForm(true);
  };

  const handleToggleStatus = (outletId: string, currentStatus: boolean) => {
    if (!canManageOutlets) return;
    updateOutlet(outletId, { isActive: !currentStatus });
  };

  const getManagerName = (managerId?: string) => {
    if (!managerId) return 'Unassigned';
    const manager = managers.find(m => m.id === managerId);
    return manager ? manager.name : 'Unknown Manager';
  };

  // Show access denied for non-super admin users
  if (!canViewOutlets) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center">
        <Store className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
        <p className="text-gray-600">You don't have permission to view outlet management.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {canManageOutlets ? 'Outlet Management' : 'My Outlets'}
          </h2>
          <p className="text-gray-600 mt-1">
            {canManageOutlets 
              ? 'Manage restaurant outlets and kitchen locations' 
              : 'View your assigned outlet information'
            }
          </p>
        </div>
        
        {/* Only Super Admin can add outlets */}
        {canManageOutlets && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-3 rounded-xl hover:from-orange-600 hover:to-red-700 transition-all shadow-lg"
          >
            <Plus className="w-5 h-5" />
            <span>Add Outlet</span>
          </button>
        )}
      </div>

      {/* Role Restriction Notice for Non-Super Admin */}
      {!canManageOutlets && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center space-x-2">
            <Store className="w-5 h-5 text-blue-600" />
            <div>
              <h4 className="font-medium text-blue-900">Outlet Information</h4>
              <p className="text-sm text-blue-700 mt-1">
                You can view outlet information but cannot create, edit, or delete outlets. 
                Only Super Admin can manage outlets.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Outlets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {outlets.map((outlet) => (
          <div
            key={outlet.id}
            className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                  <Store className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{outlet.name}</h3>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    outlet.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {outlet.isActive ? 'Active' : 'Closed'}
                  </span>
                </div>
              </div>
              
              {/* Only Super Admin can toggle status */}
              {canManageOutlets && (
                <button
                  onClick={() => handleToggleStatus(outlet.id, outlet.isActive)}
                  className={`p-2 rounded-lg transition-colors ${
                    outlet.isActive 
                      ? 'text-green-600 hover:bg-green-50' 
                      : 'text-red-600 hover:bg-red-50'
                  }`}
                  title={outlet.isActive ? 'Close Outlet' : 'Open Outlet'}
                >
                  {outlet.isActive ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                </button>
              )}
            </div>
            
            <div className="space-y-3 mb-6">
              <div className="flex items-center space-x-3 text-gray-600">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">{outlet.address}</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-600">
                <Phone className="w-4 h-4" />
                <span className="text-sm">{outlet.phone}</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-600">
                <User className="w-4 h-4" />
                <span className="text-sm">{getManagerName(outlet.managerId)}</span>
              </div>
            </div>

            {/* Only Super Admin can edit/delete outlets */}
            {canManageOutlets && (
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(outlet)}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteOutlet(outlet.id)}
                  className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors text-sm"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {outlets.length === 0 && (
        <div className="text-center py-12">
          <Store className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No outlets found</h3>
          <p className="text-gray-600 mb-6">
            {canManageOutlets 
              ? 'Get started by adding your first outlet location.'
              : 'No outlets have been assigned to you yet.'
            }
          </p>
          {canManageOutlets && (
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-3 rounded-xl hover:from-orange-600 hover:to-red-700 transition-all"
            >
              Add First Outlet
            </button>
          )}
        </div>
      )}

      {/* Add/Edit Outlet Modal - Only for Super Admin */}
      {showAddForm && canManageOutlets && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              {editingOutlet ? 'Edit Outlet' : 'Add New Outlet'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Outlet Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Enter outlet name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Enter complete address"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Enter phone number"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Assigned Manager</label>
                <select
                  value={formData.managerId}
                  onChange={(e) => setFormData(prev => ({ ...prev, managerId: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">Select manager</option>
                  {managers.map(manager => (
                    <option key={manager.id} value={manager.id}>{manager.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                  Active Outlet
                </label>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingOutlet(null);
                    setFormData({
                      name: '',
                      address: '',
                      phone: '',
                      managerId: '',
                      isActive: true,
                    });
                  }}
                  className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl hover:from-orange-600 hover:to-red-700 transition-all"
                >
                  {editingOutlet ? 'Update Outlet' : 'Add Outlet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}