"use client";

import { useState, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import Sidebar from "@/components/Sidebar";
import { PLACES, type Place } from "@/data/places";

const HerodotusMap = dynamic(() => import("@/components/HerodotusMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center" style={{ background: '#0a0804' }}>
      <p style={{ fontFamily: "'Cinzel', serif", color: '#c9a227', letterSpacing: '0.1em', fontSize: '0.9rem' }}>
        CARGANDO EL MAPA DEL MUNDO ANTIGUO…
      </p>
    </div>
  ),
});

export default function Home() {
  const [activeBooks, setActiveBooks]   = useState<Set<number>>(new Set([1,2,3,4,5,6,7,8,9]));
  const [flyToPlace, setFlyToPlace]     = useState<Place | null>(null);
  const [visibleCount, setVisibleCount] = useState(PLACES.length);
  const [search, setSearch]             = useState("");
  const [searchOpen, setSearchOpen]     = useState(false);
  const [showRivers, setShowRivers]     = useState(true);

  const handleToggleBook = useCallback((id: number) => {
    setActiveBooks(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const handleVisibleCount = useCallback((n: number) => setVisibleCount(n), []);

  const searchResults = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    return PLACES.filter(
      p => p.name.toLowerCase().includes(q) || p.modern.toLowerCase().includes(q)
    ).slice(0, 10);
  }, [search]);

  const handleSelectResult = (place: Place) => {
    setFlyToPlace(place);
    setSearch("");
    setSearchOpen(false);
  };

  const btnBase: React.CSSProperties = {
    fontFamily: "'Cinzel', serif",
    fontSize: '.62rem',
    letterSpacing: '.1em',
    padding: '4px 10px',
    borderRadius: 2,
    cursor: 'pointer',
    transition: 'all .2s',
    whiteSpace: 'nowrap',
    flexShrink: 0,
    border: '1px solid rgba(74,198,240,.3)',
    background: 'rgba(74,198,240,.08)',
    color: '#74c6f0',
  };

  const btnOff: React.CSSProperties = {
    ...btnBase,
    opacity: .35,
    color: '#5a3e1b',
    borderColor: '#3d2b0f',
    background: 'transparent',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: '#0a0804' }}>

      {/* ── HEADER ── */}
      <header style={{
        background: 'linear-gradient(180deg, #1e150a 0%, #150e06 100%)',
        borderBottom: '1px solid #3d2b0f',
        padding: '8px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        flexShrink: 0,
        zIndex: 1000,
        position: 'relative',
        flexWrap: 'wrap',
      }}>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 1,
          background: 'linear-gradient(90deg,transparent,#c9a227 20%,#e8d5a3 50%,#c9a227 80%,transparent)' }} />

        <div>
          <h1 style={{ fontFamily: "'Cinzel',serif", fontSize: '1.05rem', fontWeight: 900, color: '#e8d5a3', letterSpacing: '.15em', whiteSpace: 'nowrap' }}>
            Ἱστορίαι — Las Historias de Heródoto
          </h1>
          <div style={{ fontSize: '.75rem', color: '#7a5a2a', fontStyle: 'italic', whiteSpace: 'nowrap' }}>
            Todos los lugares mencionados · Siglo V a.C.
          </div>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', flex: 1, maxWidth: 220 }}>
          <span style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: '#5a3e1b', fontSize: '.8rem', pointerEvents: 'none' }}>🔍</span>
          <input
            type="text"
            placeholder="Buscar lugar..."
            value={search}
            autoComplete="off"
            onChange={e => { setSearch(e.target.value); setSearchOpen(true); }}
            onFocus={() => setSearchOpen(true)}
            style={{
              width: '100%',
              background: 'rgba(255,255,255,.04)',
              border: '1px solid #3d2b0f',
              color: '#e8d5a3',
              fontFamily: "'Crimson Text',serif",
              fontSize: '.82rem',
              padding: '5px 10px 5px 28px',
              borderRadius: 2,
              outline: 'none',
            }}
          />
          {searchOpen && searchResults.length > 0 && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
              background: '#150e06', border: '1px solid #3d2b0f', zIndex: 9999,
              maxHeight: 220, overflowY: 'auto',
            }}>
              {searchResults.map(p => (
                <div key={p.name} onClick={() => handleSelectResult(p)}
                  style={{ padding: '6px 10px', fontSize: '.8rem', cursor: 'pointer',
                    borderBottom: '1px solid #1e150a', display: 'flex', gap: 8, alignItems: 'center' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#1e150a')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <span style={{ fontFamily: "'Cinzel',serif", fontSize: '.6rem', letterSpacing: '.1em', opacity: .6, flexShrink: 0 }}>
                    {p.books[0]}
                  </span>
                  {p.name}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stats */}
        {(['Visibles', visibleCount], ['Total', PLACES.length]).length > 0 && (
          <>
            <div style={{ fontFamily:"'Cinzel',serif", fontSize:'.65rem', letterSpacing:'.1em', color:'#7a5a2a', whiteSpace:'nowrap', padding:'4px 10px', border:'1px solid #3d2b0f', borderRadius:2 }}>
              Visibles: <span style={{ color:'#c9a227' }}>{visibleCount}</span>
            </div>
            <div style={{ fontFamily:"'Cinzel',serif", fontSize:'.65rem', letterSpacing:'.1em', color:'#7a5a2a', whiteSpace:'nowrap', padding:'4px 10px', border:'1px solid #3d2b0f', borderRadius:2 }}>
              Total: <span style={{ color:'#c9a227' }}>{PLACES.length}</span> lugares
            </div>
          </>
        )}

        {/* Rivers toggle */}
        <button
          onClick={() => setShowRivers(v => !v)}
          style={showRivers ? btnBase : btnOff}
        >
          🌊 Ríos
        </button>
      </header>

      {/* ── CONTENT ── */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}
           onClick={() => setSearchOpen(false)}>
        <Sidebar activeBooks={activeBooks} onToggleBook={handleToggleBook} />

        <HerodotusMap
          activeBooks={activeBooks}
          flyToPlace={flyToPlace}
          showRivers={showRivers}
          onVisibleCount={handleVisibleCount}
        />

        <div style={{
          position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)',
          zIndex: 800, background: 'rgba(14,10,4,.9)', border: '1px solid #3d2b0f',
          borderTop: '2px solid #c9a227', padding: '6px 20px',
          fontFamily: "'Cinzel',serif", fontSize: '.65rem', letterSpacing: '.12em',
          color: '#7a5a2a', pointerEvents: 'none', whiteSpace: 'nowrap',
        }}>
          📍 Mostrando <span style={{ color:'#e8d5a3' }}>{visibleCount}</span> lugares · Haz clic en un marcador para más información
        </div>
      </div>
    </div>
  );
}
