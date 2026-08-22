"use client";

import React from "react";
import { useMapStore } from "@/stores/useMapStore";
import {
  Navigation,
  Compass,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Layers,
} from "lucide-react";

interface MapControlsProps {
  onRecenter: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetBearing: () => void;
  onToggleFullscreen: () => void;
}

export function MapControls({
  onRecenter,
  onZoomIn,
  onZoomOut,
  onResetBearing,
  onToggleFullscreen,
}: MapControlsProps) {
  const { followTrain, toggleFollowTrain, isFullscreen, activeLayer, setActiveLayer } =
    useMapStore();

  const handleNextLayer = () => {
    const layers: ("all" | "route" | "weather" | "poi")[] = ["all", "route", "weather", "poi"];
    const nextIdx = (layers.indexOf(activeLayer) + 1) % layers.length;
    setActiveLayer(layers[nextIdx]);
  };

  return (
    <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 pointer-events-auto">
      {/* Follow Train Toggle */}
      <button
        onClick={toggleFollowTrain}
        title={followTrain ? "Disable Camera Follow" : "Enable Camera Follow"}
        className={`h-10 px-3 rounded-xl font-medium text-xs flex items-center gap-1.5 backdrop-blur-xl transition-all shadow-elevated border ${
          followTrain
            ? "bg-blue-600 text-white border-blue-500 shadow-blue-900/30"
            : "bg-slate-900/85 text-slate-200 border-white/10 hover:bg-slate-800"
        }`}
      >
        <Navigation className={`h-3.5 w-3.5 ${followTrain ? "animate-pulse" : ""}`} />
        <span>{followTrain ? "Tracking" : "Follow"}</span>
      </button>

      {/* Control Group */}
      <div className="flex flex-col rounded-xl overflow-hidden bg-slate-900/85 backdrop-blur-xl border border-white/10 shadow-elevated divide-y divide-white/10">
        <button
          onClick={onRecenter}
          title="Recenter Map"
          className="p-2.5 text-slate-300 hover:text-white hover:bg-white/10 transition-colors flex items-center justify-center"
        >
          <Navigation className="h-4 w-4 rotate-45" />
        </button>

        <button
          onClick={onZoomIn}
          title="Zoom In"
          className="p-2.5 text-slate-300 hover:text-white hover:bg-white/10 transition-colors flex items-center justify-center"
        >
          <ZoomIn className="h-4 w-4" />
        </button>

        <button
          onClick={onZoomOut}
          title="Zoom Out"
          className="p-2.5 text-slate-300 hover:text-white hover:bg-white/10 transition-colors flex items-center justify-center"
        >
          <ZoomOut className="h-4 w-4" />
        </button>

        <button
          onClick={onResetBearing}
          title="Reset Orientation"
          className="p-2.5 text-slate-300 hover:text-white hover:bg-white/10 transition-colors flex items-center justify-center"
        >
          <Compass className="h-4 w-4" />
        </button>

        <button
          onClick={handleNextLayer}
          title={`Layer Filter (${activeLayer.toUpperCase()})`}
          className="p-2.5 text-slate-300 hover:text-white hover:bg-white/10 transition-colors flex items-center justify-center relative"
        >
          <Layers className="h-4 w-4" />
          <span className="absolute bottom-1 right-1 h-1.5 w-1.5 rounded-full bg-blue-400" />
        </button>

        <button
          onClick={onToggleFullscreen}
          title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Map"}
          className="p-2.5 text-slate-300 hover:text-white hover:bg-white/10 transition-colors flex items-center justify-center"
        >
          {isFullscreen ? (
            <Minimize2 className="h-4 w-4" />
          ) : (
            <Maximize2 className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}
