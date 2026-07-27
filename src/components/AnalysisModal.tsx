import React, { useState, useEffect } from 'react';
import { AnalysisSelection, AnalysisResponse } from '../types';
import { 
  Sparkles, 
  BookOpen, 
  Loader2, 
  X, 
  RotateCw, 
  BookmarkCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Layers, 
  Compass, 
  ShieldAlert,
  FileText
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  selection: AnalysisSelection | null;
  chartId?: string;
}

export const AnalysisModal: React.FC<Props> = ({ isOpen, onClose, selection, chartId }) => {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen && selection) {
      fetchAnalysis(false);
    } else {
      setResponse(null);
      setError(null);
    }
  }, [isOpen, selection]);

  const fetchAnalysis = async (forceRegenerate = false) => {
    if (!selection) return;

    setLoading(true);
    setError(null);
    setSavedSuccess(false);

    try {
      const res = await fetch('/api/interpretations/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chartId: chartId || 'current_chart',
          selection,
          options: {
            depth: 'full',
            approach: 'integrated',
            language: 'es'
          },
          forceRegenerate
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || errData.details || `Error HTTP ${res.status}`);
      }

      const data: AnalysisResponse = await res.json();
      setResponse(data);
    } catch (err: any) {
      console.error('Error fetching analysis:', err);
      setError(err?.message || 'Error al conectar con el servicio de análisis astrológico.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToLocal = () => {
    if (!response) return;
    try {
      const key = 'astrologia_interpretations_saved';
      const raw = localStorage.getItem(key);
      const existing = raw ? JSON.parse(raw) : [];
      const updated = [response, ...existing.filter((item: any) => item.id !== response.id)];
      localStorage.setItem(key, JSON.stringify(updated));
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (e) {
      console.error('Error saving interpretation:', e);
    }
  };

  if (!isOpen || !selection) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-2xl bg-[#0f111a] border-l border-[#2d313d] text-slate-100 flex flex-col h-full shadow-2xl overflow-hidden font-sans">
        
        {/* Header */}
        <div className="p-5 border-b border-[#2d313d] bg-[#141622] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  {selection.configurationType}
                </span>
                {response?.cached && (
                  <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                    En Caché
                  </span>
                )}
              </div>
              <h2 className="text-base font-bold text-slate-100 mt-1">
                {selection.title}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 transition-colors"
            title="Cerrar panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-full border-2 border-amber-500/20 border-t-amber-500 animate-spin" />
                <Sparkles className="w-5 h-5 text-amber-400 absolute inset-0 m-auto" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-200">
                  Consultando Base Documental Astrológica...
                </p>
                <p className="text-xs text-slate-400 mt-1 max-w-sm">
                  Recuperando fragmentos y generando síntesis mediante Gemini API y File Search Store.
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm text-rose-200">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                No se pudo realizar el análisis
              </div>
              <p>{error}</p>
              <button
                onClick={() => fetchAnalysis(true)}
                className="mt-2 px-3 py-1.5 rounded-lg bg-rose-900/60 hover:bg-rose-800 text-rose-100 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <RotateCw className="w-3.5 h-3.5" /> Reintentar
              </button>
            </div>
          ) : response ? (
            <>
              {/* Unconfigured Store Warning Banner */}
              {(!response.storeConfigured || response.summary === 'Base documental astrológica no configurada') && (
                <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-200 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold text-sm text-amber-300">
                    <ShieldAlert className="w-4 h-4 text-amber-400" />
                    Base documental astrológica no configurada
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    Para habilitar el análisis documental enriquecido con libros y manuscritos astrológicos, debes configurar la variable de entorno <code className="bg-slate-900 px-1.5 py-0.5 rounded text-amber-300 font-mono">FILE_SEARCH_STORE_ID</code> en el panel de Configuración / Secretos.
                  </p>
                </div>
              )}

              {/* Insufficient sources warning */}
              {response.summary === 'Las fuentes disponibles no permiten desarrollar un análisis suficiente' && (
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs flex items-start gap-3">
                  <BookOpen className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-slate-200">Información Documental Insuficiente</h4>
                    <p className="text-slate-400 mt-0.5 leading-relaxed">
                      Las fuentes disponibles en la base documental no permiten desarrollar un análisis suficiente para esta configuración astrológica específica.
                    </p>
                  </div>
                </div>
              )}

              {/* Resumen */}
              {response.summary && response.summary !== 'Base documental astrológica no configurada' && response.summary !== 'Las fuentes disponibles no permiten desarrollar un análisis suficiente' && (
                <div className="p-4 rounded-xl bg-slate-900/80 border border-[#2d313d]">
                  <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4" />
                    Resumen Ejecutivo
                  </h3>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {response.summary}
                  </p>
                </div>
              )}

              {/* Dinámica Central */}
              {response.centralDynamic && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                    <Compass className="w-4 h-4" />
                    Dinámica Psicodinámica Central
                  </h3>
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-[#2d313d] text-xs text-slate-300 leading-relaxed">
                    {response.centralDynamic}
                  </div>
                </div>
              )}

              {/* Expresiones Constructivas */}
              {response.constructiveExpressions && response.constructiveExpressions.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Expresión Constructiva y Potenciales
                  </h3>
                  <ul className="space-y-1.5">
                    {response.constructiveExpressions.map((item, idx) => (
                      <li key={idx} className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-900/40 text-xs text-emerald-200/90 flex items-start gap-2">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Tensiones Posibles */}
              {response.possibleTensions && response.possibleTensions.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Fricciones y Tensiones Posibles
                  </h3>
                  <ul className="space-y-1.5">
                    {response.possibleTensions.map((item, idx) => (
                      <li key={idx} className="p-2.5 rounded-lg bg-rose-950/20 border border-rose-900/40 text-xs text-rose-200/90 flex items-start gap-2">
                        <span className="text-rose-400 font-bold">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Pautas de Integración */}
              {response.integration && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-2">
                    <Layers className="w-4 h-4" />
                    Integración y Recomendación Consciente
                  </h3>
                  <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-900/40 text-xs text-purple-200/90 leading-relaxed">
                    {response.integration}
                  </div>
                </div>
              )}

              {/* Factores Modificadores */}
              {response.modifyingFactors && response.modifyingFactors.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-amber-400/80 uppercase tracking-wider">
                    Factores Matizadores y Orbes
                  </h3>
                  <ul className="space-y-1">
                    {response.modifyingFactors.map((factor, idx) => (
                      <li key={idx} className="text-xs text-slate-400 bg-slate-900/40 px-3 py-1.5 rounded border border-slate-800">
                        {factor}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Fuentes Consultadas */}
              {response.sources && response.sources.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-[#2d313d]">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-amber-500" />
                    Fuentes Documentales Consultadas
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    {response.sources.map((src, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs flex flex-col justify-between">
                        <span className="font-semibold text-slate-200">{src.title}</span>
                        {(src.author || src.location) && (
                          <span className="text-[11px] text-slate-400 mt-0.5">
                            {src.author ? `Por ${src.author}` : ''} {src.location ? `• ${src.location}` : ''}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </>
          ) : null}

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#2d313d] bg-[#141622] flex items-center justify-between gap-3">
          <button
            onClick={() => fetchAnalysis(true)}
            disabled={loading}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Regenerar
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveToLocal}
              disabled={loading || !response || savedSuccess}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                savedSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-amber-600 hover:bg-amber-500 text-white'
              } disabled:opacity-50`}
            >
              {savedSuccess ? (
                <>
                  <BookmarkCheck className="w-3.5 h-3.5" /> Guardado
                </>
              ) : (
                <>
                  <BookmarkCheck className="w-3.5 h-3.5" /> Guardar Interpretación
                </>
              )}
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
    </div>
  );
};
