"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Journey, LiveTrainStatus } from "@/types";
import { DelayBadge } from "./DelayBadge";
import { Button } from "@/components/ui/Button";
import { ChevronLeft, Share2, Heart } from "lucide-react";
import { usePreferencesStore } from "@/stores/usePreferencesStore";

interface JourneyHeaderProps {
  journey: Journey;
  liveStatus: LiveTrainStatus;
  onOpenShare: () => void;
}

export function JourneyHeader({
  journey,
  liveStatus,
  onOpenShare,
}: JourneyHeaderProps) {
  const router = useRouter();
  const { toggleFavourite, isFavourite } = usePreferencesStore();
  const isFav = isFavourite(journey.train.number);

  const handleFav = () => {
    toggleFavourite({
      trainNumber: journey.train.number,
      trainName: journey.train.name,
      originName: journey.origin.name,
      destinationName: journey.destination.name,
    });
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:px-6 bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30">
      {/* Left: Back + Train Information */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={() => router.push("/")}
          className="p-2 -ml-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors flex-shrink-0"
          aria-label="Back to Search"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-sm font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              {journey.train.number}
            </span>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 truncate">
              {journey.train.name}
            </h1>
            <DelayBadge
              status={liveStatus.status}
              delayMinutes={liveStatus.delayMinutes}
            />
          </div>

          <div className="text-xs text-slate-500 font-medium truncate mt-0.5">
            {journey.origin.name} ({journey.origin.code}) &rarr;{" "}
            {journey.destination.name} ({journey.destination.code})
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
        <Button
          variant="outline"
          size="sm"
          onClick={handleFav}
          aria-label={isFav ? "Saved to favourites" : "Save to favourites"}
          className={`gap-1.5 ${isFav ? "text-rose-600 border-rose-200 bg-rose-50" : ""}`}
        >
          <Heart className={`h-4 w-4 ${isFav ? "fill-rose-500 text-rose-500" : ""}`} />
          <span className="hidden xs:inline">{isFav ? "Saved" : "Save"}</span>
        </Button>

        <Button
          variant="primary"
          size="sm"
          onClick={onOpenShare}
          className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Share2 className="h-4 w-4" />
          <span>Share</span>
        </Button>
      </div>
    </div>
  );
}
