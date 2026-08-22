import React from "react";
import { LiveTrainStatus, Journey } from "@/types";

interface JourneyProgressProps {
  journey: Journey;
  liveStatus: LiveTrainStatus;
}

export function JourneyProgress({ journey, liveStatus }: JourneyProgressProps) {
  const percent = Math.min(100, Math.max(0, liveStatus.completionPercentage));

  return (
    <div className="flex flex-col gap-2.5 w-full bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80">
      {/* Metrics Row */}
      <div className="flex items-center justify-between text-xs font-medium">
        <div className="flex items-baseline gap-1.5">
          <span className="font-mono text-lg font-bold text-slate-900">
            {percent}%
          </span>
          <span className="text-slate-500">Complete</span>
        </div>

        <div className="flex items-center gap-3 text-slate-600 font-mono text-xs">
          <span>
            <strong className="text-slate-900">{liveStatus.distanceCoveredKm}</strong> km covered
          </span>
          <span className="text-slate-300">•</span>
          <span>
            <strong className="text-slate-900">{liveStatus.distanceRemainingKm}</strong> km remain
          </span>
        </div>
      </div>

      {/* Visual Progress Bar with Glow */}
      <div className="relative w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 rounded-full transition-all duration-700 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* Station Labels at ends */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium pt-0.5">
        <span className="truncate max-w-[45%] text-left">
          {journey.origin.code} ({journey.origin.name})
        </span>
        <span className="truncate max-w-[45%] text-right">
          {journey.destination.code} ({journey.destination.name})
        </span>
      </div>
    </div>
  );
}
