import React from 'react';

const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      <p className="text-gray-500 font-medium">Loading SwiftShip...</p>
    </div>
  </div>
);

export default LoadingSpinner;
