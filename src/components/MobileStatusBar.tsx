import React, { useState, useEffect } from 'react';
import { Wifi, BatteryCharging, Signal } from 'lucide-react';

export const MobileStatusBar: React.FC = () => {
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 10000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full bg-slate-950/90 backdrop-blur-md px-6 py-2.5 flex items-center justify-between text-slate-200 text-xs font-semibold select-none z-50 border-b border-slate-900/50">
      
      {/* Time */}
      <div className="w-16 text-left font-mono text-[13px] tracking-tight">
        {timeStr || '09:41'}
      </div>

      {/* Dynamic Notch / Camera Pill Cutout */}
      <div className="w-24 h-4 bg-black rounded-full border border-slate-800/80 flex items-center justify-center space-x-1 shadow-inner">
        <div className="w-2 h-2 rounded-full bg-slate-900 border border-slate-800" />
        <div className="w-1.5 h-1.5 rounded-full bg-indigo-950/80 border border-indigo-700/50" />
      </div>

      {/* Network & Battery */}
      <div className="w-16 flex items-center justify-end space-x-2 text-slate-300">
        <Signal className="w-3.5 h-3.5" />
        <Wifi className="w-3.5 h-3.5" />
        <div className="flex items-center space-x-0.5 bg-slate-900 px-1 py-0.5 rounded text-[10px] border border-slate-800">
          <span>98%</span>
          <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
        </div>
      </div>

    </div>
  );
};
