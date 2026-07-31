import React, { useState, useEffect } from 'react';
import { SleepLog, SleepQualityRating, WakingMood, LifestyleFactor } from '../types';
import { FACTOR_LABELS } from '../data/sampleData';
import { calculateDurationMinutes, formatDuration } from '../utils/sleepCalculators';
import { X, Star, Clock, Moon, Sun, Tag, FileText, Check } from 'lucide-react';

interface SleepLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (log: Omit<SleepLog, 'id'> & { id?: string }) => void;
  editingLog?: SleepLog | null;
  initialTimes?: { bedtime?: string; wakeTime?: string; date?: string };
}

export const SleepLogModal: React.FC<SleepLogModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingLog,
  initialTimes,
}) => {
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [bedtime, setBedtime] = useState<string>('22:30');
  const [wakeTime, setWakeTime] = useState<string>('06:30');
  const [quality, setQuality] = useState<SleepQualityRating>(4);
  const [awakenings, setAwakenings] = useState<number>(1);
  const [latencyMinutes, setLatencyMinutes] = useState<number>(15);
  const [mood, setMood] = useState<WakingMood>('Refreshed');
  const [selectedFactors, setSelectedFactors] = useState<LifestyleFactor[]>(['cool_room', 'dark_room']);
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (editingLog) {
      setDate(editingLog.date);
      setBedtime(editingLog.bedtime);
      setWakeTime(editingLog.wakeTime);
      setQuality(editingLog.quality);
      setAwakenings(editingLog.awakenings);
      setLatencyMinutes(editingLog.latencyMinutes);
      setMood(editingLog.mood);
      setSelectedFactors(editingLog.factors || []);
      setNotes(editingLog.notes || '');
    } else {
      const today = initialTimes?.date || new Date().toISOString().split('T')[0];
      setDate(today);
      setBedtime(initialTimes?.bedtime || '22:30');
      setWakeTime(initialTimes?.wakeTime || '06:30');
      setQuality(4);
      setAwakenings(1);
      setLatencyMinutes(15);
      setMood('Refreshed');
      setSelectedFactors(['cool_room', 'dark_room']);
      setNotes('');
    }
  }, [editingLog, initialTimes, isOpen]);

  if (!isOpen) return null;

  const durationMins = calculateDurationMinutes(bedtime, wakeTime);

  const toggleFactor = (f: LifestyleFactor) => {
    if (selectedFactors.includes(f)) {
      setSelectedFactors(selectedFactors.filter(item => item !== f));
    } else {
      setSelectedFactors([...selectedFactors, f]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: editingLog ? editingLog.id : undefined,
      date,
      bedtime,
      wakeTime,
      durationMinutes: durationMins,
      quality,
      awakenings,
      latencyMinutes,
      mood,
      factors: selectedFactors,
      notes,
    });
    onClose();
  };

  const moodOptions: { value: WakingMood; emoji: string; color: string }[] = [
    { value: 'Refreshed', emoji: '🌟', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
    { value: 'Energetic', emoji: '⚡', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
    { value: 'Calm', emoji: '🧘', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
    { value: 'Groggy', emoji: '🥴', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
    { value: 'Tired', emoji: '🥱', color: 'bg-slate-700 text-slate-300 border-slate-600' },
    { value: 'Anxious', emoji: '😟', color: 'bg-rose-500/20 text-rose-300 border-rose-500/30' },
    { value: 'Headache', emoji: '🤕', color: 'bg-red-500/20 text-red-300 border-red-500/30' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
              <Moon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                {editingLog ? 'Edit Sleep Session' : 'Log Night Sleep'}
              </h2>
              <p className="text-xs text-slate-400">Record bedtime, quality, and health factors</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Row 1: Date & Sleep Duration Preview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Sleep Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-800/40 flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-indigo-300 block">Total Calculated Sleep</span>
                <span className="text-xl font-bold text-white">{formatDuration(durationMins)}</span>
              </div>
              <div className="text-right text-xs text-slate-400">
                <span>{(durationMins / 60).toFixed(1)} hours</span>
              </div>
            </div>
          </div>

          {/* Row 2: Bedtime & Wake Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center space-x-1.5">
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
                <span>Bedtime (Went to Sleep)</span>
              </label>
              <input
                type="time"
                required
                value={bedtime}
                onChange={(e) => setBedtime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center space-x-1.5">
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span>Wake Time (Woke Up)</span>
              </label>
              <input
                type="time"
                required
                value={wakeTime}
                onChange={(e) => setWakeTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Row 3: Quality Rating (1-5 stars) */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">
              Sleep Quality Score ({quality} / 5 stars)
            </label>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setQuality(star as SleepQualityRating)}
                  className={`p-3 rounded-xl border flex items-center justify-center transition-all ${
                    quality >= star
                      ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                      : 'bg-slate-950 border-slate-800 text-slate-600 hover:text-slate-400'
                  }`}
                >
                  <Star className={`w-6 h-6 ${quality >= star ? 'fill-amber-400' : ''}`} />
                </button>
              ))}
              <span className="text-xs text-slate-400 ml-2">
                {quality === 5 && 'Restful & Deep'}
                {quality === 4 && 'Good Sleep'}
                {quality === 3 && 'Fair / Moderate'}
                {quality === 2 && 'Restless'}
                {quality === 1 && 'Poor / Unrested'}
              </span>
            </div>
          </div>

          {/* Row 4: Latency & Awakenings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                <span>Time to Fall Asleep</span>
              </label>
              <select
                value={latencyMinutes}
                onChange={(e) => setLatencyMinutes(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
              >
                <option value={5}>Instant (&lt; 5 mins)</option>
                <option value={10}>10 - 15 minutes (Ideal)</option>
                <option value={20}>20 - 30 minutes</option>
                <option value={45}>30 - 60 minutes (Slow)</option>
                <option value={90}>Over 1 hour (Insomnia)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Night Awakenings
              </label>
              <select
                value={awakenings}
                onChange={(e) => setAwakenings(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
              >
                <option value={0}>0 times (Slept through)</option>
                <option value={1}>1 time (Briefly)</option>
                <option value={2}>2 times</option>
                <option value={3}>3 times</option>
                <option value={4}>4+ times (Frequent waking)</option>
              </select>
            </div>
          </div>

          {/* Row 5: Waking Mood */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">
              Waking Mood & Energy
            </label>
            <div className="flex flex-wrap gap-2">
              {moodOptions.map((opt) => {
                const isSelected = mood === opt.value;
                return (
                  <button
                    type="button"
                    key={opt.value}
                    onClick={() => setMood(opt.value)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border flex items-center space-x-1.5 transition-all ${
                      isSelected
                        ? `${opt.color} ring-1 ring-indigo-500`
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>{opt.emoji}</span>
                    <span>{opt.value}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 6: Lifestyle Factors & Habits */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2 flex items-center space-x-1.5">
              <Tag className="w-3.5 h-3.5 text-indigo-400" />
              <span>Evening Lifestyle Factors & Environment</span>
            </label>
            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-1">
              {(Object.keys(FACTOR_LABELS) as LifestyleFactor[]).map((factor) => {
                const isSelected = selectedFactors.includes(factor);
                const info = FACTOR_LABELS[factor];
                return (
                  <button
                    type="button"
                    key={factor}
                    onClick={() => toggleFactor(factor)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border flex items-center space-x-1.5 transition-all ${
                      isSelected
                        ? info.category === 'positive'
                          ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200 ring-1 ring-emerald-500/40'
                          : 'bg-rose-950/80 border-rose-500/50 text-rose-200 ring-1 ring-rose-500/40'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-300'
                    }`}
                  >
                    <span>{info.icon}</span>
                    <span>{info.label}</span>
                    {isSelected && <Check className="w-3 h-3 ml-1" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 7: Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center space-x-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Sleep Journal / Notes (Optional)</span>
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Read a book before bed, drank chamomile tea, room felt cozy..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-medium shadow-lg shadow-indigo-600/30 transition-all"
            >
              {editingLog ? 'Save Changes' : 'Save Sleep Entry'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
