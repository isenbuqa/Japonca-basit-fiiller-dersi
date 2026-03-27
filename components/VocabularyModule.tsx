
import React, { useState, useEffect } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, Volume2, Loader2 } from 'lucide-react';
import { supabase } from '../utils/supabase';

interface VocabCard {
  id: string;
  text: string;     // Japanese
  romaji: string;   // Romaji
  meaning: string;  // Turkish
  image: string;    // Emoji or Image URL
  type: 'noun' | 'verb';
}

interface VocabularyModuleProps {
  onBack: () => void;
}

const VocabularyModule: React.FC<VocabularyModuleProps> = ({ onBack }) => {
  const [vocabList, setVocabList] = useState<VocabCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVocab = async () => {
      setIsLoading(true);
      const { data, error } = await supabase.from('vocabulary_items').select('*');
      if (data && !error) {
        // You might want to sort it by id or let it be
        setVocabList(data);
      }
      setIsLoading(false);
    };
    fetchVocab();
  }, []);

  if (isLoading) {
    return (
      <div className="h-full bg-orange-50 flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-orange-500 animate-spin mb-4" />
        <p className="text-orange-500 font-bold">Yükleniyor...</p>
      </div>
    );
  }

  if (vocabList.length === 0) {
     return (
       <div className="h-full bg-orange-50 flex flex-col items-center justify-center p-6 text-center">
         <p className="text-gray-600 mb-4">Henüz hiç kelime eklenmemiş.</p>
         <button onClick={onBack} className="px-6 py-2 bg-orange-500 text-white rounded-full font-bold">Menüye Dön</button>
       </div>
     );
  }

  const currentCard = vocabList[currentIndex];
  const isImageUrl = currentCard.image.startsWith('http');

  const handleNext = () => {
    if (currentIndex < vocabList.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  return (
    <div className="h-full bg-orange-50 flex flex-col items-center">
      {/* Header */}
      <div className="w-full bg-white p-3 md:p-4 shadow-sm flex items-center justify-between z-10 shrink-0">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors">
          <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
        </button>
        <span className="font-bold text-gray-800 text-sm md:text-base">
          Kelime {currentIndex + 1} / {vocabList.length}
        </span>
        <div className="w-8 md:w-10"></div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md p-4 md:p-6 overflow-y-auto">
        
        {/* Flashcard */}
        <div className="w-full bg-white rounded-3xl shadow-xl border-4 border-orange-100 overflow-hidden relative mb-6 md:mb-8 flex flex-col items-center justify-center p-4 md:p-6 transition-all duration-300 transform min-h-[400px]">
           
           {/* Tag */}
           <div className={`absolute top-3 right-3 md:top-4 md:right-4 px-2 py-1 md:px-3 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wide
             ${currentCard.type === 'verb' ? 'bg-rose-100 text-rose-500' : 'bg-orange-100 text-orange-500'}
           `}>
             {currentCard.type === 'verb' ? 'Fiil' : 'İsim'}
           </div>

           {/* Image or Emoji */}
           <div className="w-full h-40 md:h-56 mb-4 md:mb-6 flex items-center justify-center">
             {isImageUrl ? (
               <img 
                 src={currentCard.image} 
                 alt={currentCard.romaji} 
                 className="w-full h-full object-contain filter drop-shadow-md"
               />
             ) : (
               <div className="text-8xl md:text-9xl filter drop-shadow-md animate-bounce">
                 {currentCard.image}
               </div>
             )}
           </div>

           {/* Primary: Romaji */}
           <h1 className="text-4xl md:text-6xl font-black text-gray-800 mb-1 md:mb-2 text-center tracking-tight">
             {currentCard.romaji}
           </h1>

           {/* Secondary: Japanese */}
           <h2 className="text-xl md:text-2xl text-gray-400 font-medium mb-6 md:mb-8 text-center">
             {currentCard.text}
           </h2>

           {/* Tertiary: Turkish Meaning */}
           <div className="bg-orange-50 px-4 py-2 md:px-6 md:py-3 rounded-xl border border-orange-100 w-full">
             <p className="text-lg md:text-xl font-bold text-orange-600 text-center">
               {currentCard.meaning}
             </p>
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
            disabled={currentIndex === vocabList.length - 1}
            className={`
              flex-1 py-3 md:py-4 rounded-xl font-bold text-base md:text-lg shadow-lg flex items-center justify-center gap-2
              transition-all transform active:scale-95
              ${currentIndex === vocabList.length - 1 
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                : 'bg-orange-500 text-white hover:bg-orange-600 shadow-orange-200'}
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

export default VocabularyModule;
