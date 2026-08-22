import { TerrainProvider } from "./types";
import { ElevationData, ElevationProfilePoint } from "@/types";

const OPENTOPO_BASE = "https://portal.opentopography.org/API/globaldem";

function sampleCoordinates(coords: [number, number][], maxPoints = 28): [number, number][] {
  if (coords.length <= maxPoints) return coords;
  return Array.from({ length: maxPoints }, (_, index) => {
    const sourceIndex = Math.round((index / (maxPoints - 1)) * (coords.length - 1));
    return coords[sourceIndex];
  });
}

function haversineKm(a: [number, number], b: [number, number]): number {
  const r = 6371;
  const toRad = (degrees: number) => (degrees * Math.PI) / 180;
  const dLat = toRad(b[1] - a[1]);
  const dLng = toRad(b[0] - a[0]);
  const value = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a[1])) * Math.cos(toRad(b[1])) * Math.sin(dLng / 2) ** 2;
  return 2 * r * Math.asin(Math.sqrt(value));
}

function parseAsciiGrid(text: string): number | null {
  const values = text
    .split(/\r?\n/)
    .slice(6)
    .flatMap((line) => line.trim().split(/\s+/))
    .map(Number)
    .filter((value) => Number.isFinite(value) && value > -1000 && value !== 0);
  if (!values.length) return null;
  values.sort((a, b) => a - b);
  return values[Math.floor(values.length / 2)];
}

export class OpenTopographyProvider implements TerrainProvider {
  name = "OpenTopography";

  constructor(private apiKey: string) {}

  private async getPointElevation([lng, lat]: [number, number]): Promise<number | null> {
    const pad = 0.005;
    const url = new URL(OPENTOPO_BASE);
    url.searchParams.set("demtype", "SRTMGL3");
    url.searchParams.set("south", String(lat - pad));
    url.searchParams.set("north", String(lat + pad));
    url.searchParams.set("west", String(lng - pad));
    url.searchParams.set("east", String(lng + pad));
    url.searchParams.set("outputFormat", "AAIGrid");
    url.searchParams.set("API_Key", this.apiKey);
    const response = await fetch(url, { signal: AbortSignal.timeout(15000), next: { revalidate: 86400 } });
    if (!response.ok) throw new Error(`OpenTopography returned ${response.status}`);
    return parseAsciiGrid(await response.text());
  }

  async getRouteElevation(
    _journeyId: string,
    coordinates: [number, number][],
    progressPercentage = 0
  ): Promise<ElevationData> {
    if (coordinates.length < 2) return this.emptyProfile();
    const sampled = sampleCoordinates(coordinates);
    const distances = sampled.reduce<number[]>((all, point, index) => {
      all.push(index === 0 ? 0 : all[index - 1] + haversineKm(sampled[index - 1], point));
      return all;
    }, []);

    try {
      const elevations: (number | null)[] = [];
      for (let index = 0; index < sampled.length; index += 4) {
        const batch = await Promise.all(sampled.slice(index, index + 4).map((point) => this.getPointElevation(point)));
        elevations.push(...batch);
      }
      const profile: ElevationProfilePoint[] = elevations.flatMap((elevation, index) => elevation == null ? [] : [{
        distanceKm: Math.round(distances[index] * 10) / 10,
        elevationMeters: Math.round(elevation),
      }]);
      if (profile.length < 2) return this.emptyProfile();

      const values = profile.map((point) => point.elevationMeters);
      const currentIndex = Math.min(profile.length - 1, Math.max(0, Math.round((progressPercentage / 100) * (profile.length - 1))));
      const elevationGainMeters = profile.slice(1).reduce((total, point, index) => total + Math.max(0, point.elevationMeters - profile[index].elevationMeters), 0);
      return {
        maxElevationMeters: Math.max(...values),
        minElevationMeters: Math.min(...values),
        currentElevationMeters: profile[currentIndex].elevationMeters,
        elevationGainMeters: Math.round(elevationGainMeters),
        profile,
      };
    } catch (error) {
      console.warn("OpenTopography elevation fetch failed:", error);
      return this.emptyProfile();
    }
  }

  private emptyProfile(): ElevationData {
    return { maxElevationMeters: 0, minElevationMeters: 0, currentElevationMeters: 0, elevationGainMeters: 0, profile: [] };
  }
}
