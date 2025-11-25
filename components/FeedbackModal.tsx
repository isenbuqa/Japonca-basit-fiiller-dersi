
import React from 'react';
import { ValidationResult, WordItem, VerbItem } from '../types';
import { CheckCircle, XCircle, ArrowRight, Loader2 } from 'lucide-react';

interface FeedbackModalProps {
  result: ValidationResult | null;
  word: WordItem;
  verb: VerbItem;
  onNext: () => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ result, word, verb, onNext }) => {
  if (!result) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm md:max-w-md w-full p-6 relative overflow-hidden flex flex-col max-h-[90vh]">
        {/* Decorator Background */}
        <div className={`absolute top-0 left-0 right-0 h-2 ${result.isCorrect ? 'bg-green-500' : 'bg-red-500'}`} />

        <div className="flex flex-col items-center text-center mt-2 flex-1 overflow-y-auto hide-scrollbar">
          {result.isCorrect ? (
            <CheckCircle className="w-12 h-12 md:w-16 md:h-16 text-green-500 mb-3" />
          ) : (
            <XCircle className="w-12 h-12 md:w-16 md:h-16 text-red-500 mb-3" />
          )}

          <h2 className="text-xl md:text-2xl font-bold mb-1">
            {result.isCorrect ? 'Doğru!' : 'Maalesef yanlış...'}
          </h2>
          
          {/* Match Display: Romaji prioritized */}
          <div className="flex items-center justify-center gap-2 text-lg md:text-xl font-medium text-gray-700 my-3 md:my-4 bg-gray-50 px-3 py-2 rounded-lg w-full">
             <span>{word.romaji}</span>
             <ArrowRight className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
             <span className={`${result.isCorrect ? 'text-green-600' : 'text-red-500'} font-bold`}>
               {verb.romaji}
             </span>
          </div>

          <div className="w-full flex flex-col items-center justify-center">
            {result.isLoading ? (
              <div className="flex flex-col items-center gap-2 text-rose-400 py-4">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="text-sm font-medium">Öğretmen cümleyi hazırlıyor...</span>
              </div>
            ) : (
              <>
                <p className="text-gray-600 mb-4 md:mb-6 leading-relaxed text-sm md:text-base">
                  {result.explanation}
                </p>

                <div className="bg-rose-50 rounded-xl p-3 md:p-4 w-full text-left mb-6 border border-rose-100">
                  <p className="text-xs text-rose-400 font-bold uppercase tracking-wider mb-1">Örnek Cümle</p>
                  {/* Romaji Sentence First/Bigger */}
                  <p className="text-base md:text-lg text-gray-800 font-bold mb-1">{result.romajiSentence}</p>
                  {/* Japanese Sentence Second/Smaller */}
                  <p className="text-xs md:text-sm text-gray-500 opacity-75">{result.exampleSentence}</p>
                </div>
              </>
            )}
          </div>
        </div>

        <button
          onClick={onNext}
          className={`
            w-full py-3 px-6 rounded-xl text-white font-bold text-lg shadow-lg mt-auto
            transition-all transform hover:-translate-y-1 active:scale-95
            ${result.isCorrect 
              ? 'bg-gradient-to-r from-green-500 to-emerald-600 shadow-green-200' 
              : 'bg-gradient-to-r from-rose-500 to-red-600 shadow-rose-200'}
          `}
        >
          {result.isCorrect ? 'Sonraki Kelime' : 'Tekrar Dene'}
        </button>
      </div>
    </div>
  );
};

export default FeedbackModal;
