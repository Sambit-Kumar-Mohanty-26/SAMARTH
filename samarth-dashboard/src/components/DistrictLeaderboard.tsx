import type { District } from "../types";

type Props = {
  districts: District[];
};

export default function DistrictLeaderboard({ districts }: Props) {
  const sorted = [...districts].sort((a, b) => (b.hps_score ?? 0) - (a.hps_score ?? 0));

  const getRankStyle = (index: number) => {
    if (index === 0) return "bg-yellow-100 dark:bg-yellow-900/30 border-yellow-200 text-yellow-700 dark:text-yellow-400";
    if (index === 1) return "bg-slate-100 dark:bg-slate-700/50 border-slate-300 text-slate-700 dark:text-slate-300";
    if (index === 2) return "bg-orange-100 dark:bg-orange-900/30 border-orange-200 text-orange-800 dark:text-orange-300";
    return "bg-white dark:bg-slate-800 border-transparent hover:bg-slate-50 dark:hover:bg-slate-700";
  };

  return (
    <div className="glass rounded-2xl p-6 h-fit sticky top-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">District Rankings</h3>
        <span className="text-xs font-medium px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">Live HPS</span>
      </div>
      
      <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
        {sorted.length === 0 && <div className="text-center py-8 text-slate-500">No data available</div>}
        
        {sorted.map((d, idx) => (
          <div 
            key={d.id} 
            className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-200 ${getRankStyle(idx)}`}
          >
            <div className="flex items-center gap-3">
              <div className={`
                w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm
                ${idx < 3 ? 'bg-white/50 dark:bg-black/20' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}
              `}>
                {idx + 1}
              </div>
              <div>
                <div className="font-bold text-sm">{d.district_name}</div>
                <div className="text-xs opacity-80">Zone: {d.zone ?? "—"}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-black tracking-tight">{(d.hps_score ?? 0).toFixed(1)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}