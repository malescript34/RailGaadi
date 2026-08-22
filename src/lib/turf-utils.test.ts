import {
  calculateTotalDistanceKm,
  calculateRouteBoundingBox,
  snapCoordinateToRoute,
  findNearestStation,
  sliceRouteSegments,
} from "./turf-utils";

describe("turf-utils", () => {
  const sampleCoordinates: [number, number][] = [
    [76.6496, 12.3168], // Mysuru
    [76.8958, 12.5244], // Mandya
    [77.5713, 12.9778], // Bengaluru SBC
    [79.1367, 12.9698], // Katpadi Jn
    [80.2707, 13.0827], // Chennai Central
  ];

  test("calculateTotalDistanceKm returns positive distance for route", () => {
    const dist = calculateTotalDistanceKm(sampleCoordinates);
    expect(dist).toBeGreaterThan(400);
  });

  test("calculateRouteBoundingBox calculates valid bounds", () => {
    const [minLng, minLat, maxLng, maxLat] = calculateRouteBoundingBox(sampleCoordinates);
    expect(minLng).toBeCloseTo(76.6496, 2);
    expect(maxLng).toBeCloseTo(80.2707, 2);
    expect(minLat).toBeLessThan(maxLat);
  });

  test("findNearestStation returns nearest station correctly", () => {
    const stations = [
      { id: "MYS", code: "MYS", name: "Mysuru", latitude: 12.3168, longitude: 76.6496 },
      { id: "SBC", code: "SBC", name: "Bengaluru", latitude: 12.9778, longitude: 77.5713 },
      { id: "MAS", code: "MAS", name: "Chennai", latitude: 13.0827, longitude: 80.2707 },
    ];

    const nearest = findNearestStation({ lat: 12.98, lng: 77.58 }, stations);
    expect(nearest).not.toBeNull();
    expect((nearest?.station as { code: string }).code).toBe("SBC");
    expect(nearest?.distanceKm).toBeLessThan(5);
  });

  test("sliceRouteSegments splits completed and remaining tracks", () => {
    const { completedCoordinates, remainingCoordinates, currentCoord } = sliceRouteSegments(
      sampleCoordinates,
      50
    );

    expect(completedCoordinates.length).toBeGreaterThan(0);
    expect(remainingCoordinates.length).toBeGreaterThan(0);
    expect(currentCoord).toBeDefined();
  });
});
