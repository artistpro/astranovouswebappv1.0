import React, { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { 
  auth, 
  ensureAuth, 
  loginWithGoogle, 
  logoutUser, 
  saveNatalChartToCloud, 
  getUserSavedCharts, 
  deleteSavedChartFromCloud, 
  getLocalSavedCharts,
  saveLocalChart,
  SavedChartDoc 
} from '../lib/firebase';
import { Bookmark, Trash2, LogIn, LogOut, Loader2, Sparkles, Plus, Cloud, Check } from 'lucide-react';

interface SavedChartsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentParams: {
    name: string;
    dateStr: string;
    timeStr: string;
    locationName: string;
    latitude: number;
    longitude: number;
    houseSystem: string;
  };
  onLoadChart: (params: {
    name: string;
    dateStr: string;
    timeStr: string;
    locationName: string;
    latitude: number;
    longitude: number;
    houseSystem: string;
  }) => void;
}

export const SavedChartsModal: React.FC<SavedChartsModalProps> = ({
  isOpen,
  onClose,
  currentParams,
  onLoadChart
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [savedCharts, setSavedCharts] = useState<SavedChartDoc[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
      if (u && isOpen) {
        loadCharts();
      }
    });
    return () => unsubscribe();
  }, [isOpen]);

  const loadCharts = async () => {
    setLoading(true);
    setError(null);
    const localCharts = getLocalSavedCharts();
    try {
      const cloudCharts = await getUserSavedCharts();
      // Combine cloud and local charts, avoiding duplicate IDs
      const combined = [...cloudCharts];
      for (const lc of localCharts) {
        if (!combined.some(c => c.id === lc.id)) {
          combined.push(lc);
        }
      }
      setSavedCharts(combined);
    } catch (err: any) {
      // Fallback to local charts
      setSavedCharts(localCharts);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      ensureAuth().then((u) => setUser(u)).catch(() => {});
      loadCharts();
    }
  }, [isOpen]);

  const handleSaveCurrent = async () => {
    setSaving(true);
    setError(null);
    const chartData = {
      name: currentParams.name,
      birthDate: currentParams.dateStr,
      birthTime: currentParams.timeStr,
      locationName: currentParams.locationName,
      latitude: currentParams.latitude,
      longitude: currentParams.longitude,
      houseSystem: currentParams.houseSystem
    };

    try {
      await saveNatalChartToCloud(chartData);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
      await loadCharts();
    } catch (err: any) {
      // Save locally as seamless fallback
      saveLocalChart(chartData);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
      if (err?.message === 'UNAUTHENTICATED' || err?.code === 'auth/admin-restricted-operation') {
        setError('Guardado en este navegador. Para sincronizar tus cartas en la nube, inicia sesión con Google.');
      }
      await loadCharts();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteSavedChartFromCloud(id);
      setSavedCharts((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error(err);
      setError('Error al eliminar la carta.');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      await loadCharts();
    } catch (err) {
      console.error(err);
      setError('No se pudo iniciar sesión con Google.');
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      await ensureAuth();
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Cartas Guardadas en la Nube</h2>
              <p className="text-xs text-slate-400">Guarda y consulta tus cartas astrales desde cualquier lugar</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition-colors p-1.5 rounded-lg hover:bg-slate-800"
          >
            ✕
          </button>
        </div>

        {/* User Auth Banner */}
        <div className="px-6 py-3 bg-slate-950/50 border-b border-slate-800/60 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            {user ? (
              <span className="font-medium text-purple-300">
                Conectado como {user.displayName || user.email || 'Usuario de Google'}
              </span>
            ) : (
              <span>Modo Local (Inicia sesión con Google para sincronizar en la nube)</span>
            )}
          </div>
          {user ? (
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-slate-400 hover:text-rose-400 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Cerrar sesión
            </button>
          ) : (
            <button
              onClick={handleGoogleLogin}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" />
              Iniciar sesión con Google
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          
          {/* Action button to save current chart */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-purple-950/40 to-indigo-950/40 border border-purple-500/20 flex items-center justify-between">
            <div>
              <div className="font-semibold text-sm text-slate-200">
                Carta actual: <span className="text-purple-300">{currentParams.name}</span>
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                {currentParams.dateStr} {currentParams.timeStr} • {currentParams.locationName}
              </div>
            </div>
            <button
              onClick={handleSaveCurrent}
              disabled={saving || savedSuccess}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shadow-lg ${
                savedSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-purple-600 hover:bg-purple-500 text-white hover:shadow-purple-500/25'
              }`}
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : savedSuccess ? (
                <>
                  <Check className="w-4 h-4" /> ¡Guardado!
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" /> Guardar esta Carta
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="p-3 text-xs bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-lg">
              {error}
            </div>
          )}

          {/* List of saved charts */}
          <div className="space-y-2 mt-4">
            <h3 className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
              Mis Cartas Astrológicas ({savedCharts.length})
            </h3>

            {loading ? (
              <div className="py-8 flex flex-col items-center justify-center text-slate-400 gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
                <span className="text-xs">Cargando cartas desde Firestore...</span>
              </div>
            ) : savedCharts.length === 0 ? (
              <div className="py-8 border border-dashed border-slate-800 rounded-xl text-center text-slate-500 text-xs">
                No tienes cartas guardadas aún. Haz clic en "Guardar esta Carta" para guardarla en la nube.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {savedCharts.map((chart) => (
                  <div
                    key={chart.id}
                    onClick={() => {
                      onLoadChart({
                        name: chart.name,
                        dateStr: chart.birthDate,
                        timeStr: chart.birthTime,
                        locationName: chart.locationName,
                        latitude: chart.latitude,
                        longitude: chart.longitude,
                        houseSystem: chart.houseSystem || 'placidus'
                      });
                      onClose();
                    }}
                    className="group p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-purple-500/50 hover:bg-slate-800/40 cursor-pointer transition-all flex flex-col justify-between gap-3 relative"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-slate-200 group-hover:text-purple-300 transition-colors">
                          {chart.name}
                        </span>
                        <button
                          onClick={(e) => chart.id && handleDelete(chart.id, e)}
                          title="Eliminar carta"
                          className="text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        {chart.birthDate} {chart.birthTime}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate mt-0.5">
                        📍 {chart.locationName}
                      </div>
                    </div>
                    <div className="text-[10px] text-purple-400/80 font-medium flex items-center justify-between border-t border-slate-800/60 pt-2">
                      <span>Sistema: {chart.houseSystem}</span>
                      <span className="text-purple-400 group-hover:underline">Cargar carta →</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
