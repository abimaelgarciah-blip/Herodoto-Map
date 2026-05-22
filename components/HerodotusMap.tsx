"use client";

import { useEffect, useRef, useState } from "react";
import { PLACES, BOOKS, type Place } from "@/data/places";
import { RIVERS } from "@/data/rivers";

interface HerodotusMapProps {
  activeBooks: Set<number>;
  flyToPlace: Place | null;
  showRivers: boolean;
  onVisibleCount: (n: number) => void;
}

function buildPopup(place: Place): string {
  const tags = place.books.map(b => {
    const bk = BOOKS[b];
    return `<span class="popup-book-tag" style="background:${bk.color}33;color:${bk.color};border:1px solid ${bk.color}66">${bk.short}</span>`;
  }).join('');
  return `
    <div class="popup-header">
      <div class="popup-books">${tags}</div>
      <div class="popup-name">${place.name}</div>
      <div class="popup-modern">${place.modern}</div>
    </div>
    <div class="popup-body">
      <div class="popup-text">${place.text}</div>
      ${place.quote ? `<div class="popup-quote">${place.quote}</div>` : ''}
    </div>
  `;
}

export default function HerodotusMap({ activeBooks, flyToPlace, showRivers, onVisibleCount }: HerodotusMapProps) {
  const mapRef    = useRef<HTMLDivElement>(null);
  const mapObj    = useRef<any>(null);
  const markers   = useRef<Map<string, any>>(new Map());
  const riverLayers = useRef<any[]>([]);
  const [ready, setReady] = useState(false);

  // Init map once
  useEffect(() => {
    if (!mapRef.current || mapObj.current) return;

    import("leaflet").then(L => {
      const map = L.map(mapRef.current!, {
        center: [36.5, 26.5],
        zoom: 5,
        minZoom: 2,
        maxZoom: 12,
        zoomControl: false,
      });

      L.control.zoom({ position: "topright" }).addTo(map);

      // ESRI World Physical Map — enterprise CDN (very reliable), warm terrain
      // colors that look like ancient parchment when sepia-filtered
      L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer/tile/{z}/{y}/{x}",
        {
          attribution: "Tiles &copy; Esri &mdash; Source: US National Park Service",
          maxZoom: 8,
        }
      ).addTo(map);

      mapObj.current = map;
      setReady(true);
    });

    return () => {
      if (mapObj.current) {
        mapObj.current.remove();
        mapObj.current = null;
        markers.current.clear();
        riverLayers.current = [];
      }
    };
  }, []);

  // Sync place markers when activeBooks changes
  useEffect(() => {
    if (!ready || !mapObj.current) return;

    import("leaflet").then(L => {
      markers.current.forEach(m => m.remove());
      markers.current.clear();

      let count = 0;
      PLACES.forEach(place => {
        if (!place.books.some(b => activeBooks.has(b))) return;
        count++;
        const color = BOOKS[place.books[0]].color;

        const marker = L.circleMarker([place.lat, place.lng], {
          radius: 7,
          fillColor: color,
          color: "#0a0804",
          weight: 1.5,
          opacity: 1,
          fillOpacity: 0.9,
        });

        marker.bindPopup(buildPopup(place), { maxWidth: 320 });
        marker.bindTooltip(place.name);
        marker.addTo(mapObj.current);
        markers.current.set(place.name, marker);
      });

      onVisibleCount(count);
    });
  }, [ready, activeBooks, onVisibleCount]);

  // Sync river polylines
  useEffect(() => {
    if (!ready || !mapObj.current) return;

    import("leaflet").then(L => {
      riverLayers.current.forEach(l => l.remove());
      riverLayers.current = [];

      if (!showRivers) return;

      RIVERS.forEach(river => {
        const line = L.polyline(river.coords as [number, number][], {
          color: "#a8d8f0",
          weight: 2.5,
          opacity: 0.85,
          smoothFactor: 1,
        });
        line.bindTooltip(`${river.name} · ${river.ancient}`, { sticky: true });
        line.addTo(mapObj.current);
        riverLayers.current.push(line);
      });
    });
  }, [ready, showRivers]);

  // Fly to selected place
  useEffect(() => {
    if (!flyToPlace || !mapObj.current) return;
    mapObj.current.flyTo([flyToPlace.lat, flyToPlace.lng], 8, { duration: 1.2 });
    setTimeout(() => {
      markers.current.get(flyToPlace.name)?.openPopup();
    }, 1300);
  }, [flyToPlace]);

  return (
    <div className="w-full h-full relative">
      <div ref={mapRef} id="map" />
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center" style={{ background: '#0a0804' }}>
          <p style={{ fontFamily: "'Cinzel', serif", color: '#c9a227', letterSpacing: '0.1em', fontSize: '0.9rem' }}>
            CARGANDO EL MAPA DEL MUNDO ANTIGUO…
          </p>
        </div>
      )}
    </div>
  );
}
