import { TrainProvider } from "./types";
import { TrainSearchResult, Journey, LiveTrainStatus, JourneyStation, RunningStatus } from "@/types";

const RAILRADAR_BASE = "https://api.railradar.in/v1";

function rrHeaders(apiKey: string) {
  return {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };
}

/** Normalize a RailRadar live status response into our internal model */
function normalizeLiveStatus(rrData: RRLiveData): LiveTrainStatus {
  const trainNumber = rrData.trainNumber;
  const trainName = rrData.trainName || rrData.train?.name || trainNumber;

  // Determine running status
  let status: RunningStatus = "DATA_UNAVAILABLE";
  const rawStatus = (rrData.status || "").toLowerCase();
  if (rawStatus === "not-started" || rawStatus === "not_started") status = "NOT_STARTED";
  else if (rawStatus === "completed" || rawStatus === "departed-destination") status = "COMPLETED";
  else if (rawStatus === "running" || rawStatus === "in-transit") {
    status = rrData.delayMinutes > 0 ? "DELAYED" : "ON_TIME";
  } else if (rawStatus === "at-station" || rawStatus === "at_station") status = "AT_STATION";
  else if (rrData.isLive) {
    status = rrData.delayMinutes > 0 ? "DELAYED" : "ON_TIME";
  }

  // Current location
  const currentLoc = rrData.currentLocation;
  const currentStation = currentLoc
    ? {
        id: currentLoc.stationCode,
        code: currentLoc.stationCode,
        name: currentLoc.stationName || currentLoc.stationCode,
        latitude: currentLoc.lat ?? 0,
        longitude: currentLoc.lng ?? 0,
      }
    : undefined;

  const nextHalt = rrData.nextHalt;
  const nextStation = nextHalt
    ? {
        id: nextHalt.stationCode,
        code: nextHalt.stationCode,
        name: nextHalt.stationName || nextHalt.stationCode,
        latitude: 0,
        longitude: 0,
      }
    : undefined;

  // Derive position from route: find current station's lat/lng
  let posLat = currentLoc?.lat ?? rrData.train?.source?.lat ?? 0;
  let posLng = currentLoc?.lng ?? rrData.train?.source?.lng ?? 0;

  if (rrData.route && currentLoc) {
    const currentSeq = currentLoc.sequence || 1;
    const matchedStation = rrData.route.find((r) => r.sequence === currentSeq);
    if (matchedStation?.lat && matchedStation?.lng) {
      posLat = matchedStation.lat;
      posLng = matchedStation.lng;
    }
    // Also update currentStation coordinates
    if (currentStation && matchedStation?.lat != null && matchedStation.lng != null) {
      currentStation.latitude = matchedStation.lat;
      currentStation.longitude = matchedStation.lng;
    }
  }

  const totalDistance = rrData.train?.distance || 500;
  const coveredDistance =
    currentLoc?.distance || rrData.distanceCovered || 0;
  const remainingDistance = Math.max(0, totalDistance - coveredDistance);
  const completionPct = totalDistance > 0 ? Math.min(100, (coveredDistance / totalDistance) * 100) : 0;

  return {
    journeyId: `${trainNumber}-live`,
    train: {
      id: trainNumber,
      number: trainNumber,
      name: trainName,
      type: rrData.train?.type,
      origin: {
        id: rrData.train?.source?.code || "SRC",
        code: rrData.train?.source?.code || "SRC",
        name: rrData.train?.source?.name || "Origin",
        latitude: rrData.train?.source?.lat || 0,
        longitude: rrData.train?.source?.lng || 0,
      },
      destination: {
        id: rrData.train?.destination?.code || "DST",
        code: rrData.train?.destination?.code || "DST",
        name: rrData.train?.destination?.name || "Destination",
        latitude: rrData.train?.destination?.lat || 0,
        longitude: rrData.train?.destination?.lng || 0,
      },
      totalDistanceKm: totalDistance,
    },
    status,
    delayMinutes: rrData.delayMinutes || 0,
    position: { lat: posLat, lng: posLng },
    speedKmph: rrData.currentSpeed ?? rrData.avgSpeed ?? rrData.train?.avgSpeed,
    currentStation,
    nextStation,
    etaNextStation: rrData.nextHalt?.expectedArrival || rrData.nextHalt?.scheduledArrival || undefined,
    etaDestination: rrData.expectedDestinationArrival || undefined,
    distanceCoveredKm: coveredDistance,
    distanceRemainingKm: remainingDistance,
    completionPercentage: Math.round(completionPct * 10) / 10,
    updatedAt: rrData.lastUpdatedAt || new Date().toISOString(),
    isStale: false,
    statusMessage: buildStatusMessage(status, currentLoc?.stationName, rrData.delayMinutes),
  };
}

function buildStatusMessage(
  status: RunningStatus,
  stationName?: string,
  delay?: number
): string {
  if (status === "NOT_STARTED") return `Train has not departed yet`;
  if (status === "COMPLETED") return `Journey completed`;
  if (status === "AT_STATION") return `Currently at ${stationName || "station"}`;
  if (status === "DELAYED") return `Running ${delay} min late from ${stationName || "last station"}`;
  if (status === "ON_TIME") return `Running on time from ${stationName || "last station"}`;
  return stationName ? `Last reported at ${stationName}` : "Tracking active";
}

/** Build station list from RailRadar live route array */
function buildJourneyStations(rrRoute: RRRouteStop[]): JourneyStation[] {
  return rrRoute.map((r, idx) => {
    let stStatus: "PASSED" | "CURRENT" | "UPCOMING" = "UPCOMING";
    const rawStatus = (r.status || "").toLowerCase();
    if (rawStatus === "passed" || rawStatus === "departed") stStatus = "PASSED";
    else if (rawStatus === "at-station" || rawStatus === "at_station" || rawStatus === "arrived") stStatus = "CURRENT";
    else stStatus = "UPCOMING";

    return {
      station: {
        id: r.stationCode || r.station?.code || "---",
        code: r.stationCode || r.station?.code || "---",
        name: r.stationName || r.station?.name || r.stationCode || "Unknown station",
        latitude: r.lat ?? r.station?.lat ?? 0,
        longitude: r.lng ?? r.station?.lng ?? 0,
      },
      sequence: r.sequence || idx + 1,
      scheduledArrival: (r.scheduledArrival || r.arrival) ? formatTime(r.scheduledArrival || r.arrival || "") : undefined,
      actualArrival: r.actualArrival ? formatTime(r.actualArrival) : undefined,
      scheduledDeparture: (r.scheduledDeparture || r.departure) ? formatTime(r.scheduledDeparture || r.departure || "") : undefined,
      actualDeparture: r.actualDeparture ? formatTime(r.actualDeparture) : undefined,
      distanceFromOriginKm: r.distance || 0,
      platform: r.platform || undefined,
      haltMinutes: r.haltMinutes || (r.isHalt ? 2 : 0),
      status: stStatus,
      delayMinutes: r.delayMinutes || 0,
    };
  });
}

function formatTime(isoOrTime: string): string {
  if (!isoOrTime) return "";
  // If already HH:MM format
  if (/^\d{2}:\d{2}/.test(isoOrTime)) return isoOrTime.substring(0, 5);
  // Parse ISO
  try {
    const d = new Date(isoOrTime);
    return d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Kolkata",
    });
  } catch {
    return isoOrTime;
  }
}

// ─── RailRadar Response Shape Types ───────────────────────────────────────────
interface RRStation {
  code: string;
  name: string;
  lat: number;
  lng: number;
}

interface RRRouteStop {
  sequence: number;
  stationCode?: string;
  stationName?: string;
  station?: RRStation;
  isHalt: boolean;
  status?: string;
  lat?: number;
  lng?: number;
  distance?: number;
  platform?: string;
  haltMinutes?: number;
  scheduledArrival?: string;
  arrival?: string;
  actualArrival?: string;
  scheduledDeparture?: string;
  departure?: string;
  actualDeparture?: string;
  delayMinutes?: number;
}

interface RRCurrentLocation {
  stationCode: string;
  stationName?: string;
  sequence?: number;
  status?: string;
  distance?: number;
  delayMinutes?: number;
  lat?: number;
  lng?: number;
  isHalt?: boolean;
}

interface RRNextHalt {
  stationCode: string;
  stationName?: string;
  sequence?: number;
  distance?: number;
  scheduledArrival?: string;
  expectedArrival?: string;
}

interface RRLiveData {
  trainNumber: string;
  trainName?: string;
  status?: string;
  startDate?: string;
  lastUpdatedAt?: string;
  isLive?: boolean;
  trackingMode?: string;
  delayMinutes: number;
  distanceCovered?: number;
  currentSpeed?: number;
  avgSpeed?: number;
  expectedDestinationArrival?: string;
  currentLocation?: RRCurrentLocation;
  nextHalt?: RRNextHalt;
  route?: RRRouteStop[];
  train?: {
    number: string;
    name: string;
    type?: string;
    category?: string;
    source: RRStation;
    destination: RRStation;
    distance: number;
    duration?: number;
    avgSpeed?: number;
    maxSpeed?: number;
  };
}

// ─── Provider Implementation ────────────────────────────────────────────────
export class RailRadarProvider implements TrainProvider {
  name = "RailRadar";
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async searchTrains(query: string): Promise<TrainSearchResult[]> {
    const url = `${RAILRADAR_BASE}/lookup/search/trains?q=${encodeURIComponent(query)}&limit=10`;
    const res = await fetch(url, { headers: rrHeaders(this.apiKey) });

    if (!res.ok) {
      throw new Error(`RailRadar search failed: ${res.status}`);
    }
    const json = await res.json();
    if (!json.success || !Array.isArray(json.data)) return [];

    return json.data.map(
      (t: {
        number: string;
        name: string;
        type?: string;
        source?: string;
        sourceName?: string;
        dest?: string;
        destName?: string;
        popularity?: number;
      }) => ({
        id: t.number,
        number: t.number,
        name: t.name,
        type: t.type || "Express",
        origin: {
          code: t.source || "---",
          name: t.sourceName || t.source || "---",
        },
        destination: {
          code: t.dest || "---",
          name: t.destName || t.dest || "---",
        },
        totalDistanceKm: 0,
        departureTime: "--:--",
        arrivalTime: "--:--",
        runningDays: [],
      })
    );
  }

  async getJourney(trainNumber: string): Promise<Journey | null> {
    const cleanNumber = trainNumber.replace("-live", "").split("-")[0];
    const today = new Date().toISOString().split("T")[0];

    // Fetch train details + live status in parallel
    const [detailsRes, liveRes, routeGeoRes] = await Promise.allSettled([
      fetch(`${RAILRADAR_BASE}/trains/${cleanNumber}`, { headers: rrHeaders(this.apiKey) }),
      fetch(`${RAILRADAR_BASE}/trains/${cleanNumber}/live`, { headers: rrHeaders(this.apiKey) }),
      fetch(`${RAILRADAR_BASE}/trains/${cleanNumber}/route`, { headers: rrHeaders(this.apiKey) }),
    ]);

    let detailsData: { train: RRLiveData["train"]; route: RRRouteStop[] } | null = null;
    let liveData: RRLiveData | null = null;
    let geoJson: { type: string; geometry: { type: string; coordinates: [number, number][] } } | null = null;

    if (detailsRes.status === "fulfilled" && detailsRes.value.ok) {
      const j = await detailsRes.value.json();
      if (j.success) detailsData = j.data;
    }

    if (liveRes.status === "fulfilled" && liveRes.value.ok) {
      const j = await liveRes.value.json();
      if (j.success) liveData = j.data;
    }

    if (routeGeoRes.status === "fulfilled" && routeGeoRes.value.ok) {
      const j = await routeGeoRes.value.json();
      if (j.success && j.data?.geojson) {
        geoJson = j.data.geojson;
      }
    }

    if (!detailsData && !liveData) {
      return null;
    }

    // Use live data's route if available (richer status), else use details route
    const routeStops: RRRouteStop[] = (liveData?.route || detailsData?.route || []).map((r) => ({
      sequence: r.sequence,
      stationCode: r.stationCode || r.station?.code || "---",
      stationName: r.stationName || r.station?.name || r.stationCode || "Unknown station",
      isHalt: r.isHalt,
      status: r.status,
      lat: r.lat ?? r.station?.lat,
      lng: r.lng ?? r.station?.lng,
      distance: r.distance,
      platform: r.platform,
      scheduledArrival: r.scheduledArrival || r.arrival,
      actualArrival: r.actualArrival,
      scheduledDeparture: r.scheduledDeparture || r.departure,
      actualDeparture: r.actualDeparture,
      delayMinutes: r.delayMinutes,
      haltMinutes: r.haltMinutes,
    }));

    const trainInfo = liveData?.train || detailsData?.train;
    if (!trainInfo) return null;

    const trainName = liveData?.trainName || trainInfo.name || cleanNumber;
    const totalDistanceKm = trainInfo.distance || 0;

    // Build GeoJSON from real route geometry or fall back to station coordinates
    let routeCoordinates: [number, number][] = [];
    if (geoJson?.geometry?.coordinates?.length) {
      routeCoordinates = geoJson.geometry.coordinates;
    } else {
      routeCoordinates = routeStops
        .filter((r) => r.lat && r.lng)
        .map((r) => [r.lng!, r.lat!] as [number, number]);
    }

    const liveStatus = liveData
      ? normalizeLiveStatus(liveData)
      : {
          journeyId: `${cleanNumber}-live`,
          train: {
            id: cleanNumber,
            number: cleanNumber,
            name: trainName,
            origin: { id: trainInfo.source.code, code: trainInfo.source.code, name: trainInfo.source.name, latitude: trainInfo.source.lat, longitude: trainInfo.source.lng },
            destination: { id: trainInfo.destination.code, code: trainInfo.destination.code, name: trainInfo.destination.name, latitude: trainInfo.destination.lat, longitude: trainInfo.destination.lng },
            totalDistanceKm,
          },
          status: "DATA_UNAVAILABLE" as RunningStatus,
          delayMinutes: 0,
          position: { lat: trainInfo.source.lat, lng: trainInfo.source.lng },
          distanceCoveredKm: 0,
          distanceRemainingKm: totalDistanceKm,
          completionPercentage: 0,
          updatedAt: new Date().toISOString(),
          isStale: true,
        };

    // Enrich nextStation coordinates from route
    if (liveStatus.nextStation && routeStops.length) {
      const nextStop = routeStops.find((r) => r.stationCode === liveStatus.nextStation?.code);
      if (nextStop?.lat && nextStop?.lng) {
        liveStatus.nextStation.latitude = nextStop.lat;
        liveStatus.nextStation.longitude = nextStop.lng;
      }
    }

    const journey: Journey = {
      id: `${cleanNumber}-live`,
      train: {
        id: cleanNumber,
        number: cleanNumber,
        name: trainName,
        type: trainInfo.type,
        origin: {
          id: trainInfo.source.code,
          code: trainInfo.source.code,
          name: trainInfo.source.name,
          latitude: trainInfo.source.lat,
          longitude: trainInfo.source.lng,
        },
        destination: {
          id: trainInfo.destination.code,
          code: trainInfo.destination.code,
          name: trainInfo.destination.name,
          latitude: trainInfo.destination.lat,
          longitude: trainInfo.destination.lng,
        },
        totalDistanceKm,
        scheduledDurationHours: trainInfo.duration ? Math.round(trainInfo.duration / 60 * 10) / 10 : undefined,
      },
      serviceDate: today,
      origin: {
        id: trainInfo.source.code,
        code: trainInfo.source.code,
        name: trainInfo.source.name,
        latitude: trainInfo.source.lat,
        longitude: trainInfo.source.lng,
      },
      destination: {
        id: trainInfo.destination.code,
        code: trainInfo.destination.code,
        name: trainInfo.destination.name,
        latitude: trainInfo.destination.lat,
        longitude: trainInfo.destination.lng,
      },
      stations: buildJourneyStations(routeStops),
      route: {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: {
              trainNumber: cleanNumber,
              trainName,
              totalDistanceKm,
            },
            geometry: {
              type: "LineString",
              coordinates: routeCoordinates,
            },
          },
        ],
      },
      liveStatus,
    };

    return journey;
  }

  async getLiveStatus(trainNumber: string): Promise<LiveTrainStatus | null> {
    const cleanNumber = trainNumber.replace("-live", "").split("-")[0];
    const res = await fetch(`${RAILRADAR_BASE}/trains/${cleanNumber}/live`, {
      headers: rrHeaders(this.apiKey),
    });
    if (!res.ok) {
      // A train can have a valid timetable but no active GPS run today.  Return
      // that real route's unavailable status instead of treating it as unknown.
      const journey = await this.getJourney(cleanNumber);
      return journey?.liveStatus ?? null;
    }
    const json = await res.json();
    if (!json.success || !json.data) {
      const journey = await this.getJourney(cleanNumber);
      return journey?.liveStatus ?? null;
    }
    return normalizeLiveStatus(json.data);
  }
}
