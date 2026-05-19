import type { Metadata } from 'next';
import '../globals.css';

export const metadata: Metadata = {
  title: 'VIOGI · Búsqueda Visual',
  description: 'Encuentra prendas similares subiendo una foto.',
};

export default function VisualSearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="antialiased">{children}</body>
    </html>
  );
}
