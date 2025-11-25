
import React, { useState, useEffect, useMemo } from 'react';
import { WORDS, VERBS } from './constants';
import { WordItem, VerbItem, GameState, ValidationResult } from './types';
import WordCard from './components/WordCard';
import VerbGrid from './components/VerbGrid';
import FeedbackModal from './components/FeedbackModal';
import { generateFeedback } from './services/gemini';
import { Sparkles, Trophy, RotateCcw } from 'lucide-react';
import { playCorrectSound, playWrongSound } from './utils/sound';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('start');
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [shuffledWords, setShuffledWords] = useState<WordItem[]>([]);
  const [selectedVerb, setSelectedVerb] = useState<VerbItem | null>(null);

  const startGame = () => {
    const shuffled = [...WORDS].sort(() => Math.random() - 0.5);
    setShuffledWords(shuffled);
    setCurrentWordIndex(0);
    setScore(0);
    setGameState('playing');
    setValidationResult(null);
    setSelectedVerb(null);
  };

  const currentWord = useMemo(() => {
    return shuffledWords[currentWordIndex];
  }, [shuffledWords, currentWordIndex]);

  const handleVerbSelect = async (verb: VerbItem) => {
    if (gameState !== 'playing') return;

    setSelectedVerb(verb);
    setGameState('validating');
    
    // 1. Instant Local Validation
    const isCorrect = currentWord.validVerbIds.includes(verb.id);
    
    if (isCorrect) {
      setScore(s => s + 1);
      playCorrectSound();
    } else {
      playWrongSound();
    }

    // 2. Show Modal Immediately with Loading State
    const initialResult: ValidationResult = {
      isCorrect,
      isLoading: true,
      explanation: "",
      exampleSentence: "",
      romajiSentence: ""
    };
    setValidationResult(initialResult);
    setGameState('feedback');

    // 3. Background: Fetch Explanation from Gemini
    const detailedResult = await generateFeedback(currentWord.text, verb.text, isCorrect);
    
    // Only update if we are still looking at the same word/verb (user hasn't clicked next quickly)
    setValidationResult(prev => {
      if (prev && prev.isCorrect === isCorrect) {
        return detailedResult;
      }
      return prev;
    });
  };

  const handleNext = () => {
    setValidationResult(null);
    setSelectedVerb(null);
    
    if (validationResult?.isCorrect) {
      if (currentWordIndex < shuffledWords.length - 1) {
        setCurrentWordIndex(prev => prev + 1);
        setGameState('playing');
      } else {
        setGameState('finished');
      }
    } else {
      setGameState('playing');
    }
  };

  if (gameState === 'start') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[url('https://www.transparenttextures.com/patterns/shippo.png')] bg-repeat bg-rose-50">
        <div className="bg-white/90 backdrop-blur p-8 rounded-3xl shadow-2xl text-center max-w-md w-full border border-rose-100">
          <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-10 h-10 text-rose-500" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Japonca Eşleştir</h1>
          <p className="text-rose-500 font-medium mb-8">Fiil Ustası</p>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Ekranda çıkan nesneleri veya zamanları doğru fiillerle eşleştir.
            <br/><span className="text-sm text-gray-400">Gemini AI tarafından desteklenmektedir</span>
          </p>
          <button 
            onClick={startGame}
            className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-4 rounded-xl text-xl shadow-lg shadow-rose-200 transition-all transform hover:-translate-y-1 active:scale-95"
          >
            Dersi Başlat
          </button>
        </div>
      </div>
    );
  }

  if (gameState === 'finished') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-rose-50">
        <div className="text-center animate-bounce mb-8">
          <Trophy className="w-24 h-24 text-yellow-500 mx-auto drop-shadow-lg" />
        </div>
        <h1 className="text-5xl font-bold text-gray-800 mb-4">Omedetou!</h1>
        <p className="text-2xl text-gray-600 mb-8">Ders Tamamlandı</p>
        <div className="bg-white p-6 rounded-2xl shadow-xl border-2 border-rose-100 mb-8 w-64">
           <p className="text-gray-400 text-sm uppercase font-bold">Toplam Puan</p>
           <p className="text-5xl font-black text-rose-500">{score} / {shuffledWords.length}</p>
        </div>
        <button 
          onClick={startGame}
          className="flex items-center gap-2 bg-gray-800 hover:bg-gray-900 text-white font-bold py-3 px-8 rounded-full shadow-xl transition-all hover:scale-105"
        >
          <RotateCcw className="w-5 h-5" />
          Tekrar Oyna
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col relative overflow-hidden bg-rose-50">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-30">
         <div className="absolute -top-20 -left-20 w-96 h-96 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
         <div className="absolute top-40 -right-20 w-96 h-96 bg-amber-100 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
      </div>

      <header className="flex justify-between items-center p-4 md:p-6 z-10">
        <div className="flex items-center gap-2">
          <span className="bg-white/80 backdrop-blur px-3 py-1 rounded-full text-sm font-bold text-rose-500 border border-rose-200">
            N5 Seviyesi
          </span>
        </div>
        <div className="text-right">
          <span className="text-sm text-gray-400 font-bold block">PUAN</span>
          <span className="text-2xl font-black text-gray-800">{score}</span>
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center relative z-10 -mt-10">
        <WordCard 
          word={currentWord} 
          animate={gameState === 'playing' || gameState === 'validating'} 
        />
      </main>

      <footer className="w-full bg-white/80 backdrop-blur-lg border-t border-rose-100 z-30 pb-safe">
        <div className="w-full h-1 bg-gradient-to-r from-rose-200 via-rose-400 to-rose-200"></div>
        <VerbGrid 
          verbs={VERBS} 
          onSelect={handleVerbSelect} 
          disabled={gameState !== 'playing'} 
        />
      </footer>

      {selectedVerb && (
        <FeedbackModal 
          result={validationResult} 
          word={currentWord} 
          verb={selectedVerb}
          onNext={handleNext}
        />
      )}
    </div>
  );
}
