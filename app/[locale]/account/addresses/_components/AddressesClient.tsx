'use client';

import { useActionState, useOptimistic, useTransition, useState } from 'react';
import {
  addAddressAction,
  deleteAddressAction,
  setDefaultAddressAction,
  type AddressActionState,
} from '../actions';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AddressRow {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  street: string;
  apartment: string | null;
  colony: string | null;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  is_default: boolean;
}

// ─── Shared styles ────────────────────────────────────────────────────────────

const INPUT =
  'w-full py-3 border-b border-gray-200 bg-transparent focus:outline-none focus:border-black placeholder:text-gray-300 placeholder:text-[11px] placeholder:tracking-widest text-sm transition-colors duration-200';

const LABEL = 'text-[9px] uppercase tracking-widest text-gray-400';

// ─── Add form ─────────────────────────────────────────────────────────────────

function AddAddressForm({ onCancel }: { onCancel: () => void }) {
  const [state, action, pending] = useActionState<AddressActionState, FormData>(
    addAddressAction,
    null
  );

  return (
    <form action={action} className="border border-gray-200 p-6 mb-6 space-y-4">
      <p className="text-[11px] uppercase tracking-widest font-medium">Nueva Dirección</p>

      <div className="grid grid-cols-2 gap-x-6">
        <div>
          <p className={LABEL}>Nombre</p>
          <input type="text" name="first_name" required placeholder="NOMBRE" className={INPUT} />
        </div>
        <div>
          <p className={LABEL}>Apellido</p>
          <input type="text" name="last_name" required placeholder="APELLIDO" className={INPUT} />
        </div>
      </div>

      <div>
        <p className={LABEL}>Teléfono</p>
        <input type="tel" name="phone" required placeholder="TELÉFONO" className={INPUT} />
      </div>

      <div>
        <p className={LABEL}>Calle y número</p>
        <input type="text" name="street" required placeholder="CALLE Y NÚMERO" className={INPUT} />
      </div>

      <div>
        <p className={LABEL}>Apartamento / Suite (opcional)</p>
        <input type="text" name="apartment" placeholder="APTO, SUITE, ETC." className={INPUT} />
      </div>

      <div>
        <p className={LABEL}>Colonia (opcional)</p>
        <input type="text" name="colony" placeholder="COLONIA" className={INPUT} />
      </div>

      <div className="grid grid-cols-3 gap-x-6">
        <div>
          <p className={LABEL}>Ciudad</p>
          <input type="text" name="city" required placeholder="CIUDAD" className={INPUT} />
        </div>
        <div>
          <p className={LABEL}>Estado</p>
          <input type="text" name="state" required placeholder="ESTADO" className={INPUT} />
        </div>
        <div>
          <p className={LABEL}>Código Postal</p>
          <input type="text" name="zip_code" required placeholder="CP" maxLength={5} className={INPUT} />
        </div>
      </div>

      <input type="hidden" name="country" value="MX" />

      <label className="flex items-center gap-2.5 pt-2 cursor-pointer">
        <input type="checkbox" name="is_default" className="sr-only peer" />
        <span className="w-3.5 h-3.5 border border-gray-300 peer-checked:bg-black peer-checked:border-black flex items-center justify-center flex-shrink-0 transition-colors">
          <svg className="w-2 h-2 text-white hidden peer-checked:block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </span>
        <span className="text-[11px] text-gray-400">Establecer como dirección predeterminada</span>
      </label>

      {state && 'error' in state && (
        <p className="text-[11px] text-red-500">{state.error}</p>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="flex-1 bg-black text-white py-3 text-[11px] uppercase tracking-widest hover:bg-gray-900 transition-colors disabled:bg-gray-200 disabled:text-gray-400"
        >
          {pending ? 'Guardando...' : 'Guardar Dirección'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={pending}
          className="flex-1 border border-gray-300 text-black py-3 text-[11px] uppercase tracking-widest hover:border-black transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

// ─── Address card ─────────────────────────────────────────────────────────────

function AddressCard({
  address,
  onDelete,
  onSetDefault,
  isPending,
}: {
  address: AddressRow;
  onDelete: (id: string) => void;
  onSetDefault: (id: string) => void;
  isPending: boolean;
}) {
  return (
    <div className="border border-gray-200 p-5 relative">
      {address.is_default && (
        <span className="absolute top-4 right-4 text-[9px] uppercase tracking-widest text-gray-400">
          Predeterminada
        </span>
      )}

      <div className="space-y-0.5 pr-24">
        <p style={{ fontSize: '11px', fontWeight: 600, color: '#000' }}>
          {address.first_name} {address.last_name}
        </p>
        <p style={{ fontSize: '11px', color: '#666' }}>{address.street}</p>
        {address.apartment && (
          <p style={{ fontSize: '11px', color: '#666' }}>{address.apartment}</p>
        )}
        {address.colony && (
          <p style={{ fontSize: '11px', color: '#666' }}>{address.colony}</p>
        )}
        <p style={{ fontSize: '11px', color: '#666' }}>
          {address.city}, {address.state} {address.zip_code}
        </p>
        <p style={{ fontSize: '11px', color: '#666' }} className="pt-1">{address.phone}</p>
      </div>

      <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
        {!address.is_default && (
          <button
            onClick={() => onSetDefault(address.id)}
            disabled={isPending}
            className="text-[10px] uppercase tracking-widest text-gray-400 hover:text-black transition-colors disabled:opacity-40"
          >
            Predeterminar
          </button>
        )}
        <button
          onClick={() => onDelete(address.id)}
          disabled={isPending}
          className="text-[10px] uppercase tracking-widest text-red-400 hover:text-red-600 transition-colors disabled:opacity-40 ml-auto"
        >
          Eliminar
        </button>
      </div>
    </div>
  );
}

// ─── Main client component ────────────────────────────────────────────────────

export default function AddressesClient({ initial }: { initial: AddressRow[] }) {
  const [isAdding, setIsAdding] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [optimisticAddresses, applyOptimistic] = useOptimistic(
    initial,
    (state, action: { type: 'delete'; id: string } | { type: 'set_default'; id: string }) => {
      if (action.type === 'delete') {
        return state.filter((a) => a.id !== action.id);
      }
      if (action.type === 'set_default') {
        return state.map((a) => ({ ...a, is_default: a.id === action.id }));
      }
      return state;
    }
  );

  const handleDelete = (id: string) => {
    setError(null);
    startTransition(async () => {
      applyOptimistic({ type: 'delete', id });
      const result = await deleteAddressAction(id);
      if (result && 'error' in result) setError(result.error);
    });
  };

  const handleSetDefault = (id: string) => {
    setError(null);
    startTransition(async () => {
      applyOptimistic({ type: 'set_default', id });
      const result = await setDefaultAddressAction(id);
      if (result && 'error' in result) setError(result.error);
    });
  };

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6">
        <p style={{ fontSize: '11px', color: '#999' }}>
          {optimisticAddresses.length === 0
            ? 'Sin direcciones guardadas'
            : `${optimisticAddresses.length} dirección${optimisticAddresses.length !== 1 ? 'es' : ''}`}
        </p>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="text-[11px] uppercase tracking-widest text-black hover:opacity-60 transition-opacity"
          >
            + Nueva Dirección
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 px-4 py-3 mb-4">
          <p className="text-[11px] text-red-600">{error}</p>
        </div>
      )}

      {/* Add form */}
      {isAdding && (
        <AddAddressForm onCancel={() => setIsAdding(false)} />
      )}

      {/* List */}
      {optimisticAddresses.length === 0 && !isAdding ? (
        <div className="py-16 text-center border border-gray-100">
          <p style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            No tienes direcciones guardadas
          </p>
          <p className="mt-2" style={{ fontSize: '11px', color: '#999' }}>
            Agrega una para agilizar tus próximas compras
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {optimisticAddresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              onDelete={handleDelete}
              onSetDefault={handleSetDefault}
              isPending={isPending}
            />
          ))}
        </div>
      )}
    </div>
  );
}
