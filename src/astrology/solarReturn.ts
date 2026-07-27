import { DateTime } from 'luxon';
import type {
  CalculationRequest,
  InterChartAspect,
  SolarReturnRequest,
  SolarReturnResponse,
} from '../types.js';
import { calculateNatalChart } from './calculator.js';
import { isLongitudeInHouse } from './utils.js';
import { getAstronomy } from './engine.js';

/**
 * Calculates the exact Sun ecliptic longitude at any JS Date.
 */
function getSunLongitude(date: Date): number {
  const Astronomy = getAstronomy();
  const geoVec = Astronomy.GeoVector(Astronomy.Body.Sun, date, true);
  const ecl = Astronomy.Ecliptic(geoVec);
  return ecl.elon;
}

/**
 * High-precision numerical solver (Bisection + Secant) to find the exact UTC Date
 * when the transiting Sun returns to natalSunLon in targetYear.
 */
export function findExactSolarReturnDate(natalSunLon: number, birthDateStr: string, targetYear: number): Date {
  const birthDt = DateTime.fromISO(birthDateStr);
  const approxMonth = birthDt.isValid ? birthDt.month : 7;
  const approxDay = birthDt.isValid ? birthDt.day : 22;

  let tLow = DateTime.fromObject({ year: targetYear, month: approxMonth, day: approxDay }, { zone: 'utc' })
    .minus({ days: 2 })
    .toJSDate()
    .getTime();

  let tHigh = DateTime.fromObject({ year: targetYear, month: approxMonth, day: approxDay }, { zone: 'utc' })
    .plus({ days: 2 })
    .toJSDate()
    .getTime();

  const angleDiff = (target: number, current: number) => {
    let d = (target - current) % 360;
    if (d > 180) d -= 360;
    if (d < -180) d += 360;
    return d;
  };

  for (let i = 0; i < 30; i++) {
    const tMid = (tLow + tHigh) / 2;
    const currentSun = getSunLongitude(new Date(tMid));
    const diff = angleDiff(natalSunLon, currentSun);

    if (Math.abs(diff) < 0.000001) {
      return new Date(tMid);
    }

    if (diff > 0) {
      tLow = tMid;
    } else {
      tHigh = tMid;
    }
  }

  return new Date((tLow + tHigh) / 2);
}

/**
 * Calculates complete Solar Return Chart and overlay with Natal Chart.
 */
export function calculateSolarReturn(request: SolarReturnRequest): SolarReturnResponse {
  // 1. Base Natal Chart
  const natalChart = calculateNatalChart(request.natalRequest);

  // Find Natal Sun
  const natalSun = natalChart.planets.find((p) => p.key === 'sun');
  const natalSunLon = natalSun ? natalSun.absoluteLongitude : 120.0;

  // 2. Target Year
  const targetYear = request.targetYear || DateTime.now().year;

  // 3. Find exact Solar Return UTC Date
  const returnUtcDate = findExactSolarReturnDate(
    natalSunLon,
    request.natalRequest.dateStr,
    targetYear
  );

  // 4. Return Location
  const returnLat = request.returnLatitude ?? request.natalRequest.latitude;
  const returnLng = request.returnLongitude ?? request.natalRequest.longitude;
  const returnLocName = request.returnLocationName || request.natalRequest.locationName;

  const returnUtcDt = DateTime.fromJSDate(returnUtcDate, { zone: 'utc' });
  const returnDateStr = returnUtcDt.toISODate() || '2026-07-22';
  const returnTimeStr = returnUtcDt.toFormat('HH:mm:ss');

  const solarReturnCalcReq: CalculationRequest = {
    name: `${request.natalRequest.name} (Rev. Solar ${targetYear})`,
    dateStr: returnDateStr,
    timeStr: returnTimeStr.slice(0, 5),
    locationName: returnLocName,
    latitude: returnLat,
    longitude: returnLng,
    houseSystem: request.natalRequest.houseSystem || 'placidus',
  };

  const solarReturnChart = calculateNatalChart(solarReturnCalcReq);

  // 5. Determine Solar Return Ascendant and Midheaven placement in Natal Houses
  const srAsc = solarReturnChart.angles.find((a) => a.key === 'ascendant');
  const srMc = solarReturnChart.angles.find((a) => a.key === 'midheaven');

  let solarReturnAscInNatalHouse = 1;
  let solarReturnMcInNatalHouse = 10;

  if (srAsc) {
    for (let h = 0; h < 12; h++) {
      const cuspStart = natalChart.houseCusps[h].absoluteLongitude;
      const cuspEnd = natalChart.houseCusps[(h + 1) % 12].absoluteLongitude;
      if (isLongitudeInHouse(srAsc.absoluteLongitude, cuspStart, cuspEnd)) {
        solarReturnAscInNatalHouse = h + 1;
        break;
      }
    }
  }

  if (srMc) {
    for (let h = 0; h < 12; h++) {
      const cuspStart = natalChart.houseCusps[h].absoluteLongitude;
      const cuspEnd = natalChart.houseCusps[(h + 1) % 12].absoluteLongitude;
      if (isLongitudeInHouse(srMc.absoluteLongitude, cuspStart, cuspEnd)) {
        solarReturnMcInNatalHouse = h + 1;
        break;
      }
    }
  }

  // 6. Inter-chart Aspects (Solar Return Planet -> Natal Planet)
  const interAspects: InterChartAspect[] = [];
  const ASPECT_DEFS = [
    { aspect: 'Conjunción', aspectSymbol: '☌', angle: 0 },
    { aspect: 'Sextil', aspectSymbol: '⚹', angle: 60 },
    { aspect: 'Cuadratura', aspectSymbol: '□', angle: 90 },
    { aspect: 'Trígono', aspectSymbol: '△', angle: 120 },
    { aspect: 'Oposición', aspectSymbol: '☍', angle: 180 },
  ];

  for (const srp of solarReturnChart.planets) {
    for (const np of natalChart.planets) {
      let diff = Math.abs(srp.absoluteLongitude - np.absoluteLongitude);
      if (diff > 180) diff = 360 - diff;

      for (const def of ASPECT_DEFS) {
        const orb = Math.abs(diff - def.angle);
        if (orb <= 6) {
          interAspects.push({
            transitBody: srp.name,
            transitSymbol: srp.symbol,
            natalBody: np.name,
            natalSymbol: np.symbol,
            aspect: def.aspect,
            aspectSymbol: def.aspectSymbol,
            exactAngle: def.angle,
            realSeparation: diff,
            orb,
            motionRelation: 'Exacto',
          });
        }
      }
    }
  }

  interAspects.sort((a, b) => a.orb - b.orb);

  return {
    natalChart,
    targetYear,
    exactReturnDateStr: returnDateStr,
    exactReturnTimeStr: returnTimeStr,
    exactReturnUtcDate: returnUtcDt.toISO() || '',
    solarReturnChart,
    solarReturnAscInNatalHouse,
    solarReturnMcInNatalHouse,
    interAspects,
  };
}
