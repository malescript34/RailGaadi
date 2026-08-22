import { TerrainProvider } from "./types";
import { ElevationData } from "@/types";
import { MOCK_ELEVATION_20608 } from "./mock-data";

export class MockTerrainProvider implements TerrainProvider {
  name = "MockOpenTopography";

  async getRouteElevation(
    journeyId: string,
    coordinates: [number, number][]
  ): Promise<ElevationData> {
    await new Promise((res) => setTimeout(res, 90));

    if (journeyId.includes("20608")) {
      return MOCK_ELEVATION_20608;
    }

    // Synthesize profile from coordinates
    const profile = coordinates.map((coord, idx) => {
      const distanceRatio = idx / (coordinates.length - 1 || 1);
      const elevation = Math.round(
        200 + Math.sin(distanceRatio * Math.PI) * 550 + Math.cos(idx * 2) * 80
      );
      return {
        distanceKm: Math.round(distanceRatio * 800),
        elevationMeters: Math.max(10, elevation),
      };
    });

    const elevations = profile.map((p) => p.elevationMeters);
    const max = Math.max(...elevations);
    const min = Math.min(...elevations);

    return {
      maxElevationMeters: max,
      minElevationMeters: min,
      currentElevationMeters: profile[Math.floor(profile.length * 0.6)]?.elevationMeters || 350,
      elevationGainMeters: max - min,
      profile,
    };
  }
}
