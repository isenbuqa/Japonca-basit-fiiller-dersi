
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
  { id: '4', text: 'ケーキ', romaji: 'Kēki', image: '🍰', category: 'object', validVerbIds: ['v1', 'v5', 'v7'] }, // Eat, Make, Buy
  { id: '5', text: '肉', romaji: 'Niku', image: '🥩', category: 'object', validVerbIds: ['v1', 'v5', 'v7'] }, // Eat, Make, Buy
  { id: '6', text: '卵', romaji: 'Tamago', image: '🥚', category: 'object', validVerbIds: ['v1', 'v5', 'v7'] }, // Eat, Make, Buy
  { id: '7', text: 'ご飯', romaji: 'Gohan', image: '🍚', category: 'object', validVerbIds: ['v1', 'v5'] }, // Eat, Make
  { id: '8', text: '水', romaji: 'Mizu', image: '💧', category: 'object', validVerbIds: ['v2', 'v7'] }, // Drink, Buy
  { id: '9', text: 'コーヒー', romaji: 'Kōhī', image: '☕', category: 'object', validVerbIds: ['v2', 'v5', 'v7'] }, // Drink, Make, Buy
  { id: '10', text: 'コーラ', romaji: 'Kōra', image: '🥤', category: 'object', validVerbIds: ['v2', 'v7'] }, // Drink, Buy
  { id: '11', text: 'あさ', romaji: 'Asa', image: '🌅', category: 'time', validVerbIds: ['v9'] }, // Wake up
  { id: '13', text: 'よる', romaji: 'Yoru', image: '🌙', category: 'time', validVerbIds: ['v8'] }, // Sleep
  { id: '14', text: 'テレビ', romaji: 'Terebi', image: '📺', category: 'object', validVerbIds: ['v4', 'v7'] }, // Watch, Buy
  { id: '15', text: '音楽', romaji: 'Ongaku', image: '🎵', category: 'object', validVerbIds: ['v3', 'v5'] }, // Listen, Make
  { id: '16', text: '映画', romaji: 'Eiga', image: '🎬', category: 'object', validVerbIds: ['v4', 'v5'] }, // Watch, Make
];
