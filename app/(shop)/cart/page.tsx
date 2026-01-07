"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCart } from "@/store/cartStore";
import { Button } from "@/components/common/Button";
import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const { cart, itemCount, removeItem, updateQuantity } = useCart();

  if (itemCount === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F5F5F5]">
        <Header />
        <main className="flex-1">
          <div className="px-6 md:px-8 py-8 md:py-12">
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
              <h1 className="text-2xl md:text-3xl font-normal mb-4 tracking-wide uppercase">
                Your cart is empty
              </h1>
              <p className="text-sm text-gray-600 mb-8">Add some products to get started</p>
              <Link href="/collections/all">
                <Button variant="primary">Continue Shopping</Button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F5]">
      <Header />
      <main className="flex-1">
        <div className="px-6 md:px-8 py-8 md:py-12">
          <h1 className="text-2xl md:text-3xl font-normal mb-8 md:mb-12 tracking-wide uppercase">
            Shopping Cart
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="border border-black">
                {cart.items.map((item, index) => (
                  <div
                    key={item.id}
                    className={`p-6 flex gap-4 ${
                      index !== cart.items.length - 1 ? "border-b border-black" : ""
                    }`}
                  >
                    <div className="relative w-24 h-24 bg-gray-100 flex-shrink-0">
                      <Image
                        src={item.image}
                        alt={item.productName}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="flex-1">
                      <Link href={`/products/${item.slug || item.productId}`}>
                        <h3 className="text-sm font-normal uppercase tracking-wide mb-2 hover:opacity-70">
                          {item.productName}
                        </h3>
                      </Link>
                      {(item.color || item.size) && (
                        <p className="text-xs text-gray-600 mb-2">
                          {item.color && <span>Color: {item.color}</span>}
                          {item.color && item.size && <span> / </span>}
                          {item.size && <span>Size: {item.size}</span>}
                        </p>
                      )}
                      <p className="text-sm font-normal">{formatPrice(item.price)}</p>

                      <div className="flex items-center gap-4 mt-4">
                        <div className="flex items-center border border-black">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="px-3 py-1 hover:bg-gray-100"
                          >
                            -
                          </button>
                          <span className="px-4 py-1 border-x border-black">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="px-3 py-1 hover:bg-gray-100"
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-xs uppercase tracking-wide hover:opacity-70"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <Link href="/collections/all">
                  <Button variant="secondary" fullWidth>
                    Continue Shopping
                  </Button>
                </Link>
              </div>
            </div>

            {/* Cart Summary */}
            <div className="lg:col-span-1">
              <div className="border border-black p-6">
                <h2 className="text-lg font-normal uppercase tracking-wide mb-6">
                  Order Summary
                </h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>{formatPrice(cart.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span>{formatPrice(cart.shipping)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax</span>
                    <span>{formatPrice(cart.tax)}</span>
                  </div>
                  <div className="border-t border-black pt-4">
                    <div className="flex justify-between font-normal">
                      <span className="uppercase tracking-wide">Total</span>
                      <span>{formatPrice(cart.total)}</span>
                    </div>
                  </div>
                </div>

                <Button variant="primary" fullWidth>
                  Proceed to Checkout
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

