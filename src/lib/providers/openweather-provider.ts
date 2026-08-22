import { WeatherProvider } from "./types";
import { Weather, RouteWeatherCheckpoint, Coordinates } from "@/types";

export class OpenWeatherProvider implements WeatherProvider {
  name = "OpenWeather";
  private apiKey: string;
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getPointWeather(
    lat: number,
    lng: number,
    locationName?: string
  ): Promise<Weather> {
    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${this.apiKey}&units=metric`;
      const res = await fetch(url, {
        next: { revalidate: 900 }, // 15 mins cache
      });

      if (!res.ok) {
        throw new Error(`OpenWeather returned ${res.status}`);
      }

      const data = await res.json();
      const conditionMain = data.weather?.[0]?.main || "Clear";
      const conditionDesc = data.weather?.[0]?.description || "Clear sky";

      let iconType = "sunny";
      const lower = conditionMain.toLowerCase();
      if (lower.includes("rain") || lower.includes("drizzle")) iconType = "rainy";
      else if (lower.includes("cloud")) iconType = "cloudy";
      else if (lower.includes("thunder")) iconType = "thunderstorm";
      else if (lower.includes("mist") || lower.includes("haze")) iconType = "haze";

      return {
        temperature: Math.round(data.main?.temp ?? 28),
        feelsLike: Math.round(data.main?.feels_like ?? data.main?.temp ?? 28),
        humidity: Math.round(data.main?.humidity ?? 60),
        windSpeed: Math.round((data.wind?.speed ?? 3.5) * 3.6), // convert m/s to km/h
        rainProbability: data.rain ? 70 : 15,
        condition: conditionDesc.charAt(0).toUpperCase() + conditionDesc.slice(1),
        conditionIcon: iconType,
        locationName: locationName || data.name || `Station (${lat.toFixed(2)}, ${lng.toFixed(2)})`,
        updatedAt: new Date().toISOString(),
      };
    } catch (err) {
      console.warn("OpenWeather fetch failed:", err);
      throw err;
    }
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
    try {
      // Fetch checkpoints in parallel with concurrency limit
      const results = await Promise.all(
        checkpoints.slice(0, 8).map(async (cp) => {
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
      return results;
    } catch (err) {
      console.warn("OpenWeather route check failed:", err);
      throw err;
    }
  }
}
