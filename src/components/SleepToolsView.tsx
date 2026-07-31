import React, { useState } from 'react';
import { SleepGoal } from '../types';
import { calculateSleepCycles, calculateCaffeineCutoff } from '../utils/sleepCalculators';
import { sleepAudio } from '../utils/audioSynthesizer';
import { Clock, Coffee, Volume2, Wind, Sparkles, Moon, Sun, Play, Pause } from 'lucide-react';

interface SleepToolsViewProps {
  goals: SleepGoal;
}

export const SleepToolsView: React.FC<SleepToolsViewProps> = ({ goals }) => {
  // Calculator 1 State
  const [calcWakeTime, setCalcWakeTime] = useState<string>(goals.targetWakeTime || '06:30');
  
  // Audio State
  const [activeSound, setActiveSound] = useState<'rain' | 'waves' | 'pink_noise' | 'crickets' | 'none'>('none');
  const [volume, setVolume] = useState<number>(0.5);

  // Breathing State
  const [isBreathingActive, setIsBreathingActive] = useState<boolean>(false);
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const [breathSec, setBreathSec] = useState<number>(4);

  // Breathing Interval
  React.useEffect(() => {
    let timer: any = null;
    if (isBreathingActive) {
      timer = setInterval(() => {
        setBreathSec((prev) => {
          if (prev <= 1) {
            if (breathPhase === 'Inhale') {
              setBreathPhase('Hold');
              return 7;
            } else if (breathPhase === 'Hold') {
              setBreathPhase('Exhale');
              return 8;
            } else {
              setBreathPhase('Inhale');
              return 4;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isBreathingActive, breathPhase]);

  const handleSoundChange = (type: 'rain' | 'waves' | 'pink_noise' | 'crickets' | 'none') => {
    setActiveSound(type);
    sleepAudio.playSound(type, volume);
  };

  const handleVolumeChange = (v: number) => {
    setVolume(v);
    sleepAudio.setVolume(v);
  };

  // 90 min cycles times
  const cycle6Bed = calculateSleepCycles(calcWakeTime, 6); // 9h 15m
  const cycle5Bed = calculateSleepCycles(calcWakeTime, 5); // 7h 45m
  const cycle4Bed = calculateSleepCycles(calcWakeTime, 4); // 6h 15m
  const cycle3Bed = calculateSleepCycles(calcWakeTime, 3); // 4h 45m

  const caffeineCutoff = calculateCaffeineCutoff(goals.targetBedtime);

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <h1 className="text-2xl font-extrabold text-white flex items-center space-x-2">
          <Clock className="w-6 h-6 text-indigo-400" />
          <span>Circadian & Sleep Health Tools</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Calculate 90-minute sleep cycles, caffeine cutoffs, and practice relaxation breathing.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Tool 1: 90-Minute Sleep Cycle Calculator */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center space-x-2.5 border-b border-slate-800 pb-3">
            <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400">
              <Moon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Sleep Cycle Alarm Calculator</h2>
              <p className="text-xs text-slate-400">Avoid sleep inertia by waking up at the end of a 90-minute cycle</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center space-x-1">
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span>What time do you want to wake up?</span>
            </label>
            <input
              type="time"
              value={calcWakeTime}
              onChange={(e) => setCalcWakeTime(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-semibold text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-2 pt-2">
            <span className="text-xs text-slate-400 font-medium block">Ideal bedtimes to wake up refreshed:</span>
            
            <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-800/40 flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-emerald-300">{cycle5Bed}</span>
                <span className="text-[11px] text-slate-400 block">5 Cycles (7h 30m sleep + 15m latency)</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                Recommended
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-indigo-950/40 border border-indigo-800/40 flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-indigo-300">{cycle6Bed}</span>
                <span className="text-[11px] text-slate-400 block">6 Cycles (9h sleep + 15m latency)</span>
              </div>
              <span className="text-[10px] text-indigo-300">Deep Recovery</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-slate-200">{cycle4Bed}</span>
                <span className="text-[11px] text-slate-400 block">4 Cycles (6h sleep + 15m latency)</span>
              </div>
              <span className="text-[10px] text-slate-400">Minimum</span>
            </div>
          </div>
        </div>

        {/* Tool 2: Caffeine Cutoff Calculator */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center space-x-2.5 border-b border-slate-800 pb-3">
            <div className="p-2 rounded-xl bg-amber-600/20 text-amber-400">
              <Coffee className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Caffeine Cutoff Clock</h2>
              <p className="text-xs text-slate-400">Protect adenosine receptors and deep sleep quality</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-800/40 space-y-2">
            <span className="text-xs text-amber-300 font-semibold block">Your Target Bedtime: {goals.targetBedtime}</span>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold text-white">{caffeineCutoff}</span>
              <span className="text-xs text-amber-300 font-medium">Last Coffee / Energy Drink</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed pt-1">
              Caffeine has a half-life of 5-8 hours. Consuming caffeine after {caffeineCutoff} blocks adenosine receptors in the brain, reducing deep Stage 3 slow-wave sleep.
            </p>
          </div>

          {/* Tool 3: Ambient Sound Synthesizer */}
          <div className="pt-2 space-y-3">
            <h3 className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
              <Volume2 className="w-4 h-4 text-indigo-400" />
              <span>Relaxing Ambient Sound Synthesizer</span>
            </h3>

            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'rain', label: 'Rainfall', icon: '🌧️' },
                { id: 'waves', label: 'Ocean Waves', icon: '🌊' },
                { id: 'crickets', label: 'Night Crickets', icon: '🦗' },
                { id: 'pink_noise', label: 'Deep Pink Noise', icon: '💨' },
              ].map((snd) => (
                <button
                  key={snd.id}
                  onClick={() => handleSoundChange(activeSound === snd.id ? 'none' : (snd.id as any))}
                  className={`p-2.5 rounded-xl text-xs font-medium border flex items-center justify-center space-x-1.5 transition-all ${
                    activeSound === snd.id
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <span>{snd.icon}</span>
                  <span>{snd.label}</span>
                </button>
              ))}
            </div>

            {activeSound !== 'none' && (
              <div className="flex items-center space-x-3 pt-1">
                <span className="text-xs text-slate-400">Vol:</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volume}
                  onChange={(e) => handleVolumeChange(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Tool 4: 4-7-8 Breathing Wind-down Exercise */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-cyan-600/20 text-cyan-400">
              <Wind className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">4-7-8 Parasympathetic Breathing Exercise</h2>
              <p className="text-xs text-slate-400">Lowers heart rate and stimulates the vagus nerve before sleep</p>
            </div>
          </div>

          <button
            onClick={() => setIsBreathingActive(!isBreathingActive)}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all ${
              isBreathingActive ? 'bg-rose-600 text-white' : 'bg-cyan-600 text-white hover:bg-cyan-500 shadow-md'
            }`}
          >
            {isBreathingActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isBreathingActive ? 'Stop' : 'Start Practice'}</span>
          </button>
        </div>

        {isBreathingActive ? (
          <div className="p-8 rounded-2xl bg-cyan-950/20 border border-cyan-800/30 text-center space-y-4">
            <div className="text-xs font-semibold text-cyan-400 uppercase tracking-widest">{breathPhase}</div>
            <div className="text-5xl font-extrabold text-white font-mono">{breathSec}s</div>
            
            <div className="w-24 h-24 mx-auto rounded-full bg-cyan-500/20 border-2 border-cyan-400 flex items-center justify-center animate-pulse">
              <Sparkles className="w-8 h-8 text-cyan-300" />
            </div>

            <p className="text-xs text-slate-300 max-w-sm mx-auto">
              {breathPhase === 'Inhale' && 'Inhale quietly through your nose for 4 seconds.'}
              {breathPhase === 'Hold' && 'Hold your breath calmly for 7 seconds.'}
              {breathPhase === 'Exhale' && 'Exhale completely through your mouth for 8 seconds.'}
            </p>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 text-xs text-slate-300 space-y-2">
            <p className="font-semibold text-white">How the 4-7-8 technique works:</p>
            <ul className="list-disc list-inside space-y-1 text-slate-400">
              <li>Inhale quietly through your nose for 4 seconds.</li>
              <li>Hold your breath for 7 seconds.</li>
              <li>Exhale completely through your mouth for 8 seconds.</li>
              <li>Repeat for 4 full breath cycles to induce physiological calming.</li>
            </ul>
          </div>
        )}
      </div>

    </div>
  );
};
