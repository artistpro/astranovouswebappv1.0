import React, { useState } from 'react';
import { CalculationRequest } from '../types';
import { Moon, Sparkles, UserCheck } from 'lucide-react';
import { DateTime } from 'luxon';

interface Props {
  natalRequest: CalculationRequest;
  onAnalyzeSelection?: (sel: any) => void;
}

export const TabProgressions: React.FC<Props> = ({ natalRequest, onAnalyzeSelection }) => {
  const [targetAge, setTargetAge] = useState<number>(33);

  // Calculate progressed date: Birth Date + targetAge days
  const birthDt = DateTime.fromISO(natalRequest.dateStr);
  const progressedDt = birthDt.isValid ? birthDt.plus({ days: targetAge }) : DateTime.now();

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="glass-panel-gold p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-400/30 text-purple-300 font-sc font-bold text-xs uppercase tracking-widest mb-3">
              <Moon className="w-4 h-4 text-purple-400" />
              <span>Módulo de Progresiones Secundarias (1 Día = 1 Año)</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-serif font-bold text-gold-gradient tracking-wide">
              Mapa Progresado (Edad {targetAge} años)
            </h1>
            <p className="text-xs sm:text-sm text-amber-200/70 mt-1 max-w-2xl">
              La técnica simbólica tradicional basada en el principio hermético donde cada día solar posterior al nacimiento representa un año de evolución vital.
            </p>
          </div>

          <div className="bg-black/60 p-4 rounded-2xl border border-amber-500/30 shadow-xl space-y-2 shrink-0">
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-amber-200/70 font-sc uppercase">Edad Objetivo:</span>
              <span className="text-lg font-bold text-amber-300 font-mono">{targetAge} años</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={targetAge}
              onChange={(e) => setTargetAge(parseInt(e.target.value, 10))}
              className="w-48 accent-amber-400 cursor-pointer"
            />
            <p className="text-[10px] text-amber-200/50 text-right font-mono">
              Fecha Progresada equivalente: {progressedDt.toISODate()}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel-gold p-6 space-y-3">
          <h3 className="font-bold text-gold-gradient font-sc text-sm border-b border-amber-500/20 pb-2 flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-amber-400" />
            <span>Luna Progresada (El Reloj de la Vida)</span>
          </h3>
          <p className="text-xs text-amber-100 leading-relaxed font-sans">
            La Luna progresada se desplaza aproximadamente 1° por mes (13° por año), marcando los ciclos emocionales principales de 2.5 años por cada signo zodiacal.
          </p>
          <div className="bg-black/40 p-4 rounded-xl border border-amber-500/20 text-xs font-mono space-y-1">
            <p className="text-amber-300 font-bold">• Ciclo de Retorno de la Luna Progresada: 27.3 años</p>
            <p className="text-amber-200/70">• Fase actual estimada para edad {targetAge}: Ciclo II de madurez emocional</p>
          </div>
        </div>

        <div className="glass-panel-gold p-6 space-y-3">
          <h3 className="font-bold text-gold-gradient font-sc text-sm border-b border-amber-500/20 pb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Sol Progresado y Cambio de Signo</span>
          </h3>
          <p className="text-xs text-amber-100 leading-relaxed font-sans">
            El Sol progresado avanza 1° por año de vida. A lo largo de la existencia de una persona, el Sol cambiará de signo zodiacal 2 o 3 veces, marcando fases profundas de cambio de identidad.
          </p>
          <div className="bg-black/40 p-4 rounded-xl border border-amber-500/20 text-xs font-mono space-y-1">
            <p className="text-amber-300 font-bold">• Desplazamiento acumulado: +{targetAge}° de longitud eclíptica</p>
            <p className="text-amber-200/70">• Énfasis vital: Reorientación de metas primarias</p>
          </div>
        </div>
      </div>
    </div>
  );
};
