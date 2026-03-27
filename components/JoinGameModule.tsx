import React, { useState } from 'react';
import { supabase } from '../utils/supabase';
import { Gamepad2, Loader2, ArrowRight } from 'lucide-react';
import PlayerScreen from './PlayerScreen';

interface JoinGameModuleProps {
  onBack: () => void;
}

export default function JoinGameModule({ onBack }: JoinGameModuleProps) {
  const [pin, setPin] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [joinedRoomId, setJoinedRoomId] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (pin.length !== 6) {
      setError("PIN kodu 6 haneli olmalıdır.");
      return;
    }
    if (nickname.trim().length < 2) {
      setError("Lütfen en az 2 harfli bir takma ad girin.");
      return;
    }

    setLoading(true);

    try {
      // Find room
      const { data: rooms, error: roomError } = await supabase
        .from('game_rooms')
        .select('id, status')
        .eq('pin', pin.trim());

      if (roomError || !rooms || rooms.length === 0) {
        setError(`Oda bulunamadı! (PIN: ${pin}) Lütfen kodu kontrol edin.`);
        setLoading(false);
        return;
      }

      const room = rooms[0];
      if (room.status !== 'waiting') {
        setError("Bu oyun zaten başlamış veya bitmiş!");
        setLoading(false);
        return;
      }

      // Join room
      const { data: player, error: playerError } = await supabase
        .from('game_players')
        .insert([{ room_id: room.id, nickname: nickname.trim(), score: 0 }])
        .select()
        .single();

      if (playerError || !player) {
         setError("Odaya katılırken bir hata oluştu.");
         setLoading(false);
         return;
      }

      // Success
      setJoinedRoomId(room.id);
      setPlayerId(player.id);
    } catch (err: any) {
       setError("Bağlantı hatası.");
    }

    setLoading(false);
  };

  if (joinedRoomId && playerId) {
    return <PlayerScreen roomId={joinedRoomId} playerId={playerId} nickname={nickname} onLeave={onBack} />;
  }

  return (
    <div className="h-full bg-indigo-600 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-2xl w-full max-w-md animate-fade-in text-center">
        <Gamepad2 className="w-20 h-20 text-indigo-500 mx-auto mb-6" />
        <h1 className="text-3xl font-black text-gray-800 mb-2 tracking-tight">Canlı Oyun</h1>
        <p className="text-gray-500 mb-8 font-medium">Tahtadaki PIN kodunu ve ismini girerek oyuna katıl!</p>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl font-bold mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleJoin} className="space-y-4">
          <div>
             <input
               type="text"
               value={pin}
               onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
               placeholder="6 Haneli PIN"
               className="w-full text-center text-3xl font-black tracking-widest px-6 py-4 bg-gray-100 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl transition-all outline-none"
             />
          </div>
          <div>
             <input
               type="text"
               value={nickname}
               onChange={e => setNickname(e.target.value)}
               placeholder="Takma Adın"
               maxLength={15}
               className="w-full text-center text-xl font-bold px-6 py-4 bg-gray-100 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl transition-all outline-none"
             />
          </div>

          <button
            type="submit"
            disabled={loading || pin.length !== 6 || nickname.trim().length < 2}
            className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white font-black text-2xl py-4 rounded-2xl shadow-[0_6px_0_rgb(67,56,202)] disabled:shadow-none active:translate-y-[6px] active:shadow-none transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-8 h-8 animate-spin" /> : "KATIL"}
          </button>
        </form>

        <button onClick={onBack} className="mt-8 text-gray-400 font-bold hover:text-gray-600 transition-colors">Ayrıl ve Menüye Dön</button>
      </div>
    </div>
  );
}
