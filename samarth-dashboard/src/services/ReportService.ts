import { jsPDF } from "jspdf";
import "jspdf-autotable";
import type { District } from "../types"; // Removed AIInsights import per your fix

export const exportToPdf = (summary: any, districts: District[], aiInsights: any) => {
  const doc = new jsPDF();

  // Title
  doc.setFontSize(22);
  doc.setTextColor(40, 116, 166);
  doc.text("Project SAMARTH", 14, 20);
  
  doc.setFontSize(12);
  doc.setTextColor(100);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

  // Executive Summary
  if (summary) {
    doc.setFontSize(16);
    doc.setTextColor(0);
    doc.text("Executive Summary", 14, 45);
    
    const summaryData = [
      ["Conviction Ratio", `${summary.statewideConvictionRatio}%`],
      ["Total Drug Seizure", `${summary.totalDrugSeizureVolume_kg} kg`],
      ["NBWs Executed", summary.totalNbwsExecuted],
      ["Value Recovered", `INR ${summary.totalValueRecovered_INR}`],
    ];

    (doc as any).autoTable({
      startY: 50,
      head: [['Metric', 'Value']],
      body: summaryData,
      theme: 'striped',
      headStyles: { fillColor: [41, 128, 185] },
    });
  }

  // AI Insights
  if (aiInsights) {
    let finalY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(16);
    doc.text("AI Strategic Insights", 14, finalY);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    const splitSummary = doc.splitTextToSize(`"${aiInsights.naturalLanguageSummary}"`, 180);
    doc.text(splitSummary, 14, finalY + 10);
  }

  // District Table
  let tableY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 40 : 150;
  if (tableY > 250) { doc.addPage(); tableY = 20; }

  doc.setFont("helvetica", "normal");
  doc.setTextColor(0);
  doc.setFontSize(16);
  doc.text("District Performance Data", 14, tableY - 5);

  // RESTORED COLUMNS: We can now safely use these properties
  const districtRows = districts.map(d => [
    d.district_name,
    d.zone || "-",
    d.hps_score?.toFixed(2) || "0",
    d.conviction_ratio ? `${d.conviction_ratio}%` : "N/A",
    d.nbws_executed || "0",
    d.drug_seizure_kg || "0"
  ]);

  (doc as any).autoTable({
    startY: tableY,
    head: [['District', 'Zone', 'HPS', 'Conviction', 'NBWs', 'Drugs (kg)']],
    body: districtRows,
    theme: 'grid',
    headStyles: { fillColor: [52, 73, 94] },
  });

  doc.save("Samarth_Police_Report.pdf");
};

// Added underscores to unused vars as per your fix
export const exportToExcel = (_summary: any, _districts: District[], _aiInsights: any) => {
    console.log("Exporting to Excel...");
    alert("Excel export feature coming soon!");
};