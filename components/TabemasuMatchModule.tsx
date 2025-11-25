
import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, XCircle, Utensils, Coffee, RotateCcw } from 'lucide-react';
import { playCorrectSound, playWrongSound } from '../utils/sound';

interface GameItem {
  id: string;
  romaji: string;
  text: string;
  image: string;
  action: 'tabemas' | 'nomimas';
}

const ITEMS: GameItem[] = [
  { id: '1', romaji: 'Pan', text: 'パン', image: '🍞', action: 'tabemas' },
  { id: '2', romaji: 'Sushi', text: 'すし', image: 'https://raw.githubusercontent.com/isenbuqa/staj-dersi-img/refs/heads/main/tabemasu.jpg', action: 'tabemas' }, // Placeholder visual logic handled below
  { id: '3', romaji: 'Keeki', text: 'ケーキ', image: '🍰', action: 'tabemas' },
  { id: '4', romaji: 'Niku', text: '肉', image: '🥩', action: 'tabemas' },
  { id: '5', romaji: 'Tamago', text: '卵', image: '🥚', action: 'tabemas' },
  { id: '6', romaji: 'Gohan', text: 'ご飯', image: '🍚', action: 'tabemas' },
  { id: '7', romaji: 'Mizu', text: '水', image: '💧', action: 'nomimas' },
  { id: '8', romaji: 'Koohii', text: 'コーヒー', image: '☕', action: 'nomimas' },
  { id: '9', romaji: 'Koora', text: 'コーラ', image: '🥤', action: 'nomimas' },
];

interface TabemasuMatchModuleProps {
  onBack: () => void;
}

const TabemasuMatchModule: React.FC<TabemasuMatchModuleProps> = ({ onBack }) => {
  const [items, setItems] = useState<GameItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    // Shuffle items on start
    setItems([...ITEMS].sort(() => Math.random() - 0.5));
  }, []);

  const currentItem = items[currentIndex];

  const handleChoice = (choice: 'tabemas' | 'nomimas') => {
    if (feedback) return; // Prevent double clicking

    const isCorrect = choice === currentItem.action;
    
    if (isCorrect) {
      playCorrectSound();
      setFeedback('correct');
      setScore(s => s + 1);
    } else {
      playWrongSound();
      setFeedback('wrong');
    }

    // Auto advance after short delay
    setTimeout(() => {
      setFeedback(null);
      if (currentIndex < items.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        setIsFinished(true);
      }
    }, 1200);
  };

  const restart = () => {
    setItems([...ITEMS].sort(() => Math.random() - 0.5));
    setCurrentIndex(0);
    setScore(0);
    setFeedback(null);
    setIsFinished(false);
  };

  if (items.length === 0) return null;

  if (isFinished) {
    return (
      <div className="min-h-screen bg-purple-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl max-w-sm w-full border border-purple-100">
            <CheckCircle className="w-16 h-16 md:w-20 md:h-20 text-green-500 mx-auto mb-6" />
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Tebrikler!</h2>
            <p className="text-gray-600 mb-8">Egzersizi tamamladın.</p>
            
            <div className="bg-purple-50 rounded-xl p-4 mb-8">
                <span className="text-purple-400 text-xs font-bold uppercase tracking-wider">SKOR</span>
                <div className="text-4xl md:text-5xl font-black text-purple-600">
                    {score} / {items.length}
                </div>
            </div>

            <div className="flex flex-col gap-3">
            <button
                onClick={restart}
                className="w-full py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition flex items-center justify-center gap-2"
            >
                <RotateCcw className="w-5 h-5" />
                Tekrar Oyna
            </button>
            <button
                onClick={onBack}
                className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition"
            >
                Menüye Dön
            </button>
            </div>
        </div>
      </div>
    );
  }

  const isImageUrl = currentItem.image.startsWith('http');

  return (
    <div className="min-h-screen bg-purple-50 flex flex-col">
      {/* Header */}
      <div className="bg-white p-3 md:p-4 shadow-sm flex items-center justify-between z-10 shrink-0">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
          <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
        </button>
        <div className="flex flex-col items-end">
            <span className="text-[10px] md:text-xs font-bold text-gray-400 uppercase">İlerleme</span>
            <span className="font-bold text-purple-600 text-sm md:text-base">
            {currentIndex + 1} / {items.length}
            </span>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4 max-w-md mx-auto w-full relative overflow-y-auto">
        
        {/* Card */}
        <div className="w-full bg-white rounded-3xl shadow-xl p-6 md:p-8 mb-6 md:mb-8 text-center border-4 border-purple-100 relative overflow-hidden transition-transform duration-300 min-h-[300px] flex flex-col items-center justify-center">
            {/* Feedback Overlay */}
            {feedback && (
                <div className={`absolute inset-0 flex items-center justify-center z-20 backdrop-blur-sm ${feedback === 'correct' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                    {feedback === 'correct' ? (
                        <CheckCircle className="w-24 h-24 md:w-32 md:h-32 text-green-500 animate-bounce-short drop-shadow-lg" />
                    ) : (
                        <XCircle className="w-24 h-24 md:w-32 md:h-32 text-red-500 animate-pulse drop-shadow-lg" />
                    )}
                </div>
            )}

            <div className="w-32 h-32 md:w-40 md:h-40 mb-4 md:mb-6 flex items-center justify-center">
                {isImageUrl ? (
                     <img 
                     src={currentItem.image} 
                     alt={currentItem.romaji} 
                     className="w-full h-full object-contain filter drop-shadow-md"
                   />
                ) : (
                    <div className="text-8xl md:text-9xl filter drop-shadow-md">
                        {currentItem.image}
                    </div>
                )}
            </div>
            
            <h1 className="text-4xl md:text-5xl font-black text-gray-800 mb-1 md:mb-2 tracking-tight">
                {currentItem.romaji}
            </h1>
            <p className="text-lg md:text-xl text-gray-400 font-medium">
                {currentItem.text}
            </p>
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-3 md:gap-4 w-full mt-auto">
            <button
                onClick={() => handleChoice('tabemas')}
                disabled={!!feedback}
                className="group relative bg-white border-b-4 border-purple-200 active:border-b-0 active:translate-y-1 rounded-2xl p-3 md:p-4 flex flex-col items-center justify-center shadow-lg hover:bg-purple-50 transition-all h-28 md:h-32"
            >
                <div className="bg-purple-100 p-2 md:p-3 rounded-full mb-1 md:mb-2 group-hover:scale-110 transition-transform">
                    <Utensils className="w-6 h-6 md:w-8 md:h-8 text-purple-600" />
                </div>
                <span className="text-lg md:text-xl font-bold text-gray-800">Tabemas</span>
                <span className="text-[10px] md:text-xs text-gray-400 mt-0.5 md:mt-1">食べます</span>
            </button>

            <button
                onClick={() => handleChoice('nomimas')}
                disabled={!!feedback}
                className="group relative bg-white border-b-4 border-blue-200 active:border-b-0 active:translate-y-1 rounded-2xl p-3 md:p-4 flex flex-col items-center justify-center shadow-lg hover:bg-blue-50 transition-all h-28 md:h-32"
            >
                 <div className="bg-blue-100 p-2 md:p-3 rounded-full mb-1 md:mb-2 group-hover:scale-110 transition-transform">
                    <Coffee className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />
                </div>
                <span className="text-lg md:text-xl font-bold text-gray-800">Nomimas</span>
                <span className="text-[10px] md:text-xs text-gray-400 mt-0.5 md:mt-1">飲みます</span>
            </button>
        </div>

      </div>
    </div>
  );
};

export default TabemasuMatchModule;
