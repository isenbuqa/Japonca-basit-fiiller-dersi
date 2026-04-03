import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { supabase } from '../../utils/supabase';
import AdminLogin from './AdminLogin';
import WordsAdmin from './WordsAdmin';
import VerbsAdmin from './VerbsAdmin';
import VocabAdmin from './VocabAdmin';
import TabemasuAdmin from './TabemasuAdmin';
import TimeAdmin from './TimeAdmin';
import SimpleVerbsAdmin from './SimpleVerbsAdmin';
import TaiVerbsAdmin from './TaiVerbsAdmin';
import SentenceBuilderAdmin from './SentenceBuilderAdmin';
import ReviewAdmin from './ReviewAdmin';
import AdminHostGame from './AdminHostGame';
import VocabTestAdmin from './VocabTestAdmin';

export default function AdminLayout() {
  const location = useLocation();
  const [session, setSession] = useState<any>(null);
  const [loadingSession, setLoadingSession] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoadingSession(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const tabs = [
    { name: 'Kelimeler (Oyun: Fiil Eşleştirme)', path: '/admin/words' },
    { name: 'Fiiller (Oyun: Fiil Eşleştirme)', path: '/admin/verbs' },
    { name: 'Yiyecek/İçecek İsimleri (Yemek/İçmek)', path: '/admin/vocab' },
    { name: 'Tabemasu / Nomimasu Eşleştirme', path: '/admin/tabemasu' },
    { name: 'Sabah, Öğle, Akşam Kelimeleri', path: '/admin/time' },
    { name: 'Japonca Basit Fiiller', path: '/admin/simple-verbs' },
    { name: 'İstemek (-tai) Fiilleri', path: '/admin/tai-verbs' },
    { name: 'Cümle Kurma', path: '/admin/sentence-builder' },
    { name: 'Konu Tekrarı', path: '/admin/review' },
    { name: 'Kelime Testi', path: '/admin/vocab-test' },
    { name: 'Canlı Oyun Yönetimi (Kahoot)', path: '/admin/live-game' },
  ];

  if (loadingSession) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500">Bağlantı kontrol ediliyor...</div>;
  }

  if (!session) {
    return <AdminLogin />;
  }

  return (
    <div className="h-screen overflow-y-auto bg-gray-50 flex flex-col">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold leading-tight text-gray-900">
            Admin Paneli
          </h1>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <a href="/" className="flex-1 sm:flex-none text-center px-4 py-2 bg-rose-100 text-rose-700 rounded-lg hover:bg-rose-200 font-medium transition-colors">
              Oyuna Dön
            </a>
            <button 
              onClick={() => supabase.auth.signOut()} 
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
            >
              Çıkış
            </button>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-4 overflow-x-auto py-3 scrollbar-hide">
            {tabs.map(tab => {
              const isActive = location.pathname.includes(tab.path);
              return (
                <Link
                  key={tab.path}
                  to={tab.path}
                  className={`whitespace-nowrap px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                    isActive 
                      ? 'bg-indigo-100 text-indigo-700' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {tab.name}
                </Link>
              );
            })}
          </div>
        </div>
      </header>
      
      <main className="flex-1 max-w-7xl w-full mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-white sm:rounded-xl shadow-sm border-y sm:border border-gray-200 min-h-[500px] -mx-4 sm:mx-0">
          <Routes>
            <Route path="words" element={<WordsAdmin />} />
            <Route path="verbs" element={<VerbsAdmin />} />
            <Route path="vocab" element={<VocabAdmin />} />
            <Route path="tabemasu" element={<TabemasuAdmin />} />
            <Route path="time" element={<TimeAdmin />} />
            <Route path="simple-verbs" element={<SimpleVerbsAdmin />} />
            <Route path="tai-verbs" element={<TaiVerbsAdmin />} />
            <Route path="sentence-builder" element={<SentenceBuilderAdmin />} />
            <Route path="review" element={<ReviewAdmin />} />
            <Route path="vocab-test" element={<VocabTestAdmin />} />
            <Route path="live-game" element={<AdminHostGame />} />
            <Route path="*" element={<div className="p-8 text-center text-gray-500">Lütfen yukarıdan bir kategori seçin.</div>} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
