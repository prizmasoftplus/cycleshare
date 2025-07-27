import { useState, useEffect, useCallback } from 'react';

export const priorityLevels = ['None', 'HP', 'P1', 'P2', 'P3'] as const;
export type PriorityLevel = typeof priorityLevels[number];

type PriorityMap = {
  [stationId: string]: PriorityLevel;
};

const PRIORITIES_STORAGE_KEY = 'tfl-cycle-map-priorities';

export const usePriorities = () => {
  const [priorities, setPriorities] = useState<PriorityMap>({});

  // Load saved priorities from localStorage on initial render
  useEffect(() => {
    try {
      const storedPriorities = localStorage.getItem(PRIORITIES_STORAGE_KEY);
      if (storedPriorities) {
        setPriorities(JSON.parse(storedPriorities));
      }
    } catch (error) {
      console.error('Error loading priorities from localStorage', error);
      setPriorities({});
    }
  }, []);

  // Function to save priorities to state and localStorage
  const savePriorities = (updatedPriorities: PriorityMap) => {
    try {
      localStorage.setItem(PRIORITIES_STORAGE_KEY, JSON.stringify(updatedPriorities));
      setPriorities(updatedPriorities);
    } catch (error) {
      console.error('Error saving priorities to localStorage', error);
    }
  };
  
  const setStationPriority = useCallback((stationId: string, level: PriorityLevel) => {
    const newPriorities = { ...priorities };
    if (level === 'None') {
      delete newPriorities[stationId];
    } else {
      newPriorities[stationId] = level;
    }
    savePriorities(newPriorities);
  }, [priorities]);
  
  const getStationPriority = useCallback((stationId: string): PriorityLevel => {
    return priorities[stationId] || 'None';
  }, [priorities]);

  return { priorities, setStationPriority, getStationPriority };
}; 