import { GeographicFeature, NearbyGeography } from "@/types";
import { GeoProvider } from "./types";

type OverpassElement = {
  id: number;
  type: string;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

const emptyGeography = (): NearbyGeography => ({
  rivers: [], mountains: [], bridgesAndTunnels: [], monumentsAndAttractions: [], cities: [],
});

const distanceKm = (lat1: number, lng1: number, lat2: number, lng2: number) => {
  const r = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * r * Math.asin(Math.sqrt(a));
};

export class OverpassGeoProvider implements GeoProvider {
  name = "Overpass";

  constructor(private endpoint: string) {}

  async getNearbyFeatures(lat: number, lng: number, radiusKm = 25): Promise<NearbyGeography> {
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat === 0 || lng === 0) return emptyGeography();
    const radiusM = Math.min(Math.max(Math.round(radiusKm * 1000), 1000), 50000);
    const query = `[out:json][timeout:20];(
      nwr[waterway~"river|stream"](around:${radiusM},${lat},${lng});
      nwr[natural~"peak|mountain"](around:${radiusM},${lat},${lng});
      nwr[bridge](around:${radiusM},${lat},${lng});
      nwr[tunnel](around:${radiusM},${lat},${lng});
      nwr[tourism~"attraction|museum|viewpoint"](around:${radiusM},${lat},${lng});
      nwr[historic](around:${radiusM},${lat},${lng});
      node[place~"city|town"](around:${radiusM},${lat},${lng});
    );out center tags 40;`;
    const response = await fetch(this.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ data: query }),
      signal: AbortSignal.timeout(25000),
      next: { revalidate: 3600 },
    });
    if (!response.ok) throw new Error(`Overpass returned ${response.status}`);
    const payload = await response.json() as { elements?: OverpassElement[] };
    const output = emptyGeography();

    for (const element of payload.elements || []) {
      const point = element.center || (element.lat != null && element.lon != null ? { lat: element.lat, lon: element.lon } : null);
      if (!point) continue;
      const tags = element.tags || {};
      const category = tags.waterway ? "river" : tags.natural ? "mountain" : tags.bridge || tags.tunnel ? "bridge" : tags.place ? "city" : "tourist_attraction";
      const feature: GeographicFeature = {
        id: `${element.type}/${element.id}`,
        category,
        name: tags.name || (category === "river" ? "Waterway" : category === "mountain" ? "Mountain" : category === "city" ? "Nearby city" : "Point of interest"),
        latitude: point.lat,
        longitude: point.lon,
        distanceFromTrainKm: Math.round(distanceKm(lat, lng, point.lat, point.lon) * 10) / 10,
      };
      if (category === "river") output.rivers.push(feature);
      else if (category === "mountain") output.mountains.push(feature);
      else if (category === "bridge") output.bridgesAndTunnels.push(feature);
      else if (category === "city") output.cities.push(feature);
      else output.monumentsAndAttractions.push(feature);
    }
    return output;
  }
}
