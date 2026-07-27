import React, { useState } from 'react';
import {
  AngleData,
  AspectResult,
  HouseCusp,
  PlanetPosition,
  ZODIAC_SIGNS,
} from '../types';

interface NatalWheelProps {
  planets: PlanetPosition[];
  angles: AngleData[];
  houseCusps: HouseCusp[];
  aspects: AspectResult[];
  personName: string;
  locationName: string;
  normalizedData?: {
    dateStr?: string;
    timeStr?: string;
    utcTime?: string;
    houseSystem?: string;
  };
}

export const NatalWheel: React.FC<NatalWheelProps> = ({
  planets,
  angles,
  houseCusps,
  aspects,
  personName,
  locationName,
  normalizedData,
}) => {
  const [hoveredPlanet, setHoveredPlanet] = useState<string | null>(null);
  const [hoveredAspect, setHoveredAspect] = useState<AspectResult | null>(null);
  const [activeTab, setActiveTab] = useState<'grafico' | 'patrones'>('grafico');

  // Center & Radii
  const cx = 400;
  const cy = 400;
  const rOuter = 370;
  const rZodiacOuter = 360;
  const rZodiacInner = 295;
  const rHouseInner = 220;
  const rAspectInner = 210;

  // Ascendant longitude
  const ascObj = angles.find((a) => a.key === 'ascendant');
  const ascLon = ascObj ? ascObj.absoluteLongitude : 0;

  /**
   * Maps an absolute ecliptic longitude L (0-360) to an SVG polar angle in degrees.
   * ASC is placed at 180° (left horizontal axis / 9 o'clock).
   * Counter-clockwise zodiac progression.
   */
  const getSvgAngle = (longitude: number): number => {
    const delta = longitude - ascLon;
    const svgDeg = 180 - delta;
    return ((svgDeg % 360) + 360) % 360;
  };

  /**
   * Converts SVG polar angle (in degrees) and radius to {x, y} coordinates.
   */
  const polarToCartesian = (angleDeg: number, radius: number) => {
    const rad = (angleDeg * Math.PI) / 180;
    return {
      x: cx + radius * Math.cos(rad),
      y: cy + radius * Math.sin(rad),
    };
  };

  /**
   * Generates SVG path for an annular sector arc (zodiac sign slice).
   */
  const describeArcSector = (startLon: number, endLon: number, rInner: number, rOuter: number) => {
    const a1 = getSvgAngle(startLon);
    const a2 = getSvgAngle(endLon);

    const p1Outer = polarToCartesian(a1, rOuter);
    const p2Outer = polarToCartesian(a2, rOuter);
    const p1Inner = polarToCartesian(a1, rInner);
    const p2Inner = polarToCartesian(a2, rInner);

    let span = startLon <= endLon ? endLon - startLon : 360 - startLon + endLon;
    const largeArc = span > 180 ? 1 : 0;

    return [
      `M ${p1Outer.x} ${p1Outer.y}`,
      `A ${rOuter} ${rOuter} 0 ${largeArc} 0 ${p2Outer.x} ${p2Outer.y}`,
      `L ${p2Inner.x} ${p2Inner.y}`,
      `A ${rInner} ${rInner} 0 ${largeArc} 1 ${p1Inner.x} ${p1Inner.y}`,
      'Z',
    ].join(' ');
  };

  /**
   * Rich Astrological Jewel Tones that harmonize perfectly with Gold & Obsidian:
   * - Fuego: Deep Amber-Flame Ruby (#c95028)
   * - Tierra: Deep Emerald Jade (#1c603b)
   * - Aire: Luminous Champagne Gold (#d8a848)
   * - Agua: Deep Cosmic Sapphire (#1f4172)
   */
  const getDarkSignColor = (element: string) => {
    switch (element) {
      case 'Fuego':
        return '#c95028';
      case 'Tierra':
        return '#1c603b';
      case 'Aire':
        return '#d8a848';
      case 'Agua':
        return '#1f4172';
      default:
        return '#71420b';
    }
  };

  // Stagger overlapping planet glyphs
  const sortedPlanets = [...planets].sort((a, b) => a.absoluteLongitude - b.absoluteLongitude);
  const planetRadialPositions = sortedPlanets.map((p, idx) => {
    let radialOffset = 0;
    for (let prev = 0; prev < idx; prev++) {
      const prevP = sortedPlanets[prev];
      const diff = Math.abs(p.absoluteLongitude - prevP.absoluteLongitude);
      const shortestDiff = diff > 180 ? 360 - diff : diff;
      if (shortestDiff < 7) {
        radialOffset += 24;
      }
    }
    return {
      ...p,
      radius: rZodiacInner - 32 - (radialOffset % 60),
    };
  });

  // Download SVG file handler
  const handleDownloadSvg = () => {
    const svgElem = document.getElementById('natal-chart-svg');
    if (!svgElem) return;
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svgElem);
    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Carta_Natal_${personName.replace(/\s+/g, '_')}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Format date for header
  const formattedDateHeader = normalizedData?.dateStr
    ? `${normalizedData.dateStr} ${normalizedData.timeStr || ''}`
    : `${locationName}`;

  return (
    <div
      id="natal-wheel-container"
      className="glass-panel-gold p-6 sm:p-8 mb-10 text-amber-100 select-none overflow-hidden relative shadow-2xl"
    >
      {/* Luxury Orrery Edition Header */}
      <div className="flex flex-col gap-4 mb-6 border-b border-amber-500/20 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold tracking-widest text-amber-200/60 uppercase font-sc block mb-1">
              REGISTRO DE NACIMIENTO Y RUEDA ASTRAL
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-gold-gradient tracking-wide">
              {personName || 'Carta Natal'}
            </h2>
            <p className="text-xs sm:text-sm text-amber-200/70 mt-1 flex items-center gap-2.5 font-sans">
              <span>{formattedDateHeader}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400/60 inline-block"></span>
              <span className="text-amber-300 font-bold uppercase tracking-wider font-sc">
                {normalizedData?.houseSystem ? normalizedData.houseSystem.toUpperCase() : 'PLACIDUS'} • TROPICAL
              </span>
            </p>
          </div>

          <button
            id="download-svg-btn"
            onClick={handleDownloadSvg}
            className="btn-gold-outline px-4 py-2 text-xs font-bold flex items-center justify-center gap-2 self-start sm:self-auto shrink-0"
            title="Exportar rueda astronómica en formato vectorial SVG"
          >
            <span>📥</span>
            <span>Descargar SVG</span>
          </button>
        </div>

        {/* Tab Selection: Sólo Posiciones vs Ver Aspectos */}
        <div className="flex items-center justify-center sm:justify-start gap-2 pt-2">
          <button
            onClick={() => setActiveTab('grafico')}
            className={
              activeTab === 'grafico'
                ? 'btn-gold-metallic px-5 py-2 text-xs font-bold shadow-lg'
                : 'btn-gold-outline px-5 py-2 text-xs font-bold'
            }
          >
            Sólo Posiciones
          </button>
          <button
            onClick={() => setActiveTab('patrones')}
            className={
              activeTab === 'patrones'
                ? 'btn-gold-metallic px-5 py-2 text-xs font-bold shadow-lg'
                : 'btn-gold-outline px-5 py-2 text-xs font-bold'
            }
          >
            Ver Aspectos Geométricos
          </button>
        </div>
      </div>

      {/* Main Wheel Canvas and Interactive Details Grid */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
        {/* SVG Interactive Wheel */}
        <div className="w-full max-w-[620px] aspect-square flex items-center justify-center relative">
          <svg
            id="natal-chart-svg"
            viewBox="0 0 800 800"
            className="w-full h-full drop-shadow-[0_15px_35px_rgba(0,0,0,0.9)]"
          >
            <defs>
              {/* Radial gradient space fill */}
              <radialGradient id="spaceBg" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#08070a" />
                <stop offset="70%" stopColor="#040405" />
                <stop offset="100%" stopColor="#020203" />
              </radialGradient>
              {/* Gold Glow filter */}
              <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Dark Outer Canvas Background */}
            <circle cx={cx} cy={cy} r={rOuter} fill="url(#spaceBg)" stroke="#71420b" strokeWidth="2.5" />

            {/* Rotating Outer Astrological Rings */}
            <circle
              cx={cx}
              cy={cy}
              r={rOuter + 8}
              fill="none"
              stroke="#d8a848"
              strokeWidth="1"
              strokeDasharray="4 6"
              className="animate-spin-slow opacity-50"
            />
            <circle
              cx={cx}
              cy={cy}
              r={rOuter + 14}
              fill="none"
              stroke="#ffe5a0"
              strokeWidth="0.75"
              strokeDasharray="1 8"
              className="animate-spin-reverse-slow opacity-40"
            />

            {/* Subtle background star dots */}
            {[
              { x: 120, y: 150 }, { x: 680, y: 220 }, { x: 200, y: 650 },
              { x: 620, y: 600 }, { x: 380, y: 100 }, { x: 700, y: 380 },
            ].map((pt, i) => (
              <circle key={`star-${i}`} cx={pt.x} cy={pt.y} r="1.5" fill="#ffe5a0" opacity="0.75" />
            ))}

            {/* 1. Zodiac Signs Ring (Jewel Tone Elements on Gold/Obsidian background) */}
            {ZODIAC_SIGNS.map((sign) => {
              const pathD = describeArcSector(sign.startDeg, sign.endDeg, rZodiacInner, rZodiacOuter);
              const midLon = (sign.startDeg + sign.endDeg) / 2;
              const midAngle = getSvgAngle(midLon);
              const symbolPos = polarToCartesian(midAngle, (rZodiacInner + rZodiacOuter) / 2);
              const sectorColor = getDarkSignColor(sign.element);
              const isAire = sign.element === 'Aire';

              return (
                <g key={sign.id} className="zodiac-sector cursor-pointer">
                  <path
                    d={pathD}
                    fill={sectorColor}
                    stroke="#040405"
                    strokeWidth="1.8"
                    className="transition-opacity hover:opacity-90"
                  />
                  <text
                    x={symbolPos.x}
                    y={symbolPos.y}
                    fill={isAire ? '#040405' : '#ffe5a0'}
                    fontSize="22"
                    fontWeight="bold"
                    textAnchor="middle"
                    dominantBaseline="central"
                  >
                    {sign.symbol}
                  </text>
                </g>
              );
            })}

            {/* Zodiac Ring Outer & Inner Gold Borders */}
            <circle cx={cx} cy={cy} r={rZodiacOuter} fill="none" stroke="#d8a848" strokeWidth="2.2" />
            <circle cx={cx} cy={cy} r={rZodiacInner} fill="none" stroke="#d8a848" strokeWidth="2.2" />
            <circle cx={cx} cy={cy} r={rHouseInner} fill="none" stroke="#71420b" strokeWidth="1.5" strokeDasharray="3 3" />

            {/* 2. House Division Lines & House Numbers */}
            {houseCusps.map((cusp) => {
              const svgAngle = getSvgAngle(cusp.absoluteLongitude);
              const pStart = polarToCartesian(svgAngle, rHouseInner);
              const pEnd = polarToCartesian(svgAngle, rZodiacInner);

              // Next cusp for house angle offset
              const nextCusp = houseCusps[(cusp.number) % 12];
              let diff = nextCusp.absoluteLongitude - cusp.absoluteLongitude;
              if (diff < 0) diff += 360;
              const numLon = (cusp.absoluteLongitude + diff * 0.28) % 360;
              const numPos = polarToCartesian(getSvgAngle(numLon), (rHouseInner + rZodiacInner) / 2);

              return (
                <g key={`house-${cusp.number}`}>
                  <line
                    x1={pStart.x}
                    y1={pStart.y}
                    x2={pEnd.x}
                    y2={pEnd.y}
                    stroke="#d8a848"
                    strokeWidth="1.2"
                    opacity="0.85"
                  />
                  {/* House Number in Center Sector */}
                  <text
                    x={numPos.x}
                    y={numPos.y}
                    fill="#ffe5a0"
                    fontSize="13"
                    fontWeight="700"
                    textAnchor="middle"
                    dominantBaseline="central"
                    opacity="0.9"
                  >
                    {cusp.number}
                  </text>
                </g>
              );
            })}

            {/* 3. Highlighted Angles Axes (ASC-DSC & MC-IC) & Badges */}
            {angles.map((angle) => {
              const svgAngle = getSvgAngle(angle.absoluteLongitude);
              const pInner = polarToCartesian(svgAngle, rAspectInner);
              const pOuter = polarToCartesian(svgAngle, rZodiacOuter + 14);
              const labelPos = polarToCartesian(svgAngle, rZodiacOuter + 28);

              const isAscDsc = angle.key === 'ascendant' || angle.key === 'descendant';
              const isMc = angle.key === 'midheaven';
              const strokeColor = isAscDsc ? '#ffe5a0' : isMc ? '#d8a848' : '#c4ab80';

              return (
                <g key={`angle-axis-${angle.key}`}>
                  <line
                    x1={pInner.x}
                    y1={pInner.y}
                    x2={pOuter.x}
                    y2={pOuter.y}
                    stroke={strokeColor}
                    strokeWidth={isAscDsc ? '2.5' : '2'}
                  />
                  {/* Angle Badge */}
                  <rect
                    x={labelPos.x - 20}
                    y={labelPos.y - 12}
                    width="40"
                    height="24"
                    rx="6"
                    fill="#0f0c08"
                    stroke={strokeColor}
                    strokeWidth="1.5"
                  />
                  <text
                    x={labelPos.x}
                    y={labelPos.y}
                    fill={strokeColor}
                    fontSize="12"
                    fontWeight="800"
                    textAnchor="middle"
                    dominantBaseline="central"
                  >
                    {angle.abbreviation}
                  </text>
                </g>
              );
            })}

            {/* Degree labels on ASC line (9 o'clock) */}
            {ascObj && (
              <text
                x={cx - rZodiacOuter - 22}
                y={cy + 18}
                fill="#ffe5a0"
                fontSize="11"
                fontWeight="bold"
                textAnchor="middle"
              >
                {Math.floor(ascObj.degree)}°
              </text>
            )}

            {/* 4. Central Aspect Disc & Aspect Web Lines */}
            <circle cx={cx} cy={cy} r={rAspectInner} fill="#040405" stroke="#71420b" strokeWidth="2" />

            {/* Center Gold Sun Hub */}
            <circle cx={cx} cy={cy} r="18" fill="#140d04" stroke="#d8a848" strokeWidth="2" />
            <circle cx={cx} cy={cy} r="7" fill="#ffe5a0" className="animate-pulse-glow" />

            {/* Aspect Lines */}
            {aspects.map((asp, idx) => {
              const posA =
                planets.find((p) => p.name === asp.bodyA)?.absoluteLongitude ??
                angles.find((a) => a.name === asp.bodyA)?.absoluteLongitude;
              const posB =
                planets.find((p) => p.name === asp.bodyB)?.absoluteLongitude ??
                angles.find((a) => a.name === asp.bodyB)?.absoluteLongitude;

              if (posA === undefined || posB === undefined) return null;

              const angleA = getSvgAngle(posA);
              const angleB = getSvgAngle(posB);
              const pA = polarToCartesian(angleA, rAspectInner);
              const pB = polarToCartesian(angleB, rAspectInner);

              // Aspect line colors
              let color = '#d8a848';
              let strokeDash = '';
              if (asp.aspect === 'Conjunción') color = '#34d399'; // Emerald
              if (asp.aspect === 'Sextil') color = '#fef08a'; // Champagne
              if (asp.aspect === 'Cuadratura') color = '#ef4444'; // Red
              if (asp.aspect === 'Trígono') color = '#38bdf8'; // Blue
              if (asp.aspect === 'Oposición') {
                color = '#e879f9'; // Amethyst Rose
                strokeDash = '4 3';
              }

              const isHighlighted =
                hoveredAspect === asp ||
                (hoveredPlanet && (asp.bodyA === hoveredPlanet || asp.bodyB === hoveredPlanet));

              if (activeTab === 'grafico' && !isHighlighted) {
                return null;
              }

              return (
                <line
                  key={`aspect-line-${idx}`}
                  x1={pA.x}
                  y1={pA.y}
                  x2={pB.x}
                  y2={pB.y}
                  stroke={color}
                  strokeWidth={isHighlighted ? '3.5' : '1.5'}
                  strokeDasharray={strokeDash}
                  opacity={isHighlighted ? 1 : 0.85}
                  className="cursor-pointer transition-all hover:opacity-100"
                  onMouseEnter={() => setHoveredAspect(asp)}
                  onMouseLeave={() => setHoveredAspect(null)}
                />
              );
            })}

            {/* 5. Planet Glyphs around the wheel */}
            {planetRadialPositions.map((planet) => {
              const svgAngle = getSvgAngle(planet.absoluteLongitude);

              // Point on zodiac inner ring
              const tickStart = polarToCartesian(svgAngle, rZodiacInner);
              const tickEnd = polarToCartesian(svgAngle, rZodiacInner - 12);

              // Position for planet badge
              const glyphPos = polarToCartesian(svgAngle, planet.radius);

              const isHovered = hoveredPlanet === planet.name;
              const isRetro = planet.motion === 'Retrógrado';
              const degLabel = `${Math.floor(planet.degree)}${isRetro ? 'r' : ''}`;

              return (
                <g
                  key={`planet-glyph-${planet.key}`}
                  className="planet-glyph cursor-pointer transition-all"
                  onMouseEnter={() => setHoveredPlanet(planet.name)}
                  onMouseLeave={() => setHoveredPlanet(null)}
                >
                  {/* Cusp tick line */}
                  <line
                    x1={tickStart.x}
                    y1={tickStart.y}
                    x2={tickEnd.x}
                    y2={tickEnd.y}
                    stroke="#ffe5a0"
                    strokeWidth="2"
                  />

                  {/* Displaced pointer line */}
                  {planet.radius < rZodiacInner - 32 && (
                    <line
                      x1={tickEnd.x}
                      y1={tickEnd.y}
                      x2={glyphPos.x}
                      y2={glyphPos.y}
                      stroke="#d8a848"
                      strokeWidth="1"
                      strokeDasharray="2 2"
                    />
                  )}

                  {/* Planet Glyph Circle Badge */}
                  <circle
                    cx={glyphPos.x}
                    cy={glyphPos.y}
                    r={isHovered ? '16' : '13.5'}
                    fill={isHovered ? '#d8a848' : '#0e0b07'}
                    stroke={isHovered ? '#fff2c8' : '#d8a848'}
                    strokeWidth="1.8"
                    className="transition-all"
                  />

                  {/* Planet Symbol */}
                  <text
                    x={glyphPos.x}
                    y={glyphPos.y - 1}
                    fill={isHovered ? '#040405' : '#ffe5a0'}
                    fontSize="13"
                    fontWeight="bold"
                    textAnchor="middle"
                    dominantBaseline="central"
                  >
                    {planet.symbol}
                  </text>

                  {/* Degree Label underneath */}
                  <text
                    x={glyphPos.x}
                    y={glyphPos.y + 19}
                    fill={isRetro ? '#ef4444' : '#ffe5a0'}
                    fontSize="10"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {degLabel}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Legend and Active Hover Info Panel */}
        <div className="w-full lg:w-80 flex flex-col gap-4">
          {/* Active Hover Details Box */}
          <div className="bg-black/60 backdrop-blur-md border border-amber-500/30 rounded-2xl p-5 text-xs shadow-xl">
            <h3 className="font-bold text-gold-gradient font-sc text-sm mb-3 border-b border-amber-500/20 pb-2 flex items-center justify-between">
              <span>Detalle Interactivo</span>
              <span className="text-[10px] text-amber-200/50">Pasa el cursor</span>
            </h3>
            {hoveredPlanet ? (
              (() => {
                const p = planets.find((item) => item.name === hoveredPlanet);
                if (!p) return null;
                return (
                  <div className="space-y-2 text-amber-100">
                    <p className="font-bold text-amber-300 text-base flex items-center gap-2 font-serif">
                      <span className="text-xl">{p.symbol}</span> {p.name}
                    </p>
                    <p>
                      <span className="text-amber-200/60 font-semibold">Posición:</span> {p.formattedDMS}
                    </p>
                    <p>
                      <span className="text-amber-200/60 font-semibold">Longitud absoluta:</span>{' '}
                      {p.absoluteLongitude.toFixed(4)}°
                    </p>
                    <p>
                      <span className="text-amber-200/60 font-semibold">Ubicación:</span> Casa {p.house}
                    </p>
                    <p>
                      <span className="text-amber-200/60 font-semibold">Estado:</span> {p.motion} (
                      {p.speed.toFixed(4)}°/día)
                    </p>
                  </div>
                );
              })()
            ) : hoveredAspect ? (
              <div className="space-y-2 text-amber-100">
                <p className="font-bold text-amber-300 text-base flex items-center gap-2 font-serif">
                  <span>{hoveredAspect.aspectSymbol}</span> {hoveredAspect.aspect}
                </p>
                <p>
                  <span className="text-amber-200/60 font-semibold">Cuerpos:</span> {hoveredAspect.bodyA} -{' '}
                  {hoveredAspect.bodyB}
                </p>
                <p>
                  <span className="text-amber-200/60 font-semibold">Ángulo teórico:</span>{' '}
                  {hoveredAspect.exactAngle}°
                </p>
                <p>
                  <span className="text-amber-200/60 font-semibold">Separación real:</span>{' '}
                  {hoveredAspect.realSeparation.toFixed(4)}°
                </p>
                <p>
                  <span className="text-amber-200/60 font-semibold">Orbe calculado:</span>{' '}
                  {hoveredAspect.orb.toFixed(4)}°
                </p>
              </div>
            ) : (
              <p className="text-amber-200/60 italic leading-relaxed font-sans">
                Pasa el cursor sobre cualquier planeta, signo o línea de aspecto en la rueda para explorar la lectura.
              </p>
            )}
          </div>

          {/* Aspect Colors Legend */}
          <div className="bg-black/60 backdrop-blur-md border border-amber-500/30 rounded-2xl p-5 text-xs space-y-3 shadow-xl">
            <h4 className="font-bold text-gold-gradient font-sc text-sm border-b border-amber-500/20 pb-2">
              Leyenda de Geometría de Aspectos
            </h4>
            <div className="grid grid-cols-2 gap-2.5 text-amber-100">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block shadow-[0_0_8px_rgba(52,211,153,0.6)]"></span>
                <span>Conjunción (0°)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-200 inline-block shadow-[0_0_8px_rgba(254,240,138,0.6)]"></span>
                <span>Sextil (60°)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block shadow-[0_0_8px_rgba(244,63,94,0.6)]"></span>
                <span>Cuadratura (90°)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400 inline-block shadow-[0_0_8px_rgba(56,189,248,0.6)]"></span>
                <span>Trígono (120°)</span>
              </div>
              <div className="flex items-center gap-2 col-span-2">
                <span className="w-2.5 h-2.5 rounded-full bg-fuchsia-400 inline-block shadow-[0_0_8px_rgba(232,121,249,0.6)]"></span>
                <span>Oposición (180°)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
