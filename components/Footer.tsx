import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-white text-black mt-auto border-t border-gray-200">
      <div className="flex items-center justify-between px-6 md:px-8 py-4">
        <div className="flex items-center gap-6">
          <a
            href="https://www.instagram.com/viogi_/?hl=es"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs uppercase tracking-wide hover:opacity-60 transition-opacity"
            style={{
              fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
              fontSize: '11px',
              fontWeight: 500
            }}
          >
            Instagram
          </a>
          <Link
            href="/vender"
            className="text-xs uppercase tracking-wide hover:opacity-60 transition-opacity"
            style={{
              fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
              fontSize: '11px',
              fontWeight: 500
            }}
          >
            Quiero Vender con Ustedes
          </Link>
        </div>
        <p
          className="text-xs uppercase tracking-wide"
          style={{
            fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
            fontSize: '11px',
            fontWeight: 500
          }}
        >
          © {new Date().getFullYear()} VIOGI
        </p>
      </div>
    </footer>
  );
}
