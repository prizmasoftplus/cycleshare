import React from 'react';
import { X, Clock, ArrowRight } from 'lucide-react';

interface DirectionsInfoProps {
  result: google.maps.DirectionsResult;
  onClear: () => void;
}

export const DirectionsInfo: React.FC<DirectionsInfoProps> = ({ result, onClear }) => {
  const leg = result.routes[0]?.legs[0];
  if (!leg) return null;

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] bg-white rounded-lg shadow-lg p-3">
      <div className="flex items-center space-x-4">
        <div>
          <p className="text-sm font-medium text-gray-900">
            <span className="font-bold">{leg.duration?.text}</span>
            <span className="text-gray-500"> ({leg.distance?.text})</span>
          </p>
          <p className="text-xs text-gray-600 flex items-center space-x-1">
            <span>{leg.start_address.split(',')[0]}</span>
            <ArrowRight className="w-3 h-3 text-gray-400" />
            <span>{leg.end_address.split(',')[0]}</span>
          </p>
        </div>
        <button
          onClick={onClear}
          className="p-2 text-gray-500 hover:bg-gray-100 rounded-md transition-colors"
          title="Clear directions"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}; 