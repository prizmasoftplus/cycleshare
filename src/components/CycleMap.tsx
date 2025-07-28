import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { GoogleMap } from './GoogleMap';
import { StationModal } from './StationModal';
import { MapControls } from './MapControls';
import { CustomStationModal } from './CustomStationModal';
import { tflApi } from '../services/tflApi';
import { BikePoint, StationStats } from '../types/station';
import { useFavorites } from '../hooks/useFavorites';
import { useAreas, SavedArea } from '../hooks/useAreas';
import { usePriorities, PriorityLevel } from '../hooks/usePriorities';
import { stationHistoryService, StatusFilter, TimeFilter } from '../services/stationHistoryService';
import { customStationsService, CustomStation } from '../services/customStationsService';
import { UserGuideModal } from './UserGuideModal';

export const CycleMap: React.FC = () => {
  const [bikePoints, setBikePoints] = useState<BikePoint[]>([]);
  const [stations, setStations] = useState<StationStats[]>([]);
  const [selectedStation, setSelectedStation] = useState<StationStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const { favoriteIds, isFavorite, toggleFavorite } = useFavorites();

  // State for drawing feature
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [activeAreas, setActiveAreas] = useState<SavedArea[]>([]);
  const { areas, addArea, removeArea, loading: areasLoading } = useAreas();
  const { priorities, setStationPriority, getStationPriority } = usePriorities();
  
  // State for traffic feature
  const [showTraffic, setShowTraffic] = useState(false);
  const [lastApiUpdate, setLastApiUpdate] = useState<Date | null>(null);

  // State for status filters
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('none');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('30min');
  const [customMinutes, setCustomMinutes] = useState(30);
  const [notInUseCount, setNotInUseCount] = useState(1);

  // State for custom stations
  const [customStations, setCustomStations] = useState<CustomStation[]>([]);
  const [isCustomStationModalOpen, setIsCustomStationModalOpen] = useState(false);
  const [editingCustomStation, setEditingCustomStation] = useState<CustomStation | null>(null);
  const [selectedCustomLabels, setSelectedCustomLabels] = useState<string[]>([]);

  // State for e-bike filter
  const [showEBikesOnly, setShowEBikesOnly] = useState(false);

  // State for user guide modal
  const [isUserGuideOpen, setIsUserGuideOpen] = useState(false);

  // Filter custom stations by selected labels
  const filteredCustomStations = useMemo(() => {
    if (selectedCustomLabels.length === 0) {
      return []; // Hide all custom stations when no tags selected
    }
    if (selectedCustomLabels.includes('__custom_only__')) {
      return customStations; // Show all custom stations when "Custom Only" is selected
    }
    // Filter by selected labels
    return customStations.filter(station => selectedCustomLabels.includes(station.label));
  }, [customStations, selectedCustomLabels]);

  // Filter stations based on status history
  const filteredStations = useMemo(() => {
    let filteredStationsData = stationHistoryService.getFilteredStations(
      stations,
      statusFilter,
      timeFilter,
      customMinutes,
      notInUseCount
    );
    
    // Apply e-bike filter if enabled
    if (showEBikesOnly) {
      filteredStationsData = filteredStationsData.filter(station => station.availableEBikes > 0);
    }
    
    return filteredStationsData;
  }, [stations, statusFilter, timeFilter, customMinutes, notInUseCount, showEBikesOnly]);

  // Show TfL stations unless "Custom Only" is explicitly selected
  const displayedStations = useMemo(() => {
    if (selectedCustomLabels.includes('__custom_only__')) {
      return []; // Hide TfL stations only when "Custom Only" is explicitly selected
    }
    return filteredStations; // Always show TfL stations unless "Custom Only" is selected
  }, [filteredStations, selectedCustomLabels]);

  const loadBikePoints = useCallback(async () => {
    try {
      // Don't set loading true for background refreshes
      // setIsLoading(true);
      setError(null);
      const points = await tflApi.getBikePoints();
      setBikePoints(points);
      
      // Convert to StationStats with coordinates embedded in ID
      const stats = points.map(point => ({
        ...tflApi.parseStationStats(point),
        id: `${point.id}_${point.lat}_${point.lon}`
      }));
      setStations(stats);
      
      // Update station history
      stationHistoryService.updateStationHistory(stats);
      
      // Set the timestamp when API data was last fetched
      setLastApiUpdate(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load bike points');
      console.error('Error loading bike points:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load custom stations on component mount
  useEffect(() => {
    const loadCustomStations = () => {
      const stations = customStationsService.getAllCustomStations();
      setCustomStations(stations);
    };
    loadCustomStations();
  }, []);

  useEffect(() => {
    loadBikePoints();
  }, [loadBikePoints]);
  
  // Auto-refresh data every 30 seconds
  useEffect(() => {
    const intervalId = setInterval(() => {
      console.log('Refreshing bike data...');
      loadBikePoints();
    }, 30000);

    return () => {
      clearInterval(intervalId);
      // Force save any pending history updates
      stationHistoryService.forceSave();
    };
  }, [loadBikePoints]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stationHistoryService.forceSave();
    };
  }, []);

  const handleStationClick = (station: StationStats) => {
    setSelectedStation(station);
  };

  const handleCustomStationClick = (station: CustomStation) => {
    setEditingCustomStation(station);
    setIsCustomStationModalOpen(true);
  };

  const handleCustomStationSave = (station: CustomStation) => {
    setCustomStations(prev => {
      const index = prev.findIndex(s => s.id === station.id);
      if (index !== -1) {
        // Update existing station
        const updated = [...prev];
        updated[index] = station;
        return updated;
      } else {
        // Add new station
        return [...prev, station];
      }
    });
  };

  const handleCustomStationsSaveMultiple = (stations: CustomStation[]) => {
    setCustomStations(prev => {
      // Create a map of existing stations by ID to avoid duplicates
      const existingMap = new Map(prev.map(s => [s.id, s]));
      
      // Add new stations, replacing any with the same ID
      stations.forEach(station => {
        existingMap.set(station.id, station);
      });
      
      return Array.from(existingMap.values());
    });
  };

  const handleClearAllCustomStations = () => {
    setCustomStations([]);
  };

  const handleAddCustomStation = () => {
    setEditingCustomStation(null);
    setIsCustomStationModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedStation(null);
  };

  const handleToggleDrawingMode = () => {
    if (isDrawingMode) {
      // If turning off, clear the polygon
      setActiveAreas([]);
    }
    setIsDrawingMode(!isDrawingMode);
  };

  const handlePolygonComplete = (polygonPath: google.maps.LatLng[]) => {
    const areaName = prompt('Enter a name for this area:');
    if (areaName) {
      const newArea: SavedArea = {
        name: areaName,
        path: polygonPath.map(p => p.toJSON()),
      };
      addArea(newArea);
      setActiveAreas([newArea]); // Select the new area
    }
    setIsDrawingMode(false); // Exit drawing mode after completing a polygon
  };

  const handleToggleArea = (area: SavedArea) => {
    setActiveAreas(prev => {
      const isAlreadyActive = prev.some(a => a.name === area.name);
      if (isAlreadyActive) {
        return prev.filter(a => a.name !== area.name);
      } else {
        return [...prev, area];
      }
    });
  };

  const handleClearActiveAreas = () => {
    setActiveAreas([]);
  };

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Map</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadBikePoints}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen">
      <GoogleMap
        stations={displayedStations}
        onStationClick={handleStationClick}
        searchTerm={searchTerm}
        favoriteIds={favoriteIds}
        isDrawingMode={isDrawingMode}
        activeAreas={activeAreas}
        onPolygonComplete={handlePolygonComplete}
        priorities={priorities}
        showTraffic={showTraffic}
        customStations={filteredCustomStations}
        onCustomStationClick={handleCustomStationClick}
      />

      <MapControls
        onRefresh={loadBikePoints}
        isLoading={isLoading}
        totalStations={displayedStations.length + filteredCustomStations.length}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        showFilter={showFilter}
        onToggleFilter={() => setShowFilter(!showFilter)}
        isDrawingMode={isDrawingMode}
        onToggleDrawingMode={handleToggleDrawingMode}
        areas={areas}
        activeAreas={activeAreas}
        onToggleArea={handleToggleArea}
        onClearActiveAreas={handleClearActiveAreas}
        onRemoveArea={removeArea}
        showTraffic={showTraffic}
        onToggleTraffic={() => setShowTraffic(!showTraffic)}
        areasLoading={areasLoading}
        stations={stations.map(s => ({ name: s.name }))}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        timeFilter={timeFilter}
        onTimeFilterChange={setTimeFilter}
        customMinutes={customMinutes}
        onCustomMinutesChange={setCustomMinutes}
        onAddCustomStation={handleAddCustomStation}
        allStations={stations}
        notInUseCount={notInUseCount}
        onNotInUseCountChange={setNotInUseCount}
        customStations={customStations}
        selectedCustomLabels={selectedCustomLabels}
        onCustomLabelsChange={setSelectedCustomLabels}
        showEBikesOnly={showEBikesOnly}
        onToggleEBikesOnly={() => setShowEBikesOnly(!showEBikesOnly)}
      />

      <StationModal
        station={selectedStation}
        onClose={handleCloseModal}
        isFavorite={isFavorite(selectedStation?.id || '')}
        onToggleFavorite={() => toggleFavorite(selectedStation?.id || '')}
        priority={getStationPriority(selectedStation?.id || '')}
        onSetPriority={(level: PriorityLevel) => setStationPriority(selectedStation?.id || '', level)}
        lastApiUpdate={lastApiUpdate}
      />

      <CustomStationModal
        isOpen={isCustomStationModalOpen}
        onClose={() => setIsCustomStationModalOpen(false)}
        onSave={handleCustomStationSave}
        onSaveMultiple={handleCustomStationsSaveMultiple}
        onClearAll={handleClearAllCustomStations}
        editStation={editingCustomStation}
        customStationsCount={customStations.length}
      />

      <UserGuideModal
        isOpen={isUserGuideOpen}
        onClose={() => setIsUserGuideOpen(false)}
      />

      {isLoading && (
        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center z-[1001]">
          <div className="bg-white rounded-lg p-6 shadow-xl">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-700">Loading bike stations...</span>
            </div>
          </div>
        </div>
      )}

      {/* Footer Bar */}
      <div className="absolute bottom-0 left-0 right-0 z-[999] bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>Developed by <strong>Munavar Moghal</strong> • © <strong>Avizaa Ltd</strong></span>
          <button
            onClick={() => setIsUserGuideOpen(true)}
            className="text-blue-600 hover:text-blue-800 font-medium underline"
          >
            User Guide
          </button>
        </div>
      </div>
    </div>
  );
};