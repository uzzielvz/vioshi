"use client";

import { useEffect } from "react";
import { buttonClass } from "@/components/ui/styles";

// Root error boundary — cannot use next-intl hooks (no NextIntlClientProvider here).
// Errors inside a locale are caught first by app/[locale]/error.tsx.
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="es">
      <body className="bg-paper text-ink antialiased">
        <main className="grid min-h-screen place-items-center px-4">
          <div className="grid max-w-[360px] justify-items-center gap-3 text-center">
            <h1 className="text-[18px] font-bold">Algo salió mal</h1>
            <p className="text-[13.5px] text-muted">Something went wrong.</p>
            <button type="button" onClick={reset} className={buttonClass("primary", "md", "mt-2 w-full")}>
              Intentar de nuevo
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
