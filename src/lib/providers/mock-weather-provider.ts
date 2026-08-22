import { WeatherProvider } from "./types";
import { Weather, RouteWeatherCheckpoint, Coordinates } from "@/types";
import { MOCK_WEATHER_20608 } from "./mock-data";

export class MockWeatherProvider implements WeatherProvider {
  name = "MockWeatherService";

  async getPointWeather(
    lat: number,
    lng: number,
    locationName?: string
  ): Promise<Weather> {
    await new Promise((res) => setTimeout(res, 80));

    // Realistic tropical Indian weather variation based on latitude
    const isSouth = lat < 16;
    const isCoastal = lng > 79 || lng < 73;
    const baseTemp = isSouth ? 31 : 28;
    const baseHumid = isCoastal ? 75 : 55;

    return {
      temperature: baseTemp + Math.round((Math.sin(lat * 5) * 3)),
      feelsLike: baseTemp + 4,
      humidity: baseHumid + Math.round((Math.cos(lng * 4) * 8)),
      windSpeed: 12 + Math.round((Math.sin(lng + lat) * 6)),
      rainProbability: isCoastal ? 30 : 15,
      condition: isCoastal ? "Humid & Partly Cloudy" : "Clear Sky",
      conditionIcon: isCoastal ? "partly-cloudy" : "sunny",
      locationName: locationName || `Location (${lat.toFixed(2)}, ${lng.toFixed(2)})`,
      updatedAt: new Date().toISOString(),
    };
  }

  async getRouteWeather(
    journeyId: string,
    checkpoints: {
      id: string;
      name: string;
      coordinates: Coordinates;
      distanceKm: number;
    }[]
  ): Promise<RouteWeatherCheckpoint[]> {
    await new Promise((res) => setTimeout(res, 100));

    if (journeyId.includes("20608")) {
      return MOCK_WEATHER_20608.checkpoints;
    }

    // Synthesize for other journeys
    return Promise.all(
      checkpoints.map(async (cp) => {
        const weather = await this.getPointWeather(
          cp.coordinates.lat,
          cp.coordinates.lng,
          cp.name
        );
        return {
          id: cp.id,
          distanceKm: cp.distanceKm,
          stationName: cp.name,
          coordinates: cp.coordinates,
          weather,
        };
      })
    );
  }
}
