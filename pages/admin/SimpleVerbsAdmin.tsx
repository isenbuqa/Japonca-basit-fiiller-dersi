import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase';
import { Loader2, Plus, Edit2, Trash2, X } from 'lucide-react';

export default function SimpleVerbsAdmin() {
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState({
    romaji: '',
    hiragana: '',
    meaning: '',
    image_url: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from('simple_verbs').select('*').order('id', { ascending: true });
    if (error) console.error("simple_verbs fetch error:", error);
    if (data) setItems(data);
    setIsLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bu fiili silmek istediğinize emin misiniz?')) {
      await supabase.from('simple_verbs').delete().eq('id', id);
      fetchItems();
    }
  };

  const openModal = (item: any = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        romaji: item.romaji,
        hiragana: item.hiragana,
        meaning: item.meaning,
        image_url: item.image_url || ''
      });
    } else {
      setEditingItem(null);
      setFormData({ romaji: '', hiragana: '', meaning: '', image_url: '' });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    if (editingItem) {
      await supabase.from('simple_verbs').update(formData).eq('id', editingItem.id);
    } else {
      await supabase.from('simple_verbs').insert([{ ...formData, id: crypto.randomUUID() }]);
    }
    
    setIsModalOpen(false);
    setIsSaving(false);
    fetchItems();
  };

  if (isLoading) {
    return <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 text-indigo-500 animate-spin" /></div>;
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Basit Fiiller Yönetimi</h2>
        <button 
          onClick={() => openModal()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors w-full sm:w-auto justify-center"
        >
          <Plus className="w-5 h-5" /> Yeni Fiil
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Görsel</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Romaji & Hiragana</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Anlamı</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl overflow-hidden bg-gray-100`}>
                    {item.image_url && (
                       <img src={item.image_url} alt={item.romaji} className="w-full h-full object-cover" />
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-bold text-gray-900">{item.romaji}</div>
                  <div className="text-sm text-gray-500">{item.hiragana}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-700">{item.meaning}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => openModal(item)} className="text-indigo-600 hover:text-indigo-900 mr-4"><Edit2 className="w-5 h-5 inline" /></button>
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Romaji (Okunuş - Prominent)</label>
                <input required type="text" value={formData.romaji} onChange={e => setFormData({...formData, romaji: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hiragana</label>
                <input required type="text" value={formData.hiragana} onChange={e => setFormData({...formData, hiragana: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Türkçe Anlamı</label>
                <input required type="text" value={formData.meaning} onChange={e => setFormData({...formData, meaning: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Görsel URL (Zorunlu değil)</label>
                <input type="text" value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-100">
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
