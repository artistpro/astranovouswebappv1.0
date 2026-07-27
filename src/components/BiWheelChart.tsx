import React, { useState } from 'react';
import {
  AngleData,
  CalculationResponse,
  InterChartAspect,
  PlanetPosition,
  ZODIAC_SIGNS,
} from '../types';

interface BiWheelChartProps {
  natalChart: CalculationResponse;
  outerPlanets: PlanetPosition[];
  outerTitle: string; // e.g. "Tránsitos" or "Revolución Solar"
  interAspects: InterChartAspect[];
  personName: string;
  subtitle?: string;
  onAnalyzeSelection?: (sel: any) => void;
}

export const BiWheelChart: React.FC<BiWheelChartProps> = ({
  natalChart,
  outerPlanets,
  outerTitle,
  interAspects,
  personName,
  subtitle,
  onAnalyzeSelection,
}) => {
  const [hoveredPlanet, setHoveredPlanet] = useState<{ name: string; isOuter: boolean } | null>(null);
  const [hoveredAspect, setHoveredAspect] = useState<InterChartAspect | null>(null);

  // Center & Radii for Bi-Wheel
  const cx = 420;
  const cy = 420;

  const rOuter = 390;
  const rOuterZodiacOuter = 380;
  const rOuterZodiacInner = 325; // Outer Planet ring
  const rNatalZodiacOuter = 315;
  const rNatalZodiacInner = 260; // Natal Planet ring
  const rHouseInner = 200;
  const rAspectInner = 190;

  // Ascendant longitude from Natal Chart
  const ascObj = natalChart.angles.find((a) => a.key === 'ascendant');
  const ascLon = ascObj ? ascObj.absoluteLongitude : 0;

  /**
   * Maps an absolute ecliptic longitude L (0-360) to SVG polar angle in degrees.
   * Natal ASC placed at 180° (left horizontal axis / 9 o'clock).
   */
  const getSvgAngle = (longitude: number): number => {
    const delta = longitude - ascLon;
    const svgDeg = 180 - delta;
    return ((svgDeg % 360) + 360) % 360;
  };

  const polarToCartesian = (angleDeg: number, radius: number) => {
    const rad = (angleDeg * Math.PI) / 180;
    return {
      x: cx + radius * Math.cos(rad),
      y: cy + radius * Math.sin(rad),
    };
  };

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

  const getElementColor = (element: string) => {
    switch (element) {
      case 'Fuego': return '#c95028';
      case 'Tierra': return '#1c603b';
      case 'Aire': return '#d8a848';
      case 'Agua': return '#1f4172';
      default: return '#71420b';
    }
  };

  return (
    <div className="glass-panel-gold p-6 sm:p-8 mb-10 text-amber-100 select-none overflow-hidden relative shadow-2xl">
      {/* Bi-Wheel Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 border-b border-amber-500/20 pb-5">
        <div>
          <span className="text-[11px] font-bold tracking-widest text-amber-200/60 uppercase font-sc block mb-1">
            RUEDA DOBLE (BI-WHEEL) • {outerTitle.toUpperCase()} VS CARTA NATAL
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-gold-gradient tracking-wide">
            {personName || 'Carta Natal'}
          </h2>
          {subtitle && (
            <p className="text-xs sm:text-sm text-amber-200/70 mt-1 font-sans">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs bg-black/60 px-4 py-2 rounded-xl border border-amber-500/30">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-cyan-400 border border-cyan-200 shadow-[0_0_8px_rgba(34,211,238,0.8)] inline-block"></span>
            <span className="text-amber-100 font-bold">{outerTitle} (Anillo Exterior)</span>
          </div>
          <span className="text-amber-500/40">•</span>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-400 border border-amber-200 shadow-[0_0_8px_rgba(251,191,36,0.8)] inline-block"></span>
            <span className="text-amber-100 font-bold">Natal (Anillo Interior)</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
        {/* SVG Bi-Wheel Canvas */}
        <div className="w-full max-w-[650px] aspect-square flex items-center justify-center relative">
          <svg
            id="biwheel-chart-svg"
            viewBox="0 0 840 840"
            className="w-full h-full drop-shadow-[0_15px_35px_rgba(0,0,0,0.9)]"
          >
            <defs>
              <radialGradient id="biwheelSpaceBg" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#08070a" />
                <stop offset="75%" stopColor="#040405" />
                <stop offset="100%" stopColor="#020203" />
              </radialGradient>
            </defs>

            {/* Dark Outer Space Circle */}
            <circle cx={cx} cy={cy} r={rOuter} fill="url(#biwheelSpaceBg)" stroke="#71420b" strokeWidth="2.5" />

            {/* Rotating Star Rings */}
            <circle cx={cx} cy={cy} r={rOuter + 8} fill="none" stroke="#d8a848" strokeWidth="1" strokeDasharray="4 6" className="animate-spin-slow opacity-40" />

            {/* 1. Zodiac Signs Ring (Middle Ring) */}
            {ZODIAC_SIGNS.map((sign) => {
              const pathD = describeArcSector(sign.startDeg, sign.endDeg, rNatalZodiacOuter, rOuterZodiacInner);
              const midLon = (sign.startDeg + sign.endDeg) / 2;
              const midAngle = getSvgAngle(midLon);
              const symbolPos = polarToCartesian(midAngle, (rNatalZodiacOuter + rOuterZodiacInner) / 2);
              const sectorColor = getElementColor(sign.element);
              const isAire = sign.element === 'Aire';

              return (
                <g key={`bw-zodiac-${sign.id}`}>
                  <path d={pathD} fill={sectorColor} stroke="#040405" strokeWidth="1.5" />
                  <text
                    x={symbolPos.x}
                    y={symbolPos.y}
                    fill={isAire ? '#040405' : '#ffe5a0'}
                    fontSize="18"
                    fontWeight="bold"
                    textAnchor="middle"
                    dominantBaseline="central"
                  >
                    {sign.symbol}
                  </text>
                </g>
              );
            })}

            <circle cx={cx} cy={cy} r={rOuterZodiacInner} fill="none" stroke="#d8a848" strokeWidth="2" />
            <circle cx={cx} cy={cy} r={rNatalZodiacOuter} fill="none" stroke="#d8a848" strokeWidth="2" />
            <circle cx={cx} cy={cy} r={rNatalZodiacInner} fill="none" stroke="#71420b" strokeWidth="1.5" strokeDasharray="3 3" />

            {/* 2. Natal House Division Lines */}
            {natalChart.houseCusps.map((cusp) => {
              const svgAngle = getSvgAngle(cusp.absoluteLongitude);
              const pStart = polarToCartesian(svgAngle, rHouseInner);
              const pEnd = polarToCartesian(svgAngle, rNatalZodiacOuter);

              return (
                <g key={`bw-house-${cusp.number}`}>
                  <line x1={pStart.x} y1={pStart.y} x2={pEnd.x} y2={pEnd.y} stroke="#d8a848" strokeWidth="1.2" opacity="0.8" />
                </g>
              );
            })}

            {/* 3. Central Inter-Aspect Disc & Aspect Lines */}
            <circle cx={cx} cy={cy} r={rAspectInner} fill="#040405" stroke="#71420b" strokeWidth="2" />
            <circle cx={cx} cy={cy} r="16" fill="#140d04" stroke="#d8a848" strokeWidth="2" />
            <circle cx={cx} cy={cy} r="6" fill="#ffe5a0" className="animate-pulse-glow" />

            {/* Cross Aspect Lines (Outer Event Planet -> Natal Planet) */}
            {interAspects.map((asp, idx) => {
              const outerP = outerPlanets.find((p) => p.name === asp.transitBody);
              const natalTarget =
                natalChart.planets.find((p) => p.name === asp.natalBody)?.absoluteLongitude ??
                natalChart.angles.find((a) => a.name === asp.natalBody)?.absoluteLongitude;

              if (!outerP || natalTarget === undefined) return null;

              const angleOuter = getSvgAngle(outerP.absoluteLongitude);
              const angleNatal = getSvgAngle(natalTarget);

              const pA = polarToCartesian(angleOuter, rAspectInner);
              const pB = polarToCartesian(angleNatal, rAspectInner);

              let color = '#34d399'; // Conjunction
              if (asp.aspect === 'Sextil') color = '#fef08a';
              if (asp.aspect === 'Cuadratura') color = '#ef4444';
              if (asp.aspect === 'Trígono') color = '#38bdf8';
              if (asp.aspect === 'Oposición') color = '#e879f9';

              const isHighlighted =
                hoveredAspect === asp ||
                (hoveredPlanet?.name === asp.transitBody && hoveredPlanet?.isOuter) ||
                (hoveredPlanet?.name === asp.natalBody && !hoveredPlanet?.isOuter);

              return (
                <line
                  key={`bw-aspect-${idx}`}
                  x1={pA.x}
                  y1={pA.y}
                  x2={pB.x}
                  y2={pB.y}
                  stroke={color}
                  strokeWidth={isHighlighted ? '3.5' : '1.2'}
                  opacity={isHighlighted ? 1 : 0.6}
                  className="cursor-pointer transition-all hover:opacity-100"
                  onMouseEnter={() => setHoveredAspect(asp)}
                  onMouseLeave={() => setHoveredAspect(null)}
                />
              );
            })}

            {/* 4. Outer Planets Ring (Tránsitos / Revolución Solar) */}
            {outerPlanets.map((planet) => {
              const svgAngle = getSvgAngle(planet.absoluteLongitude);
              const glyphPos = polarToCartesian(svgAngle, (rOuterZodiacInner + rOuterZodiacOuter) / 2);
              const isHovered = hoveredPlanet?.name === planet.name && hoveredPlanet?.isOuter;

              return (
                <g
                  key={`bw-outer-planet-${planet.key}`}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredPlanet({ name: planet.name, isOuter: true })}
                  onMouseLeave={() => setHoveredPlanet(null)}
                >
                  <circle
                    cx={glyphPos.x}
                    cy={glyphPos.y}
                    r={isHovered ? '15' : '12'}
                    fill={isHovered ? '#06b6d4' : '#083344'}
                    stroke={isHovered ? '#67e8f9' : '#22d3ee'}
                    strokeWidth="1.8"
                    className="transition-all"
                  />
                  <text
                    x={glyphPos.x}
                    y={glyphPos.y - 1}
                    fill="#ecfeff"
                    fontSize="12"
                    fontWeight="bold"
                    textAnchor="middle"
                    dominantBaseline="central"
                  >
                    {planet.symbol}
                  </text>
                </g>
              );
            })}

            {/* 5. Inner Natal Planets Ring */}
            {natalChart.planets.map((planet) => {
              const svgAngle = getSvgAngle(planet.absoluteLongitude);
              const glyphPos = polarToCartesian(svgAngle, (rHouseInner + rNatalZodiacInner) / 2);
              const isHovered = hoveredPlanet?.name === planet.name && !hoveredPlanet?.isOuter;

              return (
                <g
                  key={`bw-natal-planet-${planet.key}`}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredPlanet({ name: planet.name, isOuter: false })}
                  onMouseLeave={() => setHoveredPlanet(null)}
                >
                  <circle
                    cx={glyphPos.x}
                    cy={glyphPos.y}
                    r={isHovered ? '15' : '12'}
                    fill={isHovered ? '#d8a848' : '#0e0b07'}
                    stroke={isHovered ? '#fff2c8' : '#d8a848'}
                    strokeWidth="1.8"
                    className="transition-all"
                  />
                  <text
                    x={glyphPos.x}
                    y={glyphPos.y - 1}
                    fill={isHovered ? '#040405' : '#ffe5a0'}
                    fontSize="12"
                    fontWeight="bold"
                    textAnchor="middle"
                    dominantBaseline="central"
                  >
                    {planet.symbol}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Legend & Interactive Details */}
        <div className="w-full lg:w-80 flex flex-col gap-4">
          <div className="bg-black/60 backdrop-blur-md border border-amber-500/30 rounded-2xl p-5 text-xs shadow-xl">
            <h3 className="font-bold text-gold-gradient font-sc text-sm mb-3 border-b border-amber-500/20 pb-2 flex items-center justify-between">
              <span>Detalle de Rueda Doble</span>
              <span className="text-[10px] text-amber-200/50">Pasa el cursor</span>
            </h3>
            {hoveredPlanet ? (
              <div className="space-y-2 text-amber-100">
                <p className="font-bold text-amber-300 text-base flex items-center gap-2 font-serif">
                  <span className="text-cyan-400">{hoveredPlanet.isOuter ? `[${outerTitle}]` : '[Natal]'}</span>
                  <span>{hoveredPlanet.name}</span>
                </p>
                {(() => {
                  const list = hoveredPlanet.isOuter ? outerPlanets : natalChart.planets;
                  const p = list.find((item) => item.name === hoveredPlanet.name);
                  if (!p) return null;
                  return (
                    <>
                      <p><span className="text-amber-200/60 font-semibold">Posición:</span> {p.formattedDMS}</p>
                      <p><span className="text-amber-200/60 font-semibold">Signo:</span> {p.signSymbol} {p.sign}</p>
                      <p><span className="text-amber-200/60 font-semibold">Movimiento:</span> {p.motion}</p>
                    </>
                  );
                })()}
              </div>
            ) : hoveredAspect ? (
              <div className="space-y-2 text-amber-100">
                <p className="font-bold text-cyan-300 text-sm flex items-center gap-2 font-serif">
                  <span>{hoveredAspect.aspectSymbol}</span> {hoveredAspect.aspect}
                </p>
                <p><span className="text-amber-200/60 font-semibold">En Tránsito:</span> {hoveredAspect.transitSymbol} {hoveredAspect.transitBody}</p>
                <p><span className="text-amber-200/60 font-semibold">En Natal:</span> {hoveredAspect.natalSymbol} {hoveredAspect.natalBody}</p>
                <p><span className="text-amber-200/60 font-semibold">Orbe:</span> {hoveredAspect.orb.toFixed(4)}°</p>
              </div>
            ) : (
              <p className="text-amber-200/60 italic leading-relaxed">
                Pasa el cursor sobre cualquier cuerpo en el anillo exterior ({outerTitle}) o en el anillo interior (Natal) para examinar la interacción astronómica.
              </p>
            )}
          </div>

          <div className="bg-black/60 backdrop-blur-md border border-amber-500/30 rounded-2xl p-5 text-xs space-y-3 shadow-xl">
            <h4 className="font-bold text-gold-gradient font-sc text-sm border-b border-amber-500/20 pb-2">
              Leyenda de Aspectos Inter-Cartas
            </h4>
            <div className="grid grid-cols-2 gap-2.5 text-amber-100">
              <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block"></span><span>Conjunción (0°)</span></div>
              <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-yellow-200 inline-block"></span><span>Sextil (60°)</span></div>
              <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span><span>Cuadratura (90°)</span></div>
              <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-sky-400 inline-block"></span><span>Trígono (120°)</span></div>
              <div className="flex items-center gap-2 col-span-2"><span className="w-2.5 h-2.5 rounded-full bg-fuchsia-400 inline-block"></span><span>Oposición (180°)</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
