"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import maplibregl from "maplibre-gl";
import { Journey, LiveTrainStatus, NearbyGeography, RouteWeatherCheckpoint } from "@/types";
import { useMapStore } from "@/stores/useMapStore";
import { MapControls } from "./MapControls";
import { sliceRouteSegments, calculateRouteBoundingBox } from "@/lib/turf-utils";
import { Train, RefreshCw } from "lucide-react";

interface JourneyMapProps {
  journey: Journey;
  liveStatus: LiveTrainStatus;
  geography?: NearbyGeography | null;
  weatherCheckpoints?: RouteWeatherCheckpoint[] | null;
  className?: string;
}

export function JourneyMap({
  journey,
  liveStatus,
  geography,
  weatherCheckpoints,
  className,
}: JourneyMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const trainMarkerRef = useRef<maplibregl.Marker | null>(null);
  const stationMarkersRef = useRef<maplibregl.Marker[]>([]);
  const poiMarkersRef = useRef<maplibregl.Marker[]>([]);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const {
    followTrain,
    setFollowTrain,
    setIsMapLoaded,
    isFullscreen,
    setIsFullscreen,
    activeLayer,
  } = useMapStore();

  const routeCoords = journey.route.features[0]?.geometry?.coordinates || [];
  const hasMappableRoute = routeCoords.length >= 2 && routeCoords.every(
    ([lng, lat]) => Number.isFinite(lng) && Number.isFinite(lat)
  );

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || !hasMappableRoute) {
      setIsInitializing(false);
      return;
    }

    try {
      const mapTilerKey = process.env.NEXT_PUBLIC_MAPTILER_KEY;
      // High-performance dark vector style
      const mapStyle = mapTilerKey
        ? `https://api.maptiler.com/maps/dataviz-dark/style.json?key=${mapTilerKey}`
        : "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

      const bounds = calculateRouteBoundingBox(routeCoords);

      const map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: mapStyle,
        bounds: [
          [bounds[0], bounds[1]],
          [bounds[2], bounds[3]],
        ],
        fitBoundsOptions: { padding: 60, maxZoom: 12 },
        attributionControl: false,
        pitch: 28,
      });

      map.addControl(
        new maplibregl.AttributionControl({ compact: true }),
        "bottom-left"
      );

      map.on("load", () => {
        setIsInitializing(false);
        setIsMapLoaded(true);
        setupRouteLayers(map);
        renderStationMarkers(map);
      });

      map.on("dragstart", () => {
        // User interacted directly with map, disable follow mode silently
        setFollowTrain(false);
      });

      mapRef.current = map;

      return () => {
        map.remove();
        mapRef.current = null;
      };
    } catch (err) {
      console.error("Map initialization failed:", err);
      setMapError("Could not initialize 3D map renderer.");
      setIsInitializing(false);
    }
  }, [journey.id, hasMappableRoute]); // Re-init on journey change

  // Setup / Update Route Line Layers
  const setupRouteLayers = useCallback((map: maplibregl.Map) => {
    if (!map.isStyleLoaded()) return;

    const { completedCoordinates, remainingCoordinates } = sliceRouteSegments(
      routeCoords,
      liveStatus.completionPercentage
    );

    // 1. Completed Route Layer Source
    if (!map.getSource("completed-route")) {
      map.addSource("completed-route", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: completedCoordinates,
          },
        },
      });

      // Outer Glow
      map.addLayer({
        id: "completed-route-glow",
        type: "line",
        source: "completed-route",
        layout: { "line-join": "round", "line-cap": "round" },
        paint: {
          "line-color": "#3b82f6",
          "line-width": 8,
          "line-opacity": 0.35,
          "line-blur": 3,
        },
      });

      // Core Line
      map.addLayer({
        id: "completed-route-core",
        type: "line",
        source: "completed-route",
        layout: { "line-join": "round", "line-cap": "round" },
        paint: {
          "line-color": "#60a5fa",
          "line-width": 4,
          "line-opacity": 0.95,
        },
      });
    }

    // 2. Remaining Route Layer Source
    if (!map.getSource("remaining-route")) {
      map.addSource("remaining-route", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: remainingCoordinates,
          },
        },
      });

      map.addLayer({
        id: "remaining-route-line",
        type: "line",
        source: "remaining-route",
        layout: { "line-join": "round", "line-cap": "round" },
        paint: {
          "line-color": "#64748b",
          "line-width": 3,
          "line-dasharray": [2, 2],
          "line-opacity": 0.7,
        },
      });
    }
  }, [routeCoords, liveStatus.completionPercentage]);

  // Update dynamic route progress when live status changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    const { completedCoordinates, remainingCoordinates } = sliceRouteSegments(
      routeCoords,
      liveStatus.completionPercentage
    );

    const completedSource = map.getSource("completed-route") as maplibregl.GeoJSONSource;
    if (completedSource) {
      completedSource.setData({
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: completedCoordinates,
        },
      });
    }

    const remainingSource = map.getSource("remaining-route") as maplibregl.GeoJSONSource;
    if (remainingSource) {
      remainingSource.setData({
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: remainingCoordinates,
        },
      });
    }
  }, [liveStatus.completionPercentage, routeCoords]);

  // Update / Render Train Marker & Camera Follow
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const [trainLng, trainLat] = [liveStatus.position.lng, liveStatus.position.lat];

    if (!trainMarkerRef.current) {
      // Create Custom Animated Train Marker Element
      const el = document.createElement("div");
      el.className = "relative flex items-center justify-center cursor-pointer group";

      el.innerHTML = `
        <div class="relative flex items-center justify-center">
          <div class="absolute -inset-3 rounded-full bg-blue-500/30 animate-ping"></div>
          <div class="absolute -inset-2 rounded-full bg-blue-600/40 blur-sm"></div>
          <div class="relative flex items-center justify-center h-9 w-9 rounded-full bg-blue-600 text-white shadow-glow border-2 border-white">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        </div>
      `;

      // Click to center
      el.addEventListener("click", () => {
        map.flyTo({ center: [trainLng, trainLat], zoom: 12, speed: 1.2 });
        setFollowTrain(true);
      });

      trainMarkerRef.current = new maplibregl.Marker({ element: el, anchor: "center" })
        .setLngLat([trainLng, trainLat])
        .addTo(map);
    } else {
      trainMarkerRef.current.setLngLat([trainLng, trainLat]);
    }

    // Camera Follow Animation
    if (followTrain) {
      map.easeTo({
        center: [trainLng, trainLat],
        duration: 1200,
        pitch: 32,
      });
    }
  }, [liveStatus.position, followTrain, setFollowTrain]);

  // Render Station Markers
  const renderStationMarkers = useCallback((map: maplibregl.Map) => {
    // Clear existing
    stationMarkersRef.current.forEach((m) => m.remove());
    stationMarkersRef.current = [];

    journey.stations.forEach((st) => {
      const isOrigin = st.sequence === 1;
      const isDest = st.sequence === journey.stations.length;
      const isCurrent = st.status === "CURRENT";

      const el = document.createElement("div");
      el.className = "flex flex-col items-center group cursor-pointer";

      let markerBg = "bg-slate-700 text-slate-300 border-slate-500";
      let size = "h-3 w-3";

      if (isOrigin) {
        markerBg = "bg-emerald-500 text-white border-white";
        size = "h-4 w-4";
      } else if (isDest) {
        markerBg = "bg-rose-500 text-white border-white";
        size = "h-4 w-4";
      } else if (isCurrent) {
        markerBg = "bg-amber-500 text-white border-white animate-pulse";
        size = "h-3.5 w-3.5";
      }

      el.innerHTML = `
        <div class="relative flex items-center justify-center">
          ${isCurrent ? '<div class="absolute -inset-2 rounded-full bg-amber-400/40 animate-ping"></div>' : ""}
          <div class="${size} rounded-full ${markerBg} border-2 shadow-sm transition-transform group-hover:scale-125"></div>
        </div>
        <div class="mt-1 px-1.5 py-0.5 rounded bg-slate-950/80 backdrop-blur-md text-[10px] font-medium text-slate-300 border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-sm">
          ${st.station.name} (${st.station.code})
        </div>
      `;

      const marker = new maplibregl.Marker({ element: el, anchor: "top" })
        .setLngLat([st.station.longitude, st.station.latitude])
        .addTo(map);

      stationMarkersRef.current.push(marker);
    });
  }, [journey.stations]);

  // Render POI Markers when layer is active
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    poiMarkersRef.current.forEach((m) => m.remove());
    poiMarkersRef.current = [];

    if (activeLayer === "route") return;

    // Add Geographic POIs
    if (geography && (activeLayer === "all" || activeLayer === "poi")) {
      const allPois = [
        ...geography.rivers,
        ...geography.mountains,
        ...geography.bridgesAndTunnels,
        ...geography.monumentsAndAttractions,
      ];

      allPois.forEach((poi) => {
        const el = document.createElement("div");
        el.className = "flex flex-col items-center group cursor-pointer";
        el.innerHTML = `
          <div class="h-2.5 w-2.5 rounded-full bg-teal-400/80 border border-white shadow-sm transition-transform group-hover:scale-125"></div>
          <div class="mt-0.5 px-1.5 py-0.5 rounded bg-slate-900/90 text-[10px] font-medium text-teal-300 border border-teal-500/30 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-sm">
            ${poi.name}
          </div>
        `;

        const marker = new maplibregl.Marker({ element: el, anchor: "center" })
          .setLngLat([poi.longitude, poi.latitude])
          .addTo(map);

        poiMarkersRef.current.push(marker);
      });
    }

    // Add Weather Markers
    if (weatherCheckpoints && (activeLayer === "all" || activeLayer === "weather")) {
      weatherCheckpoints.forEach((chk) => {
        const el = document.createElement("div");
        el.className = "flex flex-col items-center group cursor-pointer";
        el.innerHTML = `
          <div class="px-1.5 py-0.5 rounded-full bg-slate-900/90 backdrop-blur-md text-[10px] font-medium text-amber-300 border border-amber-500/30 shadow-sm flex items-center gap-1">
            <span>${chk.weather.temperature}°</span>
          </div>
        `;

        const marker = new maplibregl.Marker({ element: el, anchor: "bottom" })
          .setLngLat([chk.coordinates.lng, chk.coordinates.lat])
          .addTo(map);

        poiMarkersRef.current.push(marker);
      });
    }
  }, [geography, weatherCheckpoints, activeLayer]);

  // Controls Callbacks
  const handleRecenter = () => {
    const map = mapRef.current;
    if (!map) return;
    map.flyTo({
      center: [liveStatus.position.lng, liveStatus.position.lat],
      zoom: 11.5,
      pitch: 35,
      speed: 1.2,
    });
    setFollowTrain(true);
  };

  const handleZoomIn = () => mapRef.current?.zoomIn();
  const handleZoomOut = () => mapRef.current?.zoomOut();
  const handleResetBearing = () => mapRef.current?.resetNorthPitch();

  const handleToggleFullscreen = () => {
    const nextVal = !isFullscreen;
    setIsFullscreen(nextVal);
    setTimeout(() => mapRef.current?.resize(), 200);
  };

  return (
    <div
      className={`relative w-full overflow-hidden bg-slate-950 transition-all duration-300 ${
        isFullscreen ? "fixed inset-0 z-50 h-screen w-screen" : className || "h-[45vh] sm:h-[55vh] md:h-[60vh] rounded-3xl"
      }`}
    >
      {/* MapLibre DOM Target */}
      {hasMappableRoute && <div ref={mapContainerRef} className="h-full w-full" />}

      {/* Loading Overlay */}
      {isInitializing && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950 text-slate-300 gap-3">
          <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
          <span className="text-xs font-medium tracking-wide text-slate-400">
            Rendering India Railway Geography...
          </span>
        </div>
      )}

      {/* Map Error / unavailable-route fallback */}
      {(mapError || !hasMappableRoute) && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950 p-6 text-center text-slate-300">
          <Train className="h-10 w-10 text-slate-500 mb-2" />
          <h4 className="text-base font-semibold text-white">{mapError ? "Map unavailable" : "Route map unavailable"}</h4>
          <p className="text-xs text-slate-400 max-w-sm mt-1">
            {mapError || "The train API did not provide enough route coordinates to draw a map."} Your live journey tracking and station timelines remain fully functional below.
          </p>
        </div>
      )}

      {/* Map Controls HUD */}
      {!isInitializing && !mapError && hasMappableRoute && (
        <MapControls
          onRecenter={handleRecenter}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onResetBearing={handleResetBearing}
          onToggleFullscreen={handleToggleFullscreen}
        />
      )}

      {/* Live Badge Bottom Left Overlay */}
      <div className="absolute bottom-4 left-4 z-20 pointer-events-none">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/80 backdrop-blur-xl border border-white/10 text-slate-200 shadow-elevated">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-mono font-medium tracking-wide">
            {liveStatus.speedKmph != null ? `${liveStatus.speedKmph} KM/H` : "SPEED UNAVAILABLE"}
          </span>
        </div>
      </div>
    </div>
  );
}
