import { useState, useEffect } from "react";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "../firebaseConfig";
import type { HistoricalDataPoint } from "../types";

export function useHistoricalData() {
  const [data, setData] = useState<HistoricalDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "historical_data"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedData: HistoricalDataPoint[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as HistoricalDataPoint));

      fetchedData.sort((a, b) => a.id.localeCompare(b.id));

      setData(fetchedData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching historical data:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { historicalData: data, loading };
}