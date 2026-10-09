'use client'
import { logoutAction } from '@/app/admin/logout/actions'

export default function LogoutButton() {
  return (
    <form action={logoutAction} className="flex">
      <button
        type="submit"
        className="uppercase font-medium text-black hover:opacity-60 transition-opacity duration-200"
        style={{
          fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
          fontSize: '11px',
          letterSpacing: '0.02em',
          textShadow: '0 0 0.5px rgba(0, 0, 0, 0.8)',
        }}
      >
        Salir
      </button>
    </form>
  )
}
