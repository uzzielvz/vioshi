'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // TODO: Implement password reset API call
      console.log('Sending reset email to:', email);
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setEmailSent(true);
    } catch (error) {
      console.error('Password reset error:', error);
      alert('Error al enviar el correo. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <main className="min-h-screen bg-white pt-16">
        <div className="max-w-md mx-auto px-4 py-16">
          <div className="space-y-8 text-center">
            {/* Success Icon */}
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>

            {/* Message */}
            <div className="space-y-2">
              <h1 className="text-2xl font-bold uppercase tracking-wider">
                Correo Enviado
              </h1>
              <p className="text-gray-600 text-sm">
                Hemos enviado un enlace de recuperación a
              </p>
              <p className="font-medium">{email}</p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-left">
              <p className="text-sm text-gray-600">
                Revisa tu bandeja de entrada y sigue las instrucciones para
                restablecer tu contraseña. Si no ves el correo, revisa tu
                carpeta de spam.
              </p>
            </div>

            <div className="pt-4">
              <Link
                href="/account"
                className="inline-block w-full bg-black text-white py-4 rounded uppercase tracking-wider font-medium hover:bg-gray-800 transition-colors text-center"
              >
                Volver a Inicio de Sesión
              </Link>
            </div>

            <button
              onClick={() => setEmailSent(false)}
              className="text-sm text-gray-600 hover:text-black transition-colors underline"
            >
              ¿No recibiste el correo? Enviar de nuevo
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white pt-16">
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold uppercase tracking-wider">
              Recuperar Contraseña
            </h1>
            <p className="text-gray-600 text-sm">
              Ingresa tu correo electrónico y te enviaremos instrucciones para
              restablecer tu contraseña
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <input
                type="email"
                name="email"
                placeholder="EMAIL"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black placeholder:text-gray-400 placeholder:text-xs placeholder:tracking-wider"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-black text-white py-4 rounded uppercase tracking-wider font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Enviando...' : 'Enviar Enlace de Recuperación'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 uppercase tracking-wider">
                O
              </span>
            </div>
          </div>

          {/* Links */}
          <div className="space-y-3 text-center text-sm">
            <p className="text-gray-600">
              ¿Recordaste tu contraseña?{' '}
              <Link
                href="/account"
                className="underline font-medium text-black hover:opacity-60 transition-opacity"
              >
                Inicia Sesión
              </Link>
            </p>
            <p className="text-gray-600">
              ¿No tienes cuenta?{' '}
              <Link
                href="/account/register"
                className="underline font-medium text-black hover:opacity-60 transition-opacity"
              >
                Crear Cuenta
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
