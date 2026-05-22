"use client";

import { useEffect, useRef, useState } from "react";
import { PLACES, TIPO_COLORES, TIPO_ICONOS, type Place } from "@/data/places";

interface HerodotusMapProps {
  selectedPlace: Place | null;
  onSelectPlace: (place: Place) => void;
  filterTipo: string;
  filterLibro: string;
}

export default function HerodotusMap({
  selectedPlace,
  onSelectPlace,
  filterTipo,
  filterLibro,
}: HerodotusMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());
  const [mapReady, setMapReady] = useState(false);

  const filteredPlaces = PLACES.filter((p) => {
    if (filterTipo !== "todos" && p.tipo !== filterTipo) return false;
    if (filterLibro !== "todos" && p.libro !== filterLibro) return false;
    return true;
  });

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Dynamic import to avoid SSR issues with Leaflet
    import("leaflet").then((L) => {
      // Fix default marker icons
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(mapRef.current!, {
        center: [35.0, 30.0],
        zoom: 4,
        minZoom: 2,
        maxZoom: 10,
        zoomControl: false,
      });

      // Add zoom control in top-right
      L.control.zoom({ position: "topright" }).addTo(map);

      // Tile layer with ancient feel
      L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
        }
      ).addTo(map);

      mapInstanceRef.current = map;
      setMapReady(true);
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersRef.current.clear();
      }
    };
  }, []);

  // Add/remove markers when filter changes
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return;

    import("leaflet").then((L) => {
      const map = mapInstanceRef.current;

      // Remove all current markers
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current.clear();

      // Add filtered markers
      filteredPlaces.forEach((place) => {
        const color = TIPO_COLORES[place.tipo];
        const icon = TIPO_ICONOS[place.tipo];
        const size = place.importancia === 3 ? 36 : place.importancia === 2 ? 28 : 22;

        const divIcon = L.divIcon({
          className: "",
          html: `<div class="ancient-marker" style="
            width: ${size}px;
            height: ${size}px;
            background-color: ${color};
            opacity: 0.9;
            font-size: ${size * 0.5}px;
          ">${icon}</div>`,
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
          popupAnchor: [0, -size / 2],
        });

        const marker = L.marker([place.lat, place.lng], { icon: divIcon });

        marker.bindPopup(`
          <div style="max-width: 240px;">
            <div style="font-size: 11px; color: #8b6650; margin-bottom: 2px; text-transform: uppercase; letter-spacing: 0.05em;">
              ${icon} ${place.tipo} · Libro ${place.libro}
            </div>
            <h3 style="font-size: 15px; font-weight: bold; color: #2c1810; margin: 0 0 4px 0;">
              ${place.nombre}
            </h3>
            <div style="font-size: 12px; color: #8b6650; font-style: italic; margin-bottom: 6px;">
              ${place.nombreAntiguo}
            </div>
            <p style="font-size: 12px; color: #5c3d2e; margin: 0; line-height: 1.5;">
              ${place.descripcion.slice(0, 120)}...
            </p>
            <button
              onclick="window.dispatchEvent(new CustomEvent('selectPlace', {detail: '${place.id}'}))"
              style="
                margin-top: 8px;
                padding: 4px 10px;
                background: #c26d19;
                color: #fdf8ef;
                border: none;
                border-radius: 3px;
                font-size: 11px;
                cursor: pointer;
                font-family: Georgia, serif;
              "
            >
              Ver más →
            </button>
          </div>
        `);

        marker.on("click", () => onSelectPlace(place));
        marker.addTo(map);
        markersRef.current.set(place.id, marker);
      });
    });
  }, [mapReady, filteredPlaces, onSelectPlace]);

  // Fly to selected place
  useEffect(() => {
    if (!selectedPlace || !mapInstanceRef.current) return;

    mapInstanceRef.current.flyTo(
      [selectedPlace.lat, selectedPlace.lng],
      6,
      { duration: 1.5 }
    );

    const marker = markersRef.current.get(selectedPlace.id);
    if (marker) {
      setTimeout(() => marker.openPopup(), 1600);
    }
  }, [selectedPlace]);

  // Listen for popup button clicks
  useEffect(() => {
    const handler = (e: CustomEvent) => {
      const place = PLACES.find((p) => p.id === e.detail);
      if (place) onSelectPlace(place);
    };
    window.addEventListener("selectPlace", handler as EventListener);
    return () => window.removeEventListener("selectPlace", handler as EventListener);
  }, [onSelectPlace]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full" />
      {!mapReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-parchment-100">
          <div className="text-center">
            <div className="text-4xl mb-3">🗺️</div>
            <p className="text-ancient-medium font-serif">Desplegando el mapa del mundo antiguo...</p>
          </div>
        </div>
      )}
    </div>
  );
}
