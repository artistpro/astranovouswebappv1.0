import React, { useState } from 'react';
import { ValidationResult } from '../types';

interface Props {
  validation: ValidationResult;
}

export const ValidationBanner: React.FC<Props> = ({ validation }) => {
  const [isOpen, setIsOpen] = useState(false);

  const passedCount = validation.checks.filter((c) => c.passed).length;
  const totalCount = validation.checks.length;

  return (
    <div
      id="seccion-validaciones-automaticas"
      className={`glass-panel p-5 mb-8 transition-all ${
        validation.isPassed
          ? 'border-amber-500/30'
          : 'bg-rose-950/40 border-rose-600/60'
      }`}
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3.5">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base shadow-md ${
              validation.isPassed
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-[0_0_15px_rgba(216,168,72,0.3)]'
                : 'bg-rose-600/30 text-rose-300 border border-rose-500/50 animate-pulse'
            }`}
          >
            {validation.isPassed ? '✓' : '⚠️'}
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-100 font-sc">
                {validation.statusText}
              </h3>
              <span
                className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                  validation.isPassed
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-rose-950/50 text-rose-300 border border-rose-800/60'
                }`}
              >
                {passedCount} / {totalCount} Pruebas Aprobadas
              </span>
            </div>
            <p className="text-[11px] text-amber-200/50 mt-0.5 font-sans">
              Motor Astronómico: {validation.engineInfo}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="btn-gold-outline px-3.5 py-1.5 text-xs font-bold flex items-center gap-1.5 self-end sm:self-auto"
        >
          <span>{isOpen ? 'Ocultar Auditoría' : 'Ver Registro de Auditoría'}</span>
          <svg
            className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Warning detail if Placidus failed */}
      {validation.placidusError && (
        <div className="mt-3 p-3.5 bg-amber-950/40 border border-amber-600/50 rounded-xl text-xs text-amber-200">
          <p className="font-bold mb-1">⚠️ Advertencia de Latitud Extrema (Sistema Placidus):</p>
          <p>{validation.placidusError}</p>
          <p className="mt-1 italic text-amber-300/80">
            Sugerencia: Se utilizó el sistema de Casas Iguales para completar la tabla de cúspides. Puede seleccionar Whole Sign o Casas Iguales en Opciones Avanzadas.
          </p>
        </div>
      )}

      {/* Expanded Checklist */}
      {isOpen && (
        <div className="mt-4 pt-4 border-t border-amber-500/20 space-y-2">
          <h4 className="text-[11px] font-bold text-amber-200/60 uppercase tracking-wider mb-2 font-sc">
            Desglose de Comprobaciones de Precisión Astronómica:
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
            {validation.checks.map((check, idx) => (
              <div
                key={`check-${idx}`}
                className={`p-3 rounded-xl border flex items-start gap-3 ${
                  check.passed
                    ? 'bg-black/50 border-amber-500/20 text-amber-100'
                    : 'bg-rose-950/40 border-rose-800/60 text-rose-200'
                }`}
              >
                <span
                  className={`inline-flex items-center justify-center w-4.5 h-4.5 rounded-full text-[10px] font-bold shrink-0 mt-0.5 ${
                    check.passed ? 'bg-amber-500/30 text-amber-300 border border-amber-400/50' : 'bg-rose-600 text-white'
                  }`}
                >
                  {check.passed ? '✓' : '✕'}
                </span>
                <div>
                  <p className="font-semibold text-xs text-amber-100">{check.description}</p>
                  <p className="text-[11px] text-amber-200/60 mt-0.5">{check.details}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
