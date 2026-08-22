export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Station {
  id: string;
  code: string;
  name: string;
  city?: string;
  state?: string;
  latitude: number;
  longitude: number;
  elevationMeters?: number;
}

export interface Train {
  id: string;
  number: string;
  name: string;
  type?: string; // Vande Bharat, Rajdhani, Express, Superfast, Shatabdi
  origin: Station;
  destination: Station;
  totalDistanceKm: number;
  scheduledDurationHours?: number;
}

export interface JourneyStation {
  station: Station;
  sequence: number;
  scheduledArrival?: string;
  actualArrival?: string;
  scheduledDeparture?: string;
  actualDeparture?: string;
  distanceFromOriginKm: number;
  platform?: string;
  haltMinutes?: number;
  status: "PASSED" | "CURRENT" | "UPCOMING";
  delayMinutes: number;
}

export type RunningStatus =
  | "ON_TIME"
  | "DELAYED"
  | "EARLY"
  | "AT_STATION"
  | "DEPARTED"
  | "COMPLETED"
  | "NOT_STARTED"
  | "DATA_UNAVAILABLE";

export interface LiveTrainStatus {
  journeyId: string;
  train: Train;
  status: RunningStatus;
  delayMinutes: number;
  position: Coordinates;
  speedKmph?: number;
  headingDeg?: number;
  currentStation?: Station;
  nextStation?: Station;
  lastPassedStation?: Station;
  etaNextStation?: string;
  etaDestination?: string;
  distanceCoveredKm: number;
  distanceRemainingKm: number;
  completionPercentage: number;
  updatedAt: string;
  isStale?: boolean;
  statusMessage?: string;
}

export interface JourneyRouteGeoJSON {
  type: "FeatureCollection";
  features: Array<{
    type: "Feature";
    properties: {
      trainNumber: string;
      trainName: string;
      totalDistanceKm: number;
    };
    geometry: {
      type: "LineString";
      coordinates: [number, number][]; // [lng, lat]
    };
  }>;
}

export interface Journey {
  id: string;
  train: Train;
  serviceDate: string;
  origin: Station;
  destination: Station;
  stations: JourneyStation[];
  route: JourneyRouteGeoJSON;
  liveStatus: LiveTrainStatus;
}

export interface Weather {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  rainProbability: number;
  condition: string;
  conditionIcon: string; // sunny, rainy, cloudy, haze, thunderstorm
  locationName: string;
  updatedAt: string;
}

export interface RouteWeatherCheckpoint {
  id: string;
  distanceKm: number;
  stationName?: string;
  coordinates: Coordinates;
  weather: Weather;
}

export interface ElevationProfilePoint {
  distanceKm: number;
  elevationMeters: number;
  stationName?: string;
}

export interface ElevationData {
  maxElevationMeters: number;
  minElevationMeters: number;
  currentElevationMeters: number;
  elevationGainMeters: number;
  profile: ElevationProfilePoint[];
}

export type GeographicCategory =
  | "river"
  | "lake"
  | "mountain"
  | "ghat"
  | "bridge"
  | "tunnel"
  | "monument"
  | "tourist_attraction"
  | "city"
  | "district";

export interface GeographicFeature {
  id: string;
  category: GeographicCategory;
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
  distanceFromTrainKm: number;
  elevationMeters?: number;
}

export interface NearbyGeography {
  rivers: GeographicFeature[];
  mountains: GeographicFeature[];
  bridgesAndTunnels: GeographicFeature[];
  monumentsAndAttractions: GeographicFeature[];
  cities: GeographicFeature[];
}

export interface TrainSearchResult {
  id: string;
  number: string;
  name: string;
  type: string;
  origin: {
    code: string;
    name: string;
  };
  destination: {
    code: string;
    name: string;
  };
  totalDistanceKm: number;
  departureTime: string;
  arrivalTime: string;
  runningDays: string[];
}

export interface RecentSearch {
  trainNumber: string;
  trainName: string;
  originCode: string;
  originName: string;
  destinationCode: string;
  destinationName: string;
  lastSearchedAt: string;
}

export interface FavouriteTrain {
  trainNumber: string;
  trainName: string;
  originName: string;
  destinationName: string;
  addedAt: string;
}

export interface SharedJourneyData {
  shareId: string;
  journeyId: string;
  trainNumber: string;
  trainName: string;
  serviceDate: string;
  liveStatus: LiveTrainStatus;
  route: JourneyRouteGeoJSON;
  stations: JourneyStation[];
  createdAt: string;
}
