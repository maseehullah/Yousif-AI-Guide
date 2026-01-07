
import { GoogleGenAI, Type } from "@google/genai";
import { WordDefinition } from "../types";

const SYSTEM_INSTRUCTION = `
You are Yousif, an English-Urdu learning architect for Pakistani students aged 11-18.
Your task is to provide word meanings in the simplest way possible.

CORE REQUIREMENTS:
1. UI LANGUAGE: All labels must be in English.
2. URDU MEANINGS (Urdu Script): Provide 2 to 3 related meanings in proper Urdu script (Nastaliq). 
3. ROMAN EXPLANATION (Roman Urdu): Explain the word using Urdu language written in English alphabets. Use a friendly, conversational tone.
   Example for "Studied": "Studied ka matlab hai jab aap ne kisi cheez ke baray mein parha ho ya usay ghaur se seekha ho."
4. ENGLISH DEFINITION: Provide a very simple English definition that a 12-year-old would easily understand. No complex academic words.
5. SENTENCES: Provide 3 very short, daily-use English sentences.
6. TOOLTIP DICTIONARY: Map difficult words used in your sentences to short Roman Urdu meanings.

RESPONSE FORMAT: Strict JSON.
`;

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function fetchWordInfo(query: string, retryCount = 0): Promise<WordDefinition> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Explain the word: "${query}" for a teenager.`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            word: { type: Type.STRING },
            urduMeanings: { type: Type.ARRAY, items: { type: Type.STRING } },
            romanExplanation: { type: Type.STRING },
            simpleEnglishMeaning: { type: Type.STRING },
            sentences: { type: Type.ARRAY, items: { type: Type.STRING } },
            sentenceWordsDictionary: { 
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  key: { type: Type.STRING },
                  value: { type: Type.STRING }
                },
                required: ["key", "value"]
              }
            },
            isCorrection: { type: Type.BOOLEAN },
            suggestedWord: { type: Type.STRING }
          },
          required: ["word", "urduMeanings", "romanExplanation", "simpleEnglishMeaning", "sentences", "sentenceWordsDictionary"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("AI returned empty content");
    
    const rawData = JSON.parse(text);
    const dictionary: Record<string, string> = {};
    if (Array.isArray(rawData.sentenceWordsDictionary)) {
      rawData.sentenceWordsDictionary.forEach((item: any) => {
        if (item.key && item.value) {
          dictionary[item.key.toLowerCase()] = item.value;
        }
      });
    }

    return {
      ...rawData,
      sentenceWordsDictionary: dictionary
    };

  } catch (error: any) {
    console.error(`Gemini Attempt ${retryCount + 1} Error:`, error);
    if (retryCount < 2) {
      await delay(1000 * (retryCount + 1));
      return fetchWordInfo(query, retryCount + 1);
    }
    throw new Error("Connection error. Please try again.");
  }
}
