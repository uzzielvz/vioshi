'use client'

import { useTransition } from 'react'
import { deleteBrand } from './actions'

export default function DeleteBrandButton({ id, name }: { id: string; name: string }) {
  const [pending, startTransition] = useTransition()

  const handleDelete = () => {
    if (!confirm(`Delete brand "${name}"?\n\nNote: Existing products linked to this brand will have their brand cleared.`)) {
      return
    }

    startTransition(async () => {
      await deleteBrand(id)
    })
  }

  return (
    <button
      onClick={handleDelete}
      disabled={pending}
      className="uppercase tracking-widest text-xs text-red-600 hover:text-red-700 border-b border-red-600 disabled:opacity-50"
    >
      {pending ? 'Deleting...' : 'Delete'}
    </button>
  )
}
