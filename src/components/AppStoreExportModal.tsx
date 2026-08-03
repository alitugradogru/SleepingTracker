import React, { useState } from 'react';
import { SleepLog, SleepGoal } from '../types';
import { Download, Upload, Bell, Smartphone, ShieldCheck, CheckCircle2, AlertCircle, Copy, Check, FileJson, FileSpreadsheet, X, Sparkles } from 'lucide-react';

interface AppStoreExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: SleepLog[];
  goals: SleepGoal;
  onImportLogs: (importedLogs: SleepLog[]) => void;
}

export const AppStoreExportModal: React.FC<AppStoreExportModalProps> = ({
  isOpen,
  onClose,
  logs,
  goals,
  onImportLogs,
}) => {
  const [activeTab, setActiveTab] = useState<'export' | 'notifications' | 'appstore'>('export');
  const [copiedCmd, setCopiedCmd] = useState<boolean>(false);
  
  // Notification simulator state
  const [bedtimeNotify, setBedtimeNotify] = useState<boolean>(true);
  const [bedtimeTime, setBedtimeTime] = useState<string>('22:00');
  const [morningNotify, setMorningNotify] = useState<boolean>(true);
  const [morningTime, setMorningTime] = useState<string>('07:30');
  const [caffeineNotify, setCaffeineNotify] = useState<boolean>(true);
  const [testNotifyStatus, setTestNotifyStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  // Export JSON
  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `somna-sleep-logs-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Export CSV
  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Tarih,YatisSaati,UyanisSaati,SureDakika,SureSaat,Kalite1to5,UyandigindaMod,UyanmaSayisi,DalmaDakika,Notlar\n";

    logs.forEach((log) => {
      const row = [
        log.date,
        log.bedtime,
        log.wakeTime,
        log.durationMinutes,
        (log.durationMinutes / 60).toFixed(2),
        log.quality,
        log.mood,
        log.awakenings,
        log.latencyMinutes,
        `"${(log.notes || '').replace(/"/g, '""')}"`
      ].join(",");
      csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `somna-sleep-logs-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // Import JSON File
  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (Array.isArray(parsed)) {
            onImportLogs(parsed);
            alert(`Başarıyla ${parsed.length} adet uyku verisi aktarıldı!`);
          } else {
            alert('Geçersiz JSON formatı.');
          }
        } catch (err) {
          alert('Dosya okunurken bir hata oluştu.');
        }
      };
    }
  };

  // Test Notification Trigger
  const handleTriggerTestNotification = async () => {
    setTestNotifyStatus('Gönderiliyor...');
    
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification('Somna Mobil Uyku Hatırlatıcısı', {
          body: '🌙 Yatış saatiniz yaklaşıyor. Ekran kullanımını azaltıp rahatlama moduna geçebilirsiniz.',
          icon: '/public/pwa-192x192.png'
        });
        setTestNotifyStatus('✅ Test bildirimi gönderildi!');
      } else if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          new Notification('Somna Mobil Uyku Hatırlatıcısı', {
            body: '🌙 Somna bildirimleri başarıyla aktifleştirildi!',
          });
          setTestNotifyStatus('✅ Bildirim izni alındı ve test gönderildi!');
        } else {
          setTestNotifyStatus('⚠️ Tarayıcı bildirim izni reddedildi. Uygulama içi test kullanılıyor.');
        }
      } else {
        setTestNotifyStatus('⚠️ Tarayıcı bildirim izni engellenmiş.');
      }
    } else {
      setTestNotifyStatus('✅ Uygulama içi test uyarısı aktif.');
    }
  };

  const capacitorCmd = `npm install @capacitor/core @capacitor/cli
npx cap init Somna com.somna.sleep
npm run build
npx cap add ios
npx cap add android
npx cap open ios`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(capacitorCmd);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-6">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2.5 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">Mobil Dışa Aktarma & Ayarlar</h2>
              <p className="text-xs text-slate-400">Veri yedekleme, bildirim ayarları ve App Store paketleme</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 p-1.5">
          <button
            onClick={() => setActiveTab('export')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center space-x-1.5 ${
              activeTab === 'export'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Veri Yedekle</span>
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center space-x-1.5 ${
              activeTab === 'notifications'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Bildirimler</span>
          </button>

          <button
            onClick={() => setActiveTab('appstore')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center space-x-1.5 ${
              activeTab === 'appstore'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>App Store Rehberi</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          
          {/* TAB 1: Data Export & Import */}
          {activeTab === 'export' && (
            <div className="space-y-6">
              
              <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-800/40 text-xs text-indigo-200 flex items-start space-x-2.5">
                <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <span>
                  Tüm kayıtlı uyku günlükleriniz cihazınızda güvenle saklanır. Verilerinizi kaybetmemek için JSON yedeklemesi alabilir veya Excel/Apple Health için CSV olarak indirebilirsiniz.
                </span>
              </div>

              {/* Export Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleExportJSON}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-indigo-500/50 flex items-center space-x-3 transition-all text-left"
                >
                  <div className="p-2.5 rounded-xl bg-indigo-600/20 text-indigo-400">
                    <FileJson className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white">JSON Yedek Dosyası İndir</h3>
                    <p className="text-[10px] text-slate-400">Uygulamaya geri yükleme için tam format</p>
                  </div>
                </button>

                <button
                  onClick={handleExportCSV}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 flex items-center space-x-3 transition-all text-left"
                >
                  <div className="p-2.5 rounded-xl bg-emerald-600/20 text-emerald-400">
                    <FileSpreadsheet className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white">Excel / CSV İndir</h3>
                    <p className="text-[10px] text-slate-400">Grafik ve tablo analizi için e-tablo</p>
                  </div>
                </button>
              </div>

              {/* Restore Import Section */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <h3 className="text-xs font-bold text-white flex items-center space-x-2">
                  <Upload className="w-4 h-4 text-amber-400" />
                  <span>Yedeklenmiş Uyku Verilerini Yükle</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Daha önce indirdiğiniz `.json` yedek dosyasını seçerek geçmiş uyku kayıtlarınızı uygulamaya aktarabilirsiniz.
                </p>

                <label className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs cursor-pointer transition-colors border border-slate-700">
                  <Upload className="w-4 h-4 text-indigo-400" />
                  <span>JSON Yükle</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileImport}
                    className="hidden"
                  />
                </label>
              </div>

            </div>
          )}

          {/* TAB 2: Push Notifications & Reminders */}
          {activeTab === 'notifications' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-300">
                Somna, biyolojik uykunuzu korumak için ideal yatış zamanınız yaklaştığında size anlık hatırlatmalar gönderir.
              </p>

              <div className="space-y-3">
                
                {/* Reminder 1: Bedtime Wind-down */}
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-white block">🌙 Yatış Öncesi Rahatlama Bildirimi</span>
                    <span className="text-[10px] text-slate-400 block">Yatış saatinizden 30 dakika önce bildirim gönderilir</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="time"
                      value={bedtimeTime}
                      onChange={(e) => setBedtimeTime(e.target.value)}
                      className="px-2 py-1 bg-slate-900 border border-slate-800 rounded text-xs text-white"
                    />
                    <input
                      type="checkbox"
                      checked={bedtimeNotify}
                      onChange={(e) => setBedtimeNotify(e.target.checked)}
                      className="w-4 h-4 rounded bg-slate-900 border-slate-800 text-indigo-600"
                    />
                  </div>
                </div>

                {/* Reminder 2: Morning Sleep Log */}
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-white block">☀️ Sabah Uyku Kaydı Bildirimi</span>
                    <span className="text-[10px] text-slate-400 block">Uyanış saatinizde uyku kalitesini kaydetmeniz istenır</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="time"
                      value={morningTime}
                      onChange={(e) => setMorningTime(e.target.value)}
                      className="px-2 py-1 bg-slate-900 border border-slate-800 rounded text-xs text-white"
                    />
                    <input
                      type="checkbox"
                      checked={morningNotify}
                      onChange={(e) => setMorningNotify(e.target.checked)}
                      className="w-4 h-4 rounded bg-slate-900 border-slate-800 text-indigo-600"
                    />
                  </div>
                </div>

                {/* Reminder 3: Caffeine Cutoff */}
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-white block">☕ Kafein Kesilme Uyarısı</span>
                    <span className="text-[10px] text-slate-400 block">Derin uykuyu korumak için son kafein uyarısı</span>
                  </div>

                  <input
                    type="checkbox"
                    checked={caffeineNotify}
                    onChange={(e) => setCaffeineNotify(e.target.checked)}
                    className="w-4 h-4 rounded bg-slate-900 border-slate-800 text-indigo-600"
                  />
                </div>

              </div>

              {/* Test Notification Button */}
              <div className="pt-2">
                <button
                  onClick={handleTriggerTestNotification}
                  className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center justify-center space-x-2 transition-all active:scale-95"
                >
                  <Bell className="w-4 h-4" />
                  <span>Test Bildirimi Gönder</span>
                </button>

                {testNotifyStatus && (
                  <p className="text-[11px] text-indigo-300 text-center mt-2 font-medium">
                    {testNotifyStatus}
                  </p>
                )}
              </div>

            </div>
          )}

          {/* TAB 3: App Store Packaging Guide */}
          {activeTab === 'appstore' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <h3 className="text-xs font-bold text-white flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>iOS App Store & Google Play Paketleme Rehberi</span>
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Bu Somna React kod tabanını doğrudan bir yerel mobil uygulamaya (iOS Xcode veya Android Studio projesine) dönüştürmek için <strong>Capacitor</strong> kullanılabilir:
                </p>

                {/* Code Block */}
                <div className="relative p-3 rounded-xl bg-slate-900 font-mono text-[11px] text-indigo-300 border border-slate-800 overflow-x-auto">
                  <button
                    onClick={copyToClipboard}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                    title="Komutu kopyala"
                  >
                    {copiedCmd ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <pre>{capacitorCmd}</pre>
                </div>

                <div className="space-y-1.5 text-xs text-slate-400 pt-1">
                  <p>1. Terminalde yukarıdaki komutları çalıştırın.</p>
                  <p>2. Xcode veya Android Studio projeniz otomatik açılacaktır.</p>
                  <p>3. App Store Connect hesabınıza giriş yapıp build alarak mağazaya gönderebilirsiniz.</p>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
