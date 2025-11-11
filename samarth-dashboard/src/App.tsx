import { useEffect } from "react";
import "./index.css";
import DashboardPage from "./pages/DashboardPage";
import DarkModeToggle from "./components/DarkModeToggle";
import { useDarkModeStore } from "./stores/darkModeStore";

function App() {
  const { initDarkMode } = useDarkModeStore();

  useEffect(() => {
    // Initialize dark mode on mount
    initDarkMode();
  }, [initDarkMode]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      {/* Header */}
      <header className="py-4 md:py-6 border-b border-gray-300 dark:border-gray-700">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl md:text-4xl font-bold text-blue-600 dark:text-blue-400">
              🚔 Project SAMARTH
            </h1>
            <div className="flex items-center">
              <DarkModeToggle />
            </div>
          </div>
          <p className="text-sm md:text-lg text-gray-600 dark:text-gray-400 text-center md:text-left">
            Smart Analytics Dashboard for Police Good Work Recognition
          </p>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <main className="container mx-auto px-4 md:px-6 py-6 md:py-8">
        <DashboardPage />
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-sm text-gray-500 dark:text-gray-400 border-t border-gray-300 dark:border-gray-700">
        © {new Date().getFullYear()} SAMARTH | Built with ❤️ using React + Vite + Tailwind
      </footer>
    </div>
  );
}

export default App;
