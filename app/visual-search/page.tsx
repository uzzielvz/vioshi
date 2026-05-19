'use client';

import { useState } from 'react';

type Result = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price_mxn: number;
  similarity: number;
  image_url: string | null;
};

export default function VisualSearchPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Result[]>([]);
  const [aiDescription, setAiDescription] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = (f: File) => {
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResults([]);
    setError(null);
    setAiDescription(null);
  };

  const handleSubmit = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await fetch('/api/visual-search', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) {
        setError('No se pudo procesar la imagen.');
      } else {
        setResults(data.results);
        setAiDescription(data.ai_description);
      }
    } catch {
      setError('Error de conexión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white px-6 py-12 max-w-4xl mx-auto">
      <h1 className="text-4xl font-serif mb-2">Búsqueda Visual</h1>
      <p className="text-gray-600 mb-8">
        Sube una foto de una prenda y encuentra similares en el catálogo.
      </p>

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-6">
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          className="mb-4"
        />
        {preview && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="preview" className="mx-auto max-h-64 mt-4 rounded" />
        )}
      </div>

      <button
        onClick={handleSubmit}
        disabled={!file || loading}
        className="bg-black text-white px-6 py-3 rounded disabled:opacity-50 mb-8"
      >
        {loading ? 'Analizando…' : 'Buscar similares'}
      </button>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      {aiDescription && (
        <div className="bg-gray-50 border border-gray-200 rounded p-4 mb-6 text-sm">
          <p className="font-bold mb-1">IA detectó:</p>
          <p className="italic text-gray-700">{aiDescription}</p>
        </div>
      )}

      {results.length > 0 && (
        <div>
          <h2 className="text-2xl font-serif mb-4">Resultados</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {results.map((r) => (
              <div key={r.id} className="border border-gray-200 rounded-lg p-4">
                {r.image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={r.image_url}
                    alt={r.name}
                    className="w-full h-48 object-cover rounded mb-3"
                  />
                )}
                <h3 className="font-bold">{r.name}</h3>
                <p className="text-sm text-gray-600 line-clamp-2 mb-2">{r.description}</p>
                <p className="font-bold">${r.price_mxn} MXN</p>
                <p className="text-xs text-gray-500 mt-2">
                  Similitud: {(r.similarity * 100).toFixed(1)}%
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
