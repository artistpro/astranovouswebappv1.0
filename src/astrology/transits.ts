import { DateTime } from 'luxon';
import { find as findTimeZone } from 'geo-tz';
import type {
  CalculationRequest,
  InterChartAspect,
  TransitRequest,
  TransitResponse,
} from '../types.js';
import { DEFAULT_ORBS } from '../types.js';
import { calculateNatalChart } from './calculator.js';
import { isLongitudeInHouse } from './utils.js';

// Standard aspect angles & symbols
const ASPECT_DEFINITIONS = [
  { aspect: 'Conjunción', aspectSymbol: '☌', angle: 0 },
  { aspect: 'Sextil', aspectSymbol: '⚹', angle: 60 },
  { aspect: 'Cuadratura', aspectSymbol: '□', angle: 90 },
  { aspect: 'Trígono', aspectSymbol: '△', angle: 120 },
  { aspect: 'Oposición', aspectSymbol: '☍', angle: 180 },
];

/**
 * Calculates transit positions and transit-to-natal cross aspects.
 */
export function calculateTransits(request: TransitRequest): TransitResponse {
  // 1. Calculate base Natal Chart
  const natalChart = calculateNatalChart(request.natalRequest);

  // 2. Resolve Transit Date/Time
  const dateStr = request.transitDateStr || DateTime.now().toISODate() || '2026-07-27';
  const timeStr = request.transitTimeStr || '12:00';

  const lat = request.transitLatitude ?? request.natalRequest.latitude;
  const lng = request.transitLongitude ?? request.natalRequest.longitude;

  let ianaZone = 'UTC';
  try {
    const tzList = findTimeZone(lat, lng);
    if (tzList && tzList.length > 0) {
      ianaZone = tzList[0];
    }
  } catch (e) {
    ianaZone = 'UTC';
  }

  const localDt = DateTime.fromISO(`${dateStr}T${timeStr}:00`, { zone: ianaZone });
  const utcDt = localDt.isValid ? localDt.toUTC() : DateTime.now().toUTC();

  // Build Transit Calculation Request to format all transit planets properly
  const transitCalcReq: CalculationRequest = {
    name: `Tránsitos (${dateStr})`,
    dateStr,
    timeStr,
    locationName: request.transitLocationName || request.natalRequest.locationName,
    latitude: lat,
    longitude: lng,
    houseSystem: request.natalRequest.houseSystem || 'placidus',
  };

  const transitChart = calculateNatalChart(transitCalcReq);
  const transitPlanets = transitChart.planets;

  // 3. Calculate Transit Planets in Natal Houses
  const transitHouseOccupations = transitPlanets.map((tp) => {
    let houseInNatal = 1;
    for (let h = 0; h < 12; h++) {
      const cuspStart = natalChart.houseCusps[h].absoluteLongitude;
      const cuspEnd = natalChart.houseCusps[(h + 1) % 12].absoluteLongitude;
      if (isLongitudeInHouse(tp.absoluteLongitude, cuspStart, cuspEnd)) {
        houseInNatal = h + 1;
        break;
      }
    }
    return {
      transitBody: tp.name,
      houseInNatal,
    };
  });

  // 4. Calculate Inter-Chart Aspects (Transit Planet -> Natal Planet & Angle)
  const interAspects: InterChartAspect[] = [];

  const natalTargets: { name: string; symbol: string; lon: number }[] = [
    ...natalChart.planets.map((p) => ({ name: p.name, symbol: p.symbol, lon: p.absoluteLongitude })),
    ...natalChart.angles.map((a) => ({ name: a.name, symbol: a.abbreviation, lon: a.absoluteLongitude })),
  ];

  for (const tp of transitPlanets) {
    for (const target of natalTargets) {
      let diff = Math.abs(tp.absoluteLongitude - target.lon);
      if (diff > 180) diff = 360 - diff;

      for (const def of ASPECT_DEFINITIONS) {
        const orb = Math.abs(diff - def.angle);
        const maxOrb = DEFAULT_ORBS[def.aspect] || 6;

        if (orb <= maxOrb) {
          const isApplying = tp.speed > 0 ? tp.absoluteLongitude < target.lon : tp.absoluteLongitude > target.lon;

          interAspects.push({
            transitBody: tp.name,
            transitSymbol: tp.symbol,
            natalBody: target.name,
            natalSymbol: target.symbol,
            aspect: def.aspect,
            aspectSymbol: def.aspectSymbol,
            exactAngle: def.angle,
            realSeparation: diff,
            orb,
            motionRelation: isApplying ? 'Aplicativo' : 'Separativo',
          });
        }
      }
    }
  }

  interAspects.sort((a, b) => a.orb - b.orb);

  return {
    natalChart,
    transitDateStr: dateStr,
    transitTimeStr: timeStr,
    transitUtcDate: utcDt.toISO() || '',
    transitPlanets,
    transitHouseOccupations,
    interAspects,
  };
}
