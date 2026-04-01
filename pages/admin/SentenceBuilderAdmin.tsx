import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase';
import { Loader2, Plus, Edit2, Trash2, X, Info, Eye, EyeOff } from 'lucide-react';

export default function SentenceBuilderAdmin() {
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState({
    turkish_meaning: '',
    correct_words: '', // We'll use comma separated strings for easy editing
    distractors: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from('sentences').select('*').order('id', { ascending: true });
    if (error) console.error("sentences fetch error:", error);
    if (data) setItems(data);
    setIsLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bu cümleyi silmek istediğinize emin misiniz?')) {
      await supabase.from('sentences').delete().eq('id', id);
      fetchItems();
    }
  };

  const toggleVisibility = async (item: any) => {
    await supabase.from('sentences').update({ is_visible: !item.is_visible }).eq('id', item.id);
    fetchItems();
  };

  const openModal = (item: any = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        turkish_meaning: item.turkish_meaning,
        correct_words: item.correct_words ? item.correct_words.map((w:any) => `${w.romaji}/${w.hiragana}`).join(', ') : '',
        distractors: item.distractors ? item.distractors.map((w:any) => `${w.romaji}/${w.hiragana}`).join(', ') : ''
      });
    } else {
      setEditingItem(null);
      setFormData({ 
        turkish_meaning: '', 
        correct_words: '', 
        distractors: '' 
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Convert comma and slash separated strings to arrays of objects
    // Expected format: "Romaji/hiragana, Romaji/hiragana"
    const correctArray = formData.correct_words.split(',').map(s => {
       const parts = s.split('/');
       return { romaji: parts[0]?.trim() || '', hiragana: parts[1]?.trim() || '' };
    }).filter(s => s.romaji !== '');

    const distractorArray = formData.distractors.split(',').map(s => {
       const parts = s.split('/');
       return { romaji: parts[0]?.trim() || '', hiragana: parts[1]?.trim() || '' };
    }).filter(s => s.romaji !== '');

    const dataToSave = {
      turkish_meaning: formData.turkish_meaning,
      correct_words: correctArray,
      distractors: distractorArray
    };

    if (editingItem) {
      await supabase.from('sentences').update(dataToSave).eq('id', editingItem.id);
    } else {
      await supabase.from('sentences').insert([{ ...dataToSave, id: crypto.randomUUID() }]);
    }
    
    setIsModalOpen(false);
    setIsSaving(false);
    fetchItems();
  };

  if (isLoading) {
    return <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 text-amber-500 animate-spin" /></div>;
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Cümle Kurma (Boşluk Doldurma)</h2>
        <button 
          onClick={() => openModal()}
          className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors w-full sm:w-auto justify-center shadow-md font-bold"
        >
          <Plus className="w-5 h-5" /> Yeni Cümle Ekle
        </button>
      </div>
      
      <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-1/4">Türkçe Anlamı</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-1/3">Doğru Sıralama</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-1/3">Çeldirici Kelimeler</th>
              <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Görünürlük</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">İşlemler</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((item) => (
              <tr key={item.id} className={`hover:bg-amber-50 transition-colors ${item.is_visible === false ? 'opacity-40' : ''}`}>
                <td className="px-6 py-4">
                  <div className="font-bold text-gray-900">{item.turkish_meaning}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                     {item.correct_words?.map((w: any, i: number) => (
                        <span key={i} className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded border border-green-200 flex flex-col items-center">
                           <span>{w.romaji}</span>
                           <span className="text-[10px] opacity-70 leading-none">{w.hiragana}</span>
                        </span>
                     ))}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                     {item.distractors?.map((w: any, i: number) => (
                        <span key={i} className="bg-red-100 text-red-800 text-xs font-bold px-2 py-1 rounded border border-red-200 flex flex-col items-center">
                           <span>{w.romaji}</span>
                           <span className="text-[10px] opacity-70 leading-none">{w.hiragana}</span>
                        </span>
                     ))}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <button onClick={() => toggleVisibility(item)} className={`p-1.5 rounded-lg transition-colors ${item.is_visible === false ? 'text-gray-400 hover:text-gray-600 bg-gray-100' : 'text-emerald-600 hover:text-emerald-800 bg-emerald-50'}`}>
                    {item.is_visible === false ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => openModal(item)} className="text-amber-600 hover:text-amber-900 mr-4 transition-colors"><Edit2 className="w-5 h-5 inline" /></button>
                  <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-900 transition-colors"><Trash2 className="w-5 h-5 inline" /></button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
               <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">Henüz hiç cümle eklenmemiş.</td>
               </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-fade-in">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h3 className="text-xl font-bold text-gray-800">{editingItem ? 'Cümleyi Düzenle' : 'Yeni Cümle Oluştur'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-200 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-6 overflow-y-auto flex-1">
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Cümlenin Türkçe Anlamı</label>
                <input 
                  required 
                  type="text" 
                  value={formData.turkish_meaning} 
                  onChange={e => setFormData({...formData, turkish_meaning: e.target.value})} 
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20 transition-all text-lg font-medium" 
                  placeholder="Örn: Ben Japonca çalışıyorum." 
                />
              </div>

              <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                <label className="flex items-center gap-2 text-sm font-bold text-green-800 mb-2">
                   Doğru Kelimeler (Sırasıyla)
                </label>
                <p className="text-xs text-green-600 mb-3 flex items-start gap-1">
                   <Info className="w-4 h-4 shrink-0" />
                   Kelimeleri "Romaji/Hiragana" formatında, aralarına virgül koyarak yazın.
                </p>
                <textarea 
                  required 
                  rows={2}
                  value={formData.correct_words} 
                  onChange={e => setFormData({...formData, correct_words: e.target.value})} 
                  className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-500/20 transition-all font-medium text-green-900" 
                  placeholder="Örn: Watashi/わたし, wa/わ, Gohan/ごはん, o/を, Tabetai/たべたい" 
                />
              </div>

              <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                <label className="block text-sm font-bold text-red-800 mb-2">Çeldirici Kelimeler</label>
                <p className="text-xs text-red-600 mb-3 flex items-start gap-1">
                   <Info className="w-4 h-4 shrink-0" />
                   Yine aynı "Romaji/Hiragana" formatında kafa karıştırıcı kelimeleri girin.
                </p>
                <textarea 
                  required 
                  rows={2}
                  value={formData.distractors} 
                  onChange={e => setFormData({...formData, distractors: e.target.value})} 
                  className="w-full px-4 py-3 border-2 border-red-200 rounded-xl focus:border-red-500 focus:ring-4 focus:ring-red-500/20 transition-all font-medium text-red-900" 
                  placeholder="Örn: Eiga/えいが, Mimasu/みます" 
                />
              </div>

              <div className="mt-8 flex justify-end gap-4 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold transition-colors">İptal</button>
                <button type="submit" disabled={isSaving} className="px-6 py-3 text-white bg-amber-500 hover:bg-amber-600 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all active:scale-95">
                  {isSaving && <Loader2 className="w-5 h-5 animate-spin" />}
                  Cümleyi Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
