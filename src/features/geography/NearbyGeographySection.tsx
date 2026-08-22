"use client";

import React from "react";
import { NearbyGeography } from "@/types";
import { Card } from "@/components/ui/Card";
import {
  Waves,
  Mountain,
  Landmark,
  Building2,
  Construction,
  Compass,
} from "lucide-react";

interface NearbyGeographySectionProps {
  geography?: NearbyGeography | null;
}

export function NearbyGeographySection({
  geography,
}: NearbyGeographySectionProps) {
  if (!geography) {
    return (
      <div className="p-8 text-center text-xs text-slate-400">
        Geographical context unavailable.
      </div>
    );
  }

  const sections = [
    {
      title: "Rivers & Water Bodies",
      icon: Waves,
      color: "text-sky-600 bg-sky-50 border-sky-200",
      items: geography.rivers,
    },
    {
      title: "Ghats & Mountains",
      icon: Mountain,
      color: "text-emerald-600 bg-emerald-50 border-emerald-200",
      items: geography.mountains,
    },
    {
      title: "Bridges & Tunnels",
      icon: Construction,
      color: "text-amber-600 bg-amber-50 border-amber-200",
      items: geography.bridgesAndTunnels,
    },
    {
      title: "Monuments & Heritage",
      icon: Landmark,
      color: "text-indigo-600 bg-indigo-50 border-indigo-200",
      items: geography.monumentsAndAttractions,
    },
    {
      title: "Nearby Cities",
      icon: Building2,
      color: "text-slate-600 bg-slate-100 border-slate-200",
      items: geography.cities,
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Compass className="h-4 w-4 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900">
            Geographical Context & Landmarks
          </h3>
        </div>
        <span className="text-xs text-slate-400">Within ~25 km of train</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {sections.map((sec) => {
          if (!sec.items || sec.items.length === 0) return null;
          const Icon = sec.icon;

          return (
            <Card
              key={sec.title}
              className="p-4 flex flex-col gap-3 border-slate-200/80"
            >
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg border ${sec.color}`}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  {sec.title}
                </h4>
              </div>

              <div className="flex flex-col gap-2">
                {sec.items.map((item) => (
                  <div
                    key={item.id || item.name}
                    className="flex flex-col gap-0.5 p-2 rounded-xl bg-slate-50 border border-slate-100"
                  >
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                      <span>{item.name}</span>
                      <span className="font-mono text-[11px] text-slate-400 font-normal">
                        {item.distanceFromTrainKm} km away
                      </span>
                    </div>
                    {item.description && (
                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
