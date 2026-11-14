"use client";

import { useEffect, useRef, useState } from "react";
import type * as Leaflet from "leaflet";
import "leaflet/dist/leaflet.css";
import { PLACES, BOOKS, type Place } from "@/data/places";
import { ROUTES } from "@/data/routes";

export interface Selection {
  place: Place;
  /** Cambia en cada selección para poder volver a volar al mismo lugar */
  nonce: number;
}

interface HerodotusMapProps {
  activeBooks: Set<number>;
  activeRoutes: Set<string>;
  selection: Selection | null;
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

  return `
    <div class="popup-header">
      <div class="popup-books">${tags}</div>
      <div class="popup-name">${esc(place.name)}</div>
      <div class="popup-modern">${esc(place.modern.includes(place.region) ? place.modern : `${place.modern} · ${place.region}`)}</div>
    </div>
    <div class="popup-body">
      <div class="popup-text">${esc(place.text)}</div>
      ${place.quote ? `<div class="popup-quote">${esc(place.quote)}</div>` : ""}
    </div>
  `;
}

const BASE_STYLE = { radius: 7, color: "#0a0804", weight: 1.5, opacity: 1, fillOpacity: 0.9 };
const SELECTED_STYLE = { radius: 10, color: "#f5e6b8", weight: 3 };

export default function HerodotusMap({ activeBooks, activeRoutes, selection, fitNonce }: HerodotusMapProps) {
  const mapRef  = useRef<HTMLDivElement>(null);
  const leaflet = useRef<typeof Leaflet | null>(null);
  const mapObj  = useRef<Leaflet.Map | null>(null);
  const markers = useRef<Map<string, Leaflet.CircleMarker>>(new Map());
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

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

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
        const marker = L.circleMarker([place.lat, place.lng], { ...BASE_STYLE, fillColor: BOOKS[place.books[0]].color });
        marker.bindPopup(() => buildPopup(place), { maxWidth: 320, autoPanPadding: [40, 40] });
        marker.bindTooltip(place.name, { direction: "top", offset: [0, -6] });
        marker.on("popupopen", () => { marker.setStyle(SELECTED_STYLE); marker.setRadius(SELECTED_STYLE.radius); marker.bringToFront(); });
        marker.on("popupclose", () => { marker.setStyle({ color: BASE_STYLE.color, weight: BASE_STYLE.weight }); marker.setRadius(BASE_STYLE.radius); });
        markers.current.set(place.name, marker);
      });

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
    };
  }, []);

  // Mostrar/ocultar marcadores según los libros activos
  useEffect(() => {
    const map = mapObj.current;
    if (!ready || !map) return;

    PLACES.forEach(place => {
      const marker = markers.current.get(place.name);
      if (!marker) return;
      const book = place.books.find(b => activeBooks.has(b));
      if (book === undefined) {
        marker.remove();
        return;
      }
      // El color corresponde al primer libro activo que menciona el lugar
      marker.setStyle({ fillColor: BOOKS[book].color });
      if (!map.hasLayer(marker)) marker.addTo(map);
    });
  }, [ready, activeBooks]);

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

  // Volar al lugar seleccionado y abrir su ficha al llegar
  useEffect(() => {
    const map = mapObj.current;
    if (!ready || !map || !selection) return;
    const { place } = selection;
    const openPopup = () => {
      const m = markers.current.get(place.name);
      if (m && map.hasLayer(m)) m.openPopup();
    };
    map.closePopup();
    map.once("moveend", openPopup);
    map.flyTo([place.lat, place.lng], Math.max(map.getZoom(), 8), { duration: 1.2 });
    return () => { map.off("moveend", openPopup); };
  }, [ready, selection]);

  // Encuadrar todos los lugares visibles
  useEffect(() => {
    const map = mapObj.current;
    const L = leaflet.current;
    if (!ready || !map || !L || fitNonce === 0) return;
    const pts = PLACES
      .filter(p => p.books.some(b => activeBooks.has(b)))
      .map(p => [p.lat, p.lng] as [number, number]);
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
