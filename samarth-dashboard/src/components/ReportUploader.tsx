import { useState } from "react";
import { doc, writeBatch, collection, getDocs, setDoc } from "firebase/firestore";
import { db } from "../firebaseConfig"; 
import { UploadCloud, File as FileIcon, Loader, CheckCircle, AlertTriangle, Calendar } from "lucide-react";
import * as ExcelJS from "exceljs";
import Papa from "papaparse";

export default function ReportUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [message, setMessage] = useState("Select report month and upload file.");
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const allowedTypes = ["text/csv", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/vnd.ms-excel"];
      
      const isCsv = selectedFile.name.endsWith(".csv");
      
      if (!allowedTypes.includes(selectedFile.type) && !isCsv) {
        setStatus("error");
        setMessage("Invalid file type. Please upload a CSV or Excel file.");
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setStatus("idle");
      setMessage(selectedFile.name);
    }
  };

  const processData = async () => {
    if (!file) return;
    setStatus("processing");
    setMessage("Parsing file...");

    try {
      let extractedData: any[] = [];

      if (file.name.endsWith(".xlsx")) {
        const buffer = await file.arrayBuffer();
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(buffer);
        const worksheet = workbook.worksheets[0];
        
        const headers: string[] = [];
        worksheet.getRow(1).eachCell((cell) => {
          headers.push(cell.value ? cell.value.toString().trim() : "");
        });

        worksheet.eachRow((row, rowNumber) => {
          if (rowNumber > 1) {
            const rowData: {[key: string]: any} = {};
            row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
              const header = headers[colNumber - 1];
              if (header) rowData[header] = cell.value;
            });
            extractedData.push(rowData);
          }
        });
      } else {
        await new Promise<void>((resolve, reject) => {
          Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
              extractedData = results.data;
              resolve();
            },
            error: (err) => reject(err)
          });
        });
      }

      if (extractedData.length === 0) throw new Error("No data found in file.");

      setMessage(`Calculating totals for ${selectedMonth}...`);
      
      let totalNbws = 0;
      let totalDrug = 0;
      let totalConviction = 0;
      let count = 0;

      extractedData.forEach(row => {
        totalNbws += Number(row["nbws_executed"] || 0);
        totalDrug += Number(row["drug_seizure_kg"] || 0);
        totalConviction += Number(row["conviction_ratio"] || 0);
        count++;
      });

      const avgConviction = count > 0 ? Number((totalConviction / count).toFixed(1)) : 0;
      const monthLabel = new Date(selectedMonth + "-01").toLocaleString('default', { month: 'short' });

      await setDoc(doc(db, "historical_data", selectedMonth), {
        id: selectedMonth, 
        month: monthLabel, 
        convictionRatio: avgConviction,
        nbwsExecuted: totalNbws,
        drugSeizure_kg: totalDrug,
        timestamp: new Date().toISOString()
      });

      setMessage(`Updating District Records...`);
      const chunkSize = 450; 
      for (let i = 0; i < extractedData.length; i += chunkSize) {
        const batch = writeBatch(db);
        const chunk = extractedData.slice(i, i + chunkSize);

        chunk.forEach((row) => {
          const districtName = row["name"] || row["District"] || row["district_name"];
          if (!districtName) return;

          const docId = districtName.toString().trim().replace(/\s+/g, "_").toLowerCase();
          const docRef = doc(db, "districts", docId);

          const stats = {
            district_name:    districtName,
            hps_score:        Number(row["hps_score"] || 0),
            nbws_executed:    Number(row["nbws_executed"] || 0),
            conviction_ratio: Number(row["conviction_ratio"] || 0),
            drug_seizure_kg:  Number(row["drug_seizure_kg"] || 0),
            cases_solved:     Number(row["cases_solved"] || 0),
            recognitions:     Number(row["recognitions"] || 0),
            zone:             row["zone"] || "Unassigned", 
            last_updated:     new Date().toISOString(),
          };
          
          batch.set(docRef, stats, { merge: true });
        });

        await batch.commit();
      }

      await updateSummaries();

      setStatus("success");
      setMessage(`Success! Data for ${monthLabel} has been saved to history.`);
      
      setTimeout(() => {
        setStatus("idle");
        setMessage("Upload another month's report");
        setFile(null);
      }, 5000);

    } catch (error) {
      console.error("Processing Error:", error);
      setStatus("error");
      setMessage("Failed to process file. Check console for details.");
    }
  };

  const updateSummaries = async () => {
     const snapshot = await getDocs(collection(db, "districts"));
    const districts = snapshot.docs.map(doc => doc.data());

    let totalNbws = 0;
    let totalDrug = 0;
    let totalConviction = 0;
    let totalValue = 0;

    districts.forEach(d => {
      totalNbws += Number(d.nbws_executed || 0);
      totalDrug += Number(d.drug_seizure_kg || 0);
      totalConviction += Number(d.conviction_ratio || 0);
      totalValue += (Number(d.drug_seizure_kg || 0) * 1000); 
    });

    const avgConviction = districts.length ? (totalConviction / districts.length).toFixed(1) : 0;

    await setDoc(doc(db, "summary", "live_stats"), {
      statewideConvictionRatio: Number(avgConviction),
      totalDrugSeizureVolume_kg: totalDrug,
      totalNbwsExecuted: totalNbws,
      totalValueRecovered_INR: totalValue,
      last_updated: new Date().toISOString()
    }, { merge: true });

    const sortedByHps = [...districts].sort((a, b) => (b.hps_score || 0) - (a.hps_score || 0));
    const top3 = sortedByHps.slice(0, 3).map(d => d.district_name);
    const bottom3 = sortedByHps.slice(-3).map(d => d.district_name).reverse();

    const riskDistricts = districts
      .filter(d => (d.conviction_ratio || 0) < 40)
      .map(d => d.district_name);

    await setDoc(doc(db, "ai_insights", "latest"), {
      top_performers: top3,
      risk_districts: riskDistricts.length > 0 ? riskDistricts : bottom3,
      naturalLanguageSummary: `Statewide performance shows ${totalNbws} warrants executed and ${totalDrug}kg drugs seized. ${top3[0]} is currently leading the charts.`,
      predictiveAlert: riskDistricts.length > 0 ? "Several districts reported conviction ratios below critical threshold." : "Performance remains stable across all zones.",
      generated_at: new Date().toISOString(),
      keyTopics: ["HPS Score", "Conviction Ratio", "Seizures"]
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 max-w-2xl mx-auto border border-gray-200 dark:border-gray-700">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
        <UploadCloud className="inline-block w-6 h-6 mr-2 text-blue-500" />
        Upload Monthly Report
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Select the month for this data to build the historical trend chart.
      </p>

      <div className="space-y-4">
        <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Report Month</label>
            <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md">
                <Calendar className="text-gray-500" size={18} />
                <input 
                    type="month" 
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="bg-transparent w-full text-sm font-medium text-gray-900 dark:text-white focus:outline-none"
                />
            </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
            <label className="flex-1 block w-full">
            <span className="sr-only">Choose file</span>
            <input
                type="file"
                onChange={handleFileChange}
                accept=".csv, .xlsx, .xls"
                className="block w-full text-sm text-gray-500 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 dark:file:bg-blue-900/50 file:text-blue-700 dark:file:text-blue-300 hover:file:bg-blue-100 dark:hover:file:bg-blue-800/50 cursor-pointer"
            />
            </label>
            <button
            onClick={processData}
            disabled={!file || status === "processing"}
            className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors duration-200"
            >
            {status === "processing" ? <Loader className="animate-spin w-5 h-5" /> : <UploadCloud className="w-5 h-5" />}
            {status === 'processing' ? 'Processing...' : 'Upload'}
            </button>
        </div>
      </div>
      
      <div className="mt-4 text-sm text-center h-5">
        {status === "success" && <p className="text-green-600 flex items-center justify-center gap-2"><CheckCircle className="w-5 h-5" /> {message}</p>}
        {status === "error" && <p className="text-red-500 flex items-center justify-center gap-2"><AlertTriangle className="w-5 h-5" /> {message}</p>}
        {status === "idle" && file && <p className="text-gray-600 dark:text-gray-400 flex items-center justify-center gap-2"><FileIcon className="w-5 h-5" /> Ready: {file.name}</p>}
        {status === "processing" && <p className="text-blue-600 dark:text-blue-400 flex items-center justify-center gap-2">{message}</p>}
      </div>
    </div>
  );
}