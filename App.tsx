
import React, { useState } from 'react';
import {
  BookOpen,
  Utensils,
  ArrowRightLeft,
  Sun,
  Users,
  Zap,
  Gamepad2,
  ChevronRight
} from 'lucide-react';
import VerbGame from './components/VerbGame';
import ReviewModule from './components/ReviewModule';
import VocabularyModule from './components/VocabularyModule';
import TabemasuMatchModule from './components/TabemasuMatchModule';
import TimeWordsModule from './components/TimeWordsModule';
import RolePlayModule from './components/RolePlayModule';
import SimpleVerbsModule from './components/SimpleVerbsModule';

// Menu Options
type ModuleId = 'review' | 'food_drink' | 'tabemasu_match' | 'time_words' | 'role_play' | 'simple_verbs' | 'verb_master_game';

interface MenuItem {
  id: ModuleId;
  title: string;
  icon: React.ReactNode;
  color: string;
}

const MENU_ITEMS: MenuItem[] = [
  { id: 'review', title: 'Konu Tekrarı', icon: <BookOpen className="w-6 h-6" />, color: 'bg-blue-100 text-blue-600' },
  { id: 'food_drink', title: 'Yiyecek/İçecek İsimleri (Yemek/İçmek)', icon: <Utensils className="w-6 h-6" />, color: 'bg-orange-100 text-orange-600' },
  { id: 'tabemasu_match', title: 'Tabemasu / Nomimasu Eşleştirme', icon: <ArrowRightLeft className="w-6 h-6" />, color: 'bg-purple-100 text-purple-600' },
  { id: 'time_words', title: 'Sabah, Öğle, Akşam Kelimeleri', icon: <Sun className="w-6 h-6" />, color: 'bg-yellow-100 text-yellow-600' },
  { id: 'role_play', title: 'Rol Play (Role Play)', icon: <Users className="w-6 h-6" />, color: 'bg-teal-100 text-teal-600' },
  { id: 'simple_verbs', title: 'Japonca Basit Fiiller', icon: <Zap className="w-6 h-6" />, color: 'bg-indigo-100 text-indigo-600' },
  { id: 'verb_master_game', title: 'Oyun: Fiil Eşleştirme', icon: <Gamepad2 className="w-6 h-6" />, color: 'bg-rose-100 text-rose-600' },
];

export default function App() {
  const [activeModule, setActiveModule] = useState<ModuleId | null>(null);

  // If the "Verb Master" game is selected, render the game component
  if (activeModule === 'verb_master_game') {
    return <VerbGame onBackToMenu={() => setActiveModule(null)} />;
  }

  // If "Konu Tekrarı" is selected, render the Review Module
  if (activeModule === 'review') {
    return <ReviewModule onBack={() => setActiveModule(null)} />;
  }

  // If "Food/Drink Vocabulary" is selected
  if (activeModule === 'food_drink') {
    return <VocabularyModule onBack={() => setActiveModule(null)} />;
  }

  // If "Tabemasu Match" is selected
  if (activeModule === 'tabemasu_match') {
    return <TabemasuMatchModule onBack={() => setActiveModule(null)} />;
  }

  // If "Time Words" is selected
  if (activeModule === 'time_words') {
    return <TimeWordsModule onBack={() => setActiveModule(null)} />;
  }

  // If "Role Play" is selected
  if (activeModule === 'role_play') {
    return <RolePlayModule onBack={() => setActiveModule(null)} />;
  }

  // If "Simple Verbs" is selected
  if (activeModule === 'simple_verbs') {
    return <SimpleVerbsModule onBack={() => setActiveModule(null)} />;
  }

  // Placeholder for other modules (To be implemented)
  if (activeModule) {
    const info = MENU_ITEMS.find(i => i.id === activeModule);
    return (
      <div className="h-full flex flex-col items-center justify-center bg-rose-50 p-4">
        <div className="bg-white p-6 rounded-3xl shadow-xl max-w-sm w-full text-center border border-rose-100">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${info?.color.split(' ')[0]}`}>
            {info?.icon}
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">{info?.title}</h2>
          <p className="text-gray-500 mb-6 text-sm">Bu modülün içeriği henüz hazırlanıyor.</p>
          <button
            onClick={() => setActiveModule(null)}
            className="w-full bg-gray-800 text-white px-6 py-3 rounded-full font-bold hover:bg-gray-900 transition-colors text-sm"
          >
            Menüye Dön
          </button>
        </div>
      </div>
    );
  }

  // Main Menu
  return (
    <div className="h-full bg-[url('https://www.transparenttextures.com/patterns/shippo.png')] bg-repeat bg-rose-50 flex flex-col overflow-y-auto">
      {/* Decorative Background Blobs */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-30 z-0">
        <div className="absolute -top-20 -left-20 w-72 h-72 md:w-96 md:h-96 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-40 -right-20 w-72 h-72 md:w-96 md:h-96 bg-amber-100 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10 max-w-2xl mx-auto w-full p-4 md:p-6">
        <header className="text-center py-6 md:py-8">
          <span className="inline-block bg-white/80 backdrop-blur px-3 py-1 rounded-full text-xs md:text-sm font-bold text-rose-500 border border-rose-200 mb-3 shadow-sm">
            N5 Başlangıç Seviyesi
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold text-gray-800 tracking-tight mb-2">
            Japonca Ders 1
          </h1>
          <p className="text-gray-600 font-medium text-sm md:text-base">Lütfen bir etkinlik seçin</p>
        </header>

        <div className="grid gap-3 md:gap-4 pb-12">
          {MENU_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveModule(item.id)}
              className="group relative bg-white/90 backdrop-blur hover:bg-white border-2 border-transparent hover:border-rose-200 p-3 md:p-4 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-left flex items-center gap-3 md:gap-4"
            >
              <div className={`p-2.5 md:p-3 rounded-xl transition-colors duration-300 ${item.color} group-hover:scale-110 flex-shrink-0`}>
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base md:text-lg font-bold text-gray-800 group-hover:text-rose-600 transition-colors leading-tight">
                  {item.title}
                </h3>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-rose-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
