'use client'
import { logoutAction } from '@/app/admin/logout/actions'

/** Mismo tratamiento que los enlaces del header de la tienda: negro al 50%. */
export default function LogoutButton() {
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className="uppercase whitespace-nowrap text-black/50 hover:opacity-60 transition-opacity duration-200"
        style={{
          fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
          letterSpacing: '0.02em',
          fontSize: '11px',
        }}
      >
        Salir
      </button>
    </form>
  )
}
