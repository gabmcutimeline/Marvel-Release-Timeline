import React from 'react';
import { marvelData, MarvelEntry } from '../data/marvel-data';
import { Header } from '../components/Header';
import { MovieModal } from '../components/MovieModal';
import { useResolvedPoster } from '../hooks/use-resolved-poster';
import { connections } from '../data/connections-data';

const CONNECTIONS_STORAGE_KEY = 'marvel-connections-curves-v3';

interface Point { x: number; y: number; }
interface CurveData { start?: Point; end?: Point; mids: Point[]; }

function loadCurveData(): Record<string, CurveData> {
  try {
    const raw = localStorage.getItem(CONNECTIONS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveCurveData(all: Record<string, CurveData>) {
  localStorage.setItem(CONNECTIONS_STORAGE_KEY, JSON.stringify(all));
}

function buildSmoothPath(points: Point[]) {
  if (points.length < 2) return '';
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? 0 : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2 < points.length ? i + 2 : i + 1];
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

type DragTarget = { key: string; role: 'start' | 'end' } | { key: string; role: 'mid'; index: number };

function ConnectionsOverlay({ containerRef, editMode }: { containerRef: React.RefObject<HTMLDivElement>; editMode: boolean; zoom: number; pan: { x: number; y: number } }) {
  const [endpoints, setEndpoints] = React.useState<{ key: string; x1: number; y1: number; x2: number; y2: number; color: string }[]>([]);
  const [curveData, setCurveData] = React.useState<Record<string, CurveData>>({});
  const [size, setSize] = React.useState({ width: 0, height: 0 });
  const draggingRef = React.useRef<DragTarget | null>(null);

  React.useEffect(() => {
    setCurveData(loadCurveData());
  }, []);

  React.useEffect(() => {
    function compute() {
      const container = containerRef.current;
      if (!container) return;
      const containerRect = container.getBoundingClientRect();
      const newEndpoints: typeof endpoints = [];

      for (const conn of connections) {
        const fromEl = document.getElementById(`conn-${conn.fromId}`) || document.getElementById(conn.fromId);
        const toEl = document.getElementById(`conn-${conn.toId}`) || document.getElementById(conn.toId);
        if (!fromEl || !toEl) continue;

        const fromRect = fromEl.getBoundingClientRect();
        const toRect = toEl.getBoundingClientRect();

        const x1 = fromRect.left - containerRect.left + fromRect.width / 2 + container.scrollLeft;
        const y1 = fromRect.top - containerRect.top + fromRect.height / 2 + container.scrollTop;
        const x2 = toRect.left - containerRect.left + toRect.width / 2 + container.scrollLeft;
        const y2 = toRect.top - containerRect.top + toRect.height / 2 + container.scrollTop;

        newEndpoints.push({ key: `${conn.fromId}__${conn.toId}`, x1, y1, x2, y2, color: conn.color });
      }

      setEndpoints(newEndpoints);
      setSize({ width: container.scrollWidth, height: container.scrollHeight });
    }

    compute();
    const timeout = setTimeout(compute, 300);
    window.addEventListener('resize', compute);
    const container = containerRef.current;
    container?.addEventListener('scroll', compute);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener('resize', compute);
      container?.removeEventListener('scroll', compute);
    };
  }, [containerRef]);

  function getData(key: string): CurveData {
    return curveData[key] || { mids: [] };
  }

  function getFullPoints(ep: typeof endpoints[number]) {
    const data = getData(ep.key);
    const start = data.start || { x: ep.x1, y: ep.y1 };
    const end = data.end || { x: ep.x2, y: ep.y2 };
    return [start, ...data.mids, end];
  }

  function getMousePos(e: React.PointerEvent | React.MouseEvent) {
    const container = containerRef.current!;
    const rect = container.getBoundingClientRect();
    return {
      x: e.clientX - rect.left + container.scrollLeft,
      y: e.clientY - rect.top + container.scrollTop,
    };
  }

  function updateData(key: string, updater: (d: CurveData) => CurveData) {
    setCurveData((prev) => {
      const next = { ...prev, [key]: updater(getData(key)) };
      saveCurveData(next);
      return next;
    });
  }

  function onPathClick(key: string, ep: typeof endpoints[number], e: React.MouseEvent) {
    if (!editMode) return;
    const pos = getMousePos(e);
    const points = getFullPoints(ep);
    let insertAt = points.length - 1;
    for (let i = 0; i < points.length - 1; i++) {
      if ((pos.x - points[i].x) * (points[i + 1].x - points[i].x) >= 0 && (pos.x - points[i + 1].x) * (points[i].x - points[i + 1].x) >= 0) {
        insertAt = i;
        break;
      }
    }
    updateData(key, (d) => {
      const mids = [...d.mids];
      mids.splice(insertAt, 0, pos);
      return { ...d, mids };
    });
  }

  function onHandlePointerDown(target: DragTarget, e: React.PointerEvent) {
    if (!editMode) return;
    e.stopPropagation();
    draggingRef.current = target;
    (e.target as Element).setPointerCapture(e.pointerId);
  }
  function onHandlePointerMove(e: React.PointerEvent) {
    const drag = draggingRef.current;
    if (!drag) return;
    const pos = getMousePos(e);
    setCurveData((prev) => {
      const d = { ...(prev[drag.key] || { mids: [] }) };
      if (drag.role === 'start') d.start = pos;
      else if (drag.role === 'end') d.end = pos;
      else {
        const mids = [...d.mids];
        mids[drag.index] = pos;
        d.mids = mids;
      }
      return { ...prev, [drag.key]: d };
    });
  }
  function onHandlePointerUp() {
    if (draggingRef.current) saveCurveData(curveData);
    draggingRef.current = null;
  }

  function onMidDoubleClick(key: string, index: number, e: React.MouseEvent) {
    if (!editMode) return;
    e.stopPropagation();
    updateData(key, (d) => {
      const mids = [...d.mids];
      mids.splice(index, 1);
      return { ...d, mids };
    });
  }
  function onEndpointDoubleClick(key: string, role: 'start' | 'end', e: React.MouseEvent) {
    if (!editMode) return;
    e.stopPropagation();
    updateData(key, (d) => ({ ...d, [role]: undefined }));
  }

  return (
    <svg
      className="absolute top-0 left-0"
      width={size.width}
      height={size.height}
      style={{ zIndex: 20, pointerEvents: editMode ? 'auto' : 'none', overflow: 'visible' }}
      onPointerMove={onHandlePointerMove}
      onPointerUp={onHandlePointerUp}
    >
      <defs>
        {endpoints.map((ep, i) => (
          <marker key={i} id={`arrowhead-${i}`} markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill={ep.color} />
          </marker>
        ))}
      </defs>
      {endpoints.map((ep, i) => {
        const data = getData(ep.key);
        const points = getFullPoints(ep);
        const d = buildSmoothPath(points);
        const start = points[0];
        const end = points[points.length - 1];
        return (
          <g key={ep.key}>
            <path
              d={d}
              stroke={ep.color}
              strokeWidth={editMode ? 10 : 2}
              fill="none"
              opacity={editMode ? 0.15 : 0.85}
              style={{ cursor: editMode ? 'copy' : 'default' }}
              onClick={(e) => onPathClick(ep.key, ep, e)}
            />
            <path d={d} stroke={ep.color} strokeWidth={5} fill="none" opacity={1} markerEnd={`url(#arrowhead-${i})`} pointerEvents="none" />

            {editMode && data.mids.map((p, idx) => (
              <circle
                key={idx}
                cx={p.x} cy={p.y} r={7}
                fill={ep.color} stroke="white" strokeWidth={2}
                style={{ cursor: 'grab' }}
                onPointerDown={(e) => onHandlePointerDown({ key: ep.key, role: 'mid', index: idx }, e)}
                onDoubleClick={(e) => onMidDoubleClick(ep.key, idx, e)}
              />
            ))}

            {editMode && (
              <rect
                x={start.x - 7} y={start.y - 7} width={14} height={14}
                fill={ep.color} stroke="white" strokeWidth={2}
                style={{ cursor: 'grab' }}
                onPointerDown={(e) => onHandlePointerDown({ key: ep.key, role: 'start' }, e)}
                onDoubleClick={(e) => onEndpointDoubleClick(ep.key, 'start', e)}
              />
            )}
            {editMode && (
              <rect
                x={end.x - 7} y={end.y - 7} width={14} height={14}
                fill={ep.color} stroke="white" strokeWidth={2}
                style={{ cursor: 'grab' }}
                onPointerDown={(e) => onHandlePointerDown({ key: ep.key, role: 'end' }, e)}
                onDoubleClick={(e) => onEndpointDoubleClick(ep.key, 'end', e)}
              />
            )}
          </g>
        );
      })}
    </svg>
  );
}



function MiniPoster({ movie, onClick }: { movie: MarvelEntry; onClick: () => void }) {
  const posterUrl = useResolvedPoster(movie.title, movie.posterUrl);
  return (
    <button
      id={`conn-${movie.id}`}
      onClick={onClick}
      title={movie.title}
      className="w-full aspect-[2/3] rounded overflow-hidden border border-white/10 hover:border-white/40 transition-colors"
    >
      <img src={posterUrl} alt={movie.title} className="w-full h-full object-cover" />
    </button>
  );
}

function StudioColumn({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
  return (
    <div className="w-64 shrink-0 rounded-xl overflow-hidden border border-white/10 bg-card/30">
      <div className={`px-4 py-2 font-display font-bold text-center tracking-widest ${color}`}>
        {title}
      </div>
      <div className="p-4 space-y-4">{children}</div>
    </div>
  );
}

// Un bloc = une barre de titre colorée + sa grille de posters (comme sur le Figma)
function ShowBlock({ title, barColor, movies, onOpen, cols = 3 }: { title: string; barColor: string; movies: MarvelEntry[]; onOpen: (m: MarvelEntry) => void; cols?: number }) {
  if (movies.length === 0) return null;
  return (
    <div>
      <div id={title === 'Timeline complète' ? 'conn-mcu-block' : undefined} className={`text-[10px] font-bold uppercase tracking-widest text-center py-1 rounded mb-2 ${barColor}`}>
        {title}
      </div>
      <div className={`grid gap-2`} style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
        {movies.map((m) => (
          <MiniPoster key={m.id} movie={m} onClick={() => onOpen(m)} />
        ))}
      </div>
    </div>
  );
}



// Variante pour Agents of S.H.I.E.L.D., qui n'a pas d'entrée unique dans marvel-data.ts
function ShowLinkBlock({ title, barColor, href, posterUrl }: { title: string; barColor: string; href: string }) {
  return (
    <div>
      <div className={`text-[10px] font-bold uppercase tracking-widest text-center py-1 rounded mb-2 ${barColor}`}>
        {title}
      </div>
      <a
        id="conn-aos"
          href={href}
          className="flex items-center justify-center aspect-[2/3] w-1/3 rounded overflow-hidden border border-white/10 hover:border-white/40 transition-colors text-[10px] text-center text-muted-foreground p-1"
        >
          {posterUrl ? (
            <img src={posterUrl} alt={title} className="w-full h-full object-cover" />
          ) : (
            'Voir la page dédiée →'
          )}
      </a>
    </div>
  );
}


  export default function Connections() {
    const [selectedMovie, setSelectedMovie] = React.useState<MarvelEntry | null>(null);
    const scrollContainerRef = React.useRef<HTMLDivElement>(null);
    const [editMode, setEditMode] = React.useState(false);
    const topScrollRef = React.useRef<HTMLDivElement>(null);
    const [scrollWidth, setScrollWidth] = React.useState(0);
    const syncingRef = React.useRef(false);

    React.useEffect(() => {
      function updateWidth() {
        if (scrollContainerRef.current) {
          setScrollWidth(scrollContainerRef.current.scrollWidth);
        }
      }
      updateWidth();
      const interval = setInterval(updateWidth, 500);
      return () => clearInterval(interval);
    }, []);

    function onTopScroll() {
      if (syncingRef.current || !topScrollRef.current || !scrollContainerRef.current) return;
      syncingRef.current = true;
      scrollContainerRef.current.scrollLeft = topScrollRef.current.scrollLeft;
      syncingRef.current = false;
    }

    function onBottomScroll() {
      if (syncingRef.current || !topScrollRef.current || !scrollContainerRef.current) return;
      syncingRef.current = true;
      topScrollRef.current.scrollLeft = scrollContainerRef.current.scrollLeft;
      syncingRef.current = false;
    }

  React.useEffect(() => { window.scrollTo(0, 0); }, []);

  const defendersShows = marvelData.filter(m => ['sn-1', 'sn-2', 'sn-4', 'sn-5', 'sn-6', 'sn-7'].includes(m.id));
  const agentCarter = marvelData.filter(m => m.id === 'sf-8');
  const cloakDagger = marvelData.filter(m => m.id === 'snc-2a');
  const runaways = marvelData.filter(m => m.id === 'snc-1');
  const helstrom = marvelData.filter(m => m.id === 'snc-3');
  const gifted = marvelData.filter(m => m.id === 'snc-4');
  const inhumans = marvelData.filter(m => m.id === 'sf-10');

  const spiderRaimi = marvelData.filter(m => m.category === 'spider-maguire');
  const spiderWebb = marvelData.filter(m => m.category === 'spider-garfield');
  const ghostRider = marvelData.filter(m => m.subCategory === 'Ghost Rider');
  const ssu = marvelData.filter(m => m.category === 'sony-spider');
  const spiderAnim = marvelData.filter(m => m.category === 'spider-animation');

  const hulk2003 = marvelData.filter(m => m.subCategory === 'Hulk');
  const blade = marvelData.filter(m => m.subCategory === 'Blade');
  const punisherManThing = marvelData.filter(m => m.subCategory === 'Punisher & Man-Thing');

  const xmen = marvelData.filter(m => m.category === 'x-men');
  const daredevilElektra = marvelData.filter(m => m.subCategory === 'Daredevil & Elektra');
  const fantasticFour = marvelData.filter(m => m.subCategory === '4 Fantastiques');
  const fantasticFourReboot = marvelData.filter(m => m.subCategory === '4 Fantastiques Reboot');

  const animationExcludeIds = ['sm-3', 'sm-4', 'sm-5', 'sm-7', 'x-a-1', 'x-a-2', 's-11'];
  const animationDisplayIds = ['sm-3', 'sm-7', 'x-a-1', 's-11'];

  const mcuAll = marvelData
    .filter(m => m.section === 'mcu')
    .filter(m => m.category !== 'serie-netflix')
    .filter(m => !m.chronoOnly)
    .filter(m => !animationExcludeIds.includes(m.id))
    .sort((a, b) => a.chronologicalOrder - b.chronologicalOrder);

  const disneyAnimation = marvelData.filter(m => animationDisplayIds.includes(m.id));



return (
  <div className="min-h-screen bg-background text-foreground flex flex-col">
    <Header />

    <main className="flex-1 w-full mx-auto px-4 sm:px-6 lg:px-8 py-32">
      <a href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors mb-6">
        ← Retour à l'accueil
      </a>

      <div className="flex items-center justify-between mb-2 flex-wrap gap-4">
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-widest">
          FILMS MARVEL & CONNEXIONS
        </h1>
        <button
          onClick={() => setEditMode((e) => !e)}
          className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-colors ${editMode ? 'bg-red-500 text-white' : 'bg-card border border-border text-muted-foreground'}`}
        >
          {editMode ? '✓ Mode édition actif' : 'Éditer les flèches'}
        </button>
      </div>
      <p className="text-sm text-muted-foreground mb-12">
        {editMode
          ? "Glisse le point coloré au milieu de chaque flèche pour la courber. Ça se sauvegarde automatiquement."
          : "Comment les productions hors-MCU se rattachent entre elles et au MCU."}
      </p>
      <div
        ref={topScrollRef}
        onScroll={onTopScroll}
        className="overflow-x-auto overflow-y-hidden mb-2"
        style={{ height: 16 }}
      >
        <div style={{ width: scrollWidth, height: 1 }} />
      </div>
      <div ref={scrollContainerRef} onScroll={onBottomScroll} className="relative flex gap-6 overflow-x-auto overflow-y-visible pb-8 pt-24 pl-24 pr-24">
        <StudioColumn title="MARVEL TV" color="bg-slate-500/30 text-slate-200">
          <ShowBlock title="The Defenders" barColor="bg-red-900/50 text-red-200" movies={defendersShows} onOpen={setSelectedMovie} />
          <ShowBlock title="Agent Carter" barColor="bg-purple-900/50 text-purple-200" movies={agentCarter} onOpen={setSelectedMovie} />
          <ShowLinkBlock title="Agents of S.H.I.E.L.D." barColor="bg-blue-900/50 text-blue-200" href="/agents-of-shield" posterUrl="/posters/aos.jpg" />
          <ShowBlock title="Cloak & Dagger" barColor="bg-pink-900/50 text-pink-200" movies={cloakDagger} onOpen={setSelectedMovie} />
          <ShowBlock title="Runaways" barColor="bg-green-900/50 text-green-200" movies={runaways} onOpen={setSelectedMovie} />
          <ShowBlock title="Inhumans" barColor="bg-cyan-900/50 text-cyan-200" movies={inhumans} onOpen={setSelectedMovie} />
          <ShowBlock title="Helstrom" barColor="bg-neutral-700/50 text-neutral-200" movies={helstrom} onOpen={setSelectedMovie} />
          <ShowBlock title="The Gifted" barColor="bg-yellow-900/50 text-yellow-200" movies={gifted} onOpen={setSelectedMovie} />
        </StudioColumn>

        <StudioColumn title="SONY" color="bg-pink-500/30 text-pink-200">
          <ShowBlock title="Raimi / Maguire" barColor="bg-green-900/50 text-green-200" movies={spiderRaimi} onOpen={setSelectedMovie} />
          <ShowBlock title="Webb / Garfield" barColor="bg-blue-900/50 text-blue-200" movies={spiderWebb} onOpen={setSelectedMovie} />
          <ShowBlock title="Ghost Rider" barColor="bg-red-900/50 text-red-200" movies={ghostRider} onOpen={setSelectedMovie} />
          <ShowBlock title="SSU" barColor="bg-yellow-900/50 text-yellow-200" movies={ssu} onOpen={setSelectedMovie} />
          <ShowBlock title="Animation" barColor="bg-pink-900/50 text-pink-200" movies={spiderAnim} onOpen={setSelectedMovie} />
        </StudioColumn>

        <StudioColumn title="UNIVERSAL" color="bg-cyan-500/30 text-cyan-200">
          <ShowBlock title="Hulk" barColor="bg-green-900/50 text-green-200" movies={hulk2003} onOpen={setSelectedMovie} />
        </StudioColumn>

        <StudioColumn title="DISNEY (MCU)" color="bg-purple-500/30 text-purple-200">
          <ShowBlock title="Timeline complète" barColor="bg-orange-900/50 text-orange-200" movies={mcuAll} onOpen={setSelectedMovie} cols={6} />
          <ShowBlock title="Disney Animation" barColor="bg-emerald-900/50 text-emerald-200" movies={disneyAnimation} onOpen={setSelectedMovie} />
        </StudioColumn>

        <StudioColumn title="NEW LINE CINEMA" color="bg-green-500/30 text-green-200">
          <ShowBlock title="Blade" barColor="bg-red-900/50 text-red-200" movies={blade} onOpen={setSelectedMovie} />
        </StudioColumn>

        <StudioColumn title="LIONSGATE" color="bg-orange-500/30 text-orange-200">
          <ShowBlock title="Punisher & Man-Thing" barColor="bg-neutral-700/50 text-neutral-200" movies={punisherManThing} onOpen={setSelectedMovie} />
        </StudioColumn>

        <StudioColumn title="FOX" color="bg-yellow-500/30 text-yellow-200">
          <ShowBlock title="X-Men" barColor="bg-purple-900/50 text-purple-200" movies={xmen} onOpen={setSelectedMovie} cols={4} />
          <ShowBlock title="Daredevil & Elektra" barColor="bg-red-900/50 text-red-200" movies={daredevilElektra} onOpen={setSelectedMovie} cols={4} />
          <ShowBlock title="4 Fantastiques" barColor="bg-blue-900/50 text-blue-200" movies={fantasticFour} onOpen={setSelectedMovie} cols={4} />
          <ShowBlock title="4 Fantastiques Reboot" barColor="bg-cyan-900/50 text-cyan-200" movies={fantasticFourReboot} onOpen={setSelectedMovie} cols={4} />
        </StudioColumn>

        <ConnectionsOverlay containerRef={scrollContainerRef} editMode={editMode} />
        </div>
    </main>

    {selectedMovie && (
      <MovieModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} />
    )}
  </div>
);
}


