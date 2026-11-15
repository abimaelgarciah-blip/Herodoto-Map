"use client";

import { useEffect, useMemo, useState } from "react";
import { BOOKS, KINDS, PLACES, type Place, type PlaceKind } from "@/data/places";
import { ROUTES } from "@/data/routes";
import { useLang, bookLabel, kindView, placeName, regionName, routeView } from "@/lib/i18n";

interface SidebarProps {
  activeBooks: Set<number>;
  activeKinds: Set<PlaceKind>;
  activeRoutes: Set<string>;
  showRivers: boolean;
  onToggleRivers: () => void;
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
  activeBooks, activeKinds, activeRoutes, showRivers, onToggleRivers, visiblePlaces,
  onToggleBook, onOnlyBook, onSetAllBooks, onToggleKind, onToggleRoute, onSelectPlace,
}: SidebarProps) {
  const { lang, t } = useLang();
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
    groups.forEach(list => list.sort((a, b) => placeName(a, lang).localeCompare(placeName(b, lang), lang)));
    return Array.from(groups.entries());
  }, [visiblePlaces, lang]);

  const selectPlace = (p: Place) => {
    onSelectPlace(p);
    if (window.innerWidth < 768) setOpen(false);
  };

  return (
    <aside className={`sidebar${open ? "" : " sidebar--closed"}`} aria-label={t("panelLabel")}>
      <div className="sidebar-scroll" inert={open ? undefined : ("" as any)}>
        <div className="sidebar-title">
          <span>{t("filterByBook")}</span>
          <span className="sidebar-actions">
            <button type="button" onClick={() => onSetAllBooks(true)}>{t("all")}</button>
            <button type="button" onClick={() => onSetAllBooks(false)}>{t("none")}</button>
          </span>
        </div>

        {BOOK_IDS.map(id => {
          const active = activeBooks.has(id);
          const label = bookLabel(id, lang);
          return (
            <div key={id} className="sidebar-row">
              <button type="button" className={`sidebar-item${active ? "" : " is-off"}`} aria-pressed={active} onClick={() => onToggleBook(id)}>
                <span className="dot" style={{ background: BOOKS[id].color }} />
                <span className="sidebar-label">{label}</span>
                <span className="sidebar-count">{COUNT_PER_BOOK[id]}</span>
              </button>
              <button
                type="button"
                className="sidebar-only"
                title={`${t("showOnly")} ${label}`}
                aria-label={`${t("showOnly")} ${label}`}
                onClick={() => onOnlyBook(id)}
              >
                {t("only")}
              </button>
            </div>
          );
        })}

        <div className="sidebar-title"><span>{t("placeType")}</span></div>
        {KIND_IDS.map(kind => {
          const active = activeKinds.has(kind);
          return (
            <div key={kind} className="sidebar-row">
              <button type="button" className={`sidebar-item${active ? "" : " is-off"}`} aria-pressed={active} onClick={() => onToggleKind(kind)}>
                <span className={`kind-mark kind-mark--${kind}`} />
                <span className="sidebar-label">{kindView(kind, lang).plural}</span>
                <span className="sidebar-count">{COUNT_PER_KIND[kind]}</span>
              </button>
            </div>
          );
        })}

        <div className="sidebar-title"><span>{t("riversRoutes")}</span></div>
        <div className="sidebar-row">
          <button type="button" className={`sidebar-item${showRivers ? "" : " is-off"}`} aria-pressed={showRivers} onClick={onToggleRivers}>
            <span className="dash dash--solid" style={{ borderColor: "#5d9cc4" }} />
            <span className="sidebar-label">{t("rivers")}</span>
          </button>
        </div>
        {ROUTES.map(route => {
          const active = activeRoutes.has(route.id);
          const v = routeView(route, lang);
          return (
            <div key={route.id} className="sidebar-row">
              <button
                type="button"
                className={`sidebar-item${active ? "" : " is-off"}`}
                aria-pressed={active}
                title={v.description}
                onClick={() => onToggleRoute(route.id)}
              >
                <span className="dash" style={{ borderColor: route.color }} />
                <span className="sidebar-label">{v.label}</span>
              </button>
            </div>
          );
        })}

        <div className="sidebar-title">
          <span>{t("placesTitle")}</span>
          <span className="sidebar-count">{visiblePlaces.length}</span>
        </div>
        {byRegion.length === 0 && <div className="sidebar-empty">{t("noPlaces")}</div>}
        {byRegion.map(([region, list]) => (
          <div key={region}>
            <div className="sidebar-region">{regionName(region, lang)}</div>
            {list.map(p => (
              <button key={p.name} type="button" className="sidebar-place" onClick={() => selectPlace(p)}>
                <span
                  className={p.kind === "batalla" ? "dot dot--sm dot--battle" : "dot dot--sm"}
                  style={{ background: BOOKS[p.books.find(b => activeBooks.has(b)) ?? p.books[0]].color }}
                />
                {placeName(p, lang)}
              </button>
            ))}
          </div>
        ))}
        <p className="sidebar-credit">{t("credit")}</p>
      </div>

      <button type="button" className="sidebar-toggle" aria-expanded={open} onClick={() => setOpen(v => !v)}>
        {t("panel")} {open ? "◀" : "▶"}
      </button>
    </aside>
  );
}
