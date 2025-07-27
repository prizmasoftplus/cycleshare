import { BikePoint, StationStats } from '../types/station';

const TFL_API_BASE = 'https://api.tfl.gov.uk';

export class TflApiService {
  async getBikePoints(): Promise<BikePoint[]> {
    try {
      const response = await fetch(`${TFL_API_BASE}/BikePoint`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching bike points:', error);
      throw error;
    }
  }

  async getBikePointById(id: string): Promise<BikePoint> {
    try {
      const response = await fetch(`${TFL_API_BASE}/BikePoint/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching bike point:', error);
      throw error;
    }
  }

  parseStationStats(bikePoint: BikePoint): StationStats {
    const getPropertyValue = (key: string): string => {
      const prop = bikePoint.additionalProperties?.find(p => p.key === key);
      return prop?.value || '0';
    };

    // Parse last updated date
    const lastUpdateValue = getPropertyValue('LastUpdate');
    let lastUpdated: string;
    
    if (lastUpdateValue && lastUpdateValue !== '0') {
      try {
        // Try to parse the date from TfL API
        const date = new Date(lastUpdateValue);
        if (!isNaN(date.getTime())) {
          lastUpdated = date.toISOString();
        } else {
          // If parsing fails, use current time
          lastUpdated = new Date().toISOString();
        }
      } catch (error) {
        // If any error occurs, use current time
        lastUpdated = new Date().toISOString();
      }
    } else {
      // If no LastUpdate value, use current time
      lastUpdated = new Date().toISOString();
    }

    return {
      id: bikePoint.id,
      name: bikePoint.commonName,
      totalDocks: parseInt(getPropertyValue('NbDocks'), 10),
      availableBikes: parseInt(getPropertyValue('NbBikes'), 10),
      availableEBikes: parseInt(getPropertyValue('NbEBikes'), 10),
      availableDocks: parseInt(getPropertyValue('NbEmptyDocks'), 10),
      installed: getPropertyValue('Installed') === 'true',
      locked: getPropertyValue('Locked') === 'true',
      temporary: getPropertyValue('Temporary') === 'true',
      lastUpdated,
    };
  }
}

export const tflApi = new TflApiService();