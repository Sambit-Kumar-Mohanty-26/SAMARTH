// src/hooks/useHistoricalData.ts
import { useState, useEffect } from "react";
import type { HistoricalDataPoint } from "../types";

// --- MOCK DATA ---
// This is a temporary, pre-defined array of data points
// to make our chart draw a graph immediately.
const mockHistoricalData: HistoricalDataPoint[] = [
  { id: "2025-05", month: "May", convictionRatio: 82, nbwsExecuted: 1100, drugSeizure_kg: 45 },
  { id: "2025-06", month: "Jun", convictionRatio: 85, nbwsExecuted: 1300, drugSeizure_kg: 50 },
  { id: "2025-07", month: "Jul", convictionRatio: 84, nbwsExecuted: 1250, drugSeizure_kg: 62 },
  { id: "2025-08", month: "Aug", convictionRatio: 88, nbwsExecuted: 1400, drugSeizure_kg: 55 },
  { id: "2025-09", month: "Sep", convictionRatio: 90, nbwsExecuted: 1500, drugSeizure_kg: 70 },
  { id: "2025-10", month: "Oct", convictionRatio: 91, nbwsExecuted: 1450, drugSeizure_kg: 68 },
];
// --- END OF MOCK DATA ---


export function useHistoricalData() {
  const [data, setData] = useState<HistoricalDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This simulates fetching data from a server.
    // After a short delay, it sets our mock data into the component's state.
    const timer = setTimeout(() => {
      setData(mockHistoricalData);
      setLoading(false);
    }, 500); // 0.5 second delay to mimic loading

    // Cleanup function
    return () => clearTimeout(timer);
  }, []); // The empty array means this effect runs only once

  return { historicalData: data, loading };
}