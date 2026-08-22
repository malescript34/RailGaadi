"use client";

import React, { useEffect } from "react";
import { usePreferencesStore } from "@/stores/usePreferencesStore";
import { Heart, ArrowRight } from "lucide-react";

interface FavouriteTrainsProps {
  onSelectTrainNumber: (trainNumber: string) => void;
}

export function FavouriteTrains({ onSelectTrainNumber }: FavouriteTrainsProps) {
  const { favourites, hydrate, isHydrated } = usePreferencesStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  if (!isHydrated || favourites.length === 0) return null;

  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
        <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500" />
        Favourite Trains
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {favourites.map((fav) => (
          <div
            key={fav.trainNumber}
            onClick={() => onSelectTrainNumber(fav.trainNumber)}
            className="flex items-center justify-between p-3.5 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-2xl cursor-pointer shadow-subtle hover:border-slate-300 transition-all group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200">
                {fav.trainNumber}
              </span>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                  {fav.trainName}
                </div>
                <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                  <span>{fav.originName}</span>
                  <ArrowRight className="h-3 w-3 flex-shrink-0 text-slate-400" />
                  <span>{fav.destinationName}</span>
                </div>
              </div>
            </div>

            <div className="pl-2">
              <Heart className="h-4 w-4 fill-rose-500 text-rose-500" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
