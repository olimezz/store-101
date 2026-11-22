export type SeasonType = "estivi" | "invernali" | "4-stagioni" | "accessori";
export type VehicleType = "auto" | "suv-furgo" | "accessori";
export type EuGrade = "A" | "B" | "C" | "D" | "E";

export interface Product {
  id: string;
  badgeNumber: string;
  slug: string;
  brand: string;
  model: string;
  season: SeasonType;
  seasonLabel: string;
  vehicle: VehicleType;
  vehicleLabel: string;
  width?: number;
  aspectRatio?: number;
  diameter?: string;
  sizeLabel: string;
  loadSpeedIndex?: string;
  priceEur: number;
  compareAtEur?: number;
  rating: number;
  reviewCount: number;
  image: string;
  isTire: boolean;
  featured: boolean;
  inStock: boolean;
  dotGuarantee: string;
  shippingBadge: string;
  euLabel?: {
    fuel: EuGrade;
    wetGrip: EuGrade;
    noiseDb: number;
    noiseClass: "A" | "B" | "C";
  };
  shortDescription: string;
  description: string;
  highlights: string[];
}

export const PRODUCTS: Product[] = [
  {
    id: "prod_michelin_ps4s_245_40_18",
    badgeNumber: "01",
    slug: "michelin-pilot-sport-4s-245-40r18",
    brand: "MICHELIN",
    model: "Pilot Sport 4S",
    season: "estivi",
    seasonLabel: "Estivo",
    vehicle: "auto",
    vehicleLabel: "Auto Sportive",
    width: 245,
    aspectRatio: 40,
    diameter: "R18",
    sizeLabel: "245/40R18",
    loadSpeedIndex: "97Y XL",
    priceEur: 289.99,
    compareAtEur: 319.0,
    rating: 5.0,
    reviewCount: 418,
    image: "/images/tire-summer.jpg",
    isTire: true,
    featured: true,
    inStock: true,
    dotGuarantee: "DOT 2026 (< 6 mesi)",
    shippingBadge: "Spedizione 24/48h",
    euLabel: {
      fuel: "C",
      wetGrip: "A",
      noiseDb: 71,
      noiseClass: "B",
    },
    shortDescription:
      "Mescola bi-compound derivata dal motorsport per frenata fulminea su asciutto e bagnato.",
    description:
      "MICHELIN Pilot Sport 4S è il riferimento assoluto tra gli pneumatici estivi Ultra High Performance. Grazie alla tecnologia Dynamic Response con cintura ibrida in aramide e nylon, trasmette ogni minimo impulso dello sterzo direttamente sull'asfalto garantendo stabilità estrema alle alte velocità e una resa chilometrica superiore.",
    highlights: [
      "Tecnologia Bi-Compound: elastomero ibrido esterno per l'asciutto e silice funzionale interna per il bagnato",
      "Aderenza sul bagnato certificata in Classe A UE",
      "Protezione del cerchio integrata e finitura laterale Premium Touch",
      "Sconto automatico 5% acquistando il treno completo da 4 gomme",
    ],
  },
  {
    id: "prod_bridgestone_blizzak_215_60_16",
    badgeNumber: "02",
    slug: "bridgestone-blizzak-ws90-215-60r16",
    brand: "BRIDGESTONE",
    model: "Blizzak WS90",
    season: "invernali",
    seasonLabel: "Invernale",
    vehicle: "auto",
    vehicleLabel: "Auto",
    width: 215,
    aspectRatio: 60,
    diameter: "R16",
    sizeLabel: "215/60R16",
    loadSpeedIndex: "99H XL",
    priceEur: 165.5,
    compareAtEur: 184.0,
    rating: 4.5,
    reviewCount: 274,
    image: "/images/tire-winter.jpg",
    isTire: true,
    featured: true,
    inStock: true,
    dotGuarantee: "DOT 2026 (< 8 mesi)",
    shippingBadge: "Spedizione 24/48h",
    euLabel: {
      fuel: "C",
      wetGrip: "A",
      noiseDb: 70,
      noiseClass: "B",
    },
    shortDescription:
      "Controllo superiore su ghiaccio, neve compatta e asfalto freddo grazie alla mescola Multi-Cell.",
    description:
      "Progettato per affrontare gli inverni più rigidi con sicurezza costante, BRIDGESTONE Blizzak WS90 integra particelle Bite nella mescola Multi-Cell che agiscono come micro-chiodi su ghiaccio vivo. Certificazione invernale 3PMSF e M+S per conformità totale alle ordinanze invernali italiane ed europee.",
    highlights: [
      "Certificazione 3PMSF (Fiocco di Neve) e M+S omologata per catene a bordo",
      "Lamelle 3D ad alta densità per spazi di frenata ridotti su neve",
      "Drenaggio rapido contro l'aquaplaning da neve sciolta",
      "Sconto automatico 5% acquistando il treno completo da 4 gomme",
    ],
  },
  {
    id: "prod_goodyear_weatherready_235_55_17",
    badgeNumber: "03",
    slug: "goodyear-assurance-weatherready-235-55r17",
    brand: "GOODYEAR",
    model: "Assurance WeatherReady",
    season: "4-stagioni",
    seasonLabel: "4 Stagioni",
    vehicle: "suv-furgo",
    vehicleLabel: "SUV & Crossover",
    width: 235,
    aspectRatio: 55,
    diameter: "R17",
    sizeLabel: "235/55R17",
    loadSpeedIndex: "103V XL",
    priceEur: 214.0,
    compareAtEur: 238.0,
    rating: 4.8,
    reviewCount: 312,
    image: "/images/tire-allseason.jpg",
    isTire: true,
    featured: true,
    inStock: true,
    dotGuarantee: "DOT 2026 (< 6 mesi)",
    shippingBadge: "Spedizione 24/48h",
    euLabel: {
      fuel: "B",
      wetGrip: "A",
      noiseDb: 69,
      noiseClass: "A",
    },
    shortDescription:
      "Prestazioni equilibrate 365 giorni l'anno con scanalature Evolving Traction e omologazione 3PMSF.",
    description:
      "GOODYEAR Assurance WeatherReady elimina il cambio stagionale senza compromessi sulla sicurezza. La mescola all'olio di soia resta flessibile sotto lo zero, mentre i tasselli direzionali a V espellono acqua e fanghiglia istantaneamente. Ideale per SUV, crossover e berline da viaggio.",
    highlights: [
      "Omologazione invernale 3PMSF valida tutto l'anno in tutta Italia",
      "Silenziosità di rotolamento ai vertici della categoria (69 dB - Classe A)",
      "Consumi ridotti con resistenza al rotolamento in Classe B",
      "Sconto automatico 5% acquistando il treno completo da 4 gomme",
    ],
  },
  {
    id: "prod_pirelli_pzero_255_35_19",
    badgeNumber: "04",
    slug: "pirelli-p-zero-pz4-255-35r19",
    brand: "PIRELLI",
    model: "P Zero (PZ4)",
    season: "estivi",
    seasonLabel: "Estivo",
    vehicle: "auto",
    vehicleLabel: "Auto Sportive",
    width: 255,
    aspectRatio: 35,
    diameter: "R19",
    sizeLabel: "255/35R19",
    loadSpeedIndex: "96Y XL",
    priceEur: 312.0,
    compareAtEur: 345.0,
    rating: 4.9,
    reviewCount: 289,
    image: "/images/tire-summer.jpg",
    isTire: true,
    featured: false,
    inStock: true,
    dotGuarantee: "DOT 2026 (< 6 mesi)",
    shippingBadge: "Spedizione 24/48h",
    euLabel: {
      fuel: "C",
      wetGrip: "A",
      noiseDb: 70,
      noiseClass: "B",
    },
    shortDescription:
      "Sviluppato con i principali costruttori supercar per inserimento in curva millimetrico.",
    description:
      "PIRELLI P Zero PZ4 unisce l'esperienza in Formula 1 alla massima guidabilità quotidiana. Il battistrada asimmetrico su misura ottimizza la rigidità della spalla esterna in appoggio e riduce drasticamente la rumorosità interna nell'abitacolo.",
    highlights: [
      "Primo equipaggiamento scelto dalle case sportive europee",
      "Elevata silice per sicurezza immediata sul bagnato (Classe A)",
      "Risposta di sterzo immediata e usura uniforme del battistrada",
    ],
  },
  {
    id: "prod_continental_ts870_205_55_16",
    badgeNumber: "05",
    slug: "continental-wintercontact-ts-870-205-55r16",
    brand: "CONTINENTAL",
    model: "WinterContact TS 870",
    season: "invernali",
    seasonLabel: "Invernale",
    vehicle: "auto",
    vehicleLabel: "Auto",
    width: 205,
    aspectRatio: 55,
    diameter: "R16",
    sizeLabel: "205/55R16",
    loadSpeedIndex: "91H",
    priceEur: 124.9,
    compareAtEur: 139.0,
    rating: 4.9,
    reviewCount: 510,
    image: "/images/tire-winter.jpg",
    isTire: true,
    featured: false,
    inStock: true,
    dotGuarantee: "DOT 2026 (< 8 mesi)",
    shippingBadge: "Spedizione 24/48h",
    euLabel: {
      fuel: "C",
      wetGrip: "B",
      noiseDb: 70,
      noiseClass: "B",
    },
    shortDescription:
      "Vincitore dei test ADAC: tecnologia Triple Sipe Concept e mescola Cool Chili per massima durata.",
    description:
      "CONTINENTAL WinterContact TS 870 è lo pneumatico invernale più premiato della sua categoria. Le lamelle ad incastro tridimensionale e il canale centrale Hydro Grooves assicurano trazione incisiva su neve fresca e frenate sicure su strade bagnate e gelate.",
    highlights: [
      "Top Rated nei test indipendenti europei su neve e ghiaccio",
      "Mescola Cool Chili ad alta resa chilometrica",
      "Omologazione invernale 3PMSF completa",
    ],
  },
  {
    id: "prod_michelin_crossclimate2_225_45_17",
    badgeNumber: "06",
    slug: "michelin-crossclimate-2-225-45r17",
    brand: "MICHELIN",
    model: "CrossClimate 2",
    season: "4-stagioni",
    seasonLabel: "4 Stagioni",
    vehicle: "auto",
    vehicleLabel: "Auto",
    width: 225,
    aspectRatio: 45,
    diameter: "R17",
    sizeLabel: "225/45R17",
    loadSpeedIndex: "94Y XL",
    priceEur: 179.5,
    compareAtEur: 199.0,
    rating: 4.9,
    reviewCount: 642,
    image: "/images/tire-allseason.jpg",
    isTire: true,
    featured: false,
    inStock: true,
    dotGuarantee: "DOT 2026 (< 6 mesi)",
    shippingBadge: "Spedizione 24/48h",
    euLabel: {
      fuel: "B",
      wetGrip: "B",
      noiseDb: 69,
      noiseClass: "A",
    },
    shortDescription:
      "Leader 4 stagioni: performance costanti dal primo all'ultimo millimetro con tecnologia EverGrip.",
    description:
      "MICHELIN CrossClimate 2 ridefinisce gli standard degli pneumatici All-Season. Il disegno scultoreo a V massimizza il drenaggio mentre la mescola termo-adattiva si modella in tempo reale al variare della temperatura stradale.",
    highlights: [
      "Prestazioni certificate 3PMSF anche da pneumatico parzialmente usurato",
      "Ridotta resistenza al rotolamento per risparmiare carburante o autonomia EV",
      "Bassa rumorosità 69 dB in Classe A",
    ],
  },
  {
    id: "prod_pirelli_scorpion_235_55_19",
    badgeNumber: "07",
    slug: "pirelli-scorpion-verde-all-season-235-55r19",
    brand: "PIRELLI",
    model: "Scorpion Verde All Season",
    season: "4-stagioni",
    seasonLabel: "4 Stagioni",
    vehicle: "suv-furgo",
    vehicleLabel: "SUV & Furgo",
    width: 235,
    aspectRatio: 55,
    diameter: "R19",
    sizeLabel: "235/55R19",
    loadSpeedIndex: "105V XL",
    priceEur: 229.0,
    compareAtEur: 254.0,
    rating: 4.7,
    reviewCount: 198,
    image: "/images/tire-suv.jpg",
    isTire: true,
    featured: false,
    inStock: true,
    dotGuarantee: "DOT 2026 (< 8 mesi)",
    shippingBadge: "Spedizione 24/48h",
    euLabel: {
      fuel: "B",
      wetGrip: "B",
      noiseDb: 71,
      noiseClass: "B",
    },
    shortDescription:
      "Struttura rinforzata XL per SUV e crossover moderni: comfort acustico e grande stabilità laterale.",
    description:
      "Sviluppato specificamente per i SUV moderni ad baricentro alto, PIRELLI Scorpion Verde All Season offre fianchi rinforzati, ottimo comfort sulle lunghe tratte autostradali e aderenza affidabile anche su strade umide o leggermente innevate.",
    highlights: [
      "Carcassa rinforzata XL per veicoli pesanti e SUV ibridi/elettrici",
      "Sequenza dei tasselli ottimizzata per ridurre il rumore di rotolamento",
      "Consumo uniforme e lunga percorrenza autostradale",
    ],
  },
  {
    id: "prod_bridgestone_potenza_225_45_18",
    badgeNumber: "08",
    slug: "bridgestone-potenza-sport-225-45r18",
    brand: "BRIDGESTONE",
    model: "Potenza Sport",
    season: "estivi",
    seasonLabel: "Estivo",
    vehicle: "auto",
    vehicleLabel: "Auto Sportive",
    width: 225,
    aspectRatio: 45,
    diameter: "R18",
    sizeLabel: "225/45R18",
    loadSpeedIndex: "95Y XL",
    priceEur: 184.9,
    compareAtEur: 205.0,
    rating: 4.8,
    reviewCount: 231,
    image: "/images/tire-summer.jpg",
    isTire: true,
    featured: false,
    inStock: true,
    dotGuarantee: "DOT 2026 (< 6 mesi)",
    shippingBadge: "Spedizione 24/48h",
    euLabel: {
      fuel: "C",
      wetGrip: "A",
      noiseDb: 71,
      noiseClass: "B",
    },
    shortDescription:
      "Grip estremo in curva e frenata da record sull'asciutto e sul bagnato in Classe A.",
    description:
      "BRIDGESTONE Potenza Sport porta precisione da pista nella guida quotidiana. Le lamelle 3D aumentano la rigidità dei tasselli in accelerazione e staccata, offrendo stabilità direzionale esemplare anche ad alta velocità.",
    highlights: [
      "Classe A di aderenza sul bagnato certificata TÜV SÜD",
      "Profilo sportivo ad alta impronta a terra",
      "Ideale per berline sportive e coupé",
    ],
  },
  {
    id: "prod_continental_sc7_245_40_19",
    badgeNumber: "09",
    slug: "continental-sportcontact-7-245-40r19",
    brand: "CONTINENTAL",
    model: "SportContact 7",
    season: "estivi",
    seasonLabel: "Estivo",
    vehicle: "auto",
    vehicleLabel: "Auto Sportive",
    width: 245,
    aspectRatio: 40,
    diameter: "R19",
    sizeLabel: "245/40R19",
    loadSpeedIndex: "98Y XL",
    priceEur: 268.0,
    compareAtEur: 295.0,
    rating: 5.0,
    reviewCount: 356,
    image: "/images/tire-summer.jpg",
    isTire: true,
    featured: false,
    inStock: true,
    dotGuarantee: "DOT 2026 (< 6 mesi)",
    shippingBadge: "Spedizione 24/48h",
    euLabel: {
      fuel: "C",
      wetGrip: "A",
      noiseDb: 72,
      noiseClass: "B",
    },
    shortDescription:
      "Mescola BlackChili³ e battistrada adattivo per la massima confidenza in ogni curva.",
    description:
      "CONTINENTAL SportContact 7 rappresenta la nuova generazione di pneumatici UUHP. Il battistrada adattivo si adatta istantaneamente tra asfalto asciutto e bagnato, offrendo distanze d'arresto leader della classe.",
    highlights: [
      "Mescola BlackChili di terza generazione per grip immediato",
      "Compatibile con veicoli sportivi termici ed elettrici (EV Compatible)",
      "Aderenza sul bagnato in Classe A UE",
    ],
  },
  {
    id: "prod_goodyear_ultragrip_225_45_17",
    badgeNumber: "10",
    slug: "goodyear-ultragrip-performance-3-225-45r17",
    brand: "GOODYEAR",
    model: "UltraGrip Performance 3",
    season: "invernali",
    seasonLabel: "Invernale",
    vehicle: "auto",
    vehicleLabel: "Auto",
    width: 225,
    aspectRatio: 45,
    diameter: "R17",
    sizeLabel: "225/45R17",
    loadSpeedIndex: "94V XL",
    priceEur: 168.0,
    compareAtEur: 189.0,
    rating: 4.7,
    reviewCount: 164,
    image: "/images/tire-winter.jpg",
    isTire: true,
    featured: false,
    inStock: true,
    dotGuarantee: "DOT 2026 (< 8 mesi)",
    shippingBadge: "Spedizione 24/48h",
    euLabel: {
      fuel: "C",
      wetGrip: "B",
      noiseDb: 70,
      noiseClass: "B",
    },
    shortDescription:
      "Tecnologia Snow Protect e Wet Braking+ per sicurezza totale in montagna e città.",
    description:
      "GOODYEAR UltraGrip Performance 3 combina una densità superiore di lamelle con canali di evacuazione ottimizzati per prevenire l'aquaplaning e mantenere un controllo cristallino sulla neve alta.",
    highlights: [
      "Tecnologia Snow Protect ad alta trazione alpina",
      "Rumorosità ridotta per un viaggio rilassato anche d'inverno",
      "Omologazione invernale 3PMSF e M+S",
    ],
  },
  {
    id: "prod_michelin_alpin5_suv_255_50_19",
    badgeNumber: "11",
    slug: "michelin-pilot-alpin-5-suv-255-50r19",
    brand: "MICHELIN",
    model: "Pilot Alpin 5 SUV",
    season: "invernali",
    seasonLabel: "Invernale",
    vehicle: "suv-furgo",
    vehicleLabel: "SUV & Furgo",
    width: 255,
    aspectRatio: 50,
    diameter: "R19",
    sizeLabel: "255/50R19",
    loadSpeedIndex: "107V XL",
    priceEur: 276.0,
    compareAtEur: 308.0,
    rating: 4.9,
    reviewCount: 207,
    image: "/images/tire-suv.jpg",
    isTire: true,
    featured: false,
    inStock: true,
    dotGuarantee: "DOT 2026 (< 8 mesi)",
    shippingBadge: "Spedizione 24/48h",
    euLabel: {
      fuel: "C",
      wetGrip: "B",
      noiseDb: 71,
      noiseClass: "B",
    },
    shortDescription:
      "Fianchi rinforzati SUV e battistrada direzionale con canale centrale anti-aquaplaning.",
    description:
      "Progettato per SUV premium ad alte prestazioni, MICHELIN Pilot Alpin 5 SUV offre la massima precisione di guida su neve, pioggia gelata e asfalto asciutto invernale con fianchi rinforzati anti-urto.",
    highlights: [
      "Carcassa SUV rinforzata per elevata capacità di carico",
      "Certificazione 3PMSF per transito su strade innevate di montagna",
      "Finitura vellutata Premium Touch sui fianchi",
    ],
  },
  {
    id: "prod_kit_tpms_dinamometrica",
    badgeNumber: "12",
    slug: "kit-manutenzione-pro-tpms-dinamometrica",
    brand: "STORE 101 PRO",
    model: "Kit Manometro Digitale TPMS & Chiave Dinamometrica",
    season: "accessori",
    seasonLabel: "Accessori",
    vehicle: "accessori",
    vehicleLabel: "Accessori",
    sizeLabel: "Universale • Kit 6 pz",
    priceEur: 89.9,
    compareAtEur: 109.0,
    rating: 4.8,
    reviewCount: 143,
    image: "/images/tire-accessory.svg",
    isTire: false,
    featured: false,
    inStock: true,
    dotGuarantee: "Garanzia 24 Mesi",
    shippingBadge: "Spedizione 24/48h",
    shortDescription:
      "Manometro digitale ad alta precisione (±0,05 bar), chiave dinamometrica 28-210 Nm e 4 tappi in lega anodizzata.",
    description:
      "Il kit indispensabile per mantenere sempre la pressione e la coppia di serraggio ottimali dei tuoi pneumatici. Include manometro digitale retroilluminato con lettura BAR/PSI, chiave dinamometrica calibrata certificata ISO 6789 e set da 4 tappi valvola in alluminio anodizzato blu elettrico.",
    highlights: [
      "Manometro digitale retroilluminato con precisione ±0,05 BAR",
      "Chiave dinamometrica certificata 28–210 Nm con bussola antigraffio 17/19/21 mm",
      "Set 4 tappi valvola antipolvere in lega anodizzata",
      "Esente da contributo ambientale PFU",
    ],
  },
];

export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function getUniqueWidths(): number[] {
  const widths = PRODUCTS.map((p) => p.width).filter(
    (w): w is number => typeof w === "number"
  );
  return Array.from(new Set(widths)).sort((a, b) => a - b);
}

export function getUniqueAspectRatios(): number[] {
  const ratios = PRODUCTS.map((p) => p.aspectRatio).filter(
    (r): r is number => typeof r === "number"
  );
  return Array.from(new Set(ratios)).sort((a, b) => a - b);
}

export function getUniqueDiameters(): string[] {
  const diameters = PRODUCTS.map((p) => p.diameter).filter(
    (d): d is string => typeof d === "string"
  );
  return Array.from(new Set(diameters)).sort();
}

export function getUniqueBrands(): string[] {
  const brands = PRODUCTS.filter((p) => p.isTire).map((p) => p.brand);
  return Array.from(new Set(brands)).sort();
}
