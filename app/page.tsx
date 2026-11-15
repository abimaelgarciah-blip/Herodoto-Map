"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import Sidebar from "@/components/Sidebar";
import TourPanel from "@/components/TourPanel";
import Reader from "@/components/Reader";
import type { Selection, TourView, ChapterPlace, Focus, Inset } from "@/components/HerodotusMap";
import { PLACES, BOOKS, KINDS, type Place, type PlaceKind } from "@/data/places";
import { TOURS, stepLatLng } from "@/data/tours";
import { LangContext, ui, placeView, tourView, type Lang } from "@/lib/i18n";

const HerodotusMap = dynamic(() => import("@/components/HerodotusMap"), {
  ssr: false,
  loading: () => <div className="w-full h-full" style={{ background: "#0a0804" }} />,
});

const ALL_BOOKS = Object.keys(BOOKS).map(Number);
const ALL_KINDS = Object.keys(KINDS) as PlaceKind[];
const NO_INSET: Inset = { right: 0, bottom: 0 };

/** Minúsculas y sin acentos, para que «efeso» encuentre «Éfeso» */
const normalize = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

/** Se busca en los dos idiomas a la vez */
const SEARCH_INDEX = PLACES.map(p => {
  const es = placeView(p, "es"), en = placeView(p, "en");
  return {
    place: p,
    names: [normalize(es.name), normalize(en.name)],
    rest: normalize(`${es.modern} ${es.region} ${en.modern} ${en.region}`),
  };
});

export default function Home() {
  const [lang, setLang]                 = useState<Lang>("es");
  const [activeBooks, setActiveBooks]   = useState<Set<number>>(() => new Set(ALL_BOOKS));
  const [activeKinds, setActiveKinds]   = useState<Set<PlaceKind>>(() => new Set(ALL_KINDS));
  const [activeRoutes, setActiveRoutes] = useState<Set<string>>(() => new Set());
  const [showRivers, setShowRivers]     = useState(true);
  const [selection, setSelection]       = useState<Selection | null>(null);
  const [focus, setFocus]               = useState<Focus | null>(null);
  const [fitNonce, setFitNonce]         = useState(0);
  const [search, setSearch]             = useState("");
  const [searchOpen, setSearchOpen]     = useState(false);
  const [highlight, setHighlight]       = useState(0);
  const [tour, setTour]                 = useState<{ id: string; step: number } | null>(null);
  const [tourMenu, setTourMenu]         = useState(false);
  const [reading, setReading]           = useState(false);
  const [follow, setFollow]             = useState(true);
  const [chapter, setChapter]           = useState<{ key: string; places: ChapterPlace[] } | null>(null);
  const [inset, setInset]               = useState<Inset>(NO_INSET);
  const searchBox = useRef<HTMLDivElement>(null);
  const tourBox = useRef<HTMLDivElement>(null);
  const t = (key: Parameters<typeof ui>[1]) => ui(lang, key);

  // Idioma: el guardado o, si no, el del navegador
  useEffect(() => {
    let saved: string | null = null;
    try { saved = localStorage.getItem("herodoto:idioma"); } catch {}
    if (saved === "en" || saved === "es") setLang(saved);
    else if (!navigator.language.toLowerCase().startsWith("es")) setLang("en");
  }, []);
  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = ui(lang, "title");
  }, [lang]);
  const chooseLang = (l: Lang) => {
    setLang(l);
    try { localStorage.setItem("herodoto:idioma", l); } catch {}
  };

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
  const activeTour = tour ? TOURS.find(x => x.id === tour.id) ?? null : null;
  const tourStep = useMemo<TourView | null>(() => {
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
    setReading(false);
    setTour({ id, step: 0 });
    setTourMenu(false);
  };
  const stepCount = activeTour?.steps.length ?? 0;
  const goStep = useCallback((delta: number) => {
    setTour(x => x && { ...x, step: Math.min(Math.max(x.step + delta, 0), stepCount - 1) });
  }, [stepCount]);

  useEffect(() => {
    if (!tour) return;
    const onKey = (e: KeyboardEvent) => {
      if (["INPUT", "SELECT"].includes((e.target as HTMLElement)?.tagName)) return;
      if (e.key === "ArrowRight") goStep(1);
      else if (e.key === "ArrowLeft") goStep(-1);
      else if (e.key === "Escape") setTour(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [tour, goStep]);

  // ── Lectura ──
  const toggleReading = () => {
    setTour(null);
    setReading(v => !v);
  };
  const handleChapter = useCallback((key: string, places: ChapterPlace[]) => setChapter({ key, places }), []);
  const handlePoint = useCallback((p: ChapterPlace) => {
    setFocus(prev => ({ ...p, nonce: (prev?.nonce ?? 0) + 1 }));
  }, []);

  // El lector tapa la derecha del mapa en escritorio y la mitad inferior en móvil
  useEffect(() => {
    if (!reading) {
      setInset(NO_INSET);
      setChapter(null);
      return;
    }
    const measure = () => {
      const el = document.querySelector<HTMLElement>(".reader");
      if (!el) return;
      const wide = window.innerWidth >= 768;
      setInset(wide ? { right: el.offsetWidth, bottom: 0 } : { right: 0, bottom: el.offsetHeight });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [reading]);

  const readingState = useMemo(
    () => (reading && chapter ? { ...chapter, follow } : null),
    [reading, chapter, follow]
  );

  // ── Buscador ──
  const searchResults = useMemo(() => {
    const q = normalize(search.trim());
    if (!q) return [];
    // Primero los nombres que empiezan por la consulta, luego el resto
    const starts: Place[] = [], contains: Place[] = [], other: Place[] = [];
    SEARCH_INDEX.forEach(e => {
      if (e.names.some(n => n.startsWith(q))) starts.push(e.place);
      else if (e.names.some(n => n.includes(q))) contains.push(e.place);
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

  // Cerrar los desplegables al pulsar fuera
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
    <LangContext.Provider value={lang}>
      <div className="app">
        <header className="app-header">
          <div className="app-header-rule" />

          <div className="app-title">
            <h1>{t("title")}</h1>
            <div className="app-subtitle">{t("subtitle")}</div>
          </div>

          <div className="search" ref={searchBox}>
            <span className="search-icon" aria-hidden="true">🔍</span>
            <input
              type="search"
              role="combobox"
              aria-label={t("searchLabel")}
              aria-expanded={showResults}
              aria-controls="search-results"
              aria-activedescendant={showResults && searchResults.length ? `search-opt-${highlight}` : undefined}
              placeholder={t("search")}
              value={search}
              autoComplete="off"
              onChange={e => { setSearch(e.target.value); setSearchOpen(true); setHighlight(0); }}
              onFocus={() => setSearchOpen(true)}
              onKeyDown={onSearchKey}
            />
            {showResults && (
              <div className="search-results" id="search-results" role="listbox">
                {searchResults.length === 0 && <div className="search-empty">{t("noResults")}</div>}
                {searchResults.map((p, i) => {
                  const v = placeView(p, lang);
                  return (
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
                        {v.name}
                        <span className="search-modern">{v.modern}</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <button type="button" className="header-btn header-btn--primary" aria-pressed={reading} onClick={toggleReading}>
            📖 {reading ? t("closeReader") : t("read")}
          </button>

          <div className="tour-menu" ref={tourBox}>
            <button
              type="button"
              className="header-btn"
              aria-haspopup="menu"
              aria-expanded={tourMenu}
              onClick={() => setTourMenu(v => !v)}
            >
              {t("tours")} ▾
            </button>
            {tourMenu && (
              <div className="tour-menu-list" role="menu">
                {TOURS.map(x => {
                  const v = tourView(x, lang);
                  return (
                    <button key={x.id} type="button" role="menuitem" onClick={() => startTour(x.id)}>
                      <strong>{v.title}</strong>
                      <span>{v.subtitle} · {v.steps.length} {t("steps")}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="stat" aria-live="polite">
            <span>{visiblePlaces.length}</span> {t("of")} <span>{PLACES.length}</span> {t("places")}
          </div>
          <button
            type="button"
            className="header-btn"
            onClick={() => setFitNonce(n => n + 1)}
            disabled={visiblePlaces.length === 0}
            title={t("fitAllTitle")}
          >
            {t("fitAll")}
          </button>

          <div className="lang-switch" role="group" aria-label={t("language")}>
            <button type="button" aria-pressed={lang === "es"} onClick={() => chooseLang("es")} lang="es" title="Español">ES</button>
            <button type="button" aria-pressed={lang === "en"} onClick={() => chooseLang("en")} lang="en" title="English">EN</button>
          </div>
        </header>

        <div className={`app-content${reading ? " has-reader" : ""}`}>
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
            lang={lang}
            activeBooks={activeBooks}
            visiblePlaces={visiblePlaces}
            activeRoutes={activeRoutes}
            showRivers={showRivers}
            selection={selection}
            tourStep={tourStep}
            reading={readingState}
            focus={focus}
            inset={inset}
            fitNonce={fitNonce}
          />

          {reading && (
            <Reader
              follow={follow}
              onFollow={setFollow}
              onChapter={handleChapter}
              onPlace={handleSelectPlace}
              onPoint={handlePoint}
              onClose={() => setReading(false)}
            />
          )}

          {activeTour && tour ? (
            <TourPanel
              tour={activeTour}
              index={tour.step}
              onPrev={() => goStep(-1)}
              onNext={() => goStep(1)}
              onExit={() => setTour(null)}
            />
          ) : !reading && (
            <div className="hint">{visiblePlaces.length === 0 ? t("hintEmpty") : t("hint")}</div>
          )}
        </div>
      </div>
    </LangContext.Provider>
  );
}
