import React from 'react';
import { HouseCusp, AnalysisSelection } from '../types';
import { Sparkles } from 'lucide-react';

interface Props {
  houseCusps: HouseCusp[];
  houseSystemLabel?: string;
  onAnalyzeSelection?: (sel: AnalysisSelection) => void;
}

export const SectionHouseCusps: React.FC<Props> = ({ 
  houseCusps, 
  houseSystemLabel = 'placidus', 
  onAnalyzeSelection 
}) => {
  return (
    <div id="seccion-cuspides-casas" className="glass-panel-gold p-6 mb-8 overflow-x-auto">
      <div className="border-b border-amber-500/20 pb-3 mb-5">
        <h2 className="text-sm font-bold uppercase tracking-widest text-gold-gradient font-sc flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block shadow-[0_0_10px_rgba(216,168,72,0.8)]"></span>
          4. CÚSPIDES DE CASAS ASTROLÓGICAS
        </h2>
        <p className="text-xs text-amber-200/60 mt-1">
          Límites exactos de los doce sectores del espacio terrestre proyectados sobre la eclíptica.
        </p>
      </div>

      <table className="w-full text-left text-xs text-amber-100 border-collapse">
        <thead>
          <tr className="bg-black/60 border-y border-amber-500/20 text-amber-200/60 font-semibold text-[10px] uppercase tracking-wider font-sc">
            <th className="py-3 px-4 text-center">Cúspide</th>
            <th className="py-3 px-4">Signo</th>
            <th className="py-3 px-4">Posición (DMS)</th>
            <th className="py-3 px-4 text-right">Longitud Absoluta</th>
            <th className="py-3 px-4 text-center">Sistema</th>
            <th className="py-3 px-4 text-center">Análisis</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-amber-500/10">
          {houseCusps.map((cusp) => {
            const isAngularHouse = cusp.number === 1 || cusp.number === 4 || cusp.number === 7 || cusp.number === 10;

            return (
              <tr
                key={`cusp-${cusp.number}`}
                className={`hover:bg-amber-500/10 transition-colors ${
                  isAngularHouse ? 'bg-amber-500/5' : ''
                }`}
              >
                <td className="py-2.5 px-4 text-center">
                  <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full font-bold text-xs ${
                    isAngularHouse ? 'bg-amber-500/20 text-amber-300 border border-amber-400/50 shadow-[0_0_10px_rgba(216,168,72,0.3)]' : 'bg-black/40 text-amber-200/70 border border-amber-500/20'
                  }`}>
                    Casa {cusp.number}
                  </span>
                </td>
                <td className="py-2.5 px-4 font-semibold text-amber-100">
                  <span className="mr-1.5 text-base text-amber-300">{cusp.signSymbol}</span>
                  {cusp.sign}
                </td>
                <td className="py-2.5 px-4 text-amber-100 font-mono">
                  {cusp.formattedDMS}
                </td>
                <td className="py-2.5 px-4 text-right text-amber-200/50 font-mono">
                  {cusp.absoluteLongitude.toFixed(6)}°
                </td>
                <td className="py-2.5 px-4 text-center text-amber-200/60 text-[10px] uppercase font-sc">
                  {cusp.systemName}
                </td>
                <td className="py-2.5 px-4 text-center">
                  <button
                    onClick={() => onAnalyzeSelection?.({
                      configurationType: 'angle',
                      title: `Cúspide de Casa ${cusp.number} en ${cusp.sign}`,
                      signs: [cusp.sign],
                      houses: [cusp.number],
                      longitudes: [cusp.absoluteLongitude],
                      zodiacSystem: 'tropical',
                      houseSystem: houseSystemLabel
                    })}
                    className="btn-gold-outline px-3 py-1 text-[10px] font-bold inline-flex items-center gap-1"
                    title={`Analizar Cúspide de Casa ${cusp.number}`}
                  >
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    Analizar
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

