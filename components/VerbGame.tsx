
import React, { useState, useMemo } from 'react';
import { WORDS, VERBS } from '../constants';
import { WordItem, VerbItem, GameState, ValidationResult } from '../types';
import WordCard from './WordCard';
import VerbGrid from './VerbGrid';
import FeedbackModal from './FeedbackModal';
import { generateFeedback } from '../services/gemini';
import { Sparkles, Trophy, RotateCcw, Home } from 'lucide-react';
import { playCorrectSound, playWrongSound } from '../utils/sound';

interface VerbGameProps {
  onBackToMenu: () => void;
}

const VerbGame: React.FC<VerbGameProps> = ({ onBackToMenu }) => {
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
    // Although the new service is instant, we keep the structure consistent
    const initialResult: ValidationResult = {
      isCorrect,
      isLoading: true,
      explanation: "",
      exampleSentence: "",
      romajiSentence: ""
    };
    setValidationResult(initialResult);
    setGameState('feedback');

    // 3. Fetch Manual Explanation (Instant)
    const detailedResult = await generateFeedback(currentWord.id, verb.id, isCorrect);
    
    setValidationResult(detailedResult);
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
      <div className="h-full flex flex-col items-center justify-center p-6">
        <div className="bg-white/90 backdrop-blur p-8 rounded-3xl shadow-2xl text-center max-w-md w-full border border-rose-100 relative">
          <button 
            onClick={onBackToMenu}
            className="absolute top-4 left-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
          >
            <Home className="w-6 h-6" />
          </button>
          
          <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-10 h-10 text-rose-500" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Japonca Eşleştir</h1>
          <p className="text-rose-500 font-medium mb-8">Fiil Ustası</p>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Ekranda çıkan nesneleri veya zamanları doğru fiillerle eşleştir.
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
      <div className="h-full flex flex-col items-center justify-center p-6">
        <div className="text-center animate-bounce mb-8">
          <Trophy className="w-24 h-24 text-yellow-500 mx-auto drop-shadow-lg" />
        </div>
        <h1 className="text-5xl font-bold text-gray-800 mb-4">Omedetou!</h1>
        <p className="text-2xl text-gray-600 mb-8">Ders Tamamlandı</p>
        <div className="bg-white p-6 rounded-2xl shadow-xl border-2 border-rose-100 mb-8 w-64 text-center">
           <p className="text-gray-400 text-sm uppercase font-bold">Toplam Puan</p>
           <p className="text-5xl font-black text-rose-500">{score} / {shuffledWords.length}</p>
        </div>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <button 
            onClick={startGame}
            className="flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-900 text-white font-bold py-3 px-8 rounded-full shadow-xl transition-all hover:scale-105"
          >
            <RotateCcw className="w-5 h-5" />
            Tekrar Oyna
          </button>
          <button 
            onClick={onBackToMenu}
            className="flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 font-bold py-3 px-8 rounded-full shadow-md border border-gray-200 transition-all"
          >
            <Home className="w-5 h-5" />
            Menüye Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col relative">
      <header className="flex justify-between items-center p-4 md:p-6 z-10">
        <div className="flex items-center gap-2">
          <button 
            onClick={onBackToMenu}
            className="bg-white/50 backdrop-blur p-2 rounded-full hover:bg-white transition-colors"
          >
            <Home className="w-5 h-5 text-gray-600" />
          </button>
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
};

export default VerbGame;
