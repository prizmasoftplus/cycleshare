import { SavedArea } from '../hooks/useAreas';

export interface AreaResponse {
  id: string;
  name: string;
  path: google.maps.LatLngLiteral[];
  createdAt: string;
  updatedAt: string;
}

export class AreasApiService {
  private readonly STORAGE_KEY = 'tfl-cycle-map-areas';

  async getAllAreas(): Promise<SavedArea[]> {
    try {
      return this.getLocalAreas();
    } catch (error) {
      console.error('Error loading areas:', error);
      return [];
    }
  }

  async saveArea(area: SavedArea): Promise<boolean> {
    try {
      const areas = this.getLocalAreas();
      
      // Check for duplicate names
      const existing = areas.find(a => a.name.toLowerCase() === area.name.toLowerCase());
      if (existing) {
        throw new Error('Area with this name already exists');
      }

      areas.push(area);
      this.saveToLocalStorage(areas);
      
      return true;
    } catch (error) {
      console.error('Error saving area:', error);
      return false;
    }
  }

  async deleteArea(name: string): Promise<boolean> {
    try {
      const areas = this.getLocalAreas();
      const filteredAreas = areas.filter(a => a.name !== name);
      this.saveToLocalStorage(filteredAreas);
      
      return true;
    } catch (error) {
      console.error('Error deleting area:', error);
      return false;
    }
  }

  // localStorage operations
  private getLocalAreas(): SavedArea[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading local areas:', error);
      return [];
    }
  }

  private saveToLocalStorage(areas: SavedArea[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(areas));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }
}

export const areasApi = new AreasApiService(); 