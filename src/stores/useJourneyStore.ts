import { create } from "zustand";

export type BottomSheetState = "collapsed" | "partial" | "expanded";
export type JourneyTab = "live" | "timeline" | "analytics" | "companion";

interface JourneyState {
  selectedJourneyId: string | null;
  bottomSheetState: BottomSheetState;
  activeTab: JourneyTab;
  isShareModalOpen: boolean;
  autoRefreshEnabled: boolean;
  refreshIntervalSeconds: number;
  lastRefreshedAt: number;

  setSelectedJourneyId: (id: string | null) => void;
  setBottomSheetState: (state: BottomSheetState) => void;
  setActiveTab: (tab: JourneyTab) => void;
  setIsShareModalOpen: (open: boolean) => void;
  setAutoRefreshEnabled: (enabled: boolean) => void;
  setLastRefreshedAt: (timestamp: number) => void;
}

export const useJourneyStore = create<JourneyState>((set) => ({
  selectedJourneyId: null,
  bottomSheetState: "partial",
  activeTab: "live",
  isShareModalOpen: false,
  autoRefreshEnabled: true,
  refreshIntervalSeconds: 30,
  lastRefreshedAt: Date.now(),

  setSelectedJourneyId: (id) => set({ selectedJourneyId: id }),
  setBottomSheetState: (state) => set({ bottomSheetState: state }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setIsShareModalOpen: (open) => set({ isShareModalOpen: open }),
  setAutoRefreshEnabled: (enabled) => set({ autoRefreshEnabled: enabled }),
  setLastRefreshedAt: (timestamp) => set({ lastRefreshedAt: timestamp }),
}));
