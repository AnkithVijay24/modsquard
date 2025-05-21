import { useState, useEffect } from 'react';
import { PlusIcon, ChevronRightIcon, PhotoIcon, TrashIcon } from '@heroicons/react/24/solid';
import AddVehicleModal from './AddVehicleModal';
import VehicleDetailsModal from './VehicleDetailsModal';
import type { Build } from '../../services/vehicle/buildService';
import { getBuilds, createBuild, deleteBuild } from '../../services/vehicle/buildService';
import { updateVehicleDetails } from '../../services/vehicle/vehicleUpdateService';

interface GarageProps {
  currentUser: {
    isAdmin: boolean;
  };
}

const Garage = ({ currentUser }: GarageProps) => {
  const [vehicles, setVehicles] = useState<Build[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Build | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const fetchVehicles = async () => {
    try {
      setIsLoading(true);
      const builds = await getBuilds();
      setVehicles(builds);
      setError('');
    } catch (err) {
      console.error('Error fetching vehicles:', err);
      setError('Failed to load vehicles');
      setVehicles([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleDeleteVehicle = async (vehicleId: string) => {
    try {
      await deleteBuild(vehicleId);
      setVehicles(vehicles.filter(v => v.id !== vehicleId));
      setIsDetailsModalOpen(false);
      setSelectedVehicle(null);
    } catch (err) {
      console.error('Error deleting vehicle:', err);
      setError('Failed to delete vehicle');
    }
  };

  const handleUpdateVehicle = async (id: string, data: {
    title: string;
    description: string;
    year: string;
    make: string;
    model: string;
    images?: File[];
  }) => {
    try {
      if (!selectedVehicle) return;

      const updatedBuild = await updateVehicleDetails(id, data, selectedVehicle);
      
      setVehicles(prevVehicles => 
        prevVehicles.map(v => 
          v.id === updatedBuild.id ? updatedBuild : v
        )
      );
      setSelectedVehicle(updatedBuild);
    } catch (err) {
      console.error('Error updating vehicle:', err);
      throw err;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Garage</h1>
          <p className="text-sm text-gray-600 mt-1">
            {vehicles.length === 0 ? 'Start building your collection' : `${vehicles.length} vehicle${vehicles.length !== 1 ? 's' : ''} in your garage`}
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Vehicle
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {vehicles.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="space-y-3">
            <div className="flex justify-center">
              <PlusIcon className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No vehicles yet</h3>
            <p className="text-gray-500">Get started by adding your first vehicle to your garage.</p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Your First Vehicle
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map(vehicle => (
            <div 
              key={vehicle.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col group"
              onClick={() => {
                setSelectedVehicle(vehicle);
                setIsDetailsModalOpen(true);
              }}
            >
              <div className="relative h-64">
                {vehicle.images && vehicle.images[0] ? (
                  <img
                    src={vehicle.images[0].url}
                    alt={vehicle.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = 'https://placehold.co/600x400?text=No+Image';
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <PhotoIcon className="h-12 w-12 text-gray-400" />
                  </div>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm('Are you sure you want to delete this build? This action cannot be undone.')) {
                      handleDeleteVehicle(vehicle.id);
                    }
                  }}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
              <div className="p-4 flex flex-col flex-grow">
                <h2 className="text-xl font-semibold text-gray-900">{vehicle.title}</h2>
                <div className="text-sm text-gray-600 mt-1">
                  {vehicle.carYear} {vehicle.carMake} {vehicle.carModel}
                </div>
                {vehicle.description && (
                  <p className="text-gray-700 text-sm mt-2 line-clamp-2">{vehicle.description}</p>
                )}
                <div className="mt-4 flex justify-end mt-auto">
                  <button 
                    className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    View Details
                    <ChevronRightIcon className="ml-1 h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AddVehicleModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setSelectedVehicle(null);
        }}
        editVehicle={selectedVehicle ? {
          id: selectedVehicle.id,
          title: selectedVehicle.title,
          description: selectedVehicle.description,
          year: selectedVehicle.carYear.toString(),
          make: selectedVehicle.carMake,
          model: selectedVehicle.carModel,
          images: selectedVehicle.images
        } : null}
        onSubmit={async (data) => {
          if (selectedVehicle) {
            await handleUpdateVehicle(selectedVehicle.id, data);
          } else {
            try {
              setIsLoading(true);
              const newBuild = await createBuild({
                title: data.title,
                description: data.description,
                carYear: parseInt(data.year),
                carMake: data.make,
                carModel: data.model,
                images: data.images
              });
              
              setVehicles(prev => [newBuild, ...prev]);
              setIsAddModalOpen(false);
            } catch (err) {
              console.error('Error creating build:', err);
              setError('Failed to create vehicle');
            } finally {
              setIsLoading(false);
            }
          }
        }}
      />

      <VehicleDetailsModal
        isOpen={isDetailsModalOpen}
        vehicle={selectedVehicle ? {
          id: selectedVehicle.id,
          title: selectedVehicle.title,
          description: selectedVehicle.description,
          year: selectedVehicle.carYear.toString(),
          make: selectedVehicle.carMake,
          model: selectedVehicle.carModel,
          images: selectedVehicle.images
        } : null}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedVehicle(null);
        }}
        onEdit={() => {
          setIsDetailsModalOpen(false);
          setIsAddModalOpen(true);
        }}
        onDelete={handleDeleteVehicle}
        onUpdate={handleUpdateVehicle}
        isAdmin={true}
        readOnly={false}
      />
    </div>
  );
};

export default Garage; 