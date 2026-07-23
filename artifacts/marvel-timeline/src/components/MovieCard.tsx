import React from 'react';
import { MarvelEntry } from '../data/marvel-data';
import { motion } from 'framer-motion';
import { Info, Play } from 'lucide-react';
import { cn } from '../lib/utils';

interface MovieCardProps {
  movie: MarvelEntry;
  index: number;
  viewMode: 'chrono' | 'release';
  onOpenInfo: () => void;
}

export function MovieCard({ movie, index, viewMode, onOpenInfo }: MovieCardProps) {
  
  const getGlowClass = (universe: string) => {
    switch(universe) {
      case 'mcu': return 'marvel-glow';
      case 'disney+': return 'disney-glow';
      case 'x-men': return 'xmen-glow';
      case 'spider-verse': return 'sony-glow';
      case 'animé': return 'anime-glow';
      default: return 'marvel-glow';
    }
  };

  const getBadgeColor = (universe: string) => {
    switch(universe) {
      case 'mcu': return 'bg-primary text-primary-foreground';
      case 'disney+': return 'bg-blue-600 text-white';
      case 'x-men': return 'bg-purple-600 text-white';
      case 'spider-verse': return 'bg-orange-600 text-white';
      case 'animé': return 'bg-green-600 text-white';
      default: return 'bg-primary text-primary-foreground';
    }
  };

  const displayOrder = viewMode === 'chrono' ? movie.chronologicalOrder : movie.releaseOrder;
  const displayYear = viewMode === 'chrono' ? movie.chronologicalDate : new Date(movie.releaseDate).getFullYear();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className={cn(
        "group relative flex flex-col bg-card rounded-xl overflow-hidden border border-border cursor-pointer transition-transform duration-300 hover:-translate-y-2",
        getGlowClass(movie.universe)
      )}
    >
      {/* Order Badge */}
      <div className="absolute top-2 left-2 z-20 bg-black/80 backdrop-blur-sm border border-white/10 text-white font-display font-bold px-2 py-1 rounded text-sm flex items-center justify-center min-w-[30px]">
        {displayOrder}
      </div>

      {/* Universe Badge */}
      <div className={cn(
        "absolute top-2 right-2 z-20 text-[10px] uppercase font-bold px-2 py-1 rounded tracking-wider shadow-sm",
        getBadgeColor(movie.universe)
      )}>
        {movie.universe}
      </div>

      {/* Poster Image */}
      <div 
        className="relative aspect-[2/3] w-full overflow-hidden bg-muted"
        onClick={() => window.open(movie.streamingUrl, '_blank')}
      >
        <img 
          src={movie.posterUrl} 
          alt={movie.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = `https://via.placeholder.com/300x450/1a1a2e/e11d48?text=${encodeURIComponent(movie.title)}`;
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
      <div className="p-4 flex flex-col flex-1 relative z-10 bg-gradient-to-t from-card via-card to-transparent">
        <div className="flex justify-between items-start gap-2 mb-1">
          <h3 className="font-display font-bold text-lg leading-tight line-clamp-2 text-white group-hover:text-primary transition-colors">
            {movie.title}
          </h3>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onOpenInfo();
            }}
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/20 text-muted-foreground hover:text-white transition-colors"
            title="Plus d'infos"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex items-center justify-between mt-auto pt-2 text-xs text-muted-foreground font-medium uppercase tracking-wider">
          <span className="text-amber-500 font-bold">{displayYear}</span>
          <span className="opacity-70">{movie.type}</span>
        </div>
      </div>
    </motion.div>
  );
}
