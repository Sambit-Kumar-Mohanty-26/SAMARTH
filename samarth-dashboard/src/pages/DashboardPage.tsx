// src/pages/DashboardPage.tsx
import React, { useMemo, useState } from "react";
import { useFirestoreData } from "../hooks/useFirestoreData";
import DistrictLeaderboard from "../components/DistrictLeaderboard";
import InteractiveMap from "../components/InteractiveMap";
import SPView from "../components/SPView";
import AIInsights from "../components/AIInsights";
import FeedbackForm from "../components/FeedbackForm";
import type { District } from "../types";

export default function DashboardPage() {
  const { districts, officers, summary, aiInsights, loading, error } = useFirestoreData();
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"dashboard" | "feedback">("dashboard");

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
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Tab Navigation */}
      <div className="flex gap-4 border-b border-gray-300 dark:border-gray-700">
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`px-4 py-2 font-semibold transition-colors ${
            activeTab === "dashboard"
              ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab("feedback")}
          className={`px-4 py-2 font-semibold transition-colors ${
            activeTab === "feedback"
              ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
          }`}
        >
          Public Feedback
        </button>
      </div>

      {activeTab === "dashboard" ? (
        <>
          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
              Error loading data: {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Left / main column */}
            <div className="lg:col-span-2 space-y-6">
              {/* AI Insights */}
              <AIInsights aiInsights={aiInsights} loading={loading} />

              {/* Interactive Map */}
              <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">Interactive Map</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
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
              <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow text-center">
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Total Districts</div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{totalDistricts}</div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow text-center">
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Avg HPS</div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{avgHps.toFixed(1)}</div>
                </div>

                {summary && (
                  <>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow text-center">
                      <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Total Officers</div>
                      <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                        {summary.total_officers}
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow text-center">
                      <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Cases Solved</div>
                      <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                        {summary.total_cases_solved}
                      </div>
                    </div>
                  </>
                )}
              </section>
            </div>

            {/* Right column (leaderboard) */}
            <aside className="w-full">
              <div className="sticky top-6">
                {loading ? (
                  <div className="p-4 bg-white dark:bg-gray-800 rounded shadow text-gray-500 dark:text-gray-400">
                    Loading districts...
                  </div>
                ) : (
                  <DistrictLeaderboard districts={districts} />
                )}
              </div>
            </aside>
          </div>

          {/* SP View (drilldown) */}
          {selectedDistrict && selectedDistrictObj && (
            <section className="mt-6">
              <SPView
                district={selectedDistrictObj}
                officers={officers}
                onClose={() => setSelectedDistrict(null)}
              />
            </section>
          )}
        </>
      ) : (
        <div className="max-w-3xl mx-auto">
          <FeedbackForm />
        </div>
      )}
    </div>
  );
}
