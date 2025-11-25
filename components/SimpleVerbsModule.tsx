
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
    imageUrl: 'https://raw.githubusercontent.com/isenbuqa/Japonca-basit-fiiller-dersi/refs/heads/main/public/images/kikimasu.jpg'
  },
  { 
    id: '2', 
    romaji: 'Mimas', 
    hiragana: 'みます', 
    meaning: 'İzlemek / Görmek',
    imageUrl: 'https://raw.githubusercontent.com/isenbuqa/Japonca-basit-fiiller-dersi/refs/heads/main/public/images/mimasu.jpg'
  },
  { 
    id: '3', 
    romaji: 'Tsukurimas', 
    hiragana: 'つくります', 
    meaning: 'Yapmak (Yemek vb.)',
    imageUrl: 'https://raw.githubusercontent.com/isenbuqa/Japonca-basit-fiiller-dersi/refs/heads/main/public/images/tsukurimasu.jpg'
  },
  { 
    id: '4', 
    romaji: 'Yomimas', 
    hiragana: 'よみます', 
    meaning: 'Okumak',
    imageUrl: 'https://raw.githubusercontent.com/isenbuqa/Japonca-basit-fiiller-dersi/refs/heads/main/public/images/yomimasu.jpg'
  },
  { 
    id: '5', 
    romaji: 'Kaimas', 
    hiragana: 'かいます', 
    meaning: 'Satın Almak',
    imageUrl: 'https://raw.githubusercontent.com/isenbuqa/Japonca-basit-fiiller-dersi/refs/heads/main/public/images/kaimasu.jpg'
  },
  { 
    id: '6', 
    romaji: 'Nemas', 
    hiragana: 'ねます', 
    meaning: 'Uyumak',
    imageUrl: 'https://raw.githubusercontent.com/isenbuqa/Japonca-basit-fiiller-dersi/refs/heads/main/public/images/nemasu.jpg'
  },
  { 
    id: '7', 
    romaji: 'Okimas', 
    hiragana: 'おきます', 
    meaning: 'Uyanmak',
    imageUrl: 'https://raw.githubusercontent.com/isenbuqa/Japonca-basit-fiiller-dersi/refs/heads/main/public/images/okimasu.jpg'
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
    <div className="min-h-screen bg-indigo-50 flex flex-col items-center">
      {/* Header */}
      <div className="w-full bg-white p-4 shadow-sm flex items-center justify-between z-10">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <span className="font-bold text-gray-800">
          Basit Fiiller ({currentIndex + 1} / {VERBS_LIST.length})
        </span>
        <div className="w-10"></div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md p-6">
        
        {/* Flashcard */}
        <div className="w-full bg-white rounded-3xl shadow-2xl border-4 border-indigo-100 overflow-hidden relative mb-8 aspect-[3/4] flex flex-col items-center p-6 transition-all duration-300">
           
           {/* Image Area */}
           <div className="w-full h-56 bg-white rounded-2xl mb-6 flex items-center justify-center">
             {currentCard.imageUrl ? (
               <img 
                 src={currentCard.imageUrl} 
                 alt={currentCard.romaji} 
                 className="w-full h-full object-contain" 
               />
             ) : (
               <div className="flex flex-col items-center justify-center text-indigo-200">
                 <ImageIcon className="w-16 h-16 mb-2" />
                 <span className="text-sm font-medium">Görsel Yok</span>
               </div>
             )}
           </div>

           <div className="flex-1 flex flex-col items-center justify-center w-full">
             {/* Primary: Romaji (Huge) */}
             <h1 className="text-5xl md:text-6xl font-black text-gray-800 mb-2 text-center tracking-tight">
               {currentCard.romaji}
             </h1>

             {/* Secondary: Hiragana */}
             <h2 className="text-3xl text-indigo-400 font-bold mb-8 text-center font-jp">
               {currentCard.hiragana}
             </h2>

             {/* Tertiary: Turkish Meaning */}
             <div className="bg-indigo-50 px-8 py-3 rounded-full">
               <p className="text-xl font-bold text-indigo-700 text-center">
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
            disabled={currentIndex === VERBS_LIST.length - 1}
            className={`
              flex-1 py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2
              transition-all transform active:scale-95
              ${currentIndex === VERBS_LIST.length - 1 
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200'}
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

export default SimpleVerbsModule;
