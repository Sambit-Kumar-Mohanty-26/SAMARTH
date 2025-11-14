export interface District {
  id: string;
  district_name: string;
  hps_score?: number;
  zone?: string;
  officer_count?: number;
  cases_solved?: number;
  recognitions?: number;
}

export interface Officer {
  id: string;
  name: string;
  rank: string;
  district: string;
  badge_number?: string;
  hps_score?: number;
  cases_solved?: number;
  recognitions?: number;
  join_date?: string;
  performance_trend?: number[]; 
}

export interface Summary {
  statewideConvictionRatio: number;
  totalDrugSeizureVolume_kg: number;
  totalNbwsExecuted: number;
  totalValueRecovered_INR: number;
  last_updated?: string;
}

export interface AIInsights {
  id: string;
  naturalLanguageSummary?: string; 
  predictiveAlert?: string;
  keyTopics?: string[];
  underperformingDistrictFocus?: string;
  risk_districts?: string[];
  top_performers?: string[];
  generated_at?: string;
}

export interface Feedback {
  id: string;
  district?: string;
  officer_name?: string;
  feedback_type: 'compliment' | 'complaint' | 'suggestion';
  message: string;
  rating?: number; 
  submitted_at: string;
  status?: 'pending' | 'reviewed' | 'resolved';
}

// --- ADDED FOR TREND ANALYSIS ---
export interface HistoricalDataPoint {
  id: string; // e.g., "2024-10"
  month: string; // e.g., "Oct"
  convictionRatio: number;
  nbwsExecuted: number;
  drugSeizure_kg: number;
}