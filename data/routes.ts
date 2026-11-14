export interface Route {
  id: string;
  label: string;
  color: string;
  description: string;
  /** Trazado aproximado: [lat, lng] */
  points: [number, number][];
}

export const ROUTES: Route[] = [
  {
    id: 'camino-real',
    label: 'Camino Real · Sardes–Susa',
    color: '#c9a227',
    description: 'El Camino Real persa descrito en V.52-54: 111 postas y unos tres meses de marcha de Sardes a Susa. Trazado aproximado.',
    points: [
      [38.4883, 28.0403], // Sardes
      [39.6500, 31.9900], // Gordión
      [39.9400, 32.8600], // Ancira
      [39.7500, 35.0650], // Pteria
      [38.3500, 38.3100], // Melitene
      [37.9100, 40.2300], // Alto Tigris
      [36.1900, 44.0100], // Arbela
      [34.3500, 45.4000], // Río Diala
      [32.1909, 48.2556], // Susa
    ],
  },
  {
    id: 'jerjes',
    label: 'Marcha de Jerjes · 480 a.C.',
    color: '#c0392b',
    description: 'La marcha del ejército de Jerjes desde Sardes hasta Atenas (Libros VII-VIII). Trazado aproximado.',
    points: [
      [38.4883, 28.0403], // Sardes
      [39.1200, 27.1800], // Valle del Caico
      [39.5900, 27.0200], // Adramitio
      [39.9573, 26.2389], // Troya
      [40.1957, 26.4142], // Abidos
      [40.2330, 26.4000], // Sestos
      [40.6200, 26.8700], // Quersoneso tracio
      [40.8700, 26.1300], // Dorisco
      [40.9333, 24.9750], // Abdera
      [40.8236, 23.8469], // Nueve Caminos
      [40.4000, 23.8800], // Acanto
      [40.6000, 22.9700], // Terma
      [40.2700, 22.2000], // Alta Macedonia
      [39.6400, 22.4200], // Larisa
      [38.7967, 22.5367], // Termópilas
      [38.3210, 23.3190], // Tebas
      [37.9715, 23.7257], // Atenas
    ],
  },
];
