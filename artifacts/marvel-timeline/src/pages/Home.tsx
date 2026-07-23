import React from 'react';
import { marvelData } from '../data/marvel-data';
import { Header } from '../components/Header';
import { MovieCard } from '../components/MovieCard';
import { MovieModal } from '../components/MovieModal';
import { MarvelEntry } from '../data/marvel-data';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const [viewMode, setViewMode] = React.useState<'chrono' | 'release'>('chrono');
  const [activeFilter, setActiveFilter] = React.useState<string>('all');
  const [selectedMovie, setSelectedMovie] = React.useState<MarvelEntry | null>(null);

  // Filter and sort data
  const filteredData = React.useMemo(() => {
    let data = marvelData;
    if (activeFilter !== 'all') {
      data = data.filter(item => item.universe === activeFilter);
    }

    return data.sort((a, b) => {
      if (viewMode === 'chrono') {
        return a.chronologicalOrder - b.chronologicalOrder;
      } else {
        return a.releaseOrder - b.releaseOrder;
      }
    });
  }, [viewMode, activeFilter]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header 
        viewMode={viewMode}
        setViewMode={setViewMode}
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
      />
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-24">
        
        <div className="mb-8 flex items-center justify-between border-b border-border pb-4">
          <h2 className="text-xl text-muted-foreground flex items-center gap-2">
            <span className="text-primary font-bold">
              {filteredData.length}
            </span> 
            entrées trouvées
          </h2>
          
          <div className="text-sm font-display tracking-widest text-muted-foreground uppercase">
            {viewMode === 'chrono' ? 'Timeline Narrative' : 'Timeline de Sortie'}
          </div>
        </div>

        <motion.div 
          layout
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredData.map((movie, index) => (
              <MovieCard 
                key={movie.id} 
                movie={movie} 
                index={index}
                viewMode={viewMode}
                onOpenInfo={() => setSelectedMovie(movie)}
              />
            ))}
          </AnimatePresence>
        </motion.div>

        {filteredData.length === 0 && (
          <div className="text-center py-24 text-muted-foreground">
            Aucun fichier trouvé dans les archives du S.H.I.E.L.D.
          </div>
        )}
      </main>

      <AnimatePresence>
        {selectedMovie && (
          <MovieModal 
            movie={selectedMovie} 
            onClose={() => setSelectedMovie(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
