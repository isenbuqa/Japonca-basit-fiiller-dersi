
import React, { useState } from 'react';
import { ArrowLeft, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { playCorrectSound, playWrongSound } from '../utils/sound';

interface Question {
  id: string;
  type: 'vocab' | 'demo'; // vocabulary or demonstrative
  romajiQuestion: string;
  japaneseQuestion: string;
  turkishMeaning: string;
  image: React.ReactNode;
  correctAnswer: string;
  options: { text: string; romaji: string }[];
}

const QUESTIONS: Question[] = [
  // --- Vocabulary Section ---
  {
    id: 'q1',
    type: 'vocab',
    romajiQuestion: 'Kore wa nan desu ka?',
    japaneseQuestion: 'これは何ですか？',
    turkishMeaning: 'Bu nedir?',
    image: <span className="text-7xl md:text-9xl">📚</span>,
    correctAnswer: '本',
    options: [
      { text: '本', romaji: 'Hon' },
      { text: 'ノート', romaji: 'Nooto' },
      { text: '鉛筆', romaji: 'Enpitsu' },
      { text: '携帯', romaji: 'Keitai' },
    ]
  },
  {
    id: 'q2',
    type: 'vocab',
    romajiQuestion: 'Kore wa nan desu ka?',
    japaneseQuestion: 'これは何ですか？',
    turkishMeaning: 'Bu nedir?',
    image: <span className="text-7xl md:text-9xl">📓</span>,
    correctAnswer: 'ノート',
    options: [
      { text: '本', romaji: 'Hon' },
      { text: 'ノート', romaji: 'Nooto' },
      { text: '鉛筆', romaji: 'Enpitsu' },
      { text: '携帯', romaji: 'Keitai' },
    ]
  },
  {
    id: 'q3',
    type: 'vocab',
    romajiQuestion: 'Kore wa nan desu ka?',
    japaneseQuestion: 'これは何ですか？',
    turkishMeaning: 'Bu nedir?',
    image: <span className="text-7xl md:text-9xl">✏️</span>,
    correctAnswer: '鉛筆',
    options: [
      { text: '本', romaji: 'Hon' },
      { text: 'ノート', romaji: 'Nooto' },
      { text: '鉛筆', romaji: 'Enpitsu' },
      { text: '携帯', romaji: 'Keitai' },
    ]
  },
  {
    id: 'q4',
    type: 'vocab',
    romajiQuestion: 'Kore wa nan desu ka?',
    japaneseQuestion: 'これは何ですか？',
    turkishMeaning: 'Bu nedir?',
    image: <span className="text-7xl md:text-9xl">📱</span>,
    correctAnswer: '携帯',
    options: [
      { text: '本', romaji: 'Hon' },
      { text: 'ノート', romaji: 'Nooto' },
      { text: '鉛筆', romaji: 'Enpitsu' },
      { text: '携帯', romaji: 'Keitai' },
    ]
  },
  // --- Demonstratives Section ---
  {
    id: 'q5',
    type: 'demo',
    romajiQuestion: 'Dore desu ka?',
    japaneseQuestion: 'どれですか？',
    turkishMeaning: 'Doğru işaret zamirini seçiniz.',
    image: (
      <img
        src="https://raw.githubusercontent.com/isenbuqa/staj-dersi-img/refs/heads/main/kore.jpg"
        alt="Kore"
        className="h-40 md:h-64 w-full object-contain mx-auto rounded-lg"
      />
    ),
    correctAnswer: 'これ',
    options: [
      { text: 'これ', romaji: 'Kore' },
      { text: 'それ', romaji: 'Sore' },
      { text: 'あれ', romaji: 'Are' },
    ]
  },
  {
    id: 'q6',
    type: 'demo',
    romajiQuestion: 'Dore desu ka?',
    japaneseQuestion: 'どれですか？',
    turkishMeaning: 'Doğru işaret zamirini seçiniz.',
    image: (
      <img
        src="https://raw.githubusercontent.com/isenbuqa/staj-dersi-img/refs/heads/main/sore.jpg"
        alt="Sore"
        className="h-40 md:h-64 w-full object-contain mx-auto rounded-lg"
      />
    ),
    correctAnswer: 'それ',
    options: [
      { text: 'これ', romaji: 'Kore' },
      { text: 'それ', romaji: 'Sore' },
      { text: 'あれ', romaji: 'Are' },
    ]
  },
  {
    id: 'q7',
    type: 'demo',
    romajiQuestion: 'Dore desu ka?',
    japaneseQuestion: 'どれですか？',
    turkishMeaning: 'Doğru işaret zamirini seçiniz.',
    image: (
      <img
        src="https://raw.githubusercontent.com/isenbuqa/staj-dersi-img/refs/heads/main/are.jpg"
        alt="Are"
        className="h-40 md:h-64 w-full object-contain mx-auto rounded-lg"
      />
    ),
    correctAnswer: 'あれ',
    options: [
      { text: 'これ', romaji: 'Kore' },
      { text: 'それ', romaji: 'Sore' },
      { text: 'あれ', romaji: 'Are' },
    ]
  },
];

interface ReviewModuleProps {
  onBack: () => void;
}

const ReviewModule: React.FC<ReviewModuleProps> = ({ onBack }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isFinished, setIsFinished] = useState(false);

  const currentQuestion = QUESTIONS[currentIndex];

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

  const handleNext = () => {
    if (currentIndex < QUESTIONS.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsCorrect(null);
    } else {
      setIsFinished(true);
    }
  };

  if (isFinished) {
    return (
      <div className="min-h-[100dvh] bg-blue-50 flex flex-col items-center justify-center p-6 text-center">
        <CheckCircle className="w-20 h-20 md:w-24 md:h-24 text-green-500 mb-6" />
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">Tebrikler!</h2>
        <p className="text-gray-600 mb-8">Konu tekrarını tamamladın.</p>
        <div className="flex flex-col md:flex-row gap-4 w-full max-w-xs md:max-w-md mx-auto">
          <button
            onClick={() => {
              setCurrentIndex(0);
              setSelectedOption(null);
              setIsCorrect(null);
              setIsFinished(false);
            }}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 transition"
          >
            Tekrar Yap
          </button>
          <button
            onClick={onBack}
            className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-full font-bold hover:bg-gray-300 transition"
          >
            Menüye Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-blue-50 flex flex-col">
      {/* Header */}
      <div className="bg-white p-3 md:p-4 shadow-sm flex items-center justify-between z-10 relative">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft className="w-5 h-5 md:w-6 md:h-6 text-gray-600" />
        </button>
        <span className="font-bold text-gray-700 text-sm md:text-base">
          Soru {currentIndex + 1} / {QUESTIONS.length}
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

          <div className="mb-6 md:mb-8 flex items-center justify-center min-h-[120px] md:min-h-[160px]">
            {currentQuestion.image}
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            {currentQuestion.options.map((opt) => {
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
        </div>

        {/* Feedback / Next Button */}
        {selectedOption && (
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
