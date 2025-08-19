import { create } from "zustand";

export const useProcessingStore = create((set) => ({
  isProcessing: false,
  phase: "idle",
  message: "",
  data: null,
  request: { text: "", images: [] },

  start: (phase = "submitting", message = "") =>
    set({ isProcessing: true, phase, message }),
  setPhase: (phase, message = "") => set({ phase, message }),
  complete: (data = null) =>
    set({ isProcessing: false, phase: "idle", message: "", data }),
  fail: (message = "") => set({ isProcessing: false, phase: "idle", message }),
  reset: () =>
    set({
      isProcessing: false,
      phase: "idle",
      message: "",
      data: null,
      request: { text: "", images: [] },
    }),
  setRequest: (request) => set({ request }),
}));
