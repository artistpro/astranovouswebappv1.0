import {
  AngleData,
  AspectResult,
  HouseCusp,
  PlanetPosition,
  ValidationCheck,
  ValidationResult,
} from '../types';
import { angularDistance, getZodiacSign, normalize360 } from './utils';

export function runAutomatedValidations(
  planets: PlanetPosition[],
  angles: AngleData[],
  houseCusps: HouseCusp[],
  aspects: AspectResult[],
  placidusError?: string
): ValidationResult {
  const checks: ValidationCheck[] = [];
  let allPassed = true;

  // Check 1: All longitudes between 0° and <360°
  let longitudesValid = true;
  for (const p of planets) {
    if (p.absoluteLongitude < 0 || p.absoluteLongitude >= 360) longitudesValid = false;
  }
  for (const a of angles) {
    if (a.absoluteLongitude < 0 || a.absoluteLongitude >= 360) longitudesValid = false;
  }
  for (const h of houseCusps) {
    if (h.absoluteLongitude < 0 || h.absoluteLongitude >= 360) longitudesValid = false;
  }
  checks.push({
    description: 'Longitudes absolutas en rango [0°, 360°)',
    passed: longitudesValid,
    details: longitudesValid ? 'Todas las longitudes planetarias, de ángulos y cúspides están estrictamente en el intervalo [0°, 360°).' : 'Alguna longitud se encuentra fuera del rango [0°, 360°).',
  });
  if (!longitudesValid) allPassed = false;

  // Check 2: All aspect separations between 0° and 180°
  let aspectSeparationsValid = true;
  for (const asp of aspects) {
    if (asp.realSeparation < 0 || asp.realSeparation > 180) {
      aspectSeparationsValid = false;
    }
  }
  checks.push({
    description: 'Separación angular de aspectos entre 0° y 180°',
    passed: aspectSeparationsValid,
    details: aspectSeparationsValid ? 'Todas las separaciones angulares reales se encuentran en el rango astronómico [0°, 180°].' : 'Se detectó una separación angular fuera del rango [0°, 180°].',
  });
  if (!aspectSeparationsValid) allPassed = false;

  // Check 3: Exactly 12 house cusps present
  const has12Cusps = houseCusps.length === 12;
  checks.push({
    description: 'Existencia de exactamente 12 cúspides de casas',
    passed: has12Cusps && !placidusError,
    details: placidusError ? `Error de cálculo de casas: ${placidusError}` : `Se generaron exactamente ${houseCusps.length} cúspides válidas.`,
  });
  if (!has12Cusps || placidusError) allPassed = false;

  // Check 4: Descendant is ~180° from Ascendant
  const asc = angles.find(a => a.key === 'ascendant')?.absoluteLongitude ?? 0;
  const dsc = angles.find(a => a.key === 'descendant')?.absoluteLongitude ?? 0;
  const ascDscDiff = angularDistance(asc, dsc);
  const ascDscOpposite = Math.abs(ascDscDiff - 180) < 0.001;
  checks.push({
    description: 'Descendente en punto exactamente opuesto al Ascendente (180°)',
    passed: ascDscOpposite,
    details: `Diferencia angular ASC-DSC: ${ascDscDiff.toFixed(6)}° (Tolerancia < 0.001°).`,
  });
  if (!ascDscOpposite) allPassed = false;

  // Check 5: IC is ~180° from Midheaven
  const mc = angles.find(a => a.key === 'midheaven')?.absoluteLongitude ?? 0;
  const ic = angles.find(a => a.key === 'ic')?.absoluteLongitude ?? 0;
  const mcIcDiff = angularDistance(mc, ic);
  const mcIcOpposite = Math.abs(mcIcDiff - 180) < 0.001;
  checks.push({
    description: 'Fondo del Cielo (IC) en punto exactamente opuesto al Medio Cielo (MC) (180°)',
    passed: mcIcOpposite,
    details: `Diferencia angular MC-IC: ${mcIcDiff.toFixed(6)}° (Tolerancia < 0.001°).`,
  });
  if (!mcIcOpposite) allPassed = false;

  // Check 6: South Node is ~180° from North Node
  const northNode = planets.find(p => p.key === 'north_node')?.absoluteLongitude ?? 0;
  const southNode = planets.find(p => p.key === 'south_node')?.absoluteLongitude ?? 0;
  const nodeDiff = angularDistance(northNode, southNode);
  const nodeOpposite = Math.abs(nodeDiff - 180) < 0.001;
  checks.push({
    description: 'Nodo Sur en punto exactamente opuesto al Nodo Norte (180°)',
    passed: nodeOpposite,
    details: `Diferencia angular Nodo Norte - Nodo Sur: ${nodeDiff.toFixed(6)}° (Tolerancia < 0.001°).`,
  });
  if (!nodeOpposite) allPassed = false;

  // Check 7: Every planet belongs to exactly 1 house (house in 1..12)
  let houseAssignmentValid = true;
  for (const p of planets) {
    if (!p.house || p.house < 1 || p.house > 12) {
      houseAssignmentValid = false;
    }
  }
  checks.push({
    description: 'Asignación unívoca de cada cuerpo celeste a una casa (1 a 12)',
    passed: houseAssignmentValid,
    details: houseAssignmentValid ? 'Todos los 12 cuerpos celestes fueron asignados correctamente a una única casa.' : 'Algún cuerpo celeste no fue asignado a ninguna casa o número inválido.',
  });
  if (!houseAssignmentValid) allPassed = false;

  // Check 8: No duplicate aspect pairs
  const aspectPairs = new Set<string>();
  let noDuplicates = true;
  for (const asp of aspects) {
    const pairKey = `${asp.bodyA}_${asp.bodyB}_${asp.aspect}`;
    if (aspectPairs.has(pairKey)) {
      noDuplicates = false;
    }
    aspectPairs.add(pairKey);
  }
  checks.push({
    description: 'Ausencia de aspectos duplicados entre el mismo par de cuerpos',
    passed: noDuplicates,
    details: noDuplicates ? 'No se encontraron registros de aspectos duplicados.' : 'Se detectaron aspectos duplicados.',
  });
  if (!noDuplicates) allPassed = false;

  // Check 9: Signs match absolute longitudes
  let signsValid = true;
  for (const p of planets) {
    const expectedSign = getZodiacSign(p.absoluteLongitude).name;
    if (p.sign !== expectedSign) {
      signsValid = false;
    }
  }
  checks.push({
    description: 'Correspondencia exacta entre signo zodiacal y longitud absoluta',
    passed: signsValid,
    details: signsValid ? 'Los signos de todos los planetas corresponden a su longitud eclíptica absoluta.' : 'Discordancia en correspondencia de signo zodiacal.',
  });
  if (!signsValid) allPassed = false;

  // Check 10: Negative velocity correctly marks Retrograde
  let motionValid = true;
  for (const p of planets) {
    if (p.speed < -0.0001 && p.motion !== 'Retrógrado') {
      motionValid = false;
    }
  }
  checks.push({
    description: 'Marcado de estado retrógrado para velocidades longitudinales negativas',
    passed: motionValid,
    details: motionValid ? 'Las velocidades negativas están identificadas unívocamente como "Retrógrado".' : 'Fallo al clasificar movimiento retrógrado.',
  });
  if (!motionValid) allPassed = false;

  const engineInfo = 'Astronomy Engine v3.0 + Swiss Ephemeris House Calculation Layer (Precisión astronómica VSOP87/JPL)';

  if (!allPassed) {
    console.warn('[Validación Astrológica Error]', {
      checksPassed: checks.filter(c => c.passed).length,
      totalChecks: checks.length,
      placidusError,
    });
  }

  return {
    isPassed: allPassed,
    statusText: allPassed ? 'Validación Correcta' : 'Resultado no validado',
    checks,
    engineInfo,
    placidusError,
  };
}
