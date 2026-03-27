import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { Loader2, Triangle, Hexagon, Circle, Square, CheckCircle, XCircle, Trophy } from 'lucide-react';

interface PlayerScreenProps {
  roomId: string;
  playerId: string;
  nickname: string;
  onLeave: () => void;
}

export default function PlayerScreen({ roomId, playerId, nickname, onLeave }: PlayerScreenProps) {
  const [gameState, setGameState] = useState<'waiting' | 'playing' | 'result' | 'leaderboard' | 'finished'>('waiting');
  
  // Minimal payload received from host Broadcast
  const [questionData, setQuestionData] = useState<any>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(-1);
  
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [correctColor, setCorrectColor] = useState<string | null>(null);

  // For scoring
  const [questionStartTime, setQuestionStartTime] = useState<number>(0);

  const [channel, setChannel] = useState<any>(null);

  useEffect(() => {
    const gameChannel = supabase.channel(`room:${roomId}`, {
      config: { broadcast: { self: true } }
    });

    gameChannel.on('broadcast', { event: 'game_state' }, (payload) => {
       const state = payload.payload.state;
       setGameState(state);
       
       if (state === 'playing') {
          // Heartbeat sistemi 1.5 saniyede bir tekrar atabilir, o yüzden questionIndex ile yeniliğini kontrol etmeliyiz.
          if (payload.payload.questionIndex !== undefined && payload.payload.questionIndex !== currentQuestionIndex) {
             setCurrentQuestionIndex(payload.payload.questionIndex);
             setQuestionData(payload.payload.questionData);
             setSelectedColor(null);
             setCorrectColor(null);
             setQuestionStartTime(Date.now());
          }
       }
    });

    gameChannel.on('broadcast', { event: 'question_result' }, (payload) => {
       setGameState('result');
       setCorrectColor(payload.payload.correctColor);
       // if they didn't answer, they missed it.
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

  const handleAnswerSubmit = (color: string) => {
    if (gameState !== 'playing' || selectedColor) return;
    
    setSelectedColor(color);
    
    // Time taken in seconds
    const timeTakes = (Date.now() - questionStartTime) / 1000;

    // Supabase channel metodunu doğrudan çağırarak state gecikmelerini önlüyoruz
    supabase.channel(`room:${roomId}`).send({
      type: 'broadcast',
      event: 'submit_answer',
      payload: { playerId, color, timeTakes }
    }).catch(console.error);
  };

  // Renderers

  if (gameState === 'waiting') {
    return (
      <div className="h-full bg-indigo-600 flex flex-col items-center justify-center p-6 text-center text-white">
        <Loader2 className="w-16 h-16 text-indigo-300 animate-spin mb-8" />
        <h2 className="text-4xl font-black mb-4 tracking-tight">İçeridesin!</h2>
        <p className="text-xl text-indigo-200 font-bold mb-12">Öğretmenin oyunu başlatmasını bekle...</p>
        <div className="bg-indigo-800/50 px-8 py-4 rounded-full font-bold text-2xl border-4 border-indigo-500">
           {nickname}
        </div>
      </div>
    );
  }

  if (gameState === 'leaderboard') {
     return (
       <div className="h-full bg-indigo-50 flex flex-col items-center justify-center p-6 text-center">
         <Trophy className="w-24 h-24 text-amber-500 mb-6 drop-shadow-lg" />
         <h2 className="text-3xl font-black text-gray-800 mb-4 tracking-tight">Tahtaya Bak!</h2>
         <p className="text-xl text-gray-600 font-bold">Puan durumunu ekrandan takip et.</p>
       </div>
     );
  }

  if (gameState === 'finished') {
     return (
       <div className="h-full bg-purple-900 flex flex-col items-center justify-center p-6 text-center text-white">
         <Trophy className="w-32 h-32 text-amber-400 mb-8 animate-bounce" />
         <h2 className="text-4xl font-black mb-12">OYUN BİTTİ!</h2>
         <button onClick={onLeave} className="bg-white text-purple-900 font-black px-8 py-4 rounded-full text-xl shadow-xl hover:bg-gray-100 transition-colors">Ana Menüye Dön</button>
       </div>
     );
  }

  if (gameState === 'result') {
     // Show Result Feedback
     const isWon = selectedColor === correctColor;
     const isTimeout = !selectedColor;

     return (
        <div className={`h-full flex flex-col items-center justify-center p-6 text-center text-white transition-colors duration-500 ${isWon ? 'bg-green-500' : 'bg-red-500'}`}>
          {isTimeout ? (
             <>
               <XCircle className="w-32 h-32 mb-8 opacity-90" />
               <h2 className="text-5xl font-black">Süre Bitti!</h2>
             </>
          ) : isWon ? (
             <>
               <CheckCircle className="w-32 h-32 mb-8 opacity-90" />
               <h2 className="text-5xl font-black mb-4">DOĞRU!</h2>
               <p className="text-2xl font-bold opacity-80">Harika iş çıkardın.</p>
             </>
          ) : (
             <>
               <XCircle className="w-32 h-32 mb-8 opacity-90" />
               <h2 className="text-5xl font-black mb-4">YANLIŞ!</h2>
               <p className="text-2xl font-bold opacity-80">Bir dahaki sefere...</p>
             </>
          )}
        </div>
     );
  }

  // gameState === 'question'
  // Show 4 large colored buttons
  
  if (!questionData) return null;

  return (
    <div className="h-full flex flex-col bg-gray-100">
      
      {/* Top Banner indicating they have answered */}
      {selectedColor && (
         <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center text-white animate-fade-in p-6 text-center">
            <Loader2 className="w-16 h-16 animate-spin mb-6 text-gray-400" />
            <h2 className="text-3xl font-black">Cevabın Gönderildi</h2>
            <p className="text-xl text-gray-400 font-medium mt-4">Diğerlerinin cevaplamasını bekle...</p>
         </div>
      )}

      {/* Actual Question Text shown on top for mobile accessibility */}
      <div className="bg-white px-6 py-6 shadow-md text-center shrink-0">
         <h3 className="text-lg md:text-xl font-bold text-gray-800 line-clamp-3 leading-snug">
            {questionData.question}
         </h3>
      </div>

      {/* 4 Colored Buttons Grid */}
      <div className="flex-1 p-2 md:p-4 grid grid-cols-2 gap-2 md:gap-4 overflow-hidden">
         {questionData.options.map((opt: any) => {
             const baseColors: Record<string, string> = {
               'red': 'bg-red-500 active:bg-red-600',
               'blue': 'bg-blue-500 active:bg-blue-600',
               'yellow': 'bg-yellow-400 active:bg-yellow-500',
               'green': 'bg-green-500 active:bg-green-600'
             };

             // Determine Icon
             let Icon = Triangle;
             if(opt.color === 'blue') Icon = Hexagon;
             if(opt.color === 'yellow') Icon = Circle;
             if(opt.color === 'green') Icon = Square;

             return (
               <button 
                 key={opt.color}
                 onClick={() => handleAnswerSubmit(opt.color)}
                 className={`${baseColors[opt.color]} rounded-xl shadow-lg flex flex-col items-center justify-center gap-4 transition-transform active:scale-95 p-4`}
               >
                  <Icon className="w-16 h-16 md:w-24 md:h-24 text-white drop-shadow-md" fill="white" />
                  <span className="text-white font-bold text-xl md:text-2xl drop-shadow-sm line-clamp-2 leading-tight">
                     {opt.text}
                  </span>
               </button>
             );
         })}
      </div>

    </div>
  );
}
