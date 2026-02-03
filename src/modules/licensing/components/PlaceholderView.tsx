import React from 'react';

interface PlaceholderViewProps {
  viewName: string;
}

const PlaceholderView: React.FC<PlaceholderViewProps> = ({ viewName }) => {
  return (
    <div className="w-full max-w-5xl p-6 md:p-8 rounded-lg shadow-xl bg-white">
      <h2 className="text-2xl font-semibold text-gray-800 text-center">{viewName}</h2>
      <p className="text-gray-600 text-center mt-4">{viewName} content will go here.</p>
    </div>
  );
};

export default PlaceholderView; 