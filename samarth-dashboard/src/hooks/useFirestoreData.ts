// src/hooks/useFirestoreData.ts
import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  doc,
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import type { District, Officer, Summary, AIInsights } from "../types";

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
            const data = doc.data();
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

export function useOfficersRealtime() {
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    try {
      const q = query(collection(db, "officers"));
      const unsub = onSnapshot(
        q,
        (snapshot) => {
          const items: Officer[] = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              name: data.name ?? "",
              rank: data.rank ?? "",
              district: data.district ?? "",
              badge_number: data.badge_number,
              hps_score: typeof data.hps_score === "number" ? data.hps_score : Number(data.hps_score) || 0,
              cases_solved: data.cases_solved ?? 0,
              recognitions: data.recognitions ?? 0,
              join_date: data.join_date,
              performance_trend: data.performance_trend ?? [],
            } as Officer;
          });
          setOfficers(items);
          setLoading(false);
        },
        (err) => {
          console.error("Firestore onSnapshot error (officers):", err);
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

  return { officers, loading, error };
}

export function useSummaryRealtime() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    try {
      const docRef = doc(db, "summary", "live_stats");
      const unsub = onSnapshot(
        docRef,
        (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setSummary({
              total_districts: data.total_districts ?? 0,
              total_officers: data.total_officers ?? 0,
              avg_hps_score: data.avg_hps_score ?? 0,
              total_cases_solved: data.total_cases_solved ?? 0,
              total_recognitions: data.total_recognitions ?? 0,
              last_updated: data.last_updated,
            } as Summary);
          } else {
            setSummary(null);
          }
          setLoading(false);
        },
        (err) => {
          console.error("Firestore onSnapshot error (summary):", err);
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

  return { summary, loading, error };
}

export function useAIInsightsRealtime() {
  const [aiInsights, setAIInsights] = useState<AIInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    try {
      const docRef = doc(db, "ai_insights", "latest");
      const unsub = onSnapshot(
        docRef,
        (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setAIInsights({
              id: docSnap.id,
              predictiveAlert: data.predictiveAlert,
              keyTopics: data.keyTopics ?? [],
              recommendations: data.recommendations ?? [],
              risk_districts: data.risk_districts ?? [],
              top_performers: data.top_performers ?? [],
              generated_at: data.generated_at,
            } as AIInsights);
          } else {
            setAIInsights(null);
          }
          setLoading(false);
        },
        (err) => {
          console.error("Firestore onSnapshot error (ai_insights):", err);
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

  return { aiInsights, loading, error };
}

// Combined hook that fetches all data
export function useFirestoreData() {
  const districts = useDistrictsRealtime();
  const officers = useOfficersRealtime();
  const summary = useSummaryRealtime();
  const aiInsights = useAIInsightsRealtime();

  return {
    districts: districts.districts,
    officers: officers.officers,
    summary: summary.summary,
    aiInsights: aiInsights.aiInsights,
    loading: districts.loading || officers.loading || summary.loading || aiInsights.loading,
    error: districts.error || officers.error || summary.error || aiInsights.error,
  };
}
