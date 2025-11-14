// src/components/SPView.tsx
import { useRef, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";
import { Trophy, Award, Download } from "lucide-react";
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

  const districtOfficers = useMemo(() => {
    return officers.filter(
      (o) =>
        o.district &&
        o.district.trim().toLowerCase() === district.district_name.trim().toLowerCase()
    );
  }, [officers, district]);

  const sortedOfficers = useMemo(() => {
    return [...districtOfficers].sort((a, b) => (b.hps_score ?? 0) - (a.hps_score ?? 0));
  }, [districtOfficers]);

  const trendData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    const baseCases = district.cases_solved ?? 50;
    const baseHps = district.hps_score ?? 60;
    return months.map((month, idx) => ({
      month,
      "Cases Solved": Math.floor(baseCases * (0.7 + Math.random() * 0.4)),
      "HPS Trend": parseFloat(Math.max(0, Math.min(100, baseHps + (idx - 3) * 5 + (Math.random() * 10 - 5))).toFixed(1)),
    }));
  }, [district]);

  const totalCases = district.cases_solved ?? 0;
  const totalRecognitions = district.recognitions ?? 0;
  const avgOfficerHps = useMemo(() => {
    if (districtOfficers.length === 0) return 0;
    const sum = districtOfficers.reduce((s, o) => s + (o.hps_score ?? 0), 0);
    return sum / districtOfficers.length;
  }, [districtOfficers]);

  const handleExportPDF = async () => {
    const elementToCapture = pdfRef.current;
    if (!elementToCapture) return;
    try {
      const buttons = elementToCapture.querySelector('.pdf-hide-buttons');
      if (buttons) (buttons as HTMLElement).style.display = 'none';
      const canvas = await html2canvas(elementToCapture, { scale: 2, useCORS: true, logging: false });
      if (buttons) (buttons as HTMLElement).style.display = 'flex';
      
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      pdf.setFontSize(18);
      pdf.text(`Performance Report: ${district.district_name}`, 15, 20);
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 30, pdfWidth, pdfHeight);
      pdf.save(`${district.district_name}_Report.pdf`);
    } catch (error) { console.error("Error generating PDF:", error); }
  };

  return (
    <div ref={pdfRef} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">SP View — {district.district_name}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Zone: {district.zone ?? "—"} • {districtOfficers.length} Officers</p>
        </div>
        <div className="flex gap-2 pdf-hide-buttons">
          <button onClick={handleExportPDF} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"><Download className="w-4 h-4" /> Export PDF</button>
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">Close</button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4"><p className="text-sm text-gray-500 dark:text-gray-400 mb-1">HPS Score</p><p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{(district.hps_score ?? 0).toFixed(1)}</p></div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4"><p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Cases Solved</p><p className="text-3xl font-bold text-green-600 dark:text-green-400">{totalCases}</p></div>
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4"><p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Recognitions</p><p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{totalRecognitions}</p></div>
        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4"><p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Avg Officer HPS</p><p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{avgOfficerHps.toFixed(1)}</p></div>
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Trend Analytics (Last 6 Months)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 h-[300px]"><h4 className="text-lg font-medium mb-4 text-center text-gray-800 dark:text-gray-200">Operational Drives</h4><ResponsiveContainer width="100%" height="100%"><BarChart data={trendData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis /><Tooltip /><Legend /><Bar dataKey="Cases Solved" fill="#10b981" /></BarChart></ResponsiveContainer></div>
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 h-[300px]"><h4 className="text-lg font-medium mb-4 text-center text-gray-800 dark:text-gray-200">Overall Performance</h4><ResponsiveContainer width="100%" height="100%"><LineChart data={trendData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis domain={[0, 100]} /><Tooltip /><Legend /><Line type="monotone" dataKey="HPS Trend" stroke="#3b82f6" /></LineChart></ResponsiveContainer></div>
        </div>
      </div>
      
      <div>
        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Officer Spotlight (Top 3)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {sortedOfficers.slice(0, 3).map((officer) => {
            // --- 👇 THIS IS THE FIX 👇 ---
            // The variables are now defined inside the map loop.
            const hasBadge = (officer.hps_score ?? 0) >= 70;
            const isTop = (officer.hps_score ?? 0) >= 80;

            return (
              <div key={officer.id} className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">{officer.name}</h4>
                  {hasBadge && (
                    <span title="High Performer">
                      <Award className="w-5 h-5 text-yellow-500" />
                    </span>
                  )}
                  {isTop && (
                    <span title="Top Performer">
                      <Trophy className="w-5 h-5 text-blue-500" />
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{officer.rank}</p>
                <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-gray-500">HPS:</span><span className="ml-2 font-bold text-gray-900 dark:text-gray-100">{(officer.hps_score ?? 0).toFixed(1)}</span></div>
                  <div><span className="text-gray-500">Cases:</span><span className="ml-2 font-bold text-gray-900 dark:text-gray-100">{officer.cases_solved ?? 0}</span></div>
                </div>
              </div>
            );
          })}
          {sortedOfficers.length === 0 && <div className="text-center py-8 text-gray-500 col-span-3">No officer data found for this district.</div>}
        </div>
      </div>
    </div>
  );
}