import React from 'react';
import { DEFAULT_ORBS, HOUSE_SYSTEMS, HouseSystem, OrbsConfig } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  selectedHouseSystem: HouseSystem;
  onSelectHouseSystem: (system: HouseSystem) => void;
  orbs: OrbsConfig;
  onChangeOrbs: (newOrbs: OrbsConfig) => void;
}

export const AdvancedOptionsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  selectedHouseSystem,
  onSelectHouseSystem,
  orbs,
  onChangeOrbs,
}) => {
  if (!isOpen) return null;

  const handleOrbChange = (
    category: 'planetPlanet' | 'planetAngle',
    aspect: keyof OrbsConfig['planetPlanet'],
    value: number
  ) => {
    const val = Math.max(0.1, Math.min(15, value));
    onChangeOrbs({
      ...orbs,
      [category]: {
        ...orbs[category],
        [aspect]: val,
      },
    });
  };

  const handleResetDefaults = () => {
    onSelectHouseSystem('placidus');
    onChangeOrbs(DEFAULT_ORBS);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0b10]/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto font-mono">
      <div className="bg-[#14161f] rounded-sm border border-[#2d313d] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center pb-4 mb-5 border-b border-[#2d313d]">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-amber-500 flex items-center gap-2">
              <span>⚙</span> OPCIONES AVANZADAS DE CÁLCULO
            </h3>
            <p className="text-[10px] text-[#6b7280] mt-0.5">
              Personalización del sistema de domificación (casas) y orbes de aspectos.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-sm bg-[#0a0b10] border border-[#2d313d] text-[#6b7280] hover:text-[#e0e2e8] flex items-center justify-center font-bold text-xs transition-colors"
          >
            ✕
          </button>
        </div>

        {/* 1. Selector de Sistema de Casas */}
        <div className="mb-6">
          <label className="block text-[10px] font-bold text-[#6b7280] uppercase tracking-wider mb-2">
            Sistema de Domificación (Casas Astrológicas):
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {HOUSE_SYSTEMS.map((sys) => {
              const isSelected = selectedHouseSystem === sys.id;
              return (
                <button
                  key={sys.id}
                  type="button"
                  onClick={() => onSelectHouseSystem(sys.id)}
                  className={`p-3 text-left rounded-sm border transition-all text-xs ${
                    isSelected
                      ? 'bg-[#1c1e29] border-amber-500 text-amber-400 font-bold'
                      : 'bg-[#0a0b10] border-[#2d313d] hover:bg-[#1c1e29] text-[#9ca3af]'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold mb-1">
                    <span>{sys.name}</span>
                    {sys.id === 'placidus' && (
                      <span className="text-[9px] bg-amber-500/20 text-amber-400 border border-amber-500/40 px-1.5 py-0.5 rounded-sm uppercase">
                        Predeterminado
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-[#6b7280] leading-snug">{sys.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Edición de Orbes */}
        <div className="mb-6 border-t border-[#2d313d] pt-5">
          <h4 className="text-[10px] font-bold text-[#6b7280] uppercase tracking-wider mb-3">
            Tolerancia de Orbes Máximos (° Grados):
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Orbes Planeta - Planeta */}
            <div className="bg-[#0a0b10] p-4 rounded-sm border border-[#2d313d] text-xs">
              <h5 className="font-bold text-amber-500 mb-3 text-[11px] uppercase tracking-wider">Planeta – Planeta</h5>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[#9ca3af] text-[11px]">Conjunción (0°):</span>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    max="15"
                    value={orbs.planetPlanet.conjunction}
                    onChange={(e) => handleOrbChange('planetPlanet', 'conjunction', parseFloat(e.target.value))}
                    className="w-16 px-2 py-1 border border-[#2d313d] rounded-sm font-mono text-center bg-[#14161f] text-[#e0e2e8] font-bold"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#9ca3af] text-[11px]">Sextil (60°):</span>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    max="15"
                    value={orbs.planetPlanet.sextile}
                    onChange={(e) => handleOrbChange('planetPlanet', 'sextile', parseFloat(e.target.value))}
                    className="w-16 px-2 py-1 border border-[#2d313d] rounded-sm font-mono text-center bg-[#14161f] text-[#e0e2e8] font-bold"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#9ca3af] text-[11px]">Cuadratura (90°):</span>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    max="15"
                    value={orbs.planetPlanet.square}
                    onChange={(e) => handleOrbChange('planetPlanet', 'square', parseFloat(e.target.value))}
                    className="w-16 px-2 py-1 border border-[#2d313d] rounded-sm font-mono text-center bg-[#14161f] text-[#e0e2e8] font-bold"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#9ca3af] text-[11px]">Trígono (120°):</span>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    max="15"
                    value={orbs.planetPlanet.trine}
                    onChange={(e) => handleOrbChange('planetPlanet', 'trine', parseFloat(e.target.value))}
                    className="w-16 px-2 py-1 border border-[#2d313d] rounded-sm font-mono text-center bg-[#14161f] text-[#e0e2e8] font-bold"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#9ca3af] text-[11px]">Oposición (180°):</span>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    max="15"
                    value={orbs.planetPlanet.opposition}
                    onChange={(e) => handleOrbChange('planetPlanet', 'opposition', parseFloat(e.target.value))}
                    className="w-16 px-2 py-1 border border-[#2d313d] rounded-sm font-mono text-center bg-[#14161f] text-[#e0e2e8] font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Orbes Planeta - Ángulos */}
            <div className="bg-[#0a0b10] p-4 rounded-sm border border-[#2d313d] text-xs">
              <h5 className="font-bold text-cyan-400 mb-3 text-[11px] uppercase tracking-wider">Planeta – Ángulos (ASC / MC)</h5>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[#9ca3af] text-[11px]">Conjunción (0°):</span>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    max="15"
                    value={orbs.planetAngle.conjunction}
                    onChange={(e) => handleOrbChange('planetAngle', 'conjunction', parseFloat(e.target.value))}
                    className="w-16 px-2 py-1 border border-[#2d313d] rounded-sm font-mono text-center bg-[#14161f] text-[#e0e2e8] font-bold"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#9ca3af] text-[11px]">Sextil (60°):</span>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    max="15"
                    value={orbs.planetAngle.sextile}
                    onChange={(e) => handleOrbChange('planetAngle', 'sextile', parseFloat(e.target.value))}
                    className="w-16 px-2 py-1 border border-[#2d313d] rounded-sm font-mono text-center bg-[#14161f] text-[#e0e2e8] font-bold"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#9ca3af] text-[11px]">Cuadratura (90°):</span>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    max="15"
                    value={orbs.planetAngle.square}
                    onChange={(e) => handleOrbChange('planetAngle', 'square', parseFloat(e.target.value))}
                    className="w-16 px-2 py-1 border border-[#2d313d] rounded-sm font-mono text-center bg-[#14161f] text-[#e0e2e8] font-bold"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#9ca3af] text-[11px]">Trígono (120°):</span>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    max="15"
                    value={orbs.planetAngle.trine}
                    onChange={(e) => handleOrbChange('planetAngle', 'trine', parseFloat(e.target.value))}
                    className="w-16 px-2 py-1 border border-[#2d313d] rounded-sm font-mono text-center bg-[#14161f] text-[#e0e2e8] font-bold"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#9ca3af] text-[11px]">Oposición (180°):</span>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    max="15"
                    value={orbs.planetAngle.opposition}
                    onChange={(e) => handleOrbChange('planetAngle', 'opposition', parseFloat(e.target.value))}
                    className="w-16 px-2 py-1 border border-[#2d313d] rounded-sm font-mono text-center bg-[#14161f] text-[#e0e2e8] font-bold"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-between items-center border-t border-[#2d313d] pt-4 text-xs">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-3.5 py-1.5 font-bold text-[#6b7280] hover:text-[#e0e2e8] hover:bg-[#0a0b10] rounded-sm transition-colors uppercase text-[10px] tracking-wider"
          >
            Restablecer Valores
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 font-bold bg-amber-500 hover:bg-amber-600 text-[#0a0b10] rounded-sm transition-colors uppercase text-[11px] tracking-wider"
          >
            Guardar y Aplicar
          </button>
        </div>
      </div>
    </div>
  );
};
