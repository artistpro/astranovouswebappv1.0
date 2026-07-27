import React from 'react';
import { PlanetPosition, AnalysisSelection } from '../types';
import { Sparkles } from 'lucide-react';

interface Props {
  planets: PlanetPosition[];
  houseSystemLabel?: string;
  onAnalyzeSelection?: (sel: AnalysisSelection) => void;
}

export const SectionPlanetaryPositions: React.FC<Props> = ({ 
  planets, 
  houseSystemLabel = 'placidus', 
  onAnalyzeSelection 
}) => {
  return (
    <div id="seccion-posiciones-planetarias" className="glass-panel-gold p-6 mb-8 overflow-x-auto">
      <div className="border-b border-amber-500/20 pb-3 mb-5">
        <h2 className="text-sm font-bold uppercase tracking-widest text-gold-gradient font-sc flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block shadow-[0_0_10px_rgba(216,168,72,0.8)]"></span>
          2. POSICIONES PLANETARIAS (LONGITUDES & VELOCIDADES)
        </h2>
        <p className="text-xs text-amber-200/60 mt-1">
          Coordenadas geocéntricas eclípticas tropicales, velocidades longitudinales reales y asignación de casa.
        </p>
      </div>

      <table className="w-full text-left text-xs text-amber-100 border-collapse">
        <thead>
          <tr className="bg-black/60 border-y border-amber-500/20 text-amber-200/60 font-semibold text-[10px] uppercase tracking-wider font-sc">
            <th className="py-3 px-3 text-center">P</th>
            <th className="py-3 px-3">Cuerpo Celeste</th>
            <th className="py-3 px-3">Signo</th>
            <th className="py-3 px-3">Posición (DMS)</th>
            <th className="py-3 px-3 text-right">Longitud Abs.</th>
            <th className="py-3 px-3 text-center">Casa</th>
            <th className="py-3 px-3 text-right">Velocidad (°/día)</th>
            <th className="py-3 px-3 text-center">Movimiento</th>
            <th className="py-3 px-3 text-center">Análisis Documental</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-amber-500/10">
          {planets.map((planet) => {
            const isRetro = planet.motion === 'Retrógrado';
            const isStationary = planet.motion === 'Estacionario';

            return (
              <tr key={planet.key} className="hover:bg-amber-500/10 transition-colors">
                <td className="py-3 px-3 text-center text-base font-bold text-amber-300">
                  {planet.symbol}
                </td>
                <td className="py-3 px-3 font-semibold text-amber-100">
                  {planet.name}
                </td>
                <td className="py-3 px-3 text-amber-200/80 flex items-center gap-1.5">
                  <span className="text-base">{planet.signSymbol}</span>
                  <span>{planet.sign}</span>
                </td>
                <td className="py-3 px-3 text-amber-100 font-mono">
                  {planet.formattedDMS}
                </td>
                <td className="py-3 px-3 text-right text-amber-200/50 font-mono">
                  {planet.absoluteLongitude.toFixed(6)}°
                </td>
                <td className="py-3 px-3 text-center">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-500/20 border border-amber-400/40 font-bold text-amber-300 text-xs">
                    {planet.house}
                  </span>
                </td>
                <td className="py-3 px-3 text-right text-amber-200/70 font-mono">
                  {planet.speed > 0 ? `+${planet.speed.toFixed(4)}` : planet.speed.toFixed(4)}
                </td>
                <td className="py-3 px-3 text-center">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      isRetro
                        ? 'bg-rose-950/50 text-rose-300 border border-rose-800/60'
                        : isStationary
                        ? 'bg-amber-950/50 text-amber-300 border border-amber-800/60'
                        : 'bg-emerald-950/50 text-amber-300 border border-amber-500/40'
                    }`}
                  >
                    {planet.motion}
                  </span>
                </td>
                <td className="py-3 px-3 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <button
                      onClick={() => onAnalyzeSelection?.({
                        configurationType: 'planetaryPosition',
                        title: `${planet.name} en ${planet.sign}`,
                        bodies: [planet.name],
                        signs: [planet.sign],
                        houses: [planet.house],
                        longitudes: [planet.absoluteLongitude],
                        zodiacSystem: 'tropical',
                        houseSystem: houseSystemLabel
                      })}
                      className="btn-gold-outline px-2.5 py-1 text-[10px] font-bold flex items-center gap-1"
                      title={`Analizar posición de ${planet.name} en ${planet.sign}`}
                    >
                      <Sparkles className="w-3 h-3 text-amber-300" />
                      Signo
                    </button>
                    <button
                      onClick={() => onAnalyzeSelection?.({
                        configurationType: 'planetInHouse',
                        title: `${planet.name} en Casa ${planet.house}`,
                        bodies: [planet.name],
                        signs: [planet.sign],
                        houses: [planet.house],
                        longitudes: [planet.absoluteLongitude],
                        zodiacSystem: 'tropical',
                        houseSystem: houseSystemLabel
                      })}
                      className="btn-gold-outline px-2.5 py-1 text-[10px] font-bold flex items-center gap-1"
                      title={`Analizar ${planet.name} en Casa ${planet.house}`}
                    >
                      <Sparkles className="w-3 h-3 text-amber-300" />
                      Casa {planet.house}
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

