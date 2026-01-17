'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/store/cartStore';

interface CheckoutFormData {
  email: string;
  emailNews: boolean;
  country: string;
  firstName: string;
  lastName: string;
  address: string;
  apartment: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
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
  const { cart: cartData, openCart } = useCart();
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
    country: 'MX',
    firstName: '',
    lastName: '',
    address: '',
    apartment: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
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

  // Redirect if cart is empty
  useEffect(() => {
    if (cart.length === 0) {
      router.push('/cart');
    }
  }, [cart, router]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Show shipping methods after address is filled
    if (
      name === 'address' ||
      name === 'city' ||
      name === 'state' ||
      name === 'zipCode'
    ) {
      const addressComplete =
        formData.address &&
        formData.city &&
        formData.state &&
        formData.zipCode;
      setShowShippingMethods(addressComplete);
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
      alert('Debes aceptar los términos y condiciones');
      return;
    }

    setIsProcessing(true);

    try {
      // TODO: Send order to backend
      console.log('Processing order:', { formData, cart, total });

      // Simulate processing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Redirect to success page (to be created)
      router.push('/checkout/success/ORDER123');
    } catch (error) {
      console.error('Error processing order:', error);
      alert('Error al procesar el pedido. Intenta de nuevo.');
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
            <Link
              href="/"
              className="text-lg font-bold text-black hover:opacity-60 transition-opacity duration-200"
              style={{
                fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                textShadow: '0 0 0.5px rgba(0, 0, 0, 0.8)'
              }}
            >
              VIOGI
            </Link>
            <button
              onClick={openCart}
              className="hover:opacity-60 transition-opacity"
              aria-label="Abrir carrito"
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
                    Express Checkout
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
                    <span className="bg-white px-3 relative z-10">Or</span>
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                  </div>
                </div>

                {/* Contact */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-xs uppercase tracking-wide font-bold">
                      Contact
                    </h2>
                    <Link
                      href="/account"
                      className="text-[11px] uppercase tracking-wide text-gray-600 hover:text-black transition-colors underline"
                    >
                      Sign in
                    </Link>
                  </div>
                  <input
                    type="email"
                    name="email"
                    placeholder="EMAIL"
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
                      Email me with news and offers
                    </span>
                  </label>
                </div>

                {/* Delivery */}
                <div>
                  <h2 className="text-xs uppercase tracking-wide font-bold mb-3">
                    Delivery
                  </h2>
                  <div className="space-y-2.5">
                    <div>
                      <label className="block text-[10px] uppercase tracking-wide text-gray-500 mb-1">
                        Country/Region
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
                        placeholder="FIRST NAME"
                        required
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2.5 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black placeholder:text-gray-400 placeholder:text-[11px] placeholder:tracking-wide text-sm"
                      />
                      <input
                        type="text"
                        name="lastName"
                        placeholder="LAST NAME"
                        required
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2.5 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black placeholder:text-gray-400 placeholder:text-[11px] placeholder:tracking-wide text-sm"
                      />
                    </div>

                    <input
                      type="text"
                      name="address"
                      placeholder="ADDRESS"
                      required
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2.5 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black placeholder:text-gray-400 placeholder:text-[11px] placeholder:tracking-wide text-sm"
                    />

                    <input
                      type="text"
                      name="apartment"
                      placeholder="APARTMENT, SUITE, ETC. (OPTIONAL)"
                      value={formData.apartment}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2.5 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black placeholder:text-gray-400 placeholder:text-[11px] placeholder:tracking-wide text-sm"
                    />

                    <div className="grid grid-cols-[1fr_auto_1fr] gap-2.5">
                      <input
                        type="text"
                        name="city"
                        placeholder="CITY"
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
                        <option value="">STATE</option>
                        <option value="CDMX">CDMX</option>
                        <option value="Jalisco">Jalisco</option>
                        <option value="Nuevo León">Nuevo León</option>
                        {/* Add more states */}
                      </select>
                      <input
                        type="text"
                        name="zipCode"
                        placeholder="ZIP CODE"
                        required
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2.5 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black placeholder:text-gray-400 placeholder:text-[11px] placeholder:tracking-wide text-sm"
                      />
                    </div>

                    <input
                      type="tel"
                      name="phone"
                      placeholder="PHONE"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2.5 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black placeholder:text-gray-400 placeholder:text-[11px] placeholder:tracking-wide text-sm"
                    />
                  </div>
                </div>

                {/* Shipping Method */}
                <div>
                  <h2 className="text-xs uppercase tracking-wide font-bold mb-3">
                    Shipping Method
                  </h2>
                  {!showShippingMethods ? (
                    <p className="text-xs text-gray-500 italic py-3 border border-gray-300 px-3 bg-gray-50">
                      Enter your shipping address to view available shipping
                      methods.
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
                            Standard Shipping
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
                            Express Shipping (2-3 days)
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
                    Payment
                  </h2>
                  <div className="space-y-2.5">
                    <input
                      type="text"
                      name="cardNumber"
                      placeholder="CARD NUMBER"
                      required={formData.paymentMethod === 'card'}
                      value={formData.cardNumber}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2.5 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black placeholder:text-gray-400 placeholder:text-[11px] placeholder:tracking-wide text-sm"
                    />

                    <div className="grid grid-cols-2 gap-2.5">
                      <input
                        type="text"
                        name="expirationDate"
                        placeholder="EXPIRATION DATE (MM / YY)"
                        required={formData.paymentMethod === 'card'}
                        value={formData.expirationDate}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2.5 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black placeholder:text-gray-400 placeholder:text-[11px] placeholder:tracking-wide text-sm"
                      />
                      <input
                        type="text"
                        name="securityCode"
                        placeholder="SECURITY CODE"
                        required={formData.paymentMethod === 'card'}
                        value={formData.securityCode}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2.5 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black placeholder:text-gray-400 placeholder:text-[11px] placeholder:tracking-wide text-sm"
                      />
                    </div>

                    <input
                      type="text"
                      name="nameOnCard"
                      placeholder="NAME ON CARD"
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
                        Use shipping address as billing address
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
                    Save my information for a faster checkout
                  </h3>
                  <div className="flex items-center">
                    <span className="text-xs text-gray-500 mr-2">+1</span>
                    <input
                      type="tel"
                      name="mobilePhone"
                      placeholder="MOBILE PHONE (OPTIONAL)"
                      value={formData.mobilePhone}
                      onChange={handleInputChange}
                      className="flex-1 px-3 py-2.5 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black placeholder:text-gray-400 placeholder:text-[11px] placeholder:tracking-wide text-sm"
                    />
                  </div>
                  <p className="text-[10px] text-gray-500 mt-2.5">
                    By providing your phone number, you agree to create a Shop
                    account subject to Shop's{' '}
                    <Link href="/pages/legal" className="underline">
                      Terms
                    </Link>{' '}
                    and{' '}
                    <Link href="/pages/legal" className="underline">
                      Privacy Policy
                    </Link>
                    .
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
                      I confirm that I have read and accepted the{' '}
                      <Link
                        href="/pages/legal"
                        className="underline font-medium"
                      >
                        Terms & Conditions
                      </Link>{' '}
                      and{' '}
                      <Link
                        href="/pages/legal"
                        className="underline font-medium"
                      >
                        Privacy Policy
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
                  {isProcessing ? 'Processing...' : 'Complete Order'}
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
                    ORDER SUMMARY
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
                          alt={item.name}
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
                    placeholder="DISCOUNT CODE"
                    className="flex-1 px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black placeholder:text-gray-400 placeholder:text-[11px] placeholder:tracking-wide text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleApplyDiscount}
                    className="px-4 py-2 border border-gray-300 uppercase text-[11px] tracking-wide font-semibold hover:bg-black hover:text-white hover:border-black transition-colors"
                  >
                    Apply
                  </button>
                </div>

                {/* Order Summary */}
                <div className="space-y-2 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="uppercase tracking-wide text-[11px] font-medium text-gray-600">
                      Subtotal
                    </span>
                    <span className="text-xs font-medium">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1">
                      <span className="uppercase tracking-wide text-[11px] font-medium text-gray-600">
                        Shipping
                      </span>
                      <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="text-[10px] text-gray-400 uppercase tracking-wide">
                      {showShippingMethods
                        ? `$${shipping.toFixed(2)}`
                        : 'Enter shipping address'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                    <span className="uppercase tracking-wide text-sm font-bold">Total</span>
                    <div className="text-right flex items-baseline gap-1">
                      <span className="text-[10px] text-gray-500 uppercase tracking-wide">
                        USD
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
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-xs">
            <div>
              <h3 className="uppercase tracking-wider font-medium mb-3">Ayuda</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/pages/customer-support" className="hover:opacity-60">
                    Soporte
                  </Link>
                </li>
                <li>
                  <Link href="/pages/shipping-payments-returns" className="hover:opacity-60">
                    Envíos y Devoluciones
                  </Link>
                </li>
                <li>
                  <Link href="/pages/size-guide" className="hover:opacity-60">
                    Guía de Tallas
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="uppercase tracking-wider font-medium mb-3">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/pages/legal" className="hover:opacity-60">
                    Términos y Condiciones
                  </Link>
                </li>
                <li>
                  <Link href="/pages/accessibility" className="hover:opacity-60">
                    Accesibilidad
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="uppercase tracking-wider font-medium mb-3">Redes</h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="https://www.instagram.com/viogi_"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:opacity-60"
                  >
                    Instagram
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
