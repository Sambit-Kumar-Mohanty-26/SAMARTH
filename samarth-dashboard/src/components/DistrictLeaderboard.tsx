// src/components/DistrictLeaderboard.tsx
import type { District } from "../types";

type Props = {
  districts: District[];
};

export default function DistrictLeaderboard({ districts }: Props) {
  const sorted = [...districts].sort((a, b) => (b.hps_score ?? 0) - (a.hps_score ?? 0));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold mb-3">District Leaderboard</h3>
      <div className="space-y-2">
        {sorted.length === 0 && <div className="text-sm text-gray-500">No districts found</div>}
        {sorted.map((d, idx) => (
          <div key={d.id} className="flex items-center justify-between border rounded p-2">
            <div>
              <div className="font-medium">{idx + 1}. {d.district_name}</div>
              <div className="text-sm text-gray-500">Zone: {d.zone ?? "—"} • Officers: {d.officer_count ?? "—"}</div>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold">{(d.hps_score ?? 0).toFixed(1)}</div>
              <div className="text-xs text-gray-500">HPS</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
