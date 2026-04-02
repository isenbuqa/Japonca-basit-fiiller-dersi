import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../utils/supabase';
import { Loader2, Users, Play, Trophy, Square, Circle, Triangle, Hexagon, ArrowRight, X, Settings, ToggleLeft, ToggleRight, Clock, UserMinus } from 'lucide-react';
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
  _category?: string;
}

export default function AdminHostGame() {
  const [roomId, setRoomId] = useState<string | null>(null);
  const [pin, setPin] = useState<string | null>(null);
  const [status, setStatus] = useState<'setup' | 'waiting' | 'playing' | 'result' | 'leaderboard' | 'finished'>('setup');
  const [players, setPlayers] = useState<Player[]>([]);
  
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionTimeSetting, setQuestionTimeSetting] = useState(20);

  // Game settings
  const [enableVerbMatch, setEnableVerbMatch] = useState(true);
  const [enableSentence, setEnableSentence] = useState(true);
  const [enableTabemasu, setEnableTabemasu] = useState(true);
  const [enableReview, setEnableReview] = useState(true);
  const [maxQuestions, setMaxQuestions] = useState(30);

  // Preview questions (generated but not yet committed)
  const [previewQuestions, setPreviewQuestions] = useState<(QuizQuestion & { id: string; category: string; included: boolean })[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Stats for the current question
  const [answersCount, setAnswersCount] = useState(0);
  const [answersByColor, setAnswersByColor] = useState<Record<string, number>>({ red: 0, blue: 0, yellow: 0, green: 0 });
  const [timeLeft, setTimeLeft] = useState(20);
  const [timerActive, setTimerActive] = useState(false);
  const [questionStartedAt, setQuestionStartedAt] = useState(0);

  // Refs for stale closures safely reading states inside WebSockets
  const statusRef = useRef(status);
  const questionsRef = useRef(questions);
  const currentQuestionIndexRef = useRef(currentQuestionIndex);
  const questionTimeSettingRef = useRef(questionTimeSetting);
  const playersRef = useRef(players);
  const timeLeftRef = useRef(timeLeft);
  const questionStartedAtRef = useRef(questionStartedAt);

  useEffect(() => {
     statusRef.current = status;
     questionsRef.current = questions;
     currentQuestionIndexRef.current = currentQuestionIndex;
     questionTimeSettingRef.current = questionTimeSetting;
     playersRef.current = players;
     timeLeftRef.current = timeLeft;
     questionStartedAtRef.current = questionStartedAt;
  }, [status, questions, currentQuestionIndex, questionTimeSetting, players, timeLeft, questionStartedAt]);

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
        channel.send({ type: 'broadcast', event: 'game_state', payload: { state: 'playing', questionIndex: currentQuestionIndex, questionData: safeData, questionTime: questionTimeSetting, totalQuestions: questions.length, questionStartedAt: questionStartedAtRef.current } });
      } else if (status === 'result') {
        const currentQ = questions[currentQuestionIndex];
        const correctOption = currentQ?.options.find(o => o.isCorrect);
        channel.send({ type: 'broadcast', event: 'question_result', payload: { correctColor: correctOption?.color, answersByColor } });
      } else if (status === 'leaderboard') {
        const sorted = [...players].sort((a, b) => b.score - a.score).map(p => ({ id: p.id, nickname: p.nickname, score: p.score }));
        channel.send({ type: 'broadcast', event: 'game_state', payload: { state: 'leaderboard', leaderboard: sorted } });
      } else if (status === 'finished') {
        channel.send({ type: 'broadcast', event: 'game_state', payload: { state: 'finished' } });
      }
    }, 1000); // Her saniye otoriter durumu fırlat (timer sync için)

    return () => clearInterval(interval);
  }, [channel, status, currentQuestionIndex, questions]);

  const generateQuiz = async () => {
    setIsGenerating(true);
    // Fetch all data sources (only visible items)
    const [reviewsRes, simpleVerbsRes, wordsRes, verbsRes, tabemasuRes] = await Promise.all([
      supabase.from('review_questions').select('*').eq('term', 2).eq('is_visible', true),
      supabase.from('simple_verbs').select('*').eq('is_visible', true),
      supabase.from('words').select('*').eq('is_visible', true),
      supabase.from('verbs').select('*').eq('is_visible', true),
      supabase.from('tabemasu_items').select('*').eq('is_visible', true)
    ]);

    const reviews = reviewsRes.data || [];
    const simpleVerbs = simpleVerbsRes.data || [];
    const dbWords = wordsRes.data || [];
    const dbVerbs = verbsRes.data || [];
    const tabemasuItems = tabemasuRes.data || [];

    const generated: QuizQuestion[] = [];
    const shapes = [
      { color: 'red', icon: <Triangle className="w-8 h-8 md:w-16 md:h-16 text-white drop-shadow-md" fill="white" /> },
      { color: 'blue', icon: <Hexagon className="w-8 h-8 md:w-16 md:h-16 text-white drop-shadow-md" fill="white" /> },
      { color: 'yellow', icon: <Circle className="w-8 h-8 md:w-16 md:h-16 text-white drop-shadow-md" fill="white" /> },
      { color: 'green', icon: <Square className="w-8 h-8 md:w-16 md:h-16 text-white drop-shadow-md" fill="white" /> }
    ];

    // Helper: -tai form converter
    const toTai = (romaji: string, text: string) => ({
      romaji: romaji.replace(/mas$/i, 'tai'),
      hiragana: text.replace(/ます$/, 'たい')
    });

    // Build verb lookup
    const verbMap: Record<string, any> = {};
    dbVerbs.forEach(v => { verbMap[v.id] = v; });

    // Build meaning lookup from simple_verbs
    const verbMeaningMap: Record<string, string> = {};
    simpleVerbs.forEach(sv => { verbMeaningMap[sv.romaji.toLowerCase()] = sv.meaning; });

    // =============================================
    // 1. FİİL EŞLEŞTİRME (words + verbs tabloları)
    // "Bu kelime hangi fiille kullanılır?" tarzı
    // =============================================
    if (enableVerbMatch && dbWords.length > 0 && dbVerbs.length >= 2) {
      const shuffledWords = [...dbWords].sort(() => Math.random() - 0.5);
      
      shuffledWords.forEach(word => {
        const validVerbIds: string[] = word.valid_verb_ids || [];
        // Find a valid visible verb for this word
        const correctVerbId = validVerbIds.find(vid => verbMap[vid]);
        if (!correctVerbId) return;
        
        const correctVerb = verbMap[correctVerbId];
        const correctMeaning = verbMeaningMap[correctVerb.romaji.toLowerCase()] || correctVerb.romaji;
        
        // Get wrong verbs (not in valid_verb_ids)
        const wrongVerbs = dbVerbs.filter(v => !validVerbIds.includes(v.id));
        if (wrongVerbs.length < 3) return;
        
        const shuffledWrong = [...wrongVerbs].sort(() => Math.random() - 0.5).slice(0, 3);
        
        const opts = [
          { text: `${correctVerb.romaji} (${correctVerb.text})`, isCorrect: true },
          ...shuffledWrong.map(wv => ({
            text: `${wv.romaji} (${wv.text})`,
            isCorrect: false
          }))
        ].sort(() => Math.random() - 0.5);

        generated.push({
          _category: '🔗 Fiil Eşleştirme',
          question: `${word.image && !word.image.startsWith('http') ? word.image + ' ' : ''}${word.romaji} (${word.text}) hangi fiille kullanılır?`,
          image: word.image && word.image.startsWith('http') ? word.image : undefined,
          options: opts.map((c, idx) => ({
            text: c.text,
            isCorrect: c.isCorrect,
            color: shapes[idx].color,
            shape: shapes[idx].icon
          }))
        });
      });
    }

    // =============================================
    // 2. CÜMLE KURMA BOŞLUK DOLDURMA
    // "... o Tabetai des" cümlesinde eksik kelimeyi bul
    // =============================================
    if (enableSentence && dbWords.length >= 4 && dbVerbs.length > 0) {
      const sentenceWords = [...dbWords].sort(() => Math.random() - 0.5);
      
      sentenceWords.forEach(word => {
        const validVerbIds: string[] = word.valid_verb_ids || [];
        const correctVerbId = validVerbIds.find(vid => verbMap[vid]);
        if (!correctVerbId) return;
        
        const verb = verbMap[correctVerbId];
        const tai = toTai(verb.romaji, verb.text);
        const wordTurkish = word.meaning || word.romaji;
        let verbTurkish = verbMeaningMap[verb.romaji.toLowerCase()] || verb.romaji;
        if (correctVerbId === 'v10' && word.category === 'media') verbTurkish = 'Oynamak';
        
        // "_____ o [Tai] des" → doğru cevap kelime 
        const otherWords = dbWords.filter(w => w.id !== word.id);
        if (otherWords.length < 3) return;
        const wrongWords = [...otherWords].sort(() => Math.random() - 0.5).slice(0, 3);
        
        const particle = correctVerbId === 'v11' ? 'ni (に)' : 'o (を)';
        
        const opts = [
          { text: `${word.romaji} (${word.text})`, isCorrect: true },
          ...wrongWords.map(ww => ({
            text: `${ww.romaji} (${ww.text})`,
            isCorrect: false
          }))
        ].sort(() => Math.random() - 0.5);

        generated.push({
          _category: '📝 Cümle Kurma',
          question: `"${wordTurkish} ${verbTurkish.toLowerCase()} istiyorum."\n_____ ${particle} ${tai.hiragana} です`,
          options: opts.map((c, idx) => ({
            text: c.text,
            isCorrect: c.isCorrect,
            color: shapes[idx].color,
            shape: shapes[idx].icon
          }))
        });
      });
    }

    // =============================================
    // 3. TABEMAS / NOMİMAS EŞLEŞTİRME
    // "Bu yiyecek/içecek tabemas mı nomimas mı?"
    // =============================================
    if (enableTabemasu && tabemasuItems.length > 0) {
      const shuffledTab = [...tabemasuItems].sort(() => Math.random() - 0.5);
      
      shuffledTab.forEach(item => {
        const isTabemas = item.action === 'tabemas';
        
        const opts = [
          { text: 'Tabemas (食べます) - Yenir', isCorrect: isTabemas },
          { text: 'Nomimas (飲みます) - İçilir', isCorrect: !isTabemas },
          { text: 'Yomimas (読みます) - Okunur', isCorrect: false },
          { text: 'Kikimas (聞きます) - Dinlenir', isCorrect: false }
        ].sort(() => Math.random() - 0.5);

        generated.push({
          _category: '🍴 Tabemas/Nomimas',
          question: `${item.image && !item.image.startsWith('http') ? item.image + ' ' : ''}${item.romaji} (${item.text}) için doğru fiil hangisidir?`,
          image: item.image && item.image.startsWith('http') ? item.image : undefined,
          options: opts.map((c, idx) => ({
            text: c.text,
            isCorrect: c.isCorrect,
            color: shapes[idx].color,
            shape: shapes[idx].icon
          }))
        });
      });
    }

    // =============================================
    // 4. KONU TEKRARI - 2. DÖNEM
    // review_questions tablosundan (term = 2, matching hariç)
    // =============================================
    if (enableReview && reviews.length > 0) {
      const filteredReviews = reviews.filter(r => r.type === 'vocab' || r.type === 'multi_choice' || r.type === 'demo');
      const selectedReviews = [...filteredReviews].sort(() => Math.random() - 0.5);
      
      selectedReviews.forEach(r => {
        if (r.options && Array.isArray(r.options) && r.options.length > 0) {
          const shuffledChoices = [...r.options].sort(() => Math.random() - 0.5).slice(0, 4);
          while(shuffledChoices.length < 4) {
             shuffledChoices.push({ text: '-', romaji: '-' });
          }

          generated.push({
            _category: '📚 Konu Tekrarı',
            question: r.turkish_meaning || r.japanese_question || r.romaji_question || "Soru",
            image: r.image || undefined,
            options: shuffledChoices.map((c: any, idx: number) => {
              const isCorrect = c.text === r.correct_answer || c.romaji === r.correct_answer;
              return {
                text: `${c.romaji && c.romaji !== c.text ? `${c.romaji} (${c.text})` : c.text}`,
                isCorrect: isCorrect,
                color: shapes[idx].color,
                shape: shapes[idx].icon
              }
            })
          });
        }
      });
    }

    // Store as preview with metadata
    const withMeta = generated.sort(() => Math.random() - 0.5).map((q, i) => ({
      ...q,
      id: `q_${i}`,
      category: (q as any)._category || 'other',
      included: true
    }));
    setPreviewQuestions(withMeta);
    setShowPreview(true);
    setIsGenerating(false);
  };

  const createRoom = async () => {
    // Commit included preview questions
    const finalQuestions = previewQuestions
      .filter(q => q.included)
      .slice(0, maxQuestions)
      .map(({ id, category, included, _category, ...rest }) => rest) as QuizQuestion[];
    
    if (finalQuestions.length === 0) {
      alert('En az bir soru dahil edilmelidir!');
      return;
    }
    setQuestions(finalQuestions);
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
    setQuestionStartedAt(Date.now());
    setStatus('playing');
  };

  const kickPlayer = async (playerId: string, nickname: string) => {
    if (!window.confirm(`"${nickname}" oyundan çıkarılsın mı?`)) return;
    // Remove from DB
    await supabase.from('game_players').delete().eq('id', playerId);
    // Remove from local state
    setPlayers(prev => prev.filter(p => p.id !== playerId));
    // Broadcast kick to the player
    if (channel) {
      channel.send({ type: 'broadcast', event: 'player_kicked', payload: { playerId } });
    }
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
        payload: { state: newState === 'question' ? 'playing' : newState, questionIndex: currentQuestionIndex, questionData: safeData, questionTime: questionTimeSetting, totalQuestions: questions.length, questionStartedAt: questionStartedAtRef.current }
      });
    }
  };

  const handlePlayerAnswer = async (playerId: string, color: string, timeTakes: number) => {
    // We must use refs here because this is attached as a closure when status was 'setup'
    if (statusRef.current !== 'playing') return;

    // Track answer counts for the bar chart
    setAnswersByColor(prev => ({ ...prev, [color]: prev[color] + 1 }));
    setAnswersCount(prev => prev + 1);

    // NOT: Tüm oyuncular cevaplasa bile süre bitene kadar bekliyoruz.
    // Sonuçlar sadece süre dolduğunda (handleShowResult) gösterilecek.

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
       payload: { correctColor: correctOption?.color, answersByColor }
    }).catch(console.error);
  };

  const nextQuestionOrLeaderboard = async () => {
    // Refresh player scores from DB before showing leaderboard
    if (roomId) {
      const { data: freshPlayers } = await supabase.from('game_players').select('*').eq('room_id', roomId);
      if (freshPlayers) setPlayers(freshPlayers as Player[]);
    }
    setStatus('leaderboard');
    if (channel) {
      const sorted = [...players].sort((a, b) => b.score - a.score).map(p => ({ id: p.id, nickname: p.nickname, score: p.score }));
      channel.send({ type: 'broadcast', event: 'game_state', payload: { state: 'leaderboard', leaderboard: sorted } });
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
    const toggleQuestion = (id: string) => {
      setPreviewQuestions(prev => prev.map(q => q.id === id ? { ...q, included: !q.included } : q));
    };
    const includeAll = () => setPreviewQuestions(prev => prev.map(q => ({ ...q, included: true })));
    const excludeAll = () => setPreviewQuestions(prev => prev.map(q => ({ ...q, included: false })));
    const includedCount = previewQuestions.filter(q => q.included).length;

    return (
      <div className="flex flex-col items-center p-4 md:p-8 bg-gray-50 min-h-screen">
        <div className="bg-white p-5 md:p-8 rounded-3xl shadow-xl max-w-2xl w-full">
          <div className="text-center mb-6">
            <Trophy className="w-12 h-12 md:w-16 md:h-16 mx-auto text-amber-500 mb-3" />
            <h1 className="text-2xl md:text-3xl font-black text-gray-800 tracking-tight">Canlı Yarışma Ayarları</h1>
          </div>

          {!showPreview ? (
            /* STEP 1: Category selection */
            <>
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-3">
                  <Settings className="w-4 h-4 text-gray-500" />
                  <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wider">Soru Kaynakları</h3>
                </div>
                <div className="space-y-2">
                  {[
                    { label: 'Fiil Eşleştirme', emoji: '🔗', enabled: enableVerbMatch, setEnabled: setEnableVerbMatch },
                    { label: 'Cümle Kurma', emoji: '📝', enabled: enableSentence, setEnabled: setEnableSentence },
                    { label: 'Tabemas / Nomimas', emoji: '🍴', enabled: enableTabemasu, setEnabled: setEnableTabemasu },
                    { label: 'Konu Tekrarı (2. Dönem)', emoji: '📚', enabled: enableReview, setEnabled: setEnableReview },
                  ].map(cat => (
                    <button key={cat.label} onClick={() => cat.setEnabled(!cat.enabled)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${cat.enabled ? 'border-indigo-200 bg-indigo-50/50' : 'border-gray-100 bg-gray-50 opacity-60'}`}>
                      {cat.enabled ? <ToggleRight className="w-7 h-7 text-indigo-600 shrink-0" /> : <ToggleLeft className="w-7 h-7 text-gray-400 shrink-0" />}
                      <span className="text-lg">{cat.emoji}</span>
                      <span className={`font-bold text-sm ${cat.enabled ? 'text-gray-800' : 'text-gray-400'}`}>{cat.label}</span>
                    </button>
                  ))}
                </div>
                {!enableVerbMatch && !enableSentence && !enableTabemasu && !enableReview && (
                  <p className="text-red-500 text-xs font-bold mt-2 text-center">⚠️ En az bir kategori seçmelisiniz!</p>
                )}
              </div>

              <div className="mb-5 space-y-2">
                <div className="flex items-center gap-2 mb-1"><Clock className="w-4 h-4 text-gray-500" /><h3 className="font-bold text-gray-700 text-sm uppercase tracking-wider">Oyun Ayarları</h3></div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-100 rounded-xl">
                  <span className="font-bold text-sm text-gray-700 flex-1">Soru Başına Süre</span>
                  <input type="number" min="5" max="120" value={questionTimeSetting} onChange={e => setQuestionTimeSetting(Math.max(5, Number(e.target.value)))} className="w-16 text-center text-sm font-bold px-2 py-1.5 bg-white border border-gray-200 rounded-lg outline-none focus:border-indigo-500" />
                  <span className="text-xs text-gray-400">sn</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-100 rounded-xl">
                  <span className="font-bold text-sm text-gray-700 flex-1">Toplam Soru Limiti</span>
                  <input type="number" min="1" max="50" value={maxQuestions} onChange={e => setMaxQuestions(Math.max(1, Math.min(50, Number(e.target.value))))} className="w-16 text-center text-sm font-bold px-2 py-1.5 bg-white border border-gray-200 rounded-lg outline-none focus:border-indigo-500" />
                  <span className="text-xs text-gray-400">soru</span>
                </div>
              </div>

              <button
                onClick={generateQuiz}
                disabled={(!enableVerbMatch && !enableSentence && !enableTabemasu && !enableReview) || isGenerating}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold text-lg py-4 px-6 rounded-2xl shadow-[0_6px_0_rgb(67,56,202)] active:shadow-none active:translate-y-[6px] transition-all flex items-center justify-center gap-2"
              >
                {isGenerating ? <><Loader2 className="w-5 h-5 animate-spin" /> Sorular Üretiliyor...</> : <>🎲 SORULARI ÜRET</>}
              </button>
            </>
          ) : (
            /* STEP 2: Question preview & selection */
            <>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-bold text-gray-700 text-sm">Üretilen Sorular</h3>
                  <p className="text-xs text-gray-400">{includedCount} / {previewQuestions.length} soru dahil ({Math.min(includedCount, maxQuestions)} oyuna alınacak)</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={includeAll} className="text-xs px-2 py-1 bg-emerald-50 text-emerald-700 font-bold rounded-lg hover:bg-emerald-100">Tümünü Dahil Et</button>
                  <button onClick={excludeAll} className="text-xs px-2 py-1 bg-red-50 text-red-700 font-bold rounded-lg hover:bg-red-100">Tümünü Çıkar</button>
                </div>
              </div>

              <div className="max-h-[50vh] overflow-y-auto space-y-1.5 mb-4 border border-gray-100 rounded-xl p-2 bg-gray-50">
                {previewQuestions.map((q, i) => (
                  <div key={q.id} className={`flex items-start gap-2 p-2.5 rounded-lg border transition-all cursor-pointer ${q.included ? 'bg-white border-gray-200' : 'bg-gray-100 border-gray-100 opacity-50'}`}
                    onClick={() => toggleQuestion(q.id)}>
                    <div className="shrink-0 mt-0.5">
                      {q.included ? <ToggleRight className="w-6 h-6 text-emerald-600" /> : <ToggleLeft className="w-6 h-6 text-gray-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 shrink-0">{q.category}</span>
                        <span className="text-[10px] text-gray-400">#{i + 1}</span>
                      </div>
                      <p className="text-xs font-medium text-gray-700 line-clamp-2 whitespace-pre-line">{q.question}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {q.options.map((opt, oi) => (
                          <span key={oi} className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                            opt.isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-500'
                          }`}>{opt.text}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <button onClick={() => { setShowPreview(false); setPreviewQuestions([]); }}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 px-4 rounded-xl transition-colors">
                  ← Geri
                </button>
                <button onClick={createRoom}
                  disabled={includedCount === 0}
                  className="flex-[2] bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold text-lg py-3 px-6 rounded-xl shadow-[0_6px_0_rgb(67,56,202)] active:shadow-none active:translate-y-[6px] transition-all">
                  🚀 OYUNU BAŞLAT ({Math.min(includedCount, maxQuestions)} soru)
                </button>
              </div>
            </>
          )}
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
               <div key={p.id} className="bg-white px-4 py-2 md:px-6 md:py-3 rounded-xl shadow-md font-bold text-lg md:text-xl text-indigo-900 animate-fade-in transform hover:-translate-y-1 transition-all flex items-center gap-2">
                 {p.nickname}
                 <button 
                   onClick={() => kickPlayer(p.id, p.nickname)}
                   className="ml-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full p-1 transition-colors"
                   title="Oyundan çıkar"
                 >
                   <X className="w-4 h-4" />
                 </button>
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
         <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 p-6 md:p-8">
            <Trophy className="w-20 h-20 md:w-24 md:h-24 text-amber-400 mb-4 drop-shadow-[0_0_30px_rgba(251,191,36,0.5)]" />
            <h2 className="text-3xl md:text-5xl font-black text-white mb-8 md:mb-12 tracking-tight">SIRALAMA</h2>
            
            <div className="w-full max-w-2xl flex flex-col gap-2 md:gap-3 mb-8 md:mb-12">
               {[...players].sort((a, b) => b.score - a.score).slice(0, 5).map((p, i) => {
                 const medals = ['🥇', '🥈', '🥉'];
                 return (
                   <div key={p.id} className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${
                     i === 0 ? 'bg-gradient-to-r from-amber-500/30 to-yellow-500/20 border border-amber-500/40 scale-105' : 'bg-white/5 border border-white/5'
                   }`}>
                      <span className="text-3xl md:text-4xl w-12 text-center shrink-0">
                        {i < 3 ? medals[i] : <span className="text-xl md:text-2xl font-black text-white/30">{i + 1}</span>}
                      </span>
                      <span className="flex-1 text-white font-bold text-xl md:text-2xl truncate">{p.nickname}</span>
                      <span className="text-amber-400 font-black text-2xl md:text-3xl tabular-nums">{p.score}</span>
                   </div>
                 );
               })}
            </div>

            <button 
              onClick={goToNextQuestion}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xl md:text-2xl py-4 px-10 md:px-12 rounded-full shadow-[0_6px_0_rgb(67,56,202)] active:translate-y-[6px] active:shadow-none transition-all flex items-center gap-3"
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

             {/* Answer count - only show after time is up (result state) */}
             {status === 'result' && (
               <div className="absolute top-8 right-8 bg-gray-100 rounded-xl px-6 py-3 font-bold text-2xl text-gray-600 flex flex-col items-center">
                  <span className="text-sm uppercase tracking-widest opacity-50 block text-center mb-1">Cevaplar</span>
                  <span>{answersCount} / {players.length}</span>
               </div>
             )}
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
