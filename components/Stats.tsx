import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { StudySession, TimerMode } from '../types';

interface StatsProps {
  sessions: StudySession[];
}

export const Stats: React.FC<StatsProps> = ({ sessions }) => {
  // Aggregate data by date
  const dataMap = sessions.reduce((acc, session) => {
    if (session.mode === TimerMode.FOCUS) {
      const date = new Date(session.date).toLocaleDateString('en-US', { weekday: 'short' });
      acc[date] = (acc[date] || 0) + session.durationMinutes;
    }
    return acc;
  }, {} as Record<string, number>);

  const data = Object.keys(dataMap).map(key => ({
    name: key,
    minutes: Math.round(dataMap[key])
  })).slice(-7); // Last 7 active days

  // If no data, show empty placeholders
  if (data.length === 0) {
    ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].forEach(day => {
       data.push({ name: day, minutes: 0 });
    });
  }

  const totalMinutes = sessions
    .filter(s => s.mode === TimerMode.FOCUS)
    .reduce((acc, curr) => acc + curr.durationMinutes, 0);

  const hours = Math.floor(totalMinutes / 60);
  const mins = Math.round(totalMinutes % 60);

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-3xl p-6 h-full flex flex-col backdrop-blur-sm">
      <h3 className="text-slate-200 font-semibold mb-1">Study Consistency</h3>
      <p className="text-sm text-slate-400 mb-6">Focus time this session</p>

      <div className="flex-1 w-full min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis 
              dataKey="name" 
              tick={{ fill: '#94a3b8', fontSize: 12 }} 
              axisLine={false} 
              tickLine={false}
            />
            <Tooltip 
              cursor={{ fill: '#334155' }}
              contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
              itemStyle={{ color: '#38bdf8' }}
            />
            <Bar dataKey="minutes" radius={[4, 4, 0, 0]}>
               {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.minutes > 0 ? '#38bdf8' : '#1e293b'} />
                ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-700/50 flex justify-between items-end">
        <div>
           <span className="text-3xl font-bold text-white">{hours}</span>
           <span className="text-sm text-slate-500 ml-1">hrs</span>
           <span className="text-3xl font-bold text-white ml-2">{mins}</span>
           <span className="text-sm text-slate-500 ml-1">mins</span>
        </div>
        <div className="text-xs text-sky-400 font-medium bg-sky-400/10 px-2 py-1 rounded">
          Total Focus
        </div>
      </div>
    </div>
  );
};