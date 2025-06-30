import React, { useState } from 'react';
import { Building, Plus, Edit, Trash2, Eye, ToggleLeft, ToggleRight, MapPin, Phone } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { Outlet } from '../../types';

export function GlobalOutletManagement() {
  const { outlets, addOutlet, updateOutlet, deleteOutlet } = useApp();
  const { getAllUsers, getUsersByRole, impersonateOutlet } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingOutlet, setEditingOutlet] = useState<Outlet | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    type: 'cloud_kitchen' as const,
    adminId: '',
    isActive: true,
  });

  const admins = getUsersByRole('admin');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
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
      type: 'cloud_kitchen',
      adminId: '',
      isActive: true,
    });
    setShowAddForm(false);
  };

  const handleEdit = (outlet: Outlet) => {
    setEditingOutlet(outlet);
    setFormData({
      name: outlet.name,
      address: outlet.address,
      phone: outlet.phone,
      type: outlet.type,
      adminId: outlet.adminId || '',
      isActive: outlet.isActive,
    });
    setShowAddForm(true);
  };

  const handleToggleStatus = (outletId: string, currentStatus: boolean) => {
    updateOutlet(outletId, { isActive: !currentStatus });
  };

  const getAdminName = (adminId?: string) => {
    if (!adminId) return 'Unassigned';
    const admin = admins.find(a => a.id === adminId);
    return admin ? admin.name : 'Unknown Admin';
  };

  const getOutletTypeColor = (type: string) => {
    switch (type) {
      case 'cloud_kitchen':
        return 'bg-blue-100 text-blue-800';
      case 'qsr':
        return 'bg-green-100 text-green-800';
      case 'hotel':
        return 'bg-purple-100 text-purple-800';
      case 'restaurant':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Global Outlet Management</h2>
          <p className="text-gray-600 mt-1">Manage all outlets across the platform</p>
        </div>
        
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg"
        >
          <Plus className="w-5 h-5" />
          <span>Add Outlet</span>
        </button>
      </div>

      {/* Super Admin Notice */}
      <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
        <div className="flex items-center space-x-2">
          <Building className="w-5 h-5 text-purple-600" />
          <div>
            <h4 className="font-medium text-purple-900">Super Admin Outlet Management</h4>
            <p className="text-sm text-purple-700 mt-1">
              As Super Admin, you have full control over all outlets. You can create, edit, delete, and assign outlets to administrators.
            </p>
          </div>
        </div>
      </div>

      {/* Outlets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {outlets.map((outlet) => (
          <div
            key={outlet.id}
            className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Building className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{outlet.name}</h3>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getOutletTypeColor(outlet.type)}`}>
                    {outlet.type.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => impersonateOutlet(outlet.id)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="View as Admin"
                >
                  <Eye className="w-4 h-4" />
                </button>
                
                <button
                  onClick={() => handleToggleStatus(outlet.id, outlet.isActive)}
                  className={`p-2 rounded-lg transition-colors ${
                    outlet.isActive 
                      ? 'text-green-600 hover:bg-green-50' 
                      : 'text-red-600 hover:bg-red-50'
                  }`}
                  title={outlet.isActive ? 'Deactivate Outlet' : 'Activate Outlet'}
                >
                  {outlet.isActive ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                </button>
              </div>
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
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Admin:</span>
                <span className="text-sm font-medium text-gray-900">{getAdminName(outlet.adminId)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status:</span>
                <span className={`text-sm font-medium ${
                  outlet.isActive ? 'text-green-600' : 'text-red-600'
                }`}>
                  {outlet.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

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
          </div>
        ))}
      </div>

      {outlets.length === 0 && (
        <div className="text-center py-12">
          <Building className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No outlets found</h3>
          <p className="text-gray-600 mb-6">Get started by adding your first outlet.</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all"
          >
            Add First Outlet
          </button>
        </div>
      )}

      {/* Add/Edit Outlet Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              {editingOutlet ? 'Edit Outlet' : 'Add New Outlet'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Outlet Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter outlet name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Outlet Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="cloud_kitchen">Cloud Kitchen</option>
                    <option value="qsr">QSR</option>
                    <option value="hotel">Hotel</option>
                    <option value="restaurant">Restaurant</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter phone number"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Assigned Admin</label>
                  <select
                    value={formData.adminId}
                    onChange={(e) => setFormData(prev => ({ ...prev, adminId: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select admin</option>
                    {admins.map(admin => (
                      <option key={admin.id} value={admin.id}>{admin.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter complete address"
                  required
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
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
                      type: 'cloud_kitchen',
                      adminId: '',
                      isActive: true,
                    });
                  }}
                  className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all"
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