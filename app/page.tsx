"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import Sidebar from "@/components/Sidebar";
import { type Place } from "@/data/places";

// Leaflet must be loaded client-side only
const HerodotusMap = dynamic(() => import("@/components/HerodotusMap"), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center bg-parchment-100">
      <div className="text-center">
        <div className="text-5xl mb-4">🗺️</div>
        <p className="text-ancient-medium font-serif text-lg">
          Desplegando el mapa del mundo antiguo...
        </p>
        <p className="text-ancient-light text-sm mt-2 italic">
          Heródoto de Halicarnaso
        </p>
      </div>
    </div>
  ),
});

export default function Home() {
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [filterTipo, setFilterTipo] = useState("todos");
  const [filterLibro, setFilterLibro] = useState("todos");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleSelectPlace = useCallback((place: Place) => {
    setSelectedPlace(place);
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedPlace(null);
  }, []);

  return (
    <main className="flex h-screen overflow-hidden">
      {/* Sidebar toggle for mobile */}
      <button
        className="md:hidden fixed top-3 left-3 z-50 p-2 bg-ancient-dark text-parchment-100 rounded shadow-lg"
        onClick={() => setSidebarOpen((v) => !v)}
        aria-label="Toggle sidebar"
      >
        {sidebarOpen ? "✕" : "☰"}
      </button>

      {/* Sidebar */}
      <div
        className={`
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
          transition-transform duration-300
          fixed md:relative z-40 h-full
        `}
      >
        <Sidebar
          selectedPlace={selectedPlace}
          onSelectPlace={handleSelectPlace}
          onClearSelection={handleClearSelection}
          filterTipo={filterTipo}
          filterLibro={filterLibro}
          onFilterTipo={setFilterTipo}
          onFilterLibro={setFilterLibro}
        />
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <HerodotusMap
          selectedPlace={selectedPlace}
          onSelectPlace={handleSelectPlace}
          filterTipo={filterTipo}
          filterLibro={filterLibro}
        />

        {/* Map overlay info */}
        <div className="absolute bottom-4 right-4 z-10 parchment-bg border border-parchment-300 rounded px-3 py-2 shadow text-xs text-ancient-light max-w-xs">
          <span className="font-semibold text-ancient-medium">Fuente: </span>
          Las Historias de Heródoto · Datos históricos y geográficos del mundo antiguo (s. V a.C.)
        </div>
      </div>
    </main>
  );
}
