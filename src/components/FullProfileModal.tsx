import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  X, 
  BookOpen, 
  Flame, 
  Globe2, 
  Wind, 
  Droplets, 
  CheckCircle2, 
  AlertTriangle, 
  Compass, 
  Loader2, 
  RefreshCw,
  FileText,
  User,
  Calendar,
  MapPin,
  ChevronDown,
  ChevronUp,
  Printer
} from 'lucide-react';
import { CalculationResponse, FullProfileResponse } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  chartData: CalculationResponse | null;
}

export const FullProfileModal: React.FC<Props> = ({ isOpen, onClose, chartData }) => {
  const [profile, setProfile] = useState<FullProfileResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (isOpen && chartData && !profile) {
      generateFullProfile();
    }
  }, [isOpen, chartData]);

  const generateFullProfile = async () => {
    if (!chartData) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/full-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(chartData),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Error al solicitar el perfil natal general.');
      }

      const data = await res.json();
      setProfile(data);

      // Expand all sections by default
      if (data.sections) {
        const initExpanded: Record<number, boolean> = {};
        data.sections.forEach((_: any, idx: number) => {
          initExpanded[idx] = true;
        });
        setExpandedSections(initExpanded);
      }
    } catch (err: any) {
      console.error('Error in generateFullProfile:', err);
      setError(err?.message || 'Ocurrió un error al generar el perfil general.');
    } fontinally: {
      setLoading(false);
    }
  };

  const toggleSection = (idx: number) => {
    setExpandedSections((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen || !chartData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in font-sans">
      <div className="w-full max-w-4xl bg-[#0f111a] border border-[#2d313d] rounded-2xl text-slate-100 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#2d313d] bg-[#141622] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-100">
                  Perfil Natal General Analizado
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-semibold border border-amber-500/30">
                  Documental
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Síntesis holística de posiciones, casas y aspectos fundamentada en la base de conocimiento
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {profile && (
              <button
                onClick={handlePrint}
                className="p-2 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 transition-colors hidden sm:flex items-center gap-1.5 text-xs font-medium"
                title="Imprimir / Exportar"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* Consultant Info Banner */}
          <div className="p-4 rounded-xl bg-[#141622] border border-[#2d313d] flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2 text-slate-200">
              <User className="w-4 h-4 text-amber-400" />
              <span className="font-bold text-sm text-amber-300">
                {chartData.normalizedData.name || 'Consultante'}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-slate-400">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-400/80" />
                <span>{chartData.normalizedData.locationName}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-400/80" />
                <span>{chartData.normalizedData.localTime}</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-[11px]">
                {chartData.normalizedData.houseSystemLabel}
              </span>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="py-16 text-center space-y-4">
              <div className="relative w-12 h-12 mx-auto">
                <div className="absolute inset-0 rounded-full border-2 border-amber-500/20 animate-ping" />
                <div className="w-12 h-12 rounded-full border-2 border-amber-500 border-t-transparent animate-spin flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-200">
                  Analizando la Carta Natal Completa...
                </p>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Examinando posiciones planetarias, casas, ángulos y aspectos a la luz de los tratados astrológicos cargados.
                </p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs space-y-3">
              <p className="font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                No se pudo generar el perfil natal general.
              </p>
              <p className="text-slate-400">{error}</p>
              <button
                onClick={generateFullProfile}
                className="px-3 py-1.5 rounded-lg bg-rose-800 hover:bg-rose-700 text-white font-semibold text-xs transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Reintentar
              </button>
            </div>
          )}

          {/* Content Profile */}
          {!loading && profile && (
            <div className="space-y-6">

              {/* Executive Summary */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-[#181a28] to-[#121422] border border-[#2d313d] space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                  <Compass className="w-4 h-4" />
                  Diagnóstico y Resumen Ejecutivo Natal
                </h3>
                <p className="text-sm text-slate-200 leading-relaxed font-serif">
                  {profile.executiveSummary}
                </p>
              </div>

              {/* Elemental Balance */}
              <div className="p-5 rounded-2xl bg-[#141622] border border-[#2d313d] space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Balance Temperamental y Elemental
                </h3>

                {/* Elements Visual Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-900/50 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-rose-300 text-xs font-semibold">
                      <Flame className="w-4 h-4 text-rose-500" />
                      <span>Fuego</span>
                    </div>
                    <span className="text-lg font-bold text-rose-400">{profile.elementalBalance.fuego}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-900/50 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-300 text-xs font-semibold">
                      <Globe2 className="w-4 h-4 text-emerald-500" />
                      <span>Tierra</span>
                    </div>
                    <span className="text-lg font-bold text-emerald-400">{profile.elementalBalance.tierra}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-900/50 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-amber-300 text-xs font-semibold">
                      <Wind className="w-4 h-4 text-amber-500" />
                      <span>Aire</span>
                    </div>
                    <span className="text-lg font-bold text-amber-400">{profile.elementalBalance.aire}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-900/50 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-blue-300 text-xs font-semibold">
                      <Droplets className="w-4 h-4 text-blue-500" />
                      <span>Agua</span>
                    </div>
                    <span className="text-lg font-bold text-blue-400">{profile.elementalBalance.agua}</span>
                  </div>
                </div>

                {/* Modalities summary */}
                <div className="flex items-center gap-4 text-xs text-slate-400 px-1 pt-1 border-t border-slate-800">
                  <span>Cardinal: <strong className="text-slate-200">{profile.elementalBalance.cardinal}</strong></span>
                  <span>Fijo: <strong className="text-slate-200">{profile.elementalBalance.fijo}</strong></span>
                  <span>Mutable: <strong className="text-slate-200">{profile.elementalBalance.mutable}</strong></span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed pt-1">
                  {profile.elementalBalance.analysis}
                </p>
              </div>

              {/* Structured Sections */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Análisis Detallado por Módulos Psicodinámicos
                </h3>

                {profile.sections.map((sec, idx) => {
                  const isExpanded = expandedSections[idx] !== false;
                  return (
                    <div
                      key={idx}
                      className="rounded-2xl bg-[#141622] border border-[#2d313d] overflow-hidden transition-all"
                    >
                      <button
                        onClick={() => toggleSection(idx)}
                        className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-800/40 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold flex items-center justify-center shrink-0 border border-amber-500/20">
                            {idx + 1}
                          </span>
                          <h4 className="text-sm font-bold text-slate-100">
                            {sec.title}
                          </h4>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                      </button>

                      {isExpanded && (
                        <div className="p-4 pt-0 border-t border-slate-800/60 space-y-3 text-xs text-slate-300 leading-relaxed">
                          <p className="font-serif whitespace-pre-line text-slate-200 pt-3">
                            {sec.content}
                          </p>

                          {sec.keyInsights && sec.keyInsights.length > 0 && (
                            <div className="pt-2">
                              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block mb-1.5">
                                Aspectos & Claves Relevantes:
                              </span>
                              <ul className="space-y-1">
                                {sec.keyInsights.map((insight, i) => (
                                  <li key={i} className="flex items-start gap-2 text-slate-300">
                                    <span className="text-amber-400 shrink-0 mt-0.5">•</span>
                                    <span>{insight}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Strengths & Challenges */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Strengths */}
                <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-900/40 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Potenciales y Fortalezas Clave
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {profile.keyStrengths.map((str, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-400 shrink-0 mt-0.5">✓</span>
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Challenges */}
                <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-900/40 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Tensiones y Desafíos Evolutivos
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {profile.mainChallenges.map((chal, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-amber-400 shrink-0 mt-0.5">⚠</span>
                        <span>{chal}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Integration Guidance */}
              <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Orientación de Integración Consciente
                </h4>
                <p className="text-xs text-slate-200 leading-relaxed font-serif">
                  {profile.integrationGuidance}
                </p>
              </div>

              {/* Sources */}
              {profile.sources && profile.sources.length > 0 && (
                <div className="p-4 rounded-2xl bg-[#141622] border border-[#2d313d] space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-amber-400" />
                    Fuentes y Literatura Consultada
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {profile.sources.map((src, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
                        <p className="font-semibold text-slate-200 truncate">{src.title}</p>
                        <p className="text-[11px] text-slate-400 truncate">
                          {src.author || 'Autor'} {src.location ? `• ${src.location}` : ''}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#2d313d] bg-[#141622] flex items-center justify-between shrink-0">
          <button
            onClick={generateFullProfile}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Volver a Generar Perfil</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
