import React from 'react';
import { marvelData, MarvelEntry } from '../data/marvel-data';
import { connections, Connection } from '../data/connections-data';
import { Header } from '../components/Header';
import { MovieModal } from '../components/MovieModal';
import { useResolvedPoster } from '../hooks/use-resolved-poster';

interface VirtualEntry { id: string; title: string; href?: string; posterUrl?: string }
const virtualEntries: Record<string, VirtualEntry> = {
  'conn-aos': { id: 'conn-aos', title: 'Agents of S.H.I.E.L.D.', href: '/agents-of-shield', posterUrl: "/posters/aos.jpg" },
  'conn-mcu-block': { id: 'conn-mcu-block', title: 'Le MCU (ensemble des films)', posterUrl: "/posters/marvels.jpg" },
};

// Certains éléments jouent le rôle de "tronc" même sans être dans le tri MCU standard (ex. l'animation Disney+)
const FORCED_TRUNK_IDS = ['x-a-1', 'x-a-2'];
// Ordre de tri spécifique à cette page pour les entrées forcées dans le tronc
// (leur chronologicalOrder d'origine ne reflète pas leur vraie place dans la timeline MCU)
const TRUNK_SORT_OVERRIDE: Record<string, number> = {
  'x-a-1': 9000,
  'x-a-2': 9001,
};

function resolveEntry(id: string): MarvelEntry | VirtualEntry | null {
  return marvelData.find((m) => m.id === id) || virtualEntries[id] || null;
}
function isVirtual(e: MarvelEntry | VirtualEntry): e is VirtualEntry {
  return !('posterUrl' in e);
}
function isTrunk(e: MarvelEntry | VirtualEntry): boolean {
  if (isVirtual(e)) return false;
  if (FORCED_TRUNK_IDS.includes(e.id)) return true;
  return e.section === 'mcu' && e.category !== 'serie-netflix';
}
function studioLabel(e: MarvelEntry | VirtualEntry): string {
  if (isVirtual(e)) return 'Marvel TV';
  if (e.studio === 'sony') return 'Sony';
  if (e.studio === 'fox') return 'Fox';
  if (e.studio === 'lionsgate') return 'Lionsgate';
  if (e.studio === 'new-line') return 'New Line Cinema';
  if (e.studio === 'universal') return 'Universal';
  if (e.category?.includes('spider') && e.section === 'multiverse') return 'Sony';
  if (e.category === 'x-men' || (e.category === 'x-men-animation' && !FORCED_TRUNK_IDS.includes(e.id))) return 'Fox';
  if (e.category === 'serie-netflix' || e.category === 'serie-non-canon') return 'Marvel TV';
  return 'SONY';
}

function Poster({ entry }: { entry: MarvelEntry | VirtualEntry }) {
  const poster = entry.posterUrl || '';
  const resolved = useResolvedPoster(entry.title, poster);
  if (isVirtual(entry) && !entry.posterUrl) {
    return (
      <div className="w-16 h-24 rounded-lg bg-muted/50 border border-white/10 flex items-center justify-center text-[9px] text-center text-muted-foreground p-1 shrink-0">
        {entry.title}
      </div>
    );
  }
  return <img src={resolved} alt={entry.title} className="w-16 h-24 object-cover rounded-lg border-2 border-white/10 shrink-0" />;
}

function BranchCard({ entry, conn, onOpen }: { entry: MarvelEntry | VirtualEntry; conn: Connection; onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      className="w-full flex items-center gap-3 bg-card/40 border rounded-lg p-3 text-left hover:bg-card/70 transition-colors"
      style={{ borderColor: conn.color + '80' }}
    >
      <Poster entry={entry} />
      <div className="min-w-0 flex-1">
        <div className="text-[10px] uppercase tracking-widest font-bold" style={{ color: conn.color }}>
          {studioLabel(entry)}
        </div>
        <div className="text-sm font-semibold text-white truncate">{conn.branchLabelOverride || entry.title}</div>
        {conn.label && <div className="text-xs text-muted-foreground mt-1">{conn.label}</div>}
      </div>
    </button>
  );
}

export default function ConnectionsList() {
  const [selectedMovie, setSelectedMovie] = React.useState<MarvelEntry | null>(null);

  React.useEffect(() => { window.scrollTo(0, 0); }, []);

  function openIfReal(entry: MarvelEntry | VirtualEntry) {
    if (isVirtual(entry)) {
      if (entry.href) window.location.href = entry.href;
      return;
    }
    setSelectedMovie(entry);
  }

  // Regroupe les connexions "branche" par leur point d'ancrage sur le tronc MCU
  const trunkGroups = React.useMemo(() => {
    const map = new Map<string, Connection[]>();
    for (const conn of connections) {
      if (conn.internal) continue;
      const anchorId = conn.anchorIsFrom ? conn.fromId : conn.toId;
      const anchor = resolveEntry(anchorId);
      if (!anchor || !isTrunk(anchor)) continue;
      if (!map.has(anchorId)) map.set(anchorId, []);
      map.get(anchorId)!.push(conn);
    }
    // Trie les points d'ancrage par ordre chronologique MCU
    return Array.from(map.entries())
      .map(([anchorId, conns]) => ({ anchor: resolveEntry(anchorId) as MarvelEntry, conns }))
      .filter((g) => g.anchor)
    .sort((a, b) => {
      const orderA = TRUNK_SORT_OVERRIDE[a.anchor.id] ?? a.anchor.chronologicalOrder ?? 0;
      const orderB = TRUNK_SORT_OVERRIDE[b.anchor.id] ?? b.anchor.chronologicalOrder ?? 0;
      return orderA - orderB;
    });
  }, []);

  const internalConnections = connections.filter((c) => c.internal);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <a href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors mb-6">
          ← Retour à l'accueil
        </a>

        <h1 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-widest mb-2">
          FILMS MARVEL & CONNEXIONS
        </h1>
        <p className="text-sm text-muted-foreground mb-16 max-w-xl">
          La ligne principale du MCU a débuté en 2008. Au fil du temps, Disney a introduit le multivers,
          permettant de rattacher d'anciennes productions Marvel — Spider-Man de Sony, X-Men de la Fox,
          Blade, Daredevil, Punisher, les séries Marvel TV — à l'histoire principale. Voici chaque point de jonction.
        </p>

        {/* --- LE TRONC --- */}
        <div className="relative">
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/60 via-primary/30 to-transparent" />

          {trunkGroups.map(({ anchor, conns }) => (
            <div key={anchor.id} className="relative pl-16 mb-16">
              {/* Point sur le tronc */}
              <div className="absolute left-3 top-2 w-6 h-6 rounded-full bg-primary border-4 border-background shadow-[0_0_12px_rgba(225,29,72,0.6)]" />

              <button onClick={() => setSelectedMovie(anchor)} className="flex items-center gap-3 mb-4 text-left hover:opacity-80 transition-opacity">
                <Poster entry={anchor} />
                <div>
                  <div className="text-[10px] uppercase tracking-widest font-bold text-primary">Tronc MCU · {anchor.releaseDate}</div>
                  <div className="text-lg font-display font-bold text-white">{anchor.title}</div>
                </div>
              </button>

              <div className="space-y-2 pl-4 border-l border-dashed border-border">
                {conns.map((conn, i) => {
                  const branchId = conn.anchorIsFrom ? conn.toId : conn.fromId;
                  const branch = resolveEntry(branchId);
                  if (!branch) return null;
                  return (
                    <div key={i} className="pl-4">
                      <BranchCard entry={branch} conn={conn} onOpen={() => openIfReal(branch)} />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* --- CONNEXIONS INTERNES (ne touchent pas directement le tronc) --- */}
        {internalConnections.length > 0 && (
          <div className="mt-20 pt-10 border-t border-border">
            <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-6">
              Connexions internes (Marvel TV / AoS)
            </h2>
            <div className="space-y-3">
              {internalConnections.map((conn, i) => {
                const from = resolveEntry(conn.fromId);
                const to = resolveEntry(conn.toId);
                if (!from || !to) return null;
            return (
              <div key={i} className="bg-card/20 border border-border rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <button onClick={() => openIfReal(from)} className="flex items-center gap-2 min-w-0 flex-1 text-left hover:opacity-80">
                    <Poster entry={from} />
                    <span className="text-sm text-white truncate">{conn.branchLabelOverride || from.title}</span>
                  </button>
                  <span style={{ color: conn.color }}>→</span>
                  <button onClick={() => openIfReal(to)} className="flex items-center gap-2 min-w-0 flex-1 text-left hover:opacity-80">
                    <Poster entry={to} />
                    <span className="text-sm text-white truncate">{conn.toLabelOverride || to.title}</span>
                  </button>
                </div>
                {conn.label && (
                  <div className="text-xs text-muted-foreground mt-2 pl-2 border-l-2" style={{ borderColor: conn.color }}>
                    {conn.label}
                  </div>
                )}
              </div>
            );
              })}
            </div>
          </div>
        )}

        <div className="mt-16 pt-6 border-t border-border">
          <a href="/connexions-carte" className="text-xs text-muted-foreground hover:text-white transition-colors">
            Voir l'ancienne carte visuelle (archivée) →
          </a>
        </div>
      </main>

      {selectedMovie && (
        <MovieModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} />
      )}
    </div>
  );
}