export type SleepQualityRating = 1 | 2 | 3 | 4 | 5;

export type WakingMood = 
  | 'Refreshed' 
  | 'Energetic' 
  | 'Calm' 
  | 'Groggy' 
  | 'Tired' 
  | 'Anxious' 
  | 'Headache';

export type LifestyleFactor = 
  | 'caffeine_late' 
  | 'alcohol' 
  | 'heavy_meal' 
  | 'screen_time' 
  | 'exercise_evening' 
  | 'meditation' 
  | 'cool_room' 
  | 'dark_room' 
  | 'stress_high' 
  | 'hot_bath' 
  | 'magnesium';

export interface SleepLog {
  id: string;
  date: string; // YYYY-MM-DD
  bedtime: string; // HH:mm
  wakeTime: string; // HH:mm
  durationMinutes: number; // calculated total minutes slept
  quality: SleepQualityRating; // 1-5
  awakenings: number; // times woken up
  latencyMinutes: number; // mins to fall asleep
  mood: WakingMood;
  factors: LifestyleFactor[];
  notes?: string;
}

export interface SleepGoal {
  targetHours: number;
  targetBedtime: string; // "22:30"
  targetWakeTime: string; // "06:30"
}

export interface SleepStats {
  totalLogs: number;
  avgDurationHours: number;
  avgQuality: number;
  sleepDebtHours: number;
  consistencyScore: number; // 0-100%
  avgLatencyMinutes: number;
  avgAwakenings: number;
  frequentMoods: WakingMood[];
  topPositiveFactors: LifestyleFactor[];
  topNegativeFactors: LifestyleFactor[];
}

export interface ActionableAdvice {
  title: string;
  category: 'Circadian' | 'Environment' | 'Routine' | 'Nutrition & Physiology';
  impact: 'High' | 'Medium';
  description: string;
}

export interface AIAdvice {
  overallAssessment: string;
  sleepScoreRating: 'Excellent' | 'Good' | 'Fair' | 'Needs Attention';
  keyObservations: string[];
  actionableAdvice: ActionableAdvice[];
  optimalSchedule: {
    recommendedBedtime: string;
    recommendedWakeTime: string;
    caffeineCutoffTime: string;
    windDownStartTime: string;
  };
  healthAlert?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

export type ViewTab = 'dashboard' | 'logs' | 'analytics' | 'ai-advisor' | 'tools';
