export interface LocationImage {
  url: string;
  width: number;
  height: number;
  photoReference: string;
}

export class ImageService {
  private apiKey: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  }

  async getLocationImage(lat: number, lng: number, stationName: string): Promise<LocationImage | null> {
    if (!this.apiKey || !window.google) {
      console.warn('Google Maps API not available for image service');
      return null;
    }

    try {
      // Try Places API first using the new Place API
      const placesImage = await this.getPlacesImage(lat, lng, stationName);
      if (placesImage) {
        return placesImage;
      }

      // Fallback to Street View
      const streetViewImage = await this.getStreetViewImage(lat, lng);
      if (streetViewImage) {
        return streetViewImage;
      }

      return null;
    } catch (error) {
      console.error('Error fetching location image:', error);
      return null;
    }
  }

  private async getPlacesImage(lat: number, lng: number, stationName: string): Promise<LocationImage | null> {
    try {
      // For now, we'll skip Places API due to deprecation and go straight to Street View
      // This avoids the deprecation warning while still providing location images
      console.log('Skipping Places API due to deprecation, using Street View instead');
      return null;
    } catch (error) {
      console.error('Error in Places API:', error);
      return null;
    }
  }

  private async getStreetViewImage(lat: number, lng: number): Promise<LocationImage | null> {
    try {
      const service = new google.maps.StreetViewService();
      
      return new Promise((resolve) => {
        service.getPanorama({
          location: { lat, lng },
          radius: 50
        }, (data, status) => {
          if (status === google.maps.StreetViewStatus.OK && data) {
            const imageUrl = `https://maps.googleapis.com/maps/api/streetview?size=400x300&location=${lat},${lng}&key=${this.apiKey}`;
            
            resolve({
              url: imageUrl,
              width: 400,
              height: 300,
              photoReference: imageUrl
            });
          } else {
            resolve(null);
          }
        });
      });
    } catch (error) {
      console.error('Error in Street View API:', error);
      return null;
    }
  }
}

export const imageService = new ImageService(); 