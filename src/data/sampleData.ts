import { SleepLog, SleepGoal, LifestyleFactor } from '../types';

export const FACTOR_LABELS: Record<LifestyleFactor, { label: string; icon: string; category: 'negative' | 'positive' }> = {
  caffeine_late: { label: 'Late Caffeine', icon: '☕', category: 'negative' },
  alcohol: { label: 'Alcohol', icon: '🍷', category: 'negative' },
  heavy_meal: { label: 'Late Heavy Meal', icon: '🍕', category: 'negative' },
  screen_time: { label: 'Screens Before Bed', icon: '📱', category: 'negative' },
  exercise_evening: { label: 'Late Heavy Exercise', icon: '🏋️', category: 'negative' },
  meditation: { label: 'Meditation / Breathing', icon: '🧘', category: 'positive' },
  cool_room: { label: 'Cool Room Temp (65-68°F)', icon: '❄️', category: 'positive' },
  dark_room: { label: 'Dark / Blackout Room', icon: '🌙', category: 'positive' },
  stress_high: { label: 'High Evening Stress', icon: '⚡', category: 'negative' },
  hot_bath: { label: 'Warm Shower / Bath', icon: '🛁', category: 'positive' },
  magnesium: { label: 'Magnesium Supplement', icon: '💊', category: 'positive' },
};

export const DEFAULT_GOALS: SleepGoal = {
  targetHours: 8,
  targetBedtime: '22:30',
  targetWakeTime: '06:30',
};

// Generate 14 days of historical sleep logs
export const generateSampleLogs = (): SleepLog[] => {
  const logs: SleepLog[] = [];
  const today = new Date();

  const presets = [
    { bed: '22:45', wake: '06:45', quality: 4, awakenings: 1, latency: 15, mood: 'Refreshed', factors: ['cool_room', 'dark_room', 'meditation'] as LifestyleFactor[], notes: 'Felt very calm after meditation session.' },
    { bed: '23:15', wake: '06:30', quality: 3, awakenings: 2, latency: 25, mood: 'Tired', factors: ['screen_time', 'caffeine_late'] as LifestyleFactor[], notes: 'Scrolled phone until late. Hard to shut brain off.' },
    { bed: '22:30', wake: '06:30', quality: 5, awakenings: 0, latency: 10, mood: 'Energetic', factors: ['cool_room', 'dark_room', 'hot_bath', 'magnesium'] as LifestyleFactor[], notes: 'Deep unbroken sleep. Woke up before alarm!' },
    { bed: '00:15', wake: '07:00', quality: 2, awakenings: 3, latency: 35, mood: 'Groggy', factors: ['screen_time', 'heavy_meal', 'alcohol'] as LifestyleFactor[], notes: 'Ate late pizza and drank wine. Night sweats.' },
    { bed: '23:00', wake: '06:45', quality: 4, awakenings: 1, latency: 15, mood: 'Refreshed', factors: ['cool_room', 'meditation'] as LifestyleFactor[], notes: 'Good consistent night.' },
    { bed: '22:15', wake: '06:15', quality: 5, awakenings: 0, latency: 12, mood: 'Calm', factors: ['cool_room', 'dark_room', 'magnesium'] as LifestyleFactor[], notes: 'Excellent sleep duration.' },
    { bed: '23:45', wake: '07:15', quality: 3, awakenings: 2, latency: 20, mood: 'Groggy', factors: ['caffeine_late', 'screen_time'] as LifestyleFactor[], notes: 'Drank espresso at 5 PM.' },
    { bed: '22:40', wake: '06:40', quality: 4, awakenings: 1, latency: 15, mood: 'Refreshed', factors: ['cool_room', 'dark_room'] as LifestyleFactor[], notes: 'Consistent bedtime.' },
    { bed: '23:30', wake: '06:45', quality: 3, awakenings: 2, latency: 30, mood: 'Tired', factors: ['stress_high', 'screen_time'] as LifestyleFactor[], notes: 'Anxious about work presentation.' },
    { bed: '22:20', wake: '06:30', quality: 5, awakenings: 0, latency: 10, mood: 'Energetic', factors: ['cool_room', 'dark_room', 'meditation', 'magnesium'] as LifestyleFactor[], notes: 'Perfect 8 hours.' },
    { bed: '01:00', wake: '08:00', quality: 2, awakenings: 4, latency: 40, mood: 'Headache', factors: ['alcohol', 'heavy_meal', 'screen_time', 'stress_high'] as LifestyleFactor[], notes: 'Late weekend night out.' },
    { bed: '23:10', wake: '07:10', quality: 4, awakenings: 1, latency: 18, mood: 'Refreshed', factors: ['cool_room', 'hot_bath'] as LifestyleFactor[], notes: 'Catching up on sleep debt.' },
    { bed: '22:30', wake: '06:30', quality: 5, awakenings: 0, latency: 10, mood: 'Refreshed', factors: ['cool_room', 'dark_room', 'meditation'] as LifestyleFactor[], notes: 'Clean sleep routine.' },
    { bed: '22:45', wake: '06:45', quality: 4, awakenings: 1, latency: 15, mood: 'Refreshed', factors: ['cool_room', 'dark_room'] as LifestyleFactor[], notes: 'Feeling well-rested.' },
  ];

  presets.forEach((preset, index) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (13 - index));
    const dateStr = d.toISOString().split('T')[0];

    // Calculate duration in minutes between bedtime and wake time
    const [bedH, bedM] = preset.bed.split(':').map(Number);
    const [wakeH, wakeM] = preset.wake.split(':').map(Number);
    
    let bedMinutes = bedH * 60 + bedM;
    let wakeMinutes = wakeH * 60 + wakeM;
    if (wakeMinutes <= bedMinutes) {
      wakeMinutes += 24 * 60; // Next day wake up
    }
    const durationMinutes = wakeMinutes - bedMinutes;

    logs.push({
      id: `sample-log-${index}`,
      date: dateStr,
      bedtime: preset.bed,
      wakeTime: preset.wake,
      durationMinutes,
      quality: preset.quality as any,
      awakenings: preset.awakenings,
      latencyMinutes: preset.latency,
      mood: preset.mood as any,
      factors: preset.factors,
      notes: preset.notes,
    });
  });

  return logs;
};
