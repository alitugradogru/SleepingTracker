import React, { useState } from 'react';
import { UserProfile, SleepGoal, SleepQualityRating, WakingMood, LifestyleFactor, SleepLog } from '../types';
import { User, Mail, Target, Sparkles, CheckCircle2, Moon } from 'lucide-react';
import { FACTOR_LABELS } from '../data/sampleData';

interface SignUpViewProps {
  currentUser: UserProfile | null;
  goals: SleepGoal;
  onSignUpComplete: (profile: UserProfile, updatedGoals: SleepGoal, initialLog?: Omit<SleepLog, 'id'>) => void;
  onSignOut: () => void;
  onNavigateToDashboard: () => void;
}

export const SignUpView: React.FC<SignUpViewProps> = ({
  currentUser,
  goals,
  onSignUpComplete,
  onSignOut,
  onNavigateToDashboard,
}) => {
  // Profile Form State
  const [name, setName] = useState<string>(currentUser?.name || '');
  const [email, setEmail] = useState<string>(currentUser?.email || '');
  
  // Goals State
  const [targetHours, setTargetHours] = useState<number>(goals.targetHours || 8);
  const [targetBedtime, setTargetBedtime] = useState<string>(goals.targetBedtime || '22:30');
  const [targetWakeTime, setTargetWakeTime] = useState<string>(goals.targetWakeTime || '06:30');

  // Option to add initial sleep log
  const [includeFirstLog, setIncludeFirstLog] = useState<boolean>(false);
  const [logDate, setLogDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [logBedtime, setLogBedtime] = useState<string>('23:00');
  const [logWakeTime, setLogWakeTime] = useState<string>('07:00');
  const [logQuality, setLogQuality] = useState<SleepQualityRating>(4);
  const [logMood, setLogMood] = useState<WakingMood>('Refreshed');
  const [logFactors, setLogFactors] = useState<LifestyleFactor[]>(['cool_room']);
  const [logNotes, setLogNotes] = useState<string>('');

  const [submittedSuccess, setSubmittedSuccess] = useState<boolean>(false);

  const toggleFactor = (f: LifestyleFactor) => {
    setLogFactors((prev) =>
      prev.includes(f) ? prev.filter((item) => item !== f) : [...prev, f]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    const profile: UserProfile = {
      name: name.trim(),
      email: email.trim(),
      signedUpAt: currentUser?.signedUpAt || new Date().toISOString(),
    };

    const updatedGoals: SleepGoal = {
      targetHours,
      targetBedtime,
      targetWakeTime,
    };

    let initialLog: Omit<SleepLog, 'id'> | undefined = undefined;

    if (includeFirstLog) {
      const [bHour, bMin] = logBedtime.split(':').map(Number);
      const [wHour, wMin] = logWakeTime.split(':').map(Number);
      let bDate = new Date(`2000-01-01T${logBedtime}:00`);
      let wDate = new Date(`2000-01-01T${logWakeTime}:00`);
      if (wDate <= bDate) {
        wDate.setDate(wDate.getDate() + 1);
      }
      const durMins = Math.max(0, Math.round((wDate.getTime() - bDate.getTime()) / (1000 * 60)));

      initialLog = {
        date: logDate,
        bedtime: logBedtime,
        wakeTime: logWakeTime,
        durationMinutes: durMins,
        quality: logQuality,
        awakenings: 0,
        latencyMinutes: 15,
        mood: logMood,
        factors: logFactors,
        notes: logNotes.trim(),
      };
    }

    onSignUpComplete(profile, updatedGoals, initialLog);
    setSubmittedSuccess(true);
  };

  const moodTranslations: Record<string, string> = {
    Refreshed: 'Dinlenmiş',
    Energetic: 'Enerjik',
    Calm: 'Sakin',
    Groggy: 'Sersem',
    Tired: 'Yorgun',
    Anxious: 'Endişeli',
    Headache: 'Baş Ağrılı',
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 border border-indigo-800/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30">
            {currentUser ? 'Kullanıcı Hesabı & Profil' : 'Kayıt Ol & Hesap Kurulumu'}
          </span>
          <h1 className="text-2xl font-extrabold text-white mt-2">
            {currentUser ? `Tekrar hoş geldiniz, ${currentUser.name}` : 'Uyku Takibine Başlamak İçin Kaydolun'}
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Profilinizi oluşturun, günlük sirkadiyen hedeflerinizi belirleyin ve ilk uyku verilerinizi girin.
          </p>
        </div>

        {currentUser && (
          <button
            onClick={onSignOut}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-300 text-xs font-medium border border-slate-700 transition-colors shrink-0"
          >
            Çıkış Yap
          </button>
        )}
      </div>

      {submittedSuccess ? (
        <div className="p-8 rounded-3xl bg-slate-900 border border-emerald-500/40 text-center space-y-4 shadow-xl">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white">Kayıt İşlemi Tamamlandı!</h2>
          <p className="text-xs text-slate-300 max-w-md mx-auto">
            Hesap profiliniz ve uyku hedefleriniz başarıyla kaydedildi. Verileriniz ana kontrol panelinde analiz edilmeye hazır.
          </p>
          <div className="pt-2">
            <button
              onClick={onNavigateToDashboard}
              className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all"
            >
              Ana Kontrol Paneline Git
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Section 1: User Account Credentials */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <h2 className="text-base font-bold text-white flex items-center space-x-2 border-b border-slate-800 pb-3">
              <User className="w-4 h-4 text-indigo-400" />
              <span>Kişisel Profil Bilgileri</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center space-x-1">
                  <User className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Ad Soyad *</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="ör. Ali Yılmaz"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center space-x-1">
                  <Mail className="w-3.5 h-3.5 text-indigo-400" />
                  <span>E-posta Adresi *</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="ali@ornek.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Sleep Goals & Circadian Schedule */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <h2 className="text-base font-bold text-white flex items-center space-x-2 border-b border-slate-800 pb-3">
              <Target className="w-4 h-4 text-indigo-400" />
              <span>Günlük Uyku Hedefleriniz</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Hedef Uyku Süresi (Saat)
                </label>
                <input
                  type="number"
                  min="4"
                  max="12"
                  step="0.5"
                  value={targetHours}
                  onChange={(e) => setTargetHours(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Hedef Yatış Saati
                </label>
                <input
                  type="time"
                  value={targetBedtime}
                  onChange={(e) => setTargetBedtime(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Hedef Uyanış Saati
                </label>
                <input
                  type="time"
                  value={targetWakeTime}
                  onChange={(e) => setTargetWakeTime(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Optional Initial Sleep Log Entry */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Moon className="w-4 h-4 text-indigo-400" />
                <h2 className="text-base font-bold text-white">İlk Uyku Verinizi Girin (İsteğe Bağlı)</h2>
              </div>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeFirstLog}
                  onChange={(e) => setIncludeFirstLog(e.target.checked)}
                  className="w-4 h-4 rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-xs text-indigo-300 font-semibold">Şimdi veri gir</span>
              </label>
            </div>

            {includeFirstLog && (
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Tarih</label>
                    <input
                      type="date"
                      value={logDate}
                      onChange={(e) => setLogDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Yatış Saati</label>
                    <input
                      type="time"
                      value={logBedtime}
                      onChange={(e) => setLogBedtime(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Uyanış Saati</label>
                    <input
                      type="time"
                      value={logWakeTime}
                      onChange={(e) => setLogWakeTime(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Uyku Kalitesi Puanı (1-5)</label>
                    <div className="flex items-center space-x-2">
                      {[1, 2, 3, 4, 5].map((q) => (
                        <button
                          key={q}
                          type="button"
                          onClick={() => setLogQuality(q as SleepQualityRating)}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-bold border ${
                            logQuality === q
                              ? 'bg-amber-500 text-slate-950 border-amber-400'
                              : 'bg-slate-950 border-slate-800 text-slate-400'
                          }`}
                        >
                          {q}★
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Uyanış Hali / Modu</label>
                    <select
                      value={logMood}
                      onChange={(e) => setLogMood(e.target.value as WakingMood)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                    >
                      {['Refreshed', 'Energetic', 'Calm', 'Groggy', 'Tired', 'Anxious', 'Headache'].map((m) => (
                        <option key={m} value={m}>
                          {moodTranslations[m] || m}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Akşam Yaşam Tarzı Etkenleri</label>
                  <div className="flex flex-wrap gap-1.5">
                    {(Object.keys(FACTOR_LABELS) as LifestyleFactor[]).map((factorKey) => {
                      const isSelected = logFactors.includes(factorKey);
                      const fInfo = FACTOR_LABELS[factorKey];
                      return (
                        <button
                          key={factorKey}
                          type="button"
                          onClick={() => toggleFactor(factorKey)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                            isSelected
                              ? 'bg-indigo-600 border-indigo-500 text-white'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          <span>{fInfo.icon}</span> <span>{fInfo.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">Uyku Notları (İsteğe Bağlı)</label>
                  <input
                    type="text"
                    placeholder="ör. Uyumadan önce 20 dakika kitap okundu..."
                    value={logNotes}
                    onChange={(e) => setLogNotes(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="submit"
              className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 flex items-center space-x-2 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>{currentUser ? 'Profil Değişikliklerini Kaydet' : 'Kayıt İşlemini Tamamla'}</span>
            </button>
          </div>

        </form>
      )}

    </div>
  );
};
