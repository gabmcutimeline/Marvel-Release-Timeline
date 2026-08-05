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

      <h3 className="text-sm font-bold font-display uppercase tracking-widest mb-2 border-b border-border pb-2 text-white">Timeline MCU</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-5 text-xs">
        <LegendItem color="bg-orange-500" label="Films Univers 616" />
        <LegendItem color="bg-cyan-500" label="Séries Multivers MCU" />
        <LegendItem color="bg-purple-500" label="Séries Univers 616" />
        <LegendItem color="bg-teal-600" label="Séries Netflix Canon" />
        <LegendItem color="bg-orange-500" label="One Shot" />
        <LegendItem color="bg-pink-500" label="Séries Non Canon" />
        <LegendItem color="bg-purple-500" label="Specials MCU" />
        <LegendItem color="bg-amber-500" label="Séries dont les films sont canons" />
      </div>
    </div>
    <div>
      <h3 className="text-sm font-bold font-display uppercase tracking-widest mb-0 border- border-border pb-0 text-white"></h3>
      <div className="grid grid-cols-0 sm:grid-cols-0 gap-y-2 gap-x-0 text-xs">
        <LegendItem color="" label="" />
        <LegendItem color="" label="" />
        <LegendItem color="" label="" />
        <LegendItem color="" label="" />
        <LegendItem color="" label="" />
        <LegendItem color="" label="" />
        <LegendItem color="" label="" />
      </div>
    </div>
  </div>
);

function ViewModeToggle({ mode, setMode }: { mode: 'chrono' | 'release'; setMode: (m: 'chrono' | 'release') => void }) {
  return (
    <div className="inline-flex rounded-full border border-border overflow-hidden">
      <button
        onClick={() => setMode('chrono')}
        className="px-4 py-1.5 text-xs font-bold uppercase tracking-widest bg-red-500 text-white pl-[35px] pr-[35px]"
      >
        Chrono
      </button>
      <button
        onClick={() => setMode('release')}
        className="px-4 py-1.5 text-xs font-bold uppercase tracking-widest bg-transparent text-muted-foreground pl-[35px] pr-[35px] text-center"
      >
        Sortie
      </button>
    </div>
  );
}

export default function Home() {
  const [mcuViewMode, setMcuViewMode] = React.useState<'chrono' | 'release'>('chrono');

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


  const mcuData = React.useMemo(() => {
    return marvelData
      .filter(m => m.section === 'mcu')
      .filter(m => mcuViewMode === 'chrono' || !m.chronoOnly)
      .sort((a, b) => mcuViewMode === 'chrono' ? a.chronologicalOrder - b.chronologicalOrder : a.releaseOrder - b.releaseOrder);
  }, [mcuViewMode]);

  const multiverseData = marvelData.filter(m => m.section === 'multiverse');
  const spiderData = multiverseData.filter(m => m.category.includes('spider'));
  const aosData = marvelData.filter(m => m.section === 'aos');
  const postCreditData = marvelData.filter(m => m.section === 'post-credit');


  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header  />
      
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <Legend />
        
              {/* Section 1: TIMELINE MCU */}
              <section className="mb-24">
                <ViewModeToggle mode={mcuViewMode} setMode={setMcuViewMode} />
                <div className="mb-5 flex items-end justify-between border-b border-border pb-4">
                  <div>
                    <h2 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-widest mb-2">TIMELINE MCU</h2>
                    <p className="text-muted-foreground text-sm uppercase tracking-widest">
                      {mcuViewMode === 'chrono' ? 'Ordre narratif' : 'Ordre de sortie'}
                    </p>
                  </div>
                  <div className="text-sm font-bold bg-primary/20 text-primary px-3 py-1 rounded-full uppercase tracking-widest">
                    {mcuData.length} entrées
                  </div>
                </div>


          <motion.div 
            layout
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-6"

          >
            <AnimatePresence mode="popLayout">
              {mcuData.map((movie, index) => (
                <MovieCard 
                  key={movie.id} 
                  movie={movie} 
                  index={index}
                  viewMode={mcuViewMode}
                  onOpenInfo={() => setSelectedMovie(movie)}
                />
              ))}
            </AnimatePresence>
          </motion.div>

          {mcuData.length === 0 && (
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
      <PostCreditCard key={movie.id} movie={movie} index={index} viewMode="chrono" onOpenInfo={() => setSelectedMovie(movie)} />
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
