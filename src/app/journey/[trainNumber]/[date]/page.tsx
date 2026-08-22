"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Journey,
  LiveTrainStatus,
  ElevationData,
  NearbyGeography,
  RouteWeatherCheckpoint,
  Weather,
} from "@/types";
import { JourneyHeader } from "@/features/journey/JourneyHeader";
import { JourneyMap } from "@/features/map/JourneyMap";
import { JourneyStatusCard } from "@/features/journey/JourneyStatusCard";
import { StationTimeline } from "@/features/journey/StationTimeline";
import { AnalyticsDashboard } from "@/features/analytics/AnalyticsDashboard";
import { WeatherOverview } from "@/features/weather/WeatherOverview";
import { NearbyGeographySection } from "@/features/geography/NearbyGeographySection";
import { ShareModal } from "@/features/journey/ShareModal";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import {
  Radio,
  ListOrdered,
  BarChart3,
  Compass,
  AlertTriangle,
  RefreshCw,
  Share2,
  Train,
} from "lucide-react";
import Link from "next/link";

export default function SharedJourneyPage() {
  const params = useParams();
  const router = useRouter();
  const trainNumber = String(params?.trainNumber || "").trim();
  const date = String(params?.date || "").trim();

  const [activeTab, setActiveTab] = useState<"live" | "timeline" | "analytics" | "companion">("live");
  const [isShareOpen, setIsShareOpen] = useState(false);

  // 1. Fetch Journey Route
  const {
    data: routeData,
    isLoading: isRouteLoading,
    isError: isRouteError,
    refetch: refetchRoute,
  } = useQuery<{ data: Journey }>({
    queryKey: ["sharedJourneyRoute", trainNumber, date],
    queryFn: async () => {
      const res = await fetch(`/api/v1/journeys/${trainNumber}/route`);
      if (!res.ok) throw new Error("Failed to load route");
      return res.json();
    },
    staleTime: 1000 * 60 * 60,
  });

  // 2. Fetch Live Status (Auto-refresh every 30s)
  const {
    data: liveData,
    isLoading: isLiveLoading,
    isRefetching: isLiveRefetching,
    refetch: refetchLive,
  } = useQuery<{ data: LiveTrainStatus }>({
    queryKey: ["sharedJourneyLive", trainNumber, date],
    queryFn: async () => {
      const res = await fetch(`/api/v1/journeys/${trainNumber}/live`);
      if (!res.ok) throw new Error("Failed to load live status");
      return res.json();
    },
    refetchInterval: 30000,
    staleTime: 10000,
  });

  // 3. Fetch Elevation Data
  const { data: elevationData } = useQuery<{ data: ElevationData }>({
    queryKey: ["sharedJourneyElevation", trainNumber],
    queryFn: async () => {
      const res = await fetch(`/api/v1/journeys/${trainNumber}/elevation`);
      if (!res.ok) return { data: null as unknown as ElevationData };
      return res.json();
    },
    staleTime: 1000 * 60 * 60,
  });

  // 4. Fetch Weather Data
  const { data: weatherData } = useQuery<{
    data: {
      currentStation: Weather;
      nextStation: Weather;
      destination: Weather;
      checkpoints: RouteWeatherCheckpoint[];
    };
  }>({
    queryKey: ["sharedJourneyWeather", trainNumber],
    queryFn: async () => {
      const res = await fetch(`/api/v1/journeys/${trainNumber}/weather`);
      if (!res.ok) return { data: null as unknown as { currentStation: Weather; nextStation: Weather; destination: Weather; checkpoints: RouteWeatherCheckpoint[] } };
      return res.json();
    },
    staleTime: 1000 * 60 * 15,
  });

  // 5. Fetch Geography Context
  const { data: geographyData } = useQuery<{ data: NearbyGeography }>({
    queryKey: ["sharedJourneyGeography", trainNumber],
    queryFn: async () => {
      const res = await fetch(`/api/v1/journeys/${trainNumber}/nearby`);
      if (!res.ok) return { data: null as unknown as NearbyGeography };
      return res.json();
    },
    staleTime: 1000 * 60 * 60,
  });

  if (isRouteLoading || isLiveLoading) {
    return (
      <div className="flex-1 flex flex-col p-4 sm:p-6 max-w-5xl mx-auto w-full gap-6">
        <Skeleton className="h-16 w-full rounded-2xl" />
        <Skeleton className="h-[45vh] w-full rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (isRouteError || !routeData?.data || !liveData?.data) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 mb-3">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Shared Journey Not Found</h2>
        <p className="text-sm text-slate-500 max-w-sm mt-1">
          This shared link may have expired or is unavailable.
        </p>
        <div className="flex gap-3 mt-5">
          <Button variant="secondary" onClick={() => router.push("/")}>
            Go to RailGaadi Home
          </Button>
          <Button variant="primary" onClick={() => refetchRoute()}>
            <RefreshCw className="h-4 w-4 mr-1.5" /> Retry
          </Button>
        </div>
      </div>
    );
  }

  const journey = routeData.data;
  const liveStatus = liveData.data;
  const elevation = elevationData?.data || null;
  const weather = weatherData?.data || null;
  const geography = geographyData?.data || null;

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen">
      {/* Shared Journey Banner */}
      <div className="bg-slate-900 text-white px-4 py-2.5 text-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Share2 className="h-3.5 w-3.5 text-blue-400" />
          <span>
            You are viewing a shared live journey for <strong>{journey.train.name}</strong> ({date})
          </span>
        </div>
        <Link
          href="/"
          className="font-semibold text-blue-400 hover:text-blue-300 underline underline-offset-2 flex items-center gap-1"
        >
          Track another train <Train className="h-3 w-3" />
        </Link>
      </div>

      {/* Sticky Header */}
      <JourneyHeader
        journey={journey}
        liveStatus={liveStatus}
        onOpenShare={() => setIsShareOpen(true)}
      />

      {/* Main Responsive Grid */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-3 sm:p-6 flex flex-col gap-6">
        {/* 3D Map */}
        <JourneyMap
          journey={journey}
          liveStatus={liveStatus}
          geography={geography}
          weatherCheckpoints={weather?.checkpoints}
        />

        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white border border-slate-200/90 shadow-subtle overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab("live")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm whitespace-nowrap transition-all ${
              activeTab === "live"
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Radio className="h-4 w-4 text-emerald-400" />
            <span>Live Status</span>
          </button>

          <button
            onClick={() => setActiveTab("timeline")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm whitespace-nowrap transition-all ${
              activeTab === "timeline"
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <ListOrdered className="h-4 w-4 text-blue-400" />
            <span>Station Timeline</span>
          </button>

          <button
            onClick={() => setActiveTab("analytics")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm whitespace-nowrap transition-all ${
              activeTab === "analytics"
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <BarChart3 className="h-4 w-4 text-indigo-400" />
            <span>Analytics & Elevation</span>
          </button>

          <button
            onClick={() => setActiveTab("companion")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm whitespace-nowrap transition-all ${
              activeTab === "companion"
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Compass className="h-4 w-4 text-amber-400" />
            <span>Travel Companion</span>
          </button>
        </div>

        {/* Tab Content Panes */}
        <div className="flex flex-col gap-6 pb-12">
          {activeTab === "live" && (
            <div className="flex flex-col gap-6">
              <JourneyStatusCard
                journey={journey}
                liveStatus={liveStatus}
                onRefresh={() => refetchLive()}
                isRefreshing={isLiveRefetching}
              />
              <StationTimeline stations={journey.stations} />
            </div>
          )}

          {activeTab === "timeline" && (
            <StationTimeline stations={journey.stations} />
          )}

          {activeTab === "analytics" && (
            <AnalyticsDashboard
              journey={journey}
              liveStatus={liveStatus}
              elevation={elevation}
            />
          )}

          {activeTab === "companion" && (
            <div className="flex flex-col gap-6">
              <WeatherOverview weatherData={weather} />
              <NearbyGeographySection geography={geography} />
            </div>
          )}
        </div>
      </main>

      {/* Share Modal Dialog */}
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        journey={journey}
        liveStatus={liveStatus}
      />
    </div>
  );
}
