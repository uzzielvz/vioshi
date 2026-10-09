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
      <body className="antialiased bg-white">
        <AdminHeader actor={actor} />
        <main className="min-w-0 px-4 py-6 md:px-8 md:py-8">{children}</main>
      </body>
    </html>
  )
}
