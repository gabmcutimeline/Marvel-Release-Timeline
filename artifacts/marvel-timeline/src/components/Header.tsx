import React from 'react';
import { Link } from 'wouter';
import { LayoutGrid, Clock, Film } from 'lucide-react';
import { cn } from '../lib/utils';

interface HeaderProps {
  viewMode: 'chrono' | 'release';
  setViewMode: (mode: 'chrono' | 'release') => void;
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
}

export function Header({ viewMode, setViewMode, activeFilter, setActiveFilter }: HeaderProps) {
  const filters = [
    { id: 'all', label: 'Tout' },
    { id: 'mcu', label: 'MCU', color: 'bg-primary' },
    { id: 'disney+', label: 'Disney+', color: 'bg-blue-600' },
    { id: 'x-men', label: 'X-Men', color: 'bg-purple-600' },
    { id: 'spider-verse', label: 'Sony', color: 'bg-orange-600' },
    { id: 'animé', label: 'Animé', color: 'bg-green-600' }
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-background/90 backdrop-blur-md border-b border-border shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between py-4 gap-4">
          
          {/* Logo Area */}
          <div className="flex items-center gap-3">
            <div className="bg-primary text-primary-foreground font-display font-bold text-2xl px-2 py-1 tracking-tighter shadow-[0_0_15px_rgba(225,29,72,0.5)]">
              MARVEL
            </div>
            <div className="font-display font-bold text-xl tracking-[0.2em] text-white">
              TIMELINE
            </div>
          </div>

          {/* Mode Toggle */}
          <div className="flex bg-muted/50 p-1 rounded-lg border border-border">
            <button
              onClick={() => setViewMode('chrono')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all duration-300",
                viewMode === 'chrono' 
                  ? "bg-card text-primary shadow-sm ring-1 ring-primary/30" 
                  : "text-muted-foreground hover:text-white"
              )}
            >
              <Clock className="w-4 h-4" />
              Chronologique
            </button>
            <button
              onClick={() => setViewMode('release')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all duration-300",
                viewMode === 'release' 
                  ? "bg-card text-primary shadow-sm ring-1 ring-primary/30" 
                  : "text-muted-foreground hover:text-white"
              )}
            >
              <Film className="w-4 h-4" />
              Sortie
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-center md:justify-start gap-2 overflow-x-auto pb-4 hide-scrollbar">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap border",
                activeFilter === filter.id 
                  ? filter.id === 'all' ? "bg-white text-black border-white" : `${filter.color} text-white border-transparent`
                  : "bg-transparent text-muted-foreground border-border hover:border-muted-foreground"
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
