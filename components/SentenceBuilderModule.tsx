import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { Loader2, ArrowLeft, CheckCircle, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { playCorrectSound, playWrongSound } from '../utils/sound';

interface WordData {
  romaji: string;
  hiragana: string;
}

interface SentenceData {
  id: string;
  turkish_meaning: string;
  correct_words: WordData[];
  distractors: WordData[];
}

interface WordTile {
  id: string;
  romaji: string;
  hiragana: string;
  slotIndex: number | null; // null if in the bottom pool, otherwise the index of the slot it occupies
}

interface SentenceBuilderModuleProps {
  onBack: () => void;
}

const SentenceBuilderModule: React.FC<SentenceBuilderModuleProps> = ({ onBack }) => {
  const [sentences, setSentences] = useState<SentenceData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  // Game State
  const [wordTiles, setWordTiles] = useState<WordTile[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  useEffect(() => {
    const fetchSentences = async () => {
      setIsLoading(true);
      const { data, error } = await supabase.from('sentences').select('*');
      if (data && !error) {
         // Shuffle sentences
        setSentences(data.sort(() => Math.random() - 0.5));
      }
      setIsLoading(false);
    };
    fetchSentences();
  }, []);

  // Initialize game board when current sentence changes
  useEffect(() => {
    if (sentences.length === 0 || currentIndex >= sentences.length) return;
    
    const current = sentences[currentIndex];
    
    // Combine correct words and distractors and create tiles
    const allWords = [...current.correct_words, ...current.distractors];
    
    // Shuffle all words
    const shuffled = allWords.sort(() => Math.random() - 0.5);
    
    const tiles: WordTile[] = shuffled.map((word) => ({
      id: crypto.randomUUID(),
      romaji: word.romaji,
      hiragana: word.hiragana,
      slotIndex: null
    }));
    
    setWordTiles(tiles);
    setIsCorrect(null);
    setIsChecking(false);
  }, [currentIndex, sentences]);

  if (isLoading) {
    return (
      <div className="h-full bg-orange-50 flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-orange-500 animate-spin mb-4" />
        <p className="text-orange-500 font-bold">Cümleler Yükleniyor...</p>
      </div>
    );
  }

  if (sentences.length === 0) {
     return (
       <div className="h-full bg-orange-50 flex flex-col items-center justify-center p-6 text-center">
         <p className="text-gray-600 mb-4 font-medium">Henüz hiç cümle eklenmemiş.</p>
         <button onClick={onBack} className="px-6 py-3 bg-orange-500 text-white rounded-full font-bold shadow-lg">Menüye Dön</button>
       </div>
     );
  }

  if (currentIndex >= sentences.length) {
      return (
         <div className="h-full bg-orange-50 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
           <CheckCircle className="w-24 h-24 text-green-500 mb-6" />
           <h2 className="text-3xl font-black text-gray-800 mb-4">Tebrikler!</h2>
           <p className="text-gray-600 mb-8 font-medium">Tüm cümleleri başarıyla kurdun.</p>
           <button onClick={onBack} className="px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-full font-bold text-lg shadow-xl transition-all transform hover:scale-105 active:scale-95">
              Ana Menüye Dön
           </button>
         </div>
      );
  }

  const currentSentence = sentences[currentIndex];
  const requiredSlotsCount = currentSentence.correct_words.length;

  const handleTileClick = (tile: WordTile) => {
    if (isChecking || isCorrect) return; // Disable interaction during check/success

    if (tile.slotIndex === null) {
      // Move from pool to the first available slot
      const occupiedSlots = wordTiles.filter(t => t.slotIndex !== null).map(t => t.slotIndex as number);
      let targetSlot = -1;
      
      for (let i = 0; i < requiredSlotsCount; i++) {
        if (!occupiedSlots.includes(i)) {
          targetSlot = i;
          break;
        }
      }

      if (targetSlot !== -1) {
        setWordTiles(prev => prev.map(t => t.id === tile.id ? { ...t, slotIndex: targetSlot } : t));
      }
    } else {
      // Move from slot back to pool
      setWordTiles(prev => prev.map(t => t.id === tile.id ? { ...t, slotIndex: null } : t));
    }
  };

  const handleClearSlots = () => {
     setWordTiles(prev => prev.map(t => ({ ...t, slotIndex: null })));
     setIsCorrect(null);
  };

  const checkAnswer = () => {
    setIsChecking(true);
    
    // Get tiles currently in slots, sorted by slotIndex
    const filledTiles = wordTiles
      .filter(t => t.slotIndex !== null)
      .sort((a, b) => (a.slotIndex as number) - (b.slotIndex as number));
    
    // Check if lengths match and every word matches in order
    const isWin = filledTiles.length === requiredSlotsCount && 
                  filledTiles.every((t, i) => t.romaji === currentSentence.correct_words[i].romaji);

    if (isWin) {
      playCorrectSound();
      setIsCorrect(true);
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
      }, 1500);
    } else {
      playWrongSound();
      setIsCorrect(false);
      
      // Keep them red for a moment, then optionally return wrong ones to pool
      setTimeout(() => {
         setIsCorrect(null);
         setIsChecking(false);
         // Find which ones are in wrong positions and kick them out
         setWordTiles(prev => prev.map(t => {
            if (t.slotIndex !== null) {
               // If it's the wrong text for this specific slot index, return it to pool
               if (t.romaji !== currentSentence.correct_words[t.slotIndex].romaji) {
                  return { ...t, slotIndex: null };
               }
            }
            return t;
         }));
      }, 1000);
    }
  };

  const handleSkip = () => {
    setCurrentIndex(prev => prev + 1);
  };

  const handlePrevious = () => {
    setCurrentIndex(prev => Math.max(0, prev - 1));
  };

  // Check if all slots are filled to enable the Check button
  const filledCount = wordTiles.filter(t => t.slotIndex !== null).length;
  const isBoardFull = filledCount === requiredSlotsCount;

  return (
    <div className="h-full bg-orange-50 flex flex-col relative overflow-hidden">
      {/* Header */}
      <div className="w-full bg-white p-3 md:p-4 shadow-sm flex items-center justify-between z-10 shrink-0">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors">
          <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
        </button>
        <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-500 text-sm md:text-base">
          Cümle Kurma ({currentIndex + 1} / {sentences.length})
        </span>
        <div className="w-8 md:w-10"></div>
      </div>

      {/* Main Game Area */}
      <div className="flex-1 flex flex-col p-4 md:p-6 pb-24 md:pb-32 overflow-y-auto">
        
        {/* Meaning Card */}
        <div className="bg-white rounded-3xl shadow-lg border-2 border-orange-100 p-6 md:p-8 text-center mb-8 relative z-10">
           <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-orange-500 text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider shadow-sm">
             Hedef Anlam
           </div>
           <h2 className="text-2xl md:text-3xl font-black text-gray-800 tracking-tight leading-tight">
             "{currentSentence.turkish_meaning}"
           </h2>
        </div>

        {/* Drop Slots Area */}
        <div className="bg-orange-100/50 rounded-3xl p-6 min-h-[160px] flex flex-wrap content-start items-center justify-center gap-3 border-2 border-dashed border-orange-300 relative">
          {Array.from({ length: requiredSlotsCount }).map((_, index) => {
             // Find tile in this slot
             const tileInSlot = wordTiles.find(t => t.slotIndex === index);
             
             let tileClasses = "bg-white border-2 border-orange-200 text-orange-900 shadow-md flex flex-col items-center justify-center py-2 px-6 rounded-2xl cursor-pointer hover:border-orange-400 transform hover:-translate-y-1 transition-all";
             
             if (isCorrect === true) {
                tileClasses = "bg-green-500 border-2 border-green-600 text-white flex flex-col items-center justify-center py-2 px-6 rounded-2xl shadow-lg transform scale-105 transition-all";
             } else if (isCorrect === false && tileInSlot) {
                // If it's wrong, make it red and shake
                tileClasses = "bg-red-500 border-2 border-red-600 text-white flex flex-col items-center justify-center py-2 px-6 rounded-2xl shadow-lg animate-shake transition-all";
             }

             return (
               <div 
                 key={index} 
                 className={`
                    min-w-[90px] h-[70px] md:h-[80px] flex items-center justify-center 
                    ${!tileInSlot ? 'border-b-4 border-orange-300' : ''} 
                 `}
               >
                 {tileInSlot ? (
                    <button 
                       onClick={() => handleTileClick(tileInSlot)}
                       className={tileClasses}
                    >
                       <span className={`text-xl md:text-2xl font-black ${isCorrect === null ? "text-gray-800" : "text-white"}`}>{tileInSlot.romaji}</span>
                       <span className={`text-sm md:text-base font-medium opacity-80 ${isCorrect === null ? "text-gray-500" : "text-white/80"}`}>{tileInSlot.hiragana}</span>
                    </button>
                 ) : (
                    <span className="text-orange-300 font-bold opacity-50">_____</span>
                 )}
               </div>
             );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-center mt-8 gap-4 w-full">
           <button 
             onClick={handlePrevious}
             disabled={currentIndex === 0 || isChecking || !!isCorrect}
             className="flex items-center gap-1 px-4 py-3 rounded-2xl font-bold text-orange-600 bg-orange-100 hover:bg-orange-200 active:scale-95 transition-all disabled:opacity-30 disabled:active:scale-100 w-full sm:w-auto justify-center"
           >
             <ChevronLeft className="w-5 h-5" /> Önceki
           </button>

           <div className="flex justify-center gap-2 sm:gap-4 w-full sm:w-auto">
             <button 
               onClick={handleClearSlots}
               disabled={filledCount === 0 || isChecking || !!isCorrect}
               className="flex items-center justify-center gap-2 px-4 sm:px-6 py-3 rounded-2xl font-bold bg-white text-gray-700 border-2 border-gray-200 hover:bg-gray-50 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100 flex-1 sm:flex-none"
             >
               <RotateCcw className="w-5 h-5" /> Temizle
             </button>
             
             <button 
               onClick={checkAnswer}
               disabled={!isBoardFull || isChecking || !!isCorrect}
               className={`
                 flex items-center justify-center gap-2 px-6 sm:px-8 py-3 rounded-2xl font-black text-white shadow-xl
                 transition-all transform active:scale-95 disabled:opacity-50 disabled:active:scale-100 disabled:shadow-none flex-1 sm:flex-none
                 ${isBoardFull ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 scale-105' : 'bg-gray-400'}
               `}
             >
               <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" /> KONTROL ET
             </button>
           </div>

           <button 
             onClick={handleSkip}
             disabled={isChecking || !!isCorrect}
             className="flex items-center gap-1 px-4 py-3 rounded-2xl font-bold text-orange-600 bg-orange-100 hover:bg-orange-200 active:scale-95 transition-all disabled:opacity-30 disabled:active:scale-100 w-full sm:w-auto justify-center"
           >
             Atla <ChevronRight className="w-5 h-5" />
           </button>
        </div>

      </div>

      {/* Word Pool Area (Fixed at bottom) */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t-2 border-orange-100 shadow-[0_-10px_40px_-15px_rgba(249,115,22,0.3)] z-20 rounded-t-3xl p-4 md:p-6">
         <div className="max-w-4xl mx-auto">
            <h3 className="text-xs md:text-sm font-bold text-orange-400 uppercase tracking-wider mb-4 text-center">
               Kelimeleri Seçerek Cümleyi Kur
            </h3>
            <div className="flex flex-wrap justify-center gap-2 md:gap-3 max-h-[30vh] overflow-y-auto pb-2">
               {wordTiles.filter(t => t.slotIndex === null).map((tile) => (
                  <button 
                     key={tile.id}
                     onClick={() => handleTileClick(tile)}
                     disabled={isBoardFull || isChecking || !!isCorrect}
                     className="bg-orange-50 border-2 border-orange-200 hover:bg-orange-100 hover:border-orange-400 hover:shadow-md flex flex-col items-center justify-center py-2 px-5 rounded-2xl transition-all transform active:scale-95 disabled:opacity-40 disabled:hover:scale-100 disabled:cursor-not-allowed"
                  >
                     <span className="text-xl font-black text-gray-800">{tile.romaji}</span>
                     <span className="text-sm font-medium text-gray-500">{tile.hiragana}</span>
                  </button>
               ))}
            </div>
         </div>
      </div>
      
    </div>
  );
};

export default SentenceBuilderModule;
