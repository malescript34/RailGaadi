import {
  TrainProvider,
  WeatherProvider,
  TerrainProvider,
  GeoProvider,
} from "./types";
import { MockTrainProvider } from "./mock-train-provider";
import { MockWeatherProvider } from "./mock-weather-provider";
import { MockTerrainProvider } from "./mock-terrain-provider";
import { MockGeoProvider } from "./mock-geo-provider";
import { OpenWeatherProvider } from "./openweather-provider";
import { OpenTopographyProvider } from "./opentopography-provider";
import { RailRadarProvider } from "./railradar-provider";
import { OverpassGeoProvider } from "./overpass-geo-provider";
import {
  UnavailableGeoProvider,
  UnavailableTerrainProvider,
  UnavailableTrainProvider,
  UnavailableWeatherProvider,
} from "./unavailable-providers";

class ProviderRegistry {
  private trainProvider: TrainProvider;
  private weatherProvider: WeatherProvider;
  private terrainProvider: TerrainProvider;
  private geoProvider: GeoProvider;

  constructor() {
    const railRadarKey = process.env.RAILRADAR_API_KEY;
    const openWeatherKey = process.env.OPENWEATHER_API_KEY;
    const openTopoKey = process.env.OPENTOPOGRAPHY_API_KEY;
    const overpassEndpoint = process.env.OVERPASS_ENDPOINT;
    // Mock data is reserved for deliberate local development only. Production
    // never substitutes a fixed train for an unavailable external API.
    const useMockData = process.env.USE_MOCK_DATA === "true";

    this.trainProvider = railRadarKey
      ? new RailRadarProvider(railRadarKey)
      : useMockData ? new MockTrainProvider() : new UnavailableTrainProvider();

    this.weatherProvider = openWeatherKey
      ? new OpenWeatherProvider(openWeatherKey)
      : useMockData ? new MockWeatherProvider() : new UnavailableWeatherProvider();

    this.terrainProvider = openTopoKey
      ? new OpenTopographyProvider(openTopoKey)
      : useMockData ? new MockTerrainProvider() : new UnavailableTerrainProvider();

    this.geoProvider = overpassEndpoint
      ? new OverpassGeoProvider(overpassEndpoint)
      : useMockData ? new MockGeoProvider() : new UnavailableGeoProvider();
  }

  getTrainProvider(): TrainProvider {
    return this.trainProvider;
  }

  getWeatherProvider(): WeatherProvider {
    return this.weatherProvider;
  }

  getTerrainProvider(): TerrainProvider {
    return this.terrainProvider;
  }

  getGeoProvider(): GeoProvider {
    return this.geoProvider;
  }

  setTrainProvider(provider: TrainProvider) {
    this.trainProvider = provider;
  }

  setWeatherProvider(provider: WeatherProvider) {
    this.weatherProvider = provider;
  }

  setTerrainProvider(provider: TerrainProvider) {
    this.terrainProvider = provider;
  }

  setGeoProvider(provider: GeoProvider) {
    this.geoProvider = provider;
  }
}

export const providerRegistry = new ProviderRegistry();
