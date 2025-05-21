import { useState, useEffect } from 'react';
import { getPublicBuilds } from '../../services/vehicle/buildService';
import type { Build } from '../../services/vehicle/buildService';
import { PhotoIcon } from '@heroicons/react/24/solid';
import VehicleDetailsModal from '../../components/vehicle/VehicleDetailsModal';

const Builds = () => {
  const [builds, setBuilds] = useState<Build[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedBuild, setSelectedBuild] = useState<Build | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  useEffect(() => {
    const fetchBuilds = async () => {
      try {
        setIsLoading(true);
        const fetchedBuilds = await getPublicBuilds();
        setBuilds(fetchedBuilds);
        setError('');
      } catch (err) {
        console.error('Error fetching builds:', err);
        setError('Failed to load builds');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBuilds();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Featured Builds</h1>
        <p className="text-gray-600 mt-2">
          Discover amazing vehicle builds from our community
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {builds.map((build) => (
          <div
            key={build.id}
            className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer"
            onClick={() => {
              setSelectedBuild(build);
              setIsDetailsModalOpen(true);
            }}
          >
            <div className="relative h-64">
              {build.images && build.images[0] ? (
                <img
                  src={build.images[0].url}
                  alt={build.title}
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
              {build.images && build.images.length > 1 && (
                <div className="absolute bottom-2 right-2 px-2 py-1 bg-black bg-opacity-50 rounded text-white text-xs">
                  {build.images.length} photos
                </div>
              )}
            </div>

            <div className="p-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-1">
                {build.title}
              </h2>
              <div className="text-sm text-gray-600 mb-2">
                {build.carYear} {build.carMake} {build.carModel}
              </div>
              {build.description && (
                <p className="text-gray-700 text-sm mb-4 line-clamp-2">
                  {build.description}
                </p>
              )}
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  {build.user?.profile?.avatarUrl ? (
                    <img
                      src={build.user.profile.avatarUrl}
                      alt={build.user.username}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-xs text-gray-500">
                        {build.user?.username?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <span className="text-sm text-gray-600">
                    {build.user?.username || 'Anonymous'}
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(build.createdAt || '').toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedBuild && (
        <VehicleDetailsModal
          isOpen={isDetailsModalOpen}
          vehicle={{
            id: selectedBuild.id,
            title: selectedBuild.title,
            description: selectedBuild.description,
            year: selectedBuild.carYear.toString(),
            make: selectedBuild.carMake,
            model: selectedBuild.carModel,
            images: selectedBuild.images
          }}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedBuild(null);
          }}
          onEdit={() => {}}
          onDelete={() => {}}
          onUpdate={async () => {}}
          isAdmin={false}
          readOnly={true}
        />
      )}
    </div>
  );
};

export default Builds; 