import React, { useEffect } from 'react';
import { marvelData, MarvelEntry } from '../data/marvel-data';
import { Header } from '../components/Header';
import { MovieCard } from '../components/MovieCard';
import { MovieModal } from '../components/MovieModal';


type Studio = 'sony' | 'fox' | 'lionsgate' | 'new-line' | 'universal';

const STUDIO_LABELS: Record<Studio, string> = {
  sony: 'Sony',
  fox: '20th Century Fox',
  lionsgate: 'Lionsgate',
  'new-line': 'New Line Cinema',
  universal: 'Universal',
};

function ViewModeToggle({ mode, setMode }: { mode: 'chrono' | 'release'; setMode: (m: 'chrono' | 'release') => void }) {
  return (
    <div className="inline-flex rounded-full border border-border overflow-hidden mb-4">
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


// Déduit studio + sous-catégorie : explicite pour les nouveaux films,
// via la catégorie existante pour Spider-Man / X-Men déjà en base.
function getStudio(movie: MarvelEntry): Studio | null {
  if (movie.studio) return movie.studio;
  if (['spider-maguire', 'spider-garfield', 'sony-spider', 'spider-animation'].includes(movie.category)) return 'sony';
  if (movie.category === 'x-men' || movie.category === 'x-men-animation') return 'fox';
  return null;
}

function getSubCategory(movie: MarvelEntry): string {
  if (movie.subCategory) return movie.subCategory;
  switch (movie.category) {
    case 'x-men':
    case 'x-men-animation':
      return 'X-Men';
    case 'spider-maguire': return 'Raimi / Maguire';
    case 'spider-garfield': return 'Webb / Garfield';
    case 'sony-spider': return "SSU (Sony's Spider-Man Universe)";
    case 'spider-animation': return 'Animation (Into / Across)';
    default: return 'Autres';
  }
}

// Ordre d'affichage des sous-catégories par studio
const SUBCATEGORY_ORDER: Record<Studio, string[]> = {
  fox: ['X-Men', 'Daredevil & Elektra', '4 Fantastiques'],
  sony: ['Raimi / Maguire', 'Webb / Garfield', 'Animation (Into / Across)', "SSU (Sony's Spider-Man Universe)", 'Ghost Rider'],
  lionsgate: ['Punisher & Man-Thing'],
  'new-line': ['Blade'],
  universal: ['Hulk'],
};

export default function PreMCU() {
  const [xmenViewMode, setXmenViewMode] = React.useState<'chrono' | 'release'>('chrono');

  const [selectedMovie, setSelectedMovie] = React.useState<MarvelEntry | null>(null);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const grouped = React.useMemo(() => {
    const map = new Map<Studio, Map<string, MarvelEntry[]>>();
    for (const movie of marvelData) {
      const studio = getStudio(movie);
      if (!studio) continue;
      const subCat = getSubCategory(movie);
      if (!map.has(studio)) map.set(studio, new Map());
      const subMap = map.get(studio)!;
      if (!subMap.has(subCat)) subMap.set(subCat, []);
      subMap.get(subCat)!.push(movie);
    }
    for (const subMap of map.values()) {
      for (const list of subMap.values()) {
        list.sort((a, b) => a.chronologicalOrder - b.chronologicalOrder);
      }
    }
    return map;
  }, []);

  const studioOrder: Studio[] = ['fox', 'sony', 'new-line', 'lionsgate', 'universal'];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />

      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <a href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors mb-6">
          ← Retour à l'accueil
        </a>

        <h1 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-widest mb-4">
          FILMS MARVEL HORS-MCU
        </h1>
        <p className="text-sm text-muted-foreground mb-12">
          Les films produits avant le rachat des droits par Disney, classés par studio.
        </p>

        <div className="space-y-20">
          {studioOrder.map((studio) => {
            const subMap = grouped.get(studio);
            if (!subMap || subMap.size === 0) return null;

            const subCats = SUBCATEGORY_ORDER[studio].length > 0
              ? SUBCATEGORY_ORDER[studio].filter(sc => subMap.has(sc))
              : Array.from(subMap.keys());

            return (
              <section key={studio}>
                <h2 className="text-xl font-display font-bold text-white tracking-[0.2em] mb-8 border-l-4 border-orange-500 pl-4">
                  {STUDIO_LABELS[studio]}
                </h2>

                <div className="space-y-10">
                  {subCats.map((subCat) => (
                      <div key={subCat}>
                        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">
                          {subCat}
                        </h3>
                        {subCat === 'X-Men' && (
                          <ViewModeToggle mode={xmenViewMode} setMode={setXmenViewMode} />
                        )}
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
                          {(subCat === 'X-Men'
                            ? [...subMap.get(subCat)!].sort((a, b) => xmenViewMode === 'chrono' ? a.chronologicalOrder - b.chronologicalOrder : a.releaseOrder - b.releaseOrder)
                            : subMap.get(subCat)!
                          ).map((movie, index) => (
                            <MovieCard
                              key={movie.id}
                              movie={movie}
                              index={index}
                              viewMode="chrono"
                              onOpenInfo={() => setSelectedMovie(movie)}
                              badgeLabelOverride={STUDIO_LABELS[studio].toUpperCase()}
                            />
                          ))}
                        </div>
                      
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </main>

      {selectedMovie && (
        <MovieModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} />
      )}
    </div>
  );
}