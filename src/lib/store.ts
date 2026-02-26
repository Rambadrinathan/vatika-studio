import { create } from "zustand";
import type { SpaceType } from "./catalog";

export interface GeneratedImage {
  url: string;
  prompt: string;
  timestamp: number;
}

export interface DesignEntry {
  budget: number;
  spaceType?: SpaceType;
  render: GeneratedImage;
}

export interface DesignState {
  step: 1 | 2;
  setStep: (step: 1 | 2) => void;

  photo: string | null;
  setPhoto: (dataUri: string | null) => void;

  spaceType: SpaceType;
  setSpaceType: (t: SpaceType) => void;

  budget: number;
  setBudget: (b: number) => void;

  designs: DesignEntry[];
  addDesign: (entry: DesignEntry) => void;
  setDesigns: (designs: DesignEntry[]) => void;

  isGenerating: boolean;
  setIsGenerating: (v: boolean) => void;
  error: string | null;
  setError: (e: string | null) => void;

  freeRenditionsUsed: number;
  incrementRenditions: () => void;

  // Auth
  user: { id: string; name: string; phone?: string } | null;
  setUser: (u: { id: string; name: string; phone?: string } | null) => void;

  reset: () => void;
}

export const useDesignStore = create<DesignState>((set) => ({
  step: 1,
  setStep: (step) => set({ step }),

  photo: null,
  setPhoto: (photo) => set({ photo }),

  spaceType: "balcony",
  setSpaceType: (spaceType) => set({ spaceType }),

  budget: 50000,
  setBudget: (budget) => set({ budget }),

  designs: [],
  addDesign: (entry) =>
    set((s) => ({
      designs: [
        entry,
        ...s.designs.filter(
          (d) => !(d.budget === entry.budget && (d.spaceType || "balcony") === (entry.spaceType || "balcony"))
        ),
      ],
    })),
  setDesigns: (designs) => set({ designs }),

  isGenerating: false,
  setIsGenerating: (isGenerating) => set({ isGenerating }),
  error: null,
  setError: (error) => set({ error }),

  freeRenditionsUsed: 0,
  incrementRenditions: () =>
    set((s) => ({ freeRenditionsUsed: s.freeRenditionsUsed + 1 })),

  user: null,
  setUser: (user) => set({ user }),

  reset: () =>
    set({
      step: 1,
      photo: null,
      spaceType: "balcony",
      budget: 50000,
      designs: [],
      isGenerating: false,
      error: null,
    }),
}));

export const MAX_FREE_RENDITIONS = 5;
