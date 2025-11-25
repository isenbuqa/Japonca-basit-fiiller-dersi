
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
    // Using high-quality Unsplash image for Sunrise
    imageUrl: 'https://raw.githubusercontent.com/isenbuqa/staj-dersi-img/refs/heads/main/asa.jpg', 
    theme: 'bg-gradient-to-br from-orange-300 to-rose-400',
    textColor: 'text-orange-900'
  },
  { 
    id: '2', 
    text: 'ひる', 
    romaji: 'Hiru', 
    meaning: 'Öğle', 
    // Updated to a more reliable Unsplash image for Sunny Sky/Noon
    imageUrl: 'https://raw.githubusercontent.com/isenbuqa/staj-dersi-img/refs/heads/main/hiru.jpg', 
    theme: 'bg-gradient-to-br from-sky-300 to-blue-400',
    textColor: 'text-blue-900'
  },
  { 
    id: '3', 
    text: 'よる', 
    romaji: 'Yoru', 
    meaning: 'Akşam / Gece', 
    // Using high-quality Unsplash image for Moon/Night
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
    <div className="min-h-screen bg-yellow-50 flex flex-col items-center">
      {/* Header */}
      <div className="w-full bg-white p-4 shadow-sm flex items-center justify-between z-10">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <span className="font-bold text-gray-800">
          Zaman Kelimeleri
        </span>
        <div className="w-10"></div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md p-6">
        
        {/* Flashcard */}
        <div className={`
            w-full rounded-3xl shadow-xl overflow-hidden relative mb-8 aspect-[3/4] 
            flex flex-col items-center justify-center p-6 
            transition-all duration-500 transform
            ${currentCard.theme}
        `}>
           
           {/* Image Container */}
           <div className="w-64 h-64 mb-8 rounded-full overflow-hidden border-4 border-white/50 shadow-2xl relative group bg-white/20">
             <img 
               src={currentCard.imageUrl} 
               alt={currentCard.romaji}
               className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
             />
             {/* Shine effect */}
             <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent pointer-events-none"></div>
           </div>

           <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 w-full text-center shadow-lg">
                {/* Primary: Romaji */}
                <h1 className="text-6xl font-black text-gray-800 mb-2 tracking-tight">
                    {currentCard.romaji}
                </h1>

                {/* Secondary: Japanese */}
                <h2 className="text-3xl text-gray-400 font-medium mb-6">
                    {currentCard.text}
                </h2>

                {/* Tertiary: Turkish Meaning */}
                <div className="border-t-2 border-gray-100 pt-4">
                    <p className="text-2xl font-bold text-gray-600">
                    {currentCard.meaning}
                    </p>
                </div>
           </div>
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center gap-4 w-full">
          <button 
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className={`
              flex-1 py-4 rounded-xl font-bold text-lg shadow-md flex items-center justify-center gap-2
              transition-all transform active:scale-95
              ${currentIndex === 0 
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'}
            `}
          >
            <ChevronLeft className="w-6 h-6" />
            Geri
          </button>

          <button 
            onClick={handleNext}
            disabled={currentIndex === TIME_WORDS.length - 1}
            className={`
              flex-1 py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2
              transition-all transform active:scale-95
              ${currentIndex === TIME_WORDS.length - 1 
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                : 'bg-yellow-500 text-white hover:bg-yellow-600 shadow-yellow-200'}
            `}
          >
            İleri
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

      </div>
    </div>
  );
};

export default TimeWordsModule;
