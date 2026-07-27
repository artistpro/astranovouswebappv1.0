import * as AstronomyImport from 'astronomy-engine';
const Astronomy: typeof AstronomyImport = (AstronomyImport as any).default?.Body ? (AstronomyImport as any).default : AstronomyImport;
import { find as findTimeZone } from 'geo-tz';
import { DateTime } from 'luxon';
import {
  AngleData,
  CalculationRequest,
  CalculationResponse,
  CelestialBodyKey,
  DEFAULT_ORBS,
  HOUSE_SYSTEMS,
  HouseCusp,
  NormalizedData,
  PlanetPosition,
} from '../types';
import { calculateAspects } from './aspects';
import { CELESTIAL_BODIES_LIST, calculateAllCelestialBodies } from './engine';
import { PlacidusPolarError, calculateAngles, calculateHouseCusps } from './houses';
import { degToDMS, isLongitudeInHouse, normalize360 } from './utils';
import { runAutomatedValidations } from './validation';

export function calculateNatalChart(request: CalculationRequest): CalculationResponse {
  const {
    name,
    dateStr,
    timeStr,
    locationName,
    latitude,
    longitude,
    houseSystem = 'placidus',
    orbs = DEFAULT_ORBS,
  } = request;

  // 1 & 2. Receive date, time, lat/lng
  const lat = Math.max(-90, Math.min(90, latitude));
  const lng = Math.max(-180, Math.min(180, longitude));

  // 3. Resolve historical IANA timezone
  let ianaZone = 'UTC';
  try {
    const tzList = findTimeZone(lat, lng);
    if (tzList && tzList.length > 0) {
      ianaZone = tzList[0];
    }
  } catch (e) {
    console.warn('Fallback to UTC for timezone lookup:', e);
    ianaZone = 'UTC';
  }

  // 4. Convert local time to UTC
  const localDt = DateTime.fromISO(`${dateStr}T${timeStr}:00`, { zone: ianaZone });
  const utcDt = localDt.toUTC();
  const utcJSDate = utcDt.toJSDate();

  // Offset format e.g. UTC-3 or UTC+02:00
  const offsetMinutes = localDt.offset;
  const offsetHours = Math.abs(offsetMinutes) / 60;
  const offsetSign = offsetMinutes >= 0 ? '+' : '-';
  const utcOffset = `UTC${offsetSign}${Math.floor(offsetHours).toString().padStart(2, '0')}:${(Math.abs(offsetMinutes) % 60).toString().padStart(2, '0')}`;

  // 5. Calculate Julian Day UT
  const timeObj = Astronomy.MakeTime(utcJSDate);
  const julianDayUT = timeObj.ut;

  // 6 & 7. Calculate planetary positions and velocities
  const rawBodies = calculateAllCelestialBodies(utcJSDate);

  // 8 & 9. Calculate Angles and House Cusps
  const anglesResult = calculateAngles(utcJSDate, lat, lng);

  let rawCusps: number[] = [];
  let placidusErrorMsg: string | undefined;

  try {
    rawCusps = calculateHouseCusps(houseSystem, anglesResult, lat);
  } catch (err) {
    if (err instanceof PlacidusPolarError) {
      placidusErrorMsg = err.message;
      // Fallback cusps for response structure using equal houses so 12 cusps exist
      rawCusps = calculateHouseCusps('equal', anglesResult, lat);
    } else {
      placidusErrorMsg = err instanceof Error ? err.message : 'Error al calcular las casas astrológicas.';
      rawCusps = calculateHouseCusps('equal', anglesResult, lat);
    }
  }

  // Build Angles list
  const formatAngle = (key: 'ascendant' | 'descendant' | 'midheaven' | 'ic', name: string, abbreviation: string, deg: number): AngleData => {
    const dms = degToDMS(deg);
    return {
      key,
      name,
      abbreviation,
      absoluteLongitude: deg,
      sign: dms.sign.name,
      signSymbol: dms.sign.symbol,
      degree: dms.degree,
      minute: dms.minute,
      second: dms.second,
      formattedDMS: dms.formatted,
    };
  };

  const anglesDataList: AngleData[] = [
    formatAngle('ascendant', 'Ascendente', 'ASC', anglesResult.ascendant),
    formatAngle('descendant', 'Descendente', 'DSC', anglesResult.descendant),
    formatAngle('midheaven', 'Medio Cielo', 'MC', anglesResult.midheaven),
    formatAngle('ic', 'Fondo del Cielo', 'IC', anglesResult.ic),
  ];

  // 10. Format House Cusps list
  const houseSystemObj = HOUSE_SYSTEMS.find(s => s.id === houseSystem) || HOUSE_SYSTEMS[0];
  const houseCuspsList: HouseCusp[] = rawCusps.map((cuspDeg, idx) => {
    const dms = degToDMS(cuspDeg);
    return {
      number: idx + 1,
      absoluteLongitude: cuspDeg,
      sign: dms.sign.name,
      signSymbol: dms.sign.symbol,
      degree: dms.degree,
      minute: dms.minute,
      second: dms.second,
      formattedDMS: dms.formatted,
      systemName: houseSystemObj.name,
    };
  });

  // 11. Assign planets to houses handling wrapping across 0° Aries
  const planetPositionsList: PlanetPosition[] = [];

  for (const item of CELESTIAL_BODIES_LIST) {
    const bodyData = rawBodies.get(item.key);
    if (!bodyData) continue;

    const lon = bodyData.longitude;
    const dms = degToDMS(lon);

    // Determine house
    let assignedHouse = 1;

    if (houseSystem === 'whole_sign') {
      // Whole sign house logic:
      // House 1 is the whole sign containing Ascendant.
      const ascSignIdx = Math.floor(anglesResult.ascendant / 30);
      const bodySignIdx = Math.floor(lon / 30);
      assignedHouse = ((bodySignIdx - ascSignIdx + 12) % 12) + 1;
    } else {
      // Standard cusp boundary checking
      for (let h = 0; h < 12; h++) {
        const cuspStart = rawCusps[h];
        const cuspEnd = rawCusps[(h + 1) % 12];
        if (isLongitudeInHouse(lon, cuspStart, cuspEnd)) {
          assignedHouse = h + 1;
          break;
        }
      }
    }

    planetPositionsList.push({
      key: item.key,
      name: item.name,
      symbol: item.symbol,
      absoluteLongitude: lon,
      sign: dms.sign.name,
      signSymbol: dms.sign.symbol,
      degree: dms.degree,
      minute: dms.minute,
      second: dms.second,
      formattedDMS: dms.formatted,
      house: assignedHouse,
      speed: bodyData.speed,
      motion: bodyData.motion,
    });
  }

  // 12 & 13. Calculate Aspects
  const aspectsList = calculateAspects(
    planetPositionsList,
    anglesResult.ascendant,
    anglesResult.midheaven,
    orbs
  );

  // 14. Run automated validations
  const validationResult = runAutomatedValidations(
    planetPositionsList,
    anglesDataList,
    houseCuspsList,
    aspectsList,
    placidusErrorMsg
  );

  // Build Normalized Data
  const normalizedData: NormalizedData = {
    name: name || 'Persona Principal',
    locationName: locationName || 'Ubicación seleccionada',
    latitude: lat,
    longitude: lng,
    ianaZone,
    localTime: `${dateStr} ${timeStr}`,
    utcOffset,
    utcTime: utcDt.toFormat('yyyy-MM-dd HH:mm:ss') + ' UTC',
    julianDayUT,
    houseSystem,
    houseSystemLabel: houseSystemObj.name,
  };

  return {
    normalizedData,
    planets: planetPositionsList,
    angles: anglesDataList,
    houseCusps: houseCuspsList,
    aspects: aspectsList,
    validation: validationResult,
  };
}
