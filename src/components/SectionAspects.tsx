import React, { useState } from 'react';
import { AspectResult, AnalysisSelection } from '../types';
import { Sparkles } from 'lucide-react';

interface Props {
  aspects: AspectResult[];
  houseSystemLabel?: string;
  onAnalyzeSelection?: (sel: AnalysisSelection) => void;
}

export const SectionAspects: React.FC<Props> = ({ 
  aspects, 
  houseSystemLabel = 'placidus', 
  onAnalyzeSelection 
}) => {
  const [filterType, setFilterType] = useState<string>('todos');

  const filteredAspects = aspects.filter((asp) => {
    if (filterType === 'planeta-planeta') return asp.relationType === 'planeta–planeta';
    if (filterType === 'planeta-angulos') return asp.relationType !== 'planeta–planeta';
    return true;
  });

  return (
    <div id="seccion-aspectos" className="glass-panel-gold p-6 mb-8 overflow-x-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-amber-500/20 pb-3 mb-5">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-widest text-gold-gradient font-sc flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block shadow-[0_0_10px_rgba(216,168,72,0.8)]"></span>
            5. TABLA DE ASPECTOS Y GEOMETRÍA SAGRADA
          </h2>
          <p className="text-xs text-amber-200/60 mt-1">
            Relaciones angulares Armónicas y Dinámicas entre planetas, Ascendente y Medio Cielo.
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 bg-black/60 p-1.5 rounded-xl border border-amber-500/20 text-xs">
          <button
            onClick={() => setFilterType('todos')}
            className={`px-3 py-1 rounded-lg uppercase tracking-wider font-semibold transition-all ${
              filterType === 'todos' ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40 shadow-[0_0_10px_rgba(216,168,72,0.2)]' : 'text-amber-200/50 hover:text-amber-100'
            }`}
          >
            Todos ({aspects.length})
          </button>
          <button
            onClick={() => setFilterType('planeta-planeta')}
            className={`px-3 py-1 rounded-lg uppercase tracking-wider font-semibold transition-all ${
              filterType === 'planeta-planeta' ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40 shadow-[0_0_10px_rgba(216,168,72,0.2)]' : 'text-amber-200/50 hover:text-amber-100'
            }`}
          >
            Planeta - Planeta
          </button>
          <button
            onClick={() => setFilterType('planeta-angulos')}
            className={`px-3 py-1 rounded-lg uppercase tracking-wider font-semibold transition-all ${
              filterType === 'planeta-angulos' ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40 shadow-[0_0_10px_rgba(216,168,72,0.2)]' : 'text-amber-200/50 hover:text-amber-100'
            }`}
          >
            Planeta - Ángulos
          </button>
        </div>
      </div>

      <table className="w-full text-left text-xs text-amber-100 border-collapse">
        <thead>
          <tr className="bg-black/60 border-y border-amber-500/20 text-amber-200/60 font-semibold text-[10px] uppercase tracking-wider font-sc">
            <th className="py-3 px-3">Cuerpo A</th>
            <th className="py-3 px-3 text-center">Aspecto</th>
            <th className="py-3 px-3">Cuerpo B</th>
            <th className="py-3 px-3 text-center">Ángulo Teórico</th>
            <th className="py-3 px-3 text-right">Separación Real</th>
            <th className="py-3 px-3 text-right">Orbe</th>
            <th className="py-3 px-3 text-center">Dinámica</th>
            <th className="py-3 px-3 text-center">Tipo</th>
            <th className="py-3 px-3 text-center">Análisis</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-amber-500/10">
          {filteredAspects.length === 0 ? (
            <tr>
              <td colSpan={9} className="py-8 text-center text-amber-200/50 italic">
                No se encontraron aspectos dentro de los orbes configurados.
              </td>
            </tr>
          ) : (
            filteredAspects.map((asp, idx) => {
              let aspectBadgeColor = 'bg-black/50 text-amber-100 border-amber-500/20';
              if (asp.aspect === 'Conjunción') aspectBadgeColor = 'bg-amber-500/20 text-amber-300 border-amber-400/50';
              if (asp.aspect === 'Sextil') aspectBadgeColor = 'bg-yellow-500/20 text-yellow-300 border-yellow-400/50';
              if (asp.aspect === 'Cuadratura') aspectBadgeColor = 'bg-rose-950/50 text-rose-300 border-rose-800/60';
              if (asp.aspect === 'Trígono') aspectBadgeColor = 'bg-cyan-950/50 text-cyan-300 border-cyan-800/60';
              if (asp.aspect === 'Oposición') aspectBadgeColor = 'bg-purple-950/50 text-purple-300 border-purple-800/60';

              return (
                <tr key={`aspect-row-${idx}`} className="hover:bg-amber-500/10 transition-colors">
                  <td className="py-3 px-3 font-semibold text-amber-100">
                    <span className="mr-1.5 text-base text-amber-300">{asp.bodyASymbol}</span>
                    {asp.bodyA}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full font-bold border text-[10px] uppercase tracking-wider ${aspectBadgeColor}`}>
                      <span>{asp.aspectSymbol}</span>
                      <span>{asp.aspect}</span>
                    </span>
                  </td>
                  <td className="py-3 px-3 font-semibold text-amber-100">
                    <span className="mr-1.5 text-base text-amber-300">{asp.bodyBSymbol}</span>
                    {asp.bodyB}
                  </td>
                  <td className="py-3 px-3 text-center text-amber-200/70 font-mono">
                    {asp.exactAngle}°
                  </td>
                  <td className="py-3 px-3 text-right text-amber-200/50 font-mono">
                    {asp.realSeparation.toFixed(4)}°
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-amber-300 font-mono">
                    {asp.orb.toFixed(4)}°
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider ${
                        asp.motionRelation === 'Aplicativo'
                          ? 'bg-cyan-950/50 text-cyan-300 border border-cyan-800/50'
                          : asp.motionRelation === 'Separativo'
                          ? 'bg-black/50 text-amber-200/50 border border-amber-500/20'
                          : 'bg-amber-950/50 text-amber-300 border border-amber-800/50'
                      }`}
                    >
                      {asp.motionRelation}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center text-amber-200/50 text-[10px] font-sc">
                    {asp.relationType}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <button
                      onClick={() => onAnalyzeSelection?.({
                        configurationType: 'aspect',
                        title: `${asp.bodyA} en ${asp.aspect} con ${asp.bodyB}`,
                        bodies: [asp.bodyA, asp.bodyB],
                        aspect: asp.aspect,
                        separation: asp.realSeparation,
                        orb: asp.orb,
                        phase: asp.motionRelation.toLowerCase(),
                        zodiacSystem: 'tropical',
                        houseSystem: houseSystemLabel
                      })}
                      className="btn-gold-outline px-3 py-1 text-[10px] font-bold inline-flex items-center gap-1"
                      title={`Analizar aspecto ${asp.bodyA} - ${asp.bodyB}`}
                    >
                      <Sparkles className="w-3 h-3 text-amber-300" />
                      Analizar
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

