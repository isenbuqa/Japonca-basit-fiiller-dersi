
import { ValidationResult } from "../types";
import { FEEDBACK_DATA } from "../constants";

export const generateFeedback = async (wordId: string, verbId: string, isCorrect: boolean): Promise<ValidationResult> => {
  // Simulate a very short network delay for better UX (optional, can be removed for instant)
  // await new Promise(resolve => setTimeout(resolve, 300));

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
  const data = FEEDBACK_DATA[key];

  if (data) {
    return {
      isCorrect: true,
      explanation: data.explanation,
      exampleSentence: data.exampleSentence,
      romajiSentence: data.romajiSentence,
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
