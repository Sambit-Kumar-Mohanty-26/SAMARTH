import jsPDF from "jspdf";
import "jspdf-autotable";
import ExcelJS from "exceljs"; // <-- Import new library
import { saveAs } from "file-saver"; // <-- Import saveAs
import type { District, Summary, AIInsights } from "../types";

// Helper to format the date
const getFormattedDate = () => new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD

/* exportToPdf remains unchanged.
*/
export const exportToPdf = (
  summary: Summary | null,
  districts: District[],
  aiInsights: AIInsights | null
) => {
  const doc = new jsPDF();
  const reportDate = getFormattedDate();
  doc.setFontSize(18);
  doc.text("Samarth Dashboard - Summary Report", 14, 22);
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Generated on: ${reportDate}`, 14, 28);
  if (summary) {
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Statewide Summary", 14, 45);
    doc.setFont("helvetica", "normal");
    doc.text([
      `Statewide Conviction Ratio: ${summary.statewideConvictionRatio}%`,
      `Total Drug Seizure: ${summary.totalDrugSeizureVolume_kg} KG`,
      `Total NBWs Executed: ${summary.totalNbwsExecuted}`,
      `Total Value Recovered: INR ${new Intl.NumberFormat('en-IN').format(summary.totalValueRecovered_INR)}`,
    ], 14, 53);
  }
  if (aiInsights) {
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("AI Insights", 14, 80);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Summary: ${aiInsights.naturalLanguageSummary || "N/A"}`, 14, 88, { maxWidth: 180 });
    doc.text(`Alert: ${aiInsights.predictiveAlert || "N/A"}`, 14, 100, { maxWidth: 180 });
  }
  doc.addPage();
  doc.setFontSize(14);
  doc.text("District Leaderboard", 14, 20);
  const sortedDistricts = [...districts].sort((a, b) => (b.hps_score ?? 0) - (a.hps_score ?? 0));
  const tableColumn = ["Rank", "District", "HPS Score", "Officers", "Recognitions", "Zone"];
  const tableRows = sortedDistricts.map((d, i) => [
    i + 1, d.district_name || "N/A", d.hps_score?.toFixed(1) || "0.0",
    d.officer_count || "0", d.recognitions || "0", d.zone || "N/A",
  ]);
  (doc as any).autoTable({ head: [tableColumn], body: tableRows, startY: 25 });
  doc.save(`Samarth_Report_${reportDate}.pdf`);
};


/*
  --- THIS IS THE UPDATED FUNCTION ---
  It now uses exceljs to create a file with styles
*/
export const exportToExcel = async (
  summary: Summary | null,
  districts: District[],
  aiInsights: AIInsights | null
) => {
  const workbook = new ExcelJS.Workbook();
  const reportDate = getFormattedDate();
  
  const boldFont = { name: 'Arial', size: 12, bold: true };
  const titleFont = { name: 'Arial', size: 14, bold: true };

  // 1. Summary Sheet
  if (summary) {
    const sheet = workbook.addWorksheet("Summary");
    sheet.getCell('A1').value = "Statewide Summary Report";
    sheet.getCell('A1').font = titleFont;
    sheet.getCell('A2').value = `Generated on: ${reportDate}`;
    
    sheet.getCell('A4').value = "Metric";
    sheet.getCell('A4').font = boldFont;
    sheet.getCell('B4').value = "Value";
    sheet.getCell('B4').font = boldFont;

    sheet.addRows([
      ["Statewide Conviction Ratio (%)", summary.statewideConvictionRatio],
      ["Total Drug Seizure (KG)", summary.totalDrugSeizureVolume_kg],
      ["Total NBWs Executed", summary.totalNbwsExecuted],
      ["Total Value Recovered (INR)", summary.totalValueRecovered_INR],
    ]);
    sheet.columns = [{ width: 30 }, { width: 20 }];
  }

  // 2. Leaderboard Sheet
  const sheetLb = workbook.addWorksheet("District Leaderboard");
  const districtHeaders = [
    { header: "Rank", key: "rank", width: 8 },
    { header: "District", key: "name", width: 25 },
    { header: "HPS Score", key: "hps", width: 12 },
    { header: "Zone", key: "zone", width: 15 },
    { header: "Officers", key: "officers", width: 10 },
    { header: "Cases Solved", key: "cases", width: 12 },
    { header: "Recognitions", key: "recognitions", width: 12 },
  ];
  sheetLb.columns = districtHeaders;
  // Make header row bold
  sheetLb.getRow(1).font = boldFont;

  const sortedDistricts = [...districts].sort((a, b) => (b.hps_score ?? 0) - (a.hps_score ?? 0));
  sortedDistricts.forEach((d, i) => {
    sheetLb.addRow({
      rank: i + 1,
      name: d.district_name,
      hps: d.hps_score,
      zone: d.zone,
      officers: d.officer_count,
      cases: d.cases_solved,
      recognitions: d.recognitions,
    });
  });

  // 3. AI Insights Sheet
  if (aiInsights) {
    const sheetAi = workbook.addWorksheet("AI Insights");
    sheetAi.getCell('A1').value = "AI Insights";
    sheetAi.getCell('A1').font = titleFont;
    
    sheetAi.getCell('A3').value = "Category";
    sheetAi.getCell('A3').font = boldFont;
    sheetAi.getCell('B3').value = "Detail";
    sheetAi.getCell('B3').font = boldFont;

    sheetAi.addRows([
      ["Summary", aiInsights.naturalLanguageSummary],
      ["Predictive Alert", aiInsights.predictiveAlert],
      ["Key Topics", aiInsights.keyTopics?.join(", ")],
      ["Top Performers", aiInsights.top_performers?.join(", ")],
      ["Risk Districts", aiInsights.risk_districts?.join(", ")],
    ]);
    sheetAi.columns = [{ width: 20 }, { width: 80 }];
    // Wrap text in the detail column
    sheetAi.getColumn('B').alignment = { wrapText: true, vertical: 'top' };
  }

  // 4. Write file and save
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  saveAs(blob, `Samarth_Report_${reportDate}.xlsx`);
};