'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useFormState, useFormStatus } from 'react-dom';
import type { Locale } from '@/i18n';
import { updatePasswordAction, type AuthState } from '../../actions';

const FONT: React.CSSProperties = {
  fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
};

const LOGO: React.CSSProperties = {
  ...FONT,
  textShadow: '0 0 0.5px rgba(0,0,0,0.8)',
};

const inputClass =
  'w-full border border-gray-300 px-3 py-2.5 text-[11px] placeholder:text-gray-400 focus:outline-none focus:border-black transition-colors bg-transparent';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-black text-white py-2.5 text-[11px] uppercase tracking-wide font-medium hover:opacity-75 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed mt-2"
    >
      {pending ? 'Guardando...' : 'Guardar contraseña'}
    </button>
  );
}

export default function ResetForm({ locale, email }: { locale: Locale; email: string }) {
  const [state, formAction] = useFormState<AuthState, FormData>(updatePasswordAction, null);

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const passwordsMatch = !confirm || password === confirm;

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-10">
      <div className="bg-gray-50 w-full max-w-sm px-8 py-10" style={FONT}>
        <div className="text-center mb-3">
          <span className="text-lg font-bold" style={LOGO}>VIOGI</span>
        </div>

        <p className="text-[11px] font-semibold uppercase tracking-wide mb-0.5">
          Nueva contraseña
        </p>
        <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-1">
          Para
        </p>
        <p className="text-[11px] text-black mb-5">{email}</p>

        <form action={formAction} className="space-y-3" noValidate>
          <input type="hidden" name="locale" value={locale} />

          <div>
            <input
              type="password"
              name="password"
              placeholder="Nueva contraseña"
              required
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
            />
            <p className="text-[10px] text-gray-400 mt-0.5">Mínimo 8 caracteres</p>
          </div>

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirmar contraseña"
            required
            minLength={8}
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className={inputClass}
          />

          {!passwordsMatch && (
            <p className="text-[10px] text-red-500">Las contraseñas no coinciden</p>
          )}

          {state && 'error' in state && (
            <p className="text-[10px] text-red-500">{state.error}</p>
          )}

          <SubmitButton />
        </form>

        <div className="text-center mt-6">
          <Link
            href={`/${locale}`}
            className="text-[10px] uppercase tracking-widest text-gray-300 hover:text-black transition-colors"
          >
            ← Volver a la tienda
          </Link>
        </div>
      </div>
    </div>
  );
}
