// src/components/DarkModeToggle.tsx
import React from "react";
import { Moon, Sun } from "lucide-react";
import { useDarkModeStore } from "../stores/darkModeStore";

export default function DarkModeToggle() {
  const { isDarkMode, toggleDarkMode } = useDarkModeStore();

  return (
    <button
      onClick={toggleDarkMode}
      className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
      aria-label="Toggle dark mode"
      title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDarkMode ? (
        <Sun className="w-5 h-5" />
      ) : (
        <Moon className="w-5 h-5" />
      )}
    </button>
  );
}

