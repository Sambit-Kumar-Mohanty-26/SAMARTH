// src/pages/DashboardPage.tsx
import { useMemo, useState } from "react";
import { LayoutDashboard, MessageSquare, FileUp, FileSpreadsheet, FileText } from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable"; // FIXED IMPORT
import * as ExcelJS from "exceljs";
import { saveAs } from "file-saver";

import { useFirestoreData } from "../hooks/useFirestoreData";
import { useHistoricalData } from "../hooks/useHistoricalData";
import DistrictLeaderboard from "../components/DistrictLeaderboard";
import InteractiveMap from "../components/InteractiveMap";
import SPView from "../components/SPView";
import AIInsights from "../components/AIInsights";
import FeedbackForm from "../components/FeedbackForm";
import ZoneHpsPie from "../components/ZoneHpsPie";
import ReportUploader from "../components/ReportUploader";
import TopDistrictsBar from "../components/TopDistrictsBar";
import MonthlyTrendChart from "../components/MonthlyTrendChart";
import type { District } from "../types";

export default function DashboardPage() {
  const { districts, officers, summary, aiInsights, loading, error } = useFirestoreData();
  const { historicalData, loading: historyLoading } = useHistoricalData();
  
  const [selectedDistrictName, setSelectedDistrictName] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"dashboard" | "feedback" | "upload">("dashboard");

  const selectedDistrictObj: District | null = useMemo(() => {
    if (!selectedDistrictName) return null;
    const normalizedName = selectedDistrictName.trim().toLowerCase();
    return districts.find(d => d.district_name?.trim().toLowerCase() === normalizedName) ?? null;
  }, [selectedDistrictName, districts]);

  // --- 1. Advanced PDF Export (Statewide) ---
  const handleExportPDF = () => {
    const doc = new jsPDF();

    // Header
    doc.setFillColor(30, 58, 138); // Navy Blue
    doc.rect(0, 0, 210, 40, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("Project SAMARTH", 14, 20);
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Statewide Performance Report | Generated: ${new Date().toLocaleDateString()}`, 14, 30);

    // Summary Section
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("1. Executive Summary", 14, 50);

    let finalY = 55;

    if (summary) {
        const summaryData = [
            ["Statewide Conviction Ratio", `${summary.statewideConvictionRatio}%`],
            ["Total Drug Seizure", `${summary.totalDrugSeizureVolume_kg} kg`],
            ["Total NBWs Executed", `${summary.totalNbwsExecuted}`],
            ["Value Recovered", `INR ${summary.totalValueRecovered_INR}`]
        ];
        
        // FIXED: Use autoTable(doc, options) syntax
        autoTable(doc, {
            startY: 55,
            head: [['Metric', 'Value']],
            body: summaryData,
            theme: 'striped',
            headStyles: { fillColor: [30, 58, 138] },
            styles: { fontSize: 11 }
        });

        finalY = (doc as any).lastAutoTable.finalY + 15;
    }

    // AI Insights Section
    if (aiInsights?.naturalLanguageSummary) {
        doc.text("2. AI Strategic Analysis", 14, finalY);
        doc.setFontSize(10);
        doc.setFont("helvetica", "italic");
        const splitText = doc.splitTextToSize(`"${aiInsights.naturalLanguageSummary}"`, 180);
        doc.text(splitText, 14, finalY + 8);
        finalY += 15 + (splitText.length * 5);
    } else {
        finalY += 10;
    }

    // District Table
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("3. District Performance Data", 14, finalY);

    const tableRows = districts.map(d => [
        d.district_name,
        d.zone || "-",
        d.hps_score?.toFixed(2) || "0",
        `${d.conviction_ratio || 0}%`,
        d.nbws_executed || 0,
        d.drug_seizure_kg || 0
    ]);

    // FIXED: Use autoTable(doc, options) syntax
    autoTable(doc, {
        startY: finalY + 5,
        head: [['District', 'Zone', 'HPS', 'Conviction', 'NBWs', 'Drugs (kg)']],
        body: tableRows,
        theme: 'grid',
        headStyles: { fillColor: [40, 40, 40] },
        styles: { fontSize: 10 }
    });

    doc.save("Samarth_Statewide_Report.pdf");
  };

  // --- 2. Advanced Excel Export (Statewide) ---
  const handleExportExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    
    const sheet1 = workbook.addWorksheet('Executive Summary');
    sheet1.columns = [{ header: 'Metric', key: 'metric', width: 30 }, { header: 'Value', key: 'value', width: 20 }];
    
    sheet1.addRow(['Project SAMARTH', 'Statewide Report']);
    sheet1.mergeCells('A1:B1');
    sheet1.getCell('A1').font = { bold: true, size: 16, color: { argb: 'FFFFFFFF' } };
    sheet1.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } };
    
    if (summary) {
        sheet1.addRow(['Generated On', new Date().toLocaleString()]);
        sheet1.addRow([]);
        sheet1.addRow(['Statewide Conviction Ratio', `${summary.statewideConvictionRatio}%`]);
        sheet1.addRow(['Total Drug Seizure (kg)', summary.totalDrugSeizureVolume_kg]);
        sheet1.addRow(['Total NBWs Executed', summary.totalNbwsExecuted]);
        sheet1.addRow(['Total Value Recovered', summary.totalValueRecovered_INR]);
    }

    const sheet2 = workbook.addWorksheet('District Data');
    sheet2.columns = [
        { header: 'District', key: 'name', width: 25 },
        { header: 'Zone', key: 'zone', width: 15 },
        { header: 'HPS Score', key: 'hps', width: 12 },
        { header: 'Conviction %', key: 'conviction', width: 15 },
        { header: 'NBWs', key: 'nbw', width: 10 },
        { header: 'Drugs (kg)', key: 'drug', width: 15 },
        { header: 'Cases Solved', key: 'cases', width: 15 },
        { header: 'Recognitions', key: 'recog', width: 15 },
    ];

    sheet2.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    sheet2.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF374151' } };

    districts.forEach(d => {
        sheet2.addRow({
            name: d.district_name,
            zone: d.zone || '-',
            hps: d.hps_score || 0,
            conviction: d.conviction_ratio || 0,
            nbw: d.nbws_executed || 0,
            drug: d.drug_seizure_kg || 0,
            cases: d.cases_solved || 0,
            recog: d.recognitions || 0
        });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, 'Samarth_Statewide_Data.xlsx');
  };

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "feedback", label: "Public Feedback", icon: MessageSquare },
    { id: "upload", label: "Upload Data", icon: FileUp },
  ] as const;

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white/50 dark:bg-slate-800/50 p-4 rounded-2xl backdrop-blur-sm border border-slate-200 dark:border-slate-700">
        <div className="flex p-1 space-x-1 bg-slate-200/50 dark:bg-slate-900/50 rounded-xl">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${activeTab === tab.id ? "bg-white dark:bg-blue-600 text-blue-700 dark:text-white shadow-md" : "text-slate-600 dark:text-slate-400 hover:bg-white/50"}`}
            >
              <tab.icon size={16} /> {tab.label}
            </button>
          ))}
        </div>
        
        {activeTab === "dashboard" && (
          <div className="flex gap-3">
             <button onClick={handleExportPDF} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm font-medium shadow-sm text-slate-700 dark:text-slate-200">
              <FileText size={16} className="text-red-500" /> PDF
            </button>
             <button onClick={handleExportExcel} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm font-medium shadow-sm text-slate-700 dark:text-slate-200">
              <FileSpreadsheet size={16} className="text-green-500" /> Excel
            </button>
          </div>
        )}
      </div>

      {activeTab === "dashboard" && (
        <div className="space-y-8">
          {error && <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl">Error: {error}</div>}

          <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {summary ? (
              <>
                <KPICard title="Conviction Ratio" value={`${summary.statewideConvictionRatio}%`} color="text-green-600 dark:text-green-400" />
                <KPICard title="Drug Seizure (KG)" value={summary.totalDrugSeizureVolume_kg} color="text-purple-600 dark:text-purple-400" />
                <KPICard title="NBWs Executed" value={summary.totalNbwsExecuted} color="text-blue-600 dark:text-blue-400" />
                <KPICard title="Value Recovered" value={`₹${new Intl.NumberFormat('en-IN', { notation: "compact" }).format(summary.totalValueRecovered_INR)}`} color="text-amber-600 dark:text-amber-400" />
              </>
            ) : (
              [...Array(4)].map((_, i) => <div key={i} className="h-32 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />)
            )}
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-2 space-y-6">
              <AIInsights aiInsights={aiInsights} loading={loading} />
              <div className="glass rounded-2xl p-1"><MonthlyTrendChart data={historicalData} loading={historyLoading} /></div>
              <div className="glass rounded-2xl p-1"><TopDistrictsBar districts={districts} /></div>
              <section className="glass rounded-2xl p-6">
                <h2 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">Live Jurisdiction Map</h2>
                <div className="w-full h-[600px] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                  <InteractiveMap districts={districts} onDistrictClick={(name) => setSelectedDistrictName(name)} />
                </div>
              </section>
            </div>
            <aside className="w-full space-y-6">
              <div className="glass rounded-2xl p-4"><ZoneHpsPie districts={districts} /></div>
              <DistrictLeaderboard districts={districts} />
            </aside>
          </div>

          {selectedDistrictName && (
            <SPView 
              district={selectedDistrictObj} 
              districtName={selectedDistrictName}
              officers={officers} 
              onClose={() => setSelectedDistrictName(null)} 
            />
          )}
        </div>
      )}

      {activeTab === "feedback" && <div className="max-w-3xl mx-auto animate-slide-up"><FeedbackForm /></div>}
      {activeTab === "upload" && <section className="pt-4 animate-slide-up"><ReportUploader /></section>}
    </div>
  );
}

function KPICard({ title, value, color }: { title: string, value: any, color: string }) {
  return (
    <div className="glass p-6 rounded-2xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</div>
      <div className={`text-3xl font-extrabold ${color} mt-2`}>{value}</div>
    </div>
  );
}