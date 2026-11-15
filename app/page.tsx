"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import Sidebar from "@/components/Sidebar";
import TourPanel from "@/components/TourPanel";
import type { Selection, TourView } from "@/components/HerodotusMap";
import { PLACES, BOOKS, KINDS, type Place, type PlaceKind } from "@/data/places";
import { TOURS, stepLatLng } from "@/data/tours";

const HerodotusMap = dynamic(() => import("@/components/HerodotusMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center" style={{ background: "#0a0804" }}>
      <p style={{ fontFamily: "'Cinzel', serif", color: "#c9a227", letterSpacing: "0.1em", fontSize: "0.9rem" }}>
        CARGANDO EL MAPA DEL MUNDO ANTIGUO…
      </p>
    </div>
  ),
});

const ALL_BOOKS = Object.keys(BOOKS).map(Number);
const ALL_KINDS = Object.keys(KINDS) as PlaceKind[];

/** Minúsculas y sin acentos, para que «efeso» encuentre «Éfeso» */
const normalize = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

const SEARCH_INDEX = PLACES.map(p => ({
  place: p,
  name: normalize(p.name),
  rest: normalize(`${p.modern} ${p.region}`),
}));

export default function Home() {
  const [activeBooks, setActiveBooks]   = useState<Set<number>>(() => new Set(ALL_BOOKS));
  const [activeKinds, setActiveKinds]   = useState<Set<PlaceKind>>(() => new Set(ALL_KINDS));
  const [tour, setTour]                 = useState<{ id: string; step: number } | null>(null);
  const [tourMenu, setTourMenu]         = useState(false);
  const tourBox = useRef<HTMLDivElement>(null);
  const [activeRoutes, setActiveRoutes] = useState<Set<string>>(() => new Set());
  const [showRivers, setShowRivers]     = useState(true);
  const [selection, setSelection]       = useState<Selection | null>(null);
  const [fitNonce, setFitNonce]         = useState(0);
  const [search, setSearch]             = useState("");
  const [searchOpen, setSearchOpen]     = useState(false);
  const [highlight, setHighlight]       = useState(0);
  const searchBox = useRef<HTMLDivElement>(null);

  const handleToggleBook = useCallback((id: number) => {
    setActiveBooks(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);
  const handleOnlyBook = useCallback((id: number) => setActiveBooks(new Set([id])), []);
  const handleSetAllBooks = useCallback((on: boolean) => setActiveBooks(new Set(on ? ALL_BOOKS : [])), []);
  const handleToggleKind = useCallback((kind: PlaceKind) => {
    setActiveKinds(prev => {
      const next = new Set(prev);
      next.has(kind) ? next.delete(kind) : next.add(kind);
      return next;
    });
  }, []);
  const handleToggleRoute = useCallback((id: string) => {
    setActiveRoutes(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const visiblePlaces = useMemo(
    () => PLACES.filter(p => activeKinds.has(p.kind) && p.books.some(b => activeBooks.has(b))),
    [activeBooks, activeKinds]
  );

  const handleSelectPlace = useCallback((place: Place) => {
    // Si los filtros ocultan el lugar, se activan sus libros para poder mostrarlo
    setActiveBooks(prev => {
      if (place.books.some(b => prev.has(b))) return prev;
      const next = new Set(prev);
      place.books.forEach(b => next.add(b));
      return next;
    });
    setActiveKinds(prev => (prev.has(place.kind) ? prev : new Set(prev).add(place.kind)));
    setTour(null);
    setSelection(prev => ({ place, nonce: (prev?.nonce ?? 0) + 1 }));
  }, []);

  // ── Recorridos guiados ──
  const activeTour = tour ? TOURS.find(t => t.id === tour.id) ?? null : null;
  const tourView = useMemo<TourView | null>(() => {
    if (!tour || !activeTour) return null;
    const step = activeTour.steps[tour.step];
    return {
      at: stepLatLng(step),
      zoom: step.zoom ?? 7,
      path: activeTour.steps.slice(0, tour.step + 1).map(stepLatLng),
      key: `${tour.id}:${tour.step}`,
    };
  }, [tour, activeTour]);

  const startTour = (id: string) => {
    // Un recorrido necesita todos los lugares a la vista
    setActiveBooks(new Set(ALL_BOOKS));
    setActiveKinds(new Set(ALL_KINDS));
    setTour({ id, step: 0 });
    setTourMenu(false);
  };
  const stepCount = activeTour?.steps.length ?? 0;
  const goStep = useCallback((delta: number) => {
    setTour(t => t && { ...t, step: Math.min(Math.max(t.step + delta, 0), stepCount - 1) });
  }, [stepCount]);

  useEffect(() => {
    if (!tour) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === "INPUT") return;
      if (e.key === "ArrowRight") goStep(1);
      else if (e.key === "ArrowLeft") goStep(-1);
      else if (e.key === "Escape") setTour(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [tour, goStep]);

  const searchResults = useMemo(() => {
    const q = normalize(search.trim());
    if (!q) return [];
    // Primero los nombres que empiezan por la consulta, luego el resto
    const starts: Place[] = [], contains: Place[] = [], other: Place[] = [];
    SEARCH_INDEX.forEach(e => {
      if (e.name.startsWith(q)) starts.push(e.place);
      else if (e.name.includes(q)) contains.push(e.place);
      else if (e.rest.includes(q)) other.push(e.place);
    });
    return [...starts, ...contains, ...other].slice(0, 10);
  }, [search]);

  const pickResult = (place: Place) => {
    handleSelectPlace(place);
    setSearch("");
    setSearchOpen(false);
  };

  const onSearchKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setSearchOpen(false);
      return;
    }
    if (!searchResults.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSearchOpen(true);
      setHighlight(h => (h + 1) % searchResults.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight(h => (h - 1 + searchResults.length) % searchResults.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      pickResult(searchResults[Math.min(highlight, searchResults.length - 1)]);
    }
  };

  // Cerrar el desplegable al pulsar fuera del buscador
  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      if (!searchBox.current?.contains(e.target as Node)) setSearchOpen(false);
      if (!tourBox.current?.contains(e.target as Node)) setTourMenu(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, []);

  const showResults = searchOpen && search.trim() !== "";

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-rule" />

        <div className="app-title">
          <h1>Ἱστορίαι — Las Historias de Heródoto</h1>
          <div className="app-subtitle">Los lugares de las Historias · Siglo V a.C.</div>
        </div>

        <div className="search" ref={searchBox}>
          <span className="search-icon" aria-hidden="true">🔍</span>
          <input
            type="search"
            role="combobox"
            aria-label="Buscar lugar"
            aria-expanded={showResults}
            aria-controls="search-results"
            aria-activedescendant={showResults && searchResults.length ? `search-opt-${highlight}` : undefined}
            placeholder="Buscar lugar…"
            value={search}
            autoComplete="off"
            onChange={e => { setSearch(e.target.value); setSearchOpen(true); setHighlight(0); }}
            onFocus={() => setSearchOpen(true)}
            onKeyDown={onSearchKey}
          />
          {showResults && (
            <div className="search-results" id="search-results" role="listbox">
              {searchResults.length === 0 && <div className="search-empty">Sin resultados</div>}
              {searchResults.map((p, i) => (
                <div
                  key={p.name}
                  id={`search-opt-${i}`}
                  role="option"
                  aria-selected={i === highlight}
                  className={`search-option${i === highlight ? " is-active" : ""}`}
                  onPointerEnter={() => setHighlight(i)}
                  onClick={() => pickResult(p)}
                >
                  <span className="dot" style={{ background: BOOKS[p.books[0]].color }} />
                  <span>
                    {p.name}
                    <span className="search-modern">{p.modern}</span>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="tour-menu" ref={tourBox}>
          <button
            type="button"
            className="header-btn header-btn--primary"
            aria-haspopup="menu"
            aria-expanded={tourMenu}
            onClick={() => setTourMenu(v => !v)}
          >
            Recorridos ▾
          </button>
          {tourMenu && (
            <div className="tour-menu-list" role="menu">
              {TOURS.map(t => (
                <button key={t.id} type="button" role="menuitem" onClick={() => startTour(t.id)}>
                  <strong>{t.title}</strong>
                  <span>{t.subtitle} · {t.steps.length} pasos</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="stat" aria-live="polite">
          <span>{visiblePlaces.length}</span> de <span>{PLACES.length}</span> lugares
        </div>
        <button
          type="button"
          className="header-btn"
          onClick={() => setFitNonce(n => n + 1)}
          disabled={visiblePlaces.length === 0}
          title="Encuadrar todos los lugares visibles"
        >
          Ver todo
        </button>
      </header>

      <div className="app-content">
        <Sidebar
          activeBooks={activeBooks}
          activeKinds={activeKinds}
          activeRoutes={activeRoutes}
          showRivers={showRivers}
          onToggleRivers={() => setShowRivers(v => !v)}
          visiblePlaces={visiblePlaces}
          onToggleBook={handleToggleBook}
          onOnlyBook={handleOnlyBook}
          onSetAllBooks={handleSetAllBooks}
          onToggleKind={handleToggleKind}
          onToggleRoute={handleToggleRoute}
          onSelectPlace={handleSelectPlace}
        />

        <HerodotusMap
          activeBooks={activeBooks}
          visiblePlaces={visiblePlaces}
          activeRoutes={activeRoutes}
          showRivers={showRivers}
          selection={selection}
          tourStep={tourView}
          fitNonce={fitNonce}
        />

        {activeTour && tour ? (
          <TourPanel
            tour={activeTour}
            index={tour.step}
            onPrev={() => goStep(-1)}
            onNext={() => goStep(1)}
            onExit={() => setTour(null)}
          />
        ) : (
          <div className="hint">
            {visiblePlaces.length === 0
              ? "Ningún lugar con estos filtros · Actívalos en el panel"
              : "Haz clic en un marcador o empieza un recorrido"}
          </div>
        )}
      </div>
    </div>
  );
}
