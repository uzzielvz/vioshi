'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useLocaleContext } from '@/hooks/useLocaleContext';
import { formatPrice } from '@/lib/formatters';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/store/cartStore';
import { PICKUP_POINTS, getPickupPointById } from '@/lib/pickupPoints';
import {
  DELIVERY_METHODS,
  EXPRESS_SHIPPING_COST,
  STANDARD_SHIPPING_COST,
  PAYPAL_ME_LINK,
} from '@/lib/constants';
import { lookupCP, type MexicoCPData } from '@/lib/mexico';

// ─── Shared primitive styles ────────────────────────────────────────────────

const INPUT =
  'w-full py-3.5 border-b border-gray-200 bg-transparent focus:outline-none focus:border-black placeholder:text-gray-300 placeholder:text-[11px] placeholder:tracking-widest text-sm transition-colors duration-200';

const INPUT_READONLY =
  'w-full py-3.5 border-b border-gray-100 bg-transparent text-gray-400 text-sm cursor-not-allowed select-none';

const SECTION_LABEL =
  'text-[9px] uppercase tracking-widest text-gray-400';

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
  mobilePhone: string;
  useShippingAsBilling: boolean;
  agreeToTerms: boolean;
  shippingMethod: string;
  paymentMethod: 'card' | 'paypal';
  cardNumber: string;
  expirationDate: string;
  securityCode: string;
  nameOnCard: string;
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function CheckoutPage() {
  const router = useRouter();
  const t = useTranslations('checkout');
  const { locale } = useLocaleContext();
  const { cart: cartData, closeCart, updateShippingCost } = useCart();
  const cart = cartData.items;
  const subtotal = cartData.subtotal;
  const shipping = cartData.shipping;
  const total = cartData.total;

  const [discountCode, setDiscountCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showShippingMethods, setShowShippingMethods] = useState(false);
  const [showOrderSummary, setShowOrderSummary] = useState(false);

  const [cpData, setCpData] = useState<MexicoCPData | null>(null);
  const [cpLoading, setCpLoading] = useState(false);
  const [cpError, setCpError] = useState(false);
  const [paypalCopied, setPaypalCopied] = useState(false);

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
    mobilePhone: '',
    useShippingAsBilling: true,
    agreeToTerms: false,
    shippingMethod: 'standard',
    paymentMethod: 'card',
    cardNumber: '',
    expirationDate: '',
    securityCode: '',
    nameOnCard: '',
  });

  const selectedPickupPoint = useMemo(
    () => (formData.pickupPointId ? getPickupPointById(formData.pickupPointId) : undefined),
    [formData.pickupPointId]
  );

  const isSubmittingRef = useRef(false);

  useEffect(() => {
    if (cart.length === 0 && !isSubmittingRef.current) {
      router.push(`/${locale}/cart`);
    }
  }, [cart, router, locale]);

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
    if (formData.deliveryMethod === 'pickup' && formData.pickupPointId) {
      return getPickupPointById(formData.pickupPointId)?.additionalCost ?? 0;
    }
    return 0;
  }, [formData.deliveryMethod, formData.shippingMethod, formData.pickupPointId]);

  useEffect(() => {
    updateShippingCost(shippingCost);
  }, [shippingCost, updateShippingCost]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    const updatedFormData = { ...formData, [name]: type === 'checkbox' ? checked : value };
    setFormData(updatedFormData);

    if (['address', 'colonia', 'state', 'zipCode', 'deliveryMethod', 'pickupPointId'].includes(name)) {
      const shouldShow =
        updatedFormData.deliveryMethod === 'home'
          ? !!(updatedFormData.address && updatedFormData.colonia && updatedFormData.state && updatedFormData.zipCode)
          : !!updatedFormData.pickupPointId;
      setShowShippingMethods(shouldShow);
    }
  };

  const handleCopyPaypal = () => {
    navigator.clipboard.writeText(PAYPAL_ME_LINK).then(() => {
      setPaypalCopied(true);
      setTimeout(() => setPaypalCopied(false), 2000);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.agreeToTerms) { alert(t('alert_terms')); return; }
    if (formData.deliveryMethod === 'home') {
      if (!formData.address || !formData.colonia || !formData.state || !formData.zipCode) {
        alert(t('alert_address')); return;
      }
    } else if (formData.deliveryMethod === 'pickup' && !formData.pickupPointId) {
      alert(t('alert_pickup')); return;
    }

    isSubmittingRef.current = true;
    setIsProcessing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      router.push(`/${locale}/checkout/success/ORDER123`);
    } catch (error) {
      isSubmittingRef.current = false;
      console.error('Error processing order:', error);
      alert(t('error_processing'));
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
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); closeCart(); window.location.href = `/${locale}`; }}
              className="text-base font-bold text-black hover:opacity-50 transition-opacity cursor-pointer"
              style={{
                fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                textShadow: '0 0 0.5px rgba(0, 0, 0, 0.8)',
              }}
            >
              VIOGI
            </button>
            <button
              onClick={() => { closeCart(); router.push(`/${locale}/cart`); }}
              className="hover:opacity-50 transition-opacity"
              aria-label={t('back_to_cart_aria')}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <main className="pt-16">
        <div className="max-w-7xl mx-auto lg:px-4 lg:py-12">
          <div className="grid lg:grid-cols-2 lg:gap-20">

            {/* ── Left: Form ─────────────────────────────────────────── */}
            <div className="order-2 lg:order-1 px-6 sm:px-8 lg:px-0 mt-10 lg:mt-0 pb-12 lg:pb-0">
              <form onSubmit={handleSubmit} className="space-y-10">

                {/* Contact */}
                <section>
                  <div className="flex items-center justify-between mb-6">
                    <p className={SECTION_LABEL}>{t('contact')}</p>
                    <Link href="/account" className="text-[10px] uppercase tracking-widest text-gray-400 hover:text-black transition-colors">
                      {t('sign_in')}
                    </Link>
                  </div>
                  <div className="space-y-1">
                    <input
                      type="email"
                      name="email"
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

                {/* Delivery */}
                <section>
                  <p className={`${SECTION_LABEL} mb-6`}>{t('delivery')}</p>

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
                        <CustomSelect name="pickupPointId" value={formData.pickupPointId} onChange={handleInputChange} required>
                          <option value="">{t('select_pickup_point_placeholder')}</option>
                          <optgroup label={t('viogi_stores')}>
                            {PICKUP_POINTS.filter(p => p.type === 'flagship' || p.type === 'retail').map(point => (
                              <option key={point.id} value={point.id}>
                                {point.name}{point.additionalCost > 0 ? ` (+${formatPrice(point.additionalCost, locale)})` : ''}
                              </option>
                            ))}
                          </optgroup>
                          <optgroup label={t('authorized_points')}>
                            {PICKUP_POINTS.filter(p => p.type === 'partner').map(point => (
                              <option key={point.id} value={point.id}>
                                {point.name}{point.additionalCost > 0 ? ` (+${formatPrice(point.additionalCost, locale)})` : ''}
                              </option>
                            ))}
                          </optgroup>
                        </CustomSelect>
                      </div>

                      {formData.pickupPointId && selectedPickupPoint && (
                        <div className="pt-4 pl-1 space-y-0.5">
                          <p className="text-[11px] font-medium">{selectedPickupPoint.name}</p>
                          <p className="text-[10px] text-gray-400">{selectedPickupPoint.address}, {selectedPickupPoint.city}, {selectedPickupPoint.state}</p>
                          <p className="text-[10px] text-gray-400">{selectedPickupPoint.estimatedDays} · {selectedPickupPoint.availableHours}</p>
                          {selectedPickupPoint.additionalCost > 0 && (
                            <p className="text-[10px] text-gray-400">{t('cost')} {formatPrice(selectedPickupPoint.additionalCost, locale)}</p>
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
                              min={new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
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

                {/* Shipping method */}
                <section>
                  <p className={`${SECTION_LABEL} mb-6`}>{t('shipping_method')}</p>
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

                {/* Payment */}
                <section>
                  <p className={`${SECTION_LABEL} mb-6`}>{t('payment')}</p>

                  <RadioCard
                    name="paymentMethod"
                    value="card"
                    checked={formData.paymentMethod === 'card'}
                    onChange={handleInputChange}
                    label={t('payment_card')}
                  />
                  <RadioCard
                    name="paymentMethod"
                    value="paypal"
                    checked={formData.paymentMethod === 'paypal'}
                    onChange={handleInputChange}
                    label="PayPal"
                  />

                  {formData.paymentMethod === 'card' && (
                    <div className="space-y-1 pt-4">
                      <input type="text" name="cardNumber" placeholder={t('card_number')} required value={formData.cardNumber} onChange={handleInputChange} className={INPUT} />
                      <div className="grid grid-cols-2 gap-x-6">
                        <input type="text" name="expirationDate" placeholder={t('expiration_date')} required value={formData.expirationDate} onChange={handleInputChange} className={INPUT} />
                        <input type="text" name="securityCode" placeholder={t('security_code')} required value={formData.securityCode} onChange={handleInputChange} className={INPUT} />
                      </div>
                      <input type="text" name="nameOnCard" placeholder={t('name_on_card')} required value={formData.nameOnCard} onChange={handleInputChange} className={INPUT} />
                      <label className="flex items-center gap-2.5 pt-3 cursor-pointer">
                        <input type="checkbox" name="useShippingAsBilling" checked={formData.useShippingAsBilling} onChange={handleInputChange} className="sr-only peer" />
                        <span className="w-3.5 h-3.5 border border-gray-300 peer-checked:bg-black peer-checked:border-black flex items-center justify-center flex-shrink-0 transition-colors">
                          {formData.useShippingAsBilling && (
                            <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </span>
                        <span className="text-[11px] text-gray-400">{t('use_shipping_as_billing')}</span>
                      </label>
                    </div>
                  )}

                  {formData.paymentMethod === 'paypal' && (
                    <div className="pt-4 space-y-3">
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest">{t('paypal_instructions')}</p>
                      <div className="flex items-center justify-between gap-4 border-b border-gray-100 pb-3">
                        <a
                          href={PAYPAL_ME_LINK}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-black underline underline-offset-2 hover:no-underline transition-all"
                        >
                          {PAYPAL_ME_LINK.replace('https://', '')}
                        </a>
                        <button
                          type="button"
                          onClick={handleCopyPaypal}
                          className="text-[9px] uppercase tracking-widest text-gray-400 hover:text-black transition-colors whitespace-nowrap"
                        >
                          {paypalCopied ? t('paypal_copied') : t('paypal_copy')}
                        </button>
                      </div>
                      <p className="text-[10px] text-gray-300">{t('paypal_concept_note')}</p>
                      <p className="text-[10px] text-gray-300">{t('paypal_pending_note')}</p>
                    </div>
                  )}
                </section>

                {/* Save info */}
                <section>
                  <p className={`${SECTION_LABEL} mb-6`}>{t('save_info_title')}</p>
                  <div className="flex items-end gap-3">
                    <span className="text-[11px] text-gray-400 pb-3.5">+52</span>
                    <input
                      type="tel"
                      name="mobilePhone"
                      placeholder={t('mobile_phone')}
                      value={formData.mobilePhone}
                      onChange={handleInputChange}
                      className={`${INPUT} flex-1`}
                    />
                  </div>
                  <p className="text-[10px] text-gray-300 mt-3 leading-relaxed">
                    {t('shop_terms_text')}{' '}
                    <Link href={`/${locale}/pages/legal`} className="underline underline-offset-2">{t('shop_terms_link')}</Link>
                    {' '}{t('shop_and')}{' '}
                    <Link href={`/${locale}/pages/legal`} className="underline underline-offset-2">{t('shop_privacy_link')}</Link>
                    {t('shop_terms_end')}
                  </p>
                </section>

                {/* Terms + submit */}
                <section className="space-y-6">
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

                  <button
                    type="submit"
                    disabled={isProcessing || !formData.agreeToTerms}
                    className="w-full bg-black text-white py-4 text-[10px] uppercase tracking-widest hover:bg-gray-900 transition-colors disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? t('processing') : t('complete_order')}
                  </button>
                </section>

              </form>
            </div>

            {/* ── Right: Order Summary ────────────────────────────────── */}
            <div className="order-1 lg:order-2 lg:sticky lg:top-24 lg:h-fit">

              {/* Mobile toggle */}
              <button
                onClick={() => setShowOrderSummary(!showOrderSummary)}
                className="lg:hidden w-full flex items-center justify-between px-6 py-4 border-b border-gray-100"
              >
                <span className="text-[9px] uppercase tracking-widest text-gray-400">{t('order_summary')}</span>
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

                {/* Discount code */}
                <div className="flex items-end gap-3 border-b border-gray-100 pb-1">
                  <input
                    type="text"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    placeholder={t('discount_code')}
                    className={`${INPUT} flex-1`}
                  />
                  <button
                    type="button"
                    onClick={() => {/* TODO */}}
                    className="text-[9px] uppercase tracking-widest text-gray-400 hover:text-black transition-colors pb-3.5 whitespace-nowrap"
                  >
                    {t('apply')}
                  </button>
                </div>

                {/* Totals */}
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-[10px] uppercase tracking-widest text-gray-400">{t('subtotal')}</span>
                    <span className="text-[11px]">{formatPrice(subtotal, locale)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[10px] uppercase tracking-widest text-gray-400">
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
