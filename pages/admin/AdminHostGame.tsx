import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../utils/supabase';
import { Loader2, Users, Play, Trophy, Square, Circle, Triangle, Hexagon, ArrowRight, X } from 'lucide-react';
import { playCorrectSound, playWrongSound } from '../../utils/sound';

interface Player {
  id: string;
  nickname: string;
  score: number;
}

interface QuizOption {
  text: string;
  color: string;
  isCorrect: boolean;
  shape: React.ReactNode;
}

interface QuizQuestion {
  question: string;
  image?: string;
  options: QuizOption[];
}

export default function AdminHostGame() {
  const [roomId, setRoomId] = useState<string | null>(null);
  const [pin, setPin] = useState<string | null>(null);
  const [status, setStatus] = useState<'setup' | 'waiting' | 'playing' | 'result' | 'leaderboard' | 'finished'>('setup');
  const [players, setPlayers] = useState<Player[]>([]);
  
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionTimeSetting, setQuestionTimeSetting] = useState(20);
  
  // Stats for the current question
  const [answersCount, setAnswersCount] = useState(0);
  const [answersByColor, setAnswersByColor] = useState<Record<string, number>>({ red: 0, blue: 0, yellow: 0, green: 0 });
  const [timeLeft, setTimeLeft] = useState(20);
  const [timerActive, setTimerActive] = useState(false);

  // Refs for stale closures safely reading states inside WebSockets
  const statusRef = useRef(status);
  const questionsRef = useRef(questions);
  const currentQuestionIndexRef = useRef(currentQuestionIndex);
  const questionTimeSettingRef = useRef(questionTimeSetting);
  const playersRef = useRef(players);

  useEffect(() => {
     statusRef.current = status;
     questionsRef.current = questions;
     currentQuestionIndexRef.current = currentQuestionIndex;
     questionTimeSettingRef.current = questionTimeSetting;
     playersRef.current = players;
  }, [status, questions, currentQuestionIndex, questionTimeSetting, players]);

  // References for subscriptions
  const [channel, setChannel] = useState<any>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (timerActive && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timerActive && timeLeft === 0) {
      // Time up
      handleShowResult();
    }
    return () => clearTimeout(timer);
  }, [timeLeft, timerActive]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (channel) supabase.removeChannel(channel);
      if (roomId) supabase.from('game_rooms').update({ status: 'finished' }).eq('id', roomId).then();
    };
  }, [channel, roomId]);

  // Fallback Polling for Lobby (If Postgres_Changes is blocked by RLS/Realtime config)
  useEffect(() => {
    let pollInterval: NodeJS.Timeout;
    if (status === 'waiting' && roomId) {
      pollInterval = setInterval(async () => {
        const { data: currentPlayers } = await supabase.from('game_players').select('*').eq('room_id', roomId);
        if (currentPlayers) {
          setPlayers(prev => {
            if (currentPlayers.length > prev.length) {
              return currentPlayers as Player[];
            }
            return prev;
          });
        }
      }, 2000); // Poll every 2 seconds
    }
    return () => clearInterval(pollInterval);
  }, [status, roomId]);

  // --- Heartbeat State Sync ---
  // Host constantly streams the real-time state to ensure NO client ever desyncs.
  useEffect(() => {
    if (!channel || status === 'setup') return;

    const interval = setInterval(() => {
      if (status === 'waiting') {
        channel.send({ type: 'broadcast', event: 'game_state', payload: { state: 'waiting' } });
      } else if (status === 'playing') {
        const safeData = questions[currentQuestionIndex] ? {
           question: questions[currentQuestionIndex].question,
           image: questions[currentQuestionIndex].image,
           options: questions[currentQuestionIndex].options.map((o:any) => ({ text: o.text, color: o.color }))
        } : undefined;
        channel.send({ type: 'broadcast', event: 'game_state', payload: { state: 'playing', questionIndex: currentQuestionIndex, questionData: safeData } });
      } else if (status === 'result') {
        const currentQ = questions[currentQuestionIndex];
        const correctOption = currentQ?.options.find(o => o.isCorrect);
        channel.send({ type: 'broadcast', event: 'question_result', payload: { correctColor: correctOption?.color } });
      } else if (status === 'leaderboard') {
        channel.send({ type: 'broadcast', event: 'game_state', payload: { state: 'leaderboard' } });
      } else if (status === 'finished') {
        channel.send({ type: 'broadcast', event: 'game_state', payload: { state: 'finished' } });
      }
    }, 1500); // 1.5 saniyede bir otoriter durumu fırlat

    return () => clearInterval(interval);
  }, [channel, status, currentQuestionIndex, questions]);

  const generateQuiz = async () => {
    // 1. Fetch 2. Dönem Konu Tekrarı Soruları (term = 2)
    const { data: reviews } = await supabase.from('review_questions')
      .select('*')
      .eq('term', 2);

    // 2. Fetch Verbs (Tablo adı simple_verbs)
    const { data: verbs } = await supabase.from('simple_verbs').select('*');

    const generated: QuizQuestion[] = [];
    const shapes = [
      { color: 'red', icon: <Triangle className="w-8 h-8 md:w-16 md:h-16 text-white drop-shadow-md" fill="white" /> },
      { color: 'blue', icon: <Hexagon className="w-8 h-8 md:w-16 md:h-16 text-white drop-shadow-md" fill="white" /> },
      { color: 'yellow', icon: <Circle className="w-8 h-8 md:w-16 md:h-16 text-white drop-shadow-md" fill="white" /> },
      { color: 'green', icon: <Square className="w-8 h-8 md:w-16 md:h-16 text-white drop-shadow-md" fill="white" /> }
    ];

    // Konu Tekrarı Sorularından max 20 tane alalım
    if (reviews && reviews.length > 0) {
      // vocab ve multi_choice tarzı olanları filtrele
      const filteredReviews = reviews.filter(r => r.type === 'vocab' || r.type === 'multi_choice' || r.type === 'demo');
      const selectedReviews = [...filteredReviews].sort(() => Math.random() - 0.5).slice(0, 20);
      
      selectedReviews.forEach(r => {
        if (r.options && Array.isArray(r.options) && r.options.length > 0) {
          const shuffledChoices = [...r.options].sort(() => Math.random() - 0.5).slice(0, 4);
          while(shuffledChoices.length < 4) {
             shuffledChoices.push({ text: '-', romaji: '-' });
          }

          generated.push({
            question: r.turkish_meaning || r.japanese_question || r.romaji_question || "Soru",
            image: r.image || undefined,
            options: shuffledChoices.map((c: any, idx: number) => {
              // correct_answer metin olarak verildiği için string eşleştirmesi yapıyoruz
              const isCorrect = c.text === r.correct_answer || c.romaji === r.correct_answer;
              return {
                text: `${c.text} ${c.romaji && c.romaji !== c.text ? `(${c.romaji})` : ''}`,
                isCorrect: isCorrect,
                color: shapes[idx].color,
                shape: shapes[idx].icon
              }
            })
          });
        }
      });
    }

    // Verbs'den rastgele 15 soru üretelim (Tablo: simple_verbs)
    if (verbs && verbs.length >= 4) {
       for(let i=0; i < 15; i++) {
          const shuffledVerbs = [...verbs].sort(() => Math.random() - 0.5);
          const target = shuffledVerbs[0];
          const dist1 = shuffledVerbs[1];
          const dist2 = shuffledVerbs[2];
          const dist3 = shuffledVerbs[3];

          const opts = [
             { text: `${target.hiragana} (${target.romaji})`, isCorrect: true },
             { text: `${dist1.hiragana} (${dist1.romaji})`, isCorrect: false },
             { text: `${dist2.hiragana} (${dist2.romaji})`, isCorrect: false },
             { text: `${dist3.hiragana} (${dist3.romaji})`, isCorrect: false },
          ].sort(() => Math.random() - 0.5);

          generated.push({
             question: `"${target.meaning}" kelimesinin karşılığı nedir?`,
             image: target.image_url || undefined,
             options: opts.map((c, idx) => ({
                text: c.text,
                isCorrect: c.isCorrect,
                color: shapes[idx].color,
                shape: shapes[idx].icon
             }))
          });
       }
    }

    // Hepsini karıştırıp ilk 30 tanesini alalım
    setQuestions(generated.sort(() => Math.random() - 0.5).slice(0, 30));
  };

  const createRoom = async () => {
    await generateQuiz();
    const newPin = Math.floor(100000 + Math.random() * 900000).toString();
    
    const { data, error } = await supabase.from('game_rooms').insert([{ pin: newPin, status: 'waiting' }]).select().single();
    if (error || !data) {
      alert("Oda oluşturulamadı.");
      return;
    }

    setRoomId(data.id);
    setPin(newPin);
    setStatus('waiting');

    // Subscriptions setup (Fallback in case polling covers it)
    const roomChannel = supabase.channel(`room:${data.id}`, {
      config: {
        broadcast: { self: true },
        presence: { key: 'host' }
      }
    });

    // Handle answer submissions from players
    roomChannel.on('broadcast', { event: 'submit_answer' }, (payload) => {
       handlePlayerAnswer(payload.payload.playerId, payload.payload.color, payload.payload.timeTakes);
    });

    // Sadece Broadcast değil Postgres_changes da deneyelim
    roomChannel.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'game_players', filter: `room_id=eq.${data.id}` }, (payload) => {
      setPlayers(prev => {
        if(!prev.find(p => p.id === payload.new.id)) {
          return [...prev, payload.new as Player];
        }
        return prev;
      });
    });

    roomChannel.on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'game_players', filter: `room_id=eq.${data.id}` }, (payload) => {
      setPlayers(prev => prev.map(p => p.id === payload.new.id ? payload.new as Player : p).sort((a,b) => b.score - a.score));
    });

    await roomChannel.subscribe();
    setChannel(roomChannel);
  };

  const startGame = async () => {
    if (players.length === 0) {
      if(!window.confirm("Hiç oyuncu yok. Yine de başlamak istiyor musunuz?")) return;
    }
    
    await supabase.from('game_rooms').update({ status: 'playing' }).eq('id', roomId);
    setCurrentQuestionIndex(0);
    broadcastGameState('question', questions[0]);
    resetQuestionTimer();
  };

  const resetQuestionTimer = () => {
    setAnswersCount(0);
    setAnswersByColor({ red: 0, blue: 0, yellow: 0, green: 0 });
    setTimeLeft(questionTimeSetting);
    setTimerActive(true);
    setStatus('playing');
  };

  const broadcastGameState = (newState: string, questionData?: any) => {
    if (channel) {
      // Send minimalist question data 
      const safeData = questionData ? {
         question: questionData.question,
         image: questionData.image,
         options: questionData.options.map((o:any) => ({ text: o.text, color: o.color }))
      } : undefined;

      channel.send({
        type: 'broadcast',
        event: 'game_state',
        payload: { state: newState === 'question' ? 'playing' : newState, questionIndex: currentQuestionIndex, questionData: safeData }
      });
    }
  };

  const handlePlayerAnswer = async (playerId: string, color: string, timeTakes: number) => {
    // We must use refs here because this is attached as a closure when status was 'setup'
    if (statusRef.current !== 'playing') return;

    // Track answer counts for the bar chart
    setAnswersByColor(prev => ({ ...prev, [color]: prev[color] + 1 }));
    setAnswersCount(prev => prev + 1);

    // Bütün oyuncular cevapladı mı? Stale olmayan ref üzerinden kontrol:
    setAnswersCount(newCount => {
       if (newCount >= playersRef.current.length && playersRef.current.length > 0) {
          // Bütün cevaplar alındığında timer kısmına bırakmadan direkt geç, ama async state uyuşmazlığını önlemek için Ref'teki timer'i deaktif et.
          setStatus('result'); // direct UI response
       }
       return newCount;
    });

    // Check if correct
    const currentQ = questionsRef.current[currentQuestionIndexRef.current];
    const isCorrect = currentQ?.options.find(o => o.color === color)?.isCorrect;

    if (isCorrect) {
       // Calculate score (e.g. max 1000 points based on speed)
       const timeRatio = Math.max(0, questionTimeSettingRef.current - timeTakes) / questionTimeSettingRef.current;
       const points = Math.round(500 + (500 * timeRatio));

       // Update DB so all clients and host see the new score via postgres_changes
       const player = playersRef.current.find(p => p.id === playerId);
       if (player) {
          await supabase.from('game_players').update({ score: player.score + points }).eq('id', playerId);
       }
    }
  };

  const handleShowResult = () => {
    setTimerActive(false);
    setStatus('result');
    
    // Status değiştiği anda heartbeat zaten result sinyalini (correctColor) yayınlayacaktır.
    // Ekstra olarak bir kere daha garanti olsun diye fırlatıyoruz:
    const currentQ = questionsRef.current[currentQuestionIndexRef.current];
    const correctOption = currentQ?.options.find(o => o.isCorrect);
    
    supabase.channel(`room:${roomId}`).send({
       type: 'broadcast',
       event: 'question_result',
       payload: { correctColor: correctOption?.color }
    }).catch(console.error);
  };

  const nextQuestionOrLeaderboard = () => {
    setStatus('leaderboard');
    if (channel) {
      channel.send({ type: 'broadcast', event: 'game_state', payload: { state: 'leaderboard' } });
    }
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex + 1 >= questions.length) {
       setStatus('finished');
       if (channel) channel.send({ type: 'broadcast', event: 'game_state', payload: { state: 'finished' } });
       supabase.from('game_rooms').update({ status: 'finished' }).eq('id', roomId).then();
    } else {
       const nextQ = currentQuestionIndex + 1;
       setCurrentQuestionIndex(nextQ);
       broadcastGameState('question', questions[nextQ]);
       resetQuestionTimer();
    }
  };

  const forceEndGame = () => {
    if(window.confirm("Oyunu şimdi bitirmek istediğinize emin misiniz? Canlı skor tablosu ekranına geçilecek.")) {
      setStatus('finished');
      if (channel) channel.send({ type: 'broadcast', event: 'game_state', payload: { state: 'finished' } });
      supabase.from('game_rooms').update({ status: 'finished' }).eq('id', roomId).then();
    }
  };

  // --- RENDERERS ---

  if (status === 'setup') {
    return (
      <div className="flex flex-col items-center justify-center p-4 md:p-8 bg-gray-50 min-h-screen">
        <div className="bg-white p-6 md:p-12 rounded-3xl shadow-xl text-center max-w-lg w-full">
          <Trophy className="w-16 h-16 md:w-24 md:h-24 mx-auto text-amber-500 mb-6" />
          <h1 className="text-3xl md:text-4xl font-black text-gray-800 mb-4 tracking-tight">Canlı Yarışma</h1>
          <p className="text-sm md:text-base text-gray-500 mb-8 font-medium">Öğrencilerin PIN kodu ile katılıp eşzamanlı yarışabileceği Kahoot tarzı sınıf oyununu başlatın.</p>
          
          <div className="mb-8 text-left bg-gray-50 p-4 border border-gray-100 rounded-xl">
             <label className="block text-gray-700 font-bold mb-2">Soru Başına Süre (Saniye):</label>
             <input type="number" min="5" max="120" value={questionTimeSetting} onChange={e => setQuestionTimeSetting(Number(e.target.value))} className="w-full text-xl font-bold px-4 py-3 bg-white border-2 border-gray-200 rounded-lg outline-none focus:border-indigo-500 transition-colors" />
             <p className="text-xs text-gray-400 mt-2">*Süre ne kadar uzun sürerse alınan skor azalır. Standart süre 20 saniyedir.</p>
          </div>

          <button 
            onClick={createRoom}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xl py-4 md:py-5 px-6 rounded-2xl shadow-[0_8px_0_rgb(67,56,202)] active:shadow-none active:translate-y-2 transition-all"
          >
            YENİ OYUN KUR
          </button>
        </div>
      </div>
    );
  }

  if (status === 'waiting') {
    return (
      <div className="flex flex-col bg-indigo-50 min-h-screen">
        <div className="bg-white p-6 md:p-8 shadow-sm flex flex-col md:flex-row justify-between items-center text-center md:text-left gap-4">
           <div>
             <h2 className="text-lg md:text-2xl font-bold text-gray-600 uppercase tracking-widest mb-1 md:mb-2">Katılmak için PIN:</h2>
             <div className="text-5xl md:text-8xl font-black text-indigo-900 tracking-widest">{pin}</div>
           </div>
           
           <button 
             onClick={startGame}
             className="bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xl md:text-2xl py-3 px-8 md:py-4 md:px-12 rounded-full shadow-[0_6px_0_rgb(5,150,105)] active:shadow-none active:translate-y-[6px] transition-all flex items-center justify-center gap-3 w-full md:w-auto"
           >
             BAŞLAT <ArrowRight className="w-6 h-6 md:w-8 md:h-8" />
           </button>
        </div>

        <div className="flex-1 p-4 md:p-8 overflow-y-auto">
           <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
              <Users className="w-6 h-6 md:w-8 md:h-8 text-indigo-600" />
              <h3 className="text-xl md:text-2xl font-bold text-gray-800">Lobideki Oyuncular: {players.length}</h3>
           </div>

           <div className="flex flex-wrap gap-2 md:gap-4 justify-center md:justify-start">
             {players.map(p => (
               <div key={p.id} className="bg-white px-4 py-2 md:px-6 md:py-3 rounded-xl shadow-md font-bold text-lg md:text-xl text-indigo-900 animate-fade-in transform hover:-translate-y-1 transition-all">
                 {p.nickname}
               </div>
             ))}
             {players.length === 0 && (
               <div className="w-full text-center p-8 md:p-12 text-gray-400 font-medium text-sm md:text-xl">
                 Öğrencilerin katılması bekleniyor... 
                 <br/><span className="text-xs md:text-sm">Telefonlarından "Canlı Oyuna Katıl" ekranına gidip PIN girmeliler.</span>
               </div>
             )}
           </div>

           {/* Sorular Listesi */}
           {questions.length > 0 && (
             <div className="mt-8 bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-indigo-100 max-w-4xl mx-auto md:mx-0">
               <h3 className="text-lg md:text-xl font-bold mb-4 text-indigo-900 border-b border-indigo-50 pb-2">Bu Oyunda Sorulacak Sorular ({questions.length})</h3>
               <div className="max-h-64 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                  {questions.map((q, i) => (
                    <div key={i} className="text-sm bg-gray-50 p-3 rounded-lg border border-gray-100 flex gap-3 text-gray-700">
                       <span className="font-bold text-indigo-400 w-6 shrink-0">{i+1}.</span>
                       <span className="font-medium line-clamp-2 md:line-clamp-1">{q.question}</span>
                    </div>
                  ))}
               </div>
             </div>
           )}
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestionIndex];

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-100 relative">
      
      {/* HOST HEADER */}
      <div className="bg-white p-3 md:p-4 shadow-sm flex items-center justify-between z-10 shrink-0">
        <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-6">
           <div className="font-bold text-gray-500 text-sm md:text-base">PIN: <span className="text-black">{pin}</span></div>
           <div className="w-px h-6 bg-gray-200 hidden md:block"></div>
           <div className="font-bold text-gray-500 text-sm md:text-base">Soru: <span className="text-black">{currentQuestionIndex + 1}</span> / {questions.length}</div>
        </div>
        <button 
           onClick={forceEndGame} 
           className="bg-red-50 text-red-600 font-bold px-3 py-2 md:px-4 md:py-2 rounded-lg text-xs md:text-sm hover:bg-red-100 transition-colors flex items-center gap-1 md:gap-2 active:scale-95 border border-red-200"
        >
           <X className="w-4 h-4" /> <span className="hidden sm:inline">Oyunu İptal Et</span>
        </button>
      </div>

      {status === 'leaderboard' ? (
         <div className="flex-1 p-8 flex flex-col items-center justify-center bg-indigo-50">
            <Trophy className="w-24 h-24 text-amber-500 mb-6 drop-shadow-xl" />
            <h2 className="text-4xl font-black text-gray-800 mb-12">SIRALAMA</h2>
            
            <div className="w-full max-w-2xl flex flex-col gap-3 mb-12">
               {players.slice(0, 5).map((p, i) => (
                  <div key={p.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between text-xl md:text-2xl font-bold">
                     <div className="flex items-center gap-4">
                        <span className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${i === 0 ? 'bg-amber-400' : i === 1 ? 'bg-gray-400' : i === 2 ? 'bg-amber-700' : 'bg-indigo-200'}`}>{i + 1}</span>
                        <span className="text-gray-800">{p.nickname}</span>
                     </div>
                     <span className="text-indigo-600">{p.score}</span>
                  </div>
               ))}
            </div>

            <button 
              onClick={goToNextQuestion}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-2xl py-4 px-12 rounded-full shadow-[0_6px_0_rgb(67,56,202)] active:-translate-y-[-6px] active:shadow-none transition-all flex items-center gap-3"
            >
              Sonraki Soru <ArrowRight className="w-6 h-6" />
            </button>
         </div>
      ) : status === 'finished' ? (
         <div className="flex-1 p-8 flex flex-col items-center justify-center bg-purple-900 text-white text-center">
            <Trophy className="w-48 h-48 text-amber-400 mb-8 drop-shadow-2xl animate-bounce" />
            <h1 className="text-5xl md:text-7xl font-black mb-12 drop-shadow-lg">ŞAMPİYON: {players[0]?.nickname || '?'}</h1>
            <p className="text-3xl font-bold text-purple-200 mb-12">Skor: {players[0]?.score || 0}</p>
            <button onClick={() => window.location.reload()} className="bg-white text-purple-900 font-black px-12 py-4 rounded-full text-2xl shadow-xl hover:bg-gray-100 transition-colors">Bitir</button>
         </div>
      ) : (
         <>
         {/* QUESTION AREA */}
         <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white relative">
            <div className={`absolute top-8 left-8 w-24 h-24 rounded-full flex items-center justify-center text-4xl font-black ${timeLeft <= 5 ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-100 text-gray-800'}`}>
               {timeLeft}
            </div>

            <h2 className="text-3xl md:text-5xl font-black text-gray-800 text-center max-w-4xl tracking-tight leading-tight">
               {currentQ.question}
            </h2>

            {currentQ.image && (
               <img src={currentQ.image} alt="Soru" className="max-h-[30vh] object-contain rounded-2xl shadow-lg mt-8 border-4 border-gray-50" />
            )}

            {/* Answer Stats Overlay (Optional tracking) */}
            <div className="absolute top-8 right-8 bg-gray-100 rounded-xl px-6 py-3 font-bold text-2xl text-gray-600 flex flex-col items-center">
               <span className="text-sm uppercase tracking-widest opacity-50 block text-center mb-1">Cevaplar</span>
               <span>{answersCount} / {players.length}</span>
            </div>
         </div>

         {/* OPTIONS GRID */}
         <div className="h-[40vh] grid grid-cols-2 gap-2 md:gap-4 p-4 md:p-8 bg-gray-100">
            {currentQ.options.map((opt) => {
               // Determine styling based on state
               const baseColors: Record<string, string> = {
                  'red': 'bg-red-500 hover:bg-red-600 shadow-[0_6px_0_rgb(185,28,28)]',
                  'blue': 'bg-blue-500 hover:bg-blue-600 shadow-[0_6px_0_rgb(29,78,216)]',
                  'yellow': 'bg-yellow-400 hover:bg-yellow-500 shadow-[0_6px_0_rgb(202,138,4)]',
                  'green': 'bg-green-500 hover:bg-green-600 shadow-[0_6px_0_rgb(21,128,61)]'
               };
               
               let styleClass = baseColors[opt.color];
               let opacity = "";
               
               if (status === 'result') {
                  // Dim wrong answers
                  if (!opt.isCorrect) opacity = "opacity-30 grayscale";
                  else styleClass += " animate-pulse ring-8 ring-white";
               }

               return (
                  <div key={opt.color} className={`${styleClass} ${opacity} rounded-2xl p-6 flex flex-col justify-between transition-all relative overflow-hidden`}>
                     <div className="absolute top-0 right-0 p-4 opacity-50 mix-blend-overlay pointer-events-none transform translate-x-1/4 -translate-y-1/4 scale-150">
                        {opt.shape}
                     </div>
                     <div className="w-8 h-8 md:w-16 md:h-16 flex items-center justify-center shrink-0">
                        {opt.shape}
                     </div>
                     <div className="text-white font-bold text-2xl md:text-3xl lg:text-5xl drop-shadow-md break-words self-end text-right mt-4 leading-tight">
                        {opt.text}
                     </div>

                     {/* Bar Chart (Only visible in result state) */}
                     {status === 'result' && (
                        <div className="absolute bottom-4 left-4 font-black text-2xl text-white bg-black/30 px-4 py-2 rounded-lg">
                           {answersByColor[opt.color]} Kişi
                        </div>
                     )}
                  </div>
               )
            })}
         </div>

         {/* NEXT BUTTON FOR HOST WHEN IN RESULT STATE */}
         {status === 'result' && (
            <div className="absolute bottom-8 right-8 z-50">
               <button 
                 onClick={nextQuestionOrLeaderboard}
                 className="bg-indigo-600 text-white font-bold px-8 py-4 rounded-full text-xl flex items-center gap-2 shadow-2xl hover:bg-indigo-500 transition-colors"
               >
                  Sıralamayı Göster <ArrowRight className="w-6 h-6" />
               </button>
            </div>
         )}
         </>
      )}

    </div>
  );
}
