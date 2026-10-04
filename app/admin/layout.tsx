import type { Metadata } from 'next'
import { brand } from '@/lib/brand'
import { peekAdminActor } from '@/lib/admin/session'
import '../globals.css'
import Sidebar from './_components/Sidebar'

export const metadata: Metadata = {
  title: `${brand.name} Admin`,
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const actor = await peekAdminActor()

  if (!actor) {
    return (
      <html lang="es">
        <body className="antialiased bg-white">{children}</body>
      </html>
    )
  }

  return (
    <html lang="es">
      {/*
        En móvil el scroll es el de la página (la barra de navegación va sticky).
        Con `h-dvh overflow-hidden` en el body no había scroll y el contenido
        quedaba atrapado. El layout de dos columnas empieza en `md`.
      */}
      <body className="antialiased bg-white md:flex md:h-dvh md:overflow-hidden">
        <Sidebar actor={actor} />
        <main className="min-w-0 bg-[#fafafa] px-4 py-6 md:flex-1 md:h-full md:overflow-y-auto md:px-10 md:py-8">
          {children}
        </main>
      </body>
    </html>
  )
}
