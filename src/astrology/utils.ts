import { ZODIAC_SIGNS, ZodiacSign } from '../types';

/**
 * Normalizes an angle in degrees to the range [0, 360).
 */
export function normalize360(deg: number): number {
  let result = deg % 360;
  if (result < 0) {
    result += 360;
  }
  // Ensure strict [0, 360) upper bound
  if (result >= 360) {
    result = 0;
  }
  return result;
}

/**
 * Finds the zodiac sign corresponding to an absolute longitude [0, 360).
 */
export function getZodiacSign(absoluteLongitude: number): ZodiacSign {
  const norm = normalize360(absoluteLongitude);
  const signIndex = Math.floor(norm / 30);
  return ZODIAC_SIGNS[Math.min(11, Math.max(0, signIndex))];
}

/**
 * Converts absolute longitude (decimal) to Sign, Degree (0-29), Minute (0-59), Second (0-59)
 * and formatted string (e.g., "Acuario 4°12′33″").
 */
export function degToDMS(absoluteLongitude: number): {
  sign: ZodiacSign;
  degree: number;
  minute: number;
  second: number;
  formatted: string;
} {
  const norm = normalize360(absoluteLongitude);
  const sign = getZodiacSign(norm);
  const posInSign = norm - sign.startDeg;

  let deg = Math.floor(posInSign);
  const remMinutes = (posInSign - deg) * 60;
  let min = Math.floor(remMinutes);
  const remSeconds = (remMinutes - min) * 60;
  let sec = Math.round(remSeconds);

  if (sec >= 60) {
    sec = 0;
    min += 1;
  }
  if (min >= 60) {
    min = 0;
    deg += 1;
  }
  if (deg >= 30) {
    deg = 29;
    min = 59;
    sec = 59;
  }

  const secStr = sec.toString().padStart(2, '0');
  const minStr = min.toString().padStart(2, '0');
  const formatted = `${sign.name} ${deg}°${minStr}′${secStr}″`;

  return {
    sign,
    degree: deg,
    minute: min,
    second: sec,
    formatted,
  };
}

/**
 * Determines whether an unrounded absolute longitude falls inside a house cusp interval.
 * Handles interval wrapping across 0° Aries correctly.
 */
export function isLongitudeInHouse(lon: number, cuspStart: number, cuspEnd: number): boolean {
  const normLon = normalize360(lon);
  const normStart = normalize360(cuspStart);
  const normEnd = normalize360(cuspEnd);

  if (normStart < normEnd) {
    return normLon >= normStart && normLon < normEnd;
  } else if (normStart > normEnd) {
    // Crosses 0° Aries (e.g., 337° to 12°)
    return normLon >= normStart || normLon < normEnd;
  } else {
    // Edge case: equal start and end (360° full circle or degenerate)
    return true;
  }
}

/**
 * Calculates shortest angular distance between two longitudes (0 to 180 degrees).
 */
export function angularDistance(lon1: number, lon2: number): number {
  const diff = Math.abs(normalize360(lon1) - normalize360(lon2));
  return diff > 180 ? 360 - diff : diff;
}
