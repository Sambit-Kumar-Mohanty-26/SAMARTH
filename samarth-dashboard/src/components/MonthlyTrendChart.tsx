import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import type { HistoricalDataPoint } from "../types";

type Props = {
  data: HistoricalDataPoint[];
  loading?: boolean;
};

export default function MonthlyTrendChart({ data, loading }: Props) {
  if (loading || !data) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 h-80">
        <div className="animate-pulse h-full bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Monthly Performance Trends
      </h3>
      {/* This explicit height container fixes the recharts warning */}
      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
            <XAxis dataKey="month" tick={{ fill: "currentColor" }} className="text-xs text-gray-600 dark:text-gray-400" />
            <YAxis yAxisId="left" tick={{ fill: "currentColor" }} className="text-xs text-gray-600 dark:text-gray-400" />
            <YAxis yAxisId="right" orientation="right" tick={{ fill: "currentColor" }} className="text-xs text-gray-600 dark:text-gray-400" />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.8)",
                backdropFilter: "blur(2px)",
                border: "1px solid #ccc",
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="nbwsExecuted" name="NBWs Executed" stroke="#8884d8" strokeWidth={2} />
            <Line yAxisId="right" type="monotone" dataKey="convictionRatio" name="Conviction Ratio (%)" stroke="#82ca9d" strokeWidth={2} />
            <Line yAxisId="right" type="monotone" dataKey="drugSeizure_kg" name="Drug Seizure (KG)" stroke="#ffc658" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}