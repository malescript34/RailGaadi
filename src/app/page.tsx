"use client";

import React from "react";
import { TrainSearch } from "@/features/search/TrainSearch";
import { Train, Compass, Zap, Shield } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex-1 flex flex-col justify-between">
      {/* Top Navigation Bar */}
      <header className="px-4 sm:px-8 py-4 bg-white/80 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-20 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-sm">
            <Train className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <span className="text-lg font-black tracking-tight text-slate-900">
              RailGaadi
            </span>
            <span className="ml-1.5 text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
              LIVE
            </span>
          </div>
        </div>

        <span className="hidden sm:inline text-xs font-semibold text-slate-500">
          Search any Indian Railways train
        </span>
      </header>

      {/* Main Content Hero */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col gap-10">
        {/* Hero Title */}
        <div className="text-center flex flex-col items-center gap-3">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 max-w-2xl leading-[1.15]">
            Real-Time Railway Journey Intelligence
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-xl">
            Search by a train number or name to see its current running status, route, stations, weather, and terrain.
          </p>
        </div>

        {/* Train Search Feature */}
        <TrainSearch />

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
          <div className="p-4 rounded-2xl bg-white border border-slate-200/70 flex flex-col gap-1.5">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 w-fit">
              <Compass className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Dark 3D Railway Map</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Vector tile rendering with dynamic track completion glows, camera follow mode, and station markers.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/70 flex flex-col gap-1.5">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 w-fit">
              <Zap className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Live Journey Intelligence</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Real-time speed, arrival delay analysis, station stoppage countdowns, and instant route sharing.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/70 flex flex-col gap-1.5">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 w-fit">
              <Shield className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Geographic & Weather Context</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Elevation contours, rivers, ghats, viaduct bridges, monuments, and weather along your journey.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 py-6 px-4 border-t border-slate-200 text-center text-xs text-slate-400">
        RailGaadi &bull; Indian Railways Live Journey Platform &bull; Built with Next.js, MapLibre & Turf.js
      </footer>
    </div>
  );
}
