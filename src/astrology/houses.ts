import { HouseSystem } from '../types';
import { normalize360 } from './utils';
import { getAstronomy } from './engine';

export interface AnglesResult {
  ascendant: number;
  descendant: number;
  midheaven: number;
  ic: number;
  ramc: number;
  obliquity: number;
}

export class PlacidusPolarError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PlacidusPolarError';
  }
}

/**
 * Calculates fundamental astronomical angles (MC, ASC, IC, DSC, RAMC, Obliquity)
 * for a given UTC Date and geographic coordinates.
 */
export function calculateAngles(utcDate: Date, lat: number, lng: number): AnglesResult {
  const Astronomy = getAstronomy();
  const time = Astronomy.MakeTime(utcDate);

  // 1. Obliquity of ecliptic (eps)
  const observer = new Astronomy.Observer(lat, lng, 0);
  const ecl = Astronomy.Ecliptic(Astronomy.GeoVector(Astronomy.Body.Sun, utcDate, true));
  // Mean obliquity of ecliptic via Julian century T
  const T = (time.ut - 2451545.0) / 36525.0;
  const epsDeg = 23.4392911 - (46.8150 * T + 0.00059 * T * T - 0.001813 * T * T * T) / 3600.0;
  const rad = Math.PI / 180;
  const epsRad = epsDeg * rad;

  // 2. Greenwich Sidereal Time -> RAMC
  const gstHours = Astronomy.SiderealTime(time);
  const ramc = normalize360(gstHours * 15.0 + lng);
  const ramcRad = ramc * rad;
  const latRad = lat * rad;

  // 3. Midheaven (MC)
  // tan(MC) = tan(RAMC) / cos(eps)
  const mcRad = Math.atan2(Math.sin(ramcRad), Math.cos(ramcRad) * Math.cos(epsRad));
  const midheaven = normalize360(mcRad / rad);

  // 4. Ascendant (ASC)
  // tan(ASC) = cos(RAMC) / (-sin(RAMC)*cos(eps) - tan(lat)*sin(eps))
  const denom = -Math.sin(ramcRad) * Math.cos(epsRad) - Math.tan(latRad) * Math.sin(epsRad);
  const ascRad = Math.atan2(Math.cos(ramcRad), denom);
  const ascendant = normalize360(ascRad / rad);

  // 5. Descendant (DSC) & IC
  const descendant = normalize360(ascendant + 180);
  const ic = normalize360(midheaven + 180);

  return {
    ascendant,
    descendant,
    midheaven,
    ic,
    ramc,
    obliquity: epsDeg,
  };
}

/**
 * Iterative Placidus cusp solver for an oblique ascension angle.
 */
function solvePlacidusCusp(
  targetBaseRA: number,
  fraction: number,
  latRad: number,
  epsRad: number,
  isDiurnal: boolean
): number {
  const rad = Math.PI / 180;
  let L = normalize360(targetBaseRA + fraction * 30);

  for (let iter = 0; iter < 50; iter++) {
    const Lrad = L * rad;
    let ra = normalize360(Math.atan2(Math.sin(Lrad) * Math.cos(epsRad), Math.cos(Lrad)) / rad);

    let raDiff = ra - targetBaseRA;
    while (raDiff < -180) raDiff += 360;
    while (raDiff > 180) raDiff -= 360;
    const actualRA = targetBaseRA + raDiff;

    const sinDec = Math.sin(Lrad) * Math.sin(epsRad);
    const dec = Math.asin(Math.min(1, Math.max(-1, sinDec)));

    const tanLatTanDec = Math.tan(latRad) * Math.tan(dec);
    if (Math.abs(tanLatTanDec) >= 1) {
      throw new PlacidusPolarError('Placidus semi-arc undefined at this latitude/declination combination (polar limit reached).');
    }

    const subArc = Math.asin(Math.min(1, Math.max(-1, tanLatTanDec))) / rad;
    const semiArc = isDiurnal ? (90 + subArc) : (90 - subArc);

    const targetRA = targetBaseRA + fraction * semiArc;
    const err = actualRA - targetRA;

    L = normalize360(L - err * 0.5);
    if (Math.abs(err) < 1e-6) {
      break;
    }
  }

  return L;
}

/**
 * Calculates the 12 house cusps for the selected house system.
 */
export function calculateHouseCusps(
  system: HouseSystem,
  angles: AnglesResult,
  lat: number
): number[] {
  const { ascendant, descendant, midheaven, ic, ramc, obliquity } = angles;
  const rad = Math.PI / 180;
  const latRad = lat * rad;
  const epsRad = obliquity * rad;
  const ramcRad = ramc * rad;

  const cusps: number[] = new Array(12);

  switch (system) {
    case 'placidus': {
      // Check polar limit
      if (Math.abs(lat) >= 66.5) {
        throw new PlacidusPolarError(`Placidus no se puede calcular en latitudes polares (latitud actual: ${lat.toFixed(2)}°).`);
      }

      cusps[0] = ascendant; // Cusp 1
      cusps[3] = ic;        // Cusp 4
      cusps[6] = descendant;// Cusp 7
      cusps[9] = midheaven; // Cusp 10

      try {
        // Cusp 11: 1/3 diurnal semi-arc from MC (RAMC)
        cusps[10] = solvePlacidusCusp(ramc, 1 / 3, latRad, epsRad, true);
        // Cusp 12: 2/3 diurnal semi-arc from MC (RAMC)
        cusps[11] = solvePlacidusCusp(ramc, 2 / 3, latRad, epsRad, true);

        // Cusp 2: 1/3 nocturnal semi-arc from ASC (RAMC + 90°)
        cusps[1] = solvePlacidusCusp(normalize360(ramc + 90), 1 / 3, latRad, epsRad, false);
        // Cusp 3: 2/3 nocturnal semi-arc from ASC (RAMC + 90°)
        cusps[2] = solvePlacidusCusp(normalize360(ramc + 90), 2 / 3, latRad, epsRad, false);

        // Opposite houses
        cusps[4] = normalize360(cusps[10] + 180); // Cusp 5 (opposite Cusp 11)
        cusps[5] = normalize360(cusps[11] + 180); // Cusp 6 (opposite Cusp 12)
        cusps[7] = normalize360(cusps[1] + 180);  // Cusp 8 (opposite Cusp 2)
        cusps[8] = normalize360(cusps[2] + 180);  // Cusp 9 (opposite Cusp 3)
      } catch (e) {
        if (e instanceof PlacidusPolarError) {
          throw e;
        }
        // Fallback to Porphyry if numerical divergence occurs
        throw new PlacidusPolarError('Error de convergencia matemática en el cálculo de Placidus.');
      }
      break;
    }

    case 'equal': {
      // Equal Houses: Cusp 1 = ASC, Cusp i = ASC + (i-1)*30
      for (let i = 0; i < 12; i++) {
        cusps[i] = normalize360(ascendant + i * 30);
      }
      break;
    }

    case 'whole_sign': {
      // Whole Sign: Sign of ASC is House 1 starting at 0° of that sign
      const ascSignIdx = Math.floor(ascendant / 30);
      for (let i = 0; i < 12; i++) {
        cusps[i] = normalize360(((ascSignIdx + i) % 12) * 30);
      }
      break;
    }

    case 'porphyry': {
      // Porphyry: Trisect the 4 quadrants (ASC -> IC -> DSC -> MC -> ASC)
      const q1 = normalize360(ic - ascendant) / 3;
      cusps[0] = ascendant;
      cusps[1] = normalize360(ascendant + q1);
      cusps[2] = normalize360(ascendant + 2 * q1);

      cusps[3] = ic;
      const q2 = normalize360(descendant - ic) / 3;
      cusps[4] = normalize360(ic + q2);
      cusps[5] = normalize360(ic + 2 * q2);

      cusps[6] = descendant;
      const q3 = normalize360(midheaven - descendant) / 3;
      cusps[7] = normalize360(descendant + q3);
      cusps[8] = normalize360(descendant + 2 * q3);

      cusps[9] = midheaven;
      const q4 = normalize360(ascendant - midheaven) / 3;
      cusps[10] = normalize360(midheaven + q4);
      cusps[11] = normalize360(midheaven + 2 * q4);
      break;
    }

    case 'koch': {
      // Koch (G.B.D.) house system
      cusps[0] = ascendant;
      cusps[3] = ic;
      cusps[6] = descendant;
      cusps[9] = midheaven;

      // Koch pole calculation
      const sinMcDec = Math.sin(midheaven * rad) * Math.sin(epsRad);
      const mcDec = Math.asin(Math.min(1, Math.max(-1, sinMcDec)));
      const tanLatTanMcDec = Math.tan(latRad) * Math.tan(mcDec);

      if (Math.abs(tanLatTanMcDec) >= 1) {
        // Fallback to Porphyry in polar region
        return calculateHouseCusps('porphyry', angles, lat);
      }

      const mcArc = Math.acos(-tanLatTanMcDec) / rad;

      const offsets = [30, 60, 120, 150];
      const kochCusps: number[] = [];

      for (const off of offsets) {
        const H = ramc + off;
        const dH = H - ramc;
        const phiK = Math.atan(Math.tan(latRad) * (dH / 90.0));
        const num = Math.sin(H * rad);
        const den = Math.cos(H * rad) * Math.cos(epsRad) - Math.tan(phiK) * Math.sin(epsRad);
        const cuspLon = normalize360(Math.atan2(num, den) / rad);
        kochCusps.push(cuspLon);
      }

      cusps[10] = kochCusps[0]; // Cusp 11
      cusps[11] = kochCusps[1]; // Cusp 12
      cusps[1] = kochCusps[2];  // Cusp 2
      cusps[2] = kochCusps[3];  // Cusp 3

      cusps[4] = normalize360(cusps[10] + 180);
      cusps[5] = normalize360(cusps[11] + 180);
      cusps[7] = normalize360(cusps[1] + 180);
      cusps[8] = normalize360(cusps[2] + 180);
      break;
    }

    case 'regiomontanus': {
      cusps[0] = ascendant;
      cusps[3] = ic;
      cusps[6] = descendant;
      cusps[9] = midheaven;

      const anglesReg = [30, 60, 120, 150];
      const regCusps: number[] = [];

      for (const A of anglesReg) {
        const Arad = A * rad;
        const tanR = Math.tan(latRad) * Math.sin(Arad);
        const pole = Math.atan(tanR);
        const H = ramc + A;
        const Hrad = H * rad;
        const num = Math.sin(Hrad);
        const den = Math.cos(Hrad) * Math.cos(epsRad) - Math.tan(pole) * Math.sin(epsRad);
        regCusps.push(normalize360(Math.atan2(num, den) / rad));
      }

      cusps[10] = regCusps[0]; // Cusp 11
      cusps[11] = regCusps[1]; // Cusp 12
      cusps[1] = regCusps[2];  // Cusp 2
      cusps[2] = regCusps[3];  // Cusp 3

      cusps[4] = normalize360(cusps[10] + 180);
      cusps[5] = normalize360(cusps[11] + 180);
      cusps[7] = normalize360(cusps[1] + 180);
      cusps[8] = normalize360(cusps[2] + 180);
      break;
    }

    case 'campanus': {
      cusps[0] = ascendant;
      cusps[3] = ic;
      cusps[6] = descendant;
      cusps[9] = midheaven;

      const anglesCamp = [30, 60, 120, 150];
      const campCusps: number[] = [];

      for (const A of anglesCamp) {
        const Arad = A * rad;
        const pole = Math.atan(Math.tan(latRad) * Math.sin(Arad));
        const H = ramc + (A >= 90 ? A : A);
        const Hrad = H * rad;
        const num = Math.sin(Hrad) * Math.cos(pole);
        const den = Math.cos(Hrad) * Math.cos(epsRad) - Math.sin(pole) * Math.sin(epsRad);
        campCusps.push(normalize360(Math.atan2(num, den) / rad));
      }

      cusps[10] = campCusps[0];
      cusps[11] = campCusps[1];
      cusps[1] = campCusps[2];
      cusps[2] = campCusps[3];

      cusps[4] = normalize360(cusps[10] + 180);
      cusps[5] = normalize360(cusps[11] + 180);
      cusps[7] = normalize360(cusps[1] + 180);
      cusps[8] = normalize360(cusps[2] + 180);
      break;
    }

    case 'alcabitius': {
      cusps[0] = ascendant;
      cusps[3] = ic;
      cusps[6] = descendant;
      cusps[9] = midheaven;

      // Right ascension of ASC
      const ascRad = ascendant * rad;
      const raAsc = Math.atan2(Math.sin(ascRad) * Math.cos(epsRad), Math.cos(ascRad)) / rad;
      let da = normalize360(raAsc - ramc);

      const d1 = da / 3;
      const d2 = (2 * da) / 3;

      const calculateAlcabitiusCusp = (raTarget: number) => {
        const raRad = raTarget * rad;
        const num = Math.sin(raRad);
        const den = Math.cos(raRad) * Math.cos(epsRad) - Math.tan(latRad) * Math.sin(epsRad);
        return normalize360(Math.atan2(num, den) / rad);
      };

      cusps[10] = calculateAlcabitiusCusp(ramc + d1); // Cusp 11
      cusps[11] = calculateAlcabitiusCusp(ramc + d2); // Cusp 12
      cusps[1] = calculateAlcabitiusCusp(raAsc + d1);  // Cusp 2
      cusps[2] = calculateAlcabitiusCusp(raAsc + d2);  // Cusp 3

      cusps[4] = normalize360(cusps[10] + 180);
      cusps[5] = normalize360(cusps[11] + 180);
      cusps[7] = normalize360(cusps[1] + 180);
      cusps[8] = normalize360(cusps[2] + 180);
      break;
    }

    case 'topocentric': {
      cusps[0] = ascendant;
      cusps[3] = ic;
      cusps[6] = descendant;
      cusps[9] = midheaven;

      // Polich-Page topocentric formulas
      const P11 = Math.atan(Math.tan(latRad) / 3.0);
      const P12 = Math.atan((2.0 * Math.tan(latRad)) / 3.0);

      const top11H = (ramc + 30) * rad;
      cusps[10] = normalize360(Math.atan2(Math.sin(top11H), Math.cos(top11H) * Math.cos(epsRad) - Math.tan(P11) * Math.sin(epsRad)) / rad);

      const top12H = (ramc + 60) * rad;
      cusps[11] = normalize360(Math.atan2(Math.sin(top12H), Math.cos(top12H) * Math.cos(epsRad) - Math.tan(P12) * Math.sin(epsRad)) / rad);

      const top2H = (ramc + 120) * rad;
      cusps[1] = normalize360(Math.atan2(Math.sin(top2H), Math.cos(top2H) * Math.cos(epsRad) - Math.tan(P12) * Math.sin(epsRad)) / rad);

      const top3H = (ramc + 150) * rad;
      cusps[2] = normalize360(Math.atan2(Math.sin(top3H), Math.cos(top3H) * Math.cos(epsRad) - Math.tan(P11) * Math.sin(epsRad)) / rad);

      cusps[4] = normalize360(cusps[10] + 180);
      cusps[5] = normalize360(cusps[11] + 180);
      cusps[7] = normalize360(cusps[1] + 180);
      cusps[8] = normalize360(cusps[2] + 180);
      break;
    }

    default: {
      return calculateHouseCusps('placidus', angles, lat);
    }
  }

  return cusps;
}
