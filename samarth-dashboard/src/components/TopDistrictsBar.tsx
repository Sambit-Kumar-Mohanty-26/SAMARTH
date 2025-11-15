// src/components/TopDistrictsBar.tsx
import { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LabelList,
} from "recharts";
import type { District } from "../types";

type Props = {
  districts: District[];
  maxItems?: number; // default 5
};

export default function TopDistrictsBar({ districts, maxItems = 5 }: Props) {
  const data = useMemo(() => {
    return (
      [...districts]
        .sort((a, b) => (b.hps_score ?? 0) - (a.hps_score ?? 0))
        .slice(0, maxItems)
        .map((d, idx) => ({
          name: d.district_name ?? `District ${idx + 1}`,
          hps: Number((d.hps_score ?? 0).toFixed(2)),
          officers: d.officer_count ?? 0,
        }))
    );
  }, [districts, maxItems]);

  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
        <div className="text-sm text-gray-500">Top districts by HPS</div>
        <div className="py-12 text-center text-gray-400">No data available</div>
      </div>
    );
  }

  // compute nice max domain (a little padding)
  const maxHps = Math.max(...data.map((d) => d.hps), 5);
  const domainMax = Math.ceil(maxHps + maxHps * 0.05);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Top districts by HPS
        </h3>
        <div className="text-sm text-gray-500">{data.length} shown</div>
      </div>

      <div style={{ width: "100%", height: 260 }}>
        <ResponsiveContainer>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 8, right: 12, bottom: 8, left: 12 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              type="number"
              domain={[0, domainMax]}
              tick={{ fill: "#4B5563" }}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={160}
              tick={{ fill: "#374151", fontSize: 13 }}
              axisLine={false}
            />
            <Tooltip
              formatter={(value: any, name: any) => {
                if (name === "hps") return [`${value}`, "HPS"];
                return [value, name];
              }}
              contentStyle={{ borderRadius: 8 }}
            />
            {/* radius prop works across Recharts versions (array => top-left, top-right, bottom-right, bottom-left) */}
            <Bar dataKey="hps" barSize={18} radius={[8, 8, 8, 8]} fill="#ef4444">
              <LabelList dataKey="hps" position="right" formatter={(v:any) => v} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
