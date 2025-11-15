// src/components/AIInsights.tsx
import { Brain, AlertTriangle, Target, Award } from "lucide-react";
import type { AIInsights as AIInsightsType } from "../types";

type Props = {
  aiInsights: AIInsightsType | null;
  loading?: boolean;
};

export default function AIInsights({ aiInsights, loading }: Props) {
  // Show a skeleton loader while data is loading for a better user experience
  if (loading || !aiInsights) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 min-h-[400px]">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="space-y-3">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="flex gap-2">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-full w-24"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-full w-24"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-full w-24"></div>
            </div>
          </div>
           <div className="space-y-3">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="flex gap-2">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-full w-24"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-full w-24"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-full w-24"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center gap-3 mb-6">
        <Brain className="w-6 h-6 text-purple-600 dark:text-purple-400" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">AI Insights</h2>
        {aiInsights.generated_at && (
          <span className="text-sm text-gray-500 dark:text-gray-400 ml-auto">
            Generated: {new Date(aiInsights.generated_at).toLocaleDateString()}
          </span>
        )}
      </div>

      {/* Natural Language Summary (PS-3 Requirement) */}
      {aiInsights.naturalLanguageSummary && (
        <div className="mb-6 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
          <p className="text-lg italic text-gray-800 dark:text-gray-200 text-center">
            "{aiInsights.naturalLanguageSummary}"
          </p>
        </div>
      )}

      {/* Predictive Alert */}
      {aiInsights.predictiveAlert && (
        <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 rounded-r-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-1">Predictive Alert</h3>
              <p className="text-yellow-700 dark:text-yellow-300">{aiInsights.predictiveAlert}</p>
            </div>
          </div>
        </div>
      )}

      {/* Key Topics */}
      {aiInsights.keyTopics && aiInsights.keyTopics.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Key Topics</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {aiInsights.keyTopics.map((topic, idx) => (
              <span key={idx} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
                {topic}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Districts Requiring Attention (Corrected Formatting) */}
      {aiInsights.risk_districts && aiInsights.risk_districts.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Districts Requiring Attention</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {aiInsights.risk_districts.map((district, idx) => (
              <span key={idx} className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 rounded-full text-sm font-medium">
                {district}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Top Performing Districts (Corrected Formatting) */}
      {aiInsights.top_performers && aiInsights.top_performers.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Award className="w-5 h-5 text-green-600 dark:text-green-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Top Performing Districts</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {aiInsights.top_performers.map((performer, idx) => (
              <span key={idx} className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
                {performer}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}