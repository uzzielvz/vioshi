'use client'
import { togglePickupPoint } from './actions'

const font = { fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif" }

export default function ToggleButton({ id, isActive }: { id: string; isActive: boolean }) {
  async function handleToggle() {
    await togglePickupPoint(id, !isActive)
  }

  return (
    <button
      onClick={handleToggle}
      className={`uppercase tracking-widest transition-colors ${
        isActive ? 'text-black hover:text-gray-400' : 'text-gray-300 hover:text-black'
      }`}
      style={{ ...font, fontSize: '10px' }}
    >
      {isActive ? 'ACTIVE' : 'INACTIVE'}
    </button>
  )
}
