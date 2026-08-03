import React, { useState } from 'react';
import { SleepLog, SleepGoal, SleepStats, LifestyleFactor } from '../types';
import { FACTOR_LABELS } from '../data/sampleData';
import { formatDuration } from '../utils/sleepCalculators';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  ReferenceLine,
} from 'recharts';
import { BarChart3, Zap, ShieldCheck, Activity } from 'lucide-react';

interface AnalyticsViewProps {
  logs: SleepLog[];
  stats: SleepStats;
  goals: SleepGoal;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ logs, stats, goals }) => {
  const [rangeDays, setRangeDays] = useState<number>(14);

  const filteredLogs = logs.slice(-rangeDays);

  const moodTranslations: Record<string, string> = {
    Refreshed: 'Dinlenmiş',
    Energetic: 'Enerjik',
    Calm: 'Sakin',
    Groggy: 'Sersem',
    Tired: 'Yorgun',
    Anxious: 'Endişeli',
    Headache: 'Baş Ağrılı',
  };

  // 1. Duration & Debt Trend Data
  let cumulativeDebt = 0;
  const durationTrendData = filteredLogs.map((log) => {
    const hours = Math.round((log.durationMinutes / 60) * 10) / 10;
    const debtToday = Math.max(0, goals.targetHours - hours);
    cumulativeDebt += debtToday;
    return {
      date: new Date(log.date).toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' }),
      hours,
      quality: log.quality,
      target: goals.targetHours,
      accumulatedDebt: Math.round(cumulativeDebt * 10) / 10,
    };
  });

  // 2. Lifestyle Factor Quality Impact Matrix
  const factorQualityMap: Record<string, { totalQuality: number; count: number }> = {};

  filteredLogs.forEach((l) => {
    l.factors.forEach((f) => {
      if (!factorQualityMap[f]) {
        factorQualityMap[f] = { totalQuality: 0, count: 0 };
      }
      factorQualityMap[f].totalQuality += l.quality;
      factorQualityMap[f].count += 1;
    });
  });

  const factorImpactData = Object.entries(factorQualityMap).map(([f, data]) => {
    const avgQuality = Math.round((data.totalQuality / data.count) * 10) / 10;
    const info = FACTOR_LABELS[f as LifestyleFactor];
    return {
      factor: info?.label || f,
      icon: info?.icon || '🏷️',
      category: info?.category || 'negative',
      avgQuality,
      count: data.count,
    };
  }).sort((a, b) => b.avgQuality - a.avgQuality);

  // 3. Waking Mood Pie Data
  const moodMap: Record<string, number> = {};
  filteredLogs.forEach((l) => {
    moodMap[l.mood] = (moodMap[l.mood] || 0) + 1;
  });
  const moodColors: Record<string, string> = {
    Refreshed: '#10b981',
    Energetic: '#f59e0b',
    Calm: '#3b82f6',
    Groggy: '#a855f7',
    Tired: '#64748b',
    Anxious: '#f43f5e',
    Headache: '#ef4444',
  };
  const moodPieData = Object.entries(moodMap).map(([mood, count]) => ({
    name: moodTranslations[mood] || mood,
    value: count,
    color: moodColors[mood] || '#94a3b8',
  }));

  // 4. Estimated Sleep Stages
  const totalMins = stats.avgDurationHours * 60;
  const deepMins = Math.round(totalMins * 0.20);
  const remMins = Math.round(totalMins * 0.25);
  const lightMins = Math.round(totalMins * 0.55);

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white flex items-center space-x-2">
            <BarChart3 className="w-6 h-6 text-indigo-400" />
            <span>Uyku Verileri & Sağlık Analitiği</span>
          </h1>
          <p className="text-xs text-slate-400">Alışkanlıklar, uyku süreleri ve vücut yenilenmesi arasındaki ilişkileri keşfedin</p>
        </div>

        {/* Range Selector */}
        <div className="flex items-center space-x-1 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
          {[
            { days: 7, label: '7 Gün' },
            { days: 14, label: '14 Gün' },
            { days: 30, label: '30 Gün' },
          ].map((item) => (
            <button
              key={item.days}
              onClick={() => setRangeDays(item.days)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                rangeDays === item.days
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart 1: Sleep Duration & Debt Trend Area Chart */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Activity className="w-4 h-4 text-indigo-400" />
              <span>Uyku Süresi vs Hedef Uyku</span>
            </h2>
            <p className="text-xs text-slate-400">Gerçekleşen günlük uyku saatleri ve {goals.targetHours} saatlik hedefiniz</p>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={durationTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} domain={[0, 12]} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#f8fafc' }}
                formatter={(val: any, name: any) => [`${val} saat`, name === 'hours' ? 'Gerçekleşen Uyku' : 'Hedef Uyku']}
              />
              <ReferenceLine y={goals.targetHours} stroke="#10b981" strokeDasharray="4 4" label={{ value: `Hedef (${goals.targetHours}s)`, fill: '#34d399', fontSize: 10 }} />
              <Area type="monotone" dataKey="hours" stroke="#818cf8" strokeWidth={3} fillOpacity={1} fill="url(#colorHours)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Lifestyle Factor Quality Correlation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
          <div className="mb-6">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Alışkanlıkların Uyku Kalitesine Etkisi</span>
            </h2>
            <p className="text-xs text-slate-400">Belirli faktörler mevcut olduğunda ortalama uyku kalitesi puanı (1-5)</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={factorImpactData} layout="vertical" margin={{ top: 0, right: 10, left: 20, bottom: 0 }}>
                <XAxis type="number" domain={[0, 5]} stroke="#64748b" fontSize={11} />
                <YAxis dataKey="factor" type="category" stroke="#94a3b8" fontSize={11} width={120} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                  formatter={(val: any) => [`${val} / 5 Kalite`, 'Ortalama Puan']}
                />
                <Bar dataKey="avgQuality" radius={[0, 8, 8, 0]}>
                  {factorImpactData.map((entry, idx) => (
                    <Cell
                      key={`factor-cell-${idx}`}
                      fill={entry.category === 'positive' ? '#10b981' : '#f43f5e'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Waking Mood Distribution Pie */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-white mb-1">Uyanış Hali / Modu Dağılımı</h2>
            <p className="text-xs text-slate-400 mb-4">Sabah enerjisi durumlarının sıklığı</p>

            <div className="h-44 w-full flex justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={moodPieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={65}
                    paddingAngle={3}
                  >
                    {moodPieData.map((entry, index) => (
                      <Cell key={`mood-pie-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-800">
            {moodPieData.map((m) => (
              <span key={m.name} className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: m.color }} />
                <span className="text-slate-300">{m.name}: {m.value}gün</span>
              </span>
            ))}
          </div>
        </div>

      </div>

      {/* Estimated Sleep Architecture & Stages */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Tahmini Uyku Evreleri Mimarisi</span>
            </h2>
            <p className="text-xs text-slate-400">Ortalama {stats.avgDurationHours} saatlik uykunuza göre biyolojik evre dağılımı</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-800/40">
            <div className="text-xs font-semibold text-indigo-300 uppercase mb-1">Derin Uyku (N3)</div>
            <div className="text-2xl font-extrabold text-white">{formatDuration(deepMins)}</div>
            <p className="text-[11px] text-indigo-200/80 mt-2">
              Fiziksel doku onarımı, büyüme hormonu salgılanması ve bağışıklık sisteminin güçlenmesi.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-800/40">
            <div className="text-xs font-semibold text-purple-300 uppercase mb-1">REM Uykusu (Rüya Evresi)</div>
            <div className="text-2xl font-extrabold text-white">{formatDuration(remMins)}</div>
            <p className="text-[11px] text-purple-200/80 mt-2">
              Hafıza pekiştirilmesi, duygusal düzenleme ve zihinsel yaratıcılık süreçleri.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-800/40">
            <div className="text-xs font-semibold text-cyan-300 uppercase mb-1">Hafif Uyku (N1 & N2)</div>
            <div className="text-2xl font-extrabold text-white">{formatDuration(lightMins)}</div>
            <p className="text-[11px] text-cyan-200/80 mt-2">
              Kalp atış hızının yavaşlaması, vücut ısısının düşmesi ve derin yenilenmeye geçiş evresi.
            </p>
          </div>

        </div>
      </div>

    </div>
  );
};
