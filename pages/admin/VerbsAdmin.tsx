import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase';
import { Loader2, Plus, Edit2, Trash2, X, Eye, EyeOff } from 'lucide-react';

export default function VerbsAdmin() {
  const [verbs, setVerbs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVerb, setEditingVerb] = useState<any>(null);
  const [formData, setFormData] = useState({
    id: '',
    text: '',
    romaji: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchVerbs();
  }, []);

  const fetchVerbs = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from('verbs').select('*').order('id', { ascending: true });
    if (error) console.error("verbs fetch error:", error);
    if (data) setVerbs(data);
    setIsLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bu fiili silmek istediğinize emin misiniz?')) {
      await supabase.from('verbs').delete().eq('id', id);
      fetchVerbs();
    }
  };

  const toggleVisibility = async (verb: any) => {
    await supabase.from('verbs').update({ is_visible: !verb.is_visible }).eq('id', verb.id);
    fetchVerbs();
  };

  const openModal = (verb: any = null) => {
    if (verb) {
      setEditingVerb(verb);
      setFormData({
        id: verb.id,
        text: verb.text,
        romaji: verb.romaji || ''
      });
    } else {
      setEditingVerb(null);
      setFormData({ id: '', text: '', romaji: '' });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    if (editingVerb) {
      await supabase.from('verbs').update({
        text: formData.text,
        romaji: formData.romaji
      }).eq('id', editingVerb.id);
    } else {
      await supabase.from('verbs').insert([formData]);
    }
    
    setIsModalOpen(false);
    setIsSaving(false);
    fetchVerbs();
  };

  if (isLoading) {
    return <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 text-indigo-500 animate-spin" /></div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Fiiller Yönetimi</h2>
        <button 
          onClick={() => openModal()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" /> Yeni Fiil
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {verbs.map((verb) => (
          <div key={verb.id} className={`border border-gray-200 rounded-xl p-4 bg-white hover:shadow-md transition-shadow ${verb.is_visible === false ? 'opacity-40' : ''}`}>
            <div className="flex justify-end mb-2 gap-2">
              <button onClick={() => toggleVisibility(verb)} className={`${verb.is_visible === false ? 'text-gray-400 hover:text-gray-600' : 'text-emerald-500 hover:text-emerald-700'}`} title={verb.is_visible === false ? 'Gizli' : 'Görünür'}>
                {verb.is_visible === false ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              <button onClick={() => openModal(verb)} className="text-gray-400 hover:text-indigo-600"><Edit2 className="w-4 h-4" /></button>
              <button onClick={() => handleDelete(verb.id)} className="text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
            </div>
            <h3 className="font-bold text-lg text-gray-900">{verb.text}</h3>
            <p className="text-gray-500">{verb.romaji}</p>
            <div className="mt-3 pt-3 border-t border-gray-100">
              <span className="text-xs font-semibold px-2 py-1 bg-gray-100 text-gray-600 rounded">ID: {verb.id}</span>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
             <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">{editingVerb ? 'Fiili Düzenle' : 'Yeni Fiil Ekle'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              {!editingVerb && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Benzersiz ID (Örn: v10)</label>
                  <input required type="text" value={formData.id} onChange={e => setFormData({...formData, id: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Japonca Text (Kanji/Kana)</label>
                <input required type="text" value={formData.text} onChange={e => setFormData({...formData, text: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Romaji (Okunuş)</label>
                <input required type="text" value={formData.romaji} onChange={e => setFormData({...formData, romaji: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
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
