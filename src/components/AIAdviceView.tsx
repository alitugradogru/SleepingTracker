import React, { useState } from 'react';
import { SleepLog, SleepGoal, SleepStats, AIAdvice, ChatMessage } from '../types';
import { Sparkles, Send, Bot, User, CheckCircle2, AlertCircle, Clock, ShieldAlert, RefreshCw, Coffee, Moon, Sun, HeartPulse } from 'lucide-react';

interface AIAdviceViewProps {
  logs: SleepLog[];
  stats: SleepStats;
  goals: SleepGoal;
}

export const AIAdviceView: React.FC<AIAdviceViewProps> = ({ logs, stats, goals }) => {
  const [adviceData, setAdviceData] = useState<AIAdvice | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      role: 'model',
      text: "Merhaba! Ben Somna, kişisel Yapay Zeka Uyku Uzmanınız ve Sağlık Danışmanınız. Uyku günlüklerinizi analiz edebilir, sirkadiyen ritimlerinizi açıklayabilir veya uyku kalitenizle ilgili tüm sağlık sorularınızı yanıtlayabilirim. Bugün ne öğrenmek istersiniz?",
      timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputQuery, setInputQuery] = useState<string>('');
  const [isSendingChat, setIsSendingChat] = useState<boolean>(false);

  const handleGenerateAdvice = async () => {
    setIsGenerating(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/sleep-advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          logs,
          stats: {
            avgDuration: stats.avgDurationHours,
            avgQuality: stats.avgQuality,
            sleepDebt: stats.sleepDebtHours,
            consistencyScore: stats.consistencyScore,
            frequentMoods: stats.frequentMoods,
            topFactors: [...stats.topPositiveFactors, ...stats.topNegativeFactors],
          },
          userGoals: goals,
        }),
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || 'Yapay zeka tavsiyesi oluşturulamadı.');
      }

      setAdviceData(data.advice);
    } catch (err: any) {
      console.error('Error generating AI advice:', err);
      setErrorMsg(err.message || 'Yapay zeka danışmanına bağlanılamadı.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendChat = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || isSendingChat) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInputQuery('');
    setIsSendingChat(true);

    try {
      const history = chatMessages.map((m) => ({ role: m.role, text: m.text }));
      const response = await fetch('/api/chat-advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          history,
          statsContext: {
            avgDuration: stats.avgDurationHours,
            avgQuality: stats.avgQuality,
            targetHours: goals.targetHours,
            sleepDebt: stats.sleepDebtHours,
          },
        }),
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || 'Sohbet yanıtı alınamadı.');
      }

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'model',
        text: data.reply,
        timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      };

      setChatMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorBotMsg: ChatMessage = {
        id: `bot-err-${Date.now()}`,
        role: 'model',
        text: 'Üzgünüm, isteğinizi işlerken bir sorunla karşılaştım. Lütfen tekrar deneyin.',
        timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages((prev) => [...prev, errorBotMsg]);
    } finally {
      setIsSendingChat(false);
    }
  };

  const promptSuggestions = [
    'Neden her gece saat 03:00\'te uyanıyorum?',
    '6 saatlik birikmiş uyku borcunu nasıl telafi edebilirim?',
    'Saat 14:00\'ten sonra kafein tüketmek REM uykusunu bozar mı?',
    'Geç hafta sonu gecelerinden sonra sirkadiyen ritmimi nasıl sıfırlarım?',
  ];

  return (
    <div className="space-y-8 pb-12">
      
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-950/40 via-indigo-950 to-slate-900 border border-amber-500/30 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30">
            Gemini Destekli Yapay Zeka Sağlık Danışmanı
          </span>
          <h1 className="text-2xl font-extrabold text-white mt-2">Kişiselleştirilmiş Uyku Analizi & Sağlık Tavsiyesi</h1>
          <p className="text-xs text-slate-300 max-w-xl mt-1">
            Biyolojik tavsiyeler ve ideal yatış zamanlaması almak için uyku saatlerinizi, alışkanlık ilişkilerinizi ve uyku borcunuzu analiz edin.
          </p>
        </div>

        <button
          onClick={handleGenerateAdvice}
          disabled={isGenerating}
          className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2 transition-all whitespace-nowrap"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
              <span>Uyku Verileri Analiz Ediliyor...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>{adviceData ? 'Analizi Yenile' : 'Yapay Zeka Uyku Raporu Oluştur'}</span>
            </>
          )}
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* AI Advice Output Display */}
      {adviceData && (
        <div className="space-y-6">
          
          {/* Section 1: Overview & Score */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800 mb-4">
              <div className="flex items-center space-x-2">
                <HeartPulse className="w-5 h-5 text-indigo-400" />
                <h2 className="text-lg font-bold text-white">Sirkadiyen & Sağlık Değerlendirmesi</h2>
              </div>
              <span className={`px-3 py-1 rounded-xl text-xs font-bold border ${
                adviceData.sleepScoreRating === 'Mükemmel' || adviceData.sleepScoreRating === 'Excellent'
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                  : adviceData.sleepScoreRating === 'İyi' || adviceData.sleepScoreRating === 'Good'
                  ? 'bg-blue-500/20 border-blue-500/40 text-blue-300'
                  : 'bg-amber-500/20 border-amber-500/40 text-amber-300'
              }`}>
                Puan Değerlendirmesi: {adviceData.sleepScoreRating}
              </span>
            </div>

            <p className="text-sm text-slate-200 leading-relaxed mb-4">
              {adviceData.overallAssessment}
            </p>

            {/* Key Observations */}
            <div className="space-y-2 mt-4 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Önemli Biyolojik Gözlemler
              </h3>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {adviceData.keyObservations?.map((obs, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <span className="text-indigo-400 mt-0.5">•</span>
                    <span>{obs}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Section 2: Optimal Schedule Card */}
          {adviceData.optimalSchedule && (
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
              <h2 className="text-base font-bold text-white mb-4 flex items-center space-x-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Kişiselleştirilmiş Günlük Uyku & Sağlık Programınız</span>
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl bg-indigo-950/50 border border-indigo-800/40">
                  <span className="text-[10px] font-semibold text-indigo-300 uppercase block mb-1 flex items-center space-x-1">
                    <Moon className="w-3 h-3 text-indigo-400" />
                    <span>Hedef Yatış Saati</span>
                  </span>
                  <span className="text-xl font-extrabold text-white">{adviceData.optimalSchedule.recommendedBedtime}</span>
                </div>

                <div className="p-4 rounded-2xl bg-amber-950/50 border border-amber-800/40">
                  <span className="text-[10px] font-semibold text-amber-300 uppercase block mb-1 flex items-center space-x-1">
                    <Sun className="w-3 h-3 text-amber-400" />
                    <span>Hedef Uyanış Saati</span>
                  </span>
                  <span className="text-xl font-extrabold text-white">{adviceData.optimalSchedule.recommendedWakeTime}</span>
                </div>

                <div className="p-4 rounded-2xl bg-purple-950/50 border border-purple-800/40">
                  <span className="text-[10px] font-semibold text-purple-300 uppercase block mb-1 flex items-center space-x-1">
                    <Coffee className="w-3 h-3 text-purple-400" />
                    <span>Kafein Kesilme Saati</span>
                  </span>
                  <span className="text-xl font-extrabold text-white">{adviceData.optimalSchedule.caffeineCutoffTime}</span>
                </div>

                <div className="p-4 rounded-2xl bg-cyan-950/50 border border-cyan-800/40">
                  <span className="text-[10px] font-semibold text-cyan-300 uppercase block mb-1 flex items-center space-x-1">
                    <Sparkles className="w-3 h-3 text-cyan-400" />
                    <span>Gece Rahatlama Başlangıcı</span>
                  </span>
                  <span className="text-xl font-extrabold text-white">{adviceData.optimalSchedule.windDownStartTime}</span>
                </div>
              </div>
            </div>
          )}

          {/* Section 3: Actionable Advice Items */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Uygulanabilir Sağlık & Hijyen Tavsiyeleri</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {adviceData.actionableAdvice?.map((item, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-indigo-400">{item.category}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase ${
                      item.impact === 'Yüksek' || item.impact === 'High' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {item.impact} Etki
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white">{item.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Health Disclaimer */}
          {adviceData.healthAlert && (
            <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-800/40 text-amber-200 text-xs flex items-start space-x-2">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>{adviceData.healthAlert}</span>
            </div>
          )}

        </div>
      )}

      {/* Interactive AI Sleep Coach Chat */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
          <div className="p-2.5 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Somna AI Uyku Koçuna Sorun</h2>
            <p className="text-xs text-slate-400">Sağlık, uyku borcu veya uykusuzlukla ilgili sorularınızı sorun</p>
          </div>
        </div>

        {/* Prompt Suggestions */}
        <div className="flex flex-wrap gap-2">
          {promptSuggestions.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendChat(prompt)}
              className="text-xs px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/50 text-slate-300 hover:text-white transition-all text-left"
            >
              💡 {prompt}
            </button>
          ))}
        </div>

        {/* Chat Messages Box */}
        <div className="h-72 overflow-y-auto space-y-3 p-4 rounded-2xl bg-slate-950 border border-slate-800/80">
          {chatMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start space-x-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'model' && (
                <div className="w-7 h-7 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-none'
                    : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none'
                }`}
              >
                {msg.text}
                <div className="text-[9px] opacity-60 text-right mt-1">{msg.timestamp}</div>
              </div>

              {msg.role === 'user' && (
                <div className="w-7 h-7 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300 shrink-0">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isSendingChat && (
            <div className="flex items-center space-x-2 text-xs text-indigo-400 animate-pulse">
              <Bot className="w-4 h-4" />
              <span>Somna yanıt hazırlıyor...</span>
            </div>
          )}
        </div>

        {/* Chat Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendChat();
          }}
          className="flex items-center space-x-2"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Uyku saatleriniz veya sağlığınız hakkında bir soru sorun..."
            className="flex-1 px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={!inputQuery.trim() || isSendingChat}
            className="p-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white shadow-md transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>

    </div>
  );
};
