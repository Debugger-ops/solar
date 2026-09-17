// Central UI/simulation state, kept in one small zustand store so any
// component (the canvas, the HUD, a future feature) can read or drive it
// without prop-drilling. Add new controls here as the project grows.
import { create } from 'zustand'

export const useOrreryStore = create((set) => ({
  daysPerSecond: 20,
  running: true,
  showOrbits: true,
  showLabels: true,
  selected: 'Sun', // name of the selected body, or 'Sun'

  setSpeed: (daysPerSecond) => set({ daysPerSecond }),
  toggleRunning: () => set((s) => ({ running: !s.running })),
  setRunning: (running) => set({ running }),
  toggleOrbits: () => set((s) => ({ showOrbits: !s.showOrbits })),
  toggleLabels: () => set((s) => ({ showLabels: !s.showLabels })),
  select: (name) => set({ selected: name }),
}))
