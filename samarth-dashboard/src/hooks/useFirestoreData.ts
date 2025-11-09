// src/hooks/useFirestoreData.ts
import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  getFirestore,
  // don't import DocumentData at runtime
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import type { District } from "../types";
import type { DocumentData } from "firebase/firestore"; // TYPE-ONLY import

export function useDistrictsRealtime() {
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    try {
      const q = query(collection(db, "districts"));
      const unsub = onSnapshot(
        q,
        (snapshot) => {
          const items: District[] = snapshot.docs.map((doc) => {
            const data = doc.data() as DocumentData | any;
            return {
              id: doc.id,
              district_name: data.district_name ?? data.name ?? doc.id,
              hps_score:
                typeof data.hps_score === "number"
                  ? data.hps_score
                  : Number(data.hps_score) || 0,
              zone: data.zone,
              officer_count: data.officer_count,
              cases_solved: data.cases_solved,
              recognitions: data.recognitions,
            } as District;
          });
          setDistricts(items);
          setLoading(false);
        },
        (err) => {
          console.error("Firestore onSnapshot error:", err);
          setError(err?.message ?? "Firestore error");
          setLoading(false);
        }
      );

      return () => unsub();
    } catch (err: any) {
      setError(err?.message ?? "Error");
      setLoading(false);
    }
  }, []);

  return { districts, loading, error };
}
