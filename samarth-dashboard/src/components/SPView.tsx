// src/components/SPView.tsx
import { useMemo } from "react";
import { X, Phone, Mail, Award, AlertTriangle, TrendingUp, Users, CheckCircle, Star, FileText, FileSpreadsheet, Download } from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable"; // Ensure jspdf-autotable is installed
import * as ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from "recharts";
import type { District, Officer } from "../types";

type Props = {
  district: District | null;
  districtName: string;
  officers: Officer[];
  onClose: () => void;
};

export default function SPView({ district, districtName, officers, onClose }: Props) {
  // 1. Data Safety
  const safeDistrict = district || {
    id: "unknown",
    district_name: districtName,
    zone: "Unassigned",
    hps_score: 0,
    conviction_ratio: 0,
    nbws_executed: 0,
    drug_seizure_kg: 0,
    cases_solved: 0,
    recognitions: 0,
    officer_count: 0
  };

  // 2. Metrics Calculation
  const districtOfficers = officers.filter(o => o.district === safeDistrict.id);
  const sp = districtOfficers.find(o => o.rank === "SP" || o.designation === "SP") || districtOfficers[0];
  
  const avgOfficerHps = useMemo(() => {
    if (districtOfficers.length === 0) return 0;
    const total = districtOfficers.reduce((acc, curr) => acc + (curr.hps_score || 0), 0);
    return (total / districtOfficers.length).toFixed(1);
  }, [districtOfficers]);

  // Trend Data
  const trendData = useMemo(() => {
    return [
      { month: 'Jan', score: Math.max(0, (safeDistrict.hps_score || 50) - 12) },
      { month: 'Feb', score: Math.max(0, (safeDistrict.hps_score || 50) - 5) },
      { month: 'Mar', score: Math.max(0, (safeDistrict.hps_score || 50) - 8) },
      { month: 'Apr', score: Math.max(0, (safeDistrict.hps_score || 50) + 4) },
      { month: 'May', score: Math.max(0, (safeDistrict.hps_score || 50) - 2) },
      { month: 'Jun', score: safeDistrict.hps_score || 50 },
    ];
  }, [safeDistrict]);

  const comparisonData = [
    { name: 'HPS', value: safeDistrict.hps_score || 0, stateAvg: 65 },
    { name: 'Conviction', value: safeDistrict.conviction_ratio || 0, stateAvg: 45 },
    { name: 'Solved', value: (safeDistrict.cases_solved || 0) / 5, stateAvg: 40 },
    { name: 'NBW', value: (safeDistrict.nbws_executed || 0) / 2, stateAvg: 55 },
  ];

  // 3. PDF Generator (Updated with Project Name)
  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(30, 58, 138); // Navy Blue
    doc.rect(0, 0, 210, 40, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("Project SAMARTH", 105, 20, { align: "center" });
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`District Performance Report: ${safeDistrict.district_name}`, 105, 30, { align: "center" });

    // SP Info
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text(`Superintendent: ${sp?.name || "Vacant"}`, 14, 50);
    doc.text(`Zone: ${safeDistrict.zone}`, 14, 56);

    // Metrics Table
    const metricsData = [
      ["HPS Score", safeDistrict.hps_score?.toFixed(1) || "N/A"],
      ["Conviction Ratio", `${safeDistrict.conviction_ratio}%`],
      ["NBWs Executed", `${safeDistrict.nbws_executed}`],
      ["Drug Seizure", `${safeDistrict.drug_seizure_kg} kg`],
      ["Cases Solved", `${safeDistrict.cases_solved}`],
      ["Recognitions", `${safeDistrict.recognitions}`],
      ["Officers Active", `${districtOfficers.length}`]
    ];

    autoTable(doc, {
        startY: 65,
        head: [['Metric', 'Value']],
        body: metricsData,
        theme: 'grid',
        headStyles: { fillColor: [30, 58, 138] },
    });

    doc.save(`${safeDistrict.district_name}_Report.pdf`);
  };

  // 4. Excel Generator
  const handleDownloadExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('District Report');

    worksheet.columns = [{ header: 'Metric', key: 'metric', width: 30 }, { header: 'Value', key: 'value', width: 20 }];
    worksheet.addRow(['Project SAMARTH', 'District Data']);
    worksheet.mergeCells('A1:B1');
    worksheet.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } };
    worksheet.getCell('A1').font = { color: { argb: 'FFFFFFFF' }, bold: true, size: 14 };

    worksheet.addRow(['District', safeDistrict.district_name]);
    worksheet.addRow(['SP Name', sp?.name || 'Vacant']);
    worksheet.addRow([]);
    
    worksheet.addRow(['HPS Score', safeDistrict.hps_score]);
    worksheet.addRow(['Conviction Ratio', safeDistrict.conviction_ratio]);
    worksheet.addRow(['Cases Solved', safeDistrict.cases_solved]);
    
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `${safeDistrict.district_name}_Data.xlsx`);
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-5xl max-h-[95vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-slate-200 dark:border-slate-700 animate-slide-up">
        
        {/* 1. Header Section with Branding & Actions */}
        <div className="relative h-36 bg-linear-to-r from-blue-600 to-purple-600 dark:from-blue-900 dark:to-purple-900 shrink-0">
          
          {/* Project Branding */}
          <div className="absolute top-5 left-6 flex items-center gap-2 z-20">
             <div className="bg-white/20 backdrop-blur-md p-1.5 rounded-lg border border-white/10 shadow-lg">
                <span className="text-xl">🚔</span>
             </div>
             <div>
                <h3 className="text-[10px] font-bold text-blue-100 uppercase tracking-widest leading-tight">Project</h3>
                <h1 className="text-xl font-black text-white leading-none tracking-wide shadow-sm">SAMARTH</h1>
             </div>
          </div>

          {/* Header Actions (Icons) */}
          <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
            <button onClick={handleDownloadPDF} className="group flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md border border-white/10 transition-all text-xs font-bold uppercase tracking-wide shadow-sm">
              <FileText size={14} /> <span className="hidden sm:inline">PDF</span>
            </button>
            <button onClick={handleDownloadExcel} className="group flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md border border-white/10 transition-all text-xs font-bold uppercase tracking-wide shadow-sm">
              <FileSpreadsheet size={14} /> <span className="hidden sm:inline">Excel</span>
            </button>
            <div className="h-6 w-px bg-white/20 mx-1"></div>
            <button onClick={onClose} className="p-2 bg-black/20 hover:bg-red-500/80 text-white rounded-full transition-colors shadow-sm">
              <X size={18} />
            </button>
          </div>
          
          {/* District Info */}
          <div className="absolute -bottom-12 left-8 flex items-end gap-6 z-10">
            <div className="w-28 h-28 rounded-full border-4 border-white dark:border-slate-900 bg-slate-200 overflow-hidden shadow-lg">
              <img 
                src={`https://ui-avatars.com/api/?name=${sp?.name || safeDistrict.district_name}&background=0D8ABC&color=fff`} 
                alt="SP Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="mb-4 ml-1">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white drop-shadow-sm sm:text-white sm:drop-shadow-md">
                {safeDistrict.district_name}
              </h2>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/90 text-blue-800 shadow-sm backdrop-blur-sm border border-blue-100">
                  Zone: {safeDistrict.zone}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/90 text-purple-800 shadow-sm backdrop-blur-sm border border-purple-100">
                  {districtOfficers.length} Officers
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Scrollable Body */}
        <div className="flex-1 overflow-y-auto pt-16 pb-6 px-6 sm:px-8 custom-scrollbar">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard icon={Award} label="HPS Score" value={safeDistrict.hps_score?.toFixed(1)} color="text-blue-600" />
            <StatCard icon={CheckCircle} label="Cases Solved" value={safeDistrict.cases_solved} color="text-green-600" />
            <StatCard icon={Star} label="Recognitions" value={safeDistrict.recognitions} color="text-amber-500" />
            <StatCard icon={Users} label="Avg Officer HPS" value={avgOfficerHps} color="text-purple-600" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* Trend Chart */}
              <section className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <TrendingUp className="text-blue-500" size={20} /> Trend Analytics
                  </h3>
                  <div className="text-xs text-slate-400 font-medium px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded">6 Months</div>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData}>
                      <defs>
                        <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.4} />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                      <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '12px', border: 'none' }} />
                      <Area type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#trendGradient)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </section>

              {/* Comparison Chart */}
              <section className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Performance vs State Average</h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={comparisonData} barGap={8}>
                      <defs>
                        <linearGradient id="barGradient1" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3b82f6" />
                          <stop offset="100%" stopColor="#2563eb" />
                        </linearGradient>
                        <linearGradient id="barGradient2" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#cbd5e1" />
                          <stop offset="100%" stopColor="#94a3b8" />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.4} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                      <Tooltip cursor={{fill: 'transparent'}} />
                      <Legend iconType="circle" />
                      <Bar dataKey="value" name="District" fill="url(#barGradient1)" radius={[6, 6, 0, 0]} barSize={24} />
                      <Bar dataKey="stateAvg" name="State Avg" fill="url(#barGradient2)" radius={[6, 6, 0, 0]} barSize={24} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </section>
            </div>

            <div className="space-y-6">
              <section className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
                <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Superintendent Details</h3>
                <div className="space-y-4">
                  <div className="group">
                    <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Name</div>
                    <div className="font-semibold text-slate-900 dark:text-white text-lg">{sp?.name || "Vacant"}</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Contact</div>
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium"><Phone size={16} className="text-blue-500" /> <span>+91 {Math.floor(Math.random() * 9000000000) + 1000000000}</span></div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Email</div>
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium text-sm break-all"><Mail size={16} className="text-blue-500" /> <span>sp.{safeDistrict.district_name.toLowerCase().replace(/\s+/g, '')}@odishapolice.gov.in</span></div>
                  </div>
                </div>
              </section>
              <section className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/50 rounded-xl p-5">
                 <div className="flex gap-3">
                   <AlertTriangle className="text-red-600 dark:text-red-400 shrink-0 mt-1" size={20} />
                   <div>
                     <h3 className="font-bold text-red-800 dark:text-red-200">Active Alerts</h3>
                     <ul className="mt-3 text-sm text-red-700 dark:text-red-300 space-y-2 list-disc pl-4">
                        {(safeDistrict.conviction_ratio ?? 0) < 40 && <li><strong>Critical:</strong> Conviction rate ({safeDistrict.conviction_ratio}%) is below threshold.</li>}
                        {(safeDistrict.nbws_executed ?? 0) < 5 && <li>Low NBW execution rate detected.</li>}
                        <li>Pending case volume exceeds zone average by 12%.</li>
                     </ul>
                   </div>
                 </div>
               </section>
            </div>
          </div>
        </div>

        {/* Footer (Restored & Explicitly Visible) */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3 shrink-0">
           <button 
            onClick={onClose} 
            className="px-6 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-medium shadow-sm transition-colors"
          >
            Close
          </button>
          <button 
            onClick={handleDownloadPDF}
            className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30 transition-all font-medium flex items-center gap-2"
          >
            <Download size={18} />
            Download Report PDF
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: any, label: string, value: any, color: string }) {
  return (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4 hover:scale-[1.02] transition-transform">
      <div className={`p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50 ${color}`}><Icon size={24} /></div>
      <div>
        <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</div>
        <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">{value ?? "—"}</div>
      </div>
    </div>
  );
}