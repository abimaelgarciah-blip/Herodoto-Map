export type BookCategory =
  | "Clio"
  | "Euterpe"
  | "Thalia"
  | "Melpomene"
  | "Terpsichore"
  | "Erato"
  | "Polymnia"
  | "Urania"
  | "Calliope";

export type PlaceType =
  | "ciudad"
  | "region"
  | "batalla"
  | "maravilla"
  | "rio"
  | "mar"
  | "montaña";

export interface Place {
  id: string;
  nombre: string;
  nombreAntiguo: string;
  lat: number;
  lng: number;
  tipo: PlaceType;
  libro: BookCategory;
  descripcion: string;
  cita?: string;
  importancia: 1 | 2 | 3; // 3 = máxima
}

export const PLACES: Place[] = [
  // LIBRO I - CLIO
  {
    id: "halicarnaso",
    nombre: "Halicarnaso",
    nombreAntiguo: "Ἁλικαρνασσός",
    lat: 37.038,
    lng: 27.424,
    tipo: "ciudad",
    libro: "Clio",
    descripcion:
      "Ciudad natal de Heródoto en la costa de Caria (actual Bodrum, Turquía). Desde aquí partió su legado de la historiografía occidental.",
    cita:
      "Heródoto de Halicarnaso expone aquí sus investigaciones para que los hechos humanos no se borren con el tiempo.",
    importancia: 3,
  },
  {
    id: "sardes",
    nombre: "Sardes",
    nombreAntiguo: "Σάρδεις",
    lat: 38.488,
    lng: 28.035,
    tipo: "ciudad",
    libro: "Clio",
    descripcion:
      "Capital del reino de Lidia y residencia de Creso, el rey más rico del mundo antiguo. Ciro el Grande la conquistó en 547 a.C.",
    cita:
      "Creso, hijo de Aliates, rey de los lidios... fue el primer bárbaro que sometió a tributo a los griegos.",
    importancia: 3,
  },
  {
    id: "babilonia",
    nombre: "Babilonia",
    nombreAntiguo: "Βαβυλών",
    lat: 32.536,
    lng: 44.421,
    tipo: "ciudad",
    libro: "Clio",
    descripcion:
      "La gran metrópolis del mundo antiguo, con sus murallas y jardines colgantes. Heródoto la describe con admiración y asombro.",
    cita:
      "Babilonia supera en esplendor a cualquier ciudad que yo conozca... sus murallas tienen 200 codos de altura.",
    importancia: 3,
  },
  {
    id: "persepolis",
    nombre: "Persépolis",
    nombreAntiguo: "Περσέπολις",
    lat: 29.935,
    lng: 52.891,
    tipo: "ciudad",
    libro: "Clio",
    descripcion:
      "Capital ceremonial del Imperio Persa, sede de los reyes aqueménidas. Centro del poder que enfrentó a Grecia.",
    importancia: 3,
    libro: "Clio",
  },
  {
    id: "ecbatana",
    nombre: "Ecbatana",
    nombreAntiguo: "Ἀγβάτανα",
    lat: 34.799,
    lng: 48.515,
    tipo: "ciudad",
    libro: "Clio",
    descripcion:
      "Capital de Media y residencia de verano de los reyes persas, con sus siete murallas concéntricas de diferentes colores.",
    importancia: 2,
    libro: "Clio",
  },

  // LIBRO II - EUTERPE (Egipto)
  {
    id: "menfis",
    nombre: "Menfis",
    nombreAntiguo: "Μέμφις",
    lat: 29.85,
    lng: 31.25,
    tipo: "ciudad",
    libro: "Euterpe",
    descripcion:
      "Antigua capital de Egipto donde Heródoto visitó el templo de Hefesto (Ptah) y escuchó relatos de los sacerdotes sobre milenios de historia.",
    cita:
      "Los sacerdotes de Menfis me contaron que Menes fue el primer rey de Egipto y que fue él quien separó con un dique las tierras de la inundación.",
    importancia: 3,
  },
  {
    id: "tebas-egipto",
    nombre: "Tebas (Egipto)",
    nombreAntiguo: "Θῆβαι",
    lat: 25.718,
    lng: 32.657,
    tipo: "ciudad",
    libro: "Euterpe",
    descripcion:
      "La gran ciudad del Alto Egipto, con sus templos de Amón (Karnak y Luxor). Heródoto la visitó y quedó impresionado por sus 100 puertas.",
    cita: "Tebas es la ciudad de los cien portales.",
    importancia: 3,
  },
  {
    id: "nilo",
    nombre: "Río Nilo",
    nombreAntiguo: "Νεῖλος",
    lat: 26.0,
    lng: 32.5,
    tipo: "rio",
    libro: "Euterpe",
    descripcion:
      "Heródoto intentó descubrir el origen del Nilo y lo describió como el regalo de Egipto. Debatió las teorías sobre sus crecidas anuales.",
    cita:
      "Egipto es el don del Nilo.",
    importancia: 3,
  },
  {
    id: "giza",
    nombre: "Pirámides de Guiza",
    nombreAntiguo: "Αἴγυπτος πυραμίδες",
    lat: 29.977,
    lng: 31.132,
    tipo: "maravilla",
    libro: "Euterpe",
    descripcion:
      "Heródoto describe la construcción de la Gran Pirámide de Keops con detalle, mencionando 100.000 obreros trabajando en turnos de tres meses.",
    cita:
      "Keops redujo a todo el pueblo a la servidumbre... La pirámide se construyó de este modo: en escalones.",
    importancia: 3,
  },
  {
    id: "naucratis",
    nombre: "Náucratis",
    nombreAntiguo: "Ναύκρατις",
    lat: 30.9,
    lng: 30.58,
    tipo: "ciudad",
    libro: "Euterpe",
    descripcion:
      "Ciudad griega en el delta del Nilo, único puerto autorizado para el comercio entre Grecia y Egipto durante siglos.",
    importancia: 2,
    libro: "Euterpe",
  },

  // LIBRO IV - Escitia y Libia
  {
    id: "escitia",
    nombre: "Escitia",
    nombreAntiguo: "Σκυθία",
    lat: 48.0,
    lng: 36.0,
    tipo: "region",
    libro: "Melpomene",
    descripcion:
      "Las vastas estepas al norte del Mar Negro habitadas por los nómadas escitas, famosos por sus jinetes y por beber la sangre de sus enemigos.",
    cita:
      "Los escitas han descubierto lo más importante de todas las cosas humanas: ningún enemigo que los ataque puede escapar, ni ellos pueden ser atrapados si no quieren ser encontrados.",
    importancia: 3,
  },
  {
    id: "olbia",
    nombre: "Olbia",
    nombreAntiguo: "Ὀλβία",
    lat: 46.6,
    lng: 31.9,
    tipo: "ciudad",
    libro: "Melpomene",
    descripcion:
      "Ciudad griega en la desembocadura del río Hipánis (Bug), puerta de entrada al mundo escita. Heródoto posiblemente la visitó.",
    importancia: 2,
    libro: "Melpomene",
  },

  // LIBRO V-VI - Guerras Médicas: Primera guerra
  {
    id: "maratón",
    nombre: "Maratón",
    nombreAntiguo: "Μαραθών",
    lat: 38.152,
    lng: 23.961,
    tipo: "batalla",
    libro: "Calliope",
    descripcion:
      "El campo de batalla donde en 490 a.C. los atenienses derrotaron al ejército persa de Darío. Los 10.000 griegos vencieron a 25.000 persas.",
    cita:
      "Los atenienses cargaron a la carrera contra los bárbaros. Los persas al ver que cargaban a pie y sin caballería ni arqueros, creyeron que estaban locos.",
    importancia: 3,
  },
  {
    id: "atenas",
    nombre: "Atenas",
    nombreAntiguo: "Ἀθῆναι",
    lat: 37.971,
    lng: 23.726,
    tipo: "ciudad",
    libro: "Calliope",
    descripcion:
      "La ciudad que lideró la resistencia griega contra Persia. Heródoto la llama 'la más grande de las ciudades griegas' y celebra su papel en las Guerras Médicas.",
    cita:
      "Los atenienses fueron el origen de la liberación de Grecia.",
    importancia: 3,
  },
  {
    id: "esparta",
    nombre: "Esparta",
    nombreAntiguo: "Σπάρτη",
    lat: 37.075,
    lng: 22.431,
    tipo: "ciudad",
    libro: "Calliope",
    descripcion:
      "Ciudad-estado guerrera, rival de Atenas y clave en la defensa de Grecia frente a Persia. Sus 300 hoplitas en las Termópilas se hicieron legendarios.",
    importancia: 3,
    libro: "Calliope",
  },

  // LIBRO VII - Jerjes invade Grecia
  {
    id: "termópilas",
    nombre: "Termópilas",
    nombreAntiguo: "Θερμοπύλαι",
    lat: 38.797,
    lng: 22.535,
    tipo: "batalla",
    libro: "Polymnia",
    descripcion:
      "El paso costero donde en 480 a.C. el rey Leónidas y sus 300 espartanos (junto a otros aliados griegos) resistieron al ejército persa de Jerjes durante tres días.",
    cita:
      "Extranjero, ve a decir a Lacedemonia que aquí yacemos obedeciendo sus leyes.",
    importancia: 3,
  },
  {
    id: "helesponto",
    nombre: "Helesponto",
    nombreAntiguo: "Ἑλλήσποντος",
    lat: 40.15,
    lng: 26.4,
    tipo: "mar",
    libro: "Polymnia",
    descripcion:
      "El estrecho de los Dardanelos, donde Jerjes construyó su famoso puente de barcos para cruzar con su ejército de Persia a Europa en 480 a.C.",
    cita:
      "Jerjes mandó azotar el Helesponto con trescientos latigazos y le echó cadenas al mar, como si fuera un esclavo.",
    importancia: 3,
  },
  {
    id: "salamina",
    nombre: "Salamina",
    nombreAntiguo: "Σαλαμίς",
    lat: 37.955,
    lng: 23.493,
    tipo: "batalla",
    libro: "Urania",
    descripcion:
      "La batalla naval decisiva de 480 a.C. donde la flota griega, liderada por Temístocles, destruyó la armada persa de Jerjes y salvó a Grecia.",
    cita:
      "En Salamina fue donde los griegos consiguieron su mayor victoria naval sobre los bárbaros.",
    importancia: 3,
  },
  {
    id: "platea",
    nombre: "Platea",
    nombreAntiguo: "Πλαταιαί",
    lat: 38.22,
    lng: 23.27,
    tipo: "batalla",
    libro: "Calliope",
    descripcion:
      "La batalla terrestre final de las Guerras Médicas en 479 a.C., donde los griegos bajo Pausanias derrotaron definitivamente al ejército persa.",
    importancia: 3,
    libro: "Calliope",
  },

  // Otros lugares importantes
  {
    id: "corinto",
    nombre: "Corinto",
    nombreAntiguo: "Κόρινθος",
    lat: 37.908,
    lng: 22.878,
    tipo: "ciudad",
    libro: "Clio",
    descripcion:
      "Ciudad comercial en el istmo que une Grecia central con el Peloponeso. Importante en el relato de la tiranía de los Cipselidas.",
    importancia: 2,
    libro: "Clio",
  },
  {
    id: "delfos",
    nombre: "Delfos",
    nombreAntiguo: "Δελφοί",
    lat: 38.482,
    lng: 22.501,
    tipo: "maravilla",
    libro: "Clio",
    descripcion:
      "El oráculo más importante del mundo griego. Creso lo consultó antes de atacar a Persia y recibió la famosa respuesta: 'Destruirás un gran imperio' (el suyo propio).",
    cita:
      "Si atacas a los persas, destruirás un gran imperio.",
    importancia: 3,
  },
  {
    id: "susa",
    nombre: "Susa",
    nombreAntiguo: "Σοῦσα",
    lat: 32.188,
    lng: 48.259,
    tipo: "ciudad",
    libro: "Terpsichore",
    descripcion:
      "Capital administrativa del Imperio Persa y residencia principal de Darío y Jerjes. Desde aquí se coordinaron las expediciones contra Grecia.",
    importancia: 3,
    libro: "Terpsichore",
  },
  {
    id: "mileto",
    nombre: "Mileto",
    nombreAntiguo: "Μίλητος",
    lat: 37.532,
    lng: 27.278,
    tipo: "ciudad",
    libro: "Terpsichore",
    descripcion:
      "La ciudad jonia más importante, cuna del pensamiento filosófico griego y origen de la Revuelta Jonia (499-493 a.C.) que desencadenó las Guerras Médicas.",
    cita:
      "La revuelta de Mileto fue el inicio de los males tanto para los bárbaros como para los griegos.",
    importancia: 3,
  },
  {
    id: "cartago",
    nombre: "Cartago",
    nombreAntiguo: "Καρχηδών",
    lat: 36.853,
    lng: 10.323,
    tipo: "ciudad",
    libro: "Euterpe",
    descripcion:
      "Gran ciudad fenicia en el norte de África, mencionada por Heródoto en relación con el comercio mediterráneo y las exploraciones africanas.",
    importancia: 2,
    libro: "Euterpe",
  },
  {
    id: "india",
    nombre: "India",
    nombreAntiguo: "Ἰνδική",
    lat: 20.0,
    lng: 78.0,
    tipo: "region",
    libro: "Thalia",
    descripcion:
      "El confín oriental del mundo conocido para Heródoto. Describe sus riquezas, sus gentes y criaturas fabulosas como las hormigas del tamaño de zorros que extraen oro.",
    cita:
      "En India hay hormigas más grandes que un zorro pero más pequeñas que un perro, que al excavar sus madrigueras sacan arena mezclada con oro.",
    importancia: 2,
  },
  {
    id: "etiopia",
    nombre: "Etiopía",
    nombreAntiguo: "Αἰθιοπία",
    lat: 8.0,
    lng: 38.0,
    tipo: "region",
    libro: "Thalia",
    descripcion:
      "El extremo sur del mundo conocido, tierra de hombres de vida larga. Cambyses envió embajadores pero su expedición terminó en desastre.",
    cita:
      "Los etíopes son los hombres más altos, más hermosos y de vida más larga del mundo.",
    importancia: 2,
  },
];

export const TIPO_COLORES: Record<PlaceType, string> = {
  ciudad: "#c26d19",
  region: "#6b8e23",
  batalla: "#8b1a1a",
  maravilla: "#9370db",
  rio: "#4682b4",
  mar: "#20b2aa",
  montaña: "#696969",
};

export const TIPO_ICONOS: Record<PlaceType, string> = {
  ciudad: "🏛️",
  region: "🗺️",
  batalla: "⚔️",
  maravilla: "✨",
  rio: "🌊",
  mar: "⛵",
  montaña: "⛰️",
};
