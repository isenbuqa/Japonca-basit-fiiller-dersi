import React from 'react';
import { WordItem } from '../types';

interface WordCardProps {
  word: WordItem;
  animate: boolean;
}

const WordCard: React.FC<WordCardProps> = ({ word, animate }) => {
  return (
    <div 
      key={word.id}
      className={`
        flex flex-col items-center justify-center
        bg-white rounded-3xl shadow-xl border-4 border-rose-100
        w-64 h-64 md:w-80 md:h-80 mx-auto
        transform transition-all duration-500
        ${animate ? 'scale-100 opacity-100 translate-y-0' : 'scale-90 opacity-0 translate-y-10'}
      `}
    >
      <div className="text-8xl md:text-9xl mb-4 filter drop-shadow-md">
        {word.image}
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