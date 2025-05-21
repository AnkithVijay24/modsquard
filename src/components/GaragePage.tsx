import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import Garage from './Garage';

interface GaragePageProps {
  currentUser: {
    isAdmin: boolean;
  } | null;
}

const GaragePage = ({ currentUser }: GaragePageProps) => {
  if (!currentUser) {
    return null; // ProtectedRoute will handle the redirect
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <Garage currentUser={currentUser} />
        </div>
      </div>
    </div>
  );
};

export default GaragePage; 