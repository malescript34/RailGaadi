import * as turf from "@turf/turf";
import type { Coordinates, Station, JourneyStation } from "../types/index.ts";

/**
 * Calculates total route distance in kilometers from coordinate array
 */
export function calculateTotalDistanceKm(coordinates: [number, number][]): number {
  if (!coordinates || coordinates.length < 2) return 0;
  const line = turf.lineString(coordinates);
  return Math.round(turf.length(line, { units: "kilometers" }) * 10) / 10;
}

/**
 * Calculates bounding box [minLng, minLat, maxLng, maxLat] from coordinates
 */
export function calculateRouteBoundingBox(coordinates: [number, number][]): [number, number, number, number] {
  if (!coordinates || coordinates.length === 0) {
    return [68.1, 8.0, 97.4, 37.1]; // Default India bounding box
  }
  const line = turf.lineString(coordinates);
  return turf.bbox(line) as [number, number, number, number];
}

/**
 * Snaps a train coordinate to the closest point along the route
 */
export function snapCoordinateToRoute(
  pos: Coordinates,
  routeCoordinates: [number, number][]
): { snappedPosition: Coordinates; distanceAlongRouteKm: number } {
  if (!routeCoordinates || routeCoordinates.length < 2) {
    return { snappedPosition: pos, distanceAlongRouteKm: 0 };
  }

  const line = turf.lineString(routeCoordinates);
  const point = turf.point([pos.lng, pos.lat]);
  const snapped = turf.nearestPointOnLine(line, point, { units: "kilometers" });

  const distanceAlong = snapped.properties?.location ?? 0;

  return {
    snappedPosition: {
      lng: snapped.geometry.coordinates[0],
      lat: snapped.geometry.coordinates[1],
    },
    distanceAlongRouteKm: Math.round(distanceAlong * 10) / 10,
  };
}

/**
 * Finds the nearest station to given coordinates
 */
export function findNearestStation(
  pos: Coordinates,
  stations: (Station | JourneyStation)[]
): { station: Station | JourneyStation; distanceKm: number } | null {
  if (!stations || stations.length === 0) return null;

  let nearest: Station | JourneyStation = stations[0];
  let minDistance = Infinity;

  const currentPoint = turf.point([pos.lng, pos.lat]);

  for (const st of stations) {
    const target = "station" in st ? st.station : st;
    const stPoint = turf.point([target.longitude, target.latitude]);
    const d = turf.distance(currentPoint, stPoint, { units: "kilometers" });
    if (d < minDistance) {
      minDistance = d;
      nearest = st;
    }
  }

  return {
    station: nearest,
    distanceKm: Math.round(minDistance * 10) / 10,
  };
}

/**
 * Slices route LineString into completed and remaining segments based on current progress
 */
export function sliceRouteSegments(
  routeCoordinates: [number, number][],
  progressPercentage: number
): {
  completedCoordinates: [number, number][];
  remainingCoordinates: [number, number][];
  currentCoord: [number, number];
} {
  if (!routeCoordinates || routeCoordinates.length < 2) {
    return {
      completedCoordinates: [],
      remainingCoordinates: [],
      currentCoord: [77.2, 28.6],
    };
  }

  const line = turf.lineString(routeCoordinates);
  const totalLength = turf.length(line, { units: "kilometers" });
  const clampedProgress = Math.max(0, Math.min(100, progressPercentage));
  const targetDistance = (clampedProgress / 100) * totalLength;

  if (targetDistance <= 0.05) {
    return {
      completedCoordinates: [routeCoordinates[0]],
      remainingCoordinates: routeCoordinates,
      currentCoord: routeCoordinates[0],
    };
  }

  if (targetDistance >= totalLength - 0.05) {
    return {
      completedCoordinates: routeCoordinates,
      remainingCoordinates: [routeCoordinates[routeCoordinates.length - 1]],
      currentCoord: routeCoordinates[routeCoordinates.length - 1],
    };
  }

  try {
    const pointAlong = turf.along(line, targetDistance, { units: "kilometers" });
    const currentPoint: [number, number] = [
      pointAlong.geometry.coordinates[0],
      pointAlong.geometry.coordinates[1],
    ];

    const slicedCompleted = turf.lineSliceAlong(line, 0, targetDistance, { units: "kilometers" });
    const slicedRemaining = turf.lineSliceAlong(line, targetDistance, totalLength, { units: "kilometers" });

    return {
      completedCoordinates: slicedCompleted.geometry.coordinates as [number, number][],
      remainingCoordinates: slicedRemaining.geometry.coordinates as [number, number][],
      currentCoord: currentPoint,
    };
  } catch {
    // Fallback if slicing fails on degenerate lines
    const midIdx = Math.floor((clampedProgress / 100) * (routeCoordinates.length - 1));
    return {
      completedCoordinates: routeCoordinates.slice(0, midIdx + 1),
      remainingCoordinates: routeCoordinates.slice(midIdx),
      currentCoord: routeCoordinates[midIdx] || routeCoordinates[0],
    };
  }
}
