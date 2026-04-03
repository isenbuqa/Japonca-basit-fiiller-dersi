
import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, XCircle, RotateCcw, Loader2, BookOpen, Languages, Trophy, ChevronRight } from 'lucide-react';
import { playCorrectSound, playWrongSound } from '../utils/sound';
import { supabase } from '../utils/supabase';

interface Word {
  id: string;
  text: string;
  romaji: string;
  image: string;
  meaning: string;
  category: string;
  is_visible: boolean;
}

interface QuizQuestion {
  word: Word;
  options: string[];
  correctAnswer: string;
}

type TestMode = 'jp-to-tr' | 'tr-to-jp';

interface VocabTestModuleProps {
  onBack: () => void;
}

const VocabTestModule: React.FC<VocabTestModuleProps> = ({ onBack }) => {
  const [mode, setMode] = useState<TestMode | null>(null);
  const [words, setWords] = useState<Word[]>([]);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchWords = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('words')
      .select('*')
      .eq('is_visible', true)
      .not('meaning', 'is', null);
    
    if (data && !error) {
      // Filter out words without meaning
      const validWords = data.filter((w: any) => w.meaning && w.meaning.trim() !== '');
      setWords(validWords);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchWords();
  }, []);

  const generateQuestions = (testMode: TestMode) => {
    if (words.length < 4) return;

    const shuffled = [...words].sort(() => Math.random() - 0.5);
    const quizQuestions: QuizQuestion[] = shuffled.map(word => {
      // Pick 3 random wrong answers
      const otherWords = words.filter(w => w.id !== word.id);
      const wrongAnswers = otherWords
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map(w => testMode === 'jp-to-tr' ? w.meaning : `${w.romaji} (${w.text})`);

      const correctAnswer = testMode === 'jp-to-tr' 
        ? word.meaning 
        : `${word.romaji} (${word.text})`;

      const options = [...wrongAnswers, correctAnswer].sort(() => Math.random() - 0.5);

      return { word, options, correctAnswer };
    });

    setQuestions(quizQuestions);
  };

  const startTest = (testMode: TestMode) => {
    setMode(testMode);
    setCurrentIndex(0);
    setScore(0);
    setFeedback(null);
    setSelectedAnswer(null);
    setIsFinished(false);
    generateQuestions(testMode);
  };

  const handleAnswer = (answer: string) => {
    if (feedback) return;

    setSelectedAnswer(answer);
    const isCorrect = answer === questions[currentIndex].correctAnswer;

    if (isCorrect) {
      playCorrectSound();
      setFeedback('correct');
      setScore(s => s + 1);
    } else {
      playWrongSound();
      setFeedback('wrong');
    }

    setTimeout(() => {
      setFeedback(null);
      setSelectedAnswer(null);
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        setIsFinished(true);
      }
    }, 1500);
  };

  const restart = () => {
    setMode(null);
    setCurrentIndex(0);
    setScore(0);
    setFeedback(null);
    setSelectedAnswer(null);
    setIsFinished(false);
  };

  // Loading
  if (isLoading) {
    return (
      <div className="h-full bg-gradient-to-b from-sky-50 to-blue-50 flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-sky-600 animate-spin mb-4" />
        <p className="text-sky-600 font-bold">Kelimeler yükleniyor...</p>
      </div>
    );
  }

  // Mode Selection Screen
  if (!mode) {
    return (
      <div className="h-full bg-gradient-to-b from-sky-50 to-blue-50 flex flex-col">
        {/* Header */}
        <div className="p-4 flex items-center">
          <button onClick={onBack} className="p-2 rounded-full hover:bg-white/60 transition-colors">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="bg-sky-100 p-4 rounded-2xl mb-6">
            <BookOpen className="w-12 h-12 text-sky-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-800 mb-2 text-center">Kelime Testi</h1>
          <p className="text-gray-500 font-medium mb-10 text-center">Test türünü seçin</p>

          <div className="w-full max-w-sm flex flex-col gap-4">
            <button
              onClick={() => startTest('jp-to-tr')}
              disabled={words.length < 4}
              className="group bg-white border-b-4 border-sky-200 active:border-b-0 active:translate-y-1 rounded-2xl p-5 flex items-center gap-4 shadow-lg hover:bg-sky-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="bg-sky-100 p-3 rounded-xl group-hover:scale-110 transition-transform shrink-0">
                <Languages className="w-7 h-7 text-sky-600" />
              </div>
              <div className="text-left flex-1">
                <h3 className="text-lg font-black text-gray-800">Japonca → Türkçe</h3>
                <p className="text-sm text-gray-500 mt-0.5">Japonca kelimeyi gör, Türkçe anlamını bul</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-sky-500 transition-colors shrink-0" />
            </button>

            <button
              onClick={() => startTest('tr-to-jp')}
              disabled={words.length < 4}
              className="group bg-white border-b-4 border-indigo-200 active:border-b-0 active:translate-y-1 rounded-2xl p-5 flex items-center gap-4 shadow-lg hover:bg-indigo-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="bg-indigo-100 p-3 rounded-xl group-hover:scale-110 transition-transform shrink-0">
                <Languages className="w-7 h-7 text-indigo-600" />
              </div>
              <div className="text-left flex-1">
                <h3 className="text-lg font-black text-gray-800">Türkçe → Japonca</h3>
                <p className="text-sm text-gray-500 mt-0.5">Türkçe anlamı gör, Japonca karşılığını bul</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-indigo-500 transition-colors shrink-0" />
            </button>
          </div>

          {words.length < 4 && (
            <p className="text-red-500 text-sm font-medium mt-6 text-center">
              Test için en az 4 kelime gerekli. Şu an {words.length} kelime mevcut.
            </p>
          )}

          <p className="text-gray-400 text-sm mt-6 font-medium">{words.length} kelime hazır</p>
        </div>
      </div>
    );
  }

  // Finished Screen
  if (isFinished) {
    const percentage = Math.round((score / questions.length) * 100);
    const emoji = percentage >= 80 ? '🎉' : percentage >= 50 ? '👍' : '💪';
    
    return (
      <div className="h-full bg-gradient-to-b from-sky-50 to-blue-50 flex flex-col items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-sm w-full text-center border border-sky-100">
          <div className="text-6xl mb-4">{emoji}</div>
          <Trophy className="w-16 h-16 text-amber-400 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-gray-800 mb-2">Test Tamamlandı!</h2>
          <p className="text-gray-500 font-medium mb-6">
            {mode === 'jp-to-tr' ? 'Japonca → Türkçe' : 'Türkçe → Japonca'}
          </p>

          <div className="bg-sky-50 rounded-2xl p-5 mb-6 border border-sky-100">
            <div className="text-5xl font-black text-sky-600 mb-1">{score}/{questions.length}</div>
            <div className="text-sm font-bold text-sky-500">%{percentage} Başarı</div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => startTest(mode)}
              className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-5 h-5" /> Tekrar Dene
            </button>
            <button
              onClick={restart}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl transition-colors"
            >
              Test Seçimine Dön
            </button>
            <button
              onClick={onBack}
              className="w-full text-gray-400 hover:text-gray-600 font-medium py-2 transition-colors text-sm"
            >
              Ana Menü
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Quiz Screen
  if (questions.length === 0) return null;
  const currentQ = questions[currentIndex];
  const progressPercent = ((currentIndex) / questions.length) * 100;

  return (
    <div className="h-full bg-gradient-to-b from-sky-50 to-blue-50 flex flex-col">
      {/* Header */}
      <div className="p-4 flex items-center justify-between shrink-0">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-white/60 transition-colors">
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
          İlerleme
        </span>
        <span className="text-sm font-black text-sky-600 bg-sky-100 px-3 py-1 rounded-full">
          {currentIndex + 1} / {questions.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="mx-4 h-2 bg-sky-100 rounded-full overflow-hidden mb-4 shrink-0">
        <div
          className="h-full bg-sky-500 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Question Card */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-4">
        <div className={`bg-white rounded-3xl shadow-xl p-6 md:p-8 w-full max-w-md mb-6 border-2 transition-all duration-300 ${
          feedback === 'correct' ? 'border-emerald-400 bg-emerald-50' :
          feedback === 'wrong' ? 'border-red-400 bg-red-50' :
          'border-sky-100'
        }`}>
          {/* Feedback overlay */}
          {feedback && (
            <div className="flex justify-center mb-3">
              {feedback === 'correct' ? (
                <CheckCircle className="w-10 h-10 text-emerald-500" />
              ) : (
                <XCircle className="w-10 h-10 text-red-500" />
              )}
            </div>
          )}

          {mode === 'jp-to-tr' ? (
            // Show Japanese, ask Turkish meaning
            <>
              {currentQ.word.image && (
                <div className="flex justify-center mb-3">
                  {currentQ.word.image.startsWith('http') ? (
                    <img src={currentQ.word.image} alt="" className="w-20 h-20 object-contain rounded-xl" />
                  ) : (
                    <span className="text-5xl">{currentQ.word.image}</span>
                  )}
                </div>
              )}
              <h2 className="text-3xl md:text-4xl font-black text-gray-800 text-center mb-1">
                {currentQ.word.romaji}
              </h2>
              <p className="text-lg text-gray-400 text-center font-medium">
                {currentQ.word.text}
              </p>
            </>
          ) : (
            // Show Turkish meaning, ask Japanese
            <>
              <p className="text-sm font-bold text-sky-500 text-center uppercase tracking-widest mb-2">Türkçe</p>
              <h2 className="text-3xl md:text-4xl font-black text-gray-800 text-center">
                {currentQ.word.meaning}
              </h2>
            </>
          )}

          {/* Show correct answer when wrong */}
          {feedback === 'wrong' && (
            <div className="mt-3 bg-red-100 rounded-xl p-3 text-center">
              <p className="text-xs font-bold text-red-500 uppercase tracking-wider">Doğru Cevap</p>
              <p className="text-lg font-black text-red-700">{currentQ.correctAnswer}</p>
            </div>
          )}
        </div>

        {/* Options */}
        <div className="w-full max-w-md grid grid-cols-1 gap-2.5">
          {currentQ.options.map((option, i) => {
            const isSelected = selectedAnswer === option;
            const isCorrect = option === currentQ.correctAnswer;
            
            let btnClass = 'bg-white border-2 border-gray-100 hover:border-sky-300 hover:bg-sky-50';
            if (feedback) {
              if (isCorrect) {
                btnClass = 'bg-emerald-100 border-2 border-emerald-400 text-emerald-800';
              } else if (isSelected && !isCorrect) {
                btnClass = 'bg-red-100 border-2 border-red-400 text-red-800';
              } else {
                btnClass = 'bg-gray-50 border-2 border-gray-100 opacity-50';
              }
            }

            return (
              <button
                key={i}
                onClick={() => handleAnswer(option)}
                disabled={!!feedback}
                className={`${btnClass} rounded-xl px-5 py-3.5 text-left font-bold text-base md:text-lg transition-all shadow-sm active:scale-[0.98] flex items-center gap-3`}
              >
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black shrink-0 ${
                  feedback && isCorrect ? 'bg-emerald-500 text-white' :
                  feedback && isSelected && !isCorrect ? 'bg-red-500 text-white' :
                  'bg-sky-100 text-sky-600'
                }`}>
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="flex-1">{option}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Score */}
      <div className="p-4 text-center shrink-0">
        <span className="text-sm font-bold text-gray-400">
          Skor: <span className="text-sky-600">{score}</span> / {currentIndex + (feedback ? 1 : 0)}
        </span>
      </div>
    </div>
  );
};

export default VocabTestModule;
