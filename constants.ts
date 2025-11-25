
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

// Manual Feedback Database
// Key format: "wordId-verbId"
interface FeedbackData {
  explanation: string;
  exampleSentence: string;
  romajiSentence: string;
}

export const FEEDBACK_DATA: Record<string, FeedbackData> = {
  // --- 1. Hon (Book) ---
  '1-v6': { explanation: 'Harika! Kitap okunur.', exampleSentence: '本を読みます。', romajiSentence: 'Hon o yomimasu.' },
  '1-v7': { explanation: 'Doğru! Kitapçıdan kitap alınır.', exampleSentence: '本を買います。', romajiSentence: 'Hon o kaimasu.' },
  '1-v5': { explanation: 'Evet, kitap yazılabilir veya yapılabilir.', exampleSentence: '本を作ります。', romajiSentence: 'Hon o tsukurimasu.' },

  // --- 2. Pan (Bread) ---
  '2-v1': { explanation: 'Süper! Ekmek yenir.', exampleSentence: 'パンを食べます。', romajiSentence: 'Pan o tabemasu.' },
  '2-v7': { explanation: 'Doğru! Fırından ekmek alınır.', exampleSentence: 'パンを買います。', romajiSentence: 'Pan o kaimasu.' },
  '2-v5': { explanation: 'Evet, ekmek yapabilirsiniz.', exampleSentence: 'パンを作ります。', romajiSentence: 'Pan o tsukurimasu.' },

  // --- 3. Sushi ---
  '3-v1': { explanation: 'Lezzetli! Suşi yenir.', exampleSentence: 'すしを食べます。', romajiSentence: 'Sushi o tabemasu.' },
  '3-v7': { explanation: 'Doğru! Marketten suşi alınır.', exampleSentence: 'すしを買います。', romajiSentence: 'Sushi o kaimasu.' },
  '3-v5': { explanation: 'Harika! Evde suşi yapılır.', exampleSentence: 'すしを作ります。', romajiSentence: 'Sushi o tsukurimasu.' },

  // --- 4. Keeki (Cake) ---
  '4-v1': { explanation: 'Nefis! Pasta yenir.', exampleSentence: 'ケーキを食べます。', romajiSentence: 'Keeki o tabemasu.' },
  '4-v7': { explanation: 'Doğru! Pastaneden pasta alınır.', exampleSentence: 'ケーキを買います。', romajiSentence: 'Keeki o kaimasu.' },
  '4-v5': { explanation: 'Evet, doğum günü için pasta yapılır.', exampleSentence: 'ケーキを作ります。', romajiSentence: 'Keeki o tsukurimasu.' },

  // --- 5. Niku (Meat) ---
  '5-v1': { explanation: 'Güzel! Et yenir.', exampleSentence: '肉を食べます。', romajiSentence: 'Niku o tabemasu.' },
  '5-v7': { explanation: 'Doğru! Kasaptan et alınır.', exampleSentence: '肉を買います。', romajiSentence: 'Niku o kaimasu.' },
  '5-v5': { explanation: 'Evet, et yemeği yapılır.', exampleSentence: '肉料理を作ります。', romajiSentence: 'Niku ryouri o tsukurimasu.' },

  // --- 6. Tamago (Egg) ---
  '6-v1': { explanation: 'Doğru! Yumurta yenir.', exampleSentence: '卵を食べます。', romajiSentence: 'Tamago o tabemasu.' },
  '6-v7': { explanation: 'Evet, marketten yumurta alınır.', exampleSentence: '卵を買います。', romajiSentence: 'Tamago o kaimasu.' },
  '6-v5': { explanation: 'Doğru, yumurtalı yemek yapılır.', exampleSentence: '卵料理を作ります。', romajiSentence: 'Tamago ryouri o tsukurimasu.' },

  // --- 7. Gohan (Rice/Meal) ---
  '7-v1': { explanation: 'Afiyet olsun! Yemek yenir.', exampleSentence: 'ご飯を食べます。', romajiSentence: 'Gohan o tabemasu.' },
  '7-v5': { explanation: 'Evet, yemek yapılır.', exampleSentence: 'ご飯を作ります。', romajiSentence: 'Gohan o tsukurimasu.' },

  // --- 8. Mizu (Water) ---
  '8-v2': { explanation: 'Çok sağlıklı! Su içilir.', exampleSentence: '水を飲みます。', romajiSentence: 'Mizu o nomimasu.' },
  '8-v7': { explanation: 'Doğru! Bakkaldan su alınır.', exampleSentence: '水を買います。', romajiSentence: 'Mizu o kaimasu.' },

  // --- 9. Koohii (Coffee) ---
  '9-v2': { explanation: 'Harika! Kahve içilir.', exampleSentence: 'コーヒーを飲みます。', romajiSentence: 'Koohii o nomimasu.' },
  '9-v5': { explanation: 'Evet, kahve demlenir/yapılır.', exampleSentence: 'コーヒーを作ります。', romajiSentence: 'Koohii o tsukurimasu.' },
  '9-v7': { explanation: 'Doğru! Kahve satın alınır.', exampleSentence: 'コーヒーを買います。', romajiSentence: 'Koohii o kaimasu.' },

  // --- 10. Koora (Cola) ---
  '10-v2': { explanation: 'Serinletici! Kola içilir.', exampleSentence: 'コーラを飲みます。', romajiSentence: 'Koora o nomimasu.' },
  '10-v7': { explanation: 'Evet, kola satın alınır.', exampleSentence: 'コーラを買います。', romajiSentence: 'Koora o kaimasu.' },

  // --- 11. Asa (Morning) ---
  '11-v9': { explanation: 'Günaydın! Sabah uyanılır.', exampleSentence: 'あさ、起きます。', romajiSentence: 'Asa, okimasu.' },

  // --- 13. Yoru (Night) ---
  '13-v8': { explanation: 'İyi geceler! Gece uyunur.', exampleSentence: 'よる、寝ます。', romajiSentence: 'Yoru, nemasu.' },

  // --- 14. Terebi (TV) ---
  '14-v4': { explanation: 'Doğru! Televizyon izlenir.', exampleSentence: 'テレビを見ます。', romajiSentence: 'Terebi o mimasu.' },
  '14-v7': { explanation: 'Evet, elektronik mağazasından TV alınır.', exampleSentence: 'テレビを買います。', romajiSentence: 'Terebi o kaimasu.' },

  // --- 15. Ongaku (Music) ---
  '15-v3': { explanation: 'Çok güzel! Müzik dinlenir.', exampleSentence: '音楽を聞きます。', romajiSentence: 'Ongaku o kikimasu.' },
  '15-v5': { explanation: 'Harika! Müzik/Şarkı yapılır.', exampleSentence: '音楽を作ります。', romajiSentence: 'Ongaku o tsukurimasu.' },

  // --- 16. Eiga (Movie) ---
  '16-v4': { explanation: 'İyi seyirler! Film izlenir.', exampleSentence: '映画を見ます。', romajiSentence: 'Eiga o mimasu.' },
  '16-v5': { explanation: 'Evet, film çekilir/yapılır.', exampleSentence: '映画を作ります。', romajiSentence: 'Eiga o tsukurimasu.' },
};
