import React, { useEffect, useState } from 'react';
import { X, Sparkles, ExternalLink, AlertCircle } from 'lucide-react';
import { askPhysicsDoubt } from '../services/geminiService';
import { Source } from '../types';

interface DoubtOverlayProps {
  query: string;
  onClose: () => void;
}

export const DoubtOverlay: React.FC<DoubtOverlayProps> = ({ query, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [answer, setAnswer] = useState<string>('');
  const [sources, setSources] = useState<Source[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;
    
    const fetchAnswer = async () => {
      setLoading(true);
      try {
        const result = await askPhysicsDoubt(query);
        if (mounted) {
          setAnswer(result.text);
          setSources(result.sources);
        }
      } catch (err) {
        if (mounted) setError(true);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    if (query) fetchAnswer();

    return () => { mounted = false; };
  }, [query]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Content Card */}
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-slate-800 bg-slate-950/50">
          <div>
            <div className="flex items-center gap-2 text-sky-400 mb-1">
              <Sparkles size={16} />
              <span className="text-xs font-bold tracking-wider uppercase">AI Physics Tutor</span>
            </div>
            <h3 className="text-slate-100 font-medium leading-tight pr-4">{query}</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 min-h-[150px] max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8 text-slate-500 space-y-3">
              <div className="w-8 h-8 border-4 border-sky-500/30 border-t-sky-500 rounded-full animate-spin" />
              <p className="text-sm animate-pulse">Analyzing concepts...</p>
            </div>
          ) : error ? (
            <div className="flex items-center gap-3 text-rose-400 p-4 bg-rose-950/20 rounded-xl border border-rose-900/50">
              <AlertCircle size={24} />
              <p className="text-sm">Failed to load answer. Please try again.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="prose prose-invert prose-sm max-w-none text-slate-200 leading-relaxed">
                <p>{answer}</p>
              </div>

              {sources.length > 0 && (
                <div className="pt-4 border-t border-slate-800">
                  <p className="text-xs text-slate-500 font-semibold uppercase mb-3">Sources</p>
                  <div className="flex flex-wrap gap-2">
                    {sources.slice(0, 3).map((source, idx) => (
                      <a
                        key={idx}
                        href={source.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 px-3 py-1.5 rounded-lg transition-colors truncate max-w-full"
                      >
                        <span className="truncate max-w-[150px]">{source.title}</span>
                        <ExternalLink size={10} className="shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Footer */}
        {!loading && (
           <div className="p-3 bg-slate-950/50 border-t border-slate-800 text-center">
             <button onClick={onClose} className="text-xs text-slate-500 hover:text-slate-300 font-medium">
               Tap to close
             </button>
           </div>
        )}
      </div>
    </div>
  );
};