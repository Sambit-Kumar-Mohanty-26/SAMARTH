import "./index.css";
import DashboardPage from "./pages/DashboardPage";

function App() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      {/* Header */}
      <header className="py-6 border-b border-gray-300 dark:border-gray-700 text-center">
        <h1 className="text-4xl font-bold text-blue-600 mb-2">
          🚔 Project SAMARTH
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Smart Analytics Dashboard for Police Good Work Recognition
        </p>
      </header>

      {/* Main Dashboard Content */}
      <main className="container mx-auto px-4 py-8">
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
