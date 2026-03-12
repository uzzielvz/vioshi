"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCart } from "@/store/cartStore";
import { useLocaleContext } from "@/hooks/useLocaleContext";
import { useTranslations } from "next-intl";
import { formatPrice } from "@/lib/formatters";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const { cart, itemCount, removeItem, updateQuantity } = useCart();
  const { locale } = useLocaleContext();
  const t = useTranslations("cart");
  const tCommon = useTranslations("common");
  const router = useRouter();

  const fontStyle = {
    fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
  };

  if (itemCount === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <main className="flex-1 pt-14">
          <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
            <h1
              className="uppercase tracking-wide mb-4"
              style={{ ...fontStyle, fontSize: '11px', fontWeight: 500 }}
            >
              {t("empty")}
            </h1>
            <p
              className="text-gray-500 mb-8"
              style={{ ...fontStyle, fontSize: '12px' }}
            >
              {t("empty_subtitle")}
            </p>
            <Link
              href={`/${locale}/collections/all`}
              className="bg-black text-white px-8 py-3 uppercase tracking-wide hover:bg-gray-800 transition-colors"
              style={{ ...fontStyle, fontSize: '11px', fontWeight: 500 }}
            >
              {t("continue_shopping")}
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1 pt-14">
        <div className="px-4 md:px-8 py-8 md:py-12">
          <h1
            className="uppercase tracking-wide mb-8"
            style={{ ...fontStyle, fontSize: '11px', fontWeight: 500 }}
          >
            {t("title")} ({itemCount})
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-16">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="border-t border-gray-200">
                {cart.items.map((item) => (
                  <div
                    key={item.id}
                    className="py-6 flex gap-4 border-b border-gray-200"
                  >
                    <Link href={`/${locale}/products/${item.slug || item.productId}`} className="flex-shrink-0">
                      <div className="relative w-24 h-32 bg-[#F5F5F5]">
                        <Image
                          src={item.image}
                          alt={item.productName}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </Link>

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <Link href={`/${locale}/products/${item.slug || item.productId}`}>
                          <h3
                            className="uppercase tracking-wide hover:opacity-60 transition-opacity"
                            style={{ ...fontStyle, fontSize: '11px', fontWeight: 500 }}
                          >
                            {item.productName}
                          </h3>
                        </Link>
                        {(item.color || item.size) && (
                          <p
                            className="text-gray-500 mt-1"
                            style={{ ...fontStyle, fontSize: '11px' }}
                          >
                            {item.size && <span>{t("size")}: {item.size}</span>}
                            {item.color && item.size && <span> / </span>}
                            {item.color && <span>{t("color")}: {item.color}</span>}
                          </p>
                        )}
                        <p
                          className="mt-2"
                          style={{ ...fontStyle, fontSize: '11px' }}
                        >
                          {formatPrice(item.price, locale)}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center border border-gray-200">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors"
                            style={{ ...fontStyle, fontSize: '12px' }}
                          >
                            −
                          </button>
                          <span
                            className="w-10 h-8 flex items-center justify-center border-x border-gray-200"
                            style={{ ...fontStyle, fontSize: '11px' }}
                          >
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors"
                            style={{ ...fontStyle, fontSize: '12px' }}
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() => removeItem(item.id)}
                          className="uppercase tracking-wide hover:opacity-60 transition-opacity"
                          style={{ ...fontStyle, fontSize: '10px', fontWeight: 500 }}
                        >
                          {tCommon("remove")}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Link
                href={`/${locale}/collections/all`}
                className="inline-block mt-6 uppercase tracking-wide hover:opacity-60 transition-opacity"
                style={{ ...fontStyle, fontSize: '11px', fontWeight: 500 }}
              >
                ← {t("continue_shopping")}
              </Link>
            </div>

            {/* Cart Summary */}
            <div className="lg:col-span-1">
              <div className="bg-[#F5F5F5] p-6">
                <h2
                  className="uppercase tracking-wide mb-6"
                  style={{ ...fontStyle, fontSize: '11px', fontWeight: 500 }}
                >
                  {t("summary")}
                </h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between" style={{ ...fontStyle, fontSize: '11px' }}>
                    <span>{t("subtotal")}</span>
                    <span>{formatPrice(cart.subtotal, locale)}</span>
                  </div>
                  <div className="flex justify-between text-gray-500" style={{ ...fontStyle, fontSize: '11px' }}>
                    <span>{t("shipping")}</span>
                    <span>{cart.shipping === 0 ? t("free") : formatPrice(cart.shipping, locale)}</span>
                  </div>
                  <div className="flex justify-between text-gray-500" style={{ ...fontStyle, fontSize: '11px' }}>
                    <span>{t("tax")}</span>
                    <span>{formatPrice(cart.tax, locale)}</span>
                  </div>
                </div>

                <div className="border-t border-gray-300 pt-4 mb-6">
                  <div className="flex justify-between" style={{ ...fontStyle, fontSize: '12px', fontWeight: 500 }}>
                    <span className="uppercase tracking-wide">{t("total")}</span>
                    <span>{formatPrice(cart.total, locale)}</span>
                  </div>
                </div>

                <button
                  onClick={() => router.push(`/${locale}/checkout`)}
                  className="w-full bg-black text-white py-4 uppercase tracking-wide hover:bg-gray-800 transition-colors"
                  style={{ ...fontStyle, fontSize: '11px', fontWeight: 500 }}
                >
                  {t("checkout")}
                </button>

                <p
                  className="text-center text-gray-500 mt-4"
                  style={{ ...fontStyle, fontSize: '10px' }}
                >
                  {t("free_shipping_note")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
