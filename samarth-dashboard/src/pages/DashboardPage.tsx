// src/pages/DashboardPage.tsx
import React from "react";
import { useDistrictsRealtime } from "../hooks/useFirestoreData";
import DistrictLeaderboard from "../components/DistrictLeaderboard";

export default function DashboardPage() {
  const { districts, loading, error } = useDistrictsRealtime();

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">SAMARTH Dashboard</h1>

      {error && (
        <div className="mb-4 text-red-600">Error loading data: {error}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Placeholder for map / KPI cards — add later */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-2">Interactive Map (Coming)</h2>
            <p className="text-sm text-gray-500">Map will show district colors by HPS.</p>
          </div>

          {/* Example KPI summary */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
              <div className="text-sm text-gray-500">Total districts</div>
              <div className="text-2xl font-bold">{districts.length}</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
              <div className="text-sm text-gray-500">Avg HPS</div>
              <div className="text-2xl font-bold">
                {districts.length === 0 ? "—" :
                  (districts.reduce((s, x) => s + (x.hps_score ?? 0), 0) / districts.length).toFixed(1)
                }
              </div>
            </div>
          </div>
        </div>

        <div>
          {loading ? (
            <div className="p-4 bg-white dark:bg-gray-800 rounded shadow">Loading districts...</div>
          ) : (
            <DistrictLeaderboard districts={districts} />
          )}
        </div>
      </div>
    </div>
  );
}
