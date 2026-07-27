export type HouseSystem =
  | 'placidus'
  | 'equal'
  | 'whole_sign'
  | 'koch'
  | 'regiomontanus'
  | 'campanus'
  | 'porphyry'
  | 'alcabitius'
  | 'topocentric';

export interface HouseSystemOption {
  id: HouseSystem;
  name: string;
  description: string;
}

export const HOUSE_SYSTEMS: HouseSystemOption[] = [
  { id: 'placidus', name: 'Placidus', description: 'Sistema predeterminado basado en la trisección del arco diurno/nocturno.' },
  { id: 'equal', name: 'Casas iguales', description: 'Comienza en el Ascendente y divide el círculo en 12 sectores iguales de 30°.' },
  { id: 'whole_sign', name: 'Whole Sign (Signo completo)', description: 'Cada casa ocupa un signo zodiacal completo partiendo del signo del Ascendente.' },
  { id: 'koch', name: 'Koch', description: 'Basado en la proyección cenital del arco diurno.' },
  { id: 'regiomontanus', name: 'Regiomontanus', description: 'Trisección del ecuador proyectada sobre la eclíptica.' },
  { id: 'campanus', name: 'Campanus', description: 'Trisección del primer vertical proyectada sobre la eclíptica.' },
  { id: 'porphyry', name: 'Porfirio', description: 'División geométrica idéntica de los cuatro cuadrantes principales.' },
  { id: 'alcabitius', name: 'Alcabitius', description: 'Trisección de la ascensión recta del Ascendente.' },
  { id: 'topocentric', name: 'Topocéntrico', description: 'Sistema de Polich-Page ajustado por latitud geográfica.' },
];

export type CelestialBodyKey =
  | 'sun'
  | 'moon'
  | 'mercury'
  | 'venus'
  | 'mars'
  | 'jupiter'
  | 'saturn'
  | 'uranus'
  | 'neptune'
  | 'pluto'
  | 'north_node'
  | 'south_node';

export type MotionState = 'Directo' | 'Retrógrado' | 'Estacionario';

export interface ZodiacSign {
  id: string;
  name: string;
  symbol: string;
  element: 'Fuego' | 'Tierra' | 'Aire' | 'Agua';
  modality: 'Cardinal' | 'Fijo' | 'Mutable';
  startDeg: number;
  endDeg: number;
  color: string;
  bgHex: string;
}

export const ZODIAC_SIGNS: ZodiacSign[] = [
  { id: 'aries', name: 'Aries', symbol: '♈', element: 'Fuego', modality: 'Cardinal', startDeg: 0, endDeg: 30, color: '#ef4444', bgHex: '#fef2f2' },
  { id: 'tauro', name: 'Tauro', symbol: '♉', element: 'Tierra', modality: 'Fijo', startDeg: 30, endDeg: 60, color: '#10b981', bgHex: '#ecfdf5' },
  { id: 'geminis', name: 'Géminis', symbol: '♊', element: 'Aire', modality: 'Mutable', startDeg: 60, endDeg: 90, color: '#f59e0b', bgHex: '#fffbeb' },
  { id: 'cancer', name: 'Cáncer', symbol: '♋', element: 'Agua', modality: 'Cardinal', startDeg: 90, endDeg: 120, color: '#3b82f6', bgHex: '#eff6ff' },
  { id: 'leo', name: 'Leo', symbol: '♌', element: 'Fuego', modality: 'Fijo', startDeg: 120, endDeg: 150, color: '#ef4444', bgHex: '#fef2f2' },
  { id: 'virgo', name: 'Virgo', symbol: '♍', element: 'Tierra', modality: 'Mutable', startDeg: 150, endDeg: 180, color: '#10b981', bgHex: '#ecfdf5' },
  { id: 'libra', name: 'Libra', symbol: '♎', element: 'Aire', modality: 'Cardinal', startDeg: 180, endDeg: 210, color: '#f59e0b', bgHex: '#fffbeb' },
  { id: 'escorpio', name: 'Escorpio', symbol: '♏', element: 'Agua', modality: 'Fijo', startDeg: 210, endDeg: 240, color: '#3b82f6', bgHex: '#eff6ff' },
  { id: 'sagitario', name: 'Sagitario', symbol: '♐', element: 'Fuego', modality: 'Mutable', startDeg: 240, endDeg: 270, color: '#ef4444', bgHex: '#fef2f2' },
  { id: 'capricornio', name: 'Capricornio', symbol: '♑', element: 'Tierra', modality: 'Cardinal', startDeg: 270, endDeg: 300, color: '#10b981', bgHex: '#ecfdf5' },
  { id: 'acuario', name: 'Acuario', symbol: '♒', element: 'Aire', modality: 'Fijo', startDeg: 300, endDeg: 330, color: '#f59e0b', bgHex: '#fffbeb' },
  { id: 'piscis', name: 'Piscis', symbol: '♓', element: 'Agua', modality: 'Mutable', startDeg: 330, endDeg: 360, color: '#3b82f6', bgHex: '#eff6ff' },
];

export interface PlanetPosition {
  key: CelestialBodyKey;
  name: string;
  symbol: string;
  absoluteLongitude: number; // 0 to <360
  sign: string;
  signSymbol: string;
  degree: number;
  minute: number;
  second: number;
  formattedDMS: string;
  house: number;
  speed: number; // degrees per day
  motion: MotionState;
}

export type AngleKey = 'ascendant' | 'descendant' | 'midheaven' | 'ic';

export interface AngleData {
  key: AngleKey;
  name: string;
  abbreviation: string;
  absoluteLongitude: number;
  sign: string;
  signSymbol: string;
  degree: number;
  minute: number;
  second: number;
  formattedDMS: string;
}

export interface HouseCusp {
  number: number;
  absoluteLongitude: number;
  sign: string;
  signSymbol: string;
  degree: number;
  minute: number;
  second: number;
  formattedDMS: string;
  systemName: string;
}

export type AspectType = 'Conjunción' | 'Sextil' | 'Cuadratura' | 'Trígono' | 'Oposición';

export interface AspectDefinition {
  name: AspectType;
  symbol: string;
  targetAngle: number;
  color: string;
}

export const ASPECT_DEFINITIONS: AspectDefinition[] = [
  { name: 'Conjunción', symbol: '☌', targetAngle: 0, color: '#10b981' },
  { name: 'Sextil', symbol: '✶', targetAngle: 60, color: '#3b82f6' },
  { name: 'Cuadratura', symbol: '□', targetAngle: 90, color: '#ef4444' },
  { name: 'Trígono', symbol: '△', targetAngle: 120, color: '#06b6d4' },
  { name: 'Oposición', symbol: '☍', targetAngle: 180, color: '#8b5cf6' },
];

export interface AspectResult {
  bodyA: string;
  bodyASymbol: string;
  bodyB: string;
  bodyBSymbol: string;
  aspect: AspectType;
  aspectSymbol: string;
  exactAngle: number;
  realSeparation: number;
  orb: number;
  motionRelation: 'Aplicativo' | 'Separativo' | 'Exacto';
  relationType: 'planeta–planeta' | 'planeta–Ascendente' | 'planeta–Medio Cielo';
}

export interface OrbsConfig {
  planetPlanet: {
    conjunction: number;
    sextile: number;
    square: number;
    trine: number;
    opposition: number;
  };
  planetAngle: {
    conjunction: number;
    sextile: number;
    square: number;
    trine: number;
    opposition: number;
  };
}

export const DEFAULT_ORBS: OrbsConfig = {
  planetPlanet: {
    conjunction: 8,
    sextile: 6,
    square: 8,
    trine: 8,
    opposition: 8,
  },
  planetAngle: {
    conjunction: 5,
    sextile: 3,
    square: 4,
    trine: 4,
    opposition: 5,
  },
};

export interface NormalizedData {
  name: string;
  locationName: string;
  latitude: number;
  longitude: number;
  ianaZone: string;
  localTime: string;
  utcOffset: string;
  utcTime: string;
  julianDayUT: number;
  houseSystem: HouseSystem;
  houseSystemLabel: string;
}

export interface ValidationCheck {
  description: string;
  passed: boolean;
  details: string;
}

export interface ValidationResult {
  isPassed: boolean;
  statusText: string;
  checks: ValidationCheck[];
  engineInfo: string;
  placidusError?: string;
}

export interface CalculationRequest {
  name: string;
  dateStr: string; // YYYY-MM-DD
  timeStr: string; // HH:mm
  locationName: string;
  latitude: number;
  longitude: number;
  houseSystem: HouseSystem;
  orbs?: OrbsConfig;
}

export interface CalculationResponse {
  normalizedData: NormalizedData;
  planets: PlanetPosition[];
  angles: AngleData[];
  houseCusps: HouseCusp[];
  aspects: AspectResult[];
  validation: ValidationResult;
}

export interface CityPreset {
  name: string;
  country: string;
  lat: number;
  lng: number;
}

export const POPULAR_CITIES: CityPreset[] = [
  { name: 'Buenos Aires', country: 'Argentina', lat: -34.6037, lng: -58.3816 },
  { name: 'Madrid', country: 'España', lat: 40.4168, lng: -3.7038 },
  { name: 'Ciudad de México', country: 'México', lat: 19.4326, lng: -99.1332 },
  { name: 'Bogotá', country: 'Colombia', lat: 4.7110, lng: -74.0721 },
  { name: 'Santiago', country: 'Chile', lat: -33.4489, lng: -70.6693 },
  { name: 'Lima', country: 'Perú', lat: -12.0464, lng: -77.0428 },
  { name: 'Caracas', country: 'Venezuela', lat: 10.4806, lng: -66.9036 },
  { name: 'Montevideo', country: 'Uruguay', lat: -34.9011, lng: -56.1645 },
  { name: 'San José', country: 'Costa Rica', lat: 9.9281, lng: -84.0907 },
  { name: 'Quito', country: 'Ecuador', lat: -0.1807, lng: -78.4678 },
  { name: 'Barcelona', country: 'España', lat: 41.3851, lng: 2.1734 },
  { name: 'Miami', country: 'Estados Unidos', lat: 25.7617, lng: -80.1918 },
  { name: 'Nueva York', country: 'Estados Unidos', lat: 40.7128, lng: -74.0060 },
  { name: 'Londres', country: 'Reino Unido', lat: 51.5074, lng: -0.1278 },
  { name: 'París', country: 'Francia', lat: 48.8566, lng: 2.3522 },
  { name: 'Tokio', country: 'Japón', lat: 35.6762, lng: 139.6503 },
];

export type ConfigurationType =
  | 'planetaryPosition'
  | 'angle'
  | 'aspect'
  | 'planetInHouse';

export interface AnalysisSelection {
  configurationType: ConfigurationType;
  title: string;
  bodies?: string[];
  signs?: string[];
  houses?: number[];
  longitudes?: number[];
  aspect?: string;
  separation?: number;
  orb?: number;
  phase?: string;
  zodiacSystem?: string;
  houseSystem?: string;
}

export interface AnalysisOptions {
  depth?: 'full' | 'summary' | string;
  approach?: 'integrated' | string;
  language?: 'es' | string;
}

export interface AnalysisRequest {
  chartId?: string;
  selection: AnalysisSelection;
  options?: AnalysisOptions;
  forceRegenerate?: boolean;
}

export interface SourceReference {
  title: string;
  author?: string;
  location?: string;
}

export interface AnalysisResponse {
  id: string;
  title: string;
  summary: string;
  centralDynamic: string;
  constructiveExpressions: string[];
  possibleTensions: string[];
  integration: string;
  modifyingFactors: string[];
  sources: SourceReference[];
  generatedAt: string;
  storeConfigured: boolean;
  cached?: boolean;
  responseTimeMs?: number;
}

export interface FullProfileSection {
  title: string;
  category: string;
  content: string;
  keyInsights?: string[];
}

export interface FullProfileResponse {
  id: string;
  consultantName: string;
  birthDetails: string;
  executiveSummary: string;
  elementalBalance: {
    fuego: number;
    tierra: number;
    aire: number;
    agua: number;
    cardinal: number;
    fijo: number;
    mutable: number;
    analysis: string;
  };
  sections: FullProfileSection[];
  keyStrengths: string[];
  mainChallenges: string[];
  integrationGuidance: string;
  sources: SourceReference[];
  generatedAt: string;
  storeConfigured: boolean;
  responseTimeMs?: number;
}

// Active Top-Level Tab Type
export type ActiveTab = 'natal' | 'transits' | 'solar_return' | 'progressions' | 'knowledge';

// Transit Types
export interface TransitRequest {
  natalRequest: CalculationRequest;
  transitDateStr: string; // ISO date YYYY-MM-DD
  transitTimeStr?: string; // ISO time HH:mm
  transitLocationName?: string;
  transitLatitude?: number;
  transitLongitude?: number;
}

export interface InterChartAspect {
  transitBody: string;
  transitSymbol: string;
  natalBody: string;
  natalSymbol: string;
  aspect: string;
  aspectSymbol: string;
  exactAngle: number;
  realSeparation: number;
  orb: number;
  motionRelation: string;
  isAngular?: boolean;
}

export interface TransitResponse {
  natalChart: CalculationResponse;
  transitDateStr: string;
  transitTimeStr: string;
  transitUtcDate: string;
  transitPlanets: PlanetPosition[];
  transitHouseOccupations: { transitBody: string; houseInNatal: number }[];
  interAspects: InterChartAspect[];
}

// Solar Return Types
export interface SolarReturnRequest {
  natalRequest: CalculationRequest;
  targetYear: number;
  returnLocationName?: string;
  returnLatitude?: number;
  returnLongitude?: number;
}

export interface SolarReturnResponse {
  natalChart: CalculationResponse;
  targetYear: number;
  exactReturnDateStr: string;
  exactReturnTimeStr: string;
  exactReturnUtcDate: string;
  solarReturnChart: CalculationResponse;
  solarReturnAscInNatalHouse: number;
  solarReturnMcInNatalHouse: number;
  interAspects: InterChartAspect[];
}


