
import React, { useState } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, Volume2 } from 'lucide-react';

interface VocabCard {
  id: string;
  text: string;     // Japanese
  romaji: string;   // Romaji
  meaning: string;  // Turkish
  image: string;    // Emoji or Image URL
  type: 'noun' | 'verb';
}

const VOCAB_LIST: VocabCard[] = [
  { id: '1', text: 'パン', romaji: 'Pan', meaning: 'Ekmek', image: '🍞', type: 'noun' },
  { id: '2', text: 'すし', romaji: 'Sushi', meaning: 'Suşi', image: '🍣', type: 'noun' },
  { id: '3', text: 'ケーキ', romaji: 'Keeki', meaning: 'Pasta/Kek', image: '🍰', type: 'noun' },
  { id: '4', text: '肉', romaji: 'Niku', meaning: 'Et', image: '🥩', type: 'noun' },
  { id: '5', text: '卵', romaji: 'Tamago', meaning: 'Yumurta', image: '🥚', type: 'noun' },
  { id: '6', text: 'ご飯', romaji: 'Gohan', meaning: 'Pirinç Pilavı / Yemek', image: '🍚', type: 'noun' },
  { id: '7', text: '水', romaji: 'Mizu', meaning: 'Su', image: '💧', type: 'noun' },
  { id: '8', text: 'コーヒー', romaji: 'Koohii', meaning: 'Kahve', image: '☕', type: 'noun' },
  { id: '9', text: 'コーラ', romaji: 'Koora', meaning: 'Kola', image: '🥤', type: 'noun' },
  { 
    id: '10', 
    text: '食べます', 
    romaji: 'Tabemas', 
    meaning: 'Yemek (Fiil)', 
    image: 'https://raw.githubusercontent.com/isenbuqa/staj-dersi-img/refs/heads/main/tabemasu.jpg', 
    type: 'verb' 
  },
  { 
    id: '11', 
    text: '飲みます', 
    romaji: 'Nomimas', 
    meaning: 'İçmek (Fiil)', 
    image: 'https://raw.githubusercontent.com/isenbuqa/staj-dersi-img/refs/heads/main/nomimasu.jpg', 
    type: 'verb' 
  },
];

interface VocabularyModuleProps {
  onBack: () => void;
}

const VocabularyModule: React.FC<VocabularyModuleProps> = ({ onBack }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentCard = VOCAB_LIST[currentIndex];
  const isImageUrl = currentCard.image.startsWith('http');

  const handleNext = () => {
    if (currentIndex < VOCAB_LIST.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  return (
    <div className="min-h-screen bg-orange-50 flex flex-col items-center">
      {/* Header */}
      <div className="w-full bg-white p-4 shadow-sm flex items-center justify-between z-10">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <span className="font-bold text-gray-800">
          Kelime {currentIndex + 1} / {VOCAB_LIST.length}
        </span>
        <div className="w-10"></div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md p-6">
        
        {/* Flashcard */}
        <div className="w-full bg-white rounded-3xl shadow-xl border-4 border-orange-100 overflow-hidden relative mb-8 aspect-[3/4] flex flex-col items-center justify-center p-6 transition-all duration-300 transform hover:shadow-2xl">
           
           {/* Tag */}
           <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide
             ${currentCard.type === 'verb' ? 'bg-rose-100 text-rose-500' : 'bg-orange-100 text-orange-500'}
           `}>
             {currentCard.type === 'verb' ? 'Fiil' : 'İsim'}
           </div>

           {/* Image or Emoji */}
           <div className="w-full h-56 mb-6 flex items-center justify-center">
             {isImageUrl ? (
               <img 
                 src={currentCard.image} 
                 alt={currentCard.romaji} 
                 className="w-full h-full object-contain filter drop-shadow-md"
               />
             ) : (
               <div className="text-9xl filter drop-shadow-md animate-bounce">
                 {currentCard.image}
               </div>
             )}
           </div>

           {/* Primary: Romaji */}
           <h1 className="text-5xl md:text-6xl font-black text-gray-800 mb-2 text-center tracking-tight">
             {currentCard.romaji}
           </h1>

           {/* Secondary: Japanese */}
           <h2 className="text-2xl text-gray-400 font-medium mb-8 text-center">
             {currentCard.text}
           </h2>

           {/* Tertiary: Turkish Meaning */}
           <div className="bg-orange-50 px-6 py-3 rounded-xl border border-orange-100">
             <p className="text-xl font-bold text-orange-600 text-center">
               {currentCard.meaning}
             </p>
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
            disabled={currentIndex === VOCAB_LIST.length - 1}
            className={`
              flex-1 py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2
              transition-all transform active:scale-95
              ${currentIndex === VOCAB_LIST.length - 1 
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                : 'bg-orange-500 text-white hover:bg-orange-600 shadow-orange-200'}
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

export default VocabularyModule;
