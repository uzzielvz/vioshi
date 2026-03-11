'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useLocaleContext } from '@/hooks/useLocaleContext';
import { formatPrice } from '@/lib/formatters';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/store/cartStore';
import { PICKUP_POINTS, getPickupPointById } from '@/lib/pickupPoints';
import { DELIVERY_METHODS } from '@/lib/constants';

interface CheckoutFormData {
  email: string;
  emailNews: boolean;
  deliveryMethod: 'home' | 'pickup';
  country: string;
  firstName: string;
  lastName: string;
  address: string;
  apartment: string;
  city: string;
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

export default function CheckoutPage() {
  const router = useRouter();
  const t = useTranslations('checkout');
  const { locale, currency } = useLocaleContext();
  const { cart: cartData, openCart, closeCart, updateShippingCost } = useCart();
  const cart = cartData.items;
  const subtotal = cartData.subtotal;
  const tax = cartData.tax;
  const shipping = cartData.shipping;
  const total = cartData.total;
  const [discountCode, setDiscountCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showShippingMethods, setShowShippingMethods] = useState(false);
  const [showOrderSummary, setShowOrderSummary] = useState(false);

  const [formData, setFormData] = useState<CheckoutFormData>({
    email: '',
    emailNews: true,
    deliveryMethod: 'home',
    country: 'MX',
    firstName: '',
    lastName: '',
    address: '',
    apartment: '',
    city: '',
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

  // Get selected pickup point
  const selectedPickupPoint = useMemo(() => {
    if (formData.pickupPointId) {
      return getPickupPointById(formData.pickupPointId);
    }
    return undefined;
  }, [formData.pickupPointId]);

  // Redirect if cart is empty
  useEffect(() => {
    if (cart.length === 0) {
      router.push(`/${locale}/cart`);
    }
  }, [cart, router, locale]);

  // Derive shipping cost from form state — useMemo avoids calling updateShippingCost
  // on every render; the useEffect only fires when the derived value actually changes
  const shippingCost = useMemo(() => {
    if (formData.deliveryMethod === 'home') {
      return formData.shippingMethod === 'express' ? 25 : 10;
    }
    if (formData.deliveryMethod === 'pickup' && formData.pickupPointId) {
      return getPickupPointById(formData.pickupPointId)?.additionalCost ?? 0;
    }
    return 0;
  }, [formData.deliveryMethod, formData.shippingMethod, formData.pickupPointId]);

  // updateShippingCost is stable (useCallback in cartStore), so this effect only
  // re-runs when shippingCost changes — no infinite loop
  useEffect(() => {
    updateShippingCost(shippingCost);
  }, [shippingCost, updateShippingCost]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    const updatedFormData = {
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    };

    setFormData(updatedFormData);

    // Show shipping methods based on delivery method
    if (
      name === 'address' ||
      name === 'city' ||
      name === 'state' ||
      name === 'zipCode' ||
      name === 'deliveryMethod' ||
      name === 'pickupPointId'
    ) {
      const shouldShow =
        updatedFormData.deliveryMethod === 'home'
          ? !!(updatedFormData.address && updatedFormData.city && updatedFormData.state && updatedFormData.zipCode)
          : !!updatedFormData.pickupPointId;

      setShowShippingMethods(shouldShow);
    }
  };

  const handleExpressCheckout = (method: string) => {
    console.log(`Express checkout with ${method}`);
    // TODO: Implement express checkout integration
  };

  const handleApplyDiscount = () => {
    console.log('Applying discount:', discountCode);
    // TODO: Implement discount code validation
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.agreeToTerms) {
      alert(t('alert_terms'));
      return;
    }

    // Validate based on delivery method
    if (formData.deliveryMethod === 'home') {
      if (!formData.address || !formData.city || !formData.state || !formData.zipCode) {
        alert(t('alert_address'));
        return;
      }
    } else if (formData.deliveryMethod === 'pickup') {
      if (!formData.pickupPointId) {
        alert(t('alert_pickup'));
        return;
      }
    }

    setIsProcessing(true);

    try {
      // TODO: Send order to backend
      console.log('Processing order:', { formData, cart, total });

      // Simulate processing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Redirect to success page (to be created)
      router.push(`/${locale}/checkout/success/ORDER123`);
    } catch (error) {
      console.error('Error processing order:', error);
      alert(t('error_processing'));
    } finally {
      setIsProcessing(false);
    }
  };

  if (cart.length === 0) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                closeCart();
                // Usar window.location para navegación más confiable
                window.location.href = `/${locale}`;
              }}
              className="text-lg font-bold text-black hover:opacity-60 transition-opacity duration-200 cursor-pointer"
              style={{
                fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                textShadow: '0 0 0.5px rgba(0, 0, 0, 0.8)'
              }}
            >
              VIOGI
            </button>
            <button
              onClick={() => {
                closeCart();
                // Regresar a la página anterior y abrir el carrito
                router.back();
                // Abrir el carrito después de un delay para que la navegación se complete
                setTimeout(() => {
                  openCart();
                }, 200);
              }}
              className="hover:opacity-60 transition-opacity"
              aria-label={t('back_to_cart_aria')}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <main className="pt-16">
        <div className="max-w-7xl mx-auto lg:px-4 lg:py-8">
          <div className="grid lg:grid-cols-2 lg:gap-16">
            {/* Left Column - Checkout Form */}
            <div className="order-2 lg:order-1 px-4 sm:px-6 lg:px-0 mt-8 lg:mt-0 pb-8 lg:pb-0">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Express Checkout */}
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-gray-500 mb-3 text-center">
                    {t('express_checkout')}
                  </p>
                  <div className="grid grid-cols-3 gap-2.5 mb-3">
                    <button
                      type="button"
                      onClick={() => handleExpressCheckout('shop')}
                      className="bg-[#5A31F4] text-white py-2.5 hover:opacity-90 transition-opacity font-medium text-xs"
                    >
                      Shop
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExpressCheckout('paypal')}
                      className="bg-[#FFC439] text-[#003087] py-2.5 hover:opacity-90 transition-opacity font-medium text-xs"
                    >
                      PayPal
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExpressCheckout('gpay')}
                      className="bg-black text-white py-2.5 hover:opacity-90 transition-opacity font-medium text-xs"
                    >
                      G Pay
                    </button>
                  </div>
                  <div className="relative text-center text-[10px] text-gray-500 uppercase tracking-wide">
                    <span className="bg-white px-3 relative z-10">{t('or', { ns: 'common' })}</span>
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                  </div>
                </div>

                {/* Contact */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-xs uppercase tracking-wide font-bold">
                      {t('contact')}
                    </h2>
                    <Link
                      href="/account"
                      className="text-[11px] uppercase tracking-wide text-gray-600 hover:text-black transition-colors underline"
                    >
                      {t('sign_in')}
                    </Link>
                  </div>
                  <input
                    type="email"
                    name="email"
                    placeholder={t('email_placeholder')}
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black placeholder:text-gray-400 placeholder:text-[11px] placeholder:tracking-wide text-sm"
                  />
                  <label className="flex items-center mt-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      name="emailNews"
                      checked={formData.emailNews}
                      onChange={handleInputChange}
                      className="w-4 h-4 border-2 border-gray-300 rounded-sm checked:bg-black checked:border-black focus:ring-0 focus:ring-offset-0"
                    />
                    <span className="ml-2.5 text-xs">
                      {t('email_news')}
                    </span>
                  </label>
                </div>

                {/* Delivery */}
                <div>
                  <h2 className="text-xs uppercase tracking-wide font-bold mb-3">
                    {t('delivery')}
                  </h2>

                  {/* Delivery Method Selection */}
                  <div className="mb-4">
                    <div className="space-y-2.5">
                      {/* Radio button: Envío a Domicilio */}
                      <label className={`flex items-center justify-between p-3 border-2 cursor-pointer transition-colors ${
                        formData.deliveryMethod === 'home'
                          ? 'border-black'
                          : 'border-gray-300 hover:border-black'
                      }`}>
                        <div className="flex items-center">
                          <input
                            type="radio"
                            name="deliveryMethod"
                            value="home"
                            checked={formData.deliveryMethod === 'home'}
                            onChange={handleInputChange}
                            className="w-4 h-4"
                          />
                          <div className="ml-2.5">
                            <span className="text-xs font-medium">{t('delivery_home')}</span>
                            <p className="text-[10px] text-gray-500 mt-0.5">{t('delivery_home_desc')}</p>
                          </div>
                        </div>
                      </label>

                      {/* Radio button: Recoger en Punto */}
                      <label className={`flex items-center justify-between p-3 border-2 cursor-pointer transition-colors ${
                        formData.deliveryMethod === 'pickup'
                          ? 'border-black'
                          : 'border-gray-300 hover:border-black'
                      }`}>
                        <div className="flex items-center">
                          <input
                            type="radio"
                            name="deliveryMethod"
                            value="pickup"
                            checked={formData.deliveryMethod === 'pickup'}
                            onChange={handleInputChange}
                            className="w-4 h-4"
                          />
                          <div className="ml-2.5">
                            <span className="text-xs font-medium">{t('delivery_pickup')}</span>
                            <p className="text-[10px] text-gray-500 mt-0.5">{t('delivery_pickup_desc')}</p>
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {formData.deliveryMethod === 'home' && (
                      <>
                        <div>
                          <label className="block text-[10px] uppercase tracking-wide text-gray-500 mb-1">
                            {t('country_region')}
                          </label>
                      <select
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2.5 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black text-sm appearance-none bg-white"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'right 1rem center',
                        }}
                      >
                        <option value="MX">Mexico</option>
                        <option value="US">United States</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <input
                        type="text"
                        name="firstName"
                        placeholder={t('first_name')}
                        required
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2.5 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black placeholder:text-gray-400 placeholder:text-[11px] placeholder:tracking-wide text-sm"
                      />
                      <input
                        type="text"
                        name="lastName"
                        placeholder={t('last_name')}
                        required
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2.5 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black placeholder:text-gray-400 placeholder:text-[11px] placeholder:tracking-wide text-sm"
                      />
                    </div>

                    <input
                      type="text"
                      name="address"
                      placeholder={t('address')}
                      required
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2.5 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black placeholder:text-gray-400 placeholder:text-[11px] placeholder:tracking-wide text-sm"
                    />

                    <input
                      type="text"
                      name="apartment"
                      placeholder={t('apartment')}
                      value={formData.apartment}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2.5 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black placeholder:text-gray-400 placeholder:text-[11px] placeholder:tracking-wide text-sm"
                    />

                    <div className="grid grid-cols-[1fr_auto_1fr] gap-2.5">
                      <input
                        type="text"
                        name="city"
                        placeholder={t('city')}
                        required
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2.5 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black placeholder:text-gray-400 placeholder:text-[11px] placeholder:tracking-wide text-sm"
                      />
                      <select
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        required
                        className="w-32 px-3 py-2.5 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black text-sm appearance-none bg-white"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'right 1rem center',
                        }}
                      >
                        <option value="">{t('state')}</option>
                        <option value="CDMX">CDMX</option>
                        <option value="Jalisco">Jalisco</option>
                        <option value="Nuevo León">Nuevo León</option>
                        {/* Add more states */}
                      </select>
                      <input
                        type="text"
                        name="zipCode"
                        placeholder={t('zip_code')}
                        required
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2.5 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black placeholder:text-gray-400 placeholder:text-[11px] placeholder:tracking-wide text-sm"
                      />
                    </div>

                        <input
                          type="tel"
                          name="phone"
                          placeholder={t('phone')}
                          required
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2.5 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black placeholder:text-gray-400 placeholder:text-[11px] placeholder:tracking-wide text-sm"
                        />
                      </>
                    )}

                    {formData.deliveryMethod === 'pickup' && (
                      <>
                        {/* First Name + Last Name */}
                        <div className="grid grid-cols-2 gap-2.5">
                          <input
                            type="text"
                            name="firstName"
                            placeholder={t('first_name')}
                            required
                            value={formData.firstName}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2.5 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black placeholder:text-gray-400 placeholder:text-[11px] placeholder:tracking-wide text-sm"
                          />
                          <input
                            type="text"
                            name="lastName"
                            placeholder={t('last_name')}
                            required
                            value={formData.lastName}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2.5 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black placeholder:text-gray-400 placeholder:text-[11px] placeholder:tracking-wide text-sm"
                          />
                        </div>

                        {/* Phone */}
                        <input
                          type="tel"
                          name="phone"
                          placeholder={t('phone')}
                          required
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2.5 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black placeholder:text-gray-400 placeholder:text-[11px] placeholder:tracking-wide text-sm"
                        />

                        {/* Selector de Punto de Recogida */}
                        <div>
                          <label className="block text-[10px] uppercase tracking-wide text-gray-500 mb-1">
                            {t('select_pickup_point_label')}
                          </label>
                          <select
                            name="pickupPointId"
                            value={formData.pickupPointId}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2.5 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black text-sm appearance-none bg-white"
                            style={{
                              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                              backgroundRepeat: 'no-repeat',
                              backgroundPosition: 'right 1rem center',
                            }}
                          >
                            <option value="">{t('select_pickup_point_placeholder')}</option>
                            <optgroup label={t('viogi_stores')}>
                              {PICKUP_POINTS.filter(p => p.type === 'flagship' || p.type === 'retail')
                                .map(point => (
                                  <option key={point.id} value={point.id}>
                                    {point.name} {point.additionalCost > 0 && `(+$${point.additionalCost})`}
                                  </option>
                                ))}
                            </optgroup>
                            <optgroup label={t('authorized_points')}>
                              {PICKUP_POINTS.filter(p => p.type === 'partner')
                                .map(point => (
                                  <option key={point.id} value={point.id}>
                                    {point.name} {point.additionalCost > 0 && `(+$${point.additionalCost})`}
                                  </option>
                                ))}
                            </optgroup>
                          </select>

                          {/* Info Box: Detalles del punto seleccionado */}
                          {formData.pickupPointId && selectedPickupPoint && (
                            <div className="mt-2.5 p-3 bg-gray-50 border border-gray-200">
                              <p className="text-xs font-medium mb-1">{selectedPickupPoint.name}</p>
                              <p className="text-[10px] text-gray-600 mb-1.5">
                                {selectedPickupPoint.address}<br />
                                {selectedPickupPoint.city}, {selectedPickupPoint.state}
                              </p>
                              <div className="flex items-center gap-3 text-[10px] text-gray-500">
                                <span>📍 {selectedPickupPoint.estimatedDays}</span>
                                <span>🕐 {selectedPickupPoint.availableHours}</span>
                              </div>
                              {selectedPickupPoint.additionalCost > 0 && (
                                <p className="text-[10px] font-medium mt-1.5">
                                  {t('cost')} ${selectedPickupPoint.additionalCost.toFixed(2)}
                                </p>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Fecha y Horario Preferido (opcional) */}
                        {formData.pickupPointId && (
                          <div className="grid grid-cols-2 gap-2.5">
                            <div>
                              <label className="block text-[10px] uppercase tracking-wide text-gray-500 mb-1">
                                {t('pickup_date_label')}
                              </label>
                              <input
                                type="date"
                                name="pickupDate"
                                value={formData.pickupDate}
                                onChange={handleInputChange}
                                min={new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                                className="w-full px-3 py-2.5 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] uppercase tracking-wide text-gray-500 mb-1">
                                {t('pickup_time_label')}
                              </label>
                              <select
                                name="pickupTimeSlot"
                                value={formData.pickupTimeSlot}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2.5 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black text-sm appearance-none bg-white"
                                style={{
                                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                                  backgroundRepeat: 'no-repeat',
                                  backgroundPosition: 'right 1rem center',
                                }}
                              >
                                <option value="">{t('pickup_time_any')}</option>
                                <option value="morning">{t('pickup_time_morning')}</option>
                                <option value="afternoon">{t('pickup_time_afternoon')}</option>
                                <option value="evening">{t('pickup_time_evening')}</option>
                              </select>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Shipping Method */}
                <div>
                  <h2 className="text-xs uppercase tracking-wide font-bold mb-3">
                    {t('shipping_method')}
                  </h2>
                  {!showShippingMethods ? (
                    <p className="text-xs text-gray-500 italic py-3 border border-gray-300 px-3 bg-gray-50">
                      {t('shipping_address_required')}
                    </p>
                  ) : (
                    <div className="space-y-2.5">
                      <label className="flex items-center justify-between p-3 border-2 border-black cursor-pointer">
                        <div className="flex items-center">
                          <input
                            type="radio"
                            name="shippingMethod"
                            value="standard"
                            checked={formData.shippingMethod === 'standard'}
                            onChange={handleInputChange}
                            className="w-4 h-4"
                          />
                          <span className="ml-2.5 text-xs font-medium">
                            {t('shipping_standard')}
                          </span>
                        </div>
                        <span className="text-xs font-medium">$10.00</span>
                      </label>
                      <label className="flex items-center justify-between p-3 border border-gray-300 cursor-pointer hover:border-black transition-colors">
                        <div className="flex items-center">
                          <input
                            type="radio"
                            name="shippingMethod"
                            value="express"
                            checked={formData.shippingMethod === 'express'}
                            onChange={handleInputChange}
                            className="w-4 h-4"
                          />
                          <span className="ml-2.5 text-xs font-medium">
                            {t('shipping_express')}
                          </span>
                        </div>
                        <span className="text-xs font-medium">$25.00</span>
                      </label>
                    </div>
                  )}
                </div>

                {/* Payment */}
                <div>
                  <h2 className="text-xs uppercase tracking-wide font-bold mb-3">
                    {t('payment')}
                  </h2>
                  <div className="space-y-2.5">
                    <input
                      type="text"
                      name="cardNumber"
                      placeholder={t('card_number')}
                      required={formData.paymentMethod === 'card'}
                      value={formData.cardNumber}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2.5 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black placeholder:text-gray-400 placeholder:text-[11px] placeholder:tracking-wide text-sm"
                    />

                    <div className="grid grid-cols-2 gap-2.5">
                      <input
                        type="text"
                        name="expirationDate"
                        placeholder={t('expiration_date')}
                        required={formData.paymentMethod === 'card'}
                        value={formData.expirationDate}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2.5 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black placeholder:text-gray-400 placeholder:text-[11px] placeholder:tracking-wide text-sm"
                      />
                      <input
                        type="text"
                        name="securityCode"
                        placeholder={t('security_code')}
                        required={formData.paymentMethod === 'card'}
                        value={formData.securityCode}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2.5 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black placeholder:text-gray-400 placeholder:text-[11px] placeholder:tracking-wide text-sm"
                      />
                    </div>

                    <input
                      type="text"
                      name="nameOnCard"
                      placeholder={t('name_on_card')}
                      required={formData.paymentMethod === 'card'}
                      value={formData.nameOnCard}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2.5 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black placeholder:text-gray-400 placeholder:text-[11px] placeholder:tracking-wide text-sm"
                    />

                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="useShippingAsBilling"
                        checked={formData.useShippingAsBilling}
                        onChange={handleInputChange}
                        className="w-4 h-4 border-2 border-gray-300 rounded-sm checked:bg-black checked:border-black focus:ring-0 focus:ring-offset-0"
                      />
                      <span className="ml-2.5 text-xs">
                        {t('use_shipping_as_billing')}
                      </span>
                    </label>

                    {/* PayPal Option */}
                    <div className="pt-2">
                      <label className="flex items-center justify-between p-3 border border-gray-300 cursor-pointer hover:border-black transition-colors">
                        <div className="flex items-center">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="paypal"
                            checked={formData.paymentMethod === 'paypal'}
                            onChange={handleInputChange}
                            className="w-4 h-4"
                          />
                          <span className="ml-2.5 text-xs font-medium">
                            PayPal
                          </span>
                        </div>
                        <span className="text-lg font-bold text-[#003087]">
                          PayPal
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Save Information */}
                <div>
                  <h3 className="text-xs uppercase tracking-wide font-bold mb-3">
                    {t('save_info_title')}
                  </h3>
                  <div className="flex items-center">
                    <span className="text-xs text-gray-500 mr-2">+1</span>
                    <input
                      type="tel"
                      name="mobilePhone"
                      placeholder={t('mobile_phone')}
                      value={formData.mobilePhone}
                      onChange={handleInputChange}
                      className="flex-1 px-3 py-2.5 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black placeholder:text-gray-400 placeholder:text-[11px] placeholder:tracking-wide text-sm"
                    />
                  </div>
                  <p className="text-[10px] text-gray-500 mt-2.5">
                    {t('shop_terms_text')}{' '}
                    <Link href={`/${locale}/pages/legal`} className="underline">
                      {t('shop_terms_link')}
                    </Link>{' '}
                    {t('shop_and')}{' '}
                    <Link href={`/${locale}/pages/legal`} className="underline">
                      {t('shop_privacy_link')}
                    </Link>
                    {t('shop_terms_end')}
                  </p>
                </div>

                {/* Terms Agreement */}
                <div className="pt-3 border-t border-gray-200">
                  <label className="flex items-start cursor-pointer">
                    <input
                      type="checkbox"
                      name="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onChange={handleInputChange}
                      required
                      className="w-4 h-4 mt-0.5 border-2 border-gray-300 rounded-sm checked:bg-black checked:border-black focus:ring-0 focus:ring-offset-0"
                    />
                    <span className="ml-2.5 text-xs">
                      {t('terms_confirmation')}{' '}
                      <Link
                        href={`/${locale}/pages/legal`}
                        className="underline font-medium"
                      >
                        {t('terms_and_conditions')}
                      </Link>{' '}
                      {t('and')}{' '}
                      <Link
                        href={`/${locale}/pages/legal`}
                        className="underline font-medium"
                      >
                        {t('privacy_policy')}
                      </Link>
                      .
                    </span>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isProcessing || !formData.agreeToTerms}
                  className="w-full bg-black text-white py-3 uppercase tracking-wide font-semibold hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-xs"
                >
                  {isProcessing ? t('processing') : t('complete_order')}
                </button>
              </form>
            </div>

            {/* Right Column - Order Summary */}
            <div className="order-1 lg:order-2 lg:sticky lg:top-24 lg:h-fit lg:px-0">
              {/* Toggle button - solo móvil */}
              <button
                onClick={() => setShowOrderSummary(!showOrderSummary)}
                className="lg:hidden w-full flex items-center justify-between px-6 py-3 bg-gray-50 border-b border-gray-200"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-normal uppercase tracking-wide text-gray-600">
                    {t('order_summary')}
                  </span>
                  <svg
                    className={`w-3 h-3 text-gray-600 transition-transform ${showOrderSummary ? 'rotate-180' : ''}`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </div>
                <span className="text-2xl font-bold text-black">${total.toFixed(2)}</span>
              </button>

              {/* Contenido completo - oculto en móvil cuando colapsado */}
              <div className={`${showOrderSummary ? 'block' : 'hidden'} lg:block space-y-6 px-6 py-4 lg:p-0`}>
                {/* Cart Items */}
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="relative w-16 h-16 flex-shrink-0 bg-white border border-gray-200 rounded overflow-hidden">
                        <Image
                          src={item.image}
                          alt={item.productName}
                          fill
                          className="object-contain"
                        />
                        <div className="absolute top-1 right-1 min-w-[20px] h-5 px-1.5 bg-black text-white rounded flex items-center justify-center text-[10px] font-bold">
                          {item.quantity}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xs font-medium uppercase truncate">
                          {item.productName}
                        </h3>
                        <p className="text-[10px] text-gray-400 uppercase mt-0.5">
                          {item.color && `${item.color}`}
                          {item.size && ` / ${item.size}`}
                        </p>
                      </div>
                      <div className="text-xs font-medium">
                        ${(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Discount Code */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    placeholder={t('discount_code')}
                    className="flex-1 px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black placeholder:text-gray-400 placeholder:text-[11px] placeholder:tracking-wide text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleApplyDiscount}
                    className="px-4 py-2 border border-gray-300 uppercase text-[11px] tracking-wide font-semibold hover:bg-black hover:text-white hover:border-black transition-colors"
                  >
                    {t('apply')}
                  </button>
                </div>

                {/* Order Summary */}
                <div className="space-y-2 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="uppercase tracking-wide text-[11px] font-medium text-gray-600">
                      {t('subtotal')}
                    </span>
                    <span className="text-xs font-medium">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1">
                      <span className="uppercase tracking-wide text-[11px] font-medium text-gray-600">
                        {formData.deliveryMethod === 'home' ? t('shipping_label') : t('pickup_cost_label')}
                      </span>
                      <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="text-[10px] text-gray-400 uppercase tracking-wide">
                      {formData.deliveryMethod === 'home' ? (
                        showShippingMethods ? `$${shipping.toFixed(2)}` : t('complete_address')
                      ) : (
                        formData.pickupPointId && selectedPickupPoint
                          ? selectedPickupPoint.additionalCost > 0
                            ? `$${selectedPickupPoint.additionalCost.toFixed(2)}`
                            : t('free')
                          : t('select_point')
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                    <span className="uppercase tracking-wide text-sm font-bold">{t('total')}</span>
                    <div className="text-right flex items-baseline gap-1">
                      <span className="text-[10px] text-gray-500 uppercase tracking-wide">
                        {currency}
                      </span>
                      <span className="text-2xl font-bold">${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#F7F7F7] border-t border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs">
            <Link
              href={`/${locale}/pages/shipping-payments-returns`}
              className="underline hover:no-underline transition-all"
              style={{
                fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                fontSize: '11px',
                fontWeight: 400,
              }}
            >
              {t('footer_shipping')}
            </Link>
            <Link
              href={`/${locale}/pages/locaciones`}
              className="underline hover:no-underline transition-all"
              style={{
                fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                fontSize: '11px',
                fontWeight: 400,
              }}
            >
              {t('footer_pickup_points')}
            </Link>
            <Link
              href={`/${locale}/pages/legal`}
              className="underline hover:no-underline transition-all"
              style={{
                fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                fontSize: '11px',
                fontWeight: 400,
              }}
            >
              {t('footer_privacy')}
            </Link>
            <Link
              href={`/${locale}/pages/legal`}
              className="underline hover:no-underline transition-all"
              style={{
                fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                fontSize: '11px',
                fontWeight: 400,
              }}
            >
              {t('footer_terms')}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

