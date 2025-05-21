import { useState } from 'react';
import { XMarkIcon, PencilIcon, TrashIcon, CheckIcon, PhotoIcon, ChevronLeftIcon, ChevronRightIcon, PlusIcon } from '@heroicons/react/24/solid';
import { deleteImage } from '../services/buildService';

interface Vehicle {
  id: string;
  title: string;
  description: string;
  year: string;
  make: string;
  model: string;
  images?: {
    id: string;
    url: string;
    buildId?: string;
    createdAt?: string;
  }[];
}

interface VehicleDetailsModalProps {
  isOpen: boolean;
  vehicle: Vehicle | null;
  onClose: () => void;
  onEdit: () => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, data: {
    title: string;
    description: string;
    year: string;
    make: string;
    model: string;
    images?: File[];
  }) => Promise<void>;
  isAdmin?: boolean;
  readOnly?: boolean;
}

const VehicleDetailsModal = ({ 
  isOpen, 
  vehicle, 
  onClose, 
  onEdit, 
  onDelete, 
  onUpdate, 
  isAdmin = false,
  readOnly = false 
}: VehicleDetailsModalProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedFields, setEditedFields] = useState<{
    title?: string;
    description?: string;
    year?: string;
    make?: string;
    model?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isDeletingImage, setIsDeletingImage] = useState(false);
  const [error, setError] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!isOpen || !vehicle) return null;

  const startEditing = () => {
    setEditedFields({});
    setError('');
    setIsEditing(true);
  };

  const handleFieldChange = (field: string, value: string) => {
    setEditedFields(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (Object.keys(editedFields).length === 0) {
      setIsEditing(false);
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      // Only send fields that have been changed
      await onUpdate(vehicle.id, {
        title: editedFields.title ?? vehicle.title,
        description: editedFields.description ?? vehicle.description,
        year: editedFields.year ?? vehicle.year,
        make: editedFields.make ?? vehicle.make,
        model: editedFields.model ?? vehicle.model
      });

      setIsEditing(false);
      setEditedFields({});
    } catch (err) {
      setError('Failed to update vehicle details');
      console.error('Error updating vehicle:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getValue = (field: keyof typeof editedFields) => {
    return editedFields[field] ?? vehicle[field];
  };

  const handleAddMoreImages = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || []);
      if (files.length === 0) return;

      const currentImageCount = vehicle.images?.length || 0;
      const totalImages = currentImageCount + files.length;
      
      if (totalImages > 5) {
        setError('Maximum 5 images allowed');
        return;
      }

      try {
        setIsLoading(true);
        // Send only the new images without modifying other fields
        await onUpdate(vehicle.id, {
          title: vehicle.title,
          description: vehicle.description,
          year: vehicle.year,
          make: vehicle.make,
          model: vehicle.model,
          images: files
        });
        setError('');
      } catch (err) {
        setError('Failed to add images');
        console.error('Error adding images:', err);
      } finally {
        setIsLoading(false);
      }
    };
    input.click();
  };

  const navigateImage = (direction: 'prev' | 'next') => {
    if (!vehicle.images || vehicle.images.length <= 1) return;
    
    if (direction === 'prev') {
      setCurrentImageIndex(prev => 
        prev === 0 ? vehicle.images!.length - 1 : prev - 1
      );
    } else {
      setCurrentImageIndex(prev => 
        prev === vehicle.images!.length - 1 ? 0 : prev + 1
      );
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!vehicle || !vehicle.images || vehicle.images.length <= 1) {
      setError('Cannot delete the last image');
      return;
    }

    try {
      setIsDeletingImage(true);
      setError('');
      const updatedBuild = await deleteImage(vehicle.id, imageId);
      
      // If we're deleting the current image, adjust the index
      const newImageCount = updatedBuild.images?.length || 0;
      if (currentImageIndex >= newImageCount) {
        setCurrentImageIndex(Math.max(0, newImageCount - 1));
      }

      // Update the vehicle state with the new data
      await onUpdate(vehicle.id, {
        title: vehicle.title,
        description: vehicle.description,
        year: vehicle.year,
        make: vehicle.make,
        model: vehicle.model
      });
    } catch (err) {
      console.error('Error deleting image:', err);
      setError('Failed to delete image');
    } finally {
      setIsDeletingImage(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />

        <div className="inline-block w-full max-w-4xl overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle">
          {/* Main Image Section */}
          <div className="relative">
            <div className="aspect-w-16 aspect-h-9 max-h-[70vh]">
              {vehicle.images && vehicle.images.length > 0 ? (
                <>
                  <div className="relative h-full">
                    <img
                      src={vehicle.images[currentImageIndex].url}
                      alt={vehicle.title}
                      className="w-full h-full object-contain bg-gray-100"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = 'https://placehold.co/600x400?text=Error+Loading+Image';
                      }}
                    />
                    {isDeletingImage && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex flex-col items-center space-y-2">
                          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                          <p className="text-white text-shadow">Deleting image...</p>
                        </div>
                      </div>
                    )}
                  </div>
                  {vehicle.images.length > 1 && (
                    <>
                      <button
                        onClick={() => navigateImage('prev')}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-75 transition-all"
                        disabled={isDeletingImage}
                      >
                        <ChevronLeftIcon className="h-6 w-6" />
                      </button>
                      <button
                        onClick={() => navigateImage('next')}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-75 transition-all"
                        disabled={isDeletingImage}
                      >
                        <ChevronRightIcon className="h-6 w-6" />
                      </button>
                    </>
                  )}
                  {!readOnly && (
                    <>
                      <button
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this image? This action cannot be undone.') && vehicle.images) {
                            handleDeleteImage(vehicle.images[currentImageIndex].id);
                          }
                        }}
                        className={`absolute top-4 right-16 p-2 rounded-full text-white transition-all ${
                          isDeletingImage ? 'bg-gray-500 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600'
                        }`}
                        disabled={isDeletingImage || !vehicle.images || vehicle.images.length <= 1}
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                      {(!vehicle.images || vehicle.images.length < 5) && (
                        <button
                          onClick={handleAddMoreImages}
                          className="absolute bottom-4 right-4 p-2 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-75 transition-all flex items-center"
                          disabled={isDeletingImage || isLoading}
                        >
                          <PlusIcon className="h-5 w-5" />
                          <span className="ml-2">Add Images</span>
                        </button>
                      )}
                    </>
                  )}
                  <div className="absolute bottom-4 left-4 px-2 py-1 bg-black bg-opacity-50 rounded text-white text-sm">
                    {currentImageIndex + 1} / {vehicle.images.length}
                  </div>
                </>
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <PhotoIcon className="h-24 w-24 text-gray-400" />
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
            {/* Error message display */}
            {error && (
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-red-500 text-white rounded-md shadow-lg">
                {error}
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="px-6 py-6">
            {error && (
              <div className="mb-4 p-4 bg-red-50 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="space-y-6">
              {/* Title Section */}
              <div className="flex items-center justify-between">
                {isEditing && !readOnly ? (
                  <input
                    type="text"
                    value={getValue('title')}
                    onChange={(e) => handleFieldChange('title', e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-lg"
                    disabled={isLoading}
                  />
                ) : (
                  <h3 className="text-2xl font-bold text-gray-900 group-hover:text-gray-600">
                    {vehicle.title}
                    {!readOnly && (
                      <button
                        onClick={startEditing}
                        className="ml-2 text-gray-400 hover:text-gray-500"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                    )}
                  </h3>
                )}
              </div>

              {/* Vehicle Details Grid */}
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Year</label>
                  {isEditing && !readOnly ? (
                    <input
                      type="text"
                      value={getValue('year')}
                      onChange={(e) => handleFieldChange('year', e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      disabled={isLoading}
                    />
                  ) : (
                    <p className="mt-1 text-sm text-gray-900">{vehicle.year}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Make</label>
                  {isEditing && !readOnly ? (
                    <input
                      type="text"
                      value={getValue('make')}
                      onChange={(e) => handleFieldChange('make', e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      disabled={isLoading}
                    />
                  ) : (
                    <p className="mt-1 text-sm text-gray-900">{vehicle.make}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Model</label>
                  {isEditing && !readOnly ? (
                    <input
                      type="text"
                      value={getValue('model')}
                      onChange={(e) => handleFieldChange('model', e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      disabled={isLoading}
                    />
                  ) : (
                    <p className="mt-1 text-sm text-gray-900">{vehicle.model}</p>
                  )}
                </div>
              </div>

              {/* Description Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                {isEditing && !readOnly ? (
                  <textarea
                    value={getValue('description')}
                    onChange={(e) => handleFieldChange('description', e.target.value)}
                    rows={4}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    disabled={isLoading}
                  />
                ) : (
                  <p className="mt-1 text-sm text-gray-600">{vehicle.description}</p>
                )}
              </div>

              {/* Action Buttons */}
              {!readOnly && (
                <div className="flex justify-end space-x-4 pt-4 border-t">
                  {isEditing ? (
                    <>
                      <button
                        onClick={handleSave}
                        disabled={isLoading || Object.keys(editedFields).length === 0}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                      >
                        {isLoading ? (
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        ) : (
                          <CheckIcon className="h-4 w-4 mr-2" />
                        )}
                        Save Changes
                      </button>
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setEditedFields({});
                          setError('');
                        }}
                        disabled={isLoading}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetailsModal; 