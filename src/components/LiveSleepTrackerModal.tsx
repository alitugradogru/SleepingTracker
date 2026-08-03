import React, { useState, useEffect } from 'react';
import { sleepAudio } from '../utils/audioSynthesizer';
import { Moon, Volume2, VolumeX, Sun, Wind, Sparkles } from 'lucide-react';

interface LiveSleepTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFinishSleep: (bedtimeStr: string, wakeTimeStr: string, dateStr: string) => void;
}

export const LiveSleepTrackerModal: React.FC<LiveSleepTrackerModalProps> = ({
  isOpen,
  onClose,
  onFinishSleep,
}) => {
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [activeSound, setActiveSound] = useState<'rain' | 'waves' | 'pink_noise' | 'crickets' | 'none'>('none');
  const [volume, setVolume] = useState<number>(0.5);
  const [showBreathing, setShowBreathing] = useState<boolean>(false);
  const [breathPhase, setBreathPhase] = useState<'Nefes Al' | 'Tut' | 'Nefes Ver'>('Nefes Al');
  const [breathSec, setBreathSec] = useState<number>(4);

  // Live timer interval
  useEffect(() => {
    let interval: any = null;
    if (isOpen && startTime) {
      interval = setInterval(() => {
        const secs = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);
        setElapsedSeconds(secs);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOpen, startTime]);

  // Breathing exercise loop
  useEffect(() => {
    let breathTimer: any = null;
    if (showBreathing) {
      breathTimer = setInterval(() => {
        setBreathSec((prev) => {
          if (prev <= 1) {
            if (breathPhase === 'Nefes Al') {
              setBreathPhase('Tut');
              return 7;
            } else if (breathPhase === 'Tut') {
              setBreathPhase('Nefes Ver');
              return 8;
            } else {
              setBreathPhase('Nefes Al');
              return 4;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (breathTimer) clearInterval(breathTimer);
    };
  }, [showBreathing, breathPhase]);

  const handleStartSleep = () => {
    const now = new Date();
    setStartTime(now);
    setElapsedSeconds(0);
  };

  const handleSoundChange = (type: 'rain' | 'waves' | 'pink_noise' | 'crickets' | 'none') => {
    setActiveSound(type);
    sleepAudio.playSound(type, volume);
  };

  const handleVolumeChange = (v: number) => {
    setVolume(v);
    sleepAudio.setVolume(v);
  };

  const handleWakeUp = () => {
    sleepAudio.stop();
    if (startTime) {
      const now = new Date();
      const formatTime = (d: Date) => {
        const h = d.getHours().toString().padStart(2, '0');
        const m = d.getMinutes().toString().padStart(2, '0');
        return `${h}:${m}`;
      };
      const bedStr = formatTime(startTime);
      const wakeStr = formatTime(now);
      const dateStr = startTime.toISOString().split('T')[0];

      onFinishSleep(bedStr, wakeStr, dateStr);
    }
    onClose();
  };

  const handleExitModal = () => {
    sleepAudio.stop();
    onClose();
  };

  if (!isOpen) return null;

  const hours = Math.floor(elapsedSeconds / 3600);
  const minutes = Math.floor((elapsedSeconds % 3600) / 60);
  const seconds = elapsedSeconds % 60;

  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-md">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl overflow-hidden">
        
        {/* Glow ambient circle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header close */}
        <button
          onClick={handleExitModal}
          className="absolute top-5 right-5 text-slate-500 hover:text-white text-xs px-3 py-1.5 rounded-xl bg-slate-800/60 transition-colors"
        >
          Gece Modunu Kapat
        </button>

        {/* Icon & Title */}
        <div className="inline-flex p-4 rounded-2xl bg-indigo-950/80 border border-indigo-700/50 text-indigo-400 mb-4 shadow-lg">
          <Moon className="w-8 h-8 animate-pulse" />
        </div>

        <h2 className="text-2xl font-bold text-white mb-1">Canlı Gece Uykusu Takibi</h2>
        <p className="text-xs text-slate-400 mb-6">
          {startTime ? 'Uyku oturumu aktif. İyi uykular!' : 'Uyumak için yatağa geçtiğinizde başlat düğmesine basın'}
        </p>

        {/* Live Timer Display */}
        {startTime ? (
          <div className="my-6 p-6 rounded-2xl bg-slate-950/80 border border-slate-800/80">
            <div className="text-xs font-medium text-indigo-400 mb-2 uppercase tracking-widest">
              Geçen Uyku Süresi
            </div>
            <div className="text-5xl font-extrabold text-white font-mono tracking-tight">
              {pad(hours)}:{pad(minutes)}:{pad(seconds)}
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Başlama saati: {startTime.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        ) : (
          <button
            onClick={handleStartSleep}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold shadow-xl shadow-indigo-600/30 transition-all transform active:scale-95 mb-6"
          >
            🌙 Şimdi Uykuyu Başlat
          </button>
        )}

        {/* Ambient Relaxation Sounds */}
        <div className="mb-6 bg-slate-950/60 p-4 rounded-2xl border border-slate-800 text-left">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
              <Volume2 className="w-4 h-4 text-indigo-400" />
              <span>Rahatlatıcı Ortam Sesi</span>
            </span>
            {activeSound !== 'none' && (
              <span className="text-[10px] text-emerald-400 font-medium px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-800">
                Ses Çalınıyor
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
            {[
              { id: 'rain', label: 'Yağmur', icon: '🌧️' },
              { id: 'waves', label: 'Dalgalar', icon: '🌊' },
              { id: 'crickets', label: 'Cırcır Böceği', icon: '🦗' },
              { id: 'pink_noise', label: 'Derin Rüzgar', icon: '💨' },
            ].map((snd) => (
              <button
                key={snd.id}
                onClick={() => handleSoundChange(activeSound === snd.id ? 'none' : (snd.id as any))}
                className={`p-2.5 rounded-xl text-xs font-medium border flex items-center justify-center space-x-1.5 transition-all ${
                  activeSound === snd.id
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <span>{snd.icon}</span>
                <span>{snd.label}</span>
              </button>
            ))}
          </div>

          {activeSound !== 'none' && (
            <div className="flex items-center space-x-3 pt-2">
              <VolumeX className="w-3.5 h-3.5 text-slate-500" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => handleVolumeChange(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <Volume2 className="w-3.5 h-3.5 text-slate-300" />
            </div>
          )}
        </div>

        {/* 4-7-8 Wind-down Breathing Toggle */}
        <div className="mb-6 text-left">
          <button
            onClick={() => setShowBreathing(!showBreathing)}
            className="w-full p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 flex items-center justify-between text-xs text-slate-300 transition-colors"
          >
            <span className="flex items-center space-x-2">
              <Wind className="w-4 h-4 text-cyan-400" />
              <span>4-7-8 Rahatlama Nefes Egzersizi</span>
            </span>
            <span className="text-indigo-400 font-medium">{showBreathing ? 'Gizle' : 'Başlat'}</span>
          </button>

          {showBreathing && (
            <div className="mt-3 p-4 rounded-2xl bg-cyan-950/30 border border-cyan-800/40 text-center">
              <div className="text-xs font-semibold text-cyan-300 uppercase tracking-wider mb-2">
                {breathPhase}
              </div>
              <div className="text-3xl font-extrabold text-white mb-2">{breathSec}s</div>
              <div className="w-16 h-16 mx-auto rounded-full bg-cyan-500/20 border-2 border-cyan-400 flex items-center justify-center animate-pulse">
                <Sparkles className="w-6 h-6 text-cyan-300" />
              </div>
              <p className="text-[11px] text-cyan-200/80 mt-2">
                {breathPhase === 'Nefes Al' && 'Burnunuzdan 4 saniye boyunca derin nefes alın'}
                {breathPhase === 'Tut' && 'Nefesinizi 7 saniye sakince tutun'}
                {breathPhase === 'Nefes Ver' && 'Ağzınızdan 8 saniye boyunca yavaşça nefes verin'}
              </p>
            </div>
          )}
        </div>

        {/* Wake up Action */}
        {startTime && (
          <button
            onClick={handleWakeUp}
            className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center space-x-2"
          >
            <Sun className="w-5 h-5 text-slate-950" />
            <span>☀️ Uyandım (Oturumu Kaydet)</span>
          </button>
        )}

      </div>
    </div>
  );
};
