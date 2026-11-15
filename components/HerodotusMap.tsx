"use client";

import { useEffect, useRef, useState } from "react";
import type * as Leaflet from "leaflet";
import "leaflet/dist/leaflet.css";
import { PLACES, BOOKS, KINDS, type Place } from "@/data/places";
import { ROUTES } from "@/data/routes";
import LAND from "@/data/land.json";
import RIVERS from "@/data/rivers.json";

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

interface HerodotusMapProps {
  activeBooks: Set<number>;
  /** Lugares que pasan los filtros de libro y de tipo */
  visiblePlaces: Place[];
  activeRoutes: Set<string>;
  showRivers: boolean;
  selection: Selection | null;
  /** Paso actual de un recorrido guiado */
  tourStep: TourView | null;
  /** Cambia cada vez que se pide encuadrar todos los lugares visibles */
  fitNonce: number;
}

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function buildPopup(place: Place): string {
  const tags = place.books.map(b => {
    const bk = BOOKS[b];
    return `<span class="popup-book-tag" style="background:${bk.color}33;color:${bk.color};border:1px solid ${bk.color}66">${bk.short}</span>`;
  }).join("");

  const b = place.battle;
  const battle = b ? `
      <dl class="popup-battle">
        <dt>Fecha</dt><dd>${esc(b.date)}</dd>
        <dt>Bandos</dt><dd>${esc(b.sides)}</dd>
        <dt>Resultado</dt><dd>${esc(b.result)}</dd>
      </dl>` : "";

  return `
    <div class="popup-header">
      <div class="popup-books">${tags}<span class="popup-kind">${esc(KINDS[place.kind].label)}</span></div>
      <div class="popup-name">${esc(place.name)}</div>
      <div class="popup-modern">${esc(place.modern.includes(place.region) ? place.modern : `${place.modern} · ${place.region}`)}</div>
    </div>
    <div class="popup-body">
      ${battle}
      <div class="popup-text">${esc(place.text)}</div>
      ${place.quote ? `<div class="popup-quote">${esc(place.quote)}</div>` : ""}
    </div>
  `;
}

const BATTLE_SVG = `<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
  <path class="bm-shape" d="M12 1.5 22.5 12 12 22.5 1.5 12Z"/>
  <path class="bm-swords" d="M8 8l8 8M16 8l-8 8M7 10.5l3.5-3.5M17 10.5 13.5 7"/>
</svg>`;

/** Ríos cuyo nombre se muestra ya en la vista general; el resto, al acercarse */
const MAJOR_RIVERS = new Set(["Nilo", "Éufrates", "Tigris", "Istro", "Borístenes", "Tanais", "Halis", "Araxes", "Indo"]);

/** Un marcador de lugar, sea círculo o icono de batalla */
interface Handle {
  layer: Leaflet.Layer;
  setColor: (color: string) => void;
}

const BASE_STYLE = { radius: 7, color: "#0a0804", weight: 1.5, opacity: 1, fillOpacity: 0.9 };
const SELECTED_STYLE = { radius: 10, color: "#f5e6b8", weight: 3 };

export default function HerodotusMap({ activeBooks, visiblePlaces, activeRoutes, showRivers, selection, tourStep, fitNonce }: HerodotusMapProps) {
  const mapRef  = useRef<HTMLDivElement>(null);
  const leaflet = useRef<typeof Leaflet | null>(null);
  const mapObj  = useRef<Leaflet.Map | null>(null);
  const markers = useRef<Map<string, Handle>>(new Map());
  const riverLayer = useRef<Leaflet.LayerGroup | null>(null);
  const tourLayer = useRef<Leaflet.LayerGroup | null>(null);
  const routes  = useRef<Map<string, Leaflet.Polyline>>(new Map());
  const [ready, setReady] = useState(false);

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

      L.control.zoom({ position: "topright", zoomInTitle: "Acercar", zoomOutTitle: "Alejar" }).addTo(map);
      L.control.scale({ position: "bottomright", imperial: false }).addTo(map);

      // Tierra firme dibujada desde datos propios (Natural Earth): el mapa
      // siempre tiene fondo aunque fallen o estén bloqueados los servidores de teselas.
      map.createPane("land").style.zIndex = "150";
      L.geoJSON(LAND as any, {
        pane: "land",
        interactive: false,
        style: { color: "#8a6a3a", weight: 1, fillColor: "#3a2c18", fillOpacity: 1 },
      }).addTo(map);

      const esri = "https://server.arcgisonline.com/ArcGIS/rest/services";
      const esriAttr = 'Teselas &copy; <a href="https://www.esri.com/">Esri</a>';
      const bases: Record<string, Leaflet.Layer> = {
        "Pergamino": L.layerGroup(),
        "Relieve": L.tileLayer(`${esri}/World_Shaded_Relief/MapServer/tile/{z}/{y}/{x}`, {
          attribution: `${esriAttr} · Natural Earth`, maxNativeZoom: 13, className: "tiles-relief",
        }),
        "Imperio romano (DARE)": L.tileLayer("https://dh.gu.se/tiles/imperium/{z}/{x}/{y}.png", {
          attribution: '<a href="https://dh.gu.se/dare/">DARE</a>, CC BY 4.0', maxNativeZoom: 11, className: "tiles-ancient",
        }),
        "Satélite": L.tileLayer(`${esri}/World_Imagery/MapServer/tile/{z}/{y}/{x}`, {
          attribution: `${esriAttr}, Maxar, Earthstar Geographics`, maxNativeZoom: 18, className: "tiles-photo",
        }),
        "Mapa actual (OSM)": L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>', maxNativeZoom: 19, className: "tiles-modern",
        }),
      };
      bases["Relieve"].addTo(map);
      L.control.layers(bases, undefined, { position: "topright", collapsed: true }).addTo(map);

      // Ríos con su nombre antiguo, por debajo de rutas y marcadores
      map.createPane("rivers").style.zIndex = "350";
      map.createPane("riverLabels").style.zIndex = "360";
      const rivers = L.layerGroup();
      (RIVERS as { name: string; modern: string; ref: string; label: number[]; lines: number[][][] }[]).forEach(r => {
        const sameName = r.name === r.modern;
        const line = L.polyline(r.lines as [number, number][][], { pane: "rivers", color: "#5d9cc4", weight: 1.6, opacity: 0.9 });
        // Una línea invisible más ancha hace el río fácil de señalar
        const hit = L.polyline(r.lines as [number, number][][], { pane: "rivers", color: "#000", weight: 12, opacity: 0 });
        hit.bindTooltip(sameName ? `Río ${r.name}` : `Río ${r.name} (hoy ${r.modern})`, { sticky: true });
        hit.bindPopup(
          `<div class="popup-header"><div class="popup-name">Río ${esc(r.name)}</div>
             <div class="popup-modern">${sameName ? "Conserva su nombre" : `Hoy ${esc(r.modern)}`}</div></div>
           <div class="popup-body"><div class="popup-text">Heródoto lo menciona en ${esc(r.ref)}.</div></div>`,
          { maxWidth: 280 }
        );
        const label = L.marker(r.label as [number, number], {
          pane: "riverLabels",
          interactive: false,
          keyboard: false,
          icon: L.divIcon({ className: MAJOR_RIVERS.has(r.name) ? "river-label" : "river-label river-label--minor", html: `<span>${esc(r.name)}</span>`, iconSize: [0, 0] }),
        });
        rivers.addLayer(line).addLayer(hit).addLayer(label);
      });
      riverLayer.current = rivers;
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
        line.bindTooltip(route.label, { sticky: true });
        line.bindPopup(
          `<div class="popup-header"><div class="popup-name">${esc(route.label)}</div></div>
           <div class="popup-body"><div class="popup-text">${esc(route.description)}</div></div>`,
          { maxWidth: 320 }
        );
        routes.current.set(route.id, line);
      });

      PLACES.forEach(place => {
        const popupOpts = { maxWidth: 320, autoPanPadding: [40, 40] as [number, number] };

        if (place.kind === "batalla") {
          let color = BOOKS[place.books[0]].color;
          const marker = L.marker([place.lat, place.lng], {
            icon: L.divIcon({ className: "battle-marker", html: BATTLE_SVG, iconSize: [24, 24], iconAnchor: [12, 12], popupAnchor: [0, -10] }),
            title: `Batalla de ${place.name}`,
            alt: `Batalla de ${place.name}`,
            riseOnHover: true,
          });
          const paint = () => marker.getElement()?.style.setProperty("--c", color);
          marker.on("add", paint);
          marker.bindPopup(() => buildPopup(place), popupOpts);
          marker.bindTooltip(`⚔ ${place.name}`, { direction: "top", offset: [0, -10] });
          marker.on("popupopen", () => marker.getElement()?.classList.add("is-selected"));
          marker.on("popupclose", () => marker.getElement()?.classList.remove("is-selected"));
          markers.current.set(place.name, { layer: marker, setColor: c => { color = c; paint(); } });
          return;
        }

        const marker = L.circleMarker([place.lat, place.lng], { ...BASE_STYLE, fillColor: BOOKS[place.books[0]].color });
        marker.bindPopup(() => buildPopup(place), popupOpts);
        marker.bindTooltip(place.name, { direction: "top", offset: [0, -6] });
        marker.on("popupopen", () => { marker.setStyle(SELECTED_STYLE); marker.setRadius(SELECTED_STYLE.radius); marker.bringToFront(); });
        marker.on("popupclose", () => { marker.setStyle({ color: BASE_STYLE.color, weight: BASE_STYLE.weight }); marker.setRadius(BASE_STYLE.radius); });
        markers.current.set(place.name, { layer: marker, setColor: c => marker.setStyle({ fillColor: c }) });
      });

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
      tourLayer.current = null;
      riverLayer.current = null;
      routeStore.clear();
    };
  }, []);

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
  }, [ready, showRivers]);

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
    map.flyTo([place.lat, place.lng], Math.max(map.getZoom(), 8), { duration: 1.2 });
    return () => { map.off("moveend", openPopup); };
  }, [ready, selection]);

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

  // Encuadrar todos los lugares visibles
  useEffect(() => {
    const map = mapObj.current;
    const L = leaflet.current;
    if (!ready || !map || !L || fitNonce === 0) return;
    const pts = visiblePlaces.map(p => [p.lat, p.lng] as [number, number]);
    if (!pts.length) return;
    map.closePopup();
    // En escritorio el panel lateral tapa la franja izquierda del mapa
    const left = window.innerWidth >= 768 ? 290 : 40;
    map.flyToBounds(L.latLngBounds(pts), { paddingTopLeft: [left, 40], paddingBottomRight: [40, 60], maxZoom: 8, duration: 1 });
    // Sólo debe dispararse al pulsar el botón, no al cambiar los filtros
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, fitNonce]);

  return (
    <div className="w-full h-full relative">
      <div ref={mapRef} id="map" role="application" aria-label="Mapa de los lugares de las Historias de Heródoto" />
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center" style={{ background: "#0a0804" }}>
          <p style={{ fontFamily: "'Cinzel', serif", color: "#c9a227", letterSpacing: "0.1em", fontSize: "0.9rem" }}>
            CARGANDO EL MAPA DEL MUNDO ANTIGUO…
          </p>
        </div>
      )}
    </div>
  );
}
