
import React from 'react';
import { ArrowLeft, Users, MessageCircle, Sun, Moon, Utensils, Coffee } from 'lucide-react';

interface RolePlayModuleProps {
  onBack: () => void;
}

const RolePlayModule: React.FC<RolePlayModuleProps> = ({ onBack }) => {
  return (
    <div className="h-full bg-teal-50 flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="bg-white p-4 shadow-sm flex items-center justify-between z-10 flex-shrink-0">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <span className="font-bold text-gray-800 flex items-center gap-2">
          <Users className="w-5 h-5 text-teal-600" />
          Rol Play (Role Play)
        </span>
        <div className="w-10"></div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-safe">
        <div className="max-w-2xl mx-auto w-full flex flex-col gap-6">

          {/* Instruction Card */}
          <div className="bg-white rounded-3xl p-6 shadow-lg border-2 border-teal-100 flex flex-col items-center text-center">
            <div className="bg-teal-100 p-4 rounded-full mb-4 animate-bounce-short">
              <Users className="w-12 h-12 text-teal-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Eşleşme Zamanı!</h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              Yanınızda oturan arkadaşınızla eşleşin.
              <br />
              <span className="font-bold text-teal-600">Sabah, Öğle veya Akşam</span> kelimelerini kullanarak birbirinize yiyecek veya içecek teklif edin.
            </p>
          </div>

          {/* Example 1 */}
          <div className="flex flex-col gap-2">
            <h3 className="text-teal-600 font-bold ml-2 uppercase text-sm tracking-wider">Örnek Diyalog 1 (Yemek)</h3>
            <div className="bg-white rounded-3xl p-6 shadow-md border-l-8 border-teal-400">
              <div className="flex items-start gap-4 mb-6">
                <div className="bg-orange-100 p-2 rounded-full mt-1 flex-shrink-0">
                  <Sun className="w-6 h-6 text-orange-500" />
                </div>
                <div className="flex-1 bg-gray-50 rounded-2xl p-4 rounded-tl-none relative">
                  <p className="text-xs text-gray-400 font-bold mb-1">Öğrenci A</p>
                  <p className="text-xl font-bold text-gray-800">Asa, pan o tabemas ka?</p>
                  <p className="text-sm text-gray-500 italic mt-1">Sabah ekmek yer misin?</p>
                </div>
              </div>

              <div className="flex items-start gap-4 flex-row-reverse">
                <div className="bg-rose-100 p-2 rounded-full mt-1 flex-shrink-0">
                  <Utensils className="w-6 h-6 text-rose-500" />
                </div>
                <div className="flex-1 bg-teal-50 rounded-2xl p-4 rounded-tr-none text-right">
                  <p className="text-xs text-gray-400 font-bold mb-1">Öğrenci B</p>
                  <p className="text-xl font-bold text-gray-800">Hai, tabemas.</p>
                  <p className="text-sm text-gray-500 italic mt-1">Evet, yerim.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Example 2 */}
          <div className="flex flex-col gap-2 mb-8">
            <h3 className="text-teal-600 font-bold ml-2 uppercase text-sm tracking-wider">Örnek Diyalog 2 (İçmek)</h3>
            <div className="bg-white rounded-3xl p-6 shadow-md border-l-8 border-blue-400">
              <div className="flex items-start gap-4 mb-6">
                <div className="bg-blue-100 p-2 rounded-full mt-1 flex-shrink-0">
                  <Sun className="w-6 h-6 text-blue-500" />
                </div>
                <div className="flex-1 bg-gray-50 rounded-2xl p-4 rounded-tl-none relative">
                  <p className="text-xs text-gray-400 font-bold mb-1">Öğrenci A</p>
                  <p className="text-xl font-bold text-gray-800">Hiru, koohii o nomimas ka?</p>
                  <p className="text-sm text-gray-500 italic mt-1">Öğlen kahve içer misin?</p>
                </div>
              </div>

              <div className="flex items-start gap-4 flex-row-reverse">
                <div className="bg-purple-100 p-2 rounded-full mt-1 flex-shrink-0">
                  <Coffee className="w-6 h-6 text-purple-500" />
                </div>
                <div className="flex-1 bg-teal-50 rounded-2xl p-4 rounded-tr-none text-right">
                  <p className="text-xs text-gray-400 font-bold mb-1">Öğrenci B</p>
                  <p className="text-xl font-bold text-gray-800">Hai, nomimas.</p>
                  <p className="text-sm text-gray-500 italic mt-1">Evet, içerim.</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default RolePlayModule;
