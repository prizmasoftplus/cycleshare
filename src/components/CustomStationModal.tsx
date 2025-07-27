import React, { useState, useEffect } from 'react';
import { X, MapPin, Palette, Tag, Edit3, Plus, Search as SearchIcon, Trash2, MapPinIcon } from 'lucide-react';
import { CustomStation, customStationsService } from '../services/customStationsService';
import { geocodingService } from '../services/geocodingService';

interface PredefinedStation {
  name: string;
  lat: number;
  lng: number;
  area: string;
}

const PREDEFINED_STATIONS: PredefinedStation[] = [
  // User's Specific Stations
  { name: "River Street, Clerkenwell", lat: 51.5267, lng: -0.1067, area: "Clerkenwell" },
  { name: "Phillimore Gardens, Kensington", lat: 51.5025, lng: -0.2017, area: "Kensington" },
  { name: "Christopher Street, Liverpool Street", lat: 51.5185, lng: -0.0816, area: "Liverpool Street" },
  { name: "St. Chad's Street, King's Cross", lat: 51.5320, lng: -0.1233, area: "King's Cross" },
  { name: "Sedding Street, Sloane Square", lat: 51.4925, lng: -0.1567, area: "Sloane Square" },
  { name: "Broadcasting House, Marylebone", lat: 51.5186, lng: -0.1437, area: "Marylebone" },
  { name: "Charlbert Street, St. John's Wood", lat: 51.5325, lng: -0.1687, area: "St. John's Wood" },
  { name: "Maida Vale, Maida Vale", lat: 51.5267, lng: -0.1857, area: "Maida Vale" },
  { name: "New Globe Walk, Bankside", lat: 51.5085, lng: -0.0972, area: "Bankside" },
  { name: "Park Street, Bankside", lat: 51.5075, lng: -0.0952, area: "Bankside" },
  { name: "Brunswick Square, Bloomsbury", lat: 51.5235, lng: -0.1244, area: "Bloomsbury" },

  // Central London
  { name: "Oxford Circus", lat: 51.5154, lng: -0.1415, area: "Central" },
  { name: "Piccadilly Circus", lat: 51.5101, lng: -0.1342, area: "Central" },
  { name: "Leicester Square", lat: 51.5113, lng: -0.1281, area: "Central" },
  { name: "Covent Garden", lat: 51.5124, lng: -0.1223, area: "Central" },
  { name: "Trafalgar Square", lat: 51.5080, lng: -0.1281, area: "Central" },
  { name: "Charing Cross", lat: 51.5074, lng: -0.1278, area: "Central" },
  { name: "Embankment", lat: 51.5074, lng: -0.1223, area: "Central" },
  { name: "Westminster", lat: 51.4995, lng: -0.1245, area: "Central" },
  
  // East London
  { name: "Liverpool Street", lat: 51.5185, lng: -0.0816, area: "East" },
  { name: "Aldgate", lat: 51.5142, lng: -0.0755, area: "East" },
  { name: "Tower Hill", lat: 51.5098, lng: -0.0766, area: "East" },
  { name: "Monument", lat: 51.5108, lng: -0.0862, area: "East" },
  { name: "Cannon Street", lat: 51.5115, lng: -0.0904, area: "East" },
  { name: "Mansion House", lat: 51.5125, lng: -0.0941, area: "East" },
  { name: "Blackfriars", lat: 51.5120, lng: -0.1033, area: "East" },
  { name: "Temple", lat: 51.5111, lng: -0.1141, area: "East" },
  
  // West London
  { name: "Paddington", lat: 51.5154, lng: -0.1755, area: "West" },
  { name: "Edgware Road", lat: 51.5203, lng: -0.1679, area: "West" },
  { name: "Bayswater", lat: 51.5126, lng: -0.1879, area: "West" },
  { name: "Notting Hill Gate", lat: 51.5087, lng: -0.1967, area: "West" },
  { name: "Holland Park", lat: 51.5072, lng: -0.2063, area: "West" },
  { name: "Shepherd's Bush", lat: 51.5058, lng: -0.2265, area: "West" },
  { name: "White City", lat: 51.5120, lng: -0.2239, area: "West" },
  { name: "Ealing Broadway", lat: 51.5150, lng: -0.3019, area: "West" },
  
  // North London
  { name: "Kings Cross", lat: 51.5320, lng: -0.1233, area: "North" },
  { name: "Euston", lat: 51.5282, lng: -0.1337, area: "North" },
  { name: "Camden Town", lat: 51.5390, lng: -0.1426, area: "North" },
  { name: "Kentish Town", lat: 51.5504, lng: -0.1408, area: "North" },
  { name: "Tufnell Park", lat: 51.5567, lng: -0.1384, area: "North" },
  { name: "Archway", lat: 51.5653, lng: -0.1353, area: "North" },
  { name: "Highgate", lat: 51.5777, lng: -0.1458, area: "North" },
  { name: "East Finchley", lat: 51.5874, lng: -0.1650, area: "North" },
  
  // South London
  { name: "Waterloo", lat: 51.5033, lng: -0.1145, area: "South" },
  { name: "London Bridge", lat: 51.5050, lng: -0.0864, area: "South" },
  { name: "Borough", lat: 51.5011, lng: -0.0943, area: "South" },
  { name: "Elephant & Castle", lat: 51.4958, lng: -0.1000, area: "South" },
  { name: "Kennington", lat: 51.4884, lng: -0.1053, area: "South" },
  { name: "Oval", lat: 51.4819, lng: -0.1136, area: "South" },
  { name: "Stockwell", lat: 51.4723, lng: -0.1229, area: "South" },
  { name: "Brixton", lat: 51.4622, lng: -0.1145, area: "South" },
  
  // Major Stations
  { name: "Victoria", lat: 51.4965, lng: -0.1447, area: "Major" },
  { name: "St Pancras", lat: 51.5320, lng: -0.1253, area: "Major" },
  { name: "Marylebone", lat: 51.5225, lng: -0.1631, area: "Major" },
  { name: "Fenchurch Street", lat: 51.5116, lng: -0.0789, area: "Major" },
  { name: "Moorgate", lat: 51.5186, lng: -0.0886, area: "Major" },
  { name: "Bank", lat: 51.5134, lng: -0.0886, area: "Major" },
  { name: "Holborn", lat: 51.5174, lng: -0.1200, area: "Major" },
  { name: "Russell Square", lat: 51.5235, lng: -0.1244, area: "Major" }
];

interface CustomStationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (station: CustomStation) => void;
  onSaveMultiple?: (stations: CustomStation[]) => void;
  onClearAll?: () => void;
  editStation?: CustomStation | null;
  defaultLat?: number;
  defaultLng?: number;
  customStationsCount?: number;
}

export const CustomStationModal: React.FC<CustomStationModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onSaveMultiple,
  onClearAll,
  editStation,
  defaultLat,
  defaultLng,
  customStationsCount = 0
}) => {
  const [name, setName] = useState('');
  const [multipleNames, setMultipleNames] = useState('');
  const [lat, setLat] = useState(defaultLat || 51.5074);
  const [lng, setLng] = useState(defaultLng || -0.1278);
  const [color, setColor] = useState('#ef4444');
  const [label, setLabel] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isMultipleMode, setIsMultipleMode] = useState(false);
  const [showLabelDropdown, setShowLabelDropdown] = useState(false);
  const [useDefaultCoordinates, setUseDefaultCoordinates] = useState(true);
  const [showPredefinedStations, setShowPredefinedStations] = useState(false);
  const [predefinedSearchTerm, setPredefinedSearchTerm] = useState('');
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodingResult, setGeocodingResult] = useState<{ lat: number; lng: number; area: string } | null>(null);

  const colorOptions = customStationsService.getColorOptions();
  const usedLabels = customStationsService.getUsedLabels();

  // Filter predefined stations based on search
  const filteredPredefinedStations = PREDEFINED_STATIONS.filter(station =>
    station.name.toLowerCase().includes(predefinedSearchTerm.toLowerCase()) ||
    station.area.toLowerCase().includes(predefinedSearchTerm.toLowerCase())
  );

  // Auto-geocode when station name changes (for single station mode)
  useEffect(() => {
    if (!isMultipleMode && name.trim() && !editStation && name.length > 2) {
      const timeoutId = setTimeout(async () => {
        setIsGeocoding(true);
        setGeocodingResult(null);
        
        // First try predefined stations
        const predefined = PREDEFINED_STATIONS.find(s => 
          s.name.toLowerCase().includes(name.toLowerCase()) ||
          name.toLowerCase().includes(s.name.toLowerCase())
        );
        
        if (predefined) {
          setGeocodingResult({
            lat: predefined.lat,
            lng: predefined.lng,
            area: predefined.area
          });
          setLat(predefined.lat);
          setLng(predefined.lng);
          setUseDefaultCoordinates(false);
        } else {
          // Try fallback geocoding
          const fallback = geocodingService.getFallbackCoordinates(name);
          if (fallback) {
            setGeocodingResult(fallback);
            setLat(fallback.lat);
            setLng(fallback.lng);
            setUseDefaultCoordinates(false);
          }
        }
        
        setIsGeocoding(false);
      }, 800); // Debounce for 800ms
      
      return () => clearTimeout(timeoutId);
    }
  }, [name, isMultipleMode, editStation]);

  useEffect(() => {
    if (editStation) {
      setName(editStation.name);
      setLat(editStation.lat);
      setLng(editStation.lng);
      setColor(editStation.color);
      setLabel(editStation.label);
      setDescription(editStation.description || '');
      setIsMultipleMode(false);
      setUseDefaultCoordinates(false);
    } else {
      setName('');
      setMultipleNames('');
      setLat(defaultLat || 51.5074);
      setLng(defaultLng || -0.1278);
      setColor('#ef4444');
      setLabel('');
      setDescription('');
      setIsMultipleMode(false);
      setUseDefaultCoordinates(true);
    }
    setErrors({});
    setGeocodingResult(null);
    setIsGeocoding(false);
    setShowLabelDropdown(false);
  }, [isOpen, editStation, defaultLat, defaultLng]);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (isMultipleMode) {
      if (!multipleNames.trim()) {
        newErrors.multipleNames = 'Station names are required';
      } else {
        const names = multipleNames.split('\n').filter(n => n.trim());
        if (names.length === 0) {
          newErrors.multipleNames = 'At least one station name is required';
        } else if (names.length > 20) {
          newErrors.multipleNames = 'Maximum 20 stations can be added at once';
        }
      }
    } else {
      if (!name.trim()) {
        newErrors.name = 'Name is required';
      }
    }

    if (!useDefaultCoordinates && !isMultipleMode) {
      if (lat < -90 || lat > 90) {
        newErrors.lat = 'Latitude must be between -90 and 90';
      }

      if (lng < -180 || lng > 180) {
        newErrors.lng = 'Longitude must be between -180 and 180';
      }
    }

    if (!label.trim()) {
      newErrors.label = 'Label is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePredefinedStationSelect = (station: PredefinedStation) => {
    setName(station.name);
    setLat(station.lat);
    setLng(station.lng);
    setUseDefaultCoordinates(false);
    setShowPredefinedStations(false);
    setPredefinedSearchTerm('');
    setGeocodingResult({
      lat: station.lat,
      lng: station.lng,
      area: station.area
    });
  };

  const handleSave = () => {
    if (!validateForm()) return;

    // Use default coordinates if checkbox is checked
    const finalLat = useDefaultCoordinates ? 51.5074 : lat;
    const finalLng = useDefaultCoordinates ? -0.1278 : lng;

    if (isMultipleMode && onSaveMultiple) {
      const names = multipleNames.split('\n')
        .map(n => n.trim())
        .filter(n => n.length > 0);
      
      const stations: CustomStation[] = [];
      
      names.forEach((stationName) => {
        let stationLat = finalLat;
        let stationLng = finalLng;
        
        // Try to geocode each station individually if not using default coordinates
        if (!useDefaultCoordinates) {
          // First try predefined stations
          const predefined = PREDEFINED_STATIONS.find(s => 
            s.name.toLowerCase().includes(stationName.toLowerCase()) ||
            stationName.toLowerCase().includes(s.name.toLowerCase())
          );
          
          if (predefined) {
            stationLat = predefined.lat;
            stationLng = predefined.lng;
          } else {
            // Try fallback geocoding
            const fallback = geocodingService.getFallbackCoordinates(stationName);
            if (fallback) {
              stationLat = fallback.lat;
              stationLng = fallback.lng;
            }
          }
        }
        
        const stationData = {
          name: stationName,
          lat: stationLat,
          lng: stationLng,
          color,
          label: label.trim(),
          description: description.trim() || undefined,
        };
        
        const newStation = customStationsService.addCustomStation(stationData);
        stations.push(newStation);
      });
      
      onSaveMultiple(stations);
    } else {
      const stationData = {
        name: name.trim(),
        lat: finalLat,
        lng: finalLng,
        color,
        label: label.trim(),
        description: description.trim() || undefined,
      };

      if (editStation) {
        const updated = customStationsService.updateCustomStation(editStation.id, stationData);
        if (updated) {
          onSave({ ...editStation, ...stationData });
        }
      } else {
        const newStation = customStationsService.addCustomStation(stationData);
        onSave(newStation);
      }
    }
    
    onClose();
  };

  const handleClearAll = () => {
    if (window.confirm(`Are you sure you want to delete all ${customStationsCount} custom stations? This action cannot be undone.`)) {
      customStationsService.clearAllCustomStations();
      onClearAll?.();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[2000] p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Edit3 className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              {editStation ? 'Edit Custom Station' : 'Add Custom Station(s)'}
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            {!editStation && customStationsCount > 0 && (
              <button
                onClick={handleClearAll}
                className="text-red-500 hover:text-red-700 transition-colors p-1"
                title={`Clear all ${customStationsCount} custom stations`}
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Mode Toggle */}
          {!editStation && (
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsMultipleMode(false)}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  !isMultipleMode
                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Single Station
              </button>
              <button
                onClick={() => setIsMultipleMode(true)}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isMultipleMode
                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Multiple Stations
              </button>
            </div>
          )}

          {/* Station Name(s) */}
          {isMultipleMode ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Station Names (one per line) *
              </label>
              <textarea
                value={multipleNames}
                onChange={(e) => setMultipleNames(e.target.value)}
                rows={6}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.multipleNames ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter station names, one per line:&#10;Station A&#10;Station B&#10;Station C"
              />
              {errors.multipleNames && <p className="text-red-500 text-xs mt-1">{errors.multipleNames}</p>}
              <p className="text-xs text-gray-500 mt-1">
                Each line will create a separate station with the same coordinates, color, and label
              </p>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Station Name *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter any station name - coordinates will be auto-detected"
                />
                <button
                  type="button"
                  onClick={() => setShowPredefinedStations(!showPredefinedStations)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <SearchIcon className="w-4 h-4" />
                </button>
              </div>
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              
              {/* Geocoding Status */}
              {isGeocoding && (
                <div className="flex items-center space-x-2 text-sm text-blue-600 mt-1">
                  <div className="animate-spin rounded-full h-3 w-3 border-b border-blue-600"></div>
                  <span>Finding coordinates...</span>
                </div>
              )}
              
              {geocodingResult && !isGeocoding && (
                <div className="flex items-center space-x-2 text-sm text-green-600 mt-1">
                  <MapPinIcon className="w-4 h-4" />
                  <span>Found: {geocodingResult.area} ({geocodingResult.lat.toFixed(4)}, {geocodingResult.lng.toFixed(4)})</span>
                </div>
              )}
              
              {/* Predefined Stations Dropdown */}
              {showPredefinedStations && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  <div className="p-2 border-b border-gray-200">
                    <input
                      type="text"
                      value={predefinedSearchTerm}
                      onChange={(e) => setPredefinedSearchTerm(e.target.value)}
                      placeholder="Search stations..."
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                    />
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {filteredPredefinedStations.map((station) => (
                      <button
                        key={station.name}
                        onClick={() => handlePredefinedStationSelect(station)}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-medium">{station.name}</div>
                        <div className="text-xs text-gray-500">{station.area} • {station.lat.toFixed(4)}, {station.lng.toFixed(4)}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Coordinates Section */}
          <div className={`space-y-3 ${isMultipleMode ? 'opacity-75' : ''}`}>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="useDefaultCoords"
                checked={useDefaultCoordinates}
                onChange={(e) => setUseDefaultCoordinates(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                disabled={isMultipleMode}
              />
              <label htmlFor="useDefaultCoords" className="text-sm font-medium text-gray-700">
                {isMultipleMode ? 'Use default coordinates for all stations (Central London)' : 'Use default coordinates (Central London)'}
              </label>
            </div>
            
            {!useDefaultCoordinates && !isMultipleMode && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={lat}
                    onChange={(e) => setLat(parseFloat(e.target.value) || 0)}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.lat ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="51.5074"
                  />
                  {errors.lat && <p className="text-red-500 text-xs mt-1">{errors.lat}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={lng}
                    onChange={(e) => setLng(parseFloat(e.target.value) || 0)}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.lng ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="-0.1278"
                  />
                  {errors.lng && <p className="text-red-500 text-xs mt-1">{errors.lng}</p>}
                </div>
              </div>
            )}
            
            {isMultipleMode && (
              <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded">
                <strong>Note:</strong> {useDefaultCoordinates 
                  ? 'All stations will be placed at default coordinates (Central London). Uncheck the box above to enable automatic coordinate detection for each station name.'
                  : 'Each station will be automatically positioned based on its name. If a location cannot be found, it will use the coordinates you specified above.'
                }
              </div>
            )}
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color *
            </label>
            <div className="grid grid-cols-5 gap-2">
              {colorOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setColor(option.value)}
                  className={`p-2 rounded-md border-2 transition-all ${
                    color === option.value
                      ? 'border-gray-800 scale-110'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  title={option.label}
                >
                  <div
                    className="w-6 h-6 rounded-full mx-auto"
                    style={{ backgroundColor: option.value }}
                  />
                  <span className="text-xs mt-1 block">{option.preview}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Label */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Label *
            </label>
            <div className="relative">
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                onFocus={() => usedLabels.length > 0 && setShowLabelDropdown(true)}
                className={`w-full px-3 py-2 pr-10 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.label ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter label (e.g., 'Planned', 'Special')"
              />
              {usedLabels.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowLabelDropdown(!showLabelDropdown)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <Tag className="w-4 h-4" />
                </button>
              )}
              
              {/* Label Dropdown */}
              {showLabelDropdown && usedLabels.length > 0 && (
                <div className="absolute z-20 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
                  <div className="py-1">
                    <div className="px-3 py-1 text-xs font-medium text-gray-500 uppercase tracking-wide border-b border-gray-200">
                      Previously Used Labels
                    </div>
                    {usedLabels.map((usedLabel) => (
                      <button
                        key={usedLabel}
                        type="button"
                        onClick={() => {
                          setLabel(usedLabel);
                          setShowLabelDropdown(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center space-x-2"
                      >
                        <Tag className="w-3 h-3 text-gray-400" />
                        <span>{usedLabel}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {errors.label && <p className="text-red-500 text-xs mt-1">{errors.label}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Add any additional notes..."
            />
          </div>
        </div>

        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex space-x-3">
            <button
              onClick={handleSave}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              {editStation ? 'Update Station' : isMultipleMode ? 'Add Stations' : 'Add Station'}
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
          {!editStation && customStationsCount > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>{customStationsCount} custom station{customStationsCount !== 1 ? 's' : ''} on map</span>
                <button
                  onClick={handleClearAll}
                  className="text-red-600 hover:text-red-800 font-medium"
                >
                  Clear All
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 