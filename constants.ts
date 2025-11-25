
import { WordItem, VerbItem } from './types';

// Verb IDs for reference:
// v1: Eat, v2: Drink, v3: Listen, v4: Watch, v5: Make, v6: Read, v7: Buy, v8: Sleep, v9: Wake

export const VERBS: VerbItem[] = [
  { id: 'v1', text: '食べます', romaji: 'Tabemas' }, // Eat
  { id: 'v2', text: '飲みます', romaji: 'Nomimas' }, // Drink
  { id: 'v3', text: '聞きます', romaji: 'Kikimas' }, // Listen
  { id: 'v4', text: '見ます', romaji: 'Mimas' }, // See/Watch
  { id: 'v5', text: '作ります', romaji: 'Tsukurimas' }, // Make
  { id: 'v6', text: '読みます', romaji: 'Yomimas' }, // Read
  { id: 'v7', text: '買います', romaji: 'Kaimas' }, // Buy
  { id: 'v8', text: '寝ます', romaji: 'Nemas' }, // Sleep
  { id: 'v9', text: '起きます', romaji: 'Okimas' }, // Wake up
];

export const WORDS: WordItem[] = [
  { id: '1', text: '本', romaji: 'Hon', image: '📚', category: 'object', validVerbIds: ['v6', 'v7', 'v5'] }, // Read, Buy, Make
  { id: '2', text: 'パン', romaji: 'Pan', image: '🍞', category: 'object', validVerbIds: ['v1', 'v5', 'v7'] }, // Eat, Make, Buy
  { id: '3', text: 'すし', romaji: 'Sushi', image: '🍣', category: 'object', validVerbIds: ['v1', 'v5', 'v7'] }, // Eat, Make, Buy
  { id: '4', text: 'ケーキ', romaji: 'Keeki', image: '🍰', category: 'object', validVerbIds: ['v1', 'v5', 'v7'] }, // Eat, Make, Buy
  { id: '5', text: '肉', romaji: 'Niku', image: '🥩', category: 'object', validVerbIds: ['v1', 'v5', 'v7'] }, // Eat, Make, Buy
  { id: '6', text: '卵', romaji: 'Tamago', image: '🥚', category: 'object', validVerbIds: ['v1', 'v5', 'v7'] }, // Eat, Make, Buy
  { id: '7', text: 'ご飯', romaji: 'Gohan', image: '🍚', category: 'object', validVerbIds: ['v1', 'v5'] }, // Eat, Make
  { id: '8', text: '水', romaji: 'Mizu', image: '💧', category: 'object', validVerbIds: ['v2', 'v7'] }, // Drink, Buy
  { id: '9', text: 'コーヒー', romaji: 'Koohii', image: '☕', category: 'object', validVerbIds: ['v2', 'v5', 'v7'] }, // Drink, Make, Buy
  { id: '10', text: 'コーラ', romaji: 'Koora', image: '🥤', category: 'object', validVerbIds: ['v2', 'v7'] }, // Drink, Buy
  { id: '11', text: 'あさ', romaji: 'Asa', image: '🌅', category: 'time', validVerbIds: ['v9'] }, // Wake up
  { id: '13', text: 'よる', romaji: 'Yoru', image: '🌙', category: 'time', validVerbIds: ['v8'] }, // Sleep
  { id: '14', text: 'テレビ', romaji: 'Terebi', image: '📺', category: 'object', validVerbIds: ['v4', 'v7'] }, // Watch, Buy
  { id: '15', text: '音楽', romaji: 'Ongaku', image: '🎵', category: 'object', validVerbIds: ['v3', 'v5'] }, // Listen, Make
  { id: '16', text: '映画', romaji: 'Eiga', image: '🎬', category: 'object', validVerbIds: ['v4', 'v5'] }, // Watch, Make
];

// Predefined sentences for feedback (No AI needed)
// Format: "wordId-verbId": { ja: string, romaji: string, explanation: string }
export const FEEDBACK_DATA: Record<string, { ja: string, romaji: string, explanation: string }> = {
  // Hon (Book)
  '1-v6': { ja: 'ほんをよみます。', romaji: 'Hon o yomimas.', explanation: 'Kitap okurum.' },
  '1-v7': { ja: 'ほんをかいます。', romaji: 'Hon o kaimas.', explanation: 'Kitap satın alırım.' },
  '1-v5': { ja: 'ほんをつくります。', romaji: 'Hon o tsukurimas.', explanation: 'Kitap yazarım/yaparım.' },

  // Pan (Bread)
  '2-v1': { ja: 'パンをたべます。', romaji: 'Pan o tabemas.', explanation: 'Ekmek yerim.' },
  '2-v5': { ja: 'パンをつくります。', romaji: 'Pan o tsukurimas.', explanation: 'Ekmek yaparım.' },
  '2-v7': { ja: 'パンをかいます。', romaji: 'Pan o kaimas.', explanation: 'Ekmek alırım.' },

  // Sushi
  '3-v1': { ja: 'すしをたべます。', romaji: 'Sushi o tabemas.', explanation: 'Suşi yerim.' },
  '3-v5': { ja: 'すしをつくります。', romaji: 'Sushi o tsukurimas.', explanation: 'Suşi yaparım.' },
  '3-v7': { ja: 'すしをかいます。', romaji: 'Sushi o kaimas.', explanation: 'Suşi alırım.' },

  // Keeki (Cake)
  '4-v1': { ja: 'ケーキをたべます。', romaji: 'Keeki o tabemas.', explanation: 'Pasta yerim.' },
  '4-v5': { ja: 'ケーキをつくります。', romaji: 'Keeki o tsukurimas.', explanation: 'Pasta yaparım.' },
  '4-v7': { ja: 'ケーキをかいます。', romaji: 'Keeki o kaimas.', explanation: 'Pasta alırım.' },

  // Niku (Meat)
  '5-v1': { ja: 'にくをたべます。', romaji: 'Niku o tabemas.', explanation: 'Et yerim.' },
  '5-v5': { ja: 'にくりょうりをつくります。', romaji: 'Niku ryouri o tsukurimas.', explanation: 'Et yemeği yaparım.' },
  '5-v7': { ja: 'にくをかいます。', romaji: 'Niku o kaimas.', explanation: 'Et alırım.' },

  // Tamago (Egg)
  '6-v1': { ja: 'たまごをたべます。', romaji: 'Tamago o tabemas.', explanation: 'Yumurta yerim.' },
  '6-v5': { ja: 'たまごをつくります。', romaji: 'Tamago o tsukurimas.', explanation: 'Yumurta pişiririm.' },
  '6-v7': { ja: 'たまごをかいます。', romaji: 'Tamago o kaimas.', explanation: 'Yumurta alırım.' },

  // Gohan (Rice/Meal)
  '7-v1': { ja: 'ごはんをたべます。', romaji: 'Gohan o tabemas.', explanation: 'Yemek yerim.' },
  '7-v5': { ja: 'ごはんをつくります。', romaji: 'Gohan o tsukurimas.', explanation: 'Yemek yaparım.' },

  // Mizu (Water)
  '8-v2': { ja: 'みずをのみます。', romaji: 'Mizu o nomimas.', explanation: 'Su içerim.' },
  '8-v7': { ja: 'みずをかいます。', romaji: 'Mizu o kaimas.', explanation: 'Su alırım.' },

  // Koohii (Coffee)
  '9-v2': { ja: 'コーヒーをのみます。', romaji: 'Koohii o nomimas.', explanation: 'Kahve içerim.' },
  '9-v5': { ja: 'コーヒーをつくります。', romaji: 'Koohii o tsukurimas.', explanation: 'Kahve yaparım.' },
  '9-v7': { ja: 'コーヒーをかいます。', romaji: 'Koohii o kaimas.', explanation: 'Kahve alırım.' },

  // Koora (Cola)
  '10-v2': { ja: 'コーラをのみます。', romaji: 'Koora o nomimas.', explanation: 'Kola içerim.' },
  '10-v7': { ja: 'コーラをかいます。', romaji: 'Koora o kaimas.', explanation: 'Kola alırım.' },

  // Asa (Morning)
  '11-v9': { ja: 'あさ、おきます。', romaji: 'Asa, okimas.', explanation: 'Sabah uyanırım.' },

  // Yoru (Night)
  '13-v8': { ja: 'よる、ねます。', romaji: 'Yoru, nemas.', explanation: 'Gece uyurum.' },

  // Terebi (TV)
  '14-v4': { ja: 'テレビをみます。', romaji: 'Terebi o mimas.', explanation: 'Televizyon izlerim.' },
  '14-v7': { ja: 'テレビをかいます。', romaji: 'Terebi o kaimas.', explanation: 'Televizyon alırım.' },

  // Ongaku (Music)
  '15-v3': { ja: 'おんがくをききます。', romaji: 'Ongaku o kikimas.', explanation: 'Müzik dinlerim.' },
  '15-v5': { ja: 'おんがくをつくります。', romaji: 'Ongaku o tsukurimas.', explanation: 'Müzik yaparım.' },

  // Eiga (Movie)
  '16-v4': { ja: 'えいがをみます。', romaji: 'Eiga o mimas.', explanation: 'Film izlerim.' },
  '16-v5': { ja: 'えいがをつくります。', romaji: 'Eiga o tsukurimas.', explanation: 'Film yaparım.' },
};
