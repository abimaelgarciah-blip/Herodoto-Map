"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import Sidebar from "@/components/Sidebar";
import type { Selection } from "@/components/HerodotusMap";
import { PLACES, BOOKS, type Place } from "@/data/places";

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
  const [activeRoutes, setActiveRoutes] = useState<Set<string>>(() => new Set());
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
  const handleToggleRoute = useCallback((id: string) => {
    setActiveRoutes(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const visiblePlaces = useMemo(
    () => PLACES.filter(p => p.books.some(b => activeBooks.has(b))),
    [activeBooks]
  );

  const handleSelectPlace = useCallback((place: Place) => {
    // Si los filtros ocultan el lugar, se activan sus libros para poder mostrarlo
    setActiveBooks(prev => {
      if (place.books.some(b => prev.has(b))) return prev;
      const next = new Set(prev);
      place.books.forEach(b => next.add(b));
      return next;
    });
    setSelection(prev => ({ place, nonce: (prev?.nonce ?? 0) + 1 }));
  }, []);

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
          activeRoutes={activeRoutes}
          visiblePlaces={visiblePlaces}
          onToggleBook={handleToggleBook}
          onOnlyBook={handleOnlyBook}
          onSetAllBooks={handleSetAllBooks}
          onToggleRoute={handleToggleRoute}
          onSelectPlace={handleSelectPlace}
        />

        <HerodotusMap
          activeBooks={activeBooks}
          activeRoutes={activeRoutes}
          selection={selection}
          fitNonce={fitNonce}
        />

        <div className="hint">
          {visiblePlaces.length === 0
            ? "Ningún libro seleccionado · Activa alguno en el panel"
            : "Haz clic en un marcador para leer lo que cuenta Heródoto"}
        </div>
      </div>
    </div>
  );
}
