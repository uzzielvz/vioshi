import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import ToggleButton from './ToggleButton'

export const dynamic = 'force-dynamic'

const font = { fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif" }

const TYPE_LABEL: Record<string, string> = {
  flagship: 'Flagship',
  retail:   'Retail',
  partner:  'Partner',
}

export default async function PickupPointsPage() {
  const supabase = createAdminClient()
  const { data: points } = await supabase
    .from('pickup_points')
    .select('id, name, city, state, type, additional_cost_mxn, available_hours, is_active')
    .order('type')
    .order('city')

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="uppercase tracking-widest" style={{ ...font, fontSize: '13px', fontWeight: 500 }}>
          Pickup Points ({points?.length ?? 0})
        </h1>
      </div>

      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-gray-200">
            {['Name', 'City', 'Type', 'Extra Cost', 'Hours', 'Status', 'Actions'].map(h => (
              <th
                key={h}
                className="text-left pb-3 uppercase tracking-widest text-gray-400 font-normal"
                style={{ ...font, fontSize: '10px' }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(points ?? []).map(point => (
            <tr key={point.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
              <td className="py-3 pr-6" style={{ ...font, fontSize: '11px' }}>
                {point.name}
              </td>
              <td className="py-3 pr-6 text-gray-500" style={{ ...font, fontSize: '11px' }}>
                {point.city}, {point.state}
              </td>
              <td className="py-3 pr-6 text-gray-500" style={{ ...font, fontSize: '11px' }}>
                {TYPE_LABEL[point.type] ?? point.type}
              </td>
              <td className="py-3 pr-6 font-mono" style={{ ...font, fontSize: '11px' }}>
                {point.additional_cost_mxn > 0 ? `$${point.additional_cost_mxn}` : '—'}
              </td>
              <td className="py-3 pr-6 text-gray-500 max-w-[200px] truncate" style={{ ...font, fontSize: '10px' }}>
                {point.available_hours ?? '—'}
              </td>
              <td className="py-3 pr-6">
                <ToggleButton id={point.id} isActive={point.is_active} />
              </td>
              <td className="py-3">
                <Link
                  href={`/admin/pickup-points/${point.id}`}
                  className="uppercase tracking-widest border-b border-black hover:opacity-50 transition-opacity"
                  style={{ ...font, fontSize: '10px' }}
                >
                  Edit
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
