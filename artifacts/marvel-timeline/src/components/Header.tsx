import React from 'react';
import { Clock, Film } from 'lucide-react';
import { cn } from '../lib/utils';
import { Link } from 'wouter';

interface HeaderProps {
  viewMode: 'chrono' | 'release';
  setViewMode: (mode: 'chrono' | 'release') => void;
}

export function Header({ viewMode, setViewMode }: HeaderProps) {
  const filters = [
    { id: 'all', label: 'Tout' },
    { id: 'film-u616', label: 'Films MCU', color: 'bg-orange-500 text-white' },
    { id: 'serie-u616', label: 'Séries MCU', color: 'bg-purple-500 text-white' },
    { id: 'specials', label: 'Spécials', color: 'bg-purple-500 text-black' },
    { id: 'serie-netflix', label: 'Netflix ', color: 'bg-teal-600 text-white' },
    { id: 'serie-non-canon', label: 'Non Canon', color: 'bg-pink-500 text-white' },
    { id: 'one-shot', label: 'One Shots', color: 'bg-yellow-500 text-black' },
    { id: 'aos', label: 'AOS', color: 'bg-yellow-500 text-black' }
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-background/90 backdrop-blur-md border-b border-border shadow-lg">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between py-4 gap-4">
          
          {/* Logo Area */}
            <Link href="/" className="flex items-center gap-3">
            <div className="bg-primary text-primary-foreground font-display font-bold text-2xl px-2 py-1 tracking-tighter shadow-[0_0_15px_rgba(225,29,72,0.5)]">
              MARVEL
              </div>
            <div className="font-display font-bold text-xl tracking-[O.2em] text-white">
              TIMELINE
              </div>
            </Link>
              
          {/* Liens de navigation */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Link href="/" className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest bg-red-700 text-white whitespace-nowrap border-2 border-transparent shadow-lg hover:scale-105 transition-all">
              MCU
            </Link>
            <Link href="/hors-mcu" className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest bg-cyan-700 text-white whitespace-nowrap border-2 border-transparent shadow-lg hover:scale-105 transition-all">
              Multivers
            </Link>
            <Link href="/agents-of-shield" className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest bg-yellow-500 text-black whitespace-nowrap border-2 border-transparent shadow-lg hover:scale-105 transition-all">
              Agents of S.H.I.E.L.D.
            </Link>
          </div>


          
          {/* Mode Toggle */}
          <div className="flex bg-muted/50 p-1 rounded-lg border border-border shrink-0">
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
              Chrono
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
      </div>
    </header>
  );
}
