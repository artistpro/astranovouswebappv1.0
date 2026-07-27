import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Upload, 
  Trash2, 
  X, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Sparkles,
  ShieldCheck
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onDocsUpdated?: () => void;
}

interface DocMeta {
  id: string;
  title: string;
  author: string;
  filename: string;
  originalName: string;
  size: number;
  uploadedAt: string;
}

export const KnowledgeManagerModal: React.FC<Props> = ({ isOpen, onClose, onDocsUpdated }) => {
  const [documents, setDocuments] = useState<DocMeta[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadDocuments();
    }
  }, [isOpen]);

  const loadDocuments = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/knowledge/documents');
      if (res.ok) {
        const data = await res.json();
        setDocuments(data.documents || []);
      }
    } catch (err: any) {
      console.error('Error loading knowledge docs:', err);
      setError('Error al cargar la lista de documentos.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (!title) {
        // Auto-fill title from filename
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setTitle(cleanName);
      }
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Por favor selecciona un archivo (.pdf, .txt, .md, .doc).');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('title', title || selectedFile.name);
      formData.append('author', author || 'Autor no especificado');

      const res = await fetch('/api/knowledge/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Error al subir archivo.');
      }

      setSuccessMsg('¡Documento agregado correctamente a la base de conocimiento!');
      setSelectedFile(null);
      setTitle('');
      setAuthor('');
      await loadDocuments();
      if (onDocsUpdated) onDocsUpdated();

      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      console.error('Error uploading file:', err);
      setError(err?.message || 'Error al subir el documento.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este documento de la base de conocimiento?')) return;

    try {
      const res = await fetch(`/api/knowledge/documents/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setDocuments((prev) => prev.filter((d) => d.id !== id));
        if (onDocsUpdated) onDocsUpdated();
      }
    } catch (err) {
      console.error('Error deleting doc:', err);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in font-sans">
      <div className="w-full max-w-2xl bg-[#0f111a] border border-[#2d313d] rounded-2xl text-slate-100 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-[#2d313d] bg-[#141622] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">
                Base Documental Astrológica
              </h2>
              <p className="text-xs text-slate-400">
                Sube libros, manuales, transcripciones o notas para fundamentar los análisis de Gemini.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Status Badge */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-slate-300">
                Estado: <strong className="text-emerald-400">{documents.length} documento(s) cargado(s)</strong>
              </span>
            </div>
            <span className="text-[11px] text-slate-500">
              Procesamiento local + Gemini API
            </span>
          </div>

          {/* Upload Form */}
          <form onSubmit={handleUpload} className="p-4 rounded-xl bg-[#141622] border border-[#2d313d] space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Agregar Nuevo Documento
            </h3>

            {error && (
              <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                {error}
              </div>
            )}

            {successMsg && (
              <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                {successMsg}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Título del Libro / Documento
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej: Tratado de Astrología Psicológica"
                  className="w-full px-3 py-2 rounded-lg bg-[#0a0b10] border border-[#2d313d] text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Autor
                </label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="Ej: Dane Rudhyar, Liz Greene..."
                  className="w-full px-3 py-2 rounded-lg bg-[#0a0b10] border border-[#2d313d] text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Archivo de Texto / Documento (.txt, .md, .pdf)
              </label>
              <div className="relative border-2 border-dashed border-[#2d313d] hover:border-amber-500/50 rounded-xl p-4 text-center cursor-pointer bg-[#0a0b10]/50 transition-colors">
                <input
                  type="file"
                  accept=".txt,.md,.pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center justify-center space-y-1">
                  <FileText className="w-6 h-6 text-amber-400/80" />
                  <span className="text-xs text-slate-300 font-medium">
                    {selectedFile ? selectedFile.name : 'Haz clic o arrastra tu archivo aquí'}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Sombra máxima: 20MB (.txt, .md, .pdf)
                  </span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={uploading || !selectedFile}
              className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Procesando y guardando documento...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" /> Subir a la Base de Conocimiento
                </>
              )}
            </button>
          </form>

          {/* Document Catalog */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Documentos Registrados en la Base ({documents.length})
            </h3>

            {loading ? (
              <div className="py-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Cargando catálogo...
              </div>
            ) : documents.length === 0 ? (
              <div className="py-8 px-4 rounded-xl border border-dashed border-slate-800 text-center text-xs text-slate-500">
                Aún no has agregado ningún documento. Sube tus textos arriba para activar el análisis enriquecido.
              </div>
            ) : (
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <p className="font-semibold text-slate-200 truncate">{doc.title}</p>
                        <p className="text-[11px] text-slate-400 truncate">
                          Por {doc.author} • {formatSize(doc.size)}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors shrink-0"
                      title="Eliminar documento"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#2d313d] bg-[#141622] flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Tus textos son procesados de forma privada por Gemini API.
          </span>
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
