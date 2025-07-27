import React, { useEffect, useState, useRef } from 'react';
import { X, MapPin, Clock, Bike, ParkingCircle, AlertCircle, Star, Navigation, Image as ImageIcon } from 'lucide-react';
import { StationStats } from '../types/station';
import { priorityLevels, PriorityLevel } from '../hooks/usePriorities';
import { imageService, LocationImage } from '../services/imageService';

interface StationModalProps {
  station: StationStats | null;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onGetDirections: () => void;
  priority: PriorityLevel;
  onSetPriority: (level: PriorityLevel) => void;
  lastApiUpdate: Date | null;
}

export const StationModal: React.FC<StationModalProps> = ({ station, onClose, isFavorite, onToggleFavorite, onGetDirections, priority, onSetPriority, lastApiUpdate }) => {
  const [locationImage, setLocationImage] = useState<LocationImage | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showStreetView, setShowStreetView] = useState(false);
  const streetViewRef = useRef<HTMLDivElement | null>(null);
  const panoramaRef = useRef<google.maps.StreetViewPanorama | null>(null);

  // Extract coordinates from station ID
  const getStationCoordinates = (stationId: string): { lat: number; lng: number } | null => {
    const parts = stationId.split('_');
    if (parts.length < 3) return null;
    const lat = parseFloat(parts[parts.length - 2]);
    const lng = parseFloat(parts[parts.length - 1]);
    if (isNaN(lat) || isNaN(lng)) return null;
    return { lat, lng };
  };

  // Load location image when station changes
  useEffect(() => {
    if (!station) {
      setLocationImage(null);
      setImageLoading(false);
      setImageError(false);
      return;
    }

    const coords = getStationCoordinates(station.id);
    if (!coords) {
      setImageError(true);
      return;
    }

    setImageLoading(true);
    setImageError(false);
    setLocationImage(null);

    imageService.getLocationImage(coords.lat, coords.lng, station.name)
      .then((image) => {
        setLocationImage(image);
        setImageLoading(false);
        if (!image) {
          setImageError(true);
        }
      })
      .catch((error) => {
        console.error('Error loading location image:', error);
        setImageError(true);
        setImageLoading(false);
      });
  }, [station]);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    // Add event listener when modal is open
    if (station) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    // Cleanup event listener
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [station, onClose]);

  // Initialize Street View panorama
  useEffect(() => {
    if (showStreetView && streetViewRef.current && station && window.google) {
      const coords = getStationCoordinates(station.id);
      if (!coords) return;

      // Create Street View panorama
      panoramaRef.current = new google.maps.StreetViewPanorama(streetViewRef.current, {
        position: { lat: coords.lat, lng: coords.lng },
        pov: {
          heading: 34,
          pitch: 10,
        },
        zoom: 1,
        addressControl: false,
        fullscreenControl: false,
        motionTracking: false,
        motionTrackingControl: false,
        panControl: true,
        zoomControl: true,
      });
    }

    // Cleanup panorama when component unmounts or showStreetView changes
    return () => {
      if (panoramaRef.current) {
        // Clear the panorama by setting it to null
        panoramaRef.current = null;
      }
    };
  }, [showStreetView, station]);

  const handleRetryImage = () => {
    if (!station) return;
    
    const coords = getStationCoordinates(station.id);
    if (!coords) return;

    setImageLoading(true);
    setImageError(false);
    setLocationImage(null);

    imageService.getLocationImage(coords.lat, coords.lng, station.name)
      .then((image) => {
        setLocationImage(image);
        setImageLoading(false);
        if (!image) {
          setImageError(true);
        }
      })
      .catch((error) => {
        console.error('Error loading location image:', error);
        setImageError(true);
        setImageLoading(false);
      });
  };

  const handleToggleStreetView = () => {
    setShowStreetView(!showStreetView);
  };

  if (!station) return null;

  const getUsagePercentage = (available: number, total: number): number => {
    return total > 0 ? Math.round((available / total) * 100) : 0;
  };

  const getStatusColor = (stats: StationStats): string => {
    if (!stats.installed || stats.locked) return 'text-red-600';
    return 'text-green-600';
  };

  const getStatusText = (stats: StationStats): string => {
    if (!stats.installed) return 'Station not installed';
    if (stats.locked) return 'Station locked';
    if (stats.temporary) return 'Temporary station';
    return 'Station active';
  };

  const bikePercentage = getUsagePercentage(station.availableBikes, station.totalDocks);
  const dockPercentage = getUsagePercentage(station.availableDocks, station.totalDocks);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000] p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-start">
          <div className="flex items-start space-x-2">
            <MapPin className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900 leading-tight">
                {station.name}
              </h2>
              <p className="text-sm text-gray-600">Station ID: {station.id}</p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
             <button
              onClick={onToggleFavorite}
              className="text-gray-400 hover:text-amber-500 transition-colors p-1"
              title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Star className={`w-5 h-5 ${isFavorite ? 'text-amber-400 fill-current' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-4 max-h-[calc(90vh-140px)] overflow-y-auto">
          {/* Location Image */}
          <div className="bg-gray-50 rounded-lg overflow-hidden">
            {imageLoading && (
              <div className="h-48 flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-600">Loading location image...</p>
                </div>
              </div>
            )}
            
            {imageError && !imageLoading && (
              <div className="h-48 flex items-center justify-center">
                <div className="text-center">
                  <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-3">No image available</p>
                  <button
                    onClick={handleRetryImage}
                    className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              </div>
            )}
            
            {locationImage && !imageLoading && !showStreetView && (
              <div className="relative">
                <img
                  src={locationImage.url}
                  alt={`Location view of ${station.name}`}
                  className="w-full h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                  onError={() => setImageError(true)}
                  onClick={() => {
                    const coords = getStationCoordinates(station.id);
                    if (coords) {
                      const streetViewUrl = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${coords.lat},${coords.lng}`;
                      window.open(streetViewUrl, '_blank');
                    }
                  }}
                  title="Click to open Street View"
                />
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                  Location View
                </div>
                <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded opacity-90">
                  Click to open Street View
                </div>
                <button
                  onClick={handleToggleStreetView}
                  className="absolute top-2 right-2 bg-green-600 text-white text-xs px-2 py-1 rounded opacity-90 hover:bg-green-700 transition-colors"
                  title="Switch to interactive Street View"
                >
                  Interactive View
                </button>
              </div>
            )}

            {showStreetView && (
              <div className="relative">
                <div 
                  ref={streetViewRef} 
                  className="w-full h-48"
                  style={{ minHeight: '192px' }}
                />
                <button
                  onClick={handleToggleStreetView}
                  className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded opacity-90 hover:bg-blue-700 transition-colors"
                  title="Switch to static image"
                >
                  Static View
                </button>
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                  Interactive Street View
                </div>
              </div>
            )}
          </div>

          {/* Status */}
          <div className="flex items-center space-x-2">
            <AlertCircle className={`w-5 h-5 ${getStatusColor(station)}`} />
            <span className={`font-medium ${getStatusColor(station)}`}>
              {getStatusText(station)}
            </span>
          </div>
          
          {/* Priority */}
          <div className="flex items-center space-x-2">
             <label htmlFor="priority-select" className="text-sm font-medium text-gray-700">Priority:</label>
             <select
              id="priority-select"
              value={priority}
              onChange={(e) => onSetPriority(e.target.value as PriorityLevel)}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              {priorityLevels.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>

          {/* Availability Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <Bike className="w-6 h-6 text-blue-600" />
                <span className="text-2xl font-bold text-blue-600">
                  {station.availableBikes}
                </span>
              </div>
              <p className="text-sm text-blue-800 font-medium">Available Bikes</p>
              <div className="mt-2">
                <div className="bg-blue-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${bikePercentage}%` }}
                  />
                </div>
                <p className="text-xs text-blue-700 mt-1">{bikePercentage}% of capacity</p>
              </div>
              {station.availableEBikes > 0 && (
                <div className="mt-3 pt-3 border-t border-blue-200">
                   <p className="text-xs text-blue-800 font-medium">{station.availableEBikes} E-Bike(s)</p>
                </div>
              )}
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <ParkingCircle className="w-6 h-6 text-green-600" />
                <span className="text-2xl font-bold text-green-600">
                  {station.availableDocks}
                </span>
              </div>
              <p className="text-sm text-green-800 font-medium">Available Docks</p>
              <div className="mt-2">
                <div className="bg-green-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${dockPercentage}%` }}
                  />
                </div>
                <p className="text-xs text-green-700 mt-1">{dockPercentage}% available</p>
              </div>
            </div>
          </div>

          {/* Station Details */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <h3 className="font-medium text-gray-900">Station Details</h3>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Total Docks:</span>
                <span className="ml-2 font-medium">{station.totalDocks}</span>
              </div>
              
              <div>
                <span className="text-gray-600">Not in Use:</span>
                <span className="ml-2 font-medium">
                  {station.totalDocks - station.availableDocks - station.availableBikes}
                </span>
              </div>

              {station.temporary && (
                <div className="col-span-2">
                  <span className="text-amber-600 text-xs font-medium bg-amber-100 px-2 py-1 rounded">
                    Temporary Station
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Last Updated */}
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>
              Data updated: {(() => {
                try {
                  const date = lastApiUpdate || new Date(station.lastUpdated);
                  if (isNaN(date.getTime())) {
                    return 'Unknown';
                  }
                  return date.toLocaleString('en-GB', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  });
                } catch (error) {
                  return 'Unknown';
                }
              })()}
            </span>
          </div>
        </div>
        
        <div className="border-t border-gray-200 p-4 bg-gray-50">
           <button
            onClick={onGetDirections}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
          >
            <Navigation className="w-5 h-5" />
            <span>Get Directions From Here</span>
          </button>
        </div>
      </div>
    </div>
  );
};