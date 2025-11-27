
import React, { useState } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';

interface TimeWord {
  id: string;
  text: string;     // Japanese
  romaji: string;   // Romaji
  meaning: string;  // Turkish
  imageUrl: string; // Image Source URL
  theme: string;    // CSS Classes for background
  textColor: string;
}

const TIME_WORDS: TimeWord[] = [
  {
    id: '1',
    text: 'あさ',
    romaji: 'Asa',
    meaning: 'Sabah',
    imageUrl: 'https://raw.githubusercontent.com/isenbuqa/staj-dersi-img/refs/heads/main/asa.jpg',
    theme: 'bg-gradient-to-br from-orange-300 to-rose-400',
    textColor: 'text-orange-900'
  },
  {
    id: '2',
    text: 'ひる',
    romaji: 'Hiru',
    meaning: 'Öğle',
    imageUrl: 'https://raw.githubusercontent.com/isenbuqa/staj-dersi-img/refs/heads/main/hiru.jpg',
    theme: 'bg-gradient-to-br from-sky-300 to-blue-400',
    textColor: 'text-blue-900'
  },
  {
    id: '3',
    text: 'よる',
    romaji: 'Yoru',
    meaning: 'Akşam / Gece',
    imageUrl: 'https://raw.githubusercontent.com/isenbuqa/staj-dersi-img/refs/heads/main/yoru.jpg',
    theme: 'bg-gradient-to-br from-indigo-500 to-purple-800',
    textColor: 'text-white'
  }
];

interface TimeWordsModuleProps {
  onBack: () => void;
}

const TimeWordsModule: React.FC<TimeWordsModuleProps> = ({ onBack }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentCard = TIME_WORDS[currentIndex];

  const handleNext = () => {
    if (currentIndex < TIME_WORDS.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  return (
    <div className="h-full bg-yellow-50 flex flex-col items-center overflow-y-auto">
      {/* Header */}
      <div className="w-full bg-white p-3 md:p-4 shadow-sm flex items-center justify-between z-10 shrink-0">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors">
          <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
        </button>
        <span className="font-bold text-gray-800 text-sm md:text-base">
          Zaman Kelimeleri
        </span>
        <div className="w-8 md:w-10"></div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md p-4 md:p-6 overflow-y-auto">

        {/* Flashcard */}
        <div className={`
            w-full rounded-3xl shadow-xl overflow-hidden relative mb-6 md:mb-8 
            flex flex-col items-center justify-center p-4 md:p-6 
            transition-all duration-500 transform min-h-[400px]
            ${currentCard.theme}
        `}>

          {/* Image Container */}
          <div className="w-40 h-40 md:w-64 md:h-64 mb-6 md:mb-8 rounded-full overflow-hidden border-4 border-white/50 shadow-2xl relative group bg-white/20">
            <img
              src={currentCard.imageUrl}
              alt={currentCard.romaji}
              className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
            />
            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent pointer-events-none"></div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 md:p-6 w-full text-center shadow-lg">
            {/* Primary: Romaji */}
            <h1 className="text-4xl md:text-6xl font-black text-gray-800 mb-1 md:mb-2 tracking-tight">
              {currentCard.romaji}
            </h1>

            {/* Secondary: Japanese */}
            <h2 className="text-2xl md:text-3xl text-gray-400 font-medium mb-4 md:mb-6">
              {currentCard.text}
            </h2>

            {/* Tertiary: Turkish Meaning */}
            <div className="border-t-2 border-gray-100 pt-3 md:pt-4">
              <p className="text-xl md:text-2xl font-bold text-gray-600">
                {currentCard.meaning}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center gap-3 md:gap-4 w-full mt-auto pb-4">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className={`
              flex-1 py-3 md:py-4 rounded-xl font-bold text-base md:text-lg shadow-md flex items-center justify-center gap-2
              transition-all transform active:scale-95
              ${currentIndex === 0
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'}
            `}
          >
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
            Geri
          </button>

          <button
            onClick={handleNext}
            disabled={currentIndex === TIME_WORDS.length - 1}
            className={`
              flex-1 py-3 md:py-4 rounded-xl font-bold text-base md:text-lg shadow-lg flex items-center justify-center gap-2
              transition-all transform active:scale-95
              ${currentIndex === TIME_WORDS.length - 1
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-yellow-500 text-white hover:bg-yellow-600 shadow-yellow-200'}
            `}
          >
            İleri
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>

      </div>
    </div>
  );
};

export default TimeWordsModule;
