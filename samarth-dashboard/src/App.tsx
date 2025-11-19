import { useEffect } from "react";
import "./index.css";
import DashboardPage from "./pages/DashboardPage";
import DarkModeToggle from "./components/DarkModeToggle";
import { useDarkModeStore } from "./stores/darkModeStore";

function App() {
  const { initDarkMode } = useDarkModeStore();

  useEffect(() => {
    initDarkMode();
  }, [initDarkMode]);

  return (
    <div className="min-h-screen from-slate-50 to-slate-200 dark:from-slate-950 dark:to-police-950 transition-colors duration-500">
      <header className="sticky top-0 z-50 glass border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl animate-bounce">🚔</span>
              
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-linear-to-r from-police-600 to-purple-600 dark:from-police-400 dark:to-purple-400">
                  Project SAMARTH
                </h1>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden md:block">
                  Police Analytics & Recognition System
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:block px-3 py-1 rounded-full bg-police-100 dark:bg-police-900/30 text-xs font-semibold text-police-700 dark:text-police-300 border border-police-200 dark:border-police-800">
                v1.0 Live
              </div>
              <DarkModeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 md:px-6 py-8">
        <DashboardPage />
      </main>

      <footer className="text-center py-8 mt-8 text-sm text-slate-500 dark:text-slate-500 border-t border-slate-200/50 dark:border-slate-800/50">
        <p>© {new Date().getFullYear()} Project SAMARTH | Ensuring Safety with Data</p>
      </footer>
    </div>
  );
}

export default App;