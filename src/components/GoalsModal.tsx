import React, { useState } from 'react';
import { SleepGoal } from '../types';
import { X, Target, Moon, Sun } from 'lucide-react';

interface GoalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  goals: SleepGoal;
  onSave: (newGoals: SleepGoal) => void;
}

export const GoalsModal: React.FC<GoalsModalProps> = ({
  isOpen,
  onClose,
  goals,
  onSave,
}) => {
  const [targetHours, setTargetHours] = useState<number>(goals.targetHours);
  const [targetBedtime, setTargetBedtime] = useState<string>(goals.targetBedtime);
  const [targetWakeTime, setTargetWakeTime] = useState<string>(goals.targetWakeTime);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      targetHours,
      targetBedtime,
      targetWakeTime,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
        
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white">Uyku Hedefleri & Ayarlar</h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Hedef Gece Uykusu Süresi ({targetHours} Saat)
            </label>
            <input
              type="range"
              min="5"
              max="11"
              step="0.5"
              value={targetHours}
              onChange={(e) => setTargetHours(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <div className="flex justify-between text-[11px] text-slate-500 mt-1">
              <span>5 sa</span>
              <span>7-8 sa (İdeal)</span>
              <span>11 sa</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center space-x-1">
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
                <span>Hedef Yatış Saati</span>
              </label>
              <input
                type="time"
                value={targetBedtime}
                onChange={(e) => setTargetBedtime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center space-x-1">
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span>Hedef Uyanış Saati</span>
              </label>
              <input
                type="time"
                value={targetWakeTime}
                onChange={(e) => setTargetWakeTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
            >
              İptal
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow-md"
            >
              Hedefi Güncelle
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
