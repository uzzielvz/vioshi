'use client';

import { useCallback, useEffect, useOptimistic, useState, useTransition } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { useTranslations } from 'next-intl';
import clsx from 'clsx';
import EmptyState from '@/components/ui/EmptyState';
import { buttonClass, inputClass, labelClass } from '@/components/ui/styles';
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

// ─── Add form ─────────────────────────────────────────────────────────────────

/**
 * Botones del formulario. Van en su propio componente porque `useFormStatus`
 * solo conoce el estado del <form> que lo envuelve: leído desde el padre
 * siempre devolvería `pending: false`.
 */
function AddFormActions({ onCancel }: { onCancel: () => void }) {
  const t = useTranslations('ui.addresses');
  const { pending } = useFormStatus();

  return (
    <div className="grid grid-cols-2 gap-2 pt-1">
      <button type="submit" disabled={pending} className={buttonClass('primary')}>
        {pending ? t('saving') : t('save')}
      </button>
      <button type="button" onClick={onCancel} disabled={pending} className={buttonClass('line')}>
        {t('cancel')}
      </button>
    </div>
  );
}

function Field({
  name,
  label,
  type = 'text',
  required = false,
  autoComplete,
  inputMode,
  maxLength,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  maxLength?: number;
}) {
  const id = `address-${name}`;
  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        inputMode={inputMode}
        maxLength={maxLength}
        className={inputClass}
      />
    </div>
  );
}

function AddAddressForm({ onDone }: { onDone: () => void }) {
  const t = useTranslations('ui.addresses');
  // `useFormState` de react-dom, no `useActionState`: eso es React 19 y aquí
  // corre React 18.3, donde el import no existe y la página revienta al
  // renderizarse.
  const [state, action] = useFormState<AddressActionState, FormData>(addAddressAction, null);

  useEffect(() => {
    if (state && 'success' in state) onDone();
  }, [state, onDone]);

  return (
    <form action={action} className="mb-5 grid gap-3.5 rounded-btn border border-line p-4">
      <p className="text-[15px] font-bold text-ink">{t('new_title')}</p>

      <div className="grid grid-cols-2 gap-2.5">
        <Field name="first_name" label={t('first_name')} required autoComplete="given-name" />
        <Field name="last_name" label={t('last_name')} required autoComplete="family-name" />
      </div>
      <Field name="phone" label={t('phone')} type="tel" required autoComplete="tel" />
      <Field name="street" label={t('street')} required autoComplete="address-line1" />
      <div className="grid grid-cols-2 gap-2.5">
        <Field name="apartment" label={t('apartment')} autoComplete="address-line2" />
        <Field name="colony" label={t('colony')} />
      </div>
      <div className="grid grid-cols-[1fr_1fr_110px] gap-2.5">
        <Field name="city" label={t('city')} required autoComplete="address-level2" />
        <Field name="state" label={t('state')} required autoComplete="address-level1" />
        <Field
          name="zip_code"
          label={t('zip')}
          required
          autoComplete="postal-code"
          inputMode="numeric"
          maxLength={5}
        />
      </div>

      <input type="hidden" name="country" value="MX" />

      <label className="flex cursor-pointer items-center gap-2.5 text-[13.5px] text-ink">
        <input type="checkbox" name="is_default" className="h-4 w-4 accent-accent" />
        {t('make_default_check')}
      </label>

      {state && 'error' in state && (
        <p role="alert" className="rounded-btn border border-ink px-3 py-2.5 text-[13px] text-ink">
          {state.error}
        </p>
      )}

      <AddFormActions onCancel={onDone} />
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
  const t = useTranslations('ui.addresses');

  return (
    <div
      className={clsx(
        'grid gap-3 rounded-btn border p-4 text-[13.5px]',
        address.is_default ? 'border-ink' : 'border-line'
      )}
    >
      <div className="grid gap-0.5">
        <div className="flex items-baseline justify-between gap-3">
          <p className="font-semibold text-ink">
            {address.first_name} {address.last_name}
          </p>
          {address.is_default && (
            <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-ink">
              {t('default_badge')}
            </span>
          )}
        </div>
        <p className="text-muted">
          {address.street}
          {address.apartment ? `, ${address.apartment}` : ''}
        </p>
        {address.colony && <p className="text-muted">{address.colony}</p>}
        <p className="text-muted">
          {address.city}, {address.state} {address.zip_code}
        </p>
        <p className="text-muted">{address.phone}</p>
      </div>

      <div className="flex gap-5 border-t border-line pt-3 text-[13px] font-semibold">
        {!address.is_default && (
          <button
            type="button"
            onClick={() => onSetDefault(address.id)}
            disabled={isPending}
            className="text-ink disabled:opacity-40"
          >
            {t('make_default')}
          </button>
        )}
        <button
          type="button"
          onClick={() => onDelete(address.id)}
          disabled={isPending}
          className="ml-auto text-muted hover:text-ink disabled:opacity-40"
        >
          {t('delete')}
        </button>
      </div>
    </div>
  );
}

// ─── Main client component ────────────────────────────────────────────────────

export default function AddressesClient({ initial }: { initial: AddressRow[] }) {
  const t = useTranslations('ui.addresses');
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

  const closeForm = useCallback(() => setIsAdding(false), []);

  return (
    <div>
      {optimisticAddresses.length > 0 && (
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="text-[13px] font-semibold text-ink">{t('count', { count: optimisticAddresses.length })}</p>
          {!isAdding && (
            <button type="button" onClick={() => setIsAdding(true)} className={buttonClass('line', 'sm')}>
              {t('add')}
            </button>
          )}
        </div>
      )}

      {error && (
        <p role="alert" className="mb-4 rounded-btn border border-ink px-3 py-2.5 text-[13px] text-ink">
          {error}
        </p>
      )}

      {isAdding && <AddAddressForm onDone={closeForm} />}

      {optimisticAddresses.length === 0 && !isAdding ? (
        <EmptyState title={t('empty_title')} body={t('empty_body')}>
          <button type="button" onClick={() => setIsAdding(true)} className={buttonClass('primary')}>
            {t('add')}
          </button>
        </EmptyState>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
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
