"use client";

import React from "react";
import { Journey, LiveTrainStatus, ElevationData } from "@/types";
import { Card } from "@/components/ui/Card";
import { ElevationChart } from "./ElevationChart";
import { DelayTrendChart } from "./DelayTrendChart";
import {
  Gauge,
  MapPin,
  TrendingUp,
  Mountain,
} from "lucide-react";

interface AnalyticsDashboardProps {
  journey: Journey;
  liveStatus: LiveTrainStatus;
  elevation?: ElevationData | null;
}

export function AnalyticsDashboard({
  journey,
  liveStatus,
  elevation,
}: AnalyticsDashboardProps) {
  const passedCount = journey.stations.filter((s) => s.status === "PASSED").length;
  const totalStops = journey.stations.length;

  return (
    <div className="flex flex-col gap-5">
      {/* 4 Core Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-4 flex flex-col gap-1 border-slate-200/80">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Gauge className="h-3.5 w-3.5 text-blue-600" /> Avg Speed
          </div>
          <div className="font-mono text-xl font-bold text-slate-900 mt-1">
            {liveStatus.speedKmph ?? "—"} <span className="text-xs font-normal text-slate-400">km/h</span>
          </div>
          <div className="text-[11px] text-slate-400">Max permissible 130 km/h</div>
        </Card>

        <Card className="p-4 flex flex-col gap-1 border-slate-200/80">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <MapPin className="h-3.5 w-3.5 text-amber-500" /> Stops Done
          </div>
          <div className="font-mono text-xl font-bold text-slate-900 mt-1">
            {passedCount} / {totalStops}
          </div>
          <div className="text-[11px] text-slate-400">{totalStops - passedCount} upcoming stops</div>
        </Card>

        <Card className="p-4 flex flex-col gap-1 border-slate-200/80">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Clock className="h-3.5 w-3.5 text-indigo-500" /> Travel Time
          </div>
          <div className="font-mono text-xl font-bold text-slate-900 mt-1">
            {journey.train.scheduledDurationHours ?? "—"} <span className="text-xs font-normal text-slate-400">hrs</span>
          </div>
          <div className="text-[11px] text-slate-400">Scheduled Duration</div>
        </Card>

        <Card className="p-4 flex flex-col gap-1 border-slate-200/80">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <TrendingUp className="h-3.5 w-3.5 text-rose-500" /> Current Delay
          </div>
          <div className="font-mono text-xl font-bold text-slate-900 mt-1">
            {liveStatus.status === "DATA_UNAVAILABLE" ? "—" : `${liveStatus.delayMinutes > 0 ? "+" : ""}${liveStatus.delayMinutes}m`}
          </div>
          <div className="text-[11px] text-slate-400">
            {liveStatus.status === "DATA_UNAVAILABLE" ? "No active running report" : liveStatus.delayMinutes > 0 ? "Behind schedule" : "Running on schedule"}
          </div>
        </Card>
      </div>

      {/* Elevation Profile Chart Card */}
      <Card className="p-5 border-slate-200/90 shadow-subtle flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mountain className="h-4 w-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">Route Elevation Profile</h3>
          </div>
          <span className="text-xs text-slate-400">Based on route coordinates</span>
        </div>

        {elevation && elevation.profile.length >= 2 ? (
          <ElevationChart
            elevation={elevation}
            currentDistanceKm={liveStatus.distanceCoveredKm}
          />
        ) : (
          <div className="p-8 text-center text-xs text-slate-400">
            Elevation data unavailable for this route.
          </div>
        )}
      </Card>

      {/* Delay Trend Bar Chart Card */}
      <Card className="p-5 border-slate-200/90 shadow-subtle flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-rose-600" />
            <h3 className="text-sm font-bold text-slate-900">Station Delay History</h3>
          </div>
          <span className="text-xs text-slate-400">Minutes per stop</span>
        </div>

        <DelayTrendChart stations={journey.stations} />
      </Card>
    </div>
  );
}
