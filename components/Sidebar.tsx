"use client";

import { useState } from "react";
import { PLACES, TIPO_ICONOS, TIPO_COLORES, type Place, type PlaceType, type BookCategory } from "@/data/places";
import PlaceDetail from "./PlaceDetail";

const TIPOS: { value: string; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "ciudad", label: "🏛️ Ciudades" },
  { value: "batalla", label: "⚔️ Batallas" },
  { value: "maravilla", label: "✨ Maravillas" },
  { value: "region", label: "🗺️ Regiones" },
  { value: "rio", label: "🌊 Ríos" },
  { value: "mar", label: "⛵ Mares" },
];

const LIBROS = [
  { value: "todos", label: "Todos los libros" },
  { value: "Clio", label: "I · Clío" },
  { value: "Euterpe", label: "II · Euterpe" },
  { value: "Thalia", label: "III · Talía" },
  { value: "Melpomene", label: "IV · Melpómene" },
  { value: "Terpsichore", label: "V · Terpsícore" },
  { value: "Erato", label: "VI · Erato" },
  { value: "Polymnia", label: "VII · Polimnia" },
  { value: "Urania", label: "VIII · Urania" },
  { value: "Calliope", label: "IX · Calíope" },
];

interface SidebarProps {
  selectedPlace: Place | null;
  onSelectPlace: (place: Place) => void;
  onClearSelection: () => void;
  filterTipo: string;
  filterLibro: string;
  onFilterTipo: (v: string) => void;
  onFilterLibro: (v: string) => void;
}

export default function Sidebar({
  selectedPlace,
  onSelectPlace,
  onClearSelection,
  filterTipo,
  filterLibro,
  onFilterTipo,
  onFilterLibro,
}: SidebarProps) {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"lista" | "info">("lista");

  const filteredPlaces = PLACES.filter((p) => {
    if (filterTipo !== "todos" && p.tipo !== filterTipo) return false;
    if (filterLibro !== "todos" && p.libro !== filterLibro) return false;
    if (search && !p.nombre.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Show detail tab when a place is selected
  const showDetail = selectedPlace && tab === "info";

  return (
    <aside className="w-80 h-full parchment-bg border-r-2 border-parchment-300 flex flex-col shadow-lg overflow-hidden">
      {/* Header */}
      <div
        className="px-5 py-4 border-b-2 border-parchment-300"
        style={{
          background: "linear-gradient(135deg, #2c1810 0%, #5c3d2e 100%)",
        }}
      >
        <h1 className="text-xl font-bold text-parchment-100 tracking-wide">
          🗺️ Mapa de Heródoto
        </h1>
        <p className="text-xs text-parchment-300 mt-1 italic">
          Las Historias · 484–425 a.C.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-parchment-300">
        <button
          className={`flex-1 py-2 text-sm font-medium transition-colors ${
            tab === "lista"
              ? "bg-parchment-200 text-ancient-dark border-b-2 border-parchment-500"
              : "text-ancient-light hover:bg-parchment-100"
          }`}
          onClick={() => setTab("lista")}
        >
          Lugares ({filteredPlaces.length})
        </button>
        <button
          className={`flex-1 py-2 text-sm font-medium transition-colors ${
            tab === "info"
              ? "bg-parchment-200 text-ancient-dark border-b-2 border-parchment-500"
              : "text-ancient-light hover:bg-parchment-100"
          }`}
          onClick={() => setTab("info")}
        >
          {selectedPlace ? `📍 ${selectedPlace.nombre}` : "Detalle"}
        </button>
      </div>

      {tab === "info" && selectedPlace ? (
        <PlaceDetail
          place={selectedPlace}
          onClose={() => {
            onClearSelection();
            setTab("lista");
          }}
        />
      ) : (
        <>
          {/* Filters */}
          <div className="p-3 space-y-2 border-b border-parchment-200 bg-parchment-50">
            <input
              type="text"
              placeholder="Buscar lugar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-1.5 text-sm border border-parchment-300 rounded bg-white text-ancient-dark placeholder-ancient-light focus:outline-none focus:border-parchment-500"
            />
            <div className="flex gap-2">
              <select
                value={filterTipo}
                onChange={(e) => onFilterTipo(e.target.value)}
                className="flex-1 px-2 py-1.5 text-xs border border-parchment-300 rounded bg-white text-ancient-dark focus:outline-none focus:border-parchment-500"
              >
                {TIPOS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
              <select
                value={filterLibro}
                onChange={(e) => onFilterLibro(e.target.value)}
                className="flex-1 px-2 py-1.5 text-xs border border-parchment-300 rounded bg-white text-ancient-dark focus:outline-none focus:border-parchment-500"
              >
                {LIBROS.map((l) => (
                  <option key={l.value} value={l.value}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Places list */}
          <div className="flex-1 overflow-y-auto">
            {filteredPlaces.length === 0 ? (
              <div className="p-6 text-center text-ancient-light text-sm italic">
                No se encontraron lugares con estos filtros
              </div>
            ) : (
              <ul>
                {filteredPlaces
                  .sort((a, b) => b.importancia - a.importancia)
                  .map((place) => (
                    <li key={place.id}>
                      <button
                        className={`w-full text-left px-4 py-3 border-b border-parchment-200 hover:bg-parchment-100 transition-colors flex items-start gap-3 ${
                          selectedPlace?.id === place.id
                            ? "bg-parchment-200 border-l-4 border-l-parchment-500"
                            : ""
                        }`}
                        onClick={() => {
                          onSelectPlace(place);
                          setTab("info");
                        }}
                      >
                        <span className="text-base mt-0.5 flex-shrink-0">
                          {TIPO_ICONOS[place.tipo]}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-sm font-semibold text-ancient-dark truncate">
                              {place.nombre}
                            </span>
                            {place.importancia === 3 && (
                              <span className="text-xs text-amber-600 flex-shrink-0">★</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-ancient-light italic truncate">
                              {place.nombreAntiguo}
                            </span>
                          </div>
                          <span className="text-xs text-ancient-light mt-0.5 block">
                            Libro {place.libro}
                          </span>
                        </div>
                      </button>
                    </li>
                  ))}
              </ul>
            )}
          </div>

          {/* Legend */}
          <div className="p-3 border-t border-parchment-300 bg-parchment-50">
            <p className="text-xs text-ancient-light mb-2 uppercase tracking-widest">
              Leyenda
            </p>
            <div className="grid grid-cols-2 gap-1">
              {Object.entries(TIPO_ICONOS).map(([tipo, icon]) => (
                <div key={tipo} className="flex items-center gap-1.5">
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{
                      backgroundColor:
                        TIPO_COLORES[tipo as PlaceType],
                    }}
                  />
                  <span className="text-xs text-ancient-medium capitalize">
                    {icon} {tipo}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </aside>
  );
}
