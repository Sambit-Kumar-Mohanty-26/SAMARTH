import { useMemo } from "react";
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

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AF19FF"];

export default function ZoneHpsPie({ districts }: Props) {
  const data = useMemo(() => {
    if (!districts) return [];

    const zoneMap = new Map<string, { sum: number; count: number }>();

    districts.forEach((d) => {
      const zone = d.zone ?? "Unknown";
      const hps = Number(d.hps_score ?? 0);
      if (!zoneMap.has(zone)) {
        zoneMap.set(zone, { sum: 0, count: 0 });
      }
      const currentZone = zoneMap.get(zone)!;
      currentZone.sum += hps;
      currentZone.count += 1;
    });

    return Array.from(zoneMap.entries()).map(([name, { sum, count }]) => ({
      name,
      value: count > 0 ? parseFloat((sum / count).toFixed(1)) : 0,
    }));
  }, [districts]);


  const hasData = data.some(d => d.value > 0);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
        Average HPS by Zone
      </h3>

      <div style={{ width: "100%", height: 260 }}>
        {hasData ? (
          <ResponsiveContainer>
            <PieChart>
              <Tooltip
                formatter={(value: number) => [`${value}`, "Avg HPS"]}
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                  backgroundColor: "rgba(255, 255, 255, 0.8)",
                }}
                labelStyle={{ fontWeight: 'bold' }}
              />
              <Legend verticalAlign="bottom" height={36} />
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="45%" // Adjusted to make space for the legend
                outerRadius={80}
                fill="#8884d8"
                label={({ name }) => name}
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-center text-gray-400 dark:text-gray-500">
            <div>
              <p>No zone data available.</p>
              <p className="text-xs mt-1">Add a 'zone' field to your districts in Firestore.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}