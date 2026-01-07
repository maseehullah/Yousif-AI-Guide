
import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, History, Sparkles, Loader2, X, PlusCircle, 
  Bookmark, Info, Sun, Moon, Wifi, WifiOff 
} from 'lucide-react';
import { fetchWordInfo } from './services/geminiService';
import { WordDefinition, SearchHistoryItem } from './types';
import WordCard from './components/WordCard';

const App: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [definition, setDefinition] = useState<WordDefinition | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('yousif_theme') === 'dark' || 
      (!localStorage.getItem('yousif_theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('yousif_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load history");
      }
    }

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('yousif_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('yousif_theme', 'light');
    }
  }, [isDarkMode]);

  const saveHistory = (word: string) => {
    const newItem: SearchHistoryItem = { word, timestamp: Date.now() };
    const updated = [newItem, ...history.filter(h => h.word.toLowerCase() !== word.toLowerCase())].slice(0, 10);
    setHistory(updated);
    localStorage.setItem('yousif_history', JSON.stringify(updated));
  };

  const handleSearch = async (e?: React.FormEvent, searchWord?: string) => {
    e?.preventDefault();
    const finalWord = searchWord || query.trim();
    if (!finalWord) return;

    if (!isOnline) {
      setError("You appear to be offline. Please connect to the internet to search for new words.");
      return;
    }

    setLoading(true);
    setError(null);
    setQuery(finalWord);

    try {
      const result = await fetchWordInfo(finalWord);
      setDefinition(result);
      saveHistory(result.word);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setError(err.message || "I couldn't find this word. Check the spelling maybe?");
    } finally {
      setLoading(false);
    }
  };

  const resetSearch = () => {
    setDefinition(null);
    setError(null);
    setQuery('');
    setTimeout(() => searchInputRef.current?.focus(), 100);
  };

  return (
    <div className="min-h-screen transition-colors duration-300 dark:bg-[#020617] dark:text-slate-100">
      <nav className="sticky top-0 z-50 bg-white/90 dark:bg-[#0f172a]/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 md:h-20 flex items-center justify-between">
          <div 
            className="flex items-center gap-3 md:gap-4 cursor-pointer group"
            onClick={resetSearch}
          >
            <div className="w-9 h-9 md:w-11 md:h-11 bg-blue-600 dark:bg-blue-500 rounded-xl md:rounded-2xl flex items-center justify-center text-white font-black text-lg md:text-2xl group-hover:bg-blue-700 transition-all duration-300 shadow-xl group-hover:scale-105">
              Y
            </div>
            <div className="flex flex-col">
              <h1 className="font-extrabold text-sm md:text-xl tracking-tight text-slate-900 dark:text-white leading-none">Yousif AI Guide</h1>
              <p className="hidden md:block text-[9px] font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400 mt-1">Intelligent Architect</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 md:gap-6">
            <div className="flex items-center gap-1.5 md:gap-4 px-2 md:px-4 py-1.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-1 md:gap-2">
                {isOnline ? (
                  <Wifi size={14} className="text-emerald-500" />
                ) : (
                  <WifiOff size={14} className="text-rose-500 animate-pulse" />
                )}
                <span className={`hidden sm:inline text-[9px] font-black uppercase tracking-widest ${isOnline ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {isOnline ? 'Connected' : 'Offline'}
                </span>
              </div>
              
              <div className="w-px h-4 bg-slate-200 dark:bg-slate-700"></div>

              <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-1.5 md:p-2 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all active:scale-90 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
                title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </div>

            <button 
              onClick={resetSearch}
              className="flex items-center gap-2 px-3 md:px-6 py-2 md:py-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl md:rounded-2xl font-bold text-[10px] md:text-xs uppercase tracking-widest hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all active:scale-95"
            >
              <PlusCircle size={16} className="md:w-5 md:h-5" />
              <span className="hidden sm:inline">New Search</span>
              <span className="sm:hidden text-[9px]">New</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 md:px-8 pt-12 md:pt-20">
        {!definition && !loading ? (
          <div className="flex flex-col items-center text-center mb-14 md:mb-20 animate-in fade-in duration-1000">
            <div className="w-20 h-20 md:w-28 md:h-28 bg-blue-50 dark:bg-blue-900/20 rounded-[2.5rem] flex items-center justify-center mb-8 md:mb-12 animate-float shadow-inner">
               <Sparkles className="text-blue-600 dark:text-blue-400 w-10 h-10 md:w-14 md:h-14" />
            </div>
            <h2 className="text-4xl md:text-7xl font-black mb-6 md:mb-8 tracking-tighter leading-[1.1] transition-all duration-500">
              <span className="bg-clip-text text-transparent bg-gradient-to-br from-slate-900 to-slate-600 dark:from-blue-200 dark:via-blue-400 dark:to-indigo-300 dark:animate-glow">
                Yousif AI Guide
              </span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-lg md:text-2xl max-w-2xl leading-relaxed">
              Unlock vocabulary with <span className="text-blue-600 dark:text-blue-400 font-bold italic">Roman Urdu</span> and <span className="text-slate-900 dark:text-white font-bold">English</span> explanations instantly.
            </p>
          </div>
        ) : null}

        {(!definition || loading) && (
          <div className="max-w-3xl mx-auto w-full mb-16 md:mb-24">
            <form onSubmit={handleSearch} className="relative group px-1 sm:px-0">
              <div className="absolute -inset-3 bg-blue-500 rounded-[3rem] blur opacity-0 group-focus-within:opacity-10 transition-opacity duration-700"></div>
              <div className="relative">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="What word would you like to learn today?"
                  className="w-full h-16 md:h-24 pl-8 md:pl-12 pr-24 md:pr-32 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-3xl md:rounded-[3.5rem] text-xl md:text-3xl font-bold focus:outline-none focus:border-blue-500 transition-all shadow-xl dark:shadow-blue-950/20 placeholder:text-slate-300 dark:placeholder:text-slate-700 dark:text-white"
                />
                
                <div className="absolute right-3 md:right-5 top-1/2 -translate-y-1/2 flex items-center gap-3">
                  {query && !loading && (
                    <button 
                      type="button" 
                      onClick={() => setQuery('')}
                      className="p-2 text-slate-300 hover:text-slate-500 dark:hover:text-slate-400"
                    >
                      <X size={24} />
                    </button>
                  )}
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-12 h-12 md:w-16 md:h-16 bg-blue-600 dark:bg-blue-500 text-white rounded-2xl md:rounded-3xl flex items-center justify-center hover:bg-blue-700 transition-all shadow-xl active:scale-95 disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="animate-spin" size={24} strokeWidth={3} /> : <Search className="w-6 h-6 md:w-8 md:h-8" strokeWidth={3} />}
                  </button>
                </div>
              </div>
            </form>

            {loading && (
              <div className="mt-12 flex flex-col items-center justify-center gap-4">
                <div className="relative flex items-center justify-center">
                  <div className="absolute w-12 h-12 bg-blue-500 rounded-full animate-ring"></div>
                  <div className="relative w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
                    <Sparkles size={16} className="text-white animate-pulse" />
                  </div>
                </div>
                <div className="text-blue-500 dark:text-blue-400 font-black text-xs md:text-sm uppercase tracking-[0.4em] animate-pulse">
                  Thinking...
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col items-center">
          {error && !loading && (
            <div className="w-full max-w-xl bg-white dark:bg-[#0f172a] p-12 md:p-16 rounded-[3rem] md:rounded-[4rem] border border-rose-100 dark:border-rose-900/20 text-center shadow-2xl">
              <div className="w-20 h-20 md:w-24 md:h-24 bg-rose-50 dark:bg-rose-950/30 rounded-full flex items-center justify-center mx-auto mb-10 text-rose-500">
                <Info size={40} />
              </div>
              <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-4">Search Update</h3>
              <p className="text-slate-500 dark:text-slate-400 font-medium mb-12 text-base md:text-lg leading-relaxed">{error}</p>
              <button 
                onClick={resetSearch}
                className="bg-blue-600 px-12 py-5 rounded-[2rem] font-black text-white hover:bg-blue-700 transition-all text-xs uppercase tracking-[0.2em] shadow-lg"
              >
                Continue Search
              </button>
            </div>
          )}

          {!loading && definition && (
            <WordCard 
              data={definition} 
              onWordClick={(word) => handleSearch(undefined, word)} 
              onBack={resetSearch}
            />
          )}

          {!loading && !definition && history.length > 0 && (
            <div className="w-full max-w-3xl mt-6 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300 px-2 sm:px-0">
              <div className="flex items-center gap-8 mb-10">
                <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800"></div>
                <div className="flex items-center gap-3 text-slate-400 dark:text-slate-500 text-[10px] md:text-[11px] font-black uppercase tracking-[0.5em]">
                  <History size={16} />
                  Recently Explored
                </div>
                <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800"></div>
              </div>
              <div className="flex flex-wrap justify-center gap-3 md:gap-4">
                {history.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSearch(undefined, item.word)}
                    className="group relative px-5 md:px-8 py-3 md:py-4 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl md:rounded-[2rem] text-slate-600 dark:text-slate-200 hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all text-sm md:text-base font-bold shadow-sm hover:shadow-xl active:scale-95"
                  >
                    <div className="flex items-center gap-3">
                      <Bookmark size={16} className="text-slate-300 dark:text-slate-600 group-hover:text-blue-400 transition-colors" />
                      {item.word}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {!definition && (
        <footer className="mt-32 md:mt-48 border-t border-slate-100 dark:border-slate-900 pt-16 pb-12 text-center transition-all">
          <div className="flex flex-col items-center gap-4">
             <div className="flex items-center gap-8 mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800"></span>
                <p className="text-slate-400 dark:text-slate-600 text-[10px] md:text-[11px] font-black tracking-[0.6em] uppercase">Digitizing Education for Pakistan</p>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800"></span>
             </div>
             <p className="text-slate-400 dark:text-slate-500 text-[8px] md:text-[9px] font-black uppercase tracking-widest">Architected by Agha Maseehullah Khan</p>
          </div>
        </footer>
      )}
    </div>
  );
};

export default App;
