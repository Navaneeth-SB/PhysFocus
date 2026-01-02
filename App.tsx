import React, { useState } from 'react';
import { Timer } from './components/Timer';
import { Notes } from './components/Notes';
import { DoubtOverlay } from './components/DoubtOverlay';
import { StudySession, TimerMode } from './types';
import { Atom, Search } from 'lucide-react';

const App: React.FC = () => {
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDoubt, setActiveDoubt] = useState<string | null>(null);

  const handleSessionComplete = (mode: TimerMode, duration: number) => {
    const newSession: StudySession = {
      date: new Date().toISOString(),
      durationMinutes: duration,
      mode: mode
    };
    setSessions(prev => [...prev, newSession]);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setActiveDoubt(searchQuery);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-sky-500/30 flex flex-col items-center relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-sky-900/10 to-transparent pointer-events-none" />

      {/* Header & Search Area */}
      <div className="w-full max-w-4xl px-6 pt-6 pb-4 z-10 flex flex-col gap-6">
        <header className="flex justify-between items-center w-full">
          <div className="flex items-center gap-2">
             <div className="bg-sky-500/20 p-2 rounded-xl">
               <Atom className="text-sky-400 w-5 h-5" />
             </div>
             <h1 className="text-lg font-bold tracking-tight text-white">
                Phys<span className="text-sky-400">Focus</span>
             </h1>
          </div>
          <div className="hidden sm:block text-xs font-mono text-slate-500 border border-slate-800 px-2 py-1 rounded-md">
            VERSION 2.0
          </div>
        </header>

        {/* Top Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative group w-full max-w-xl mx-auto">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-500 group-focus-within:text-sky-400 transition-colors" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-4 py-3 bg-slate-800/80 border border-slate-700 rounded-2xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-transparent transition-all shadow-sm"
            placeholder="Ask a quick physics doubt..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
      </div>

      {/* Main Content: Responsive Layout */}
      <main className="flex-1 w-full max-w-5xl px-4 py-6 z-0 flex flex-col md:flex-row gap-6 md:items-start justify-center">
        
        {/* Timer Section: Centered on Mobile, Left on Desktop */}
        <div className="w-full md:w-[45%] flex justify-center md:justify-end">
           <div className="w-full max-w-sm">
             <Timer onSessionComplete={handleSessionComplete} />
           </div>
        </div>
        
        {/* Notes Section: Stacked on Mobile, Right on Desktop */}
        <div className="w-full md:w-[55%] flex justify-center md:justify-start min-h-[350px]">
           <div className="w-full max-w-md md:max-w-full h-full">
              <Notes />
           </div>
        </div>

      </main>

      {/* Doubt Overlay */}
      {activeDoubt && (
        <DoubtOverlay 
          query={activeDoubt} 
          onClose={() => {
            setActiveDoubt(null);
            setSearchQuery('');
          }} 
        />
      )}
    </div>
  );
};

export default App;