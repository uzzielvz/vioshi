'use client';

import { useState, useEffect } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { updateProfileAction, type ProfileUpdateState } from '../actions';

const inputClass =
  'w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-50 disabled:text-gray-500 text-sm';

const labelClass = 'block text-xs uppercase tracking-wider text-gray-500 mb-2';

function SaveButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className="flex-1 bg-black text-white py-3 rounded uppercase tracking-wider font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
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

  // Cuando el guardado tiene éxito, salimos de modo edición
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
    <form action={formAction} className="bg-white border border-gray-200 rounded-lg p-6 md:p-8">
      <div className="space-y-6">
        <div>
          <h2 className="text-sm uppercase tracking-wider font-medium mb-4">
            Información personal
          </h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className={labelClass}>
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
                className={inputClass}
              />
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-sm uppercase tracking-wider font-medium mb-4">
            Información de contacto
          </h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className={labelClass}>
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                disabled
                className={inputClass}
              />
              <p className="text-xs text-gray-400 mt-1">
                El email no se puede cambiar desde aquí.
              </p>
            </div>

            <div>
              <label htmlFor="phone" className={labelClass}>
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
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {state && 'error' in state && (
          <p className="text-xs text-red-500">{state.error}</p>
        )}

        {state && 'ok' in state && !isEditing && (
          <p className="text-xs text-green-600">Perfil actualizado correctamente.</p>
        )}

        <div className="flex gap-3 pt-4 border-t border-gray-200">
          {!isEditing ? (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="flex-1 bg-black text-white py-3 rounded uppercase tracking-wider font-medium hover:bg-gray-800 transition-colors text-sm"
            >
              Editar perfil
            </button>
          ) : (
            <>
              <SaveButton disabled={!name.trim()} />
              <button
                type="button"
                onClick={cancelEdit}
                className="flex-1 border-2 border-black text-black py-3 rounded uppercase tracking-wider font-medium hover:bg-black hover:text-white transition-colors text-sm"
              >
                Cancelar
              </button>
            </>
          )}
        </div>
      </div>
    </form>
  );
}
