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
      <body className="antialiased flex h-dvh overflow-hidden bg-white">
        <Sidebar actor={actor} />
        <main className="flex-1 min-w-0 h-full overflow-y-auto bg-[#fafafa] px-6 py-8 md:px-10">
          {children}
        </main>
      </body>
    </html>
  )
}
