import {
  ASPECT_DEFINITIONS,
  AspectResult,
  AspectType,
  CelestialBodyKey,
  OrbsConfig,
  PlanetPosition,
} from '../types';
import { angularDistance, normalize360 } from './utils';

export function calculateAspects(
  planets: PlanetPosition[],
  ascendantLon: number,
  midheavenLon: number,
  orbsConfig: OrbsConfig
): AspectResult[] {
  const results: AspectResult[] = [];

  // Helper to get allowed orb for an aspect type and target type
  const getMaxOrb = (aspectName: AspectType, isAngle: boolean): number => {
    const config = isAngle ? orbsConfig.planetAngle : orbsConfig.planetPlanet;
    switch (aspectName) {
      case 'Conjunción': return config.conjunction;
      case 'Sextil': return config.sextile;
      case 'Cuadratura': return config.square;
      case 'Trígono': return config.trine;
      case 'Oposición': return config.opposition;
    }
  };

  // Helper to determine if an aspect is applying or separating
  const getMotionRelation = (
    lonA: number,
    speedA: number,
    lonB: number,
    speedB: number,
    targetAngle: number
  ): 'Aplicativo' | 'Separativo' | 'Exacto' => {
    const currentDist = angularDistance(lonA, lonB);
    const currentOrb = Math.abs(currentDist - targetAngle);

    if (currentOrb < 0.001) return 'Exacto';

    // Simulate positions 1 hour in the future (1/24 day)
    const futureLonA = normalize360(lonA + (speedA / 24));
    const futureLonB = normalize360(lonB + (speedB / 24));
    const futureDist = angularDistance(futureLonA, futureLonB);
    const futureOrb = Math.abs(futureDist - targetAngle);

    if (futureOrb < currentOrb - 1e-6) {
      return 'Aplicativo';
    } else if (futureOrb > currentOrb + 1e-6) {
      return 'Separativo';
    } else {
      return 'Exacto';
    }
  };

  // 1. Planet-Planet Aspects
  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const pA = planets[i];
      const pB = planets[j];

      const distance = angularDistance(pA.absoluteLongitude, pB.absoluteLongitude);

      for (const def of ASPECT_DEFINITIONS) {
        const maxOrb = getMaxOrb(def.name, false);
        const orbDifference = Math.abs(distance - def.targetAngle);

        if (orbDifference <= maxOrb) {
          const motionRelation = getMotionRelation(
            pA.absoluteLongitude,
            pA.speed,
            pB.absoluteLongitude,
            pB.speed,
            def.targetAngle
          );

          results.push({
            bodyA: pA.name,
            bodyASymbol: pA.symbol,
            bodyB: pB.name,
            bodyBSymbol: pB.symbol,
            aspect: def.name,
            aspectSymbol: def.symbol,
            exactAngle: def.targetAngle,
            realSeparation: distance,
            orb: orbDifference,
            motionRelation,
            relationType: 'planeta–planeta',
          });
        }
      }
    }
  }

  // 2. Planet-Ascendant Aspects
  for (const planet of planets) {
    const distance = angularDistance(planet.absoluteLongitude, ascendantLon);

    for (const def of ASPECT_DEFINITIONS) {
      const maxOrb = getMaxOrb(def.name, true);
      const orbDifference = Math.abs(distance - def.targetAngle);

      if (orbDifference <= maxOrb) {
        const motionRelation = getMotionRelation(
          planet.absoluteLongitude,
          planet.speed,
          ascendantLon,
          0, // Angle speed ~ 0
          def.targetAngle
        );

        results.push({
          bodyA: planet.name,
          bodyASymbol: planet.symbol,
          bodyB: 'Ascendente',
          bodyBSymbol: 'ASC',
          aspect: def.name,
          aspectSymbol: def.symbol,
          exactAngle: def.targetAngle,
          realSeparation: distance,
          orb: orbDifference,
          motionRelation,
          relationType: 'planeta–Ascendente',
        });
      }
    }
  }

  // 3. Planet-Midheaven Aspects
  for (const planet of planets) {
    const distance = angularDistance(planet.absoluteLongitude, midheavenLon);

    for (const def of ASPECT_DEFINITIONS) {
      const maxOrb = getMaxOrb(def.name, true);
      const orbDifference = Math.abs(distance - def.targetAngle);

      if (orbDifference <= maxOrb) {
        const motionRelation = getMotionRelation(
          planet.absoluteLongitude,
          planet.speed,
          midheavenLon,
          0, // Angle speed ~ 0
          def.targetAngle
        );

        results.push({
          bodyA: planet.name,
          bodyASymbol: planet.symbol,
          bodyB: 'Medio Cielo',
          bodyBSymbol: 'MC',
          aspect: def.name,
          aspectSymbol: def.symbol,
          exactAngle: def.targetAngle,
          realSeparation: distance,
          orb: orbDifference,
          motionRelation,
          relationType: 'planeta–Medio Cielo',
        });
      }
    }
  }

  return results;
}
