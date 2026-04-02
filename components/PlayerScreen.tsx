import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../utils/supabase';
import { Loader2, CheckCircle, XCircle, Trophy } from 'lucide-react';

interface PlayerScreenProps {
  roomId: string;
  playerId: string;
  nickname: string;
  onLeave: () => void;
}

export default function PlayerScreen({ roomId, playerId, nickname, onLeave }: PlayerScreenProps) {
  const [gameState, setGameState] = useState<'waiting' | 'playing' | 'result' | 'leaderboard' | 'finished'>('waiting');
  
  const [questionData, setQuestionData] = useState<any>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(-1);
  const [totalQuestions, setTotalQuestions] = useState<number>(0);
  
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [correctColor, setCorrectColor] = useState<string | null>(null);

  // Timer
  const [timeLeft, setTimeLeft] = useState(0);
  const [questionDuration, setQuestionDuration] = useState(20);
  const [hostStartedAt, setHostStartedAt] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const questionIndexRef = useRef<number>(-1);

  // Leaderboard data
  const [leaderboard, setLeaderboard] = useState<{id: string, nickname: string, score: number}[]>([]);
  const [myRank, setMyRank] = useState(0);
  const [myScore, setMyScore] = useState(0);

  const [questionStartTime, setQuestionStartTime] = useState<number>(0);
  const [channel, setChannel] = useState<any>(null);
  const [answersByColor, setAnswersByColor] = useState<Record<string, number>>({});

  useEffect(() => {
    const gameChannel = supabase.channel(`room:${roomId}`, {
      config: { broadcast: { self: true } }
    });

    gameChannel.on('broadcast', { event: 'game_state' }, (payload) => {
       const state = payload.payload.state;
       setGameState(state);
       
       if (state === 'playing') {
          const incomingIdx = payload.payload.questionIndex;
          if (incomingIdx !== undefined && incomingIdx !== questionIndexRef.current) {
             questionIndexRef.current = incomingIdx;
             setCurrentQuestionIndex(incomingIdx);
             setQuestionData(payload.payload.questionData);
             setSelectedColor(null);
             setCorrectColor(null);
             setQuestionStartTime(Date.now());
             
             const duration = payload.payload.questionTime || 20;
             setQuestionDuration(duration);
          }
          // Store host's start timestamp for local timer calculation
          if (payload.payload.questionStartedAt) {
            setHostStartedAt(payload.payload.questionStartedAt);
          }
          if (payload.payload.totalQuestions) {
            setTotalQuestions(payload.payload.totalQuestions);
          }
       }

       if (state === 'leaderboard' && payload.payload.leaderboard) {
          setLeaderboard(payload.payload.leaderboard);
          const rank = payload.payload.leaderboard.findIndex((p: any) => p.id === playerId);
          setMyRank(rank >= 0 ? rank + 1 : 0);
          const me = payload.payload.leaderboard.find((p: any) => p.id === playerId);
          setMyScore(me?.score || 0);
       }
    });

    gameChannel.on('broadcast', { event: 'question_result' }, (payload) => {
       setGameState('result');
       setCorrectColor(payload.payload.correctColor);
       if (payload.payload.answersByColor) {
         setAnswersByColor(payload.payload.answersByColor);
       }
    });

    gameChannel.on('broadcast', { event: 'player_kicked' }, (payload) => {
       if (payload.payload.playerId === playerId) {
         alert('Öğretmen sizi oyundan çıkardı.');
         onLeave();
       }
    });

    gameChannel.subscribe((status) => {
       if (status === 'SUBSCRIBED') {
          setChannel(gameChannel);
       }
    });

    return () => {
      supabase.removeChannel(gameChannel);
    };
  }, [roomId]);

  // Local timer that calculates from host's start timestamp
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    if (gameState === 'playing' && hostStartedAt > 0 && questionDuration > 0) {
      // Calculate immediately
      const calc = () => {
        const elapsed = Math.floor((Date.now() - hostStartedAt) / 1000);
        return Math.max(0, questionDuration - elapsed);
      };
      setTimeLeft(calc());
      
      timerRef.current = setInterval(() => {
        const remaining = calc();
        setTimeLeft(remaining);
        if (remaining <= 0 && timerRef.current) {
          clearInterval(timerRef.current);
        }
      }, 500); // Check every 500ms for smoother updates
    }

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [gameState, hostStartedAt, questionDuration]);

  const handleAnswerSubmit = (color: string) => {
    if (gameState !== 'playing' || selectedColor) return;
    
    setSelectedColor(color);
    
    const timeTakes = (Date.now() - questionStartTime) / 1000;

    supabase.channel(`room:${roomId}`).send({
      type: 'broadcast',
      event: 'submit_answer',
      payload: { playerId, color, timeTakes }
    }).catch(console.error);
  };

  // ==================== RENDERERS ====================

  // WAITING
  if (gameState === 'waiting') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-700 flex flex-col items-center justify-center p-6 text-center text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 25% 25%, white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        <div className="relative z-10">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-4 border-white/30">
            <Loader2 className="w-10 h-10 text-white animate-spin" />
          </div>
          <h2 className="text-3xl md:text-4xl font-black mb-2 tracking-tight">İçeridesin!</h2>
          <p className="text-base md:text-lg text-white/70 font-semibold mb-8">Öğretmenin oyunu başlatmasını bekle...</p>
          <div className="inline-block bg-white/15 backdrop-blur-sm px-8 py-3 rounded-2xl font-black text-2xl border border-white/20">
            {nickname}
          </div>
        </div>
      </div>
    );
  }

  // LEADERBOARD
  if (gameState === 'leaderboard') {
    const medals = ['🥇', '🥈', '🥉'];
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 flex flex-col items-center p-4 md:p-6 text-white overflow-y-auto">
        <div className="w-full max-w-md">
          <div className="text-center mt-4 mb-6">
            <Trophy className="w-14 h-14 mx-auto text-amber-400 mb-2 drop-shadow-[0_0_20px_rgba(251,191,36,0.5)]" />
            <h2 className="text-2xl font-black tracking-tight">Sıralama</h2>
          </div>
          
          {/* My position card */}
          {myRank > 0 && (
            <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 backdrop-blur rounded-2xl px-5 py-4 mb-5 text-center border border-amber-500/30">
              <p className="text-sm font-bold text-amber-300 uppercase tracking-wider">Senin sıran</p>
              <div className="flex items-center justify-center gap-4 mt-1">
                <span className="text-4xl font-black">{myRank}.</span>
                <div className="h-8 w-px bg-white/20" />
                <span className="text-3xl font-black text-amber-400">{myScore}<span className="text-base text-amber-300/70 ml-1">puan</span></span>
              </div>
            </div>
          )}

          {/* Leaderboard list */}
          <div className="space-y-2">
            {leaderboard.slice(0, 5).map((p, i) => (
              <div key={i} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                p.id === playerId 
                  ? 'bg-gradient-to-r from-amber-500/30 to-orange-500/30 border border-amber-500/40 scale-[1.02]' 
                  : 'bg-white/5 border border-white/5'
              }`}>
                <span className="text-2xl w-10 text-center shrink-0">
                  {i < 3 ? medals[i] : <span className="text-lg font-black text-white/40">{i + 1}</span>}
                </span>
                <span className="flex-1 font-bold text-sm truncate">{p.nickname}</span>
                <span className="font-black text-lg tabular-nums">{p.score}</span>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <div className="inline-flex items-center gap-2 text-sm text-indigo-300 font-medium">
              <Loader2 className="w-4 h-4 animate-spin" /> Sonraki soru geliyor...
            </div>
          </div>
        </div>
      </div>
    );
  }

  // FINISHED
  if (gameState === 'finished') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 via-violet-900 to-slate-900 flex flex-col items-center justify-center p-6 text-center text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="absolute text-4xl animate-bounce" style={{
              left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`, animationDuration: `${2 + Math.random() * 3}s`
            }}>🎉</div>
          ))}
        </div>
        <div className="relative z-10">
          <Trophy className="w-24 h-24 mx-auto text-amber-400 mb-4 drop-shadow-[0_0_30px_rgba(251,191,36,0.6)]" />
          <h2 className="text-3xl md:text-4xl font-black mb-2">OYUN BİTTİ!</h2>
          
          {myRank > 0 && (
            <div className="bg-white/10 backdrop-blur rounded-2xl px-8 py-5 mt-4 mb-8 border border-white/15">
              <p className="text-base font-bold text-amber-300">{myRank}. sırada bitirdin</p>
              <p className="text-4xl font-black mt-1">{myScore} <span className="text-lg text-white/60">puan</span></p>
            </div>
          )}
          
          <button onClick={onLeave} className="bg-white text-purple-900 font-black px-10 py-4 rounded-2xl text-lg shadow-2xl hover:bg-gray-100 active:scale-95 transition-all">
            Ana Menüye Dön
          </button>
        </div>
      </div>
    );
  }

  // RESULT
  if (gameState === 'result') {
    const isWon = selectedColor === correctColor;
    const isTimeout = !selectedColor;
    const totalAnswers = Object.values(answersByColor).reduce((a: number, b: number) => a + b, 0) as number;

    const colorLabels: Record<string, { name: string, bg: string }> = {
      'red': { name: '▲', bg: 'bg-red-500' },
      'blue': { name: '⬡', bg: 'bg-blue-500' },
      'yellow': { name: '●', bg: 'bg-amber-500' },
      'green': { name: '■', bg: 'bg-emerald-500' },
    };

    return (
      <div className={`min-h-screen flex flex-col p-5 text-white transition-colors duration-500 ${
        isTimeout ? 'bg-gradient-to-b from-gray-700 to-gray-900' : isWon ? 'bg-gradient-to-b from-emerald-600 to-emerald-800' : 'bg-gradient-to-b from-red-600 to-red-800'
      }`}>
        {/* Result header */}
        <div className="text-center py-4 shrink-0">
          {isTimeout ? (
            <>
              <XCircle className="w-16 h-16 mx-auto mb-2 opacity-80" />
              <h2 className="text-2xl md:text-3xl font-black">Süre Bitti!</h2>
            </>
          ) : isWon ? (
            <>
              <CheckCircle className="w-16 h-16 mx-auto mb-2" />
              <h2 className="text-2xl md:text-3xl font-black">DOĞRU! 🎉</h2>
            </>
          ) : (
            <>
              <XCircle className="w-16 h-16 mx-auto mb-2 opacity-80" />
              <h2 className="text-2xl md:text-3xl font-black">YANLIŞ!</h2>
            </>
          )}
        </div>

        {/* Answer distribution */}
        {totalAnswers > 0 && (
          <div className="flex-1 flex flex-col justify-center max-w-md w-full mx-auto">
            <p className="text-sm font-bold uppercase tracking-wider text-white/60 mb-3 text-center">Cevap Dağılımı</p>
            <div className="space-y-2">
              {questionData?.options?.map((opt: any) => {
                const count = answersByColor[opt.color] || 0;
                const pct = totalAnswers > 0 ? (count / totalAnswers) * 100 : 0;
                const isCorrectOpt = opt.color === correctColor;
                const cl = colorLabels[opt.color];
                return (
                  <div key={opt.color} className={`rounded-xl overflow-hidden ${isCorrectOpt ? 'ring-2 ring-white' : 'opacity-60'}`}>
                    <div className="flex items-center gap-2 bg-black/30 p-2.5 relative">
                      <div className={`absolute inset-0 ${cl?.bg} opacity-30`} style={{ width: `${pct}%` }} />
                      <span className="relative text-lg font-black w-6 text-center">{cl?.name}</span>
                      <span className="relative flex-1 font-bold text-sm truncate">{opt.text}</span>
                      <span className="relative font-black text-lg">{count}</span>
                      {isCorrectOpt && <span className="relative">✓</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <p className="text-center text-sm text-white/50 mt-4 font-medium">Sıralama tablosu yükleniyor...</p>
      </div>
    );
  }

  // ==================== PLAYING ====================
  if (!questionData) return null;

  const timerPercent = questionDuration > 0 ? (timeLeft / questionDuration) * 100 : 0;
  const timerUrgent = timeLeft <= 5;
  const timerWarning = timeLeft <= 10 && timeLeft > 5;

  const colorMap: Record<string, { bg: string, active: string, border: string }> = {
    'red':    { bg: 'bg-red-500',    active: 'active:bg-red-600',    border: 'border-red-400' },
    'blue':   { bg: 'bg-blue-500',   active: 'active:bg-blue-600',   border: 'border-blue-400' },
    'yellow': { bg: 'bg-amber-500',  active: 'active:bg-amber-600',  border: 'border-amber-400' },
    'green':  { bg: 'bg-emerald-500', active: 'active:bg-emerald-600', border: 'border-emerald-400' },
  };

  const shapeMap: Record<string, string> = {
    'red': '▲', 'blue': '⬡', 'yellow': '●', 'green': '■'
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 relative">
      
      {/* Timer progress bar */}
      <div className="w-full h-1.5 bg-slate-800 shrink-0">
        <div 
          className={`h-full transition-all duration-1000 ease-linear rounded-r-full ${
            timerUrgent ? 'bg-red-500' : timerWarning ? 'bg-amber-400' : 'bg-emerald-400'
          }`} 
          style={{ width: `${timerPercent}%` }} 
        />
      </div>

      {/* Question area */}
      <div className="shrink-0 px-4 pt-4 pb-3">
        {/* Timer badge + counter */}
        <div className="flex items-center justify-between mb-3">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-black text-xl text-white shadow-lg ${
            timerUrgent ? 'bg-red-500 animate-pulse' : timerWarning ? 'bg-amber-500' : 'bg-emerald-500'
          }`}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
            {timeLeft}
          </div>
          {totalQuestions > 0 && (
            <span className="text-sm text-slate-400 font-bold bg-slate-800 px-3 py-1.5 rounded-full">
              {currentQuestionIndex + 1} / {totalQuestions}
            </span>
          )}
        </div>

        {/* Question card */}
        <div className="bg-white rounded-2xl p-5 md:p-6 shadow-xl">
          {questionData.image && (
            <div className="flex justify-center mb-4">
              <img src={questionData.image} alt="" className="max-h-32 md:max-h-44 rounded-xl object-contain" />
            </div>
          )}
          <h2 className="text-lg md:text-xl lg:text-2xl font-black text-gray-900 text-center leading-snug whitespace-pre-line">
            {questionData.question}
          </h2>
        </div>
      </div>

      {/* Answer buttons */}
      <div className="flex-1 px-3 pb-3 grid grid-cols-2 gap-2 md:gap-3 content-start">
        {questionData.options.map((opt: any) => {
          const colors = colorMap[opt.color] || colorMap['red'];
          const shape = shapeMap[opt.color] || '▲';

          return (
            <button 
              key={opt.color}
              onClick={() => handleAnswerSubmit(opt.color)}
              disabled={!!selectedColor || timeLeft === 0}
              className={`
                ${colors.bg} ${colors.active} 
                rounded-2xl shadow-lg flex flex-col items-center justify-center gap-2 
                transition-all active:scale-95 p-3 md:p-5 min-h-[100px] md:min-h-[120px]
                disabled:opacity-40 disabled:cursor-not-allowed
                border-b-4 ${colors.border}
              `}
            >
              <span className="text-white/50 text-2xl md:text-3xl font-black leading-none">{shape}</span>
              <span className="text-white font-bold text-sm md:text-base lg:text-lg drop-shadow-sm text-center leading-tight px-1 line-clamp-3">
                {opt.text}
              </span>
            </button>
          );
        })}
      </div>

      {/* Already answered overlay - shows timer */}
      {selectedColor && (
        <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-md z-50 flex flex-col items-center justify-center text-white p-6 text-center">
          {/* Timer still visible */}
          <div className={`inline-flex items-center gap-2 px-5 py-3 rounded-full font-black text-3xl text-white shadow-lg mb-6 ${
            timerUrgent ? 'bg-red-500 animate-pulse' : timerWarning ? 'bg-amber-500' : 'bg-emerald-500'
          }`}>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
            {timeLeft}
          </div>
          <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center mb-4">
            <Loader2 className="w-7 h-7 animate-spin text-white/60" />
          </div>
          <h2 className="text-xl font-black mb-1">Cevabın Gönderildi ✓</h2>
          <p className="text-sm text-slate-400 font-medium">Sürenin dolmasını bekliyoruz...</p>
        </div>
      )}
    </div>
  );
}
