export interface CustomStation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  color: string;
  label: string;
  description?: string;
  createdAt: number;
}

export class CustomStationsService {
  private readonly STORAGE_KEY = 'tfl-cycle-map-custom-stations';

  private getCustomStations(): CustomStation[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading custom stations:', error);
      return [];
    }
  }

  private saveCustomStations(stations: CustomStation[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(stations));
    } catch (error) {
      console.error('Error saving custom stations:', error);
    }
  }

  getAllCustomStations(): CustomStation[] {
    return this.getCustomStations();
  }

  addCustomStation(station: Omit<CustomStation, 'id' | 'createdAt'>): CustomStation {
    const stations = this.getCustomStations();
    const newStation: CustomStation = {
      ...station,
      id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: Date.now(),
    };
    
    stations.push(newStation);
    this.saveCustomStations(stations);
    return newStation;
  }

  updateCustomStation(id: string, updates: Partial<CustomStation>): boolean {
    const stations = this.getCustomStations();
    const index = stations.findIndex(s => s.id === id);
    
    if (index === -1) return false;
    
    stations[index] = { ...stations[index], ...updates };
    this.saveCustomStations(stations);
    return true;
  }

  deleteCustomStation(id: string): boolean {
    const stations = this.getCustomStations();
    const filtered = stations.filter(s => s.id !== id);
    
    if (filtered.length === stations.length) return false;
    
    this.saveCustomStations(filtered);
    return true;
  }

  clearAllCustomStations(): void {
    this.saveCustomStations([]);
  }

  // Predefined color options
  getColorOptions(): { value: string; label: string; preview: string }[] {
    return [
      { value: '#ef4444', label: 'Red', preview: '🔴' },
      { value: '#f97316', label: 'Orange', preview: '🟠' },
      { value: '#eab308', label: 'Yellow', preview: '🟡' },
      { value: '#22c55e', label: 'Green', preview: '🟢' },
      { value: '#06b6d4', label: 'Cyan', preview: '🔵' },
      { value: '#3b82f6', label: 'Blue', preview: '🔵' },
      { value: '#8b5cf6', label: 'Purple', preview: '🟣' },
      { value: '#ec4899', label: 'Pink', preview: '🩷' },
      { value: '#6b7280', label: 'Gray', preview: '⚫' },
      { value: '#000000', label: 'Black', preview: '⚫' },
    ];
  }
}

export const customStationsService = new CustomStationsService(); 