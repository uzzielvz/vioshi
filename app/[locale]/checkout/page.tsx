'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useLocaleContext } from '@/hooks/useLocaleContext';
import { formatPrice } from '@/lib/formatters';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/store/cartStore';
import {
  formatAvailabilityLabel,
  groupPickupPointsByMunicipality,
  nextAvailableDate,
  toDateInputValue,
} from '@/lib/pickup';
import type { PickupPoint } from '@/types/delivery';
import {
  DELIVERY_METHODS,
  EXPRESS_SHIPPING_COST,
  STANDARD_SHIPPING_COST,
} from '@/lib/constants';
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
import { brand } from '@/lib/brand';
import {
  formatStripeClientError,
  logCheckoutDebug,
} from '@/lib/stripe/formatPaymentError';

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
  const t = useTranslations('checkout');
  const restante = useCuentaRegresiva(reservedUntil);

  return (
    <div className="space-y-6">
      {/* Urgencia real, no inventada: la prenda está literalmente apartada. */}
      <div className="border border-gray-200 bg-gray-50 px-4 py-3 space-y-1">
        <p className="text-[11px] uppercase tracking-widest font-medium">
          {t('unique_piece_title')}
        </p>
        <p className="text-[11px] text-gray-600 leading-relaxed">
          {t('unique_piece_body', { tiempo: restante })}
        </p>
      </div>

      {cardOnly && (
        <p className="text-[10px] text-gray-500 leading-relaxed">
          {t('card_only_notice')}
        </p>
      )}

      <div id="checkout-embebido">
        <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret }}>
          <EmbeddedCheckout />
        </EmbeddedCheckoutProvider>
      </div>

      <button
        type="button"
        onClick={onBack}
        className="w-full text-[10px] uppercase tracking-widest text-gray-400 hover:text-black transition-colors py-2"
      >
        {t('back_to_details')}
      </button>
    </div>
  );
}

/** Cuenta regresiva legible: "28 minutos", "2 horas", "mañana". */
function useCuentaRegresiva(hasta: string): string {
  const [texto, setTexto] = useState('');

  useEffect(() => {
    const calcular = () => {
      const ms = new Date(hasta).getTime() - Date.now();
      if (ms <= 0) return 'unos momentos';
      const mins = Math.ceil(ms / 60000);
      if (mins < 60) return `${mins} ${mins === 1 ? 'minuto' : 'minutos'}`;
      const horas = Math.round(mins / 60);
      if (horas < 24) return `${horas} ${horas === 1 ? 'hora' : 'horas'}`;
      const dias = Math.round(horas / 24);
      return `${dias} ${dias === 1 ? 'día' : 'días'}`;
    };
    setTexto(calcular());
    const id = setInterval(() => setTexto(calcular()), 30_000);
    return () => clearInterval(id);
  }, [hasta]);

  return texto;
}

// ─── Shared primitive styles ────────────────────────────────────────────────

const INPUT =
  'w-full py-3.5 border-b border-gray-200 bg-transparent focus:outline-none focus:border-black placeholder:text-gray-300 placeholder:text-[11px] placeholder:tracking-widest text-sm transition-colors duration-200';

const INPUT_READONLY =
  'w-full py-3.5 border-b border-gray-100 bg-transparent text-gray-400 text-sm cursor-not-allowed select-none';

const SECTION_LABEL =
  'text-[11px] uppercase tracking-widest text-black font-medium';

// Custom select — wraps native <select> with a clean chevron
function CustomSelect({
  children,
  className = '',
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative border-b border-gray-200 focus-within:border-black transition-colors duration-200">
      <select
        className={`w-full py-3.5 bg-transparent appearance-none focus:outline-none text-sm pr-6 cursor-pointer ${className}`}
        {...props}
      >
        {children}
      </select>
      <svg
        className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  );
}

// Custom radio card — replaces native radio with a minimal dot indicator
function RadioCard({
  checked,
  label,
  description,
  onChange,
  name,
  value,
}: {
  checked: boolean;
  label: string;
  description?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  name: string;
  value: string;
}) {
  return (
    <label className="flex items-center gap-3 py-3.5 border-b border-gray-100 cursor-pointer group hover:border-gray-300 transition-colors">
      <span
        className={`w-3.5 h-3.5 border rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
          checked ? 'border-black' : 'border-gray-300 group-hover:border-gray-500'
        }`}
      >
        {checked && <span className="w-1.5 h-1.5 rounded-full bg-black" />}
      </span>
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />
      <div>
        <span className="text-xs">{label}</span>
        {description && (
          <p className="text-[10px] text-gray-400 mt-0.5">{description}</p>
        )}
      </div>
    </label>
  );
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface CheckoutFormData {
  email: string;
  emailNews: boolean;
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
  saveInfo: boolean;
  agreeToTerms: boolean;
  shippingMethod: string;
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function CheckoutPage() {
  const router = useRouter();
  const t = useTranslations('checkout');
  const { locale } = useLocaleContext();
  const { cart: cartData, closeCart, updateShippingCost, replaceItems } = useCart();
  const cart = cartData.items;
  const subtotal = cartData.subtotal;
  const shipping = cartData.shipping;
  const total = cartData.total;

  const [isProcessing, setIsProcessing] = useState(false);
  const [showShippingMethods, setShowShippingMethods] = useState(false);
  const [showOrderSummary, setShowOrderSummary] = useState(false);

  // Stripe payment state
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [pendingOrderNumber, setPendingOrderNumber] = useState<string | null>(null);
  const [pendingGuestToken, setPendingGuestToken] = useState<string | null>(null);
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);
  const [reservedUntil, setReservedUntil] = useState<string | null>(null);
  const [cardOnly, setCardOnly] = useState(false);

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

  const [formData, setFormData] = useState<CheckoutFormData>({
    email: '',
    emailNews: true,
    deliveryMethod: 'home',
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
    saveInfo: false,
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
    if (paymentStepActive) return;
    if (
      typeof window !== 'undefined' &&
      sessionStorage.getItem('viogi_checkout_payment') === '1'
    ) {
      return;
    }
    if (cart.length === 0 && !isSubmittingRef.current) {
      router.push(`/${locale}/cart`);
    }
  }, [cart, router, locale, paymentStepActive]);

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
      return formData.shippingMethod === 'express' ? EXPRESS_SHIPPING_COST : STANDARD_SHIPPING_COST;
    }
    if (formData.deliveryMethod === 'pickup' && selectedPickupPoint) {
      return selectedPickupPoint.additionalCost;
    }
    return 0;
  }, [formData.deliveryMethod, formData.shippingMethod, selectedPickupPoint]);

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

    if (['address', 'colonia', 'state', 'zipCode', 'deliveryMethod', 'pickupPointId'].includes(name)) {
      const shouldShow =
        updatedFormData.deliveryMethod === 'home'
          ? !!(updatedFormData.address && updatedFormData.colonia && updatedFormData.state && updatedFormData.zipCode)
          : !!updatedFormData.pickupPointId;
      setShowShippingMethods(shouldShow);
    }
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

  return (
    <div
      className="min-h-screen bg-white"
      style={{ fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif" }}
    >

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); closeCart(); window.location.href = `/${locale}`; }}
              className="text-base font-bold text-black hover:opacity-50 transition-opacity cursor-pointer"
              style={{
                fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                textShadow: '0 0 0.5px rgba(0, 0, 0, 0.8)',
              }}
            >
              {brand.name}
            </button>
            {/* Back to cart */}
            <button
              type="button"
              onClick={() => { closeCart(); router.push(`/${locale}/cart`); }}
              className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
              aria-label={t('back_to_cart_aria')}
            >
              ← {t('back_to_cart_aria')}
            </button>
            {/* Locale switcher */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => { if (locale !== 'es') window.location.href = `/es/checkout`; }}
                className={`text-[10px] uppercase tracking-widest transition-colors ${locale === 'es' ? 'text-black' : 'text-gray-300 hover:text-gray-500'}`}
              >
                ES
              </button>
              <span className="text-gray-200 text-[10px]">/</span>
              <button
                type="button"
                onClick={() => { if (locale !== 'en') window.location.href = `/en/checkout`; }}
                className={`text-[10px] uppercase tracking-widest transition-colors ${locale === 'en' ? 'text-black' : 'text-gray-300 hover:text-gray-500'}`}
              >
                EN
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="pt-16">
        <div className="max-w-7xl mx-auto lg:px-4 lg:py-12">
          <div className="grid lg:grid-cols-2 lg:gap-20">

            {/* ── Left: Form ─────────────────────────────────────────── */}
            <div className="order-2 lg:order-1 px-6 sm:px-8 lg:px-0 mt-10 lg:mt-0 pb-12 lg:pb-0">
              <form id="checkout-form" onSubmit={handleSubmit} className="space-y-10 pb-24 lg:pb-0">

                {/* 01 Contact */}
                <section>
                  <div className="flex items-center justify-between mb-6 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-3">
                      <span className="text-[9px] text-gray-300 tracking-widest">01</span>
                      <p className={SECTION_LABEL}>{t('contact')}</p>
                    </div>
                    <Link href={`/${locale}/account`} className="text-[10px] uppercase tracking-widest text-gray-400 hover:text-black transition-colors">
                      {t('sign_in')}
                    </Link>
                  </div>
                  <div className="space-y-1">
                    <input
                      id="checkout-email"
                      type="email"
                      name="email"
                      autoComplete="email"
                      placeholder={t('email_placeholder')}
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className={INPUT}
                    />
                    <label className="flex items-center gap-2.5 pt-3 cursor-pointer">
                      <input
                        type="checkbox"
                        name="emailNews"
                        checked={formData.emailNews}
                        onChange={handleInputChange}
                        className="sr-only peer"
                      />
                      <span className="w-3.5 h-3.5 border border-gray-300 peer-checked:bg-black peer-checked:border-black flex items-center justify-center flex-shrink-0 transition-colors">
                        {formData.emailNews && (
                          <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </span>
                      <span className="text-[11px] text-gray-400">{t('email_news')}</span>
                    </label>
                  </div>
                </section>

                {/* 02 Delivery */}
                <section>
                  <div className="flex items-center gap-3 mb-6 pt-4 border-t border-gray-100">
                    <span className="text-[9px] text-gray-300 tracking-widest">02</span>
                    <p className={SECTION_LABEL}>{t('delivery')}</p>
                  </div>

                  {/* Method selector */}
                  <div className="mb-6">
                    <RadioCard
                      name="deliveryMethod"
                      value="home"
                      checked={formData.deliveryMethod === 'home'}
                      onChange={handleInputChange}
                      label={t('delivery_home')}
                      description={t('delivery_home_desc')}
                    />
                    <RadioCard
                      name="deliveryMethod"
                      value="pickup"
                      checked={formData.deliveryMethod === 'pickup'}
                      onChange={handleInputChange}
                      label={t('delivery_pickup')}
                      description={t('delivery_pickup_desc')}
                    />
                  </div>

                  {/* Home delivery fields */}
                  {formData.deliveryMethod === 'home' && (
                    <div className="space-y-1">
                      <CustomSelect name="country" value={formData.country} onChange={handleInputChange}>
                        <option value="MX">México</option>
                        <option value="US">United States</option>
                      </CustomSelect>

                      <div className="grid grid-cols-2 gap-x-6">
                        <input type="text" name="firstName" placeholder={t('first_name')} required value={formData.firstName} onChange={handleInputChange} className={INPUT} />
                        <input type="text" name="lastName" placeholder={t('last_name')} required value={formData.lastName} onChange={handleInputChange} className={INPUT} />
                      </div>

                      <input type="text" name="address" placeholder={t('address')} required value={formData.address} onChange={handleInputChange} className={INPUT} />
                      <input type="text" name="apartment" placeholder={t('apartment')} value={formData.apartment} onChange={handleInputChange} className={INPUT} />

                      {/* CP → SEPOMEX */}
                      <div className="relative">
                        <input
                          type="text"
                          name="zipCode"
                          placeholder={t('zip_code')}
                          required
                          maxLength={5}
                          value={formData.zipCode}
                          onChange={handleInputChange}
                          className={INPUT}
                        />
                        {cpLoading && (
                          <span className="absolute right-0 top-4 w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin" />
                        )}
                      </div>

                      {/* Colonia — dropdown SEPOMEX */}
                      {cpData && (
                        <CustomSelect name="colonia" value={formData.colonia} onChange={handleInputChange} required>
                          <option value="">{t('select_colonia')}</option>
                          {cpData.colonias.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </CustomSelect>
                      )}

                      {/* Colonia fallback — texto libre */}
                      {cpError && (
                        <input type="text" name="colonia" placeholder={t('colonia')} required value={formData.colonia} onChange={handleInputChange} className={INPUT} />
                      )}

                      {/* Municipio + Estado — readonly auto-llenados */}
                      {cpData && (
                        <div className="grid grid-cols-2 gap-x-6">
                          <div>
                            <p className={`${SECTION_LABEL} pt-3 pb-1`}>{t('municipality')}</p>
                            <input type="text" value={formData.municipio} readOnly tabIndex={-1} className={INPUT_READONLY} />
                          </div>
                          <div>
                            <p className={`${SECTION_LABEL} pt-3 pb-1`}>{t('state')}</p>
                            <input type="text" value={formData.state} readOnly tabIndex={-1} className={INPUT_READONLY} />
                          </div>
                        </div>
                      )}

                      {/* Municipio + Estado fallback */}
                      {cpError && (
                        <div className="grid grid-cols-2 gap-x-6">
                          <input type="text" name="municipio" placeholder={t('municipality')} value={formData.municipio} onChange={handleInputChange} className={INPUT} />
                          <input type="text" name="state" placeholder={t('state')} value={formData.state} onChange={handleInputChange} className={INPUT} />
                        </div>
                      )}

                      <input type="tel" name="phone" placeholder={t('phone')} required value={formData.phone} onChange={handleInputChange} className={INPUT} />
                      {formErrors.address && (
                        <p data-error className="text-[10px] text-red-500 mt-2">{formErrors.address}</p>
                      )}
                    </div>
                  )}

                  {/* Pickup fields */}
                  {formData.deliveryMethod === 'pickup' && (
                    <div className="space-y-1">
                      <div className="grid grid-cols-2 gap-x-6">
                        <input type="text" name="firstName" placeholder={t('first_name')} required value={formData.firstName} onChange={handleInputChange} className={INPUT} />
                        <input type="text" name="lastName" placeholder={t('last_name')} required value={formData.lastName} onChange={handleInputChange} className={INPUT} />
                      </div>
                      <input type="tel" name="phone" placeholder={t('phone')} required value={formData.phone} onChange={handleInputChange} className={INPUT} />

                      <div className="pt-2">
                        <p className={`${SECTION_LABEL} mb-3`}>{t('select_pickup_point_label')}</p>
                        {pickupPointsLoading ? (
                          <p className="text-[10px] text-gray-400 uppercase tracking-widest">
                            {t('pickup_points_loading')}
                          </p>
                        ) : pickupByMunicipality.length === 0 ? (
                          <p className="text-[10px] text-red-500">{t('pickup_points_empty')}</p>
                        ) : (
                          <CustomSelect name="pickupPointId" value={formData.pickupPointId} onChange={handleInputChange} required>
                            <option value="">{t('select_pickup_point_placeholder')}</option>
                            {pickupByMunicipality.map(([municipio, points]) => (
                              <optgroup key={municipio} label={municipio.toUpperCase()}>
                                {points.map((point) => (
                                  <option key={point.id} value={point.id}>
                                    {point.name}
                                    {point.additionalCost > 0
                                      ? ` (+${formatPrice(point.additionalCost, locale)})`
                                      : ''}
                                  </option>
                                ))}
                              </optgroup>
                            ))}
                          </CustomSelect>
                        )}
                        {formErrors.pickup && (
                          <p data-error className="text-[10px] text-red-500 mt-2">{formErrors.pickup}</p>
                        )}
                      </div>

                      {formData.pickupPointId && selectedPickupPoint && (
                        <div className="pt-4 pl-1 space-y-0.5">
                          <p className="text-[11px] font-medium">{selectedPickupPoint.name}</p>
                          <p className="text-[10px] text-gray-400">
                            {selectedPickupPoint.address}, {selectedPickupPoint.city},{' '}
                            {selectedPickupPoint.state}
                          </p>
                          <p className="text-[10px] text-gray-400">{pickupAvailabilityLabel}</p>
                          {selectedPickupPoint.availableHours && (
                            <p className="text-[10px] text-gray-400">{selectedPickupPoint.availableHours}</p>
                          )}
                          {selectedPickupPoint.isDropoff && (
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest">
                              {t('pickup_dropoff_hub')}
                            </p>
                          )}
                          {selectedPickupPoint.additionalCost > 0 && (
                            <p className="text-[10px] text-gray-400">
                              {t('cost')} {formatPrice(selectedPickupPoint.additionalCost, locale)}
                            </p>
                          )}
                        </div>
                      )}

                      {formData.pickupPointId && (
                        <div className="grid grid-cols-2 gap-x-6 pt-2">
                          <div>
                            <p className={`${SECTION_LABEL} mb-3`}>{t('pickup_date_label')}</p>
                            <input
                              type="date"
                              name="pickupDate"
                              value={formData.pickupDate}
                              onChange={handleInputChange}
                              min={pickupMinDate}
                              className={INPUT}
                            />
                          </div>
                          <div>
                            <p className={`${SECTION_LABEL} mb-3`}>{t('pickup_time_label')}</p>
                            <CustomSelect name="pickupTimeSlot" value={formData.pickupTimeSlot} onChange={handleInputChange}>
                              <option value="">{t('pickup_time_any')}</option>
                              <option value="morning">{t('pickup_time_morning')}</option>
                              <option value="afternoon">{t('pickup_time_afternoon')}</option>
                              <option value="evening">{t('pickup_time_evening')}</option>
                            </CustomSelect>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </section>

                {/* 03 Shipping method */}
                <section>
                  <div className="flex items-center gap-3 mb-6 pt-4 border-t border-gray-100">
                    <span className="text-[9px] text-gray-300 tracking-widest">03</span>
                    <p className={SECTION_LABEL}>{t('shipping_method')}</p>
                  </div>
                  {!showShippingMethods ? (
                    <p className="text-[11px] text-gray-300 tracking-wide">{t('shipping_address_required')}</p>
                  ) : (
                    <>
                      <RadioCard
                        name="shippingMethod"
                        value="standard"
                        checked={formData.shippingMethod === 'standard'}
                        onChange={handleInputChange}
                        label={`${t('shipping_standard')} — ${formatPrice(STANDARD_SHIPPING_COST, locale)}`}
                      />
                      <RadioCard
                        name="shippingMethod"
                        value="express"
                        checked={formData.shippingMethod === 'express'}
                        onChange={handleInputChange}
                        label={`${t('shipping_express')} — ${formatPrice(EXPRESS_SHIPPING_COST, locale)}`}
                      />
                    </>
                  )}
                </section>

                {/* 04 Payment */}
                <section>
                  <div className="flex items-center gap-3 mb-6 pt-4 border-t border-gray-100">
                    <span className="text-[9px] text-gray-300 tracking-widest">04</span>
                    <p className={SECTION_LABEL}>{t('payment')}</p>
                  </div>

                  {clientSecret ? (
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
                  ) : (
                    <p className="text-[11px] text-gray-300 tracking-wide">
                      {t('payment_enter_details')}
                    </p>
                  )}
                </section>

                {/* Terms + submit — only shown before Stripe payment step */}
                {!clientSecret && <section className="space-y-5 pt-4 border-t border-gray-100">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input type="checkbox" name="saveInfo" checked={formData.saveInfo} onChange={handleInputChange} className="sr-only peer" />
                    <span className="w-3.5 h-3.5 border border-gray-300 peer-checked:bg-black peer-checked:border-black flex items-center justify-center flex-shrink-0 transition-colors">
                      {formData.saveInfo && (
                        <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </span>
                    <span className="text-[11px] text-gray-400">{t('save_info_title')}</span>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input type="checkbox" name="agreeToTerms" checked={formData.agreeToTerms} onChange={handleInputChange} required className="sr-only peer" />
                    <span className="w-3.5 h-3.5 mt-0.5 border border-gray-300 peer-checked:bg-black peer-checked:border-black flex items-center justify-center flex-shrink-0 transition-colors">
                      {formData.agreeToTerms && (
                        <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </span>
                    <span className="text-[11px] text-gray-400 leading-relaxed">
                      {t('terms_confirmation')}{' '}
                      <Link href={`/${locale}/pages/legal`} className="underline underline-offset-2 text-black">{t('terms_and_conditions')}</Link>
                      {' '}{t('and')}{' '}
                      <Link href={`/${locale}/pages/legal`} className="underline underline-offset-2 text-black">{t('privacy_policy')}</Link>.
                    </span>
                  </label>
                  {formErrors.terms && (
                    <p data-error className="text-[10px] text-red-500 -mt-3">{formErrors.terms}</p>
                  )}

                  {formErrors.general && (
                    <div className="bg-red-50 border border-red-200 px-4 py-3">
                      <p className="text-[11px] text-red-600">{formErrors.general}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isProcessing || !formData.agreeToTerms}
                    className="w-full bg-black text-white py-4 text-[12px] uppercase tracking-widest font-medium hover:bg-gray-900 transition-colors disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? t('processing') : t('continue_to_payment')}
                  </button>
                </section>}

              </form>
            </div>

            {/* ── Right: Order Summary ────────────────────────────────── */}
            <div className="order-1 lg:order-2 lg:sticky lg:top-24 lg:h-fit">

              {/* Mobile toggle */}
              <button
                onClick={() => setShowOrderSummary(!showOrderSummary)}
                className="lg:hidden w-full flex items-center justify-between px-6 py-4 border-b border-gray-100"
              >
                <span className="text-[11px] uppercase tracking-widest text-gray-500">{t('order_summary')}</span>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-light">{formatPrice(total, locale)}</span>
                  <svg className={`w-3 h-3 text-gray-400 transition-transform ${showOrderSummary ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              <div className={`${showOrderSummary ? 'block' : 'hidden'} lg:block px-6 py-6 lg:p-0 space-y-8`}>

                {/* Items */}
                <div className="space-y-5">
                  {cart.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="relative w-16 h-16 flex-shrink-0 bg-gray-50 overflow-hidden">
                        <Image src={item.image} alt={item.productName} fill className="object-contain" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] uppercase tracking-wide truncate">{item.productName}</p>
                        <p className="text-[10px] text-gray-300 uppercase mt-0.5">
                          {[item.color, item.size].filter(Boolean).join(' / ')}
                        </p>
                        <p className="text-[10px] text-gray-300 mt-0.5">× {item.quantity}</p>
                      </div>
                      <p className="text-[11px] text-gray-500 flex-shrink-0">{formatPrice(item.price * item.quantity, locale)}</p>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-[11px] uppercase tracking-widest text-gray-500">{t('subtotal')}</span>
                    <span className="text-[12px]">{formatPrice(subtotal, locale)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[11px] uppercase tracking-widest text-gray-500">
                      {formData.deliveryMethod === 'home' ? t('shipping_label') : t('pickup_cost_label')}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {formData.deliveryMethod === 'home' ? (
                        showShippingMethods ? formatPrice(shipping, locale) : t('complete_address')
                      ) : (
                        formData.pickupPointId && selectedPickupPoint
                          ? selectedPickupPoint.additionalCost > 0 ? formatPrice(selectedPickupPoint.additionalCost, locale) : t('free')
                          : t('select_point')
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline pt-4 border-t border-gray-100">
                    <span className="text-[10px] uppercase tracking-widest">{t('total')}</span>
                    <span className="text-xl font-light">{formatPrice(total, locale)}</span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Mobile sticky submit bar — hidden once Stripe Payment Element is shown */}
      {!clientSecret && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 px-6 py-4">
          <button
            type="submit"
            form="checkout-form"
            disabled={isProcessing || !formData.agreeToTerms}
            className="w-full bg-black text-white py-4 text-[12px] uppercase tracking-widest font-medium hover:bg-gray-900 transition-colors disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            {isProcessing ? t('processing') : t('continue_to_payment')}
          </button>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-wrap gap-x-8 gap-y-2">
            {[
              { href: `/${locale}/pages/shipping-payments-returns`, label: t('footer_shipping') },
              { href: `/${locale}/pages/locaciones`, label: t('footer_pickup_points') },
              { href: `/${locale}/pages/legal`, label: t('footer_privacy') },
              { href: `/${locale}/pages/legal`, label: t('footer_terms') },
            ].map(({ href, label }) => (
              <Link key={label} href={href} className="text-[9px] uppercase tracking-widest text-gray-300 hover:text-black transition-colors">
                {label}
              </Link>
            ))}
          </div>
        </div>
      </footer>

    </div>
  );
}
