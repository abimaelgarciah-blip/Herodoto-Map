"use client";

import type { Tour } from "@/data/tours";
import { useLang, tourView } from "@/lib/i18n";

interface TourPanelProps {
  tour: Tour;
  index: number;
  onPrev: () => void;
  onNext: () => void;
  onExit: () => void;
}

export default function TourPanel({ tour, index, onPrev, onNext, onExit }: TourPanelProps) {
  const { lang, t } = useLang();
  const view = tourView(tour, lang);
  const step = view.steps[index];
  const last = index === view.steps.length - 1;

  return (
    <section className="tour-panel" aria-label={`${t("tour")}: ${view.title}`}>
      <div className="tour-head">
        <span className="tour-name">{view.title}</span>
        <span className="tour-progress">{index + 1} / {view.steps.length}</span>
        <button type="button" className="tour-exit" onClick={onExit} aria-label={t("exitTour")} title={`${t("exitTour")} (Esc)`}>×</button>
      </div>
      <div className="tour-bar" aria-hidden="true">
        <span style={{ width: `${((index + 1) / view.steps.length) * 100}%` }} />
      </div>
      <div className="tour-body" aria-live="polite">
        <h2>{step.title}</h2>
        <p>{step.text}</p>
        <div className="tour-ref">{t("herodotus")}, {step.ref}</div>
      </div>
      <div className="tour-nav">
        <button type="button" onClick={onPrev} disabled={index === 0}>{t("prev")}</button>
        {last
          ? <button type="button" className="is-primary" onClick={onExit}>{t("finish")}</button>
          : <button type="button" className="is-primary" onClick={onNext}>{t("next")}</button>}
      </div>
    </section>
  );
}
