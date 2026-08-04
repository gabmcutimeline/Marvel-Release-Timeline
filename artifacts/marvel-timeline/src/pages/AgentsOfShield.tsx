import React, { useEffect } from 'react';
import { marvelData } from '../data/marvel-data';
import { aosTimeline, aosSeasonLinks } from '../data/aos-data';
import { Header } from '../components/Header';
import { MovieModal } from '../components/MovieModal';
import { useResolvedPoster } from '../hooks/use-resolved-poster';

// Carte "film inséré" dans la liste — même esprit que les épisodes mais cliquable
function InsertedMovieCard({ movie, onOpenInfo }: { movie: typeof marvelData[number]; onOpenInfo: () => void }) {
  const posterUrl = useResolvedPoster(movie.title, movie.posterUrl);
  return (
    <button
      onClick={onOpenInfo}
      className="w-full flex gap-4 items-start text-left border-l-4 border-orange-500 bg-orange-500/10 rounded-r-lg p-3 hover:bg-orange-500/20 transition-colors"
    >
      <img src={posterUrl} alt={movie.title} className="w-24 h-36 object-cover rounded shrink-0" />
      <div>
        <div className="text-[10px] font-bold uppercase tracking-widest text-orange-400 mb-1">
          Film — {movie.releaseDate}
        </div>
        <div className="text-lg font-bold text-white mb-1">{movie.title}</div>
        <div className="text-sm text-muted-foreground line-clamp-2">{movie.synopsis}</div>
      </div>
    </button>
  );
}

// Une ligne épisode, style Disney+
function EpisodeRow({ season, episode, title, synopsis, duration, thumbnail, streamingUrl }: { season: number; episode: number; title: string; synopsis?: string; duration?: string; thumbnail?: string; streamingUrl?: string }) {
  const link = streamingUrl || aosSeasonLinks[season];
  return (
    <a
      href={link || '#'}
      target="_blank"
      rel="noopener noreferrer"
      className="w-full flex gap-4 items-start border-l-4 border-transparent p-3 hover:bg-white/5 transition-colors cursor-pointer"
    >
      {thumbnail ? (
        <img src={thumbnail} alt={title} className="w-24 h-14 shrink-0 rounded object-cover" />
      ) : (
        <div className="w-24 h-14 shrink-0 rounded bg-muted/50 flex items-center justify-center text-xs font-bold text-muted-foreground">
          Ép. {episode}
        </div>
      )}
      <div>
        <div className="text-base font-semibold text-white mb-1">{episode}. {title}</div>
        {synopsis && <div className="text-sm text-muted-foreground line-clamp-2">{synopsis}</div>}
        {duration && <div className="text-xs text-muted-foreground/70 mt-1">{duration}</div>}
      </div>
    </a>
  );
}

export default function AgentsOfShield() {
  const [selectedMovie, setSelectedMovie] = React.useState<typeof marvelData[number] | null>(null);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // On regroupe le tableau ordonné par saison. Un film "insert" hérite
  // de la saison de l'épisode qui le précède dans le tableau.
  const seasons = React.useMemo(() => {
    const map = new Map<number, typeof aosTimeline>();
    let currentSeason = 1;
    for (const item of aosTimeline) {
      if (item.type === 'episode') currentSeason = item.season;
      if (!map.has(currentSeason)) map.set(currentSeason, []);
      map.get(currentSeason)!.push(item);
    }
    return map;
  }, []);

  const seasonNumbers = Array.from(seasons.keys()).sort((a, b) => a - b);
  const [activeSeason, setActiveSeason] = React.useState(seasonNumbers[0]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header viewMode="chrono" setViewMode={() => {}} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-32">
        <a href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors mb-6">
          ← Retour à l'accueil
        </a>

        <h1 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-widest mb-8">
          AGENTS OF S.H.I.E.L.D.
        </h1>

        <select
          value={activeSeason}
          onChange={(e) => setActiveSeason(Number(e.target.value))}
          className="mb-8 bg-muted/50 border border-border rounded-lg px-4 py-2 text-white font-semibold"
        >
          {seasonNumbers.map((s) => (
            <option key={s} value={s}>Saison {s}</option>
          ))}
        </select>

        <div className="space-y-1">
          {seasons.get(activeSeason)?.map((item, index) => {
            if (item.type === 'episode') {
              return (
                <EpisodeRow
                  key={`s${item.season}e${item.episode}`}
                  season={item.season}
                  episode={item.episode}
                  title={item.title}
                  synopsis={item.synopsis}
                  duration={item.duration}
                  thumbnail={item.thumbnail}
                  streamingUrl={item.streamingUrl}
                />
              );
            }
            const movie = marvelData.find(m => m.id === item.movieId);
            if (!movie) return null;
            return (
              <InsertedMovieCard
                key={movie.id + index}
                movie={movie}
                onOpenInfo={() => setSelectedMovie(movie)}
              />
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
