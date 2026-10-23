'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import clsx from 'clsx';
import Image from 'next/image';
import Link from 'next/link';
import { useLocaleContext } from '@/hooks/useLocaleContext';
import { formatPrice } from '@/lib/formatters';
import { useCart } from '@/store/cartStore';
import {
  formatAvailabilityLabel,
  groupPickupPointsByMunicipality,
  nextAvailableDate,
  toDateInputValue,
} from '@/lib/pickup';
import type { PickupPoint } from '@/types/delivery';
import { EXPRESS_SHIPPING_COST, STANDARD_SHIPPING_COST } from '@/lib/constants';
import { lookupCP, type MexicoCPData } from '@/lib/mexico';
import { loadStripe } from '@stripe/stripe-js';
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js';
import {
  createCheckoutSessionAction,
  getCheckoutSettingsAction,
  getActivePickupPointsAction,
  cancelCheckoutAction,
  syncCartFromDbAction,
} from './actions';
import { logCheckoutDebug } from '@/lib/stripe/formatPaymentError';
import { CardIcon, ChevronIcon, LockIcon } from '@/components/ui/icons';
import {
  buttonClass,
  inputClass,
  labelClass,
  noteClass,
  sectionLabelClass,
} from '@/components/ui/styles';

// ─── Stripe setup ────────────────────────────────────────────────────────────

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

/**
 * Paso de pago: Stripe Checkout embebido.
 *
 * Reemplaza al PaymentElement sobre un PaymentIntent crudo. La razón es que
 * OXXO y SPEI necesitan el ciclo asíncrono de Checkout Sessions (el voucher se
 * emite antes de que llegue el dinero), y ese ciclo solo lo dan los eventos
 * checkout.session.*. La apariencia se configura en el Dashboard de Stripe
 * (Settings → Branding), no aquí.
 */
function PasoDePago({
  clientSecret,
  reservedUntil,
  cardOnly,
  onBack,
}: {
  clientSecret: string;
  reservedUntil: string;
  cardOnly: boolean;
  onBack: () => void;
}) {
  const t = useTranslations('ui.checkout');
  const tLegacy = useTranslations('checkout');
  const restante = useCuentaRegresiva(reservedUntil);

  return (
    <div className="grid gap-4">
      {/* Urgencia real, no inventada: la prenda está literalmente apartada. */}
      <div className={noteClass}>
        <b className="block text-[13.5px] font-semibold">{t('hold_title')}</b>
        {t('hold_body', { time: restante })}
      </div>

      {cardOnly && <p className="text-[12.5px] text-muted">{tLegacy('card_only_notice')}</p>}

      <div id="checkout-embebido">
        <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret }}>
          <EmbeddedCheckout />
        </EmbeddedCheckoutProvider>
      </div>

      <button type="button" onClick={onBack} className={buttonClass('soft', 'md', 'w-full')}>
        {t('back_to_details')}
      </button>
    </div>
  );
}

/** Cuenta regresiva legible: "28 minutos", "2 horas", "mañana". */
function useCuentaRegresiva(hasta: string): string {
  const t = useTranslations('ui.checkout');
  const [texto, setTexto] = useState('');

  useEffect(() => {
    const calcular = () => {
      const ms = new Date(hasta).getTime() - Date.now();
      if (ms <= 0) return t('time_moments');
      const mins = Math.ceil(ms / 60000);
      if (mins < 60) return t('time_minutes', { count: mins });
      const horas = Math.round(mins / 60);
      if (horas < 24) return t('time_hours', { count: horas });
      return t('time_days', { count: Math.round(horas / 24) });
    };
    setTexto(calcular());
    const id = setInterval(() => setTexto(calcular()), 30_000);
    return () => clearInterval(id);
  }, [hasta, t]);

  return texto;
}

// ─── Form primitives ─────────────────────────────────────────────────────────

function Field({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      {children}
    </div>
  );
}

function SelectInput({ className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select className={clsx(inputClass, 'cursor-pointer appearance-none pr-9', className)} {...props}>
        {children}
      </select>
      <ChevronIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-muted" />
    </div>
  );
}

function FieldError({ children }: { children: React.ReactNode }) {
  return (
    <p data-error role="alert" className="rounded-btn border border-ink px-3 py-2.5 text-[13px] text-ink">
      {children}
    </p>
  );
}

// Radio card from the prototype («.opt»): the checked one gets an ink border.
function OptionCard({
  name,
  value,
  checked,
  onChange,
  title,
  description,
  price,
  nested = false,
}: {
  name: string;
  value: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  title: string;
  description?: string;
  price?: string;
  nested?: boolean;
}) {
  return (
    <label
      className={clsx(
        'grid cursor-pointer grid-cols-[18px_1fr_auto] items-start gap-2.5 rounded-btn border text-[13px]',
        nested ? 'ml-6 px-3 py-2.5' : 'p-3',
        checked ? 'border-ink ring-1 ring-inset ring-ink' : 'border-line'
      )}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="mt-0.5 h-4 w-4 accent-accent"
      />
      <span className="min-w-0">
        <b className="block font-semibold text-ink">{title}</b>
        {description && <span className="text-[12px] text-muted">{description}</span>}
      </span>
      {price && <span className="font-semibold tabular-nums text-ink">{price}</span>}
    </label>
  );
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface CheckoutFormData {
  email: string;
  deliveryMethod: 'home' | 'pickup';
  country: string;
  firstName: string;
  lastName: string;
  address: string;
  apartment: string;
  colonia: string;
  municipio: string;
  state: string;
  zipCode: string;
  phone: string;
  pickupPointId: string;
  pickupDate: string;
  pickupTimeSlot: string;
  agreeToTerms: boolean;
  shippingMethod: string;
}

type CheckoutSettings = Awaited<ReturnType<typeof getCheckoutSettingsAction>>;

// ─── Page ────────────────────────────────────────────────────────────────────

export default function CheckoutPage() {
  const router = useRouter();
  const t = useTranslations('checkout');
  const tc = useTranslations('ui.checkout');
  const { locale } = useLocaleContext();
  const { cart: cartData, closeCart, updateShippingCost, replaceItems, isReady } = useCart();
  const cart = cartData.items;
  const subtotal = cartData.subtotal;
  const shipping = cartData.shipping;
  const total = cartData.total;

  const [isProcessing, setIsProcessing] = useState(false);

  // Stripe payment state
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [pendingOrderNumber, setPendingOrderNumber] = useState<string | null>(null);
  const [pendingGuestToken, setPendingGuestToken] = useState<string | null>(null);
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);
  const [reservedUntil, setReservedUntil] = useState<string | null>(null);
  const [cardOnly, setCardOnly] = useState(false);
  // Threshold and hold windows come from /admin/settings; null until loaded.
  const [checkoutSettings, setCheckoutSettings] = useState<CheckoutSettings | null>(null);

  const [cpData, setCpData] = useState<MexicoCPData | null>(null);
  const [cpLoading, setCpLoading] = useState(false);
  const [cpError, setCpError] = useState(false);
  const [formErrors, setFormErrors] = useState<{
    terms?: string;
    address?: string;
    pickup?: string;
    general?: string;
  }>({});
  const [pickupPoints, setPickupPoints] = useState<PickupPoint[]>([]);
  const [pickupPointsLoading, setPickupPointsLoading] = useState(true);
  // Semilla del fallback mientras carga o si la DB falla; el valor real viene
  // de settings.home_shipping_mxn (paquete A1).
  const [homeShippingMxn, setHomeShippingMxn] = useState(STANDARD_SHIPPING_COST);

  // Fix stale localStorage cart (slug ids / old prices) before checkout submit
  useEffect(() => {
    if (cart.length === 0) return;

    let cancelled = false;
    syncCartFromDbAction(cart).then((result) => {
      if (cancelled || 'error' in result) return;
      const changed = result.items.some(
        (item, i) =>
          item.productId !== cart[i]?.productId ||
          Math.abs(item.price - (cart[i]?.price ?? 0)) > 0.01
      );
      if (changed) replaceItems(result.items);
    });

    return () => {
      cancelled = true;
    };
  }, [cart, replaceItems]);

  useEffect(() => {
    let cancelled = false;
    setPickupPointsLoading(true);
    getActivePickupPointsAction().then((points) => {
      if (cancelled) return;
      setPickupPoints(points);
      setPickupPointsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    getCheckoutSettingsAction().then((settings) => {
      if (cancelled) return;
      setHomeShippingMxn(settings.homeShippingMxn);
      setCheckoutSettings(settings);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const [formData, setFormData] = useState<CheckoutFormData>({
    email: '',
    deliveryMethod: 'pickup',
    country: 'MX',
    firstName: '',
    lastName: '',
    address: '',
    apartment: '',
    colonia: '',
    municipio: '',
    state: '',
    zipCode: '',
    phone: '',
    pickupPointId: '',
    pickupDate: '',
    pickupTimeSlot: '',
    agreeToTerms: false,
    shippingMethod: 'standard',
  });

  const selectedPickupPoint = useMemo(
    () => pickupPoints.find((p) => p.id === formData.pickupPointId),
    [formData.pickupPointId, pickupPoints]
  );

  const pickupByMunicipality = useMemo(
    () => groupPickupPointsByMunicipality(pickupPoints),
    [pickupPoints]
  );

  const pickupAvailabilityLabel = useMemo(
    () => (selectedPickupPoint ? formatAvailabilityLabel(selectedPickupPoint) : ''),
    [selectedPickupPoint]
  );

  const pickupMinDate = useMemo(() => {
    if (!selectedPickupPoint) return toDateInputValue(new Date(Date.now() + 2 * 86400000));
    return toDateInputValue(nextAvailableDate(selectedPickupPoint.transferDay));
  }, [selectedPickupPoint]);

  const isSubmittingRef = useRef(false);

  const paymentStepActive = Boolean(clientSecret || pendingOrderNumber);

  useEffect(() => {
    if (!isReady || paymentStepActive) return;
    if (
      typeof window !== 'undefined' &&
      sessionStorage.getItem('viogi_checkout_payment') === '1'
    ) {
      return;
    }
    if (cart.length === 0 && !isSubmittingRef.current) {
      router.push(`/${locale}/cart`);
    }
  }, [cart, router, locale, paymentStepActive, isReady]);

  // CP → colonia/municipio/estado lookup via SEPOMEX.
  // Only re-runs when zipCode changes — other formData fields are intentionally excluded
  // to avoid an infinite loop (the effect itself writes state/municipio/colonia).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (formData.zipCode.length !== 5) {
      setCpData(null);
      setCpError(false);
      setFormData(prev => ({ ...prev, state: '', municipio: '', colonia: '' }));
      return;
    }
    setCpLoading(true);
    setCpError(false);
    lookupCP(formData.zipCode).then((data) => {
      setCpLoading(false);
      if (data) {
        setCpData(data);
        setFormData(prev => ({
          ...prev,
          state: data.estado,
          municipio: data.municipio,
          colonia: data.colonias.length === 1 ? data.colonias[0] : '',
        }));
      } else {
        setCpError(true);
        setCpData(null);
      }
    });
  }, [formData.zipCode]);

  const shippingCost = useMemo(() => {
    if (formData.deliveryMethod === 'home') {
      return formData.shippingMethod === 'express' ? EXPRESS_SHIPPING_COST : homeShippingMxn;
    }
    if (formData.deliveryMethod === 'pickup' && selectedPickupPoint) {
      return selectedPickupPoint.additionalCost;
    }
    return 0;
  }, [formData.deliveryMethod, formData.shippingMethod, selectedPickupPoint, homeShippingMxn]);

  useEffect(() => {
    updateShippingCost(shippingCost);
  }, [shippingCost, updateShippingCost]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    const updatedFormData = {
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
      ...(name === 'pickupPointId' ? { pickupDate: '' } : {}),
    };
    setFormData(updatedFormData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { terms?: string; address?: string; pickup?: string; general?: string } = {};
    if (!formData.agreeToTerms) errors.terms = t('alert_terms');
    if (formData.deliveryMethod === 'home') {
      if (!formData.address || !formData.colonia || !formData.state || !formData.zipCode)
        errors.address = t('alert_address');
    } else if (formData.deliveryMethod === 'pickup' && !formData.pickupPointId) {
      errors.pickup = t('alert_pickup');
    }
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});
    setIsProcessing(true);

    try {
      const result = await createCheckoutSessionAction(
        cart,
        {
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          deliveryMethod: formData.deliveryMethod,
          country: formData.country,
          address: formData.address,
          apartment: formData.apartment,
          colonia: formData.colonia,
          municipio: formData.municipio,
          state: formData.state,
          zipCode: formData.zipCode,
          shippingMethod: formData.shippingMethod as 'standard' | 'express',
          pickupPointId: formData.pickupPointId,
          pickupDate: formData.pickupDate,
          pickupTimeSlot: formData.pickupTimeSlot as 'morning' | 'afternoon' | 'evening' | '',
        },
        locale
      );

      if (!result.success) {
        // Alguien más se llevó la prenda mientras el cliente llenaba el formulario.
        // Mensaje concreto con el nombre, no un error genérico.
        if (result.error === 'product_unavailable') {
          const nombres = result.unavailable?.length ? result.unavailable.join(', ') : null;
          setFormErrors({
            general: nombres
              ? t('error_taken_named', { prendas: nombres })
              : t('error_taken'),
          });
          return;
        }

        const errorMsg =
          result.error === 'invalid_phone' && result.message
            ? result.message
            : result.error === 'price_changed' && result.message
            ? result.message
            : result.error === 'price_changed'
            ? t('error_price_changed')
            : result.error === 'pickup_inactive'
            ? t('error_pickup_unavailable')
            : result.message
            ? result.message
            : t('error_processing');
        setFormErrors({ general: errorMsg });
        return;
      }

      isSubmittingRef.current = true;
      sessionStorage.setItem('viogi_checkout_payment', '1');
      sessionStorage.setItem(
        'viogi_pending_order',
        JSON.stringify({
          orderNumber: result.orderNumber,
          guestToken: result.guestToken,
          sessionId: result.sessionId,
        })
      );
      setClientSecret(result.clientSecret);
      setPendingOrderNumber(result.orderNumber);
      setPendingGuestToken(result.guestToken);
      setPendingOrderId(result.orderId);
      setReservedUntil(result.reservedUntil);
      setCardOnly(result.cardOnly);
      logCheckoutDebug('Checkout Session creada', {
        orderNumber: result.orderNumber,
        sessionId: result.sessionId,
        reservedUntil: result.reservedUntil,
      });
    } catch (err) {
      console.error('[checkout] handleSubmit error:', err);
      setFormErrors({ general: t('error_processing') });
    } finally {
      setIsProcessing(false);
    }
  };

  if (cart.length === 0) return null;

  const money = (amount: number) => formatPrice(amount, locale, false);
  const pieceCount = cart.reduce((n, item) => n + item.quantity, 0);
  const pickupAreas = pickupByMunicipality.map(([municipio]) => municipio).join(' · ');
  const cheapestPickup = pickupPoints.length
    ? Math.min(...pickupPoints.map((p) => p.additionalCost))
    : null;
  const isPickup = formData.deliveryMethod === 'pickup';
  const cardOnlyByTotal = checkoutSettings ? total > checkoutSettings.cardOnlyThreshold : false;
  const submitLabel = isProcessing ? tc('processing') : tc('continue', { total: money(total) });
  const holdNote = checkoutSettings ? tc('hold_note', { minutes: checkoutSettings.cardReserveMinutes }) : null;

  const deliveryLine = isPickup
    ? selectedPickupPoint
      ? tc('delivery_at', { place: selectedPickupPoint.name })
      : tc('delivery')
    : tc('home');
  const deliveryValue = isPickup
    ? selectedPickupPoint
      ? selectedPickupPoint.additionalCost > 0
        ? money(selectedPickupPoint.additionalCost)
        : tc('free')
      : tc('choose_point')
    : money(shipping);

  const legalLink = (chunks: React.ReactNode) => (
    <Link href={`/${locale}/pages/legal`} className="text-ink underline underline-offset-2">
      {chunks}
    </Link>
  );

  return (
    <div className="min-h-screen bg-paper pb-36 md:pb-16">
      {/* The store header is hidden here: paying gets its own focused bar. */}
      <header className="sticky top-0 z-40 border-b border-line bg-paper">
        <div className="mx-auto grid h-14 max-w-[1100px] grid-cols-[1fr_auto_1fr] items-center px-4 md:h-16 md:px-8">
          <button
            type="button"
            onClick={() => {
              closeCart();
              router.push(`/${locale}/cart`);
            }}
            className="inline-flex items-center gap-1 justify-self-start text-[13px] font-medium text-ink"
            aria-label={tc('back')}
          >
            <ChevronIcon className="h-5 w-5 rotate-180" />
            <span className="hidden md:inline">{tc('back')}</span>
          </button>
          <h1 className="text-[15px] font-semibold text-ink">{tc('title')}</h1>
          <span className="inline-flex items-center gap-1.5 justify-self-end text-[12px] text-muted">
            <LockIcon className="h-5 w-5 text-ink" />
            <span className="hidden md:inline">{tc('secure')}</span>
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-[1100px] md:grid md:grid-cols-[minmax(0,1fr)_360px] md:items-start md:gap-12 md:px-8 md:pt-6">
        <div className="px-4 md:px-0">
          {clientSecret ? (
            <section className="pt-4">
              <h2 className={clsx(sectionLabelClass, 'pb-3')}>{tc('payment')}</h2>
              <PasoDePago
                key={clientSecret}
                clientSecret={clientSecret}
                reservedUntil={reservedUntil ?? new Date().toISOString()}
                cardOnly={cardOnly}
                onBack={() => {
                  // Volver atrás libera la prenda: no tiene por qué
                  // quedarse apartada mientras el cliente lo piensa.
                  if (pendingOrderId) void cancelCheckoutAction(pendingOrderId);
                  setClientSecret(null);
                  setPendingOrderNumber(null);
                  setPendingGuestToken(null);
                  setPendingOrderId(null);
                  setReservedUntil(null);
                  isSubmittingRef.current = false;
                }}
              />
            </section>
          ) : (
            <form id="checkout-form" onSubmit={handleSubmit} noValidate className="grid gap-2">
              {/* Entrega */}
              <section className="grid gap-2">
                <h2 className={clsx(sectionLabelClass, 'pb-1 pt-4')}>{tc('delivery')}</h2>

                <OptionCard
                  name="deliveryMethod"
                  value="pickup"
                  checked={isPickup}
                  onChange={handleInputChange}
                  title={tc('pickup')}
                  description={pickupAreas || tc('pickup_desc')}
                  price={
                    cheapestPickup === null
                      ? undefined
                      : cheapestPickup > 0
                        ? tc('from', { price: money(cheapestPickup) })
                        : tc('free')
                  }
                />

                {isPickup && (
                  <div className="grid gap-2">
                    {pickupPointsLoading ? (
                      <p className="ml-6 text-[12.5px] text-muted">{tc('points_loading')}</p>
                    ) : pickupByMunicipality.length === 0 ? (
                      <p className="ml-6 text-[12.5px] text-ink">{tc('points_empty')}</p>
                    ) : (
                      pickupByMunicipality.map(([municipio, points]) => (
                        <div key={municipio} role="radiogroup" aria-label={municipio} className="grid gap-2">
                          {pickupByMunicipality.length > 1 && (
                            <p className="ml-6 pt-1 text-[11.5px] font-semibold uppercase tracking-[0.1em] text-muted">
                              {municipio}
                            </p>
                          )}
                          {points.map((point) => (
                            <OptionCard
                              key={point.id}
                              nested
                              name="pickupPointId"
                              value={point.id}
                              checked={formData.pickupPointId === point.id}
                              onChange={handleInputChange}
                              title={point.name}
                              description={[`${point.address}, ${point.city}`, point.availableHours]
                                .filter(Boolean)
                                .join(' · ')}
                              price={point.additionalCost > 0 ? money(point.additionalCost) : tc('free')}
                            />
                          ))}
                        </div>
                      ))
                    )}

                    {formErrors.pickup && <FieldError>{formErrors.pickup}</FieldError>}

                    {selectedPickupPoint && (
                      <div className="ml-6 grid gap-2.5 pt-1">
                        {pickupAvailabilityLabel && (
                          <p className="text-[12.5px] text-muted">{pickupAvailabilityLabel}</p>
                        )}
                        <div className="grid gap-2.5 sm:grid-cols-2">
                          <Field id="pickupDate" label={tc('pickup_date')}>
                            <input
                              id="pickupDate"
                              type="date"
                              name="pickupDate"
                              value={formData.pickupDate}
                              onChange={handleInputChange}
                              min={pickupMinDate}
                              className={inputClass}
                            />
                          </Field>
                          <Field id="pickupTimeSlot" label={tc('pickup_time')}>
                            <SelectInput
                              id="pickupTimeSlot"
                              name="pickupTimeSlot"
                              value={formData.pickupTimeSlot}
                              onChange={handleInputChange}
                            >
                              <option value="">{tc('time_any')}</option>
                              <option value="morning">{tc('time_morning')}</option>
                              <option value="afternoon">{tc('time_afternoon')}</option>
                              <option value="evening">{tc('time_evening')}</option>
                            </SelectInput>
                          </Field>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <OptionCard
                  name="deliveryMethod"
                  value="home"
                  checked={!isPickup}
                  onChange={handleInputChange}
                  title={tc('home')}
                  description={tc('home_desc')}
                  price={tc('from', { price: money(homeShippingMxn) })}
                />

                {!isPickup && (
                  <div className="grid gap-3 pt-1">
                    <div className="grid gap-2">
                      <OptionCard
                        nested
                        name="shippingMethod"
                        value="standard"
                        checked={formData.shippingMethod === 'standard'}
                        onChange={handleInputChange}
                        title={tc('shipping_standard')}
                        price={money(homeShippingMxn)}
                      />
                      <OptionCard
                        nested
                        name="shippingMethod"
                        value="express"
                        checked={formData.shippingMethod === 'express'}
                        onChange={handleInputChange}
                        title={tc('shipping_express')}
                        price={money(EXPRESS_SHIPPING_COST)}
                      />
                    </div>

                    <Field id="country" label={tc('country')}>
                      <SelectInput id="country" name="country" value={formData.country} onChange={handleInputChange}>
                        <option value="MX">México</option>
                        <option value="US">United States</option>
                      </SelectInput>
                    </Field>

                    <div className="grid grid-cols-[120px_1fr] gap-2.5">
                      <Field id="zipCode" label={tc('zip')}>
                        <div className="relative">
                          <input
                            id="zipCode"
                            type="text"
                            name="zipCode"
                            inputMode="numeric"
                            autoComplete="postal-code"
                            maxLength={5}
                            required
                            value={formData.zipCode}
                            onChange={handleInputChange}
                            className={inputClass}
                          />
                          {cpLoading && (
                            <span className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 animate-spin rounded-full border border-muted border-t-transparent" />
                          )}
                        </div>
                      </Field>

                      {cpData && (
                        <Field id="colonia" label={tc('colonia')}>
                          <SelectInput
                            id="colonia"
                            name="colonia"
                            value={formData.colonia}
                            onChange={handleInputChange}
                            required
                          >
                            <option value="">{tc('select_colonia')}</option>
                            {cpData.colonias.map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                          </SelectInput>
                        </Field>
                      )}

                      {cpError && (
                        <Field id="colonia" label={tc('colonia')}>
                          <input
                            id="colonia"
                            type="text"
                            name="colonia"
                            required
                            value={formData.colonia}
                            onChange={handleInputChange}
                            className={inputClass}
                          />
                        </Field>
                      )}
                    </div>

                    {(cpData || cpError) && (
                      <div className="grid grid-cols-2 gap-2.5">
                        <Field id="municipio" label={tc('municipality')}>
                          <input
                            id="municipio"
                            type="text"
                            name="municipio"
                            value={formData.municipio}
                            onChange={handleInputChange}
                            disabled={Boolean(cpData)}
                            className={inputClass}
                          />
                        </Field>
                        <Field id="state" label={tc('state')}>
                          <input
                            id="state"
                            type="text"
                            name="state"
                            value={formData.state}
                            onChange={handleInputChange}
                            disabled={Boolean(cpData)}
                            className={inputClass}
                          />
                        </Field>
                      </div>
                    )}

                    <Field id="address" label={tc('street')}>
                      <input
                        id="address"
                        type="text"
                        name="address"
                        autoComplete="address-line1"
                        required
                        value={formData.address}
                        onChange={handleInputChange}
                        className={inputClass}
                      />
                    </Field>
                    <Field id="apartment" label={tc('apartment')}>
                      <input
                        id="apartment"
                        type="text"
                        name="apartment"
                        autoComplete="address-line2"
                        value={formData.apartment}
                        onChange={handleInputChange}
                        className={inputClass}
                      />
                    </Field>

                    {formErrors.address && <FieldError>{formErrors.address}</FieldError>}
                  </div>
                )}
              </section>

              {/* Contacto */}
              <section className="grid gap-3">
                <h2 className={clsx(sectionLabelClass, 'pt-5')}>{tc('contact')}</h2>
                <div className="grid grid-cols-2 gap-2.5">
                  <Field id="firstName" label={tc('first_name')}>
                    <input
                      id="firstName"
                      type="text"
                      name="firstName"
                      autoComplete="given-name"
                      required
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className={inputClass}
                    />
                  </Field>
                  <Field id="lastName" label={tc('last_name')}>
                    <input
                      id="lastName"
                      type="text"
                      name="lastName"
                      autoComplete="family-name"
                      required
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className={inputClass}
                    />
                  </Field>
                </div>
                <Field id="phone" label={tc('phone')}>
                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    autoComplete="tel"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={inputClass}
                  />
                </Field>
                <Field id="checkout-email" label={tc('email')}>
                  <input
                    id="checkout-email"
                    type="email"
                    name="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className={inputClass}
                  />
                </Field>
              </section>

              {/* Pago */}
              <section className="grid gap-2">
                <h2 className={clsx(sectionLabelClass, 'pt-5')}>{tc('payment')}</h2>
                <p className="flex items-center gap-2.5 text-[14px] font-medium text-ink">
                  <CardIcon className="h-5 w-5" />
                  {cardOnlyByTotal ? tc('pay_methods_card') : tc('pay_methods_all')}
                </p>
                {checkoutSettings && (
                  <p className={noteClass}>
                    {cardOnlyByTotal
                      ? tc('pay_note_card_only', { threshold: money(checkoutSettings.cardOnlyThreshold) })
                      : tc('pay_note_all', { hours: checkoutSettings.voucherHours })}
                  </p>
                )}
              </section>

              <section className="grid gap-3 pt-4">
                <label className="flex cursor-pointer items-start gap-2.5 text-[13px] text-ink">
                  <input
                    type="checkbox"
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={handleInputChange}
                    className="mt-0.5 h-4 w-4 flex-none accent-accent"
                  />
                  <span>{tc.rich('terms', { terms: legalLink, privacy: legalLink })}</span>
                </label>
                {formErrors.terms && <FieldError>{formErrors.terms}</FieldError>}
                {formErrors.general && <FieldError>{formErrors.general}</FieldError>}
              </section>
            </form>
          )}
        </div>

        {/* Resumen */}
        <aside className="mt-6 border-t border-line px-4 pt-4 md:sticky md:top-24 md:mt-0 md:rounded-btn md:border md:p-5">
          <h2 className={sectionLabelClass}>{tc('summary')}</h2>
          <ul className="mt-3 grid gap-3">
            {cart.map((item) => (
              <li key={item.id} className="flex items-center gap-3">
                <div className="relative h-16 w-12 flex-none overflow-hidden bg-carton">
                  <Image src={item.image} alt="" fill sizes="48px" className="object-cover mix-blend-multiply" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold text-ink">{item.productName}</p>
                  {item.size && <p className="text-[12px] text-muted">{tc('size', { size: item.size })}</p>}
                </div>
                <p className="text-[13px] font-semibold tabular-nums text-ink">
                  {money(item.price * item.quantity)}
                </p>
              </li>
            ))}
          </ul>
          <dl className="mt-4 grid gap-1.5 border-t border-line pt-3 text-[13.5px]">
            <div className="flex justify-between gap-3">
              <dt>{tc('pieces', { count: pieceCount })}</dt>
              <dd className="tabular-nums">{money(subtotal)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="min-w-0">{deliveryLine}</dt>
              <dd className="flex-none tabular-nums">{deliveryValue}</dd>
            </div>
            <div className="mt-1 flex justify-between gap-3 border-t border-line pt-2 text-[15px] font-bold">
              <dt>{tc('total')}</dt>
              <dd className="tabular-nums">{money(total)}</dd>
            </div>
          </dl>

          {!clientSecret && (
            <div className="mt-4 hidden gap-2 md:grid">
              <button
                type="submit"
                form="checkout-form"
                disabled={isProcessing}
                className={buttonClass('primary', 'md', 'w-full')}
              >
                {submitLabel}
              </button>
              {holdNote && <p className="text-center text-[11.5px] text-muted">{holdNote}</p>}
            </div>
          )}
        </aside>
      </div>

      {/* Mobile dock: hidden once Stripe takes over */}
      {!clientSecret && (
        <div className="fixed inset-x-0 bottom-0 z-40 grid gap-2 border-t border-line bg-paper px-3.5 pb-[max(12px,env(safe-area-inset-bottom))] pt-2.5 md:hidden">
          <button
            type="submit"
            form="checkout-form"
            disabled={isProcessing}
            className={buttonClass('primary', 'md', 'w-full')}
          >
            {submitLabel}
          </button>
          {holdNote && <p className="text-center text-[11.5px] text-muted">{holdNote}</p>}
        </div>
      )}
    </div>
  );
}
