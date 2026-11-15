"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PLACES, BOOKS, type Place } from "@/data/places";
import { PLACES_EN } from "@/data/en";
import { ALIASES_ES, ALIASES_EN } from "@/data/aliases";
import { useLang, bookLabel, placeName, type Lang } from "@/lib/i18n";
import type { ChapterPlace } from "@/components/HerodotusMap";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const BOOK_IDS = Object.keys(BOOKS).map(Number);

/** Lugar etiquetado en el texto: [nombre, lat, lng, tipo] */
type Tagged = [string, number, number, string];
/** Trozo de texto, o mención enlazada a un lugar */
type Seg = string | { label: string; place?: Place; tag?: Tagged };

interface Chapter { n: string; segs: Seg[]; places: ChapterPlace[] }
interface Book { summary?: string; chapters: Chapter[] }

interface ReaderProps {
  follow: boolean;
  onFollow: (v: boolean) => void;
  /** Lugares del capítulo que se está leyendo */
  onChapter: (key: string, places: ChapterPlace[]) => void;
  onPlace: (place: Place) => void;
  onPoint: (p: ChapterPlace) => void;
  onClose: () => void;
}

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

// Nombres ingleses de las fichas: «Sparta (Lacedaemon)» responde a Sparta y a Lacedaemon
const EN_NAMES = new Map<string, Place[]>();
PLACES.forEach(p => {
  const names = [...(PLACES_EN[p.name]?.name ?? "").split(/[()]/), ...(ALIASES_EN[p.name] ?? [])];
  names.map(n => norm(n.trim())).filter(Boolean).forEach(n => EN_NAMES.set(n, [...(EN_NAMES.get(n) ?? []), p]));
});

/** Ficha que corresponde a un lugar etiquetado: por nombre si está cerca, o por pura cercanía */
function placeForTag(tag: Tagged): Place | undefined {
  const dist = (p: Place) => Math.hypot(p.lat - tag[1], p.lng - tag[2]);
  const byName = (EN_NAMES.get(norm(tag[0])) ?? []).filter(p => dist(p) < 1.5).sort((a, b) => dist(a) - dist(b))[0];
  return byName ?? PLACES.filter(p => dist(p) < 0.03).sort((a, b) => dist(a) - dist(b))[0];
}

/** Expresión que encuentra en el texto español los lugares con ficha, según el libro */
function aliasMatcher(book: number) {
  const byAlias = new Map<string, Place>();
  PLACES.forEach(p => (ALIASES_ES[p.name] ?? []).forEach(a => {
    const alias = typeof a === "string" ? { name: a } : a;
    if (!alias.books || alias.books.includes(book)) byAlias.set(alias.name, p);
  }));
  const names = Array.from(byAlias.keys()).sort((a, b) => b.length - a.length);
  const L = "A-Za-zÁÉÍÓÚÜÑáéíóúüñ";
  return { byAlias, re: new RegExp(`(?<![${L}])(${names.join("|")})(?![${L}])`, "g") };
}

function parseBook(raw: any, lang: Lang, book: number, tags: Record<string, Tagged>): Book {
  const matcher = lang === "es" ? aliasMatcher(book) : null;
  const chapters: Chapter[] = raw.chapters.map((c: any) => {
    const segs: Seg[] = [];
    const found = new Map<string, ChapterPlace>();
    const add = (label: string, lat: number, lng: number) => {
      const key = `${lat.toFixed(1)},${lng.toFixed(1)}`;
      if (!found.has(key)) found.set(key, { label, lat, lng });
    };
    const addPlace = (p: Place) => add(placeName(p, lang), p.lat, p.lng);

    if (matcher) {
      // Español: texto corrido; se enlazan las grafías conocidas
      let last = 0;
      const text: string = c.t;
      text.replace(matcher.re, (m, _g, at: number) => {
        if (at > last) segs.push(text.slice(last, at));
        const place = matcher.byAlias.get(m)!;
        segs.push({ label: m, place });
        addPlace(place);
        last = at + m.length;
        return m;
      });
      if (last < text.length) segs.push(text.slice(last));
    } else {
      // Inglés: el texto ya trae sus lugares etiquetados
      (c.s as (string | [string, string])[]).forEach(s => {
        if (typeof s === "string") return segs.push(s);
        const tag = tags[s[1]];
        if (!tag) return segs.push(s[0]);
        segs.push({ label: s[0], place: placeForTag(tag), tag });
      });
    }
    // Lugares localizados del capítulo, comunes a ambos idiomas
    (c.p as string[]).forEach(id => {
      const tag = tags[id];
      if (!tag) return;
      const place = placeForTag(tag);
      if (place) addPlace(place);
      else add(tag[0], tag[1], tag[2]);
    });
    return { n: c.n, segs, places: Array.from(found.values()) };
  });
  return { summary: raw.summary, chapters };
}

const cache = new Map<string, Promise<any>>();
const load = (path: string) => {
  if (!cache.has(path)) {
    cache.set(path, fetch(`${BASE}/book/${path}`).then(r => {
      if (!r.ok) throw new Error(String(r.status));
      return r.json();
    }).catch(e => { cache.delete(path); throw e; }));
  }
  return cache.get(path)!;
};

function savedPosition(): { book: number; chapter: string } {
  try {
    const v = JSON.parse(localStorage.getItem("herodoto:lectura") ?? "");
    if (BOOK_IDS.includes(v.book) && typeof v.chapter === "string") return v;
  } catch {}
  return { book: 1, chapter: "1" };
}

export default function Reader({ follow, onFollow, onChapter, onPlace, onPoint, onClose }: ReaderProps) {
  const { lang, t } = useLang();
  const [pos] = useState(savedPosition);
  const [bookId, setBookId] = useState(pos.book);
  const [book, setBook] = useState<Book | null>(null);
  const [error, setError] = useState(false);
  const [current, setCurrent] = useState(pos.chapter);
  const scroller = useRef<HTMLDivElement>(null);
  /** Capítulo al que hay que saltar cuando termine de cargarse el libro */
  const pending = useRef<string | null>(pos.chapter);

  // Cargar el libro en el idioma activo
  useEffect(() => {
    let cancelled = false;
    setBook(null);
    setError(false);
    Promise.all([load(`${lang}/${bookId}.json`), load("places.json")])
      .then(([raw, tags]) => { if (!cancelled) setBook(parseBook(raw, lang, bookId, tags)); })
      .catch(() => { if (!cancelled) setError(true); });
    return () => { cancelled = true; };
  }, [lang, bookId]);

  const chapterEl = (n: string) => scroller.current?.querySelector<HTMLElement>(`[data-ch="${CSS.escape(n)}"]`);

  // Al cargar, volver al capítulo en que se estaba (o al equivalente en la otra lengua)
  useEffect(() => {
    if (!book || !scroller.current) return;
    const want = pending.current;
    pending.current = null;
    const num = parseInt(want ?? "1", 10) || 1;
    const target = book.chapters.find(c => c.n === want) ?? book.chapters.find(c => parseInt(c.n, 10) >= num) ?? book.chapters[0];
    setCurrent(target.n);
    const el = chapterEl(target.n);
    scroller.current.scrollTop = el && target !== book.chapters[0] ? el.offsetTop - 8 : 0;
  }, [book]);

  // Qué capítulo se está leyendo: el último que empieza por encima del tercio superior
  const onScroll = useCallback(() => {
    const box = scroller.current;
    if (!box || !book) return;
    const line = box.scrollTop + box.clientHeight * 0.3;
    let n = book.chapters[0].n;
    box.querySelectorAll<HTMLElement>("[data-ch]").forEach(el => {
      if (el.offsetTop <= line) n = el.dataset.ch!;
    });
    setCurrent(prev => (prev === n ? prev : n));
  }, [book]);

  const frame = useRef(0);
  const throttled = () => {
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(onScroll);
  };

  const chapter = useMemo(() => book?.chapters.find(c => c.n === current), [book, current]);

  // Avisar al mapa del capítulo en curso y recordar la posición
  useEffect(() => {
    if (!chapter) return;
    onChapter(`${bookId}.${chapter.n}`, chapter.places);
    try { localStorage.setItem("herodoto:lectura", JSON.stringify({ book: bookId, chapter: chapter.n })); } catch {}
  }, [bookId, chapter, onChapter]);

  const goBook = (id: number) => {
    pending.current = "1";
    setBookId(id);
  };
  const goChapter = (n: string) => {
    const el = chapterEl(n);
    if (el && scroller.current) scroller.current.scrollTop = el.offsetTop - 8;
  };
  // Al cambiar de idioma se conserva el capítulo
  const lastLang = useRef(lang);
  if (lastLang.current !== lang) {
    lastLang.current = lang;
    pending.current = current;
  }

  const click = (s: Exclude<Seg, string>) => {
    if (s.place) onPlace(s.place);
    else if (s.tag) onPoint({ label: s.tag[0], lat: s.tag[1], lng: s.tag[2] });
  };

  return (
    <section className="reader" aria-label={t("readerTitle")}>
      <header className="reader-head">
        <div className="reader-row">
          <span className="reader-title">{t("readerTitle")}</span>
          <button type="button" className="reader-close" onClick={onClose} aria-label={t("closeReader")} title={t("closeReader")}>×</button>
        </div>
        <div className="reader-row">
          <select aria-label={t("book")} value={bookId} onChange={e => goBook(Number(e.target.value))}>
            {BOOK_IDS.map(id => <option key={id} value={id}>{bookLabel(id, lang)}</option>)}
          </select>
          <select aria-label={t("chapter")} value={current} onChange={e => goChapter(e.target.value)} disabled={!book}>
            {(book?.chapters ?? []).map(c => <option key={c.n} value={c.n}>{t("chapter")} {c.n}</option>)}
          </select>
        </div>
        <label className="reader-follow" title={t("followTitle")}>
          <input type="checkbox" checked={follow} onChange={e => onFollow(e.target.checked)} />
          {t("follow")}
        </label>
      </header>

      <div className="reader-scroll" ref={scroller} onScroll={throttled} tabIndex={0}>
        {error && <p className="reader-status">{t("loadError")}</p>}
        {!book && !error && <p className="reader-status">{t("loadingBook")}</p>}
        {book && (
          <>
            <h2 className="reader-book">{bookLabel(bookId, lang)}</h2>
            {book.summary && <p className="reader-summary"><strong>{t("summary")}.</strong> {book.summary}</p>}
            {book.chapters.map(c => (
              <p key={c.n} data-ch={c.n} className={c.n === current ? "reader-ch is-current" : "reader-ch"}>
                <span className="reader-num">{c.n}</span>
                {c.segs.map((s, i) => typeof s === "string" ? s : (
                  <button key={i} type="button" className={s.place ? "reader-place" : "reader-place reader-place--plain"} onClick={() => click(s)}>
                    {s.label}
                  </button>
                ))}
              </p>
            ))}
            {bookId < 9 && (
              <button type="button" className="reader-next" onClick={() => goBook(bookId + 1)}>{bookLabel(bookId + 1, lang)} ▶</button>
            )}
            <p className="reader-sources">{t("sources")}</p>
          </>
        )}
      </div>

      <footer className="reader-foot" aria-live="polite">
        <span className="reader-foot-title">{t("inThisChapter")} · {bookId}.{current}</span>
        {chapter && chapter.places.length > 0
          ? chapter.places.map((p, i) => (
              <button key={i} type="button" onClick={() => {
                const place = PLACES.find(pl => pl.lat === p.lat && pl.lng === p.lng);
                place ? onPlace(place) : onPoint(p);
              }}>{p.label}</button>
            ))
          : <span className="reader-none">{t("noChapterPlaces")}</span>}
      </footer>
    </section>
  );
}
