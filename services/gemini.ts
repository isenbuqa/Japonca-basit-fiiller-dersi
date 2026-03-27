
import { ValidationResult } from "../types";
import { supabase } from '../utils/supabase';

export const generateFeedback = async (wordId: string, verbId: string, isCorrect: boolean): Promise<ValidationResult> => {
  if (!isCorrect) {
    return {
      isCorrect: false,
      explanation: "Maalesef bu eşleşme doğru değil.",
      exampleSentence: "...",
      romajiSentence: "...",
      isLoading: false
    };
  }

  // Look up manual data
  const key = `${wordId}-${verbId}`;
  const { data, error } = await supabase.from('feedback_data').select('*').eq('id', key).single();

  if (data && !error) {
    return {
      isCorrect: true,
      explanation: data.explanation,
      exampleSentence: data.example_sentence,
      romajiSentence: data.romaji_sentence,
      isLoading: false
    };
  }

  // Fallback if data is missing but logic says it's correct
  return {
    isCorrect: true,
    explanation: "Doğru eşleşme!",
    exampleSentence: "Yüklenemedi.",
    romajiSentence: "-",
    isLoading: false
  };
};
