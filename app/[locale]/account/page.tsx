"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

export default function AccountPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F5]">
      <Header />
      <main className="flex-1 pt-[64px]">
        <div className="max-w-md mx-auto px-6 md:px-8 py-12 md:py-16">
          <h1 className="text-2xl md:text-3xl font-normal mb-8 tracking-wide uppercase text-center">
            Mi Cuenta
          </h1>

          <div className="bg-white border border-gray-200 p-8">
            <div className="space-y-6">
              <div>
                <label className="block text-xs uppercase tracking-wide mb-2">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="tu@email.com"
                  className="w-full border border-gray-200 p-3 text-sm focus:outline-none focus:border-black transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wide mb-2">
                  Contraseña
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full border border-gray-200 p-3 text-sm focus:outline-none focus:border-black transition-colors"
                />
              </div>

              <button className="w-full bg-black text-white py-3 text-sm uppercase tracking-wide hover:opacity-80 transition-opacity">
                Iniciar Sesión
              </button>

              <div className="text-center">
                <Link
                  href="/account/forgot-password"
                  className="text-xs text-gray-500 hover:text-black transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-200">
              <p className="text-center text-sm text-gray-600 mb-4">
                ¿No tienes cuenta?
              </p>
              <Link
                href="/account/register"
                className="block w-full border border-black py-3 text-sm uppercase tracking-wide text-center hover:bg-black hover:text-white transition-colors"
              >
                Crear Cuenta
              </Link>
            </div>
          </div>

          <div className="mt-8 text-center text-xs text-gray-500">
            <p>Al iniciar sesión, aceptas nuestros</p>
            <p>
              <Link href="/pages/legal" className="underline hover:text-black">
                Términos y Condiciones
              </Link>
              {" "}y{" "}
              <Link href="/pages/legal" className="underline hover:text-black">
                Política de Privacidad
              </Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
