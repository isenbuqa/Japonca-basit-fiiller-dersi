
import { GoogleGenAI, Type } from "@google/genai";
import { ValidationResult } from "../types";

const apiKey = process.env.API_KEY || '';

const ai = new GoogleGenAI({ apiKey });

export const generateFeedback = async (word: string, verb: string, isCorrect: boolean): Promise<ValidationResult> => {
  try {
    const prompt = `
      Sen bir Japonca öğretmenisin. Öğrenci "${word}" kelimesi ile "${verb}" fiilini eşleştirdi.
      Bu eşleşme: ${isCorrect ? "DOĞRU" : "YANLIŞ"}.

      Görev:
      1. isCorrect değeri ${isCorrect} olarak kalmalı.
      2. explanation: Türkçe olarak kısa bir geri bildirim ver. 
         - Doğruysa: "Harika!", "Süper!", "Doğru eşleşme." gibi kısa teşvik.
         - Yanlışsa: Neden yanlış olduğunu veya doğrusunun ne olması gerektiğini çok kısa açıkla (maksimum 1 cümle).
      3. exampleSentence: Bu kelimeleri kullanan basit (N5 seviyesi) bir Japonca cümle yaz.
      4. romajiSentence: Cümlenin okunuşu.

      JSON yanıt ver.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            explanation: { type: Type.STRING },
            exampleSentence: { type: Type.STRING },
            romajiSentence: { type: Type.STRING },
          },
          required: ["explanation", "exampleSentence", "romajiSentence"],
        },
      },
    });

    if (response.text) {
      const data = JSON.parse(response.text);
      return {
        isCorrect,
        ...data,
        isLoading: false
      };
    }
    
    throw new Error("No response");

  } catch (error) {
    console.error("Gemini failed:", error);
    return {
      isCorrect,
      explanation: isCorrect ? "Tebrikler!" : "Yanlış eşleşme.",
      exampleSentence: `${word} ... ${verb}`,
      romajiSentence: "-",
      isLoading: false
    };
  }
};
