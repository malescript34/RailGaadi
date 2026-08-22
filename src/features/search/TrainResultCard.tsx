"use client";

import React from "react";
import { TrainSearchResult } from "@/types";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Heart, ArrowRight, Clock } from "lucide-react";
import { usePreferencesStore } from "@/stores/usePreferencesStore";

interface TrainResultCardProps {
  train: TrainSearchResult;
  onSelect: (train: TrainSearchResult) => void;
}

export function TrainResultCard({ train, onSelect }: TrainResultCardProps) {
  const { toggleFavourite, isFavourite } = usePreferencesStore();
  const isFav = isFavourite(train.number);

  const handleFavClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavourite({
      trainNumber: train.number,
      trainName: train.name,
      originName: train.origin.name,
      destinationName: train.destination.name,
    });
  };

  return (
    <Card
      hoverable
      onClick={() => onSelect(train)}
      className="p-4 sm:p-5 flex flex-col gap-3 group relative border-slate-200/90"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="font-mono text-base font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
            {train.number}
          </span>
          <h4 className="text-base font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
            {train.name}
          </h4>
          {train.type && (
            <Badge variant="secondary" className="text-[11px] font-medium">
              {train.type}
            </Badge>
          )}
        </div>

        <button
          type="button"
          onClick={handleFavClick}
          aria-label={isFav ? "Remove from favourites" : "Add to favourites"}
          className="p-1.5 -mr-1 -mt-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
        >
          <Heart
            className={`h-5 w-5 transition-transform active:scale-125 ${
              isFav ? "fill-rose-500 text-rose-500" : ""
            }`}
          />
        </button>
      </div>

      {/* Origin -> Destination Route Details */}
      <div className="grid grid-cols-[1fr,auto,1fr] items-center gap-3 pt-1 border-t border-slate-100">
        <div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {train.origin.code}
          </div>
          <div className="text-sm font-medium text-slate-800 truncate">
            {train.origin.name}
          </div>
          <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
            <Clock className="h-3 w-3" /> {train.departureTime}
          </div>
        </div>

        <div className="flex flex-col items-center justify-center px-2">
          <span className="text-[11px] font-mono text-slate-400 mb-0.5">
            {train.totalDistanceKm} km
          </span>
          <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
        </div>

        <div className="text-right">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {train.destination.code}
          </div>
          <div className="text-sm font-medium text-slate-800 truncate">
            {train.destination.name}
          </div>
          <div className="text-xs text-slate-500 flex items-center justify-end gap-1 mt-0.5">
            <Clock className="h-3 w-3" /> {train.arrivalTime}
          </div>
        </div>
      </div>
    </Card>
  );
}
