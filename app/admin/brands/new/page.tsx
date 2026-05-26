import Link from 'next/link'
import BrandForm from '../_components/BrandForm'
import { createBrand } from '../actions'

const font = {
  fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
}

export default function NewBrandPage() {
  return (
    <div className="max-w-[620px]">
      <div className="mb-8">
        <Link
          href="/admin/brands"
          className="uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
          style={{ ...font, fontSize: '10px' }}
        >
          ← Back to brands
        </Link>
      </div>

      <h1 className="uppercase tracking-widest mb-10" style={{ ...font, fontSize: '13px', fontWeight: 500 }}>
        New Brand
      </h1>

      <BrandForm action={createBrand} mode="create" />
    </div>
  )
}
