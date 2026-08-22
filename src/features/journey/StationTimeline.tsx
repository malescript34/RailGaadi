"use client";

import React from "react";
import { JourneyStation } from "@/types";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CheckCircle2, Clock, MapPin, ArrowDown } from "lucide-react";

interface StationTimelineProps {
  stations: JourneyStation[];
}

export function StationTimeline({ stations }: StationTimelineProps) {
  return (
    <Card className="p-5 flex flex-col gap-4 border-slate-200/90 shadow-subtle">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900">Station Timeline</h3>
          <p className="text-xs text-slate-500">
            {stations.length} Scheduled Stops along route
          </p>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500" /> Passed
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" /> Current
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-slate-300" /> Upcoming
          </span>
        </div>
      </div>

      <div className="relative flex flex-col mt-2">
        {/* Continuous Track Vertical Line */}
        <div className="absolute left-[17px] top-4 bottom-4 w-0.5 bg-slate-200" />

        {stations.map((st, index) => {
          const isPassed = st.status === "PASSED";
          const isCurrent = st.status === "CURRENT";
          const isUpcoming = st.status === "UPCOMING";
          const isOrigin = index === 0;
          const isDest = index === stations.length - 1;

          return (
            <div
              key={st.station.id || st.station.code}
              className={`relative flex items-start gap-4 py-3 group transition-colors ${
                isCurrent ? "bg-amber-50/50 -mx-3 px-3 rounded-2xl border border-amber-200/60 my-1" : ""
              }`}
            >
              {/* Timeline Track Node */}
              <div className="relative z-10 flex items-center justify-center flex-shrink-0 mt-0.5">
                {isCurrent ? (
                  <div className="relative flex items-center justify-center">
                    <span className="absolute -inset-1.5 rounded-full bg-amber-400/40 animate-ping" />
                    <div className="h-9 w-9 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-sm">
                      <MapPin className="h-4 w-4" />
                    </div>
                  </div>
                ) : isPassed ? (
                  <div className="h-9 w-9 rounded-full bg-emerald-100 text-emerald-700 border-2 border-emerald-500 flex items-center justify-center">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                ) : (
                  <div className="h-9 w-9 rounded-full bg-white text-slate-400 border-2 border-slate-300 flex items-center justify-center">
                    <span className="font-mono text-xs font-semibold">
                      {st.sequence}
                    </span>
                  </div>
                )}
              </div>

              {/* Station Details */}
              <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4 min-w-0">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {st.station.name}
                    </span>
                    <span className="font-mono text-xs font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                      {st.station.code}
                    </span>
                    {st.platform && (
                      <span className="text-[11px] font-medium text-slate-400">
                        Pf {st.platform}
                      </span>
                    )}
                    {st.delayMinutes > 0 && (
                      <Badge variant="delayed" className="text-[10px] py-0">
                        +{st.delayMinutes}m Late
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-400 font-mono mt-0.5">
                    <span>{st.distanceFromOriginKm} km</span>
                    {st.haltMinutes !== undefined && st.haltMinutes > 0 && (
                      <>
                        <span>•</span>
                        <span>Halt: {st.haltMinutes} min</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Timings: Scheduled vs Actual */}
                <div className="flex items-center gap-4 text-xs font-mono self-start sm:self-auto text-slate-600">
                  {!isOrigin && (
                    <div className="text-right">
                      <div className="text-[10px] text-slate-400 font-sans uppercase">Arr</div>
                      <div className="font-semibold text-slate-800">
                        {st.actualArrival || st.scheduledArrival || "--:--"}
                      </div>
                      {st.actualArrival && st.actualArrival !== st.scheduledArrival && (
                        <div className="text-[10px] text-slate-400 line-through">
                          {st.scheduledArrival}
                        </div>
                      )}
                    </div>
                  )}

                  {!isDest && (
                    <div className="text-right">
                      <div className="text-[10px] text-slate-400 font-sans uppercase">Dep</div>
                      <div className="font-semibold text-slate-800">
                        {st.actualDeparture || st.scheduledDeparture || "--:--"}
                      </div>
                      {st.actualDeparture && st.actualDeparture !== st.scheduledDeparture && (
                        <div className="text-[10px] text-slate-400 line-through">
                          {st.scheduledDeparture}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
