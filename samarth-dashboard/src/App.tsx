import { useState } from "react";
import "./index.css";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      {/* Header Section */}
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-blue-600 mb-2">
          🚔 Project SAMARTH
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Smart Analytics Dashboard for Police Good Work Recognition
        </p>
      </header>

      {/* Test Interactive Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 w-80 text-center border border-gray-200 dark:border-gray-700">
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          This is your Tailwind + React test component.
        </p>

        <button
          onClick={() => setCount((count) => count + 1)}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md transition-transform duration-200 hover:scale-105"
        >
          Count is {count}
        </button>

        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>

      {/* Footer */}
      <footer className="mt-8 text-sm text-gray-500 dark:text-gray-400">
        © {new Date().getFullYear()} SAMARTH | Built with ❤️ using React + Vite + Tailwind
      </footer>
    </div>
  );
}

export default App;
