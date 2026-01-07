
export interface WordDefinition {
  word: string;
  simpleEnglishMeaning: string;
  romanExplanation: string; // Urdu explanation written in English letters
  urduMeanings: string[]; // 2-3 related meanings in Urdu script
  sentences: string[];
  sentenceWordsDictionary: Record<string, string>; // Map of words in sentences to their short meanings for tooltips
  suggestedWord?: string;
  isCorrection?: boolean;
}

export interface SearchHistoryItem {
  word: string;
  timestamp: number;
}
