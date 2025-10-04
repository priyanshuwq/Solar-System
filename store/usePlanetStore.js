import { create } from "zustand";

export const usePlanetStore = create((set, get) => ({
  active: 2,
  planetRefs: {},
  // (audio removed)
  setActive: (i) => set({ active: i }),
  registerPlanetRef: (index, ref) =>
    set((state) => ({ planetRefs: { ...state.planetRefs, [index]: ref } })),
  getPlanetRef: (index) => get().planetRefs[index],
}));

// backward compatible default export
export default usePlanetStore;
