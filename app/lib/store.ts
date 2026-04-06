import { create } from "zustand";
import { Post } from "./types";

interface AppState {
  selectedPost: Post | null;
  setSelectedPost: (post: Post | null) => void;

  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;

  showOnboarding: boolean;
  setShowOnboarding: (show: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  selectedPost: null,
  setSelectedPost: (post) => set({ selectedPost: post }),

  isPlaying: false,
  setIsPlaying: (playing) => set({ isPlaying: playing }),

  showOnboarding: true,
  setShowOnboarding: (show) => set({ showOnboarding: show }),
}));
