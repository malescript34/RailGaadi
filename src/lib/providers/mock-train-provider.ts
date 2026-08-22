import { TrainProvider } from "./types";
import { TrainSearchResult, Journey, LiveTrainStatus } from "@/types";
import {
  MOCK_TRAINS,
  MOCK_JOURNEY_20608,
  MOCK_JOURNEY_12951,
} from "./mock-data";
import { sliceRouteSegments } from "../turf-utils";

export class MockTrainProvider implements TrainProvider {
  name = "MockRailSimulator";

  async searchTrains(query: string): Promise<TrainSearchResult[]> {
    // Simulate realistic network delay (120ms)
    await new Promise((res) => setTimeout(res, 120));

    const q = query.trim().toLowerCase();
    if (!q) return [];

    return MOCK_TRAINS.filter(
      (t) =>
        t.number.toLowerCase().includes(q) ||
        t.name.toLowerCase().includes(q) ||
        t.origin.name.toLowerCase().includes(q) ||
        t.origin.code.toLowerCase().includes(q) ||
        t.destination.name.toLowerCase().includes(q) ||
        t.destination.code.toLowerCase().includes(q)
    );
  }

  async getJourney(journeyId: string): Promise<Journey | null> {
    await new Promise((res) => setTimeout(res, 150));

    const cleanId = journeyId.replace("-live", "");
    let journey: Journey | null = null;

    if (cleanId.includes("20608")) {
      journey = JSON.parse(JSON.stringify(MOCK_JOURNEY_20608));
    } else if (cleanId.includes("12951")) {
      journey = JSON.parse(JSON.stringify(MOCK_JOURNEY_12951));
    } else {
      // Find train in mock list and generate a journey
      const train = MOCK_TRAINS.find((t) => t.number === cleanId);
      if (train) {
        journey = this.synthesizeJourney(train);
      } else {
        // Default to Vande Bharat
        journey = JSON.parse(JSON.stringify(MOCK_JOURNEY_20608));
      }
    }

    if (journey) {
      // Calculate dynamic simulated live progression based on clock
      const dynamicStatus = this.computeDynamicLiveStatus(journey);
      journey.liveStatus = dynamicStatus;
    }

    return journey;
  }

  async getLiveStatus(journeyId: string): Promise<LiveTrainStatus | null> {
    const journey = await this.getJourney(journeyId);
    return journey ? journey.liveStatus : null;
  }

  private computeDynamicLiveStatus(journey: Journey): LiveTrainStatus {
    const routeCoords = journey.route.features[0].geometry.coordinates;
    const baseStatus = journey.liveStatus;

    // Add subtle real-time simulation based on current second
    const now = new Date();
    const cycleSecond = (now.getMinutes() * 60 + now.getSeconds()) % 300; // 5 min cycle
    const progressOffset = (cycleSecond / 300) * 1.5; // up to +1.5%

    const currentPercent = Math.min(
      99,
      Math.max(1, baseStatus.completionPercentage + progressOffset)
    );

    const { currentCoord } = sliceRouteSegments(routeCoords, currentPercent);

    const distanceCovered = Math.round(
      (currentPercent / 100) * journey.train.totalDistanceKm
    );
    const distanceRemaining = Math.max(
      0,
      journey.train.totalDistanceKm - distanceCovered
    );

    // Micro speed variations (108 - 128 km/h)
    const dynamicSpeed = 110 + (cycleSecond % 18);

    return {
      ...baseStatus,
      position: {
        lng: Math.round(currentCoord[0] * 10000) / 10000,
        lat: Math.round(currentCoord[1] * 10000) / 10000,
      },
      speedKmph: dynamicSpeed,
      completionPercentage: Math.round(currentPercent * 10) / 10,
      distanceCoveredKm: distanceCovered,
      distanceRemainingKm: distanceRemaining,
      updatedAt: now.toISOString(),
      isStale: false,
    };
  }

  private synthesizeJourney(train: TrainSearchResult): Journey {
    const originCoords: [number, number] = [77.209, 28.6139]; // Default NDLS
    const destCoords: [number, number] = [82.9739, 25.3176];   // Default BSB

    const routeCoordinates: [number, number][] = [
      originCoords,
      [78.5, 27.8],
      [80.33, 26.45],
      [81.84, 25.43],
      destCoords,
    ];

    return {
      id: `${train.number}-live`,
      train: {
        id: train.id,
        number: train.number,
        name: train.name,
        type: train.type,
        origin: {
          id: train.origin.code,
          code: train.origin.code,
          name: train.origin.name,
          latitude: originCoords[1],
          longitude: originCoords[0],
        },
        destination: {
          id: train.destination.code,
          code: train.destination.code,
          name: train.destination.name,
          latitude: destCoords[1],
          longitude: destCoords[0],
        },
        totalDistanceKm: train.totalDistanceKm,
        scheduledDurationHours: 8,
      },
      serviceDate: "2026-08-18",
      origin: {
        id: train.origin.code,
        code: train.origin.code,
        name: train.origin.name,
        latitude: originCoords[1],
        longitude: originCoords[0],
      },
      destination: {
        id: train.destination.code,
        code: train.destination.code,
        name: train.destination.name,
        latitude: destCoords[1],
        longitude: destCoords[0],
      },
      stations: [
        {
          station: {
            id: train.origin.code,
            code: train.origin.code,
            name: train.origin.name,
            latitude: originCoords[1],
            longitude: originCoords[0],
          },
          sequence: 1,
          scheduledDeparture: train.departureTime,
          actualDeparture: train.departureTime,
          distanceFromOriginKm: 0,
          status: "PASSED",
          delayMinutes: 0,
        },
        {
          station: {
            id: "CNB",
            code: "CNB",
            name: "Kanpur Central",
            latitude: 26.4547,
            longitude: 80.3507,
          },
          sequence: 2,
          scheduledArrival: "10:10",
          actualArrival: "10:12",
          scheduledDeparture: "10:15",
          actualDeparture: "10:17",
          distanceFromOriginKm: Math.round(train.totalDistanceKm * 0.55),
          status: "CURRENT",
          delayMinutes: 2,
        },
        {
          station: {
            id: train.destination.code,
            code: train.destination.code,
            name: train.destination.name,
            latitude: destCoords[1],
            longitude: destCoords[0],
          },
          sequence: 3,
          scheduledArrival: train.arrivalTime,
          actualArrival: train.arrivalTime,
          distanceFromOriginKm: train.totalDistanceKm,
          status: "UPCOMING",
          delayMinutes: 0,
        },
      ],
      route: {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: {
              trainNumber: train.number,
              trainName: train.name,
              totalDistanceKm: train.totalDistanceKm,
            },
            geometry: {
              type: "LineString",
              coordinates: routeCoordinates,
            },
          },
        ],
      },
      liveStatus: {
        journeyId: `${train.number}-live`,
        train: {
          id: train.id,
          number: train.number,
          name: train.name,
          origin: {
            id: train.origin.code,
            code: train.origin.code,
            name: train.origin.name,
            latitude: originCoords[1],
            longitude: originCoords[0],
          },
          destination: {
            id: train.destination.code,
            code: train.destination.code,
            name: train.destination.name,
            latitude: destCoords[1],
            longitude: destCoords[0],
          },
          totalDistanceKm: train.totalDistanceKm,
        },
        status: "ON_TIME",
        delayMinutes: 2,
        position: {
          lat: 26.45,
          lng: 80.35,
        },
        speedKmph: 120,
        currentStation: {
          id: "CNB",
          code: "CNB",
          name: "Kanpur Central",
          latitude: 26.4547,
          longitude: 80.3507,
        },
        nextStation: {
          id: train.destination.code,
          code: train.destination.code,
          name: train.destination.name,
          latitude: destCoords[1],
          longitude: destCoords[0],
        },
        etaNextStation: train.arrivalTime,
        etaDestination: train.arrivalTime,
        distanceCoveredKm: Math.round(train.totalDistanceKm * 0.55),
        distanceRemainingKm: Math.round(train.totalDistanceKm * 0.45),
        completionPercentage: 55.0,
        updatedAt: new Date().toISOString(),
        isStale: false,
        statusMessage: `Departed ${train.origin.name} • On Time`,
      },
    };
  }
}
