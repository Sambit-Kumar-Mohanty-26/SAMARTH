// src/types/index.ts
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
  performance_trend?: number[]; // Array of scores over time
}

export interface Summary {
  total_districts: number;
  total_officers: number;
  avg_hps_score: number;
  total_cases_solved: number;
  total_recognitions: number;
  last_updated?: string;
}

export interface AIInsights {
  id: string;
  predictiveAlert?: string;
  keyTopics?: string[];
  recommendations?: string[];
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
  rating?: number; // 1-5
  submitted_at: string;
  status?: 'pending' | 'reviewed' | 'resolved';
}