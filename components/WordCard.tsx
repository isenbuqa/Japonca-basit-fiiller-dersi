
import React from 'react';
import { WordItem } from '../types';

interface WordCardProps {
  word: WordItem;
  animate: boolean;
}

const WordCard: React.FC<WordCardProps> = ({ word, animate }) => {
  const isImageUrl = word.image.startsWith('http');

  return (
    <div 
      key={word.id}
      className={`
        flex flex-col items-center justify-center
        bg-white rounded-3xl shadow-xl border-4 border-rose-100
        w-full max-w-[18rem] md:max-w-sm aspect-square
        transform transition-all duration-500
        ${animate ? 'scale-100 opacity-100 translate-y-0' : 'scale-90 opacity-0 translate-y-10'}
      `}
    >
      <div className="w-32 h-32 md:w-40 md:h-40 mb-4 flex items-center justify-center">
        {isImageUrl ? (
          <img 
            src={word.image} 
            alt={word.romaji} 
            className="w-full h-full object-contain drop-shadow-md"
          />
        ) : (
          <div className="text-7xl md:text-9xl filter drop-shadow-md">
            {word.image}
          </div>
        )}
      </div>
      
      {/* Primary: Romaji */}
      <div className="text-3xl md:text-5xl font-bold text-gray-800 mb-1 md:mb-2 text-center">
        {word.romaji}
      </div>
      {/* Secondary: Japanese Script */}
      <div className="text-lg md:text-xl text-gray-400 font-medium opacity-80 text-center">
        {word.text}
      </div>
    </div>
  );
};

export default WordCard;
