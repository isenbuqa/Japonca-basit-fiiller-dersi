import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase';
import { Loader2, Plus, Edit2, Trash2, X, Eye, EyeOff } from 'lucide-react';

export default function WordsAdmin() {
  const [words, setWords] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWord, setEditingWord] = useState<any>(null);
  const [formData, setFormData] = useState({
    text: '',
    romaji: '',
    meaning: '',
    image: '',
    category: 'food',
    valid_verb_ids: ['tabemas']
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchWords();
  }, []);

  const fetchWords = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from('words').select('*').order('id', { ascending: true });
    if (error) console.error("words fetch error:", error);
    if (data) setWords(data);
    setIsLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bu kelimeyi silmek istediğinize emin misiniz?')) {
      await supabase.from('words').delete().eq('id', id);
      fetchWords();
    }
  };

  const toggleVisibility = async (word: any) => {
    await supabase.from('words').update({ is_visible: !word.is_visible }).eq('id', word.id);
    fetchWords();
  };

  const openModal = (word: any = null) => {
    if (word) {
      setEditingWord(word);
      setFormData({
        text: word.text,
        romaji: word.romaji,
        meaning: word.meaning || '',
        image: word.image || '',
        category: word.category,
        valid_verb_ids: word.valid_verb_ids || []
      });
    } else {
      setEditingWord(null);
      setFormData({ text: '', romaji: '', meaning: '', image: '', category: 'food', valid_verb_ids: ['tabemas'] });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    if (editingWord) {
      await supabase.from('words').update(formData).eq('id', editingWord.id);
    } else {
      await supabase.from('words').insert([{ ...formData, id: crypto.randomUUID() }]);
    }
    
    setIsModalOpen(false);
    setIsSaving(false);
    fetchWords();
  };

  if (isLoading) {
    return <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 text-indigo-500 animate-spin" /></div>;
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Kelimeler Yönetimi</h2>
        <button 
          onClick={() => openModal()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors w-full sm:w-auto justify-center"
        >
          <Plus className="w-5 h-5" /> Yeni Kelime
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Görsel</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Japonca</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Romaji</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Anlamı</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Görünürlük</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {words.map((word) => (
              <tr key={word.id} className={`hover:bg-gray-50 transition-colors ${word.is_visible === false ? 'opacity-40' : ''}`}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-2xl overflow-hidden text-center">
                    {word.image && word.image.startsWith('http') ? (
                       <img src={word.image} alt={word.text} className="w-full h-full object-cover" />
                    ) : (
                       <span>{word.image}</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{word.text}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{word.romaji}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-600">{word.meaning || <span className="text-gray-300 italic">-</span>}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {word.category}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <button onClick={() => toggleVisibility(word)} className={`p-1.5 rounded-lg transition-colors ${word.is_visible === false ? 'text-gray-400 hover:text-gray-600 bg-gray-100' : 'text-emerald-600 hover:text-emerald-800 bg-emerald-50'}`}>
                    {word.is_visible === false ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => openModal(word)} className="text-indigo-600 hover:text-indigo-900 mr-4"><Edit2 className="w-5 h-5 inline" /></button>
                  <button onClick={() => handleDelete(word.id)} className="text-red-600 hover:text-red-900"><Trash2 className="w-5 h-5 inline" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[95vh] flex flex-col overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-gray-900">{editingWord ? 'Kelimeyi Düzenle' : 'Yeni Kelime Ekle'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Japonca Text (Kanji/Kana)</label>
                <input required type="text" value={formData.text} onChange={e => setFormData({...formData, text: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Romaji (Okunuş)</label>
                <input required type="text" value={formData.romaji} onChange={e => setFormData({...formData, romaji: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Türkçe Anlamı</label>
                <input type="text" value={formData.meaning} onChange={e => setFormData({...formData, meaning: e.target.value})} placeholder="Örn: Kitap, Ekmek" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Görsel (Emoji veya URL)</label>
                <input required type="text" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                  <option value="food">Yiyecek (food)</option>
                  <option value="drink">İçecek (drink)</option>
                  <option value="media">Medya (media)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Doğru Fiil ID'leri (Virgülle ayırın)</label>
                <input required type="text" value={formData.valid_verb_ids.join(',')} onChange={e => setFormData({...formData, valid_verb_ids: e.target.value.split(',').map(s=>s.trim())})} placeholder="tabemas, nomimas..." className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium">İptal</button>
                <button type="submit" disabled={isSaving} className="px-4 py-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium flex items-center gap-2">
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
