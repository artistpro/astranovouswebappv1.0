import React, { useEffect, useState } from 'react';
import { CosmicBackground } from './components/CosmicBackground';
import { CustomCursor } from './components/CustomCursor';
import { AdvancedOptionsModal } from './components/AdvancedOptionsModal';
import { SavedChartsModal } from './components/SavedChartsModal';
import { AnalysisModal } from './components/AnalysisModal';
import { KnowledgeManagerModal } from './components/KnowledgeManagerModal';
import { FullProfileModal } from './components/FullProfileModal';
import { NatalWheel } from './components/NatalWheel';
import { SectionAngles } from './components/SectionAngles';
import { SectionAspects } from './components/SectionAspects';
import { SectionDataNormalized } from './components/SectionDataNormalized';
import { SectionHouseCusps } from './components/SectionHouseCusps';
import { SectionPlanetaryPositions } from './components/SectionPlanetaryPositions';
import { ValidationBanner } from './components/ValidationBanner';
import { TabTransits } from './components/TabTransits';
import { TabSolarReturn } from './components/TabSolarReturn';
import { TabProgressions } from './components/TabProgressions';
import {
  CalculationRequest,
  CalculationResponse,
  DEFAULT_ORBS,
  HOUSE_SYSTEMS,
  HouseSystem,
  OrbsConfig,
  POPULAR_CITIES,
  AnalysisSelection,
  ActiveTab,
} from './types';

export default function App() {
  // Top level tab state
  const [activeTab, setActiveTab] = useState<ActiveTab>('natal');

  // Input form state
  const [personName, setPersonName] = useState('Juan Pérez');
  const [dateStr, setDateStr] = useState('1992-07-22');
  const [timeStr, setTimeStr] = useState('14:30');
  const [locationName, setLocationName] = useState('Buenos Aires, Argentina');
  const [latitude, setLatitude] = useState(-34.6037);
  const [longitude, setLongitude] = useState(-58.3816);
  const [houseSystem, setHouseSystem] = useState<HouseSystem>('placidus');
  const [orbs, setOrbs] = useState<OrbsConfig>(DEFAULT_ORBS);

  // Modal & Search UI state
  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);
  const [isSavedChartsModalOpen, setIsSavedChartsModalOpen] = useState(false);
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const [isKnowledgeModalOpen, setIsKnowledgeModalOpen] = useState(false);
  const [isFullProfileModalOpen, setIsFullProfileModalOpen] = useState(false);
  const [analysisSelection, setAnalysisSelection] = useState<AnalysisSelection | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ name: string; lat: number; lng: number }[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Calculation Result & Loading
  const [calculationResult, setCalculationResult] = useState<CalculationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleOpenAnalysis = (selection: AnalysisSelection) => {
    setAnalysisSelection(selection);
    setIsAnalysisModalOpen(true);
  };

  // Run calculation function
  const executeCalculation = async (overrideParams?: Partial<CalculationRequest>) => {
    setIsLoading(true);
    setErrorMsg(null);

    const requestPayload: CalculationRequest = {
      name: overrideParams?.name ?? personName,
      dateStr: overrideParams?.dateStr ?? dateStr,
      timeStr: overrideParams?.timeStr ?? timeStr,
      locationName: overrideParams?.locationName ?? locationName,
      latitude: overrideParams?.latitude ?? latitude,
      longitude: overrideParams?.longitude ?? longitude,
      houseSystem: overrideParams?.houseSystem ?? houseSystem,
      orbs: overrideParams?.orbs ?? orbs,
    };

    try {
      const response = await fetch('/api/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestPayload),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.details || errData.error || 'Error al comunicarse con el motor astrológico.');
      }

      const data: CalculationResponse = await response.json();
      setCalculationResult(data);
    } catch (err: any) {
      console.error('Error calculando carta:', err);
      setErrorMsg(err.message || 'Ocurrió un error inesperado al realizar los cálculos astronómicos.');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial calculation on mount
  useEffect(() => {
    executeCalculation();
  }, []);

  // Handle location search via nominatim endpoint
  const handleLocationSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query || query.length < 3) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data);
      }
    } catch (e) {
      console.warn('Geocoding search failed:', e);
    } finally {
      setIsSearching(false);
    }
  };

  const selectCity = (cityName: string, lat: number, lng: number) => {
    setLocationName(cityName);
    setLatitude(lat);
    setLongitude(lng);
    setSearchQuery('');
    setSearchResults([]);
  };

  return (
    <div className="min-h-screen bg-[#030304] font-sans text-amber-100 pb-20 antialiased relative selection:bg-amber-500/30 selection:text-amber-100">
      {/* Cosmic Parallax Canvas Background */}
      <CosmicBackground />

      {/* Luxury Glowing Gold Cursor */}
      <CustomCursor />

      {/* Top Navigation Bar - Luxury Orrery Edition Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-black/85 border-b border-amber-500/20 shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-20 flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-amber-300 via-amber-500 to-amber-800 flex items-center justify-center text-slate-950 font-bold text-2xl shadow-[0_0_20px_rgba(216,168,72,0.5)] border border-amber-200 animate-pulse-glow">
                ☉
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold text-gold-gradient font-serif tracking-wide leading-tight">
                    Calculadora Astrológica
                  </h1>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[10px] font-sc tracking-widest uppercase">
                    Astro-Seek Edition
                  </span>
                </div>
                <p className="text-xs text-amber-200/50 font-sans tracking-wide">
                  Motor Efemérides VSOP87 / JPL • Astro-Seek Suite
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              {calculationResult && (
                <button
                  onClick={() => setIsFullProfileModalOpen(true)}
                  className="btn-gold-metallic px-4 py-2 text-xs flex items-center gap-2"
                  title="Generar Perfil General Analizado de la carta natal"
                >
                  <span>⭐</span>
                  <span className="hidden sm:inline">Perfil General</span>
                </button>
              )}
              <button
                onClick={() => setIsKnowledgeModalOpen(true)}
                className="btn-gold-outline px-3.5 py-2 text-xs flex items-center gap-2"
                title="Administrar libros y documentos astrológicos de referencia"
              >
                <span>📚</span>
                <span className="hidden sm:inline">Base Documental</span>
              </button>
              <button
                onClick={() => setIsSavedChartsModalOpen(true)}
                className="btn-gold-outline px-3.5 py-2 text-xs flex items-center gap-2"
              >
                <span>☁️</span>
                <span className="hidden sm:inline">Mis Cartas</span>
              </button>
              <button
                onClick={() => setIsOptionsModalOpen(true)}
                className="btn-gold-outline px-3.5 py-2 text-xs flex items-center gap-2"
              >
                <span>⚙</span>
                <span className="hidden sm:inline">Opciones</span>
              </button>
            </div>
          </div>

          {/* Independent Navigation Tabs Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-3 border-t border-amber-500/10 pt-2 font-sc text-xs">
            <button
              onClick={() => setActiveTab('natal')}
              className={
                activeTab === 'natal'
                  ? 'btn-gold-metallic px-4 py-2 text-xs font-bold shadow-lg flex items-center gap-2'
                  : 'btn-gold-outline px-4 py-2 text-xs font-bold flex items-center gap-2'
              }
            >
              <span>☸</span>
              <span>Carta Natal</span>
            </button>

            <button
              onClick={() => setActiveTab('transits')}
              className={
                activeTab === 'transits'
                  ? 'btn-gold-metallic px-4 py-2 text-xs font-bold shadow-lg flex items-center gap-2'
                  : 'btn-gold-outline px-4 py-2 text-xs font-bold flex items-center gap-2'
              }
            >
              <span>🪐</span>
              <span>Tránsitos Astrológicos</span>
            </button>

            <button
              onClick={() => setActiveTab('solar_return')}
              className={
                activeTab === 'solar_return'
                  ? 'btn-gold-metallic px-4 py-2 text-xs font-bold shadow-lg flex items-center gap-2'
                  : 'btn-gold-outline px-4 py-2 text-xs font-bold flex items-center gap-2'
              }
            >
              <span>☀️</span>
              <span>Revolución Solar</span>
            </button>

            <button
              onClick={() => setActiveTab('progressions')}
              className={
                activeTab === 'progressions'
                  ? 'btn-gold-metallic px-4 py-2 text-xs font-bold shadow-lg flex items-center gap-2'
                  : 'btn-gold-outline px-4 py-2 text-xs font-bold flex items-center gap-2'
              }
            >
              <span>🌙</span>
              <span>Progresiones Secundarias</span>
            </button>

            <button
              onClick={() => setIsKnowledgeModalOpen(true)}
              className="btn-gold-outline px-4 py-2 text-xs font-bold flex items-center gap-2"
            >
              <span>📚</span>
              <span>Base Documental & RAG</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 relative z-10">
        {/* Render Tab 1: Carta Natal */}
        {activeTab === 'natal' && (
          <>
            {/* Input Parameters Form Card */}
            <section className="glass-panel-gold p-6 sm:p-8 mb-10 transition-all">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 mb-6 border-b border-amber-500/20">
                <div>
                  <h2 className="text-lg font-bold text-gold-gradient font-serif tracking-wide">
                    Parámetros Natales de Entrada
                  </h2>
                  <p className="text-xs text-amber-200/60 mt-1">
                    Ingrese las coordenadas y hora natal. La zona horaria IANA histórica y el offset UTC se calculan automáticamente.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-amber-200/50 font-medium font-sc">Sistema Activo:</span>
                  <span className="px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 font-bold text-xs border border-amber-500/30">
                    {HOUSE_SYSTEMS.find((s) => s.id === houseSystem)?.name}
                  </span>
                </div>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  executeCalculation();
                }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 text-xs"
              >
                {/* Name input */}
                <div>
                  <label className="block font-bold text-amber-200/80 mb-1.5 uppercase text-[11px] tracking-wider font-sc">
                    Nombre o Consultante:
                  </label>
                  <input
                    type="text"
                    value={personName}
                    onChange={(e) => setPersonName(e.target.value)}
                    placeholder="Ej. Carolina de la Espriella"
                    className="w-full px-3.5 py-2.5 bg-black/60 border border-amber-500/30 rounded-xl focus:border-amber-400 focus:ring-1 focus:ring-amber-400 focus:outline-none text-amber-100 font-medium text-xs placeholder:text-amber-200/30 transition-all"
                    required
                  />
                </div>

                {/* Date input */}
                <div>
                  <label className="block font-bold text-amber-200/80 mb-1.5 uppercase text-[11px] tracking-wider font-sc">
                    Fecha de Nacimiento:
                  </label>
                  <input
                    type="date"
                    value={dateStr}
                    onChange={(e) => setDateStr(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-black/60 border border-amber-500/30 rounded-xl focus:border-amber-400 focus:ring-1 focus:ring-amber-400 focus:outline-none text-amber-100 font-medium text-xs transition-all"
                    required
                  />
                </div>

                {/* Time input */}
                <div>
                  <label className="block font-bold text-amber-200/80 mb-1.5 uppercase text-[11px] tracking-wider font-sc">
                    Hora Local de Nacimiento:
                  </label>
                  <input
                    type="time"
                    value={timeStr}
                    onChange={(e) => setTimeStr(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-black/60 border border-amber-500/30 rounded-xl focus:border-amber-400 focus:ring-1 focus:ring-amber-400 focus:outline-none text-amber-100 font-medium text-xs transition-all"
                    required
                  />
                  <span className="text-[10px] text-amber-200/40 mt-1 block">Formato 24h (ej. 19:15)</span>
                </div>

                {/* Location & Geocoding Search */}
                <div className="relative">
                  <label className="block font-bold text-amber-200/80 mb-1.5 uppercase text-[11px] tracking-wider font-sc">
                    Lugar de Nacimiento:
                  </label>
                  <input
                    type="text"
                    value={searchQuery || locationName}
                    onChange={(e) => handleLocationSearch(e.target.value)}
                    placeholder="Buscar ciudad (ej. Madrid, Bogotá)..."
                    className="w-full px-3.5 py-2.5 bg-black/60 border border-amber-500/30 rounded-xl focus:border-amber-400 focus:ring-1 focus:ring-amber-400 focus:outline-none text-amber-100 font-medium text-xs placeholder:text-amber-200/30 transition-all"
                  />

                  {/* Autocomplete Dropdown */}
                  {(searchResults.length > 0 || isSearching) && (
                    <div className="absolute left-0 right-0 top-full mt-1.5 bg-black/90 backdrop-blur-xl border border-amber-500/40 rounded-xl shadow-2xl z-50 max-h-48 overflow-y-auto">
                      {isSearching ? (
                        <div className="p-3 text-center text-amber-200/50">Buscando coordenadas GPS...</div>
                      ) : (
                        searchResults.map((res, idx) => (
                          <button
                            key={`sr-${idx}`}
                            type="button"
                            onClick={() => selectCity(res.name, res.lat, res.lng)}
                            className="w-full text-left px-3.5 py-2.5 hover:bg-amber-500/20 border-b border-amber-500/10 last:border-none text-xs text-amber-100 font-medium transition-colors"
                          >
                            {res.name}
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* Popular City Quick Chips */}
                <div className="sm:col-span-2 lg:col-span-4 flex flex-wrap items-center gap-2 pt-2">
                  <span className="text-[11px] font-semibold text-amber-200/50 mr-1 font-sc">Ciudades rápidas:</span>
                  {POPULAR_CITIES.slice(0, 8).map((city) => (
                    <button
                      key={city.name}
                      type="button"
                      onClick={() => selectCity(`${city.name}, ${city.country}`, city.lat, city.lng)}
                      className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all ${
                        locationName.includes(city.name)
                          ? 'bg-amber-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(216,168,72,0.5)]'
                          : 'bg-black/40 text-amber-200/70 border border-amber-500/20 hover:border-amber-400 hover:text-amber-100'
                      }`}
                    >
                      {city.name}
                    </button>
                  ))}
                </div>

                {/* Submit Button */}
                <div className="sm:col-span-2 lg:col-span-4 flex justify-end pt-4 border-t border-amber-500/20">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full sm:w-auto btn-gold-metallic px-8 py-3 text-xs flex items-center justify-center gap-2.5"
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-slate-950" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Calculando Efemérides...</span>
                      </>
                    ) : (
                      <>
                        <span className="text-base">☉</span>
                        <span>Calcular Carta Natal Orrery</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </section>

            {/* Error message if any */}
            {errorMsg && (
              <div className="p-4 bg-rose-950/60 border border-rose-600/60 text-rose-200 text-xs rounded-2xl mb-8 shadow-xl">
                <p className="font-bold mb-1">⚠️ Error en el Cálculo Astrológico:</p>
                <p>{errorMsg}</p>
              </div>
            )}

            {/* Main Calculations Display */}
            {calculationResult && (
              <>
                {/* Automated Validation Banner */}
                <ValidationBanner validation={calculationResult.validation} />

                {/* General Natal Profile Trigger Banner */}
                <div className="mb-10 p-6 rounded-2xl glass-panel-gold border-amber-500/40 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-5 relative overflow-hidden">
                  <div className="space-y-1.5 text-center sm:text-left z-10">
                    <div className="flex items-center justify-center sm:justify-start gap-2.5">
                      <span className="text-amber-400 text-xl animate-pulse">🔮</span>
                      <h3 className="font-bold text-lg text-gold-gradient font-serif tracking-wide">
                        Perfil Natal General Analizado
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-semibold border border-amber-500/40">
                        SÍNTESIS HOLÍSTICA
                      </span>
                    </div>
                    <p className="text-xs text-amber-200/70 max-w-xl leading-relaxed">
                      Genera una interpretación completa e integrada de la carta natal de <strong>{calculationResult.normalizedData.name || 'el consultante'}</strong> conectando posiciones planetarias, casas, ángulos y aspectos fundamentados en tus tratados astrológicos.
                    </p>
                  </div>

                  <button
                    onClick={() => setIsFullProfileModalOpen(true)}
                    className="btn-gold-metallic px-6 py-3 text-xs shrink-0 z-10 flex items-center gap-2"
                  >
                    <span>⭐ Ver Perfil General Natal</span>
                  </button>
                </div>

                {/* Natal Wheel SVG Component */}
                <div className="mb-12">
                  <NatalWheel
                    planets={calculationResult.planets}
                    angles={calculationResult.angles}
                    houseCusps={calculationResult.houseCusps}
                    aspects={calculationResult.aspects}
                    personName={calculationResult.normalizedData.name}
                    locationName={calculationResult.normalizedData.locationName}
                    normalizedData={calculationResult.normalizedData}
                  />
                </div>

                {/* Section 1: Datos Normalizados */}
                <SectionDataNormalized data={calculationResult.normalizedData} />

                {/* Section 2: Posiciones Planetarias */}
                <SectionPlanetaryPositions 
                  planets={calculationResult.planets} 
                  houseSystemLabel={houseSystem}
                  onAnalyzeSelection={handleOpenAnalysis}
                />

                {/* Section 3: Ángulos */}
                <SectionAngles 
                  angles={calculationResult.angles} 
                  houseSystemLabel={houseSystem}
                  onAnalyzeSelection={handleOpenAnalysis}
                />

                {/* Section 4: Cúspides de Casas */}
                <SectionHouseCusps 
                  houseCusps={calculationResult.houseCusps} 
                  houseSystemLabel={houseSystem}
                  onAnalyzeSelection={handleOpenAnalysis}
                />

                {/* Section 5: Aspectos */}
                <SectionAspects 
                  aspects={calculationResult.aspects} 
                  houseSystemLabel={houseSystem}
                  onAnalyzeSelection={handleOpenAnalysis}
                />
              </>
            )}
          </>
        )}

        {/* Render Tab 2: Tránsitos Astrológicos */}
        {activeTab === 'transits' && (
          <TabTransits
            natalRequest={{
              name: personName,
              dateStr,
              timeStr,
              locationName,
              latitude,
              longitude,
              houseSystem,
              orbs,
            }}
            onAnalyzeSelection={handleOpenAnalysis}
          />
        )}

        {/* Render Tab 3: Revolución Solar */}
        {activeTab === 'solar_return' && (
          <TabSolarReturn
            natalRequest={{
              name: personName,
              dateStr,
              timeStr,
              locationName,
              latitude,
              longitude,
              houseSystem,
              orbs,
            }}
            onAnalyzeSelection={handleOpenAnalysis}
          />
        )}

        {/* Render Tab 4: Progresiones Secundarias */}
        {activeTab === 'progressions' && (
          <TabProgressions
            natalRequest={{
              name: personName,
              dateStr,
              timeStr,
              locationName,
              latitude,
              longitude,
              houseSystem,
              orbs,
            }}
            onAnalyzeSelection={handleOpenAnalysis}
          />
        )}
      </main>

      {/* Documental Analysis Modal */}
      <AnalysisModal
        isOpen={isAnalysisModalOpen}
        onClose={() => setIsAnalysisModalOpen(false)}
        selection={analysisSelection}
        chartId={`${personName}_${dateStr}_${timeStr}`}
      />

      {/* Advanced Options Modal */}
      <AdvancedOptionsModal
        isOpen={isOptionsModalOpen}
        onClose={() => setIsOptionsModalOpen(false)}
        selectedHouseSystem={houseSystem}
        onSelectHouseSystem={(sys) => {
          setHouseSystem(sys);
          executeCalculation({ houseSystem: sys });
        }}
        orbs={orbs}
        onChangeOrbs={(newOrbs) => {
          setOrbs(newOrbs);
          executeCalculation({ orbs: newOrbs });
        }}
      />

      {/* Saved Charts Cloud Modal */}
      <SavedChartsModal
        isOpen={isSavedChartsModalOpen}
        onClose={() => setIsSavedChartsModalOpen(false)}
        currentParams={{
          name: personName,
          dateStr,
          timeStr,
          locationName,
          latitude,
          longitude,
          houseSystem
        }}
        onLoadChart={(params) => {
          setPersonName(params.name);
          setDateStr(params.dateStr);
          setTimeStr(params.timeStr);
          setLocationName(params.locationName);
          setLatitude(params.latitude);
          setLongitude(params.longitude);
          if (params.houseSystem) {
            setHouseSystem(params.houseSystem as HouseSystem);
          }
          executeCalculation({
            name: params.name,
            dateStr: params.dateStr,
            timeStr: params.timeStr,
            locationName: params.locationName,
            latitude: params.latitude,
            longitude: params.longitude,
            houseSystem: params.houseSystem as HouseSystem
          });
        }}
      />

      {/* Knowledge Manager Modal for uploading books & docs */}
      <KnowledgeManagerModal
        isOpen={isKnowledgeModalOpen}
        onClose={() => setIsKnowledgeModalOpen(false)}
      />

      {/* Full General Natal Profile Modal */}
      <FullProfileModal
        isOpen={isFullProfileModalOpen}
        onClose={() => setIsFullProfileModalOpen(false)}
        chartData={calculationResult}
      />
    </div>
  );
}
