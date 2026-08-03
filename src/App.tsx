import React, { useState, useEffect } from 'react';
import { SleepLog, SleepGoal, ViewTab, UserProfile } from './types';
import { generateSampleLogs, DEFAULT_GOALS } from './data/sampleData';
import { computeSleepStats } from './utils/sleepCalculators';
import { Navbar } from './components/Navbar';
import { MobileStatusBar } from './components/MobileStatusBar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { DashboardView } from './components/DashboardView';
import { SignUpView } from './components/SignUpView';
import { AnalyticsView } from './components/AnalyticsView';
import { AIAdviceView } from './components/AIAdviceView';
import { SleepToolsView } from './components/SleepToolsView';
import { SleepLogModal } from './components/SleepLogModal';
import { LiveSleepTrackerModal } from './components/LiveSleepTrackerModal';
import { GoalsModal } from './components/GoalsModal';
import { AppStoreExportModal } from './components/AppStoreExportModal';
import confetti from 'canvas-confetti';
import { Calendar, Plus, Edit2, Trash2, Star, Smartphone, ShieldCheck } from 'lucide-react';

const STORAGE_KEY_LOGS = 'somna_sleep_logs_v1';
const STORAGE_KEY_GOALS = 'somna_sleep_goals_v1';
const STORAGE_KEY_USER = 'somna_user_profile_v1';

export default function App() {
  const [activeTab, setActiveTab] = useState<ViewTab>('dashboard');
  const [isPhoneFrameMode, setIsPhoneFrameMode] = useState<boolean>(true);
  
  // User Profile State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USER);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading user profile:', e);
    }
    return null;
  });

  // Logs State
  const [logs, setLogs] = useState<SleepLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LOGS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Error loading saved sleep logs:', e);
    }
    return [];
  });

  const [goals, setGoals] = useState<SleepGoal>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_GOALS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading saved goals:', e);
    }
    return DEFAULT_GOALS;
  });

  // Modal States
  const [isLogModalOpen, setIsLogModalOpen] = useState<boolean>(false);
  const [editingLog, setEditingLog] = useState<SleepLog | null>(null);
  const [initialTimes, setInitialTimes] = useState<{ bedtime?: string; wakeTime?: string; date?: string } | null>(null);
  const [isLiveTrackerOpen, setIsLiveTrackerOpen] = useState<boolean>(false);
  const [isGoalsModalOpen, setIsGoalsModalOpen] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_GOALS, JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEY_USER);
    }
  }, [currentUser]);

  // Compute stats
  const stats = computeSleepStats(logs, goals);

  const moodTranslations: Record<string, string> = {
    Refreshed: 'Dinlenmiş',
    Energetic: 'Enerjik',
    Calm: 'Sakin',
    Groggy: 'Sersem',
    Tired: 'Yorgun',
    Anxious: 'Endişeli',
    Headache: 'Baş Ağrılı',
  };

  // CRUD Handlers
  const handleSaveLog = (logData: Omit<SleepLog, 'id'> & { id?: string }) => {
    if (logData.id) {
      setLogs((prev) =>
        prev.map((item) => (item.id === logData.id ? ({ ...logData, id: logData.id } as SleepLog) : item))
      );
    } else {
      const newLog: SleepLog = {
        ...logData,
        id: `sleep-log-${Date.now()}`,
      } as SleepLog;

      setLogs((prev) => [...prev, newLog]);

      if (newLog.durationMinutes / 60 >= goals.targetHours) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });
      }
    }
  };

  const handleDeleteLog = (id: string) => {
    setLogs((prev) => prev.filter((item) => item.id !== id));
  };

  const handleFinishLiveSleep = (bedtimeStr: string, wakeTimeStr: string, dateStr: string) => {
    setEditingLog(null);
    setInitialTimes({ bedtime: bedtimeStr, wakeTime: wakeTimeStr, date: dateStr });
    setIsLogModalOpen(true);
  };

  const handleOpenLogModal = (log?: SleepLog) => {
    setEditingLog(log || null);
    setInitialTimes(null);
    setIsLogModalOpen(true);
  };

  const handleSignUpComplete = (
    profile: UserProfile,
    updatedGoals: SleepGoal,
    initialLog?: Omit<SleepLog, 'id'>
  ) => {
    setCurrentUser(profile);
    setGoals(updatedGoals);

    if (initialLog) {
      handleSaveLog(initialLog);
    }
  };

  const handleSignOut = () => {
    setCurrentUser(null);
  };

  const handleLoadSampleData = () => {
    const sample = generateSampleLogs();
    setLogs(sample);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-indigo-500 selection:text-white flex flex-col items-center justify-start">
      
      {/* Top Mobile Control Bar for Desktop */}
      <div className="w-full bg-slate-900 border-b border-slate-800 px-4 py-2 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center space-x-2">
          <Smartphone className="w-4 h-4 text-indigo-400" />
          <span className="font-semibold text-white">Somna Mobile iOS & Android App</span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
            Aktif Mobil Sürüm
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsPhoneFrameMode(!isPhoneFrameMode)}
            className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors"
          >
            {isPhoneFrameMode ? '📱 Tam Ekran Mobil Moda Geç' : '📱 Telefon Çerçevesine Al'}
          </button>
        </div>
      </div>

      {/* Main Container: Mobile Phone Frame vs Full Mobile Screen */}
      <div
        className={`w-full transition-all duration-300 relative ${
          isPhoneFrameMode
            ? 'max-w-md my-4 sm:my-8 rounded-[48px] border-[10px] border-slate-800/90 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] overflow-hidden bg-slate-950 ring-1 ring-slate-700/50'
            : 'max-w-lg min-h-screen bg-slate-950'
        }`}
      >
        {/* Mobile Status Bar */}
        <MobileStatusBar />

        {/* Mobile Navigation Header */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenLogModal={() => handleOpenLogModal()}
          onOpenLiveTracker={() => setIsLiveTrackerOpen(true)}
          onOpenGoalsModal={() => setIsGoalsModalOpen(true)}
          onOpenExportModal={() => setIsExportModalOpen(true)}
          goals={goals}
          currentUser={currentUser}
          isPhoneFrameMode={isPhoneFrameMode}
          setIsPhoneFrameMode={setIsPhoneFrameMode}
        />

        {/* Scrollable Mobile Main View Content */}
        <main className="px-3 sm:px-4 pt-4 pb-28 min-h-[750px] overflow-y-auto">
          
          {/* TAB 1: Main Dashboard Overview */}
          {activeTab === 'dashboard' && (
            <DashboardView
              logs={logs}
              stats={stats}
              goals={goals}
              currentUser={currentUser}
              onOpenLogModal={handleOpenLogModal}
              onDeleteLog={handleDeleteLog}
              onNavigateToAdvice={() => setActiveTab('ai-advisor')}
              onNavigateToSignUp={() => setActiveTab('signup')}
              onLoadSampleData={handleLoadSampleData}
            />
          )}

          {/* TAB 2: Sign Up & Profile Page */}
          {activeTab === 'signup' && (
            <SignUpView
              currentUser={currentUser}
              goals={goals}
              onSignUpComplete={handleSignUpComplete}
              onSignOut={handleSignOut}
              onNavigateToDashboard={() => setActiveTab('dashboard')}
            />
          )}

          {/* TAB 3: Full Sleep Logs Table */}
          {activeTab === 'logs' && (
            <div className="space-y-4 pb-12">
              <div className="flex flex-col space-y-2 p-4 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
                <div>
                  <h1 className="text-xl font-extrabold text-white flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-indigo-400" />
                    <span>Uyku Günlüğü</span>
                  </h1>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Tüm geçmiş uyku oturumlarınızı inceleyin ve düzenleyin
                  </p>
                </div>

                <button
                  onClick={() => handleOpenLogModal()}
                  className="w-full py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 flex items-center justify-center space-x-1.5 transition-all active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Yeni Uyku Girişi Ekle</span>
                </button>
              </div>

              {logs.length === 0 ? (
                <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl text-center space-y-3">
                  <p className="text-slate-400 text-xs">Verileriniz bekleniyor</p>
                  <button
                    onClick={() => handleOpenLogModal()}
                    className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
                  >
                    İlk Girişinizi Yapın
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {logs.slice().reverse().map((log) => (
                    <div
                      key={log.id}
                      className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-2 relative"
                    >
                      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                        <span className="text-xs font-bold text-white">{log.date}</span>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleOpenLogModal(log)}
                            className="p-1.5 text-slate-400 hover:text-indigo-300 rounded-lg hover:bg-slate-800"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteLog(log.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center py-1">
                        <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">Program</span>
                          <span className="text-xs font-semibold text-slate-200">{log.bedtime} - {log.wakeTime}</span>
                        </div>

                        <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">Süre</span>
                          <span className="text-xs font-bold text-indigo-300">{(log.durationMinutes / 60).toFixed(1)} sa</span>
                        </div>

                        <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">Kalite</span>
                          <span className="text-xs font-bold text-amber-400">⭐ {log.quality}/5</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                        <span>Mod: <strong className="text-slate-200">{moodTranslations[log.mood] || log.mood}</strong></span>
                        <span>Dalma: <strong className="text-slate-200">{log.latencyMinutes} dk</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Data Analytics & Visualizations */}
          {activeTab === 'analytics' && (
            <AnalyticsView logs={logs} stats={stats} goals={goals} />
          )}

          {/* TAB 5: AI Health Advice & AI Coach */}
          {activeTab === 'ai-advisor' && (
            <AIAdviceView logs={logs} stats={stats} goals={goals} />
          )}

          {/* TAB 6: Sleep Tools */}
          {activeTab === 'tools' && <SleepToolsView goals={goals} />}

        </main>

        {/* Mobile Sticky Bottom Navigation Bar */}
        <MobileBottomNav
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenLogModal={() => handleOpenLogModal()}
          currentUser={currentUser}
        />

        {/* Mobile Bottom Home Bar Indicator */}
        <div className="w-32 h-1 bg-slate-700/60 rounded-full mx-auto mb-2 pointer-events-none" />

      </div>

      {/* Modals */}
      <SleepLogModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        onSave={handleSaveLog}
        editingLog={editingLog}
        initialTimes={initialTimes || undefined}
      />

      <LiveSleepTrackerModal
        isOpen={isLiveTrackerOpen}
        onClose={() => setIsLiveTrackerOpen(false)}
        onFinishSleep={handleFinishLiveSleep}
      />

      <GoalsModal
        isOpen={isGoalsModalOpen}
        onClose={() => setIsGoalsModalOpen(false)}
        goals={goals}
        onSave={setGoals}
      />

      <AppStoreExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        logs={logs}
        goals={goals}
        onImportLogs={(importedLogs) => setLogs(importedLogs)}
      />

    </div>
  );
}

