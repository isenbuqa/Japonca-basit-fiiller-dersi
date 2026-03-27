import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase';
import { Loader2, Plus, Edit2, Trash2, X } from 'lucide-react';

export default function ReviewAdmin() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  
  // JSON fields will be handled as strings in the form for simplicity
  const [formData, setFormData] = useState({
    id: '',
    term: 1,
    type: 'vocab',
    romaji_question: '',
    japanese_question: '',
    turkish_meaning: '',
    image: '',
    correct_answer: '',
    options: '', // stringified JSON
    pairs: ''    // stringified JSON
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from('review_questions').select('*').order('term', { ascending: true }).order('id', { ascending: true });
    if (data) setQuestions(data);
    setIsLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bu soruyu silmek istediğinize emin misiniz?')) {
      await supabase.from('review_questions').delete().eq('id', id);
      fetchQuestions();
    }
  };

  const openModal = (q: any = null) => {
    if (q) {
      setEditingQuestion(q);
      setFormData({
        id: q.id,
        term: q.term,
        type: q.type,
        romaji_question: q.romaji_question || '',
        japanese_question: q.japanese_question || '',
        turkish_meaning: q.turkish_meaning || '',
        image: q.image || '',
        correct_answer: q.correct_answer || '',
        options: q.options ? JSON.stringify(q.options, null, 2) : '',
        pairs: q.pairs ? JSON.stringify(q.pairs, null, 2) : ''
      });
    } else {
      setEditingQuestion(null);
      setFormData({
        id: `q${Date.now().toString().slice(-4)}`,
        term: 1,
        type: 'vocab',
        romaji_question: '',
        japanese_question: '',
        turkish_meaning: '',
        image: '',
        correct_answer: '',
        options: '[\n  { "text": "Seçenek", "romaji": "Secenek" }\n]',
        pairs: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Parse JSON strings back to objects
    let parsedOptions = null;
    let parsedPairs = null;
    
    try {
      if (formData.options.trim()) parsedOptions = JSON.parse(formData.options);
      if (formData.pairs.trim()) parsedPairs = JSON.parse(formData.pairs);
    } catch (err) {
      alert("JSON format hatası! Lütfen Options ve Pairs alanlarını doğru JSON formatında giriniz.");
      setIsSaving(false);
      return;
    }

    const payload = {
      id: formData.id,
      term: Number(formData.term),
      type: formData.type,
      romaji_question: formData.romaji_question,
      japanese_question: formData.japanese_question,
      turkish_meaning: formData.turkish_meaning,
      image: formData.image,
      correct_answer: formData.correct_answer,
      options: parsedOptions,
      pairs: parsedPairs
    };

    if (editingQuestion) {
      await supabase.from('review_questions').update(payload).eq('id', editingQuestion.id);
    } else {
      await supabase.from('review_questions').insert([payload]);
    }
    
    setIsModalOpen(false);
    setIsSaving(false);
    fetchQuestions();
  };

  if (isLoading) {
    return <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>;
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Soru Tekrarı Yönetimi</h2>
        <button 
          onClick={() => openModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors w-full sm:w-auto justify-center"
        >
          <Plus className="w-5 h-5" /> Yeni Soru
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID / Dönem</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tür</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Soru (Türkçe)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cevap</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {questions.map((q) => (
              <tr key={q.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">{q.id}</div>
                  <div className="text-sm text-gray-500">Dönem {q.term}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800`}>
                    {q.type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 truncate max-w-xs">{q.turkish_meaning}</div>
                  <div className="text-xs text-gray-500 truncate max-w-xs">{q.japanese_question}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {q.type === 'matching' ? '(Eşleştirme)' : q.correct_answer}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => openModal(q)} className="text-blue-600 hover:text-blue-900 mr-4"><Edit2 className="w-5 h-5 inline" /></button>
                  <button onClick={() => handleDelete(q.id)} className="text-red-600 hover:text-red-900"><Trash2 className="w-5 h-5 inline" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[95vh] flex flex-col overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-gray-900">{editingQuestion ? 'Soruyu Düzenle' : 'Yeni Soru Ekle'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-4 sm:p-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ID</label>
                  <input required disabled={!!editingQuestion} type="text" value={formData.id} onChange={e => setFormData({...formData, id: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dönem</label>
                  <select value={formData.term} onChange={e => setFormData({...formData, term: Number(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value={1}>Dönem 1</option>
                    <option value={2}>Dönem 2</option>
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Soru Türü</label>
                <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option value="vocab">Kelime / Normal (vocab)</option>
                  <option value="demo">Görsel İşaret Zamiri (demo)</option>
                  <option value="matching">Eşleştirme (matching)</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Japonca Soru</label>
                  <input type="text" value={formData.japanese_question} onChange={e => setFormData({...formData, japanese_question: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Romaji Soru</label>
                  <input type="text" value={formData.romaji_question} onChange={e => setFormData({...formData, romaji_question: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Türkçe Soru (Anlam)</label>
                  <input required type="text" value={formData.turkish_meaning} onChange={e => setFormData({...formData, turkish_meaning: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Görsel (Emoji veya URL)</label>
                <input type="text" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Doğru Cevap (Tam eşleşmeli metin)</label>
                <input type="text" value={formData.correct_answer} onChange={e => setFormData({...formData, correct_answer: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Şıklar (Options - JSON Array)</label>
                <textarea rows={4} value={formData.options} onChange={e => setFormData({...formData, options: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-xs" placeholder='[ { "text": "Japonca", "romaji": "Romaji" } ]' />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Eşleştirmeler (Pairs - JSON Array)</label>
                <textarea rows={4} value={formData.pairs} onChange={e => setFormData({...formData, pairs: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-xs" placeholder='[ { "left": "Sol", "right": "Sağ" } ]' />
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium">İptal</button>
                <button type="submit" disabled={isSaving} className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium flex items-center gap-2">
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
