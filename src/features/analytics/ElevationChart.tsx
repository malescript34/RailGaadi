"use client";

import React from "react";
import { ElevationData } from "@/types";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Mountain, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface ElevationChartProps {
  elevation: ElevationData;
  currentDistanceKm: number;
}

export function ElevationChart({
  elevation,
  currentDistanceKm,
}: ElevationChartProps) {
  const chartData = elevation.profile.map((p) => ({
    distance: p.distanceKm,
    elevation: p.elevationMeters,
    station: p.stationName || "",
  }));

  return (
    <div className="flex flex-col gap-4">
      {/* Header Metrics */}
      <div className="grid grid-cols-3 gap-2 text-center p-3 bg-slate-50 rounded-xl border border-slate-200/80">
        <div>
          <div className="text-[11px] text-slate-400 font-medium flex items-center justify-center gap-1">
            <Mountain className="h-3 w-3 text-indigo-500" /> Current
          </div>
          <div className="font-mono text-sm font-bold text-slate-900 mt-0.5">
            {elevation.currentElevationMeters} <span className="text-xs font-normal text-slate-500">m</span>
          </div>
        </div>

        <div className="border-x border-slate-200">
          <div className="text-[11px] text-slate-400 font-medium flex items-center justify-center gap-1">
            <ArrowUpRight className="h-3 w-3 text-rose-500" /> Peak
          </div>
          <div className="font-mono text-sm font-bold text-slate-900 mt-0.5">
            {elevation.maxElevationMeters} <span className="text-xs font-normal text-slate-500">m</span>
          </div>
        </div>

        <div>
          <div className="text-[11px] text-slate-400 font-medium flex items-center justify-center gap-1">
            <ArrowDownRight className="h-3 w-3 text-emerald-500" /> Lowest
          </div>
          <div className="font-mono text-sm font-bold text-slate-900 mt-0.5">
            {elevation.minElevationMeters} <span className="text-xs font-normal text-slate-500">m</span>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-56 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="elevationGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="distance"
              tickFormatter={(val) => `${val}km`}
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
            />
            <YAxis
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              tickFormatter={(val) => `${val}m`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="rounded-lg bg-slate-900 px-3 py-2 text-white shadow-elevated border border-slate-800 text-xs">
                      <div className="font-semibold text-slate-200">
                        {data.station ? `${data.station} • ` : ""}{data.distance} km
                      </div>
                      <div className="font-mono text-indigo-300 font-bold mt-0.5">
                        {data.elevation} meters above sea level
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <ReferenceLine
              x={currentDistanceKm}
              stroke="#2563eb"
              strokeDasharray="3 3"
              label={{
                value: "Train",
                position: "top",
                fill: "#2563eb",
                fontSize: 11,
                fontWeight: "bold",
              }}
            />
            <Area
              type="monotone"
              dataKey="elevation"
              stroke="#4f46e5"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#elevationGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
