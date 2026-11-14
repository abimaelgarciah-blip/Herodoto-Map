"use client";

import { useEffect, useMemo, useState } from "react";
import { BOOKS, KINDS, PLACES, type Place, type PlaceKind } from "@/data/places";
import { ROUTES } from "@/data/routes";

interface SidebarProps {
  activeBooks: Set<number>;
  activeKinds: Set<PlaceKind>;
  activeRoutes: Set<string>;
  visiblePlaces: Place[];
  onToggleBook: (id: number) => void;
  onOnlyBook: (id: number) => void;
  onSetAllBooks: (on: boolean) => void;
  onToggleKind: (kind: PlaceKind) => void;
  onToggleRoute: (id: string) => void;
  onSelectPlace: (place: Place) => void;
}

const BOOK_IDS = Object.keys(BOOKS).map(Number);
const COUNT_PER_BOOK: Record<number, number> = Object.fromEntries(
  BOOK_IDS.map(id => [id, PLACES.filter(p => p.books.includes(id)).length])
);

const KIND_IDS = Object.keys(KINDS) as PlaceKind[];
const COUNT_PER_KIND = Object.fromEntries(
  KIND_IDS.map(k => [k, PLACES.filter(p => p.kind === k).length])
) as Record<PlaceKind, number>;

export default function Sidebar({
  activeBooks, activeKinds, activeRoutes, visiblePlaces,
  onToggleBook, onOnlyBook, onSetAllBooks, onToggleKind, onToggleRoute, onSelectPlace,
}: SidebarProps) {
  const [open, setOpen] = useState(true);

  // En pantallas estrechas el panel empieza cerrado para no tapar el mapa
  useEffect(() => {
    if (window.innerWidth < 768) setOpen(false);
  }, []);

  const byRegion = useMemo(() => {
    const groups = new Map<string, Place[]>();
    visiblePlaces.forEach(p => {
      if (!groups.has(p.region)) groups.set(p.region, []);
      groups.get(p.region)!.push(p);
    });
    groups.forEach(list => list.sort((a, b) => a.name.localeCompare(b.name, "es")));
    return Array.from(groups.entries());
  }, [visiblePlaces]);

  const selectPlace = (p: Place) => {
    onSelectPlace(p);
    if (window.innerWidth < 768) setOpen(false);
  };

  return (
    <aside className={`sidebar${open ? "" : " sidebar--closed"}`} aria-label="Filtros y lugares">
      <div className="sidebar-scroll" inert={open ? undefined : ("" as any)}>
        <div className="sidebar-title">
          <span>Filtrar por libro</span>
          <span className="sidebar-actions">
            <button type="button" onClick={() => onSetAllBooks(true)}>Todos</button>
            <button type="button" onClick={() => onSetAllBooks(false)}>Ninguno</button>
          </span>
        </div>

        {BOOK_IDS.map(id => {
          const book = BOOKS[id];
          const active = activeBooks.has(id);
          return (
            <div key={id} className="sidebar-row">
              <button
                type="button"
                className="sidebar-item"
                aria-pressed={active}
                onClick={() => onToggleBook(id)}
              >
                <span className="dot" style={{ background: book.color, opacity: active ? 1 : 0.25 }} />
                <span className="sidebar-label" style={{ opacity: active ? 1 : 0.4 }}>{book.label}</span>
                <span className="sidebar-count">{COUNT_PER_BOOK[id]}</span>
              </button>
              <button
                type="button"
                className="sidebar-only"
                title={`Mostrar sólo el ${book.label}`}
                aria-label={`Mostrar sólo el ${book.label}`}
                onClick={() => onOnlyBook(id)}
              >
                sólo
              </button>
            </div>
          );
        })}

        <div className="sidebar-title"><span>Tipo de lugar</span></div>
        {KIND_IDS.map(kind => {
          const active = activeKinds.has(kind);
          return (
            <div key={kind} className="sidebar-row">
              <button
                type="button"
                className="sidebar-item"
                aria-pressed={active}
                onClick={() => onToggleKind(kind)}
              >
                <span className={`kind-mark kind-mark--${kind}`} style={{ opacity: active ? 1 : 0.25 }} />
                <span className="sidebar-label" style={{ opacity: active ? 1 : 0.4 }}>{KINDS[kind].plural}</span>
                <span className="sidebar-count">{COUNT_PER_KIND[kind]}</span>
              </button>
            </div>
          );
        })}

        <div className="sidebar-title"><span>Rutas</span></div>
        {ROUTES.map(route => {
          const active = activeRoutes.has(route.id);
          return (
            <div key={route.id} className="sidebar-row">
              <button
                type="button"
                className="sidebar-item"
                aria-pressed={active}
                title={route.description}
                onClick={() => onToggleRoute(route.id)}
              >
                <span className="dash" style={{ borderColor: route.color, opacity: active ? 1 : 0.25 }} />
                <span className="sidebar-label" style={{ opacity: active ? 1 : 0.4 }}>{route.label}</span>
              </button>
            </div>
          );
        })}

        <div className="sidebar-title">
          <span>Lugares</span>
          <span className="sidebar-count">{visiblePlaces.length}</span>
        </div>
        {byRegion.length === 0 && (
          <div className="sidebar-empty">Ningún lugar con estos filtros.</div>
        )}
        {byRegion.map(([region, list]) => (
          <div key={region}>
            <div className="sidebar-region">{region}</div>
            {list.map(p => (
              <button key={p.name} type="button" className="sidebar-place" onClick={() => selectPlace(p)}>
                <span className={p.kind === "batalla" ? "dot dot--sm dot--battle" : "dot dot--sm"} style={{ background: BOOKS[p.books.find(b => activeBooks.has(b)) ?? p.books[0]].color }} />
                {p.name}
              </button>
            ))}
          </div>
        ))}
      </div>

      <button
        type="button"
        className="sidebar-toggle"
        aria-expanded={open}
        onClick={() => setOpen(v => !v)}
      >
        PANEL {open ? "◀" : "▶"}
      </button>
    </aside>
  );
}
