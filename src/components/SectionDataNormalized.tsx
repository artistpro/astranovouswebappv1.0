import React from 'react';
import { NormalizedData } from '../types';

interface Props {
  data: NormalizedData;
}

export const SectionDataNormalized: React.FC<Props> = ({ data }) => {
  return (
    <div id="seccion-datos-normalizados" className="glass-panel-gold p-6 mb-8 relative overflow-hidden">
      <div className="border-b border-amber-500/20 pb-3 mb-5 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-widest text-gold-gradient font-sc flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block shadow-[0_0_10px_rgba(216,168,72,0.8)]"></span>
            1. DATOS NORMALIZADOS DE EFEMÉRIDES
          </h2>
          <p className="text-xs text-amber-200/60 mt-1">
            Parámetros espacio-temporales e IANA ajustados a tiempo universal coordinado (VSOP87).
          </p>
        </div>
        <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono text-[11px]">
          JD {data.julianDayUT.toFixed(4)}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 text-xs">
        <div className="p-3.5 bg-black/40 rounded-xl border border-amber-500/20 hover:border-amber-400/50 transition-colors">
          <span className="text-amber-200/50 text-[10px] uppercase font-bold block mb-1">Nombre / Consultante</span>
          <span className="text-amber-100 font-bold text-sm truncate block">{data.name}</span>
        </div>

        <div className="p-3.5 bg-black/40 rounded-xl border border-amber-500/20 hover:border-amber-400/50 transition-colors">
          <span className="text-amber-200/50 text-[10px] uppercase font-bold block mb-1">Lugar Normalizado</span>
          <span className="text-amber-100 font-semibold text-xs truncate block">{data.locationName}</span>
        </div>

        <div className="p-3.5 bg-black/40 rounded-xl border border-amber-500/20 hover:border-amber-400/50 transition-colors">
          <span className="text-amber-200/50 text-[10px] uppercase font-bold block mb-1">Latitud Geográfica</span>
          <span className="text-amber-100 font-semibold text-xs block">
            {Math.abs(data.latitude).toFixed(4)}° {data.latitude >= 0 ? 'N' : 'S'}
          </span>
        </div>

        <div className="p-3.5 bg-black/40 rounded-xl border border-amber-500/20 hover:border-amber-400/50 transition-colors">
          <span className="text-amber-200/50 text-[10px] uppercase font-bold block mb-1">Longitud Geográfica</span>
          <span className="text-amber-100 font-semibold text-xs block">
            {Math.abs(data.longitude).toFixed(4)}° {data.longitude >= 0 ? 'E' : 'O'}
          </span>
        </div>

        <div className="p-3.5 bg-black/40 rounded-xl border border-amber-500/20 hover:border-amber-400/50 transition-colors">
          <span className="text-amber-200/50 text-[10px] uppercase font-bold block mb-1">Zona Histórica IANA</span>
          <span className="text-amber-300 font-semibold text-xs block">{data.ianaZone}</span>
        </div>

        <div className="p-3.5 bg-black/40 rounded-xl border border-amber-500/20 hover:border-amber-400/50 transition-colors">
          <span className="text-amber-200/50 text-[10px] uppercase font-bold block mb-1">Hora Local Ingresada</span>
          <span className="text-amber-100 font-semibold text-xs block">{data.localTime}</span>
        </div>

        <div className="p-3.5 bg-black/40 rounded-xl border border-amber-500/20 hover:border-amber-400/50 transition-colors">
          <span className="text-amber-200/50 text-[10px] uppercase font-bold block mb-1">Offset Histórico</span>
          <span className="text-amber-100 font-semibold text-xs block">{data.utcOffset}</span>
        </div>

        <div className="p-3.5 bg-black/40 rounded-xl border border-amber-500/20 hover:border-amber-400/50 transition-colors">
          <span className="text-amber-200/50 text-[10px] uppercase font-bold block mb-1">Hora UTC Calculada</span>
          <span className="text-amber-100 font-semibold text-xs block">{data.utcTime}</span>
        </div>

        <div className="p-3.5 bg-black/40 rounded-xl border border-amber-500/20 hover:border-amber-400/50 transition-colors">
          <span className="text-amber-200/50 text-[10px] uppercase font-bold block mb-1">Día Juliano (UT)</span>
          <span className="text-amber-100 font-semibold text-xs block font-mono">{data.julianDayUT.toFixed(6)}</span>
        </div>

        <div className="p-3.5 bg-black/40 rounded-xl border border-amber-500/20 hover:border-amber-400/50 transition-colors">
          <span className="text-amber-200/50 text-[10px] uppercase font-bold block mb-1">Sistema de Casas</span>
          <span className="text-amber-400 font-bold text-xs uppercase block">{data.houseSystemLabel}</span>
        </div>
      </div>
    </div>
  );
};
