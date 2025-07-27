import { useState, useEffect, useCallback } from 'react';
import { areasApi } from '../services/areasApi';

// The structure for a saved area
export interface SavedArea {
  name: string;
  path: google.maps.LatLngLiteral[];
}

const AREAS_STORAGE_KEY = 'tfl-cycle-map-areas';

export const useAreas = () => {
  const [areas, setAreas] = useState<SavedArea[]>([]);
  const [loading, setLoading] = useState(true);

  // Load areas on initial render
  useEffect(() => {
    const loadAreas = async () => {
      try {
        setLoading(true);
        const serverAreas = await areasApi.getAllAreas();
        setAreas(serverAreas);
      } catch (err) {
        console.error('Error loading areas:', err);
      } finally {
        setLoading(false);
      }
    };

    loadAreas();
  }, []);

  // Function to save areas to state and localStorage
  const saveAreas = (updatedAreas: SavedArea[]) => {
    try {
      localStorage.setItem(AREAS_STORAGE_KEY, JSON.stringify(updatedAreas));
      setAreas(updatedAreas);
    } catch (error) {
      console.error('Error saving areas to localStorage', error);
    }
  };
  
  // Add a new area
  const addArea = useCallback(async (area: SavedArea) => {
    try {
      // Prevent duplicate names
      const existing = areas.find(a => a.name.toLowerCase() === area.name.toLowerCase());
      if (existing) {
        alert('An area with this name already exists.');
        return;
      }

      const success = await areasApi.saveArea(area);
      
      if (success) {
        // Update local state
        setAreas(prev => [...prev, area]);
      } else {
        // Reload areas to get the latest state
        const updatedAreas = await areasApi.getAllAreas();
        setAreas(updatedAreas);
      }
    } catch (error) {
      console.error('Error adding area:', error);
      alert('Failed to save area. Please try again.');
    }
  }, [areas]);
  
  // Remove an area by name
  const removeArea = useCallback(async (name: string) => {
    if (window.confirm(`Are you sure you want to delete the area "${name}"?`)) {
      try {
        const success = await areasApi.deleteArea(name);
        
        if (success) {
          // Update local state
          setAreas(prev => prev.filter(a => a.name !== name));
        } else {
          // Reload areas to get the latest state
          const updatedAreas = await areasApi.getAllAreas();
          setAreas(updatedAreas);
        }
      } catch (error) {
        console.error('Error removing area:', error);
        alert('Failed to delete area. Please try again.');
      }
    }
  }, []);

  return { areas, addArea, removeArea, loading };
}; 