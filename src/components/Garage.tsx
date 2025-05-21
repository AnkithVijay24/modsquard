import React from 'react';

interface GarageProps {
  currentUser: {
    isAdmin: boolean;
  };
}

const Garage: React.FC<GarageProps> = ({ currentUser }) => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">My Garage</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Placeholder for vehicle cards */}
        <div className="bg-gray-50 p-4 rounded-lg shadow">
          <p className="text-gray-500">No vehicles added yet</p>
        </div>
      </div>
    </div>
  );
};

export default Garage; 