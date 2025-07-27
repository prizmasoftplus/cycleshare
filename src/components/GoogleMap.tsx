import React, { useEffect, useRef, useCallback, useState } from 'react';
import { Wrapper, Status } from '@googlemaps/react-wrapper';
import { StationStats } from '../types/station';
import { SavedArea } from '../hooks/useAreas';
import { PriorityLevel } from '../hooks/usePriorities';
import { CustomStation } from '../services/customStationsService';

interface GoogleMapProps {
  stations: StationStats[];
  onStationClick: (station: StationStats) => void;
  searchTerm: string;
  favoriteIds: string[];
  origin: StationStats | null;
  destination: StationStats | null;
  onDirectionsResult: (result: google.maps.DirectionsResult) => void;
  isDrawingMode: boolean;
  activeAreas: SavedArea[];
  onPolygonComplete: (path: google.maps.LatLng[]) => void;
  priorities: { [stationId: string]: PriorityLevel };
  showTraffic: boolean;
  customStations: CustomStation[];
  onCustomStationClick: (station: CustomStation) => void;
}

const mapContainerStyle = {
  width: '100%',
  height: '100%',
  minHeight: '400px',
};

const center = {
  lat: 51.5074,
  lng: -0.1278,
};

const mapOptions = {
  zoom: 12,
  styles: [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }],
    },
  ],
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: false,
};

const LoadingElement = () => (
  <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
    <div className="text-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Loading map...</p>
    </div>
  </div>
);

const ErrorElement = ({ apiKey }: { apiKey: string }) => (
  <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
    <div className="text-center p-8">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">Map Loading Error</h3>
      <p className="text-gray-600 mb-4">
        {!apiKey
          ? 'Google Maps API key is not configured. Please add VITE_GOOGLE_MAPS_API_KEY to your environment variables.'
          : 'Failed to load Google Maps. Please check your API key and internet connection.'}
      </p>
      <p className="text-sm text-gray-500">
        To get a Google Maps API key, visit the Google Cloud Console and enable the Maps JavaScript API.
      </p>
    </div>
  </div>
);

function Map({ stations, onStationClick, searchTerm, favoriteIds, origin, destination, onDirectionsResult, isDrawingMode, activeAreas, onPolygonComplete, priorities, showTraffic, customStations, onCustomStationClick }: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const customMarkersRef = useRef<google.maps.Marker[]>([]);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  const drawingManagerRef = useRef<google.maps.drawing.DrawingManager | null>(null);
  const polygonsRef = useRef<google.maps.Polygon[]>([]);
  const trafficLayerRef = useRef<google.maps.TrafficLayer | null>(null);
  const markersMapRef = useRef<{ [id: string]: google.maps.Marker }>({});
  const prevStationsRef = useRef<StationStats[]>([]);
  const [highlightedStations, setHighlightedStations] = useState<Set<string>>(new Set());
  const highlightTimeoutsRef = useRef<{ [id: string]: number }>({});

  const getMarkerColor = (station: StationStats): string => {
    if (!station.installed || station.locked) return '#dc2626'; // red for offline/locked
    
    // Check if station is empty (no bikes available)
    if (station.availableBikes === 0) return '#000000'; // black for empty
    
    // Check if station is full (no docks available)
    if (station.availableDocks === 0) return '#dc2626'; // red for full
    
    const bikePercentage = station.totalDocks > 0 ? (station.availableBikes / station.totalDocks) * 100 : 0;
    const dockPercentage = station.totalDocks > 0 ? (station.availableDocks / station.totalDocks) * 100 : 0;
    
    if (bikePercentage >= 30 && dockPercentage >= 30) return '#16a34a'; // green for good availability
    if (bikePercentage >= 10 && dockPercentage >= 10) return '#60a5fa'; // light blue for low availability
    return '#60a5fa'; // light blue for very low availability
  };

  const getPriorityStyle = (level: PriorityLevel): { color: string, text: string } => {
    switch(level) {
      case 'HP': return { color: '#7e22ce', text: 'HP' };
      case 'P1': return { color: '#be185d', text: 'P1' };
      case 'P2': return { color: '#0e7490', text: 'P2' };
      case 'P3': return { color: '#57534e', text: 'P3' };
      default: return { color: 'transparent', text: '' };
    }
  };

  const createCustomMarkerIcon = (station: StationStats, highlight = false): string => {
    const color = getMarkerColor(station);
    const isFavorite = favoriteIds.includes(station.id);
    const strokeColor = station.availableEBikes > 0 ? '#4f46e5' : 'white'; // Indigo for e-bike stations
    const strokeWidth = station.availableEBikes > 0 ? 3 : 2;
    const priority = priorities[station.id] || 'None';
    const priorityStyle = getPriorityStyle(priority);
    const glow = highlight ? '<filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>' : '';
    const filter = highlight ? 'filter="url(#glow)"' : '';
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
      <svg width="36" height="42" viewBox="0 0 36 42" xmlns="http://www.w3.org/2000/svg">
        ${glow}
        <!-- Map pin shape -->
        <path d="M18,2 C10.268,2 4,8.268 4,16 C4,24 18,38 18,38 S32,24 32,16 C32,8.268 25.732,2 18,2 Z" fill="${color}" stroke="${strokeColor}" stroke-width="${strokeWidth}" ${filter}/>
        <!-- Inner circle for bike count -->
        <circle cx="18" cy="16" r="8" fill="white" stroke="${strokeColor}" stroke-width="1"/>
        <text x="18" y="20" text-anchor="middle" fill="${color}" font-family="Arial, sans-serif" font-size="12" font-weight="bold">
          ${station.availableBikes}
        </text>
        <!-- Favorite star -->
        ${isFavorite ? `<path d="M18,6 l1.5,3 3.5,0.5 -2.5,2.5 0.5,3 -2.5,-1.5 -2.5,1.5 0.5,-3 -2.5,-2.5 3.5,-0.5z" fill="#fbbf24"/>` : ''}
        <!-- Priority label -->
        ${priority !== 'None' ? `
          <rect x="12" y="28" width="12" height="8" rx="2" fill="${priorityStyle.color}" />
          <text x="18" y="33" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="7" font-weight="bold">
            ${priorityStyle.text}
          </text>
        ` : ''}
      </svg>
    `)}`;
  };

  const createCustomStationIcon = (station: CustomStation): string => {
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
      <svg width="36" height="42" viewBox="0 0 36 42" xmlns="http://www.w3.org/2000/svg">
        <!-- Map pin shape -->
        <path d="M18,2 C10.268,2 4,8.268 4,16 C4,24 18,38 18,38 S32,24 32,16 C32,8.268 25.732,2 18,2 Z" fill="${station.color}" stroke="white" stroke-width="2"/>
        <!-- Inner circle -->
        <circle cx="18" cy="16" r="8" fill="white" stroke="white" stroke-width="1"/>
        <!-- Label text -->
        <text x="18" y="20" text-anchor="middle" fill="${station.color}" font-family="Arial, sans-serif" font-size="10" font-weight="bold">
          ${station.label.charAt(0).toUpperCase()}
        </text>
        <!-- Star indicator for custom station -->
        <path d="M18,6 l1.5,3 3.5,0.5 -2.5,2.5 0.5,3 -2.5,-1.5 -2.5,1.5 0.5,-3 -2.5,-2.5 3.5,-0.5z" fill="white"/>
      </svg>
    `)}`;
  };

  // Initialize map and services
  useEffect(() => {
    if (mapRef.current && !googleMapRef.current && window.google) {
      googleMapRef.current = new window.google.maps.Map(mapRef.current, {
        ...mapOptions,
        center,
      });
      directionsRendererRef.current = new google.maps.DirectionsRenderer();
      directionsRendererRef.current.setMap(googleMapRef.current);

      // Initialize traffic layer
      trafficLayerRef.current = new google.maps.TrafficLayer();
      trafficLayerRef.current.setMap(googleMapRef.current);

      drawingManagerRef.current = new google.maps.drawing.DrawingManager({
        drawingMode: google.maps.drawing.OverlayType.POLYGON,
        drawingControl: false,
        polygonOptions: {
          fillColor: '#4f46e5',
          fillOpacity: 0.1,
          strokeColor: '#4f46e5',
          strokeWeight: 2,
          clickable: false,
          editable: false,
          zIndex: 1,
        },
      });

      google.maps.event.addListener(drawingManagerRef.current, 'polygoncomplete', (polygon: google.maps.Polygon) => {
        if (polygonsRef.current) {
          polygonsRef.current.forEach(p => p.setMap(null));
        }
        polygon.setMap(null); // The drawing manager polygon should be hidden
        const path = polygon.getPath().getArray();
        onPolygonComplete(path);
      });
    }
  }, [onPolygonComplete]);
  
  // Toggle drawing mode
  useEffect(() => {
    if (drawingManagerRef.current) {
      drawingManagerRef.current.setMap(isDrawingMode ? googleMapRef.current : null);
    }
  }, [isDrawingMode]);
  
  // Toggle traffic layer
  useEffect(() => {
    if (trafficLayerRef.current && googleMapRef.current) {
      if (showTraffic) {
        trafficLayerRef.current.setMap(googleMapRef.current);
      } else {
        trafficLayerRef.current.setMap(null);
      }
    }
  }, [showTraffic]);
  
  // Draw the activeArea polygons
   useEffect(() => {
    // Clear any existing polygons first
    polygonsRef.current.forEach(p => p.setMap(null));
    polygonsRef.current = [];
    
    if (activeAreas.length > 0 && googleMapRef.current) {
      activeAreas.forEach(area => {
        const polygon = new google.maps.Polygon({
          paths: area.path,
          fillColor: '#4f46e5',
          fillOpacity: 0.1,
          strokeColor: '#4f46e5',
          strokeWeight: 2,
          map: googleMapRef.current,
        });
        polygonsRef.current.push(polygon);
      });
    }
  }, [activeAreas]);

  // Handle directions request
  useEffect(() => {
    if (!origin || !destination || !googleMapRef.current || !directionsRendererRef.current) {
      if (directionsRendererRef.current) {
        // Clear previous routes by setting an empty result
        directionsRendererRef.current.setDirections({
          geocoded_waypoints: [],
          routes: [],
          request: {} as google.maps.DirectionsRequest
        });
      }
      return;
    }

    const directionsService = new google.maps.DirectionsService();
    
    const getLatLng = (station: StationStats) => {
      const parts = station.id.split('_');
      const lat = parseFloat(parts[parts.length - 2]);
      const lng = parseFloat(parts[parts.length - 1]);
      return { lat, lng };
    };

    directionsService.route(
      {
        origin: getLatLng(origin),
        destination: getLatLng(destination),
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          directionsRendererRef.current?.setDirections(result);
          onDirectionsResult(result);
        } else {
          console.error(`error fetching directions ${result}`);
        }
      }
    );
  }, [origin, destination, onDirectionsResult]);

  // Update markers
  useEffect(() => {
    if (!googleMapRef.current) return;
    const prevStations = prevStationsRef.current;
    const prevStationsMap = Object.fromEntries(prevStations.map(s => [s.id, s]));
    const currentMarkers = markersMapRef.current;
    const newMarkers: { [id: string]: google.maps.Marker } = { ...currentMarkers };
    const changedIds: string[] = [];

    // Remove markers for stations that no longer exist
    Object.keys(currentMarkers).forEach(id => {
      if (!stations.some(s => s.id === id)) {
        currentMarkers[id].setMap(null);
        delete newMarkers[id];
      }
    });

    // Add or update markers
    stations.forEach(station => {
      const parts = station.id.split('_');
      if (parts.length < 3) return;
      const lat = parseFloat(parts[parts.length - 2]);
      const lng = parseFloat(parts[parts.length - 1]);
      if (isNaN(lat) || isNaN(lng)) return;
      // Filter stations based on search term
      const isVisible = station.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        station.id.toLowerCase().includes(searchTerm.toLowerCase());
      if (!isVisible) {
        if (newMarkers[station.id]) {
          newMarkers[station.id].setMap(null);
        }
        return;
      }
      const prev = prevStationsMap[station.id];
      const needsUpdate =
        !newMarkers[station.id] ||
        !prev ||
        prev.availableBikes !== station.availableBikes ||
        prev.availableDocks !== station.availableDocks ||
        prev.installed !== station.installed ||
        prev.locked !== station.locked;
      if (needsUpdate) {
        changedIds.push(station.id);
      }
      if (!newMarkers[station.id]) {
        // Create new marker
        const marker = new window.google.maps.Marker({
          position: { lat, lng },
          map: googleMapRef.current,
          title: station.name,
          icon: {
            url: createCustomMarkerIcon(station, needsUpdate),
            scaledSize: new window.google.maps.Size(36, 42),
            anchor: new window.google.maps.Point(18, 42),
          },
        });
        marker.addListener('click', () => {
          onStationClick(station);
        });
        newMarkers[station.id] = marker;
      } else if (needsUpdate) {
        // Update icon only
        newMarkers[station.id].setIcon({
          url: createCustomMarkerIcon(station, true),
          scaledSize: new window.google.maps.Size(36, 42),
          anchor: new window.google.maps.Point(18, 42),
        });
      }
      // Always update position in case it changed
      newMarkers[station.id].setPosition({ lat, lng });
      newMarkers[station.id].setMap(googleMapRef.current);
    });
    // Highlight changed stations for 2 seconds
    if (changedIds.length > 0) {
      setHighlightedStations(prev => {
        const updated = new Set(prev);
        changedIds.forEach(id => updated.add(id));
        return updated;
      });
      changedIds.forEach(id => {
        if (highlightTimeoutsRef.current[id]) clearTimeout(highlightTimeoutsRef.current[id]);
        highlightTimeoutsRef.current[id] = setTimeout(() => {
          setHighlightedStations(prev => {
            const updated = new Set(prev);
            updated.delete(id);
            // Remove highlight from marker icon
            const marker = markersMapRef.current[id];
            const station = stations.find(s => s.id === id);
            if (marker && station) {
              marker.setIcon({
                url: createCustomMarkerIcon(station, false),
                scaledSize: new window.google.maps.Size(36, 42),
                anchor: new window.google.maps.Point(18, 42),
              });
            }
            return updated;
          });
        }, 15000);
      });
    }
    markersMapRef.current = newMarkers;
    prevStationsRef.current = stations;
  }, [stations, searchTerm, onStationClick, favoriteIds, origin, priorities]);

  // Update custom station markers
  useEffect(() => {
    if (!googleMapRef.current) return;
    
    // Clear existing custom markers
    customMarkersRef.current.forEach(marker => marker.setMap(null));
    customMarkersRef.current = [];

    // Create new custom markers
    customStations.forEach(station => {
      const marker = new window.google.maps.Marker({
        position: { lat: station.lat, lng: station.lng },
        map: googleMapRef.current,
        title: `${station.name} (${station.label})`,
        icon: {
          url: createCustomStationIcon(station),
          scaledSize: new window.google.maps.Size(36, 42),
          anchor: new window.google.maps.Point(18, 42),
        },
        zIndex: 1000, // Ensure custom stations appear above regular stations
      });

      marker.addListener('click', () => {
        onCustomStationClick(station);
      });

      customMarkersRef.current.push(marker);
    });
  }, [customStations, onCustomStationClick]);

  // Cleanup markers on unmount
  useEffect(() => {
    return () => {
      markersRef.current.forEach(marker => marker.setMap(null));
      customMarkersRef.current.forEach(marker => marker.setMap(null));
    };
  }, []);

  return <div ref={mapRef} style={mapContainerStyle} />;
}

export const GoogleMap: React.FC<GoogleMapProps> = (props) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  if (!apiKey) {
    return <ErrorElement apiKey={apiKey} />;
  }
  return (
    <Wrapper apiKey={apiKey} libraries={['places', 'routes', 'drawing', 'geometry']} render={(status: Status) => {
      if (status === Status.LOADING) return <LoadingElement />;
      if (status === Status.FAILURE) return <ErrorElement apiKey={apiKey} />;
      return <Map {...props} />;
    }} />
  );
};