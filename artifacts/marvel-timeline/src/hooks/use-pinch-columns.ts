import { useRef, useState, useEffect } from 'react';

/**
 * Détecte un geste de pincement à 2 doigts et ajuste un nombre de colonnes
 * (écarter les doigts = moins de colonnes/cartes plus grandes,
 *  rapprocher les doigts = plus de colonnes/cartes plus petites).
 */
export function usePinchColumns(defaultCols: number, min: number, max: number) {
  const [cols, setCols] = useState(defaultCols);
  const lastDistance = useRef<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    function check() {
      setIsMobile(window.innerWidth < 640); // correspond au breakpoint "sm" de Tailwind
    }
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  function getDistance(touches: React.TouchList) {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function onTouchStart(e: React.TouchEvent) {
    if (e.touches.length === 2) {
      lastDistance.current = getDistance(e.touches);
    }
  }

  function onTouchMove(e: React.TouchEvent) {
    if (e.touches.length !== 2 || lastDistance.current === null) return;
    e.preventDefault(); // empêche le zoom natif du navigateur sur cette zone

    const newDistance = getDistance(e.touches);
    const delta = newDistance - lastDistance.current;
    const threshold = 40; // pixels à parcourir avant de changer d'une colonne

    if (Math.abs(delta) > threshold) {
      setCols((c) => {
        // écarter les doigts (delta positif) = zoom avant = moins de colonnes
        const next = delta > 0 ? c - 1 : c + 1;
        return Math.min(max, Math.max(min, next));
      });
      lastDistance.current = newDistance;
    }
  }

  function onTouchEnd() {
    lastDistance.current = null;
  }

  return {
    cols,
    touchHandlers: isMobile ? { onTouchStart, onTouchMove, onTouchEnd } : {},
    style: isMobile
      ? { gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, touchAction: 'pan-y' as const }
      : {},
  };
}