import { onObjectFinalized, StorageEvent } from "firebase-functions/v2/storage";
import { onSchedule } from "firebase-functions/v2/scheduler";
import * as admin from "firebase-admin";
import { setGlobalOptions } from "firebase-functions/v2";
import * as ExcelJS from "exceljs";
import Papa from "papaparse";

admin.initializeApp();
const db = admin.firestore();
setGlobalOptions({ region: "asia-south1" });

export const processGoodWorkReport = onObjectFinalized(
  { bucket: "project-samarth-c443f.firebasestorage.app" }, 
  async (event: StorageEvent) => {
    const fileBucket = event.data.bucket;
    const filePath = event.data.name;

    if (!filePath || !filePath.startsWith("incoming_reports/")) {
      console.log(`File ${filePath} is not in the target directory. Ignoring.`);
      return;
    }

    const bucket = admin.storage().bucket(fileBucket);
    const fileBuffer = await bucket.file(filePath).download();

    let extractedData: any[] = [];

    try {
      if (filePath.endsWith(".xlsx")) {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(fileBuffer as any);
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
                if (Object.keys(rowData).length > 0) extractedData.push(rowData);
            }
        });
      } else if (filePath.endsWith(".csv")) {
          const csvText = fileBuffer[0].toString("utf8");
          const result = Papa.parse(csvText, { header: true, skipEmptyLines: true });
          extractedData = result.data;
      } else {
        console.log(`Unsupported file type for: ${filePath}`);
        const destination = `processed_reports/unsupported_${filePath.split("/").pop()}`;
        await bucket.file(filePath).move(destination);
        return;
      }

      console.log(`Successfully parsed ${extractedData.length} rows from ${filePath}`);
      if (extractedData.length === 0) {
        console.log("No data extracted. Aborting Firestore write.");
        const destination = `processed_reports/empty_${filePath.split("/").pop()}`;
        await bucket.file(filePath).move(destination);
        return;
      }

      console.log("Fetching existing districts to preserve geometry data...");
      const districtsRef = db.collection("districts");
      const snapshot = await districtsRef.get();
      const existingDistricts = new Map();
      snapshot.forEach(doc => {
        existingDistricts.set(doc.id, doc.data());
      });
      console.log(`Found ${existingDistricts.size} existing districts.`);

      const batch = db.batch();

      for (const row of extractedData) {
        const districtName = row["name"] || row["District"];
        if (!districtName || typeof districtName !== 'string') {
            console.warn("Skipping row due to missing or invalid district name:", row);
            continue;
        }

        const docId = districtName.trim().replace(/\s+/g, "_").toLowerCase();
        const docRef = districtsRef.doc(docId);

        const newStatsData = {
          district_name:    districtName,
          hps_score:        Number(row["hps_score"] || 0),
          nbws_executed:    Number(row["nbws_executed"] || 0),
          conviction_ratio: Number(row["conviction_ratio"] || 0),
          drug_seizure_kg:  Number(row["drug_seizure_kg"] || 0),
          cases_solved:     Number(row["cases_solved"] || 0),
          recognitions:     Number(row["recognitions"] || 0),
          last_updated:     new Date().toISOString(),
        };

        if (existingDistricts.has(docId)) {
          batch.update(docRef, newStatsData);
        } else {
          batch.set(docRef, newStatsData);
        }
      }

      await batch.commit();
      console.log(`Batch write to Firestore complete for ${filePath}.`);

      const destination = `processed_reports/${filePath.split("/").pop()}`;
      await bucket.file(filePath).move(destination);
      console.log(`Moved processed file to ${destination}`);

    } catch (error) {
      console.error("Error processing file:", error);
      const destination = `error_reports/${filePath.split("/").pop()}`;
      await bucket.file(filePath).move(destination);
      console.error(`Moved errored file to ${destination}`);
    }
  }
);

export const generateAIInsights = onSchedule("every day 01:00", async () => {
  console.log("Starting daily AI Insights generation...");

  const districtsSnapshot = await db.collection("districts").get();
  if (districtsSnapshot.empty) {
    console.log("No district data found. Skipping insight generation.");
    return;
  }

  const districts: any[] = districtsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  const sortedByHps = [...districts].sort((a, b) => (b.hps_score || 0) - (a.hps_score || 0));
  const top_performers = sortedByHps.slice(0, 3).map(d => d.district_name);
  const risk_districts = sortedByHps.slice(-3).map(d => d.district_name).reverse();
  
  const topDrugDistrict = [...districts].sort((a, b) => (b.drug_seizure_kg || 0) - (a.drug_seizure_kg || 0))[0];
  const topNbwDistrict = [...districts].sort((a, b) => (b.nbws_executed || 0) - (a.nbws_executed || 0))[0];

  const naturalLanguageSummary = `This period, ${topNbwDistrict.district_name} led in NBW execution with ${topNbwDistrict.nbws_executed} warrants cleared, while ${topDrugDistrict.district_name} was most effective in narcotics enforcement, seizing ${topDrugDistrict.drug_seizure_kg}kg of drugs.`;

  const lowConvictionDistricts = districts.filter(d => (d.conviction_ratio || 100) < 60);
  let predictiveAlert = "Overall performance is stable.";
  if (lowConvictionDistricts.length > 0) {
    predictiveAlert = `Attention recommended for ${lowConvictionDistricts.map(d => d.district_name).join(', ')} due to conviction ratios falling below the 60% threshold.`;
  }

  const aiInsightsData = {
    top_performers,
    risk_districts,
    naturalLanguageSummary,
    predictiveAlert,
    keyTopics: ["NBW Execution Rate", "Narcotics Enforcement", "Conviction Ratio", "HPS Score"],
    generated_at: new Date().toISOString(),
  };

  await db.collection("ai_insights").doc("latest").set(aiInsightsData);
  console.log("Successfully generated and saved new AI insights.");
});

export const aggregateMonthlyStats = onSchedule("0 2 1 * *", async () => {
  console.log("Starting monthly historical data aggregation...");

  const districtsSnapshot = await db.collection("districts").get();
  if (districtsSnapshot.empty) {
    console.log("No district data found. Skipping aggregation.");
    return;
  }
  
  const districts: any[] = districtsSnapshot.docs.map(doc => doc.data());

  let totalNbwsExecuted = 0;
  let totalDrugSeizureKg = 0;
  let totalConvictionRatio = 0;
  
  for (const district of districts) {
    totalNbwsExecuted += district.nbws_executed || 0;
    totalDrugSeizureKg += district.drug_seizure_kg || 0;
    totalConvictionRatio += district.conviction_ratio || 0;
  }

  const averageConvictionRatio = districts.length > 0 
    ? parseFloat((totalConvictionRatio / districts.length).toFixed(1)) 
    : 0;

  const now = new Date();
  const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const monthName = prevMonthDate.toLocaleString('default', { month: 'short' });
  const docId = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}`;

  const historicalDataPoint = {
    id: docId,
    month: monthName,
    convictionRatio: averageConvictionRatio,
    nbwsExecuted: totalNbwsExecuted,
    drugSeizure_kg: totalDrugSeizureKg,
  };

  await db.collection("historical_data").doc(docId).set(historicalDataPoint);
  console.log(`Successfully aggregated and saved historical data for ${docId}.`);
});