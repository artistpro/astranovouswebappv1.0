import React, { useState, useEffect } from 'react';
import {
  AnalysisSelection,
  CalculationRequest,
  TransitResponse,
} from '../types';
import { BiWheelChart } from './BiWheelChart';
import { Sparkles, Calendar, Clock, RefreshCw } from 'lucide-react';
import { DateTime } from 'luxon';

interface Props {
  natalRequest: CalculationRequest;
  onAnalyzeSelection?: (sel: AnalysisSelection) => void;
}

export const TabTransits: React.FC<Props> = ({ natalRequest, onAnalyzeSelection }) => {
  const [transitDateStr, setTransitDateStr] = useState<string>(DateTime.now().toISODate() || '2026-07-27');
  const [transitTimeStr, setTransitTimeStr] = useState<string>('12:00');
  const [viewMode, setViewMode] = useState<'biwheel' | 'aspects' | 'ephemeris'>('biwheel');
  const [transitData, setTransitData] = useState<TransitResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTransits = async (dateVal = transitDateStr, timeVal = transitTimeStr) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/transits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          natalRequest,
          transitDateStr: dateVal,
          transitTimeStr: timeVal,
        }),
      });

      if (!res.ok) {
        throw new Error(`Error en el servidor al calcular tránsitos (${res.status})`);
      }

      const data: TransitResponse = await res.json();
      setTransitData(data);
    } catch (err: any) {
      setError(err?.message || 'Error al conectar con la API de tránsitos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransits();
  }, [natalRequest]);

  const handleSetNow = () => {
    const now = DateTime.now();
    const d = now.toISODate() || '2026-07-27';
    const t = now.toFormat('HH:mm');
    setTransitDateStr(d);
    setTransitTimeStr(t);
    fetchTransits(d, t);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Header Card */}
      <div className="glass-panel-gold p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 font-sc font-bold text-xs uppercase tracking-widest mb-3">
              <span>🪐</span>
              <span>Módulo de Tránsitos Planetarios Astrológicos</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-serif font-bold text-gold-gradient tracking-wide">
              Tránsitos Astrológicos en Tiempo Real
            </h1>
            <p className="text-xs sm:text-sm text-amber-200/70 mt-1 max-w-2xl">
              Compara el cielo en tránsito para cualquier momento histórico o futuro directamente sobre la carta natal de{' '}
              <strong className="text-amber-300 font-bold">{natalRequest.name || 'Consultante'}</strong>.
            </p>
          </div>

          {/* Date Picker Controls */}
          <div className="flex flex-wrap items-center gap-3 bg-black/60 p-3 rounded-2xl border border-amber-500/30 shadow-xl">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
              <input
                type="date"
                value={transitDateStr}
                onChange={(e) => setTransitDateStr(e.target.value)}
                className="bg-black/60 text-amber-100 border border-amber-500/30 rounded-lg px-3 py-1.5 text-xs font-mono focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400 shrink-0" />
              <input
                type="time"
                value={transitTimeStr}
                onChange={(e) => setTransitTimeStr(e.target.value)}
                className="bg-black/60 text-amber-100 border border-amber-500/30 rounded-lg px-3 py-1.5 text-xs font-mono focus:outline-none focus:border-amber-400"
              />
            </div>

            <button
              onClick={handleSetNow}
              className="btn-gold-outline px-3 py-1.5 text-xs font-bold flex items-center gap-1.5"
              title="Establecer fecha y hora actual"
            >
              <RefreshCw className="w-3.5 h-3.5 text-amber-300" />
              <span>Ahora</span>
            </button>

            <button
              onClick={() => fetchTransits()}
              disabled={loading}
              className="btn-gold-metallic px-4 py-1.5 text-xs font-bold flex items-center gap-2 shadow-lg"
            >
              <span>{loading ? 'Calculando...' : 'Calcular Tránsitos'}</span>
            </button>
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-2 mt-6 pt-5 border-t border-amber-500/20">
          <button
            onClick={() => setViewMode('biwheel')}
            className={
              viewMode === 'biwheel'
                ? 'btn-gold-metallic px-4 py-2 text-xs font-bold shadow-lg'
                : 'btn-gold-outline px-4 py-2 text-xs font-bold'
            }
          >
            ⭕ Rueda Doble (Bi-Wheel)
          </button>
          <button
            onClick={() => setViewMode('aspects')}
            className={
              viewMode === 'aspects'
                ? 'btn-gold-metallic px-4 py-2 text-xs font-bold shadow-lg'
                : 'btn-gold-outline px-4 py-2 text-xs font-bold'
            }
          >
            📊 Aspectos Tránsito ➔ Natal
          </button>
          <button
            onClick={() => setViewMode('ephemeris')}
            className={
              viewMode === 'ephemeris'
                ? 'btn-gold-metallic px-4 py-2 text-xs font-bold shadow-lg'
                : 'btn-gold-outline px-4 py-2 text-xs font-bold'
            }
          >
            🌌 Efemérides de Tránsito
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
          <p className="font-sc text-sm uppercase tracking-widest">Calculando efemérides de tránsito y geometría inter-astral...</p>
        </div>
      ) : transitData ? (
        <>
          {viewMode === 'biwheel' && (
            <BiWheelChart
              natalChart={transitData.natalChart}
              outerPlanets={transitData.transitPlanets}
              outerTitle={`Tránsitos (${transitData.transitDateStr})`}
              interAspects={transitData.interAspects}
              personName={natalRequest.name}
              subtitle={`Tránsitos para el ${transitData.transitDateStr} a las ${transitData.transitTimeStr}`}
              onAnalyzeSelection={onAnalyzeSelection}
            />
          )}

          {viewMode === 'aspects' && (
            <div className="glass-panel-gold p-6 overflow-x-auto">
              <h3 className="text-sm font-bold uppercase tracking-widest text-gold-gradient font-sc mb-4 border-b border-amber-500/20 pb-2">
                Tabla de Aspectos Cruzados: Planetas en Tránsito ➔ Natal
              </h3>
              <table className="w-full text-left text-xs text-amber-100 border-collapse">
                <thead>
                  <tr className="bg-black/60 border-y border-amber-500/20 text-amber-200/60 font-semibold text-[10px] uppercase font-sc">
                    <th className="py-3 px-4">Planeta en Tránsito</th>
                    <th className="py-3 px-4 text-center">Aspecto</th>
                    <th className="py-3 px-4">Factor Natal</th>
                    <th className="py-3 px-4 text-right">Separación</th>
                    <th className="py-3 px-4 text-right">Orbe</th>
                    <th className="py-3 px-4 text-center">Movimiento</th>
                    <th className="py-3 px-4 text-center">Análisis IA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-500/10 font-mono">
                  {transitData.interAspects.map((asp, idx) => (
                    <tr key={`inter-asp-${idx}`} className="hover:bg-amber-500/10 transition-colors">
                      <td className="py-2.5 px-4 font-semibold text-cyan-300">
                        <span className="mr-1.5 text-base">{asp.transitSymbol}</span>
                        {asp.transitBody} (Tránsito)
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
                      <td className="py-2.5 px-4 text-center text-[10px] text-amber-200/60 uppercase">
                        {asp.motionRelation}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <button
                          onClick={() =>
                            onAnalyzeSelection?.({
                              configurationType: 'aspect',
                              title: `${asp.transitBody} en Tránsito en ${asp.aspect} con ${asp.natalBody} Natal`,
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

          {viewMode === 'ephemeris' && (
            <div className="glass-panel-gold p-6 overflow-x-auto">
              <h3 className="text-sm font-bold uppercase tracking-widest text-gold-gradient font-sc mb-4 border-b border-amber-500/20 pb-2">
                Posiciones de Efemérides de los Planetas en Tránsito
              </h3>
              <table className="w-full text-left text-xs text-amber-100 border-collapse">
                <thead>
                  <tr className="bg-black/60 border-y border-amber-500/20 text-amber-200/60 font-semibold text-[10px] uppercase font-sc">
                    <th className="py-3 px-4">Cuerpo</th>
                    <th className="py-3 px-4">Signo</th>
                    <th className="py-3 px-4">Posición DMS</th>
                    <th className="py-3 px-4 text-right">Velocidad (°/día)</th>
                    <th className="py-3 px-4 text-center">Estado</th>
                    <th className="py-3 px-4 text-center">Casa Natal Ocupada</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-500/10 font-mono">
                  {transitData.transitPlanets.map((tp) => {
                    const occ = transitData.transitHouseOccupations.find((h) => h.transitBody === tp.name);
                    return (
                      <tr key={`tp-${tp.key}`} className="hover:bg-amber-500/10 transition-colors">
                        <td className="py-2.5 px-4 font-semibold text-cyan-300">
                          <span className="mr-1.5 text-base">{tp.symbol}</span>
                          {tp.name}
                        </td>
                        <td className="py-2.5 px-4">
                          <span className="mr-1.5 text-amber-300">{tp.signSymbol}</span>
                          {tp.sign}
                        </td>
                        <td className="py-2.5 px-4">{tp.formattedDMS}</td>
                        <td className="py-2.5 px-4 text-right text-amber-200/50">{tp.speed.toFixed(4)}</td>
                        <td className="py-2.5 px-4 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-black/50 text-amber-200/80 border border-amber-500/20">
                            {tp.motion}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-center font-bold text-amber-300">
                          Casa {occ?.houseInNatal || 1} Natal
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
};
