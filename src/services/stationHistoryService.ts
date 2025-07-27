import { StationStats } from '../types/station';

export interface StatusHistoryEntry {
  timestamp: number;
  availableBikes: number;
  availableDocks: number;
  totalDocks: number;
  installed: boolean;
  locked: boolean;
}

export interface StationHistory {
  [stationId: string]: StatusHistoryEntry[];
}

export type StatusFilter = 'none' | 'empty' | 'full' | '75empty' | '75full' | '50empty' | '50full' | 'notinuse' | 'notinuse_count';
export type TimeFilter = '30min' | '60min' | 'custom';

export class StationHistoryService {
  private readonly STORAGE_KEY = 'tfl-cycle-map-station-history';
  private readonly MAX_HISTORY_AGE = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  private readonly BATCH_UPDATE_INTERVAL = 5000; // 5 seconds
  private historyCache: StationHistory = {};
  private lastSaveTime = 0;
  private pendingUpdates = new Set<string>();
  private filteredStationsCache: { [key: string]: StationStats[] } = {};
  private lastCacheTime = 0;
  private readonly CACHE_DURATION = 1000; // 1 second cache

  constructor() {
    this.loadHistory();
  }

  private loadHistory(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      this.historyCache = stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Error loading station history:', error);
      this.historyCache = {};
    }
  }

  private saveHistory(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.historyCache));
      this.lastSaveTime = Date.now();
    } catch (error) {
      console.error('Error saving station history:', error);
    }
  }

  updateStationHistory(stations: StationStats[]): void {
    const now = Date.now();
    let hasChanges = false;
    
    stations.forEach(station => {
      const entry: StatusHistoryEntry = {
        timestamp: now,
        availableBikes: station.availableBikes,
        availableDocks: station.availableDocks,
        totalDocks: station.totalDocks,
        installed: station.installed,
        locked: station.locked,
      };

      if (!this.historyCache[station.id]) {
        this.historyCache[station.id] = [];
      }
      
      // Only add entry if data has changed
      const lastEntry = this.historyCache[station.id][this.historyCache[station.id].length - 1];
      if (!lastEntry || 
          lastEntry.availableBikes !== entry.availableBikes ||
          lastEntry.availableDocks !== entry.availableDocks ||
          lastEntry.installed !== entry.installed ||
          lastEntry.locked !== entry.locked) {
        
        this.historyCache[station.id].push(entry);
        this.pendingUpdates.add(station.id);
        hasChanges = true;
      }
      
      // Keep only recent history (last 24 hours) and limit entries per station
      this.historyCache[station.id] = this.historyCache[station.id]
        .filter(entry => now - entry.timestamp < this.MAX_HISTORY_AGE)
        .slice(-50); // Keep only last 50 entries per station
    });

    // Batch save to localStorage every 5 seconds
    if (hasChanges && (now - this.lastSaveTime > this.BATCH_UPDATE_INTERVAL)) {
      this.saveHistory();
      this.pendingUpdates.clear();
    }

    // Clear cache when data changes
    if (hasChanges) {
      this.filteredStationsCache = {};
      this.lastCacheTime = 0;
    }
  }

  private isStationEmptyForDuration(station: StationStats, durationMinutes: number): boolean {
    const stationHistory = this.historyCache[station.id];
    
    if (!stationHistory || stationHistory.length === 0) {
      return false;
    }

    const cutoffTime = Date.now() - (durationMinutes * 60 * 1000);
    const relevantHistory = stationHistory.filter(entry => entry.timestamp >= cutoffTime);
    
    if (relevantHistory.length === 0) {
      return false;
    }

    // Check if station has been empty (no bikes available) for the entire duration
    return relevantHistory.every(entry => 
      entry.availableBikes === 0 && 
      entry.installed && 
      !entry.locked
    );
  }

  private isStationFullForDuration(station: StationStats, durationMinutes: number): boolean {
    const stationHistory = this.historyCache[station.id];
    
    if (!stationHistory || stationHistory.length === 0) {
      return false;
    }

    const cutoffTime = Date.now() - (durationMinutes * 60 * 1000);
    const relevantHistory = stationHistory.filter(entry => entry.timestamp >= cutoffTime);
    
    if (relevantHistory.length === 0) {
      return false;
    }

    // Check if station has been full (no docks available) for the entire duration
    return relevantHistory.every(entry => 
      entry.availableDocks === 0 && 
      entry.installed && 
      !entry.locked
    );
  }

  private isStation75PercentEmptyForDuration(station: StationStats, durationMinutes: number): boolean {
    const stationHistory = this.historyCache[station.id];
    
    if (!stationHistory || stationHistory.length === 0) {
      return false;
    }

    const cutoffTime = Date.now() - (durationMinutes * 60 * 1000);
    const relevantHistory = stationHistory.filter(entry => entry.timestamp >= cutoffTime);
    
    if (relevantHistory.length === 0) {
      return false;
    }

    // Check if station has been 75% empty (≤25% bikes available) for the entire duration
    return relevantHistory.every(entry => 
      entry.totalDocks > 0 &&
      (entry.availableBikes / entry.totalDocks) <= 0.25 && 
      entry.installed && 
      !entry.locked
    );
  }

  private isStation75PercentFullForDuration(station: StationStats, durationMinutes: number): boolean {
    const stationHistory = this.historyCache[station.id];
    
    if (!stationHistory || stationHistory.length === 0) {
      return false;
    }

    const cutoffTime = Date.now() - (durationMinutes * 60 * 1000);
    const relevantHistory = stationHistory.filter(entry => entry.timestamp >= cutoffTime);
    
    if (relevantHistory.length === 0) {
      return false;
    }

    // Check if station has been 75% full (≤25% docks available) for the entire duration
    return relevantHistory.every(entry => 
      entry.totalDocks > 0 &&
      (entry.availableDocks / entry.totalDocks) <= 0.25 && 
      entry.installed && 
      !entry.locked
    );
  }

  private isStation50PercentEmptyForDuration(station: StationStats, durationMinutes: number): boolean {
    const stationHistory = this.historyCache[station.id];
    
    if (!stationHistory || stationHistory.length === 0) {
      return false;
    }

    const cutoffTime = Date.now() - (durationMinutes * 60 * 1000);
    const relevantHistory = stationHistory.filter(entry => entry.timestamp >= cutoffTime);
    
    if (relevantHistory.length === 0) {
      return false;
    }

    // Check if station has been 50% empty (≤50% bikes available) for the entire duration
    return relevantHistory.every(entry => 
      entry.totalDocks > 0 &&
      (entry.availableBikes / entry.totalDocks) <= 0.5 && 
      entry.installed && 
      !entry.locked
    );
  }

  private isStation50PercentFullForDuration(station: StationStats, durationMinutes: number): boolean {
    const stationHistory = this.historyCache[station.id];
    
    if (!stationHistory || stationHistory.length === 0) {
      return false;
    }

    const cutoffTime = Date.now() - (durationMinutes * 60 * 1000);
    const relevantHistory = stationHistory.filter(entry => entry.timestamp >= cutoffTime);
    
    if (relevantHistory.length === 0) {
      return false;
    }

    // Check if station has been 50% full (≤50% docks available) for the entire duration
    return relevantHistory.every(entry => 
      entry.totalDocks > 0 &&
      (entry.availableDocks / entry.totalDocks) <= 0.5 && 
      entry.installed && 
      !entry.locked
    );
  }

  isStationNotInUseForDuration(station: StationStats, durationMinutes: number): boolean {
    const history = this.historyCache[station.id];
    if (!history || history.length === 0) {
      // If no history, check current status - stations with not in use docks
      const notInUseDocks = station.totalDocks - station.availableDocks - station.availableBikes;
      return notInUseDocks > 0;
    }

    const cutoffTime = Date.now() - (durationMinutes * 60 * 1000);
    const relevantEntries = history.filter(entry => entry.timestamp >= cutoffTime);

    if (relevantEntries.length === 0) {
      // If no recent history, check current status
      const notInUseDocks = station.totalDocks - station.availableDocks - station.availableBikes;
      return notInUseDocks > 0;
    }

    // Check if all recent entries show the station has docks not in use
    return relevantEntries.every(entry => {
      const notInUseDocks = entry.totalDocks - entry.availableDocks - entry.availableBikes;
      return notInUseDocks > 0;
    });
  }

  isStationWithNotInUseCount(station: StationStats, count: number): boolean {
    const notInUseDocks = station.totalDocks - station.availableDocks - station.availableBikes;
    return notInUseDocks >= count;
  }

  getFilteredStations(
    stations: StationStats[],
    statusFilter: StatusFilter,
    timeFilter: TimeFilter,
    customMinutes?: number,
    notInUseCount?: number
  ): StationStats[] {
    // Use cache if available and recent
    const cacheKey = `${statusFilter}_${timeFilter}_${customMinutes || 30}_${notInUseCount || 0}`;
    const now = Date.now();
    
    if (this.filteredStationsCache[cacheKey] && (now - this.lastCacheTime) < this.CACHE_DURATION) {
      return this.filteredStationsCache[cacheKey];
    }

    if (statusFilter === 'none') {
      this.filteredStationsCache[cacheKey] = stations;
      this.lastCacheTime = now;
      return stations;
    }

    const durationMinutes = timeFilter === 'custom' ? (customMinutes || 30) : 
                           timeFilter === '60min' ? 60 : 30;

    let filtered: StationStats[];

    switch (statusFilter) {
      case 'empty':
        filtered = stations.filter(station => this.isStationEmptyForDuration(station, durationMinutes));
        break;
      case 'full':
        filtered = stations.filter(station => this.isStationFullForDuration(station, durationMinutes));
        break;
      case '75empty':
        filtered = stations.filter(station => this.isStation75PercentEmptyForDuration(station, durationMinutes));
        break;
      case '75full':
        filtered = stations.filter(station => this.isStation75PercentFullForDuration(station, durationMinutes));
        break;
      case '50empty':
        filtered = stations.filter(station => this.isStation50PercentEmptyForDuration(station, durationMinutes));
        break;
      case '50full':
        filtered = stations.filter(station => this.isStation50PercentFullForDuration(station, durationMinutes));
        break;
      case 'notinuse':
        filtered = stations.filter(station => this.isStationNotInUseForDuration(station, durationMinutes));
        break;
      case 'notinuse_count':
        filtered = stations.filter(station => this.isStationWithNotInUseCount(station, notInUseCount || 1));
        break;
      default:
        filtered = stations;
    }

    this.filteredStationsCache[cacheKey] = filtered;
    this.lastCacheTime = now;
    return filtered;
  }

  clearHistory(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      this.historyCache = {};
      this.filteredStationsCache = {};
      this.pendingUpdates.clear();
    } catch (error) {
      console.error('Error clearing station history:', error);
    }
  }

  // Force save any pending updates
  forceSave(): void {
    if (this.pendingUpdates.size > 0) {
      this.saveHistory();
      this.pendingUpdates.clear();
    }
  }
}

export const stationHistoryService = new StationHistoryService(); 