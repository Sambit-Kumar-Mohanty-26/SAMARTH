// src/components/AIInsights.tsx
import React from "react";
import { Brain, AlertTriangle, TrendingUp, Award, Target } from "lucide-react";
import type { AIInsights as AIInsightsType } from "../types";

type Props = {
  aiInsights: AIInsightsType | null;
  loading?: boolean;
};

export default function AIInsights({ aiInsights, loading }: Props) {
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center gap-3 mb-4">
          <Brain className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">AI Insights</h2>
        </div>
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">Loading insights...</div>
      </div>
    );
  }

  if (!aiInsights) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center gap-3 mb-4">
          <Brain className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">AI Insights</h2>
        </div>
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400 mb-2">
            No AI insights available at the moment.
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Create the <code className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">ai_insights/latest</code> document in Firestore to display insights.
          </p>
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

      {/* Predictive Alert */}
      {aiInsights.predictiveAlert && (
        <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 rounded-r-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
                Predictive Alert
              </h3>
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
              <span
                key={idx}
                className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {aiInsights.recommendations && aiInsights.recommendations.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Recommendations
            </h3>
          </div>
          <ul className="space-y-2">
            {aiInsights.recommendations.map((recommendation, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2 text-gray-700 dark:text-gray-300"
              >
                <span className="text-green-600 dark:text-green-400 mt-1">•</span>
                <span>{recommendation}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Risk Districts */}
      {aiInsights.risk_districts && aiInsights.risk_districts.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Districts Requiring Attention
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {aiInsights.risk_districts.map((district, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 rounded-full text-sm font-medium"
              >
                {district}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Top Performers */}
      {aiInsights.top_performers && aiInsights.top_performers.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Award className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Top Performing Districts
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {aiInsights.top_performers.map((performer, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded-full text-sm font-medium"
              >
                {performer}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!aiInsights.predictiveAlert &&
        (!aiInsights.keyTopics || aiInsights.keyTopics.length === 0) &&
        (!aiInsights.recommendations || aiInsights.recommendations.length === 0) &&
        (!aiInsights.risk_districts || aiInsights.risk_districts.length === 0) &&
        (!aiInsights.top_performers || aiInsights.top_performers.length === 0) && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No insights data available.
          </div>
        )}
    </div>
  );
}

