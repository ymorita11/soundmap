import { create } from "zustand";
import { Post } from "./types";

interface RecordingData {
  blob: Blob;
  mimeType: string;
  durationMs: number;
}

interface AppState {
  posts: Post[];
  setPosts: (posts: Post[]) => void;

  selectedPost: Post | null;
  setSelectedPost: (post: Post | null) => void;

  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;

  showOnboarding: boolean;
  setShowOnboarding: (show: boolean) => void;

  recording: RecordingData | null;
  setRecording: (data: RecordingData | null) => void;

  location: { latitude: number; longitude: number } | null;
  setLocation: (loc: { latitude: number; longitude: number } | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  posts: [],
  setPosts: (posts) => set({ posts }),

  selectedPost: null,
  setSelectedPost: (post) => set({ selectedPost: post }),

  isPlaying: false,
  setIsPlaying: (playing) => set({ isPlaying: playing }),

  showOnboarding: true,
  setShowOnboarding: (show) => set({ showOnboarding: show }),

  recording: null,
  setRecording: (data) => set({ recording: data }),

  location: null,
  setLocation: (loc) => set({ location: loc }),
}));
