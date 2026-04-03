import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase';
import { Loader2, Eye, EyeOff, AlertTriangle } from 'lucide-react';

interface Word {
  id: string;
  text: string;
  romaji: string;
  meaning: string;
  image: string;
  category: string;
  is_visible: boolean;
}

export default function VocabTestAdmin() {
  const [words, setWords] = useState<Word[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editMeaning, setEditMeaning] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  useEffect(() => {
    fetchWords();
  }, []);

  const fetchWords = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('words')
      .select('*')
      .order('category', { ascending: true });
    if (error) console.error('words fetch error:', error);
    if (data) setWords(data);
    setIsLoading(false);
  };

  const saveMeaning = async (id: string) => {
    setIsSaving(true);
    await supabase.from('words').update({ meaning: editMeaning }).eq('id', id);
    setEditingId(null);
    await fetchWords();
    setIsSaving(false);
  };

  const toggleVisibility = async (word: Word) => {
    await supabase.from('words').update({ is_visible: !word.is_visible }).eq('id', word.id);
    fetchWords();
  };

  const categories = [...new Set(words.map(w => w.category).filter(Boolean))];
  const filtered = filterCategory === 'all' ? words : words.filter(w => w.category === filterCategory);
  
  const wordsWithMeaning = words.filter(w => w.meaning && w.meaning.trim() !== '' && w.is_visible);
  const wordsWithoutMeaning = words.filter(w => !w.meaning || w.meaning.trim() === '');

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-sky-600" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Kelime Testi Yönetimi</h2>
          <p className="text-sm text-gray-500 mt-1">
            Kelime testinde kullanılan kelimelerin Türkçe anlamlarını yönetin.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-sky-50 border border-sky-200 rounded-xl p-4">
          <p className="text-sm font-bold text-sky-600">Teste Hazır</p>
          <p className="text-3xl font-black text-sky-800">{wordsWithMeaning.length}</p>
          <p className="text-xs text-sky-500 mt-1">Anlam girilmiş ve görünür kelimeler</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-sm font-bold text-amber-600">Anlam Eksik</p>
          <p className="text-3xl font-black text-amber-800">{wordsWithoutMeaning.length}</p>
          <p className="text-xs text-amber-500 mt-1">Türkçe anlamı girilmemiş</p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <p className="text-sm font-bold text-gray-600">Toplam Kelime</p>
          <p className="text-3xl font-black text-gray-800">{words.length}</p>
          <p className="text-xs text-gray-500 mt-1">words tablosundaki tüm kayıtlar</p>
        </div>
      </div>

      {/* Warning */}
      {wordsWithMeaning.length < 4 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-red-800">Test çalışmaz!</p>
            <p className="text-sm text-red-600">Kelime testi için en az 4 kelimeye Türkçe anlam girilmiş ve görünür olması gerekir.</p>
          </div>
        </div>
      )}

      {/* Category Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm font-bold text-gray-500">Filtre:</span>
        <button
          onClick={() => setFilterCategory('all')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            filterCategory === 'all' ? 'bg-sky-100 text-sky-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Tümü ({words.length})
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${
              filterCategory === cat ? 'bg-sky-100 text-sky-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {cat} ({words.filter(w => w.category === cat).length})
          </button>
        ))}
      </div>

      {/* Words Table */}
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left py-3 px-4 font-bold text-gray-600">Görsel</th>
              <th className="text-left py-3 px-4 font-bold text-gray-600">Romaji</th>
              <th className="text-left py-3 px-4 font-bold text-gray-600">Japonca</th>
              <th className="text-left py-3 px-4 font-bold text-gray-600">Türkçe Anlam</th>
              <th className="text-left py-3 px-4 font-bold text-gray-600">Kategori</th>
              <th className="text-center py-3 px-4 font-bold text-gray-600">Görünür</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(word => (
              <tr key={word.id} className={`border-b border-gray-100 hover:bg-gray-50 ${!word.is_visible ? 'opacity-40' : ''}`}>
                <td className="py-3 px-4">
                  {word.image?.startsWith('http') ? (
                    <img src={word.image} alt="" className="w-10 h-10 object-contain rounded" />
                  ) : (
                    <span className="text-2xl">{word.image}</span>
                  )}
                </td>
                <td className="py-3 px-4 font-bold text-gray-800">{word.romaji}</td>
                <td className="py-3 px-4 text-gray-600">{word.text}</td>
                <td className="py-3 px-4">
                  {editingId === word.id ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editMeaning}
                        onChange={e => setEditMeaning(e.target.value)}
                        className="border border-sky-300 rounded-lg px-3 py-1.5 text-sm font-medium w-32 focus:outline-none focus:ring-2 focus:ring-sky-400"
                        placeholder="Türkçe anlam"
                        autoFocus
                        onKeyDown={e => {
                          if (e.key === 'Enter') saveMeaning(word.id);
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                      />
                      <button
                        onClick={() => saveMeaning(word.id)}
                        disabled={isSaving}
                        className="bg-sky-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-sky-700 disabled:opacity-50"
                      >
                        {isSaving ? '...' : 'Kaydet'}
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-gray-400 hover:text-gray-600 text-xs font-bold"
                      >
                        İptal
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setEditingId(word.id); setEditMeaning(word.meaning || ''); }}
                      className={`font-medium px-2 py-1 rounded-lg transition-colors ${
                        word.meaning ? 'text-gray-800 hover:bg-sky-50' : 'text-amber-500 italic hover:bg-amber-50'
                      }`}
                    >
                      {word.meaning || '+ Anlam ekle'}
                    </button>
                  )}
                </td>
                <td className="py-3 px-4">
                  <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-medium text-gray-600 capitalize">
                    {word.category}
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  <button
                    onClick={() => toggleVisibility(word)}
                    className={`p-2 rounded-lg transition-colors ${
                      word.is_visible ? 'text-sky-600 hover:bg-sky-50' : 'text-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    {word.is_visible ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
