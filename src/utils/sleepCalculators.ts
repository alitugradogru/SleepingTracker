import { SleepLog, SleepGoal, SleepStats, WakingMood, LifestyleFactor } from '../types';

export const formatDuration = (totalMinutes: number): string => {
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
};

export const parseTimeToMinutes = (timeStr: string): number => {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};

export const calculateDurationMinutes = (bedtime: string, wakeTime: string): number => {
  const bedMins = parseTimeToMinutes(bedtime);
  let wakeMins = parseTimeToMinutes(wakeTime);
  if (wakeMins <= bedMins) {
    wakeMins += 24 * 60;
  }
  return wakeMins - bedMins;
};

export const calculateSleepScore = (log: SleepLog, targetHours: number = 8): number => {
  const durationHours = log.durationMinutes / 60;
  
  // 1. Duration Score (max 40 pts)
  const durationDiff = Math.abs(durationHours - targetHours);
  const durationScore = Math.max(0, 40 - durationDiff * 10);

  // 2. Quality Score (max 30 pts)
  const qualityScore = (log.quality / 5) * 30;

  // 3. Awakenings Penalty (max 15 pts)
  const awakeningScore = Math.max(0, 15 - log.awakenings * 4);

  // 4. Latency Score (max 15 pts)
  let latencyScore = 15;
  if (log.latencyMinutes > 30) latencyScore = 5;
  else if (log.latencyMinutes > 20) latencyScore = 10;

  return Math.min(100, Math.round(durationScore + qualityScore + awakeningScore + latencyScore));
};

export const computeSleepStats = (logs: SleepLog[], goals: SleepGoal): SleepStats => {
  if (logs.length === 0) {
    return {
      totalLogs: 0,
      avgDurationHours: 0,
      avgQuality: 0,
      sleepDebtHours: 0,
      consistencyScore: 100,
      avgLatencyMinutes: 0,
      avgAwakenings: 0,
      frequentMoods: [],
      topPositiveFactors: [],
      topNegativeFactors: [],
    };
  }

  const totalLogs = logs.length;
  const totalMinutes = logs.reduce((acc, l) => acc + l.durationMinutes, 0);
  const avgDurationHours = Math.round((totalMinutes / totalLogs / 60) * 10) / 10;
  const avgQuality = Math.round((logs.reduce((acc, l) => acc + l.quality, 0) / totalLogs) * 10) / 10;
  const avgLatencyMinutes = Math.round(logs.reduce((acc, l) => acc + l.latencyMinutes, 0) / totalLogs);
  const avgAwakenings = Math.round((logs.reduce((acc, l) => acc + l.awakenings, 0) / totalLogs) * 10) / 10;

  // Sleep Debt = (Target Hours * days) - Total Actual Hours
  const targetTotalHours = goals.targetHours * totalLogs;
  const actualTotalHours = totalMinutes / 60;
  const rawDebt = targetTotalHours - actualTotalHours;
  const sleepDebtHours = Math.round(Math.max(0, rawDebt) * 10) / 10;

  // Consistency Score: Std deviation of bedtime in minutes
  const bedMinutesArr = logs.map(l => {
    let m = parseTimeToMinutes(l.bedtime);
    if (m < 12 * 60) m += 24 * 60; // adjust post-midnight bedtimes
    return m;
  });
  const avgBedMins = bedMinutesArr.reduce((a, b) => a + b, 0) / totalLogs;
  const variance = bedMinutesArr.reduce((acc, val) => acc + Math.pow(val - avgBedMins, 2), 0) / totalLogs;
  const stdDevMinutes = Math.sqrt(variance);
  
  // Consistency: 0 std dev = 100%, 60+ mins std dev = <= 50%
  const consistencyScore = Math.max(30, Math.min(100, Math.round(100 - stdDevMinutes * 0.8)));

  // Mood frequency
  const moodCounts: Record<string, number> = {};
  logs.forEach(l => {
    moodCounts[l.mood] = (moodCounts[l.mood] || 0) + 1;
  });
  const frequentMoods = Object.entries(moodCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([m]) => m as WakingMood)
    .slice(0, 3);

  // Factor counts
  const positiveCounts: Record<string, number> = {};
  const negativeCounts: Record<string, number> = {};

  logs.forEach(l => {
    l.factors.forEach(f => {
      if (['cool_room', 'dark_room', 'meditation', 'hot_bath', 'magnesium'].includes(f)) {
        positiveCounts[f] = (positiveCounts[f] || 0) + 1;
      } else {
        negativeCounts[f] = (negativeCounts[f] || 0) + 1;
      }
    });
  });

  const topPositiveFactors = Object.entries(positiveCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([f]) => f as LifestyleFactor)
    .slice(0, 3);

  const topNegativeFactors = Object.entries(negativeCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([f]) => f as LifestyleFactor)
    .slice(0, 3);

  return {
    totalLogs,
    avgDurationHours,
    avgQuality,
    sleepDebtHours,
    consistencyScore,
    avgLatencyMinutes,
    avgAwakenings,
    frequentMoods,
    topPositiveFactors,
    topNegativeFactors,
  };
};

export const calculateSleepCycles = (wakeTimeStr: string, cyclesCount: number = 5): string => {
  // Each sleep cycle is ~90 mins + 15 mins to fall asleep
  const wakeMins = parseTimeToMinutes(wakeTimeStr);
  const totalMinsNeeded = cyclesCount * 90 + 15;
  let bedMins = wakeMins - totalMinsNeeded;
  if (bedMins < 0) bedMins += 24 * 60;

  const h = Math.floor(bedMins / 60) % 24;
  const m = bedMins % 60;
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  return `${pad(h)}:${pad(m)}`;
};

export const calculateCaffeineCutoff = (bedtimeStr: string): string => {
  // Caffeine half-life is 5-8 hours. Recommended cutoff is 10 hours before bed.
  const bedMins = parseTimeToMinutes(bedtimeStr);
  let cutoffMins = bedMins - 10 * 60;
  if (cutoffMins < 0) cutoffMins += 24 * 60;

  const h = Math.floor(cutoffMins / 60) % 24;
  const m = cutoffMins % 60;
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  return `${pad(h)}:${pad(m)}`;
};
