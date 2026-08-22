"use client";

import React, { useEffect } from "react";
import { usePreferencesStore } from "@/stores/usePreferencesStore";
import { History, X, ArrowRight } from "lucide-react";

interface RecentSearchesProps {
  onSelectTrainNumber: (trainNumber: string) => void;
}

export function RecentSearches({ onSelectTrainNumber }: RecentSearchesProps) {
  const { recentSearches, removeRecentSearch, clearRecentSearches, hydrate, isHydrated } =
    usePreferencesStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  if (!isHydrated || recentSearches.length === 0) return null;

  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
          <History className="h-3.5 w-3.5" />
          Recent Searches
        </div>
        {recentSearches.length > 2 && (
          <button
            onClick={clearRecentSearches}
            className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="flex gap-2.5 overflow-x-auto pb-1 no-scrollbar -mx-1 px-1">
        {recentSearches.map((item) => (
          <div
            key={item.trainNumber}
            onClick={() => onSelectTrainNumber(item.trainNumber)}
            className="flex-shrink-0 flex items-center gap-2.5 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-xl px-3.5 py-2 cursor-pointer shadow-subtle hover:border-slate-300 transition-all group"
          >
            <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded">
              {item.trainNumber}
            </span>
            <div className="flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-800 group-hover:text-blue-600 transition-colors max-w-[140px] truncate">
                {item.trainName}
              </span>
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                {item.originCode} <ArrowRight className="h-2.5 w-2.5" /> {item.destinationCode}
              </span>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                removeRecentSearch(item.trainNumber);
              }}
              className="p-1 rounded text-slate-300 hover:text-slate-600 hover:bg-slate-200/60 transition-colors ml-1"
              aria-label={`Remove ${item.trainNumber} from recents`}
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
