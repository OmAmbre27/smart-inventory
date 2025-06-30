import React from 'react';
import { AlertTriangle, MapPin, Phone } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function UserOutletAssignment() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-amber-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">No Outlet Access</h1>
        <p className="text-gray-600 mb-6">
          Your account ({user?.email}) is not currently assigned to any outlet. 
          Please contact your administrator to get access.
        </p>
        
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <h3 className="font-medium text-gray-900 mb-3">Contact Administrator</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center justify-center space-x-2">
              <Phone className="w-4 h-4" />
              <span>+1 234-567-8900</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <MapPin className="w-4 h-4" />
              <span>admin@smartkitchen.com</span>
            </div>
          </div>
        </div>
        
        <div className="text-xs text-gray-500">
          <p>User ID: {user?.id}</p>
          <p>Role: {user?.role}</p>
        </div>
        
        <button
          onClick={() => window.location.reload()}
          className="mt-6 w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-3 px-4 rounded-xl hover:from-orange-600 hover:to-red-700 transition-all"
        >
          Refresh Access
        </button>
      </div>
    </div>
  );
}