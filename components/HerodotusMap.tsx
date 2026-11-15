"use client";

import { useEffect, useRef, useState } from "react";
import type * as Leaflet from "leaflet";
import "leaflet/dist/leaflet.css";
import { PLACES, BOOKS, type Place } from "@/data/places";
import { ROUTES } from "@/data/routes";
import LAND from "@/data/land.json";
import RIVERS from "@/data/rivers.json";
import { ui, placeView, placeName, kindView, routeView, riverView, type Lang } from "@/lib/i18n";

export interface Selection {
  place: Place;
  /** Cambia en cada selección para poder volver a volar al mismo lugar */
  nonce: number;
}

export interface TourView {
  at: [number, number];
  zoom: number;
  /** Puntos recorridos hasta el paso actual, éste incluido */
  path: [number, number][];
  /** Cambia en cada paso, aunque se repita el lugar */
  key: string;
}

/** Un lugar mencionado en el capítulo que se está leyendo */
export interface ChapterPlace {
  label: string;
  lat: number;
  lng: number;
}

export interface Reading {
  places: ChapterPlace[];
  /** Identifica libro y capítulo */
  key: string;
  follow: boolean;
}

/** Un punto del texto sin ficha propia al que se pide volar */
export interface Focus extends ChapterPlace {
  nonce: number;
}

/** Franjas del mapa tapadas por el lector, en píxeles */
export interface Inset {
  right: number;
  bottom: number;
}

interface HerodotusMapProps {
  lang: Lang;
  activeBooks: Set<number>;
  /** Lugares que pasan los filtros de libro y de tipo */
  visiblePlaces: Place[];
  activeRoutes: Set<string>;
  showRivers: boolean;
  selection: Selection | null;
  /** Paso actual de un recorrido guiado */
  tourStep: TourView | null;
  reading: Reading | null;
  focus: Focus | null;
  inset: Inset;
  /** Cambia cada vez que se pide encuadrar todos los lugares visibles */
  fitNonce: number;
}

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function buildPopup(place: Place, lang: Lang): string {
  const v = placeView(place, lang);
  const tags = place.books.map(b => {
    const bk = BOOKS[b];
    return `<span class="popup-book-tag" style="background:${bk.color}33;color:${bk.color};border:1px solid ${bk.color}66">${bk.short}</span>`;
  }).join("");

  const b = v.battle;
  const battle = b ? `
      <dl class="popup-battle">
        <dt>${ui(lang, "date")}</dt><dd>${esc(b.date)}</dd>
        <dt>${ui(lang, "sides")}</dt><dd>${esc(b.sides)}</dd>
        <dt>${ui(lang, "result")}</dt><dd>${esc(b.result)}</dd>
      </dl>` : "";

  return `
    <div class="popup-header">
      <div class="popup-books">${tags}<span class="popup-kind">${esc(kindView(place.kind, lang).label)}</span></div>
      <div class="popup-name">${esc(v.name)}</div>
      <div class="popup-modern">${esc(v.modern.includes(v.region) ? v.modern : `${v.modern} · ${v.region}`)}</div>
    </div>
    <div class="popup-body">
      ${battle}
      <div class="popup-text">${esc(v.text)}</div>
      ${v.quote ? `<div class="popup-quote">${esc(v.quote)}</div>` : ""}
    </div>
  `;
}

const BATTLE_SVG = `<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
  <path class="bm-shape" d="M12 1.5 22.5 12 12 22.5 1.5 12Z"/>
  <path class="bm-swords" d="M8 8l8 8M16 8l-8 8M7 10.5l3.5-3.5M17 10.5 13.5 7"/>
</svg>`;

/** Ríos cuyo nombre se muestra ya en la vista general; el resto, al acercarse */
const MAJOR_RIVERS = new Set(["Nilo", "Éufrates", "Tigris", "Istro", "Borístenes", "Tanais", "Halis", "Araxes", "Indo"]);

interface River { name: string; modern: string; ref: string; label: number[]; lines: number[][][] }

/** Un marcador de lugar, sea círculo o icono de batalla */
interface Handle {
  layer: Leaflet.Layer;
  setColor: (color: string) => void;
}

const BASE_STYLE = { radius: 7, color: "#0a0804", weight: 1.5, opacity: 1, fillOpacity: 0.9 };
const SELECTED_STYLE = { radius: 10, color: "#f5e6b8", weight: 3 };

export default function HerodotusMap({
  lang, activeBooks, visiblePlaces, activeRoutes, showRivers, selection, tourStep, reading, focus, inset, fitNonce,
}: HerodotusMapProps) {
  const mapRef  = useRef<HTMLDivElement>(null);
  const leaflet = useRef<typeof Leaflet | null>(null);
  const mapObj  = useRef<Leaflet.Map | null>(null);
  const markers = useRef<Map<string, Handle>>(new Map());
  const routes  = useRef<Map<string, Leaflet.Polyline>>(new Map());
  const riverLayer   = useRef<Leaflet.LayerGroup | null>(null);
  const tourLayer    = useRef<Leaflet.LayerGroup | null>(null);
  const chapterLayer = useRef<Leaflet.LayerGroup | null>(null);
  const [ready, setReady] = useState(false);

  // Las capas se crean una vez; leen el idioma y los márgenes vigentes de estas referencias
  const langRef = useRef(lang);
  langRef.current = lang;
  const insetRef = useRef(inset);
  insetRef.current = inset;

  /** Vuela a uno o varios puntos dejándolos en la parte del mapa que no tapa el lector */
  const flyTo = (pts: [number, number][], maxZoom: number, duration: number, left = 40) => {
    const map = mapObj.current;
    const L = leaflet.current;
    if (!map || !L || !pts.length) return;
    const { right, bottom } = insetRef.current;
    map.flyToBounds(L.latLngBounds(pts), {
      paddingTopLeft: [left, 40],
      paddingBottomRight: [right + 40, bottom + 60],
      maxZoom,
      duration,
    });
  };

  // Crear el mapa, los marcadores y las rutas una sola vez
  useEffect(() => {
    let cancelled = false;

    import("leaflet").then(mod => {
      const L = ((mod as any).default ?? mod) as typeof Leaflet;
      if (cancelled || !mapRef.current || mapObj.current) return;
      leaflet.current = L;

      const map = L.map(mapRef.current, {
        center: [36.5, 30],
        zoom: 5,
        minZoom: 3,
        maxZoom: 12,
        zoomControl: false,
        worldCopyJump: true,
      });

      L.control.scale({ position: "bottomright", imperial: false }).addTo(map);

      // Tierra firme dibujada desde datos propios (Natural Earth): el mapa
      // siempre tiene fondo aunque fallen o estén bloqueados los servidores de teselas.
      map.createPane("land").style.zIndex = "150";
      L.geoJSON(LAND as any, {
        pane: "land",
        interactive: false,
        style: { color: "#8a6a3a", weight: 1, fillColor: "#3a2c18", fillOpacity: 1 },
      }).addTo(map);

      map.createPane("rivers").style.zIndex = "350";
      map.createPane("riverLabels").style.zIndex = "360";
      map.createPane("chapter").style.zIndex = "380";
      const syncZoom = () => {
        const cl = map.getContainer().classList;
        cl.toggle("zoom-far", map.getZoom() < 5);
        cl.toggle("zoom-mid", map.getZoom() < 7);
      };
      map.on("zoomend", syncZoom);
      syncZoom();

      ROUTES.forEach(route => {
        const line = L.polyline(route.points, {
          color: route.color,
          weight: 3,
          opacity: 0.85,
          dashArray: "8 7",
          lineCap: "round",
        });
        line.bindTooltip(() => routeView(route, langRef.current).label, { sticky: true });
        line.bindPopup(() => {
          const v = routeView(route, langRef.current);
          return `<div class="popup-header"><div class="popup-name">${esc(v.label)}</div></div>
           <div class="popup-body"><div class="popup-text">${esc(v.description)}</div></div>`;
        }, { maxWidth: 320 });
        routes.current.set(route.id, line);
      });

      PLACES.forEach(place => {
        const popupOpts = { maxWidth: 320, autoPanPadding: [40, 40] as [number, number] };

        if (place.kind === "batalla") {
          let color = BOOKS[place.books[0]].color;
          const marker = L.marker([place.lat, place.lng], {
            icon: L.divIcon({ className: "battle-marker", html: BATTLE_SVG, iconSize: [24, 24], iconAnchor: [12, 12], popupAnchor: [0, -10] }),
            alt: place.name,
            riseOnHover: true,
          });
          const paint = () => marker.getElement()?.style.setProperty("--c", color);
          marker.on("add", paint);
          marker.bindPopup(() => buildPopup(place, langRef.current), popupOpts);
          marker.bindTooltip(() => `⚔ ${placeName(place, langRef.current)}`, { direction: "top", offset: [0, -10] });
          marker.on("popupopen", () => marker.getElement()?.classList.add("is-selected"));
          marker.on("popupclose", () => marker.getElement()?.classList.remove("is-selected"));
          markers.current.set(place.name, { layer: marker, setColor: c => { color = c; paint(); } });
          return;
        }

        const marker = L.circleMarker([place.lat, place.lng], { ...BASE_STYLE, fillColor: BOOKS[place.books[0]].color });
        marker.bindPopup(() => buildPopup(place, langRef.current), popupOpts);
        marker.bindTooltip(() => placeName(place, langRef.current), { direction: "top", offset: [0, -6] });
        marker.on("popupopen", () => { marker.setStyle(SELECTED_STYLE); marker.setRadius(SELECTED_STYLE.radius); marker.bringToFront(); });
        marker.on("popupclose", () => { marker.setStyle({ color: BASE_STYLE.color, weight: BASE_STYLE.weight }); marker.setRadius(BASE_STYLE.radius); });
        markers.current.set(place.name, { layer: marker, setColor: c => marker.setStyle({ fillColor: c }) });
      });

      chapterLayer.current = L.layerGroup().addTo(map);
      tourLayer.current = L.layerGroup().addTo(map);
      mapObj.current = map;
      setReady(true);
    });

    const markerStore = markers.current;
    const routeStore = routes.current;
    return () => {
      cancelled = true;
      if (mapObj.current) {
        mapObj.current.remove();
        mapObj.current = null;
      }
      markerStore.clear();
      routeStore.clear();
      tourLayer.current = null;
      riverLayer.current = null;
      chapterLayer.current = null;
    };
  }, []);

  // Controles y capas con texto: se rehacen al cambiar de idioma
  useEffect(() => {
    const map = mapObj.current;
    const L = leaflet.current;
    if (!ready || !map || !L) return;
    map.closePopup();

    const zoom = L.control.zoom({ position: "topright", zoomInTitle: ui(lang, "zoomIn"), zoomOutTitle: ui(lang, "zoomOut") }).addTo(map);

    const esri = "https://server.arcgisonline.com/ArcGIS/rest/services";
    const esriAttr = '&copy; <a href="https://www.esri.com/">Esri</a>';
    const bases: Record<string, Leaflet.Layer> = {
      [ui(lang, "baseParchment")]: L.layerGroup(),
      [ui(lang, "baseRelief")]: L.tileLayer(`${esri}/World_Shaded_Relief/MapServer/tile/{z}/{y}/{x}`, {
        attribution: `${esriAttr} · Natural Earth`, maxNativeZoom: 13, className: "tiles-relief",
      }),
      [ui(lang, "baseRoman")]: L.tileLayer("https://dh.gu.se/tiles/imperium/{z}/{x}/{y}.png", {
        attribution: '<a href="https://dh.gu.se/dare/">DARE</a>, CC BY 4.0', maxNativeZoom: 11, className: "tiles-ancient",
      }),
      [ui(lang, "baseSatellite")]: L.tileLayer(`${esri}/World_Imagery/MapServer/tile/{z}/{y}/{x}`, {
        attribution: `${esriAttr}, Maxar, Earthstar Geographics`, maxNativeZoom: 18, className: "tiles-photo",
      }),
      [ui(lang, "baseModern")]: L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>', maxNativeZoom: 19, className: "tiles-modern",
      }),
    };
    // Conserva el fondo elegido al cambiar de idioma
    const baseKeys = Object.keys(bases);
    const current = Math.max(0, baseIndex.current);
    bases[baseKeys[current]].addTo(map);
    const layers = L.control.layers(bases, undefined, { position: "topright", collapsed: true }).addTo(map);
    const onBase = (e: Leaflet.LayersControlEvent) => { baseIndex.current = baseKeys.indexOf(e.name); };
    map.on("baselayerchange", onBase);

    // Ríos con su nombre antiguo, por debajo de rutas y marcadores
    const rivers = L.layerGroup();
    (RIVERS as River[]).forEach(r => {
      const v = riverView(r, lang);
      const sameName = v.name === v.modern;
      const line = L.polyline(r.lines as [number, number][][], { pane: "rivers", color: "#5d9cc4", weight: 1.6, opacity: 0.9 });
      // Una línea invisible más ancha hace el río fácil de señalar
      const hit = L.polyline(r.lines as [number, number][][], { pane: "rivers", color: "#000", weight: 12, opacity: 0 });
      const title = `${ui(lang, "river")} ${v.name}`;
      hit.bindTooltip(sameName ? title : `${title} (${ui(lang, "today")} ${v.modern})`, { sticky: true });
      hit.bindPopup(
        `<div class="popup-header"><div class="popup-name">${esc(title)}</div>
           <div class="popup-modern">${sameName ? ui(lang, "keepsName") : esc(`${ui(lang, "today")} ${v.modern}`)}</div></div>
         <div class="popup-body"><div class="popup-text">${ui(lang, "mentionedIn")} ${esc(r.ref)}.</div></div>`,
        { maxWidth: 280 }
      );
      const label = L.marker(r.label as [number, number], {
        pane: "riverLabels",
        interactive: false,
        keyboard: false,
        icon: L.divIcon({
          className: MAJOR_RIVERS.has(r.name) ? "river-label" : "river-label river-label--minor",
          html: `<span>${esc(v.name)}</span>`,
          iconSize: [0, 0],
        }),
      });
      rivers.addLayer(line).addLayer(hit).addLayer(label);
    });
    riverLayer.current = rivers;
    if (showRiversRef.current) rivers.addTo(map);

    return () => {
      map.off("baselayerchange", onBase);
      zoom.remove();
      layers.remove();
      Object.values(bases).forEach(l => l.remove());
      rivers.remove();
      riverLayer.current = null;
    };
  }, [ready, lang]);

  const baseIndex = useRef(1); // Relieve
  const showRiversRef = useRef(showRivers);
  showRiversRef.current = showRivers;

  // Mostrar/ocultar marcadores según los filtros
  useEffect(() => {
    const map = mapObj.current;
    if (!ready || !map) return;
    const visible = new Set(visiblePlaces.map(p => p.name));

    PLACES.forEach(place => {
      const h = markers.current.get(place.name);
      if (!h) return;
      if (!visible.has(place.name)) {
        h.layer.remove();
        return;
      }
      // El color corresponde al primer libro activo que menciona el lugar
      const book = place.books.find(b => activeBooks.has(b)) ?? place.books[0];
      h.setColor(BOOKS[book].color);
      if (!map.hasLayer(h.layer)) h.layer.addTo(map);
    });
  }, [ready, activeBooks, visiblePlaces]);

  // Mostrar/ocultar rutas
  useEffect(() => {
    const map = mapObj.current;
    if (!ready || !map) return;
    routes.current.forEach((line, id) => {
      if (activeRoutes.has(id)) {
        if (!map.hasLayer(line)) line.addTo(map).bringToBack();
      } else {
        line.remove();
      }
    });
  }, [ready, activeRoutes]);

  // Mostrar/ocultar ríos
  useEffect(() => {
    const map = mapObj.current;
    const layer = riverLayer.current;
    if (!ready || !map || !layer) return;
    if (showRivers) layer.addTo(map);
    else layer.remove();
  }, [ready, showRivers, lang]);

  // Volar al lugar seleccionado y abrir su ficha al llegar
  useEffect(() => {
    const map = mapObj.current;
    if (!ready || !map || !selection) return;
    const { place } = selection;
    const openPopup = () => {
      const h = markers.current.get(place.name);
      if (h && map.hasLayer(h.layer)) h.layer.openPopup();
    };
    map.closePopup();
    map.once("moveend", openPopup);
    flyTo([[place.lat, place.lng]], Math.max(map.getZoom(), 8), 1.2);
    return () => { map.off("moveend", openPopup); };
  }, [ready, selection]);

  // Volar a un punto del texto que no tiene ficha
  useEffect(() => {
    const map = mapObj.current;
    const L = leaflet.current;
    if (!ready || !map || !L || !focus) return;
    const at: [number, number] = [focus.lat, focus.lng];
    const open = () => {
      L.popup({ maxWidth: 260 })
        .setLatLng(at)
        .setContent(
          `<div class="popup-header"><div class="popup-name">${esc(focus.label)}</div></div>
           <div class="popup-body"><div class="popup-text">${ui(langRef.current, "mentionedHere")}.</div></div>`
        )
        .openOn(map);
    };
    map.closePopup();
    map.once("moveend", open);
    flyTo([at], Math.max(map.getZoom(), 7), 1);
    return () => { map.off("moveend", open); };
  }, [ready, focus]);

  // Recorrido guiado: traza el camino andado, marca el paso actual y vuela a él
  useEffect(() => {
    const map = mapObj.current;
    const L = leaflet.current;
    const layer = tourLayer.current;
    if (!ready || !map || !L || !layer) return;
    layer.clearLayers();
    if (!tourStep) return;
    map.closePopup();
    if (tourStep.path.length > 1) {
      L.polyline(tourStep.path, { color: "#f5e6b8", weight: 2.5, opacity: 0.9, dashArray: "2 7", lineCap: "round", interactive: false }).addTo(layer);
    }
    L.marker(tourStep.at, {
      icon: L.divIcon({ className: "tour-ring", html: "<span></span>", iconSize: [44, 44], iconAnchor: [22, 22] }),
      interactive: false,
      keyboard: false,
      zIndexOffset: -1000,
    }).addTo(layer);
    map.flyTo(tourStep.at, tourStep.zoom, { duration: 1.4 });
    // tourStep.key identifica el paso; el objeto se recrea en cada render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, tourStep?.key]);

  // Lectura: señala los lugares del capítulo en curso y, si se pide, lleva el mapa a ellos
  useEffect(() => {
    const map = mapObj.current;
    const L = leaflet.current;
    const layer = chapterLayer.current;
    if (!ready || !map || !L || !layer) return;
    layer.clearLayers();
    if (!reading) return;
    reading.places.forEach(p => {
      L.circleMarker([p.lat, p.lng], {
        pane: "chapter",
        radius: 11,
        color: "#f5e6b8",
        weight: 2,
        opacity: 0.95,
        fillColor: "#f5e6b8",
        fillOpacity: 0.18,
        className: "chapter-ring",
      })
        .bindTooltip(p.label, { direction: "top", offset: [0, -8] })
        .addTo(layer);
    });
    if (reading.follow && reading.places.length) {
      flyTo(reading.places.map(p => [p.lat, p.lng] as [number, number]), reading.places.length === 1 ? 7 : 9, 0.9);
    }
    // reading.key identifica el capítulo; el objeto se recrea en cada render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, reading?.key, reading?.follow, lang]);

  // Encuadrar todos los lugares visibles
  useEffect(() => {
    const map = mapObj.current;
    if (!ready || !map || fitNonce === 0) return;
    map.closePopup();
    // En escritorio el panel lateral tapa la franja izquierda del mapa
    flyTo(visiblePlaces.map(p => [p.lat, p.lng] as [number, number]), 8, 1, window.innerWidth >= 768 ? 290 : 40);
    // Sólo debe dispararse al pulsar el botón, no al cambiar los filtros
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, fitNonce]);

  // El lector cambia el tamaño útil del mapa
  useEffect(() => {
    mapObj.current?.invalidateSize();
  }, [inset.right, inset.bottom]);

  return (
    <div className="w-full h-full relative">
      <div ref={mapRef} id="map" role="application" aria-label={ui(lang, "mapLabel")} />
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center" style={{ background: "#0a0804" }}>
          <p style={{ fontFamily: "'Cinzel', serif", color: "#c9a227", letterSpacing: "0.1em", fontSize: "0.9rem" }}>
            {ui(lang, "loading")}
          </p>
        </div>
      )}
    </div>
  );
}
