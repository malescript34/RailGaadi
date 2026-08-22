"use client";

import React from "react";
import { Weather, RouteWeatherCheckpoint } from "@/types";
import { Card } from "@/components/ui/Card";
import {
  Sun,
  Cloud,
  CloudRain,
  Wind,
  Droplets,
  Thermometer,
  CloudSun,
} from "lucide-react";

interface WeatherOverviewProps {
  weatherData?: {
    currentStation: Weather;
    nextStation: Weather;
    destination: Weather;
    checkpoints: RouteWeatherCheckpoint[];
  } | null;
}

function getWeatherIcon(condition: string) {
  const c = condition.toLowerCase();
  if (c.includes("rain")) return <CloudRain className="h-6 w-6 text-blue-500" />;
  if (c.includes("cloud") && c.includes("sun")) return <CloudSun className="h-6 w-6 text-amber-500" />;
  if (c.includes("cloud")) return <Cloud className="h-6 w-6 text-slate-500" />;
  return <Sun className="h-6 w-6 text-amber-500" />;
}

export function WeatherOverview({ weatherData }: WeatherOverviewProps) {
  if (!weatherData) {
    return (
      <div className="p-8 text-center text-xs text-slate-400">
        Live weather information unavailable.
      </div>
    );
  }

  const { currentStation, nextStation, destination, checkpoints } = weatherData;

  return (
    <div className="flex flex-col gap-4">
      {/* 3 Core Stations Weather Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Current Station */}
        <Card className="p-4 flex flex-col gap-3 border-slate-200/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Current Location
            </span>
            {getWeatherIcon(currentStation.condition)}
          </div>
          <div>
            <div className="font-bold text-slate-900 text-sm truncate">
              {currentStation.locationName}
            </div>
            <div className="font-mono text-2xl font-bold text-slate-900 mt-0.5">
              {currentStation.temperature}°C
            </div>
            <div className="text-xs text-slate-500">{currentStation.condition}</div>
          </div>
          <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-500 pt-2 border-t border-slate-100 font-mono">
            <span className="flex items-center gap-1">
              <Droplets className="h-3 w-3 text-blue-500" /> {currentStation.humidity}% Hum
            </span>
            <span className="flex items-center gap-1">
              <Wind className="h-3 w-3 text-slate-400" /> {currentStation.windSpeed} km/h
            </span>
          </div>
        </Card>

        {/* Next Stop */}
        <Card className="p-4 flex flex-col gap-3 border-slate-200/80 bg-blue-50/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
              Next Stop
            </span>
            {getWeatherIcon(nextStation.condition)}
          </div>
          <div>
            <div className="font-bold text-slate-900 text-sm truncate">
              {nextStation.locationName}
            </div>
            <div className="font-mono text-2xl font-bold text-slate-900 mt-0.5">
              {nextStation.temperature}°C
            </div>
            <div className="text-xs text-slate-500">{nextStation.condition}</div>
          </div>
          <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-500 pt-2 border-t border-slate-100 font-mono">
            <span className="flex items-center gap-1">
              <Droplets className="h-3 w-3 text-blue-500" /> {nextStation.humidity}% Hum
            </span>
            <span className="flex items-center gap-1">
              <Wind className="h-3 w-3 text-slate-400" /> {nextStation.windSpeed} km/h
            </span>
          </div>
        </Card>

        {/* Destination */}
        <Card className="p-4 flex flex-col gap-3 border-slate-200/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Destination
            </span>
            {getWeatherIcon(destination.condition)}
          </div>
          <div>
            <div className="font-bold text-slate-900 text-sm truncate">
              {destination.locationName}
            </div>
            <div className="font-mono text-2xl font-bold text-slate-900 mt-0.5">
              {destination.temperature}°C
            </div>
            <div className="text-xs text-slate-500">{destination.condition}</div>
          </div>
          <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-500 pt-2 border-t border-slate-100 font-mono">
            <span className="flex items-center gap-1">
              <Droplets className="h-3 w-3 text-blue-500" /> {destination.humidity}% Hum
            </span>
            <span className="flex items-center gap-1">
              <Wind className="h-3 w-3 text-slate-400" /> {destination.windSpeed} km/h
            </span>
          </div>
        </Card>
      </div>

      {/* Route Weather Checkpoints Strip */}
      {checkpoints && checkpoints.length > 0 && (
        <Card className="p-4 border-slate-200/90 shadow-subtle flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Thermometer className="h-4 w-4 text-amber-500" />
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Weather Along The Track
              </h4>
            </div>
            <span className="text-[11px] text-slate-400">Station Checkpoints</span>
          </div>

          <div className="flex gap-2.5 overflow-x-auto pb-1 no-scrollbar -mx-1 px-1">
            {checkpoints.map((cp) => (
              <div
                key={cp.id}
                className="flex-shrink-0 flex flex-col items-center p-3 rounded-xl bg-slate-50 border border-slate-200/80 min-w-[100px] text-center"
              >
                <span className="text-[11px] font-semibold text-slate-800 truncate max-w-[90px]">
                  {cp.stationName}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {cp.distanceKm} km
                </span>
                <div className="my-1.5">{getWeatherIcon(cp.weather.condition)}</div>
                <span className="font-mono text-sm font-bold text-slate-900">
                  {cp.weather.temperature}°C
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
