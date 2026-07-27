import React, { useState, useEffect } from 'react';
import {
  AnalysisSelection,
  CalculationRequest,
  SolarReturnResponse,
} from '../types';
import { BiWheelChart } from './BiWheelChart';
import { NatalWheel } from './NatalWheel';
import { Sparkles, Sun, Calendar } from 'lucide-react';
import { DateTime } from 'luxon';

interface Props {
  natalRequest: CalculationRequest;
  onAnalyzeSelection?: (sel: AnalysisSelection) => void;
}

export const TabSolarReturn: React.FC<Props> = ({ natalRequest, onAnalyzeSelection }) => {
  const [targetYear, setTargetYear] = useState<number>(DateTime.now().year);
  const [viewMode, setViewMode] = useState<'biwheel' | 'single' | 'aspects'>('biwheel');
  const [srData, setSrData] = useState<SolarReturnResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSolarReturn = async (yearVal = targetYear) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/solar-return', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          natalRequest,
          targetYear: yearVal,
        }),
      });

      if (!res.ok) {
        throw new Error(`Error en la API de Revolución Solar (${res.status})`);
      }

      const data: SolarReturnResponse = await res.json();
      setSrData(data);
    } catch (err: any) {
      setError(err?.message || 'Error al calcular Revolución Solar.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSolarReturn();
  }, [natalRequest]);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Solar Return Top Header Card */}
      <div className="glass-panel-gold p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300 font-sc font-bold text-xs uppercase tracking-widest mb-3">
              <Sun className="w-4 h-4 text-amber-400" />
              <span>Módulo de Revolución Solar (Retorno Solar Exacto)</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-serif font-bold text-gold-gradient tracking-wide">
              Revolución Solar Año {targetYear}
            </h1>
            <p className="text-xs sm:text-sm text-amber-200/70 mt-1 max-w-2xl">
              Calcula el instante UTC exacto en el que el Sol regresa al grado y segundo de arco preciso de la carta natal de{' '}
              <strong className="text-amber-300 font-bold">{natalRequest.name || 'Consultante'}</strong>.
            </p>
          </div>

          {/* Controls for selecting Year */}
          <div className="flex flex-wrap items-center gap-3 bg-black/60 p-3 rounded-2xl border border-amber-500/30 shadow-xl">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-xs text-amber-200/60 font-sc uppercase">Año Objetivo:</span>
              <select
                value={targetYear}
                onChange={(e) => {
                  const yr = parseInt(e.target.value, 10);
                  setTargetYear(yr);
                  fetchSolarReturn(yr);
                }}
                className="bg-black/60 text-amber-100 border border-amber-500/30 rounded-lg px-3 py-1.5 text-xs font-bold font-mono focus:outline-none focus:border-amber-400"
              >
                {Array.from({ length: 30 }, (_, i) => DateTime.now().year - 10 + i).map((y) => (
                  <option key={`yr-${y}`} value={y} className="bg-black text-amber-100">
                    Año {y}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => fetchSolarReturn()}
              disabled={loading}
              className="btn-gold-metallic px-4 py-1.5 text-xs font-bold flex items-center gap-2 shadow-lg"
            >
              <span>{loading ? 'Calculando...' : 'Calcular Retorno Solar'}</span>
            </button>
          </div>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center gap-2 mt-6 pt-5 border-t border-amber-500/20">
          <button
            onClick={() => setViewMode('biwheel')}
            className={
              viewMode === 'biwheel'
                ? 'btn-gold-metallic px-4 py-2 text-xs font-bold shadow-lg'
                : 'btn-gold-outline px-4 py-2 text-xs font-bold'
            }
          >
            ⭕ Rueda Doble (Rev. Solar + Natal)
          </button>
          <button
            onClick={() => setViewMode('single')}
            className={
              viewMode === 'single'
                ? 'btn-gold-metallic px-4 py-2 text-xs font-bold shadow-lg'
                : 'btn-gold-outline px-4 py-2 text-xs font-bold'
            }
          >
            ☀️ Rueda Simple de Revolución Solar
          </button>
          <button
            onClick={() => setViewMode('aspects')}
            className={
              viewMode === 'aspects'
                ? 'btn-gold-metallic px-4 py-2 text-xs font-bold shadow-lg'
                : 'btn-gold-outline px-4 py-2 text-xs font-bold'
            }
          >
            📊 Aspectos Rev. Solar ➔ Natal
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-950/80 border border-rose-500/40 text-rose-200 p-4 rounded-xl text-xs">
          ❌ {error}
        </div>
      )}

      {loading ? (
        <div className="glass-panel-gold p-12 text-center text-amber-200/70 space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-amber-400 border-t-transparent animate-spin mx-auto"></div>
          <p className="font-sc text-sm uppercase tracking-widest">Ejecutando algoritmo numérico para hallar el segundo de arco exacto del retorno solar...</p>
        </div>
      ) : srData ? (
        <>
          {/* Key Solar Return Summary Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-panel-gold p-5 text-center">
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-200/60 font-sc block mb-1">
                INSTANTE EXACTO DEL RETORNO SOLAR
              </span>
              <p className="text-xl font-bold text-amber-300 font-serif">{srData.exactReturnDateStr}</p>
              <p className="text-xs text-amber-200/60 font-mono mt-1">{srData.exactReturnTimeStr} UTC</p>
            </div>

            <div className="glass-panel-gold p-5 text-center">
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-200/60 font-sc block mb-1">
                ASCENDENTE DE REVOLUCIÓN SOLAR
              </span>
              <p className="text-xl font-bold text-amber-300 font-serif">
                {srData.solarReturnChart.angles.find((a) => a.key === 'ascendant')?.sign}
              </p>
              <p className="text-xs text-amber-200/60 font-mono mt-1">
                En Casa Natal <span className="text-amber-300 font-bold">{srData.solarReturnAscInNatalHouse}</span>
              </p>
            </div>

            <div className="glass-panel-gold p-5 text-center">
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-200/60 font-sc block mb-1">
                MEDIO CIELO DE REVOLUCIÓN SOLAR
              </span>
              <p className="text-xl font-bold text-amber-300 font-serif">
                {srData.solarReturnChart.angles.find((a) => a.key === 'midheaven')?.sign}
              </p>
              <p className="text-xs text-amber-200/60 font-mono mt-1">
                En Casa Natal <span className="text-amber-300 font-bold">{srData.solarReturnMcInNatalHouse}</span>
              </p>
            </div>
          </div>

          {viewMode === 'biwheel' && (
            <BiWheelChart
              natalChart={srData.natalChart}
              outerPlanets={srData.solarReturnChart.planets}
              outerTitle={`Rev. Solar ${srData.targetYear}`}
              interAspects={srData.interAspects}
              personName={natalRequest.name}
              subtitle={`Momento exacto: ${srData.exactReturnDateStr} a las ${srData.exactReturnTimeStr} UTC`}
              onAnalyzeSelection={onAnalyzeSelection}
            />
          )}

          {viewMode === 'single' && (
            <NatalWheel
              planets={srData.solarReturnChart.planets}
              angles={srData.solarReturnChart.angles}
              houseCusps={srData.solarReturnChart.houseCusps}
              aspects={srData.solarReturnChart.aspects}
              personName={`${natalRequest.name} (Rev. Solar ${srData.targetYear})`}
              locationName={srData.solarReturnChart.normalizedData.locationName}
              normalizedData={{
                dateStr: srData.exactReturnDateStr,
                timeStr: srData.exactReturnTimeStr,
                houseSystem: srData.solarReturnChart.normalizedData.houseSystem,
              }}
            />
          )}

          {viewMode === 'aspects' && (
            <div className="glass-panel-gold p-6 overflow-x-auto">
              <h3 className="text-sm font-bold uppercase tracking-widest text-gold-gradient font-sc mb-4 border-b border-amber-500/20 pb-2">
                Tabla de Aspectos Cruzados: Revolución Solar ➔ Carta Natal
              </h3>
              <table className="w-full text-left text-xs text-amber-100 border-collapse">
                <thead>
                  <tr className="bg-black/60 border-y border-amber-500/20 text-amber-200/60 font-semibold text-[10px] uppercase font-sc">
                    <th className="py-3 px-4">Planeta de Rev. Solar</th>
                    <th className="py-3 px-4 text-center">Aspecto</th>
                    <th className="py-3 px-4">Planeta Natal</th>
                    <th className="py-3 px-4 text-right">Separación</th>
                    <th className="py-3 px-4 text-right">Orbe</th>
                    <th className="py-3 px-4 text-center">Análisis IA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-500/10 font-mono">
                  {srData.interAspects.map((asp, idx) => (
                    <tr key={`sr-asp-${idx}`} className="hover:bg-amber-500/10 transition-colors">
                      <td className="py-2.5 px-4 font-semibold text-amber-300">
                        <span className="mr-1.5 text-base">{asp.transitSymbol}</span>
                        {asp.transitBody} (Rev. Solar)
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40 text-[10px] uppercase">
                          <span>{asp.aspectSymbol}</span>
                          <span>{asp.aspect}</span>
                        </span>
                      </td>
                      <td className="py-2.5 px-4 font-semibold text-amber-100">
                        <span className="mr-1.5 text-base text-amber-300">{asp.natalSymbol}</span>
                        {asp.natalBody} (Natal)
                      </td>
                      <td className="py-2.5 px-4 text-right text-amber-200/50">
                        {asp.realSeparation.toFixed(4)}°
                      </td>
                      <td className="py-2.5 px-4 text-right font-bold text-amber-300">
                        {asp.orb.toFixed(4)}°
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <button
                          onClick={() =>
                            onAnalyzeSelection?.({
                              configurationType: 'aspect',
                              title: `${asp.transitBody} en Rev. Solar en ${asp.aspect} con ${asp.natalBody} Natal`,
                              bodies: [asp.transitBody, asp.natalBody],
                              aspect: asp.aspect,
                              orb: asp.orb,
                            })
                          }
                          className="btn-gold-outline px-3 py-1 text-[10px] font-bold inline-flex items-center gap-1"
                        >
                          <Sparkles className="w-3 h-3 text-amber-300" />
                          Analizar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
};
