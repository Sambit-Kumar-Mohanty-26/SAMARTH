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
