"use client";

import { useState } from "react";
import { BOOKS, PLACES } from "@/data/places";

interface SidebarProps {
  activeBooks: Set<number>;
  onToggleBook: (id: number) => void;
}

export default function Sidebar({ activeBooks, onToggleBook }: SidebarProps) {
  const [open, setOpen] = useState(true);

  const countPerBook = (id: number) =>
    PLACES.filter(p => p.books.includes(id)).length;

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        width: 220,
        background: 'rgba(14,10,4,.95)',
        borderRight: '1px solid #3d2b0f',
        zIndex: 900,
        display: 'flex',
        flexDirection: 'column',
        transform: open ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform .3s',
      }}
    >
      {/* Title */}
      <div style={{
        fontFamily: "'Cinzel', serif",
        fontSize: '.7rem',
        letterSpacing: '.15em',
        color: '#7a5a2a',
        padding: '10px 12px 6px',
        borderBottom: '1px solid #3d2b0f',
        textTransform: 'uppercase',
      }}>
        Filtrar por Libro
      </div>

      {/* Book list */}
      <div style={{ overflowY: 'auto', flex: 1 }}>
        {Object.entries(BOOKS).map(([id, book]) => {
          const numId = parseInt(id);
          const active = activeBooks.has(numId);
          return (
            <div
              key={id}
              onClick={() => onToggleBook(numId)}
              style={{
                padding: '7px 12px',
                borderBottom: '1px solid #1e150a',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                transition: 'background .15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#1e150a')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <div style={{
                width: 9, height: 9,
                borderRadius: '50%',
                flexShrink: 0,
                background: book.color,
                opacity: active ? 1 : 0.25,
              }} />
              <div style={{
                fontFamily: "'Cinzel', serif",
                fontSize: '.65rem',
                letterSpacing: '.08em',
                color: '#c9b08a',
                flex: 1,
                opacity: active ? 1 : 0.4,
              }}>
                {book.label}
              </div>
              <div style={{ fontSize: '.65rem', color: '#5a3e1b' }}>
                {countPerBook(numId)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Toggle button */}
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          position: 'absolute',
          top: '50%',
          right: -28,
          transform: 'translateY(-50%)',
          background: 'rgba(14,10,4,.95)',
          border: '1px solid #3d2b0f',
          borderLeft: 'none',
          color: '#c9a227',
          fontSize: '.75rem',
          cursor: 'pointer',
          padding: '8px 6px',
          writingMode: 'vertical-rl',
          letterSpacing: '.1em',
          fontFamily: "'Cinzel', serif",
          zIndex: 901,
          whiteSpace: 'nowrap',
        }}
      >
        LIBROS {open ? '◀' : '▶'}
      </button>
    </div>
  );
}
