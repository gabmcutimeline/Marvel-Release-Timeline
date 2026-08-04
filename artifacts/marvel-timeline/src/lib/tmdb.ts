// Résolution d'affiches manquantes via l'API publique TMDB.
// Nécessite une clé API gratuite (voir replit.md) placée dans la variable
// d'environnement VITE_TMDB_API_KEY. Sans clé, la fonction ne fait rien et
// le placeholder existant (placehold.co) reste affiché — aucune régression.

const API_KEY = import.meta.env.VITE_TMDB_API_KEY as string | undefined;

// Cache en mémoire pour éviter de refaire la requête à chaque re-render
// ou changement de filtre/tri.
const cache = new Map<string, string | null>();
const inFlight = new Map<string, Promise<string | null>>();

interface TmdbSearchResult {
  poster_path: string | null;
  media_type?: string;
}

interface TmdbSearchResponse {
  results: TmdbSearchResult[];
}

/**
 * Cherche une affiche sur TMDB à partir du titre (film ou série).
 * Retourne l'URL complète de l'image, ou null si rien n'a été trouvé
 * (clé absente, aucun résultat, erreur réseau, etc.).
 */
export async function fetchTmdbPoster(title: string): Promise<string | null> {
  if (!API_KEY) return null;

  if (cache.has(title)) return cache.get(title)!;
  if (inFlight.has(title)) return inFlight.get(title)!;

  const promise = (async () => {
    try {
      const url = `https://api.themoviedb.org/3/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(title)}&language=fr-FR&include_adult=false`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`TMDB ${res.status}`);
      const data: TmdbSearchResponse = await res.json();
      const match = data.results?.find((r) => r.poster_path);
      const posterUrl = match?.poster_path
        ? `https://image.tmdb.org/t/p/w500${match.poster_path}`
        : null;
      cache.set(title, posterUrl);
      return posterUrl;
    } catch {
      cache.set(title, null);
      return null;
    } finally {
      inFlight.delete(title);
    }
  })();

  inFlight.set(title, promise);
  return promise;
}

/** Une URL posterUrl est un placeholder généré côté client, pas une vraie affiche. */
export function isPlaceholderPoster(url: string): boolean {
  return url.startsWith('https://placehold.co');
}
