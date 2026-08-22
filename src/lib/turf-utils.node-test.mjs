import test from "node:test";
import assert from "node:assert";
import {
  calculateTotalDistanceKm,
  calculateRouteBoundingBox,
  findNearestStation,
  sliceRouteSegments,
} from "./turf-utils.ts";

test("turf-utils geometry verification", async (t) => {
  const sampleCoordinates = [
    [76.6496, 12.3168], // Mysuru
    [76.8958, 12.5244], // Mandya
    [77.5713, 12.9778], // Bengaluru SBC
    [79.1367, 12.9698], // Katpadi Jn
    [80.2707, 13.0827], // Chennai Central
  ];

  await t.test("calculateTotalDistanceKm", () => {
    const dist = calculateTotalDistanceKm(sampleCoordinates);
    assert.ok(dist > 400, "Distance should be > 400km");
  });

  await t.test("calculateRouteBoundingBox", () => {
    const [minLng, minLat, maxLng, maxLat] = calculateRouteBoundingBox(sampleCoordinates);
    assert.ok(minLng <= 76.65);
    assert.ok(maxLng >= 80.27);
    assert.ok(minLat < maxLat);
  });

  await t.test("findNearestStation", () => {
    const stations = [
      { id: "MYS", code: "MYS", name: "Mysuru", latitude: 12.3168, longitude: 76.6496 },
      { id: "SBC", code: "SBC", name: "Bengaluru", latitude: 12.9778, longitude: 77.5713 },
      { id: "MAS", code: "MAS", name: "Chennai", latitude: 13.0827, longitude: 80.2707 },
    ];

    const nearest = findNearestStation({ lat: 12.98, lng: 77.58 }, stations);
    assert.ok(nearest !== null);
    assert.strictEqual(nearest.station.code, "SBC");
    assert.ok(nearest.distanceKm < 5);
  });

  await t.test("sliceRouteSegments", () => {
    const { completedCoordinates, remainingCoordinates, currentCoord } = sliceRouteSegments(
      sampleCoordinates,
      50
    );

    assert.ok(completedCoordinates.length > 0);
    assert.ok(remainingCoordinates.length > 0);
    assert.ok(Array.isArray(currentCoord));
  });
});
