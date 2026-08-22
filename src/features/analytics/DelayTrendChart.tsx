"use client";

import React from "react";
import { JourneyStation } from "@/types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";

interface DelayTrendChartProps {
  stations: JourneyStation[];
}

export function DelayTrendChart({ stations }: DelayTrendChartProps) {
  const chartData = stations.map((st) => ({
    code: st.station.code,
    name: st.station.name,
    delay: st.delayMinutes || 0,
    status: st.status,
  }));

  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
        >
          <XAxis
            dataKey="code"
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
                      {data.name} ({data.code})
                    </div>
                    <div className={`font-mono font-bold mt-0.5 ${data.delay > 0 ? "text-rose-400" : "text-emerald-400"}`}>
                      {data.delay > 0 ? `+${data.delay} min late` : "On Time"}
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <ReferenceLine y={0} stroke="#cbd5e1" />
          <Bar dataKey="delay" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.delay > 0 ? "#f43f5e" : "#10b981"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
