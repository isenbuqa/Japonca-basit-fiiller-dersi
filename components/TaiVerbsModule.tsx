import React, { useState, useEffect } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { supabase } from '../utils/supabase';

interface TaiVerb {
  id: string;
  text: string;     // Japanese
  romaji: string;   // Romaji
  meaning: string;  // Turkish
  image: string;    // Image Source URL or Emoji
  theme: string;    // CSS Classes for background
  text_color: string;
}

interface TaiVerbsModuleProps {
  onBack: () => void;
}

const TaiVerbsModule: React.FC<TaiVerbsModuleProps> = ({ onBack }) => {
  const [verbs, setVerbs] = useState<TaiVerb[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVerbs = async () => {
      setIsLoading(true);
      const { data, error } = await supabase.from('tai_verbs').select('*').eq('is_visible', true);
      if (data && !error) {
        setVerbs(data);
      }
      setIsLoading(false);
    };
    fetchVerbs();
  }, []);

  if (isLoading) {
    return (
      <div className="h-full bg-pink-50 flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-pink-500 animate-spin mb-4" />
        <p className="text-pink-500 font-bold">Yükleniyor...</p>
      </div>
    );
  }

  if (verbs.length === 0) {
     return (
       <div className="h-full bg-pink-50 flex flex-col items-center justify-center p-6 text-center">
         <p className="text-gray-600 mb-4">Henüz hiç fiil eklenmemiş.</p>
         <button onClick={onBack} className="px-6 py-2 bg-pink-500 text-white rounded-full font-bold">Menüye Dön</button>
       </div>
     );
  }

  const currentCard = verbs[currentIndex];
  const isImageLink = currentCard.image.startsWith('http');

  const handleNext = () => {
    if (currentIndex < verbs.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  return (
    <div className="h-full bg-pink-50 flex flex-col items-center">
      {/* Header */}
      <div className="w-full bg-white p-3 md:p-4 shadow-sm flex items-center justify-between z-10 shrink-0">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors">
          <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
        </button>
        <span className="font-bold text-gray-800 text-sm md:text-base">
          İstemek (-tai) Fiilleri ({currentIndex + 1} / {verbs.length})
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
           <div className="w-40 h-40 md:w-64 md:h-64 mb-6 md:mb-8 rounded-full overflow-hidden border-4 border-white/50 shadow-2xl relative group bg-white/20 flex items-center justify-center text-7xl md:text-9xl">
             {isImageLink ? (
               <img 
                 src={currentCard.image} 
                 alt={currentCard.romaji}
                 className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
               />
             ) : (
               <span>{currentCard.image}</span>
             )}
             {/* Shine effect */}
             <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent pointer-events-none"></div>
           </div>

           <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 md:p-6 w-full text-center shadow-lg border-2 border-white/60">
                {/* Primary: Japanese Text (Huge) */}
                <h1 className={`text-5xl md:text-6xl font-black mb-2 md:mb-3 tracking-tight ${currentCard.text_color}`}>
                    {currentCard.text}
                </h1>

                {/* Secondary: Romaji */}
                <h2 className="text-xl md:text-2xl text-gray-500 font-bold mb-4 md:mb-6 uppercase tracking-widest">
                    {currentCard.romaji}
                </h2>

                {/* Tertiary: Turkish Meaning */}
                <div className="border-t-2 border-gray-100 pt-3 md:pt-4">
                    <p className="text-xl md:text-2xl font-bold text-gray-800">
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
            disabled={currentIndex === verbs.length - 1}
            className={`
              flex-1 py-3 md:py-4 rounded-xl font-bold text-base md:text-lg shadow-lg flex items-center justify-center gap-2
              transition-all transform active:scale-95
              ${currentIndex === verbs.length - 1 
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                : 'bg-pink-600 text-white hover:bg-pink-700 shadow-pink-200'}
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

export default TaiVerbsModule;
