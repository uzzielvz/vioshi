'use client';

import { useState, useEffect } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { updateProfileAction, type ProfileUpdateState } from '../actions';

const INPUT =
  'w-full py-3 border-b border-gray-200 bg-transparent focus:outline-none focus:border-black disabled:text-gray-400 disabled:cursor-not-allowed text-[11px] transition-colors';

const LABEL = 'text-[9px] uppercase tracking-widest text-gray-400 mb-1';

function SaveButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className="flex-1 bg-black text-white py-2.5 text-[11px] uppercase tracking-widest font-medium hover:opacity-80 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
    >
      {pending ? 'Guardando...' : 'Guardar cambios'}
    </button>
  );
}

interface Props {
  email: string;
  initialName: string;
  initialPhone: string;
}

export default function ProfileForm({ email, initialName, initialPhone }: Props) {
  const [state, formAction] = useFormState<ProfileUpdateState, FormData>(
    updateProfileAction,
    null
  );

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);

  useEffect(() => {
    if (state && 'ok' in state) {
      setIsEditing(false);
    }
  }, [state]);

  const cancelEdit = () => {
    setName(initialName);
    setPhone(initialPhone);
    setIsEditing(false);
  };

  return (
    <form action={formAction} className="space-y-8">
      <div>
        <h2 className="text-[11px] font-semibold uppercase tracking-widest text-black mb-5">
          Información personal
        </h2>
        <div>
          <label htmlFor="name" className={LABEL}>
            Nombre completo
          </label>
          <input
            id="name"
            type="text"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={!isEditing}
            required
            className={INPUT}
          />
        </div>
      </div>

      <div>
        <h2 className="text-[11px] font-semibold uppercase tracking-widest text-black mb-5">
          Información de contacto
        </h2>
        <div className="space-y-5">
          <div>
            <label htmlFor="email" className={LABEL}>
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              disabled
              className={INPUT}
            />
            <p className="text-[10px] text-gray-400 mt-1">
              El email no se puede cambiar desde aquí.
            </p>
          </div>

          <div>
            <label htmlFor="phone" className={LABEL}>
              Teléfono (opcional)
            </label>
            <input
              id="phone"
              type="tel"
              name="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={!isEditing}
              placeholder="+52 55 1234 5678"
              className={INPUT}
            />
          </div>
        </div>
      </div>

      {state && 'error' in state && (
        <p className="text-[10px] text-red-500">{state.error}</p>
      )}

      {state && 'ok' in state && !isEditing && (
        <p className="text-[10px] text-green-600">Perfil actualizado correctamente.</p>
      )}

      <div className="flex gap-3 pt-4 border-t border-gray-100">
        {!isEditing ? (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="flex-1 bg-black text-white py-2.5 text-[11px] uppercase tracking-widest font-medium hover:opacity-80 transition-opacity"
          >
            Editar perfil
          </button>
        ) : (
          <>
            <SaveButton disabled={!name.trim()} />
            <button
              type="button"
              onClick={cancelEdit}
              className="flex-1 border border-black text-black py-2.5 text-[11px] uppercase tracking-widest font-medium hover:bg-black hover:text-white transition-colors"
            >
              Cancelar
            </button>
          </>
        )}
      </div>
    </form>
  );
}
