import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase';
import { Loader2, Plus, Edit2, Trash2, X, Eye, EyeOff } from 'lucide-react';

export default function TaiVerbsAdmin() {
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState({
    text: '',
    romaji: '',
    meaning: '',
    image: '',
    theme: 'bg-gradient-to-br from-pink-400 to-rose-500',
    text_color: 'text-pink-500'
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from('tai_verbs').select('*').order('id', { ascending: true });
    if (error) console.error("tai_verbs fetch error:", error);
    if (data) setItems(data);
    setIsLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bu fiili silmek istediğinize emin misiniz?')) {
      await supabase.from('tai_verbs').delete().eq('id', id);
      fetchItems();
    }
  };

  const toggleVisibility = async (item: any) => {
    await supabase.from('tai_verbs').update({ is_visible: !item.is_visible }).eq('id', item.id);
    fetchItems();
  };

  const openModal = (item: any = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        text: item.text,
        romaji: item.romaji,
        meaning: item.meaning,
        image: item.image || '',
        theme: item.theme || 'bg-gradient-to-br from-pink-400 to-rose-500',
        text_color: item.text_color || 'text-pink-500'
      });
    } else {
      setEditingItem(null);
      setFormData({ 
        text: '', 
        romaji: '', 
        meaning: '', 
        image: '',
        theme: 'bg-gradient-to-br from-pink-400 to-rose-500',
        text_color: 'text-pink-500'
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    if (editingItem) {
      await supabase.from('tai_verbs').update(formData).eq('id', editingItem.id);
    } else {
      await supabase.from('tai_verbs').insert([{ ...formData, id: crypto.randomUUID() }]);
    }
    
    setIsModalOpen(false);
    setIsSaving(false);
    fetchItems();
  };

  if (isLoading) {
    return <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 text-pink-500 animate-spin" /></div>;
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">İstemek (-tai form) Fiilleri Yönetimi</h2>
        <button 
          onClick={() => openModal()}
          className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors w-full sm:w-auto justify-center"
        >
          <Plus className="w-5 h-5" /> Yeni Fiil
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Görsel</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Metin & Romaji</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Anlamı</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Görünürlük</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((item) => (
              <tr key={item.id} className={`hover:bg-gray-50 transition-colors ${item.is_visible === false ? 'opacity-40' : ''}`}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl overflow-hidden ${item.theme.replace('from-', 'bg-').split(' ')[0]}`}>
                    {item.image && item.image.startsWith('http') ? (
                       <img src={item.image} alt={item.romaji} className="w-full h-full object-cover" />
                    ) : (
                       <span>{item.image}</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-bold text-gray-900">{item.text}</div>
                  <div className="text-sm text-gray-500">{item.romaji}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-700">{item.meaning}</td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <button onClick={() => toggleVisibility(item)} className={`p-1.5 rounded-lg transition-colors ${item.is_visible === false ? 'text-gray-400 hover:text-gray-600 bg-gray-100' : 'text-emerald-600 hover:text-emerald-800 bg-emerald-50'}`}>
                    {item.is_visible === false ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => openModal(item)} className="text-pink-600 hover:text-pink-900 mr-4"><Edit2 className="w-5 h-5 inline" /></button>
                  <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-900"><Trash2 className="w-5 h-5 inline" /></button>
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
              <h3 className="text-lg font-bold text-gray-900">{editingItem ? 'Fiil Düzenle' : 'Yeni Fiil Ekle'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Japonca Metin (Örn: 食べたい)</label>
                  <input required type="text" value={formData.text} onChange={e => setFormData({...formData, text: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Romaji (Okunuş)</label>
                  <input required type="text" value={formData.romaji} onChange={e => setFormData({...formData, romaji: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Türkçe Anlamı</label>
                <input required type="text" value={formData.meaning} onChange={e => setFormData({...formData, meaning: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Görsel (Sadece Emoji veya Resim URL)</label>
                <input required type="text" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500" placeholder="🍣 veya https://..." />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tema Rengi (CSS Gradient)</label>
                  <input required type="text" value={formData.theme} onChange={e => setFormData({...formData, theme: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500" placeholder="bg-gradient-to-br from-pink-400 to-rose-500" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Yazı Rengi (CSS Sınıfı)</label>
                  <input required type="text" value={formData.text_color} onChange={e => setFormData({...formData, text_color: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500" placeholder="text-pink-500" />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium">İptal</button>
                <button type="submit" disabled={isSaving} className="px-4 py-2 text-white bg-pink-600 hover:bg-pink-700 rounded-lg font-medium flex items-center gap-2">
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
