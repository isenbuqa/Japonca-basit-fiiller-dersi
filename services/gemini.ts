
import { ValidationResult } from "../types";
import { FEEDBACK_DATA } from "../constants";

export const generateFeedback = async (wordId: string, verbId: string, isCorrect: boolean): Promise<ValidationResult> => {
  // Simulate a very short delay for a smoother UI feel, though not strictly necessary
  await new Promise(resolve => setTimeout(resolve, 300));

  const key = `${wordId}-${verbId}`;
  const data = FEEDBACK_DATA[key];

  if (isCorrect && data) {
    return {
      isCorrect: true,
      explanation: "Harika! Doğru eşleşme.",
      exampleSentence: data.ja,
      romajiSentence: data.romaji,
      isLoading: false
    };
  } else if (isCorrect) {
    // Fallback if data is missing but logic says correct
    return {
      isCorrect: true,
      explanation: "Tebrikler!",
      exampleSentence: "",
      romajiSentence: "Doğru Cevap!",
      isLoading: false
    };
  } else {
    return {
      isCorrect: false,
      explanation: "Maalesef yanlış eşleşme.",
      exampleSentence: "",
      romajiSentence: "Tekrar dene!",
      isLoading: false
    };
  }
};
