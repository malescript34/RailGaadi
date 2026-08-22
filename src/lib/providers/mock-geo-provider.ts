import { GeoProvider } from "./types";
import { NearbyGeography } from "@/types";
import { MOCK_GEOGRAPHY_20608 } from "./mock-data";

export class MockGeoProvider implements GeoProvider {
  name = "MockOverpassGeo";

  async getNearbyFeatures(
    lat: number,
    lng: number,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _radiusKm?: number
  ): Promise<NearbyGeography> {
    await new Promise((res) => setTimeout(res, 90));

    // If near Katpadi/South corridor
    if (lat > 11 && lat < 14 && lng > 76 && lng < 81) {
      return MOCK_GEOGRAPHY_20608;
    }

    // Generic Indian railway geographic landmarks
    return {
      rivers: [
        {
          id: "riv-gen-1",
          category: "river",
          name: "Yamuna / Chambal River Tributary",
          description: "Major northern river corridor crossed by high railway bridge",
          latitude: lat + 0.04,
          longitude: lng + 0.02,
          distanceFromTrainKm: 6.2,
        },
      ],
      mountains: [
        {
          id: "mnt-gen-1",
          category: "mountain",
          name: "Vindhya Range Escarpment",
          description: "Ancient sandstone plateau ridges framing the railway line",
          latitude: lat - 0.08,
          longitude: lng + 0.06,
          distanceFromTrainKm: 14.5,
          elevationMeters: 650,
        },
      ],
      bridgesAndTunnels: [
        {
          id: "brg-gen-1",
          category: "bridge",
          name: "Indian Railways Prestressed Concrete Viaduct",
          description: "High-speed rail corridor viaduct crossing natural ravines",
          latitude: lat + 0.01,
          longitude: lng + 0.01,
          distanceFromTrainKm: 1.8,
        },
      ],
      monumentsAndAttractions: [
        {
          id: "mon-gen-1",
          category: "monument",
          name: "Historic Heritage Fort & Stepwell",
          description: "Medieval trade route architecture preserved along the line",
          latitude: lat + 0.05,
          longitude: lng - 0.03,
          distanceFromTrainKm: 8.9,
        },
      ],
      cities: [
        {
          id: "cty-gen-1",
          category: "city",
          name: "Regional District Headquarters",
          description: "Commercial and agricultural trading hub",
          latitude: lat - 0.02,
          longitude: lng + 0.03,
          distanceFromTrainKm: 7.4,
        },
      ],
    };
  }
}
