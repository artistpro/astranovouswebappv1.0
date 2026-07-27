import * as AstronomyImport from 'astronomy-engine';
import { CelestialBodyKey, MotionState } from '../types';
import { normalize360 } from './utils';

export function getAstronomy(): typeof AstronomyImport {
  const a: any = AstronomyImport;
  if (a && a.Body && a.GeoVector) return a;
  if (a && a.default && a.default.Body) return a.default;
  return a;
}

export interface BodyDefinition {
  key: CelestialBodyKey;
  name: string;
  symbol: string;
  bodyName?: string;
}

export const CELESTIAL_BODIES_LIST: BodyDefinition[] = [
  { key: 'sun', name: 'Sol', symbol: '☉', bodyName: 'Sun' },
  { key: 'moon', name: 'Luna', symbol: '☽', bodyName: 'Moon' },
  { key: 'mercury', name: 'Mercurio', symbol: '☿', bodyName: 'Mercury' },
  { key: 'venus', name: 'Venus', symbol: '♀', bodyName: 'Venus' },
  { key: 'mars', name: 'Marte', symbol: '♂', bodyName: 'Mars' },
  { key: 'jupiter', name: 'Júpiter', symbol: '♃', bodyName: 'Jupiter' },
  { key: 'saturn', name: 'Saturno', symbol: '♄', bodyName: 'Saturn' },
  { key: 'uranus', name: 'Urano', symbol: '♅', bodyName: 'Uranus' },
  { key: 'neptune', name: 'Neptuno', symbol: '♆', bodyName: 'Neptune' },
  { key: 'pluto', name: 'Plutón', symbol: '♇', bodyName: 'Pluto' },
  { key: 'north_node', name: 'Nodo Norte verdadero', symbol: '☊' },
  { key: 'south_node', name: 'Nodo Sur', symbol: '☋' },
];

/**
 * Calculates high-accuracy True Lunar Node ecliptic longitude.
 */
function getTrueNorthNodeLongitude(date: Date): { longitude: number; speed: number } {
  const Astronomy = getAstronomy();
  const time = Astronomy.MakeTime(date);
  const T = (time.ut - 2451545.0) / 36525.0;

  // Mean node
  let omega = 125.0445550 - 1934.1361849 * T + 0.0020754 * T * T + 0.000002139 * T * T * T;
  omega = normalize360(omega);

  // Solar and lunar mean anomalies for true node periodic terms
  const M = normalize360(357.5291092 + 35999.0502909 * T);
  const M_moon = normalize360(134.9633964 + 477198.8675055 * T);
  const F = normalize360(93.2720950 + 483202.0175233 * T);
  const D = normalize360(297.8501921 + 445267.1114034 * T);

  const rad = Math.PI / 180;
  // Periodic correction terms for True Node
  const trueNode = omega
    - 1.4979 * Math.sin((2 * (F - D)) * rad)
    - 0.1500 * Math.sin(M * rad)
    - 0.1226 * Math.sin((2 * F) * rad)
    + 0.1176 * Math.sin((2 * D) * rad)
    - 0.0801 * Math.sin((2 * (F + M_moon - D)) * rad);

  const normTrueNode = normalize360(trueNode);

  // Speed calculation via 1 hour difference
  const dtHours = 1;
  const date2 = new Date(date.getTime() + dtHours * 3600 * 1000);
  const time2 = Astronomy.MakeTime(date2);
  const T2 = (time2.ut - 2451545.0) / 36525.0;
  let omega2 = 125.0445550 - 1934.1361849 * T2 + 0.0020754 * T2 * T2;
  const M2 = normalize360(357.5291092 + 35999.0502909 * T2);
  const M_moon2 = normalize360(134.9633964 + 477198.8675055 * T2);
  const F2 = normalize360(93.2720950 + 483202.0175233 * T2);
  const D2 = normalize360(297.8501921 + 445267.1114034 * T2);
  const trueNode2 = omega2
    - 1.4979 * Math.sin((2 * (F2 - D2)) * rad)
    - 0.1500 * Math.sin(M2 * rad)
    - 0.1226 * Math.sin((2 * F2) * rad)
    + 0.1176 * Math.sin((2 * D2) * rad)
    - 0.0801 * Math.sin((2 * (F2 + M_moon2 - D2)) * rad);

  let diff = normalize360(trueNode2) - normTrueNode;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  const speed = diff * (24 / dtHours);

  return { longitude: normTrueNode, speed };
}

/**
 * Calculates longitude and speed in degrees/day for a standard celestial body.
 */
function getBodyLongitudeAndSpeed(body: AstronomyImport.Body, date: Date): { longitude: number; speed: number } {
  const Astronomy = getAstronomy();
  // Primary position at date
  const geoVec0 = Astronomy.GeoVector(body, date, true);
  const ecl0 = Astronomy.Ecliptic(geoVec0);
  const lon0 = normalize360(ecl0.elon);

  // Position at date + 1 hour for speed determination
  const dtHours = 1;
  const date1 = new Date(date.getTime() + dtHours * 3600 * 1000);
  const geoVec1 = Astronomy.GeoVector(body, date1, true);
  const ecl1 = Astronomy.Ecliptic(geoVec1);
  const lon1 = normalize360(ecl1.elon);

  let diff = lon1 - lon0;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;

  const speed = diff * (24 / dtHours); // deg / day
  return { longitude: lon0, speed };
}

/**
 * Computes planetary positions for all 12 celestial bodies.
 */
export function calculateAllCelestialBodies(utcDate: Date): Map<CelestialBodyKey, { longitude: number; speed: number; motion: MotionState }> {
  const Astronomy = getAstronomy();
  const result = new Map<CelestialBodyKey, { longitude: number; speed: number; motion: MotionState }>();

  // 1. Standard planets
  for (const item of CELESTIAL_BODIES_LIST) {
    if (item.bodyName && (Astronomy.Body as any)[item.bodyName] !== undefined) {
      const astroBody = (Astronomy.Body as any)[item.bodyName];
      const { longitude, speed } = getBodyLongitudeAndSpeed(astroBody, utcDate);
      let motion: MotionState = 'Directo';
      if (speed < -0.0001) {
        motion = 'Retrógrado';
      } else if (Math.abs(speed) < 0.005) {
        motion = 'Estacionario';
      }
      result.set(item.key, { longitude, speed, motion });
    }
  }

  // 2. True North Node
  const northNodeData = getTrueNorthNodeLongitude(utcDate);
  let northNodeMotion: MotionState = 'Retrógrado';
  if (northNodeData.speed > 0.0001) {
    northNodeMotion = 'Directo';
  } else if (Math.abs(northNodeData.speed) < 0.005) {
    northNodeMotion = 'Estacionario';
  }
  result.set('north_node', {
    longitude: northNodeData.longitude,
    speed: northNodeData.speed,
    motion: northNodeMotion,
  });

  // 3. South Node (exact opposite of True North Node)
  const southNodeLon = normalize360(northNodeData.longitude + 180);
  result.set('south_node', {
    longitude: southNodeLon,
    speed: northNodeData.speed,
    motion: northNodeMotion,
  });

  return result;
}
