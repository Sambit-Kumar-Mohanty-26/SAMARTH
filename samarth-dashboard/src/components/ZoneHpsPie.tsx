// src/components/ZoneHpsPie.tsx
import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import type { District } from "../types";

type Props = {
  districts: District[];
};

const COLORS = [
  "#16a34a", // green
  "#f59e0b", // amber
  "#ef4444", // red
  "#06b6d4", // cyan
  "#7c3aed", // violet
];

export default function ZoneHpsPie({ districts }: Props) {
  // group by zone and compute average HPS per zone
  const data = useMemo(() => {
    const map = new Map<
      string,
      { sum: number; count: number; avg?: number }
    >();

    districts.forEach((d) => {
      const zone = d.zone ?? "Unknown";
      const h = Number(d.hps_score ?? 0);
      if (!map.has(zone)) map.set(zone, { sum: 0, count: 0 });
      const cur = map.get(zone)!;
      cur.sum += h;
      cur.count += 1;
    });

    const arr = Array.from(map.entries()).map(([zone, { sum, count }]) => {
      const avg = count > 0 ? sum / count : 0;
      return { zone, avg };
    });

    // if everything zero / empty, create a placeholder
    if (arr.length === 0) return [{ zone: "No data", avg: 0 }];

    // convert to percentage share (by avg HPS) for pie
    const total = arr.reduce((s, r) => s + (r.avg ?? 0), 0) || 1; // avoid div by zero
    return arr.map((r) => ({
      name: r.zone,
      value: Number(((r.avg ?? 0) / total * 100).toFixed(2)),
      avg: Number((r.avg ?? 0).toFixed(2)),
    }));
  }, [districts]);

  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
        <div className="text-sm text-gray-500">HPS by zone</div>
        <div className="py-12 text-center text-gray-400">No data available</div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          HPS by Zone
        </h3>
        <div className="text-sm text-gray-500">{data.length} zones</div>
      </div>

      <div style={{ width: "100%", height: 260 }}>
        <ResponsiveContainer>
          <PieChart>
            <Tooltip
              formatter={(value: any, name: any, props: any) => {
                // value is percentage share; find avg stored in payload
                const payload = props && props.payload;
                const avg = payload ? payload.avg : undefined;
                if (avg !== undefined) return [`${avg}`, "Avg HPS"];
                return [`${value}`, name];
              }}
              contentStyle={{ borderRadius: 8 }}
            />
            <Legend verticalAlign="bottom" height={36} />
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              outerRadius={90}
              innerRadius={36}
              paddingAngle={2}
              label={(entry) => `${entry.name} (${entry.value}%)`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
