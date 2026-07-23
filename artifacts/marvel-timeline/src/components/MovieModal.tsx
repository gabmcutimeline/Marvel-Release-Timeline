import React from 'react';
import { MarvelEntry } from '../data/marvel-data';
import { motion } from 'framer-motion';
import { X, Play, Calendar, Clock, Film } from 'lucide-react';
import { cn } from '../lib/utils';

interface MovieModalProps {
  movie: MarvelEntry;
  onClose: () => void;
}

export function MovieModal({ movie, onClose }: MovieModalProps) {
  
  // Close on Escape key
  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const getUniverseColor = (universe: string) => {
    switch(universe) {
      case 'mcu': return 'text-primary border-primary';
      case 'disney+': return 'text-blue-500 border-blue-500';
      case 'x-men': return 'text-purple-500 border-purple-500';
      case 'spider-verse': return 'text-orange-500 border-orange-500';
      case 'animé': return 'text-green-500 border-green-500';
      default: return 'text-primary border-primary';
    }
  };

  const getPhaseText = () => {
    if (movie.phase) return `Phase ${movie.phase}`;
    return null;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />
      
      {/* Modal Content */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-4xl max-h-[90vh] bg-card border border-border shadow-2xl rounded-2xl overflow-hidden flex flex-col md:flex-row z-10"
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-2 bg-black/50 hover:bg-black text-white rounded-full transition-colors backdrop-blur-md"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Poster Side (Hidden on very small screens, banner on mobile) */}
        <div className="w-full md:w-2/5 h-64 md:h-auto relative">
          <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:via-transparent md:to-card z-10" />
          <img 
            src={movie.posterUrl} 
            alt={movie.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = `https://via.placeholder.com/600x900/1a1a2e/e11d48?text=${encodeURIComponent(movie.title)}`;
            }}
          />
        </div>

        {/* Details Side */}
        <div className="w-full md:w-3/5 p-6 md:p-10 flex flex-col overflow-y-auto bg-card">
          
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className={cn(
              "px-3 py-1 text-xs font-bold uppercase tracking-widest rounded-full border bg-background/50",
              getUniverseColor(movie.universe)
            )}>
              {movie.universe}
            </span>
            {getPhaseText() && (
              <span className="px-3 py-1 text-xs font-bold uppercase tracking-widest bg-primary text-white rounded-full">
                {getPhaseText()}
              </span>
            )}
            <span className="px-3 py-1 text-xs font-bold uppercase tracking-widest bg-muted text-muted-foreground rounded-full">
              {movie.type}
            </span>
          </div>

          <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-6 leading-tight">
            {movie.title}
          </h2>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-muted/30 border border-border p-4 rounded-xl flex flex-col gap-1">
              <span className="text-muted-foreground text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                <Calendar className="w-3 h-3" /> Date Réelle
              </span>
              <span className="text-lg font-bold text-white">
                {new Date(movie.releaseDate).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
            
            <div className="bg-muted/30 border border-primary/20 p-4 rounded-xl flex flex-col gap-1">
              <span className="text-primary text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-3 h-3" /> Date Narrative
              </span>
              <span className="text-lg font-bold text-amber-500">
                {movie.chronologicalDate}
              </span>
            </div>
          </div>

          <div className="mb-8 flex-1">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-3">Dossier classifié</h3>
            <p className="text-base text-gray-300 leading-relaxed">
              {movie.synopsis}
            </p>
            {movie.duration && (
              <p className="mt-4 text-sm text-muted-foreground flex items-center gap-2 font-medium">
                <Film className="w-4 h-4" /> Durée : {movie.duration}
              </p>
            )}
          </div>

          <div className="mt-auto pt-6 border-t border-border">
            <a 
              href={movie.streamingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-center gap-3 w-full bg-primary hover:bg-primary/90 text-white font-bold text-lg py-4 px-8 rounded-xl transition-all shadow-[0_0_20px_rgba(225,29,72,0.3)] hover:shadow-[0_0_30px_rgba(225,29,72,0.6)]"
            >
              <Play className="w-5 h-5 fill-current group-hover:scale-110 transition-transform" />
              Regarder sur {movie.streamingPlatform}
            </a>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
