
import React, { useState } from 'react';
import { WordDefinition } from '../types';
import { Sparkles, Quote, Info, ArrowLeft, Cpu } from 'lucide-react';

interface WordCardProps {
  data: WordDefinition;
  onWordClick: (word: string) => void;
  onBack: () => void;
}

const WordCard: React.FC<WordCardProps> = ({ data, onWordClick, onBack }) => {
  const [hoveredWord, setHoveredWord] = useState<{ text: string; rect: DOMRect | null; meaning: string | null } | null>(null);

  const handleMouseEnter = (e: React.MouseEvent, word: string) => {
    const cleanWord = word.toLowerCase().replace(/[.,!?;:()]/g, '');
    const meaning = data.sentenceWordsDictionary[cleanWord] || null;
    if (meaning) {
      setHoveredWord({
        text: word,
        rect: e.currentTarget.getBoundingClientRect(),
        meaning
      });
    }
  };

  const handleMouseLeave = () => {
    setHoveredWord(null);
  };

  const renderSentence = (sentence: string) => {
    const words = sentence.split(/(\s+)/);
    return words.map((word, i) => {
      const cleanWord = word.toLowerCase().replace(/[.,!?;:()]/g, '');
      const isTarget = cleanWord === data.word.toLowerCase();
      const hasMeaning = !!data.sentenceWordsDictionary[cleanWord];

      if (word.trim().length === 0) return word;

      return (
        <span
          key={i}
          onMouseEnter={(e) => handleMouseEnter(e, word)}
          onMouseLeave={handleMouseLeave}
          onClick={() => hasMeaning ? onWordClick(cleanWord) : undefined}
          className={`px-0.5 rounded transition-all duration-200 cursor-pointer ${
            isTarget 
              ? 'font-extrabold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 ring-1 ring-blue-100 dark:ring-blue-800' 
              : hasMeaning 
                ? 'text-slate-700 dark:text-slate-200 border-b-2 border-dashed border-blue-300 dark:border-blue-700 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950' 
                : 'text-slate-500 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          {word}
        </span>
      );
    });
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-10 duration-1000 px-2 sm:px-4">
      
      {/* Tooltip for Difficult Words */}
      {hoveredWord && hoveredWord.rect && (
        <div 
          className="fixed z-[9999] bg-slate-900 dark:bg-blue-600 text-white text-[12px] py-2 px-4 rounded-2xl shadow-2xl pointer-events-none animate-in fade-in zoom-in duration-200 -translate-x-1/2 -translate-y-full"
          style={{ 
            left: hoveredWord.rect.left + hoveredWord.rect.width / 2, 
            top: hoveredWord.rect.top - 12 
          }}
        >
          <div className="flex flex-col gap-0.5 text-center">
            <span className="text-blue-200 font-bold uppercase tracking-tighter opacity-70">Meaning</span>
            <span className="font-bold text-sm whitespace-nowrap">{hoveredWord.meaning}</span>
          </div>
          <div className="absolute left-1/2 -bottom-1.5 -translate-x-1/2 w-3 h-3 bg-slate-900 dark:bg-blue-600 rotate-45"></div>
        </div>
      )}

      {/* 1. HERO SECTION */}
      <div className="relative overflow-hidden bg-white dark:bg-[#0f172a] p-8 md:p-14 lg:p-16 rounded-[2.5rem] md:rounded-[4rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center text-center transition-colors">
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-blue-50/50 dark:bg-blue-900/10 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="relative w-full max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-[9px] md:text-[10px] font-extrabold uppercase tracking-[0.2em] mb-8 border border-blue-100 dark:border-blue-800 shadow-sm">
            <Sparkles size={12} className="md:w-3.5 md:h-3.5" />
            Urdu Meanings | اردو کے معنی
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-x-4 md:gap-x-8 gap-y-4 mb-6">
            {data.urduMeanings.map((m, idx) => (
              <React.Fragment key={idx}>
                <p className="urdu-text text-4xl md:text-5xl lg:text-5xl font-medium text-slate-900 dark:text-white leading-normal transition-all">
                  {m}
                </p>
                {idx < data.urduMeanings.length - 1 && (
                  <span className="text-3xl md:text-4xl text-slate-300 dark:text-slate-700 select-none leading-none">،</span>
                )}
              </React.Fragment>
            ))}
          </div>

          <div className="h-px w-24 md:w-32 bg-gradient-to-r from-transparent via-blue-100 dark:via-blue-800 to-transparent mx-auto mb-6"></div>
          
          <h2 className="text-xl md:text-2xl font-black text-slate-400 dark:text-slate-600 tracking-[0.3em] uppercase select-none transition-colors">
            {data.word}
          </h2>
        </div>
      </div>

      {/* 2. EXPLANATION SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 md:gap-8">
        <div className="md:col-span-3 bg-blue-600 dark:bg-blue-700 p-8 md:p-14 rounded-[3rem] shadow-xl text-white relative overflow-hidden group transition-colors">
          <Quote className="absolute -top-6 -right-6 w-36 h-36 text-white/10 group-hover:scale-110 transition-transform duration-700 pointer-events-none" />
          <div className="relative">
             <h3 className="text-[10px] font-black text-blue-100 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
               <span className="w-10 h-px bg-blue-400"></span>
               In Easy Roman Urdu
             </h3>
             <p className="text-2xl md:text-3xl font-bold leading-tight">
               "{data.romanExplanation}"
             </p>
          </div>
        </div>

        <div className="md:col-span-2 bg-white dark:bg-[#0f172a] p-8 md:p-12 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-center transition-colors">
          <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-4 flex items-center gap-3">
             <span className="w-8 h-px bg-slate-200 dark:bg-slate-800"></span>
             Simple Meaning
          </h3>
          <p className="text-xl md:text-2xl text-slate-700 dark:text-slate-200 font-semibold leading-relaxed transition-colors">
            {data.simpleEnglishMeaning}
          </p>
        </div>
      </div>

      {/* 3. PRACTICE SECTION */}
      <div className="bg-white dark:bg-[#0f172a] p-8 md:p-16 rounded-[3rem] md:rounded-[4rem] border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-14">
          <div>
            <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-1 flex items-center gap-3">
               Student Practice
               <span className="w-16 h-px bg-slate-200 dark:bg-slate-800"></span>
            </h3>
            <p className="text-slate-400 dark:text-slate-500 text-sm font-medium">Daily use examples for you</p>
          </div>
          
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight">
            <Info size={14} className="text-blue-500" />
            Hover underlined words for Urdu help
          </div>
        </div>

        <div className="space-y-10 md:space-y-14">
          {data.sentences.map((sentence, idx) => (
            <div key={idx} className="group flex gap-6 md:gap-10 items-start">
              <div className="flex-none">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl md:rounded-[2rem] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-600 font-black text-sm md:text-lg group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all duration-300">
                  {idx + 1}
                </div>
              </div>
              <div className="flex-1 pt-2 md:pt-4">
                <p className="text-2xl md:text-3xl lg:text-4xl text-slate-500 dark:text-slate-400 leading-snug group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors duration-300">
                  {renderSentence(sentence)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. NAVIGATION FOOTER */}
      <div className="flex flex-col items-center gap-10 pt-10 pb-16">
        <button 
          onClick={onBack}
          className="flex items-center gap-4 px-10 py-5 bg-blue-600 text-white border border-blue-600 rounded-[2rem] font-black text-[11px] md:text-xs uppercase tracking-[0.2em] hover:bg-blue-700 transition-all shadow-2xl active:scale-95 group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Back to Search / نیا لفظ تلاش کریں
        </button>

        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-6">
            <span className="h-px w-8 bg-slate-200 dark:bg-slate-800"></span>
            <div className="px-6 py-2.5 bg-white dark:bg-[#0f172a] rounded-full border border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-[0.4em] flex items-center gap-3">
               <Cpu size={12} className="text-blue-500/50" />
               Yousif AI Guide
               <div className="w-1.5 h-1.5 rounded-full bg-blue-500/40"></div>
            </div>
            <span className="h-px w-8 bg-slate-200 dark:bg-slate-800"></span>
          </div>
          <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-300 dark:text-slate-700">App Created By Agha Maseehullah Khan</p>
        </div>
      </div>
    </div>
  );
};

export default WordCard;
