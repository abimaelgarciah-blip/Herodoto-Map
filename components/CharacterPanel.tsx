"use client";

import { useState } from "react";
import { CHARACTERS, type Character } from "@/data/characters";
import { BOOKS } from "@/data/places";

interface CharacterPanelProps {
  open: boolean;
  onClose: () => void;
  onFlyTo: (lat: number, lng: number, name: string) => void;
}

export default function CharacterPanel({ open, onClose, onFlyTo }: CharacterPanelProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (!open) return null;

  const bookColor = (books: number[]) => BOOKS[books[0]]?.color ?? '#c9a227';

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute', inset: 0,
          zIndex: 950,
          background: 'transparent',
        }}
      />

      {/* Panel */}
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        width: 320,
        background: 'rgba(10,8,4,.97)',
        borderLeft: '1px solid #3d2b0f',
        zIndex: 960,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '-8px 0 32px rgba(0,0,0,.7)',
      }}>
        {/* Header */}
        <div style={{
          padding: '10px 14px',
          borderBottom: '1px solid #3d2b0f',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(180deg,#1e150a,#120d06)',
          flexShrink: 0,
        }}>
          <div>
            <div style={{ fontFamily: "'Cinzel',serif", fontSize: '.75rem', letterSpacing: '.15em', color: '#c9a227', textTransform: 'uppercase' }}>
              Personajes
            </div>
            <div style={{ fontSize: '.68rem', color: '#5a3e1b', fontStyle: 'italic', marginTop: 2 }}>
              {CHARACTERS.length} figuras históricas
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: '1px solid #3d2b0f',
              color: '#7a5a2a',
              cursor: 'pointer',
              fontSize: '.8rem',
              padding: '3px 8px',
              borderRadius: 2,
              fontFamily: "'Cinzel',serif",
            }}
          >
            ✕
          </button>
        </div>

        {/* List */}
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {CHARACTERS.map(char => {
            const isExp = expanded === char.id;
            const color = bookColor(char.books);
            return (
              <div key={char.id} style={{ borderBottom: '1px solid #1e150a' }}>
                {/* Row */}
                <div
                  onClick={() => setExpanded(isExp ? null : char.id)}
                  style={{
                    padding: '9px 14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    transition: 'background .15s',
                    background: isExp ? '#1e150a' : 'transparent',
                  }}
                  onMouseEnter={e => { if (!isExp) e.currentTarget.style.background = '#140f07'; }}
                  onMouseLeave={e => { if (!isExp) e.currentTarget.style.background = 'transparent'; }}
                >
                  {/* Color bar */}
                  <div style={{
                    width: 3, alignSelf: 'stretch', borderRadius: 2,
                    background: color, flexShrink: 0, opacity: .8,
                  }} />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                      <span style={{ fontFamily: "'Cinzel',serif", fontSize: '.78rem', color: '#e8d5a3', letterSpacing: '.05em' }}>
                        {char.name}
                      </span>
                      <span style={{ fontSize: '.65rem', color: '#5a3e1b', fontStyle: 'italic' }}>
                        {char.ancient}
                      </span>
                    </div>
                    <div style={{ fontSize: '.65rem', color: '#8a6030', marginTop: 1 }}>
                      {char.role} · {char.dates}
                    </div>
                  </div>

                  {/* Book badges */}
                  <div style={{ display: 'flex', gap: 3, flexShrink: 0 }}>
                    {char.books.map(b => (
                      <span key={b} style={{
                        fontFamily: "'Cinzel',serif",
                        fontSize: '.52rem',
                        padding: '1px 5px',
                        borderRadius: 1,
                        background: `${BOOKS[b]?.color ?? '#c9a227'}22`,
                        color: BOOKS[b]?.color ?? '#c9a227',
                        border: `1px solid ${BOOKS[b]?.color ?? '#c9a227'}44`,
                      }}>
                        {b}
                      </span>
                    ))}
                  </div>

                  <span style={{ fontSize: '.65rem', color: '#5a3e1b', flexShrink: 0 }}>
                    {isExp ? '▲' : '▼'}
                  </span>
                </div>

                {/* Expanded bio */}
                {isExp && (
                  <div style={{
                    padding: '0 14px 12px 27px',
                    background: '#1e150a',
                  }}>
                    <p style={{
                      fontSize: '.82rem',
                      lineHeight: 1.6,
                      color: '#b09060',
                      fontFamily: "'Crimson Text',serif",
                      marginBottom: char.flyTo ? 10 : 0,
                    }}>
                      {char.bio}
                    </p>
                    {char.flyTo && (
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          onFlyTo(char.flyTo!.lat, char.flyTo!.lng, char.flyTo!.label);
                          onClose();
                        }}
                        style={{
                          fontFamily: "'Cinzel',serif",
                          fontSize: '.58rem',
                          letterSpacing: '.1em',
                          padding: '4px 10px',
                          border: `1px solid ${color}55`,
                          background: `${color}11`,
                          color: color,
                          cursor: 'pointer',
                          borderRadius: 2,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5,
                          transition: 'all .2s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = `${color}22`; }}
                        onMouseLeave={e => { e.currentTarget.style.background = `${color}11`; }}
                      >
                        📍 {char.flyTo.label}
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{
          padding: '6px 14px',
          borderTop: '1px solid #3d2b0f',
          fontSize: '.6rem',
          color: '#3d2b0f',
          fontFamily: "'Cinzel',serif",
          letterSpacing: '.08em',
          flexShrink: 0,
          textAlign: 'center',
        }}>
          Haz clic en un personaje para leer su biografía
        </div>
      </div>
    </>
  );
}
