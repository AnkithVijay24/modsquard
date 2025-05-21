import { Fragment, useEffect, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { PlusIcon, PhotoIcon } from '@heroicons/react/24/solid';

// 1x1 transparent PNG
const EMPTY_PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

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

interface AddVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    description: string;
    year: string;
    make: string;
    model: string;
    images?: File[];
  }) => void;
  editVehicle: Vehicle | null;
}

const AddVehicleModal = ({ isOpen, onClose, onSubmit, editVehicle }: AddVehicleModalProps) => {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedMake, setSelectedMake] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Available options from CSV
  const [availableYears, setAvailableYears] = useState<string[]>([]);
  const [availableMakes, setAvailableMakes] = useState<string[]>([]);
  const [availableModels, setAvailableModels] = useState<string[]>([]);

  // Load years on initial mount
  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: currentYear - 1991 }, (_, i) => (1992 + i).toString());
    setAvailableYears(years.reverse());
  }, []);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setSelectedImages([]);
      setImagePreviews([]);
    }
    
    if (editVehicle) {
      setTitle(editVehicle.title);
      setDescription(editVehicle.description);
      setSelectedYear(editVehicle.year);
      setSelectedMake(editVehicle.make);
      setSelectedModel(editVehicle.model);
      
      // Load makes for the selected year
      if (editVehicle.year) {
        handleYearChange(editVehicle.year);
      }
    } else {
      setTitle('');
      setDescription('');
      setSelectedYear('');
      setSelectedMake('');
      setSelectedModel('');
    }
  }, [editVehicle, isOpen]);

  // Load models when make is selected in edit mode
  useEffect(() => {
    if (editVehicle?.make && selectedYear) {
      handleMakeChange(editVehicle.make);
    }
  }, [editVehicle?.make, selectedYear]);

  // Cleanup image preview URLs when component unmounts or images change
  useEffect(() => {
    return () => {
      imagePreviews.forEach(preview => {
        URL.revokeObjectURL(preview);
      });
    };
  }, [imagePreviews]);

  const handleYearChange = async (year: string) => {
    setSelectedYear(year);
    setSelectedMake('');
    setSelectedModel('');
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/cars/${year}/makes`);
      if (!response.ok) throw new Error('Failed to fetch makes');
      const makes = await response.json();
      setAvailableMakes(makes);
    } catch (err) {
      setError('Failed to load car makes');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMakeChange = async (make: string) => {
    setSelectedMake(make);
    setSelectedModel('');
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/cars/${selectedYear}/${make}/models`);
      if (!response.ok) throw new Error('Failed to fetch models');
      const models = await response.json();
      setAvailableModels(models);
      
      // If in edit mode and we have a model, set it after models are loaded
      if (editVehicle?.model && models.includes(editVehicle.model)) {
        setSelectedModel(editVehicle.model);
      }
    } catch (err) {
      setError('Failed to load car models');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Limit total number of images to 5
    const totalImages = selectedImages.length + files.length;
    if (totalImages > 5) {
      setError('Maximum 5 images allowed');
      return;
    }

    // Create preview URLs for new images
    const newPreviews = files.map(file => URL.createObjectURL(file));
    
    setSelectedImages(prev => [...prev, ...files]);
    setImagePreviews(prev => [...prev, ...newPreviews]);
    setError('');
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    URL.revokeObjectURL(imagePreviews[index]);
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddMoreImages = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = 'image/*';
    input.onchange = (e) => {
      const event = e as unknown as React.ChangeEvent<HTMLInputElement>;
      handleImageSelect(event);
    };
    input.click();
  };

  const getImageGridClass = (totalImages: number) => {
    switch (totalImages) {
      case 0:
        return 'grid-cols-1';
      case 1:
        return 'grid-cols-1';
      case 2:
        return 'grid-cols-2';
      case 3:
        return 'grid-cols-3';
      case 4:
        return 'grid-cols-2 grid-rows-2';
      default:
        return 'grid-cols-3 grid-rows-2';
    }
  };

  const handleNext = () => {
    if (!selectedYear || !selectedMake || !selectedModel) {
      setError('Please select year, make, and model');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Only process form submission in step 2
    if (step !== 2) {
      return;
    }

    if (!selectedYear || !selectedMake || !selectedModel) {
      setError('Please select year, make, and model');
      return;
    }

    try {
      await onSubmit({
        title: title || `${selectedYear} ${selectedMake} ${selectedModel}`,
        description: description || 'My vehicle build',
        year: selectedYear,
        make: selectedMake,
        model: selectedModel,
        images: selectedImages.length > 0 ? selectedImages : undefined
      });
      
      // Reset form
      setTitle('');
      setDescription('');
      setSelectedYear('');
      setSelectedMake('');
      setSelectedModel('');
      setSelectedImages([]);
      setImagePreviews([]);
      setStep(1);
    } catch (err) {
      console.error('Error submitting form:', err);
      setError('Failed to save vehicle');
    }
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900">
                      {editVehicle ? 'Edit Vehicle' : step === 1 ? 'Vehicle Details' : 'Add Photo'}
                    </Dialog.Title>

                    {error && (
                      <div className="rounded-md bg-red-50 p-4 mt-4">
                        <p className="text-sm text-red-700">{error}</p>
                      </div>
                    )}

                    {step === 1 ? (
                      <>
                        <div className="mt-6 space-y-6">
                          <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                              Title
                            </label>
                            <input
                              type="text"
                              name="title"
                              id="title"
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                              value={title}
                              onChange={(e) => setTitle(e.target.value)}
                              placeholder={selectedYear && selectedMake && selectedModel ? `${selectedYear} ${selectedMake} ${selectedModel}` : 'My Awesome Build'}
                            />
                          </div>

                          <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                              Description
                            </label>
                            <textarea
                              name="description"
                              id="description"
                              rows={3}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                              value={description}
                              onChange={(e) => setDescription(e.target.value)}
                              placeholder="Tell us about your build..."
                            />
                          </div>

                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <label htmlFor="year" className="block text-sm font-medium text-gray-700">
                                Year
                              </label>
                              <select
                                id="year"
                                value={selectedYear}
                                onChange={(e) => handleYearChange(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                required
                              >
                                <option value="">Select Year</option>
                                {availableYears.map((year) => (
                                  <option key={year} value={year}>
                                    {year}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label htmlFor="make" className="block text-sm font-medium text-gray-700">
                                Make
                              </label>
                              <select
                                id="make"
                                value={selectedMake}
                                onChange={(e) => handleMakeChange(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                disabled={!selectedYear || isLoading}
                                required
                              >
                                <option value="">Select Make</option>
                                {availableMakes.map((make) => (
                                  <option key={make} value={make}>
                                    {make}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label htmlFor="model" className="block text-sm font-medium text-gray-700">
                                Model
                              </label>
                              <select
                                id="model"
                                value={selectedModel}
                                onChange={(e) => setSelectedModel(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                disabled={!selectedMake || isLoading}
                                required
                              >
                                <option value="">Select Model</option>
                                {availableModels.map((model) => (
                                  <option key={model} value={model}>
                                    {model}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>

                        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                          <button
                            type="button"
                            onClick={handleNext}
                            disabled={isLoading}
                            className="inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                          >
                            Next
                          </button>
                          <button
                            type="button"
                            onClick={onClose}
                            className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </>
                    ) : (
                      <form id="vehicle-form" onSubmit={handleSubmit} className="mt-6">
                        <div className="space-y-4">
                          <div className="mt-6">
                            <div className={`grid ${getImageGridClass(imagePreviews.length)} gap-4 relative`}>
                              {imagePreviews.map((preview, index) => (
                                <div key={preview} className="relative aspect-w-16 aspect-h-9">
                                  <img
                                    src={preview}
                                    alt={`Vehicle preview ${index + 1}`}
                                    className="object-cover rounded-lg"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => removeImage(index)}
                                    className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white hover:bg-red-600"
                                  >
                                    <XMarkIcon className="h-4 w-4" />
                                  </button>
                                </div>
                              ))}
                              
                              {imagePreviews.length < 5 && (
                                <button
                                  type="button"
                                  onClick={handleAddMoreImages}
                                  className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-indigo-500 transition-colors"
                                >
                                  <PlusIcon className="h-8 w-8 text-gray-400" />
                                  <span className="ml-2 text-sm text-gray-500">Add Image</span>
                                </button>
                              )}
                            </div>

                            {error && (
                              <p className="text-sm text-red-600">{error}</p>
                            )}

                            <div className="text-sm text-gray-500">
                              {imagePreviews.length}/5 images uploaded
                            </div>
                          </div>
                        </div>

                        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                          <button
                            type="submit"
                            disabled={isLoading}
                            className="inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                          >
                            {editVehicle ? 'Save Changes' : 'Create Build'}
                          </button>
                          <button
                            type="button"
                            onClick={handleBack}
                            className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
                          >
                            Back
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default AddVehicleModal; 