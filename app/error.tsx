"use client";

import { useEffect } from "react";

// Root error boundary — cannot use next-intl hooks (no NextIntlClientProvider here)
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
    <html>
      <body>
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <p
              style={{
                fontSize: '11px',
                fontWeight: 800,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                marginBottom: '12px',
              }}
            >
              Something went wrong
            </p>
            <button
              onClick={reset}
              style={{
                fontSize: '11px',
                fontWeight: 800,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                textDecoration: 'underline',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
