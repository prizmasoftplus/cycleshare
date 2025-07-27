export interface BikePoint {
  id: string;
  commonName: string;
  placeType: string;
  lat: number;
  lon: number;
  additionalProperties: AdditionalProperty[];
  children?: any[];
  childrenUrls?: any[];
  url: string;
}

export interface AdditionalProperty {
  category: string;
  key: string;
  sourceSystemKey: string;
  value: string;
  modified: string;
}

export interface StationStats {
  id: string;
  name: string;
  totalDocks: number;
  availableBikes: number;
  availableEBikes: number;
  availableDocks: number;
  installed: boolean;
  locked: boolean;
  temporary: boolean;
  lastUpdated: string;
}