import type { Metadata } from 'next'
import { brand } from '@/lib/brand'
import { peekAdminActor } from '@/lib/admin/session'
import '../globals.css'
import AdminHeader from './_components/AdminHeader'

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
        Mismo esqueleto que la tienda (components/ClientLayout): header fijo de
        56px arriba, fondo blanco y el scroll normal de la página. El panel es
        una sección más del sitio, no otra aplicación: antes tenía una columna
        negra lateral y fondo gris, y se sentía ajeno.
      */}
      <body className="antialiased bg-white">
        <AdminHeader actor={actor} />
        <main className="pt-14 px-4 md:px-8 py-6 md:py-8">{children}</main>
      </body>
    </html>
  )
}
