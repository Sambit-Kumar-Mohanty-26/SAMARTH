// src/components/SPView.tsx
import { useRef, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";
import { Trophy, Award, Download, Star } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import type { District, Officer } from "../types";

type Props = {
  district: District;
  officers: Officer[];
  onClose: () => void;
};

export default function SPView({ district, officers, onClose }: Props) {
  const pdfRef = useRef<HTMLDivElement>(null);

  // Filter officers for this district
  const districtOfficers = useMemo(() => {
    return officers.filter(
      (o) =>
        o.district &&
        o.district.trim().toLowerCase() === district.district_name.trim().toLowerCase()
    );
  }, [officers, district]);

  // Sort officers by HPS score (highest first)
  const sortedOfficers = useMemo(() => {
    return [...districtOfficers].sort((a, b) => (b.hps_score ?? 0) - (a.hps_score ?? 0));
  }, [districtOfficers]);

  // Prepare chart data for cases solved over time (last 6 months)
  const casesData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    const baseCases = district.cases_solved ?? 0;
    return months.map((month, idx) => ({
      month,
      cases: Math.floor(baseCases * (0.7 + (idx * 0.1))), // Simulated trend
    }));
  }, [district.cases_solved]);

  // Prepare HPS trend data
  const hpsTrendData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    const currentHps = district.hps_score ?? 0;
    return months.map((month, idx) => ({
      month,
      hps: Math.max(0, Math.min(100, currentHps + (idx - 3) * 2)), // Simulated trend around current HPS
    }));
  }, [district.hps_score]);

  // Calculate stats
  const totalCases = district.cases_solved ?? 0;
  const totalRecognitions = district.recognitions ?? 0;
  const avgOfficerHps = useMemo(() => {
    if (districtOfficers.length === 0) return 0;
    const sum = districtOfficers.reduce((s, o) => s + (o.hps_score ?? 0), 0);
    return sum / districtOfficers.length;
  }, [districtOfficers]);

  // PDF Export function
  const handleExportPDF = async () => {
    if (!pdfRef.current) return;

    try {
      const canvas = await html2canvas(pdfRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${district.district_name}_Report.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to export PDF. Please try again.");
    }
  };

  return (
    <div ref={pdfRef} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            SP View — {district.district_name}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Zone: {district.zone ?? "—"} • {districtOfficers.length} Officers
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export PDF
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">HPS Score</div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {(district.hps_score ?? 0).toFixed(1)}
          </div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Cases Solved</div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{totalCases}</div>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Recognitions</div>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{totalRecognitions}</div>
        </div>
        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Avg Officer HPS</div>
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {avgOfficerHps.toFixed(1)}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Cases Solved Chart */}
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
            Cases Solved (Last 6 Months)
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={casesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="cases" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* HPS Trend Chart */}
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
            HPS Trend (Last 6 Months)
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={hpsTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="hps" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Officer Spotlight */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Officer Spotlight
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedOfficers.slice(0, 6).map((officer) => {
            const isTopPerformer = (officer.hps_score ?? 0) >= 80;
            const hasBadge = (officer.hps_score ?? 0) >= 70;

            return (
              <div
                key={officer.id}
                className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                        {officer.name}
                      </h4>
                      {hasBadge && (
                        <span title="High Performer Badge">
                          <Award className="w-5 h-5 text-yellow-500" />
                        </span>
                      )}
                      {isTopPerformer && (
                        <span title="Top Performer">
                          <Trophy className="w-5 h-5 text-blue-500" />
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{officer.rank}</p>
                    {officer.badge_number && (
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        Badge: {officer.badge_number}
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">HPS:</span>
                    <span className="ml-2 font-bold text-gray-900 dark:text-gray-100">
                      {(officer.hps_score ?? 0).toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Cases:</span>
                    <span className="ml-2 font-bold text-gray-900 dark:text-gray-100">
                      {officer.cases_solved ?? 0}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Recognition:</span>
                    <span className="ml-2 font-bold text-gray-900 dark:text-gray-100">
                      {officer.recognitions ?? 0}
                    </span>
                  </div>
                  <div className="flex items-center">
                    {isTopPerformer && (
                      <Star className="w-4 h-4 text-yellow-500 mr-1" />
                    )}
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {isTopPerformer ? "Top Performer" : "Active"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {sortedOfficers.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No officers found for this district.
          </div>
        )}
      </div>

      {/* All Officers List */}
      {sortedOfficers.length > 6 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
            All Officers ({sortedOfficers.length})
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-700">
                  <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">
                    Name
                  </th>
                  <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">
                    Rank
                  </th>
                  <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">
                    HPS
                  </th>
                  <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">
                    Cases
                  </th>
                  <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">
                    Recognitions
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedOfficers.map((officer) => (
                  <tr key={officer.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                      {officer.name}
                    </td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                      {officer.rank}
                    </td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                      {(officer.hps_score ?? 0).toFixed(1)}
                    </td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                      {officer.cases_solved ?? 0}
                    </td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                      {officer.recognitions ?? 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

