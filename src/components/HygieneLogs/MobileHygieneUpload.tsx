import React, { useState, useRef } from 'react';
import { Camera, Upload, CheckCircle, X } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { useGoogleSheets } from '../../contexts/GoogleSheetsContext';

interface MobileHygieneUploadProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function MobileHygieneUpload({ onClose, onSuccess }: MobileHygieneUploadProps) {
  const { addHygieneLog, selectedOutlet, outlets } = useApp();
  const { user } = useAuth();
  const { updateSheet } = useGoogleSheets();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    comments: '',
    photoFile: null as File | null,
    photoPreview: null as string | null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Compress image for mobile
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Set max dimensions for mobile optimization
          const maxWidth = 800;
          const maxHeight = 600;
          let { width, height } = img;
          
          if (width > height) {
            if (width > maxWidth) {
              height = (height * maxWidth) / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = (width * maxHeight) / height;
              height = maxHeight;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          ctx?.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob((blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              
              setFormData(prev => ({
                ...prev,
                photoFile: compressedFile,
                photoPreview: canvas.toDataURL('image/jpeg', 0.8),
              }));
            }
          }, 'image/jpeg', 0.8);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedOutlet || !user || !formData.photoFile) return;

    setIsSubmitting(true);

    try {
      // In a real app, you would upload the photo to a cloud storage service
      const photoUrl = formData.photoPreview || URL.createObjectURL(formData.photoFile);

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

      onSuccess();
    } catch (error) {
      alert('❌ Failed to upload hygiene log. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const triggerCamera = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50 lg:items-center">
      <div className="bg-white rounded-t-3xl lg:rounded-2xl w-full max-w-md mx-4 lg:mx-0 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Upload Hygiene Photo</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Photo Capture Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Photo *</label>
            
            {formData.photoPreview ? (
              <div className="relative">
                <img
                  src={formData.photoPreview}
                  alt="Hygiene check preview"
                  className="w-full h-48 object-cover rounded-xl border border-gray-200"
                />
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, photoFile: null, photoPreview: null }))}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                <Camera className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-sm text-gray-600 mb-4">Take a photo of the hygiene check</p>
                
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={triggerCamera}
                    className="w-full bg-green-600 text-white py-3 px-4 rounded-xl hover:bg-green-700 transition-colors font-medium flex items-center justify-center space-x-2"
                  >
                    <Camera className="w-5 h-5" />
                    <span>Take Photo</span>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl hover:bg-blue-700 transition-colors font-medium flex items-center justify-center space-x-2"
                  >
                    <Upload className="w-5 h-5" />
                    <span>Choose from Gallery</span>
                  </button>
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoCapture}
              className="hidden"
            />
          </div>

          {/* Comments */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Comments</label>
            <textarea
              value={formData.comments}
              onChange={(e) => setFormData(prev => ({ ...prev, comments: e.target.value }))}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-base"
              placeholder="Add any comments about the hygiene check..."
            />
          </div>

          {/* Submit Button */}
          <div className="sticky bottom-0 bg-white pt-4 border-t border-gray-200 -mx-6 px-6 pb-6">
            <button
              type="submit"
              disabled={!formData.photoFile || isSubmitting}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 px-6 rounded-xl hover:from-green-600 hover:to-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium text-base flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>Upload Hygiene Photo</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}