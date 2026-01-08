import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-white text-black mt-auto border-t border-gray-200">
      <div className="max-w-[1920px] mx-auto px-8 py-6">
        <div className="flex items-center justify-between">
          {/* LEFT - INSTAGRAM & SUPPORT */}
          <div className="flex items-center gap-6">
            <a
              href="https://www.instagram.com/viogi_/?hl=es"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-60 transition-opacity duration-200"
              style={{
                fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                fontSize: '11px',
                fontWeight: 800,
                letterSpacing: '0.02em',
                textTransform: 'uppercase',
                textShadow: '0 0 0.5px rgba(0, 0, 0, 0.8)'
              }}
            >
              INSTAGRAM
            </a>
            <Link
              href="/pages/customer-support"
              className="hover:opacity-60 transition-opacity duration-200"
              style={{
                fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                fontSize: '11px',
                fontWeight: 800,
                letterSpacing: '0.02em',
                textTransform: 'uppercase',
                textShadow: '0 0 0.5px rgba(0, 0, 0, 0.8)'
              }}
            >
              SOPORTE
            </Link>
          </div>

          {/* RIGHT - COPYRIGHT */}
          <p 
            style={{
              fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
              fontSize: '11px',
              fontWeight: 400,
              letterSpacing: '0.02em'
            }}
          >
            © {new Date().getFullYear()} VIOGI
          </p>
        </div>
      </div>
    </footer>
  );
}
