import React, { useState } from 'react';
import { Camera, CheckCircle, AlertTriangle, Clock, Upload, Plus } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { useGoogleSheets } from '../../contexts/GoogleSheetsContext';
import { SyncStatusIndicator } from '../GoogleSheets/SyncStatusIndicator';
import { MobileHygieneUpload } from './MobileHygieneUpload';

export function HygieneLogs() {
  const { hygieneLogs, addHygieneLog, updateHygieneLogStatus, selectedOutlet, outlets } = useApp();
  const { user, hasPermission } = useAuth();
  const { updateSheet } = useGoogleSheets();
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [showMobileUpload, setShowMobileUpload] = useState(false);
  const [formData, setFormData] = useState({
    comments: '',
    photoFile: null as File | null,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedOutlet || !user || !formData.photoFile) return;

    // In a real app, you would upload the photo to a cloud storage service
    const photoUrl = URL.createObjectURL(formData.photoFile);

    const hygieneData = {
      outletId: selectedOutlet,
      photoUrl,
      comments: formData.comments || undefined,
      status: 'pending' as const,
      uploadedBy: user.id,
    };

    addHygieneLog(hygieneData);

    // Update Google Sheets
    try {
      const outlet = outlets.find(o => o.id === selectedOutlet);
      
      const sheetData = {
        'Date': new Date().toISOString(),
        'Outlet': outlet?.name || '',
        'Comments': formData.comments || '',
        'Status': 'Pending Review',
        'Uploaded By': user.name,
        'Photo URL': photoUrl,
      };
      
      await updateSheet('hygieneLogs', [sheetData]);
    } catch (error) {
      console.error('Failed to update Google Sheets:', error);
    }

    setFormData({ comments: '', photoFile: null });
    setShowUploadForm(false);
    alert('✅ Hygiene log uploaded successfully!');
  };

  const handleStatusUpdate = async (logId: string, status: 'approved' | 'flagged') => {
    if (!user) return;
    
    updateHygieneLogStatus(logId, status, user.id);
    alert(`✅ Hygiene log ${status} successfully!`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Pending Review
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </span>
        );
      case 'flagged':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Flagged
          </span>
        );
      default:
        return null;
    }
  };

  const outletLogs = hygieneLogs.filter(log => 
    hasPermission('view_all_outlets') ? true : log.outletId === selectedOutlet
  );

  const canUpload = user?.role === 'storekeeper';
  const canReview = hasPermission('view_reports');

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Hygiene Logs</h2>
          <p className="text-gray-600 mt-1 text-sm lg:text-base">Daily hygiene and cleanliness documentation</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <SyncStatusIndicator sheetType="hygieneLogs" showDetails />
          {canUpload && (
            <>
              {/* Desktop Upload Button */}
              <button
                onClick={() => setShowUploadForm(true)}
                className="hidden lg:flex items-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-lg"
              >
                <Camera className="w-5 h-5" />
                <span>Upload Hygiene Photo</span>
              </button>
              
              {/* Mobile Upload Button */}
              <button
                onClick={() => setShowMobileUpload(true)}
                className="lg:hidden flex items-center justify-center bg-gradient-to-r from-green-500 to-green-600 text-white p-3 rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-lg min-w-[48px] min-h-[48px]"
              >
                <Plus className="w-6 h-6" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Upload Form Modal - Desktop */}
      {showUploadForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center space-x-3 mb-6">
              <Camera className="w-6 h-6 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Upload Hygiene Photo</h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Photo *</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Camera className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 mb-2">Upload hygiene/cleaning photo</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFormData(prev => ({ ...prev, photoFile: e.target.files?.[0] || null }))}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Comments</label>
                <textarea
                  value={formData.comments}
                  onChange={(e) => setFormData(prev => ({ ...prev, comments: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Add any comments about the hygiene check..."
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowUploadForm(false)}
                  className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all"
                >
                  Upload Photo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mobile Upload Modal */}
      {showMobileUpload && (
        <MobileHygieneUpload
          onClose={() => setShowMobileUpload(false)}
          onSuccess={() => {
            setShowMobileUpload(false);
            alert('✅ Hygiene log uploaded successfully!');
          }}
        />
      )}

      {/* Hygiene Logs Grid */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
        <div className="p-4 lg:p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Hygiene Logs ({outletLogs.length})
          </h3>
        </div>

        <div className="p-4 lg:p-6">
          {outletLogs.length === 0 ? (
            <div className="text-center py-12">
              <Camera className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hygiene logs found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {canUpload ? 'Upload your first hygiene photo to get started.' : 'Hygiene logs will appear here once uploaded.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              {outletLogs.map((log) => {
                const outlet = outlets.find(o => o.id === log.outletId);
                return (
                  <div key={log.id} className="border border-gray-200 rounded-xl overflow-hidden">
                    <div className="aspect-w-16 aspect-h-12">
                      <img
                        src={log.photoUrl}
                        alt="Hygiene check"
                        className="w-full h-48 object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900 truncate">
                          {outlet?.name}
                        </span>
                        {getStatusBadge(log.status)}
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">
                        {new Date(log.createdAt).toLocaleDateString()} at{' '}
                        {new Date(log.createdAt).toLocaleTimeString()}
                      </p>
                      
                      {log.comments && (
                        <p className="text-sm text-gray-700 mb-3 line-clamp-2">{log.comments}</p>
                      )}
                      
                      <p className="text-xs text-gray-500 mb-3">
                        Uploaded by: {user?.name}
                      </p>

                      {canReview && log.status === 'pending' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleStatusUpdate(log.id, 'approved')}
                            className="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-green-700 min-h-[44px] flex items-center justify-center"
                          >
                            ✅ Approve
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(log.id, 'flagged')}
                            className="flex-1 bg-red-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-red-700 min-h-[44px] flex items-center justify-center"
                          >
                            🚩 Flag
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Floating Action Button */}
      {canUpload && (
        <button
          onClick={() => setShowMobileUpload(true)}
          className="lg:hidden fixed bottom-24 right-4 bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-full shadow-lg hover:from-green-600 hover:to-green-700 transition-all z-20"
        >
          <Camera className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}