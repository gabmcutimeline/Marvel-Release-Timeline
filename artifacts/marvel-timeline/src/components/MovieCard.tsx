import React from 'react';
import { MarvelEntry, EntryCategory } from '../data/marvel-data';
import { motion } from 'framer-motion';
import { Info, Play, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { useResolvedPoster } from '../hooks/use-resolved-poster';

interface MovieCardProps {
  movie: MarvelEntry;
  index: number;
  viewMode: 'chrono' | 'release';
  onOpenInfo: () => void;
  badgeLabelOverride?: string;
  hideBadge?: boolean;
}

const getCategoryStyle = (category: EntryCategory) => {
  switch(category) {
    case 'film-u616': return { borderClass: 'border-orange-500', shadowClass: 'hover:shadow-[0_0_20px_rgba(249,115,22,0.4)]', badgeLabel: 'FILM MCU', badgeColor: 'bg-orange-500 text-white' };
    case 'serie-u616': return { borderClass: 'border-purple-500', shadowClass: 'hover:shadow-[0_0_20px_rgba(168,85,247,0.4)]', badgeLabel: 'SÉRIE MCU', badgeColor: 'bg-purple-500 text-white' };
      case 'specials': return { borderClass: 'border-purple-500', shadowClass: 'hover:shadow-[0_0_20px_rgba(168,85,247,0.4)]', badgeLabel: 'SPECIAL', badgeColor: 'bg-purple-500 text-black' };
    case 'serie-netflix': return { borderClass: 'border-red-900', shadowClass: 'hover:shadow-[0_0_20px_rgba(13,148,136,0.4)]', badgeLabel: 'NETFLIX', badgeColor: 'bg-red-900 text-white' };
    case 'serie-multivers': return { borderClass: 'border-green-700', shadowClass: 'hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]', badgeLabel: 'MULTIVERS', badgeColor: 'bg-green-700 text-black' };
    case 'serie-films-canon': return { borderClass: 'border-amber-500', shadowClass: 'hover:shadow-[0_0_20px_rgba(245,158,11,0.4)]', badgeLabel: 'SHIELD', badgeColor: 'bg-amber-500 text-black' };
    case 'serie-non-canon': return { borderClass: 'border-pink-500', shadowClass: 'hover:shadow-[0_0_20px_rgba(236,72,153,0.4)]', badgeLabel: 'NON CANON', badgeColor: 'bg-pink-500 text-white' };
    case 'one-shot': return { borderClass: 'border-orange-500', shadowClass: 'hover:shadow-[0_0_20px_rgba(234,179,8,0.4)]', badgeLabel: 'ONE SHOT', badgeColor: 'bg-orange-500 text-black' };
      case 'spider-maguire': return { borderClass: 'border-green-500', shadowClass: 'hover:shadow-[0_0_20px_rgba(34,197,94,0.4)]', badgeLabel: 'MAGUIRE', badgeColor: 'bg-green-500 text-white' };
      case 'spider-garfield': return { borderClass: 'border-blue-500', shadowClass: 'hover:shadow-[0_0_20px_rgba(59,130,246,0.4)]', badgeLabel: 'GARFIELD', badgeColor: 'bg-blue-500 text-white' };
      case 'spider-animation': return { borderClass: 'border-orange-400', shadowClass: 'hover:shadow-[0_0_20px_rgba(251,146,60,0.4)]', badgeLabel: 'ANIMÉ', badgeColor: 'bg-orange-400 text-black' };
      case 'sony-spider': return { borderClass: 'border-yellow-400', shadowClass: 'hover:shadow-[0_0_20px_rgba(250,204,21,0.4)]', badgeLabel: 'SONY', badgeColor: 'bg-yellow-400 text-black' };
      case 'x-men': return { borderClass: 'border-slate-200', shadowClass: 'hover:shadow-[0_0_20px_rgba(226,232,240,0.4)]', badgeLabel: 'X-MEN', badgeColor: 'bg-slate-200 text-black' };
      case 'x-men-animation': return { borderClass: 'border-slate-400', shadowClass: 'hover:shadow-[0_0_20px_rgba(148,163,184,0.4)]', badgeLabel: 'X-MEN ANIMÉ', badgeColor: 'bg-slate-400 text-white' };
      case 'post-credit': return { borderClass: 'border-red-500', shadowClass: 'hover:shadow-[0_0_20px_rgba(225,29,72,0.4)]', badgeLabel: 'POST-CRÉDIT', badgeColor: 'bg-red-500 text-white' };
    default: return { borderClass: 'border-border', shadowClass: '', badgeLabel: 'MARVEL', badgeColor: 'bg-primary text-white' };
  }
};

  export function MovieCard({ movie, index, viewMode, onOpenInfo, badgeLabelOverride, hideBadge }: MovieCardProps) {
  const displayOrder = viewMode === 'chrono' ? movie.chronologicalOrder : movie.releaseOrder;
  const style = getCategoryStyle(movie.category);
  const posterUrl = useResolvedPoster(movie.title, movie.posterUrl);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.4, delay: index * 0.03 }}
      className={cn(
        "group relative flex flex-col bg-card rounded-xl overflow-hidden border-2 cursor-pointer transition-all duration-300 hover:-translate-y-2",
        style.borderClass,
        style.shadowClass
      )}
    >
      {/* Order Badge */}
      <div className="absolute top-2 left-2 z-20 bg-black/80 backdrop-blur-sm border border-white/10 text-white font-display font-bold px-2 py-1 rounded text-sm flex items-center justify-center min-w-[30px]">
        {displayOrder}
      </div>

      {/* Universe/Category Badge */}
      {!hideBadge && (
        <div className={cn(
          "absolute top-2 right-2 z-20 text-[10px] uppercase font-bold px-2 py-1 rounded tracking-wider shadow-sm",
          style.badgeColor
        )}>
          {badgeLabelOverride || style.badgeLabel}
        </div>
      )}
      {/* Viewing Note Banner */}
      {movie.viewingNote && (
        <div className="absolute bottom-0 left-0 right-0 z-20 bg-amber-500 text-black text-[11px] font-bold px-2 py-1.5 text-center leading-tight">
          ⚠️ {movie.viewingNote}
        </div>
      )}


      {/* Poster Image */}
      <div 
        className="relative aspect-[2/3] w-full overflow-hidden bg-muted"
        onClick={() => window.open(movie.streamingUrl, '_blank')}
      >
        <img 
          src={posterUrl} 
          alt={movie.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = `https://placehold.co/300x450/1a1a2e/e11d48?text=${encodeURIComponent(movie.title)}`;
          }}
        />
        
        {/* Play Overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="bg-primary/90 rounded-full p-4 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-[0_0_20px_rgba(225,29,72,0.6)]">
            <Play className="w-8 h-8 text-white fill-current" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 relative z-10 bg-gradient-to-t from-card via-card to-transparent border-t border-border">
        <div className="flex justify-between items-start gap-2 mb-1">
          <h3 className="font-display font-bold text-base leading-tight line-clamp-2 text-white group-hover:text-primary transition-colors">
            {movie.title}
          </h3>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onOpenInfo();
            }}
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/20 text-muted-foreground hover:text-white transition-colors flex-shrink-0"
            title="Plus d'infos"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex items-center justify-between mt-auto pt-2 text-xs text-muted-foreground font-medium uppercase tracking-wider">
          <span className="text-white font-bold">{movie.chronologicalDate}</span>
          <span className="opacity-70">{movie.duration ? movie.duration : movie.releaseDate}</span>
        </div>
      </div>
    </motion.div>
  );
}

export function PostCreditCard({ movie, index, viewMode, onOpenInfo }: MovieCardProps) {
  const displayOrder = viewMode === 'chrono' ? movie.chronologicalOrder : movie.releaseOrder;
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      onClick={onOpenInfo}
      className="group relative flex flex-row items-center bg-card rounded-xl overflow-hidden border-2 border-red-500/50 cursor-pointer transition-transform duration-300 hover:-translate-y-1 hover:border-red-500 hover:shadow-[0_0_20px_rgba(225,29,72,0.4)]"
    >
      <div className="w-16 h-full absolute left-0 top-0 bottom-0 bg-red-950 flex flex-col items-center justify-center border-r border-red-500/30">
        <span className="text-2xl font-display font-bold text-red-500">{displayOrder}</span>
      </div>
      <div className="p-4 pl-20 flex-1">
        <h3 className="font-display font-bold text-sm leading-tight text-white group-hover:text-red-400 transition-colors line-clamp-2">
          {movie.title}
        </h3>
        <span className="text-[10px] text-muted-foreground uppercase mt-2 block font-medium">
          {movie.chronologicalDate}
        </span>
      </div>
      
    </motion.div>
  );
}
