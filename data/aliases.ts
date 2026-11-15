/**
 * Cómo aparece cada lugar en los textos del lector.
 * ES: grafías de la traducción de Pou. `books` limita un alias ambiguo a ciertos libros.
 */
export interface Alias { name: string; books?: number[] }

export const ALIASES_ES: Record<string, (string | Alias)[]> = {
  'Atenas': ['Atenas'], 'Esparta (Lacedemonia)': ['Esparta', 'Lacedemonia'], 'Corinto': ['Corinto'],
  'Tebas (Beocia)': [{ name: 'Tebas', books: [1, 4, 5, 6, 7, 8, 9] }], 'Tebas (Egipto)': [{ name: 'Tebas', books: [2, 3] }],
  'Delfos': ['Delfos'], 'Maratón': ['Maratón'], 'Termópilas': ['Termópilas'],
  'Salamina': [{ name: 'Salamina', books: [7, 8, 9] }], 'Salamina de Chipre': [{ name: 'Salamina', books: [4, 5] }],
  'Platea': ['Platea'], 'Argos': ['Argos'], 'Eretria': ['Eretria'], 'Egina': ['Egina'], 'Epidauro': ['Epidauro'],
  'Tegea': ['Tegea'], 'Olimpia': ['Olimpia'], 'Valle del Tempe': ['Tempe'], 'Artemisio': ['Artemisio'], 'Dodona': ['Dodona'],
  'Trecén': ['Trecena'], 'Calcis': ['Calcide'], 'Samos': ['Samos'], 'Quíos': ['Quío'], 'Lesbos': ['Lesbos'], 'Naxos': ['Naxos'],
  'Paros': ['Paros'], 'Delos': ['Delos'], 'Creta': ['Creta'], 'Rodas': ['Rodas'], 'Tasos': ['Taso'], 'Lemnos': ['Lemnos'],
  'Sardes (Sardis)': ['Sardes'], 'Éfeso': ['Éfeso'], 'Mileto': ['Mileto'], 'Halicarnaso': ['Halicarnaso'], 'Cnido': ['Cnido'],
  'Xanto (Licia)': ['Janto'], 'Focea': ['Focea'], 'Priene': ['Priena'], 'Pteria (Capadocia)': ['Pteria'], 'Lade': ['Lada'],
  'Mícale': ['Micale'], 'Sinope': ['Sinope'], 'Celenas': ['Celenas'], 'Calcedonia': ['Calcedonia'],
  'Helesponto (Dardanelos)': ['Helesponto'], 'Abidos': ['Ábidos'], 'Sestos': ['Sesto'], 'Bizancio': ['Bizancio'], 'Eno': ['Eno'],
  'Abdera': ['Abdera'], 'Anfípolis (Ennea Hodoi)': ['Nueve Caminos'], 'Monte Atos': ['Atos'], 'Terma (Tesalónica)': ['Terma'],
  'Dorisco': ['Dorisco'], 'Troya (Ilión)': ['Troya'], 'Potidea': ['Potidea'], 'Eión': ['Eyona'], 'Susa': ['Susa'],
  'Ecbatana': ['Ecbatana'], 'Babilonia': ['Babilonia'], 'Fasis (Cólquide)': ['Fasis', 'Cólquide'], 'Menfis': ['Menfis'],
  'Heliópolis': ['Heliópolis'], 'Sais': ['Sais'], 'Elefantina': ['Elefantina'], 'Pelusio': ['Pelusio'], 'Náucratis': ['Naucratis'],
  'Bubastis': ['Bubastis'], 'Lago Meris y el Laberinto': ['Meris'], 'Tiro': ['Tiro'], 'Sidón': ['Sidon'], 'Gaza (Cadytis)': ['Caditis'],
  'Quersoneso Táurico': ['Táurica'], 'Cirene': ['Cirene'], 'Barca': ['Barca'], 'Cartago': ['Cartago'], 'Siracusa': ['Siracusa'],
  'Síbaris': ['Sibaris'], 'Crotona': ['Crotona'], 'Alalia': ['Alalia'], 'Tartesos': ['Tarteso'],
};

/** Nombres con que la edición inglesa etiqueta lugares que tienen ficha, además del nombre de la ficha */
export const ALIASES_EN: Record<string, string[]> = {
  'Esparta (Lacedemonia)': ['Lacedaemon'], 'Sestos': ['Sestus'], 'Calcedonia': ['Calchedon'], 'Monte Atos': ['Athos'],
  'Valle del Tempe': ['Tempe'], 'Terma (Tesalónica)': ['Therma'], 'Troya (Ilión)': ['Ilion'], 'Mícale': ['Mykale'],
  'Abidos': ['Abydus'], 'Tasos': ['Thasus'], 'Anfípolis (Ennea Hodoi)': ['Nine Ways'], 'Oasis de Amón': ['Ammon'],
  'Tartesos': ['Tartessos'], 'Crotona': ['Crotona'], 'Lago Meris y el Laberinto': ['Moeris'], 'Fasis (Cólquide)': ['Colchis'],
};
