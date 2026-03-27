
import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, XCircle, ArrowRight, BookOpen, Loader2 } from 'lucide-react';
import { playCorrectSound, playWrongSound } from '../utils/sound';
import { supabase } from '../utils/supabase';

interface Question {
  id: string;
  type: 'vocab' | 'demo' | 'matching'; // vocabulary, demonstrative, or matching
  romajiQuestion: string;
  japaneseQuestion: string;
  turkishMeaning: string;
  image?: React.ReactNode | string;
  correctAnswer?: string;
  options?: { text: string; romaji: string }[];
  pairs?: { left: string; right: string }[]; // For matching type
}

interface ReviewModuleProps {
  onBack: () => void;
}

const ReviewModule: React.FC<ReviewModuleProps> = ({ onBack }) => {
  const [selectedTerm, setSelectedTerm] = useState<1 | 2 | null>(null);
  const [termQuestions, setTermQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isFinished, setIsFinished] = useState(false);

  // Fetch questions when term is selected
  useEffect(() => {
    if (selectedTerm === null) return;
    const fetchQuestions = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('review_questions')
        .select('*')
        .eq('term', selectedTerm);
        
      if (data && !error) {
        // Map database fields to application state
        const mappedData: Question[] = data.map(dbq => ({
          id: dbq.id,
          type: dbq.type as 'vocab' | 'demo' | 'matching',
          romajiQuestion: dbq.romaji_question,
          japaneseQuestion: dbq.japanese_question,
          turkishMeaning: dbq.turkish_meaning,
          image: dbq.image,
          correctAnswer: dbq.correct_answer,
          options: dbq.options as any,
          pairs: dbq.pairs as any,
        }));
        setTermQuestions(mappedData.sort(() => Math.random() - 0.5));
      }
      setIsLoading(false);
    };
    fetchQuestions();
  }, [selectedTerm]);

  // Matching game state
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);
  const [matchingFeedback, setMatchingFeedback] = useState<'correct' | 'wrong' | null>(null);

  const currentQuestions = termQuestions;
  const currentQuestion = currentQuestions[currentIndex];

  // Randomize pairs on mount or when question changes
  const [shuffledLeft, setShuffledLeft] = useState<string[]>([]);
  const [shuffledRight, setShuffledRight] = useState<string[]>([]);

  React.useEffect(() => {
    if (currentQuestion?.type === 'matching' && currentQuestion.pairs) {
      setShuffledLeft([...currentQuestion.pairs.map(p => p.left)].sort(() => Math.random() - 0.5));
      setShuffledRight([...currentQuestion.pairs.map(p => p.right)].sort(() => Math.random() - 0.5));
      setMatchedPairs([]);
      setSelectedLeft(null);
      setSelectedRight(null);
      setMatchingFeedback(null);
    }
  }, [currentQuestion]);

  const handleOptionSelect = (text: string) => {
    if (selectedOption) return; // Prevent double click

    setSelectedOption(text);
    const correct = text === currentQuestion.correctAnswer;
    setIsCorrect(correct);

    if (correct) {
      playCorrectSound();
    } else {
      playWrongSound();
    }
  };

  const handleMatchSelect = (side: 'left' | 'right', value: string) => {
    if (matchingFeedback) return; // Prevent clicking while animating feedback

    if (side === 'left') {
      if (selectedLeft === value) setSelectedLeft(null);
      else setSelectedLeft(value);
    } else {
      if (selectedRight === value) setSelectedRight(null);
      else setSelectedRight(value);
    }
  };

  React.useEffect(() => {
    if (selectedLeft && selectedRight && currentQuestion?.type === 'matching') {
      const isMatch = currentQuestion.pairs?.some(p => p.left === selectedLeft && p.right === selectedRight);
      
      if (isMatch) {
        playCorrectSound();
        setMatchingFeedback('correct');
        setTimeout(() => {
          setMatchedPairs(prev => [...prev, selectedLeft]);
          setSelectedLeft(null);
          setSelectedRight(null);
          setMatchingFeedback(null);
          
          // Check if all matched
          if (matchedPairs.length + 1 === currentQuestion.pairs?.length) {
             setTimeout(() => {
                handleNext();
             }, 1000);
          }
        }, 500);
      } else {
        playWrongSound();
        setMatchingFeedback('wrong');
        setTimeout(() => {
          setSelectedLeft(null);
          setSelectedRight(null);
          setMatchingFeedback(null);
        }, 800);
      }
    }
  }, [selectedLeft, selectedRight, currentQuestion, matchedPairs]);

  const handleNext = () => {
    if (currentIndex < currentQuestions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsCorrect(null);
      setMatchedPairs([]);
    } else {
      setIsFinished(true);
    }
  };

  if (selectedTerm === null) {
    return (
      <div className="h-full bg-blue-50 flex flex-col">
        {/* Header */}
        <div className="bg-white p-3 md:p-4 shadow-sm flex items-center justify-between z-10 relative">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-5 h-5 md:w-6 md:h-6 text-gray-600" />
          </button>
          <span className="font-bold text-gray-700 text-sm md:text-base">
            Konu Tekrarı
          </span>
          <div className="w-10"></div> {/* Spacer */}
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-4 max-w-md mx-auto w-full">
          <div className="bg-white rounded-3xl shadow-xl w-full p-6 md:p-8 text-center border-4 border-blue-100">
            <BookOpen className="w-16 h-16 md:w-20 md:h-20 text-blue-500 mx-auto mb-6" />
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Hangi Dönem?</h2>
            <p className="text-gray-600 mb-8">Tekrar etmek istediğin dönemi seç.</p>
            
            <div className="flex flex-col gap-4">
              <button
                onClick={() => setSelectedTerm(1)}
                className="w-full py-4 bg-blue-100 text-blue-700 rounded-2xl font-bold text-lg hover:bg-blue-200 transition shadow-sm border-2 border-blue-200 hover:border-blue-300"
              >
                1. Dönem Tekrarı
              </button>
              <button
                onClick={() => setSelectedTerm(2)}
                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg hover:bg-blue-700 transition shadow-md"
              >
                2. Dönem Tekrarı
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="h-full bg-blue-50 flex flex-col items-center justify-center p-6 text-center">
        <CheckCircle className="w-20 h-20 md:w-24 md:h-24 text-green-500 mb-6" />
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">Tebrikler!</h2>
        <p className="text-gray-600 mb-8">{selectedTerm}. Dönem konu tekrarını tamamladın.</p>
        <div className="flex flex-col md:flex-row gap-4 w-full max-w-xs md:max-w-md mx-auto">
          <button
            onClick={() => {
              setCurrentIndex(0);
              setSelectedOption(null);
              setIsCorrect(null);
              setIsFinished(false);
              setMatchedPairs([]);
            }}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 transition"
          >
            Tekrar Yap
          </button>
          <button
            onClick={() => {
              setSelectedTerm(null);
              setCurrentIndex(0);
              setSelectedOption(null);
              setIsCorrect(null);
              setIsFinished(false);
              setMatchedPairs([]);
            }}
            className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-full font-bold hover:bg-gray-300 transition"
          >
            Dönem Seç
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-full bg-blue-50 flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
        <p className="text-blue-500 font-bold">Yükleniyor...</p>
      </div>
    );
  }

  if (!currentQuestion) {
     return (
       <div className="h-full bg-blue-50 flex flex-col items-center justify-center p-6 text-center">
         <p className="text-gray-600 mb-4">Bu dönem için henüz soru eklenmemiş.</p>
         <button onClick={() => setSelectedTerm(null)} className="px-6 py-2 bg-blue-600 text-white rounded-full font-bold">Geri Dön</button>
       </div>
     );
  }

  // Render question image appropriately (whether it's an emoji or a URL)
  const isImageLink = typeof currentQuestion.image === 'string' && currentQuestion.image.startsWith('http');

  return (
    <div className="h-full bg-blue-50 flex flex-col">
      {/* Header */}
      <div className="bg-white p-3 md:p-4 shadow-sm flex items-center justify-between z-10 relative">
        <button onClick={() => setSelectedTerm(null)} className="p-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft className="w-5 h-5 md:w-6 md:h-6 text-gray-600" />
        </button>
        <span className="font-bold text-gray-700 text-sm md:text-base">
          Soru {currentIndex + 1} / {currentQuestions.length}
        </span>
        <div className="w-10"></div> {/* Spacer */}
      </div>

      <div className="flex-1 flex flex-col items-center p-4 max-w-3xl mx-auto w-full overflow-y-auto">
        {/* Question Area */}
        <div className="bg-white rounded-3xl shadow-xl w-full p-6 md:p-8 mb-4 md:mb-6 text-center border-4 border-blue-100 mt-2">
          
          <div className="mb-4 md:mb-6">
            {/* Primary: Romaji Question */}
            <h2 className="text-2xl md:text-4xl font-extrabold text-gray-800 mb-2 tracking-tight">
              {currentQuestion.romajiQuestion}
            </h2>
            {/* Secondary: Japanese Question */}
            <p className="text-base md:text-lg text-gray-400 font-medium opacity-80 mb-1">
              {currentQuestion.japaneseQuestion}
            </p>
            {/* Tertiary: Turkish Meaning */}
            <p className="text-xs md:text-sm text-blue-500 font-bold">
              ({currentQuestion.turkishMeaning})
            </p>
          </div>
          
          {currentQuestion.type !== 'matching' && currentQuestion.image && (
            <div className="mb-6 md:mb-8 flex items-center justify-center min-h-[120px] md:min-h-[160px]">
              {isImageLink ? (
                 <img src={currentQuestion.image as string} alt="Soru görseli" className="h-40 md:h-64 w-full object-contain mx-auto rounded-lg" />
              ) : (
                 <span className="text-7xl md:text-9xl">{currentQuestion.image as string}</span>
              )}
            </div>
          )}

          {/* Options or Matching */}
          {currentQuestion.type === 'matching' ? (
            <div className="grid grid-cols-2 gap-4 md:gap-8 mt-4">
              {/* Left Column */}
              <div className="flex flex-col gap-3">
                {shuffledLeft.map((leftItem) => {
                  const isMatched = matchedPairs.includes(leftItem);
                  const isSelected = selectedLeft === leftItem;
                  let btnClass = "bg-gray-50 border-2 border-gray-200 hover:border-blue-300 text-gray-700";
                  
                  if (isMatched) {
                    btnClass = "bg-green-100 border-green-500 text-green-800 opacity-50 cursor-not-allowed";
                  } else if (isSelected) {
                    if (matchingFeedback === 'correct') btnClass = "bg-green-100 border-green-500 text-green-800";
                    else if (matchingFeedback === 'wrong') btnClass = "bg-red-100 border-red-500 text-red-800 animate-shake";
                    else btnClass = "bg-blue-100 border-blue-500 text-blue-800 shadow-md scale-105";
                  }

                  return (
                    <button
                      key={leftItem}
                      onClick={() => !isMatched && handleMatchSelect('left', leftItem)}
                      disabled={isMatched || !!matchingFeedback}
                      className={`p-3 md:p-4 rounded-xl text-sm md:text-base font-bold transition-all duration-200 ${btnClass}`}
                    >
                      {leftItem}
                    </button>
                  );
                })}
              </div>
              
              {/* Right Column */}
              <div className="flex flex-col gap-3">
                {shuffledRight.map((rightItem) => {
                  // Find the corresponding left item to check if it's matched
                  const originalPair = currentQuestion.pairs?.find(p => p.right === rightItem);
                  const isMatched = originalPair ? matchedPairs.includes(originalPair.left) : false;
                  const isSelected = selectedRight === rightItem;
                  let btnClass = "bg-gray-50 border-2 border-gray-200 hover:border-blue-300 text-gray-700";
                  
                  if (isMatched) {
                    btnClass = "bg-green-100 border-green-500 text-green-800 opacity-50 cursor-not-allowed";
                  } else if (isSelected) {
                    if (matchingFeedback === 'correct') btnClass = "bg-green-100 border-green-500 text-green-800";
                    else if (matchingFeedback === 'wrong') btnClass = "bg-red-100 border-red-500 text-red-800 animate-shake";
                    else btnClass = "bg-blue-100 border-blue-500 text-blue-800 shadow-md scale-105";
                  }

                  return (
                    <button
                      key={rightItem}
                      onClick={() => !isMatched && handleMatchSelect('right', rightItem)}
                      disabled={isMatched || !!matchingFeedback}
                      className={`p-3 md:p-4 rounded-xl text-sm md:text-base font-bold transition-all duration-200 ${btnClass}`}
                    >
                      {rightItem}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              {currentQuestion.options?.map((opt) => {
                let btnClass = "bg-gray-50 border-2 border-gray-200 hover:border-blue-300 text-gray-700";
                
                if (selectedOption) {
                  if (opt.text === currentQuestion.correctAnswer) {
                    btnClass = "bg-green-100 border-green-500 text-green-800";
                  } else if (opt.text === selectedOption) {
                    btnClass = "bg-red-100 border-red-500 text-red-800";
                  } else {
                    btnClass = "opacity-50 cursor-not-allowed";
                  }
                }

                return (
                  <button
                    key={opt.text}
                    onClick={() => handleOptionSelect(opt.text)}
                    disabled={!!selectedOption}
                    className={`
                      p-3 md:p-4 rounded-xl text-lg transition-all transform active:scale-95
                      flex flex-col items-center justify-center min-h-[60px] md:min-h-[80px]
                      ${btnClass}
                    `}
                  >
                    <span className="font-bold text-xl md:text-2xl mb-0.5 md:mb-1">{opt.romaji}</span>
                    <span className="text-xs md:text-sm opacity-60 font-medium">{opt.text}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Feedback / Next Button */}
        {selectedOption && currentQuestion.type !== 'matching' && (
          <div className={`
            w-full p-4 rounded-xl flex items-center justify-between animate-fade-in shadow-lg mb-6
            ${isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}
          `}>
            <div className="flex items-center gap-3">
              {isCorrect ? <CheckCircle className="w-6 h-6 md:w-8 md:h-8" /> : <XCircle className="w-6 h-6 md:w-8 md:h-8" />}
              <div className="flex flex-col text-left">
                <span className="font-bold text-base md:text-lg leading-tight">
                  {isCorrect ? 'Harika!' : 'Yanlış'}
                </span>
                {!isCorrect && (
                   <span className="text-xs md:text-sm opacity-90">
                     Doğru cevap: {currentQuestion.options.find(o => o.text === currentQuestion.correctAnswer)?.romaji}
                   </span>
                )}
              </div>
            </div>
            <button
              onClick={handleNext}
              className="bg-white text-gray-900 px-4 py-2 md:px-6 md:py-3 rounded-lg font-bold hover:bg-gray-100 flex items-center gap-2 shadow-sm transition-transform active:scale-95 text-sm md:text-base"
            >
              Devam <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewModule;

