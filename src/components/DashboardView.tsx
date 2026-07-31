import React from 'react';
import { SleepLog, SleepGoal, SleepStats } from '../types';
import { formatDuration, calculateSleepScore } from '../utils/sleepCalculators';
import { FACTOR_LABELS } from '../data/sampleData';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, ReferenceLine, Cell } from 'recharts';
import { Moon, Star, Clock, AlertTriangle, Sparkles, TrendingUp, Calendar, Plus, Edit2, Trash2, CheckCircle2 } from 'lucide-react';

interface DashboardViewProps {
  logs: SleepLog[];
  stats: SleepStats;
  goals: SleepGoal;
  onOpenLogModal: (editingLog?: SleepLog) => void;
  onDeleteLog: (id: string) => void;
  onNavigateToAdvice: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  logs,
  stats,
  goals,
  onOpenLogModal,
  onDeleteLog,
  onNavigateToAdvice,
}) => {
  const latestLog = logs[logs.length - 1];
  const last7Logs = logs.slice(-7);

  // Prepare 7-day chart data
  const chartData = last7Logs.map((log) => {
    const durationHours = Math.round((log.durationMinutes / 60) * 10) / 10;
    const dateLabel = new Date(log.date).toLocaleDateString(undefined, { weekday: 'short', month: 'numeric', day: 'numeric' });
    return {
      date: dateLabel,
      hours: durationHours,
      quality: log.quality,
      score: calculateSleepScore(log, goals.targetHours),
    };
  });

  return (
    <div className="space-y-8 pb-12">
      
      {/* Hero Welcome & Quick Alert Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30">
                Sleep Health Overview
              </span>
              <span className="text-xs text-slate-400">Target: {goals.targetHours}h / night</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {latestLog ? `Last Sleep: ${formatDuration(latestLog.durationMinutes)}` : 'Welcome to Somna Sleep Tracker'}
            </h1>
            <p className="text-sm text-slate-300 max-w-xl">
              {latestLog
                ? `Logged on ${new Date(latestLog.date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })} with ${latestLog.quality}/5 quality rating and ${latestLog.mood.toLowerCase()} waking mood.`
                : 'Start tracking your sleeping hours to gain deep health insights and circadian advice.'}
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              id="btn-ai-advice-quick"
              onClick={onNavigateToAdvice}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-semibold text-xs sm:text-sm shadow-lg shadow-amber-500/20 flex items-center space-x-2 transition-all"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>Get AI Health Advice</span>
            </button>
            <button
              onClick={() => onOpenLogModal()}
              className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs sm:text-sm shadow-lg shadow-indigo-600/30 flex items-center space-x-1.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Log Night</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Avg Duration */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Avg Sleep Duration</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-white">{stats.avgDurationHours}h</span>
            <span className="text-xs text-slate-400">/ {goals.targetHours}h target</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                stats.avgDurationHours >= goals.targetHours
                  ? 'bg-emerald-500'
                  : stats.avgDurationHours >= goals.targetHours - 1
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
              }`}
              style={{ width: `${Math.min(100, (stats.avgDurationHours / goals.targetHours) * 100)}%` }}
            />
          </div>
        </div>

        {/* Card 2: Sleep Quality Rating */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Avg Quality Score</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Star className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-white">{stats.avgQuality}</span>
            <span className="text-xs text-slate-400">/ 5 stars</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            {stats.avgQuality >= 4 ? '✨ Restful & High Quality' : stats.avgQuality >= 3 ? '⚖️ Moderate Quality' : '⚠️ Unrested / Disturbed'}
          </p>
        </div>

        {/* Card 3: Consistency Index */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Bedtime Consistency</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-white">{stats.consistencyScore}%</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            {stats.consistencyScore >= 80 ? '🎯 Regular Sleep Schedule' : '🔄 Shift in Bedtime Observed'}
          </p>
        </div>

        {/* Card 4: Accumulated Sleep Debt */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Sleep Debt</span>
            <div className={`p-2 rounded-xl border ${
              stats.sleepDebtHours > 3 ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
            }`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className={`text-3xl font-extrabold ${stats.sleepDebtHours > 3 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {stats.sleepDebtHours}h
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            {stats.sleepDebtHours === 0 ? '🟢 No sleep debt accrued' : `🔴 Need ~${stats.sleepDebtHours}h extra recovery sleep`}
          </p>
        </div>

      </div>

      {/* 7-Day Sleep Duration Chart */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-indigo-400" />
              <span>7-Day Sleeping Hours Trend</span>
            </h2>
            <p className="text-xs text-slate-400">Dashed line indicates your target goal of {goals.targetHours} hours</p>
          </div>
          <div className="flex items-center space-x-3 text-xs">
            <span className="flex items-center space-x-1 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Goal Met</span>
            </span>
            <span className="flex items-center space-x-1 text-indigo-400">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
              <span>Below Goal</span>
            </span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} domain={[0, 12]} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#f8fafc' }}
                formatter={(val: any) => [`${val} hours`, 'Sleep Duration']}
              />
              <ReferenceLine y={goals.targetHours} stroke="#6366f1" strokeDasharray="4 4" label={{ value: 'Target', fill: '#818cf8', fontSize: 10 }} />
              <Bar dataKey="hours" radius={[8, 8, 0, 0]}>
                {chartData.map((entry, idx) => (
                  <Cell
                    key={`cell-${idx}`}
                    fill={entry.hours >= goals.targetHours ? '#10b981' : entry.hours >= goals.targetHours - 1 ? '#6366f1' : '#f43f5e'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Sleep Logs Section */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Moon className="w-4 h-4 text-indigo-400" />
              <span>Recent Sleep History</span>
            </h2>
            <p className="text-xs text-slate-400">Logged sleeping hours, awakenings, and lifestyle tags</p>
          </div>
          <button
            onClick={() => onOpenLogModal()}
            className="text-xs px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 font-medium transition-colors"
          >
            + Add Entry
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3 rounded-l-xl">Date</th>
                <th className="p-3">Schedule</th>
                <th className="p-3">Duration</th>
                <th className="p-3">Quality</th>
                <th className="p-3">Mood</th>
                <th className="p-3">Factors</th>
                <th className="p-3 text-right rounded-r-xl">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {logs.slice().reverse().map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3 font-medium text-white whitespace-nowrap">
                    {new Date(log.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', weekday: 'short' })}
                  </td>
                  <td className="p-3 text-slate-400 whitespace-nowrap">
                    {log.bedtime} → {log.wakeTime}
                  </td>
                  <td className="p-3 font-semibold text-indigo-300 whitespace-nowrap">
                    {formatDuration(log.durationMinutes)}
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <span className="flex items-center space-x-1 text-amber-400 font-medium">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{log.quality}/5</span>
                    </span>
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200">
                      {log.mood}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1">
                      {log.factors?.slice(0, 3).map((f) => (
                        <span key={f} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                          {FACTOR_LABELS[f]?.icon || '🏷️'} {FACTOR_LABELS[f]?.label || f}
                        </span>
                      ))}
                      {(log.factors?.length || 0) > 3 && (
                        <span className="text-[10px] text-slate-500">+{log.factors.length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td className="p-3 text-right whitespace-nowrap space-x-2">
                    <button
                      onClick={() => onOpenLogModal(log)}
                      title="Edit Entry"
                      className="p-1.5 text-slate-400 hover:text-indigo-300 rounded-lg hover:bg-slate-800 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteLog(log.id)}
                      title="Delete Entry"
                      className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
