// src/pages/DashboardPage.tsx
import { useMemo, useState } from "react";
import { Download } from "lucide-react"; // <-- Real import
import { useFirestoreData } from "../hooks/useFirestoreData";
import { useHistoricalData } from "../hooks/useHistoricalData"; // <-- Real import
import { exportToPdf, exportToExcel } from "../services/ReportService"; // <-- Real import
import DistrictLeaderboard from "../components/DistrictLeaderboard";
import InteractiveMap from "../components/InteractiveMap";
import SPView from "../components/SPView";
import AIInsights from "../components/AIInsights";
import FeedbackForm from "../components/FeedbackForm";
import ZoneHpsPie from "../components/ZoneHpsPie";
import TopDistrictsBar from "../components/TopDistrictsBar";
import MonthlyTrendChart from "../components/MonthlyTrendChart"; // <-- Real import
import type { District } from "../types";

export default function DashboardPage() {
  const { districts, officers, summary, aiInsights, loading, error } = useFirestoreData();
  const { historicalData, loading: historyLoading } = useHistoricalData();
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"dashboard" | "feedback">("dashboard");

  const selectedDistrictObj: District | null = useMemo(() => {
    if (!selectedDistrict) return null;
    return districts.find(d => d.district_name && d.district_name.trim().toLowerCase() === selectedDistrict.trim().toLowerCase()) ?? null;
  }, [selectedDistrict, districts]);

  const handleExportPDF = () => {
    exportToPdf(summary, districts, aiInsights);
  };

  const handleExportExcel = () => {
    exportToExcel(summary, districts, aiInsights);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Tab Navigation & Export Buttons */}
      <div className="flex justify-between items-center border-b border-gray-300 dark:border-gray-700">
        {/* Tabs */}
        <div className="flex gap-4">
          <button onClick={() => setActiveTab("dashboard")} className={`px-4 py-2 font-semibold transition-colors ${activeTab === "dashboard" ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400" : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"}`}>Dashboard</button>
          <button onClick={() => setActiveTab("feedback")} className={`px-4 py-2 font-semibold transition-colors ${activeTab === "feedback" ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400" : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"}`}>Public Feedback</button>
        </div>
        
        {/* Export Buttons */}
        {activeTab === "dashboard" && (
          <div className="flex gap-2">
             <button
              onClick={handleExportPDF}
              className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
            >
              <Download size={16} />
              Export PDF
            </button>
             <button
              onClick={handleExportExcel}
              className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
            >
              <Download size={16} />
              Export Excel
            </button>
          </div>
        )}
      </div>

      {activeTab === "dashboard" ? (
        <>
          {error && <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border rounded-lg text-red-700 dark:text-red-300">Error: {error}</div>}

          {/* KPI CARDS SECTION */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {summary ? (
              <>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow text-center"><div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Statewide Conviction Ratio</div><div className="text-3xl font-bold text-green-600 dark:text-green-400">{summary.statewideConvictionRatio}%</div></div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow text-center"><div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Drug Seizure (KG)</div><div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{summary.totalDrugSeizureVolume_kg}</div></div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow text-center"><div className="text-sm text-gray-500 dark:text-gray-400 mb-2">NBWs Executed</div><div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{summary.totalNbwsExecuted}</div></div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow text-center"><div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Value Recovered (INR)</div><div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{new Intl.NumberFormat('en-IN').format(summary.totalValueRecovered_INR)}</div></div>
              </>
            ) : ([...Array(4)].map((_, i) => <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow h-28 animate-pulse"></div>))}
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* LEFT COLUMN (Main Content) */}
            <div className="lg:col-span-2 space-y-6">
              <AIInsights aiInsights={aiInsights} loading={loading} />
              <MonthlyTrendChart data={historicalData} loading={historyLoading} /> 
              <TopDistrictsBar districts={districts} />
              <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">Interactive Map</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Map shows district colors by HPS. Click a district to open SP View.</p>
                <div className="w-full h-[560px] rounded-lg overflow-hidden shadow-sm"><InteractiveMap districts={districts} onDistrictClick={(name) => setSelectedDistrict(name)} /></div>
              </section>
            </div>
            
            {/* RIGHT COLUMN (Sidebar) */}
            <aside className="w-full">
              <div className="sticky top-6 space-y-6">
                {loading ? <div className="p-4 bg-white dark:bg-gray-800 rounded shadow text-gray-500">Loading data...</div>
                 : <>
                    <ZoneHpsPie districts={districts} />
                    <DistrictLeaderboard districts={districts} />
                   </>
                }
              </div>
            </aside>
          </div>

          {/* SP View Modal (Drill Down) */}
          {selectedDistrict && selectedDistrictObj && <section className="mt-6"><SPView district={selectedDistrictObj} officers={officers} onClose={() => setSelectedDistrict(null)} /></section>}
        </>
      ) : (<div className="max-w-3xl mx-auto"><FeedbackForm /></div>)}
    </div>
  );
}