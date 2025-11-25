import React from 'react';
import { VerbItem } from '../types';

interface VerbGridProps {
  verbs: VerbItem[];
  onSelect: (verb: VerbItem) => void;
  disabled: boolean;
}

const VerbGrid: React.FC<VerbGridProps> = ({ verbs, onSelect, disabled }) => {
  return (
    <div className="grid grid-cols-3 gap-3 md:gap-4 p-4 max-w-2xl mx-auto w-full pb-8">
      {verbs.map((verb) => (
        <button
          key={verb.id}
          onClick={() => onSelect(verb)}
          disabled={disabled}
          className={`
            relative group
            flex flex-col items-center justify-center
            bg-white border-2 border-rose-200 
            rounded-xl py-4 px-2 shadow-sm
            transition-all duration-200
            hover:border-rose-400 hover:shadow-md hover:-translate-y-1
            active:bg-rose-50 active:scale-95
            disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
          `}
        >
          {/* Primary: Romaji */}
          <span className="text-lg md:text-xl font-bold text-gray-800 leading-tight">
            {verb.romaji}
          </span>
          {/* Secondary: Japanese Script */}
          <span className="text-xs text-gray-400 mt-1 font-medium opacity-70">
            {verb.text}
          </span>
        </button>
      ))}
    </div>
  );
};

export default VerbGrid;