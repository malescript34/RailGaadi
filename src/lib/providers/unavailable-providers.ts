import { ElevationData, Journey, LiveTrainStatus, NearbyGeography, TrainSearchResult, Weather } from "@/types";
import { GeoProvider, TerrainProvider, TrainProvider, WeatherProvider } from "./types";

const unavailable = (service: string): never => {
  throw new Error(`${service} is not configured`);
};

export class UnavailableTrainProvider implements TrainProvider {
  name = "UnavailableTrainProvider";
  async searchTrains(_query: string): Promise<TrainSearchResult[]> { return unavailable("RailRadar API"); }
  async getJourney(_journeyId: string): Promise<Journey | null> { return unavailable("RailRadar API"); }
  async getLiveStatus(_journeyId: string): Promise<LiveTrainStatus | null> { return unavailable("RailRadar API"); }
}

export class UnavailableWeatherProvider implements WeatherProvider {
  name = "UnavailableWeatherProvider";
  async getPointWeather(_lat: number, _lng: number, _name?: string): Promise<Weather> { return unavailable("OpenWeather API"); }
  async getRouteWeather(): Promise<never> { return unavailable("OpenWeather API"); }
}

export class UnavailableTerrainProvider implements TerrainProvider {
  name = "UnavailableTerrainProvider";
  async getRouteElevation(_journeyId: string, _coordinates: [number, number][]): Promise<ElevationData> { return unavailable("OpenTopography API"); }
}

export class UnavailableGeoProvider implements GeoProvider {
  name = "UnavailableGeoProvider";
  async getNearbyFeatures(_lat: number, _lng: number, _radiusKm?: number): Promise<NearbyGeography> { return unavailable("Geography API"); }
}
