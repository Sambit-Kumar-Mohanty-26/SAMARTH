// src/pages/DashboardPage.tsx
import React, { useMemo, useState } from "react";
import { useDistrictsRealtime } from "../hooks/useFirestoreData";
import DistrictLeaderboard from "../components/DistrictLeaderboard";
import InteractiveMap from "../components/InteractiveMap";
import type { District } from "../types";

export default function DashboardPage() {
  const { districts, loading, error } = useDistrictsRealtime();
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);

  // derived values
  const totalDistricts = districts.length;
  const avgHps = useMemo(() => {
    if (districts.length === 0) return 0;
    const sum = districts.reduce((s, d) => s + (d.hps_score ?? 0), 0);
    return sum / districts.length;
  }, [districts]);

  // helper to get full district object for SP view
  const selectedDistrictObj: District | null = useMemo(() => {
    if (!selectedDistrict) return null;
    return (
      districts.find(
        (d) =>
          d.district_name &&
          d.district_name.trim().toLowerCase() === selectedDistrict.trim().toLowerCase()
      ) ?? null
    );
  }, [selectedDistrict, districts]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">
      {/* Single page title only */}
      <h1 className="text-4xl md:text-5xl font-extrabold text-center text-gray-900 dark:text-gray-100 mb-8">
        SAMARTH Dashboard
      </h1>

      {error && <div className="mb-4 text-red-600">Error loading data: {error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left / main column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Interactive Map */}
          <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <h2 className="text-xl font-semibold mb-2">Interactive Map</h2>
            <p className="text-sm text-gray-500 mb-4">
              Map shows district colors by HPS. Click a district to open SP View.
            </p>

            <div className="w-full h-[560px] rounded-lg overflow-hidden shadow-sm">
              <InteractiveMap
                districts={districts}
                onDistrictClick={(name) => setSelectedDistrict(name)}
              />
            </div>
          </section>

          {/* KPI summary */}
          <section className="grid grid-cols-2 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow text-center">
              <div className="text-sm text-gray-500 mb-2">Total districts</div>
              <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{totalDistricts}</div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow text-center">
              <div className="text-sm text-gray-500 mb-2">Avg HPS</div>
              <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{avgHps.toFixed(1)}</div>
            </div>
          </section>
        </div>

        {/* Right column (leaderboard) */}
        <aside className="w-full">
          <div className="sticky top-6">
            {loading ? (
              <div className="p-4 bg-white dark:bg-gray-800 rounded shadow">Loading districts...</div>
            ) : (
              <DistrictLeaderboard districts={districts} />
            )}
          </div>
        </aside>
      </div>

      {/* SP View (drilldown) */}
      {selectedDistrict && (
        <section className="mt-6 bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold mb-2">SP View — {selectedDistrict}</h2>
            <button
              onClick={() => setSelectedDistrict(null)}
              className="text-sm px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-md"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="p-4 border rounded">
              <div className="text-sm text-gray-500">District</div>
              <div className="font-bold">{selectedDistrictObj?.district_name ?? selectedDistrict}</div>
            </div>

            <div className="p-4 border rounded">
              <div className="text-sm text-gray-500">HPS</div>
              <div className="font-bold">{(selectedDistrictObj?.hps_score ?? 0).toFixed(1)}</div>
            </div>

            <div className="p-4 border rounded">
              <div className="text-sm text-gray-500">Officers</div>
              <div className="font-bold">{selectedDistrictObj?.officer_count ?? "—"}</div>
            </div>
          </div>

          <div className="mt-6">
            <p className="text-sm text-gray-500">
              Drill-down charts, officer list and recognition history for the selected district will appear here.
            </p>
            {/* TODO: embed charts / officer list components */}
          </div>
        </section>
      )}

      
    </div>
  );
}
