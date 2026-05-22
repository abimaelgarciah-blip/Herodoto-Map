"use client";

import { TIPO_ICONOS, type Place } from "@/data/places";

interface PlaceDetailProps {
  place: Place;
  onClose: () => void;
}

export default function PlaceDetail({ place, onClose }: PlaceDetailProps) {
  const icon = TIPO_ICONOS[place.tipo];

  const importanciaLabel = {
    3: "Alta importancia histórica",
    2: "Importancia moderada",
    1: "Mención secundaria",
  }[place.importancia];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-start justify-between p-4 border-b border-parchment-300">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">{icon}</span>
            <span className="text-xs uppercase tracking-widest text-ancient-light">
              {place.tipo}
            </span>
          </div>
          <h2 className="text-xl font-bold text-ancient-dark truncate">
            {place.nombre}
          </h2>
          <p className="text-sm italic text-ancient-light">{place.nombreAntiguo}</p>
        </div>
        <button
          onClick={onClose}
          className="ml-2 p-1.5 rounded hover:bg-parchment-200 text-ancient-light hover:text-ancient-dark transition-colors"
          aria-label="Cerrar"
        >
          ✕
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Meta */}
        <div className="flex flex-wrap gap-2">
          <span className="px-2 py-1 text-xs rounded bg-parchment-200 text-ancient-medium border border-parchment-300">
            📖 Libro {place.libro}
          </span>
          <span className="px-2 py-1 text-xs rounded bg-parchment-200 text-ancient-medium border border-parchment-300">
            📍 {place.lat.toFixed(2)}°N, {place.lng.toFixed(2)}°E
          </span>
          <span className="px-2 py-1 text-xs rounded bg-amber-100 text-amber-800 border border-amber-200">
            {importanciaLabel}
          </span>
        </div>

        {/* Description */}
        <div>
          <h3 className="text-xs uppercase tracking-widest text-ancient-light mb-2">
            Descripción
          </h3>
          <p className="text-sm text-ancient-medium leading-relaxed">
            {place.descripcion}
          </p>
        </div>

        {/* Quote */}
        {place.cita && (
          <div className="border-l-4 border-parchment-400 pl-4 py-1">
            <h3 className="text-xs uppercase tracking-widest text-ancient-light mb-2">
              Heródoto dice
            </h3>
            <blockquote className="text-sm italic text-ancient-dark leading-relaxed">
              &ldquo;{place.cita}&rdquo;
            </blockquote>
          </div>
        )}

        {/* Coordinates hint */}
        <div className="mt-4 p-3 bg-parchment-50 rounded border border-parchment-200 text-xs text-ancient-light">
          <span className="font-semibold">Localización moderna:</span>{" "}
          {place.lat.toFixed(4)}°N {place.lng.toFixed(4)}°{place.lng >= 0 ? "E" : "O"}
        </div>
      </div>
    </div>
  );
}
