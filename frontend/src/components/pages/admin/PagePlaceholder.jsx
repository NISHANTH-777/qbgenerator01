import React from 'react';
import image from '../../images/bitlogo.png';

const PagePlaceholder = () => {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center text-gray-500 space-y-4">
      <img src={image} alt="Logo" className="w-16 h-16 animate-pulse" />
      <p className="text-lg font-medium">Loading Question Details...</p>
    </div>
  );
};

export default PagePlaceholder;
