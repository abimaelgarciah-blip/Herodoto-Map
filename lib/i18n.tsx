"use client";

import { createContext, useContext } from "react";
import { BOOKS, KINDS, type Place, type PlaceKind, type Battle } from "@/data/places";
import type { Route } from "@/data/routes";
import type { Tour } from "@/data/tours";
import { PLACES_EN, REGIONS_EN, BOOKS_EN, KINDS_EN, ROUTES_EN, TOURS_EN, RIVERS_EN } from "@/data/en";

export type Lang = "es" | "en";

const UI = {
  es: {
    title: "Ἱστορίαι — Las Historias de Heródoto",
    subtitle: "Los lugares de las Historias · Siglo V a.C.",
    loading: "CARGANDO EL MAPA DEL MUNDO ANTIGUO…",
    mapLabel: "Mapa de los lugares de las Historias de Heródoto",
    search: "Buscar lugar…", searchLabel: "Buscar lugar", noResults: "Sin resultados",
    tours: "Recorridos", steps: "pasos", read: "Leer el libro", closeReader: "Cerrar libro",
    of: "de", places: "lugares", fitAll: "Ver todo", fitAllTitle: "Encuadrar todos los lugares visibles",
    hint: "Haz clic en un marcador, empieza un recorrido o abre el libro", hintEmpty: "Ningún lugar con estos filtros · Actívalos en el panel",
    language: "Idioma",
    filterByBook: "Filtrar por libro", all: "Todos", none: "Ninguno", only: "sólo", showOnly: "Mostrar sólo el",
    placeType: "Tipo de lugar", riversRoutes: "Ríos y rutas", rivers: "Ríos · nombres antiguos", placesTitle: "Lugares",
    noPlaces: "Ningún lugar con estos filtros.", panel: "PANEL", panelLabel: "Filtros y lugares",
    credit: "Costas y ríos: Natural Earth. Fuentes de los textos, en el lector.",
    date: "Fecha", sides: "Bandos", result: "Resultado", river: "Río", today: "hoy", keepsName: "Conserva su nombre",
    mentionedIn: "Heródoto lo menciona en", battleOf: "Batalla de",
    zoomIn: "Acercar", zoomOut: "Alejar",
    baseParchment: "Pergamino", baseRelief: "Relieve", baseRoman: "Imperio romano (DARE)", baseSatellite: "Satélite", baseModern: "Mapa actual (OSM)",
    tour: "Recorrido", prev: "◀ Anterior", next: "Siguiente ▶", finish: "Terminar", exitTour: "Salir del recorrido",
    herodotus: "Heródoto",
    readerTitle: "Las Historias", book: "Libro", chapter: "Capítulo", follow: "Seguir en el mapa",
    followTitle: "Mover el mapa a los lugares del capítulo que estás leyendo",
    loadingBook: "Cargando el libro…", loadError: "No se pudo cargar el texto.", summary: "Argumento",
    inThisChapter: "En este capítulo", noChapterPlaces: "Sin lugares localizados en este capítulo",
    mentionedHere: "Mencionado en el capítulo que estás leyendo",
    sources: "Texto: traducción de Bartolomé Pou, S. J. (1727-1802), dominio público, obtenida por reconocimiento óptico: puede contener erratas. Lugares de cada capítulo: Perseus Digital Library (CC BY-SA 4.0).",
  },
  en: {
    title: "Ἱστορίαι — The Histories of Herodotus",
    subtitle: "The places of the Histories · 5th century BC",
    loading: "LOADING THE MAP OF THE ANCIENT WORLD…",
    mapLabel: "Map of the places in the Histories of Herodotus",
    search: "Search place…", searchLabel: "Search place", noResults: "No results",
    tours: "Tours", steps: "steps", read: "Read the book", closeReader: "Close book",
    of: "of", places: "places", fitAll: "Show all", fitAllTitle: "Fit all visible places",
    hint: "Click a marker, start a tour or open the book", hintEmpty: "No places match these filters · Turn them on in the panel",
    language: "Language",
    filterByBook: "Filter by book", all: "All", none: "None", only: "only", showOnly: "Show only",
    placeType: "Type of place", riversRoutes: "Rivers & routes", rivers: "Rivers · ancient names", placesTitle: "Places",
    noPlaces: "No places match these filters.", panel: "PANEL", panelLabel: "Filters and places",
    credit: "Coastlines and rivers: Natural Earth. Text sources are listed in the reader.",
    date: "Date", sides: "Sides", result: "Outcome", river: "River", today: "now", keepsName: "Keeps its name",
    mentionedIn: "Herodotus mentions it in", battleOf: "Battle of",
    zoomIn: "Zoom in", zoomOut: "Zoom out",
    baseParchment: "Parchment", baseRelief: "Relief", baseRoman: "Roman Empire (DARE)", baseSatellite: "Satellite", baseModern: "Modern map (OSM)",
    tour: "Tour", prev: "◀ Previous", next: "Next ▶", finish: "Finish", exitTour: "Exit tour",
    herodotus: "Herodotus",
    readerTitle: "The Histories", book: "Book", chapter: "Chapter", follow: "Follow on the map",
    followTitle: "Move the map to the places of the chapter you are reading",
    loadingBook: "Loading the book…", loadError: "The text could not be loaded.", summary: "Summary",
    inThisChapter: "In this chapter", noChapterPlaces: "No located places in this chapter",
    mentionedHere: "Mentioned in the chapter you are reading",
    sources: "Text: translation by A. D. Godley (1920), modernized and place-tagged by the Perseus Digital Library, Tufts University, CC BY-SA 4.0.",
  },
} as const;

export type UIKey = keyof typeof UI["es"];
export const ui = (lang: Lang, key: UIKey): string => UI[lang][key];

export const LangContext = createContext<Lang>("es");
export function useLang() {
  const lang = useContext(LangContext);
  return { lang, t: (key: UIKey) => UI[lang][key] };
}

// ── Contenido localizado ──
export interface PlaceView { name: string; modern: string; region: string; text: string; quote?: string; battle?: Battle }

export function placeView(p: Place, lang: Lang): PlaceView {
  if (lang === "es") return p;
  const e = PLACES_EN[p.name];
  return e ? { ...e, region: REGIONS_EN[p.region] ?? p.region } : p;
}
export const placeName = (p: Place, lang: Lang) => (lang === "en" ? PLACES_EN[p.name]?.name ?? p.name : p.name);
export const regionName = (r: string, lang: Lang) => (lang === "en" ? REGIONS_EN[r] ?? r : r);
export const bookLabel = (id: number, lang: Lang) => (lang === "en" ? BOOKS_EN[id] : BOOKS[id].label);
export const kindView = (k: PlaceKind, lang: Lang) => (lang === "en" ? KINDS_EN[k] : KINDS[k]);
export const routeView = (r: Route, lang: Lang) => (lang === "en" ? ROUTES_EN[r.id] ?? r : r);
export const riverView = (r: { name: string; modern: string }, lang: Lang) => (lang === "en" ? RIVERS_EN[r.name] ?? r : r);

export function tourView(tour: Tour, lang: Lang) {
  const e = lang === "en" ? TOURS_EN[tour.id] : undefined;
  return {
    title: e?.title ?? tour.title,
    subtitle: e?.subtitle ?? tour.subtitle,
    steps: tour.steps.map((s, i) => ({ ref: s.ref, title: e?.steps[i]?.title ?? s.title, text: e?.steps[i]?.text ?? s.text })),
  };
}
