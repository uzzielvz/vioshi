'use client'
import { logoutAction } from '@/app/admin/logout/actions'

export default function LogoutButton() {
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className="uppercase tracking-widest text-white/40 hover:text-white transition-colors"
        style={{ fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif", fontSize: '10px' }}
      >
        LOGOUT
      </button>
    </form>
  )
}
