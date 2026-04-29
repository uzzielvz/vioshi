'use client'
import { useFormState, useFormStatus } from 'react-dom'
import Link from 'next/link'
import { loginAction } from './actions'

const fontStyle = {
  fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-black text-white uppercase tracking-widest py-3 hover:bg-gray-800 transition-colors disabled:opacity-50"
      style={{ fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif", fontSize: '10px', fontWeight: 500 }}
    >
      {pending ? 'ENTERING...' : 'ENTER ADMIN'}
    </button>
  )
}

export default function AdminLoginPage() {
  const [state, formAction] = useFormState(loginAction, null)

  return (
    <main className="min-h-screen bg-white flex items-start justify-center">
      <div className="w-full max-w-xs mt-[20vh]">
        <Link href="/es" className="block text-center mb-10">
          <span
            className="font-logo tracking-widest"
            style={{ fontSize: '28px', lineHeight: 1 }}
          >
            VIOGI
          </span>
          <br />
          <span
            className="uppercase tracking-widest text-gray-400"
            style={{ ...fontStyle, fontSize: '10px' }}
          >
            ADMIN
          </span>
        </Link>

        <form action={formAction} className="flex flex-col gap-6">
          <div>
            <input
              type="password"
              name="password"
              placeholder="Password"
              required
              className="w-full border-b border-gray-200 bg-transparent py-2.5 focus:outline-none focus:border-black transition-colors"
              style={{ ...fontStyle, fontSize: '11px' }}
            />
          </div>

          <SubmitButton />

          {state?.error && (
            <p
              className="text-red-500 text-center"
              style={{ ...fontStyle, fontSize: '11px' }}
            >
              {state.error}
            </p>
          )}
        </form>
      </div>
    </main>
  )
}
