'use client'
import { deleteProduct } from './actions'

export default function DeleteButton({ id }: { id: string }) {
  async function handleClick() {
    if (!confirm('Delete this product?')) return
    await deleteProduct(id)
  }

  return (
    <button
      onClick={handleClick}
      className="uppercase tracking-widest text-gray-400 hover:text-red-500 transition-colors"
      style={{ fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif", fontSize: '10px' }}
    >
      ×
    </button>
  )
}
