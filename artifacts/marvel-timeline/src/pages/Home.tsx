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
        <LegendItem color="bg-orange-500" label="Films MCU (616)" />
        <LegendItem color="bg-green-700" label="Séries Multivers MCU" />
        <LegendItem color="bg-purple-500" label="Séries MCU (616)" />
        <LegendItem color="bg-red-900" label="Séries Netflix Canon" />
        <LegendItem color="bg-orange-500" label="One Shot" />
        <LegendItem color="bg-pink-500" label="Séries Non Canon" />
        <LegendItem color="bg-purple-500" label="Specials MCU" />
        <LegendItem color="bg-red-500" label="Post crédit" />
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
        className={`px-4 py-1.5 text-xs font-bold uppercase tracking-widest ${mode === 'chrono' ? 'bg-red-500 text-white' : 'bg-transparent text-muted-foreground'}`}
        >
          Chrono
        </button>
        <button
          onClick={() => setMode('release')}
          className={`px-4 py-1.5 text-xs font-bold uppercase tracking-widest ${mode === 'release' ? 'bg-red-500 text-white' : 'bg-transparent text-muted-foreground'}`}
        >
          Sortie
      </button>
    </div>
  );
}

const CATEGORY_LABELS: Record<string, string> = {
  'film-u616': 'Films Univers 616',
  'serie-u616': 'Séries Univers 616',
  'serie-multivers': 'Séries Multivers MCU',
  'serie-netflix': 'Séries Netflix Canon',
  'serie-non-canon': 'Séries Non Canon',
  'one-shot': 'One Shots',
  'aos': 'Agents of S.H.I.E.L.D.',
  'post-credit': 'Scènes Post-Crédit',
  'specials' : 'Specials'
};

function getCategoryLabel(cat: string): string {
  return CATEGORY_LABELS[cat] || cat;
}

const PHASE_SAGA: Record<number, string> = {
  1: 'Phase 1',
  2: 'Phase 2',
  3: 'Phase 3',
  4: 'Phase 4',
  5: 'Phase 5',
  6: 'Phase 6',
};

function getSagaLabel(phase: number): string {
  if (phase >= 1 && phase <= 3) return 'Saga de l\'Infini';
  if (phase >= 4 && phase <= 6) return 'Saga du Multivers';
  return 'Autres';
}


export default function Home() {
  const [mcuViewMode, setMcuViewMode] = React.useState<'chrono' | 'release'>('chrono');
  const [categoryFilters, setCategoryFilters] = React.useState<Set<string>>(new Set());
  const [filterOpen, setFilterOpen] = React.useState(false);


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


  const mcuDataUnfiltered = React.useMemo(() => {
    return marvelData
      .filter(m => m.section === 'mcu')
      .filter(m => mcuViewMode === 'chrono' || !m.chronoOnly)
      .sort((a, b) => mcuViewMode === 'chrono' ? a.chronologicalOrder - b.chronologicalOrder : a.releaseOrder - b.releaseOrder);
  }, [mcuViewMode]);

  const availableCategories = React.useMemo(() => {
    return Array.from(new Set(mcuDataUnfiltered.map(m => m.category))).sort();
  }, [mcuDataUnfiltered]);

  const mcuData = categoryFilters.size === 0
    ? mcuDataUnfiltered
    : mcuDataUnfiltered.filter(m => categoryFilters.has(m.category));

  const mcuByPhase = React.useMemo(() => {
    if (mcuViewMode !== 'release') return null;
    const map = new Map<number, typeof mcuData>();
    for (const m of mcuData) {
      const phaseKey = m.phase ?? 0; // 0 = "sans phase renseignée", regroupé à part
      if (!map.has(phaseKey)) map.set(phaseKey, []);
      map.get(phaseKey)!.push(m);
    }
        return Array.from(map.entries())
          .sort((a, b) => {
            const orderA = a[0] === 0 ? Infinity : a[0];
            const orderB = b[0] === 0 ? Infinity : b[0];
            return orderA - orderB;
          })
          .map(([phase, movies]) => ({

        phase,
        movies: [...movies].sort((a, b) => a.releaseOrder - b.releaseOrder),
      }));
  }, [mcuData, mcuViewMode]);


  function toggleCategory(cat: string) {
    setCategoryFilters((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }


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
                  <div className="flex items-center gap-3 flex-wrap mb-2">
                    <ViewModeToggle mode={mcuViewMode} setMode={setMcuViewMode} />

                    <div className="relative">
                      <button
                        onClick={() => setFilterOpen((o) => !o)}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-white transition-colors"
                      >
                        Filtrer {categoryFilters.size > 0 && `(${categoryFilters.size})`}
                        <span className={`transition-transform ${filterOpen ? 'rotate-180' : ''}`}>▾</span>
                      </button>

                      {filterOpen && (
                        <div className="absolute z-30 top-full mt-2 left-0 w-64 bg-card border border-border rounded-xl shadow-lg p-3 space-y-1">
                          {availableCategories.map((cat) => (
                            <label key={cat} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted/50 cursor-pointer text-sm">
                              <input
                                type="checkbox"
                                checked={categoryFilters.has(cat)}
                                onChange={() => toggleCategory(cat)}
                                className="accent-primary"
                              />
                              <span className="text-white">{getCategoryLabel(cat)}</span>
                            </label>
                          ))}
                          {categoryFilters.size > 0 && (
                            <button
                              onClick={() => setCategoryFilters(new Set())}
                              className="w-full text-center text-xs text-muted-foreground hover:text-white pt-2 mt-2 border-t border-border"
                            >
                              Tout réinitialiser
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

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


                  {mcuByPhase ? (
                    // --- Mode Sortie : groupé par Phase / Saga ---
                    <div className="space-y-12">
                      {mcuByPhase.map(({ phase, movies }) => (
                        <div key={phase}>
                          <div className="mb-4 flex items-baseline gap-3">
                            <h3 className="text-lg font-display font-bold text-white tracking-widest">
                              {phase === 0 ? 'Autres' : PHASE_SAGA[phase] || `Phase ${phase}`}
                            </h3>
                            {phase > 0 && (
                              <span className="text-xs text-muted-foreground uppercase tracking-widest">
                                {getSagaLabel(phase)}
                              </span>
                            )}
                          </div>
                          <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
                            <AnimatePresence mode="popLayout">
                              {movies.map((movie, index) => (
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
                        </div>
                      ))}
                    </div>
                  ) : (
                    // --- Mode Chrono : liste continue, comme avant ---
                    <motion.div 
                      layout
                      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6"
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
                  )}


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
