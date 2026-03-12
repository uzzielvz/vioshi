import Link from "next/link";

export default function NotFound() {
  return (
    <html>
      <body>
        <div className="min-h-screen flex flex-col bg-white">
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <h1
                style={{
                  fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                  fontSize: '11px',
                  fontWeight: 800,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  marginBottom: '12px'
                }}
              >
                404 — Page Not Found
              </h1>
              <Link
                href="/"
                style={{
                  fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                  fontSize: '11px',
                  fontWeight: 800,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  textDecoration: 'underline'
                }}
              >
                Return Home
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
