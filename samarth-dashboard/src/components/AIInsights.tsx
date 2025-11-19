import { Brain, AlertTriangle, Target, Award, Sparkles } from "lucide-react";
import type { AIInsights as AIInsightsType } from "../types";

type Props = {
  aiInsights: AIInsightsType | null;
  loading?: boolean;
};

export default function AIInsights({ aiInsights, loading }: Props) {
  if (loading || !aiInsights) {
    return (
      <div className="glass rounded-2xl p-8 min-h-[400px] animate-pulse">
        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-8"></div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-full"></div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-6 md:p-8 relative overflow-hidden border-t-4 border-purple-500">
      <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

      <div className="flex items-center gap-3 mb-8 relative z-10">
        <div className="p-3 bg-purple-100 dark:bg-purple-900/50 rounded-xl">
          <Brain className="w-8 h-8 text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            AI Analysis <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
          </h2>
          {aiInsights.generated_at && (
            <span className="text-xs text-slate-500 font-mono">
              Generated: {new Date(aiInsights.generated_at).toLocaleString()}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-6 relative z-10">
        {aiInsights.naturalLanguageSummary && (
          <div className=" from-slate-50 to-purple-50/50 dark:from-slate-800/50 dark:to-purple-900/20 p-6 rounded-xl border border-purple-100 dark:border-purple-800/50 italic text-slate-700 dark:text-slate-200 text-lg leading-relaxed">
            "{aiInsights.naturalLanguageSummary}"
          </div>
        )}

        {aiInsights.predictiveAlert && (
          <div className="flex gap-4 bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-200 dark:border-amber-800/50">
            <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-500 shrink-0" />
            <div>
              <h3 className="font-bold text-amber-800 dark:text-amber-200 mb-1">Strategic Alert</h3>
              <p className="text-amber-700 dark:text-amber-300 text-sm">{aiInsights.predictiveAlert}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {aiInsights.keyTopics && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-500 uppercase tracking-wider">
                <Target className="w-4 h-4" /> Focus Areas
              </div>
              <div className="flex flex-wrap gap-2">
                {aiInsights.keyTopics.map((topic, i) => (
                  <span key={i} className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-police-700 dark:text-police-300 shadow-sm">
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          )}

          {(aiInsights.top_performers || aiInsights.risk_districts) && (
            <div className="space-y-4">
              {aiInsights.top_performers && (
                <div className="flex items-center gap-2 text-sm">
                   <Award className="w-4 h-4 text-green-500" />
                   <span className="font-medium">Top:</span>
                   <div className="flex gap-2">
                     {aiInsights.top_performers.map((d, i) => <span key={i} className="text-green-600 dark:text-green-400 font-bold">{d}</span>)}
                   </div>
                </div>
              )}
              {aiInsights.risk_districts && (
                 <div className="flex items-center gap-2 text-sm">
                   <AlertTriangle className="w-4 h-4 text-red-500" />
                   <span className="font-medium">Attention:</span>
                   <div className="flex gap-2">
                     {aiInsights.risk_districts.map((d, i) => <span key={i} className="text-red-600 dark:text-red-400 font-bold">{d}</span>)}
                   </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}