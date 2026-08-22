import { create } from "zustand";

interface MapState {
  center: [number, number]; // [lng, lat]
  zoom: number;
  pitch: number;
  bearing: number;
  followTrain: boolean;
  isMapLoaded: boolean;
  isFullscreen: boolean;
  activeLayer: "all" | "route" | "weather" | "poi";

  setCenter: (center: [number, number]) => void;
  setZoom: (zoom: number) => void;
  setCamera: (center: [number, number], zoom: number, pitch?: number, bearing?: number) => void;
  setFollowTrain: (follow: boolean) => void;
  toggleFollowTrain: () => void;
  setIsMapLoaded: (loaded: boolean) => void;
  setIsFullscreen: (fullscreen: boolean) => void;
  setActiveLayer: (layer: "all" | "route" | "weather" | "poi") => void;
}

export const useMapStore = create<MapState>((set) => ({
  center: [78.9629, 20.5937], // Center of India
  zoom: 5.5,
  pitch: 30,
  bearing: 0,
  followTrain: true,
  isMapLoaded: false,
  isFullscreen: false,
  activeLayer: "all",

  setCenter: (center) => set({ center }),
  setZoom: (zoom) => set({ zoom }),
  setCamera: (center, zoom, pitch = 30, bearing = 0) =>
    set({ center, zoom, pitch, bearing }),
  setFollowTrain: (followTrain) => set({ followTrain }),
  toggleFollowTrain: () => set((state) => ({ followTrain: !state.followTrain })),
  setIsMapLoaded: (isMapLoaded) => set({ isMapLoaded }),
  setIsFullscreen: (isFullscreen) => set({ isFullscreen }),
  setActiveLayer: (activeLayer) => set({ activeLayer }),
}));
