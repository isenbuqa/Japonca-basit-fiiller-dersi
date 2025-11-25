
export interface WordItem {
  id: string;
  text: string; // The Japanese word (e.g., 本)
  romaji?: string;
  image: string; // Emoji or Image URL
  category: 'object' | 'time' | 'place';
  validVerbIds: string[]; // List of verb IDs that make sense with this word
}

export interface VerbItem {
  id: string;
  text: string; // The Japanese verb (e.g., 読みます)
  romaji?: string;
}

export interface ValidationResult {
  isCorrect: boolean;
  explanation?: string;
  exampleSentence?: string;
  romajiSentence?: string;
  isLoading?: boolean;
}

export type GameState = 'start' | 'playing' | 'validating' | 'feedback' | 'finished';
