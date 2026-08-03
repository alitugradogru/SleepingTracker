import React from 'react';
import { ViewTab, SleepGoal, UserProfile } from '../types';
import { Home, Calendar, Plus, Sparkles, Sliders, User, BarChart3 } from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: ViewTab;
  setActiveTab: (tab: ViewTab) => void;
  onOpenLogModal: () => void;
  currentUser: UserProfile | null;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenLogModal,
  currentUser,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800/80 px-2 py-2 max-w-lg mx-auto sm:rounded-t-3xl shadow-2xl">
      <div className="flex items-center justify-around relative">
        
        {/* Tab 1: Home / Dashboard */}
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex-1 flex flex-col items-center py-1 transition-all active:scale-95 ${
            activeTab === 'dashboard' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className={`p-1.5 rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-indigo-600/20 text-indigo-400' : ''}`}>
            <Home className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-medium mt-0.5">Özet</span>
        </button>

        {/* Tab 2: Logs */}
        <button
          onClick={() => setActiveTab('logs')}
          className={`flex-1 flex flex-col items-center py-1 transition-all active:scale-95 ${
            activeTab === 'logs' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className={`p-1.5 rounded-xl transition-all ${activeTab === 'logs' ? 'bg-indigo-600/20 text-indigo-400' : ''}`}>
            <Calendar className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-medium mt-0.5">Günlük</span>
        </button>

        {/* Floating Center Action Button (+ Quick Sleep Log) */}
        <div className="flex-1 flex justify-center -mt-6">
          <button
            onClick={onOpenLogModal}
            title="Hızlı Uyku Kaydı Ekle"
            className="w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-600 via-purple-600 to-amber-400 text-white flex items-center justify-center shadow-lg shadow-indigo-600/40 ring-4 ring-slate-950 active:scale-90 transition-transform duration-200"
          >
            <Plus className="w-7 h-7 text-white stroke-[2.5]" />
          </button>
        </div>

        {/* Tab 3: AI Advisor */}
        <button
          onClick={() => setActiveTab('ai-advisor')}
          className={`flex-1 flex flex-col items-center py-1 transition-all active:scale-95 relative ${
            activeTab === 'ai-advisor' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className={`p-1.5 rounded-xl transition-all ${activeTab === 'ai-advisor' ? 'bg-indigo-600/20 text-indigo-400' : ''}`}>
            <Sparkles className="w-5 h-5" />
            <span className="absolute top-1 right-3 w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          </div>
          <span className="text-[10px] font-medium mt-0.5">Yapay Zeka</span>
        </button>

        {/* Tab 4: Analytics / Tools */}
        <button
          onClick={() => setActiveTab('tools')}
          className={`flex-1 flex flex-col items-center py-1 transition-all active:scale-95 ${
            activeTab === 'tools' || activeTab === 'analytics' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className={`p-1.5 rounded-xl transition-all ${activeTab === 'tools' || activeTab === 'analytics' ? 'bg-indigo-600/20 text-indigo-400' : ''}`}>
            <Sliders className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-medium mt-0.5">Araçlar</span>
        </button>

      </div>
    </nav>
  );
};
