"use client";

import React, { useState, useEffect } from "react";
import { Journey, LiveTrainStatus } from "@/types";
import { Card } from "@/components/ui/Card";
import { JourneyProgress } from "./JourneyProgress";
import {
  MapPin,
  Compass,
  Zap,
  Clock,
  Gauge,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

interface JourneyStatusCardProps {
  journey: Journey;
  liveStatus: LiveTrainStatus;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export function JourneyStatusCard({
  journey,
  liveStatus,
  onRefresh,
  isRefreshing = false,
}: JourneyStatusCardProps) {
  const [timeAgo, setTimeAgo] = useState("Just now");

  useEffect(() => {
    const updateTimeAgo = () => {
      if (!liveStatus.updatedAt) return;
      const diffMs = Date.now() - new Date(liveStatus.updatedAt).getTime();
      const diffSec = Math.floor(diffMs / 1000);

      if (diffSec < 10) {
        setTimeAgo("Just now");
      } else if (diffSec < 60) {
        setTimeAgo(`${diffSec} seconds ago`);
      } else {
        const mins = Math.floor(diffSec / 60);
        setTimeAgo(`${mins} min ago`);
      }
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 5000);
    return () => clearInterval(interval);
  }, [liveStatus.updatedAt]);

  const currentStation = liveStatus.currentStation || journey.stations.find((s) => s.status === "CURRENT")?.station;
  const nextStation = liveStatus.nextStation || journey.stations.find((s) => s.status === "UPCOMING")?.station;

  return (
    <Card className="p-5 flex flex-col gap-5 border-slate-200/90 shadow-subtle">
      {/* Live Status Header Message */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex-shrink-0 mt-0.5">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 leading-snug">
              {liveStatus.statusMessage || `Running ${liveStatus.delayMinutes > 0 ? `${liveStatus.delayMinutes}m Late` : "On Time"}`}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Service Date: {journey.serviceDate} • Total Route: {journey.train.totalDistanceKm} km
            </p>
          </div>
        </div>

        {/* Data Freshness Indicator */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors flex-shrink-0"
          title="Click to refresh live position"
        >
          <RefreshCw className={`h-3 w-3 ${isRefreshing ? "animate-spin text-blue-600" : ""}`} />
          <span>{timeAgo}</span>
        </button>
      </div>

      {/* Primary Station Cards Grid: Current vs Next */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Current / Last Station */}
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <MapPin className="h-3.5 w-3.5 text-amber-500" />
            Current Station
          </div>
          <div className="text-base font-bold text-slate-900 truncate">
            {currentStation?.name || "En Route"}
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
            <span className="font-mono">{currentStation?.code || "---"}</span>
            <span className="text-emerald-600 font-medium">Departed</span>
          </div>
        </div>

        {/* Next Station with ETA */}
        <div className="p-3.5 rounded-2xl bg-white border border-blue-200/80 bg-blue-50/20 flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 uppercase tracking-wider">
              <Compass className="h-3.5 w-3.5 text-blue-600" />
              Next Stop
            </span>
            {liveStatus.etaNextStation && (
              <span className="text-xs font-mono font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md">
                ETA {liveStatus.etaNextStation}
              </span>
            )}
          </div>
          <div className="text-base font-bold text-slate-900 truncate">
            {nextStation?.name || journey.destination.name}
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
            <span className="font-mono">{nextStation?.code || journey.destination.code}</span>
            <span className="flex items-center gap-1 font-medium text-slate-700">
              <Clock className="h-3 w-3" />
              Dest. ETA {liveStatus.etaDestination || "---"}
            </span>
          </div>
        </div>
      </div>

      {/* Real-time Telemetry Bar */}
      <div className="grid grid-cols-3 gap-2 text-center py-2 px-3 bg-slate-100/70 rounded-xl border border-slate-200/60">
        <div>
          <div className="text-[11px] text-slate-400 font-medium flex items-center justify-center gap-1">
            <Gauge className="h-3 w-3" /> Speed
          </div>
          <div className="font-mono text-sm font-bold text-slate-900 mt-0.5">
            {liveStatus.speedKmph ?? "—"} <span className="text-xs font-normal text-slate-500">km/h</span>
          </div>
        </div>

        <div className="border-x border-slate-200">
          <div className="text-[11px] text-slate-400 font-medium">Delay</div>
          <div className={`font-mono text-sm font-bold mt-0.5 ${liveStatus.delayMinutes > 0 ? "text-rose-600" : "text-emerald-600"}`}>
            {liveStatus.delayMinutes > 0 ? `+${liveStatus.delayMinutes} min` : "0 min"}
          </div>
        </div>

        <div>
          <div className="text-[11px] text-slate-400 font-medium">Remaining</div>
          <div className="font-mono text-sm font-bold text-slate-900 mt-0.5">
            {liveStatus.distanceRemainingKm} <span className="text-xs font-normal text-slate-500">km</span>
          </div>
        </div>
      </div>

      {/* Journey Progress */}
      <JourneyProgress journey={journey} liveStatus={liveStatus} />

      {/* Stale Warning Banner if applicable */}
      {liveStatus.isStale && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
          <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0" />
          <span>
            Live updates may be delayed due to limited cellular coverage in this section. Showing last reported position.
          </span>
        </div>
      )}
    </Card>
  );
}
