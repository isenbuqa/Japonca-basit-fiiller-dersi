
import React, { useState } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';

interface VerbCard {
  id: string;
  romaji: string;   // Prominent
  hiragana: string; // Secondary (Instead of Kanji)
  meaning: string;  // Turkish
  imageUrl?: string; // Optional: URL for the image
}

const VERBS_LIST: VerbCard[] = [
  {
    id: '1',
    romaji: 'Kikimas',
    hiragana: 'ききます',
    meaning: 'Dinlemek',
    imageUrl: 'https://raw.githubusercontent.com/isenbuqa/staj-dersi-img/refs/heads/main/kikimasu.jpg'
  },
  {
    id: '2',
    romaji: 'Mimas',
    hiragana: 'みます',
    meaning: 'İzlemek / Görmek',
    imageUrl: 'https://raw.githubusercontent.com/isenbuqa/staj-dersi-img/refs/heads/main/mimasu.jpg'
  },
  {
    id: '3',
    romaji: 'Tsukurimas',
    hiragana: 'つくります',
    meaning: 'Yapmak (Yemek vb.)',
    imageUrl: 'https://raw.githubusercontent.com/isenbuqa/staj-dersi-img/refs/heads/main/tsukurimasu.jpg'
  },
  {
    id: '4',
    romaji: 'Yomimas',
    hiragana: 'よみます',
    meaning: 'Okumak',
    imageUrl: 'https://raw.githubusercontent.com/isenbuqa/staj-dersi-img/refs/heads/main/yomimasu.jpg'
  },
  {
    id: '5',
    romaji: 'Kaimas',
    hiragana: 'かいます',
    meaning: 'Satın Almak',
    imageUrl: 'https://raw.githubusercontent.com/isenbuqa/staj-dersi-img/refs/heads/main/kaimasu.jpg'
  },
  {
    id: '6',
    romaji: 'Nemas',
    hiragana: 'ねます',
    meaning: 'Uyumak',
    imageUrl: 'https://raw.githubusercontent.com/isenbuqa/staj-dersi-img/refs/heads/main/nemasu.jpg'
  },
  {
    id: '7',
    romaji: 'Okimas',
    hiragana: 'おきます',
    meaning: 'Uyanmak',
    imageUrl: 'https://raw.githubusercontent.com/isenbuqa/staj-dersi-img/refs/heads/main/okimasu.jpg'
  },
];

interface SimpleVerbsModuleProps {
  onBack: () => void;
}

const SimpleVerbsModule: React.FC<SimpleVerbsModuleProps> = ({ onBack }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentCard = VERBS_LIST[currentIndex];

  const handleNext = () => {
    if (currentIndex < VERBS_LIST.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-indigo-50 flex flex-col items-center">
      {/* Header */}
      <div className="w-full bg-white p-3 md:p-4 shadow-sm flex items-center justify-between z-10 shrink-0">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors">
          <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
        </button>
        <span className="font-bold text-gray-800 text-sm md:text-base">
          Basit Fiiller ({currentIndex + 1} / {VERBS_LIST.length})
        </span>
        <div className="w-8 md:w-10"></div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md p-4 md:p-6 overflow-y-auto">

        {/* Flashcard */}
        <div className="w-full bg-white rounded-3xl shadow-2xl border-4 border-indigo-100 overflow-hidden relative mb-6 md:mb-8 flex flex-col items-center p-4 md:p-6 transition-all duration-300 min-h-[420px]">

          {/* Image Area */}
          <div className="w-full h-40 md:h-56 bg-white rounded-2xl mb-4 md:mb-6 flex items-center justify-center">
            {currentCard.imageUrl ? (
              <img
                src={currentCard.imageUrl}
                alt={currentCard.romaji}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-indigo-200">
                <ImageIcon className="w-12 h-12 md:w-16 md:h-16 mb-2" />
                <span className="text-xs md:text-sm font-medium">Görsel Yok</span>
              </div>
            )}
          </div>

          <div className="flex-1 flex flex-col items-center justify-center w-full">
            {/* Primary: Romaji (Huge) */}
            <h1 className="text-4xl md:text-6xl font-black text-gray-800 mb-2 text-center tracking-tight">
              {currentCard.romaji}
            </h1>

            {/* Secondary: Hiragana */}
            <h2 className="text-2xl md:text-3xl text-indigo-400 font-bold mb-6 md:mb-8 text-center font-jp">
              {currentCard.hiragana}
            </h2>

            {/* Tertiary: Turkish Meaning */}
            <div className="bg-indigo-50 px-6 py-2 md:px-8 md:py-3 rounded-full w-full">
              <p className="text-lg md:text-xl font-bold text-indigo-700 text-center">
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
            disabled={currentIndex === VERBS_LIST.length - 1}
            className={`
              flex-1 py-3 md:py-4 rounded-xl font-bold text-base md:text-lg shadow-lg flex items-center justify-center gap-2
              transition-all transform active:scale-95
              ${currentIndex === VERBS_LIST.length - 1
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200'}
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

export default SimpleVerbsModule;
