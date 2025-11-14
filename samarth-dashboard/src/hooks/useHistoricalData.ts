import { useState, useEffect } from "react";
import type { HistoricalDataPoint } from "../types";

// MOCK DATA - Replace this with a real Firestore query later
const mockHistoricalData: HistoricalDataPoint[] = [
  { id: "2025-05", month: "May", convictionRatio: 18, nbwsExecuted: 1100, drugSeizure_kg: 45 },
  { id: "2025-06", month: "Jun", convictionRatio: 20, nbwsExecuted: 1300, drugSeizure_kg: 50 },
  { id: "2025-07", month: "Jul", convictionRatio: 22, nbwsExecuted: 1250, drugSeizure_kg: 62 },
  { id: "2025-08", month: "Aug", convictionRatio: 21, nbwsExecuted: 1400, drugSeizure_kg: 55 },
  { id: "2025-09", month: "Sep", convictionRatio: 24, nbwsExecuted: 1500, drugSeizure_kg: 70 },
  { id: "2025-10", month: "Oct", convictionRatio: 25, nbwsExecuted: 1450, drugSeizure_kg: 68 },
];

export function useHistoricalData() {
  const [data, setData] = useState<HistoricalDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setData(mockHistoricalData);
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return { historicalData: data, loading };
}