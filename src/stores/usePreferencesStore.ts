import { create } from "zustand";
import { RecentSearch, FavouriteTrain } from "@/types";

const RECENT_SEARCHES_KEY = "railgaadi_recent_searches";
const FAVOURITES_KEY = "railgaadi_favourite_trains";

interface PreferencesState {
  recentSearches: RecentSearch[];
  favourites: FavouriteTrain[];
  isHydrated: boolean;

  hydrate: () => void;
  addRecentSearch: (search: Omit<RecentSearch, "lastSearchedAt">) => void;
  removeRecentSearch: (trainNumber: string) => void;
  clearRecentSearches: () => void;
  toggleFavourite: (train: { trainNumber: string; trainName: string; originName: string; destinationName: string }) => boolean;
  isFavourite: (trainNumber: string) => boolean;
}

export const usePreferencesStore = create<PreferencesState>((set, get) => ({
  recentSearches: [],
  favourites: [],
  isHydrated: false,

  hydrate: () => {
    if (typeof window === "undefined") return;
    try {
      const savedSearches = localStorage.getItem(RECENT_SEARCHES_KEY);
      const savedFavourites = localStorage.getItem(FAVOURITES_KEY);

      set({
        recentSearches: savedSearches ? JSON.parse(savedSearches) : [],
        favourites: savedFavourites ? JSON.parse(savedFavourites) : [],
        isHydrated: true,
      });
    } catch {
      set({ isHydrated: true });
    }
  },

  addRecentSearch: (item) => {
    const { recentSearches } = get();
    const existingIndex = recentSearches.findIndex(
      (s) => s.trainNumber === item.trainNumber
    );

    const newItem: RecentSearch = {
      ...item,
      lastSearchedAt: new Date().toISOString(),
    };

    let updated: RecentSearch[];
    if (existingIndex >= 0) {
      updated = [
        newItem,
        ...recentSearches.filter((s) => s.trainNumber !== item.trainNumber),
      ];
    } else {
      updated = [newItem, ...recentSearches].slice(0, 15);
    }

    set({ recentSearches: updated });
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error("Failed to save recent search to localStorage", e);
      }
    }
  },

  removeRecentSearch: (trainNumber) => {
    const updated = get().recentSearches.filter(
      (s) => s.trainNumber !== trainNumber
    );
    set({ recentSearches: updated });
    if (typeof window !== "undefined") {
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    }
  },

  clearRecentSearches: () => {
    set({ recentSearches: [] });
    if (typeof window !== "undefined") {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    }
  },

  toggleFavourite: (train) => {
    const { favourites } = get();
    const exists = favourites.some((f) => f.trainNumber === train.trainNumber);
    let updated: FavouriteTrain[];

    if (exists) {
      updated = favourites.filter((f) => f.trainNumber !== train.trainNumber);
    } else {
      updated = [
        {
          ...train,
          addedAt: new Date().toISOString(),
        },
        ...favourites,
      ];
    }

    set({ favourites: updated });
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(FAVOURITES_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error("Failed to save favourites", e);
      }
    }
    return !exists;
  },

  isFavourite: (trainNumber) => {
    return get().favourites.some((f) => f.trainNumber === trainNumber);
  },
}));
