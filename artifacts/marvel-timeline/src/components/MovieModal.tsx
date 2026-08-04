import React from 'react';
import { MarvelEntry, EntryCategory } from '../data/marvel-data';
import { motion } from 'framer-motion';
import { X, Play, Calendar, Clock, Film } from 'lucide-react';
import { cn } from '../lib/utils';

interface MovieModalProps {
  movie: MarvelEntry;
  onClose: () => void;
}

const getCategoryInfo = (category: EntryCategory) => {
  switch(category) {
    case 'film-u616': return { color: 'text-orange-500 border-orange-500 bg-orange-500/10', label: 'FILM MCU' };
    case 'serie-u616': return { color: 'text-purple-500 border-purple-500 bg-purple-500/10', label: 'SÉRIE MCU' };
    case 'specials': return { color: 'text-purple-500 border-purple-500 bg-purple-500/10', label: 'SPECIAL' };
    case 'serie-netflix': return { color: 'text-teal-600 border-teal-600 bg-teal-600/10', label: 'NETFLIX ' };
    case 'serie-multivers': return { color: 'text-cyan-500 border-cyan-500 bg-cyan-500/10', label: 'MULTIVERS' };
    case 'serie-films-canon': return { color: 'text-amber-500 border-amber-500 bg-amber-500/10', label: 'SHIELD' };
    case 'serie-non-canon': return { color: 'text-pink-500 border-pink-500 bg-pink-500/10', label: 'NON CANON' };
    case 'one-shot': return { color: 'text-orange-500 border-orange-500 bg-orange-500/10', label: 'ONE SHOT' };
    case 'spider-maguire': return { color: 'text-green-500 border-green-500 bg-green-500/10', label: 'MAGUIRE' };
    case 'spider-garfield': return { color: 'text-blue-500 border-blue-500 bg-blue-500/10', label: 'GARFIELD' };
    case 'spider-animation': return { color: 'text-orange-400 border-orange-400 bg-orange-400/10', label: 'ANIMÉ' };
    case 'sony-spider': return { color: 'text-yellow-400 border-yellow-400 bg-yellow-400/10', label: 'SONY' };
    case 'x-men': return { color: 'text-slate-300 border-slate-300 bg-slate-300/10', label: 'X-MEN' };
    case 'x-men-animation': return { color: 'text-slate-400 border-slate-400 bg-slate-400/10', label: 'X-MEN ANIMÉ' };
    case 'post-credit': return { color: 'text-red-500 border-red-500 bg-red-500/10', label: 'POST-CRÉDIT' };
    case 'aos': return { color: 'text-cyan-500 border-cyan-500 bg-cyan-500/10', label: 'AGENTS DU SHIELDS' };
    default: return { color: 'text-primary border-primary bg-primary/10', label: 'MARVEL' };
  }
};

export function MovieModal({ movie, onClose }: MovieModalProps) {
  
  // Close on Escape key
  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const catInfo = getCategoryInfo(movie.category);

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
          className="absolute top-4 right-4 z-50 p-2 bg-black/50 hover:bg-black text-white rounded-full transition-colors backdrop-blur-md border border-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Poster Side (Hidden on very small screens, banner on mobile) */}
        <div className="w-full md:w-2/5 h-64 md:h-auto relative bg-muted">
          <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:via-transparent md:to-card z-10" />
          <img 
            src={movie.posterUrl} 
            alt={movie.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = `https://placehold.co/600x900/1a1a2e/e11d48?text=${encodeURIComponent(movie.title)}`;
            }}
          />
        </div>

        {/* Details Side */}
        <div className="w-full md:w-3/5 p-6 md:p-10 flex flex-col overflow-y-auto bg-card">
          
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className={cn(
              "px-3 py-1 text-xs font-bold uppercase tracking-widest rounded-full border",
              catInfo.color
            )}>
              {catInfo.label}
            </span>
            {movie.phase && (
              <span className="px-3 py-1 text-xs font-bold uppercase tracking-widest bg-primary text-white rounded-full border border-primary">
                Phase {movie.phase}
              </span>
            )}
            <span className="px-3 py-1 text-xs font-bold uppercase tracking-widest bg-muted border border-border text-muted-foreground rounded-full">
              Chrono: {movie.chronologicalOrder}
            </span>
          </div>

          <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-6 leading-tight">
            {movie.title}
          </h2>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-muted/30 border border-border p-4 rounded-xl flex flex-col gap-1">
              <span className="text-muted-foreground text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                <Calendar className="w-3 h-3" /> Date de Sortie
              </span>
              <span className="text-lg font-bold text-white">
                {movie.releaseDate}
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
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
              Dossier Classifié
            </h3>
            <p className="text-base text-gray-300 leading-relaxed border-l-2 border-primary/50 pl-4 py-1 italic">
              {movie.synopsis || "Fichier introuvable dans les archives du S.H.I.E.L.D."}
            </p>
            {movie.viewingNote && (
              <div className="mt-4 bg-amber-500/10 border border-amber-500/30 rounded-lg px-4 py-3 text-sm text-amber-300 flex items-start gap-2">
                <span>⚠️</span>
                <span>{movie.viewingNote}</span>
              </div>
            )}

            {movie.duration && (
              <p className="mt-6 text-sm text-muted-foreground flex items-center gap-2 font-medium bg-muted/50 w-fit px-3 py-1.5 rounded-md border border-border">
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
              {movie.streamingPlatform ? `Voir sur ${movie.streamingPlatform}` : 'Voir le contenu'}
            </a>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
