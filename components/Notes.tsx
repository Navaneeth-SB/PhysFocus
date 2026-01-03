import React, { useState } from 'react';
import { CheckSquare, StickyNote, Plus, Trash2 } from 'lucide-react';

type Tab = 'NOTES' | 'TODO';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

export const Notes: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('NOTES');
  const [noteText, setNoteText] = useState('');
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    setTodos([...todos, { id: Date.now().toString(), text: newTodo.trim(), completed: false }]);
    setNewTodo('');
  };

  const toggleTodo = (id: string) => {
    setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(t => t.id !== id));
  };

  return (
    /* Changed min-h and ensured flex-col fills the parent height */
    <div className="bg-slate-800/50 border border-slate-700 rounded-3xl p-6 w-full h-full min-h-[450px] flex flex-col backdrop-blur-sm shadow-xl transition-all">
      
      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-slate-700/50 pb-3 mb-4">
        <button
          onClick={() => setActiveTab('NOTES')}
          className={`flex items-center gap-2 text-sm font-semibold transition-all ${
            activeTab === 'NOTES' ? 'text-sky-400' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <StickyNote size={16} />
          Notes
        </button>
        <button
          onClick={() => setActiveTab('TODO')}
          className={`flex items-center gap-2 text-sm font-semibold transition-all ${
            activeTab === 'TODO' ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <CheckSquare size={16} />
          To-Do
        </button>
      </div>

      {/* Content Area - Removed overflow-hidden to allow children to manage scroll */}
      <div className="flex-1 flex flex-col min-h-0"> 
        {activeTab === 'NOTES' ? (
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Type your study notes, formulas, or quick thoughts here..."
            /* Added h-full and overflow-y-auto to ensure the whole box is scrollable */
            className="w-full h-full bg-transparent text-slate-200 text-sm leading-relaxed placeholder-slate-600 resize-none focus:outline-none overflow-y-auto p-2"
            spellCheck={false}
          />
        ) : (
          <div className="flex flex-col h-full">
            <form onSubmit={handleAddTodo} className="flex gap-2 mb-4">
              <input
                type="text"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                placeholder="Add task..."
                className="flex-1 bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
              />
              <button
                type="submit"
                disabled={!newTodo.trim()}
                className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl hover:bg-emerald-500/20 disabled:opacity-30 disabled:hover:bg-emerald-500/10 transition-colors"
              >
                <Plus size={20} />
              </button>
            </form>

            <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
              {todos.length === 0 && (
                <div className="flex flex-col items-center justify-center h-40 text-slate-600 gap-2 opacity-60">
                   <CheckSquare size={32} strokeWidth={1.5} />
                   <p className="text-xs">No active tasks</p>
                </div>
              )}
              {todos.map((todo) => (
                <div 
                  key={todo.id} 
                  className="group flex items-center gap-3 bg-slate-900/30 border border-slate-700/30 p-3 rounded-xl hover:border-slate-600/50 transition-all"
                >
                  <button
                    onClick={() => toggleTodo(todo.id)}
                    className={`shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-all ${
                      todo.completed 
                        ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' 
                        : 'border-slate-600 hover:border-slate-500'
                    }`}
                  >
                    {todo.completed && <CheckSquare size={12} />}
                  </button>
                  <span className={`flex-1 text-sm truncate ${todo.completed ? 'text-slate-600 line-through' : 'text-slate-300'}`}>
                    {todo.text}
                  </span>
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="text-slate-600 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all p-1"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
