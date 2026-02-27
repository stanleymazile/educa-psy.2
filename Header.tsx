import React from 'react';
import { BrainCircuit, Bell, Search, User, Menu, X } from 'lucide-react';

interface HeaderProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export function Header({ onToggleSidebar, isSidebarOpen }: HeaderProps) {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <div className="lg:hidden flex items-center gap-2">
          <BrainCircuit className="text-indigo-600" size={24} />
          <span className="font-bold text-slate-900">Educa-Psy</span>
        </div>
        <div className="hidden md:flex items-center bg-slate-100 rounded-full px-4 py-1.5 gap-2 w-64 lg:w-96">
          <Search size={18} className="text-slate-400" />
          <input 
            type="text" 
            placeholder="Rechercher..." 
            className="bg-transparent border-none outline-none text-sm w-full"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-6">
        <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
        </button>
        <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>
        <button className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-200 transition-colors">
            <User size={18} />
          </div>
          <span className="text-sm font-medium text-slate-700 hidden sm:block">Mon Compte</span>
        </button>
        
        {/* Sidebar Toggle Button */}
        <button 
          onClick={onToggleSidebar}
          className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-all"
          aria-label="Toggle Menu"
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
    </header>
  );
}
