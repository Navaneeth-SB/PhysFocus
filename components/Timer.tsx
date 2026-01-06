import React, { useState, useEffect } from 'react';
import { TimerMode, TimerDurations } from '../types';
import { Play, Pause, RotateCcw, Coffee, Brain, BatteryCharging, Settings, Check, Volume2 } from 'lucide-react';

interface TimerProps {
  onSessionComplete: (mode: TimerMode, duration: number) => void;
}

const DEFAULT_DURATIONS: TimerDurations = {
  [TimerMode.FOCUS]: 25,
  [TimerMode.SHORT_BREAK]: 5,
  [TimerMode.LONG_BREAK]: 15,
};

const MODE_CONFIG = {
  [TimerMode.FOCUS]: { label: 'Focus', color: 'text-sky-400', stroke: '#38bdf8', icon: Brain },
  [TimerMode.SHORT_BREAK]: { label: 'Short', color: 'text-emerald-400', stroke: '#34d399', icon: Coffee },
  [TimerMode.LONG_BREAK]: { label: 'Long', color: 'text-indigo-400', stroke: '#818cf8', icon: BatteryCharging },
};

export const Timer: React.FC<TimerProps> = ({ onSessionComplete }) => {
  const [durations, setDurations] = useState<TimerDurations>(DEFAULT_DURATIONS);
  const [mode, setMode] = useState<TimerMode>(TimerMode.FOCUS);
  const [timeLeft, setTimeLeft] = useState(DEFAULT_DURATIONS[TimerMode.FOCUS] * 60);
  const [initialTime, setInitialTime] = useState(DEFAULT_DURATIONS[TimerMode.FOCUS] * 60);
  const [isActive, setIsActive] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Settings form state
  const [tempDurations, setTempDurations] = useState<TimerDurations>(DEFAULT_DURATIONS);

  // --- NEW AUDIO TRIGGER FUNCTION (Bulletproof Version) ---
  const playAlarm = () => {
    // We create the audio object HERE, inside the click handler.
    // This ensures it is tied directly to the user interaction.
    // Using a highly reliable URL (Google's assets).
    const audio = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
    
    audio.volume = 0.5;
    
    const playPromise = audio.play();

    if (playPromise !== undefined) {
      playPromise.catch((error) => {
        console.error("Audio playback failed:", error);
        alert("Audio failed to play. Check your internet connection or browser permissions.");
      });
    }
  };

  const switchMode = (newMode: TimerMode) => {
    setIsActive(false);
    setMode(newMode);
    const newTime = durations[newMode] * 60;
    setInitialTime(newTime);
    setTimeLeft(newTime);
  };

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(initialTime);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0 && isActive) {
      // TIMER FINISHED LOGIC
      setIsActive(false);
      
      // 1. Play Sound
      playAlarm();

      // 2. Show Visual Alert
      setTimeout(() => {
        alert(mode === TimerMode.FOCUS ? "Focus session complete!" : "Break over!");
      }, 200);

      onSessionComplete(mode, initialTime / 60);
    }
    
    return () => { if (interval) clearInterval(interval); };
  }, [isActive, timeLeft, mode, initialTime, onSessionComplete]);

  const saveSettings = () => {
    setDurations(tempDurations);
    if (!isActive) {
      const newTime = tempDurations[mode] * 60;
      setInitialTime(newTime);
      setTimeLeft(newTime);
    }
    setShowSettings(false);
  };

  const handleTimerClick = () => {
    if (!isActive) {
      setTempDurations(durations);
      setShowSettings(true);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const radius = 100;
  const circumference = 2 * Math.PI * radius;
  const progress = timeLeft / initialTime;
  const strokeDashoffset = circumference - progress * circumference;
  const CurrentIcon = MODE_CONFIG[mode].icon;

  if (showSettings) {
    return (
      <div className="flex flex-col items-center justify-center p-6 bg-slate-800/90 rounded-3xl border border-slate-700 shadow-xl backdrop-blur-md w-full max-w-sm mx-auto min-h-[400px]">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Settings size={20} /> Timer Settings
        </h3>
        
        <div className="space-y-4 w-full">
          {(Object.keys(MODE_CONFIG) as TimerMode[]).map((m) => (
            <div key={m} className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">{MODE_CONFIG[m].label} Duration (min)</label>
              <input 
                type="number" 
                min="1"
                max="120"
                value={tempDurations[m]}
                onChange={(e) => setTempDurations({...tempDurations, [m]: parseInt(e.target.value) || 1})}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          ))}
          
          {/* --- TEST ALARM BUTTON --- */}
          <div className="flex items-center justify-between w-full bg-slate-900/50 p-3 rounded-xl border border-slate-700/50 mt-4">
            <span className="text-sm text-slate-300 flex items-center gap-2">
              <Volume2 size={16} /> Test Alarm
            </span>
            <button 
              onClick={playAlarm}
              className="px-3 py-1.5 text-xs bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors border border-slate-600 hover:border-slate-500 active:scale-95"
            >
              Play Sound
            </button>
          </div>
          {/* ------------------------- */}

        </div>
        <div className="flex gap-4 mt-8 w-full">
          <button onClick={() => setShowSettings(false)} className="flex-1 py-3 rounded-xl bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors">
            Cancel
          </button>
          <button onClick={saveSettings} className="flex-1 py-3 rounded-xl bg-sky-600 text-white hover:bg-sky-500 transition-colors flex items-center justify-center gap-2">
            <Check size={18} /> Save
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-center justify-center p-6 bg-slate-800/50 rounded-3xl border border-slate-700 shadow-xl backdrop-blur-sm w-full max-w-sm mx-auto">
      
      {/* Mode Selectors */}
      <div className="flex justify-center gap-1 mb-6 bg-slate-900/50 p-1 rounded-full w-full max-w-[280px]">
        {(Object.keys(MODE_CONFIG) as TimerMode[]).map((m) => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            className={`flex-1 py-2 rounded-full text-xs font-bold transition-all ${
              mode === m 
                ? 'bg-slate-700 text-white shadow-md' 
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {MODE_CONFIG[m].label}
          </button>
        ))}
      </div>

      {/* Timer Circle */}
      <div 
        className={`relative mb-8 transition-transform duration-200 ${!isActive ? 'cursor-pointer hover:scale-105 active:scale-95 group' : ''}`}
        onClick={handleTimerClick}
      >
        <svg className="transform -rotate-90 w-60 h-60 sm:w-72 sm:h-72">
          <circle cx="50%" cy="50%" r={radius} stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-800" />
          <circle cx="50%" cy="50%" r={radius} stroke={MODE_CONFIG[mode].stroke} strokeWidth="8" fill="transparent"
            strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round"
            className="transition-all duration-1000 ease-linear"
          />
        </svg>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
          <div className={`text-5xl sm:text-6xl font-mono font-bold tracking-tighter ${MODE_CONFIG[mode].color}`}>
            {formatTime(timeLeft)}
          </div>
          <div className="flex flex-col items-center justify-center mt-2 text-slate-400">
             <div className="flex items-center">
                <CurrentIcon size={18} className="mr-1.5" />
                <span className="uppercase tracking-widest text-[10px] sm:text-xs font-semibold">{MODE_CONFIG[mode].label}</span>
             </div>
             {!isActive && (
               <span className="text-[10px] text-slate-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">Tap to edit</span>
             )}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-6">
        <button onClick={toggleTimer} className={`p-4 rounded-full transition-all transform active:scale-95 shadow-lg ${
            isActive ? 'bg-slate-700 text-slate-200' : 'bg-white text-slate-900'
          }`}
        >
          {isActive ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
        </button>
        <button onClick={resetTimer} className="p-4 rounded-full bg-slate-700 text-slate-300 hover:bg-slate-600 transition-all transform active:scale-95 shadow-lg">
          <RotateCcw size={28} />
        </button>
      </div>
    </div>
  );
};
