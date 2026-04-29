import type { Metadata } from 'next'
import '../globals.css'
import Sidebar from './_components/Sidebar'

export const metadata: Metadata = {
  title: 'VIOGI Admin',
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="antialiased flex">
        <Sidebar />
        <main className="flex-1 bg-[#fafafa] min-h-screen px-10 py-8">
          {children}
        </main>
      </body>
    </html>
  )
}
