'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useFormState, useFormStatus } from 'react-dom';
import type { Locale } from '@/i18n';
import { brand } from '@/lib/brand';
import { updatePasswordAction, type AuthState } from '../../actions';

const FONT: React.CSSProperties = {
  fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
};

const LOGO: React.CSSProperties = {
  ...FONT,
  textShadow: '0 0 0.5px rgba(0,0,0,0.8)',
};

const INPUT =
  'w-full border-b border-gray-200 py-3 text-[11px] placeholder:text-gray-400 focus:outline-none focus:border-black transition-colors bg-transparent';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-black text-white py-3 text-[11px] uppercase tracking-widest font-medium hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed mt-2"
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
    <div className="min-h-screen bg-white pt-16 flex items-start justify-center px-4 py-16 md:py-24" style={FONT}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <span className="text-2xl font-bold uppercase tracking-wider" style={LOGO}>
            {brand.name}
          </span>
        </div>

        <p className="text-[11px] font-semibold uppercase tracking-widest mb-1">
          Nueva contraseña
        </p>
        <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">
          Para
        </p>
        <p className="text-[11px] text-black mb-8">{email}</p>

        <form action={formAction} className="space-y-4" noValidate>
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
              className={INPUT}
            />
            <p className="text-[10px] text-gray-400 mt-1">Mínimo 8 caracteres</p>
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
            className={INPUT}
          />

          {!passwordsMatch && (
            <p className="text-[10px] text-red-500">Las contraseñas no coinciden</p>
          )}

          {state && 'error' in state && (
            <p className="text-[10px] text-red-500">{state.error}</p>
          )}

          <SubmitButton />
        </form>

        <div className="text-center mt-10">
          <Link
            href={`/${locale}`}
            className="text-[10px] uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
          >
            ← Volver a la tienda
          </Link>
        </div>
      </div>
    </div>
  );
}
