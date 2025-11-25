
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
        w-64 h-64 md:w-80 md:h-80 mx-auto
        transform transition-all duration-500
        ${animate ? 'scale-100 opacity-100 translate-y-0' : 'scale-90 opacity-0 translate-y-10'}
        overflow-hidden
      `}
    >
      <div className="w-full h-40 md:h-48 mb-4 flex items-center justify-center px-4">
        {isImageUrl ? (
          <img 
            src={word.image} 
            alt={word.romaji} 
            className="w-full h-full object-contain filter drop-shadow-md"
          />
        ) : (
          <div className="text-8xl md:text-9xl filter drop-shadow-md">
            {word.image}
          </div>
        )}
      </div>
      
      {/* Primary: Romaji */}
      <div className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">
        {word.romaji}
      </div>
      {/* Secondary: Japanese Script */}
      <div className="text-xl text-gray-400 font-medium opacity-80">
        {word.text}
      </div>
    </div>
  );
};

export default WordCard;
