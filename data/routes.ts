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
  {
    id: 'dario-escitia',
    label: 'Darío en Escitia · c. 513 a.C.',
    color: '#2980b9',
    description: 'La campaña de Darío contra los escitas (IV.83-143): cruza el Bósforo y el Istro por puentes de barcas, persigue en vano a los nómadas y regresa por Sestos. Más allá del Istro el trazado es conjetural.',
    points: [
      [40.9800, 29.0300], // Calcedonia
      [41.0130, 28.9840], // Bizancio
      [42.4200, 27.7000], // Apolonia
      [43.2000, 27.9000], // Odeso
      [45.2500, 28.4500], // Puente del Istro
      [46.6900, 31.9000], // Olbia
      [47.3000, 33.5000],
      [47.6000, 38.6000], // hacia el Tanais
      [48.4000, 35.0000],
      [46.9000, 30.6000],
      [45.2500, 28.4500], // Puente del Istro
      [43.2000, 27.9000],
      [41.6000, 27.3000],
      [40.2330, 26.4000], // Sestos
    ],
  },
  {
    id: 'datis',
    label: 'Flota de Datis · 490 a.C.',
    color: '#d35400',
    description: 'La travesía de Datis y Artafernes de isla en isla hasta Maratón (VI.94-102), evitando el rodeo del Atos. Trazado aproximado.',
    points: [
      [36.7000, 34.6000], // Llanura Aleya (Cilicia)
      [36.0000, 32.5000],
      [36.0000, 29.6000],
      [36.3500, 27.6000],
      [37.4000, 26.9000],
      [37.7000, 26.9500], // Samos
      [37.1050, 25.3760], // Naxos
      [37.3966, 25.2685], // Delos
      [38.0100, 24.4200], // Caristo
      [38.3980, 23.7900], // Eretria
      [38.1533, 23.9620], // Maratón
    ],
  },
  {
    id: 'cambises',
    label: 'Cambises en Egipto · 525 a.C.',
    color: '#27ae60',
    description: 'La conquista de Egipto por Cambises (III.1-26): cruza el desierto con ayuda de los árabes, vence en Pelusio, toma Menfis y remonta el Nilo hasta Tebas, desde donde fracasan sus expediciones contra los etíopes y los amonios. Trazado aproximado.',
    points: [
      [31.5017, 34.4668], // Caditis
      [31.0417, 32.5450], // Pelusio
      [29.8493, 31.2558], // Menfis
      [27.2000, 31.1000],
      [25.7019, 32.6329], // Tebas
      [24.0889, 32.8998], // Elefantina
      [22.3000, 31.6000], // hacia Etiopía
    ],
  },
];
