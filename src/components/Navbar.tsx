import React from 'react';
import { ViewTab, SleepGoal, UserProfile } from '../types';
import { Moon, BarChart3, Sparkles, Sliders, Calendar, Play, Plus, Target, User, Smartphone, Maximize2, Settings } from 'lucide-react';

interface NavbarProps {
  activeTab: ViewTab;
  setActiveTab: (tab: ViewTab) => void;
  onOpenLogModal: () => void;
  onOpenLiveTracker: () => void;
  onOpenGoalsModal: () => void;
  onOpenExportModal?: () => void;
  goals: SleepGoal;
  currentUser: UserProfile | null;
  isPhoneFrameMode?: boolean;
  setIsPhoneFrameMode?: (val: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenLogModal,
  onOpenLiveTracker,
  onOpenGoalsModal,
  onOpenExportModal,
  goals,
  currentUser,
  isPhoneFrameMode = true,
  setIsPhoneFrameMode,
}) => {
  const navItems = [
    { id: 'dashboard' as ViewTab, label: 'Özet', icon: BarChart3 },
    { id: 'logs' as ViewTab, label: 'Günlük', icon: Calendar },
    { id: 'analytics' as ViewTab, label: 'Grafikler', icon: BarChart3 },
    { id: 'ai-advisor' as ViewTab, label: 'Yapay Zeka', icon: Sparkles },
    { id: 'tools' as ViewTab, label: 'Araçlar', icon: Sliders },
    { id: 'signup' as ViewTab, label: currentUser ? 'Profil' : 'Kayıt Ol', icon: User },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          
          {/* Logo & Mobile Brand */}
          <div className="flex items-center space-x-2.5 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-amber-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 active:scale-95 transition-transform">
              <Moon className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-bold text-base sm:text-lg tracking-tight text-white">Somna</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold">
                  Mobil Uygulama
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden md:block">Mobil Biyolojik Uyku & Sağlık Takibi</p>
            </div>
          </div>

          {/* View Mode Toggle (Phone Frame vs Full Screen) for Desktop */}
          {setIsPhoneFrameMode && (
            <div className="hidden md:flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setIsPhoneFrameMode(true)}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  isPhoneFrameMode
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Mobil Cihaz Çerçevesi</span>
              </button>
              <button
                onClick={() => setIsPhoneFrameMode(false)}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  !isPhoneFrameMode
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Tam Ekran Mobil</span>
              </button>
            </div>
          )}

          {/* Header Action Controls */}
          <div className="flex items-center space-x-2">
            
            {/* Live Sleep Mode Tracker */}
            <button
              id="btn-live-sleep-tracker"
              onClick={onOpenLiveTracker}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/60 text-indigo-200 text-xs font-medium transition-all active:scale-95 shadow-sm"
            >
              <Play className="w-3 h-3 text-indigo-400 fill-indigo-400" />
              <span>Uyku Modu</span>
            </button>

            {/* Mobile Export & Settings */}
            {onOpenExportModal && (
              <button
                onClick={onOpenExportModal}
                title="Mobil Ayarlar & Dışa Aktar"
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all active:scale-95"
              >
                <Settings className="w-4 h-4 text-indigo-300" />
              </button>
            )}

            {/* User Profile / Account */}
            <button
              id="btn-signup-nav"
              onClick={() => setActiveTab('signup')}
              className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all active:scale-95 ${
                currentUser
                  ? 'bg-indigo-950/60 border-indigo-700/60 text-indigo-200'
                  : 'bg-gradient-to-r from-indigo-600 to-violet-600 border-indigo-500 text-white shadow-sm'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{currentUser ? currentUser.name.split(' ')[0] : 'Profil'}</span>
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};

