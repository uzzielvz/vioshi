'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type VSResult = {
  id: string;
  slug: string;
  name: string;
  price_mxn: number;
  similarity: number;
  image_url: string | null;
};

interface VisualSearchPanelProps {
  locale: string;
  file: File;
  onClose: () => void;
}

export default function VisualSearchPanel({ locale, file, onClose }: VisualSearchPanelProps) {
  const [preview, setPreview] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<VSResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setPreview(url);
    runSearch(file);
    return () => URL.revokeObjectURL(url);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file]);

  async function runSearch(f: File) {
    setLoading(true);
    setError(null);
    setResults([]);
    try {
      const fd = new FormData();
      fd.append('image', f);
      const res = await fetch('/api/visual-search', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) {
        setError(
          res.status === 429
            ? 'Demasiadas búsquedas. Intenta en un momento.'
            : 'No se pudo procesar la imagen.'
        );
      } else {
        setResults(data.results ?? []);
      }
    } catch {
      setError('Error de conexión.');
    } finally {
      setLoading(false);
    }
  }

  const labelStyle: React.CSSProperties = {
    fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
    fontSize: '11px',
    fontWeight: 800,
    letterSpacing: '0.02em',
    textTransform: 'uppercase',
  };

  return (
    <div
      className="border-t px-8 py-6 overflow-y-auto"
      style={{ borderColor: 'rgba(0,0,0,0.08)', maxHeight: '70vh', background: 'white' }}
    >
      {/* Preview + estado */}
      <div className="flex items-start gap-4 mb-6">
        {/* Thumbnail con animación de pulso mientras carga */}
        <div className="relative flex-shrink-0 w-16 h-16 rounded overflow-hidden bg-gray-100">
          {preview && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="preview" className="w-full h-full object-cover" />
          )}
          {loading && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center animate-pulse">
              <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>

        {/* Texto de estado */}
        <div className="flex-1 pt-1">
          {loading && (
            <p style={{ ...labelStyle, fontWeight: 400 }} className="text-gray-500">
              Analizando imagen...
            </p>
          )}
          {!loading && error && (
            <p style={{ ...labelStyle, fontWeight: 400 }} className="text-red-600">
              {error}
            </p>
          )}
          {!loading && !error && results.length === 0 && (
            <p style={{ ...labelStyle, fontWeight: 400 }} className="text-gray-500">
              Sin resultados similares.
            </p>
          )}
          {!loading && !error && results.length > 0 && (
            <p style={labelStyle} className="text-black">
              {results.length} resultado{results.length > 1 ? 's' : ''} similar{results.length > 1 ? 'es' : ''}
            </p>
          )}

          {/* Buscar otra imagen */}
          {!loading && (
            <button
              onClick={onClose}
              style={{ ...labelStyle, fontWeight: 400 }}
              className="text-gray-400 hover:text-black transition-colors duration-200 mt-1 block"
            >
              Buscar otra imagen
            </button>
          )}
        </div>
      </div>

      {/* Grid de resultados */}
      {results.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {results.map((r) => (
            <Link
              key={r.id}
              href={`/${locale}/products/${r.slug}`}
              onClick={onClose}
              className="group block"
            >
              {/* Imagen */}
              <div className="aspect-square bg-gray-100 overflow-hidden mb-2">
                {r.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={r.image_url}
                    alt={r.name}
                    className="w-full h-full object-cover group-hover:opacity-80 transition-opacity duration-200"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200" />
                )}
              </div>

              {/* Info */}
              <p
                className="text-black truncate"
                style={{ ...labelStyle, fontSize: '10px' }}
              >
                {r.name}
              </p>
              <p
                className="text-gray-500"
                style={{ ...labelStyle, fontSize: '10px', fontWeight: 400 }}
              >
                ${r.price_mxn.toLocaleString('es-MX')} MXN
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
