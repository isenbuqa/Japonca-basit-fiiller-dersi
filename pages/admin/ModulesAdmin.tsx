import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase';

interface Module {
  id: string;
  title: string;
  is_visible: boolean;
  display_order: number;
}

export default function ModulesAdmin() {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('app_modules')
        .select('*')
        .order('display_order', { ascending: true })
        .order('title', { ascending: true });

      if (error) {
        if (error.code === '42P01') {
          setError('app_modules tablosu bulunamadı. Lütfen "add_app_modules.sql" dosyasındaki komutları Supabase üzerinden çalıştırın.');
        } else {
          setError(`Veri çekilirken hata oluştu: ${error.message}`);
        }
      } else {
        setModules(data || []);
      }
    } catch (err: any) {
      setError(`Beklenmeyen bir hata oluştu: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleVisibility = async (id: string, currentVisibility: boolean) => {
    try {
      const { error } = await supabase
        .from('app_modules')
        .update({ is_visible: !currentVisibility })
        .eq('id', id);

      if (error) throw error;

      setModules(modules.map(mod => 
        mod.id === id ? { ...mod, is_visible: !currentVisibility } : mod
      ));
    } catch (err: any) {
      alert(`Güncelleme sırasında hata oluştu: ${err.message}`);
    }
  };

  const updateOrder = async (id: string, newOrder: number) => {
    try {
      const { error } = await supabase
        .from('app_modules')
        .update({ display_order: newOrder })
        .eq('id', id);

      if (error) throw error;

      setModules(prev => prev.map(mod => 
        mod.id === id ? { ...mod, display_order: newOrder } : mod
      ).sort((a, b) => a.display_order - b.display_order));
    } catch (err: any) {
      alert(`Sıralama güncellenirken hata oluştu: ${err.message}`);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Yükleniyor...</div>;

  return (
    <div className="p-4 sm:p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Ana Sayfa Etkinlikleri Yönetimi</h2>
      </div>

      {error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200">
          {error}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Modül / Etkinlik Adı</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sıra</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ana Sayfada Göster</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {modules.map((mod) => (
                  <tr key={mod.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{mod.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input 
                        type="number" 
                        defaultValue={mod.display_order ?? 0}
                        onBlur={(e) => updateOrder(mod.id, parseInt(e.target.value) || 0)}
                        className="w-20 p-1 text-sm border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleVisibility(mod.id, mod.is_visible)}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 ${
                          mod.is_visible ? 'bg-green-500' : 'bg-gray-200'
                        }`}
                        role="switch"
                        aria-checked={mod.is_visible}
                      >
                        <span className="sr-only">Göster/Gizle</span>
                        <span
                          aria-hidden="true"
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            mod.is_visible ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                      <span className="ml-3 text-sm text-gray-500">
                        {mod.is_visible ? 'Açık' : 'Gizli'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-xs text-gray-400 font-mono">{mod.id}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {modules.length === 0 && !error && (
            <div className="text-center py-8 text-gray-500">
              Henüz modül kaydı bulunmuyor. Lütfen veritabanına varsayılan kayıtları eklediğinizden emin olun.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
