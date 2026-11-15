import { PLACES } from "./places";

export interface TourStep {
  title: string;
  text: string;
  /** Pasaje de las Historias */
  ref: string;
  /** Nombre de un lugar de PLACES… */
  place?: string;
  /** …o coordenadas propias [lat, lng] si el paso no tiene ficha */
  at?: [number, number];
  zoom?: number;
}

export interface Tour {
  id: string;
  title: string;
  subtitle: string;
  steps: TourStep[];
}

export const TOURS: Tour[] = [
  {
    id: 'creso',
    title: 'Creso y Ciro',
    subtitle: 'Libro I · La caída de Lidia y el ascenso de Persia',
    steps: [
      { place: 'Sardes (Sardis)', zoom: 7, ref: 'I.29-33',
        title: 'El hombre más rico del mundo',
        text: 'Creso, rey de Lidia, enseña sus tesoros al ateniense Solón y le pregunta quién es el más dichoso de los hombres. Solón no lo nombra: a nadie se le puede llamar feliz antes de ver cómo termina su vida.' },
      { place: 'Delfos', zoom: 7, ref: 'I.46-55',
        title: 'El oráculo ambiguo',
        text: 'Inquieto por el poder creciente de Ciro, Creso pone a prueba a los oráculos y colma Delfos de oro. La respuesta: si ataca a los persas, destruirá un gran imperio. Creso no pregunta cuál.' },
      { at: [39.95, 33.75], zoom: 6, ref: 'I.72-75',
        title: 'El paso del Halis',
        text: 'El río Halis era la frontera entre Lidia y el imperio medo. Creso lo cruza con su ejército; según la versión que Heródoto recoge sin creerla del todo, Tales de Mileto desvió el cauce para que pudieran vadearlo.' },
      { place: 'Pteria (Capadocia)', zoom: 6, ref: 'I.76-77',
        title: 'Una batalla sin vencedor',
        text: 'Lidios y persas chocan en Pteria hasta que cae la noche, sin resultado. Creso cree terminada la campaña, vuelve a Sardes y licencia a sus mercenarios para el invierno.' },
      { place: 'Sardes (Sardis)', zoom: 8, ref: 'I.79-87',
        title: 'La caída de Sardes',
        text: 'Ciro lo sigue de inmediato. Sus camellos espantan a la caballería lidia y, tras catorce días de asedio, los persas escalan la acrópolis por su lado más escarpado. En la pira, Creso recuerda a Solón; Ciro le perdona la vida.' },
      { place: 'Focea', zoom: 7, ref: 'I.162-167',
        title: 'Los jonios, sometidos',
        text: 'Hárpago, general de Ciro, toma una a una las ciudades griegas de la costa. Los foceos prefieren embarcar a toda su población y buscar una nueva patria en Occidente.' },
      { place: 'Xanto (Licia)', zoom: 7, ref: 'I.176',
        title: 'El final de Xanto',
        text: 'Los licios de Xanto salen a combatir contra un ejército muy superior. Vencidos, encierran a sus familias en la acrópolis, le prenden fuego y mueren luchando.' },
      { place: 'Babilonia', zoom: 6, ref: 'I.188-191',
        title: 'La toma de Babilonia',
        text: 'En 539 a.C. Ciro desvía el Éufrates y sus soldados entran por el cauce casi seco. La ciudad es tan grande, dice Heródoto, que en el centro seguían de fiesta cuando los barrios exteriores ya habían caído.' },
      { at: [42.0, 60.0], zoom: 5, ref: 'I.201-214',
        title: 'La reina Tomiris',
        text: 'Ciro cruza el Araxes para someter a los masagetas. Su reina Tomiris lo derrota en la batalla más feroz entre bárbaros que Heródoto conoce; Ciro muere tras veintinueve años de reinado. La localización es incierta.' },
    ],
  },
  {
    id: 'escitia',
    title: 'Darío en Escitia',
    subtitle: 'Libro IV · La campaña contra los nómadas, c. 513 a.C.',
    steps: [
      { place: 'Susa', zoom: 6, ref: 'IV.1, 83',
        title: 'El Gran Rey se pone en marcha',
        text: 'Darío decide castigar a los escitas por su antigua invasión de Asia. Su hermano Artabano le advierte de lo difícil que es alcanzar a un pueblo sin ciudades; no le hace caso.' },
      { place: 'Bizancio', zoom: 8, ref: 'IV.85-89',
        title: 'El puente del Bósforo',
        text: 'El ingeniero Mandrocles de Samos tiende un puente de barcas sobre el Bósforo. Darío levanta dos estelas con los nombres de todos los pueblos de su ejército y cruza a Europa.' },
      { at: [45.25, 28.45], zoom: 7, ref: 'IV.89, 97-98',
        title: 'El puente del Istro',
        text: 'Los jonios de la flota tienden otro puente sobre el Istro (Danubio). Darío les deja una correa con sesenta nudos: que desaten uno cada día y, si se acaban sin que haya vuelto, se marchen a casa.' },
      { at: [47.3, 33.5], zoom: 6, ref: 'IV.120-127',
        title: 'Un enemigo que no presenta batalla',
        text: 'Los escitas se retiran ante los persas cegando pozos y quemando pastos. Cuando Darío exige al rey Idantirso que luche o se someta, este responde que no tienen ciudades ni cultivos que defender.' },
      { at: [47.6, 38.6], zoom: 6, ref: 'IV.131-134',
        title: 'Un pájaro, un ratón, una rana y cinco flechas',
        text: 'Los escitas envían a Darío ese regalo sin explicación. Él lo toma por una rendición; Gobrias lo interpreta bien: si no voláis como pájaros, ni os escondéis como ratones, ni saltáis a los pantanos como ranas, no volveréis.' },
      { at: [45.25, 28.45], zoom: 7, ref: 'IV.136-142',
        title: 'El puente, a punto de caer',
        text: 'Los escitas llegan antes al Istro y piden a los jonios que destruyan el puente. Milcíades el ateniense quiere hacerlo; Histieo de Mileto convence a los tiranos de que su poder depende de Darío. El ejército persa se salva.' },
      { place: 'Sestos', zoom: 8, ref: 'IV.143-144',
        title: 'De vuelta a Asia',
        text: 'Darío regresa a Asia por Sestos y deja en Europa a Megabazo con ochenta mil hombres para someter Tracia. Escitia queda sin conquistar.' },
    ],
  },
  {
    id: 'jonia',
    title: 'La Revuelta Jónica',
    subtitle: 'Libros V-VI · 499-494 a.C.',
    steps: [
      { place: 'Naxos', zoom: 8, ref: 'V.30-34',
        title: 'El fracaso de Naxos',
        text: 'Aristágoras, tirano de Mileto, convence a los persas de atacar Naxos. Tras cuatro meses de asedio inútil se queda sin dinero y sin el favor del sátrapa.' },
      { place: 'Mileto', zoom: 8, ref: 'V.35-38',
        title: 'El mensaje tatuado',
        text: 'Desde Susa, Histieo envía a un esclavo con un mensaje tatuado en la cabeza, oculto bajo el pelo: «subleva Jonia». Aristágoras renuncia a la tiranía y la revuelta se extiende.' },
      { place: 'Esparta (Lacedemonia)', zoom: 7, ref: 'V.49-51',
        title: 'Esparta dice no',
        text: 'Aristágoras muestra al rey Cleómenes un mapa del mundo grabado en bronce. Al oír que Susa está a tres meses de marcha, Cleómenes lo despide; su hija Gorgo, de ocho años, le avisa de que el forastero quiere sobornarlo.' },
      { place: 'Atenas', zoom: 7, ref: 'V.97',
        title: 'Veinte naves',
        text: 'Atenas sí acepta y envía veinte naves, a las que Eretria suma cinco. «Estas naves —escribe Heródoto— fueron el principio de los males para griegos y bárbaros».' },
      { place: 'Sardes (Sardis)', zoom: 7, ref: 'V.99-105',
        title: 'El incendio de Sardes',
        text: 'Los aliados desembarcan en Éfeso y queman Sardes, incluido el templo de Cibeles. Darío pregunta quiénes son los atenienses y ordena a un criado que le repita tres veces en cada comida: «Señor, acuérdate de los atenienses».' },
      { place: 'Lade', zoom: 9, ref: 'VI.7-16',
        title: 'La batalla de Lade',
        text: 'Seis años después, la flota jonia se reúne frente a Mileto. Al empezar el combate la mayoría de los samios iza velas y huye, y tras ellos los lesbios. Los quiotas luchan casi solos.' },
      { place: 'Mileto', zoom: 9, ref: 'VI.18-21',
        title: 'La caída de Mileto',
        text: 'Mileto es tomada y su población deportada. En Atenas, el poeta Frínico lleva el desastre a escena; el público rompe a llorar y lo multan con mil dracmas por recordarles sus propias desgracias.' },
    ],
  },
  {
    id: 'maraton',
    title: 'Maratón',
    subtitle: 'Libro VI · La primera invasión persa, 492-490 a.C.',
    steps: [
      { place: 'Monte Atos', zoom: 8, ref: 'VI.43-45',
        title: 'El naufragio de Mardonio',
        text: 'En 492 a.C. una primera expedición bordea la costa tracia. Al doblar el Atos, un temporal del norte destroza unas trescientas naves; Mardonio se retira.' },
      { place: 'Naxos', zoom: 8, ref: 'VI.94-96',
        title: 'A través del Egeo',
        text: 'Dos años después, Datis y Artafernes evitan el Atos y cruzan de isla en isla. Naxos, que había resistido en 499, es incendiada.' },
      { place: 'Delos', zoom: 9, ref: 'VI.97-98',
        title: 'El temblor de Delos',
        text: 'Datis respeta la isla sagrada y quema en su altar trescientos talentos de incienso. Al partir, Delos tiembla por primera y última vez: un presagio, dice Heródoto, de los males que vendrían.' },
      { place: 'Eretria', zoom: 8, ref: 'VI.100-101',
        title: 'El castigo de Eretria',
        text: 'Eretria resiste seis días hasta que dos ciudadanos la entregan. Los templos arden en venganza por los de Sardes y la población es esclavizada.' },
      { place: 'Maratón', zoom: 9, ref: 'VI.102-103',
        title: 'El desembarco',
        text: 'Guiados por Hipias, el viejo tirano expulsado de Atenas, los persas desembarcan en la llanura de Maratón, buena para la caballería. Los atenienses salen a su encuentro.' },
      { place: 'Esparta (Lacedemonia)', zoom: 7, ref: 'VI.105-106',
        title: 'La carrera de Filípides',
        text: 'El corredor Filípides llega a Esparta al día siguiente de salir de Atenas. Los espartanos prometen ayuda, pero la ley les impide marchar antes de la luna llena.' },
      { place: 'Maratón', zoom: 10, ref: 'VI.109-117',
        title: 'La batalla',
        text: 'Milcíades convence al polemarco de atacar. Los atenienses y los plateos cargan a la carrera, las alas envuelven al enemigo y lo persiguen hasta las naves. Mueren unos 6.400 persas y 192 atenienses.' },
      { place: 'Atenas', zoom: 9, ref: 'VI.115-120',
        title: 'La marcha de vuelta',
        text: 'La flota persa rodea el cabo Sunio para caer sobre la ciudad indefensa, pero el ejército regresa a marchas forzadas y llega antes. Los persas se retiran a Asia; los espartanos llegan tarde y piden ver a los muertos.' },
    ],
  },
  {
    id: 'jerjes',
    title: 'La invasión de Jerjes',
    subtitle: 'Libros VII-IX · 480-479 a.C.',
    steps: [
      { place: 'Susa', zoom: 6, ref: 'VII.5-18',
        title: 'La decisión',
        text: 'Jerjes hereda de Darío la guerra pendiente. Mardonio lo empuja, su tío Artabano lo frena, y un sueño repetido acaba por convencerlos a ambos.' },
      { place: 'Sardes (Sardis)', zoom: 7, ref: 'VII.26-37',
        title: 'La concentración en Sardes',
        text: 'El ejército pasa el invierno en Sardes. Al partir, el sol se oscurece. Pitio el lidio, que había agasajado al rey, pide que su hijo mayor quede exento; Jerjes hace partir al joven en dos y el ejército desfila entre las mitades.' },
      { place: 'Abidos', zoom: 9, ref: 'VII.33-56',
        title: 'El paso del Helesponto',
        text: 'Una tormenta destruye los primeros puentes y Jerjes manda azotar el mar. Los nuevos, sobre 674 naves, resisten. Desde un trono de mármol el rey contempla sus fuerzas y llora por lo breve de la vida. El cruce dura siete días.' },
      { place: 'Dorisco', zoom: 8, ref: 'VII.59-100',
        title: 'El recuento de Dorisco',
        text: 'En la llanura junto al Hebro, Jerjes cuenta su ejército haciéndolo pasar por un cercado con cabida para diez mil hombres. Heródoto cataloga pueblo por pueblo sus armas y vestidos.' },
      { place: 'Monte Atos', zoom: 8, ref: 'VII.22-24, 122',
        title: 'El canal del Atos',
        text: 'Para no repetir el naufragio de 492, Jerjes ha hecho excavar durante tres años un canal a través del istmo. Heródoto cree que lo hizo sobre todo por dejar memoria de su poder.' },
      { place: 'Terma (Tesalónica)', zoom: 8, ref: 'VII.127-131',
        title: 'Terma',
        text: 'Ejército y flota se reúnen en el golfo Termaico. Vuelven los heraldos enviados a pedir tierra y agua: Tesalia, Tebas y buena parte de Grecia central se han sometido.' },
      { place: 'Termópilas', zoom: 9, ref: 'VII.201-228',
        title: 'Las Termópilas',
        text: 'Leónidas defiende el paso durante dos días. Cuando Efialtes guía a los Inmortales por el sendero de la montaña, despide a los aliados y se queda con sus trescientos espartanos y los tespieos. Mueren todos.' },
      { place: 'Artemisio', zoom: 9, ref: 'VIII.1-21',
        title: 'Artemisio',
        text: 'Mientras tanto, la flota griega contiene a la persa durante tres días frente a Eubea. Las tormentas hacen más daño que los combates. Al saber que las Termópilas han caído, los griegos se retiran hacia el sur.' },
      { place: 'Atenas', zoom: 9, ref: 'VIII.40-55',
        title: 'Atenas en llamas',
        text: 'Los atenienses evacúan a sus familias a Trecén, Egina y Salamina. Los pocos que se quedan tras una empalizada de madera en la Acrópolis son exterminados y los templos arden.' },
      { place: 'Salamina', zoom: 10, ref: 'VIII.74-96',
        title: 'Salamina',
        text: 'Temístocles hace llegar a Jerjes un mensaje falso para que ataque en el estrecho, donde el número estorba. El rey ve desde la orilla cómo se hunde su flota y cómo Artemisia embiste a una nave aliada para escapar.' },
      { place: 'Platea', zoom: 9, ref: 'IX.25-70',
        title: 'Platea',
        text: 'Jerjes vuelve a Asia y deja a Mardonio con lo mejor del ejército. En 479 a.C., tras días de escaramuzas junto al Asopo, los espartanos de Pausanias rompen la línea persa. Mardonio muere y su ejército se deshace.' },
      { place: 'Mícale', zoom: 9, ref: 'IX.90-105',
        title: 'Mícale',
        text: 'El mismo día, según Heródoto, la flota griega desembarca en Mícale, asalta el campamento persa y quema las naves. Jonia se subleva por segunda vez.' },
      { place: 'Sestos', zoom: 9, ref: 'IX.114-121',
        title: 'El final en Sestos',
        text: 'Los atenienses de Jantipo toman Sestos por hambre y se llevan a casa los cables de los puentes para ofrecerlos en los templos. Aquí termina el relato de Heródoto.' },
    ],
  },
];

/** Coordenadas [lat, lng] de un paso, tomadas de su lugar si lo tiene */
export function stepLatLng(step: TourStep): [number, number] {
  if (step.at) return step.at;
  const p = PLACES.find(pl => pl.name === step.place);
  if (!p) throw new Error(`Recorrido: lugar desconocido «${step.place}»`);
  return [p.lat, p.lng];
}
