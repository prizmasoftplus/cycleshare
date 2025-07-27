import React, { useState, useRef, useEffect } from 'react';
import { Search, RefreshCw, Filter, Info, PenSquare, ChevronDown, Trash2, CheckSquare, Square, Car, Clock, Plus, Tags } from 'lucide-react';
import { SavedArea } from '../hooks/useAreas';
import { StatusFilter, TimeFilter } from '../services/stationHistoryService';
import { StationStats } from '../types/station';
import { CustomStation } from '../services/customStationsService';

interface MapControlsProps {
  onRefresh: () => void;
  isLoading: boolean;
  totalStations: number;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  showFilter: boolean;
  onToggleFilter: () => void;
  isDrawingMode: boolean;
  onToggleDrawingMode: () => void;
  areas: SavedArea[];
  activeAreas: SavedArea[];
  onToggleArea: (area: SavedArea) => void;
  onClearActiveAreas: () => void;
  onRemoveArea: (name: string) => void;
  showTraffic: boolean;
  onToggleTraffic: () => void;
  areasLoading?: boolean;
  stations: { name: string }[];
  statusFilter: StatusFilter;
  onStatusFilterChange: (filter: StatusFilter) => void;
  timeFilter: TimeFilter;
  onTimeFilterChange: (filter: TimeFilter) => void;
  customMinutes: number;
  onCustomMinutesChange: (minutes: number) => void;
  onAddCustomStation: () => void;
  allStations: StationStats[];
  notInUseCount: number;
  onNotInUseCountChange: (count: number) => void;
  customStations: CustomStation[];
  selectedCustomLabels: string[];
  onCustomLabelsChange: (labels: string[]) => void;
}

export const MapControls: React.FC<MapControlsProps> = ({
  onRefresh,
  isLoading,
  totalStations,
  searchTerm,
  onSearchChange,
  showFilter,
  onToggleFilter,
  isDrawingMode,
  onToggleDrawingMode,
  areas,
  activeAreas,
  onToggleArea,
  onClearActiveAreas,
  onRemoveArea,
  showTraffic,
  onToggleTraffic,
  areasLoading = false,
  stations,
  statusFilter,
  onStatusFilterChange,
  timeFilter,
  onTimeFilterChange,
  customMinutes,
  onCustomMinutesChange,
  onAddCustomStation,
  allStations,
  notInUseCount,
  onNotInUseCountChange,
  customStations,
  selectedCustomLabels,
  onCustomLabelsChange
}) => {
  const [isAreaMenuOpen, setIsAreaMenuOpen] = useState(false);
  const [isTimeFilterOpen, setIsTimeFilterOpen] = useState(false);
  const [isTagsMenuOpen, setIsTagsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const timeFilterRef = useRef<HTMLDivElement>(null);
  const tagsMenuRef = useRef<HTMLDivElement>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Get unique custom station labels
  const customLabels = [...new Set(customStations.map(s => s.label).filter(Boolean))].sort();

  // Calculate filter counts
  const getFilterCount = (filterType: StatusFilter): number => {
    if (filterType === 'none') return allStations.length;
    
    const durationMinutes = timeFilter === 'custom' ? customMinutes : 
                           timeFilter === '60min' ? 60 : 30;

    switch (filterType) {
      case 'empty':
        return allStations.filter(station => {
          const notInUseDocks = station.totalDocks - station.availableDocks - station.availableBikes;
          return station.availableBikes === 0 && station.installed && !station.locked;
        }).length;
      case 'full':
        return allStations.filter(station => {
          return station.availableDocks === 0 && station.installed && !station.locked;
        }).length;
      case '75empty':
        return allStations.filter(station => {
          if (!station.installed || station.locked || station.totalDocks === 0) return false;
          const bikePercentage = (station.availableBikes / station.totalDocks) * 100;
          return bikePercentage <= 25;
        }).length;
      case '75full':
        return allStations.filter(station => {
          if (!station.installed || station.locked || station.totalDocks === 0) return false;
          const dockPercentage = (station.availableDocks / station.totalDocks) * 100;
          return dockPercentage <= 25;
        }).length;
      case '50empty':
        return allStations.filter(station => {
          if (!station.installed || station.locked || station.totalDocks === 0) return false;
          const bikePercentage = (station.availableBikes / station.totalDocks) * 100;
          return bikePercentage <= 50;
        }).length;
      case '50full':
        return allStations.filter(station => {
          if (!station.installed || station.locked || station.totalDocks === 0) return false;
          const dockPercentage = (station.availableDocks / station.totalDocks) * 100;
          return dockPercentage <= 50;
        }).length;
      case 'notinuse':
        return allStations.filter(station => {
          const notInUseDocks = station.totalDocks - station.availableDocks - station.availableBikes;
          return notInUseDocks > 0;
        }).length;
      case 'notinuse_count':
        return allStations.filter(station => {
          const notInUseDocks = station.totalDocks - station.availableDocks - station.availableBikes;
          return notInUseDocks >= notInUseCount;
        }).length;
      default:
        return 0;
    }
  };

  useEffect(() => {
    if (searchTerm.length === 0) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    const filtered = stations
      .map(s => s.name)
      .filter(name => name.toLowerCase().includes(searchTerm.toLowerCase()))
      .slice(0, 8);
    setSuggestions(filtered);
    setShowSuggestions(filtered.length > 0);
  }, [searchTerm, stations]);

  const handleSuggestionClick = (name: string) => {
    onSearchChange(name);
    setShowSuggestions(false);
  };

  const handleStatusFilterClick = (filter: StatusFilter) => {
    if (statusFilter === filter) {
      onStatusFilterChange('none'); // Toggle off if already active
      setIsTimeFilterOpen(false);
    } else {
      onStatusFilterChange(filter);
      setIsTimeFilterOpen(true); // Show time filter dropdown
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsAreaMenuOpen(false);
      }
      if (timeFilterRef.current && !timeFilterRef.current.contains(event.target as Node)) {
        setIsTimeFilterOpen(false);
      }
      if (tagsMenuRef.current && !tagsMenuRef.current.contains(event.target as Node)) {
        setIsTagsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleTagToggle = (label: string) => {
    const newLabels = selectedCustomLabels.includes(label)
      ? selectedCustomLabels.filter(l => l !== label)
      : [...selectedCustomLabels, label];
    onCustomLabelsChange(newLabels);
  };

  const handleShowAllStations = () => {
    onCustomLabelsChange([]);
  };

  const handleShowCustomOnly = () => {
    onCustomLabelsChange(['__custom_only__']);
  };

  return (
    <div className="absolute top-4 left-4 right-4 z-[1000] flex flex-col sm:flex-row gap-2">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-3 flex-1">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">TfL Cycle Share</h1>
            <p className="text-sm text-gray-600">{totalStations} stations</p>
          </div>
          <div className="flex items-center space-x-2">
            {/* Status Filter Buttons */}
            <div className="flex gap-1 relative" ref={timeFilterRef}>
              <button
                onClick={() => handleStatusFilterClick('empty')}
                className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                  statusFilter === 'empty' 
                    ? 'bg-red-100 text-red-700 border border-red-300' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                title="Show completely empty stations"
              >
                Empty ({getFilterCount('empty')})
              </button>
              <button
                onClick={() => handleStatusFilterClick('full')}
                className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                  statusFilter === 'full' 
                    ? 'bg-orange-100 text-orange-700 border border-orange-300' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                title="Show completely full stations"
              >
                Full ({getFilterCount('full')})
              </button>
              <button
                onClick={() => handleStatusFilterClick('75empty')}
                className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                  statusFilter === '75empty' 
                    ? 'bg-red-100 text-red-700 border border-red-300' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                title="Show 75% empty stations"
              >
                75% Empty ({getFilterCount('75empty')})
              </button>
              <button
                onClick={() => handleStatusFilterClick('75full')}
                className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                  statusFilter === '75full' 
                    ? 'bg-orange-100 text-orange-700 border border-orange-300' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                title="Show 75% full stations"
              >
                75% Full ({getFilterCount('75full')})
              </button>
              <button
                onClick={() => handleStatusFilterClick('50empty')}
                className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                  statusFilter === '50empty' 
                    ? 'bg-red-100 text-red-700 border border-red-300' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                title="Show 50% empty stations"
              >
                50% Empty ({getFilterCount('50empty')})
              </button>
              <button
                onClick={() => handleStatusFilterClick('50full')}
                className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                  statusFilter === '50full' 
                    ? 'bg-orange-100 text-orange-700 border border-orange-300' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                title="Show 50% full stations"
              >
                50% Full ({getFilterCount('50full')})
              </button>
              <button
                onClick={() => handleStatusFilterClick('notinuse_count')}
                className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                  statusFilter === 'notinuse_count' 
                    ? 'bg-gray-800 text-white border border-gray-600' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                title="Show stations that have specific number of docks not in use"
              >
                Not In Use ({getFilterCount('notinuse_count')})
              </button>
              
              {/* Time Filter Dropdown */}
              {isTimeFilterOpen && statusFilter !== 'none' && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-md shadow-lg z-20 border">
                  <div className="py-2">
                    {statusFilter === 'notinuse_count' ? (
                      <>
                        <div className="px-3 py-1 text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Number of Docks Not In Use
                        </div>
                        <div className="px-3 py-2">
                          <input
                            type="number"
                            min="1"
                            max="50"
                            value={notInUseCount}
                            onChange={(e) => onNotInUseCountChange(parseInt(e.target.value) || 1)}
                            className="w-full text-sm border border-gray-300 rounded-md px-2 py-1"
                            placeholder="Enter number of docks"
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="px-3 py-1 text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Duration
                        </div>
                        <div className="px-3 py-2">
                          <select
                            value={timeFilter}
                            onChange={(e) => onTimeFilterChange(e.target.value as TimeFilter)}
                            className="w-full text-sm border border-gray-300 rounded-md px-2 py-1"
                          >
                            <option value="30min">30 minutes</option>
                            <option value="60min">60 minutes</option>
                            <option value="custom">Custom</option>
                          </select>
                        </div>
                        {timeFilter === 'custom' && (
                          <div className="px-3 py-2">
                            <input
                              type="number"
                              min="1"
                              max="1440"
                              value={customMinutes}
                              onChange={(e) => onCustomMinutesChange(parseInt(e.target.value) || 30)}
                              className="w-full text-sm border border-gray-300 rounded-md px-2 py-1"
                              placeholder="Enter minutes"
                            />
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsAreaMenuOpen(!isAreaMenuOpen)}
                className="p-2 rounded-md transition-colors text-gray-600 hover:bg-gray-100 flex items-center"
                title="Manage areas"
              >
                <PenSquare className="w-5 h-5" />
                <ChevronDown className="w-4 h-4 ml-1" />
              </button>
              {isAreaMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg z-10 border">
                  <div className="py-1">
                    <button
                      onClick={() => { onToggleDrawingMode(); setIsAreaMenuOpen(false); }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Draw New Area
                    </button>
                    {activeAreas.length > 0 && (
                       <button
                        onClick={() => { onClearActiveAreas(); setIsAreaMenuOpen(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Clear Selection
                      </button>
                    )}
                    
                    {areasLoading && (
                      <div className="px-4 py-2 text-sm text-gray-500 flex items-center">
                        <div className="animate-spin rounded-full h-3 w-3 border-b border-gray-400 mr-2"></div>
                        Loading areas...
                      </div>
                    )}
                    
                    {!areasLoading && areas.length > 0 && <hr className="my-1"/>}
                    {!areasLoading && areas.map(area => {
                      const isActive = activeAreas.some(a => a.name === area.name);
                      return (
                        <div key={area.name} className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          <button onClick={() => onToggleArea(area)} className="flex-1 text-left flex items-center">
                            {isActive ? <CheckSquare className="w-4 h-4 mr-2 text-blue-600"/> : <Square className="w-4 h-4 mr-2 text-gray-400"/>}
                            {area.name}
                          </button>
                          <button onClick={() => onRemoveArea(area.name)} className="p-1 text-gray-400 hover:text-red-500">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                    
                    {!areasLoading && areas.length === 0 && (
                      <div className="px-4 py-2 text-sm text-gray-500">
                        No saved areas
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={onAddCustomStation}
              className="p-2 rounded-md transition-colors text-gray-600 hover:bg-gray-100"
              title="Add custom station"
            >
              <Plus className="w-5 h-5" />
            </button>
            {/* Custom Station Tags Filter */}
            {customLabels.length > 0 && (
              <div className="relative" ref={tagsMenuRef}>
                <button
                  onClick={() => setIsTagsMenuOpen(!isTagsMenuOpen)}
                  className={`p-2 rounded-md transition-colors flex items-center space-x-1 ${
                    selectedCustomLabels.length > 0 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  title="Filter custom stations by tags"
                >
                  <Tags className="w-5 h-5" />
                  {selectedCustomLabels.length > 0 && (
                    <span className="text-xs bg-blue-600 text-white rounded-full px-1.5 py-0.5 min-w-[16px] text-center">
                      {selectedCustomLabels.includes('__custom_only__') ? 'All' : selectedCustomLabels.length}
                    </span>
                  )}
                  <ChevronDown className="w-4 h-4" />
                </button>
                
                {isTagsMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg z-20 border">
                    <div className="py-1">
                      <div className="px-3 py-1 text-xs font-medium text-gray-500 uppercase tracking-wide border-b border-gray-200">
                        Station Visibility
                      </div>
                      
                      {/* Custom Only Option */}
                      <button
                        onClick={handleShowCustomOnly}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                      >
                        {selectedCustomLabels.includes('__custom_only__') ? (
                          <CheckSquare className="w-4 h-4 mr-2 text-blue-600" />
                        ) : (
                          <Square className="w-4 h-4 mr-2 text-gray-400" />
                        )}
                        Show All Custom Stations ({customStations.length} custom only)
                      </button>
                      
                      {customLabels.length > 0 && <hr className="my-1" />}
                      
                      {/* Individual Tag Options */}
                      <div className="px-3 py-1 text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Select Custom Tags to Show
                      </div>
                      {customLabels.map(label => {
                        const count = customStations.filter(s => s.label === label).length;
                        const isSelected = selectedCustomLabels.includes(label) && !selectedCustomLabels.includes('__custom_only__');
                        return (
                          <button
                            key={label}
                            onClick={() => handleTagToggle(label)}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center justify-between"
                            disabled={selectedCustomLabels.includes('__custom_only__')}
                          >
                            <div className="flex items-center">
                              {isSelected ? (
                                <CheckSquare className="w-4 h-4 mr-2 text-blue-600" />
                              ) : (
                                <Square className="w-4 h-4 mr-2 text-gray-400" />
                              )}
                              <span className={selectedCustomLabels.includes('__custom_only__') ? 'text-gray-400' : ''}>
                                {label}
                              </span>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              selectedCustomLabels.includes('__custom_only__') 
                                ? 'bg-gray-100 text-gray-400' 
                                : 'bg-blue-100 text-blue-600'
                            }`}>
                              {count}
                            </span>
                          </button>
                        );
                      })}
                      
                      {selectedCustomLabels.length > 0 && !selectedCustomLabels.includes('__custom_only__') && (
                        <>
                          <hr className="my-1" />
                          <button
                            onClick={handleShowAllStations}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            Clear Selection
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
            <button
              onClick={onToggleFilter}
              className={`p-2 rounded-md transition-colors ${
                showFilter ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
              }`}
              title="Toggle filters"
            >
              <Filter className="w-5 h-5" />
            </button>
            <button
              onClick={onToggleTraffic}
              className={`p-2 rounded-md transition-colors ${
                showTraffic ? 'bg-green-100 text-green-600' : 'text-gray-600 hover:bg-gray-100'
              }`}
              title="Toggle traffic"
            >
              <Car className="w-5 h-5" />
            </button>
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50"
              title="Refresh data"
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-lg p-3 sm:w-80">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search stations..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setShowSuggestions(suggestions.length > 0)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            autoComplete="off"
          />
          {showSuggestions && (
            <ul className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-20 max-h-48 overflow-y-auto">
              {suggestions.map((name) => (
                <li
                  key={name}
                  className="px-4 py-2 cursor-pointer hover:bg-blue-100 text-sm"
                  onMouseDown={() => handleSuggestionClick(name)}
                >
                  {name}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Legend */}
      {showFilter && (
        <div className="bg-white rounded-lg shadow-lg p-3 sm:w-64">
          <h3 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
            <Info className="w-4 h-4 mr-1" />
            Station Status
          </h3>
          <div className="space-y-1 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>Good availability</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <span>Low availability</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span>Full/Empty/Offline</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};