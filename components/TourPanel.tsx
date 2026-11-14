"use client";

import type { Tour } from "@/data/tours";

interface TourPanelProps {
  tour: Tour;
  index: number;
  onPrev: () => void;
  onNext: () => void;
  onExit: () => void;
}

export default function TourPanel({ tour, index, onPrev, onNext, onExit }: TourPanelProps) {
  const step = tour.steps[index];
  const last = index === tour.steps.length - 1;

  return (
    <section className="tour-panel" aria-label={`Recorrido: ${tour.title}`}>
      <div className="tour-head">
        <span className="tour-name">{tour.title}</span>
        <span className="tour-progress">{index + 1} / {tour.steps.length}</span>
        <button type="button" className="tour-exit" onClick={onExit} aria-label="Salir del recorrido" title="Salir (Esc)">×</button>
      </div>
      <div className="tour-bar" aria-hidden="true">
        <span style={{ width: `${((index + 1) / tour.steps.length) * 100}%` }} />
      </div>
      <div className="tour-body" aria-live="polite">
        <h2>{step.title}</h2>
        <p>{step.text}</p>
        <div className="tour-ref">Heródoto, {step.ref}</div>
      </div>
      <div className="tour-nav">
        <button type="button" onClick={onPrev} disabled={index === 0}>◀ Anterior</button>
        {last
          ? <button type="button" className="is-primary" onClick={onExit}>Terminar</button>
          : <button type="button" className="is-primary" onClick={onNext}>Siguiente ▶</button>}
      </div>
    </section>
  );
}
