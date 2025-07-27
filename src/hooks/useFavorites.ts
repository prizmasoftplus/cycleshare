import { useState, useEffect, useCallback } from 'react';

const FAVORITES_STORAGE_KEY = 'tfl-cycle-map-favorites';

export const useFavorites = () => {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const storedFavorites = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (storedFavorites) {
        setFavoriteIds(JSON.parse(storedFavorites));
      }
    } catch (error) {
      console.error('Error loading favorites from localStorage', error);
      setFavoriteIds([]);
    }
  }, []);

  const saveFavorites = (ids: string[]) => {
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(ids));
      setFavoriteIds(ids);
    } catch (error) {
      console.error('Error saving favorites to localStorage', error);
    }
  };
  
  const isFavorite = useCallback((stationId: string) => {
    return favoriteIds.includes(stationId);
  }, [favoriteIds]);

  const toggleFavorite = useCallback((stationId: string) => {
    const newFavorites = isFavorite(stationId)
      ? favoriteIds.filter(id => id !== stationId)
      : [...favoriteIds, stationId];
    saveFavorites(newFavorites);
  }, [favoriteIds, isFavorite]);

  return { favoriteIds, isFavorite, toggleFavorite };
}; 