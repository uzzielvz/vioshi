'use client'

import { useTransition } from 'react'
import { toggleBrandActive } from './actions'

export default function ToggleButton({ id, isActive }: { id: string; isActive: boolean }) {
  const [pending, startTransition] = useTransition()

  const handleToggle = () => {
    startTransition(async () => {
      await toggleBrandActive(id, !isActive)
    })
  }

  return (
    <button
      onClick={handleToggle}
      disabled={pending}
      className={`uppercase tracking-widest text-xs px-3 py-1 border transition-colors disabled:opacity-50 ${
        isActive
          ? 'border-black text-black hover:bg-black hover:text-white'
          : 'border-gray-300 text-gray-400 hover:border-gray-400'
      }`}
    >
      {pending ? '...' : isActive ? 'ACTIVE' : 'INACTIVE'}
    </button>
  )
}
