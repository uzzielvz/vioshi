'use client'

export default function AdminError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const font = { fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif" }

  return (
    <div className="max-w-md">
      <p className="uppercase tracking-widest" style={{ ...font, fontSize: '13px', fontWeight: 500 }}>
        No pude cargar esta pantalla
      </p>
      <p className="text-gray-500 mt-3" style={{ ...font, fontSize: '11px' }}>
        El panel sigue aquí. Si la base está dormida, hay que despertarla y volver a intentar.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 bg-black text-white uppercase tracking-widest px-4 py-2"
        style={{ ...font, fontSize: '10px' }}
      >
        Reintentar
      </button>
    </div>
  )
}
