"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { SearchInput } from "./SearchInput";
import { TrainResultCard } from "./TrainResultCard";
import { RecentSearches } from "./RecentSearches";
import { FavouriteTrains } from "./FavouriteTrains";
import { Skeleton } from "@/components/ui/Skeleton";
import { TrainSearchResult } from "@/types";
import { usePreferencesStore } from "@/stores/usePreferencesStore";
import { AlertCircle, TrainTrack, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function TrainSearch() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState("");
  const { addRecentSearch } = usePreferencesStore();

  // Debounce search input (280ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedTerm(searchTerm.trim());
    }, 280);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const {
    data: searchData,
    isLoading,
    isError,
    refetch,
  } = useQuery<{ data: TrainSearchResult[] }>({
    queryKey: ["trainSearch", debouncedTerm],
    queryFn: async () => {
      if (!debouncedTerm || debouncedTerm.length < 2) return { data: [] };
      const res = await fetch(
        `/api/v1/trains/search?q=${encodeURIComponent(debouncedTerm)}`
      );
      if (!res.ok) throw new Error("Search failed");
      return res.json();
    },
    enabled: debouncedTerm.length >= 2,
  });

  const handleSelectTrain = (train: TrainSearchResult) => {
    addRecentSearch({
      trainNumber: train.number,
      trainName: train.name,
      originCode: train.origin.code,
      originName: train.origin.name,
      destinationCode: train.destination.code,
      destinationName: train.destination.name,
    });
    router.push(`/journey/${train.number}`);
  };

  const handleSelectTrainNumber = (trainNumber: string) => {
    router.push(`/journey/${trainNumber}`);
  };

  const trains = searchData?.data || [];
  const isSearching = debouncedTerm.length >= 2;

  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto">
      {/* Search Input Bar */}
      <SearchInput
        value={searchTerm}
        onChange={setSearchTerm}
        onClear={() => {
          setSearchTerm("");
          setDebouncedTerm("");
        }}
        isLoading={isLoading}
        autoFocus
      />

      {/* Search guidance */}
      {!isSearching && (
        <div className="flex items-center gap-2 text-xs text-slate-500 py-0.5">
          <Sparkles className="h-3 w-3 text-amber-500" />
          Enter a train number or train name to search the live Indian Railways catalogue.
        </div>
      )}

      {/* Search Results / States */}
      {isSearching ? (
        <div className="flex flex-col gap-3">
          {isLoading ? (
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-28 w-full rounded-2xl" />
              ))}
            </div>
          ) : isError ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-rose-100 flex flex-col items-center gap-3">
              <AlertCircle className="h-8 w-8 text-rose-500" />
              <p className="text-sm font-medium text-slate-800">
                We couldn&apos;t search trains right now.
              </p>
              <Button size="sm" variant="secondary" onClick={() => refetch()}>
                Retry Search
              </Button>
            </div>
          ) : trains.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200/80 flex flex-col items-center gap-2">
              <TrainTrack className="h-8 w-8 text-slate-300 mb-1" />
              <p className="text-sm font-semibold text-slate-800">
                No trains found for &ldquo;{debouncedTerm}&rdquo;
              </p>
              <p className="text-xs text-slate-500">
                Check the train number or try the train name.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-1">
                {trains.length} {trains.length === 1 ? "Result" : "Results"} Found
              </div>
              {trains.map((train) => (
                <TrainResultCard
                  key={train.id || train.number}
                  train={train}
                  onSelect={handleSelectTrain}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Home screen recent and favourite cards */
        <div className="flex flex-col gap-8 pt-2">
          <RecentSearches onSelectTrainNumber={handleSelectTrainNumber} />
          <FavouriteTrains onSelectTrainNumber={handleSelectTrainNumber} />
        </div>
      )}
    </div>
  );
}
