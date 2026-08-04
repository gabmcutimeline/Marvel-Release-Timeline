import { useEffect, useState } from 'react';
import { fetchTmdbPoster, isPlaceholderPoster } from '../lib/tmdb';

/**
 * Retourne l'URL d'affiche à utiliser pour l'affichage : l'URL fournie si
 * c'est déjà une vraie affiche, sinon tente une résolution live via TMDB,
 * et retombe sur le placeholder si rien n'est trouvé (ou si aucune clé
 * TMDB n'est configurée).
 */
export function useResolvedPoster(title: string, fallbackUrl: string): string {
  const [posterUrl, setPosterUrl] = useState(fallbackUrl);

  useEffect(() => {
    setPosterUrl(fallbackUrl);
    if (!isPlaceholderPoster(fallbackUrl)) return;

    let cancelled = false;
    fetchTmdbPoster(title).then((resolved) => {
      if (!cancelled && resolved) setPosterUrl(resolved);
    });
    return () => {
      cancelled = true;
    };
  }, [title, fallbackUrl]);

  return posterUrl;
}
