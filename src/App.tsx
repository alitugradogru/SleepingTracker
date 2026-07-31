import React, { useState, useEffect } from 'react';
import { SleepLog, SleepGoal, ViewTab } from './types';
import { generateSampleLogs, DEFAULT_GOALS } from './data/sampleData';
import { computeSleepStats } from './utils/sleepCalculators';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { AnalyticsView } from './components/AnalyticsView';
import { AIAdviceView } from './components/AIAdviceView';
import { SleepToolsView } from './components/SleepToolsView';
import { SleepLogModal } from './components/SleepLogModal';
import { LiveSleepTrackerModal } from './components/LiveSleepTrackerModal';
import { GoalsModal } from './components/GoalsModal';
import confetti from 'canvas-confetti';
import { Moon, Calendar, Plus, Edit2, Trash2, Star, Clock } from 'lucide-react';

const STORAGE_KEY_LOGS = 'somna_sleep_logs_v1';
const STORAGE_KEY_GOALS = 'somna_sleep_goals_v1';

export default function App() {
  const [activeTab, setActiveTab] = useState<ViewTab>('dashboard');
  
  // State
  const [logs, setLogs] = useState<SleepLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LOGS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading saved sleep logs:', e);
    }
    return generateSampleLogs();
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

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_GOALS, JSON.stringify(goals));
  }, [goals]);

  // Compute stats
  const stats = computeSleepStats(logs, goals);

  // CRUD Handlers
  const handleSaveLog = (logData: Omit<SleepLog, 'id'> & { id?: string }) => {
    if (logData.id) {
      // Edit existing
      setLogs((prev) =>
        prev.map((item) => (item.id === logData.id ? { ...logData, id: logData.id } as SleepLog : item))
      );
    } else {
      // Create new
      const newLog: SleepLog = {
        ...logData,
        id: `sleep-log-${Date.now()}`,
      } as SleepLog;

      setLogs((prev) => [...prev, newLog]);

      // Check if target goal hit for celebration confetti
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-indigo-500 selection:text-white">
      
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenLogModal={() => handleOpenLogModal()}
        onOpenLiveTracker={() => setIsLiveTrackerOpen(true)}
        onOpenGoalsModal={() => setIsGoalsModalOpen(true)}
        goals={goals}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* TAB 1: Dashboard Overview */}
        {activeTab === 'dashboard' && (
          <DashboardView
            logs={logs}
            stats={stats}
            goals={goals}
            onOpenLogModal={handleOpenLogModal}
            onDeleteLog={handleDeleteLog}
            onNavigateToAdvice={() => setActiveTab('ai-advisor')}
          />
        )}

        {/* TAB 2: Full Sleep Logs Table */}
        {activeTab === 'logs' && (
          <div className="space-y-6 pb-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
              <div>
                <h1 className="text-2xl font-extrabold text-white flex items-center space-x-2">
                  <Calendar className="w-6 h-6 text-indigo-400" />
                  <span>Sleep History Log Book</span>
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                  Manage and edit all recorded sleeping hours and evening lifestyle logs
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleOpenLogModal()}
                  className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-medium shadow-md shadow-indigo-600/30 flex items-center space-x-1.5 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Sleep Entry</span>
                </button>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3.5 rounded-l-xl">Date</th>
                    <th className="p-3.5">Schedule</th>
                    <th className="p-3.5">Duration</th>
                    <th className="p-3.5">Quality</th>
                    <th className="p-3.5">Latency</th>
                    <th className="p-3.5">Awakenings</th>
                    <th className="p-3.5">Mood</th>
                    <th className="p-3.5">Notes</th>
                    <th className="p-3.5 text-right rounded-r-xl">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {logs.slice().reverse().map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3.5 font-bold text-white whitespace-nowrap">
                        {log.date}
                      </td>
                      <td className="p-3.5 text-slate-400 whitespace-nowrap">
                        {log.bedtime} - {log.wakeTime}
                      </td>
                      <td className="p-3.5 font-bold text-indigo-300 whitespace-nowrap">
                        {(log.durationMinutes / 60).toFixed(1)} hrs
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <span className="flex items-center space-x-1 text-amber-400 font-medium">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          <span>{log.quality} / 5</span>
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-400 whitespace-nowrap">
                        {log.latencyMinutes} mins
                      </td>
                      <td className="p-3.5 text-slate-400 whitespace-nowrap">
                        {log.awakenings} times
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-xl bg-slate-800 border border-slate-700 text-slate-200">
                          {log.mood}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-400 max-w-xs truncate">
                        {log.notes || '—'}
                      </td>
                      <td className="p-3.5 text-right whitespace-nowrap space-x-1">
                        <button
                          onClick={() => handleOpenLogModal(log)}
                          className="p-2 text-slate-400 hover:text-indigo-300 rounded-lg hover:bg-slate-800"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteLog(log.id)}
                          className="p-2 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: Data Analytics & Visualizations */}
        {activeTab === 'analytics' && (
          <AnalyticsView logs={logs} stats={stats} goals={goals} />
        )}

        {/* TAB 4: AI Health Advice & AI Coach */}
        {activeTab === 'ai-advisor' && (
          <AIAdviceView logs={logs} stats={stats} goals={goals} />
        )}

        {/* TAB 5: Sleep Tools */}
        {activeTab === 'tools' && <SleepToolsView goals={goals} />}

      </main>

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

    </div>
  );
}
