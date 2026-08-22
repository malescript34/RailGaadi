import {
  TrainSearchResult,
  Journey,
  LiveTrainStatus,
  Weather,
  RouteWeatherCheckpoint,
  ElevationData,
  NearbyGeography,
  Coordinates,
} from "@/types";

export interface TrainProvider {
  name: string;
  searchTrains(query: string): Promise<TrainSearchResult[]>;
  getJourney(journeyId: string): Promise<Journey | null>;
  getLiveStatus(journeyId: string): Promise<LiveTrainStatus | null>;
}

export interface WeatherProvider {
  name: string;
  getPointWeather(lat: number, lng: number, locationName?: string): Promise<Weather>;
  getRouteWeather(journeyId: string, checkpoints: { id: string; name: string; coordinates: Coordinates; distanceKm: number }[]): Promise<RouteWeatherCheckpoint[]>;
}

export interface TerrainProvider {
  name: string;
  getRouteElevation(journeyId: string, coordinates: [number, number][], progressPercentage?: number): Promise<ElevationData>;
}

export interface GeoProvider {
  name: string;
  getNearbyFeatures(lat: number, lng: number, radiusKm?: number): Promise<NearbyGeography>;
}
