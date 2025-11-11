// src/stores/darkModeStore.ts
import { create } from "zustand";

interface DarkModeState {
  isDarkMode: boolean;
  isInitialized: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (isDark: boolean) => void;
  initDarkMode: () => void;
}

// Load from localStorage on initialization
const getInitialDarkMode = (): boolean => {
  if (typeof window === "undefined") return false;
  try {
    const saved = localStorage.getItem("dark-mode");
    if (saved !== null) {
      return saved === "true";
    }
    // Check system preference
    if (window.matchMedia) {
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
  } catch (e) {
    console.error("Error reading dark mode preference:", e);
  }
  return false;
};

export const useDarkModeStore = create<DarkModeState>((set, get) => ({
  isDarkMode: false,
  isInitialized: false,
  initDarkMode: () => {
    if (get().isInitialized) return; // Only initialize once
    
    const isDark = getInitialDarkMode();
    if (typeof document !== "undefined") {
      if (isDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
    set({ isDarkMode: isDark, isInitialized: true });
  },
  toggleDarkMode: () => {
    if (typeof document === "undefined") return;
    
    set((state) => {
      const newMode = !state.isDarkMode;
      // Apply dark mode class to html element
      if (newMode) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      // Save to localStorage
      try {
        localStorage.setItem("dark-mode", String(newMode));
      } catch (e) {
        console.error("Error saving dark mode preference:", e);
      }
      return { isDarkMode: newMode };
    });
  },
  setDarkMode: (isDark: boolean) => {
    if (typeof document === "undefined") return;
    
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    try {
      localStorage.setItem("dark-mode", String(isDark));
    } catch (e) {
      console.error("Error saving dark mode preference:", e);
    }
    set({ isDarkMode: isDark });
  },
}));

