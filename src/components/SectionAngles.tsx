import React from 'react';
import { AngleData, AnalysisSelection } from '../types';
import { Sparkles } from 'lucide-react';

interface Props {
  angles: AngleData[];
  houseSystemLabel?: string;
  onAnalyzeSelection?: (sel: AnalysisSelection) => void;
}

export const SectionAngles: React.FC<Props> = ({ 
  angles, 
  houseSystemLabel = 'placidus', 
  onAnalyzeSelection 
}) => {
  return (
    <div id="seccion-angulos" className="glass-panel-gold p-6 mb-8">
      <div className="border-b border-amber-500/20 pb-3 mb-5">
        <h2 className="text-sm font-bold uppercase tracking-widest text-gold-gradient font-sc flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block shadow-[0_0_10px_rgba(216,168,72,0.8)]"></span>
          3. ÁNGULOS PRINCIPALES (EJES CARDINALES)
        </h2>
        <p className="text-xs text-amber-200/60 mt-1">
          Ejes cardinales del horizonte local (ASC-DSC) y del meridiano celeste (MC-IC).
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {angles.map((angle) => {
          const houseNum = angle.abbreviation === 'ASC' ? 1 : angle.abbreviation === 'MC' ? 10 : angle.abbreviation === 'DSC' ? 7 : 4;

          return (
            <div
              key={angle.key}
              className="p-4 rounded-xl border bg-black/50 border-amber-500/20 hover:border-amber-400/50 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-amber-200/60 uppercase tracking-wider font-sc">
                    {angle.name}
                  </span>
                  <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40">
                    {angle.abbreviation}
                  </span>
                </div>

                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl text-amber-300">{angle.signSymbol}</span>
                  <span className="text-sm font-bold text-amber-100 font-mono">{angle.formattedDMS}</span>
                </div>

                <div className="text-xs text-amber-200/50 mt-2 pt-2 border-t border-amber-500/15 flex justify-between font-mono">
                  <span>Long. Abs:</span>
                  <span className="font-semibold text-amber-200/80">{angle.absoluteLongitude.toFixed(6)}°</span>
                </div>
              </div>

              <div className="mt-3.5 pt-2.5 border-t border-amber-500/15">
                <button
                  onClick={() => onAnalyzeSelection?.({
                    configurationType: 'angle',
                    title: `${angle.name} (${angle.abbreviation}) en ${angle.sign}`,
                    bodies: [angle.name],
                    signs: [angle.sign],
                    houses: [houseNum],
                    longitudes: [angle.absoluteLongitude],
                    zodiacSystem: 'tropical',
                    houseSystem: houseSystemLabel
                  })}
                  className="w-full btn-gold-outline py-2 text-[11px] font-bold flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  Analizar {angle.abbreviation}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

