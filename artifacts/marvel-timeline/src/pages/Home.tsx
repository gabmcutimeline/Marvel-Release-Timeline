import React, { useEffect } from 'react';
import { marvelData, MarvelEntry } from '../data/marvel-data';
import { Header } from '../components/Header';
import { MovieCard, PostCreditCard } from '../components/MovieCard';
import { MovieModal } from '../components/MovieModal';
import { motion, AnimatePresence } from 'framer-motion';



const LegendItem = ({color, label}: {color: string, label: string}) => (
  <div className="flex items-center gap-2">
    <div className={`w-3 h-3 rounded-full ${color}`} />
    <span className="text-muted-foreground font-medium">{label}</span>
  </div>
);

const Legend = () => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16 bg-card/30 p-6 sm:p-8 rounded-2xl border border-border shadow-lg">
    <div>
      <h3 className="text-sm font-bold font-display uppercase tracking-widest mb-4 border-b border-border pb-2 text-white">Timeline MCU</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 text-xs">
        <LegendItem color="bg-orange-500" label="Films Univers 616" />
        <LegendItem color="bg-cyan-500" label="Séries Multivers MCU" />
        <LegendItem color="bg-purple-500" label="Séries Univers 616" />
        <LegendItem color="bg-teal-600" label="Séries Netflix Canon" />
        <LegendItem color="bg-orange-500" label="One Shots" />
        <LegendItem color="bg-pink-500" label="Séries Non Canon" />
        <LegendItem color="bg-purple-500" label="Specials MCU" />
        <LegendItem color="bg-amber-500" label="Séries dont les films sont canons" />
      </div>
    </div>
    <div>
      <h3 className="text-sm font-bold font-display uppercase tracking-widest mb-4 border-b border-border pb-2 text-white">Multiverse</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 text-xs">
        <LegendItem color="bg-green-500" label="Spider-Man Maguire" />
        <LegendItem color="bg-slate-200" label="X-MEN UNIVERSE" />
        <LegendItem color="bg-blue-500" label="Spider-Man Garfield" />
        <LegendItem color="bg-slate-400" label="X-Men Animé" />
        <LegendItem color="bg-orange-400" label="Spider-Man Animé" />
        <LegendItem color="" label="" />
        <LegendItem color="bg-yellow-400" label="Sony's Spider-Man Universe" />
      </div>
    </div>
  </div>
);

export default function Home() {
  const [viewMode, setViewMode] = React.useState<'chrono' | 'release'>('chrono');
  const [activeFilter, setActiveFilter] = React.useState<string>('all');
  const [selectedMovie, setSelectedMovie] = React.useState<MarvelEntry | null>(null);
  useEffect(() => {
    if (window.location.hash) {
      const el = document.querySelector(window.location.hash);
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, []);


  const sortedData = React.useMemo(() => {
    return [...marvelData].sort((a, b) => {
      if (viewMode === 'chrono') return a.chronologicalOrder - b.chronologicalOrder;
      return a.releaseOrder - b.releaseOrder;
    });
  }, [viewMode]);

  const mcuData = sortedData.filter(m => m.section === 'mcu');
  const filteredMcuData = activeFilter === 'all' 
    ? mcuData 
    : mcuData.filter(m => m.category === activeFilter);

  const multiverseData = sortedData.filter(m => m.section === 'multiverse');
  const aosData = sortedData.filter(m => m.section === 'aos');
  const xmenData = multiverseData.filter(m => m.category.includes('x-men'));
  const spiderData = multiverseData.filter(m => m.category.includes('spider'));
  const postCreditData = sortedData.filter(m => m.section === 'post-credit');

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header 
        viewMode={viewMode}
        setViewMode={setViewMode}
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
      />
      
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <Legend />
        
        {/* Section 1: TIMELINE MCU */}
        <section className="mb-24">
          <div className="mb-8 flex items-end justify-between border-b border-border pb-4">
            <div>
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-widest mb-1">TIMELINE MCU</h2>
              <p className="text-muted-foreground text-sm uppercase tracking-widest">
                {viewMode === 'chrono' ? 'Ordre narratif' : 'Ordre de sortie'}
              </p>
            </div>
            <div className="text-sm font-bold bg-primary/20 text-primary px-3 py-1 rounded-full uppercase tracking-widest">
              {filteredMcuData.length} entrées
            </div>
          </div>

          <motion.div 
            layout
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6"
          >
            <AnimatePresence mode="popLayout">
              {filteredMcuData.map((movie, index) => (
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

          {filteredMcuData.length === 0 && (
            <div className="text-center py-24 text-muted-foreground border border-dashed border-border rounded-xl">
              Aucun fichier trouvé dans cette catégorie.
            </div>
          )}
        </section>

        {/* Section 2: POST-CREDIT */}
        <section className="mb-12">
          <div className="mb-8 flex items-center justify-between border-b border-red-500/30 pb-4">
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-red-500 tracking-widest">SCÈNES POST-CRÉDIT IMPORTANTES</h2>
          </div>

          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {postCreditData.map((movie, index) => (
              <PostCreditCard key={movie.id} movie={movie} index={index} viewMode={viewMode} onOpenInfo={() => setSelectedMovie(movie)} />
            ))}
          </motion.div>
        </section>

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
